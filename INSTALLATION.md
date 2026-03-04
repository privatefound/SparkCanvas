# 🛠️ Installation Guide: SparkCanvas

Follow these steps to get your SparkCanvas instance up and running on your local machine or server.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
*   **Node.js**: Version 18.0 or later (Recommended: Latest LTS).
*   **npm**: Included with Node.js.
*   **Git**: For cloning the repository.

---

## ⚙️ Step 1: Clone the Repository

Open your terminal and run the following command to download the SparkCanvas source code:

```bash
git clone https://github.com/your-username/SparkCanvas.git
cd SparkCanvas
```

---

## 📦 Step 2: Install Dependencies

SparkCanvas relies on several high-performance libraries (React Flow, Lucide, XLSX). Install them using npm:

```bash
npm install
```

---

## 🚀 Step 3: Run in Development Mode

To start the development server and see the high-tech UI in action:

```bash
npm run dev
```

*   **URL**: [http://localhost:5173](http://localhost:5173)
*   The dashboard will automatically reload as you make changes to the code.

---

## 🏗️ Step 4: Build for Production

If you want to host SparkCanvas on a web server (e.g., Nginx, Apache):

1.  **Generate the build**:
    ```bash
    npm run build
    ```
2.  **Deploy**: Copy the contents of the `dist/` folder to your web server's public directory.

---

## 📂 Features & Workflows

### 🧩 Adding Services
You can easily assign services to your nodes:
1.  Locate the **Services** section in the sidebar.
2.  **Drag** a service (e.g., Pi-hole, Grafana).
3.  **Drop** it onto a node (Server, NAS, etc.) in the canvas.
4.  The service will appear in the "Containers / Apps" section of that node.

### 📂 Importing Data (phpIPAM)
SparkCanvas is pre-configured to work with **phpIPAM** exports:
1.  Export your subnet or device list from phpIPAM in **Excel (.xlsx)** format.
2.  In SparkCanvas, click the **"Import phpIPAM"** button in the sidebar.
3.  Upload your file; the system will auto-detect headers and generate the map.

### 🖼️ Exporting
Click **"Export Map"** to download a high-quality PNG of your current network map.

---

## ❓ Troubleshooting

*   **Excel Parsing Error**: Ensure your Excel file has a clear header row. SparkCanvas looks for "ip address" or "hostname".
*   **Port Conflict**: If port 5173 is in use, Vite will automatically try another port (e.g., 5174). Check the terminal output for the correct URL.

---

## 📬 Support & Feedback

If you encounter any issues or have ideas for new tech icons, feel free to open an issue on GitHub! 🌟
