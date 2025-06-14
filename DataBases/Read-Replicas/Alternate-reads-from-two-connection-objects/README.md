# PostgreSQL Read Replicas Demo

A Node.js application demonstrating database load balancing with multiple PostgreSQL instances using Docker Compose.

## 📋 Overview

This project showcases a simple round-robin load balancing strategy between two PostgreSQL databases. The Express.js server alternates queries between two database instances, simulating a read replica setup for improved performance and load distribution.

## 🏗️ Architecture

```
┌─────────────────┐
│   Express.js    │
│   Server        │
│   (Port 3001)   │
└─────────┬───────┘
          │
    Round Robin
     Load Balancer
          │
    ┌─────┴─────┐
    │           │
┌───▼───┐   ┌───▼───┐
│  DB1  │   │  DB2  │
│ :5433 │   │ :5434 │
└───────┘   └───────┘
```

## 🚀 Features

- **Dual PostgreSQL Instances**: Two separate PostgreSQL containers with different datasets
- **Round-Robin Load Balancing**: Automatic alternation between databases for read operations
- **Docker Compose Setup**: Easy deployment and management
- **Data Initialization**: Automatic table creation and data seeding
- **RESTful API**: Simple endpoint to fetch users from either database

## 📁 Project Structure

```
read-replicas/
├── docker-compose.yml      # Docker services configuration
├── server.js              # Express.js application
├── package.json           # Node.js dependencies
├── init-db1.sql          # DB1 initialization script
├── init-db2.sql          # DB2 initialization script
└── README.md             # This file
```

## 🛠️ Prerequisites

- Docker and Docker Compose
- Node.js (v14 or higher)
- npm

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd read-replicas
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Start the PostgreSQL databases**
   ```bash
   docker-compose up -d
   ```

4. **Verify databases are running**
   ```bash
   docker-compose ps
   ```

5. **Start the Express server**
   ```bash
   node server.js
   ```

## 🎯 Usage

### API Endpoints

#### GET /users
Fetches all users from one of the databases using round-robin selection.

**Request:**
```bash
curl http://localhost:3001/users
```

**Response:**
```json
{
  "source": "DB1",
  "data": [
    {
      "id": 1,
      "name": "Alice",
      "email": "alice@db1.com"
    },
    {
      "id": 2,
      "name": "Bob",
      "email": "bob@db1.com"
    }
  ]
}
```

### Testing Load Balancing

Run multiple requests to see the round-robin behavior:

```bash
# First request - DB1
curl http://localhost:3001/users

# Second request - DB2
curl http://localhost:3001/users

# Third request - DB1 again
curl http://localhost:3001/users
```

## 🗄️ Database Details

### Database 1 (Port 5433)
- **Users**: Alice, Bob, Charlie, Diana
- **Emails**: @db1.com domain

### Database 2 (Port 5434)
- **Users**: Frank, Grace, Heidi, Ivan
- **Emails**: @db1.com domain

### Direct Database Access

Connect directly to each database:

```bash
# Connect to DB1
docker exec -it dual_db1 psql -U user -d testdb

# Connect to DB2
docker exec -it dual_db2 psql -U user -d testdb
```

## 🔍 Troubleshooting

### Tables not created
If tables aren't being created:

1. **Remove existing volumes:**
   ```bash
   docker-compose down
   docker volume prune
   ```

2. **Restart containers:**
   ```bash
   docker-compose up -d
   ```

### Connection errors
- Ensure Docker containers are running: `docker-compose ps`
- Check container logs: `docker-compose logs db1` or `docker-compose logs db2`
- Verify ports 5433 and 5434 are not in use by other services

### Server won't start
- Make sure Node.js dependencies are installed: `npm install`
- Check if port 3001 is available
- Verify database containers are running before starting the server

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild containers
docker-compose up --build -d

# Remove volumes (for fresh start)
docker-compose down -v
```

## 📊 Configuration

### Environment Variables

The application uses the following database configuration:

- **User**: `user`
- **Password**: `password`
- **Database**: `testdb`
- **DB1 Port**: `5433`
- **DB2 Port**: `5434`

### Modifying Data

To change the initial data, edit the SQL files:
- `init-db1.sql` - Data for the first database
- `init-db2.sql` - Data for the second database

After modifying, restart with fresh volumes:
```bash
docker-compose down -v
docker-compose up -d
```

## 🚦 Production Considerations

This is a demo project. For production use, consider:

- **Connection Pooling**: Implement proper connection pool management
- **Health Checks**: Add database health monitoring
- **Error Handling**: Implement comprehensive error handling and retry logic
- **Security**: Use environment variables for credentials
- **Monitoring**: Add logging and metrics collection
- **Real Read Replicas**: Use PostgreSQL's built-in replication instead of separate databases

## 📝 License

ISC

## 👤 Author

Bhumik

---

*This project demonstrates basic concepts of database load balancing and is intended for educational purposes.*
