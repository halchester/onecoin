import CryptoJS from 'crypto-js';
import { blockchain } from '../src';
import { Block } from '../src/Block';
import { Block as BlockT } from '../types';
import {
	DIFFICULITY_ADJUSTMENT_INTERVAL,
	BLOCK_GENERATION_INTERVAL,
} from './contants';
import { hashMatchesDifficulity } from './validation';

export const calculateHash = (
	index: number,
	previousHash: string,
	timestamp: number,
	data: string,
	difficulity?: number,
	nonce?: number
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
		blockData,
		// FIXME:
		0,
		0
	);
};

export const getLatestBlock = (blockchain: BlockT[]): BlockT =>
	blockchain[blockchain.length - 1];

export const findBlock = (
	index: number,
	previousHash: string,
	timestamp: number,
	data: string,
	difficulity: number
): BlockT => {
	let nonce = 0;
	while (true) {
		const hash: string = calculateHash(
			index,
			previousHash,
			timestamp,
			data,
			difficulity,
			nonce
		);
		if (hashMatchesDifficulity(hash, difficulity)) {
			return new Block(
				index,
				hash,
				previousHash,
				timestamp,
				data,
				difficulity,
				nonce
			);
		}
		nonce++;
	}
};

export const getDifficulity = (aBlockchain: BlockT[]): number => {
	const latestBlock: BlockT = aBlockchain[blockchain.length - 1];

	if (
		latestBlock.index % DIFFICULITY_ADJUSTMENT_INTERVAL === 0 &&
		latestBlock.index !== 0
	) {
		return getAdjustedDifficulty(latestBlock, aBlockchain);
	} else {
		return latestBlock.difficulity;
	}
};

export const getAdjustedDifficulty = (
	latestBlock: BlockT,
	aBlockchain: BlockT[]
) => {
	const previousAdjustmentBlock: BlockT =
		aBlockchain[blockchain.length - DIFFICULITY_ADJUSTMENT_INTERVAL];
	const timeExpected: number =
		BLOCK_GENERATION_INTERVAL * DIFFICULITY_ADJUSTMENT_INTERVAL;
	const timeTaken: number =
		latestBlock.timestamp - previousAdjustmentBlock.timestamp;

	if (timeExpected > timeTaken) {
		return previousAdjustmentBlock.difficulity + 1;
	} else if (timeTaken > timeExpected) {
		return previousAdjustmentBlock.difficulity - 1;
	} else {
		return previousAdjustmentBlock.difficulity;
	}
};
