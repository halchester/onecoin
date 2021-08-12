import {Block as BlockT} from './types';
import * as CryptoJS from 'crypto-js';

export const getCurrentTimestamp = (): number =>
  Math.round(new Date().getTime() / 1000);

export const calculateHash = (
  index: number,
  previousHash: string,
  timestamp: number,
  data: string,
  difficulity?: number,
  nonce?: number
): string =>
  CryptoJS.SHA256(index + previousHash + timestamp + data).toString();

export const getLatestBlock = (blockchain: BlockT[]): BlockT =>
  blockchain[blockchain.length - 1];

export const isBlockStructureValid = (block: BlockT): boolean => {
  return (
    typeof block.index === 'number' &&
    typeof block.hash === 'string' &&
    typeof block.previousHash === 'string' &&
    typeof block.timestamp === 'number' &&
    typeof block.data === 'string'
  );
};
