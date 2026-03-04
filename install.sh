#!/bin/bash

# --- Colori per l'output ---
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Inizio installazione SparkCanvas...${NC}"

# 1. Verifica Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js non trovato. Per favore installalo prima di continuare.${NC}"
    exit 1
fi

# 2. Installazione dipendenze
echo -e "${GREEN}📦 Installazione dipendenze...${NC}"
npm install --silent

# 3. Build del frontend
echo -e "${GREEN}🏗️ Compilazione frontend (Vite)...${NC}"
npm run build --silent

# 4. Creazione cartella /opt/sparkcanvas
echo -e "${GREEN}📁 Preparazione cartella /opt/sparkcanvas...${NC}"
sudo mkdir -p /opt/sparkcanvas
sudo cp -r . /opt/sparkcanvas
sudo chown -R $(whoami):$(whoami) /opt/sparkcanvas

# 5. Generazione e installazione del servizio systemd
echo -e "${GREEN}⚙️ Configurazione servizio di sistema...${NC}"
USER_NAME=$(whoami)
NODE_BIN=$(which node)

cat <<EOF | sudo tee /etc/systemd/system/sparkcanvas.service > /dev/null
[Unit]
Description=SparkCanvas Backend Service
After=network.target

[Service]
Type=simple
User=$USER_NAME
WorkingDirectory=/opt/sparkcanvas
ExecStart=$NODE_BIN /opt/sparkcanvas/server.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# 6. Avvio servizio
echo -e "${GREEN}⚡ Avvio servizio SparkCanvas...${NC}"
sudo systemctl daemon-reload
sudo systemctl enable sparkcanvas
sudo systemctl start sparkcanvas

echo -e "${BLUE}--------------------------------------------------${NC}"
echo -e "${GREEN}✅ INSTALLAZIONE COMPLETATA CON SUCCESSO!${NC}"
echo -e "L'applicazione è ora attiva all'indirizzo: ${BLUE}http://localhost:3001${NC}"
echo -e "Puoi gestire il servizio con: ${BLUE}sudo systemctl status sparkcanvas${NC}"
echo -e "${BLUE}--------------------------------------------------${NC}"
