"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import {
    TbZoomIn, TbZoomOut, TbArrowsMaximize, TbStar, TbLoader2,
    TbChevronDown, TbChevronUp, TbPill, TbTag, TbCode, TbDatabase,
    TbSearch, TbUser, TbHome, TbLayoutDashboard, TbUserHeart, TbNetwork
} from "react-icons/tb";

// API base URLs
const RECOMMEND_API = "http://localhost:8001";  // Drug recommendation backend
const CUI_API = "http://localhost:8000";  // CUI lookup backend

interface DrugRecommendation {
    cuid: string;
    score: number;
    concept_idx: number;
}

interface DrugDetails {
    name: string;
    node_type: string;
    semantic_types: string;
    canonical_code: string;
    sources: string;
    codes: string;
    synonyms: string;
}

interface NodePosition {
    x: number;
    y: number;
    vx: number;
    vy: number;
}

// Floating Label Input Component
interface FloatingInputProps {
    value: string;
    onChange: (value: string) => void;
    onKeyDown?: (e: React.KeyboardEvent) => void;
    placeholder: string;
    icon?: React.ReactNode;
}

function FloatingInput({ value, onChange, onKeyDown, placeholder, icon }: FloatingInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value.length > 0;
    const isFloating = isFocused || hasValue;

    return (
        <div className="relative">
            {icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666] z-10">
                    {icon}
                </div>
            )}
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={onKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={`w-72 px-4 py-3 ${icon ? 'pl-10' : ''} border-2 rounded-lg text-sm bg-white focus:outline-none transition-all duration-200
                    ${isFocused ? 'border-[#427466]' : 'border-[#e5e5e5]'}`}
            />
            <label
                className={`absolute left-3 ${icon ? 'left-10' : ''} transition-all duration-200 pointer-events-none px-1 bg-white
                    ${isFloating
                        ? '-top-2.5 text-xs text-[#427466] font-medium'
                        : 'top-1/2 -translate-y-1/2 text-sm text-[#999]'
                    }`}
            >
                {placeholder}
            </label>
        </div>
    );
}

// Expandable Drug Card Component
interface DrugCardProps {
    drug: DrugRecommendation;
    rank: number;
    isTop: boolean;
    maxScore: number;
}

function DrugCard({ drug, rank, isTop, maxScore }: DrugCardProps) {
    const [expanded, setExpanded] = useState(false);
    const [details, setDetails] = useState<DrugDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [drugName, setDrugName] = useState<string>("");

    // Fetch drug name on mount
    useEffect(() => {
        const fetchName = async () => {
            try {
                const res = await fetch(`${CUI_API}/api/cui/${drug.cuid}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.found && data.data) {
                        setDrugName(data.data.name || drug.cuid);
                        setDetails(data.data);
                    }
                }
            } catch {
                setDrugName(drug.cuid);
            }
        };
        fetchName();
    }, [drug.cuid]);

    const handleExpand = () => {
        setExpanded(!expanded);
    };

    return (
        <div
            onClick={handleExpand}
            className={`rounded-xl border overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-md ${isTop ? "bg-[#F0FDF4] border-[#86EFAC]" : "bg-white border-[#e5e5e5] hover:border-[#427466]"
                }`}
        >
            {/* Main Card Content */}
            <div className="p-4">
                {/* Header Row: Rank, Drug Info, Score, Expand Icon */}
                <div className="flex items-start gap-3">
                    {/* Rank Badge */}
                    <span
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold flex-shrink-0 ${isTop ? "bg-[#84CC16] text-white" : "bg-[#E5E7EB] text-[#333]"
                            }`}
                    >
                        {rank}
                    </span>

                    {/* Drug Name and CUID */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <TbPill className="w-4 h-4 text-[#427466] flex-shrink-0" />
                            <span className="text-sm font-semibold text-[#333] truncate">
                                {drugName || drug.cuid}
                            </span>
                        </div>
                        <p className="text-xs text-[#666] mt-0.5 flex items-center gap-1">
                            <TbTag className="w-3 h-3 flex-shrink-0" />
                            {drug.cuid}
                        </p>
                    </div>

                    {/* Score and Expand Icon */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="text-right">
                            <span className="text-lg font-bold text-[#333]">{drug.score.toFixed(2)}</span>
                            <p className="text-xs text-[#666]">score</p>
                        </div>
                        {expanded ? (
                            <TbChevronUp className="w-5 h-5 text-[#666]" />
                        ) : (
                            <TbChevronDown className="w-5 h-5 text-[#666]" />
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                    <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[#3C3CE8] to-[#7373FF] rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((drug.score / maxScore) * 100, 100)}%` }}
                        />
                    </div>
                </div>

                {/* Top Recommendation Label */}
                {isTop && (
                    <p className="text-xs text-[#427466] mt-2 flex items-center gap-1">
                        <TbStar className="w-3 h-3 fill-[#427466]" />
                        Highest confidence recommendation
                    </p>
                )}
            </div>

            {/* Expanded Details Section */}
            {expanded && details && (
                <div className="px-4 pb-4">
                    <div className="bg-[#f8f9fa] rounded-lg p-4 space-y-3 text-sm">
                        {/* Drug Name */}
                        <div className="flex items-start gap-3">
                            <TbPill className="w-5 h-5 text-[#427466] mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-[#999] uppercase tracking-wide font-medium">Drug Name</p>
                                <p className="text-[#333] font-medium">{details.name}</p>
                            </div>
                        </div>

                        {/* Semantic Types */}
                        <div className="flex items-start gap-3">
                            <TbTag className="w-5 h-5 text-[#427466] mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-[#999] uppercase tracking-wide font-medium">Semantic Types</p>
                                <p className="text-[#333]">{details.semantic_types}</p>
                            </div>
                        </div>

                        {/* Canonical Code */}
                        <div className="flex items-start gap-3">
                            <TbCode className="w-5 h-5 text-[#427466] mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-[#999] uppercase tracking-wide font-medium">Canonical Code</p>
                                <p className="text-[#333] font-mono text-sm bg-white px-2 py-1 rounded border">{details.canonical_code}</p>
                            </div>
                        </div>

                        {/* Sources */}
                        <div className="flex items-start gap-3">
                            <TbDatabase className="w-5 h-5 text-[#427466] mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-[#999] uppercase tracking-wide font-medium">Sources</p>
                                <p className="text-[#333]">{details.sources}</p>
                            </div>
                        </div>

                        {/* Synonyms */}
                        {details.synonyms && (
                            <div className="pt-3 border-t border-[#e5e5e5]">
                                <p className="text-xs text-[#999] uppercase tracking-wide font-medium mb-2">Synonyms</p>
                                <div className="flex flex-wrap gap-1">
                                    {details.synonyms.split(';').slice(0, 3).map((syn, i) => (
                                        <span key={i} className="px-2 py-1 bg-white border border-[#e5e5e5] rounded text-xs text-[#555]">
                                            {syn.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// Interactive Network Graph Component
interface NetworkGraphProps {
    patientId: string;
    recommendations: DrugRecommendation[];
    drugNames: Record<string, string>;
}

function NetworkGraph({ patientId, recommendations, drugNames }: NetworkGraphProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [draggingNode, setDraggingNode] = useState<number | null>(null);
    const [nodePositions, setNodePositions] = useState<NodePosition[]>([]);
    const [patientPos, setPatientPos] = useState<NodePosition>({ x: 300, y: 220, vx: 0, vy: 0 });

    useEffect(() => {
        if (recommendations.length === 0) return;

        const centerX = 300;
        const centerY = 220;
        const radius = 160;

        const initialPositions = recommendations.map((_, index) => {
            const angle = (index * 2 * Math.PI / recommendations.length) - Math.PI / 2;
            const randomOffset = (Math.random() - 0.5) * 30;
            return {
                x: centerX + (radius + randomOffset) * Math.cos(angle),
                y: centerY + (radius + randomOffset) * Math.sin(angle),
                vx: 0,
                vy: 0
            };
        });

        setNodePositions(initialPositions);
        setPatientPos({ x: centerX, y: centerY, vx: 0, vy: 0 });
    }, [recommendations]);

    useEffect(() => {
        if (nodePositions.length === 0 || draggingNode !== null) return;

        const intervalId = setInterval(() => {
            setNodePositions(prev => {
                return prev.map((node, i) => {
                    const angle = (i * 2 * Math.PI / prev.length) - Math.PI / 2;
                    const idealX = patientPos.x + 160 * Math.cos(angle);
                    const idealY = patientPos.y + 160 * Math.sin(angle);

                    const dx = idealX - node.x;
                    const dy = idealY - node.y;

                    const springForce = 0.02;
                    const damping = 0.9;

                    const newVx = (node.vx + dx * springForce) * damping;
                    const newVy = (node.vy + dy * springForce) * damping;

                    return {
                        x: node.x + newVx,
                        y: node.y + newVy,
                        vx: Math.abs(newVx) < 0.01 ? 0 : newVx,
                        vy: Math.abs(newVy) < 0.01 ? 0 : newVy
                    };
                });
            });
        }, 50);

        return () => clearInterval(intervalId);
    }, [nodePositions.length, draggingNode, patientPos]);

    const handleMouseDown = useCallback((index: number, e: React.MouseEvent) => {
        e.preventDefault();
        setDraggingNode(index);
    }, []);

    const handlePatientMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setDraggingNode(-1);
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (draggingNode === null || !svgRef.current) return;

        const svg = svgRef.current;
        const rect = svg.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 600;
        const y = ((e.clientY - rect.top) / rect.height) * 440;

        if (draggingNode === -1) {
            setPatientPos(prev => ({ ...prev, x, y }));
        } else {
            setNodePositions(prev => {
                const newPositions = [...prev];
                newPositions[draggingNode] = { ...newPositions[draggingNode], x, y, vx: 0, vy: 0 };
                return newPositions;
            });
        }
    }, [draggingNode]);

    const handleMouseUp = useCallback(() => {
        setDraggingNode(null);
    }, []);

    const getNodeColor = (normalizedScore: number) => {
        const hue = 145;
        const saturation = 70;
        const lightness = 65 - (normalizedScore * 35);
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };

    const getEdgeColor = (normalizedScore: number) => {
        const opacity = 0.4 + (normalizedScore * 0.4);
        return `rgba(66, 116, 102, ${opacity})`;
    };

    if (recommendations.length === 0 || nodePositions.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <p className="text-[#999]">Enter a Patient ID to see the network</p>
            </div>
        );
    }

    const scores = recommendations.map(r => r.score);
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const scoreRange = maxScore - minScore || 1;

    return (
        <div className="w-full h-full relative">
            <svg
                ref={svgRef}
                viewBox="0 0 600 440"
                className="w-full h-full cursor-grab active:cursor-grabbing"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Edges */}
                {nodePositions.map((node, index) => {
                    const normalizedScore = (recommendations[index].score - minScore) / scoreRange;
                    return (
                        <line
                            key={`edge-${index}`}
                            x1={patientPos.x}
                            y1={patientPos.y}
                            x2={node.x}
                            y2={node.y}
                            stroke={getEdgeColor(normalizedScore)}
                            strokeWidth={2 + normalizedScore * 2}
                            strokeLinecap="round"
                        />
                    );
                })}

                {/* Drug Nodes */}
                {nodePositions.map((node, index) => {
                    const drug = recommendations[index];
                    const normalizedScore = (drug.score - minScore) / scoreRange;
                    const nodeColor = getNodeColor(normalizedScore);
                    const name = drugNames[drug.cuid] || drug.cuid;
                    const shortName = name.length > 12 ? name.substring(0, 12) + '...' : name;

                    return (
                        <g
                            key={`drug-${index}`}
                            className="cursor-grab active:cursor-grabbing"
                            onMouseDown={(e) => handleMouseDown(index, e)}
                        >
                            {normalizedScore > 0.6 && (
                                <circle cx={node.x} cy={node.y} r={42} fill={nodeColor} opacity={0.25} />
                            )}

                            <circle
                                cx={node.x}
                                cy={node.y}
                                r={35}
                                fill={nodeColor}
                                stroke="#fff"
                                strokeWidth={3}
                                style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.2))' }}
                            />

                            <circle cx={node.x + 25} cy={node.y - 25} r={13} fill="#427466" stroke="#fff" strokeWidth={2} />
                            <text x={node.x + 25} y={node.y - 21} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#fff">
                                {index + 1}
                            </text>

                            <text
                                x={node.x}
                                y={node.y + 5}
                                textAnchor="middle"
                                fontSize={8}
                                fontWeight="600"
                                fill="#fff"
                                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
                            >
                                {shortName}
                            </text>

                            <text x={node.x} y={node.y + 55} textAnchor="middle" fontSize={11} fill="#555" fontWeight="500">
                                {drug.score.toFixed(2)}
                            </text>
                        </g>
                    );
                })}

                {/* Patient Node */}
                <g className="cursor-grab active:cursor-grabbing" onMouseDown={handlePatientMouseDown}>
                    <circle
                        cx={patientPos.x}
                        cy={patientPos.y}
                        r={52}
                        fill="#E8F5E9"
                        stroke="#427466"
                        strokeWidth={3}
                        style={{ filter: 'drop-shadow(0 4px 10px rgba(66,116,102,0.35))' }}
                    />
                    <circle cx={patientPos.x} cy={patientPos.y} r={42} fill="#427466" />
                    <text x={patientPos.x} y={patientPos.y - 3} textAnchor="middle" fontSize={26} fill="#fff">
                        👤
                    </text>
                    <text x={patientPos.x} y={patientPos.y + 20} textAnchor="middle" fontSize={9} fontWeight="600" fill="#fff">
                        {patientId.length > 10 ? `...${patientId.slice(-8)}` : patientId}
                    </text>
                </g>
            </svg>
        </div>
    );
}

export default function PatientDR() {
    const pathname = usePathname();
    const [patientId, setPatientId] = useState("");
    const [searchedPatientId, setSearchedPatientId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recommendations, setRecommendations] = useState<DrugRecommendation[]>([]);
    const [drugNames, setDrugNames] = useState<Record<string, string>>({});
    const [zoom, setZoom] = useState(1);

    const navItems = [
        { name: "Home", href: "/" },
        { name: "Dashboard", href: "/dashboard" },
        { name: "Patient DR", href: "/patient-dr" },
        // { name: "Disease - Drug", href: "/disease-drug" },
        { name: "Model Comparison", href: "/model-compare" },
    ];

    const handleSearch = async () => {
        if (!patientId.trim()) {
            setError("Please enter a Patient ID");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${RECOMMEND_API}/api/recommend`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ patient_id: patientId, top_k: 5 }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Failed to get recommendations");
            }

            const data = await response.json();
            setRecommendations(data.recommendations);
            setSearchedPatientId(patientId);

            // Fetch drug names for the graph
            const names: Record<string, string> = {};
            for (const drug of data.recommendations) {
                try {
                    const res = await fetch(`${CUI_API}/api/cui/${drug.cuid}`);
                    if (res.ok) {
                        const cuiData = await res.json();
                        if (cuiData.found && cuiData.data) {
                            names[drug.cuid] = cuiData.data.name;
                        }
                    }
                } catch {
                    names[drug.cuid] = drug.cuid;
                }
            }
            setDrugNames(names);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            setRecommendations([]);
        } finally {
            setLoading(false);
        }
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
    const handleZoomReset = () => setZoom(1);

    const maxScore = recommendations.length > 0 ? recommendations[0].score : 1;

    return (
        <div className="min-h-screen bg-[#F9F9F9] relative overflow-hidden">
            {/* Background */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 600'%3E%3Cdefs%3E%3Cpattern id='graph' x='0' y='0' width='200' height='200' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='50' cy='50' r='8' fill='%23427466'/%3E%3Ccircle cx='150' cy='50' r='6' fill='%23427466'/%3E%3Ccircle cx='100' cy='100' r='10' fill='%23427466'/%3E%3Ccircle cx='50' cy='150' r='5' fill='%23427466'/%3E%3Ccircle cx='150' cy='150' r='7' fill='%23427466'/%3E%3Cline x1='50' y1='50' x2='100' y2='100' stroke='%23427466' stroke-width='1.5'/%3E%3Cline x1='150' y1='50' x2='100' y2='100' stroke='%23427466' stroke-width='1.5'/%3E%3Cline x1='100' y1='100' x2='50' y2='150' stroke='%23427466' stroke-width='1.5'/%3E%3Cline x1='100' y1='100' x2='150' y2='150' stroke='%23427466' stroke-width='1.5'/%3E%3Cline x1='50' y1='50' x2='150' y2='50' stroke='%23427466' stroke-width='1'/%3E%3Cline x1='50' y1='150' x2='150' y2='150' stroke='%23427466' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23graph)'/%3E%3C/svg%3E")`,
                    backgroundSize: "400px 400px",
                    opacity: 0.08,
                }}
            />

            {/* Header */}
            <header className="flex justify-between h-20 px-12 py-5 bg-[#ffffff] shadow-md relative z-10">
                <div className="flex items-center gap-3 pl-6">
                    <h1 className="text-xl font-medium text-[#1a1a1a]">
                        <b>Drug Recommendation System</b>
                    </h1>
                </div>
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
            <main className="relative z-10">
                <div className="w-full px-8 py-6">
                    <div className="mb-8 animate-fade-in">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-[#427466] to-[#365f54]">
                                <TbUserHeart className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-[32px] font-bold text-[#1a1a1a] tracking-tight">
                                Patient Drug Recommendation
                            </h2>
                        </div>
                        <p className="text-[#666] text-base mt-1 ml-14">
                            Personalized drug recommendations based on patient profile and network
                        </p>
                    </div>

                    {/* Search Section with Floating Label */}
                    <div className="bg-white rounded-2xl border border-[#e5e5e5] p-5 mb-5 inline-flex items-center gap-4">
                        <FloatingInput
                            value={patientId}
                            onChange={setPatientId}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            placeholder="Enter Patient ID"
                            icon={<TbUser className="w-5 h-5" />}
                        />
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="px-6 py-3 bg-[#427466] text-white rounded-lg text-sm font-medium hover:bg-[#365f54] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                                <TbLoader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <TbSearch className="w-5 h-5" />
                            )}
                            {loading ? "Searching..." : "Search"}
                        </button>
                    </div>

                    {error && (
                        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-[1fr_450px] gap-5">
                        {/* Left Panel - Network */}
                        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-5 relative overflow-hidden h-[520px]">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-semibold text-[#333] flex items-center gap-2">
                                    <TbNetwork className="w-4 h-4 text-[#427466]" />
                                    Patient - Drug Network
                                </h3>
                                <div className="flex gap-2">
                                    <button onClick={handleZoomIn} className="w-10 h-10 flex items-center justify-center border border-[#e5e5e5] rounded-lg hover:bg-[#f5f5f5] transition-colors">
                                        <TbZoomIn className="w-5 h-5 text-[#666]" />
                                    </button>
                                    <button onClick={handleZoomOut} className="w-10 h-10 flex items-center justify-center border border-[#e5e5e5] rounded-lg hover:bg-[#f5f5f5] transition-colors">
                                        <TbZoomOut className="w-5 h-5 text-[#666]" />
                                    </button>
                                    <button onClick={handleZoomReset} className="w-10 h-10 flex items-center justify-center border border-[#e5e5e5] rounded-lg hover:bg-[#f5f5f5] transition-colors">
                                        <TbArrowsMaximize className="w-5 h-5 text-[#666]" />
                                    </button>
                                </div>
                            </div>

                            <div
                                className="h-[calc(100%-80px)]"
                                style={{ transform: `scale(${zoom})`, transition: 'transform 0.3s ease', transformOrigin: 'center' }}
                            >
                                {loading ? (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="text-center">
                                            <TbLoader2 className="w-12 h-12 text-[#427466] animate-spin mx-auto mb-2" />
                                            <p className="text-[#666]">Loading recommendations...</p>
                                        </div>
                                    </div>
                                ) : (
                                    <NetworkGraph
                                        patientId={searchedPatientId}
                                        recommendations={recommendations}
                                        drugNames={drugNames}
                                    />
                                )}
                            </div>

                            <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
                                <p className="text-sm text-[#666]">High color intensity - High confidence</p>
                            </div>
                        </div>

                        {/* Right Panel - Drugs List */}
                        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-5 h-[520px] flex flex-col">
                            <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                                <h3 className="text-sm font-semibold text-[#333] tracking-wide">
                                    TOP 5 RECOMMENDED DRUGS
                                </h3>
                                <TbStar className="w-4 h-4 text-[#EAB308] fill-[#EAB308]" />
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2">
                                <div className="flex flex-col gap-3">
                                    {recommendations.length > 0 ? (
                                        recommendations.map((drug, index) => (
                                            <DrugCard
                                                key={drug.cuid}
                                                drug={drug}
                                                rank={index + 1}
                                                isTop={index === 0}
                                                maxScore={maxScore}
                                            />
                                        ))
                                    ) : (
                                        [1, 2, 3, 4, 5].map((rank) => (
                                            <div key={rank} className="p-4 rounded-xl border border-[#e5e5e5] bg-white">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#E5E7EB] text-[#333] font-bold">
                                                        {rank}
                                                    </span>
                                                    <span className="text-[#999]">—</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}
