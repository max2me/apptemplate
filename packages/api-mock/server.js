import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Import the Lambda handler
// We'll read and evaluate the handler file since it uses CommonJS exports
const handlerPath = join(__dirname, '../cdk/lib/lambda/api-handler.js');
let handler;

try {
  const handlerCode = readFileSync(handlerPath, 'utf8');
  // Create a simple module context to evaluate the CommonJS code
  const moduleContext = { exports: {} };
  const wrappedCode = `(function(exports, module) { ${handlerCode} })(moduleContext.exports, moduleContext);`;
  eval(wrappedCode);
  handler = moduleContext.exports.handler;
  console.log('✅ Successfully loaded Lambda handler');
} catch (error) {
  console.error('❌ Failed to load Lambda handler:', error.message);
  process.exit(1);
}

// Middleware to simulate API Gateway event structure
const createApiGatewayEvent = (req) => {
  return {
    httpMethod: req.method,
    path: req.path,
    pathParameters: req.params,
    queryStringParameters: req.query,
    headers: req.headers,
    body: req.body ? JSON.stringify(req.body) : null,
    requestContext: {
      requestId: Math.random().toString(36).substring(7),
      stage: 'local',
      httpMethod: req.method,
      path: req.path,
    },
    isBase64Encoded: false
  };
};

// Middleware to handle Lambda response format
const handleLambdaResponse = (res, lambdaResponse) => {
  const { statusCode, headers, body } = lambdaResponse;
  
  // Set headers if provided
  if (headers) {
    Object.keys(headers).forEach(key => {
      res.set(key, headers[key]);
    });
  }
  
  // Parse body if it's a JSON string
  let responseBody = body;
  try {
    responseBody = JSON.parse(body);
  } catch (e) {
    // If parsing fails, use body as-is
  }
  
  res.status(statusCode || 200).json(responseBody);
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Mock API server is running',
    timestamp: new Date().toISOString()
  });
});

// Catch-all route to handle all API requests
app.use('/', async (req, res) => {
  try {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    
    // Create API Gateway-like event
    const event = createApiGatewayEvent(req);
    
    // Create Lambda context (minimal simulation)
    const context = {
      requestId: event.requestContext.requestId,
      functionName: 'ApiFunction',
      functionVersion: '$LATEST',
      getRemainingTimeInMillis: () => 30000
    };
    
    // Call the Lambda handler
    const result = await handler(event, context);
    
    // Handle the response
    handleLambdaResponse(res, result);
    
  } catch (error) {
    console.error('❌ Error calling Lambda handler:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Local API server running on http://localhost:${PORT}`);
  console.log(`📡 All routes will be handled by your Lambda function`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔄 Try: curl http://localhost:${PORT}/test`);
  console.log(`🛑 Press Ctrl+C to stop the server`);
});
