import {Block as BlockT} from './types';
import * as CryptoJS from 'crypto-js';
import {hexToBinary} from './util';
import {
  BLOCK_GENERATION_INTERVAL,
  DIFFICULITY_ADJUSTMENT_INTERVAL
} from './constants';

export class Block implements BlockT {
  constructor(
    public index: number,
    public hash: string,
    public previousHash: string,
    public timestamp: number,
    public data: string,
    public difficulity: number,
    public nonce: number
  ) {}
}

export const genesisBlock = new Block(
  0,
  '816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7',
  '000000',
  1465154705,
  'Genesis block',
  0,
  0
);

export let blockchain: BlockT[] = [genesisBlock];

export const getBlockchain = () => blockchain;

export const replaceChain = (newBlocks: BlockT[]) => {
  if (isBlockchainValid(newBlocks) && newBlocks.length > getBlockchain.length) {
    console.log(
      'Received blockchain is valid! Replacing with these blockchain.'
    );
    blockchain = newBlocks;
    boradcastLatest();
  } else {
    console.log('Received blockchain is invalid!');
  }
};

function boradcastLatest() {
  throw new Error('Function not implemented.');
}

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
  if (hashInBinary) {
    return hashInBinary.startsWith(requiredPrefix);
  }
  return false;
};

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
