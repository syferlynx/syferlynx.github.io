#!/bin/sh
# Health check script for the React application

# Check if nginx is running and responding
if wget --no-verbose --tries=1 --spider http://localhost:80/ 2>/dev/null; then
    echo "Health check passed"
    exit 0
else
    echo "Health check failed"
    exit 1
fi 