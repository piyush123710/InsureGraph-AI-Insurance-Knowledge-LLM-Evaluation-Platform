"""
Knowledge Graph Engine: Adjacency graphs, BFS Traversal, Degree Centrality, and Entity Extraction.
"""
from typing import List, Dict, Any, Optional, Set
from collections import deque


class PythonKnowledgeGraph:
    def __init__(self):
        self.nodes: Dict[str, Dict[str, Any]] = {}
        self.edges: List[Dict[str, Any]] = []
        self.adj: Dict[str, List[Dict[str, Any]]] = {}

    def add_node(self, node_id: str, name: str, entity_type: str, description: str, properties: Dict[str, Any] = None):
        self.nodes[node_id] = {
            "id": node_id,
            "name": name,
            "type": entity_type,
            "description": description,
            "properties": properties or {}
        }
        if node_id not in self.adj:
            self.adj[node_id] = []

    def add_edge(self, edge_id: str, source: str, target: str, rel_type: str, properties: Dict[str, Any] = None):
        edge = {
            "id": edge_id,
            "source": source,
            "target": target,
            "type": rel_type,
            "properties": properties or {}
        }
        self.edges.append(edge)
        
        if source not in self.adj:
            self.adj[source] = []
        if target not in self.adj:
            self.adj[target] = []
            
        self.adj[source].append({"neighbor_id": target, "edge": edge})
        self.adj[target].append({"neighbor_id": source, "edge": edge})

    def calculate_degree_centrality(self) -> Dict[str, float]:
        """Calculates normalized degree centrality: deg(v) / (N - 1)."""
        n = len(self.nodes)
        if n <= 1:
            return {node_id: 0.0 for node_id in self.nodes}
            
        centrality = {}
        for node_id, neighbors in self.adj.items():
            centrality[node_id] = round(len(neighbors) / (n - 1), 4)
        return centrality

    def find_shortest_path(self, source_id: str, target_id: str) -> Optional[Dict[str, Any]]:
        """Finds shortest path between two nodes using Breadth-First Search (BFS)."""
        if source_id not in self.nodes or target_id not in self.nodes:
            return None
        if source_id == target_id:
            return {
                "nodes": [self.nodes[source_id]],
                "relationships": [],
                "length": 0
            }

        queue = deque([(source_id, [source_id], [])])
        visited: Set[str] = {source_id}

        while queue:
            curr_id, path_nodes, path_edges = queue.popleft()
            if curr_id == target_id:
                return {
                    "nodes": [self.nodes[nid] for nid in path_nodes],
                    "relationships": path_edges,
                    "length": len(path_edges)
                }

            for neighbor in self.adj.get(curr_id, []):
                nid = neighbor["neighbor_id"]
                if nid not in visited:
                    visited.add(nid)
                    queue.append((
                        nid,
                        path_nodes + [nid],
                        path_edges + [neighbor["edge"]]
                    ))
                    
        return None
