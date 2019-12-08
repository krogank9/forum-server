const path = require('path')
const express = require('express')
const xss = require('xss')
const ThreadsService = require('./threads-service')
const BoardsService = require('../boards/boards-service')
const UsersRouter = require('../users/users-router')
const { requireAuth } = require('../middleware/jwt-auth')

const threadsRouter = express.Router()
const jsonParser = express.json()

const serializeThread = thread => ({
    id: thread.id,
    name: xss(thread.name, { whiteList: [] }),
    author_id: thread.author_id,
    date_created: thread.date_created,
    board_id: thread.board_id,
    reply_count: thread.reply_count,
    author_name: xss(thread.author_name, { whiteList: [] }),
    board_name: thread.board_name,
})

threadsRouter.route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        ThreadsService.getAllThreads(knexInstance, req.query.board_id)
            .then(threads => {
                res.json(threads.map(serializeThread))
            })
            .catch(next)
    })
    .post(requireAuth, jsonParser, (req, res, next) => {
        const { name, board_id, first_post_content } = req.body
        const newThread = { "name": name, "board_id": board_id, "author_id": req.user.id }

        for (const [key, value] of Object.entries({ ...newThread, first_post_content: first_post_content })) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        const threadNameError = ThreadsService.validateThreadName(newThread.name)

        if (threadNameError)
            return res.status(400).json({ error: threadNameError })

        if (first_post_content.trim().length == 0)
            return res.status(400).json({ error: "First post content missing" })

        BoardsService.getById(
            req.app.get('db'),
            req.body.board_id
        )
            .then(board => {
                if (!board) {
                    return res.status(404).json({ error: `Board doesn't exist` })
                }

                ThreadsService.insertThread(
                    req.app.get('db'),
                    newThread,
                    first_post_content
                )
                    .then(thread => {
                        res
                            .location(path.posix.join(req.originalUrl, `/${thread.id}`))
                            .status(201)
                            .json(serializeThread(thread))
                    })
                    .catch(next)
            })
            .catch(next)
    })

threadsRouter.route('/:thread_id')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        ThreadsService.getById(knexInstance, req.params.thread_id)
            .then(thread => {
                if (!thread) {
                    return res.status(404).json({
                        error: { message: `Thread doesn't exist` }
                    })
                }
                res.json(serializeThread(thread))
            })
            .catch(next)
    })
    //For all but get require auth:
    .all(requireAuth, (req, res, next) => {
        ThreadsService.getById(
            req.app.get('db'),
            req.params.thread_id
        )
            .then(thread => {
                if (!thread) {
                    return res.status(404).json({
                        error: { message: `Thread doesn't exist` }
                    })
                }
                else if (thread.author_id !== req.user.id) {
                    return res.status(401).json({
                        error: { message: 'Unauthorized request' }
                    })
                }
                res.thread = thread // save the thread for the next middleware
                next() // don't forget to call next so the next middleware happens!
            })
            .catch(next)
    })
    .delete((req, res, next) => {
        ThreadsService.deleteThread(
            req.app.get('db'),
            req.params.thread_id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const { name, board_id } = req.body
        const threadToUpdate = { name, board_id }

        const numberOfValues = Object.values(threadToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain 'name' or 'board_id'`
                }
            })
        }

        ThreadsService.updateThread(
            req.app.get('db'),
            req.params.thread_id,
            threadToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = threadsRouter