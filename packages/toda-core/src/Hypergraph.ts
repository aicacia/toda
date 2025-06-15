import {
	type Edge,
	type Node,
	type NodeEdge,
	type Query,
	type QueryExpr,
	type QueryKind,
	query,
	createNode,
	updateNode,
	deleteNode,
	deleteNodes,
	deleteNodesByURI,
	createEdge,
	updateEdge,
	deleteEdge,
	deleteEdges,
	deleteEdgesByURI
} from 'tauri-plugin-hypergraphsql';

export abstract class Hypergraph {
	abstract filename(): Promise<string>;
	abstract prefixUriFn(uri: string): string;

	query<FN = object, TN = object, E = object>(
		kind: 'node_edge',
		query: Query,
		prefixUri?: boolean,
	): Promise<Array<NodeEdge<FN, TN, E>>>;
	query<N = object>(kind: 'node', query: Query, prefixUri?: boolean): Promise<Array<Node<N>>>;
	query<E = object>(kind: 'edge', query: Query, prefixUri?: boolean): Promise<Array<Edge<E>>>;

	async query(kind: QueryKind, rawQuery: Query, prefixUri = true) {
		return query(await this.filename(), kind as never, prefixUri ? prefixQuery(rawQuery, this.prefixUriFn) : rawQuery) as never;
	}

	async createNode<T>(uri: string, data: T, prefixUri = true) {
		return createNode(await this.filename(), prefixUri ? this.prefixUriFn(uri) : uri, data);
	}

	async updateNode<T>(nodeId: number, data: T) {
		return updateNode(await this.filename(), nodeId, data);
	}

	async deleteNode(nodeId: number) {
		return deleteNode(await this.filename(), nodeId);
	}

	async deleteNodes(nodeIds: number[]) {
		return deleteNodes(await this.filename(), nodeIds);
	}

	async deleteNodesByURI(uri: string, prefixUri = true) {
		return deleteNodesByURI(await this.filename(), prefixUri ? this.prefixUriFn(uri) : uri);
	}

	async createEdge<T>(
		fromNodeId: number,
		toNodeId: number,
		uri: string,
		data?: T,
		prefixUri = true
	) {
		return createEdge(
			await this.filename(),
			fromNodeId,
			toNodeId,
			prefixUri ? this.prefixUriFn(uri) : uri,
			data
		);
	}

	async updateEdge<T>(edgeId: number, data: T) {
		return updateEdge(await this.filename(), edgeId, data);
	}

	async deleteEdge(edgeId: number) {
		return deleteEdge(await this.filename(), edgeId);
	}

	async deleteEdges(edgeIds: number[]) {
		return deleteEdges(await this.filename(), edgeIds);
	}

	async deleteEdgesByURI(uri: string, prefixUri?: (uri: string) => string) {
		return deleteEdgesByURI(await this.filename(), prefixUri ? prefixUri(uri) : uri);
	}
}

function prefixQuery(query: Query, prefixUriFn: (uri: string) => string): Query {
	const prefixedQuery: Query = {};
	for (const [key, value] of Object.entries(query)) {
		switch (key) {
			case 'node.uri':
			case 'edge.uri':
				prefixedQuery[key] = prefixQueryRecur(value, prefixUriFn);
				break;
			default:
				(prefixedQuery as { [key: string]: QueryExpr })[key] = value;
				break;
		}
	}
	return prefixedQuery;
}

function prefixQueryRecur(query: QueryExpr, prefixUriFn: (uri: string) => string): QueryExpr {
	if (query !== null && typeof query === 'object') {
		const prefixedQuery: QueryExpr = {};
		for (const [key, value] of Object.entries(query)) {
			switch (key) {
				case 'in':
				case 'and':
				case 'or':
					prefixedQuery[key] = value.map((v: QueryExpr) => prefixQueryRecur(v, prefixUriFn));
					break;
				default:
					(prefixedQuery as { [key: string]: QueryExpr })[key] = prefixQueryRecur(value, prefixUriFn);
					break;
			}
		}
		return prefixedQuery;
	}
	if (typeof query === 'string') {
		return prefixUriFn(query);
	}
	return query;
}