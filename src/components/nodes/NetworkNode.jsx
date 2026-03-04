import React, { memo, useState, useEffect, useCallback, useContext } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
    Router, Server, Monitor, HardDrive, Network, Cpu, Wifi, Database, Box, Zap, Trash2,
    Activity, Layers, Container, Settings, Edit3, Check, Plus, Shield, Globe, Lock,
    Eye, EyeOff, PlusSquare, Laptop, Smartphone, Printer, Radio, Key, DatabaseZap,
    LayoutGrid, Folder, X, Phone
} from 'lucide-react';
import { NodeActionContext } from '../../App';

const iconMap = {
    router: Router, server: Server, sbc: Cpu, pc: Monitor, minipc: Monitor, disk: HardDrive,
    switch: Network, nas: Database, ap: Wifi, ups: Box, firewall: Shield, proxy: Globe,
    vpn: Lock, gpu: Zap, pool: DatabaseZap, custom: PlusSquare, laptop: Laptop,
    smartphone: Smartphone, printer: Printer, radio: Radio, key: Key, iot: Cpu,
    ad: LayoutGrid, fs: Folder, proxmox: Box, vmware: Box, hyperv: Box,
    voip: Phone, db: Database
};

const selectableIcons = [
    'server', 'switch', 'firewall', 'nas', 'ap', 'ups', 'router', 'pc', 'laptop', 'smartphone', 'printer', 'radio', 'key', 'database', 'zap', 'shield', 'lock', 'globe', 'custom', 'iot', 'ad', 'fs', 'voip', 'db'
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
    const { onDeleteNode, updateNodeData, editingNodeId, setEditingNodeId } = useContext(NodeActionContext);

    const Icon = iconMap[data.customIcon || data.type] || PlusSquare;
    const accentColor = data.customColor || colorMap[data.type] || '#38bdf8';

    const isEditing = editingNodeId === id;
    const [editData, setEditData] = useState({ ...data });
    const [newInterface, setNewInterface] = useState({ name: '', ip: '' });
    const [newContainer, setNewContainer] = useState({ name: '', ip: '', port: '' });
    const [isDragOver, setIsDragOver] = useState(false);

    // Sync internal state when entering edit mode
    useEffect(() => {
        if (isEditing) setEditData({ ...data });
    }, [isEditing, data]);

    const handleSave = useCallback((e) => {
        if (e) e.stopPropagation();
        updateNodeData(id, editData);
        setEditingNodeId(null);
    }, [id, editData, updateNodeData, setEditingNodeId]);

    const handleCancel = useCallback((e) => {
        if (e) e.stopPropagation();
        setEditingNodeId(null);
    }, [setEditingNodeId]);

    const onDropService = (e) => {
        setIsDragOver(false);
        const serviceName = e.dataTransfer.getData('application/sparkcanvas/service');
        const roleName = e.dataTransfer.getData('application/sparkcanvas/role');
        
        if (serviceName || roleName) {
            e.preventDefault();
            e.stopPropagation();
            
            if (roleName) {
                const updatedRoles = [...(data.roles || []), roleName];
                updateNodeData(id, { ...data, roles: updatedRoles });
                if (isEditing) setEditData(prev => ({ ...prev, roles: updatedRoles }));
            } else if (serviceName === 'DHCP Pool') {
                updateNodeData(id, { ...data, dhcpPool: '192.168.x.x - .x' });
                if (isEditing) setEditData(prev => ({ ...prev, dhcpPool: '192.168.x.x - .x' }));
            } else {
                const updatedContainers = [...(data.containers || []), { name: serviceName, ip: '', port: '80', status: 'online' }];
                updateNodeData(id, { ...data, containers: updatedContainers });
                if (isEditing) setEditData(prev => ({ ...prev, containers: updatedContainers }));
            }
        }
    };

    const onDragOver = (e) => {
        if (e.dataTransfer.types.includes('application/sparkcanvas/service') || 
            e.dataTransfer.types.includes('application/sparkcanvas/role')) {
            e.preventDefault();
            setIsDragOver(true);
        }
    };

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

    const isHardwareCapable = data.type === 'server' || data.type === 'firewall' || data.type === 'nas' || data.type === 'sbc' || data.type === 'pc' || data.type === 'minipc';

    return (
        <div 
            className={`tech-node ${selected ? 'selected' : ''}`} 
            style={{ 
                borderColor: isDragOver ? 'var(--accent-green)' : (isEditing ? 'var(--accent-blue)' : accentColor),
                boxShadow: isDragOver ? '0 0 20px rgba(74, 222, 128, 0.4)' : undefined,
                transform: isDragOver ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onDragOver={onDragOver}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={onDropService}
        >
            <Handle type="target" position={Position.Top} style={{ background: accentColor }} />

            <div className="node-header">
                <div style={{ color: accentColor, display: 'flex' }}><Icon size={18} /></div>
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                    {isEditing ? (
                        <input name="label" value={editData.label} onChange={handleChange} className="tech-input" style={{ width: '100%', fontSize: '0.85rem', fontWeight: '700' }} />
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                            <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.label}</div>
                            <div style={{ display: 'flex', gap: '3px' }}>
                                {(data.roles || []).map((role, ri) => {
                                    const roleInfo = {
                                        'AD': { icon: LayoutGrid, color: '#38bdf8' },
                                        'FS': { icon: Folder, color: '#facc15' },
                                        'Proxmox': { icon: Box, color: '#fb923c' },
                                        'VMWare': { icon: Box, color: '#38bdf8' },
                                        'Hyper-V': { icon: Box, color: '#38bdf8' }
                                    }[role] || { icon: Box, color: 'var(--text-secondary)' };
                                    return (
                                        <div key={ri} title={role} style={{ 
                                            background: `${roleInfo.color}22`, 
                                            border: `1px solid ${roleInfo.color}44`,
                                            borderRadius: '4px',
                                            padding: '2px 4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            color: roleInfo.color,
                                            position: 'relative'
                                        }}>
                                            <roleInfo.icon size={10} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '4px', marginRight: '8px', paddingLeft: '4%' }}>
                    {isEditing ? (
                        <button onClick={handleSave} className="node-action-btn" title="Save"><Check size={12} color="var(--accent-green)" /></button>
                    ) : (
                        <button onClick={(e) => { e.stopPropagation(); setEditingNodeId(id); }} className="node-action-btn" title="Edit"><Edit3 size={12} /></button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); onDeleteNode(id); }} className="node-action-btn delete" title="Delete"><Trash2 size={12} /></button>
                </div>
                <div className="node-status-dot" style={{ background: data.status === 'online' ? 'var(--accent-green)' : 'var(--text-secondary)' }} />
            </div>

            <div style={{ padding: '16px' }}>
                {isEditing && (data.roles?.length > 0 || data.type === 'server') && (
                    <div style={{ marginBottom: '16px' }}>
                        <span className="section-label">Active Roles</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {(editData.roles || []).map((role, ri) => (
                                <div key={ri} style={{ 
                                    background: 'rgba(255,255,255,0.05)', 
                                    border: '1px solid var(--panel-border)', 
                                    borderRadius: '6px', 
                                    padding: '4px 8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '0.7rem'
                                }}>
                                    <span>{role}</span>
                                    <button onClick={(e) => {
                                        e.stopPropagation();
                                        setEditData(p => ({ ...p, roles: p.roles.filter((_, idx) => idx !== ri) }));
                                    }} style={{ background: 'transparent', border: 'none', color: 'var(--danger-red)', cursor: 'pointer', padding: 0 }}><Trash2 size={10} /></button>
                                </div>
                            ))}
                            {(editData.roles?.length === 0 || !editData.roles) && <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Drag roles here to assign</div>}
                        </div>
                    </div>
                )}
                {isEditing && data.type === 'custom' && (
                    <div style={{ marginBottom: '16px' }}>
                        <span className="section-label">Select Icon</span>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '8px' }}>
                            {selectableIcons.map(iconName => {
                                const SelectionIcon = iconMap[iconName] || PlusSquare;
                                return (
                                    <div 
                                        key={iconName}
                                        onClick={() => setEditData(prev => ({ ...prev, customIcon: iconName }))}
                                        style={{ 
                                            cursor: 'pointer', 
                                            padding: '4px', 
                                            borderRadius: '4px',
                                            background: editData.customIcon === iconName ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            color: editData.customIcon === iconName ? 'var(--accent-blue)' : 'var(--text-secondary)'
                                        }}
                                    >
                                        <SelectionIcon size={14} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="section-label">Device Type</span>
                    {isEditing ? (
                        <select name="type" value={editData.type} onChange={handleChange} className="tech-input" style={{ width: '120px', fontSize: '0.65rem' }}>
                            {deviceTypes.map(dt => (
                                <option key={dt.type} value={dt.type}>{dt.label}</option>
                            ))}
                        </select>
                    ) : (
                        <span style={{ fontSize: '0.65rem', fontWeight: '800', color: accentColor, textTransform: 'uppercase' }}>{data.type || 'server'}</span>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="section-label">Status</span>
                    {isEditing ? (
                        <select name="status" value={editData.status} onChange={handleChange} className="tech-input" style={{ width: '100px', fontSize: '0.65rem' }}>
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                        </select>
                    ) : (
                        <span style={{ fontSize: '0.65rem', fontWeight: '800', color: data.status === 'online' ? 'var(--accent-green)' : 'var(--text-secondary)', textTransform: 'uppercase' }}>{data.status || 'online'}</span>
                    )}
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    {isEditing ? <input name="model" value={editData.model} onChange={handleChange} className="tech-input" style={{ width: '100%' }} placeholder="Device Model" /> : (data.model || 'Generic Device')}
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <span className="section-label">Interfaces</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {(isEditing ? (editData.interfaces || []) : (data.interfaces || [])).map((ni, i) => (
                            <div key={i} className="container-card" style={{ padding: '4px 8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '0.65rem', fontWeight: '800', color: accentColor }}>{ni.name}</span>
                                    <span style={{ fontSize: '0.8rem', fontWeight: '700', fontFamily: 'monospace' }}>{ni.ip}</span>
                                </div>
                                {isEditing && <button onClick={(e) => { e.stopPropagation(); setEditData(p => ({ ...p, interfaces: p.interfaces.filter((_, idx) => idx !== i) })); }} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={10} /></button>}
                            </div>
                        ))}
                        {isEditing && (
                            <div style={{ marginTop: '8px', padding: '6px', border: '1px dashed var(--panel-border)', borderRadius: '8px', background: 'rgba(0,0,0,0.1)' }}>
                                <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                                    <input placeholder="NIC" value={newInterface.name} onChange={(e) => setNewInterface({ ...newInterface, name: e.target.value.toUpperCase() })} className="tech-input" style={{ width: '40%' }} />
                                    <input placeholder="IP" value={newInterface.ip} onChange={(e) => setNewInterface({ ...newInterface, ip: e.target.value })} className="tech-input" style={{ flexGrow: 1 }} />
                                </div>
                                <button onClick={addInterface} style={{ width: '100%', background: 'rgba(56, 189, 248, 0.1)', border: 'none', color: 'var(--accent-blue)', borderRadius: '4px', padding: '4px', cursor: 'pointer', fontSize: '0.65rem', fontWeight: '800' }}>ADD</button>
                            </div>
                        )}
                    </div>
                </div>

                {((isEditing ? editData.dhcpPool : data.dhcpPool)) && (
                    <div style={{ marginBottom: '16px', padding: '10px', background: 'rgba(242, 204, 21, 0.05)', border: '1px solid rgba(242, 204, 21, 0.2)', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <DatabaseZap size={14} color="var(--accent-yellow)" />
                                <span className="section-label" style={{ color: 'var(--accent-yellow)', marginBottom: 0 }}>DHCP Pool</span>
                            </div>
                            {isEditing && (
                                <button 
                                    onClick={(e) => { 
                                        e.preventDefault();
                                        e.stopPropagation(); 
                                        setEditData(prev => ({ ...prev, dhcpPool: '' })); 
                                    }} 
                                    style={{ 
                                        background: 'rgba(239, 68, 68, 0.1)', 
                                        border: '1px solid rgba(239, 68, 68, 0.2)', 
                                        color: 'var(--danger-red)', 
                                        cursor: 'pointer', 
                                        padding: '2px', 
                                        borderRadius: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        pointerEvents: 'auto'
                                    }}
                                    title="Clear DHCP Pool"
                                >
                                    <Trash2 size={10} />
                                </button>
                            )}
                        </div>
                        {isEditing ? (
                            <input 
                                name="dhcpPool" 
                                value={editData.dhcpPool || ''} 
                                onChange={handleChange} 
                                className="tech-input" 
                                style={{ width: '100%', boxSizing: 'border-box' }} 
                                placeholder="e.g. 192.168.1.10 - .50"
                            />
                        ) : (
                            data.dhcpPool ? (
                                <div style={{ fontSize: '0.8rem', fontWeight: '700', fontFamily: 'monospace', wordBreak: 'break-all' }}>{data.dhcpPool}</div>
                            ) : (
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>None</div>
                            )
                        )}
                    </div>
                )}

                {(isEditing || data.showStats) && isHardwareCapable && (
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span className="section-label" style={{ marginBottom: 0 }}>Hardware Stats</span>
                            {isEditing && <input type="checkbox" name="showStats" checked={editData.showStats} onChange={handleChange} />}
                        </div>
                        {(isEditing ? editData.showStats : data.showStats) && (
                            <div style={{ display: 'flex', gap: '8px', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
                                {isEditing ? (
                                    <>
                                        <input name="cores" value={editData.cores} onChange={handleChange} className="tech-input" style={{ width: '30%' }} />
                                        <input name="ram" value={editData.ram} onChange={handleChange} className="tech-input" style={{ width: '35%' }} />
                                        <input name="disk" value={editData.disk} onChange={handleChange} className="tech-input" style={{ width: '35%' }} />
                                    </>
                                ) : (
                                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'white', display: 'flex', justifyContent: 'space-around', width: '100%' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><span style={{ color: 'var(--text-secondary)', fontSize: '0.6rem' }}>CPU</span><span>{data.cores || 0}</span></div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><span style={{ color: 'var(--text-secondary)', fontSize: '0.6rem' }}>RAM</span><span>{data.ram || '0'}</span></div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><span style={{ color: 'var(--text-secondary)', fontSize: '0.6rem' }}>DISK</span><span>{data.disk || '0'}</span></div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {((isEditing ? (editData.containers?.length > 0) : (data.containers?.length > 0)) || isEditing) && (
                    <div style={{ marginTop: '10px' }}>
                        <span className="section-label">Containers / Apps</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {(isEditing ? (editData.containers || []) : (data.containers || [])).map((c, i) => (
                                <div key={i} className="container-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.status === 'offline' ? 'var(--danger-red)' : 'var(--accent-green)' }} />
                                            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'white' }}>{c.name}</span>
                                        </div>
                                        {(isEditing || selected) && (
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                {isEditing && <button onClick={(e) => { e.stopPropagation(); setEditData(p => ({ ...p, containers: p.containers.map((item, idx) => idx === i ? { ...item, status: item.status === 'offline' ? 'online' : 'offline' } : item) })); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} title="Toggle Status"><Activity size={10} /></button>}
                                                <button onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    if (isEditing) {
                                                        setEditData(p => ({ ...p, containers: p.containers.filter((_, idx) => idx !== i) }));
                                                    } else {
                                                        updateNodeData(id, { ...data, containers: data.containers.filter((_, idx) => idx !== i) });
                                                    }
                                                }} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={10} /></button>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {isEditing ? (
                                        <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
                                            <input placeholder="IP" value={c.ip} onChange={(e) => { const v = e.target.value; setEditData(p => ({ ...p, containers: p.containers.map((item, idx) => idx === i ? { ...item, ip: v } : item) })); }} className="tech-input" style={{ flexGrow: 1, fontSize: '0.65rem' }} />
                                            <input placeholder="Port" value={c.port} onChange={(e) => { const v = e.target.value; setEditData(p => ({ ...p, containers: p.containers.map((item, idx) => idx === i ? { ...item, port: v } : item) })); }} className="tech-input" style={{ width: '40px', fontSize: '0.65rem' }} />
                                        </div>
                                    ) : (
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'monospace', marginLeft: '14px' }}>
                                            {c.ip || '*'}:{c.port || '??'}
                                        </span>
                                    )}
                                </div>
                            ))}
                            {isEditing && (
                                <div style={{ marginTop: '10px', border: '1px dashed var(--panel-border)', padding: '10px', borderRadius: '8px' }}>
                                    <input placeholder="Name" value={newContainer.name} onChange={(e) => setNewContainer({ ...newContainer, name: e.target.value })} className="tech-input" style={{ width: '100%', marginBottom: '4px' }} />
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <input placeholder="IP (optional)" value={newContainer.ip} onChange={(e) => setNewContainer({ ...newContainer, ip: e.target.value })} className="tech-input" style={{ flexGrow: 1 }} />
                                        <input placeholder="Port" value={newContainer.port} onChange={(e) => setNewContainer({ ...newContainer, port: e.target.value })} className="tech-input" style={{ width: '60px' }} />
                                    </div>
                                    <button onClick={addContainer} style={{ width: '100%', background: 'var(--accent-blue)', border: 'none', color: 'white', borderRadius: '4px', padding: '4px', marginTop: '4px' }}><Plus size={14} /></button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <Handle type="source" position={Position.Bottom} style={{ background: accentColor }} />
        </div>
    );
};

export default memo(NetworkNode);
