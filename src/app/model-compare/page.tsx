"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
    TbBrain, TbNetwork, TbChartBar, TbTrophy, TbTargetArrow,
    TbSparkles, TbGraph, TbTopologyRing, TbLayersLinked, TbBinaryTree,
    TbCheck, TbRadar
} from "react-icons/tb";
import { TbZoomIn, TbZoomOut, TbArrowsMaximize, TbHome, TbLayoutDashboard, TbUserHeart } from "react-icons/tb";


// Model data with descriptions and metrics
const models = [
    {
        id: "neucf",
        name: "NeuCF",
        fullName: "Neural Collaborative Filtering",
        icon: TbBrain,
        color: "#8B5CF6",
        gradient: "from-violet-500 to-purple-600",
        bgGradient: "from-violet-50 to-purple-50",
        description: "Deep learning approach combining matrix factorization with neural networks for learning user-item interactions through non-linear transformations.",
        metrics: {
            "recall@5": 0.342,
            "recall@10": 0.478,
            "precision@5": 0.285,
            "precision@10": 0.198
        }
    },
    {
        id: "homo-graphsage",
        name: "Homo GraphSAGE",
        fullName: "Homogeneous GraphSAGE",
        icon: TbGraph,
        color: "#F59E0B",
        gradient: "from-amber-500 to-orange-600",
        bgGradient: "from-amber-50 to-orange-50",
        description: "Inductive graph learning with neighborhood aggregation, treating all nodes uniformly without distinguishing between different entity types.",
        metrics: {
            "recall@5": 0.412,
            "recall@10": 0.567,
            "precision@5": 0.328,
            "precision@10": 0.245
        }
    },
    {
        id: "hetero-graphsage",
        name: "Hetero GraphSAGE",
        fullName: "Heterogeneous GraphSAGE",
        icon: TbTopologyRing,
        color: "#10B981",
        gradient: "from-emerald-500 to-teal-600",
        bgGradient: "from-emerald-50 to-teal-50",
        description: "Extended GraphSAGE supporting multiple node and edge types, enabling richer representation learning on heterogeneous medical graphs.",
        metrics: {
            "recall@5": 0.458,
            "recall@10": 0.612,
            "precision@5": 0.365,
            "precision@10": 0.278
        }
    },
    {
        id: "rgcn",
        name: "R-GCN",
        fullName: "Relational Graph Convolutional Network",
        icon: TbLayersLinked,
        color: "#0EA5E9",
        gradient: "from-sky-500 to-cyan-600",
        bgGradient: "from-sky-50 to-cyan-50",
        description: "Graph convolution network with relation-specific weight matrices, designed for multi-relational data in knowledge graphs.",
        metrics: {
            "recall@5": 0.489,
            "recall@10": 0.645,
            "precision@5": 0.392,
            "precision@10": 0.305
        }
    },
    {
        id: "hgt",
        name: "HGT",
        fullName: "Heterogeneous Graph Transformer",
        icon: TbBinaryTree,
        color: "#EC4899",
        gradient: "from-pink-500 to-rose-600",
        bgGradient: "from-pink-50 to-rose-50",
        description: "Transformer architecture adapted for heterogeneous graphs with type-dependent attention mechanisms for superior drug recommendation.",
        metrics: {
            "recall@5": 0.534,
            "recall@10": 0.698,
            "precision@5": 0.425,
            "precision@10": 0.342
        }
    }
];

// Flip Card Component
function ModelFlipCard({ model }: { model: typeof models[0] }) {
    const Icon = model.icon;

    return (
        <div className="flip-card">
            <div className="flip-card-inner">
                {/* Front Side */}
                <div className="flip-card-front" style={{ background: `linear-gradient(135deg, ${model.color}15, ${model.color}05)` }}>
                    <div className="h-full flex flex-col items-center justify-center p-6">
                        <div
                            className={`p-4 rounded-2xl bg-gradient-to-br ${model.gradient} shadow-xl mb-4`}
                            style={{ boxShadow: `0 10px 30px ${model.color}40` }}
                        >
                            <Icon className="w-12 h-12 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-[#1a1a1a] mb-1">{model.name}</h3>
                        <p className="text-xs text-[#888] font-medium mb-3">{model.fullName}</p>
                        {/* <div className="mt-4 text-xs text-[#427466] font-semibold">Hover to see metrics →</div> */}
                    </div>
                </div>

                {/* Back Side */}
                <div
                    className="flip-card-back"
                    style={{ background: `linear-gradient(135deg, ${model.color}, ${model.color}dd)` }}
                >
                    <div className="h-full flex flex-col justify-center p-6 text-white">
                        <h3 className="text-lg font-bold mb-4 text-white">{model.name}</h3>
                        <p className="text-sm text-white leading-relaxed">
                            {model.description}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Type for a single model
type Model = {
    id: string;
    name: string;
    fullName: string;
    icon: React.ElementType;
    color: string;
    gradient: string;
    bgGradient: string;
    description: string;
    metrics: {
        "recall@5": number;
        "recall@10": number;
        "precision@5": number;
        "precision@10": number;
    };
};

// RadarChart Component
function RadarChart({ models }: { models: Model[] }) {
    const [hoveredModel, setHoveredModel] = useState<string | null>(null);

    const chartSize = 500;
    const center = chartSize / 2;
    const maxRadius = 200;

    // 4 metrics as axes
    const metrics = [
        { key: 'recall@5', label: 'Recall @5', angle: 0 },
        { key: 'recall@10', label: 'Recall @10', angle: 90 },
        { key: 'precision@5', label: 'Precision @5', angle: 180 },
        { key: 'precision@10', label: 'Precision @10', angle: 270 }
    ];

    // Convert angle to radians and calculate point
    const getPoint = (angle: number, value: number) => {
        const radian = (angle - 90) * (Math.PI / 180);
        const radius = maxRadius * value;
        return {
            x: center + radius * Math.cos(radian),
            y: center + radius * Math.sin(radian)
        };
    };

    // Create polygon path for a model
    const getPolygonPath = (model: Model) => {
        const points = metrics.map(metric => {
            const value = model.metrics[metric.key as keyof typeof model.metrics];
            return getPoint(metric.angle, value);
        });
        return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
    };

    return (
        <div className="bg-white rounded-2xl w-200  ml-80 border border-[#e5e5e5] p-8">
            <div className="flex items-center justify-center mb-6">
                <div className="p-2 rounded-lg bg-[#427466]/10">
                    <TbRadar className="w-6 h-6 text-[#427466]" />
                </div>
                <h4 className="text-xl font-bold text-[#1a1a1a] ml-3">Performance Radar</h4>
            </div>

            <div className="flex justify-center">
                <svg width={chartSize} height={chartSize} className="overflow-visible">
                    {/* Grid circles */}
                    {[0.25, 0.5, 0.75, 1].map((scale, i) => (
                        <circle
                            key={i}
                            cx={center}
                            cy={center}
                            r={maxRadius * scale}
                            fill="none"
                            stroke="#e5e5e5"
                            strokeWidth="1"
                        />
                    ))}

                    {/* Axes lines */}
                    {metrics.map((metric) => {
                        const point = getPoint(metric.angle, 1);
                        return (
                            <line
                                key={metric.key}
                                x1={center}
                                y1={center}
                                x2={point.x}
                                y2={point.y}
                                stroke="#d1d5db"
                                strokeWidth="1"
                            />
                        );
                    })}

                    {/* Grid value labels */}
                    {[0.25, 0.5, 0.75, 1].map((scale, i) => (
                        <text
                            key={i}
                            x={center + 5}
                            y={center - maxRadius * scale}
                            fontSize="10"
                            fill="#888"
                            textAnchor="start"
                        >
                            {(scale * 100).toFixed(0)}%
                        </text>
                    ))}

                    {/* Model polygons */}
                    {models.map((model) => {
                        const isHovered = hoveredModel === model.id;
                        const opacity = hoveredModel ? (isHovered ? 0.4 : 0.1) : 0.25;
                        const strokeWidth = isHovered ? 3 : 2;

                        return (
                            <g key={model.id}>
                                <path
                                    d={getPolygonPath(model)}
                                    fill={model.color}
                                    fillOpacity={opacity}
                                    stroke={model.color}
                                    strokeWidth={strokeWidth}
                                    className="transition-all duration-300 cursor-pointer"
                                    onMouseEnter={() => setHoveredModel(model.id)}
                                    onMouseLeave={() => setHoveredModel(null)}
                                />
                                {/* Data points */}
                                {metrics.map((metric) => {
                                    const value = model.metrics[metric.key as keyof typeof model.metrics];
                                    const point = getPoint(metric.angle, value);
                                    return (
                                        <circle
                                            key={`${model.id}-${metric.key}`}
                                            cx={point.x}
                                            cy={point.y}
                                            r={isHovered ? 5 : 3}
                                            fill={model.color}
                                            className="transition-all duration-300"
                                        />
                                    );
                                })}
                            </g>
                        );
                    })}

                    {/* Axis labels */}
                    {metrics.map((metric) => {
                        const point = getPoint(metric.angle, 1.15);
                        return (
                            <text
                                key={metric.label}
                                x={point.x}
                                y={point.y}
                                fontSize="13"
                                fontWeight="600"
                                fill="#333"
                                textAnchor="middle"
                                dominantBaseline="middle"
                            >
                                {metric.label}
                            </text>
                        );
                    })}
                </svg>
            </div>

            {/* Legend */}
            <div className="flex justify-center flex-wrap gap-4 mt-8">
                {models.map((model) => {
                    const isHovered = hoveredModel === model.id;
                    return (
                        <div
                            key={model.id}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all ${isHovered ? 'bg-gray-100 scale-105' : 'hover:bg-gray-50'
                                }`}
                            onMouseEnter={() => setHoveredModel(model.id)}
                            onMouseLeave={() => setHoveredModel(null)}
                        >
                            <div
                                className="w-4 h-4 rounded"
                                style={{ background: model.color }}
                            />
                            <span className="text-sm font-medium text-[#666]">{model.name}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Grouped Bar Chart Component (Histogram-style)
function GroupedBarChart({ models, metrics, title, icon: Icon }: {
    models: Model[];
    metrics: string[];
    title: string;
    icon: React.ElementType;
}) {

    // console.log("📊 GroupedBarChart render", {
    //     title,
    //     modelsCount: models.length,
    //     metrics
    // });
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // console.log("🎬 useEffect triggered for chart:", title);

        const timer = setTimeout(() => {
            // console.log("🎬 isVisible set to TRUE for chart:", title);
            setIsVisible(true);
        }, 300);

        return () => clearTimeout(timer);
    }, [title]);


    // Colors for different metrics within a group
    const metricColors = ['#6366f1', '#8b5cf6']; // Indigo and Purple shades

    return (
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] transition-all duration-300">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-lg bg-[#427466]/10">
                    <Icon className="w-5 h-5 text-[#427466]" />
                </div>
                <h4 className="text-lg font-bold text-[#1a1a1a]">{title}</h4>
            </div>

            {/* Chart Container */}
            <div className="relative">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-64 w-12 flex flex-col justify-between text-xs text-[#888] pr-2">
                    <span>100%</span>
                    <span>75%</span>
                    <span>50%</span>
                    <span>25%</span>
                    <span>0%</span>
                </div>

                {/* Chart area */}
                <div className="ml-12 pl-4">
                    {/* Grid and bars container */}
                    <div className="relative h-64 border-l-2 border-b-2 border-[#e5e5e5]">
                        {/* Horizontal grid lines */}
                        <div className="absolute w-full h-px bg-[#f0f0f0] top-[0%]"></div>
                        <div className="absolute w-full h-px bg-[#f0f0f0] top-[25%]"></div>
                        <div className="absolute w-full h-px bg-[#f0f0f0] top-[50%]"></div>
                        <div className="absolute w-full h-px bg-[#f0f0f0] top-[75%]"></div>

                        {/* Grouped Bars */}
                        <div className="absolute inset-0 flex items-end justify-around gap-4 px-2 h-full">
                            {metrics.map((metric, metricIndex) => {
                                return (
                                    <div
                                        key={metric}
                                        className="flex-1 flex items-end justify-center gap-2 h-full"
                                        style={{ maxWidth: '160px' }}
                                    >
                                        {models.map((model, modelIndex) => {
                                            const value = model.metrics[metric as keyof typeof model.metrics];
                                            const heightPercentage = value * 100;
                                            const barColor = model.color;

                                            const barStyle = {
                                                height: isVisible ? `${heightPercentage}%` : '0%',
                                                background: `linear-gradient(180deg, ${barColor}, ${barColor}dd)`,
                                                boxShadow: `0 2px 8px ${barColor}40`,
                                                transitionDelay: `${metricIndex * 150 + modelIndex * 80}ms`,
                                            };

                                            return (
                                                <div
                                                    key={model.id}
                                                    className="flex-1 relative h-full"
                                                >
                                                    <div
                                                        className="absolute bottom-0 w-full rounded-t-md transition-all duration-1000"
                                                        style={barStyle}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* X-axis labels (Model names with icons) - OUTSIDE chart area */}
                    <div className="flex justify-around gap-4 mt-6">
                        {metrics.map(metric => (
                            <div
                                key={metric}
                                className="flex-1 text-center text-sm font-semibold text-[#333]"
                                style={{ maxWidth: '160px' }}
                            >
                                {metric.toUpperCase()}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div className="flex justify-center flex-wrap gap-4 mt-6">
                    {models.map(model => (
                        <div key={model.id} className="flex items-center gap-2">
                            <div
                                className="w-4 h-4 rounded"
                                style={{ background: model.color }}
                            />
                            <span className="text-xs font-medium text-[#666]">
                                {model.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function ModelComparison() {
    const pathname = usePathname();
    const [selectedModels, setSelectedModels] = useState<string[]>(models.map(m => m.id));
    const [activeView, setActiveView] = useState<"metrics" | "details">("metrics");
    const [vizType, setVizType] = useState<"bar" | "radar">("bar");

    const navItems = [
        { name: "Home", href: "/", icon: TbHome },
        { name: "UMLS Graph", href: "/umls-graph", icon: TbNetwork },
        { name: "Dashboard", href: "/dashboard", icon: TbLayoutDashboard },
        { name: "Patient DR", href: "/patient-dr", icon: TbUserHeart },
        { name: "Model Comparison", href: "/model-compare", icon: TbGraph },
    ];

    const filteredModels = models.filter(m => selectedModels.includes(m.id));

    const recallMetrics = ["recall@5", "recall@10"];
    const precisionMetrics = ["precision@5", "precision@10"];


    const toggleModelSelection = (modelId: string) => {
        setSelectedModels(prev => {
            if (prev.includes(modelId) && prev.length === 1) return prev; // Keep at least one
            return prev.includes(modelId)
                ? prev.filter(id => id !== modelId)
                : [...prev, modelId];
        });
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
            <main className="relative z-10 px-8 py-6">
                {/* Page Header */}
                <div className="mb-8 animate-fade-in">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-[#427466] to-[#365f54]">
                            <TbNetwork className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-[32px] font-bold text-[#1a1a1a] tracking-tight">
                            Model Performance Comparison
                        </h2>
                    </div>
                    <p className="text-[#666] text-base mt-1 ml-12">
                        Compare evaluation metrics across different graph neural network architectures
                    </p>
                </div>

                {/* Flip Cards Section */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-[#1a1a1a] flex items-center gap-2 mb-5">
                        <TbBrain className="w-5 h-5 text-[#427466]" />
                        Models
                    </h3>
                    <div className="grid grid-cols-5 gap-5">
                        {models.map((model, index) => (
                            <div
                                key={model.id}
                                className="animate-fade-in-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <ModelFlipCard model={model} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* View Tabs */}
                <div className="flex items-center gap-2 mb-6">
                    <button
                        onClick={() => setActiveView("metrics")}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${activeView === "metrics"
                            ? 'bg-[#427466] text-white shadow-[0_8px_24px_rgba(66,116,102,0.3)] scale-105'
                            : 'bg-white border border-[#e5e5e5] text-[#666] hover:border-[#427466] hover:text-[#427466] hover:shadow-md'
                            }`}
                    >
                        <TbChartBar className={`w-5 h-5 transition-transform duration-300 ${activeView === "metrics" ? 'scale-110' : ''}`} />
                        Compare Metrics
                    </button>
                    {/* <button
                        onClick={() => setActiveView("details")}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${activeView === "details"
                            ? 'bg-[#427466] text-white shadow-[0_8px_24px_rgba(66,116,102,0.3)] scale-105'
                            : 'bg-white border border-[#e5e5e5] text-[#666] hover:border-[#427466] hover:text-[#427466] hover:shadow-md'
                            }`}
                    >
                        <TbBrain className={`w-5 h-5 transition-transform duration-300 ${activeView === "details" ? 'scale-110' : ''}`} />
                        Model Details
                    </button> */}
                </div>

                {/* Content Area */}
                {activeView === "metrics" && (
                    <div className="animate-fade-in">
                        {/* Model Selection */}
                        <div className=" p-5 mb-6 ">
                            <h4 className="text-sm font-semibold text-[#333] mb-4 flex items-center gap-2">
                                <TbTargetArrow className="w-4 h-4 text-[#427466]" />
                                Select Models to Compare
                            </h4>
                            <div className="flex gap-3">
                                {models.map((model) => {
                                    const Icon = model.icon;
                                    const isSelected = selectedModels.includes(model.id);
                                    return (
                                        <button
                                            key={model.id}
                                            onClick={() => toggleModelSelection(model.id)}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all duration-300 ${isSelected
                                                ? 'bg-gradient-to-r shadow-md scale-100'
                                                : 'bg-[#f5f5f5] text-[#666] hover:bg-[#e5e5e5]'
                                                }`}
                                            style={{
                                                background: isSelected ? `linear-gradient(135deg, ${model.color}20, ${model.color}10)` : '#ffffff',
                                                borderColor: isSelected ? model.color : '#125508ff',
                                                borderWidth: isSelected ? '1px' : undefined,
                                                color: isSelected ? model.color : undefined
                                            }}
                                        >
                                            <div className={`p-1.5 rounded-lg bg-gradient-to-br ${model.gradient}`}>
                                                <Icon className="w-3.5 h-3.5 text-white" />
                                            </div>
                                            {model.name}
                                            {isSelected && <TbCheck className="w-4 h-4" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Visualization Type Toggle */}
                        <div className="flex items-center justify-center gap-4 mb-8 cursor-pointer">
                            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                                <button
                                    onClick={() => setVizType('bar')}
                                    className={` cursor-pointer flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${vizType === 'bar'
                                        ? 'bg-white text-[#427466] shadow-md'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <TbChartBar className="w-4 h-4" />
                                    Bar Charts
                                </button>
                                <button
                                    onClick={() => setVizType('radar')}
                                    className={` cursor-pointer flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${vizType === 'radar'
                                        ? 'bg-white text-[#427466] shadow-md'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <TbRadar className="w-4 h-4" />
                                    Radar Chart
                                </button>
                            </div>
                        </div>

                        {/* Conditional Rendering: Bar Charts or Radar Chart */}
                        {vizType === 'bar' ? (
                            <div className="grid grid-cols-2 gap-6">
                                {/* Recall Graph */}
                                <GroupedBarChart
                                    models={filteredModels}
                                    metrics={recallMetrics}
                                    title="Recall Metrics"
                                    icon={TbChartBar}
                                />

                                {/* Precision Graph */}
                                <GroupedBarChart
                                    models={filteredModels}
                                    metrics={precisionMetrics}
                                    title="Precision Metrics"
                                    icon={TbTargetArrow}
                                />
                            </div>
                        ) : (
                            <RadarChart models={filteredModels} />
                        )}
                    </div>
                )}
            </main>

            {/* CSS Animations */}
            < style jsx global > {`
                /* Flip Card Styles */
                .flip-card {
                    background-color: transparent;
                    perspective: 1000px;
                    height: 280px;
                }

                .flip-card-inner {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    text-align: center;
                    transition: transform 0.6s;
                    transform-style: preserve-3d;
                }

                .flip-card:hover .flip-card-inner {
                    transform: rotateY(180deg);
                }

                .flip-card-front, .flip-card-back {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    backface-visibility: hidden;
                    border-radius: 1rem;
                    border: 1px solid #e5e5e5;
                }

                .flip-card-front {
                    background-color: white;
                }

                .flip-card-back {
                    transform: rotateY(180deg);
                }

                /* Other Animations */
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

                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }

                .animate-fade-in-up {
                    animation: fade-in-up 0.6s ease-out forwards;
                    opacity: 0;
                }

                .animate-fade-in {
                    animation: fade-in 0.4s ease-out forwards;
                }

                .animate-slide-up {
                    animation: slide-up 0.5s ease-out forwards;
                    opacity: 0;
                }

                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
            `}</style >
        </div >
    );
}
