export type Block = {
	index: number;
	hash: string;
	previousHash: string;
	timestamp: number;
	data: string;
	difficulity: number;
	nonce: number;
};
