import { Block as BlockT } from '../types';

export class Block implements BlockT {
	constructor(
		public index: number,
		public hash: string,
		public previousHash: string,
		public timestamp: number,
		public data: string
	) {}
}
