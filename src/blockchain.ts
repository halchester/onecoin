import {Block as BlockT} from './types';
import {hexToBinary} from './util';
import {calculateHash, getCurrentTimestamp} from './helpers';
import {getLatestBlock} from './helpers';
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

/**
 * Genesis block (very first block)
 */
export const genesisBlock = new Block(
  0,
  '816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7',
  '000000',
  1465154705,
  'Genesis block',
  0,
  0
);

/**
 * In memory blockchain
 */

export let blockchain: BlockT[] = [genesisBlock];

/**
 * function to get the current blockchain
 */

export const getBlockchain = () => blockchain;

/**
 * This function is to check if by any means,
 * there are 2 forks of our current blockchain,
 * we will choose the longer one
 */

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

/**
 *
 */

function boradcastLatest() {
  throw new Error('Function not implemented.');
}

/**
 * We will check if the new Block added to our
 * blockchain is valid
 * @param -> newBlock : incoming block
 * @param -> prevBlock : our latest block in our blockchain
 * if not we will reject
 */

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

/**
 * Checking if our blockchain is valid or not
 */
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

/**
 * Checking POW for new block if the id of that block
 * matches the current difficulity * 0
 */
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

/**
 * Calculate hash for new block (helper)
 */
export const calculateHashForBlock = (block: BlockT): string => {
  return calculateHash(
    block.index,
    block.previousHash,
    block.timestamp,
    block.data
  );
};

/**
 * if everything in new block worksout fine,
 * we will generate new block and add to our blockchain
 */
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

/**
 * This function determines whether our new MINED block is valid or not
 * This is a completely random process and it jus goes through enough
 * nonce to find the hash of 0 * difficulity
 */
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

/**
 * We either increase or decrease the difficulty by one
 * if the time taken is at least two times greater or smaller than the expected difficulty.
 */
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
/**
 *
 * To mitigate the attack where a false timestamp is introduced in order to manipulate the difficulty the following rules is introduced:
 * A block is valid, if the timestamp is at most 1 min in the future from the time we perceive.
 * A block in the chain is valid, if the timestamp is at most 1 min in the past of the previous block.
 */

export const isValidTimestamp = (
  newBlock: BlockT,
  prevBlock: BlockT
): boolean => {
  return (
    prevBlock.timestamp - 60 < newBlock.timestamp &&
    newBlock.timestamp - 60 < getCurrentTimestamp()
  );
};
