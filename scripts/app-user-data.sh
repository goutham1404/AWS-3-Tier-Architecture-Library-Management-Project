#!/bin/bash
set -e
# Ubuntu example
apt-get update -y
apt-get install -y nodejs npm git

# install Node LTS via nodesource if desired
# curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
# apt-get install -y nodejs

mkdir -p /opt/library-backend
cd /opt/library-backend
# git clone https://github.com/youruser/library-project.git tmp || true
# cp -r tmp/backend/* /opt/library-backend/

# For example, create server.js and package.json here or pull from S3
cat > /opt/library-backend/server.js <<'EOF'
/* minimal server - you should replace with your repo content */
const express = require('express');
const app = express();
app.get('/api/health',(req,res)=>res.json({ok:true}));
app.listen(3000, ()=>console.log('listening 3000'));
EOF

# create .env (should use SSM or Secrets Manager in prod). Replace DB endpoint values.
cat > /opt/library-backend/.env <<'EOF'
DB_HOST=<RDS_ENDPOINT>
DB_PORT=3306
DB_USER=libraryuser
DB_PASS=supersecurepassword
DB_NAME=librarydb
PORT=3000
EOF

cd /opt/library-backend
# install npm deps if package.json exists
# npm install

# create systemd service
cat > /etc/systemd/system/library-backend.service <<'EOF'
[Unit]
Description=Library Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/library-backend
EnvironmentFile=/opt/library-backend/.env
ExecStart=/usr/bin/node /opt/library-backend/server.js
Restart=on-failure
LimitNOFILE=4096

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable library-backend
systemctl start library-backend

