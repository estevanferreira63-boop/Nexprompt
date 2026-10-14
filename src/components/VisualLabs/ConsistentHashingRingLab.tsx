import React, { useState, useMemo } from 'react';
import {
  Compass,
  Plus,
  Trash2,
  RotateCcw,
  Sparkles,
  Server,
  Key,
  ShieldCheck,
  AlertCircle,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useGamification } from '../../context/GamificationContext';
import { sound } from '../../utils/soundEffects';

interface ClusterNode {
  id: string;
  name: string;
  color: string;
  angle: number; // 0 to 360 degrees
}

interface VirtualNode {
  id: string;
  nodeId: string;
  nodeName: string;
  color: string;
  angle: number;
}

interface DataKey {
  id: string;
  name: string;
  angle: number; // calculated hash position
  assignedNodeId: string;
}

const BASE_COLORS = [
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // purple
];

export const ConsistentHashingRingLab: React.FC = () => {
  const { language } = useLanguage();
  const { addXp } = useGamification();

  // Nodes
  const [nodes, setNodes] = useState<ClusterNode[]>([
    { id: 'node-1', name: 'Node Alpha (us-east-1a)', color: BASE_COLORS[0], angle: 30 },
    { id: 'node-2', name: 'Node Beta (us-east-1b)', color: BASE_COLORS[1], angle: 150 },
    { id: 'node-3', name: 'Node Gamma (us-east-1c)', color: BASE_COLORS[2], angle: 270 },
  ]);

  const [vnodesPerNode, setVnodesPerNode] = useState<number>(3); // Virtual nodes multiplier
  const [keyInput, setKeyInput] = useState<string>('');

  // Sample keys
  const [keys, setKeys] = useState<DataKey[]>([
    { id: 'k1', name: 'user_session_4921', angle: 45, assignedNodeId: 'node-2' },
    { id: 'k2', name: 'order_payload_8820', angle: 110, assignedNodeId: 'node-2' },
    { id: 'k3', name: 'payment_auth_1042', angle: 190, assignedNodeId: 'node-3' },
    { id: 'k4', name: 'device_telemetry_az7', angle: 310, assignedNodeId: 'node-1' },
    { id: 'k5', name: 'customer_profile_330', angle: 350, assignedNodeId: 'node-1' },
  ]);

  // Compute all virtual nodes sorted clockwise by angle
  const virtualNodes: VirtualNode[] = useMemo(() => {
    const list: VirtualNode[] = [];
    nodes.forEach((n) => {
      for (let v = 0; v < vnodesPerNode; v++) {
        // pseudo-hash distribution for virtual replica
        const vAngle = (n.angle + (v * 360) / vnodesPerNode + v * 17) % 360;
        list.push({
          id: `${n.id}-v${v}`,
          nodeId: n.id,
          nodeName: n.name,
          color: n.color,
          angle: vAngle,
        });
      }
    });
    return list.sort((a, b) => a.angle - b.angle);
  }, [nodes, vnodesPerNode]);

  // Map keys to their clockwise successor node
  const mappedKeys = useMemo(() => {
    if (virtualNodes.length === 0) return keys;

    return keys.map((k) => {
      // Find the first virtual node with angle >= key.angle, or wrap to 0
      const successor = virtualNodes.find((vn) => vn.angle >= k.angle) || virtualNodes[0];
      return {
        ...k,
        assignedNodeId: successor.nodeId,
      };
    });
  }, [keys, virtualNodes]);

  // Add a new node
  const handleAddNode = () => {
    if (nodes.length >= 6) return;
    sound.playClick();
    const newIdx = nodes.length + 1;
    const names = ['Delta', 'Epsilon', 'Zeta', 'Eta'];
    const newName = `Node ${names[nodes.length - 3] || `Node-${newIdx}`} (us-east-1d)`;
    const newAngle = Math.floor(Math.random() * 340) + 10;
    const newColor = BASE_COLORS[nodes.length % BASE_COLORS.length];

    setNodes((prev) => [...prev, { id: `node-${Date.now()}`, name: newName, color: newColor, angle: newAngle }]);
    sound.playSuccess();
    addXp(20, 'Nó Adicionado ao Consistent Hashing Ring (+20 XP)');
  };

  // Remove a node
  const handleRemoveNode = (id: string) => {
    if (nodes.length <= 2) return;
    sound.playClick();
    setNodes((prev) => prev.filter((n) => n.id !== id));
    sound.playNotification();
    addXp(15, 'Simulação de Falha de Nó Executada (+15 XP)');
  };

  // Add custom key
  const handleAddKey = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = keyInput.trim();
    if (!trimmed) return;

    // Hash angle based on string
    let hash = 0;
    for (let i = 0; i < trimmed.length; i++) {
      hash = (hash << 5) - hash + trimmed.charCodeAt(i);
      hash |= 0;
    }
    const angle = Math.abs(hash) % 360;

    const newKey: DataKey = {
      id: `key-${Date.now()}`,
      name: trimmed,
      angle,
      assignedNodeId: '',
    };

    setKeys((prev) => [...prev, newKey]);
    setKeyInput('');
    sound.playSuccess();
    addXp(10);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 p-5 rounded-2xl border border-cyan-900/40">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
              <Compass className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>Laboratório #14 · Sistemas Distribuídos & Sharding</span>
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">
              Consistent Hashing & Virtual Nodes (V-Nodes)
            </h3>
            <p className="text-slate-300 text-xs mt-1 max-w-3xl leading-relaxed">
              O algoritmo por trás do <strong className="text-cyan-300">Amazon DynamoDB</strong>,{' '}
              <strong className="text-cyan-300">Apache Cassandra</strong> e{' '}
              <strong className="text-cyan-300">Redis Cluster</strong>. Veja como adicionar ou remover
              nós realoca apenas <code className="text-cyan-400 font-mono">K / N</code> chaves em vez
              de invalidar todo o cache ou forçar um re-sharding catastrófico.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddNode}
              disabled={nodes.length >= 6}
              className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Nó</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 360 Circular Ring SVG Visualizer */}
        <div className="lg:col-span-7 bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center relative min-h-[420px]">
          <h4 className="text-xs font-mono font-bold uppercase text-slate-400 mb-4 self-start flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Anel de Hash Contínuo (0° a 360° / [0 .. 2³² - 1])</span>
          </h4>

          {/* SVG Ring */}
          <div className="relative w-72 h-72 sm:w-84 sm:h-84 flex items-center justify-center">
            <svg viewBox="0 0 300 300" className="w-full h-full">
              {/* Outer Glow Circle */}
              <circle cx="150" cy="150" r="110" fill="none" stroke="#1e293b" strokeWidth="6" />
              <circle
                cx="150"
                cy="150"
                r="110"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="1.5"
                strokeDasharray="4 6"
                opacity="0.6"
              />

              {/* Angle Tick Marks */}
              {[0, 90, 180, 270].map((deg) => {
                const rad = (deg - 90) * (Math.PI / 180);
                const x1 = 150 + 105 * Math.cos(rad);
                const y1 = 150 + 105 * Math.sin(rad);
                const x2 = 150 + 115 * Math.cos(rad);
                const y2 = 150 + 115 * Math.sin(rad);
                return (
                  <line
                    key={deg}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#475569"
                    strokeWidth="2"
                  />
                );
              })}

              {/* Virtual Nodes Points */}
              {virtualNodes.map((vn) => {
                const rad = (vn.angle - 90) * (Math.PI / 180);
                const cx = 150 + 110 * Math.cos(rad);
                const cy = 150 + 110 * Math.sin(rad);
                return (
                  <g key={vn.id}>
                    <circle cx={cx} cy={cy} r="7" fill={vn.color} stroke="#0f172a" strokeWidth="2" />
                  </g>
                );
              })}

              {/* Data Keys Points */}
              {mappedKeys.map((k) => {
                const rad = (k.angle - 90) * (Math.PI / 180);
                const cx = 150 + 88 * Math.cos(rad);
                const cy = 150 + 88 * Math.sin(rad);
                const assignedNode = nodes.find((n) => n.id === k.assignedNodeId);

                return (
                  <g key={k.id} className="cursor-pointer group">
                    <circle
                      cx={cx}
                      cy={cy}
                      r="5"
                      fill="#ffffff"
                      stroke={assignedNode?.color || '#ffffff'}
                      strokeWidth="2"
                    />
                    {/* Connecting line from key to ring */}
                    <line
                      x1={cx}
                      y1={cy}
                      x2={150 + 110 * Math.cos(rad)}
                      y2={150 + 110 * Math.sin(rad)}
                      stroke="#94a3b8"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                  </g>
                );
              })}

              {/* Center Info Hub */}
              <circle cx="150" cy="150" r="48" fill="#020617" stroke="#334155" strokeWidth="2" />
              <text
                x="150"
                y="145"
                textAnchor="middle"
                className="fill-cyan-400 font-mono text-[11px] font-black"
              >
                CLOCKWISE
              </text>
              <text
                x="150"
                y="160"
                textAnchor="middle"
                className="fill-slate-400 font-mono text-[9px]"
              >
                {virtualNodes.length} V-Nodes
              </text>
            </svg>
          </div>

          <p className="text-[11px] font-mono text-slate-400 mt-4 text-center">
            ↻ Trajetória Sentido Horário: A chave é roteada para o primeiro nó cujo hash seja maior ou igual ao seu.
          </p>
        </div>

        {/* Right: Controls, V-Nodes Slider & Nodes Health List */}
        <div className="lg:col-span-5 space-y-4">
          {/* Virtual Nodes Slider */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400 font-bold">Virtual Nodes (V-Nodes) por Nó Físico:</span>
              <span className="text-cyan-400 font-black text-sm">{vnodesPerNode}x</span>
            </div>
            <input
              type="range"
              min={1}
              max={8}
              value={vnodesPerNode}
              onChange={(e) => setVnodesPerNode(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
              Quanto maior o número de nós virtuais, mais uniforme é a distribuição de carga estatística,
              eliminando gargalos e hot-spots no cluster.
            </p>
          </div>

          {/* Add Key Form */}
          <form
            onSubmit={handleAddKey}
            className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2"
          >
            <label className="text-[11px] font-mono font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Inserir Nova Chave de Dados (Key Lookup)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="ex: order_9410, user_tok..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={!keyInput.trim()}
                className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-mono text-xs font-bold transition-all"
              >
                Hash
              </button>
            </div>
          </form>

          {/* Physical Nodes Cards */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 font-bold uppercase">Nós Físicos Ativos ({nodes.length}):</span>
              <span className="text-slate-500 text-[10px]">Min: 2 | Max: 6</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
              {nodes.map((node) => {
                const assignedCount = mappedKeys.filter((k) => k.assignedNodeId === node.id).length;
                const pct = mappedKeys.length > 0 ? ((assignedCount / mappedKeys.length) * 100).toFixed(0) : 0;

                return (
                  <div
                    key={node.id}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: node.color }} />
                      <div>
                        <div className="text-white font-bold text-[11px]">{node.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {assignedCount} chaves ({pct}% do cluster)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRemoveNode(node.id)}
                        disabled={nodes.length <= 2}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 disabled:opacity-20 transition-colors"
                        title="Simular falha/remoção deste nó"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
