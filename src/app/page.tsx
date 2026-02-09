"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TbGraph } from "react-icons/tb";

export default function Home() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Patient DR", href: "/patient-dr" },
    { name: "Disease - Drug", href: "/disease-drug" },
  ];

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
