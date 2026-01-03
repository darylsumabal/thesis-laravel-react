#!/bin/bash
set -e

# Run migrations
php artisan migrate --force

# Start Reverb in the background
php artisan reverb:start --host=0.0.0.0 --port=8080 --hostname=judging-tabulation.onrender.com &

# Start Apache in the foreground
apache2-foreground