"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { TbZoomIn, TbZoomOut, TbArrowsMaximize } from "react-icons/tb";

export default function Dashboard() {
    const pathname = usePathname();
    const [nodeType, setNodeType] = useState("Patient");
    const [relationshipType, setRelationshipType] = useState("Patient Drugs");

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
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`rounded-xl text-sm cursor-pointer font-medium transition-all duration-200 px-5 py-2 ${pathname === item.href
                                    ? "bg-[#427466] text-white"
                                    : "bg-[#D9D9D9] text-[#333333] hover:bg-[#c9c9c9]"
                                }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </header>

            {/* Main Content */}
            <main className="relative z-10">
                <div className="w-full px-8 py-6">
                    {/* Dashboard Header */}
                    <div className="mb-6">
                        <h2 className="text-[32px] font-semibold text-[#1a1a1a] tracking-tight">
                            Graph Exploration Dashboard
                        </h2>
                        <p className="text-[#666] text-base mt-1">
                            Interactive knowledge graph visualization and node relationship analysis
                        </p>
                    </div>

                    {/* Graph Controls - Full Width on Top */}
                    <div className="bg-white rounded-2xl border border-[#e5e5e5] p-5 mb-5">
                        <h3 className="text-xs font-semibold text-[#666] tracking-wider mb-5">
                            GRAPH CONTROLS
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
                    </div>

                    {/* Two Column Layout - Graph Visualization and Node Details */}
                    <div className="grid grid-cols-[1fr_420px] h-[calc(100vh-100px)]">
                        {/* Graph Visualization */}
                        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-5 relative w-250">
                            {/* Zoom Controls - Top Right */}
                            <div className="absolute top-5 right-5 flex gap-2">
                                <button className="w-10 h-10 flex items-center justify-center border border-[#e5e5e5] rounded-lg hover:bg-[#f5f5f5] transition-colors">
                                    <TbZoomIn className="w-5 h-5 text-[#666]" />
                                </button>
                                <button className="w-10 h-10 flex items-center justify-center border border-[#e5e5e5] rounded-lg hover:bg-[#f5f5f5] transition-colors">
                                    <TbZoomOut className="w-5 h-5 text-[#666]" />
                                </button>
                                <button className="w-10 h-10 flex items-center justify-center border border-[#e5e5e5] rounded-lg hover:bg-[#f5f5f5] transition-colors">
                                    <TbArrowsMaximize className="w-5 h-5 text-[#666]" />
                                </button>
                            </div>

                            {/* Graph Area */}
                            <div className="h-full flex flex-col">
                                <div className="flex-1 flex items-center justify-center">
                                    {/* Empty graph area - will be populated with actual graph */}
                                </div>

                                {/* Node Types Legend - Bottom Left */}
                                <div className="absolute bottom-5 left-5">
                                    <div className="inline-block bg-white border border-[#e5e5e5] rounded-lg px-4 py-3">
                                        <h4 className="text-xs font-semibold text-[#666] tracking-wider mb-3">
                                            NODE TYPES
                                        </h4>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full bg-[#DC2626]"></span>
                                                <span className="text-sm text-[#333]">Patient</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full bg-[#2563EB]"></span>
                                                <span className="text-sm text-[#333]">Drug</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full bg-[#EAB308]"></span>
                                                <span className="text-sm text-[#333]">Disease</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full bg-[#000000]"></span>
                                                <span className="text-sm text-[#333]">Visit</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Panel - Node Details */}
                        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-5">
                            <h3 className="text-xs font-semibold text-[#666] tracking-wider mb-5">
                                NODE DETAILS
                            </h3>
                            {/* Node details will be populated when a node is selected */}
                            <div className="text-sm text-[#999]">
                                Select a node to view details
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
