#!/bin/bash

# Configuration
BASE_URL="http://localhost:3000"

# Function to enable maintenance mode
enable_maintenance() {
    echo "🔧 Enabling maintenance mode..."
    curl -X PATCH "$BASE_URL/api/admin/settings" \
        -H "Content-Type: application/json" \
        -d '[{"key":"maintenanceMode","value":true}]'
    echo ""
    echo "✅ Maintenance mode enabled!"
}

# Function to disable maintenance mode
disable_maintenance() {
    echo "🔧 Disabling maintenance mode..."
    curl -X PATCH "$BASE_URL/api/admin/settings" \
        -H "Content-Type: application/json" \
        -d '[{"key":"maintenanceMode","value":false}]'
    echo ""
    echo "✅ Maintenance mode disabled!"
}

# Function to check maintenance mode status
check_status() {
    echo "📊 Checking maintenance mode status..."
    curl -s "$BASE_URL/api/settings" | grep -o '"maintenanceMode":[^,]*' | cut -d':' -f2
    echo ""
}

# Main script logic
case "$1" in
    "on")
        enable_maintenance
        ;;
    "off")
        disable_maintenance
        ;;
    "status")
        check_status
        ;;
    *)
        echo "Usage: $0 [on|off|status]"
        echo ""
        echo "Commands:"
        echo "  on     - Enable maintenance mode"
        echo "  off    - Disable maintenance mode"
        echo "  status - Check current maintenance mode status"
        echo ""
        echo "Examples:"
        echo "  $0 on     # Enable maintenance mode"
        echo "  $0 off    # Disable maintenance mode"
        echo "  $0 status # Check status"
        ;;
esac 