import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import {
  Network,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Circle,
  Bookmark,
  Sparkles,
  Layers,
  ArrowRight,
  ExternalLink,
  Bot,
  HelpCircle,
  Play,
  Pause,
  Compass,
  GitBranch,
  ShieldCheck,
  Cpu,
  Database,
  Workflow,
  X,
  Share2,
} from 'lucide-react';
import { ALL_CONCEPTS, CONCEPTS_BY_ID, SECTIONS } from '../data/concepts';
import { Concept, ConceptStatus, LabType, SectionId } from '../types/concept';
import { useLanguage } from '../context/LanguageContext';
import { sound } from '../utils/soundEffects';

// Color map for sections
const SECTION_COLORS: Record<SectionId, { primary: string; glow: string; text: string; bg: string }> = {
  1: { primary: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)', text: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  2: { primary: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  3: { primary: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)', text: 'text-amber-400', bg: 'bg-amber-500/10' },
  4: { primary: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)', text: 'text-violet-400', bg: 'bg-violet-500/10' },
  5: { primary: '#0ea5e9', glow: 'rgba(14, 165, 233, 0.4)', text: 'text-sky-400', bg: 'bg-sky-500/10' },
  6: { primary: '#d946ef', glow: 'rgba(217, 70, 239, 0.4)', text: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10' },
  7: { primary: '#f43f5e', glow: 'rgba(244, 63, 94, 0.4)', text: 'text-rose-400', bg: 'bg-rose-500/10' },
};

type GraphLayoutMode = 'force' | 'learning-path' | 'radial' | 'clustered';

interface GraphNode extends d3.SimulationNodeDatum {
  id: number;
  name: string;
  tagline: string;
  sectionId: SectionId;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  status: ConceptStatus;
  isBookmarked: boolean;
  hasLab: boolean;
  labType?: LabType;
  relatedIds: number[];
  degree: number;
  radius: number;
  targetX?: number;
  targetY?: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: GraphNode | number;
  target: GraphNode | number;
  isPrerequisite?: boolean;
}

interface ConceptGraphMapProps {
  statusMap: Record<number, ConceptStatus>;
  bookmarked: number[];
  onSelectConcept: (conceptId: number) => void;
  onStatusChange: (conceptId: number, status: ConceptStatus) => void;
  onBookmarkToggle: (conceptId: number) => void;
  onOpenLab?: (labType: LabType) => void;
  onOpenChatWithConcept?: (conceptId: number) => void;
}

export const ConceptGraphMap: React.FC<ConceptGraphMapProps> = ({
  statusMap,
  bookmarked,
  onSelectConcept,
  onStatusChange,
  onBookmarkToggle,
  onOpenLab,
  onOpenChatWithConcept,
}) => {
  const { language, t } = useLanguage();

  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Layout & Filtering State
  const [layoutMode, setLayoutMode] = useState<GraphLayoutMode>('force');
  const [selectedSection, setSelectedSection] = useState<SectionId | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [isSimRunning, setIsSimRunning] = useState<boolean>(true);

  // Inspector & Interactive Focus State
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<number | null>(null);
  const [highlightedPath, setHighlightedPath] = useState<number[] | null>(null);

  // Prepare Nodes and Links Data
  const { initialNodes, initialLinks } = useMemo(() => {
    // Degree map
    const degreeMap: Record<number, number> = {};
    ALL_CONCEPTS.forEach((c) => {
      degreeMap[c.id] = c.relatedIds.length;
    });

    const nodes: GraphNode[] = ALL_CONCEPTS.map((c) => {
      const status = statusMap[c.id] || 'not_started';
      const isBookmarked = bookmarked.includes(c.id);
      const degree = degreeMap[c.id] || 0;
      // Base radius by difficulty & connections
      const radius = c.difficulty === 'Avançado' ? 24 : c.difficulty === 'Intermediário' ? 20 : 17;

      return {
        id: c.id,
        name: c.name,
        tagline: c.tagline,
        sectionId: c.sectionId,
        difficulty: c.difficulty,
        status,
        isBookmarked,
        hasLab: !!c.labType,
        labType: c.labType,
        relatedIds: c.relatedIds,
        degree,
        radius,
      };
    });

    const nodeMap = new Map<number, GraphNode>(nodes.map((n) => [n.id, n]));
    const linkSet = new Set<string>();
    const links: GraphLink[] = [];

    // Build unique links
    ALL_CONCEPTS.forEach((concept) => {
      concept.relatedIds.forEach((targetId) => {
        if (!nodeMap.has(targetId)) return;
        const key = `${Math.min(concept.id, targetId)}-${Math.max(concept.id, targetId)}`;
        if (!linkSet.has(key)) {
          linkSet.add(key);
          links.push({
            source: concept.id,
            target: targetId,
            isPrerequisite: concept.id < targetId,
          });
        }
      });
    });

    return { initialNodes: nodes, initialLinks: links };
  }, [statusMap, bookmarked]);

  // Active Selected Concept Object
  const activeNode = activeNodeId ? CONCEPTS_BY_ID[activeNodeId] : null;

  // Compute Path to Active Node (BFS learning trail from Section 1 to active node)
  const computeLearningPath = useCallback(
    (targetId: number) => {
      const targetConcept = CONCEPTS_BY_ID[targetId];
      if (!targetConcept) return;

      // If already in section 1, trivial
      if (targetConcept.sectionId === 1) {
        setHighlightedPath([targetId]);
        return;
      }

      // Adjacency graph
      const adj: Record<number, number[]> = {};
      ALL_CONCEPTS.forEach((c) => {
        adj[c.id] = [...c.relatedIds];
      });

      // BFS backwards from target to any Section 1 concept
      const queue: number[] = [targetId];
      const visited = new Set<number>([targetId]);
      const parent = new Map<number, number>();

      let startFound: number | null = null;
      while (queue.length > 0) {
        const curr = queue.shift()!;
        const cObj = CONCEPTS_BY_ID[curr];
        if (cObj && cObj.sectionId === 1) {
          startFound = curr;
          break;
        }

        const neighbors = adj[curr] || [];
        for (const n of neighbors) {
          if (!visited.has(n)) {
            visited.add(n);
            parent.set(n, curr);
            queue.push(n);
          }
        }
      }

      if (startFound !== null) {
        // Reconstruct path
        const path: number[] = [];
        let curr: number | undefined = startFound;
        while (curr !== undefined) {
          path.push(curr);
          curr = parent.get(curr);
        }
        setHighlightedPath(path);
      } else {
        // Fallback: related chain
        setHighlightedPath([1, targetConcept.relatedIds[0] || 2, targetId]);
      }
    },
    []
  );

  // Clear path highlight
  const clearPathHighlight = () => setHighlightedPath(null);

  // Determine Connected IDs for Hover/Focus Spotlight
  const connectedIds = useMemo(() => {
    const focusId = hoveredNodeId || activeNodeId;
    if (!focusId) return null;
    const focusConcept = CONCEPTS_BY_ID[focusId];
    if (!focusConcept) return null;
    const set = new Set<number>([focusId, ...focusConcept.relatedIds]);
    // Also include nodes that list focusId in their relatedIds
    ALL_CONCEPTS.forEach((c) => {
      if (c.relatedIds.includes(focusId)) {
        set.add(c.id);
      }
    });
    return set;
  }, [hoveredNodeId, activeNodeId]);

  // Match queries for search and filters
  const visibleNodeIds = useMemo(() => {
    return new Set(
      initialNodes
        .filter((n) => {
          if (selectedSection !== 'all' && n.sectionId !== selectedSection) return false;
          if (selectedDifficulty !== 'all' && n.difficulty !== selectedDifficulty) return false;
          if (selectedStatusFilter === 'completed' && n.status !== 'completed') return false;
          if (selectedStatusFilter === 'in_progress' && n.status !== 'in_progress') return false;
          if (selectedStatusFilter === 'not_started' && n.status !== 'not_started') return false;
          if (selectedStatusFilter === 'bookmarked' && !n.isBookmarked) return false;
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const matchesName = n.name.toLowerCase().includes(q);
            const matchesTagline = n.tagline.toLowerCase().includes(q);
            const matchesId = `#${n.id}`.includes(q) || `${n.id}` === q;
            if (!matchesName && !matchesTagline && !matchesId) return false;
          }
          return true;
        })
        .map((n) => n.id)
    );
  }, [initialNodes, selectedSection, selectedDifficulty, selectedStatusFilter, searchQuery]);

  // Render & Update D3 Graph
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 1000;
    const height = Math.max(containerRef.current.clientHeight, 700);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Define Definitions (Gradients, Dropshadow, Arrowhead Markers)
    const defs = svg.append('defs');

    // Glow filter
    const filter = defs.append('filter').attr('id', 'glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Arrow markers for dependencies
    defs
      .append('marker')
      .attr('id', 'arrow-default')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 5)
      .attr('markerHeight', 5)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L8,0L0,4')
      .attr('fill', '#475569');

    defs
      .append('marker')
      .attr('id', 'arrow-highlight')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L9,0L0,4')
      .attr('fill', '#22d3ee');

    defs
      .append('marker')
      .attr('id', 'arrow-path')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 24)
      .attr('refY', 0)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L10,0L0,4')
      .attr('fill', '#fbbf24');

    // Main Zoomable Canvas Group
    const g = svg.append('g').attr('class', 'main-graph-container');

    // Zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // Background click to deselect
    svg.on('click', (event) => {
      if (event.target === svg.node()) {
        setActiveNodeId(null);
        clearPathHighlight();
      }
    });

    // Deep copy nodes and links for simulation
    const nodes: GraphNode[] = initialNodes.map((d) => ({ ...d }));
    const links: GraphLink[] = initialLinks.map((d) => ({ ...d }));

    // SECTION HUBS POSITIONS (Calculated for Clustered / Hierarchical / Radial)
    const sectionCentroids: Record<SectionId, { x: number; y: number }> = {
      1: { x: width * 0.12, y: height * 0.5 },
      2: { x: width * 0.25, y: height * 0.35 },
      3: { x: width * 0.4, y: height * 0.65 },
      4: { x: width * 0.55, y: height * 0.35 },
      5: { x: width * 0.7, y: height * 0.65 },
      6: { x: width * 0.85, y: height * 0.38 },
      7: { x: width * 0.92, y: height * 0.68 },
    };

    // Radial concentric positions
    const radialCenter = { x: width / 2, y: height / 2 };

    // Apply layout target positions based on layoutMode
    nodes.forEach((n) => {
      if (layoutMode === 'learning-path') {
        // Hierarchical DAG: 7 vertical columns/swimlanes
        const colX = width * 0.08 + (n.sectionId - 1) * (width * 0.84 / 6);
        // Distribute nodes evenly in the column
        const sectionNodes = nodes.filter((x) => x.sectionId === n.sectionId);
        const idx = sectionNodes.findIndex((x) => x.id === n.id);
        const colY = height * 0.18 + (idx / Math.max(1, sectionNodes.length - 1)) * (height * 0.68);
        n.targetX = colX;
        n.targetY = colY;
      } else if (layoutMode === 'radial') {
        // Concentric circles based on sectionId (1 = inner ring, 7 = outer ring)
        const radius = 80 + n.sectionId * 65;
        const sectionNodes = nodes.filter((x) => x.sectionId === n.sectionId);
        const idx = sectionNodes.findIndex((x) => x.id === n.id);
        const angle = (idx / sectionNodes.length) * 2 * Math.PI - Math.PI / 2;
        n.targetX = radialCenter.x + radius * Math.cos(angle);
        n.targetY = radialCenter.y + radius * Math.sin(angle);
      } else if (layoutMode === 'clustered') {
        // Clustered circles by section
        const c = sectionCentroids[n.sectionId];
        const sectionNodes = nodes.filter((x) => x.sectionId === n.sectionId);
        const idx = sectionNodes.findIndex((x) => x.id === n.id);
        const clusterRadius = 80 + (sectionNodes.length > 15 ? 40 : 0);
        const angle = (idx / sectionNodes.length) * 2 * Math.PI;
        n.targetX = c.x + clusterRadius * Math.cos(angle);
        n.targetY = c.y + clusterRadius * Math.sin(angle);
      }
    });

    // Setup D3 Force Simulation
    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .alphaDecay(0.028)
      .velocityDecay(0.4);

    if (layoutMode === 'force') {
      simulation
        .force(
          'link',
          d3
            .forceLink<GraphNode, GraphLink>(links)
            .id((d) => d.id)
            .distance(75)
            .strength(0.35)
        )
        .force('charge', d3.forceManyBody().strength(-140))
        .force('collide', d3.forceCollide().radius((d) => (d as GraphNode).radius + 12).iterations(2))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force(
          'x',
          d3.forceX<GraphNode>((d) => sectionCentroids[d.sectionId].x).strength(0.18)
        )
        .force(
          'y',
          d3.forceY<GraphNode>((d) => sectionCentroids[d.sectionId].y).strength(0.18)
        );
    } else {
      // Fixed / guided positioning layouts
      simulation
        .force(
          'link',
          d3
            .forceLink<GraphNode, GraphLink>(links)
            .id((d) => d.id)
            .distance(60)
            .strength(0.1)
        )
        .force('collide', d3.forceCollide().radius((d) => (d as GraphNode).radius + 8))
        .force('x', d3.forceX<GraphNode>((d) => d.targetX ?? width / 2).strength(0.85))
        .force('y', d3.forceY<GraphNode>((d) => d.targetY ?? height / 2).strength(0.85));
    }

    simulationRef.current = simulation;

    // Section Background Zones (for learning-path and clustered)
    if (layoutMode === 'learning-path') {
      const zoneGroup = g.append('g').attr('class', 'section-zones opacity-30');
      SECTIONS.forEach((sec, idx) => {
        const xPos = width * 0.08 + idx * (width * 0.84 / 6);
        const colWidth = width * 0.84 / 6;

        zoneGroup
          .append('rect')
          .attr('x', xPos - colWidth / 2)
          .attr('y', 40)
          .attr('width', colWidth)
          .attr('height', height - 80)
          .attr('fill', idx % 2 === 0 ? 'rgba(30, 41, 59, 0.4)' : 'rgba(15, 23, 42, 0.2)')
          .attr('rx', 16);

        zoneGroup
          .append('text')
          .attr('x', xPos)
          .attr('y', 70)
          .attr('text-anchor', 'middle')
          .attr('fill', SECTION_COLORS[sec.id].primary)
          .attr('font-size', '11px')
          .attr('font-family', 'monospace')
          .attr('font-weight', 'bold')
          .text(`Etapa ${sec.id}: ${sec.shortNamePt}`);
      });
    }

    // Container for Links
    const linkGroup = g.append('g').attr('class', 'links');

    // Create Link Elements
    const link = linkGroup
      .selectAll<SVGLineElement, GraphLink>('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#334155')
      .attr('stroke-width', 1.2)
      .attr('stroke-opacity', 0.4)
      .attr('marker-end', 'url(#arrow-default)');

    // Container for Nodes
    const nodeGroup = g.append('g').attr('class', 'nodes');

    // Create Node Element Groups
    const node = nodeGroup
      .selectAll<SVGGElement, GraphNode>('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node-item cursor-pointer')
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            if (layoutMode === 'force') {
              d.fx = null;
              d.fy = null;
            }
          })
      );

    // Node Outer Ring / Status Indicator
    node
      .append('circle')
      .attr('class', 'node-ring')
      .attr('r', (d) => d.radius + 3)
      .attr('fill', 'none')
      .attr('stroke', (d) => {
        if (d.status === 'completed') return '#10b981';
        if (d.status === 'in_progress') return '#f59e0b';
        return SECTION_COLORS[d.sectionId].primary;
      })
      .attr('stroke-width', (d) => (d.status === 'completed' ? 2.5 : d.status === 'in_progress' ? 2 : 1))
      .attr('stroke-dasharray', (d) => (d.status === 'in_progress' ? '3, 2' : 'none'))
      .attr('opacity', 0.85);

    // Node Base Circle
    node
      .append('circle')
      .attr('class', 'node-circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => {
        if (d.status === 'completed') return '#064e3b';
        if (d.status === 'in_progress') return '#451a03';
        return '#0f172a';
      })
      .attr('stroke', (d) => SECTION_COLORS[d.sectionId].primary)
      .attr('stroke-width', 2);

    // Node Number / ID Text in Center
    node
      .append('text')
      .attr('class', 'node-id')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', (d) => (d.id > 99 ? '9px' : '10px'))
      .attr('font-family', 'ui-monospace, monospace')
      .attr('font-weight', 'bold')
      .attr('fill', (d) => {
        if (d.status === 'completed') return '#6ee7b7';
        if (d.status === 'in_progress') return '#fde68a';
        return '#f8fafc';
      })
      .text((d) => d.id);

    // Node Completed Checkmark Badge Icon
    const checkBadges = node.filter((d) => d.status === 'completed');
    checkBadges
      .append('circle')
      .attr('cx', (d) => d.radius * 0.72)
      .attr('cy', (d) => -d.radius * 0.72)
      .attr('r', 5.5)
      .attr('fill', '#10b981');

    checkBadges
      .append('text')
      .attr('x', (d) => d.radius * 0.72)
      .attr('y', (d) => -d.radius * 0.72)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', '7px')
      .attr('font-weight', 'black')
      .attr('fill', '#022c22')
      .text('✓');

    // Node Lab Badge (Flask indicator if concept has interactive visual lab)
    const labBadges = node.filter((d) => d.hasLab);
    labBadges
      .append('circle')
      .attr('cx', (d) => -d.radius * 0.72)
      .attr('cy', (d) => -d.radius * 0.72)
      .attr('r', 5)
      .attr('fill', '#0284c7');

    labBadges
      .append('text')
      .attr('x', (d) => -d.radius * 0.72)
      .attr('y', (d) => -d.radius * 0.72)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', '6.5px')
      .attr('fill', '#ffffff')
      .text('🧪');

    // Node Name Label Text (below node)
    node
      .append('text')
      .attr('class', 'node-label')
      .attr('y', (d) => d.radius + 12)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-family', 'sans-serif')
      .attr('font-weight', '600')
      .attr('fill', '#cbd5e1')
      .attr('pointer-events', 'none')
      .text((d) => (d.name.length > 18 ? `${d.name.slice(0, 16)}…` : d.name));

    // Interactive Hover & Click Handlers
    node
      .on('mouseenter', (_event, d) => {
        setHoveredNodeId(d.id);
      })
      .on('mouseleave', () => {
        setHoveredNodeId(null);
      })
      .on('click', (event, d) => {
        event.stopPropagation();
        setActiveNodeId((prev) => (prev === d.id ? null : d.id));
        computeLearningPath(d.id);
      });

    // Simulation Tick Update
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as GraphNode).x ?? 0)
        .attr('y1', (d) => (d.source as GraphNode).y ?? 0)
        .attr('x2', (d) => (d.target as GraphNode).x ?? 0)
        .attr('y2', (d) => (d.target as GraphNode).y ?? 0);

      node.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    // Apply Initial Center & Zoom Transition
    const initialTransform = d3.zoomIdentity.translate(width * 0.05, height * 0.05).scale(0.9);
    svg.transition().duration(600).call(zoom.transform, initialTransform);

    return () => {
      simulation.stop();
    };
  }, [
    initialNodes,
    initialLinks,
    layoutMode,
    computeLearningPath,
  ]);

  // Update Dynamic Visual Styles (Visibility, Spotlight, Highlighted Path)
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    const isPathActive = highlightedPath && highlightedPath.length > 0;
    const activeFocusId = hoveredNodeId || activeNodeId;

    // Update Nodes styling
    svg.selectAll<SVGGElement, GraphNode>('.node-item').each(function (d) {
      const el = d3.select(this);
      const isVisible = visibleNodeIds.has(d.id);

      if (!isVisible) {
        el.attr('opacity', 0.08).attr('pointer-events', 'none');
        return;
      }

      el.attr('pointer-events', 'all');

      if (isPathActive) {
        const inPath = highlightedPath.includes(d.id);
        if (inPath) {
          el.attr('opacity', 1).attr('filter', 'url(#glow)');
          el.select('.node-ring').attr('stroke', '#fbbf24').attr('stroke-width', 3.5);
        } else {
          el.attr('opacity', 0.18).attr('filter', null);
          el.select('.node-ring').attr('stroke-width', 1);
        }
      } else if (activeFocusId) {
        const isFocused = d.id === activeFocusId;
        const isNeighbor = connectedIds?.has(d.id);

        if (isFocused) {
          el.attr('opacity', 1).attr('filter', 'url(#glow)');
          el.select('.node-ring')
            .attr('stroke', '#22d3ee')
            .attr('stroke-width', 4)
            .attr('stroke-dasharray', 'none');
        } else if (isNeighbor) {
          el.attr('opacity', 0.95).attr('filter', null);
          el.select('.node-ring').attr('stroke-width', 2);
        } else {
          el.attr('opacity', 0.14).attr('filter', null);
          el.select('.node-ring').attr('stroke-width', 1);
        }
      } else {
        // Normal state
        el.attr('opacity', 1).attr('filter', null);
        el.select('.node-ring').attr('stroke-width', d.status === 'completed' ? 2.5 : 1.5);
      }

      // Label visibility
      el.select('.node-label').attr('display', showLabels ? 'block' : activeFocusId === d.id ? 'block' : 'none');
    });

    // Update Links styling
    svg.selectAll<SVGLineElement, GraphLink>('.links line').each(function (d) {
      const el = d3.select(this);
      const sId = (d.source as GraphNode).id;
      const tId = (d.target as GraphNode).id;

      if (!visibleNodeIds.has(sId) || !visibleNodeIds.has(tId)) {
        el.attr('stroke-opacity', 0.03);
        return;
      }

      if (isPathActive) {
        // Check if this link is part of consecutive path
        let isPathLink = false;
        for (let i = 0; i < highlightedPath.length - 1; i++) {
          const a = highlightedPath[i];
          const b = highlightedPath[i + 1];
          if ((sId === a && tId === b) || (sId === b && tId === a)) {
            isPathLink = true;
            break;
          }
        }

        if (isPathLink) {
          el.attr('stroke', '#fbbf24')
            .attr('stroke-width', 3)
            .attr('stroke-opacity', 1)
            .attr('marker-end', 'url(#arrow-path)');
        } else {
          el.attr('stroke', '#334155')
            .attr('stroke-width', 1)
            .attr('stroke-opacity', 0.06)
            .attr('marker-end', 'url(#arrow-default)');
        }
      } else if (activeFocusId) {
        const isConnected =
          (sId === activeFocusId && connectedIds?.has(tId)) ||
          (tId === activeFocusId && connectedIds?.has(sId));

        if (isConnected) {
          el.attr('stroke', '#22d3ee')
            .attr('stroke-width', 2.4)
            .attr('stroke-opacity', 0.9)
            .attr('marker-end', 'url(#arrow-highlight)');
        } else {
          el.attr('stroke', '#334155')
            .attr('stroke-width', 1)
            .attr('stroke-opacity', 0.05)
            .attr('marker-end', 'url(#arrow-default)');
        }
      } else {
        el.attr('stroke', '#475569')
          .attr('stroke-width', 1.2)
          .attr('stroke-opacity', 0.35)
          .attr('marker-end', 'url(#arrow-default)');
      }
    });
  }, [
    visibleNodeIds,
    highlightedPath,
    activeNodeId,
    hoveredNodeId,
    connectedIds,
    showLabels,
  ]);

  // Zoom Controls Handlers
  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.3);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.77);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current || !containerRef.current) return;
    const width = containerRef.current.clientWidth || 1000;
    const height = Math.max(containerRef.current.clientHeight, 700);
    const initialTransform = d3.zoomIdentity.translate(width * 0.05, height * 0.05).scale(0.9);
    d3.select(svgRef.current).transition().duration(500).call(zoomBehaviorRef.current.transform, initialTransform);
  };

  const handleCenterOnNode = (nodeId: number) => {
    if (!svgRef.current || !zoomBehaviorRef.current || !containerRef.current) return;
    const nodeEl = d3.select(svgRef.current).selectAll<SVGGElement, GraphNode>('.node-item').filter((d) => d.id === nodeId);
    const d = nodeEl.datum();
    if (!d || d.x === undefined || d.y === undefined) return;

    const width = containerRef.current.clientWidth || 1000;
    const height = containerRef.current.clientHeight || 700;

    const scale = 1.6;
    const transform = d3.zoomIdentity
      .translate(width / 2 - d.x * scale, height / 2 - d.y * scale)
      .scale(scale);

    d3.select(svgRef.current).transition().duration(650).call(zoomBehaviorRef.current.transform, transform);
    setActiveNodeId(nodeId);
    computeLearningPath(nodeId);
  };

  // Toggle Simulation Physics Play/Pause
  const toggleSimulation = () => {
    if (!simulationRef.current) return;
    if (isSimRunning) {
      simulationRef.current.stop();
      setIsSimRunning(false);
    } else {
      simulationRef.current.alpha(0.3).restart();
      setIsSimRunning(true);
    }
  };

  // Total metrics
  const completedNodesCount = initialNodes.filter((n) => n.status === 'completed').length;
  const inProgressNodesCount = initialNodes.filter((n) => n.status === 'in_progress').length;
  const totalEdgesCount = initialLinks.length;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Top Banner & Control HUD */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Ambient Gradient Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold mb-2">
              <Network className="w-3.5 h-3.5" />
              <span>
                {language === 'pt' ? 'Visualização Interativa de Grafo (D3.js)' : 'Interactive Knowledge Graph (D3.js)'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>{language === 'pt' ? 'Grafo de Conhecimento dos 100 Conceitos' : '100 Concepts Knowledge Graph'}</span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl font-sans">
              {language === 'pt'
                ? 'Visualize como os 100 conceitos fundamentais se conectam, dependem uns dos outros e formam sua trilha de aprendizado. Arraste nós, trace fluxos de dependência e explore a arquitetura inteira.'
                : 'Visualize how the 100 fundamental concepts interconnect, depend on one another, and build your mastery path. Drag nodes, trace dependency paths, and explore the entire architecture.'}
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center flex-wrap gap-2.5 bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Circle className="w-3 h-3 text-cyan-400 fill-cyan-400" />
              <span className="font-bold">100</span> {language === 'pt' ? 'Nós' : 'Nodes'}
            </div>
            <span className="text-slate-700">•</span>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Share2 className="w-3 h-3 text-blue-400" />
              <span className="font-bold">{totalEdgesCount}</span> {language === 'pt' ? 'Conexões' : 'Edges'}
            </div>
            <span className="text-slate-700">•</span>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3 h-3" />
              <span className="font-bold">{completedNodesCount}%</span> {language === 'pt' ? 'Dominados' : 'Done'}
            </div>
          </div>
        </div>

        {/* Filters & Mode Toolbar */}
        <div className="mt-5 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          {/* Layout Modes */}
          <div className="flex items-center bg-slate-950/90 p-1 rounded-2xl border border-slate-800 text-xs font-mono font-bold">
            <button
              onClick={() => setLayoutMode('force')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                layoutMode === 'force'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Layout de Forças com física dinâmica"
            >
              <Network className="w-3.5 h-3.5" />
              <span>{language === 'pt' ? 'Força Livre' : 'Force Graph'}</span>
            </button>

            <button
              onClick={() => setLayoutMode('learning-path')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                layoutMode === 'learning-path'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Disposição hierárquica em etapas progressivas de aprendizado"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>{language === 'pt' ? 'Trilha DAG (Etapas)' : 'Learning Path DAG'}</span>
            </button>

            <button
              onClick={() => setLayoutMode('radial')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                layoutMode === 'radial'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Disposição concêntrica do básico ao avançado"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{language === 'pt' ? 'Radial' : 'Radial'}</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px] flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'pt' ? 'Buscar nó (ex: Spark, #45, Parquet)...' : 'Search node (e.g. Spark, #45)...'}
              className="w-full pl-9 pr-8 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Section Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs font-mono">
            <button
              onClick={() => setSelectedSection('all')}
              className={`px-2.5 py-1 rounded-xl transition-all ${
                selectedSection === 'all'
                  ? 'bg-slate-700 text-white font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {language === 'pt' ? 'Todas (7)' : 'All (7)'}
            </button>
            {SECTIONS.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setSelectedSection(sec.id)}
                className={`px-2.5 py-1 rounded-xl transition-all whitespace-nowrap flex items-center gap-1 ${
                  selectedSection === sec.id
                    ? `${SECTION_COLORS[sec.id].bg} ${SECTION_COLORS[sec.id].text} font-bold border border-current`
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: SECTION_COLORS[sec.id].primary }}
                />
                <span>S{sec.id}</span>
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="all">{language === 'pt' ? 'Todos os Status' : 'All Statuses'}</option>
            <option value="completed">🟢 {language === 'pt' ? 'Dominados' : 'Mastered'}</option>
            <option value="in_progress">🟡 {language === 'pt' ? 'Em Estudo' : 'In Progress'}</option>
            <option value="not_started">⚪ {language === 'pt' ? 'Não Iniciados' : 'Not Started'}</option>
            <option value="bookmarked">⭐ {language === 'pt' ? 'Favoritos' : 'Bookmarked'}</option>
          </select>
        </div>
      </div>

      {/* Main Interactive Graph Canvas & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 relative">
        {/* Canvas Area */}
        <div
          ref={containerRef}
          className={`bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden relative shadow-2xl transition-all ${
            activeNode ? 'lg:col-span-8 xl:col-span-9' : 'lg:col-span-12'
          }`}
          style={{ height: '740px' }}
        >
          {/* SVG Graph Canvas */}
          <svg
            ref={svgRef}
            className="w-full h-full cursor-grab active:cursor-grabbing select-none"
          />

          {/* Floating Canvas Navigation & Zoom HUD */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-xl">
            <button
              onClick={handleZoomIn}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Centralizar Visualização"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`p-2 rounded-xl transition-colors ${
                showLabels ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title={showLabels ? 'Ocultar rótulos dos nós' : 'Mostrar rótulos dos nós'}
            >
              <span className="text-[10px] font-mono font-bold">Aa</span>
            </button>
            <button
              onClick={toggleSimulation}
              className={`p-2 rounded-xl transition-colors ${
                isSimRunning ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
              }`}
              title={isSimRunning ? 'Pausar simulação física' : 'Retomar simulação física'}
            >
              {isSimRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>

          {/* Active Highlight Path Breadcrumb Banner */}
          {highlightedPath && highlightedPath.length > 0 && (
            <div className="absolute top-4 right-4 z-20 bg-slate-900/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-500/40 shadow-2xl flex items-center gap-3 max-w-md">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
              <div className="text-xs font-mono truncate">
                <span className="text-amber-400 font-bold">
                  {language === 'pt' ? 'Trilha Traçada:' : 'Active Trail:'}
                </span>{' '}
                <span className="text-slate-300">
                  {highlightedPath.map((id, idx) => (
                    <React.Fragment key={id}>
                      <button
                        onClick={() => handleCenterOnNode(id)}
                        className="hover:text-cyan-400 underline font-bold"
                      >
                        #{id}
                      </button>
                      {idx < highlightedPath.length - 1 && <span className="text-slate-600 mx-1">→</span>}
                    </React.Fragment>
                  ))}
                </span>
              </div>
              <button
                onClick={clearPathHighlight}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Bottom Floating Legend Bar */}
          <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-800 shadow-xl pointer-events-auto text-xs">
              {/* Status Indicators */}
              <div className="flex items-center gap-3 font-mono text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-400 inline-flex items-center justify-center text-[7px] text-emerald-300 font-bold">✓</span>
                  <span>{language === 'pt' ? 'Dominado' : 'Done'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-400 border-dashed" />
                  <span>{language === 'pt' ? 'Em Estudo' : 'Studying'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-slate-800 border border-slate-600" />
                  <span>{language === 'pt' ? 'Não Iniciado' : 'New'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px]">🧪</span>
                  <span>{language === 'pt' ? 'Tem Simulador' : 'Has Lab'}</span>
                </div>
              </div>

              {/* Interaction Hint */}
              <div className="text-slate-500 font-mono text-[11px] hidden sm:block">
                {language === 'pt'
                  ? '💡 Arraste os nós • Role para zoom • Clique no nó para inspecionar'
                  : '💡 Drag nodes • Scroll to zoom • Click node to inspect'}
              </div>
            </div>
          </div>
        </div>

        {/* Node Inspector Drawer / Sidebar */}
        {activeNode && (
          <div className="lg:col-span-4 xl:col-span-3 bg-slate-900/95 border border-slate-800 rounded-3xl p-5 backdrop-blur-xl shadow-2xl flex flex-col justify-between max-h-[740px] overflow-y-auto animate-fadeIn">
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs px-2 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold">
                    #{activeNode.id}
                  </span>
                  <span
                    className={`font-mono text-xs px-2 py-0.5 rounded-lg font-bold ${
                      SECTION_COLORS[activeNode.sectionId].bg
                    } ${SECTION_COLORS[activeNode.sectionId].text}`}
                  >
                    Seção {activeNode.sectionId}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setActiveNodeId(null);
                    clearPathHighlight();
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Concept Name & Tagline */}
              <div className="mt-4">
                <h3 className="text-lg font-extrabold text-white tracking-tight flex items-center justify-between gap-2">
                  <span>{activeNode.name}</span>
                  <button
                    onClick={() => onBookmarkToggle(activeNode.id)}
                    className={`p-1.5 rounded-xl border transition-colors ${
                      bookmarked.includes(activeNode.id)
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                    title={language === 'pt' ? 'Favoritar conceito' : 'Bookmark concept'}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-1 italic">
                  "{activeNode.tagline}"
                </p>
              </div>

              {/* Status Selector */}
              <div className="mt-4 p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                <div className="text-[11px] font-mono text-slate-400 mb-2 font-bold">
                  {language === 'pt' ? 'SEU STATUS DE APRENDIZADO:' : 'YOUR STUDY STATUS:'}
                </div>
                <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px] font-bold">
                  <button
                    onClick={() => onStatusChange(activeNode.id, 'not_started')}
                    className={`py-1.5 rounded-xl border text-center transition-all ${
                      (statusMap[activeNode.id] || 'not_started') === 'not_started'
                        ? 'bg-slate-800 text-white border-slate-600'
                        : 'bg-slate-900/60 text-slate-500 border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    {language === 'pt' ? 'Novo' : 'New'}
                  </button>
                  <button
                    onClick={() => onStatusChange(activeNode.id, 'in_progress')}
                    className={`py-1.5 rounded-xl border text-center transition-all ${
                      statusMap[activeNode.id] === 'in_progress'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-900/60 text-slate-500 border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    {language === 'pt' ? 'Estudando' : 'Studying'}
                  </button>
                  <button
                    onClick={() => {
                      onStatusChange(activeNode.id, 'completed');
                      sound.playSuccess();
                    }}
                    className={`py-1.5 rounded-xl border text-center transition-all ${
                      statusMap[activeNode.id] === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-900/60 text-slate-500 border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    {language === 'pt' ? 'Dominado' : 'Mastered'}
                  </button>
                </div>
              </div>

              {/* Overview Synopsis */}
              <div className="mt-4">
                <h4 className="text-xs font-mono font-bold text-slate-300 mb-1">
                  {language === 'pt' ? 'Resumo Arquitetural:' : 'Architectural Summary:'}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-sans line-clamp-4">
                  {activeNode.overview}
                </p>
              </div>

              {/* Path & Related Concepts */}
              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-mono font-bold text-slate-300">
                    {language === 'pt' ? 'Conceitos Conectados:' : 'Connected Concepts:'}
                  </h4>
                  <button
                    onClick={() => computeLearningPath(activeNode.id)}
                    className="text-[10px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold"
                    title="Traçar caminho a partir dos fundamentos"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{language === 'pt' ? 'Traçar Trilha' : 'Trace Path'}</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {activeNode.relatedIds.map((relId) => {
                    const relObj = CONCEPTS_BY_ID[relId];
                    if (!relObj) return null;
                    return (
                      <button
                        key={relId}
                        onClick={() => handleCenterOnNode(relId)}
                        className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-xs font-mono text-slate-300 hover:text-cyan-300 transition-all flex items-center gap-1.5 group"
                      >
                        <span className="text-[10px] text-cyan-400 font-bold">#{relId}</span>
                        <span className="truncate max-w-[120px]">{relObj.name}</span>
                        <ArrowRight className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => onSelectConcept(activeNode.id)}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>{language === 'pt' ? 'Ver Teoria & Prática Completa' : 'View Full Theory & Code'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <div className="grid grid-cols-2 gap-2">
                {activeNode.labType && onOpenLab ? (
                  <button
                    onClick={() => onOpenLab(activeNode.labType!)}
                    className="py-2 px-3 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{language === 'pt' ? 'Abrir Lab' : 'Launch Lab'}</span>
                  </button>
                ) : (
                  <div />
                )}

                {onOpenChatWithConcept && (
                  <button
                    onClick={() => onOpenChatWithConcept(activeNode.id)}
                    className="py-2 px-3 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>{language === 'pt' ? 'Dúvida IA' : 'Ask AI'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
