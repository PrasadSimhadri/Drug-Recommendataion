import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

interface Node {
    cui: string;
    preferred_name: string;
    semantic_types: string;
    synonyms: string;
    sources: string;
    codes: string;
}

interface Edge {
    source: string;
    target: string;
    relation: string;
    raw_relation: string;
    source_vocab: string;
}

// CSV parser that handles quoted fields
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                // Escaped quote
                current += '"';
                i++;
            } else {
                // Toggle quotes
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = "";
        } else {
            current += char;
        }
    }
    result.push(current);
    
    return result;
}

// Cache for parsed data
let nodesCache: Node[] | null = null;
let edgesCache: Edge[] | null = null;
let semanticTypesCache: string[] | null = null;
let relationTypesCache: string[] | null = null;

async function loadNodes(): Promise<Node[]> {
    if (nodesCache) return nodesCache;

    const filePath = path.join(process.cwd(), "public", "nodes_50k.csv");
    const content = await fs.readFile(filePath, "utf-8");
    const lines = content.split("\n").filter((line) => line.trim());

    nodesCache = lines.slice(1).map((line) => {
        const values = parseCSVLine(line);
        return {
            cui: values[0] || "",
            preferred_name: values[1] || "",
            semantic_types: values[2] || "",
            synonyms: values[3] || "",
            sources: values[4] || "",
            codes: values[5] || "",
        };
    });

    return nodesCache;
}

async function loadEdges(): Promise<Edge[]> {
    if (edgesCache) return edgesCache;

    const filePath = path.join(process.cwd(), "public", "edges_50k.csv");
    const content = await fs.readFile(filePath, "utf-8");
    const lines = content.split("\n").filter((line) => line.trim());

    edgesCache = lines.slice(1).map((line) => {
        const values = parseCSVLine(line);
        return {
            source: values[0] || "",
            target: values[1] || "",
            relation: values[2] || "",
            raw_relation: values[3] || "",
            source_vocab: values[4] || "",
        };
    });

    return edgesCache;
}

async function getSemanticTypes(): Promise<string[]> {
    if (semanticTypesCache) return semanticTypesCache;

    const nodes = await loadNodes();
    const typesSet = new Set<string>();

    nodes.forEach((node) => {
        const types = node.semantic_types.split(";");
        types.forEach((t) => {
            const trimmed = t.trim();
            if (trimmed) typesSet.add(trimmed);
        });
    });

    semanticTypesCache = Array.from(typesSet).sort();
    return semanticTypesCache;
}

async function getRelationTypes(): Promise<string[]> {
    if (relationTypesCache) return relationTypesCache;

    const edges = await loadEdges();
    const typesSet = new Set<string>();

    edges.forEach((edge) => {
        if (edge.relation) typesSet.add(edge.relation);
    });

    relationTypesCache = Array.from(typesSet).sort();
    return relationTypesCache;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            action,
            semanticTypes = [],
            relationTypes = [],
            searchCui = "",
            searchName = "",
            limit = 500,
            includeConnected = true,
        } = body;

        // Get filter options
        if (action === "getFilters") {
            const [semanticTypesList, relationTypesList] = await Promise.all([
                getSemanticTypes(),
                getRelationTypes(),
            ]);

            return NextResponse.json({
                semanticTypes: semanticTypesList,
                relationTypes: relationTypesList,
            });
        }

        // Get graph data with filters
        if (action === "getGraph") {
            const [allNodes, allEdges] = await Promise.all([loadNodes(), loadEdges()]);

            let filteredNodes: Node[] = allNodes;

            // Filter by semantic types
            if (semanticTypes.length > 0) {
                filteredNodes = filteredNodes.filter((node) => {
                    const nodeTypes = node.semantic_types.split(";").map((t) => t.trim());
                    return semanticTypes.some((st: string) => nodeTypes.includes(st));
                });
            }

            // Filter by CUI search
            if (searchCui) {
                filteredNodes = filteredNodes.filter((node) =>
                    node.cui.toLowerCase().includes(searchCui.toLowerCase())
                );
            }

            // Filter by name search
            if (searchName) {
                filteredNodes = filteredNodes.filter(
                    (node) =>
                        node.preferred_name.toLowerCase().includes(searchName.toLowerCase()) ||
                        node.synonyms.toLowerCase().includes(searchName.toLowerCase())
                );
            }

            // Limit nodes
            const limitedNodes = filteredNodes.slice(0, limit);
            const nodeSet = new Set(limitedNodes.map((n) => n.cui));

            // Get edges between filtered nodes
            let filteredEdges = allEdges.filter(
                (edge) => nodeSet.has(edge.source) && nodeSet.has(edge.target)
            );

            // Filter by relation types
            if (relationTypes.length > 0) {
                filteredEdges = filteredEdges.filter((edge) =>
                    relationTypes.includes(edge.relation)
                );
            }

            // If includeConnected is true and we have a search, include connected nodes
            if (includeConnected && (searchCui || searchName) && limitedNodes.length > 0) {
                const connectedCuis = new Set<string>();
                filteredEdges.forEach((edge) => {
                    if (nodeSet.has(edge.source)) connectedCuis.add(edge.target);
                    if (nodeSet.has(edge.target)) connectedCuis.add(edge.source);
                });

                // Add connected nodes (limited)
                const connectedNodes = allNodes
                    .filter((n) => connectedCuis.has(n.cui) && !nodeSet.has(n.cui))
                    .slice(0, Math.min(100, limit - limitedNodes.length));

                limitedNodes.push(...connectedNodes);
                connectedNodes.forEach((n) => nodeSet.add(n.cui));

                // Update edges to include new nodes
                filteredEdges = allEdges.filter(
                    (edge) => nodeSet.has(edge.source) && nodeSet.has(edge.target)
                );

                if (relationTypes.length > 0) {
                    filteredEdges = filteredEdges.filter((edge) =>
                        relationTypes.includes(edge.relation)
                    );
                }
            }

            // Transform for vis-network
            const visNodes = limitedNodes.map((node) => ({
                id: node.cui,
                label: node.preferred_name.length > 30 
                    ? node.preferred_name.substring(0, 30) + "..." 
                    : node.preferred_name,
                title: `<b>${node.preferred_name}</b><br/>CUI: ${node.cui}<br/>Types: ${node.semantic_types}<br/>Sources: ${node.sources}`,
                group: node.semantic_types.split(";")[0]?.trim() || "Unknown",
                fullData: node,
            }));

            const visEdges = filteredEdges.map((edge, idx) => ({
                id: `edge-${idx}`,
                from: edge.source,
                to: edge.target,
                label: edge.relation,
                title: `${edge.raw_relation} (${edge.source_vocab})`,
                relation: edge.relation,
            }));

            return NextResponse.json({
                nodes: visNodes,
                edges: visEdges,
                totalNodes: allNodes.length,
                totalEdges: allEdges.length,
                filteredNodes: limitedNodes.length,
                filteredEdges: filteredEdges.length,
            });
        }

        // Get statistics
        if (action === "getStats") {
            const [allNodes, allEdges] = await Promise.all([loadNodes(), loadEdges()]);

            return NextResponse.json({
                totalNodes: allNodes.length,
                totalEdges: allEdges.length,
            });
        }

        // Get sampled graph - more performant for large datasets
        if (action === "getSampledGraph") {
            const { offset = 0, limit = 500 } = body;
            const [allNodes, allEdges] = await Promise.all([loadNodes(), loadEdges()]);

            // Get a subset of nodes
            const sampledNodes = allNodes.slice(offset, offset + limit);
            const nodeSet = new Set(sampledNodes.map((n) => n.cui));

            // Get edges only between the sampled nodes
            const sampledEdges = allEdges.filter(
                (edge) => nodeSet.has(edge.source) && nodeSet.has(edge.target)
            );

            // Transform for vis-network
            const visNodes = sampledNodes.map((node) => ({
                id: node.cui,
                label: node.preferred_name.length > 20 
                    ? node.preferred_name.substring(0, 20) + "..." 
                    : node.preferred_name,
                title: `<b>${node.preferred_name}</b><br/>CUI: ${node.cui}<br/>Types: ${node.semantic_types}`,
                group: node.semantic_types.split(";")[0]?.trim() || "Unknown",
                fullData: node,
            }));

            const visEdges = sampledEdges.map((edge, idx) => ({
                id: `edge-${offset}-${idx}`,
                from: edge.source,
                to: edge.target,
                title: `${edge.relation}: ${edge.raw_relation}`,
                relation: edge.relation,
            }));

            return NextResponse.json({
                nodes: visNodes,
                edges: visEdges,
                totalNodes: allNodes.length,
                totalEdges: allEdges.length,
                displayedNodes: visNodes.length,
                displayedEdges: visEdges.length,
                offset,
                limit,
                hasMore: offset + limit < allNodes.length,
            });
        }

        // Get full graph without any filters (WARNING: very slow for large datasets)
        if (action === "getFullGraph") {
            const [allNodes, allEdges] = await Promise.all([loadNodes(), loadEdges()]);

            // Transform for vis-network - optimized for large graph
            const visNodes = allNodes.map((node) => ({
                id: node.cui,
                label: node.preferred_name.length > 25 
                    ? node.preferred_name.substring(0, 25) + "..." 
                    : node.preferred_name,
                title: `<b>${node.preferred_name}</b><br/>CUI: ${node.cui}<br/>Types: ${node.semantic_types}<br/>Sources: ${node.sources}`,
                group: node.semantic_types.split(";")[0]?.trim() || "Unknown",
                fullData: node,
            }));

            const visEdges = allEdges.map((edge, idx) => ({
                id: `edge-${idx}`,
                from: edge.source,
                to: edge.target,
                title: `${edge.relation}: ${edge.raw_relation} (${edge.source_vocab})`,
                relation: edge.relation,
            }));

            return NextResponse.json({
                nodes: visNodes,
                edges: visEdges,
                totalNodes: allNodes.length,
                totalEdges: allEdges.length,
            });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("UMLS Graph API Error:", error);
        return NextResponse.json(
            { error: "Failed to process request" },
            { status: 500 }
        );
    }
}
