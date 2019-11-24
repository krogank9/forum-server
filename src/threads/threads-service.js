const PostsService = require('../posts/posts-service');

const ThreadsService = {
    getAllThreads(knex, boardId) {
        if(boardId)
            return this.getAllThreadsInBoard(knex, boardId)
        else
            return knex.select('*').from('threads')
    },
    getAllThreadsInBoard(knex, boardId) {
        return knex.from('threads').select('*').where('board_id', boardId)
    },
    countThreadsInBoard(knex, boardId) {
        return knex('threads').count('id').where('board_id', boardId).first().then(c => parseInt(c.count))
    },
    insertThread(knex, newThread) {
        let firstPostContent = newThread.first_post_content
        
        return knex
            .insert(newThread)
            .into('threads')
            .returning('*')
            .then(rows => {
                // after inserting thread, also insert its first post and return the thread
                let thread = rows[0];
                return PostsService.insertPost(knex, {content: firstPostContent, author_id: thread.author_id, thread_id: thread.id})
                    .then(() => thread)
                //return rows[0]
            })
    },
    getById(knex, id) {
        return knex.from('threads').select('*').where('id', id).first()
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