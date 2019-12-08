function makeBoardsArray(simulateResponse) {
  responseOnly = simulateResponse? {threadCount: 0} : {}
  return [
    {
      ...responseOnly,
      id: 1,
      name: 'Programming',
    },
    {
      ...responseOnly,
      id: 2,
      name: 'Nature',
    },
    {
      ...responseOnly,
      id: 3,
      name: 'Random',
    },
  ]
}

function makeUsersArray() {
  return [
    {
      id: 1,
      user_name: 'logan',
      password: '$2y$12$KO.8g35QGwgvKffmdwG.A.NmkX0JKp6kLN.6UFTEJujbnHo4Qkn9W',//'Password1234!',
      profile_picture: 1,
      admin: true
    },
    {
      id: 2,
      user_name: 'maggie',
      password: '$2y$12$KO.8g35QGwgvKffmdwG.A.NmkX0JKp6kLN.6UFTEJujbnHo4Qkn9W',//'Password1234!',
      profile_picture: 2,
      admin: true
    },
    {
      id: 3,
      user_name: 'djole',
      password: '$2y$12$KO.8g35QGwgvKffmdwG.A.NmkX0JKp6kLN.6UFTEJujbnHo4Qkn9W',//'Password1234!',
      profile_picture: 3,
      admin: true
    },
  ]
}

function makeThreadsArray(simulateResponse) {
  let s = simulateResponse
  return [
    {
      ...(s?{author_name: 'djole', reply_count: 1, board_name: "Programming"}:{}),
      id: 1,
      name: 'Coding thread',
      author_id: 3,
      board_id: 1,
      date_created: new Date().toISOString()
    },
    {
      ...(s?{author_name: 'maggie', reply_count: 0, board_name: "Nature"}:{}),
      id: 2,
      name: 'Outdoors thread',
      author_id: 2,
      board_id: 2,
      date_created: new Date().toISOString()
    },
    {
      ...(s?{author_name: 'logan', reply_count: 0, board_name: "Random"}:{}),
      id: 3,
      name: 'Memes thread',
      author_id: 1,
      board_id: 3,
      date_created: new Date().toISOString()
    },
  ]
}

function makePostsArray(simulateResponse) {
  let s = simulateResponse
  return [
    {
      ...(s?{author_name: 'djole', author_picture: 3}:{}),
      id: 1,
      thread_id: 1,
      author_id: 3,
      content: 'This is a coding thread',
      date_created: new Date().toISOString()
    },
    {
      ...(s?{author_name: 'maggie', author_picture: 2}:{}),
      id: 2,
      thread_id: 2,
      author_id: 2,
      content: 'This is a thread about the great outdoors',
      date_created: new Date().toISOString()
    },
    {
      ...(s?{author_name: 'logan', author_picture: 1}:{}),
      id: 3,
      thread_id: 3,
      author_id: 1,
      content: 'This is a thread about memes',
      date_created: new Date().toISOString()
    },
    {
      ...(s?{author_name: 'logan', author_picture: 1}:{}),
      id: 4,
      thread_id: 1,
      author_id: 1,
      content: 'Wow cool thread',
      date_created: new Date().toISOString()
    },
  ];
}


function makeMaliciousPost() {
  const maliciousPost = {
    id: 911,
    thread_id: 1,
    author_id: 1,
    content: 'Naughty naughty very naughty <script>alert("xss");</script>',
  }
  const expectedPost = {
    ...maliciousPost,
    content: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
  }
  return {
    maliciousPost,
    expectedPost,
  }
}

module.exports = {
  makeBoardsArray,
  makeUsersArray,
  makeThreadsArray,
  makePostsArray,
  makeMaliciousPost
}