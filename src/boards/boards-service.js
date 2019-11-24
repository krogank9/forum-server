const ThreadsService = require('../threads/threads-service');

const BoardsService = {
    getAllBoards(knex) {
        return knex.select('*').from('boards').then(boards => {
            console.log(boards)

            // return the number of threads in each board too
            let promises = boards.map(curBoard => {
                return ThreadsService.countThreadsInBoard(knex, curBoard.id).then(count => {
                    console.log({...curBoard, threadCount: count});
                    return {...curBoard, threadCount: count}
                })
            })

            return Promise.all(promises)
        })
    },
    insertBoard(knex, newBoard) {
        return knex
            .insert(newBoard)
            .into('boards')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id) {
        return knex.from('boards').select('*').where('id', id).first()
    },
    getByName(knex, name) {
        return knex.from('boards').select('*').where('name', name).first()
    },
    deleteBoard(knex, id) {
        return knex('boards')
            .where({ id })
            .delete()
    },
    updateBoard(knex, id, newBoardFields) {
        return knex('boards')
            .where({ id })
            .update(newBoardFields)
    },
}

module.exports = BoardsService