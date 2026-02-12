"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import {
    TbHome,
    TbLayoutDashboard,
    TbUserHeart,
    TbNetwork,
    TbGraph,
    TbPlayerPlay,
    TbPlayerPause,
    TbX,
    TbInfoCircle,
    TbZoomIn,
    TbZoomOut,
    TbArrowsMaximize,
    TbRefresh,
    TbChevronLeft,
    TbChevronRight,
} from "react-icons/tb";
import { Network } from "vis-network";

// Color palette for different semantic types
const semanticTypeColors: Record<string, { background: string; border: string }> = {
    "Pharmacologic Substance": { background: "#10b981", border: "#059669" },
    "Clinical Drug": { background: "#3b82f6", border: "#2563eb" },
    "Disease or Syndrome": { background: "#ef4444", border: "#dc2626" },
    "Amino Acid, Peptide, or Protein": { background: "#8b5cf6", border: "#7c3aed" },
    "Organic Chemical": { background: "#f59e0b", border: "#d97706" },
    "Enzyme": { background: "#ec4899", border: "#db2777" },
    "Indicator, Reagent, or Diagnostic Aid": { background: "#06b6d4", border: "#0891b2" },
    "Hazardous or Poisonous Substance": { background: "#f97316", border: "#ea580c" },
    "Biologically Active Substance": { background: "#84cc16", border: "#65a30d" },
    "Hormone": { background: "#a855f7", border: "#9333ea" },
    "Antibiotic": { background: "#14b8a6", border: "#0d9488" },
    "Vitamin": { background: "#eab308", border: "#ca8a04" },
    "Sign or Symptom": { background: "#fb7185", border: "#f43f5e" },
    "Finding": { background: "#94a3b8", border: "#64748b" },
    "Laboratory or Test Result": { background: "#22d3ee", border: "#06b6d4" },
};

const defaultColor = { background: "#427466", border: "#365f54" };

export default function UMLSGraphPage() {
    const pathname = usePathname();
    const containerRef = useRef<HTMLDivElement>(null);
    const networkRef = useRef<Network | null>(null);

    // Navigation items
    const navItems = [
        { name: "Home", href: "/", icon: TbHome },
        { name: "UMLS Graph", href: "/umls-graph", icon: TbNetwork },
        { name: "Dashboard", href: "/dashboard", icon: TbLayoutDashboard },
        { name: "Patient DR", href: "/patient-dr", icon: TbUserHeart },
        { name: "Model Comparison", href: "/model-compare", icon: TbGraph },
    ];

    // State
    const [graph, setGraph] = useState<any>(null);
    const [selectedNode, setSelectedNode] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Pagination state
    const [nodeLimit, setNodeLimit] = useState(500);
    const [currentOffset, setCurrentOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    // Load sampled graph
    const loadGraph = useCallback(async (offset: number = 0, limit: number = 500) => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/umls-graph", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "getSampledGraph", offset, limit }),
            });

            const data = await res.json();

            if (data.error) {
                setError(data.error);
                setIsLoading(false);
                return;
            }

            setGraph({ nodes: data.nodes, edges: data.edges });
            setStats({
                totalNodes: data.totalNodes,
                totalEdges: data.totalEdges,
                displayedNodes: data.displayedNodes,
                displayedEdges: data.displayedEdges,
            });
            setCurrentOffset(offset);
            setHasMore(data.hasMore);
        } catch (err) {
            console.error("Failed to load graph:", err);
            setError("Failed to load graph data");
        }

        setIsLoading(false);
    }, []);

    // Load initial graph on mount
    useEffect(() => {
        loadGraph(0, nodeLimit);
    }, []);

    // Initialize network when graph data is ready
    useEffect(() => {
        if (!graph || !containerRef.current) return;

        // Destroy existing network
        if (networkRef.current) {
            networkRef.current.destroy();
            networkRef.current = null;
        }

        // Apply colors based on semantic type
        const coloredNodes = graph.nodes.map((node: any) => {
            const color = semanticTypeColors[node.group] || defaultColor;
            return {
                ...node,
                color: {
                    background: color.background,
                    border: color.border,
                    highlight: { background: color.background, border: "#fff" },
                    hover: { background: color.background, border: "#fff" },
                },
                size: 12,
                font: { size: 10, color: "#333", strokeWidth: 2, strokeColor: "#fff" },
            };
        });

        // Style edges 
        const styledEdges = graph.edges.map((edge: any) => ({
            ...edge,
            width: 1,
            color: { color: "#999", highlight: "#427466", hover: "#427466" },
            arrows: { to: { enabled: true, scaleFactor: 0.5 } },
            smooth: { enabled: true, type: "continuous", roundness: 0.5 },
        }));

        const options = {
            nodes: {
                shape: "dot",
                borderWidth: 2,
                shadow: false,
            },
            edges: {
                shadow: false,
                font: { size: 8, color: "#666" },
            },
            physics: {
                enabled: true,
                stabilization: {
                    enabled: true,
                    iterations: 300,
                    updateInterval: 25,
                    fit: true,
                },
                forceAtlas2Based: {
                    gravitationalConstant: -30,
                    centralGravity: 0.01,
                    springLength: 80,
                    springConstant: 0.08,
                    damping: 0.4,
                    avoidOverlap: 0.5,
                },
                solver: "forceAtlas2Based",
                minVelocity: 0.75,
                maxVelocity: 30,
            },
            interaction: {
                hover: true,
                tooltipDelay: 100,
                hideEdgesOnDrag: true,
                hideEdgesOnZoom: true,
                keyboard: true,
                dragNodes: true,
                dragView: true,
                zoomView: true,
                navigationButtons: true,
            },
            layout: {
                improvedLayout: true,
                randomSeed: 42,
            },
        };

        const network = new Network(
            containerRef.current,
            { nodes: coloredNodes, edges: styledEdges },
            options
        );

        networkRef.current = network;

        network.on("stabilizationIterationsDone", () => {
            network.setOptions({ physics: { enabled: isAnimating } });
        });

        network.on("click", (params) => {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                const node = graph.nodes.find((n: any) => n.id === nodeId);
                if (node) {
                    setSelectedNode(node);
                }
            } else {
                setSelectedNode(null);
            }
        });

        return () => {
            if (networkRef.current) {
                networkRef.current.destroy();
                networkRef.current = null;
            }
        };
    }, [graph, isAnimating]);

    // Update physics when animation toggle changes
    useEffect(() => {
        if (networkRef.current) {
            networkRef.current.setOptions({ physics: { enabled: isAnimating } });
        }
    }, [isAnimating]);

    const handleZoomIn = useCallback(() => {
        if (networkRef.current) {
            const scale = networkRef.current.getScale();
            networkRef.current.moveTo({ scale: scale * 1.5, animation: true });
        }
    }, []);

    const handleZoomOut = useCallback(() => {
        if (networkRef.current) {
            const scale = networkRef.current.getScale();
            networkRef.current.moveTo({ scale: scale / 1.5, animation: true });
        }
    }, []);

    const handleFit = useCallback(() => {
        if (networkRef.current) {
            networkRef.current.fit({ animation: true });
        }
    }, []);

    const handlePrevPage = () => {
        const newOffset = Math.max(0, currentOffset - nodeLimit);
        loadGraph(newOffset, nodeLimit);
    };

    const handleNextPage = () => {
        if (hasMore) {
            loadGraph(currentOffset + nodeLimit, nodeLimit);
        }
    };

    const handleLimitChange = (newLimit: number) => {
        setNodeLimit(newLimit);
        loadGraph(0, newLimit);
    };

    return (
        <div className="min-h-screen bg-[#F9F9F9] relative">
            {/* Background Pattern */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 600'%3E%3Cdefs%3E%3Cpattern id='graph' x='0' y='0' width='200' height='200' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='50' cy='50' r='8' fill='%23427466'/%3E%3Ccircle cx='150' cy='50' r='6' fill='%23427466'/%3E%3Ccircle cx='100' cy='100' r='10' fill='%23427466'/%3E%3Ccircle cx='50' cy='150' r='5' fill='%23427466'/%3E%3Ccircle cx='150' cy='150' r='7' fill='%23427466'/%3E%3Cline x1='50' y1='50' x2='100' y2='100' stroke='%23427466' stroke-width='1.5'/%3E%3Cline x1='150' y1='50' x2='100' y2='100' stroke='%23427466' stroke-width='1.5'/%3E%3Cline x1='100' y1='100' x2='50' y2='150' stroke='%23427466' stroke-width='1.5'/%3E%3Cline x1='100' y1='100' x2='150' y2='150' stroke='%23427466' stroke-width='1.5'/%3E%3Cline x1='50' y1='50' x2='150' y2='50' stroke='%23427466' stroke-width='1'/%3E%3Cline x1='50' y1='150' x2='150' y2='150' stroke='%23427466' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23graph)'/%3E%3C/svg%3E")`,
                    backgroundSize: "400px 400px",
                    opacity: 0.08,
                }}
            />

            {/* Header / Navbar */}
            <header className="flex justify-between h-20 px-12 py-5 bg-[#ffffff] shadow-md relative z-10">
                <Link href="/" className="flex items-center gap-3 pl-6 cursor-pointer">
                    <h1 className="text-xl font-medium text-[#1a1a1a]">
                        <b>Drug Recommendation System</b>
                    </h1>
                </Link>

                <nav className="flex items-center gap-4 pr-6">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-2 rounded-xl text-sm cursor-pointer font-medium transition-all duration-200 px-5 py-2 ${pathname === item.href
                                    ? "bg-[#427466] text-white"
                                    : "bg-[#D9D9D9] text-[#333333] hover:bg-[#c9c9c9]"
                                    }`}
                            >
                                {Icon && <Icon className="w-4 h-4" />}
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </header>

            {/* Main Content */}
            <main className="relative z-10 p-6 h-[calc(100vh-80px)]">
                <div className="flex gap-4 h-full">
                    {/* Graph Container */}
                    <div className="flex-1 bg-white rounded-2xl shadow-lg overflow-hidden relative">
                        {/* Loading Overlay */}
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                                <div className="w-12 h-12 border-4 border-[#427466] border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-gray-600">Loading graph...</p>
                            </div>
                        )}

                        {/* Error Display */}
                        {error && (
                            <div className="absolute inset-0 flex items-center justify-center z-20">
                                <div className="text-center p-8">
                                    <TbNetwork className="w-16 h-16 text-red-400 mx-auto mb-4" />
                                    <p className="text-red-500 text-lg mb-2">Error Loading Graph</p>
                                    <p className="text-gray-500 mb-4">{error}</p>
                                    <button
                                        onClick={() => loadGraph(currentOffset, nodeLimit)}
                                        className="px-4 py-2 bg-[#427466] text-white rounded-lg hover:bg-[#365f54]"
                                    >
                                        Retry
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Top Controls */}
                        <div className="absolute top-4 left-4 z-10 flex items-center gap-3 flex-wrap">
                            {/* Stats Badge */}
                            {stats && (
                                <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-4 py-2 flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-[#427466]"></span>
                                        <span className="text-sm text-gray-700">
                                            <b>{stats.displayedNodes?.toLocaleString()}</b>
                                            <span className="text-gray-400"> / {stats.totalNodes?.toLocaleString()}</span> Nodes
                                        </span>
                                    </div>
                                    <div className="w-px h-5 bg-gray-300"></div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-5 h-0.5 bg-[#427466]"></span>
                                        <span className="text-sm text-gray-700">
                                            <b>{stats.displayedEdges?.toLocaleString()}</b> Edges
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Node Limit Selector */}
                            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-3 py-2 flex items-center gap-2">
                                <span className="text-sm text-gray-600">Show:</span>
                                <select
                                    value={nodeLimit}
                                    onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                                    className="text-sm bg-transparent border-none focus:outline-none font-medium text-[#427466] cursor-pointer"
                                >
                                    <option value={100}>100 nodes</option>
                                    <option value={250}>250 nodes</option>
                                    <option value={500}>500 nodes</option>
                                    <option value={1000}>1,000 nodes</option>
                                    <option value={2000}>2,000 nodes</option>
                                    <option value={5000}>5,000 nodes</option>
                                </select>
                            </div>

                            {/* Pagination */}
                            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-2 py-1 flex items-center gap-1">
                                <button
                                    onClick={handlePrevPage}
                                    disabled={currentOffset === 0 || isLoading}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Previous"
                                >
                                    <TbChevronLeft className="w-5 h-5 text-gray-700" />
                                </button>
                                <span className="text-sm text-gray-600 px-2">
                                    {currentOffset + 1} - {Math.min(currentOffset + nodeLimit, stats?.totalNodes || 0)}
                                </span>
                                <button
                                    onClick={handleNextPage}
                                    disabled={!hasMore || isLoading}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Next"
                                >
                                    <TbChevronRight className="w-5 h-5 text-gray-700" />
                                </button>
                            </div>

                            {/* Physics Toggle */}
                            {/* <button
                                onClick={() => setIsAnimating(!isAnimating)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg transition-all ${isAnimating
                                        ? "bg-[#427466] text-white"
                                        : "bg-white/95 text-gray-700 hover:bg-white"
                                    }`}
                                title={isAnimating ? "Pause Animation" : "Start Animation"}
                            >
                                {isAnimating ? (
                                    <>
                                        <TbPlayerPause className="w-4 h-4" />
                                        <span className="text-sm font-medium"> On</span>
                                    </>
                                ) : (
                                    <>
                                        <TbPlayerPlay className="w-4 h-4" />
                                        <span className="text-sm font-medium"> Off</span>
                                    </>
                                )}
                            </button> */}

                            {/* Refresh */}
                            <button
                                onClick={() => loadGraph(currentOffset, nodeLimit)}
                                disabled={isLoading}
                                className="p-2.5 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white transition-colors disabled:opacity-50"
                                title="Refresh"
                            >
                                <TbRefresh className={`w-5 h-5 text-gray-700 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        {/* Zoom Controls */}
                        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                            <button
                                onClick={handleZoomIn}
                                className="p-2.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white transition-colors"
                                title="Zoom In"
                            >
                                <TbZoomIn className="w-5 h-5 text-gray-700" />
                            </button>
                            <button
                                onClick={handleZoomOut}
                                className="p-2.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white transition-colors"
                                title="Zoom Out"
                            >
                                <TbZoomOut className="w-5 h-5 text-gray-700" />
                            </button>
                            <button
                                onClick={handleFit}
                                className="p-2.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white transition-colors"
                                title="Fit to View"
                            >
                                <TbArrowsMaximize className="w-5 h-5 text-gray-700" />
                            </button>
                        </div>

                        {/* Legend */}
                        {/* <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-4 py-3">
                            <p className="text-xs font-medium text-gray-500 mb-2">Semantic Types</p>
                            <div className="flex flex-wrap gap-2 max-w-xs">
                                {Object.entries(semanticTypeColors).slice(0, 6).map(([type, color]) => (
                                    <div key={type} className="flex items-center gap-1">
                                        <span
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: color.background }}
                                        ></span>
                                        <span className="text-xs text-gray-600">{type.split(" ")[0]}</span>
                                    </div>
                                ))}
                            </div>
                        </div> */}

                        {/* Graph Canvas */}
                        <div ref={containerRef} className="w-full h-full" />
                    </div>

                    {/* Node Details Panel */}
                    {selectedNode && (
                        <div className="w-80 bg-white rounded-2xl shadow-lg p-5 overflow-y-auto flex-shrink-0">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <TbInfoCircle className="w-5 h-5 text-[#427466]" />
                                    Node Details
                                </h2>
                                <button
                                    onClick={() => setSelectedNode(null)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                >
                                    <TbX className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        CUI
                                    </label>
                                    <p className="text-sm text-gray-800 font-mono bg-gray-100 px-2 py-1 rounded mt-1">
                                        {selectedNode.fullData?.cui}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Preferred Name
                                    </label>
                                    <p className="text-sm text-gray-800 mt-1">
                                        {selectedNode.fullData?.preferred_name}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Semantic Types
                                    </label>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {selectedNode.fullData?.semantic_types?.split(";").map((type: string, i: number) => (
                                            <span
                                                key={i}
                                                className="px-2 py-0.5 bg-[#427466]/10 text-[#427466] text-xs rounded-full"
                                            >
                                                {type.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Sources
                                    </label>
                                    <p className="text-sm text-gray-800 mt-1">
                                        {selectedNode.fullData?.sources}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Synonyms
                                    </label>
                                    <p className="text-sm text-gray-600 mt-1 max-h-32 overflow-y-auto text-xs">
                                        {selectedNode.fullData?.synonyms || "N/A"}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Codes
                                    </label>
                                    <p className="text-xs text-gray-600 font-mono mt-1 break-all max-h-24 overflow-y-auto">
                                        {selectedNode.fullData?.codes || "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
