CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100)
);

INSERT INTO users (name, email) VALUES
  ('Alice', 'alice@db1.com'),
  ('Bob', 'bob@db1.com'),
  ('Charlie', 'charlie@db1.com'),
  ('Diana', 'diana@db1.com'),
  ('Eve', 'eve@db1.com')