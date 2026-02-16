"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { TbHome, TbLayoutDashboard, TbUserHeart, TbNetwork, TbChartBar, TbGraph, TbChevronDown, TbRoute } from "react-icons/tb";

export default function Home() {
  const pathname = usePathname();
  const [graphDropdownOpen, setGraphDropdownOpen] = useState(false);
  const graphDropdownRef = useRef<HTMLDivElement>(null);

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
      <header className="flex justify-between h-20 px-12 py-5 bg-[#ffffff] shadow-md relative z-50">
        <div className="flex items-center gap-3 pl-6">
          <h1 className="text-xl font-medium text-[#1a1a1a]">
            <b>Drug Recommendation System</b>
          </h1>
        </div>

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
              <TbNetwork className="w-4 h-4" />
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
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-88px)] relative z-10">
        {/* Integration Badge */}
        <div className="flex items-center gap-2 px-10 py-4 bg-white border border-[#d1d5db] rounded-full">
          <TbGraph className="w-5 h-5 text-[#427466] shrink-0" />
          <span className="font-medium text-[#333] whitespace-nowrap">
            UMLS - MIMIC Integration
          </span>
        </div>

        {/* Main Heading */}
        <h2 className="text-[44px] font-bold text-[#1a1a1a] text-center mb-5 leading-tight mt-10">
          Graph Based Drug Recommendation
          <br />
          System
        </h2>

        {/* Subheading */}
        <p className="text-[#427466] text-lg text-center mb-10">
          Integrating Clinical and Biomedical Knowledge Graphs using Neo4j
        </p>

        {/* CTA Button */}
        <Link
          href="/dashboard"
          className="bg-[#427466] items-center justify-between px-6 py-3.5 hover:bg-[#365f54] text-white rounded-xl text-base font-medium transition-all duration-200 shadow-sm"
        >
          Explore Knowledge Graph
        </Link>
      </main>
    </div>
  );
}
