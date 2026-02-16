"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
    TbHome, TbChartBar, TbRoute, TbUserHeart, TbGraph, TbChevronDown,
    TbBrain, TbTopologyRing, TbLayersLinked, TbBinaryTree,
    TbChartLine, TbChartAreaLine, TbTrendingUp, TbActivity
} from "react-icons/tb";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// ─── Model metadata ───────────────────────────────────────────────────
const modelMeta = [
    { id: "neucf", name: "NeuCF", fullName: "Neural Collaborative Filtering", icon: TbBrain, color: "#8B5CF6" },
    { id: "homo-graphsage", name: "Homo GraphSAGE", fullName: "Homogeneous GraphSAGE", icon: TbGraph, color: "#F59E0B" },
    { id: "hetero-graphsage", name: "Hetero GraphSAGE", fullName: "Heterogeneous GraphSAGE", icon: TbTopologyRing, color: "#10B981" },
    { id: "rgcn", name: "R-GCN", fullName: "Relational GCN", icon: TbLayersLinked, color: "#0EA5E9" },
    { id: "hgt", name: "HGT", fullName: "Heterogeneous Graph Transformer", icon: TbBinaryTree, color: "#EC4899" },
];

// ─── Tab definitions ──────────────────────────────────────────────────
const tabs = [
    { id: "roc", label: "ROC Curve", icon: TbChartLine },
    { id: "pr", label: "Precision-Recall", icon: TbChartAreaLine },
    { id: "loss", label: "Training Loss", icon: TbTrendingUp },
    { id: "auc", label: "AUC vs Epoch", icon: TbActivity },
] as const;

type TabId = typeof tabs[number]["id"];

// ─── Chart Data ───────────────────────────────────────────────────────

const rocCurves: Record<string, { fpr: number[]; tpr: number[]; auc: string }> = {
    neucf: {
        fpr: [0.0, 0.002, 0.004, 0.006, 0.01, 0.02, 0.05, 0.1, 0.2, 0.4, 0.6, 0.8, 1.0],
        tpr: [0.0, 0.92, 0.97, 0.99, 0.995, 0.998, 0.999, 0.999, 0.999, 0.999, 0.999, 0.999, 1.0],
        auc: "0.9989",
    },
    "homo-graphsage": {
        fpr: [0.0, 0.002, 0.004, 0.006, 0.01, 0.02, 0.05, 0.1, 0.2, 0.4, 0.6, 0.8, 1.0],
        tpr: [0.0, 0.93, 0.97, 0.985, 0.992, 0.996, 0.998, 0.9985, 0.999, 0.999, 0.999, 0.999, 1.0],
        auc: "0.9990",
    },
    "hetero-graphsage": {
        fpr: [0.0, 0.005, 0.01, 0.02, 0.04, 0.08, 0.12, 0.2, 0.4, 0.6, 0.8, 1.0],
        tpr: [0.0, 0.88, 0.93, 0.965, 0.98, 0.988, 0.992, 0.995, 0.996, 0.997, 0.998, 1.0],
        auc: "0.9906",
    },
    rgcn: {
        fpr: [0.0, 0.01, 0.02, 0.04, 0.08, 0.12, 0.2, 0.35, 0.5, 0.7, 0.85, 1.0],
        tpr: [0.0, 0.82, 0.88, 0.93, 0.96, 0.972, 0.982, 0.988, 0.991, 0.993, 0.995, 1.0],
        auc: "0.9780",
    },
    hgt: {
        fpr: [0.0, 0.002, 0.004, 0.006, 0.01, 0.02, 0.05, 0.1, 0.2, 0.4, 0.6, 0.8, 1.0],
        tpr: [0.0, 0.94, 0.975, 0.988, 0.994, 0.997, 0.9985, 0.999, 0.999, 0.999, 0.999, 0.999, 1.0],
        auc: "0.9991",
    },
};

const prCurves: Record<string, { recall: number[]; precision: number[] }> = {
    neucf: {
        recall: [0.0, 0.05, 0.1, 0.2, 0.4, 0.6, 0.8, 0.9, 0.95, 0.98, 1.0],
        precision: [
            1.0, 1.0, 1.0, 0.9995, 0.9995, 0.999, 0.999, 0.9985, 0.998, 0.995, 0.001
        ],
    },
    "homo-graphsage": {
        recall: [
            0.0, 0.05, 0.1, 0.2, 0.4, 0.6, 0.8, 0.9, 0.95, 0.98, 1.0
        ],
        precision: [
            1.0, 0.9998, 0.9997, 0.9993, 0.999, 0.9987, 0.9985,
            0.998, 0.9975, 0.994, 0.001
        ],
    },
    "hetero-graphsage": {
        recall: [
            0.0, 0.05, 0.1, 0.2, 0.4, 0.6, 0.75, 0.85, 0.9, 0.95, 0.98, 1.0
        ],
        precision: [
            1.0, 0.999, 0.9985, 0.9978, 0.997,
            0.996, 0.9945, 0.992, 0.988,
            0.975, 0.95, 0.001
        ],
    },
    hgt: {
        recall: [
            0.0, 0.05, 0.1, 0.2, 0.4, 0.6, 0.8, 0.9, 0.95, 0.98, 1.0
        ],
        precision: [
            1.0, 0.9998, 0.9996, 0.9993, 0.999,
            0.9988, 0.9986, 0.9982,
            0.9978, 0.995, 0.001
        ],
    },
    rgcn: {
        recall: [
            0.0, 0.05, 0.1, 0.2, 0.35, 0.5,
            0.65, 0.75, 0.85, 0.92, 0.97, 1.0
        ],
        precision: [
            1.0, 0.997, 0.995, 0.993,
            0.991, 0.989, 0.986,
            0.982, 0.975, 0.965,
            0.94, 0.0001
        ],
    },
};

const epochs = Array.from({ length: 30 }, (_, i) => i + 1);
const trainingLoss: Record<string, { epochs: number[]; loss: number[] }> = {
    neucf: {
        epochs: Array.from({ length: 30 }, (_, i) => i + 1),
        loss: [0.0060, 0.0049, 0.0040, 0.0032, 0.0026, 0.0021, 0.0017, 0.0013, 0.0010, 0.0008, 0.00065, 0.00052, 0.00045, 0.00040, 0.00035, 0.00031, 0.00028, 0.00025, 0.00024, 0.00023, 0.00022, 0.00020, 0.00019, 0.00018, 0.00017, 0.00016, 0.00015, 0.00014, 0.00013, 0.00012],
    },
    "homo-graphsage": {
        epochs: Array.from({ length: 30 }, (_, i) => i + 1),
        loss: [0.3677, 0.3669, 0.3675, 0.3674, 0.3671, 0.3676, 0.3672, 0.3674, 0.3673, 0.3671, 0.3675, 0.3671, 0.3676, 0.3676, 0.3673, 0.3676, 0.3677, 0.3674, 0.3672, 0.3673, 0.3669, 0.3673, 0.3671, 0.3670, 0.3668, 0.3668, 0.3672, 0.3663, 0.3669, 0.36695],
    },
    "hetero-graphsage": {
        epochs: Array.from({ length: 30 }, (_, i) => i + 1),
        loss: [82000, 172000, 58000, 34000, 46000, 29000, 20000, 25000, 24000, 18000, 12000, 10500, 11500, 9800, 7800, 5600, 4300, 3800, 4200, 4400, 4100, 3600, 3100, 2800, 2400, 2100, 1900, 1750, 1650, 1500],
    },
    rgcn: {
        epochs: [1, 2],
        loss: [0.68, 0.08],
    },
    hgt: {
        epochs: [1, 2],
        loss: [0.62, 0.00],
    },
};

const aucPerEpoch: Record<string, { epochs: number[]; train: number[]; val: number[] }> = {
    neucf: {
        epochs: Array.from({ length: 30 }, (_, i) => i + 1),
        train: [0.99995, 0.99997, 0.99998, 0.999985, 0.99999, 0.999992, 0.999994, 0.999996, 0.999997, 0.999998, 0.9999985, 0.999999, 0.999999, 0.999999, 0.999999, 0.999999, 0.999999, 0.999999, 0.999999, 0.999999, 0.999999, 0.999999, 0.999999, 0.999999, 0.999999, 0.999999, 0.999999, 0.999999, 0.999999, 0.999999],
        val: [0.99950, 0.99948, 0.99945, 0.99940, 0.99936, 0.99933, 0.99929, 0.99926, 0.99924, 0.99919, 0.99917, 0.99912, 0.99908, 0.99904, 0.99902, 0.99906, 0.99888, 0.99903, 0.99895, 0.99907, 0.99901, 0.99895, 0.99894, 0.99890, 0.99888, 0.99893, 0.99885, 0.99899, 0.99897, 0.99888],
    },
    "homo-graphsage": {
        epochs: Array.from({ length: 30 }, (_, i) => i + 1),
        train: [0.99768, 0.99774, 0.99758, 0.99761, 0.99772, 0.99763, 0.99752, 0.99766, 0.99782, 0.99764, 0.99746, 0.99743, 0.99741, 0.99690, 0.99760, 0.99712, 0.99718, 0.99740, 0.99731, 0.99716, 0.99749, 0.99722, 0.99739, 0.99748, 0.99765, 0.99718, 0.99752, 0.99734, 0.99746, 0.99744],
        val: [0.99755, 0.99758, 0.99739, 0.99745, 0.99755, 0.99732, 0.99733, 0.99748, 0.99765, 0.99746, 0.99728, 0.99724, 0.99722, 0.99672, 0.99738, 0.99688, 0.99695, 0.99722, 0.99718, 0.99698, 0.99728, 0.99688, 0.99724, 0.99727, 0.99744, 0.99699, 0.99731, 0.99715, 0.99727, 0.99726],
    },
    "hetero-graphsage": {
        epochs: Array.from({ length: 30 }, (_, i) => i + 1),
        train: [0.99768, 0.99774, 0.99758, 0.99761, 0.99772, 0.99763, 0.99752, 0.99766, 0.99782, 0.99764, 0.99746, 0.99743, 0.99741, 0.99690, 0.99760, 0.99712, 0.99718, 0.99740, 0.99731, 0.99716, 0.99749, 0.99722, 0.99739, 0.99748, 0.99765, 0.99718, 0.99752, 0.99734, 0.99746, 0.99744],
        val: [0.99755, 0.99758, 0.99739, 0.99745, 0.99755, 0.99732, 0.99733, 0.99748, 0.99765, 0.99746, 0.99728, 0.99724, 0.99722, 0.99672, 0.99738, 0.99688, 0.99695, 0.99722, 0.99718, 0.99698, 0.99728, 0.99688, 0.99724, 0.99727, 0.99744, 0.99699, 0.99731, 0.99715, 0.99727, 0.99726],
    },
    rgcn: {
        epochs: [1, 2],
        train: [0.99960, 0.99975],
        val: [0.99930, 0.99950],
    },
    hgt: {
        epochs: [1, 2],
        train: [0.99980, 0.99990],
        val: [0.99950, 0.99970],
    },
};

// ─── Per-model chart builders ─────────────────────────────────────────

function getSharedOptions(hideTitle = false) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 1600, easing: "easeInOutQuart" as const },
        plugins: {
            legend: { display: !hideTitle, labels: { usePointStyle: true, pointStyle: "circle" as const, padding: 16, font: { size: 11 } } },
            tooltip: {
                backgroundColor: "rgba(26,26,26,0.92)",
                titleFont: { size: 12 },
                bodyFont: { size: 11 },
                padding: 10,
                cornerRadius: 8,
            },
        },
    };
}

function buildSingleRocChart(modelId: string, color: string) {
    const d = rocCurves[modelId];
    return {
        data: {
            datasets: [
                {
                    label: `ROC Curve `,
                    data: d.fpr.map((x, i) => ({ x, y: d.tpr[i] })),
                    borderColor: color,
                    backgroundColor: `${color}25`,
                    borderWidth: 3,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: color,
                    pointHoverBorderColor: "#fff",
                    pointHoverBorderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    borderCapStyle: "round" as const,
                    borderJoinStyle: "round" as const,
                },
            ],
        },
        options: {
            ...getSharedOptions(),
            scales: {
                x: {
                    type: "linear" as const,
                    title: { display: true, text: "False Positive Rate", font: { size: 11, weight: 600 as const }, color: "#777" },
                    min: 0, max: 1,
                    grid: { color: "#f0f0f0" },
                    ticks: { color: "#999", font: { size: 10 } },
                },
                y: {
                    type: "linear" as const,
                    title: { display: true, text: "True Positive Rate", font: { size: 11, weight: 600 as const }, color: "#777" },
                    min: 0, max: 1,
                    grid: { color: "#f0f0f0" },
                    ticks: { color: "#999", font: { size: 10 } },
                },
            },
        },
    };
}

function buildSinglePRChart(modelId: string, color: string) {
    const d = prCurves[modelId];
    return {
        data: {
            datasets: [
                {
                    label: "Precision-Recall",
                    data: d.recall.map((x, i) => ({ x, y: d.precision[i] })),
                    borderColor: color,
                    backgroundColor: `${color}25`,
                    borderWidth: 3,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: color,
                    pointHoverBorderColor: "#fff",
                    pointHoverBorderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    borderCapStyle: "round" as const,
                    borderJoinStyle: "round" as const,
                },
            ],
        },
        options: {
            ...getSharedOptions(),
            scales: {
                x: {
                    type: "linear" as const,
                    title: { display: true, text: "Recall", font: { size: 11, weight: 600 as const }, color: "#777" },
                    min: 0, max: 1,
                    grid: { color: "#f0f0f0" },
                    ticks: { color: "#999", font: { size: 10 } },
                },
                y: {
                    type: "linear" as const,
                    title: { display: true, text: "Precision", font: { size: 11, weight: 600 as const }, color: "#777" },
                    min: 0, max: 1,
                    grid: { color: "#f0f0f0" },
                    ticks: { color: "#999", font: { size: 10 } },
                },
            },
        },
    };
}

function buildSingleLossChart(modelId: string, color: string) {
    const d = trainingLoss[modelId];
    return {
        data: {
            labels: d.epochs.map(String),
            datasets: [
                {
                    label: "Training Loss",
                    data: d.loss,
                    borderColor: color,
                    backgroundColor: `${color}25`,
                    borderWidth: 3,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: color,
                    pointHoverBorderColor: "#fff",
                    pointHoverBorderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    borderCapStyle: "round" as const,
                    borderJoinStyle: "round" as const,
                },
            ],
        },
        options: {
            ...getSharedOptions(),
            scales: {
                x: {
                    title: { display: true, text: "Epoch", font: { size: 11, weight: 600 as const }, color: "#777" },
                    grid: { color: "#f0f0f0" },
                    ticks: { color: "#999", font: { size: 10 } },
                },
                y: {
                    title: { display: true, text: "Loss", font: { size: 11, weight: 600 as const }, color: "#777" },
                    grid: { color: "#f0f0f0" },
                    ticks: { color: "#999", font: { size: 10 } },
                },
            },
        },
    };
}

function buildSingleAucChart(modelId: string, color: string) {
    const d = aucPerEpoch[modelId];
    // Lighter version of color for validation line
    const valColor = `${color}90`;
    return {
        data: {
            labels: d.epochs.map(String),
            datasets: [
                {
                    label: "Train AUC",
                    data: d.train,
                    borderColor: color,
                    backgroundColor: `${color}20`,
                    borderWidth: 3,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: color,
                    pointHoverBorderColor: "#fff",
                    pointHoverBorderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    borderCapStyle: "round" as const,
                    borderJoinStyle: "round" as const,
                },
                {
                    label: "Val AUC",
                    data: d.val,
                    borderColor: valColor,
                    backgroundColor: `${color}10`,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: valColor,
                    pointHoverBorderColor: "#fff",
                    pointHoverBorderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    borderCapStyle: "round" as const,
                    borderJoinStyle: "round" as const,
                    borderDash: [5, 3],
                },
            ],
        },
        options: {
            ...getSharedOptions(),
            scales: {
                x: {
                    title: { display: true, text: "Epoch", font: { size: 11, weight: 600 as const }, color: "#777" },
                    grid: { color: "#f0f0f0" },
                    ticks: { color: "#999", font: { size: 10 } },
                },
                y: {
                    title: { display: true, text: "AUC", font: { size: 11, weight: 600 as const }, color: "#777" },
                    grid: { color: "#f0f0f0" },
                    ticks: { color: "#999", font: { size: 10 } },
                },
            },
        },
    };
}

function getChartForModel(tab: TabId, modelId: string, color: string) {
    switch (tab) {
        case "roc": return buildSingleRocChart(modelId, color);
        case "pr": return buildSinglePRChart(modelId, color);
        case "loss": return buildSingleLossChart(modelId, color);
        case "auc": return buildSingleAucChart(modelId, color);
    }
}

// ─── Individual Model Chart Card ──────────────────────────────────────

function ModelChartCard({ model, tab, index }: {
    model: typeof modelMeta[0];
    tab: TabId;
    index: number;
}) {
    const Icon = model.icon;
    const chart = getChartForModel(tab, model.id, model.color);

    // Stat line shown under chart
    const lossData = trainingLoss[model.id];
    const aucData = aucPerEpoch[model.id];
    const statLabel = tab === "roc"
        ? `AUC ≈ ${rocCurves[model.id].auc}`
        : tab === "pr"
            ? `AP ≈ ${(prCurves[model.id].precision.reduce((a, b) => a + b, 0) / prCurves[model.id].precision.length).toFixed(4)}`
            : tab === "loss"
                ? `Final Loss: ${lossData.loss[lossData.loss.length - 1]}`
                : `Final AUC: ${aucData.train[aucData.train.length - 1]}`;

    return (
        <div
            className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden hover:shadow-lg transition-all duration-400 animate-chart-card-enter"
            style={{
                animationDelay: `${index * 120}ms`,
                borderTop: `3px solid ${model.color}`,
            }}
        >
            {/* Card Header */}
            <div className="flex items-center gap-3 px-5 pt-5 pb-3">
                <div
                    className="p-2 rounded-xl"
                    style={{ background: `linear-gradient(135deg, ${model.color}, ${model.color}cc)` }}
                >
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-[#1a1a1a] truncate">{model.name}</h3>
                    <p className="text-[11px] text-[#999] font-medium truncate">{model.fullName}</p>
                </div>
                {/* <div
                    className="px-3 py-1 rounded-full text-[11px] font-bold"
                    style={{ background: `${model.color}15`, color: model.color }}
                >
                    {statLabel}
                </div> */}
            </div>

            {/* Chart */}
            <div className="px-4 pb-5" style={{ height: 280 }}>
                <Line
                    data={chart.data as any}
                    options={chart.options as any}
                />
            </div>
        </div>
    );
}

// ─── Page Component ───────────────────────────────────────────────────

export default function ModelGraphs() {
    const pathname = usePathname();
    const [activeTab, setActiveTab] = useState<TabId>("roc");
    const [mounted, setMounted] = useState(false);
    const [graphDropdownOpen, setGraphDropdownOpen] = useState(false);
    const graphDropdownRef = useRef<HTMLDivElement>(null);
    const [chartKey, setChartKey] = useState(0);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (graphDropdownRef.current && !graphDropdownRef.current.contains(event.target as Node)) {
                setGraphDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleTabChange = (tab: TabId) => {
        setActiveTab(tab);
        setChartKey((k) => k + 1);
    };

    const navItems = [
        { name: "Home", href: "/", icon: TbHome },
        { name: "Methodology", href: "/methodology", icon: TbRoute },
        { name: "Patient DR", href: "/patient-dr", icon: TbUserHeart },
        { name: "Model Comparison", href: "/model-compare", icon: TbChartBar },
        { name: "Model Graphs", href: "/model-graphs", icon: TbChartLine },
    ];

    const graphSubItems = [
        { name: "UMLS Graph", href: "/umls-graph" },
        { name: "Integrated Graph", href: "/dashboard" },
    ];

    const isGraphPage = pathname === "/dashboard" || pathname === "/umls-graph";

    const tabDescriptions: Record<TabId, string> = {
        roc: "Receiver Operating Characteristic — plots True Positive Rate vs False Positive Rate. Higher AUC = better model.",
        pr: "Precision-Recall — shows precision at various recall thresholds. Useful for imbalanced datasets.",
        loss: "Training Loss over epochs — lower & faster-converging curves indicate more efficient learning.",
        auc: "AUC score progression across training epochs — watch models improve as they learn.",
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

                    {/* Graph Dropdown */}
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
            <main className="relative z-10 px-8 py-6">
                {/* Page Header */}
                <div className="mb-8 animate-fade-in">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-[#427466] to-[#365f54]">
                            <TbChartLine className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-[32px] font-bold text-[#1a1a1a] tracking-tight">
                            Model Training &amp; Evaluation Curves
                        </h2>
                    </div>
                    <p className="text-[#666] text-base mt-1 ml-12">
                        Visualise performance curves for each recommendation model
                    </p>
                </div>

                {/* ── Tabs ── */}
                <div className="flex items-center gap-2 mb-6">
                    <div className="flex gap-1.5 p-1.5 bg-white rounded-2xl border border-[#e5e5e5] shadow-sm">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`
                                        relative flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold cursor-pointer
                                        transition-all duration-300 overflow-hidden
                                        ${isActive
                                            ? "text-white shadow-[0_6px_20px_rgba(66,116,102,0.35)]"
                                            : "text-[#666] hover:text-[#427466] hover:bg-[#427466]/5"
                                        }
                                    `}
                                    style={isActive ? { background: "linear-gradient(135deg, #427466, #365f54)" } : undefined}
                                >
                                    <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? "scale-110" : ""}`} />
                                    {tab.label}
                                    {isActive && (
                                        <span className="absolute inset-0 rounded-xl pointer-events-none animate-tab-glow" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab description */}
                <p className="text-sm text-[#888] mb-6 ml-1 italic">{tabDescriptions[activeTab]}</p>

                {/* ── Per-model chart grid ── */}
                {mounted && (
                    <div key={chartKey} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {modelMeta.map((model, index) => (
                            <ModelChartCard
                                key={`${model.id}-${chartKey}`}
                                model={model}
                                tab={activeTab}
                                index={index}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* CSS Animations */}
            <style jsx global>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.4s ease-out forwards;
                }

                @keyframes chart-card-enter {
                    0%   { opacity: 0; transform: translateY(30px) scale(0.95); }
                    100% { opacity: 1; transform: translateY(0)   scale(1);    }
                }
                .animate-chart-card-enter {
                    animation: chart-card-enter 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                    opacity: 0;
                }

                @keyframes tab-glow {
                    0%, 100% { box-shadow: inset 0 0 12px rgba(255,255,255,0.15); }
                    50%      { box-shadow: inset 0 0 20px rgba(255,255,255,0.28); }
                }
                .animate-tab-glow {
                    animation: tab-glow 2.5s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
