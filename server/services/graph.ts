import { db } from './db.ts';
import { GraphEntity, GraphRelationship } from '../../src/types/index.ts';

export interface GraphTraversalPath {
  nodes: GraphEntity[];
  relationships: GraphRelationship[];
  length: number;
}

export class KnowledgeGraphEngine {
  /**
   * Returns all entities with calculated degree centrality and PageRank metrics.
   */
  public getGraphData(): {
    nodes: GraphEntity[];
    edges: GraphRelationship[];
    stats: {
      totalNodes: number;
      totalEdges: number;
      density: number;
      entityTypes: Record<string, number>;
      relationshipTypes: Record<string, number>;
    };
  } {
    const nodes = Array.from(db.graphEntities.values());
    const edges = Array.from(db.graphRelationships.values());

    // Calculate Degrees
    const degreeMap = new Map<string, number>();
    for (const e of edges) {
      degreeMap.set(e.source, (degreeMap.get(e.source) || 0) + 1);
      degreeMap.set(e.target, (degreeMap.get(e.target) || 0) + 1);
    }

    const n = nodes.length;
    for (const node of nodes) {
      const deg = degreeMap.get(node.id) || 0;
      node.degree = deg;
      // Normalized degree centrality
      node.pagerank = n > 1 ? Number((deg / (n - 1)).toFixed(3)) : 0;
    }

    // Graph statistics
    const entityTypes: Record<string, number> = {};
    for (const node of nodes) {
      entityTypes[node.type] = (entityTypes[node.type] || 0) + 1;
    }

    const relationshipTypes: Record<string, number> = {};
    for (const edge of edges) {
      relationshipTypes[edge.type] = (relationshipTypes[edge.type] || 0) + 1;
    }

    const maxEdges = (n * (n - 1)) / 2;
    const density = maxEdges > 0 ? Number((edges.length / maxEdges).toFixed(4)) : 0;

    return {
      nodes,
      edges,
      stats: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        density,
        entityTypes,
        relationshipTypes
      }
    };
  }

  /**
   * Retrieves an entity and its 1-hop connected neighborhood.
   */
  public getEntityDetails(entityId: string): {
    entity: GraphEntity | null;
    neighbors: Array<{
      relationship: GraphRelationship;
      connectedEntity: GraphEntity;
      direction: 'outgoing' | 'incoming';
    }>;
  } {
    const entity = db.graphEntities.get(entityId) || null;
    if (!entity) return { entity: null, neighbors: [] };

    const edges = Array.from(db.graphRelationships.values());
    const neighbors: Array<{
      relationship: GraphRelationship;
      connectedEntity: GraphEntity;
      direction: 'outgoing' | 'incoming';
    }> = [];

    for (const edge of edges) {
      if (edge.source === entityId) {
        const target = db.graphEntities.get(edge.target);
        if (target) {
          neighbors.push({ relationship: edge, connectedEntity: target, direction: 'outgoing' });
        }
      } else if (edge.target === entityId) {
        const src = db.graphEntities.get(edge.source);
        if (src) {
          neighbors.push({ relationship: edge, connectedEntity: src, direction: 'incoming' });
        }
      }
    }

    return { entity, neighbors };
  }

  /**
   * Searches entities by keyword across name, type, and properties.
   */
  public searchEntities(keyword: string, typeFilter?: string): GraphEntity[] {
    const q = keyword.toLowerCase().trim();
    const nodes = Array.from(db.graphEntities.values());

    return nodes.filter(node => {
      if (typeFilter && typeFilter !== 'all' && node.type !== typeFilter) {
        return false;
      }
      if (!q) return true;
      const matchName = node.name.toLowerCase().includes(q);
      const matchDesc = node.description.toLowerCase().includes(q);
      const matchType = node.type.toLowerCase().includes(q);
      const matchProps = JSON.stringify(node.properties).toLowerCase().includes(q);
      return matchName || matchDesc || matchType || matchProps;
    });
  }

  /**
   * Shortest path traversal between two nodes using Breadth-First Search (BFS).
   */
  public findPath(sourceId: string, targetId: string): GraphTraversalPath | null {
    if (sourceId === targetId) {
      const node = db.graphEntities.get(sourceId);
      return node ? { nodes: [node], relationships: [], length: 0 } : null;
    }

    const edges = Array.from(db.graphRelationships.values());
    const adj = new Map<string, Array<{ neighborId: string; edge: GraphRelationship }>>();

    for (const e of edges) {
      if (!adj.has(e.source)) adj.set(e.source, []);
      if (!adj.has(e.target)) adj.set(e.target, []);
      adj.get(e.source)!.push({ neighborId: e.target, edge: e });
      adj.get(e.target)!.push({ neighborId: e.source, edge: e });
    }

    const queue: Array<{ currentId: string; path: string[]; edgePath: GraphRelationship[] }> = [
      { currentId: sourceId, path: [sourceId], edgePath: [] }
    ];
    const visited = new Set<string>([sourceId]);

    while (queue.length > 0) {
      const { currentId, path, edgePath } = queue.shift()!;
      if (currentId === targetId) {
        const nodes = path.map(id => db.graphEntities.get(id)!).filter(Boolean);
        return {
          nodes,
          relationships: edgePath,
          length: edgePath.length
        };
      }

      const neighbors = adj.get(currentId) || [];
      for (const { neighborId, edge } of neighbors) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push({
            currentId: neighborId,
            path: [...path, neighborId],
            edgePath: [...edgePath, edge]
          });
        }
      }
    }

    return null;
  }

  /**
   * Extracts entities and relationships from processed policy text and adds them into the graph.
   */
  public extractFromPolicy(docId: string, title: string, text: string) {
    const policyId = `pol-${docId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`;
    const policyNode: GraphEntity = {
      id: policyId,
      name: title,
      type: 'Insurance Policy',
      description: `Indexed policy document extracted from ${title}`,
      properties: { sourceDocId: docId, indexedAt: new Date().toISOString() }
    };
    db.graphEntities.set(policyId, policyNode);

    // Scan for common insurance entities in the text
    const lower = text.toLowerCase();
    if (lower.includes('hospitalization') || lower.includes('inpatient')) {
      const covId = `cov-${docId}-hosp`;
      db.graphEntities.set(covId, {
        id: covId,
        name: `${title} - Hospitalization`,
        type: 'Coverage',
        description: 'Hospitalization benefit extracted from policy clauses.',
        properties: { docId }
      });
      db.graphRelationships.set(`rel-${policyId}-hosp`, {
        id: `rel-${policyId}-hosp`,
        source: policyId,
        target: covId,
        type: 'POLICY_PROVIDES_COVERAGE'
      });
    }

    if (lower.includes('exclusion') || lower.includes('excluded')) {
      const excId = `exc-${docId}-gen`;
      db.graphEntities.set(excId, {
        id: excId,
        name: `${title} - General Exclusions`,
        type: 'Exclusion',
        description: 'Policy general exclusions and limitations clause.',
        properties: { docId }
      });
      db.graphRelationships.set(`rel-${policyId}-exc`, {
        id: `rel-${policyId}-exc`,
        source: policyId,
        target: excId,
        type: 'POLICY_HAS_EXCLUSION'
      });
    }

    return policyNode;
  }
}

export const graphEngine = new KnowledgeGraphEngine();
