"use client";

import { useEffect, useRef, useState } from "react";
import { Network } from "vis-network";

// Define colors for each entity type - adapted to drug recommendation app theme
const nodeColors = {
    Patient: {
        background: "#427466",
        border: "#365f54",
        highlight: { background: "#5a9380", border: "#427466" },
        hover: { background: "#5a9380", border: "#427466" }
    },
    Drug: {
        background: "#10b981",
        border: "#059669",
        highlight: { background: "#34d399", border: "#10b981" },
        hover: { background: "#34d399", border: "#10b981" }
    },
    Diagnosis: {
        background: "#f59e0b",
        border: "#d97706",
        highlight: { background: "#fbbf24", border: "#f59e0b" },
        hover: { background: "#fbbf24", border: "#f59e0b" }
    },
    Encounter: {
        background: "#8b5cf6",
        border: "#7c3aed",
        highlight: { background: "#a78bfa", border: "#8b5cf6" },
        hover: { background: "#a78bfa", border: "#8b5cf6" }
    }
};

const defaultColor = {
    background: "#427466",
    border: "#365f54",
    highlight: { background: "#5a9380", border: "#427466" },
    hover: { background: "#5a9380", border: "#427466" }
};

export default function GraphView({ graph, onNodeClick }: { graph: any; onNodeClick: any }) {
    const ref = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!graph || !ref.current) return;

        setIsLoading(true);

        // Apply enhanced colors to nodes based on their group
        const coloredNodes = graph.nodes.map((node: any) => ({
            ...node,
            color: (nodeColors as any)[node.group] || defaultColor,
            font: {
                color: "#1a1a2e",
                size: 14,
                face: "Inter, sans-serif",
                strokeWidth: 3,
                strokeColor: "#ffffff"
            },
            shadow: {
                enabled: true,
                color: (nodeColors as any)[node.group]?.background || "#427466",
                size: 15,
                x: 0,
                y: 0
            }
        }));

        const network = new Network(
            ref.current,
            { nodes: coloredNodes, edges: graph.edges },
            {
                nodes: {
                    shape: "dot",
                    size: 22,
                    borderWidth: 3,
                    borderWidthSelected: 5,
                    font: {
                        color: "#1a1a2e",
                        size: 14,
                        face: "Inter, sans-serif",
                        strokeWidth: 3,
                        strokeColor: "#ffffff"
                    },
                    shadow: {
                        enabled: true,
                        size: 15,
                        x: 0,
                        y: 0
                    },
                    scaling: {
                        min: 18,
                        max: 30
                    }
                },
                edges: {
                    arrows: {
                        to: {
                            enabled: true,
                            scaleFactor: 0.8
                        }
                    },
                    color: {
                        color: "#a0aec0",
                        highlight: "#427466",
                        hover: "#427466"
                    },
                    width: 2,
                    hoverWidth: 3,
                    selectionWidth: 4,
                    font: {
                        color: "#4a5568",
                        size: 12,
                        face: "Inter, sans-serif",
                        strokeWidth: 2,
                        strokeColor: "#ffffff"
                    },
                    smooth: {
                        enabled: true,
                        type: "continuous",
                        roundness: 0.5
                    },
                    shadow: {
                        enabled: true,
                        color: "rgba(0,0,0,0.1)",
                        size: 5
                    }
                },
                physics: {
                    enabled: true,
                    stabilization: {
                        enabled: true,
                        iterations: 200,
                        updateInterval: 25
                    },
                    barnesHut: {
                        gravitationalConstant: -3000,
                        centralGravity: 0.3,
                        springLength: 150,
                        springConstant: 0.05,
                        damping: 0.4
                    }
                },
                interaction: {
                    hover: true,
                    tooltipDelay: 200,
                    hideEdgesOnDrag: false,
                    hideEdgesOnZoom: false,
                    navigationButtons: false,
                    keyboard: {
                        enabled: true,
                        speed: { x: 10, y: 10, zoom: 0.02 }
                    },
                    zoomView: true
                },
                layout: {
                    improvedLayout: true,
                    randomSeed: 42
                }
            }
        );

        // Handle stabilization
        network.on("stabilizationIterationsDone", () => {
            setIsLoading(false);
            network.setOptions({ physics: { enabled: false } });
        });

        // Handle node click
        network.on("click", (params) => {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                const clickedNode = graph.nodes.find((n: any) => n.id === nodeId);
                if (clickedNode && onNodeClick) {
                    onNodeClick(clickedNode);
                }
            } else {
                if (onNodeClick) {
                    onNodeClick(null);
                }
            }
        });

        // Double click to focus
        network.on("doubleClick", (params) => {
            if (params.nodes.length > 0) {
                network.focus(params.nodes[0], {
                    scale: 1.5,
                    animation: {
                        duration: 500,
                        easingFunction: "easeInOutQuad"
                    }
                });
            }
        });

        return () => network.destroy();
    }, [graph, onNodeClick]);

    return (
        <div className="relative rounded-2xl overflow-hidden bg-white border-2 border-[#e5e5e5]">
            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl shadow-lg border-2 border-[#427466]/20">
                        <div className="w-5 h-5 border-3 border-[#427466]/20 border-t-[#427466] rounded-full animate-spin"></div>
                        <span className="text-[#427466] font-semibold text-sm">Rendering graph...</span>
                    </div>
                </div>
            )}

            {/* Graph Canvas */}
            <div ref={ref} style={{ height: "550px", width: "100%" }} />

            {/* Legend */}
            <div className="absolute top-4 left-4 flex flex-col gap-2.5 px-4 py-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-md border border-[#e5e5e5]">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-[#333]">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#427466] shadow-sm border-2 border-white"></span>
                    <span>Patient</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-[#333]">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#10b981] shadow-sm border-2 border-white"></span>
                    <span>Drug</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-[#333]">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#f59e0b] shadow-sm border-2 border-white"></span>
                    <span>Diagnosis</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-[#333]">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#8b5cf6] shadow-sm border-2 border-white"></span>
                    <span>Encounter</span>
                </div>
            </div>

            {/* Interaction Hint */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-2.5 bg-white/95 backdrop-blur-sm rounded-full text-xs text-[#666] font-medium whitespace-nowrap">
                Click node for details | Scroll to zoom
            </div>
        </div>
    );
}
