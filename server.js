const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { exec } = require('child_process');
const { proxmoxApi } = require('proxmox-api');
const https = require('https');

const app = express();
app.use(cors());
app.use(express.json());

// Point 5: Live Monitoring (Ping)
app.post('/api/ping', (req, res) => {
    const { ip } = req.body;
    if (!ip || ip.includes('x') || ip.includes('PRIMARY') || ip === 'Fetching...' || ip === 'Static') {
        return res.json({ status: 'offline' });
    }
    
    // Command based on OS
    const command = process.platform === 'win32' 
        ? `ping -n 1 -w 1000 ${ip}` 
        : `ping -c 1 -W 1 ${ip}`;

    exec(command, (error) => {
        res.json({ status: error ? 'offline' : 'online' });
    });
});

// Point 6: Proxmox Import
app.post('/api/proxmox/sync', async (req, res) => {
    const { host, user, password, tokenID, tokenSecret } = req.body;
    
    try {
        // Validation: root usually needs @pam realm
        let username = user;
        if (username === 'root') username = 'root@pam';

        // Proxmox API Client Configuration
        const proxmox = proxmoxApi({
            host: host.replace(/\/$/, ""), // Remove trailing slash
            username: username,
            password: password,
            tokenID: tokenID,
            tokenSecret: tokenSecret,
            // Homelabs often use self-signed certs
            httpsAgent: new https.Agent({ rejectUnauthorized: false })
        });

        const nodes = await proxmox.nodes.$get();
        const allVms = [];
        
        for (const node of nodes) {
            try {
                const vms = await proxmox.nodes.$(node.node).qemu.$get();
                const lxcs = await proxmox.nodes.$(node.node).lxc.$get();
                
                allVms.push(...vms.map(v => ({ 
                    name: v.name, 
                    vmid: v.vmid, 
                    status: v.status, 
                    type: 'vm', 
                    node: node.node 
                })));
                
                allVms.push(...lxcs.map(l => ({ 
                    name: l.name, 
                    vmid: l.vmid, 
                    status: l.status, 
                    type: 'lxc', 
                    node: node.node 
                })));
            } catch (err) {
                console.warn(`Could not fetch VMs for node ${node.node}:`, err.message);
            }
        }

        res.json({ vms: allVms });
    } catch (error) {
        console.error("Proxmox Auth/Sync Error:", error.message);
        res.status(500).json({ error: "Authentication failed. Check URL, Username (root@pam) and Password/Token." });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`SparkCanvas Backend running on port ${PORT}`);
});
