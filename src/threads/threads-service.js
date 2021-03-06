const PostsService = require('../posts/posts-service');
const UsersService = require('../users/users-service');

const ThreadsService = {
    // Info from PostsService & UsersService pulled in to return relevant information when querying a thread
    addInfoToThreads(knex, threads) {
        if (!threads)
            return threads

        let t = Array.isArray(threads) ? threads : [threads]

        t = t.map(thread => {
            return UsersService.getById(knex, thread.author_id)
                .then(user => {
                    return { ...thread, author_name: user.user_name, author_picture: user.profile_picture };
                })
                .then(thread => {
                    return PostsService.countPostsInThread(knex, thread.id).then(count => {
                        const newThread = { ...thread, reply_count: count - 1 }
                        // Also needed to query Boards, but BoardsService already requires/depends on this file.
                        // Pulled getById database query from BoardsService to return the board name for a thread too
                        return knex.from('boards').select('*').where('id', newThread.board_id).first().then(board => {
                            return {...newThread, board_name: board.name}
                        })
                    })
                })
        })

        return Array.isArray(threads) ? Promise.all(t) : t[0]
    },
    getAllThreads(knex, boardId) {
        if (boardId)
            return this.getAllThreadsInBoard(knex, boardId)
        else
            return knex.select('*').from('threads').then(threads => this.addInfoToThreads(knex, threads))
    },
    getAllThreadsInBoard(knex, boardId) {
        return knex.from('threads').select('*').where('board_id', boardId).then(threads => this.addInfoToThreads(knex, threads))
    },
    countThreadsInBoard(knex, boardId) {
        return knex('threads').count('id').where('board_id', boardId).first().then(c => parseInt(c.count))
    },
    insertThread(knex, newThread, firstPostContent) {

        return knex
            .insert(newThread)
            .into('threads')
            .returning('*')
            .then(rows => {
                // after inserting thread, also insert its first post and return the thread
                let thread = rows[0];
                return PostsService.insertPost(knex, { content: firstPostContent, author_id: thread.author_id, thread_id: thread.id })
                    .then(() => this.addInfoToThreads(knex, thread))
                //return rows[0]
            })
    },
    validateThreadName(threadName) {
        const lettersNumbersDash = /^([a-zA-Z0-9 -]+)$/;
        const doubleDashes = /(?!.*--.*)/;
        const startsWithDash = /^-.*/;
        const endsWithDash = /.*-$/;
        if (!lettersNumbersDash.test(threadName)) {
            return 'Thread name may only contain letters, numbers, and dashes.'
        }
        else if (startsWithDash.test(threadName) || endsWithDash.test(threadName)) {
            return 'Thread name may not start or end with a dash'
        }
        else if (threadName.indexOf("--") !== -1) {
            return 'Thread name contains too many dashes!'
        }
        return null
    },
    getById(knex, id) {
        id = parseInt(id) || 0
        return knex.from('threads').select('*').where('id', id).first().then(threads => this.addInfoToThreads(knex, threads))
    },
    deleteThread(knex, id) {
        return knex('threads')
            .where({ id })
            .delete()
    },
    updateThread(knex, id, newThreadFields) {
        return knex('threads')
            .where({ id })
            .update(newThreadFields)
    },
}

module.exports = ThreadsService