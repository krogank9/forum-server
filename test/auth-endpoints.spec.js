const knex = require('knex')
const app = require('../src/app')
const { makeBoardsArray, makeUsersArray, makeThreadsArray, makePostsArray, makeMaliciousPost } = require('./forum.fixtures')

describe('Auth Endpoints', function () {
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

  describe(`POST /api/login & /api/refresh`, () => {

    context('Given there are users in the database', () => {
      const testUsers = makeUsersArray();

      beforeEach('insert users', () => {
        return db
          .into('users')
          .insert(testUsers)
      })

      it('/api/login responds with 400 on incorrect username/password', () => {
        return supertest(app)
          .post('/api/auth/login')
          .send({ user_name: "logan", password: "wrong" })
          .expect(400)
      })

      it('/api/login responds with JWT on success', () => {
        return supertest(app)
          .post('/api/auth/login')
          .send({ user_name: "logan", password: "Password1234!" })
          .expect(200)
          .expect(res => {
            expect(res.body.authToken).to.be.a('string')
            expect(res.body.userName).to.eql("logan")
            expect(res.body.userId).to.eql(1)
          })
      })

      it('/api/refresh responds with new JWT & user info on success', () => {
        return supertest(app)
          .post('/api/auth/login')
          .send({ user_name: "logan", password: "Password1234!" })
          .expect(200)
          .expect(res => {
            expect(res.body.authToken).to.be.a('string')
            expect(res.body.userName).to.eql("logan")
            expect(res.body.userId).to.eql(1)

            supertest(app)
              .post('/api/auth/login')
              .send({ authToken: res.authToken })
              .expect(200)
              .expect(res => {
                expect(res.body.authToken).to.be.a('string')
                expect(res.body.userName).to.eql("logan")
                expect(res.body.userId).to.eql(1)
              })
          })
      })
    })
  })
})