const path = require('path')
const express = require('express')
const xss = require('xss')
const PostsService = require('./posts-service')
const { requireAuth } = require('../middleware/jwt-auth')

const postsRouter = express.Router()
const jsonParser = express.json()

const serializePost = post => ({
    id: post.id,
    date_created: post.date_created,
    author_id: post.author_id,
    thread_id: post.thread_id,
    content: xss(post.content),
    author_name: post.author_name
})

postsRouter.route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        PostsService.getAllPosts(knexInstance, req.query.thread_id)
            .then(posts => {
                console.log(posts)
                res.json(posts.map(serializePost))
            })
            .catch(next)
    })
    .post(requireAuth, jsonParser, (req, res, next) => {
        const { content, thread_id } = req.body
        const newPost = { "content": content, "thread_id": thread_id, "author_id": req.user.id }

        for (const [key, value] of Object.entries(newPost)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        PostsService.insertPost(
            req.app.get('db'),
            newPost
        )
            .then(post => {
                res
                    .location(path.posix.join(req.originalUrl, `/${post.id}`))
                    .status(201)
                    .json(serializePost(post))
            })
            .catch(next)
    })

postsRouter.route('/:post_id')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        PostsService.getById(knexInstance, req.params.post_id)
            .then(post => {
                if (!post) {
                    return res.status(404).json({
                        error: { message: `Post doesn't exist` }
                    })
                }
                res.json(serializePost(post))
            })
            .catch(next)
    })
    .all(requireAuth, (req, res, next) => {
        PostsService.getById(
            req.app.get('db'),
            req.params.post_id
        )
            .then(post => {
                if (!post) {
                    return res.status(404).json({
                        error: { message: `Post doesn't exist` }
                    })
                }
                else if (post.author_id !== req.user.id) {
                    return res.status(401).json({
                        error: { message: 'Unauthorized request' }
                    })
                }

                res.post = post // save the post for the next middleware
                next()
            })
            .catch(next)
    })
    .delete((req, res, next) => {
        PostsService.deletePost(
            req.app.get('db'),
            req.params.post_id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const { content } = req.body
        const postToUpdate = { content }

        const numberOfValues = Object.values(postToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain 'content'`
                }
            })
        }

        PostsService.updatePost(
            req.app.get('db'),
            req.params.post_id,
            postToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = postsRouter