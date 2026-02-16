"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import {
    TbZoomIn, TbZoomOut, TbArrowsMaximize, TbStar, TbLoader2,
    TbChevronDown, TbChevronUp, TbPill, TbTag, TbCode, TbDatabase,
    TbSearch, TbUser, TbHome, TbLayoutDashboard, TbUserHeart, TbNetwork,
    TbStethoscope, TbFileText, TbChartBar, TbGraph, TbSparkles,
    TbHeartbeat, TbTargetArrow, TbActivity, TbRoute
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

interface DiagnosisItem {
    icd_code: string;
    icd_version: number;
    cui: string;
    hadm_id: string;
}

interface NodePosition {
    x: number;
    y: number;
    vx: number;
    vy: number;
}

// Rank badge colors
const rankStyles = [
    { bg: "from-amber-400 to-yellow-500", shadow: "rgba(245,158,11,0.4)", text: "text-white" },   // #1 Gold
    { bg: "from-slate-300 to-slate-400", shadow: "rgba(148,163,184,0.4)", text: "text-white" },    // #2 Silver
    { bg: "from-amber-600 to-orange-700", shadow: "rgba(180,83,9,0.4)", text: "text-white" },      // #3 Bronze
    { bg: "from-[#427466] to-[#2d5a4e]", shadow: "rgba(66,116,102,0.3)", text: "text-white" },     // #4 Teal
    { bg: "from-[#427466] to-[#2d5a4e]", shadow: "rgba(66,116,102,0.3)", text: "text-white" },     // #5 Teal
];

// Stat Card Component
function StatCard({ icon: Icon, label, value, color, delay }: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    color: string;
    delay: number;
}) {
    return (
        <div
            className="bg-white rounded-2xl border border-[#e5e5e5] p-5 flex items-center gap-4 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300 animate-fade-in-up"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div
                className="p-3 rounded-xl"
                style={{ background: `linear-gradient(135deg, ${color}20, ${color}10)` }}
            >
                <Icon className="w-6 h-6" style={{ color }} />
            </div>
            <div>
                <p className="text-2xl font-bold text-[#1a1a1a]">{value}</p>
                <p className="text-xs text-[#888] font-medium uppercase tracking-wider">{label}</p>
            </div>
        </div>
    );
}

// Expandable Drug Card Component
interface DrugCardProps {
    drug: DrugRecommendation;
    rank: number;
    isTop: boolean;
    maxScore: number;
    index: number;
}

function DrugCard({ drug, rank, isTop, maxScore, index }: DrugCardProps) {
    const [expanded, setExpanded] = useState(false);
    const [details, setDetails] = useState<DrugDetails | null>(null);
    const [drugName, setDrugName] = useState<string>("");
    const [barVisible, setBarVisible] = useState(false);

    // Animate the score bar on mount
    useEffect(() => {
        const timer = setTimeout(() => setBarVisible(true), 400 + index * 150);
        return () => clearTimeout(timer);
    }, [index]);

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

    const style = rankStyles[rank - 1] || rankStyles[4];
    const scorePercent = Math.min((drug.score / maxScore) * 100, 100);

    return (
        <div
            onClick={handleExpand}
            className={`rounded-2xl border overflow-hidden transition-all duration-300 cursor-pointer animate-fade-in-up group
                ${isTop
                    ? "bg-gradient-to-br from-[#F0FDF4] to-[#ECFDF5] border-[#86EFAC] shadow-[0_4px_20px_rgba(34,197,94,0.12)]"
                    : "bg-white border-[#e5e5e5] hover:border-[#427466]/40"
                }
                hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:-translate-y-0.5`}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {/* Top Accent Line */}
            {isTop && (
                <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
            )}

            {/* Main Card Content */}
            <div className="p-4">
                {/* Header Row */}
                <div className="flex items-start gap-3">
                    {/* Rank Badge */}
                    <div
                        className={`w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br ${style.bg} ${style.text} text-sm font-bold flex-shrink-0`}
                        style={{ boxShadow: `0 4px 12px ${style.shadow}` }}
                    >
                        {rank}
                    </div>

                    {/* Drug Name and CUID */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <TbPill className="w-4 h-4 text-[#427466] flex-shrink-0" />
                            <span className="text-sm font-semibold text-[#1a1a1a] truncate">
                                {drugName || drug.cuid}
                            </span>
                        </div>
                        <p className="text-xs text-[#888] mt-0.5 flex items-center gap-1 font-mono">
                            <TbTag className="w-3 h-3 flex-shrink-0" />
                            {drug.cuid}
                        </p>
                    </div>

                    {/* Score and Expand Icon */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="text-right">
                            <span className="text-lg font-bold bg-gradient-to-r from-[#427466] to-[#2d5a4e] bg-clip-text text-transparent">
                                {drug.score.toFixed(2)}
                            </span>
                            <p className="text-[10px] text-[#888] uppercase tracking-wider font-medium">score</p>
                        </div>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 ${expanded ? 'bg-[#427466]/10 rotate-180' : 'group-hover:bg-gray-100'}`}>
                            <TbChevronDown className="w-4 h-4 text-[#666]" />
                        </div>
                    </div>
                </div>

                {/* Animated Score Bar */}
                <div className="mt-3">
                    <div className="w-full h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{
                                width: barVisible ? `${scorePercent}%` : '0%',
                                background: isTop
                                    ? 'linear-gradient(90deg, #10B981, #06B6D4)'
                                    : 'linear-gradient(90deg, #427466, #5BA899)',
                                boxShadow: isTop ? '0 0 8px rgba(16,185,129,0.4)' : undefined,
                                transitionDelay: `${index * 150}ms`,
                            }}
                        />
                    </div>
                </div>

                {/* Top Recommendation Label */}
                {isTop && (
                    <div className="mt-2.5 flex items-center gap-1.5">
                        <div className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-full">
                            <TbSparkles className="w-3 h-3 text-emerald-500" />
                            <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                                Highest Confidence
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Expanded Details Section */}
            {expanded && details && (
                <div className="px-4 pb-4 animate-fadeIn">
                    <div className="bg-gradient-to-br from-[#f8fafb] to-[#f0f4f3] rounded-xl p-4 border border-[#e5e5e5]/60 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            {/* Drug Name */}
                            <div className="flex items-start gap-2.5 p-3 bg-white/80 rounded-lg">
                                <TbPill className="w-4 h-4 text-[#427466] mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] text-[#999] uppercase tracking-widest font-semibold">Drug Name</p>
                                    <p className="text-xs text-[#1a1a1a] font-medium mt-0.5">{details.name}</p>
                                </div>
                            </div>

                            {/* Semantic Types */}
                            <div className="flex items-start gap-2.5 p-3 bg-white/80 rounded-lg">
                                <TbTag className="w-4 h-4 text-[#427466] mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] text-[#999] uppercase tracking-widest font-semibold">Semantic Types</p>
                                    <p className="text-xs text-[#1a1a1a] mt-0.5">{details.semantic_types}</p>
                                </div>
                            </div>

                            {/* Canonical Code */}
                            <div className="flex items-start gap-2.5 p-3 bg-white/80 rounded-lg">
                                <TbCode className="w-4 h-4 text-[#427466] mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] text-[#999] uppercase tracking-widest font-semibold">Canonical Code</p>
                                    <p className="text-xs text-[#1a1a1a] font-mono mt-0.5 bg-[#427466]/5 px-2 py-0.5 rounded inline-block">{details.canonical_code}</p>
                                </div>
                            </div>

                            {/* Sources */}
                            <div className="flex items-start gap-2.5 p-3 bg-white/80 rounded-lg">
                                <TbDatabase className="w-4 h-4 text-[#427466] mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] text-[#999] uppercase tracking-widest font-semibold">Sources</p>
                                    <p className="text-xs text-[#1a1a1a] mt-0.5">{details.sources}</p>
                                </div>
                            </div>
                        </div>

                        {/* Synonyms */}
                        {details.synonyms && (
                            <div className="pt-3 border-t border-[#e5e5e5]/60">
                                <p className="text-[10px] text-[#999] uppercase tracking-widest font-semibold mb-2">Synonyms</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {details.synonyms.split(';').slice(0, 4).map((syn, i) => (
                                        <span key={i} className="px-2.5 py-1 bg-white border border-[#e5e5e5] rounded-lg text-[10px] text-[#555] font-medium hover:border-[#427466]/40 transition-colors">
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
        const opacity = 0.3 + (normalizedScore * 0.5);
        return `rgba(66, 116, 102, ${opacity})`;
    };

    if (recommendations.length === 0 || nodePositions.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#427466]/10 to-[#427466]/5 flex items-center justify-center animate-pulse-subtle">
                        <TbNetwork className="w-10 h-10 text-[#427466]/40" />
                    </div>
                    <p className="text-[#999] text-sm font-medium">Enter a Patient ID to see the network</p>
                    <p className="text-[#ccc] text-xs mt-1">Drag nodes to explore connections</p>
                </div>
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
                {/* Subtle radial gradient background */}
                <defs>
                    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#427466" stopOpacity="0.04" />
                        <stop offset="100%" stopColor="#427466" stopOpacity="0" />
                    </radialGradient>
                </defs>
                <circle cx="300" cy="220" r="200" fill="url(#bgGlow)" />

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
                            strokeWidth={1.5 + normalizedScore * 2.5}
                            strokeLinecap="round"
                            strokeDasharray={normalizedScore < 0.3 ? "4 4" : "none"}
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
                                <circle cx={node.x} cy={node.y} r={42} fill={nodeColor} opacity={0.2} />
                            )}

                            <circle
                                cx={node.x}
                                cy={node.y}
                                r={35}
                                fill={nodeColor}
                                stroke="#fff"
                                strokeWidth={3}
                                style={{ filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.2))' }}
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
    const [diagnoses, setDiagnoses] = useState<DiagnosisItem[]>([]);
    const [diagnosisNames, setDiagnosisNames] = useState<Record<string, string>>({});
    const [showDiagnoses, setShowDiagnoses] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [graphDropdownOpen, setGraphDropdownOpen] = useState(false);
    const graphDropdownRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (graphDropdownRef.current && !graphDropdownRef.current.contains(event.target as Node)) {
                setGraphDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const navItems = [
        { name: "Home", href: "/", icon: TbHome },
        { name: "Methodology", href: "/methodology", icon: TbRoute },
        { name: "Patient DR", href: "/patient-dr", icon: TbUserHeart },
        { name: "Model Comparison", href: "/model-compare", icon: TbChartBar },
    ];

    const graphSubItems = [
        { name: "UMLS Graph", href: "/umls-graph" },
        { name: "Integrated Graph", href: "/dashboard" },
    ];

    const isGraphPage = pathname === "/dashboard" || pathname === "/umls-graph";

    const handleSearch = async () => {
        if (!patientId.trim()) {
            setError("Please enter a Patient ID");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Fetch recommendations
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

            // Fetch diagnoses
            try {
                const diagResponse = await fetch(`${RECOMMEND_API}/api/diagnoses/${patientId}?top_k=20`);
                if (diagResponse.ok) {
                    const diagData = await diagResponse.json();

                    const diagNames: Record<string, string> = {};
                    const validDiagnoses: DiagnosisItem[] = [];

                    for (const diag of diagData.diagnoses || []) {
                        if (validDiagnoses.length >= 10) break;

                        try {
                            const res = await fetch(`${CUI_API}/api/cui/${diag.cui}`);
                            if (res.ok) {
                                const cuiData = await res.json();
                                if (cuiData.found && cuiData.data && cuiData.data.name) {
                                    diagNames[diag.cui] = cuiData.data.name;
                                    validDiagnoses.push(diag);
                                }
                            }
                        } catch {
                            continue;
                        }
                    }

                    setDiagnoses(validDiagnoses);
                    setDiagnosisNames(diagNames);
                }
            } catch (diagError) {
                console.error("Failed to fetch diagnoses:", diagError);
                setDiagnoses([]);
                setDiagnosisNames({});
            }

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
            setDiagnoses([]);
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
            <header className="flex justify-between h-20 px-12 py-5 bg-[#ffffff] shadow-md relative z-50">
                <Link href="/" className="flex items-center gap-3 pl-6 cursor-pointer">
                    <h1 className="text-xl font-medium text-[#1a1a1a]">
                        <b>Drug Recommendation System</b>
                    </h1>
                </Link>
                <nav className="flex items-center gap-4 pr-6">
                    {/* Home */}
                    <Link
                        href="/"
                        className={`flex items-center gap-2 rounded-xl text-sm cursor-pointer font-medium transition-all duration-200 px-5 py-2 ${pathname === "/"
                            ? "bg-[#427466] text-white"
                            : "bg-[#D9D9D9] text-[#333333] hover:bg-[#c9c9c9]"
                            }`}
                    >
                        <TbHome className="w-4 h-4" />
                        Home
                    </Link>

                    {/* Graph Visualisation Dropdown */}
                    <div className="relative" ref={graphDropdownRef}>
                        <button
                            onClick={() => setGraphDropdownOpen(!graphDropdownOpen)}
                            className={`flex items-center gap-2 rounded-xl text-sm cursor-pointer font-medium transition-all duration-200 px-5 py-2 ${isGraphPage
                                ? "bg-[#427466] text-white"
                                : "bg-[#D9D9D9] text-[#333333] hover:bg-[#c9c9c9]"
                                }`}
                        >
                            <TbGraph className="w-4 h-4" />
                            Graph Visualisation
                            <TbChevronDown className={`w-3 h-3 transition-transform duration-200 ${graphDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {graphDropdownOpen && (
                            <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-[#e5e5e5] overflow-hidden z-[100] min-w-[180px]">
                                {graphSubItems.map((sub) => (
                                    <Link
                                        key={sub.name}
                                        href={sub.href}
                                        onClick={() => setGraphDropdownOpen(false)}
                                        className={`block px-5 py-3 text-sm font-medium transition-colors ${pathname === sub.href
                                            ? "bg-[#427466]/10 text-[#427466]"
                                            : "text-[#333] hover:bg-[#f5f5f5]"
                                            }`}
                                    >
                                        {sub.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Remaining nav items */}
                    {navItems.filter(item => item.name !== "Home").map((item) => {
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
                    {/* Page Header */}
                    <div className="mb-8 animate-fade-in">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#427466] to-[#2d5a4e] shadow-lg" style={{ boxShadow: '0 8px 24px rgba(66,116,102,0.3)' }}>
                                <TbUserHeart className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h2 className="text-[32px] font-bold text-[#1a1a1a] tracking-tight">
                                    Patient Drug Recommendation
                                </h2>
                                <p className="text-[#888] text-sm mt-0.5">
                                    Personalized drug recommendations powered by graph neural networks
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Search Section — Glassmorphism */}
                    <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        <div className={`inline-flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${isFocused
                            ? 'bg-white/90 backdrop-blur-sm border-[#427466]/30 shadow-[0_8px_32px_rgba(66,116,102,0.12)]'
                            : 'bg-white/70 backdrop-blur-sm border-[#e5e5e5] shadow-sm'
                            }`}>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888]">
                                    <TbUser className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    value={patientId}
                                    onChange={(e) => setPatientId(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    placeholder="Enter Patient ID..."
                                    className="w-80 pl-11 pr-4 py-3 border-2 rounded-xl text-sm bg-white/80 focus:outline-none transition-all duration-200 border-[#e5e5e5] focus:border-[#427466] placeholder:text-[#bbb]"
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                disabled={loading}
                                className="cursor-pointer px-7 py-3 bg-gradient-to-r from-[#427466] to-[#2d5a4e] text-white rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2  hover:bg-[#365f54]  active:scale-[0.98]"
                            >
                                {loading ? (
                                    <TbLoader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <TbSearch className="w-5 h-5" />
                                )}
                                {loading ? "Analyzing..." : "Get Recommendations"}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2 animate-fade-in">
                            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Stats Summary Row */}
                    {/* {recommendations.length > 0 && (
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <StatCard
                                icon={TbPill}
                                label="Drugs Found"
                                value={recommendations.length}
                                color="#427466"
                                delay={0}
                            />
                            <StatCard
                                icon={TbTargetArrow}
                                label="Top Score"
                                value={maxScore.toFixed(3)}
                                color="#F59E0B"
                                delay={100}
                            />
                            <StatCard
                                icon={TbStethoscope}
                                label="Diagnoses"
                                value={diagnoses.length}
                                color="#EC4899"
                                delay={200}
                            />
                        </div>
                    )} */}

                    {/* Diagnosis Section — Enhanced */}
                    {diagnoses.length > 0 && (
                        <div className="mb-5 bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                            <button
                                onClick={() => setShowDiagnoses(!showDiagnoses)}
                                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50/80 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-pink-500/10 to-rose-500/10">
                                        <TbStethoscope className="w-5 h-5 text-pink-500" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-[#1a1a1a]">
                                        Patient Diagnoses
                                    </h3>
                                    <span className="px-2.5 py-0.5 bg-gradient-to-r from-[#427466]/10 to-[#427466]/5 text-[#427466] text-xs font-bold rounded-full">
                                        {diagnoses.length}
                                    </span>
                                </div>
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 ${showDiagnoses ? 'bg-[#427466]/10 rotate-180' : 'hover:bg-gray-100'}`}>
                                    <TbChevronDown className="w-4 h-4 text-[#666]" />
                                </div>
                            </button>

                            {showDiagnoses && (
                                <div className="px-5 pb-5 border-t border-[#e5e5e5]">
                                    <div className="grid grid-cols-3 gap-3 mt-4">
                                        {diagnoses.map((diagnosis, index) => (
                                            <div
                                                key={`${diagnosis.icd_code}-${index}`}
                                                className="p-3 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:border-[#427466]/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up"
                                                style={{ animationDelay: `${index * 60}ms`, borderLeft: '3px solid #427466' }}
                                            >
                                                {/* Diagnosis Name */}
                                                <span className="text-xs font-bold text-[#1a1a1a] line-clamp-2 leading-tight block mb-2">
                                                    {diagnosisNames[diagnosis.cui]}
                                                </span>

                                                {/* Codes Row */}
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-[#427466]/10 to-[#427466]/5 rounded-md">
                                                        <span className="text-[10px] font-semibold text-[#427466]">
                                                            ICD-{diagnosis.icd_version}: {diagnosis.icd_code}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* CUI */}
                                                <span className="text-[10px] font-mono text-[#999] mt-1.5 block">
                                                    {diagnosis.cui}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-[1fr_450px] gap-5">
                        {/* Left Panel — Network */}
                        <div className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden h-[520px] animate-fade-in-up relative" style={{ animationDelay: '300ms' }}>
                            {/* Gradient Accent Strip */}
                            <div className="h-1 bg-gradient-to-r from-[#427466] via-[#5BA899] to-[#427466]" />

                            <div className="p-5 h-[calc(100%-4px)]">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-semibold text-[#1a1a1a] flex items-center gap-2">
                                        <div className="p-1 rounded-md bg-[#427466]/10">
                                            <TbNetwork className="w-4 h-4 text-[#427466]" />
                                        </div>
                                        Patient — Drug Network
                                    </h3>
                                    <div className="flex gap-1.5">
                                        <button onClick={handleZoomIn} className="w-9 h-9 flex items-center justify-center border border-[#e5e5e5] rounded-lg hover:bg-[#427466]/5 hover:border-[#427466]/30 transition-all duration-200 cursor-pointer">
                                            <TbZoomIn className="w-4 h-4 text-[#666]" />
                                        </button>
                                        <button onClick={handleZoomOut} className="w-9 h-9 flex items-center justify-center border border-[#e5e5e5] rounded-lg hover:bg-[#427466]/5 hover:border-[#427466]/30 transition-all duration-200 cursor-pointer">
                                            <TbZoomOut className="w-4 h-4 text-[#666]" />
                                        </button>
                                        <button onClick={handleZoomReset} className="w-9 h-9 flex items-center justify-center border border-[#e5e5e5] rounded-lg hover:bg-[#427466]/5 hover:border-[#427466]/30 transition-all duration-200 cursor-pointer">
                                            <TbArrowsMaximize className="w-4 h-4 text-[#666]" />
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
                                                <div className="relative">
                                                    <TbLoader2 className="w-12 h-12 text-[#427466] animate-spin mx-auto mb-3" />
                                                    <div className="absolute inset-0 w-12 h-12 mx-auto rounded-full bg-[#427466]/10 animate-ping" />
                                                </div>
                                                <p className="text-[#666] text-sm font-medium">Analyzing patient network...</p>
                                                <p className="text-[#bbb] text-xs mt-1">This may take a moment</p>
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

                                {/* Legend */}
                                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full border border-[#e5e5e5] shadow-sm">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-[#7fbc9d]" />
                                        <span className="text-[10px] text-[#888] font-medium">Low</span>
                                    </div>
                                    <div className="w-16 h-2 rounded-full bg-gradient-to-r from-[#7fbc9d] to-[#2d6b4e]" />
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-[#2d6b4e]" />
                                        <span className="text-[10px] text-[#888] font-medium">High</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Panel — Drugs List */}
                        <div className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden h-[520px] flex flex-col animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                            {/* Gradient Accent Strip */}
                            <div className="h-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400" />

                            <div className="p-5 flex flex-col h-[calc(100%-4px)]">
                                <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                                    <div className="p-1 rounded-md bg-amber-500/10">
                                        <TbStar className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-[#1a1a1a] tracking-wide">
                                        TOP 5 RECOMMENDATIONS
                                    </h3>
                                    {/* {recommendations.length > 0 && (
                                        <span className="ml-auto px-2.5 py-0.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-600 text-[10px] font-bold rounded-full flex items-center gap-1">
                                            <TbSparkles className="w-3 h-3" />
                                            AI Powered
                                        </span>
                                    )} */}
                                </div>

                                <div className="flex-1 overflow-y-auto pr-1">
                                    <div className="flex flex-col gap-3">
                                        {recommendations.length > 0 ? (
                                            recommendations.map((drug, index) => (
                                                <DrugCard
                                                    key={drug.cuid}
                                                    drug={drug}
                                                    rank={index + 1}
                                                    isTop={index === 0}
                                                    maxScore={maxScore}
                                                    index={index}
                                                />
                                            ))
                                        ) : (
                                            // Skeleton placeholders
                                            [1, 2, 3, 4, 5].map((rank) => (
                                                <div key={rank} className="p-4 rounded-2xl border border-[#e5e5e5] bg-gradient-to-br from-gray-50 to-white animate-fade-in-up" style={{ animationDelay: `${rank * 80}ms` }}>
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#f0f0f0] text-[#bbb] font-bold text-sm">
                                                            {rank}
                                                        </span>
                                                        <div className="flex-1">
                                                            <div className="h-3 bg-[#f0f0f0] rounded-full w-32 mb-2" />
                                                            <div className="h-2 bg-[#f5f5f5] rounded-full w-20" />
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                                                        <div className="h-full bg-[#f5f5f5] rounded-full w-0" />
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* CSS Animations */}
            <style jsx global>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes pulse-subtle {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(0.97); }
                }

                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }

                .animate-fade-in {
                    animation: fade-in 0.4s ease-out forwards;
                }

                .animate-fade-in-up {
                    animation: fade-in-up 0.6s ease-out forwards;
                    opacity: 0;
                }

                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }

                .animate-pulse-subtle {
                    animation: pulse-subtle 2.5s ease-in-out infinite;
                }

                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }

                /* Custom scrollbar for drug list */
                .overflow-y-auto::-webkit-scrollbar {
                    width: 4px;
                }

                .overflow-y-auto::-webkit-scrollbar-track {
                    background: transparent;
                }

                .overflow-y-auto::-webkit-scrollbar-thumb {
                    background: #d1d5db;
                    border-radius: 20px;
                }

                .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                    background: #9ca3af;
                }
            `}</style>
        </div>
    );
}
