#!/bin/bash
set -e
# Ubuntu example
apt-get update -y
apt-get install -y nginx git

# Place frontend files
mkdir -p /var/www/library
chown -R www-data:www-data /var/www/library

# Get static frontend from repo (adjust repo URL)
cd /var/www/library
# if repo accessible:
# git clone https://github.com/youruser/library-project.git tmp || true
# cp -r tmp/frontend/* /var/www/library/
# For demonstration, create index.html if not cloning:
cat > /var/www/library/index.html <<'EOF'
<!doctype html><html><head><meta charset="utf-8"><title>Library</title></head><body><h1>Frontend placeholder</h1></body></html>
EOF

# Copy nginx config
cat > /etc/nginx/conf.d/library.conf <<'EOF'
# (paste nginx/library.conf contents here, or copy from S3)
server {
    listen 80 default_server;
    server_name _;
    root /var/www/library;
    index index.html;
    location / { try_files \$uri \$uri/ /index.html; }
    location /api/ {
        proxy_pass http://<APP_PRIVATE_IP>:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
    }
}
EOF

systemctl enable nginx
systemctl restart nginx
