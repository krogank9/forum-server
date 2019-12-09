# Forum Server

This is the server for a full stack message/discussion board app. This server utilizes ExpressJS to expose API endpoints and PostgreSQL to manage the database. For more information please see the client repo. API documentation for each endpoint listed below.

## Client:

Repo: https://github.com/krogank9/forum-client

Demo: https://forum-client.now.sh/

## API Documentation:

### requireAuth middleware

* Accepts Authorization header, in the format "Bearer {token}"
* Can be used to protect any endpoint, and if so, you must attach JWT given at login with request in header.

### Auth

* /login POST
  * Accepts "user_name" and "password" keys in request body.
  * Responds with "authToken", "userName", and "userId" on success.
* /refresh POST - REQUIRES AUTHORIZATION
  * Updates the authToken previously given by a login, refreshing its expiry timer.
  * Responds with "authToken", "userName", and "userId" on success.
  
### Users

* Returned user objects contains fields: "id", "date_created", "user_name", "profilePic", "admin"

* /users POST
  * Accepts "user_name", "password" and "profile_picture" keys in request body.
  * Responds with newly created user's object.
* /users/:user_id GET
  * Returns user object for given id on success.

### Boards

* Returned board objects contain fields: "id", "name", "threadCount"

* /boards GET
  * Returns array of board objects that exist in the database.

* /boards/:board_id GET
  * Returns board object for given id on success.

### Threads

* Returned thread objects contain fields: "id", "name", "author_id", "date_created", "board_id", "reply_count", "author_name", "board_name"

* /threads GET
  * Returns a list of all thread objects in the database on any board.

* /threads POST - REQUIRES AUTH
  * Accepts "name", "board_id", "first_post_content" keys in request body.
  * Returns newly created thread object on success.

* /threads/:thread_id GET
  * Returns thread object for given id on success.

* /threads/:thread_id DELETE - REQUIRES AUTH
  * Returns 204 & deletes thread on success.
  * May only be performed by user who created thread or admin.

* /threads/:thread_id PATCH - REQUIRES AUTH
  * Returns 204 on success & updates the thread.

### Posts

* Returned post objects contain fields: "id", "date_created", "author_id", "thread_id", "content", "author_name", "author_picture"

* /posts GET
  * Returns a list of all post objects in the database on any board/thread.

* /posts POST - REQUIRES AUTH
  * Accepts "content" & "thread_id" keys in request body.
  * Returns newly created post object on success.

* /posts/:post_id GET
  * Returns post object for given id on success.

* /posts/:post_id DELETE - REQUIRES AUTH
  * Returns 204 & deletes post on success.
  * May only be performed by user who created post or admin.

* /threads/:thread_id PATCH - REQUIRES AUTH
  * Returns 204 on success & updates the post.
  
