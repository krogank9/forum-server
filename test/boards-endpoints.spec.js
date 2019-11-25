const knex = require('knex')
const app = require('../src/app')
const { makeBoardsArray, makeUsersArray, makeThreadsArray, makePostsArray, makeMaliciousPost } = require('./forum.fixtures')

describe('Boards Endpoints', function () {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db.raw('TRUNCATE boards RESTART IDENTITY CASCADE'))

  afterEach('cleanup', () => db.raw('TRUNCATE boards RESTART IDENTITY CASCADE'))

  describe(`GET /api/boards`, () => {

    context('Given there are boards in the database', () => {
      const testBoards = makeBoardsArray();

      beforeEach('insert users', () => {
        return db
          .into('boards')
          .insert(testBoards)
      })

      it('/api/boards responds with correct list of boards', () => {
        return supertest(app)
          .get('/api/boards')
          .expect(200)
          .expect(res => {
            expect(res.body).to.eql(makeBoardsArray(true))
          })
      })

      it('/api/boards/1 responds with correct board resource', () => {
        return supertest(app)
          .get('/api/boards/1')
          .expect(200)
          .expect(res => {
            expect(res.body).to.eql(makeBoardsArray(true)[0])
          })
      })

      it('/api/boards/999 responds with 404 on non existent board resource', () => {
        return supertest(app)
          .get('/api/boards/999')
          .expect(404)
      })
    })
  })
})