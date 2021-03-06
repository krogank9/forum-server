const ThreadsService = require('../threads/threads-service');

const BoardsService = {
    // Info from ThreadsService is pulled in to return relevant information when querying a board
    addInfoToBoards(knex, boards) {
        if(!boards)
            return boards

        let b = Array.isArray(boards) ? boards : [boards]

        // return the current number of threads in each board too
        b = b.map(curBoard => {
            return ThreadsService.countThreadsInBoard(knex, curBoard.id).then(count => {
                return { ...curBoard, threadCount: count }
            })
        })

        return Array.isArray(boards) ? Promise.all(b) : b[0]
    },
    getAllBoards(knex) {
        return knex.select('*').from('boards').then(boards => this.addInfoToBoards(knex, boards))
    },
    insertBoard(knex, newBoard) {
        return knex
            .insert(newBoard)
            .into('boards')
            .returning('*')
            .then(rows => {
                return this.addInfoToBoards(knex, rows[0])
            })
    },
    getById(knex, id) {
        id = parseInt(id) || 0
        return knex.from('boards').select('*').where('id', id).first().then(board => this.addInfoToBoards(knex, board))
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