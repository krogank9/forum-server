const knex = require('knex')
const app = require('../src/app')
const { makeBoardsArray, makeUsersArray, makeThreadsArray, makePostsArray, makeMaliciousPost } = require('./forum.fixtures')

describe('Users Endpoints', function () {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db.raw('TRUNCATE users RESTART IDENTITY CASCADE'))

  afterEach('cleanup', () => db.raw('TRUNCATE users RESTART IDENTITY CASCADE'))

  describe(`GET /api/users by resource`, () => {

    context('Given there are users in the database', () => {
      const testUsers = makeUsersArray();

      beforeEach('insert users', () => {
        return db
          .into('users')
          .insert(testUsers)
      })

      it('/api/users responds with 404 on non existent user username/password', () => {
        return supertest(app)
          .get('/api/users/999')
          .expect(404)
      })

      it('/api/users/1 responds correct user data', () => {
        return supertest(app)
          .get('/api/users/1')
          .expect(200)
          .expect(res => {
            expect(res.body.id).to.eql(1)
            expect(res.body.user_name).to.eql("logan")
            expect(res.body.date_created).to.be.a('string')
          })
      })
    })
  })

  describe(`POST /api/login & /api/refresh`, () => {

    context('Given there are users in the database', () => {

      it('/api/users create responds with 400 on missing field', () => {
        return supertest(app)
          .post('/api/users')
          .send({ password: "abc123", profile_picture: 1 })
          .expect(400)
          .expect(res => {
            expect(res.body.error).to.eql("Missing 'user_name' in request body")
          })
      })

      it('/api/users create responds with 400 on weak password', () => {
        return supertest(app)
          .post('/api/users')
          .send({ user_name: "new_user", password: "abc123", profile_picture: 1 })
          .expect(400)
      })

      it('/api/users create responds with correct user info on success', () => {
        return supertest(app)
          .post('/api/users')
          .send({ user_name: "new_user", password: "Password1234!", profile_picture: 1 })
          .expect(201)
          .expect(res => {
            expect(res.body.id).to.eql(1)
            expect(res.body.user_name).to.eql("new_user")
            expect(res.body.date_created).to.be.a('string')
          })
      })
    })
  })
})