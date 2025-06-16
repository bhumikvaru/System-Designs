# PostgreSQL Read Replica Setup

A complete PostgreSQL read replica implementation using Docker Compose, featuring primary-replica streaming replication with a Node.js application for testing.

## 📋 Overview

This project demonstrates PostgreSQL streaming replication with:
- **Primary Database**: Handles all write operations
- **Read Replica**: Synchronized copy for read operations
- **Node.js API**: Express server that routes writes to primary and reads to replica

## 🏗️ Architecture

```
┌─────────────────┐
│   Node.js API   │
│   (Port 6000)   │
└─────┬───────────┘
      │
   ┌──┴──┐
   │Write│Read
   │     │
┌──▼──┐ │ ┌─────▼─────┐
│     │ │ │           │
│ Primary │ │  Replica  │
│ :5435 │ │   :5436   │
│       │ │           │
└───────┘ └───────────┘
    │                 │
    └─── Streaming ────┘
         Replication
```

## 🚀 Features

- **Streaming Replication**: Real-time data synchronization from primary to replica
- **Automatic Failover Ready**: Replica can be promoted to primary if needed
- **Docker Compose**: Complete containerized setup
- **RESTful API**: Test endpoints for read/write operations
- **WAL Streaming**: Write-Ahead Logging for data consistency
- **Hot Standby**: Replica accepts read queries while in recovery mode

## 📁 Project Structure

```
postgres-read-replica/
├── docker-compose.yml      # Container orchestration
├── index.js               # Node.js Express application
├── package.json           # Node.js dependencies
├── init-primary.sql       # Primary database initialization
├── init-replica.sh        # Replica setup script
├── postgresql.conf        # PostgreSQL configuration
├── pg_hba.conf           # Authentication configuration
└── README.md             # This documentation
```

## 🛠️ Prerequisites

- Docker and Docker Compose
- Node.js (v14 or higher)
- npm or yarn

## 🔧 Quick Start

### 1. Start the PostgreSQL Cluster

```bash
# Clone or navigate to the project directory
cd postgres-read-replica

# Start primary and replica databases
docker-compose up -d

# Verify both containers are running
docker-compose ps
```

### 2. Install Node.js Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env` file with the following configuration:

```bash
# Primary Database (for writes)
PRIMARY_DB_HOST=localhost
PRIMARY_DB_PORT=5435
DB_USER=admin
DB_PASSWORD=password
DB_NAME=mydb

# Replica Database (for reads)
REPLICA_DB_HOST=localhost
REPLICA_DB_PORT=5436
```

### 4. Start the Application

```bash
npm start
```

The API will be available at `http://localhost:6000`

## 🎯 API Usage

### Create User (Write to Primary)

```bash
curl -X POST http://localhost:6000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com"
}
```

### Get Users (Read from Replica)

```bash
curl http://localhost:6000/users
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
]
```

## 🗄️ Database Configuration

### Primary Database
- **Port**: 5435
- **User**: admin
- **Password**: password
- **Database**: mydb
- **Role**: Accepts read/write operations

### Replica Database
- **Port**: 5436
- **User**: admin
- **Password**: password
- **Database**: mydb (synchronized from primary)
- **Role**: Read-only operations

### Replication User
- **Username**: replicator
- **Password**: replicatorpass
- **Privileges**: Replication rights

## 🔍 Monitoring Replication

### Check Replication Status on Primary

```bash
docker exec -it postgres-primary psql -U admin -d mydb -c "SELECT * FROM pg_stat_replication;"
```

### Check Replica Status

```bash
docker exec -it postgres-replica psql -U admin -d mydb -c "SELECT * FROM pg_stat_wal_receiver;"
```

### View Replication Lag

```bash
docker exec -it postgres-primary psql -U admin -d mydb -c "
SELECT 
    client_addr,
    state,
    sent_lsn,
    write_lsn,
    flush_lsn,
    replay_lsn,
    sync_state
FROM pg_stat_replication;
"
```

## 🔧 Direct Database Access

### Connect to Primary Database

```bash
docker exec -it postgres-primary psql -U admin -d mydb
```

### Connect to Replica Database

```bash
docker exec -it postgres-replica psql -U admin -d mydb
```

### Test Replication

1. **Insert data on primary:**
```sql
INSERT INTO users (name, email) VALUES ('Test User', 'test@example.com');
```

2. **Verify on replica:**
```sql
SELECT * FROM users WHERE name = 'Test User';
```

## 🚦 Troubleshooting

### Common Issues

#### 1. ECONNRESET Error
**Cause**: Network connection reset, usually due to database unavailability
**Solution**: 
- Check if containers are running: `docker-compose ps`
- Restart containers: `docker-compose restart`
- Check logs: `docker-compose logs`

#### 2. Replica Connection Failed
**Cause**: Authentication or network issues
**Solution**:
- Verify pg_hba.conf configuration
- Check replicator user credentials
- Ensure primary is accessible from replica

#### 3. Replication Lag
**Cause**: High write load or network latency
**Solution**:
- Monitor `pg_stat_replication` for lag metrics
- Increase `wal_keep_size` if needed
- Check network connectivity

### Logs and Debugging

```bash
# View all logs
docker-compose logs -f

# View specific container logs
docker-compose logs postgres-primary
docker-compose logs postgres-replica

# Check replication status
docker exec postgres-primary psql -U admin -d mydb -c "SELECT * FROM pg_stat_replication;"
```

## 🐳 Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v

# View running containers
docker-compose ps

# Follow logs
docker-compose logs -f

# Restart specific service
docker-compose restart postgres-replica
```

## ⚙️ Configuration Files

### postgresql.conf
- `listen_addresses = '*'`: Accept connections from any IP
- `wal_level = replica`: Enable WAL for replication
- `max_wal_senders = 10`: Maximum concurrent replication connections
- `wal_keep_size = 64`: Minimum WAL segments to keep
- `hot_standby = on`: Allow read queries on replica

### pg_hba.conf
- Enables replication connections from replica to primary
- Configures authentication methods for different connection types

## 🔄 Failover Process

### Manual Failover (Promote Replica to Primary)

1. **Stop the replica:**
```bash
docker exec postgres-replica pg_ctl -D /var/lib/postgresql/data stop
```

2. **Promote replica to primary:**
```bash
docker exec postgres-replica pg_ctl -D /var/lib/postgresql/data promote
```

3. **Update application configuration** to point to the new primary

## 📊 Performance Considerations

- **Connection Pooling**: Use connection pooling in production
- **Read Load Balancing**: Distribute read queries across multiple replicas
- **Monitoring**: Implement monitoring for replication lag and health
- **Backup Strategy**: Regular backups of primary database
- **Network**: Ensure stable network connection between primary and replica

## 🚧 Production Recommendations

1. **Security**: Use SSL/TLS for replication connections
2. **Monitoring**: Implement comprehensive monitoring and alerting
3. **Backup**: Regular automated backups
4. **Resource Management**: Proper CPU and memory allocation
5. **High Availability**: Consider using tools like Patroni or repmgr
6. **Load Balancing**: Use HAProxy or similar for connection management

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PRIMARY_DB_HOST` | Primary database hostname | localhost |
| `PRIMARY_DB_PORT` | Primary database port | 5435 |
| `REPLICA_DB_HOST` | Replica database hostname | localhost |
| `REPLICA_DB_PORT` | Replica database port | 5436 |
| `DB_USER` | Database username | admin |
| `DB_PASSWORD` | Database password | password |
| `DB_NAME` | Database name | mydb |

## 📈 Scaling

### Adding More Replicas

1. **Add new service to docker-compose.yml:**
```yaml
postgres-replica-2:
  # Similar configuration with different port
  ports:
    - "5437:5432"
```

2. **Update application** to include new replica in load balancing

### Read Load Balancing

Implement round-robin or weighted load balancing across multiple replicas in your application.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review Docker and PostgreSQL logs
3. Consult PostgreSQL documentation for replication
4. Open an issue with detailed error information

---

*This setup provides a solid foundation for PostgreSQL read replication in development and can be adapted for production use with additional security and monitoring considerations.*
