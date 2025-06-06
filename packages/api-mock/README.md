# API Mock Server

A local development server that simulates your AWS API Gateway and Lambda function locally.

## Features

- 🚀 Runs your actual Lambda handler code locally
- 📡 Simulates API Gateway event structure
- 🔄 Supports all HTTP methods (GET, POST, PUT, DELETE, etc.)
- 🌐 CORS enabled for frontend development
- 🔍 Health check endpoint
- 📝 Request logging

## Usage

### Start the server

From the project root:
```bash
npm run start:api
```

Or directly from this package:
```bash
cd packages/api-mock
npm start
```

### Development mode (with auto-restart)
```bash
cd packages/api-mock
npm run dev
```

## Endpoints

- **Health Check**: `GET http://localhost:3001/health`
- **All API routes**: `ANY http://localhost:3001/*` (handled by your Lambda function)

## Testing

```bash
# Health check
curl http://localhost:3001/health

# Test your API
curl http://localhost:3001/test
curl http://localhost:3001/api/users
curl -X POST http://localhost:3001/api/data -H "Content-Type: application/json" -d '{"key":"value"}'
```

## How it works

1. The server loads your Lambda handler from `../cdk/lib/lambda/api-handler.js`
2. For each incoming HTTP request, it creates an API Gateway-like event object
3. It calls your Lambda handler with this event
4. It converts the Lambda response back to an HTTP response

## Configuration

- **Port**: Set `PORT` environment variable (default: 3001)
- **Lambda Handler**: Automatically loads from `../cdk/lib/lambda/api-handler.js`

## Development

The server automatically simulates:
- API Gateway event structure
- Lambda context object
- CORS headers
- Request/response transformation
