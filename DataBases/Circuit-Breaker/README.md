# Circuit Breaker Demo

A demonstration of the Circuit Breaker pattern using Node.js microservices. This project shows how to implement resilience patterns to handle failures gracefully in distributed systems.

## Project Overview

This demo consists of two microservices:

- **Post Service** (Port 3000) - Main service that fetches posts and enriches them with user profile data
- **Profile Service** (Port 3001) - Service that provides user profile information with failure simulation capability

The Post Service uses the [Opossum](https://github.com/nodeshift/opossum) circuit breaker library to handle failures when calling the Profile Service.

## Project Structure

```
circuit-breaker-demo/
├── post-service/
│   ├── index.js               # Main service with circuit breaker
│   ├── package.json
│   └── pnpm-lock.yaml
└── profile-service/
    ├── index.js               # Profile service with failure simulation
    └── package.json
```

## Features

### Circuit Breaker Configuration
- **Timeout**: 3000ms - Maximum time to wait for a response
- **Error Threshold**: 50% - Percentage of failed requests before opening the circuit
- **Reset Timeout**: 10000ms - Time to wait before attempting to close the circuit

### Circuit Breaker States
- **Closed**: Normal operation, requests pass through
- **Open**: Circuit is open, requests fail fast and use fallback
- **Half-Open**: Testing if the service has recovered

## Prerequisites

- Node.js 16+
- Docker and Docker Compose
- pnpm (optional, can use npm)

## Running the Application

### Option 1: Docker Compose (Recommended)

1. Clone the repository and navigate to the project directory:
   ```bash
   cd circuit-breaker-demo
   ```

2. Start the services:
   ```bash
   docker-compose up --build
   ```

3. The services will be available at:
   - Post Service: http://localhost:3000
   - Profile Service: http://localhost:3001

### Option 2: Local Development

1. Install dependencies for both services:
   ```bash
   # Post Service
   cd post-service
   npm install
   
   # Profile Service
   cd ../profile-service
   npm install
   ```

2. Start both services in separate terminals:
   ```bash
   # Terminal 1 - Profile Service
   cd profile-service
   node index.js
   
   # Terminal 2 - Post Service
   cd post-service
   node index.js
   ```

## API Endpoints

### Post Service (Port 3000)
- `GET /posts` - Retrieves posts enriched with user profile data

### Profile Service (Port 3001)
- `GET /profile/:userId` - Retrieves user profile by ID
- `GET /toggle-failure` - Toggles failure simulation on/off

## Testing the Circuit Breaker

### 1. Normal Operation
```bash
curl http://localhost:3000/posts
```
Expected response with user profiles:
```json
[
  {
    "id": 1,
    "content": "Hello World!",
    "userId": 1,
    "profile": {
      "id": 1,
      "username": "john_doe"
    }
  },
  {
    "id": 2,
    "content": "Learning Circuit Breakers",
    "userId": 1,
    "profile": {
      "id": 1,
      "username": "john_doe"
    }
  }
]
```

### 2. Enable Failure Simulation
```bash
curl http://localhost:3001/toggle-failure
```
Response: `{"status":"Failure simulation enabled"}`

### 3. Trigger Circuit Breaker
Make multiple requests to trigger the circuit breaker:
```bash
# Make several requests quickly
for i in {1..10}; do curl http://localhost:3000/posts; echo; done
```

Watch the console logs to see:
- "Circuit breaker opened" when the error threshold is reached
- Fallback responses being returned
- "Circuit breaker half-open" and "Circuit breaker closed" during recovery

### 4. Fallback Response
When the circuit is open, you'll see fallback profiles:
```json
[
  {
    "id": 1,
    "content": "Hello World!",
    "userId": 1,
    "profile": {
      "id": null,
      "username": "Unknown",
      "error": "Profile service unavailable"
    }
  }
]
```

### 5. Disable Failure Simulation
```bash
curl http://localhost:3001/toggle-failure
```
Response: `{"status":"Failure simulation disabled"}`

The circuit breaker will eventually recover and normal operation will resume.

## Monitoring

Watch the console logs to observe circuit breaker state changes:

```
Circuit breaker opened
Circuit breaker half-open
Circuit breaker closed
```

## Circuit Breaker Pattern Benefits

1. **Fail Fast**: When a service is down, requests fail immediately rather than waiting for timeouts
2. **Automatic Recovery**: The circuit breaker automatically tests if the service has recovered
3. **Fallback Responses**: Provides graceful degradation with default values
4. **System Stability**: Prevents cascading failures in distributed systems

## Configuration Options

You can modify the circuit breaker settings in `post-service/index.js`:

```javascript
const breakerOptions = {
  timeout: 3000,                    // Request timeout in ms
  errorThresholdPercentage: 50,     // Error percentage to open circuit
  resetTimeout: 10000,              // Time before attempting recovery
  rollingCountTimeout: 10000,       // Window for error calculation
  rollingCountBuckets: 10,          // Number of buckets in window
  volumeThreshold: 10,              // Minimum requests before opening
};
```

## Troubleshooting

### Services won't start
- Ensure ports 3000 and 3001 are not in use
- Check Docker is running (for Docker Compose option)

### Circuit breaker not triggering
- Ensure failure simulation is enabled on profile service
- Make enough requests to exceed the volume threshold
- Check the error threshold percentage

### Connection refused errors
- Verify both services are running
- Check the service URLs in the code match your setup
- For Docker: ensure services are on the same network

## Learning Resources

- [Circuit Breaker Pattern - Martin Fowler](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Opossum Documentation](https://github.com/nodeshift/opossum)
- [Microservices Patterns](https://microservices.io/patterns/reliability/circuit-breaker.html)
