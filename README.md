# App Template

This project uses npm workspaces to manage a React TypeScript webapp built with Vite.js and a CDK stack for deployment to AWS.

## Project Structure

- `packages/webapp`: React TypeScript application built with Vite.js
- `packages/cdk`: AWS CDK stack for deploying the webapp to S3 and CloudFront
- `packages/api-mock`: Local development server for testing API Gateway and Lambda functions

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- AWS CLI configured with your credentials
- AWS CDK installed globally (`npm install -g aws-cdk`)

### Installation

1. Install dependencies:
   ```
   npm run setup
   ```

### Development

1. Run the mock-api locally:
   ```
   npm run start:web
   ```

2. Run the API mock server locally:
   ```
   npm run start:api
   ```

### Deployment

1. Deploy to AWS (builds all workspaces and deploys the CDK stack):
   ```
   npm run deploy
   ```

   This command will:
   - Build the webapp
   - Build the CDK stack
   - Bootstrap the CDK environment if needed
   - Deploy all CDK stacks

## AWS Resources Created

- S3 bucket for hosting the webapp
- CloudFront distribution for content delivery

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite.js 6
- **Infrastructure**: AWS CDK v2
- **Deployment**: AWS S3 + CloudFront

## Available Scripts

- `npm run setup`: Install all dependencies
- `npm run start`: Start the webapp in development mode
- `npm run deploy`: Build all workspaces and deploy to AWS
- `npm run lint --workspace=webapp`: Run ESLint on the webapp
- `npm run test --workspace=cdk`: Run tests for the CDK stack
