# Cache vs DB Performance Benchmark

This project benchmarks the performance difference between using Redis (an in-memory cache) and PostgreSQL (a disk-based relational database) for simple key-value operations.

## What It Does
- Measures the time to perform a number of SET/GET operations in Redis.
- Measures the time to perform a number of INSERT/SELECT operations in PostgreSQL.
- Compares the results to highlight the speed difference between cache and database for basic operations.

## Project Structure
- `index.js`: Main benchmarking script.
- `docker-compose.yml`: Defines services for Redis and PostgreSQL for local testing.

## Prerequisites
- [Docker](https://www.docker.com/)
- [Node.js](https://nodejs.org/) (v16+ recommended)

## Getting Started

### 1. Start the Databases

```
docker-compose up -d
```
This will start Redis on port 6379 and PostgreSQL on port 5436.

### 2. Install Dependencies

```
npm install redis pg
```

### 3. Run the Benchmark

```
node index.js
```

## Output Example
```
Running performance tests with 1000 operations

Testing Redis...
Redis SET time: 0.123 seconds
Redis GET time: 0.098 seconds

Testing PostgreSQL...
PostgreSQL INSERT time: 2.345 seconds
PostgreSQL SELECT time: 1.876 seconds
```

## Configuration
- Redis connection: `localhost:6379`
- PostgreSQL connection: `localhost:5436`, database: `testdb`, user: `user`, password: `password`

## Notes
- The script will automatically create and clean up the test table in PostgreSQL.
- You can change the number of operations by editing the `nOperations` variable in `index.js`.

