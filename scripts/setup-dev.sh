#!/bin/bash

# PetVet Development Environment Setup Script
# This script sets up the local development environment

set -e

echo "🐾 PetVet Development Environment Setup"
echo "========================================"

# Check required tools
check_requirements() {
    echo "📋 Checking requirements..."

    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed. Please install Node.js 20+."
        exit 1
    fi

    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed. Please install Docker."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        echo "❌ Docker Compose is not installed. Please install Docker Compose."
        exit 1
    fi

    echo "✅ All requirements met!"
}

# Setup environment files
setup_env() {
    echo "🔧 Setting up environment files..."

    if [ ! -f .env ]; then
        cp .env.example .env
        echo "✅ Created .env file from .env.example"
        echo "⚠️  Please update .env with your actual configuration values"
    else
        echo "ℹ️  .env file already exists"
    fi
}

# Install dependencies
install_deps() {
    echo "📦 Installing dependencies..."

    # Root dependencies
    npm install

    # Package dependencies
    echo "Installing WhatsApp Handler dependencies..."
    cd packages/whatsapp-handler && npm install && cd ../..

    echo "Installing API dependencies..."
    cd packages/api && npm install && cd ../..

    echo "Installing Admin Dashboard dependencies..."
    cd packages/admin-dashboard && npm install && cd ../..

    echo "Installing AI Services dependencies..."
    cd packages/ai-services
    if command -v python3 &> /dev/null; then
        python3 -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
        deactivate
    fi
    cd ../..

    echo "✅ Dependencies installed!"
}

# Start infrastructure services
start_infra() {
    echo "🚀 Starting infrastructure services (PostgreSQL, Redis)..."

    docker compose -f docker-compose.dev.yml up -d postgres redis

    echo "⏳ Waiting for services to be healthy..."
    sleep 10

    echo "✅ Infrastructure services started!"
}

# Run database migrations
run_migrations() {
    echo "🗄️  Running database migrations..."

    cd packages/api
    npm run db:migrate 2>/dev/null || echo "ℹ️  Migrations not configured yet"
    cd ../..

    echo "✅ Migrations complete!"
}

# Seed development data
seed_data() {
    echo "🌱 Seeding development data..."

    ./scripts/seed-data.sh 2>/dev/null || echo "ℹ️  Seed script not available"

    echo "✅ Seeding complete!"
}

# Print success message
print_success() {
    echo ""
    echo "🎉 Development environment setup complete!"
    echo ""
    echo "To start all services in development mode:"
    echo "  docker compose -f docker-compose.dev.yml up"
    echo ""
    echo "Or start individual services:"
    echo "  cd packages/api && npm run dev"
    echo "  cd packages/whatsapp-handler && npm run dev"
    echo "  cd packages/admin-dashboard && npm run dev"
    echo "  cd packages/ai-services && uvicorn src.main:app --reload"
    echo ""
    echo "Available URLs:"
    echo "  API:             http://localhost:3000"
    echo "  WhatsApp Handler: http://localhost:3001"
    echo "  Admin Dashboard:  http://localhost:5173"
    echo "  AI Services:      http://localhost:8000"
    echo "  pgAdmin:          http://localhost:8082"
    echo "  Redis Commander:  http://localhost:8081"
    echo ""
}

# Main execution
main() {
    check_requirements
    setup_env
    install_deps
    start_infra
    run_migrations
    seed_data
    print_success
}

main "$@"
