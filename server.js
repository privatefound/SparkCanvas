import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// --- SQLite Setup ---
const dbPath = path.join(__dirname, 'sparkcanvas.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error("Error opening database", err.message);
    else console.log("Connected to SQLite database.");
});

// Initialize Table
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS system_data (key TEXT PRIMARY KEY, value TEXT)");
});

// API Endpoints for Maps
app.get('/api/maps', (req, res) => {
    db.get("SELECT value FROM system_data WHERE key = 'all_maps'", (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row ? JSON.parse(row.value) : null);
    });
});

app.post('/api/maps', (req, res) => {
    const maps = JSON.stringify(req.body);
    db.run("INSERT OR REPLACE INTO system_data (key, value) VALUES ('all_maps', ?)", [maps], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ status: 'success' });
    });
});

// Point 5: Live Monitoring (Ping)
app.post('/api/ping', (req, res) => {
    const { ip } = req.body;
    if (!ip || ip.includes('x') || ip.includes('PRIMARY') || ip === 'Fetching...' || ip === 'Static') {
        return res.json({ status: 'offline' });
    }
    
    const command = process.platform === 'win32' 
        ? `ping -n 1 -w 1000 ${ip}` 
        : `ping -c 1 -W 1 ${ip}`;

    exec(command, (error) => {
        res.json({ status: error ? 'offline' : 'online' });
    });
});

// Catch-all route for SPA (React)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`SparkCanvas Backend running on port ${PORT}`);
});
