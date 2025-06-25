#!/bin/bash

echo "🚀 Preparing files for Hostinger deployment..."

# Create deployment directory
mkdir -p hostinger-deploy

# Copy required files and directories
echo "📁 Copying build files..."
cp -r .next hostinger-deploy/
cp -r public hostinger-deploy/
cp package.json hostinger-deploy/
cp package-lock.json hostinger-deploy/
cp next.config.mjs hostinger-deploy/
cp HOSTINGER_DEPLOYMENT.md hostinger-deploy/

# Copy optional files if they exist
if [ -f "README.md" ]; then
    cp README.md hostinger-deploy/
fi

if [ -f ".env" ]; then
    echo "⚠️  Found .env file. Remember to set environment variables in Hostinger control panel."
    cp .env hostinger-deploy/
fi

# Create a simple start script for Hostinger
cat > hostinger-deploy/start.sh << 'EOF'
#!/bin/bash
echo "Starting GreenoTech application..."
npm install --production
npm run start:hostinger
EOF

chmod +x hostinger-deploy/start.sh

echo "✅ Files prepared successfully!"
echo ""
echo "📦 Your deployment package is ready in: hostinger-deploy/"
echo ""
echo "📋 Next steps:"
echo "1. Upload the contents of 'hostinger-deploy/' to your Hostinger hosting"
echo "2. Set environment variables in Hostinger control panel"
echo "3. Run 'npm install --production' on Hostinger"
echo "4. Start the application with 'npm run start:hostinger'"
echo ""
echo "📖 See HOSTINGER_DEPLOYMENT.md for detailed instructions" 