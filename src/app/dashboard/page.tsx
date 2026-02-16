"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
    TbZoomIn, TbZoomOut, TbArrowsMaximize, TbHome, TbLayoutDashboard,
    TbUserHeart, TbNetwork, TbChevronDown, TbGraph, TbChartBar,
    TbFilter, TbDatabase, TbSearch, TbLoader2, TbClick,
    TbAdjustments, TbHash, TbRoute
} from "react-icons/tb";
import GraphView from "./components/GraphView";

export default function Dashboard() {
    const pathname = usePathname();
    const [nodeType, setNodeType] = useState("Patient");
    const [relationshipType, setRelationshipType] = useState("Patient Drugs");
    const [inputValue, setInputValue] = useState("");
    const [records, setRecords] = useState<any>({});
    const [selectedNode, setSelectedNode] = useState<any>(null);
    const [availableIds, setAvailableIds] = useState<string[]>([]);
    const [loadingIds, setLoadingIds] = useState(false);
    const [isQuerying, setIsQuerying] = useState(false);
    const [resultLimit, setResultLimit] = useState<number>(10);
    const [graphDropdownOpen, setGraphDropdownOpen] = useState(false);
    const graphDropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
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

    const nodeTypes = ["Patient", "Visit"];

    // Get relationship types based on selected node type
    const getRelationshipTypes = () => {
        if (nodeType === "Patient") {
            return ["Patient Drugs", "Patient Diagnosis", "Patient Visit"];
        } else if (nodeType === "Visit") {
            return ["Visit Diagnosis", "Visit Drugs"];
        }
        return [];
    };

    const currentRelationshipTypes = getRelationshipTypes();

    // Fetch available IDs when nodeType changes
    useEffect(() => {
        async function fetchIds() {
            if (nodeType !== "Patient" && nodeType !== "Visit") {
                setAvailableIds([]);
                return;
            }

            setLoadingIds(true);
            try {
                const queryType = nodeType === "Patient" ? "ALL_PATIENTS" : "ALL_VISITS";
                const res = await fetch("/api/query", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ queryType, params: {} })
                });
                const data = await res.json();
                if (data.ids) {
                    setAvailableIds(data.ids);
                    if (data.ids.length > 0) {
                        setInputValue(data.ids[0]); // Set first ID as default
                    }
                }
            } catch (err) {
                console.error("Failed to fetch IDs:", err);
                setAvailableIds([]);
            }
            setLoadingIds(false);
        }
        fetchIds();
    }, [nodeType]);

    // Map relationship types to query types
    const getQueryType = () => {
        const mapping: Record<string, string> = {
            "Patient Drugs": "PATIENT_DRUGS",
            "Patient Diagnosis": "PATIENT_DIAGNOSES",
            "Patient Visit": "PATIENT_ADMISSIONS",
            "Visit Diagnosis": "VISIT_DIAGNOSES",
            "Visit Drugs": "VISIT_DRUGS"
        };
        return mapping[relationshipType];
    };

    async function runQuery() {
        if (!inputValue || inputValue.trim() === "") {
            alert("Please select a valid ID");
            return;
        }

        setIsQuerying(true);
        setSelectedNode(null);
        try {
            const params = nodeType === "Patient"
                ? { id: inputValue.trim() }
                : { visit: inputValue.trim() };

            const res = await fetch("/api/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    queryType: getQueryType(),
                    params,
                    limit: resultLimit || undefined
                })
            });

            const data = await res.json();
            setRecords(data);
        } catch (err) {
            console.error("Query failed:", err);
            alert("Failed to execute query");
        }
        setIsQuerying(false);
    }

    // Node type colors for the details panel
    const getNodeTypeColor = (group: string) => {
        switch (group) {
            case "Patient": return { bg: "from-[#427466] to-[#2d5a4e]", light: "bg-[#427466]/10", text: "text-[#427466]" };
            case "Drug": return { bg: "from-emerald-500 to-teal-600", light: "bg-emerald-500/10", text: "text-emerald-600" };
            case "Diagnosis": return { bg: "from-amber-500 to-orange-600", light: "bg-amber-500/10", text: "text-amber-600" };
            case "Visit": return { bg: "from-sky-500 to-cyan-600", light: "bg-sky-500/10", text: "text-sky-600" };
            default: return { bg: "from-violet-500 to-purple-600", light: "bg-violet-500/10", text: "text-violet-600" };
        }
    };

    return (
        <div className="min-h-screen bg-[#F9F9F9] relative overflow-hidden">
            {/* Background Image Overlay */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 600'%3E%3Cdefs%3E%3Cpattern id='graph' x='0' y='0' width='200' height='200' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='50' cy='50' r='8' fill='%23427466'/%3E%3Ccircle cx='150' cy='50' r='6' fill='%23427466'/%3E%3Ccircle cx='100' cy='100' r='10' fill='%23427466'/%3E%3Ccircle cx='50' cy='150' r='5' fill='%23427466'/%3E%3Ccircle cx='150' cy='150' r='7' fill='%23427466'/%3E%3Cline x1='50' y1='50' x2='100' y2='100' stroke='%23427466' stroke-width='1.5'/%3E%3Cline x1='150' y1='50' x2='100' y2='100' stroke='%23427466' stroke-width='1.5'/%3E%3Cline x1='100' y1='100' x2='50' y2='150' stroke='%23427466' stroke-width='1.5'/%3E%3Cline x1='100' y1='100' x2='150' y2='150' stroke='%23427466' stroke-width='1.5'/%3E%3Cline x1='50' y1='50' x2='150' y2='50' stroke='%23427466' stroke-width='1'/%3E%3Cline x1='50' y1='150' x2='150' y2='150' stroke='%23427466' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23graph)'/%3E%3C/svg%3E")`,
                    backgroundSize: "400px 400px",
                    opacity: 0.08,
                }}
            />

            {/* Header / Navbar */}
            <header className="flex justify-between h-20 px-12 py-5 bg-[#ffffff] shadow-md relative z-50">
                <Link href="/" className="flex items-center gap-3 pl-6 cursor-pointer">
                    <h1 className="text-xl font-medium text-[#1a1a1a]">
                        <b>Drug Recommendation System</b>
                    </h1>
                </Link>

                {/* Navigation */}
                <nav className="flex items-center gap-3 pr-6">
                    {/* Home */}
                    <Link
                        href="/"
                        className={`flex items-center gap-2 rounded-xl text-sm cursor-pointer font-medium transition-all duration-200 px-4 py-2 ${pathname === "/"
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
                            className={`flex items-center gap-2 rounded-xl text-sm cursor-pointer font-medium transition-all duration-200 px-4 py-2 ${isGraphPage
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
                                className={`flex items-center gap-2 rounded-xl text-sm cursor-pointer font-medium transition-all duration-200 px-4 py-2 ${pathname === item.href
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
                    {/* Dashboard Header */}
                    <div className="mb-8 animate-fade-in">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#427466] to-[#2d5a4e] shadow-lg" style={{ boxShadow: '0 8px 24px rgba(66,116,102,0.3)' }}>
                                <TbLayoutDashboard className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h2 className="text-[32px] font-bold text-[#1a1a1a] tracking-tight">
                                    Integrated Graph Exploration Dashboard
                                </h2>
                                <p className="text-[#888] text-sm mt-0.5">
                                    Interactive knowledge graph visualization and node relationship analysis
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Graph Controls — Enhanced */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#e5e5e5] overflow-hidden mb-5 animate-fade-in-up hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-300" style={{ animationDelay: '100ms' }}>
                        {/* Gradient Accent Strip */}
                        <div className="h-1 bg-gradient-to-r from-[#427466] via-[#5BA899] to-[#427466]" />

                        <div className="p-5">
                            <h3 className="text-sm font-semibold text-[#1a1a1a] mb-5 flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-[#427466]/10">
                                    <TbAdjustments className="w-4 h-4 text-[#427466]" />
                                </div>
                                Graph Controls
                            </h3>

                            <div className="flex gap-5">
                                {/* Node Type Dropdown */}
                                <div className="flex-1">
                                    <label className="block text-[10px] text-[#888] mb-2 uppercase tracking-widest font-semibold">
                                        Node Type
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={nodeType}
                                            onChange={(e) => {
                                                setNodeType(e.target.value);
                                                if (e.target.value === "Patient") {
                                                    setRelationshipType("Patient Drugs");
                                                } else if (e.target.value === "Visit") {
                                                    setRelationshipType("Visit Diagnosis");
                                                }
                                            }}
                                            className="w-full px-4 py-3 bg-gradient-to-br from-gray-50 to-white text-[#1a1a1a] border-2 border-[#e5e5e5] rounded-xl appearance-none cursor-pointer text-sm font-medium focus:outline-none focus:border-[#427466] focus:ring-2 focus:ring-[#427466]/10 transition-all duration-200"
                                        >
                                            {nodeTypes.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <TbChevronDown className="w-4 h-4 text-[#888]" />
                                        </div>
                                    </div>
                                </div>

                                {/* Relationship Type Dropdown */}
                                <div className="flex-1">
                                    <label className="block text-[10px] text-[#888] mb-2 uppercase tracking-widest font-semibold">
                                        Relation Type
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={relationshipType}
                                            onChange={(e) => setRelationshipType(e.target.value)}
                                            className="w-full px-4 py-3 bg-gradient-to-br from-gray-50 to-white text-[#1a1a1a] border-2 border-[#e5e5e5] rounded-xl appearance-none cursor-pointer text-sm font-medium focus:outline-none focus:border-[#427466] focus:ring-2 focus:ring-[#427466]/10 transition-all duration-200"
                                        >
                                            {currentRelationshipTypes.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <TbChevronDown className="w-4 h-4 text-[#888]" />
                                        </div>
                                    </div>
                                </div>

                                {/* Result Limit Dropdown */}
                                <div className="flex-1">
                                    <label className="block text-[10px] text-[#888] mb-2 uppercase tracking-widest font-semibold">
                                        Result Limit
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={resultLimit}
                                            onChange={(e) => setResultLimit(Number(e.target.value))}
                                            className="w-full px-4 py-3 bg-gradient-to-br from-gray-50 to-white text-[#1a1a1a] border-2 border-[#e5e5e5] rounded-xl appearance-none cursor-pointer text-sm font-medium focus:outline-none focus:border-[#427466] focus:ring-2 focus:ring-[#427466]/10 transition-all duration-200"
                                        >
                                            <option value={10}>10</option>
                                            <option value={20}>20</option>
                                            <option value={50}>50</option>
                                            <option value={0}>No Limit</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <TbChevronDown className="w-4 h-4 text-[#888]" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ID Selection and Run Query Button */}
                            <div className="mt-5 flex gap-4 items-end">
                                {/* ID Dropdown */}
                                <div className="flex-1">
                                    <label className="block text-[10px] text-[#888] mb-2 uppercase tracking-widest font-semibold">
                                        <TbHash className="w-3 h-3 inline -mt-0.5 mr-1" />
                                        {nodeType === "Patient" ? "Patient ID" : "Visit ID"}
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            className="w-full px-4 py-3 bg-gradient-to-br from-gray-50 to-white text-[#1a1a1a] border-2 border-[#e5e5e5] rounded-xl appearance-none cursor-pointer text-sm font-medium focus:outline-none focus:border-[#427466] focus:ring-2 focus:ring-[#427466]/10 transition-all duration-200"
                                            disabled={loadingIds}
                                        >
                                            <option value="">
                                                {loadingIds ? "Loading..." : `-- Select ${nodeType} ID --`}
                                            </option>
                                            {availableIds.map(id => (
                                                <option key={id} value={id}>{id}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <TbChevronDown className="w-4 h-4 text-[#888]" />
                                        </div>
                                    </div>
                                </div>

                                {/* Run Query Button */}
                                <button
                                    onClick={runQuery}
                                    disabled={isQuerying || !inputValue}
                                    className="cursor-pointer px-8 py-3 bg-[#427466] text-white rounded-xl font-semibold text-sm disabled:bg-gray-300 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 hover:bg-[#365f54] active:scale-[0.98]"
                                >
                                    {isQuerying ? (
                                        <>
                                            <TbLoader2 className="w-4 h-4 animate-spin" />
                                            Querying...
                                        </>
                                    ) : (
                                        <>
                                            <TbSearch className="w-4 h-4 cursor-pointer" />
                                            Run Query
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Two Column Layout - Graph Visualization and Node Details */}
                    <div className="grid grid-cols-[1fr_420px] gap-5">
                        {/* Graph Visualization */}
                        <div className="relative animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                            {records.graph ? (
                                <div className="rounded-2xl overflow-hidden border border-[#e5e5e5]">
                                    <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
                                    <GraphView
                                        graph={records.graph}
                                        onNodeClick={setSelectedNode}
                                    />
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden h-[600px]">
                                    <div className="h-1 bg-gradient-to-r from-[#427466]/30 via-[#5BA899]/30 to-[#427466]/30" />
                                    <div className="h-[calc(100%-4px)] flex items-center justify-center">
                                        <div className="text-center">
                                            {isQuerying ? (
                                                <>
                                                    <div className="relative mx-auto w-16 h-16 mb-4">
                                                        <TbLoader2 className="w-16 h-16 text-[#427466] animate-spin" />
                                                        <div className="absolute inset-0 rounded-full bg-[#427466]/10 animate-ping" />
                                                    </div>
                                                    <p className="text-[#666] text-sm font-medium">Querying knowledge graph...</p>
                                                    <p className="text-[#bbb] text-xs mt-1">Fetching nodes and relationships</p>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#427466]/10 to-[#427466]/5 flex items-center justify-center animate-pulse-subtle">
                                                        <TbNetwork className="w-10 h-10 text-[#427466]/40" />
                                                    </div>
                                                    <p className="text-[#666] text-sm font-medium">
                                                        Select options and click Run Query
                                                    </p>
                                                    <p className="text-[#bbb] text-xs mt-1">
                                                        The knowledge graph will appear here
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Panel — Node Details (Enhanced) */}
                        <div className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden h-[600px] flex flex-col animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                            {/* Gradient Accent Strip */}
                            <div className="h-1 bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400" />

                            <div className="p-5 flex flex-col h-[calc(100%-4px)]">
                                <div className="flex items-center justify-between mb-5 flex-shrink-0">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1 rounded-md bg-violet-500/10">
                                            <TbClick className="w-4 h-4 text-violet-500" />
                                        </div>
                                        <h3 className="text-xs font-bold text-[#1a1a1a] uppercase tracking-wider">
                                            Node Details
                                        </h3>
                                    </div>
                                    {selectedNode && (
                                        <button
                                            onClick={() => setSelectedNode(null)}
                                            className="cursor-pointer text-[10px] px-3 py-1 rounded-lg bg-[#427466]/10 text-[#427466] hover:bg-[#427466]/20 font-semibold transition-colors uppercase tracking-wider"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>

                                <div className="flex-1 overflow-y-auto pr-1">
                                    {selectedNode ? (
                                        <div className="space-y-3 animate-fadeIn">
                                            {/* Node Type Badge */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-[#888] uppercase tracking-widest">Type</span>
                                                <span className={`px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r ${getNodeTypeColor(selectedNode.group).bg} text-white shadow-sm`}>
                                                    {selectedNode.group}
                                                </span>
                                            </div>

                                            {/* Node Properties */}
                                            {selectedNode.properties && Object.entries(selectedNode.properties).map(([key, value], index) => (
                                                <div
                                                    key={key}
                                                    className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-3.5 border border-gray-200 hover:border-[#427466]/30 hover:shadow-sm transition-all duration-200 animate-fade-in-up"
                                                    style={{
                                                        animationDelay: `${index * 60}ms`, borderLeft: `3px solid ${selectedNode.group === "Patient" ? "#427466" :
                                                            selectedNode.group === "Drug" ? "#10b981" :
                                                                selectedNode.group === "Diagnosis" ? "#f59e0b" :
                                                                    selectedNode.group === "Visit" ? "#0ea5e9" : "#8b5cf6"
                                                            }`
                                                    }}
                                                >
                                                    <div className="text-[10px] font-bold text-[#888] uppercase tracking-widest mb-1">
                                                        {key.replace(/_/g, " ")}
                                                    </div>
                                                    <div className="text-sm text-[#1a1a1a] font-medium break-words">
                                                        {String(value)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/5 flex items-center justify-center mb-4 animate-pulse-subtle">
                                                <TbClick className="w-8 h-8 text-violet-400/50" />
                                            </div>
                                            <p className="text-sm text-[#888] font-medium">
                                                Click a node in the graph
                                            </p>
                                            <p className="text-xs text-[#ccc] mt-1">
                                                Properties and details will appear here
                                            </p>
                                        </div>
                                    )}
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

                /* Custom scrollbar */
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
