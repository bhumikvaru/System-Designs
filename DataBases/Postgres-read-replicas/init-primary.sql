CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100)
);

INSERT INTO users (name, email) VALUES ('John Doe', 'john@example.com');

CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD 'replicatorpass';
GRANT ALL PRIVILEGES ON DATABASE mydb TO replicator;
GRANT ALL ON users TO replicator;