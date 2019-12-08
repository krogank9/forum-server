const express = require('express')
const path = require('path')
const UsersService = require('./users-service')
const xss = require('xss')

const usersRouter = express.Router()
const jsonParser = express.json()

const serializeUser = user => ({
  id: user.id,
  date_created: user.date_created,
  user_name: xss(user.user_name, {whiteList: []}),
  profilePic: user.profilePic,
  admin: user.admin,
})

usersRouter
  .post('/', jsonParser, (req, res, next) => {
    const { password, user_name, profile_picture } = req.body

    for (const field of ['user_name', 'password', 'profile_picture'])
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body`
        })

        
    const usernameError = UsersService.validateUsername(user_name)

    if (usernameError)
      return res.status(400).json({ error: usernameError })

    const passwordError = UsersService.validatePassword(password)

    if (passwordError)
      return res.status(400).json({ error: passwordError })

    UsersService.hasUserWithUserName(
      req.app.get('db'),
      user_name
    )
      .then(hasUserWithUserName => {
        if (hasUserWithUserName)
          return res.status(400).json({ error: `Username already taken` })

        return UsersService.hashPassword(password)
          .then(hashedPassword => {
            const newUser = {
              user_name,
              password: hashedPassword,
              date_created: 'now()',
              profile_picture
            }

            return UsersService.insertUser(
              req.app.get('db'),
              newUser
            )
              .then(user => {
                res
                  .status(201)
                  .location(path.posix.join(req.originalUrl, `/${user.id}`))
                  .json(UsersService.serializeUser(user))
              })
          })
      })
      .catch(next)
  })

usersRouter.route('/:user_id')
  .all((req, res, next) => {
      UsersService.getById(
          req.app.get('db'),
          req.params.user_id
      )
          .then(user => {
              if (!user) {
                  return res.status(404).json({
                      error: { message: `User doesn't exist` }
                  })
              }

              res.user = user // save the user for the next middleware
              next()
          })
          .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeUser(res.user))
  })

module.exports = usersRouter
