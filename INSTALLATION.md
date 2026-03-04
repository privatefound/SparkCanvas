# 🛠️ Installation Guide: SparkCanvas

Follow these steps to get your SparkCanvas instance up and running on your local machine or server.

---

## 🚀 One-Step Installation

The easiest way to install SparkCanvas on Linux is with the provided installation script. This script will:
*   Install all necessary dependencies.
*   Build the frontend for production.
*   Copy the project to `/opt/sparkcanvas`.
*   Create, enable, and start a systemd service.

### 📋 Prerequisites
*   **Node.js**: Version 18.0 or later.
*   **npm**: Included with Node.js.
*   **Git**: For cloning the repository.

**On Debian/Ubuntu, run this to install prerequisites:**
```bash
sudo apt update && sudo apt install -y curl git && sudo apt install nodejs npm -y
```

### ⚙️ Command

Open your terminal and run:

```bash
git clone https://github.com/privatefound/SparkCanvas.git && cd SparkCanvas && chmod +x install.sh && ./install.sh
```

---

## ⚙️ How to Manage the Service

Once installed, SparkCanvas runs as a system service named `sparkcanvas`. You can manage it with the following commands:

*   **Check Status**:
    ```bash
    sudo systemctl status sparkcanvas
    ```

*   **View Real-Time Logs**:
    ```bash
    journalctl -u sparkcanvas -f
    ```

*   **Restart**:
    ```bash
    sudo systemctl restart sparkcanvas
    ```

*   **Stop**:
    ```bash
    sudo systemctl stop sparkcanvas
    ```

---

## 📂 Features & Workflows

### 📂 Importing Data (phpIPAM)
SparkCanvas is pre-configured to work with **phpIPAM** exports:
1.  Export your subnet or device list from phpIPAM in **Excel (.xlsx)** format.
2.  In SparkCanvas, click the **"Import phpIPAM"** button in the sidebar.
3.  Upload your file; the system will auto-detect headers and generate the map.

### 🖼️ Exporting
Click **"Export Map"** to download a high-quality PNG of your current network map.

---

## 📬 Support & Feedback

If you encounter any issues or have ideas for new tech icons, feel free to open an issue on GitHub! 🌟
