import React, { useState, useCallback, useRef, useEffect, createContext, useContext } from 'react';
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  applyEdgeChanges,
  applyNodeChanges,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toPng } from 'html-to-image';
import { v4 as uuidv4 } from 'uuid';
import {
  Edit3, Trash2, X, DatabaseZap, FileUp,
  RotateCcw, RotateCw, Save, Layers,
  Plus, ChevronDown, Upload, FileSpreadsheet, Info, CheckCircle,
  Loader2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import axios from 'axios';

import Sidebar from './components/Sidebar';

const API_BASE = '/api';

const saveMaps = async (maps) => {
  try {
    await axios.post(`${API_BASE}/maps`, maps);
  } catch (e) {
    console.error("Error saving maps to SQLite", e);
    throw e;
  }
};

const loadMaps = async () => {
  try {
    const res = await axios.get(`${API_BASE}/maps`);
    return res.data;
  } catch (e) {
    console.error("Error loading maps from SQLite", e);
    return null;
  }
};
import NetworkNode from './components/nodes/NetworkNode';

// --- Context for Node Actions ---
export const NodeActionContext = createContext(null);

const nodeTypes = {
  networkNode: NetworkNode,
};

// --- TopBar Component ---
const TopBar = ({
  currentMap, maps, onMapChange, onNewMap, onSave, onDeleteMap,
  onUndo, onRedo, canUndo, canRedo
}) => (
  <div className="top-bar" style={{
    position: 'absolute', top: 20, left: 360, right: 20, height: '60px',
    background: 'var(--panel-bg)', border: '1px solid var(--panel-border)',
    borderRadius: '12px', zIndex: 10, display: 'flex', alignItems: 'center', padding: '0 20px', gap: '15px', backdropFilter: 'blur(10px)'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRight: '1px solid var(--panel-border)', paddingRight: '15px' }}>
      <Layers size={18} color="var(--accent-blue)" />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <select
          value={currentMap}
          onChange={(e) => onMapChange(e.target.value)}
          style={{ 
            background: 'rgba(255,255,255,0.05)', 
            border: '1px solid var(--panel-border)', 
            color: 'white', 
            fontWeight: 'bold', 
            fontSize: '0.8rem', 
            outline: 'none', 
            cursor: 'pointer',
            padding: '6px 30px 6px 12px',
            borderRadius: '20px',
            appearance: 'none',
            WebkitAppearance: 'none',
            minWidth: '140px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
          onMouseLeave={(e) => e.target.style.borderColor = 'var(--panel-border)'}
        >
          {Object.keys(maps).map(m => (
            <option key={m} value={m} style={{ background: '#1a1b1e', color: 'white' }}>
              {m.toUpperCase()}
            </option>
          ))}
        </select>
        <ChevronDown size={14} style={{ position: 'absolute', right: '12px', pointerEvents: 'none', color: 'var(--text-secondary)' }} />
      </div>
      <button onClick={onNewMap} className="node-action-btn" title="New Map" style={{ borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></button>
      {Object.keys(maps).length > 1 && (
        <button onClick={onDeleteMap} className="node-action-btn delete" title="Delete Current Map" style={{ borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={14} /></button>
      )}
    </div>

    <div style={{ display: 'flex', gap: '8px', borderRight: '1px solid var(--panel-border)', paddingRight: '15px' }}>
      <button onClick={onUndo} disabled={!canUndo} className="node-action-btn" title="Undo"><RotateCcw size={16} opacity={canUndo ? 1 : 0.3} /></button>
      <button onClick={onRedo} disabled={!canRedo} className="node-action-btn" title="Redo"><RotateCw size={16} opacity={canRedo ? 1 : 0.3} /></button>
    </div>

    <div style={{ marginLeft: 'auto' }}>
      <button onClick={onSave} className="node-action-btn" style={{ padding: '8px 15px', color: 'var(--accent-blue)', borderColor: 'var(--accent-blue)' }}>
        <Save size={16} /> SAVE CHANGES
      </button>
    </div>
  </div>
);

const ImportModal = ({ isOpen, onClose, onImport }) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  if (!isOpen) return null;

  const handleFile = (f) => {
    if (f && (f.name.endsWith('.xls') || f.name.endsWith('.xlsx'))) {
      setFile(f);
    } else {
      alert("Please upload a valid Excel file (.xls, .xlsx)");
    }
  };

  const processImport = () => {
    if (!file) return;
    setIsImporting(true);
    
    // Slight timeout to allow the UI to show the loader before heavy calculation starts
    setTimeout(() => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        let hr = 0; 
        for (let i = 0; i < rows.length; i++) { 
          if (rows[i].some(c => String(c).toLowerCase().includes('ip address'))) { 
            hr = i; break; 
          } 
        }
        onImport(XLSX.utils.sheet_to_json(worksheet, { range: hr }));
        setIsImporting(false);
        onClose();
        setFile(null);
      };
      reader.readAsArrayBuffer(file);
    }, 100);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
      <div className="glass-panel" style={{ width: '500px', padding: '30px', background: 'var(--node-bg)', border: '1px solid var(--panel-border)', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', position: 'relative' }}>
        
        {isImporting && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(20, 21, 27, 0.8)', zIndex: 10, borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px', backdropFilter: 'blur(4px)' }}>
            <Loader2 className="spinning" size={48} color="var(--accent-blue)" />
            <div style={{ fontWeight: '900', letterSpacing: '2px', color: 'white', fontSize: '0.9rem' }}>ANALYZING ARCHITECTURE...</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Processing phpIPAM data and building nodes</div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'var(--accent-blue)', padding: '8px', borderRadius: '10px', display: 'flex' }}><DatabaseZap size={20} color="#000" /></div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>Import phpIPAM</h3>
          </div>
          <button onClick={() => { onClose(); setFile(null); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '5px' }}><X size={20} /></button>
        </div>

        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => document.getElementById('file-upload').click()}
          style={{ 
            border: `2px dashed ${isDragging ? 'var(--accent-blue)' : 'var(--panel-border)'}`,
            borderRadius: '16px',
            padding: '40px 20px',
            textAlign: 'center',
            background: isDragging ? 'rgba(56, 189, 248, 0.05)' : 'rgba(0,0,0,0.2)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '20px'
          }}
        >
          <input id="file-upload" type="file" accept=".xls,.xlsx" onChange={(e) => handleFile(e.target.files[0])} style={{ display: 'none' }} />
          {file ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <FileSpreadsheet size={40} color="var(--accent-green)" />
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'white' }}>{file.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{(file.size / 1024).toFixed(1)} KB</div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <Upload size={40} color="var(--text-secondary)" style={{ opacity: 0.5 }} />
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'white' }}>Drag & Drop Excel File</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>or click to browse your computer</div>
              </div>
            </div>
          )}
        </div>

        <div style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '12px', padding: '12px 16px', marginBottom: '25px', display: 'flex', gap: '12px' }}>
          <Info size={18} color="var(--accent-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            Ensure your file has a column named <strong>"IP Address"</strong>. SparkCanvas will use advanced heuristics to detect hostnames, device types, and status.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => { onClose(); setFile(null); }} 
            style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', borderRadius: '10px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button 
            onClick={processImport} 
            disabled={!file} 
            style={{ 
              flex: 2, 
              padding: '12px', 
              background: file ? 'var(--accent-green)' : 'rgba(255,255,255,0.1)', 
              color: file ? 'black' : 'var(--text-secondary)', 
              border: 'none', 
              borderRadius: '10px', 
              fontWeight: 'bold', 
              cursor: file ? 'pointer' : 'not-allowed',
              boxShadow: file ? '0 0 20px rgba(74, 222, 128, 0.2)' : 'none'
            }}
          >
            GENERATE ARCHITECTURE
          </button>
        </div>
      </div>
    </div>
  );
};

const ContextMenu = ({ x, y, node, onEdit, onDelete, onClose }) => {
  useEffect(() => {
    const h = () => onClose();
    window.addEventListener('click', h); return () => window.removeEventListener('click', h);
  }, [onClose]);
  return (
    <div className="context-menu" style={{ top: y, left: x }} onClick={e => e.stopPropagation()}>
      <div className="context-menu-item" onClick={() => { onEdit(node.id); onClose(); }}><Edit3 size={14} /> Edit</div>
      <div className="context-menu-item danger" onClick={() => { onDelete(node.id); onClose(); }}><Trash2 size={14} /> Delete</div>
    </div>
  );
};

function App() {
  const reactFlowWrapper = useRef(null);
  const [currentMap, setCurrentMap] = useState('main');
  const [maps, setMaps] = useState({ main: { nodes: [], edges: [] } });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load maps from IndexedDB on mount
  useEffect(() => {
    const init = async () => {
      let saved = await loadMaps();
      if (!saved) {
        // Fallback to localStorage for migration
        const oldSaved = localStorage.getItem('sparkcanvas_maps');
        if (oldSaved) {
          saved = JSON.parse(oldSaved);
          await saveMaps(saved);
          localStorage.removeItem('sparkcanvas_maps'); // Cleanup
        }
      }
      if (saved) {
        setMaps(saved);
        if (saved[currentMap]) {
          setNodes(saved[currentMap].nodes);
          setEdges(saved[currentMap].edges);
        }
      }
      setIsLoaded(true);
    };
    init();
  }, []);

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [menu, setMenu] = useState(null);
  const [editingNodeId, setEditingNodeId] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Refs to keep track of current state for stable callbacks
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { edgesRef.current = edges; }, [edges]);

  const saveToLocal = useCallback(async () => {
    const updated = { ...maps, [currentMap]: { nodes, edges } };
    try {
      await saveMaps(updated);
      setMaps(updated);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } catch (e) {
      console.error("Failed to save to SQLite", e);
    }
  }, [nodes, edges, maps, currentMap]);

  const recordAction = useCallback(() => {
    setHistory(prev => [...prev, { nodes: [...nodesRef.current], edges: [...edgesRef.current] }].slice(-20));
    setFuture([]);
  }, []);

  const onUndo = useCallback(() => {
    setHistory(prevHistory => {
      if (prevHistory.length === 0) return prevHistory;
      const prev = prevHistory[prevHistory.length - 1];
      setFuture(f => [{ nodes: [...nodesRef.current], edges: [...edgesRef.current] }, ...f]);
      setNodes(prev.nodes);
      setEdges(prev.edges);
      return prevHistory.slice(0, -1);
    });
  }, []);

  const onRedo = useCallback(() => {
    setFuture(prevFuture => {
      if (prevFuture.length === 0) return prevFuture;
      const next = prevFuture[0];
      setHistory(h => [...h, { nodes: [...nodesRef.current], edges: [...edgesRef.current] }]);
      setNodes(next.nodes);
      setEdges(next.edges);
      return prevFuture.slice(1);
    });
  }, []);

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

  const updateNodeData = useCallback((nodeId, newData) => {
    recordAction();
    setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n));
  }, [recordAction]);

  const onDeleteNode = useCallback((id) => {
    recordAction();
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    setMenu(null);
  }, [recordAction]);

  const onDeleteMap = useCallback(async () => {
    if (Object.keys(maps).length <= 1) return;
    if (!window.confirm(`Delete map "${currentMap.toUpperCase()}"? This cannot be undone.`)) return;

    const newMaps = { ...maps };
    delete newMaps[currentMap];
    
    const firstRemaining = Object.keys(newMaps)[0];
    setMaps(newMaps);
    setCurrentMap(firstRemaining);
    setNodes(newMaps[firstRemaining].nodes);
    setEdges(newMaps[firstRemaining].edges);
    
    try {
      await saveMaps(newMaps);
    } catch (e) {
      console.error("Failed to delete map from SQLite", e);
    }
  }, [maps, currentMap]);

  const detectDeviceType = (hostname = '', description = '', mac = '') => {
    const combined = (hostname + " " + description + " " + (mac || '')).toLowerCase();
    if (combined.includes('fw') || combined.includes('firewall')) return 'firewall';
    if (combined.includes('router')) return 'router';
    if (combined.includes('switch') || combined.includes('sw-')) return 'switch';
    if (combined.includes('ap') || combined.includes('wifi')) return 'ap';
    if (combined.includes('nas') || combined.includes('synology')) return 'nas';
    return 'server';
  };

  const handleExcelImport = (data) => {
    recordAction();
    const dhcpAddresses = [];
    const normalItems = [];
    data.forEach(item => {
      const state = String(item['ip state'] || '').toLowerCase();
      if (state === 'dhcp') dhcpAddresses.push(item['ip address']);
      else normalItems.push(item);
    });

    let dhcpRange = "";
    if (dhcpAddresses.length > 0) {
      const sorted = dhcpAddresses.sort();
      dhcpRange = `${sorted[0]} - ${sorted[sorted.length - 1].split('.').pop()}`;
    }

    const newNodes = normalItems.map((item, index) => {
      const ip = item['ip address'];
      const hostname = item['hostname'];
      const type = detectDeviceType(hostname, item['description'], item['mac']);
      const nodeData = {
        label: hostname || ip, type, model: item['description'] || '', status: 'online', interfaces: [{ name: 'PRIMARY', ip: ip || '0.0.0.0' }],
        showStats: true, cores: '2', ram: '4GB', disk: '100GB'
      };
      if (dhcpRange && (type === 'firewall' || type === 'server')) { nodeData.dhcpPool = dhcpRange; dhcpRange = ""; }
      return { id: uuidv4(), type: 'networkNode', position: { x: (index % 5) * 320, y: Math.floor(index / 5) * 450 }, data: nodeData };
    }).filter(n => n.data.label);
    setNodes(newNodes);
    
    // Explicitly save the newly imported data
    const updated = { ...maps, [currentMap]: { nodes: newNodes, edges: [] } };
    saveMaps(updated).then(() => setMaps(updated));
  };

  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();
    setMenu({ id: node.id, top: event.clientY, left: event.clientX, node });
  }, []);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    recordAction();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type || !reactFlowInstance) return;
    const pos = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const newNode = {
      id: uuidv4(), type: 'networkNode', position: pos,
      data: { label: type.toUpperCase(), type, model: '', status: 'online', interfaces: [{ name: 'ETH0', ip: '0.0.0.0' }], showStats: true, cores: '1', ram: '2GB', disk: '40GB' }
    };
    setNodes((nds) => nds.concat(newNode));
  }, [reactFlowInstance, recordAction]);

  const onExportPng = useCallback(() => {
    if (reactFlowWrapper.current === null) return;
    toPng(reactFlowWrapper.current, {
      backgroundColor: '#0b0c10',
      filter: (node) => !node?.classList?.contains('react-flow__controls') &&
        !node?.classList?.contains('react-flow__attribution') &&
        !node?.classList?.contains('top-bar') &&
        node?.tagName !== 'ASIDE',
    }).then((dataUrl) => {
      const link = document.createElement('a');
      link.download = `sparkcanvas-${currentMap}.png`;
      link.href = dataUrl;
      link.click();
    });
  }, [currentMap]);

  const contextValue = React.useMemo(() => ({
    onDeleteNode, updateNodeData, editingNodeId, setEditingNodeId
  }), [onDeleteNode, updateNodeData, editingNodeId, setEditingNodeId]);

  if (!isLoaded) return <div style={{ background: 'var(--bg-color)', width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Maps...</div>;

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', background: 'var(--bg-color)', color: 'white' }}>
      <NodeActionContext.Provider value={contextValue}>
        <ReactFlowProvider>
          <Sidebar onExportPng={onExportPng} onImportPhpIpam={() => setIsImportModalOpen(true)} />
          <div style={{ flexGrow: 1, position: 'relative' }} ref={reactFlowWrapper}>
            <TopBar
              currentMap={currentMap} maps={maps} onMapChange={(m) => { saveToLocal(); setCurrentMap(m); setNodes(maps[m].nodes); setEdges(maps[m].edges); }}
              onNewMap={() => { const n = prompt("Name:"); if (n) setMaps({ ...maps, [n]: { nodes: [], edges: [] } }); }} onSave={saveToLocal}
              onDeleteMap={onDeleteMap}
              onUndo={onUndo} onRedo={onRedo} canUndo={history.length > 0} canRedo={future.length > 0}
            />
            <ReactFlow
              nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
              onConnect={(p) => { recordAction(); setEdges((eds) => addEdge({ ...p, type: 'default', animated: true }, eds)); }}
              onInit={setReactFlowInstance} onDrop={onDrop} onDragOver={e => e.preventDefault()}
              onNodeContextMenu={onNodeContextMenu} onPaneClick={() => setMenu(null)}
              nodeTypes={nodeTypes} fitView snapToGrid snapGrid={[24, 24]} deleteKeyCode={['Delete', 'Backspace']}
              defaultEdgeOptions={{ type: 'default', animated: true, style: { stroke: 'var(--accent-blue)', strokeWidth: 2 } }}
              onlyRenderVisibleElements={true}
              minZoom={0.05}
              translateExtent={[[-10000, -10000], [10000, 10000]]}
              selectionOnDrag={true}
              panOnDrag={[1, 2]}
              selectionMode="touch"
              proOptions={{ hideAttribution: true }}
            >
              <Background color="rgba(255,255,255,0.05)" gap={24} size={1} />
              {menu && <ContextMenu x={menu.left} y={menu.top} node={menu.node} onEdit={setEditingNodeId} onDelete={onDeleteNode} onClose={() => setMenu(null)} />}
            </ReactFlow>
            
            {showSaveSuccess && (
              <div style={{
                position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
                background: 'var(--accent-green)', color: 'black', padding: '10px 20px',
                borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px',
                fontWeight: 'bold', boxShadow: '0 10px 30px rgba(74, 222, 128, 0.3)',
                zIndex: 3000, animation: 'fadeInUp 0.3s ease'
              }}>
                <CheckCircle size={18} />
                CHANGES SAVED TO DB
              </div>
            )}
          </div>
          <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImport={handleExcelImport} />
        </ReactFlowProvider>
      </NodeActionContext.Provider>
    </div>
  );
}

export default App;
