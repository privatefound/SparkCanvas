import React, { useState } from 'react';
import logo from '../assets/logo.png';
import {
    Router, Server, Monitor, HardDrive, Network, Cpu, Wifi, Database, Box, Zap,
    Download, Terminal, Search, DatabaseZap, Shield, Globe, Lock, Settings2,
    PlusSquare, Activity, BarChart3, Eye, HeartPulse, Container, Printer,
    LayoutGrid, Folder, Phone, Plus, Square, Circle, Type
} from 'lucide-react';

const nodeTypes = [
    { type: 'firewall', label: 'Firewall', icon: Shield, color: '#ef4444' },
    { type: 'router', label: 'Router', icon: Router, color: '#f472b6' },
    { type: 'switch', label: 'Switch', icon: Network, color: '#38bdf8' },
    { type: 'server', label: 'Server', icon: Server, color: '#fb923c' },
    { type: 'nas', label: 'NAS', icon: Database, color: '#38bdf8' },
    { type: 'ap', label: 'Access Point', icon: Wifi, color: '#facc15' },
    { type: 'iot', label: 'IoT', icon: Cpu, color: '#4ade80' },
    { type: 'ups', label: 'UPS', icon: Box, color: '#4ade80' },
    { type: 'custom', label: 'Custom Node', icon: PlusSquare, color: '#9499ab' },
];

const serviceTypes = [
    // Roles
    { type: 'role', label: 'AD', icon: LayoutGrid, color: '#38bdf8' },
    { type: 'role', label: 'FS', icon: Folder, color: '#facc15' },
    { type: 'role', label: 'Proxmox', icon: Box, color: '#fb923c' },
    { type: 'role', label: 'VMWare', icon: Box, color: '#38bdf8' },
    { type: 'role', label: 'Hyper-V', icon: Box, color: '#38bdf8' },
    // Services
    { type: 'service', label: 'DB', icon: Database, color: '#38bdf8' },
    { type: 'service', label: 'VOIP', icon: Phone, color: '#4ade80' },
    { type: 'service', label: 'DHCP Pool', icon: DatabaseZap, color: '#facc15' },
    { type: 'service', label: 'DNS', icon: Globe, color: '#38bdf8' },
    { type: 'service', label: 'Grafana', icon: BarChart3, color: '#fb923c' },
    { type: 'service', label: 'Zabbix', icon: Eye, color: '#ef4444' },
    { type: 'service', label: 'Proxy', icon: Globe, color: '#38bdf8' },
    { type: 'service', label: 'Print Server', icon: Printer, color: '#9499ab' },
    { type: 'service', label: 'Docker', icon: Container, color: '#38bdf8' },
    { type: 'custom_service', label: 'Custom App', icon: Plus, color: '#9499ab' },
];

const annotationTypes = [
    { type: 'annotation', label: 'Area (Square)', icon: Square, color: 'var(--accent-blue)' },
    { type: 'annotation', label: 'Area (Circle)', icon: Circle, color: 'var(--accent-purple)' },
    { type: 'annotation', label: 'Text Note', icon: Type, color: 'var(--accent-yellow)' },
];

const Sidebar = ({ onExportPng, onImportPhpIpam }) => {
    const onDragStart = (event, label, dragType) => {
        event.dataTransfer.setData('application/sparkcanvas/type', dragType);
        event.dataTransfer.setData('application/sparkcanvas/label', label);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside style={{ 
            width: '320px', height: 'calc(100vh - 40px)', margin: '20px', 
            background: 'var(--panel-bg)', border: '1px solid var(--panel-border)',
            borderRadius: '16px', display: 'flex', flexDirection: 'column', zIndex: 10,
            overflow: 'hidden', backdropFilter: 'blur(20px)'
        }}>
            <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={logo} alt="Logo" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                <span style={{ fontSize: '1.2rem', fontWeight: '900', letterSpacing: '-0.5px', background: 'linear-gradient(to right, #fff, var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    SparkCanvas
                </span>
            </div>

            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '0 20px 20px' }}>
                <div className="section-label">Hardware Nodes</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '24px' }}>
                    {nodeTypes.map((item) => (
                        <div key={item.type} className="sidebar-item" draggable onDragStart={(e) => onDragStart(e, item.type, 'node')}
                            style={{ 
                                padding: '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'grab', 
                                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)', borderRadius: '12px', transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = item.color}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--panel-border)'}
                        >
                            <div style={{ color: item.color }}><item.icon size={20} /></div>
                            <span style={{ fontSize: '0.7rem', fontWeight: '700', textAlign: 'center' }}>{item.label}</span>
                        </div>
                    ))}
                </div>

                <div className="section-label">Services & Roles</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '24px' }}>
                    {serviceTypes.map((item) => (
                        <div key={item.label} className="sidebar-item" draggable onDragStart={(e) => onDragStart(e, item.label, item.type)}
                            style={{ 
                                padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'grab', 
                                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)', borderRadius: '12px', transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = item.color}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--panel-border)'}
                        >
                            <div style={{ color: item.color }}><item.icon size={18} /></div>
                            <span style={{ fontSize: '0.65rem', fontWeight: '700', textAlign: 'center' }}>{item.label}</span>
                        </div>
                    ))}
                </div>

                <div className="section-label">Annotations</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    {annotationTypes.map((item) => (
                        <div key={item.label} className="sidebar-item" draggable onDragStart={(e) => onDragStart(e, item.label, item.type)}
                            style={{ 
                                padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'grab', 
                                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)', borderRadius: '12px', transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = item.color}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--panel-border)'}
                        >
                            <div style={{ color: item.color }}><item.icon size={18} /></div>
                            <span style={{ fontSize: '0.65rem', fontWeight: '700', textAlign: 'center' }}>{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ padding: '20px', borderTop: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.2)' }}>
                <button onClick={onImportPhpIpam} className="node-action-btn" style={{ width: '100%', padding: '12px', borderColor: 'var(--accent-green)', color: 'var(--accent-green)', background: 'rgba(74, 222, 128, 0.1)' }}>
                    <DatabaseZap size={16} /> Import phpIPAM
                </button>
                <button onClick={onExportPng} className="node-action-btn" style={{ width: '100%', padding: '12px', borderColor: 'var(--accent-blue)', color: 'var(--accent-blue)', background: 'rgba(56, 189, 248, 0.1)' }}>
                    <Download size={16} /> Export Map
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
