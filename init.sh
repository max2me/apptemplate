#!/bin/bash

# Read values from environment variables
# If environment variables are not set, keep empty values
APP_NAME="${APPNAME:-}"
AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID:-}"
AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY:-}"

# Check if all required environment variables are provided
if [ -z "$APP_NAME" ] || [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "Error: Missing required environment variables"
    echo "Please set the following environment variables before running this script:"
    echo "  APPNAME                 - Application name"
    echo "  AWS_ACCESS_KEY_ID       - AWS Access Key ID"
    echo "  AWS_SECRET_ACCESS_KEY   - AWS Secret Access Key"
    exit 1
fi

echo "🚀 Starting setup for application: $APP_NAME"

# Step 1: Create folder based on application name
echo "📁 Creating application folder: $APP_NAME"
mkdir -p "$APP_NAME" > /dev/null 2>&1
if [ ! -d "$APP_NAME" ]; then
    echo "❌ Failed to create directory $APP_NAME"
    exit 1
fi

# Navigate to the application directory
cd "$APP_NAME" > /dev/null 2>&1
echo "✅ Successfully created and moved to directory: $(pwd)"

# Step 2: Download and unpack the repository
echo "📥 Downloading application template from GitHub..."
curl -L -o apptemplate.zip https://github.com/max2me/apptemplate/archive/refs/heads/main.zip > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Failed to download the repository"
    exit 1
fi

echo "📦 Extracting application template..."
unzip -q apptemplate.zip > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Failed to extract the repository"
    exit 1
fi

# Move contents from the extracted directory to the current directory
echo "🔄 Moving files to the application directory..."
mv apptemplate-main/* . > /dev/null 2>&1
mv apptemplate-main/.* . > /dev/null 2>&1 || true  # Move hidden files, ignore errors
rmdir apptemplate-main > /dev/null 2>&1
rm apptemplate.zip > /dev/null 2>&1
echo "✅ Successfully extracted application template"

# Step 3: Acknowledge AWS credentials
echo "🔐 Using AWS credentials from environment variables"
echo "✅ AWS credentials acknowledged"

# Step 4: Create appConfig.json
echo "⚙️ Creating application configuration file"
mkdir -p ./packages/cdk > /dev/null 2>&1
echo "{
  \"applicationName\": \"$APP_NAME\"
}" > ./packages/cdk/appConfig.json
echo "✅ Created appConfig.json with application name: $APP_NAME"

# Step 5: Run npm setup
echo "📦 Installing dependencies with npm run setup..."
npm run setup > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Failed to run npm setup"
    exit 1
fi
echo "✅ Successfully installed all dependencies"

# Final instructions
echo ""
echo "🎉 Setup completed successfully for $APP_NAME!"
echo ""
echo "Available commands:"
echo "  📋 To run the web server locally:"
echo "     cd $APP_NAME && npm run start"
echo ""
echo "  🚀 To deploy the site to AWS:"
echo "     cd $APP_NAME && npm run deploy"
echo ""
echo "Note: Your AWS credentials are set for the current terminal session only."
echo "      For a new terminal session, you'll need to set them again."
