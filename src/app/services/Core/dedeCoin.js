const crypto = require('crypto');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const debug = require('debug')('dedecoin:blockchain');

class Transaction {
    /**
     * 
     * @param {string} fromAddress 
     * @param {string} toAddress 
     * @param {number} amount 
     */

    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    /**
     * Creates a SHA256 hash of the transaction
     * 
     * @returns {string}
     */

    calculateHash() {
        return crypto.createHash('sha256').update(this.fromAddress + this.toAddress + this.amount + this.timestamp).digest('hex');
    }

    /**
     * elliptic keypair
     * @param {string} signingKey 
     */
    signTransaction(signingKey) {
        if(signingKey.getPublic('hex') !== this.fromAddress){
            throw new Error('You connot sign transactions for other wallets!');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');


        this.signature = sig.toDER('hex');
    }

    /**
     * is valid control
     * @returns {boolean}
     */

    isValid() {
        if(this.fromAddress == null ) return true;

        if(!this.signature || this.signature.length === 0){
            throw new Error('No signature in this transaction');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);

    }
}

class Block {
    /**
     * 
     * @param {number} timestamp 
     * @param {Transaction[]} transactions 
     * @param {string} previousHash 
     */
    constructor(timestamp, transactions, previousHash= '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    /**
     * inside this block
     * 
     * @returns {string}
     */
    calculateHash() {
        return crypto.createHash('sha256').update(this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).digest('hex');   
    }

    /**
     * changes sometimes difficulty
     * 
     * @param {number} difficulty 
     */

    mineBlock(difficulty) {
        while(this.hash.substring(0, difficulty) !== Array(difficulty +1).join("0")){
            this.nonce++;
            this.hash = this.calculateHash();
        }

        debug(`Block mined: + ${this.hash}`);
    }

    /**
     * false if the block is invalid => true/false
     * 
     * @returns {boolean}
     */

    hasValidTransactions() {
        for(const tx of this.transactions){
            if(!tx.isValid()){
                return false;
            }
        }

        return true;
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2; // mining difficulty 
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    /**
     * create block
     * 
     * @returns {Block[]}
     */
    createGenesisBlock() {
        return new Block(Date.parse("05-02-2020"), [], "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }
    /**
     * given address
     * 
     * @param {string} miningRewardAddress 
     */
    minePendingTransactions(miningRewardAddress) {
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(rewardTx);

        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log("Block successfully mined!");
        this.chain.push(block);

        this.pendingTransactions = [];

    }

    /**
     * Transaction add
     * 
     * @param {Transaction} transaction 
     */

    addTransaction(transaction) {

        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error('Transaction must include form and to address');
        }

        // Verify Transaction!
        if(!transaction.isValid()){
            throw new Error('Cannot add invalid transaction to chain');
        }

        if(transaction.amount <= 0){
            throw new Error('Transaction amount should be higher than 0');
        }

        if(this.getBalanceOfAddress(transaction.fromAddress) < transaction.amount){
            throw new Error('Not enough balance');
        }

        this.pendingTransactions.push(transaction);
        debug('transaction added: %s', transaction);
    }

    /**
     * Returns the balance
     * 
     * @param {string} address
     * @return {number} The balance of the wallet 
     */
    getBalanceOfAddress(address) {
        let balance = 0;

        for(const block of this.chain){
            for(const trans of block.transactions){
                if(trans.fromAddress === address) {
                    balance -= trans.amount;
                }
                
                if(trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }

        debug('getBalanceOfAddress: %s', balance);
        return balance;
    }
    
    /**
     * Returns a list of all transaction wallet
     * 
     * @param {string} address
     * @return {Transaction[]}
     */
    getAllTransactionForWallet(address) {
        const txs = [];

        for(const block of this.chain){
            for(const tx of block.transactions){
                if(tx.fromAddress === address || tx.toAddress === address){
                    txs.push(tx);
                }
            }
        }

        debug('get transactions for wallet count: %s', txs.length);
        return txs;
    }

    /**
     * ischainvalid control
     * 
     * @return {boolean}
     */
    isChainValid() {
        for(let i=1; i<this.chain.length; i++){
            const currentBlock = this.chain[i];

            if(!currentBlock.hasValidTransactions()){
                return false;
            }

            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }
    
        }
        return true;
    }

}


module.exports.Blockchain = Blockchain;
module.exports.Block = Block;
module.exports.Transaction = Transaction;