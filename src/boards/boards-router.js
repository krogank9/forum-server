const path = require('path')
const express = require('express')
const xss = require('xss')
const BoardsService = require('./boards-service')
const { requireAuth } = require('../middleware/jwt-auth')

const boardsRouter = express.Router()
const jsonParser = express.json()

const serializeBoard = board => ({
    id: board.id,
    name: xss(board.name, {whiteList: []}),
    threadCount: board.threadCount
})

boardsRouter.route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        BoardsService.getAllBoards(knexInstance)
            .then(boards => {
                res.json(boards.map(serializeBoard))
            })
            .catch(next)
    })

boardsRouter.route('/:board_id')
    .all((req, res, next) => {
        BoardsService.getById(
            req.app.get('db'),
            req.params.board_id
        )
            .then(board => {
                if (!board) {
                    return res.status(404).json({
                        error: { message: `Board doesn't exist` }
                    })
                }
                res.board = board // save the board for the next middleware
                next() // don't forget to call next so the next middleware happens!
            })
            .catch(next)
    })
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        res.json(serializeBoard(res.board))
    })

module.exports = boardsRouter