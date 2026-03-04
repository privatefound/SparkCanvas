import React, { useState } from 'react';
import {
    Router,
    Server,
    Monitor,
    HardDrive,
    Network,
    Cpu,
    Wifi,
    Database,
    Box,
    Zap,
    Download,
    Terminal,
    Search,
    DatabaseZap,
    Shield,
    Globe,
    Lock,
    Settings2,
    PlusSquare,
    ShieldCheck,
    Activity,
    BarChart3,
    Eye,
    HeartPulse,
    Container,
    Printer,
    LayoutGrid,
    Folder
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
    { type: 'dhcp', label: 'DHCP Pool', icon: DatabaseZap, color: '#facc15' },
    { type: 'dns', label: 'DNS', icon: Globe, color: '#38bdf8' },
    { type: 'pihole', label: 'Pi-hole', icon: ShieldCheck, color: '#ef4444' },
    { type: 'netdata', label: 'Netdata', icon: Activity, color: '#4ade80' },
    { type: 'grafana', label: 'Grafana', icon: BarChart3, color: '#fb923c' },
    { type: 'zabbix', label: 'Zabbix', icon: Eye, color: '#ef4444' },
    { type: 'uptimekuma', label: 'Uptime Kuma', icon: HeartPulse, color: '#38bdf8' },
    { type: 'printserver', label: 'Print Server', icon: Printer, color: '#9499ab' },
    { type: 'docker', label: 'Docker', icon: Container, color: '#38bdf8' },
];

const roleTypes = [
    { type: 'ad', label: 'AD', icon: LayoutGrid, color: '#38bdf8' },
    { type: 'fs', label: 'FS', icon: Folder, color: '#facc15' },
    { type: 'proxmox', label: 'Proxmox', icon: Box, color: '#fb923c' },
    { type: 'vmware', label: 'VMWare', icon: Box, color: '#38bdf8' },
    { type: 'hyperv', label: 'Hyper-V', icon: Box, color: '#38bdf8' },
];

const Sidebar = ({ onExportPng, onImportPhpIpam }) => {
    const onDragStart = (event, type, dragType = 'node') => {
        if (dragType === 'service') {
            event.dataTransfer.setData('application/sparkcanvas/service', type);
        } else if (dragType === 'role') {
            event.dataTransfer.setData('application/sparkcanvas/role', type);
        } else {
            event.dataTransfer.setData('application/reactflow', type);
        }
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside style={{ 
            width: '320px', 
            height: 'calc(100vh - 40px)', 
            margin: '20px', 
            background: 'var(--panel-bg)',
            border: '1px solid var(--panel-border)',
            borderRadius: '16px',
            display: 'flex', 
            flexDirection: 'column', 
            zIndex: 10,
            overflow: 'hidden',
            backdropFilter: 'blur(20px)'
        }}>
            {/* Logo Section */}
            <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ 
                        background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', 
                        padding: '6px', 
                        borderRadius: '8px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        boxShadow: '0 0 15px rgba(56, 189, 248, 0.3)'
                    }}>
                        <Zap size={18} color="white" fill="white" />
                    </div>
                    <span style={{ fontSize: '1.2rem', fontWeight: '900', letterSpacing: '-0.5px', background: 'linear-gradient(to right, #fff, var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        SparkCanvas
                    </span>
                </div>
            </div>

            <div style={{ padding: '0 20px 16px' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Search size={14} color="var(--text-secondary)" />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Search devices...</span>
                </div>
            </div>

            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '0 20px 20px' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '16px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Device Library
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '24px' }}>
                    {nodeTypes.map((item) => (
                        <div
                            key={item.type}
                            style={{ 
                                padding: '16px 8px', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                gap: '8px', 
                                cursor: 'grab', 
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid var(--panel-border)',
                                borderRadius: '12px',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                            onDragStart={(event) => onDragStart(event, item.type, 'node')}
                            draggable
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = item.color;
                                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--panel-border)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                e.currentTarget.style.transform = 'none';
                            }}
                        >
                            <div style={{ color: item.color }}><item.icon size={20} /></div>
                            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'white', textAlign: 'center' }}>{item.label}</span>
                        </div>
                    ))}
                </div>

                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '16px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Server Roles
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '24px' }}>
                    {roleTypes.map((item) => (
                        <div
                            key={item.type}
                            style={{ 
                                padding: '12px 8px', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                gap: '6px', 
                                cursor: 'grab', 
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid var(--panel-border)',
                                borderRadius: '12px',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                            onDragStart={(event) => onDragStart(event, item.label, 'role')}
                            draggable
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = item.color;
                                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--panel-border)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                            }}
                        >
                            <div style={{ color: item.color }}><item.icon size={18} /></div>
                            <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'white', textAlign: 'center' }}>{item.label}</span>
                        </div>
                    ))}
                </div>

                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '16px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Services
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '24px' }}>
                    {serviceTypes.map((item) => (
                        <div
                            key={item.type}
                            style={{ 
                                padding: '12px 8px', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                gap: '6px', 
                                cursor: 'grab', 
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid var(--panel-border)',
                                borderRadius: '12px',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                            onDragStart={(event) => onDragStart(event, item.label, 'service')}
                            draggable
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = item.color;
                                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--panel-border)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                            }}
                        >
                            <div style={{ color: item.color }}><item.icon size={18} /></div>
                            <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'white', textAlign: 'center' }}>{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ padding: '20px', borderTop: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.2)' }}>
                <button
                    onClick={onImportPhpIpam}
                    style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '12px',
                        background: 'rgba(74, 222, 128, 0.1)',
                        border: '1px solid var(--accent-green)',
                        color: 'var(--accent-green)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        transition: 'all 0.2s'
                    }}
                >
                    <DatabaseZap size={16} />
                    Import phpIPAM
                </button>
                <button
                    onClick={onExportPng}
                    style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '12px',
                        background: 'rgba(56, 189, 248, 0.1)',
                        border: '1px solid var(--accent-blue)',
                        color: 'var(--accent-blue)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        transition: 'all 0.2s'
                    }}
                >
                    <Download size={16} />
                    Export Map
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
