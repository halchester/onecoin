import CryptoJS from 'crypto-js';
import { Block } from '../src/Block';
import { Block as BlockT } from '../types';

export const calculateHash = (
	index: number,
	previousHash: string,
	timestamp: number,
	data: string
): string =>
	CryptoJS.SHA256(index + previousHash + timestamp + data).toString();

export const calculateHashForBlock = (block: BlockT): string => {
	return calculateHash(
		block.index,
		block.previousHash,
		block.timestamp,
		block.data
	);
};

export const generateNewBlock = (blockchain: BlockT[], blockData: string) => {
	const previousBlock: BlockT = getLatestBlock(blockchain);
	const nextIndex: number = previousBlock.index + 1;
	const nextTimestamp: number = new Date().getTime() / 1000;
	const nextHash: string = calculateHash(
		nextIndex,
		previousBlock.hash,
		nextTimestamp,
		blockData
	);

	return new Block(
		nextIndex,
		nextHash,
		previousBlock.hash,
		nextTimestamp,
		blockData
	);
};

export const getLatestBlock = (blockchain: BlockT[]): BlockT =>
	blockchain[blockchain.length - 1];
