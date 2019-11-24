require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV, CLIENT_ORIGIN } = require('./config')


const boardsRouter = require('./boards/boards-router')
const threadsRouter = require('./threads/threads-router')
const postsRouter = require('./posts/posts-router')
const usersRouter = require('./users/users-router')
const authRouter = require('./auth/auth-router')

const app = express()

app.use(
    cors(/*{
        origin: CLIENT_ORIGIN
    }*/)
);

app.use(morgan((NODE_ENV === 'production') ? 'tiny' : 'common'))
app.use(helmet())

app.use('/api/boards', boardsRouter)
app.use('/api/threads', threadsRouter)
app.use('/api/posts', postsRouter)
app.use('/api/users', usersRouter)
app.use('/api/auth', authRouter)

app.get('/', (req, res) => {
	res.send('Hello, world!')
})

app.use(function errorHandler(error, req, res, next) {
	let response
	if (NODE_ENV === 'production') {
		response = { error: 'Server error' }
	} else {
		console.error(error)
		response = { message: error.message, error }
	}
	res.status(500).json(response)
})

module.exports = app