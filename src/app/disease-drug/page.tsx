"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { TbZoomIn, TbZoomOut, TbArrowsMaximize, TbStar } from "react-icons/tb";

export default function DiseaseDrug() {
    const pathname = usePathname();
    const [diseaseId, setDiseaseId] = useState("");
    const [diseaseName, setDiseaseName] = useState("Disease ABCD");

    const navItems = [
        { name: "Home", href: "/" },
        { name: "Dashboard", href: "/dashboard" },
        { name: "Patient DR", href: "/patient-dr" },
        // { name: "Disease - Drug", href: "/disease-drug" },
        { name: "Model Comparison", href: "/model-compare" },
    ];

    // Sample associated drugs data (will be fetched from backend later)
    const associatedDrugs = [
        { rank: 1, name: "Drug 1", cuid: "CUID", score: 0.84, isTop: true },
        { rank: 2, name: "Drug 4", cuid: "CUID", score: 0.72, isTop: false },
        { rank: 3, name: "Drug 2", cuid: "CUID", score: 0.57, isTop: false },
        { rank: 4, name: "Drug 5", cuid: "CUID", score: 0.49, isTop: false },
        { rank: 5, name: "Drug 3", cuid: "CUID", score: 0.42, isTop: false },
    ];

    const handleSearch = () => {
        // Will be implemented with backend integration
        console.log("Searching for disease:", diseaseId);
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
                    {/* Page Header */}
                    <div className="mb-6">
                        <h2 className="text-[32px] font-semibold text-[#1a1a1a] tracking-tight">
                            Disease Based Drug Associations
                        </h2>
                        <p className="text-[#666] text-base mt-1">
                            Personalized drug recommendations based on patient profile and network
                        </p>
                    </div>

                    {/* Search Section */}
                    <div className="bg-white rounded-2xl border border-[#e5e5e5] p-5 mb-5 inline-flex items-center gap-4">
                        <label className="text-sm font-medium text-[#333]">Disease ID :</label>
                        <input
                            type="text"
                            value={diseaseId}
                            onChange={(e) => setDiseaseId(e.target.value)}
                            className="w-64 px-4 py-2 border-b border-[#333] bg-transparent text-sm focus:outline-none focus:border-[#427466]"
                            placeholder=""
                        />
                        <button
                            onClick={handleSearch}
                            className="px-6 py-2 bg-[#427466] text-white rounded-lg text-sm font-medium hover:bg-[#365f54] transition-colors"
                        >
                            Search
                        </button>
                    </div>

                    {/* Two Column Layout - Network and Associated Drugs */}
                    <div className="grid grid-cols-[1fr_420px] gap-5 h-[calc(100vh-280px)]">
                        {/* Left Panel - Disease Drug Network */}
                        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-5 relative">
                            {/* Panel Header with Zoom Controls */}
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-semibold text-[#333] tracking-wide">
                                    Disease Name - <span className="font-normal">{diseaseName}</span>
                                </h3>
                                <div className="flex gap-2">
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
                            </div>

                            {/* Network Visualization Area */}
                            <div className="h-full flex flex-col">
                                <div className="flex-1 flex items-center justify-center">
                                    {/* Empty network area - will be populated with actual graph */}
                                </div>

                                {/* Legend */}
                                <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
                                    <p className="text-sm text-[#666]">High color intensity - High confidence</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Panel - Associated Drugs */}
                        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-5">
                            <div className="flex items-center gap-2 mb-5">
                                <h3 className="text-sm font-semibold text-[#333] tracking-wide">
                                    ASSOCIATED DRUGS
                                </h3>
                                <TbStar className="w-4 h-4 text-[#EAB308] fill-[#EAB308]" />
                            </div>

                            {/* Drug List - Scrollable */}
                            <div className="flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-380px)] pr-2">
                                {associatedDrugs.map((drug) => (
                                    <div
                                        key={drug.rank}
                                        className={`p-4 rounded-xl border ${drug.isTop
                                            ? "bg-[#F0FDF4] border-[#86EFAC]"
                                            : "bg-white border-[#e5e5e5]"
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Rank Badge */}
                                            <span
                                                className={`w-7 h-7 flex items-center justify-center rounded-md text-sm font-semibold ${drug.isTop
                                                    ? "bg-[#84CC16] text-white"
                                                    : "bg-[#E5E7EB] text-[#333]"
                                                    }`}
                                            >
                                                {drug.rank}
                                            </span>

                                            {/* Drug Info */}
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-base font-medium text-[#333]">
                                                        {drug.name} - <span className="text-[#666] text-sm">{drug.cuid}</span>
                                                    </span>
                                                    <div className="text-right">
                                                        <span className="text-lg font-bold text-[#333]">{drug.score}</span>
                                                        <p className="text-xs text-[#666]">score</p>
                                                    </div>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-[#2563EB] rounded-full"
                                                        style={{ width: `${drug.score * 100}%` }}
                                                    />
                                                </div>

                                                {/* Top Recommendation Label */}
                                                {drug.isTop && (
                                                    <p className="text-xs text-[#427466] mt-2 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#427466]"></span>
                                                        Highest confidence recommendation
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
