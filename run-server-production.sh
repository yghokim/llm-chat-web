(cd frontend && npm run build && cd ..) && (pm2 delete tldt-server ; pm2 start ecosystem.config.js)