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
  Plus
} from 'lucide-react';
import * as XLSX from 'xlsx';

import Sidebar from './components/Sidebar';
import NetworkNode from './components/nodes/NetworkNode';

// --- Context for Node Actions ---
export const NodeActionContext = createContext(null);

const nodeTypes = {
  networkNode: NetworkNode,
};

// --- TopBar Component ---
const TopBar = ({
  currentMap, maps, onMapChange, onNewMap, onSave,
  onUndo, onRedo, canUndo, canRedo
}) => (
  <div className="top-bar" style={{
    position: 'absolute', top: 20, left: 360, right: 20, height: '60px',
    background: 'var(--panel-bg)', border: '1px solid var(--panel-border)',
    borderRadius: '12px', zIndex: 10, display: 'flex', alignItems: 'center', padding: '0 20px', gap: '15px', backdropFilter: 'blur(10px)'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRight: '1px solid var(--panel-border)', paddingRight: '15px' }}>
      <Layers size={18} color="var(--accent-blue)" />
      <select
        value={currentMap}
        onChange={(e) => onMapChange(e.target.value)}
        style={{ background: 'transparent', border: 'none', color: 'white', fontWeight: 'bold', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}
      >
        {Object.keys(maps).map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
      </select>
      <button onClick={onNewMap} className="node-action-btn" title="New Map"><Plus size={14} /></button>
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
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '400px', padding: '24px', background: 'var(--node-bg)' }}>
        <h3 style={{ margin: '0 0 15px 0' }}>Import Excel</h3>
        <input type="file" accept=".xls,.xlsx" onChange={(e) => setFile(e.target.files[0])} style={{ marginBottom: '20px' }} />
        <button onClick={() => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            let hr = 0; for (let i = 0; i < rows.length; i++) { if (rows[i].some(c => String(c).toLowerCase().includes('ip address'))) { hr = i; break; } }
            onImport(XLSX.utils.sheet_to_json(worksheet, { range: hr }));
            onClose();
          };
          reader.readAsArrayBuffer(file);
        }} disabled={!file} style={{ width: '100%', padding: '10px', background: 'var(--accent-green)', color: 'black', border: 'none', borderRadius: '8px' }}>GENERATE</button>
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
  const [maps, setMaps] = useState(() => {
    const saved = localStorage.getItem('sparkcanvas_maps');
    return saved ? JSON.parse(saved) : { main: { nodes: [], edges: [] } };
  });

  const [nodes, setNodes] = useState(maps[currentMap].nodes);
  const [edges, setEdges] = useState(maps[currentMap].edges);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [menu, setMenu] = useState(null);
  const [editingNodeId, setEditingNodeId] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const saveToLocal = useCallback(() => {
    const updated = { ...maps, [currentMap]: { nodes, edges } };
    localStorage.setItem('sparkcanvas_maps', JSON.stringify(updated));
    setMaps(updated);
  }, [nodes, edges, maps, currentMap]);

  const recordAction = useCallback(() => {
    setHistory(prev => [...prev, { nodes: [...nodes], edges: [...edges] }].slice(-20));
    setFuture([]);
  }, [nodes, edges]);

  const onUndo = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setFuture(f => [{ nodes: [...nodes], edges: [...edges] }, ...f]);
    setNodes(previousNodes => previousNodes !== prev.nodes ? prev.nodes : previousNodes);
    setEdges(previousEdges => previousEdges !== prev.edges ? prev.edges : previousEdges);
    setHistory(h => h.slice(0, -1));
  }, [history, nodes, edges]);

  const onRedo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setHistory(h => [...h, { nodes: [...nodes], edges: [...edges] }]);
    setNodes(next.nodes); setEdges(next.edges);
    setFuture(f => f.slice(1));
  }, [future, nodes, edges]);

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

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', background: 'var(--bg-color)', color: 'white' }}>
      <NodeActionContext.Provider value={{ onDeleteNode, updateNodeData, editingNodeId, setEditingNodeId }}>
        <ReactFlowProvider>
          <Sidebar onExportPng={onExportPng} onImportPhpIpam={() => setIsImportModalOpen(true)} />
          <div style={{ flexGrow: 1, position: 'relative' }} ref={reactFlowWrapper}>
            <TopBar
              currentMap={currentMap} maps={maps} onMapChange={(m) => { saveToLocal(); setCurrentMap(m); setNodes(maps[m].nodes); setEdges(maps[m].edges); }}
              onNewMap={() => { const n = prompt("Name:"); if (n) setMaps({ ...maps, [n]: { nodes: [], edges: [] } }); }} onSave={saveToLocal}
              onUndo={onUndo} onRedo={onRedo} canUndo={history.length > 0} canRedo={future.length > 0}
            />
            <ReactFlow
              nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
              onConnect={(p) => { recordAction(); setEdges((eds) => addEdge({ ...p, type: 'default', animated: true }, eds)); }}
              onInit={setReactFlowInstance} onDrop={onDrop} onDragOver={e => e.preventDefault()}
              onNodeContextMenu={onNodeContextMenu} onPaneClick={() => setMenu(null)}
              nodeTypes={nodeTypes} fitView snapToGrid snapGrid={[24, 24]} deleteKeyCode={['Delete', 'Backspace']}
              defaultEdgeOptions={{ type: 'default', animated: true, style: { stroke: 'var(--accent-blue)', strokeWidth: 2 } }}
            >
              <Background color="rgba(255,255,255,0.05)" gap={24} size={1} />
              <Controls />
              {menu && <ContextMenu x={menu.left} y={menu.top} node={menu.node} onEdit={setEditingNodeId} onDelete={onDeleteNode} onClose={() => setMenu(null)} />}
            </ReactFlow>
          </div>
          <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImport={handleExcelImport} />
        </ReactFlowProvider>
      </NodeActionContext.Provider>
    </div>
  );
}

export default App;
