CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100)
);

INSERT INTO users (name, email) VALUES
  ('Frank', 'frank@db1.com'),
  ('Grace', 'grace@db1.com'),
  ('Heidi', 'heidi@db1.com'),
  ('Ivan', 'ivan@db1.com'),
  ('Judy', 'judy@db1.com')
