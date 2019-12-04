INSERT INTO users (user_name, password, admin, profile_picture)
VALUES
  ('logan', '$2y$12$MtaFGoP9Wqt52Tv3d3jjAeUSjm7.06yOvJS6yCP4XVtFZ7sg0J5Pq', TRUE, 1),
  ('djole', '$2y$12$MtaFGoP9Wqt52Tv3d3jjAeUSjm7.06yOvJS6yCP4XVtFZ7sg0J5Pq', FALSE, 2),
  ('maggie', '$2y$12$MtaFGoP9Wqt52Tv3d3jjAeUSjm7.06yOvJS6yCP4XVtFZ7sg0J5Pq', FALSE, 3),
  ('sam', '$2y$12$MtaFGoP9Wqt52Tv3d3jjAeUSjm7.06yOvJS6yCP4XVtFZ7sg0J5Pq', FALSE, 4);

--passwords = abc123

INSERT INTO boards (name)
VALUES
  ('Programming'),
  ('Gaming'),
  ('Nature'),
  ('Funny'),
  ('Lounge');

INSERT INTO threads (name, board_id, author_id)
VALUES
  ('What''s your favorite programming language?', 1, 1),
  ('Let''s discuss trends in the industry', 1, 2),
  ('Functional vs Imperative programming languages', 1, 3),
  ('What side projects are you working on right now?', 1, 4),
  ('Most influential programmers of all time', 1, 1),

  ('Nintendo thread - new releases', 2, 4),
  ('PC vs Consoles', 2, 2),
  ('What''s your favorite genre and why?', 2, 3),

  ('Best natural parks to visit', 3, 4),
  ('Favorite national parks in PA', 3, 2),
  ('Hiking tips thread', 3, 3),

  ('Jokes thread - Tell your best jokes', 4, 4),
  ('Funniest memes', 4, 2),

  ('How was your day today?', 5, 4),
  ('Let''s write a novel one word at a time', 5, 2),
  ('Debate thread - Which is the best color?', 5, 3);

INSERT INTO posts (content, thread_id, author_id)
VALUES
  ('What''s your favorite programming language?', 1, 1),
  ('Let''s discuss trends in the industry', 2, 2),
  ('Functional vs Imperative programming languages', 3, 3),
  ('What side projects are you working on right now?', 4, 4),
  ('Most influential programmers of all time', 5, 1),

  ('Nintendo thread - new releases', 6, 4),
  ('PC vs Consoles', 7, 2),
  ('What''s your favorite genre and why?', 8, 3),

  ('Best natural parks to visit', 9, 4),
  ('Favorite national parks in PA', 10, 2),
  ('Hiking tips thread', 11, 3),

  ('Jokes thread - Tell your best jokes', 12, 4),
  ('Funniest memes', 13, 2),

  ('How was your day today?', 14, 4),
  ('Let''s write a novel one word at a time', 15, 2),
  ('Debate thread - Which is the best color?', 16, 3);