"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { TbZoomIn, TbZoomOut, TbArrowsMaximize, TbHome, TbLayoutDashboard, TbUserHeart, TbNetwork } from "react-icons/tb";
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

    const navItems = [
        { name: "Home", href: "/" },
        { name: "Dashboard", href: "/dashboard" },
        { name: "Patient DR", href: "/patient-dr" },
        // { name: "Disease - Drug", href: "/disease-drug" },
        { name: "Model Comparison", href: "/model-compare" },
    ];

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
                    params
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

    return (
        <div className="min-h-screen bg-[#F9F9F9] relative">
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
            <header className="flex justify-between h-20 px-12 py-5 bg-[#ffffff] shadow-md relative z-10">
                <div className="flex items-center gap-3 pl-6">
                    <h1 className="text-xl font-medium text-[#1a1a1a]">
                        <b>Drug Recommendation System</b>
                    </h1>
                </div>

                {/* Navigation */}
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
                    {/* Dashboard Header */}
                    <div className="mb-8 animate-fade-in">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-[#427466] to-[#365f54]">
                                <TbLayoutDashboard className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-[32px] font-bold text-[#1a1a1a] tracking-tight">
                                Graph Exploration Dashboard
                            </h2>
                        </div>
                        <p className="text-[#666] text-base mt-1 ml-14">
                            Interactive knowledge graph visualization and node relationship analysis
                        </p>
                    </div>

                    {/* Graph Controls - Full Width on Top */}
                    <div className="bg-white rounded-2xl border border-[#e5e5e5] p-5 mb-5">
                        <h3 className="text-sm font-semibold text-[#333] mb-4 flex items-center gap-2">
                            <TbArrowsMaximize className="w-4 h-4 text-[#427466]" />
                            Graph Controls
                        </h3>

                        <div className="flex gap-6">
                            {/* Node Type Dropdown */}
                            <div className="flex-1">
                                <label className="block text-sm text-[#333] mb-2">Select Node Type</label>
                                <div className="relative">
                                    <select
                                        value={nodeType}
                                        onChange={(e) => {
                                            setNodeType(e.target.value);
                                            // Reset relationship type when node type changes
                                            if (e.target.value === "Patient") {
                                                setRelationshipType("Patient Drugs");
                                            } else if (e.target.value === "Visit") {
                                                setRelationshipType("Visit Diagnosis");
                                            }
                                        }}
                                        className="w-full px-4 py-3 bg-white text-[#1a1a1a] border border-[#1a1a1a] rounded-lg appearance-none cursor-pointer text-sm focus:outline-none focus:ring-2 focus:ring-[#427466]"
                                    >
                                        {nodeTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg className="w-4 h-4 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Relationship Type Dropdown */}
                            <div className="flex-1">
                                <label className="block text-sm text-[#333] mb-2">Select Relation Type</label>
                                <div className="relative">
                                    <select
                                        value={relationshipType}
                                        onChange={(e) => setRelationshipType(e.target.value)}
                                        className="w-full px-4 py-3 bg-white text-[#1a1a1a] border border-[#1a1a1a] rounded-lg appearance-none cursor-pointer text-sm focus:outline-none focus:ring-2 focus:ring-[#427466]"
                                    >
                                        {currentRelationshipTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg className="w-4 h-4 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ID Selection and Run Query Button */}
                        <div className="mt-5 flex gap-4 items-end">
                            {/* ID Dropdown */}
                            <div className="flex-1">
                                <label className="block text-sm text-[#333] mb-2">
                                    {nodeType === "Patient" ? "Select Patient ID" : "Select Visit ID"}
                                </label>
                                <select
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    className="w-full px-4 py-3 bg-white text-[#1a1a1a] border border-[#1a1a1a] rounded-lg appearance-none cursor-pointer text-sm focus:outline-none focus:ring-2 focus:ring-[#427466]"
                                    disabled={loadingIds}
                                >
                                    <option value="">
                                        {loadingIds ? "Loading..." : `-- Select ${nodeType} ID --`}
                                    </option>
                                    {availableIds.map(id => (
                                        <option key={id} value={id}>{id}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Run Query Button */}
                            <button
                                onClick={runQuery}
                                disabled={isQuerying || !inputValue}
                                className="px-8 py-3 bg-[#427466] text-white rounded-lg font-semibold text-sm hover:bg-[#365f54] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                {isQuerying ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Querying...
                                    </>
                                ) : (
                                    <>
                                        <TbNetwork className="w-4 h-4" />
                                        Run Query
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Two Column Layout - Graph Visualization and Node Details */}
                    <div className="grid grid-cols-[1fr_420px] gap-5">
                        {/* Graph Visualization */}
                        <div className="relative">
                            {records.graph ? (
                                <GraphView
                                    graph={records.graph}
                                    onNodeClick={setSelectedNode}
                                />
                            ) : (
                                <div className="bg-white rounded-2xl border-2 border-[#e5e5e5] p-12 h-[600px] flex items-center justify-center">
                                    <div className="text-center">
                                        <TbNetwork className="w-16 h-16 text-[#d1d1d1] mx-auto mb-4" />
                                        <p className="text-[#666] text-sm">
                                            {isQuerying ? "Loading graph..." : "Select options and click Run Query to visualize the knowledge graph"}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Panel - Node Details */}
                        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-5 h-[600px] overflow-y-auto">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-xs font-semibold text-[#666] tracking-wider">
                                    NODE DETAILS
                                </h3>
                                {selectedNode && (
                                    <button
                                        onClick={() => setSelectedNode(null)}
                                        className="cursor-pointer text-xs text-[#427466] hover:text-[#365f54] font-medium"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>

                            {selectedNode ? (
                                <div className="space-y-4">
                                    {/* Node Type Badge */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-[#888] uppercase tracking-wide">Type</span>
                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${selectedNode.group === "Patient" ? "bg-[#427466]/10 text-[#427466]" :
                                            selectedNode.group === "Drug" ? "bg-[#10b981]/10  text-[#10b981]" :
                                                selectedNode.group === "Diagnosis" ? "bg-[#f59e0b]/10 text-[#f59e0b]" :
                                                    "bg-[#8b5cf6]/10 text-[#8b5cf6]"
                                            }`}>
                                            {selectedNode.group}
                                        </span>
                                    </div>

                                    {/* Node Properties */}
                                    {selectedNode.properties && Object.entries(selectedNode.properties).map(([key, value]) => (
                                        <div key={key} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                            <div className="text-[10px] font-bold text-[#888] uppercase tracking-wide mb-1">
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
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                        <TbUserHeart className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <p className="text-sm text-[#999]">
                                        Click a node in the graph to view its details
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main >
        </div >
    );
}
