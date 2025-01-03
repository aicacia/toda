import { join, homeDir } from '@tauri-apps/api/path';
import {
	Edge,
	Node,
	NodeEdge,
	Query,
	query,
	QueryKind,
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
import { ExtensionContext } from './ExtensionContext';

export class ExtensionHypergraph {
	#context: ExtensionContext;

	constructor(context: ExtensionContext) {
		this.#context = context;
	}

	uri(uri: string) {
		return `${this.#context.id}/${uri}`;
	}

	async filename() {
		// TODO: allow database to be switched out
		return join(await homeDir(), '.toda', 'databases', 'toda.db');
	}

	query<FN = object, TN = object, E = object>(
		kind: 'node_edge',
		query: Query
	): Promise<Array<NodeEdge<FN, TN, E>>>;
	query<N = object>(kind: 'node', query: Query): Promise<Array<Node<N>>>;
	query<E = object>(kind: 'edge', query: Query): Promise<Array<Edge<E>>>;

	async query(kind: QueryKind, rawQuery: Query) {
		return query(await this.filename(), kind as never, rawQuery) as never;
	}

	async createNode<T>(uri: string, data: T, prefixUri = true) {
		return createNode(await this.filename(), prefixUri ? this.uri(uri) : uri, data);
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
		return deleteNodesByURI(await this.filename(), prefixUri ? this.uri(uri) : uri);
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
			prefixUri ? this.uri(uri) : uri,
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

	async deleteEdgesByURI(uri: string, prefixUri = true) {
		return deleteEdgesByURI(await this.filename(), prefixUri ? this.uri(uri) : uri);
	}
}
