/**
 * TAMV MSR (Merkle State Root) Blockchain Implementation
 * Developed by Edwin Oswaldo Castillo Trejo (Anubis Villaseñor)
 * 
 * Antifraude blockchain system with Merkle State Root anchoring
 * Provides immutable audit trail and state verification
 */

import crypto from 'crypto';
import { EventEmitter } from 'events';

/**
 * Merkle Tree Implementation
 * Provides efficient state verification and proof generation
 */
class MerkleTree {
    constructor(leaves = []) {
        this.leaves = leaves.map(leaf => this.hash(leaf));
        this.tree = this.buildTree();
    }

    /**
     * Hash function using SHA-256
     */
    hash(data) {
        return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
    }

    /**
     * Build the complete Merkle tree
     */
    buildTree() {
        if (this.leaves.length === 0) {
            return [];
        }

        const tree = [this.leaves];
        let currentLevel = this.leaves;

        while (currentLevel.length > 1) {
            const nextLevel = [];
            
            for (let i = 0; i < currentLevel.length; i += 2) {
                const left = currentLevel[i];
                const right = currentLevel[i + 1] || left; // Duplicate if odd number
                const parent = this.hash(left + right);
                nextLevel.push(parent);
            }
            
            tree.push(nextLevel);
            currentLevel = nextLevel;
        }

        return tree;
    }

    /**
     * Get the Merkle root
     */
    getRoot() {
        if (this.tree.length === 0) {
            return this.hash('');
        }
        return this.tree[this.tree.length - 1][0];
    }

    /**
     * Generate Merkle proof for a leaf
     */
    generateProof(leafIndex) {
        if (leafIndex >= this.leaves.length) {
            throw new Error('Leaf index out of bounds');
        }

        const proof = [];
        let currentIndex = leafIndex;

        for (let level = 0; level < this.tree.length - 1; level++) {
            const currentLevel = this.tree[level];
            const isRightNode = currentIndex % 2 === 1;
            const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;

            if (siblingIndex < currentLevel.length) {
                proof.push({
                    hash: currentLevel[siblingIndex],
                    position: isRightNode ? 'left' : 'right'
                });
            }

            currentIndex = Math.floor(currentIndex / 2);
        }

        return proof;
    }

    /**
     * Verify a Merkle proof
     */
    verifyProof(leafHash, proof, root) {
        let computedHash = leafHash;

        for (const proofElement of proof) {
            if (proofElement.position === 'left') {
                computedHash = this.hash(proofElement.hash + computedHash);
            } else {
                computedHash = this.hash(computedHash + proofElement.hash);
            }
        }

        return computedHash === root;
    }

    /**
     * Add new leaf and rebuild tree
     */
    addLeaf(leaf) {
        this.leaves.push(this.hash(leaf));
        this.tree = this.buildTree();
    }

    /**
     * Get tree statistics
     */
    getStats() {
        return {
            leafCount: this.leaves.length,
            treeHeight: this.tree.length,
            root: this.getRoot()
        };
    }
}

/**
 * Transaction class for MSR blockchain
 */
class MSRTransaction {
    constructor(data) {
        this.id = this.generateId();
        this.timestamp = new Date();
        this.data = data;
        this.type = data.type || 'generic';
        this.sender = data.sender || null;
        this.recipient = data.recipient || null;
        this.signature = null;
        this.merkleProof = null;
    }

    /**
     * Generate unique transaction ID
     */
    generateId() {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2);
        return crypto.createHash('sha256').update(timestamp + random).digest('hex');
    }

    /**
     * Sign transaction with private key
     */
    sign(privateKey) {
        const transactionData = {
            id: this.id,
            timestamp: this.timestamp,
            data: this.data,
            type: this.type,
            sender: this.sender,
            recipient: this.recipient
        };

        const sign = crypto.createSign('SHA256');
        sign.update(JSON.stringify(transactionData));
        this.signature = sign.sign(privateKey, 'hex');
    }

    /**
     * Verify transaction signature
     */
    verifySignature(publicKey) {
        if (!this.signature) {
            return false;
        }

        const transactionData = {
            id: this.id,
            timestamp: this.timestamp,
            data: this.data,
            type: this.type,
            sender: this.sender,
            recipient: this.recipient
        };

        const verify = crypto.createVerify('SHA256');
        verify.update(JSON.stringify(transactionData));
        return verify.verify(publicKey, this.signature, 'hex');
    }

    /**
     * Get transaction hash
     */
    getHash() {
        const transactionData = {
            id: this.id,
            timestamp: this.timestamp,
            data: this.data,
            type: this.type,
            sender: this.sender,
            recipient: this.recipient,
            signature: this.signature
        };

        return crypto.createHash('sha256').update(JSON.stringify(transactionData)).digest('hex');
    }

    /**
     * Validate transaction
     */
    validate() {
        const errors = [];

        if (!this.id) {
            errors.push('Transaction ID is required');
        }

        if (!this.timestamp) {
            errors.push('Timestamp is required');
        }

        if (!this.data) {
            errors.push('Transaction data is required');
        }

        if (this.sender && !this.signature) {
            errors.push('Signed transactions must have a signature');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
}

/**
 * Block class for MSR blockchain
 */
class MSRBlock {
    constructor(transactions = [], previousHash = null) {
        this.index = 0;
        this.timestamp = new Date();
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.merkleTree = new MerkleTree(transactions.map(tx => tx.getHash()));
        this.merkleRoot = this.merkleTree.getRoot();
        this.nonce = 0;
        this.hash = null;
        this.stateRoot = null;
        this.difficulty = 4; // Number of leading zeros required
    }

    /**
     * Calculate block hash
     */
    calculateHash() {
        const blockData = {
            index: this.index,
            timestamp: this.timestamp,
            previousHash: this.previousHash,
            merkleRoot: this.merkleRoot,
            nonce: this.nonce,
            stateRoot: this.stateRoot
        };

        return crypto.createHash('sha256').update(JSON.stringify(blockData)).digest('hex');
    }

    /**
     * Mine block using Proof of Work
     */
    mineBlock(difficulty = this.difficulty) {
        const target = Array(difficulty + 1).join('0');
        
        console.log(`Mining block ${this.index}...`);
        const startTime = Date.now();

        while (this.hash === null || this.hash.substring(0, difficulty) !== target) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        const endTime = Date.now();
        console.log(`Block ${this.index} mined in ${endTime - startTime}ms. Hash: ${this.hash}`);
    }

    /**
     * Validate block
     */
    validate(previousBlock = null) {
        const errors = [];

        // Validate hash
        if (this.hash !== this.calculateHash()) {
            errors.push('Block hash is invalid');
        }

        // Validate previous hash
        if (previousBlock && this.previousHash !== previousBlock.hash) {
            errors.push('Previous hash does not match');
        }

        // Validate Merkle root
        const calculatedMerkleRoot = new MerkleTree(
            this.transactions.map(tx => tx.getHash())
        ).getRoot();
        
        if (this.merkleRoot !== calculatedMerkleRoot) {
            errors.push('Merkle root is invalid');
        }

        // Validate transactions
        for (const transaction of this.transactions) {
            const txValidation = transaction.validate();
            if (!txValidation.valid) {
                errors.push(`Invalid transaction ${transaction.id}: ${txValidation.errors.join(', ')}`);
            }
        }

        // Validate proof of work
        const target = Array(this.difficulty + 1).join('0');
        if (this.hash.substring(0, this.difficulty) !== target) {
            errors.push('Proof of work is invalid');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Get block statistics
     */
    getStats() {
        return {
            index: this.index,
            timestamp: this.timestamp,
            transactionCount: this.transactions.length,
            merkleRoot: this.merkleRoot,
            hash: this.hash,
            size: JSON.stringify(this).length
        };
    }
}

/**
 * State Manager for blockchain state
 */
class StateManager {
    constructor() {
        this.state = new Map();
        this.stateHistory = [];
        this.merkleTree = new MerkleTree();
    }

    /**
     * Update state with transaction
     */
    updateState(transaction) {
        const stateKey = this.generateStateKey(transaction);
        const previousValue = this.state.get(stateKey);
        
        // Apply transaction to state
        const newValue = this.applyTransaction(transaction, previousValue);
        this.state.set(stateKey, newValue);

        // Record state change
        this.stateHistory.push({
            transaction: transaction.id,
            key: stateKey,
            previousValue: previousValue,
            newValue: newValue,
            timestamp: new Date()
        });

        // Update Merkle tree
        this.updateMerkleTree();
    }

    /**
     * Generate state key for transaction
     */
    generateStateKey(transaction) {
        switch (transaction.type) {
            case 'identity':
                return `identity:${transaction.data.did}`;
            case 'economic':
                return `balance:${transaction.sender}`;
            case 'governance':
                return `vote:${transaction.data.proposalId}`;
            case 'audit':
                return `audit:${transaction.data.entityId}`;
            default:
                return `generic:${transaction.id}`;
        }
    }

    /**
     * Apply transaction to current state
     */
    applyTransaction(transaction, currentValue) {
        switch (transaction.type) {
            case 'identity':
                return this.applyIdentityTransaction(transaction, currentValue);
            case 'economic':
                return this.applyEconomicTransaction(transaction, currentValue);
            case 'governance':
                return this.applyGovernanceTransaction(transaction, currentValue);
            case 'audit':
                return this.applyAuditTransaction(transaction, currentValue);
            default:
                return transaction.data;
        }
    }

    /**
     * Apply identity transaction
     */
    applyIdentityTransaction(transaction, currentValue) {
        const identityData = currentValue || {
            did: transaction.data.did,
            publicKey: null,
            created: null,
            updated: null,
            revoked: false
        };

        switch (transaction.data.action) {
            case 'create':
                identityData.publicKey = transaction.data.publicKey;
                identityData.created = transaction.timestamp;
                break;
            case 'update':
                identityData.publicKey = transaction.data.publicKey;
                identityData.updated = transaction.timestamp;
                break;
            case 'revoke':
                identityData.revoked = true;
                identityData.updated = transaction.timestamp;
                break;
        }

        return identityData;
    }

    /**
     * Apply economic transaction
     */
    applyEconomicTransaction(transaction, currentValue) {
        const balance = currentValue || { amount: 0, currency: 'TAMV' };

        switch (transaction.data.action) {
            case 'credit':
                balance.amount += transaction.data.amount;
                break;
            case 'debit':
                balance.amount -= transaction.data.amount;
                break;
            case 'transfer':
                // This would be handled by two separate transactions
                balance.amount -= transaction.data.amount;
                break;
        }

        balance.lastUpdated = transaction.timestamp;
        return balance;
    }

    /**
     * Apply governance transaction
     */
    applyGovernanceTransaction(transaction, currentValue) {
        const voteData = currentValue || {
            proposalId: transaction.data.proposalId,
            votes: { yes: 0, no: 0, abstain: 0 },
            voters: []
        };

        if (!voteData.voters.includes(transaction.sender)) {
            voteData.votes[transaction.data.vote]++;
            voteData.voters.push(transaction.sender);
        }

        return voteData;
    }

    /**
     * Apply audit transaction
     */
    applyAuditTransaction(transaction, currentValue) {
        const auditData = currentValue || {
            entityId: transaction.data.entityId,
            events: []
        };

        auditData.events.push({
            eventId: transaction.id,
            eventType: transaction.data.eventType,
            timestamp: transaction.timestamp,
            details: transaction.data.details
        });

        return auditData;
    }

    /**
     * Update Merkle tree with current state
     */
    updateMerkleTree() {
        const stateEntries = Array.from(this.state.entries()).map(([key, value]) => ({
            key: key,
            value: value
        }));

        this.merkleTree = new MerkleTree(stateEntries);
    }

    /**
     * Get current state root
     */
    getStateRoot() {
        return this.merkleTree.getRoot();
    }

    /**
     * Get state for a specific key
     */
    getState(key) {
        return this.state.get(key);
    }

    /**
     * Generate state proof
     */
    generateStateProof(key) {
        const stateEntries = Array.from(this.state.entries()).map(([k, v]) => ({ key: k, value: v }));
        const entryIndex = stateEntries.findIndex(entry => entry.key === key);
        
        if (entryIndex === -1) {
            return null;
        }

        return this.merkleTree.generateProof(entryIndex);
    }

    /**
     * Verify state proof
     */
    verifyStateProof(key, value, proof, stateRoot) {
        const leafHash = this.merkleTree.hash({ key: key, value: value });
        return this.merkleTree.verifyProof(leafHash, proof, stateRoot);
    }

    /**
     * Get state statistics
     */
    getStats() {
        return {
            stateSize: this.state.size,
            stateRoot: this.getStateRoot(),
            historyLength: this.stateHistory.length,
            merkleTreeStats: this.merkleTree.getStats()
        };
    }
}

/**
 * Main MSR Blockchain class
 */
export class MSRBlockchain extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            difficulty: 4,
            blockSize: 100,
            miningReward: 10,
            networkId: 'tamv-mainnet',
            ...config
        };

        this.chain = [];
        this.pendingTransactions = [];
        this.stateManager = new StateManager();
        this.validators = new Map();
        this.peers = new Set();
        
        // Performance metrics
        this.metrics = {
            totalTransactions: 0,
            totalBlocks: 0,
            averageBlockTime: 0,
            networkHashRate: 0,
            stateSize: 0
        };

        // Security features
        this.fraudDetection = new FraudDetectionSystem();
        this.consensusEngine = new ConsensusEngine();

        this.initialize();
    }

    /**
     * Initialize blockchain with genesis block
     */
    initialize() {
        if (this.chain.length === 0) {
            this.createGenesisBlock();
        }
        
        this.emit('initialized');
        console.log('MSR Blockchain initialized');
    }

    /**
     * Create genesis block
     */
    createGenesisBlock() {
        const genesisTransaction = new MSRTransaction({
            type: 'genesis',
            data: {
                message: 'TAMV Genesis Block - Territorio Autónomo de Memoria Viva',
                founder: 'Edwin Oswaldo Castillo Trejo (Anubis Villaseñor)',
                timestamp: new Date('2026-01-31T00:00:00Z'),
                principles: [
                    'Antifragilidad',
                    'Federación',
                    'Dignidad Humana',
                    'Transparencia',
                    'Soberanía Digital'
                ]
            }
        });

        const genesisBlock = new MSRBlock([genesisTransaction]);
        genesisBlock.index = 0;
        genesisBlock.previousHash = '0';
        genesisBlock.stateRoot = this.stateManager.getStateRoot();
        genesisBlock.mineBlock(this.config.difficulty);

        this.chain.push(genesisBlock);
        this.stateManager.updateState(genesisTransaction);
        
        this.emit('blockAdded', genesisBlock);
    }

    /**
     * Add transaction to pending pool
     */
    async addTransaction(transaction) {
        // Validate transaction
        const validation = transaction.validate();
        if (!validation.valid) {
            throw new Error(`Invalid transaction: ${validation.errors.join(', ')}`);
        }

        // Fraud detection
        const fraudCheck = await this.fraudDetection.checkTransaction(transaction);
        if (fraudCheck.isFraudulent) {
            throw new Error(`Transaction flagged as fraudulent: ${fraudCheck.reason}`);
        }

        // Add to pending pool
        this.pendingTransactions.push(transaction);
        this.emit('transactionAdded', transaction);

        // Auto-mine if enough transactions
        if (this.pendingTransactions.length >= this.config.blockSize) {
            await this.mineBlock();
        }

        return transaction.id;
    }

    /**
     * Mine a new block
     */
    async mineBlock(minerAddress = null) {
        if (this.pendingTransactions.length === 0) {
            throw new Error('No pending transactions to mine');
        }

        const startTime = Date.now();

        // Select transactions for block
        const transactions = this.pendingTransactions.splice(0, this.config.blockSize);

        // Add mining reward transaction if miner specified
        if (minerAddress) {
            const rewardTransaction = new MSRTransaction({
                type: 'economic',
                data: {
                    action: 'credit',
                    amount: this.config.miningReward,
                    reason: 'mining_reward'
                },
                recipient: minerAddress
            });
            transactions.push(rewardTransaction);
        }

        // Create new block
        const previousBlock = this.getLatestBlock();
        const newBlock = new MSRBlock(transactions, previousBlock.hash);
        newBlock.index = this.chain.length;

        // Update state with transactions
        for (const transaction of transactions) {
            this.stateManager.updateState(transaction);
        }

        // Set state root
        newBlock.stateRoot = this.stateManager.getStateRoot();

        // Mine block
        newBlock.mineBlock(this.config.difficulty);

        // Validate block
        const validation = newBlock.validate(previousBlock);
        if (!validation.valid) {
            throw new Error(`Invalid block: ${validation.errors.join(', ')}`);
        }

        // Add to chain
        this.chain.push(newBlock);

        // Update metrics
        const endTime = Date.now();
        this.updateMetrics(newBlock, endTime - startTime);

        this.emit('blockMined', newBlock);
        return newBlock;
    }

    /**
     * Get latest block
     */
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    /**
     * Get block by hash
     */
    getBlockByHash(hash) {
        return this.chain.find(block => block.hash === hash);
    }

    /**
     * Get block by index
     */
    getBlockByIndex(index) {
        return this.chain[index];
    }

    /**
     * Get transaction by ID
     */
    getTransactionById(transactionId) {
        for (const block of this.chain) {
            const transaction = block.transactions.find(tx => tx.id === transactionId);
            if (transaction) {
                return {
                    transaction: transaction,
                    block: block,
                    confirmations: this.chain.length - block.index
                };
            }
        }
        return null;
    }

    /**
     * Validate entire blockchain
     */
    validateChain() {
        const errors = [];

        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            const validation = currentBlock.validate(previousBlock);
            if (!validation.valid) {
                errors.push(`Block ${i}: ${validation.errors.join(', ')}`);
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Generate Merkle proof for transaction
     */
    generateTransactionProof(transactionId) {
        for (const block of this.chain) {
            const txIndex = block.transactions.findIndex(tx => tx.id === transactionId);
            if (txIndex !== -1) {
                return {
                    blockHash: block.hash,
                    blockIndex: block.index,
                    transactionIndex: txIndex,
                    merkleProof: block.merkleTree.generateProof(txIndex),
                    merkleRoot: block.merkleRoot
                };
            }
        }
        return null;
    }

    /**
     * Verify transaction proof
     */
    verifyTransactionProof(transactionId, proof) {
        const block = this.getBlockByHash(proof.blockHash);
        if (!block) {
            return false;
        }

        const transaction = block.transactions[proof.transactionIndex];
        if (!transaction || transaction.id !== transactionId) {
            return false;
        }

        const transactionHash = transaction.getHash();
        return block.merkleTree.verifyProof(transactionHash, proof.merkleProof, proof.merkleRoot);
    }

    /**
     * Anchor state to external blockchain (e.g., Ethereum)
     */
    async anchorToExternalChain(externalChainConfig) {
        const latestBlock = this.getLatestBlock();
        const anchorData = {
            blockHash: latestBlock.hash,
            blockIndex: latestBlock.index,
            stateRoot: latestBlock.stateRoot,
            timestamp: latestBlock.timestamp,
            networkId: this.config.networkId
        };

        // This would integrate with external blockchain APIs
        console.log('Anchoring to external chain:', anchorData);
        
        this.emit('stateAnchored', anchorData);
        return anchorData;
    }

    /**
     * Update performance metrics
     */
    updateMetrics(block, miningTime) {
        this.metrics.totalBlocks++;
        this.metrics.totalTransactions += block.transactions.length;
        
        // Update average block time
        const totalTime = this.metrics.averageBlockTime * (this.metrics.totalBlocks - 1) + miningTime;
        this.metrics.averageBlockTime = totalTime / this.metrics.totalBlocks;
        
        // Update state size
        this.metrics.stateSize = this.stateManager.getStats().stateSize;
        
        // Calculate network hash rate (simplified)
        this.metrics.networkHashRate = Math.pow(2, this.config.difficulty) / (miningTime / 1000);
    }

    /**
     * Get blockchain statistics
     */
    getStats() {
        return {
            chainLength: this.chain.length,
            pendingTransactions: this.pendingTransactions.length,
            stateStats: this.stateManager.getStats(),
            metrics: this.metrics,
            latestBlock: this.getLatestBlock()?.getStats(),
            networkInfo: {
                networkId: this.config.networkId,
                difficulty: this.config.difficulty,
                blockSize: this.config.blockSize
            }
        };
    }

    /**
     * Export blockchain data
     */
    exportChain() {
        return {
            config: this.config,
            chain: this.chain,
            state: Array.from(this.stateManager.state.entries()),
            metrics: this.metrics,
            exportedAt: new Date()
        };
    }

    /**
     * Import blockchain data
     */
    importChain(chainData) {
        // Validate imported data
        if (!chainData.chain || !Array.isArray(chainData.chain)) {
            throw new Error('Invalid chain data');
        }

        // Clear current chain
        this.chain = [];
        this.stateManager = new StateManager();

        // Import blocks
        for (const blockData of chainData.chain) {
            const block = Object.assign(new MSRBlock(), blockData);
            
            // Validate block
            const validation = block.validate(this.getLatestBlock());
            if (!validation.valid) {
                throw new Error(`Invalid imported block: ${validation.errors.join(', ')}`);
            }

            this.chain.push(block);

            // Update state
            for (const transaction of block.transactions) {
                this.stateManager.updateState(transaction);
            }
        }

        // Import state if provided
        if (chainData.state) {
            for (const [key, value] of chainData.state) {
                this.stateManager.state.set(key, value);
            }
        }

        this.emit('chainImported', chainData);
    }
}

/**
 * Fraud Detection System
 */
class FraudDetectionSystem {
    constructor() {
        this.suspiciousPatterns = new Map();
        this.blacklistedAddresses = new Set();
        this.transactionHistory = new Map();
    }

    /**
     * Check transaction for fraudulent patterns
     */
    async checkTransaction(transaction) {
        const checks = [
            this.checkBlacklist(transaction),
            this.checkVelocity(transaction),
            this.checkPattern(transaction),
            this.checkAmount(transaction)
        ];

        const results = await Promise.all(checks);
        const fraudulent = results.some(result => result.isFraudulent);

        return {
            isFraudulent: fraudulent,
            reason: results.filter(r => r.isFraudulent).map(r => r.reason).join(', '),
            riskScore: this.calculateRiskScore(results)
        };
    }

    /**
     * Check if address is blacklisted
     */
    checkBlacklist(transaction) {
        const isBlacklisted = this.blacklistedAddresses.has(transaction.sender) ||
                             this.blacklistedAddresses.has(transaction.recipient);

        return {
            isFraudulent: isBlacklisted,
            reason: isBlacklisted ? 'Blacklisted address' : null,
            riskScore: isBlacklisted ? 1.0 : 0.0
        };
    }

    /**
     * Check transaction velocity
     */
    checkVelocity(transaction) {
        if (!transaction.sender) {
            return { isFraudulent: false, reason: null, riskScore: 0.0 };
        }

        const history = this.transactionHistory.get(transaction.sender) || [];
        const recentTransactions = history.filter(tx => 
            Date.now() - tx.timestamp < 60000 // Last minute
        );

        const isHighVelocity = recentTransactions.length > 10;

        // Update history
        history.push({ timestamp: Date.now(), amount: transaction.data.amount || 0 });
        this.transactionHistory.set(transaction.sender, history);

        return {
            isFraudulent: isHighVelocity,
            reason: isHighVelocity ? 'High transaction velocity' : null,
            riskScore: Math.min(recentTransactions.length / 10, 1.0)
        };
    }

    /**
     * Check for suspicious patterns
     */
    checkPattern(transaction) {
        // Check for round number amounts (potential money laundering)
        if (transaction.data.amount && transaction.data.amount % 1000 === 0) {
            return {
                isFraudulent: false, // Not necessarily fraudulent, just suspicious
                reason: 'Round number amount',
                riskScore: 0.3
            };
        }

        return { isFraudulent: false, reason: null, riskScore: 0.0 };
    }

    /**
     * Check transaction amount
     */
    checkAmount(transaction) {
        const amount = transaction.data.amount || 0;
        const isLargeAmount = amount > 100000; // Configurable threshold

        return {
            isFraudulent: false, // Large amounts aren't fraudulent, just need review
            reason: isLargeAmount ? 'Large amount transaction' : null,
            riskScore: isLargeAmount ? 0.5 : 0.0
        };
    }

    /**
     * Calculate overall risk score
     */
    calculateRiskScore(results) {
        const totalScore = results.reduce((sum, result) => sum + result.riskScore, 0);
        return Math.min(totalScore / results.length, 1.0);
    }

    /**
     * Add address to blacklist
     */
    blacklistAddress(address, reason) {
        this.blacklistedAddresses.add(address);
        console.log(`Address ${address} blacklisted: ${reason}`);
    }

    /**
     * Remove address from blacklist
     */
    removeFromBlacklist(address) {
        this.blacklistedAddresses.delete(address);
        console.log(`Address ${address} removed from blacklist`);
    }
}

/**
 * Consensus Engine (Simplified Proof of Stake)
 */
class ConsensusEngine {
    constructor() {
        this.validators = new Map();
        this.stakes = new Map();
        this.currentValidator = null;
    }

    /**
     * Register validator
     */
    registerValidator(address, stake) {
        this.validators.set(address, {
            address: address,
            stake: stake,
            reputation: 1.0,
            lastValidation: null
        });

        this.stakes.set(address, stake);
    }

    /**
     * Select validator for next block
     */
    selectValidator() {
        const totalStake = Array.from(this.stakes.values()).reduce((sum, stake) => sum + stake, 0);
        const random = Math.random() * totalStake;
        
        let currentSum = 0;
        for (const [address, stake] of this.stakes.entries()) {
            currentSum += stake;
            if (random <= currentSum) {
                this.currentValidator = address;
                return address;
            }
        }

        return null;
    }

    /**
     * Validate block proposal
     */
    validateProposal(block, proposer) {
        const validator = this.validators.get(proposer);
        if (!validator) {
            return false;
        }

        // Update validator reputation based on block validity
        const validation = block.validate();
        if (validation.valid) {
            validator.reputation = Math.min(validator.reputation + 0.01, 1.0);
        } else {
            validator.reputation = Math.max(validator.reputation - 0.1, 0.0);
        }

        validator.lastValidation = new Date();
        return validation.valid;
    }
}

// Export factory function
export function createMSRBlockchain(config = {}) {
    return new MSRBlockchain(config);
}

// Export individual classes for advanced usage
export {
    MerkleTree,
    MSRTransaction,
    MSRBlock,
    StateManager,
    FraudDetectionSystem,
    ConsensusEngine
};

// Example usage
export const exampleUsage = {
    basic: () => {
        const blockchain = createMSRBlockchain({
            difficulty: 2,
            blockSize: 10,
            networkId: 'tamv-testnet'
        });

        // Create identity transaction
        const identityTx = new MSRTransaction({
            type: 'identity',
            data: {
                action: 'create',
                did: 'did:tamv:abc123',
                publicKey: 'public_key_here'
            }
        });

        blockchain.addTransaction(identityTx);
        return blockchain;
    },

    economic: (blockchain) => {
        // Create economic transaction
        const economicTx = new MSRTransaction({
            type: 'economic',
            data: {
                action: 'transfer',
                amount: 100,
                currency: 'TAMV'
            },
            sender: 'did:tamv:sender',
            recipient: 'did:tamv:recipient'
        });

        return blockchain.addTransaction(economicTx);
    },

    governance: (blockchain) => {
        // Create governance transaction
        const governanceTx = new MSRTransaction({
            type: 'governance',
            data: {
                proposalId: 'prop_001',
                vote: 'yes'
            },
            sender: 'did:tamv:voter'
        });

        return blockchain.addTransaction(governanceTx);
    }
};

export default MSRBlockchain;