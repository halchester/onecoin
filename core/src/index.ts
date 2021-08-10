import { Block } from './Block';
import { Block as BlockT } from '../types';
import { isBlockchainValid } from '../lib/validation';

export const genesisBlock = new Block(
	0,
	'816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7',
	'000000',
	1465154705,
	'Genesis block'
);

let blockchain: BlockT[] = [genesisBlock];

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
