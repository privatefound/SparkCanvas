# ⚡ SparkCanvas: The Ultimate Homelab Architect ⚡

![SparkCanvas Banner](https://img.shields.io/badge/Homelab-Architect-38bdf8?style=for-the-badge&logo=reactflow)
![Vite](https://img.shields.io/badge/Vite-747bff?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

> Elevate your network documentation from boring spreadsheets to a high-tech, interactive digital twin. 🚀

**SparkCanvas** is a professional-grade, open-source network mapping tool designed specifically for homelab enthusiasts and network engineers. Stop guessing where your cables go and start visualizing your infrastructure with a "Cyber-Tech" aesthetic inspired by modern SOC dashboards.

<img width="2198" height="1299" alt="demo" src="demo.png" />

---

## 🚀 Quick Start

### Option 1 — Docker (recommended)

Requires [Docker](https://docs.docker.com/get-docker/) and Docker Compose.

```bash
git clone https://github.com/privatefound/SparkCanvas.git
cd SparkCanvas
docker compose up -d --build
```

The app will be available at: `http://localhost:3001`

The SQLite database is stored in a named Docker volume (`sparkcanvas_data`) and survives container restarts.

Useful commands:
```bash
docker compose logs -f          # follow logs
docker compose down             # stop
docker compose down -v          # stop and delete data volume
```

### Option 2 — Native install (Linux/systemd)

Requires [Node.js](https://nodejs.org/) 18+.

```bash
git clone https://github.com/privatefound/SparkCanvas.git
cd SparkCanvas
chmod +x install.sh
./install.sh
```

This installs SparkCanvas as a systemd service that starts automatically on boot.

```bash
sudo systemctl status sparkcanvas    # check status
sudo systemctl restart sparkcanvas   # restart
sudo systemctl stop sparkcanvas      # stop
```

---

## ✨ Key Features

### 🛠️ Interactive Network Builder
*   **Drag & Drop Library**: Instantly deploy Firewalls, Routers, Switches, Servers, NAS, IoT, APs, and UPS nodes.
*   **Services System**: Drag common homelab services (Pi-hole, Netdata, Grafana, etc.) directly onto your servers to assign them. 🐳
*   **Custom Node Engine**: Create unique devices with a library of tech icons and full RGB color control. 🎨
*   **Malleable Connections**: No more rigid lines. Enjoy smooth, animated Bezier curves that simulate real-time data flow. 🌊

### 🔌 Smart Integration
*   **phpIPAM Intelligent Import**: Drop your `.xls` or `.xlsx` export and watch SparkCanvas build your network draft automatically using advanced heuristics. 🤖
*   **SQLite Persistence**: Your data is stored locally and securely in a private database.

---

## 🛠️ Built With
*   [React 19](https://react.dev/) - The engine
*   [SQLite3](https://github.com/sqlite/sqlite3) - Local data persistence
*   [@xyflow/react](https://reactflow.dev/) - The canvas
*   [Lucide-React](https://lucide.dev/) - The icons
*   [Vite](https://vitejs.dev/) - Frontend build tool
*   [Express](https://expressjs.com/) - Backend API

---

## 🤝 Contributing
Created by **privatefound**.

## 📜 License
Licensed under the MIT License. Built with 💻 and ☕ for the Homelab community.

---
