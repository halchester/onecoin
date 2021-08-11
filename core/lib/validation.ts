import { calculateHashForBlock } from '.';
import { Block as BlockT } from '../types';
import { genesisBlock } from '../src/index';
import { hexToBinary } from './utils';

export const isNewBlockValid = (newBlock: BlockT, previousBlock: BlockT) => {
	if (newBlock.index !== previousBlock.index + 1) {
		console.log('Index invalid!');
		return false;
	}
	if (newBlock.previousHash !== previousBlock.hash) {
		console.log('Previous hash invalid!');
		return false;
	}
	if (calculateHashForBlock(newBlock) !== newBlock.hash) {
		console.log(
			typeof newBlock.hash + ' ' + typeof calculateHashForBlock(newBlock)
		);
		console.log(
			`Invalid Hash : ${calculateHashForBlock(newBlock)} !== ${newBlock.hash}`
		);
		return false;
	}
	return true;
};

export const isBlockStructureValid = (block: BlockT): boolean => {
	return (
		typeof block.index === 'number' &&
		typeof block.hash === 'string' &&
		typeof block.previousHash === 'string' &&
		typeof block.timestamp === 'number' &&
		typeof block.data === 'string'
	);
};

export const isBlockchainValid = (blockchain: BlockT[]): boolean => {
	const isGenesisValid = (block: BlockT) => {
		return JSON.stringify(block) === JSON.stringify(genesisBlock);
	};

	if (!isGenesisValid(blockchain[0])) {
		return false;
	}

	for (let i = 1; i < blockchain.length; i++) {
		if (!isNewBlockValid(blockchain[i + 1], blockchain[i])) {
			return false;
		}
	}
	return true;
};

export const hashMatchesDifficulity = (
	hash: string,
	difficulity: number
): boolean => {
	const hashInBinary = hexToBinary(hash);
	const requiredPrefix = '0'.repeat(difficulity);
	return hashInBinary.startsWith(requiredPrefix);
};
