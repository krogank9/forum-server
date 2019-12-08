const knex = require('knex')
const app = require('../src/app')
const { makeBoardsArray, makeUsersArray, makeThreadsArray, makePostsArray, makeMaliciousPost } = require('./forum.fixtures')

describe('Threads Endpoints', function () {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db.raw('TRUNCATE users, boards, threads RESTART IDENTITY CASCADE'))

  afterEach('cleanup', () => db.raw('TRUNCATE users, boards, threads RESTART IDENTITY CASCADE'))

  describe(`GET /api/threads`, () => {

    context('Given there is data in the database', () => {
      const testBoards = makeBoardsArray();

      const testThreads = makeThreadsArray();
      const expectedThreads = makeThreadsArray(true);

      const testPosts = makePostsArray();
      const testUsers = makeUsersArray();

      beforeEach('insert dummy forum data', () => {
        return db
          .into('users')
          .insert(testUsers)
          .then(() => {
            return db
              .into('boards')
              .insert(testBoards)
              .then(() => {
                return db
                  .into('threads')
                  .insert(testThreads)
                  .then(() => {
                    return db
                      .into('posts')
                      .insert(testPosts)
                  })
              })
          })
      })

      it('/api/threads responds with correct list of threads', () => {
        return supertest(app)
          .get('/api/threads')
          .expect(200)
          .expect(res => {
            expect(res.body).to.eql(expectedThreads)
          })
      })

      it('/api/threads?board_id=1 responds with correct list of threads for board 1', () => {
        return supertest(app)
          .get('/api/threads?board_id=1')
          .expect(200)
          .expect(res => {
            expect(res.body).to.eql(expectedThreads.filter(t => t.board_id === 1))
          })
      })

      it('/api/threads/1 responds with correct thread resource', () => {
        return supertest(app)
          .get('/api/threads/1')
          .expect(200)
          .expect(res => {
            expect(res.body).to.eql(expectedThreads[0])
          })
      })

      it('/api/threads/999 responds with 404 on non existent thread resource', () => {
        return supertest(app)
          .get('/api/threads/999')
          .expect(404)
      })
    })
  })

  describe(`POST /api/threads`, () => {
    const testBoards = makeBoardsArray();
    const testUsers = makeUsersArray();

    beforeEach('insert dummy forum data', () => {
      return db
        .into('users')
        .insert(testUsers)
        .then(() => {
          return db
            .into('boards')
            .insert(testBoards)
        })
    })

    it('/api/threads create responds with 400 on missing content', () => {

      return supertest(app)
        .post('/api/auth/login')
        .send({ user_name: "logan", password: "Password1234!" })
        .expect(200)
        .expect(res => {
          expect(res.body.authToken).to.be.a('string')
          expect(res.body.userName).to.eql("logan")
          expect(res.body.userId).to.eql(1)
          let userId = res.body.userId
          let authToken = res.body.authToken

          // now logged in, create thread
          return supertest(app)
            .post('/api/threads')
            .set('Authorization', 'Bearer ' + authToken)
            .send({ name: "no board id or first post" })
            .expect(400)
            .expect(res => {
              expect(res.body.error).to.eql("Missing 'board_id' in request body")
            })
        })
    })

    it('/api/threads create responds with correct thread on success', () => {
      // login first
      return supertest(app)
        .post('/api/auth/login')
        .send({ user_name: "logan", password: "Password1234!" })
        .expect(200)
        .expect(res => {
          expect(res.body.authToken).to.be.a('string')
          expect(res.body.userName).to.eql("logan")
          expect(res.body.userId).to.eql(1)
          let userId = res.body.userId
          let authToken = res.body.authToken

          // now logged in, create thread
          return supertest(app)
            .post('/api/threads')
            .set('Authorization', 'Bearer ' + authToken)
            .send({ name: "new thread", board_id: 1, first_post_content: "original post" })
            .expect(201)
            .expect(res => {
              expect(res.body.author_id).to.eql(userId)
              expect(res.body.reply_count).to.eql(0)
              expect(res.body.board_id).to.eql(1)
            })
        })
    })
  })
})