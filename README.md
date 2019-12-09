# Forum Server

This is the server for a full stack message/discussion board app. This server utilizes ExpressJS to expose API endpoints and PostgreSQL to manage the database. For more information please see the client repo. API documentation for each endpoint listed below.

## Client:

Repo: https://github.com/krogank9/forum-client

Demo: https://forum-client.now.sh/

## API Documentation:

### requireAuth middleware

* accepts Authorization header, in the format "Bearer {token}"
* can be used to protect any endpoint, and if so, you must attach JWT given at login with request in header

### Auth

* /login POST
  * accepts "user_name" and "password" keys in request body
  * responds with "authToken", "userName", and "userId" on success
* /refresh POST
  * requires authorization
  * updates the authToken previously given by a login, refreshing its expiry timer
  * responds with "authToken", "userName", and "userId" on success
  
### Users

* returned user objects contains fields: "id", "date_created", "user_name", "profilePic", "admin"

* /users POST
  * accepts "user_name", "password" and "profile_picture" keys in request body
  * responds with newly created user's object
* /users/:user_id GET
  * returns user object for given id on success

### Boards

* returned board objects contain fields: "id", "name", "threadCount"

* /boards GET
  * returns array of board objects that exist in the database

* /boards/:board_id GET
  * returns board object for given id on success

### Threads

* returned thread objects contain fields: "id", "name", "author_id", "date_created", "board_id", "reply_count", "author_name", "board_name"

* /threads GET
  * returns a list of all thread objects in the database on any board

* /threads POST - REQUIRES AUTH
  * accepts "name", "board_id", "first_post_content" keys in request body
  * returns newly created thread object on success

* /threads/:thread_id GET
  * returns thread object for given id on success

* /threads/:thread_id DELETE - REQUIRES AUTH
  * returns 204 & deletes thread on success
  * may only be performed by user who created thread or admin

* /threads/:thread_id PATCH - REQUIRES AUTH
  * returns 204 on success & updates the thread

### Posts

* returned post objects contain fields: "id", "date_created", "author_id", "thread_id", "content", "author_name", "author_picture"

* /posts GET
  * returns a list of all post objects in the database on any board/thread

* /posts POST - REQUIRES AUTH
  * accepts "content" & "thread_id" keys in request body
  * returns newly created post object on success

* /posts/:post_id GET
  * returns post object for given id on success

* /posts/:post_id DELETE - REQUIRES AUTH
  * returns 204 & deletes post on success
  * may only be performed by user who created post or admin

* /threads/:thread_id PATCH - REQUIRES AUTH
  * returns 204 on success & updates the post
  
