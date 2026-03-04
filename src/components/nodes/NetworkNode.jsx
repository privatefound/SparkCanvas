import React, { memo, useState, useEffect, useCallback, useContext } from 'react';
import { Handle, Position, useStore } from '@xyflow/react';
import {
    Router, Server, Monitor, HardDrive, Network, Cpu, Wifi, Database, Box, Zap, Trash2,
    Activity, Layers, Container, Settings, Edit3, Check, Plus, Shield, Globe, Lock,
    Eye, EyeOff, PlusSquare, Laptop, Smartphone, Printer, Radio, Key, DatabaseZap,
    LayoutGrid, Folder, X, Phone
} from 'lucide-react';
import { NodeActionContext } from '../../context/NodeActionContext';

const iconMap = {
    router: Router, server: Server, sbc: Cpu, pc: Monitor, minipc: Monitor, disk: HardDrive,
    switch: Network, nas: Database, ap: Wifi, ups: Box, firewall: Shield, proxy: Globe,
    vpn: Lock, gpu: Zap, pool: DatabaseZap, custom: PlusSquare, laptop: Laptop,
    smartphone: Smartphone, printer: Printer, radio: Radio, key: Key, iot: Cpu,
    ad: LayoutGrid, fs: Folder, proxmox: Box, vmware: Box, hyperv: Box,
    voip: Phone, db: Database, activity: Activity, container: Container, terminal: Settings,
    globe: Globe, shield: Shield, lock: Lock
};

const selectableIcons = [
    'server', 'switch', 'firewall', 'nas', 'ap', 'ups', 'router', 'pc', 'laptop', 'smartphone', 'printer', 'radio', 'key', 'database', 'zap', 'shield', 'lock', 'globe', 'custom', 'iot', 'ad', 'fs', 'voip', 'db', 'activity', 'container', 'terminal'
];

const deviceTypes = [
    { type: 'firewall', label: 'Firewall' },
    { type: 'router', label: 'Router' },
    { type: 'switch', label: 'Switch' },
    { type: 'server', label: 'Server' },
    { type: 'nas', label: 'NAS' },
    { type: 'db', label: 'Database' },
    { type: 'voip', label: 'VOIP' },
    { type: 'ap', label: 'Access Point' },
    { type: 'iot', label: 'IoT' },
    { type: 'ups', label: 'UPS' },
    { type: 'pc', label: 'PC' },
    { type: 'laptop', label: 'Laptop' },
    { type: 'custom', label: 'Custom' },
];

const colorMap = {
    router: '#f472b6', server: '#fb923c', sbc: '#4ade80', pc: '#38bdf8', nas: '#38bdf8',
    ups: '#4ade80', ap: '#facc15', switch: '#38bdf8', firewall: '#ef4444', proxy: '#38bdf8',
    vpn: '#a855f7', pool: '#facc15', custom: '#9499ab', iot: '#4ade80',
    ad: '#38bdf8', fs: '#facc15', db: '#38bdf8', voip: '#4ade80'
};

const NetworkNode = ({ data, selected, id }) => {
    const { onDeleteNode, updateNodeData, toggleNodeEdit } = useContext(NodeActionContext);

    // Performance Optimization: Check zoom level
    const zoom = useStore((s) => s.transform[2]);
    const isConnecting = useStore((s) => !!s.connectionStartHandle);
    
    // Level of Detail Thresholds
    const showDetails = zoom > 0.5 || selected || data.isEditing;
    const highDetail = zoom > 0.8 || selected || data.isEditing;
    const showHandlesStyle = (selected || isConnecting || zoom > 1.0) ? { opacity: 1 } : { opacity: 0, width: '1px', height: '1px' };

    const Icon = iconMap[data.customIcon || data.type] || PlusSquare;
    const accentColor = data.customColor || colorMap[data.type] || '#38bdf8';

    const isEditing = data.isEditing;
    const [editData, setEditData] = useState({ ...data });
    const [newInterface, setNewInterface] = useState({ name: '', ip: '' });
    const [newContainer, setNewContainer] = useState({ name: '', ip: '', port: '' });
    const [isDragOver, setIsDragOver] = useState(false);

    useEffect(() => {
        if (isEditing) setEditData({ ...data });
    }, [isEditing, data]);

    const handleSave = useCallback((e) => {
        if (e) e.stopPropagation();
        updateNodeData(id, { ...editData, isEditing: false });
    }, [id, editData, updateNodeData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const addInterface = (e) => {
        e.stopPropagation();
        if (newInterface.name && newInterface.ip) {
            setEditData(prev => ({ ...prev, interfaces: [...(prev.interfaces || []), { ...newInterface }] }));
            setNewInterface({ name: '', ip: '' });
        }
    };

    const addContainer = (e) => {
        e.stopPropagation();
        if (newContainer.name) {
            setEditData(prev => ({ ...prev, containers: [...(prev.containers || []), { ...newContainer, status: 'online' }] }));
            setNewContainer({ name: '', ip: '', port: '' });
        }
    };

    const onDropService = (e) => {
        setIsDragOver(false);
        const type = e.dataTransfer.getData('application/sparkcanvas/type');
        const label = e.dataTransfer.getData('application/sparkcanvas/label');
        
        if (type && label && type !== 'node') {
            e.preventDefault();
            e.stopPropagation();
            
            if (type === 'role') {
                const updatedRoles = [...(data.roles || []), label];
                updateNodeData(id, { ...data, roles: updatedRoles });
            } else if (label === 'DHCP Pool') {
                updateNodeData(id, { ...data, dhcpPool: '192.168.x.x - .x' });
            } else if (type === 'custom_service') {
                const customName = window.prompt("Enter Custom App Name:", "My App");
                if (customName === null) return;
                const name = customName.trim() || 'Custom App';
                const updatedContainers = [...(data.containers || []), { name, ip: '', port: '8080', status: 'online', customIcon: 'plus' }];
                updateNodeData(id, { ...data, containers: updatedContainers, isEditing: true });
            } else {
                const port = label === 'DNS' ? '53' : (label === 'DHCP Pool' ? '67' : '80');
                const updatedContainers = [...(data.containers || []), { name: label, ip: '', port, status: 'online' }];
                updateNodeData(id, { ...data, containers: updatedContainers });
            }
        }
    };

    const onDragOver = (e) => {
        if (e.dataTransfer.types.includes('application/sparkcanvas/type')) {
            e.preventDefault();
            setIsDragOver(true);
        }
    };

    const isHardwareCapable = data.type === 'server' || data.type === 'firewall' || data.type === 'nas' || data.type === 'sbc' || data.type === 'pc' || data.type === 'minipc';

    return (
        <div 
            className={`tech-node ${selected ? 'selected' : ''}`} 
            style={{ 
                borderColor: isDragOver ? 'var(--accent-green)' : (isEditing ? 'var(--accent-blue)' : accentColor),
                boxShadow: isDragOver ? '0 0 20px rgba(74, 222, 128, 0.4)' : undefined,
                transform: isDragOver ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                minHeight: highDetail ? 'auto' : '50px'
            }}
            onDragOver={onDragOver}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={onDropService}
        >
            {/* Optimized Handles: Always present but hidden when not needed */}
            {(data.interfaces || []).map((ni, index) => {
                const offset = (index - (data.interfaces.length - 1) / 2) * 24;
                const handleStyle = { 
                    left: `calc(50% + ${offset}px)`, 
                    background: accentColor, 
                    border: '2px solid var(--node-bg)',
                    transition: 'opacity 0.2s',
                    ...showHandlesStyle 
                };
                return (
                    <React.Fragment key={`h-${index}`}>
                        <Handle type="target" position={Position.Top} id={`in-t-${ni.name}-${index}`} style={{ ...handleStyle, width: '10px', height: '10px' }} />
                        <Handle type="source" position={Position.Top} id={`out-t-${ni.name}-${index}`} style={{ ...handleStyle, opacity: 0 }} />
                        <Handle type="source" position={Position.Bottom} id={`out-b-${ni.name}-${index}`} style={{ ...handleStyle, width: '10px', height: '10px' }} />
                        <Handle type="target" position={Position.Bottom} id={`in-b-${ni.name}-${index}`} style={{ ...handleStyle, opacity: 0 }} />
                    </React.Fragment>
                );
            })}

            <div className="node-header" style={{ minHeight: '45px' }}>
                <div style={{ color: accentColor, display: 'flex', flexShrink: 0 }}><Icon size={showDetails ? 18 : 24} /></div>
                <div style={{ flexGrow: 1, minWidth: 0, paddingRight: isEditing ? '0' : '8px' }}>
                    {isEditing ? (
                        <input name="label" value={editData.label} onChange={handleChange} className="tech-input" style={{ width: 'calc(100% - 5px)', fontSize: '0.85rem', fontWeight: '700', boxSizing: 'border-box' }} />
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                            <div style={{ fontWeight: '700', fontSize: showDetails ? '0.95rem' : '1.1rem', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.label}</div>
                            {highDetail && (
                                <div style={{ display: 'flex', gap: '3px' }}>
                                    {(data.roles || []).map((role, ri) => {
                                        const roleInfo = { 'AD': { icon: LayoutGrid, color: '#38bdf8' }, 'FS': { icon: Folder, color: '#facc15' }, 'Proxmox': { icon: Box, color: '#fb923c' }, 'VMWare': { icon: Box, color: '#38bdf8' }, 'Hyper-V': { icon: Box, color: '#38bdf8' } }[role] || { icon: Box, color: 'var(--text-secondary)' };
                                        return (
                                            <div key={ri} title={role} style={{ background: `${roleInfo.color}22`, border: `1px solid ${roleInfo.color}44`, borderRadius: '4px', padding: '2px 4px', display: 'flex', alignItems: 'center', color: roleInfo.color }}>
                                                <roleInfo.icon size={10} />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {highDetail && (
                    <div style={{ display: 'flex', gap: '4px', marginRight: '8px' }}>
                        {isEditing ? <button onClick={handleSave} className="node-action-btn"><Check size={12} color="var(--accent-green)" /></button> : <button onClick={(e) => { e.stopPropagation(); toggleNodeEdit(id); }} className="node-action-btn"><Edit3 size={12} /></button>}
                        <button onClick={(e) => { e.stopPropagation(); onDeleteNode(id); }} className="node-action-btn delete"><Trash2 size={12} /></button>
                    </div>
                )}
                <div className="node-status-dot" style={{ background: data.status === 'online' ? 'var(--accent-green)' : 'var(--text-secondary)' }} />
            </div>

            {highDetail && (
                <div style={{ padding: '16px' }}>
                    {isEditing && (data.roles?.length > 0 || data.type === 'server') && (
                        <div style={{ marginBottom: '16px' }}>
                            <span className="section-label">Active Roles</span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {(editData.roles || []).map((role, ri) => (
                                    <div key={ri} className="container-card" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>
                                        <span>{role}</span>
                                        <button onClick={() => setEditData(p => ({ ...p, roles: p.roles.filter((_, idx) => idx !== ri) }))} style={{ background: 'transparent', border: 'none', color: 'var(--danger-red)', cursor: 'pointer' }}><Trash2 size={10} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', gap: '8px' }}>
                        <span className="section-label" style={{ marginBottom: 0 }}>Device Type</span>
                        {isEditing ? <select name="type" value={editData.type} onChange={handleChange} className="tech-input" style={{ width: '110px' }}>{deviceTypes.map(dt => <option key={dt.type} value={dt.type}>{dt.label}</option>)}</select> : <span style={{ fontSize: '0.65rem', fontWeight: '800', color: accentColor }}>{data.type || 'server'}</span>}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                        {isEditing ? <input name="model" value={editData.model} onChange={handleChange} className="tech-input" style={{ width: '100%', boxSizing: 'border-box' }} /> : (data.model || 'Generic Device')}
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <span className="section-label">Interfaces</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {(isEditing ? (editData.interfaces || []) : (data.interfaces || [])).map((ni, i) => (
                                <div key={i} className="container-card" style={{ padding: '6px 8px', flexDirection: 'column', alignItems: 'stretch' }}>
                                    {isEditing ? (
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <input value={ni.name} onChange={(e) => setEditData(p => ({ ...p, interfaces: p.interfaces.map((item, idx) => idx === i ? { ...item, name: e.target.value.toUpperCase() } : item) }))} className="tech-input" style={{ width: '35%' }} />
                                            <input value={ni.ip} onChange={(e) => setEditData(p => ({ ...p, interfaces: p.interfaces.map((item, idx) => idx === i ? { ...item, ip: e.target.value } : item) }))} className="tech-input" style={{ flexGrow: 1 }} />
                                            <button onClick={() => setEditData(p => ({ ...p, interfaces: p.interfaces.filter((_, idx) => idx !== i) }))} style={{ background: 'transparent', border: 'none', color: '#ef4444' }}><Trash2 size={10} /></button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: '800', color: accentColor }}>{ni.name}</span>
                                            <span style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{ni.ip}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isEditing && (
                                <div style={{ marginTop: '8px', padding: '6px', border: '1px dashed var(--panel-border)', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                                        <input placeholder="NIC" value={newInterface.name} onChange={(e) => setNewInterface({ ...newInterface, name: e.target.value.toUpperCase() })} className="tech-input" style={{ width: '40%' }} />
                                        <input placeholder="IP" value={newInterface.ip} onChange={(e) => setNewInterface({ ...newInterface, ip: e.target.value })} className="tech-input" style={{ flexGrow: 1 }} />
                                    </div>
                                    <button onClick={addInterface} style={{ width: '100%', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-blue)', border: 'none', borderRadius: '4px', padding: '4px', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 'bold' }}>ADD</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {((isEditing ? editData.dhcpPool : data.dhcpPool)) && (
                        <div style={{ marginBottom: '16px', padding: '10px', background: 'rgba(242, 204, 21, 0.05)', border: '1px solid rgba(242, 204, 21, 0.2)', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><DatabaseZap size={14} color="var(--accent-yellow)" /><span className="section-label" style={{ color: 'var(--accent-yellow)', marginBottom: 0 }}>DHCP Pool</span></div>
                            {isEditing ? <input name="dhcpPool" value={editData.dhcpPool || ''} onChange={handleChange} className="tech-input" style={{ width: '100%' }} /> : <div style={{ fontSize: '0.8rem', fontWeight: '700', fontFamily: 'monospace' }}>{data.dhcpPool}</div>}
                        </div>
                    )}

                    {((isEditing ? (editData.containers?.length > 0) : (data.containers?.length > 0)) || isEditing) && (
                        <div style={{ marginTop: '10px' }}>
                            <span className="section-label">Containers / Apps</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {(isEditing ? (editData.containers || []) : (data.containers || [])).map((c, i) => (
                                    <div key={i} className="container-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.status === 'offline' ? 'var(--danger-red)' : 'var(--accent-green)' }} />
                                                {(() => { const CIcon = iconMap[c.customIcon] || (c.name === 'DB' ? Database : (c.name === 'VOIP' ? Phone : (c.name === 'Docker' ? Container : (c.name === 'Proxy' ? Globe : Box)))); return <CIcon size={12} color="var(--text-secondary)" />; })()}
                                                <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>{c.name}</span>
                                            </div>
                                            {isEditing && <button onClick={() => setEditData(p => ({ ...p, containers: p.containers.filter((_, idx) => idx !== i) }))} style={{ background: 'transparent', border: 'none', color: '#ef4444' }}><Trash2 size={10} /></button>}
                                        </div>
                                        {isEditing ? <input placeholder="Port" value={c.port} onChange={(e) => { const v = e.target.value; setEditData(p => ({ ...p, containers: p.containers.map((item, idx) => idx === i ? { ...item, port: v } : item) })); }} className="tech-input" style={{ width: '100%' }} /> : <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Port: {c.port}</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default memo(NetworkNode);
