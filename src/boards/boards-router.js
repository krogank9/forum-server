const path = require('path')
const express = require('express')
const xss = require('xss')
const BoardsService = require('./boards-service')
const { requireAuth } = require('../middleware/jwt-auth')

const boardsRouter = express.Router()
const jsonParser = express.json()

const serializeBoard = board => ({
    id: board.id,
    name: xss(board.name),
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
/*
    .post(jsonParser, (req, res, next) => {
        const { name } = req.body
        const newBoard = { "name": name }

        for (const [key, value] of Object.entries(newBoard)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        BoardsService.insertBoard(
            req.app.get('db'),
            newBoard
        )
            .then(board => {
                res
                    .location(path.posix.join(req.originalUrl, `/${board.id}`))
                    .status(201)
                    .json(serializeBoard(board))
            })
            .catch(next)
    })
*/

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
/*
    .delete((req, res, next) => {
        BoardsService.deleteBoard(
            req.app.get('db'),
            req.params.board_id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const { name } = req.body
        const boardToUpdate = { name }

        const numberOfValues = Object.values(boardToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain 'name'`
                }
            })
        }

        BoardsService.updateBoard(
            req.app.get('db'),
            req.params.board_id,
            boardToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })
*/

module.exports = boardsRouter