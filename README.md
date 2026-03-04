# ⚡ SparkCanvas: The Ultimate Homelab Architect ⚡

![SparkCanvas Banner](https://img.shields.io/badge/Homelab-Architect-38bdf8?style=for-the-badge&logo=reactflow)
![Vite](https://img.shields.io/badge/Vite-747bff?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

> Elevate your network documentation from boring spreadsheets to a high-tech, interactive digital twin. 🚀

**SparkCanvas** is a professional-grade, open-source network mapping tool designed specifically for homelab enthusiasts and network engineers. Stop guessing where your cables go and start visualizing your infrastructure with a "Cyber-Tech" aesthetic inspired by modern SOC dashboards.

---

## ✨ Key Features

### 🛠️ Interactive Network Builder
*   **Drag & Drop Library**: Instantly deploy Firewalls, Routers, Switches, Servers, NAS, IoT, APs, and UPS nodes.
*   **Services System**: Drag common homelab services (Pi-hole, Netdata, Grafana, etc.) directly onto your servers to assign them. 🐳
*   **Custom Node Engine**: Create unique devices with a library of tech icons and full RGB color control. 🎨
*   **Malleable Connections**: No more rigid lines. Enjoy smooth, animated Bezier curves that simulate real-time data flow. 🌊

### 📊 Deep Infrastructure Insight
*   **Multi-NIC Support**: Add infinite network interfaces (WAN, LAN, MGMT) with dedicated IPs to any node.
*   **Hardware Monitoring**: Document CPU cores, RAM, and Disk storage for every machine.
*   **App Stack Visualization**: See your containers and services listed beautifully inside their host nodes.

### 🔌 Smart Integration
*   **phpIPAM Intelligent Import**: Drop your `.xls` or `.xlsx` export and watch SparkCanvas build your network draft automatically using advanced heuristics (Hostname, Description, and MAC OUI detection). 🤖
*   **DHCP Intelligence**: Automatically groups DHCP pools into single, clean range nodes (e.g., `172.16.0.10 - .50`).

### 🖱️ Seamless UX
*   **Pro Context Menu**: Right-click any node to Edit or Delete instantly.
*   **Multi-Map Support**: Create and manage different network maps (Main, DMZ, Lab, etc.) with local storage persistence.
*   **High-Res Export**: Turn your masterpiece into a high-quality PNG for your documentation or GitHub profile. 📸

---

## 🚀 Quick Start

1.  **Clone the vision**: `git clone https://github.com/privatefound/SparkCanvas.git`
2.  **Ignite dependencies**: `npm install`
3.  **Launch the dashboard**: `npm run dev`

---

## 🛠️ Built With
*   [React 19](https://react.dev/) - The engine
*   [@xyflow/react](https://reactflow.dev/) - The canvas
*   [Lucide-React](https://lucide.dev/) - The icons
*   [XLSX](https://github.com/SheetJS/sheetjs) - The data bridge
*   [Vite](https://vitejs.dev/) - The lightning-fast build tool

---

## 📜 License
Licensed under the MIT License. Built with 💻 and ☕ for the Homelab community.

---
*Mapping your digital kingdom has never looked this good.* 👑
