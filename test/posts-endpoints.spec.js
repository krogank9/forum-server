const knex = require('knex')
const app = require('../src/app')
const { makeBoardsArray, makeUsersArray, makeThreadsArray, makePostsArray, makeMaliciousPost } = require('./forum.fixtures')

describe('Posts Endpoints', function () {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db.raw('TRUNCATE users, boards, threads, posts RESTART IDENTITY CASCADE'))

  afterEach('cleanup', () => db.raw('TRUNCATE users, boards, threads, posts RESTART IDENTITY CASCADE'))

  describe(`GET /api/posts`, () => {

    context('Given there is data in the database', () => {
      const testBoards = makeBoardsArray();
      const testThreads = makeThreadsArray();

      const testPosts = makePostsArray();
      const expectedPosts = makePostsArray(true);

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

      it('/api/posts responds with correct list of posts', () => {
        return supertest(app)
          .get('/api/posts')
          .expect(200)
          .expect(res => {
            expect(res.body).to.eql(expectedPosts)
          })
      })

      it('/api/posts?thread_id=1 responds with correct list of posts for thread 1', () => {
        return supertest(app)
          .get('/api/posts?thread_id=1')
          .expect(200)
          .expect(res => {
            expect(res.body).to.eql(expectedPosts.filter(t => t.thread_id === 1))
          })
      })

      it('/api/posts/1 responds with correct post resource', () => {
        return supertest(app)
          .get('/api/posts/1')
          .expect(200)
          .expect(res => {
            expect(res.body).to.eql(expectedPosts[0])
          })
      })

      it('/api/posts/999 responds with 404 on non existent post resource', () => {
        return supertest(app)
          .get('/api/posts/999')
          .expect(404)
      })
    })
  })

  // POST /posts
  describe(`POST /api/Posts`, () => {
    const testBoards = makeBoardsArray();
    const testThreads = makeThreadsArray();
    const testUsers = makeUsersArray();
    const { maliciousPost, expectedPost } = makeMaliciousPost();

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
              })
        })
    })

    it('/api/posts create responds with 400 on missing content', () => {

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

          // now logged in, create post
          return supertest(app)
            .post('/api/posts')
            .set('Authorization', 'Bearer ' + authToken)
            .send({thread_id: 1})
            .expect(400)
        })
    })

    it('/api/posts create responds with correct post on success', () => {
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

          // now logged in, create post
          return supertest(app)
            .post('/api/posts')
            .set('Authorization', 'Bearer ' + authToken)
            .send({ content: "new post", thread_id: 2 })
            .expect(201)
            .expect(res => {
              expect(res.body.author_id).to.eql(userId)
              expect(res.body.thread_id).to.eql(2)
              expect(res.body.content).to.eql("new post")
            })
        })
    })

    it('/api/posts create responds with correctly cleaned post when given XSS attack code', () => {
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

          // now logged in, create post
          return supertest(app)
            .post('/api/posts')
            .set('Authorization', 'Bearer ' + authToken)
            .send(maliciousPost)
            .expect(201)
            .expect(res => {
              expect(res.body).to.eql({
                ...maliciousPost,
                content: expectedPost.content
              })
            })
        })
    })
  })
})