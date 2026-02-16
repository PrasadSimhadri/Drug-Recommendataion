"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
    TbHome, TbUserHeart, TbChartBar, TbGraph, TbChevronDown, TbChevronRight,
    TbDatabase, TbArrowRight, TbFileDatabase, TbTransform,
    TbFilterSearch, TbLink, TbUsers, TbPrescription, TbStethoscope,
    TbArrowsExchange2, TbCircleCheck, TbRoute, TbNetwork
} from "react-icons/tb";

// ─── Scroll-reveal hook ────────────────────────────────────────────
function useScrollReveal(threshold = 0.15) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
            { threshold }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);

    return { ref, isVisible };
}

// ─── Typewriter component ──────────────────────────────────────────
function Typewriter({ text, trigger, className = "" }: { text: string; trigger: boolean; className?: string }) {
    const [display, setDisplay] = useState("");
    const [showCursor, setShowCursor] = useState(true);

    useEffect(() => {
        if (!trigger) return;
        let i = 0;
        setDisplay("");
        const iv = setInterval(() => {
            i++;
            setDisplay(text.slice(0, i));
            if (i >= text.length) {
                clearInterval(iv);
                setTimeout(() => setShowCursor(false), 1200);
            }
        }, 35);
        return () => clearInterval(iv);
    }, [trigger, text]);

    return (
        <span className={className}>
            {trigger ? display : ""}
            {trigger && showCursor && (
                <span className="inline-block w-0.5 h-[1.1em] bg-current animate-blink ml-0.5 align-middle" />
            )}
        </span>
    );
}

// ─── Animated counter ──────────────────────────────────────────────
function AnimatedNumber({ value, trigger, suffix = "" }: { value: number; trigger: boolean; suffix?: string }) {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (!trigger) return;
        let start = 0;
        const duration = 1800;
        const stepTime = 16;
        const steps = duration / stepTime;
        const increment = value / steps;
        const iv = setInterval(() => {
            start += increment;
            if (start >= value) {
                setCurrent(value);
                clearInterval(iv);
            } else {
                setCurrent(Math.floor(start));
            }
        }, stepTime);
        return () => clearInterval(iv);
    }, [trigger, value]);

    return <span>{trigger ? current.toLocaleString() + suffix : "0"}</span>;
}

// ─── File badge component ──────────────────────────────────────────
function FileBadge({ name, type }: { name: string; type: "umls" | "mimic" | "output" | "rxnorm" }) {
    const colors = {
        umls: "bg-gradient-to-r from-[#427466]/15 to-[#2d5a4e]/10 text-[#2d5a4e] border-[#427466]/30",
        mimic: "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 border-blue-400/30",
        output: "bg-gradient-to-r from-violet-500/10 to-purple-500/10 text-purple-700 border-violet-400/30",
        rxnorm: "bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-700 border-amber-400/30",
    };
    const icons = {
        umls: TbDatabase,
        mimic: TbFileDatabase,
        output: TbCircleCheck,
        rxnorm: TbPrescription,
    };
    const Icon = icons[type];

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold tracking-wide ${colors[type]}`}>
            <Icon className="w-3 h-3" />
            {name}
        </span>
    );
}

// ─── Equation block ────────────────────────────────────────────────
function EquationBlock({ children, label }: { children: React.ReactNode; label: string }) {
    return (
        <div className="equation-block relative group">
            <div className="absolute -left-3 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-[#427466] to-[#427466]/20 group-hover:from-[#427466] group-hover:to-[#2d5a4e] transition-all duration-500" />
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#888] font-semibold mb-2 ml-1">{label}</div>
            <div className="bg-[#1a1a1a] rounded-xl px-5 py-3.5 font-mono text-[14px] text-[#e0e0e0] overflow-x-auto shadow-[0_4px_24px_rgba(0,0,0,0.15)] border border-[#333] group-hover:border-[#427466]/40 transition-all duration-500 group-hover:shadow-[0_4px_24px_rgba(66,116,102,0.15)]">
                {children}
            </div>
        </div>
    );
}

// ─── Flow connector (vertical) ─────────────────────────────────────
function FlowConnectorV({ visible, id }: { visible: boolean; id: string }) {
    const gradId = `flowGradV_${id}`;
    return (
        <div className={`flex justify-center py-2 transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0 translate-y-4'}`}>
            <svg width="40" height="50" viewBox="0 0 40 50" className="overflow-visible">
                <defs>
                    <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#427466" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#427466" stopOpacity="0.2" />
                    </linearGradient>
                </defs>
                <line x1="20" y1="0" x2="20" y2="35" stroke={`url(#${gradId})`} strokeWidth="2" strokeDasharray="5 3" className="flow-dash" />
                <polygon points="14,32 20,46 26,32" fill="#427466" opacity="0.6" className="flow-arrow" />
                <circle r="2.5" fill="#427466" opacity="0.9">
                    <animateMotion dur="1.5s" repeatCount="indefinite" path="M20,0 L20,35" />
                </circle>
            </svg>
        </div>
    );
}

// ─── Flow connector (horizontal) ───────────────────────────────────
function FlowConnectorH({ visible, id, direction = "right" }: { visible: boolean; id: string; direction?: "right" | "left" }) {
    const gradId = `flowGradH_${id}`;
    const isRight = direction === "right";
    return (
        <div className={`flex items-center justify-center py-2 transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0 translate-x-4'}`}>
            <svg width="70" height="30" viewBox="0 0 70 30" className="overflow-visible">
                <defs>
                    <linearGradient id={gradId} x1={isRight ? "0" : "1"} y1="0" x2={isRight ? "1" : "0"} y2="0">
                        <stop offset="0%" stopColor="#427466" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#427466" stopOpacity="0.2" />
                    </linearGradient>
                </defs>
                {isRight ? (
                    <>
                        <line x1="0" y1="15" x2="55" y2="15" stroke={`url(#${gradId})`} strokeWidth="2" strokeDasharray="5 3" className="flow-dash" />
                        <polygon points="52,9 66,15 52,21" fill="#427466" opacity="0.6" className="flow-arrow" />
                        <circle r="2.5" fill="#427466" opacity="0.9">
                            <animateMotion dur="1.5s" repeatCount="indefinite" path="M0,15 L55,15" />
                        </circle>
                    </>
                ) : (
                    <>
                        <line x1="15" y1="15" x2="70" y2="15" stroke={`url(#${gradId})`} strokeWidth="2" strokeDasharray="5 3" className="flow-dash" />
                        <polygon points="18,9 4,15 18,21" fill="#427466" opacity="0.6" className="flow-arrow" />
                        <circle r="2.5" fill="#427466" opacity="0.9">
                            <animateMotion dur="1.5s" repeatCount="indefinite" path="M70,15 L15,15" />
                        </circle>
                    </>
                )}
            </svg>
        </div>
    );
}


// ─── Pipeline Accordion Card ───────────────────────────────────────
interface PipelineCardProps {
    stageNum: string;
    title: string;
    subtitle: string;
    description: string;
    inputs: { name: string; type: "umls" | "mimic" | "output" | "rxnorm" }[];
    outputs: { name: string; type: "umls" | "mimic" | "output" | "rxnorm" }[];
    equation: React.ReactNode;
    equationLabel: string;
    icon: React.ElementType;
    color: string;
    gradient: string;
    stats?: { label: string; value: number; suffix: string }[];
    delay?: number;
}

function PipelineCard({
    stageNum, title, subtitle, description, inputs, outputs,
    equation, equationLabel, icon: Icon, color, gradient, stats, delay = 0
}: PipelineCardProps) {
    const { ref, isVisible } = useScrollReveal(0.1);
    const [expanded, setExpanded] = useState(false);

    return (
        <div ref={ref} className="h-full">
            <div
                className={`pipeline-card relative h-full transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}`}
                style={{ transitionDelay: `${delay}ms` }}
            >
                {/* Animated gradient border */}
                <div className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 gradient-border-spin pointer-events-none z-0"
                    style={{ background: `conic-gradient(from 0deg, ${color}40, transparent, ${color}20, transparent, ${color}40)` }} />

                <div
                    className="relative h-full rounded-2xl border border-white/60 shadow-[0_8px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)] transition-all duration-500 overflow-hidden group"
                    style={{
                        background: `linear-gradient(135deg, rgba(255,255,255,0.92) 0%, ${color}06 30%, ${color}0A 70%, rgba(255,255,255,0.95) 100%)`,
                        backdropFilter: 'blur(20px)',
                    }}
                >
                    {/* Top accent gradient with shimmer */}
                    <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${gradient} shimmer-line`} />

                    {/* Corner glow orbs */}
                    <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-[0.07] group-hover:opacity-[0.15] transition-all duration-700 float-slow"
                        style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }} />
                    <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full blur-2xl opacity-[0.05] group-hover:opacity-[0.12] transition-all duration-700 float-slow-reverse"
                        style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }} />

                    {/* Hover glow overlay */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{ boxShadow: `inset 0 0 80px ${color}0A, 0 0 40px ${color}08` }} />

                    {/* Animated particles */}
                    <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-40 transition-all duration-700 particle-float"
                        style={{ backgroundColor: color }} />
                    <div className="absolute top-12 right-10 w-1 h-1 rounded-full opacity-0 group-hover:opacity-30 transition-all duration-700 particle-float-delay"
                        style={{ backgroundColor: color }} />
                    <div className="absolute bottom-8 right-6 w-1 h-1 rounded-full opacity-0 group-hover:opacity-25 transition-all duration-700 particle-float-delay-2"
                        style={{ backgroundColor: color }} />

                    {/* Main content */}
                    <div className="relative z-10 p-5 md:p-6">
                        {/* Header row */}
                        <div className="flex items-center gap-3 mb-3">
                            <div
                                className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 icon-glow`}
                                style={{ boxShadow: `0 6px 20px ${color}30` }}
                            >
                                <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold px-2 py-0.5 rounded-full border"
                                        style={{ background: `${color}12`, color: color, borderColor: `${color}25` }}>
                                        {stageNum}
                                    </span>
                                    <span className="text-[11px] text-[#aaa]">{subtitle}</span>
                                </div>
                                <h3 className="text-lg font-bold text-[#1a1a1a] mt-0.5 leading-tight">
                                    <Typewriter text={title} trigger={isVisible} />
                                </h3>
                            </div>
                        </div>

                        {/* Description */}
                        <p className={`text-[#555] text-[13px] leading-relaxed mb-3 transition-all duration-500 delay-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                            {description}
                        </p>

                        {/* Input → Output flow */}
                        <div className={`flex flex-wrap items-center gap-2 mb-3 transition-all duration-500 delay-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                            <span className="text-[9px] uppercase tracking-[0.15em] text-[#aaa] font-semibold">In</span>
                            {inputs.map((f, i) => <FileBadge key={i} name={f.name} type={f.type} />)}
                            <TbArrowRight className="w-4 h-4 text-[#ccc] mx-0.5" />
                            <span className="text-[9px] uppercase tracking-[0.15em] text-[#aaa] font-semibold">Out</span>
                            {outputs.map((f, i) => <FileBadge key={i} name={f.name} type={f.type} />)}
                        </div>

                        {/* Stats */}
                        {stats && stats.length > 0 && (
                            <div className={`flex gap-3 mb-3 transition-all duration-500 delay-400 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                                {stats.map((s, i) => (
                                    <div key={i} className="px-3 py-1.5 rounded-lg border transition-all duration-300 hover:scale-105"
                                        style={{ background: `${color}08`, borderColor: `${color}18` }}>
                                        <span className="text-base font-bold" style={{ color }}>
                                            <AnimatedNumber value={s.value} trigger={isVisible} suffix={s.suffix} />
                                        </span>
                                        <span className="text-[10px] text-[#999] ml-1.5 uppercase tracking-wider">{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Accordion toggle */}
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="flex items-center gap-1.5 text-xs font-semibold transition-all duration-300 cursor-pointer group/btn hover:gap-2.5"
                            style={{ color }}
                        >
                            <TbChevronRight className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'rotate-90' : ''} group-hover/btn:translate-x-0.5`} />
                            {expanded ? "Hide equation" : "View equation"}
                            <span className="block w-0 group-hover/btn:w-8 h-px transition-all duration-300" style={{ backgroundColor: color }} />
                        </button>

                        {/* Expandable equation section */}
                        <div className={`accordion-content overflow-hidden transition-all duration-500 ease-in-out ${expanded ? 'max-h-[400px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}`}>
                            <EquationBlock label={equationLabel}>
                                {equation}
                            </EquationBlock>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function Methodology() {
    const pathname = usePathname();
    const [graphDropdownOpen, setGraphDropdownOpen] = useState(false);
    const graphDropdownRef = useRef<HTMLDivElement>(null);
    const heroRef = useRef<HTMLDivElement>(null);
    const [heroVisible, setHeroVisible] = useState(false);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (graphDropdownRef.current && !graphDropdownRef.current.contains(event.target as Node)) {
                setGraphDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        setTimeout(() => setHeroVisible(true), 150);
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

    // Connector visibility
    const conn1 = useScrollReveal(0.5);
    const conn2 = useScrollReveal(0.5);
    const conn3 = useScrollReveal(0.5);
    const conn4 = useScrollReveal(0.5);
    const conn5 = useScrollReveal(0.5);

    // ─── Stage data ──────────────────────────────────────────────────
    const stages: PipelineCardProps[] = [
        {
            stageNum: "Stage 01",
            title: "UMLS Node Construction",
            subtitle: "Knowledge Base Foundation",
            description: "Extract unique biomedical concepts (CUIs) from MRCONSO, enriched with preferred names, semantic types from MRSTY, source vocabularies, and term types. Filtered to English entries only.",
            inputs: [{ name: "MRCONSO.RRF", type: "umls" }, { name: "MRSTY.RRF", type: "umls" }],
            outputs: [{ name: "nodes.csv", type: "output" }],
            equation: (
                <span>
                    <span className="text-emerald-400">V</span>{" = { "}
                    <span className="text-sky-300">(</span>
                    <span className="text-amber-300">c</span>, <span className="text-amber-300">n</span>(c), <span className="text-amber-300">S</span>(c), <span className="text-amber-300">SRC</span>(c), <span className="text-amber-300">T</span>(c)
                    <span className="text-sky-300">)</span>
                    {" | "}
                    <span className="text-amber-300">c</span> ∈ CUIs(<span className="text-pink-300">MRCONSO</span>), LAT = ENG
                    {" }"}
                </span>
            ),
            equationLabel: "Node Construction",
            icon: TbDatabase,
            color: "#427466",
            gradient: "from-[#427466] to-[#2d5a4e]",
        },
        {
            stageNum: "Stage 02",
            title: "UMLS Edge Construction",
            subtitle: "Relationship Extraction",
            description: "Build directed edges between concept nodes from MRREL. Each edge captures the relationship type (REL, RELA) and provenance, constrained to nodes in the extracted set V.",
            inputs: [{ name: "nodes.csv", type: "output" }, { name: "MRREL.RRF", type: "umls" }],
            outputs: [{ name: "edges.csv", type: "output" }],
            equation: (
                <span>
                    <span className="text-emerald-400">E</span>{" = { "}
                    <span className="text-sky-300">(</span>
                    v<sub className="text-amber-300">c<sub>i</sub></sub>,{" "}
                    <span className="text-amber-300">η</span>(REL<sub>ij</sub>, RELA<sub>ij</sub>),{" "}
                    v<sub className="text-amber-300">c<sub>j</sub></sub>,{" "}
                    prov<sub>ij</sub>
                    <span className="text-sky-300">)</span>
                    {" | "}
                    (c<sub>i</sub>, REL<sub>ij</sub>, RELA<sub>ij</sub>, c<sub>j</sub>) ∈ <span className="text-pink-300">MRREL</span>,{" "}
                    c<sub>i</sub>, c<sub>j</sub> ∈ <span className="text-emerald-400">V</span>
                    {" }"}
                </span>
            ),
            equationLabel: "Edge Construction",
            icon: TbNetwork,
            color: "#0EA5E9",
            gradient: "from-sky-500 to-cyan-600",
        },
        {
            stageNum: "Stage 03",
            title: "Diagnosis Mapping",
            subtitle: "MIMIC ↔ UMLS Integration",
            description: "Map MIMIC-IV ICD diagnoses to UMLS CUIs using ICD code lookup and name exact matching — both via dictionaries built from UMLS nodes.",
            inputs: [{ name: "diagnoses_icd.csv", type: "mimic" }, { name: "nodes.csv", type: "umls" }],
            outputs: [{ name: "mapped_diagnoses.csv", type: "output" }],
            equation: (
                <div className="space-y-2.5">
                    <div>
                        <span className="text-[#888] text-xs mr-2">ICD Lookup:</span>
                        <span className="text-emerald-400">D</span><sub>icd</sub>{" = { "}
                        (hadm_id, CUI) | ICD<sub>code</sub> ∈ <span className="text-pink-300">MIMIC<sub>diag</sub></span>, CUI = <span className="text-amber-300">L<sub>icd</sub></span>(ICD<sub>code</sub>)
                        {" }"}
                    </div>
                    <div>
                        <span className="text-[#888] text-xs mr-2">Name Match:</span>
                        <span className="text-emerald-400">D</span><sub>name</sub>{" = { "}
                        (hadm_id, CUI) | name<sub>diag</sub> ∈ <span className="text-pink-300">MIMIC<sub>diag</sub></span>, CUI = <span className="text-amber-300">L<sub>name</sub></span>(name<sub>diag</sub>)
                        {" }"}
                    </div>
                    <div className="border-t border-[#444] pt-2">
                        <span className="text-emerald-400 font-semibold">D<sub>map</sub></span>{" = "}
                        <span className="text-emerald-400">D<sub>icd</sub></span> ∪ <span className="text-emerald-400">D<sub>name</sub></span>
                    </div>
                </div>
            ),
            equationLabel: "Diagnosis Mapping",
            icon: TbStethoscope,
            color: "#8B5CF6",
            gradient: "from-violet-500 to-purple-600",
            stats: [{ label: "MIMIC Patients (Diag)", value: 36898, suffix: "" }],
        },
        {
            stageNum: "Stage 04a",
            title: "NDC → RxNorm Mapping",
            subtitle: "Drug Code Translation (Step 1/2)",
            description: "Translate MIMIC NDC codes to RxNorm identifiers using RXNSAT — essential since NDC codes cannot directly map to UMLS CUIs.",
            inputs: [{ name: "prescriptions.csv", type: "mimic" }, { name: "RXNSAT.RRF", type: "rxnorm" }],
            outputs: [{ name: "rxnorm_prescriptions.csv", type: "output" }],
            equation: (
                <span>
                    <span className="text-emerald-400">P</span><sub>rx</sub>{" = { "}
                    (hadm_id, RxCUI) | NDC ∈ <span className="text-pink-300">MIMIC<sub>presc</sub></span>,{" "}
                    RxCUI = <span className="text-amber-300">φ</span>(NDC) via <span className="text-pink-300">RXNSAT</span>
                    {" }"}
                </span>
            ),
            equationLabel: "NDC → RxNorm Translation",
            icon: TbArrowsExchange2,
            color: "#F59E0B",
            gradient: "from-amber-500 to-orange-600",
            stats: [{ label: "MIMIC Patients (Presc)", value: 196738, suffix: "" }],
        },
        {
            stageNum: "Stage 04b",
            title: "RxNorm → UMLS Mapping",
            subtitle: "Drug Code Translation (Step 2/2)",
            description: "Map RxNorm identifiers to UMLS CUIs using the same dual-strategy — RxNorm code lookup and name exact matching via UMLS node dictionaries.",
            inputs: [{ name: "rxnorm_prescriptions.csv", type: "output" }, { name: "nodes.csv", type: "umls" }],
            outputs: [{ name: "mapped_prescriptions.csv", type: "output" }],
            equation: (
                <div className="space-y-2.5">
                    <div>
                        <span className="text-[#888] text-xs mr-2">Code Lookup:</span>
                        <span className="text-emerald-400">P</span><sub>cui</sub>{" = { "}
                        (hadm_id, CUI) | RxCUI ∈ <span className="text-emerald-400">P<sub>rx</sub></span>, CUI = <span className="text-amber-300">L<sub>rx</sub></span>(RxCUI)
                        {" }"}
                    </div>
                    <div>
                        <span className="text-[#888] text-xs mr-2">Name Match:</span>
                        <span className="text-emerald-400">P</span><sub>name</sub>{" = { "}
                        (hadm_id, CUI) | name<sub>rx</sub> ∈ <span className="text-emerald-400">P<sub>rx</sub></span>, CUI = <span className="text-amber-300">L<sub>name</sub></span>(name<sub>rx</sub>)
                        {" }"}
                    </div>
                    <div className="border-t border-[#444] pt-2">
                        <span className="text-emerald-400 font-semibold">P<sub>map</sub></span>{" = "}
                        <span className="text-emerald-400">P<sub>cui</sub></span> ∪ <span className="text-emerald-400">P<sub>name</sub></span>
                    </div>
                </div>
            ),
            equationLabel: "RxNorm → UMLS Mapping",
            icon: TbPrescription,
            color: "#EC4899",
            gradient: "from-pink-500 to-rose-600",
        },
        {
            stageNum: "Stage 05",
            title: "Patient ID Intersection",
            subtitle: "Data Alignment & Filtering",
            description: "Retain only patients present in both mapped diagnoses and prescriptions — the final cohort for knowledge graph construction and model training.",
            inputs: [{ name: "mapped_diagnoses.csv", type: "output" }, { name: "mapped_prescriptions.csv", type: "output" }],
            outputs: [{ name: "final_diagnoses.csv", type: "output" }, { name: "final_prescriptions.csv", type: "output" }],
            equation: (
                <div className="space-y-2.5">
                    <div>
                        <span className="text-emerald-400 font-semibold">Patients<sub>common</sub></span>{" = "}
                        Patients(<span className="text-emerald-400">D<sub>map</sub></span>) ∩ Patients(<span className="text-emerald-400">P<sub>map</sub></span>)
                    </div>
                    <div className="border-t border-[#444] pt-2 text-[13px] text-[#999]">
                        |Patients(<span className="text-emerald-400">D<sub>map</sub></span>)| = <span className="text-amber-300">36,898</span>{" · "}
                        |Patients(<span className="text-emerald-400">P<sub>map</sub></span>)| = <span className="text-amber-300">196,738</span>{" · "}
                        |Patients<sub>common</sub>| = <span className="text-emerald-400 font-semibold">32,460</span>
                    </div>
                </div>
            ),
            equationLabel: "Patient Intersection",
            icon: TbFilterSearch,
            color: "#10B981",
            gradient: "from-emerald-500 to-teal-600",
            stats: [
                { label: "Diagnosis Patients", value: 36898, suffix: "" },
                { label: "Prescription Patients", value: 196738, suffix: "" },
                { label: "Common Patients", value: 32460, suffix: "" },
            ],
        },
    ];

    return (
        <div className="bg-[#F9F9F9] relative overflow-hidden">
            {/* Background pattern */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 600'%3E%3Cdefs%3E%3Cpattern id='graph' x='0' y='0' width='200' height='200' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='50' cy='50' r='8' fill='%23427466'/%3E%3Ccircle cx='150' cy='50' r='6' fill='%23427466'/%3E%3Ccircle cx='100' cy='100' r='10' fill='%23427466'/%3E%3Ccircle cx='50' cy='150' r='5' fill='%23427466'/%3E%3Ccircle cx='150' cy='150' r='7' fill='%23427466'/%3E%3Cline x1='50' y1='50' x2='100' y2='100' stroke='%23427466' stroke-width='1.5'/%3E%3Cline x1='150' y1='50' x2='100' y2='100' stroke='%23427466' stroke-width='1.5'/%3E%3Cline x1='100' y1='100' x2='50' y2='150' stroke='%23427466' stroke-width='1.5'/%3E%3Cline x1='100' y1='100' x2='150' y2='150' stroke='%23427466' stroke-width='1.5'/%3E%3Cline x1='50' y1='50' x2='150' y2='50' stroke='%23427466' stroke-width='1'/%3E%3Cline x1='50' y1='150' x2='150' y2='150' stroke='%23427466' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23graph)'/%3E%3C/svg%3E")`,
                    backgroundSize: "400px 400px",
                    opacity: 0.06,
                }}
            />

            {/* ── Navbar ── */}
            <header className="flex justify-between h-20 px-12 py-5 bg-[#ffffff] shadow-md relative z-50">
                <Link href="/" className="flex items-center gap-3 pl-6 cursor-pointer">
                    <h1 className="text-xl font-medium text-[#1a1a1a]">
                        <b>Drug Recommendation System</b>
                    </h1>
                </Link>

                <nav className="flex items-center gap-3 pr-6">
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

                    {navItems.filter(item => item.name !== "Home").map((item) => {
                        const NavIcon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-2 rounded-xl text-sm cursor-pointer font-medium transition-all duration-200 px-4 py-2 ${pathname === item.href
                                    ? "bg-[#427466] text-white"
                                    : "bg-[#D9D9D9] text-[#333333] hover:bg-[#c9c9c9]"
                                    }`}
                            >
                                {NavIcon && <NavIcon className="w-4 h-4" />}
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </header>

            {/* ── Main Content ── */}
            <main className="relative z-10 w-full px-8 py-6">

                {/* Floating ambient orbs */}
                <div className="fixed top-20 left-10 w-64 h-64 rounded-full blur-[100px] bg-[#427466]/[0.04] pointer-events-none float-orb-1 z-0" />
                <div className="fixed top-1/3 right-20 w-80 h-80 rounded-full blur-[120px] bg-sky-500/[0.03] pointer-events-none float-orb-2 z-0" />
                <div className="fixed bottom-40 left-1/4 w-72 h-72 rounded-full blur-[100px] bg-violet-500/[0.03] pointer-events-none float-orb-3 z-0" />

                {/* ─── Hero Section ─── */}
                <div ref={heroRef} className={`mb-8 transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#427466] to-[#2d5a4e] shadow-lg pulse-glow" style={{ boxShadow: '0 8px 24px rgba(66,116,102,0.3)' }}>
                            <TbRoute className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-[32px] font-bold text-[#1a1a1a] tracking-tight">
                                Data Pipeline & Methodology
                            </h2>
                            <p className="text-[#888] text-sm mt-0.5">
                                From raw UMLS & MIMIC-IV data to a unified biomedical knowledge graph
                            </p>
                        </div>
                    </div>

                    {/* Overview stats */}
                    <div className={`flex gap-4 mt-5 transition-all duration-700 delay-300 ${heroVisible ? 'opacity-100' : 'opacity-0'}`}>
                        {[
                            { label: "Pipeline Stages", value: "6", icon: TbTransform },
                            { label: "Data Sources", value: "5+", icon: TbDatabase },
                            { label: "Mapping Methods", value: "3", icon: TbLink },
                            { label: "Common Patients", value: "32,460", icon: TbUsers },
                        ].map((s, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-2.5 bg-white/80 backdrop-blur-sm border border-[#e5e5e5] rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                                <div className="p-1.5 rounded-lg bg-[#427466]/8">
                                    <s.icon className="w-4 h-4 text-[#427466]" />
                                </div>
                                <div>
                                    <span className="text-lg font-bold text-[#1a1a1a]">{s.value}</span>
                                    <span className="text-[11px] text-[#999] uppercase tracking-wider ml-1.5">{s.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ═══════════ Zigzag Pipeline Grid ═══════════ */}

                {/* Row 1: Stage 01 (left) → Stage 02 (right) */}
                <div className="grid grid-cols-2 gap-6 items-stretch">
                    <div className="fade-in-left">
                        <PipelineCard {...stages[0]} delay={0} />
                    </div>
                    <div className="flex items-stretch gap-0">
                        <div ref={conn1.ref}>
                            <FlowConnectorH visible={conn1.isVisible} id="h1" direction="right" />
                        </div>
                        <div className="flex-1 fade-in-right h-full">
                            <PipelineCard {...stages[1]} delay={150} />
                        </div>
                    </div>
                </div>

                {/* Connector: Stage 02 → Stage 03 (vertical, right side) */}
                <div className="grid grid-cols-2 gap-6">
                    <div />
                    <div className="flex justify-center" ref={conn2.ref}>
                        <FlowConnectorV visible={conn2.isVisible} id="v1" />
                    </div>
                </div>

                {/* Row 2: Stage 04a (left) ← Stage 03 (right) */}
                <div className="grid grid-cols-2 gap-6 items-stretch">
                    <div className="flex items-stretch gap-0">
                        <div className="flex-1 fade-in-left h-full">
                            <PipelineCard {...stages[3]} delay={100} />
                        </div>
                        <div ref={conn3.ref}>
                            <FlowConnectorH visible={conn3.isVisible} id="h2" direction="left" />
                        </div>
                    </div>
                    <div className="fade-in-right">
                        <PipelineCard {...stages[2]} delay={0} />
                    </div>
                </div>

                {/* Connector: Stage 04a → Stage 04b (vertical, left side) */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="flex justify-center" ref={conn4.ref}>
                        <FlowConnectorV visible={conn4.isVisible} id="v2" />
                    </div>
                    <div />
                </div>

                {/* Row 3: Stage 04b (left) → Stage 05 (right) */}
                <div className="grid grid-cols-2 gap-6 items-stretch">
                    <div className="fade-in-left">
                        <PipelineCard {...stages[4]} delay={0} />
                    </div>
                    <div className="flex items-stretch gap-0">
                        <div ref={conn5.ref}>
                            <FlowConnectorH visible={conn5.isVisible} id="h3" direction="right" />
                        </div>
                        <div className="flex-1 fade-in-right h-full">
                            <PipelineCard {...stages[5]} delay={150} />
                        </div>
                    </div>
                </div>

                {/* ─── Footer ─── */}
                {/* <div className="mt-10 mb-8 flex justify-center">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm border border-[#e5e5e5] rounded-full shadow-sm hover:shadow-md transition-all duration-300">
                        <TbCircleCheck className="w-5 h-5 text-[#427466]" />
                        <span className="text-sm text-[#666] font-medium">
                            Pipeline complete — data is ready for knowledge graph construction & model training
                        </span>
                    </div>
                </div> */}
            </main>

            {/* ── CSS Animations ── */}
            <style jsx global>{`
                @keyframes blink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0; }
                }
                .animate-blink {
                    animation: blink 0.8s infinite;
                }

                /* Flow connector animations */
                .flow-dash {
                    animation: dashFlow 1.5s linear infinite;
                }
                @keyframes dashFlow {
                    to { stroke-dashoffset: -16; }
                }

                .flow-arrow {
                    animation: arrowPulse 1.5s ease-in-out infinite;
                }
                @keyframes arrowPulse {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 0.8; }
                }

                /* Pipeline card hover */
                .pipeline-card:hover {
                    transform: translateY(-3px);
                }
                .pipeline-card {
                    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                /* Shimmer line on top of cards */
                .shimmer-line {
                    position: relative;
                    overflow: hidden;
                }
                .shimmer-line::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 60%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                    animation: shimmer 3s infinite;
                }
                @keyframes shimmer {
                    0% { left: -100%; }
                    100% { left: 200%; }
                }

                /* Pulse glow on hero icon */
                .pulse-glow {
                    animation: pulseGlow 2.5s ease-in-out infinite;
                }
                @keyframes pulseGlow {
                    0%, 100% { box-shadow: 0 8px 24px rgba(66,116,102,0.3); }
                    50% { box-shadow: 0 8px 40px rgba(66,116,102,0.5), 0 0 20px rgba(66,116,102,0.2); }
                }

                /* Fade in from left */
                .fade-in-left {
                    animation: fadeInLeft 0.8s ease-out both;
                }
                @keyframes fadeInLeft {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                /* Fade in from right */
                .fade-in-right {
                    animation: fadeInRight 0.8s ease-out both;
                }
                @keyframes fadeInRight {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                /* Accordion smooth expand */
                .accordion-content {
                    transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease, margin-top 0.4s ease;
                }

                /* Equation block glow */
                .equation-block:hover .bg-\\[\\#1a1a1a\\] {
                    border-color: rgba(66, 116, 102, 0.4) !important;
                    box-shadow: 0 4px 24px rgba(66, 116, 102, 0.15) !important;
                }

                /* Scrollbar styling */
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb {
                    background: rgba(66, 116, 102, 0.3);
                    border-radius: 3px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: rgba(66, 116, 102, 0.5);
                }

                /* Sub/superscript in equations */
                .equation-block sub {
                    font-size: 0.7em;
                    vertical-align: sub;
                }

                /* Floating orbs - ambient background animation */
                .float-orb-1 {
                    animation: floatOrb1 20s ease-in-out infinite;
                }
                @keyframes floatOrb1 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(60px, 40px) scale(1.1); }
                    66% { transform: translate(-30px, 80px) scale(0.95); }
                }
                .float-orb-2 {
                    animation: floatOrb2 25s ease-in-out infinite;
                }
                @keyframes floatOrb2 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(-70px, 50px) scale(1.15); }
                    66% { transform: translate(40px, -60px) scale(0.9); }
                }
                .float-orb-3 {
                    animation: floatOrb3 22s ease-in-out infinite;
                }
                @keyframes floatOrb3 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(50px, -40px) scale(1.08); }
                }

                /* Card corner glow float */
                .float-slow {
                    animation: floatSlow 6s ease-in-out infinite;
                }
                @keyframes floatSlow {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(-8px, 8px); }
                }
                .float-slow-reverse {
                    animation: floatSlowReverse 7s ease-in-out infinite;
                }
                @keyframes floatSlowReverse {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(6px, -6px); }
                }

                /* Particle floats inside cards on hover */
                .particle-float {
                    animation: particleFloat 3s ease-in-out infinite;
                }
                @keyframes particleFloat {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(-5px, -8px) scale(1.5); }
                }
                .particle-float-delay {
                    animation: particleFloat 3.5s ease-in-out 0.5s infinite;
                }
                .particle-float-delay-2 {
                    animation: particleFloat 4s ease-in-out 1s infinite;
                }

                /* Icon glow pulse on hover */
                .group:hover .icon-glow {
                    animation: iconGlow 1.5s ease-in-out infinite;
                }
                @keyframes iconGlow {
                    0%, 100% { filter: brightness(1) drop-shadow(0 0 0px transparent); }
                    50% { filter: brightness(1.1) drop-shadow(0 0 8px rgba(255,255,255,0.3)); }
                }

                /* Gradient border spin */
                .gradient-border-spin {
                    animation: borderSpin 4s linear infinite;
                }
                @keyframes borderSpin {
                    to { rotate: 360deg; }
                }
            `}</style>
        </div>
    );
}
