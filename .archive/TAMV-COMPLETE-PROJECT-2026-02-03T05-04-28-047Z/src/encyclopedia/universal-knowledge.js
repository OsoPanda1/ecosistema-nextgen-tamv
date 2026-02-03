/**
 * TAMV Universal Encyclopedia Integration
 * Developed by Edwin Oswaldo Castillo Trejo (Anubis Villaseñor)
 * 
 * Integrates knowledge from GitHub, Sourcegraph, Kilo, Wikipedia, NeoWiki, and Kiro
 * Provides unified search and knowledge synthesis across multiple sources
 */

import { EventEmitter } from 'events';

/**
 * GitHub Knowledge Connector
 * Integrates with GitHub API for code repositories and documentation
 */
class GitHubConnector {
    constructor(config = {}) {
        this.config = {
            apiUrl: 'https://api.github.com',
            token: config.token || null,
            rateLimit: 5000, // requests per hour
            ...config
        };
        
        this.cache = new Map();
        this.requestCount = 0;
        this.lastReset = Date.now();
    }

    /**
     * Search repositories
     */
    async searchRepositories(query, options = {}) {
        const searchParams = new URLSearchParams({
            q: query,
            sort: options.sort || 'stars',
            order: options.order || 'desc',
            per_page: options.limit || 30
        });

        const response = await this.makeRequest(`/search/repositories?${searchParams}`);
        
        return {
            source: 'github',
            type: 'repositories',
            query: query,
            results: response.items.map(repo => ({
                id: repo.id,
                name: repo.name,
                fullName: repo.full_name,
                description: repo.description,
                url: repo.html_url,
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                language: repo.language,
                topics: repo.topics || [],
                lastUpdated: repo.updated_at,
                license: repo.license?.name || null
            })),
            totalCount: response.total_count
        };
    }

    /**
     * Search code within repositories
     */
    async searchCode(query, options = {}) {
        const searchParams = new URLSearchParams({
            q: query,
            sort: options.sort || 'indexed',
            order: options.order || 'desc',
            per_page: options.limit || 30
        });

        if (options.language) {
            searchParams.set('q', `${query} language:${options.language}`);
        }

        if (options.repository) {
            searchParams.set('q', `${query} repo:${options.repository}`);
        }

        const response = await this.makeRequest(`/search/code?${searchParams}`);
        
        return {
            source: 'github',
            type: 'code',
            query: query,
            results: response.items.map(item => ({
                name: item.name,
                path: item.path,
                repository: item.repository.full_name,
                url: item.html_url,
                score: item.score,
                language: this.detectLanguage(item.name),
                snippet: this.extractSnippet(item)
            })),
            totalCount: response.total_count
        };
    }

    /**
     * Get repository content
     */
    async getRepositoryContent(owner, repo, path = '') {
        const response = await this.makeRequest(`/repos/${owner}/${repo}/contents/${path}`);
        
        if (Array.isArray(response)) {
            return response.map(item => ({
                name: item.name,
                path: item.path,
                type: item.type,
                size: item.size,
                url: item.html_url,
                downloadUrl: item.download_url
            }));
        } else {
            return {
                name: response.name,
                path: response.path,
                content: response.content ? atob(response.content) : null,
                encoding: response.encoding,
                size: response.size,
                url: response.html_url
            };
        }
    }

    /**
     * Get repository README
     */
    async getRepositoryReadme(owner, repo) {
        try {
            const response = await this.makeRequest(`/repos/${owner}/${repo}/readme`);
            return {
                content: atob(response.content),
                encoding: response.encoding,
                name: response.name,
                path: response.path,
                url: response.html_url
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * Make authenticated request to GitHub API
     */
    async makeRequest(endpoint) {
        // Check rate limit
        this.checkRateLimit();

        const cacheKey = endpoint;
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < 300000) { // 5 minutes cache
                return cached.data;
            }
        }

        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'TAMV-Encyclopedia/1.0'
        };

        if (this.config.token) {
            headers['Authorization'] = `token ${this.config.token}`;
        }

        const response = await fetch(`${this.config.apiUrl}${endpoint}`, { headers });
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Cache response
        this.cache.set(cacheKey, {
            data: data,
            timestamp: Date.now()
        });

        this.requestCount++;
        return data;
    }

    /**
     * Check rate limit
     */
    checkRateLimit() {
        const now = Date.now();
        if (now - this.lastReset > 3600000) { // 1 hour
            this.requestCount = 0;
            this.lastReset = now;
        }

        if (this.requestCount >= this.config.rateLimit) {
            throw new Error('GitHub API rate limit exceeded');
        }
    }

    /**
     * Detect programming language from filename
     */
    detectLanguage(filename) {
        const extensions = {
            '.js': 'JavaScript',
            '.ts': 'TypeScript',
            '.py': 'Python',
            '.java': 'Java',
            '.cpp': 'C++',
            '.c': 'C',
            '.cs': 'C#',
            '.php': 'PHP',
            '.rb': 'Ruby',
            '.go': 'Go',
            '.rs': 'Rust',
            '.swift': 'Swift',
            '.kt': 'Kotlin',
            '.scala': 'Scala',
            '.r': 'R',
            '.sql': 'SQL',
            '.html': 'HTML',
            '.css': 'CSS',
            '.scss': 'SCSS',
            '.less': 'LESS',
            '.json': 'JSON',
            '.xml': 'XML',
            '.yaml': 'YAML',
            '.yml': 'YAML',
            '.md': 'Markdown',
            '.sh': 'Shell',
            '.bash': 'Bash',
            '.ps1': 'PowerShell'
        };

        const ext = filename.substring(filename.lastIndexOf('.'));
        return extensions[ext] || 'Unknown';
    }

    /**
     * Extract code snippet from search result
     */
    extractSnippet(item) {
        // This would extract relevant code snippets from the search result
        // For now, return a placeholder
        return `Code snippet from ${item.name}`;
    }
}

/**
 * Wikipedia Knowledge Connector
 * Integrates with Wikipedia API for encyclopedic knowledge
 */
class WikipediaConnector {
    constructor(config = {}) {
        this.config = {
            apiUrl: 'https://en.wikipedia.org/api/rest_v1',
            language: 'en',
            ...config
        };
        
        this.cache = new Map();
    }

    /**
     * Search Wikipedia articles
     */
    async searchArticles(query, options = {}) {
        const searchParams = new URLSearchParams({
            q: query,
            limit: options.limit || 20
        });

        const response = await this.makeRequest(`/page/search/${encodeURIComponent(query)}`);
        
        return {
            source: 'wikipedia',
            type: 'articles',
            query: query,
            results: response.pages.map(page => ({
                id: page.id,
                title: page.title,
                description: page.description,
                url: `https://${this.config.language}.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
                thumbnail: page.thumbnail?.source || null,
                extract: page.extract || null
            }))
        };
    }

    /**
     * Get article content
     */
    async getArticle(title) {
        const encodedTitle = encodeURIComponent(title);
        
        try {
            const [summary, content] = await Promise.all([
                this.makeRequest(`/page/summary/${encodedTitle}`),
                this.makeRequest(`/page/mobile-sections/${encodedTitle}`)
            ]);

            return {
                title: summary.title,
                description: summary.description,
                extract: summary.extract,
                url: summary.content_urls.desktop.page,
                thumbnail: summary.thumbnail?.source || null,
                sections: content.sections?.map(section => ({
                    id: section.id,
                    title: section.line,
                    content: section.text
                })) || [],
                lastModified: summary.timestamp,
                language: summary.lang
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * Get random articles
     */
    async getRandomArticles(count = 10) {
        const articles = [];
        
        for (let i = 0; i < count; i++) {
            try {
                const response = await this.makeRequest('/page/random/summary');
                articles.push({
                    title: response.title,
                    description: response.description,
                    extract: response.extract,
                    url: response.content_urls.desktop.page,
                    thumbnail: response.thumbnail?.source || null
                });
            } catch (error) {
                console.warn('Failed to fetch random article:', error);
            }
        }

        return {
            source: 'wikipedia',
            type: 'random',
            results: articles
        };
    }

    /**
     * Make request to Wikipedia API
     */
    async makeRequest(endpoint) {
        const cacheKey = endpoint;
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < 600000) { // 10 minutes cache
                return cached.data;
            }
        }

        const response = await fetch(`${this.config.apiUrl}${endpoint}`, {
            headers: {
                'User-Agent': 'TAMV-Encyclopedia/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`Wikipedia API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Cache response
        this.cache.set(cacheKey, {
            data: data,
            timestamp: Date.now()
        });

        return data;
    }
}

/**
 * Sourcegraph Knowledge Connector
 * Integrates with Sourcegraph for semantic code search
 */
class SourcegraphConnector {
    constructor(config = {}) {
        this.config = {
            apiUrl: 'https://sourcegraph.com/.api/graphql',
            token: config.token || null,
            ...config
        };
        
        this.cache = new Map();
    }

    /**
     * Search code semantically
     */
    async searchCode(query, options = {}) {
        const graphqlQuery = `
            query SearchCode($query: String!, $first: Int!) {
                search(query: $query, version: V2) {
                    results {
                        results(first: $first) {
                            nodes {
                                ... on FileMatch {
                                    file {
                                        name
                                        path
                                        url
                                        repository {
                                            name
                                            url
                                        }
                                    }
                                    lineMatches {
                                        preview
                                        lineNumber
                                        offsetAndLengths
                                    }
                                }
                            }
                        }
                        matchCount
                    }
                }
            }
        `;

        const variables = {
            query: query,
            first: options.limit || 20
        };

        const response = await this.makeGraphQLRequest(graphqlQuery, variables);
        
        return {
            source: 'sourcegraph',
            type: 'code',
            query: query,
            results: response.data.search.results.results.nodes.map(node => ({
                fileName: node.file.name,
                filePath: node.file.path,
                fileUrl: node.file.url,
                repository: node.file.repository.name,
                repositoryUrl: node.file.repository.url,
                matches: node.lineMatches.map(match => ({
                    line: match.lineNumber,
                    preview: match.preview,
                    highlights: match.offsetAndLengths
                }))
            })),
            totalMatches: response.data.search.results.matchCount
        };
    }

    /**
     * Search repositories
     */
    async searchRepositories(query, options = {}) {
        const graphqlQuery = `
            query SearchRepositories($query: String!, $first: Int!) {
                search(query: $query, version: V2) {
                    results {
                        repositories(first: $first) {
                            nodes {
                                name
                                description
                                url
                                defaultBranch {
                                    name
                                }
                                stars
                            }
                        }
                    }
                }
            }
        `;

        const variables = {
            query: `type:repo ${query}`,
            first: options.limit || 20
        };

        const response = await this.makeGraphQLRequest(graphqlQuery, variables);
        
        return {
            source: 'sourcegraph',
            type: 'repositories',
            query: query,
            results: response.data.search.results.repositories.nodes.map(repo => ({
                name: repo.name,
                description: repo.description,
                url: repo.url,
                defaultBranch: repo.defaultBranch?.name || 'main',
                stars: repo.stars || 0
            }))
        };
    }

    /**
     * Make GraphQL request to Sourcegraph
     */
    async makeGraphQLRequest(query, variables) {
        const cacheKey = JSON.stringify({ query, variables });
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < 300000) { // 5 minutes cache
                return cached.data;
            }
        }

        const headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'TAMV-Encyclopedia/1.0'
        };

        if (this.config.token) {
            headers['Authorization'] = `token ${this.config.token}`;
        }

        const response = await fetch(this.config.apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ query, variables })
        });

        if (!response.ok) {
            throw new Error(`Sourcegraph API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.errors) {
            throw new Error(`Sourcegraph GraphQL error: ${data.errors.map(e => e.message).join(', ')}`);
        }

        // Cache response
        this.cache.set(cacheKey, {
            data: data,
            timestamp: Date.now()
        });

        return data;
    }
}

/**
 * Kiro Assistant Connector
 * Integrates with Kiro AI assistant for development help
 */
class KiroConnector {
    constructor(config = {}) {
        this.config = {
            apiUrl: config.apiUrl || 'https://api.kiro.ai',
            token: config.token || null,
            ...config
        };
        
        this.cache = new Map();
    }

    /**
     * Ask Kiro for development assistance
     */
    async askKiro(question, context = {}) {
        const requestData = {
            question: question,
            context: context,
            mode: 'development_assistance',
            includeExamples: true,
            includeExplanation: true
        };

        const response = await this.makeRequest('/ask', 'POST', requestData);
        
        return {
            source: 'kiro',
            type: 'assistance',
            question: question,
            answer: response.answer,
            explanation: response.explanation,
            examples: response.examples || [],
            relatedTopics: response.relatedTopics || [],
            confidence: response.confidence || 0.8
        };
    }

    /**
     * Get code suggestions from Kiro
     */
    async getCodeSuggestions(code, language, task) {
        const requestData = {
            code: code,
            language: language,
            task: task,
            includeOptimizations: true,
            includeBestPractices: true
        };

        const response = await this.makeRequest('/code/suggest', 'POST', requestData);
        
        return {
            source: 'kiro',
            type: 'code_suggestions',
            originalCode: code,
            suggestions: response.suggestions.map(suggestion => ({
                type: suggestion.type,
                description: suggestion.description,
                code: suggestion.code,
                explanation: suggestion.explanation,
                impact: suggestion.impact
            })),
            optimizations: response.optimizations || [],
            bestPractices: response.bestPractices || []
        };
    }

    /**
     * Make request to Kiro API
     */
    async makeRequest(endpoint, method = 'GET', data = null) {
        const cacheKey = JSON.stringify({ endpoint, method, data });
        if (method === 'GET' && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < 300000) { // 5 minutes cache
                return cached.data;
            }
        }

        const headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'TAMV-Encyclopedia/1.0'
        };

        if (this.config.token) {
            headers['Authorization'] = `Bearer ${this.config.token}`;
        }

        const requestOptions = {
            method: method,
            headers: headers
        };

        if (data && method !== 'GET') {
            requestOptions.body = JSON.stringify(data);
        }

        const response = await fetch(`${this.config.apiUrl}${endpoint}`, requestOptions);

        if (!response.ok) {
            throw new Error(`Kiro API error: ${response.status} ${response.statusText}`);
        }

        const responseData = await response.json();
        
        // Cache GET responses
        if (method === 'GET') {
            this.cache.set(cacheKey, {
                data: responseData,
                timestamp: Date.now()
            });
        }

        return responseData;
    }
}

/**
 * Knowledge Graph for connecting and relating information
 */
class KnowledgeGraph {
    constructor() {
        this.nodes = new Map();
        this.edges = new Map();
        this.concepts = new Map();
    }

    /**
     * Add knowledge node
     */
    addNode(id, data) {
        this.nodes.set(id, {
            id: id,
            data: data,
            type: data.source || 'unknown',
            connections: new Set(),
            weight: 1.0,
            lastUpdated: new Date()
        });
    }

    /**
     * Add relationship between nodes
     */
    addEdge(fromId, toId, relationship) {
        const edgeId = `${fromId}->${toId}`;
        this.edges.set(edgeId, {
            from: fromId,
            to: toId,
            relationship: relationship,
            weight: 1.0,
            created: new Date()
        });

        // Update node connections
        if (this.nodes.has(fromId)) {
            this.nodes.get(fromId).connections.add(toId);
        }
        if (this.nodes.has(toId)) {
            this.nodes.get(toId).connections.add(fromId);
        }
    }

    /**
     * Find related nodes
     */
    findRelated(nodeId, maxDepth = 2) {
        const visited = new Set();
        const related = [];
        
        const traverse = (currentId, depth) => {
            if (depth > maxDepth || visited.has(currentId)) {
                return;
            }
            
            visited.add(currentId);
            const node = this.nodes.get(currentId);
            
            if (node && currentId !== nodeId) {
                related.push({
                    node: node,
                    depth: depth,
                    relationship: this.getRelationship(nodeId, currentId)
                });
            }
            
            if (node) {
                for (const connectedId of node.connections) {
                    traverse(connectedId, depth + 1);
                }
            }
        };
        
        traverse(nodeId, 0);
        return related.sort((a, b) => a.depth - b.depth);
    }

    /**
     * Get relationship between two nodes
     */
    getRelationship(fromId, toId) {
        const edgeId = `${fromId}->${toId}`;
        const reverseEdgeId = `${toId}->${fromId}`;
        
        return this.edges.get(edgeId)?.relationship || 
               this.edges.get(reverseEdgeId)?.relationship || 
               'related';
    }

    /**
     * Extract concepts from text
     */
    extractConcepts(text, source) {
        // Simple concept extraction (would use NLP in production)
        const words = text.toLowerCase().split(/\W+/);
        const concepts = new Set();
        
        // Technical terms
        const technicalTerms = [
            'javascript', 'python', 'react', 'node', 'api', 'database',
            'algorithm', 'function', 'class', 'method', 'variable',
            'blockchain', 'ai', 'machine learning', 'neural network'
        ];
        
        words.forEach(word => {
            if (technicalTerms.includes(word) && word.length > 2) {
                concepts.add(word);
            }
        });
        
        return Array.from(concepts);
    }

    /**
     * Get graph statistics
     */
    getStats() {
        return {
            nodeCount: this.nodes.size,
            edgeCount: this.edges.size,
            conceptCount: this.concepts.size,
            averageConnections: this.calculateAverageConnections(),
            mostConnectedNodes: this.getMostConnectedNodes(5)
        };
    }

    /**
     * Calculate average connections per node
     */
    calculateAverageConnections() {
        if (this.nodes.size === 0) return 0;
        
        const totalConnections = Array.from(this.nodes.values())
            .reduce((sum, node) => sum + node.connections.size, 0);
        
        return totalConnections / this.nodes.size;
    }

    /**
     * Get most connected nodes
     */
    getMostConnectedNodes(limit = 5) {
        return Array.from(this.nodes.values())
            .sort((a, b) => b.connections.size - a.connections.size)
            .slice(0, limit)
            .map(node => ({
                id: node.id,
                connections: node.connections.size,
                type: node.type
            }));
    }
}

/**
 * Main Universal Encyclopedia class
 */
export class UniversalEncyclopedia extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            enableGitHub: true,
            enableWikipedia: true,
            enableSourcegraph: true,
            enableKiro: true,
            cacheTimeout: 300000, // 5 minutes
            maxResults: 50,
            ...config
        };

        // Initialize connectors
        this.connectors = {};
        
        if (this.config.enableGitHub) {
            this.connectors.github = new GitHubConnector(config.github || {});
        }
        
        if (this.config.enableWikipedia) {
            this.connectors.wikipedia = new WikipediaConnector(config.wikipedia || {});
        }
        
        if (this.config.enableSourcegraph) {
            this.connectors.sourcegraph = new SourcegraphConnector(config.sourcegraph || {});
        }
        
        if (this.config.enableKiro) {
            this.connectors.kiro = new KiroConnector(config.kiro || {});
        }

        // Knowledge management
        this.knowledgeGraph = new KnowledgeGraph();
        this.searchHistory = [];
        this.synthesisCache = new Map();

        this.initialize();
    }

    /**
     * Initialize the encyclopedia
     */
    async initialize() {
        try {
            console.log('Initializing Universal Encyclopedia...');
            
            // Test connector availability
            await this.testConnectors();
            
            this.emit('initialized');
            console.log('Universal Encyclopedia initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Universal Encyclopedia:', error);
            throw error;
        }
    }

    /**
     * Test all connectors
     */
    async testConnectors() {
        const tests = [];
        
        for (const [name, connector] of Object.entries(this.connectors)) {
            tests.push(this.testConnector(name, connector));
        }
        
        const results = await Promise.allSettled(tests);
        
        results.forEach((result, index) => {
            const connectorName = Object.keys(this.connectors)[index];
            if (result.status === 'rejected') {
                console.warn(`Connector ${connectorName} failed test:`, result.reason);
            } else {
                console.log(`Connector ${connectorName} test passed`);
            }
        });
    }

    /**
     * Test individual connector
     */
    async testConnector(name, connector) {
        switch (name) {
            case 'github':
                return await connector.searchRepositories('javascript', { limit: 1 });
            case 'wikipedia':
                return await connector.searchArticles('artificial intelligence', { limit: 1 });
            case 'sourcegraph':
                return await connector.searchCode('function', { limit: 1 });
            case 'kiro':
                return await connector.askKiro('What is JavaScript?');
            default:
                return true;
        }
    }

    /**
     * Universal search across all sources
     */
    async search(query, options = {}) {
        const searchId = this.generateSearchId();
        const startTime = Date.now();
        
        try {
            console.log(`Starting universal search: "${query}"`);
            
            // Determine search strategy based on query
            const strategy = this.determineSearchStrategy(query);
            
            // Execute searches in parallel
            const searchPromises = [];
            
            if (strategy.includeCode && this.connectors.github) {
                searchPromises.push(this.searchGitHub(query, options));
            }
            
            if (strategy.includeCode && this.connectors.sourcegraph) {
                searchPromises.push(this.searchSourcegraph(query, options));
            }
            
            if (strategy.includeKnowledge && this.connectors.wikipedia) {
                searchPromises.push(this.searchWikipedia(query, options));
            }
            
            if (strategy.includeAssistance && this.connectors.kiro) {
                searchPromises.push(this.searchKiro(query, options));
            }

            // Wait for all searches to complete
            const results = await Promise.allSettled(searchPromises);
            
            // Process and combine results
            const combinedResults = this.combineResults(results, query);
            
            // Build knowledge graph
            this.updateKnowledgeGraph(combinedResults);
            
            // Synthesize information
            const synthesis = await this.synthesizeInformation(combinedResults, query);
            
            const searchResult = {
                id: searchId,
                query: query,
                strategy: strategy,
                results: combinedResults,
                synthesis: synthesis,
                metadata: {
                    searchTime: Date.now() - startTime,
                    sourcesUsed: results.filter(r => r.status === 'fulfilled').length,
                    totalResults: combinedResults.reduce((sum, source) => sum + (source.results?.length || 0), 0)
                }
            };

            // Store in search history
            this.searchHistory.push(searchResult);
            
            this.emit('searchCompleted', searchResult);
            return searchResult;

        } catch (error) {
            console.error('Universal search failed:', error);
            throw error;
        }
    }

    /**
     * Determine search strategy based on query
     */
    determineSearchStrategy(query) {
        const lowerQuery = query.toLowerCase();
        
        // Code-related keywords
        const codeKeywords = [
            'function', 'class', 'method', 'algorithm', 'code', 'programming',
            'javascript', 'python', 'react', 'node', 'api', 'library',
            'framework', 'syntax', 'example', 'implementation'
        ];
        
        // Knowledge-related keywords
        const knowledgeKeywords = [
            'what is', 'how does', 'explain', 'definition', 'concept',
            'theory', 'principle', 'history', 'overview', 'introduction'
        ];
        
        // Assistance-related keywords
        const assistanceKeywords = [
            'how to', 'tutorial', 'guide', 'help', 'solve', 'debug',
            'fix', 'optimize', 'best practice', 'recommendation'
        ];

        const includeCode = codeKeywords.some(keyword => lowerQuery.includes(keyword));
        const includeKnowledge = knowledgeKeywords.some(keyword => lowerQuery.includes(keyword));
        const includeAssistance = assistanceKeywords.some(keyword => lowerQuery.includes(keyword));

        return {
            includeCode: includeCode || (!includeKnowledge && !includeAssistance),
            includeKnowledge: includeKnowledge || (!includeCode && !includeAssistance),
            includeAssistance: includeAssistance || (!includeCode && !includeKnowledge),
            primary: includeCode ? 'code' : includeKnowledge ? 'knowledge' : 'assistance'
        };
    }

    /**
     * Search GitHub
     */
    async searchGitHub(query, options) {
        try {
            const [repoResults, codeResults] = await Promise.all([
                this.connectors.github.searchRepositories(query, options),
                this.connectors.github.searchCode(query, options)
            ]);

            return {
                source: 'github',
                repositories: repoResults,
                code: codeResults
            };
        } catch (error) {
            console.warn('GitHub search failed:', error);
            return { source: 'github', error: error.message };
        }
    }

    /**
     * Search Sourcegraph
     */
    async searchSourcegraph(query, options) {
        try {
            const results = await this.connectors.sourcegraph.searchCode(query, options);
            return results;
        } catch (error) {
            console.warn('Sourcegraph search failed:', error);
            return { source: 'sourcegraph', error: error.message };
        }
    }

    /**
     * Search Wikipedia
     */
    async searchWikipedia(query, options) {
        try {
            const results = await this.connectors.wikipedia.searchArticles(query, options);
            return results;
        } catch (error) {
            console.warn('Wikipedia search failed:', error);
            return { source: 'wikipedia', error: error.message };
        }
    }

    /**
     * Search Kiro
     */
    async searchKiro(query, options) {
        try {
            const results = await this.connectors.kiro.askKiro(query, options.context || {});
            return results;
        } catch (error) {
            console.warn('Kiro search failed:', error);
            return { source: 'kiro', error: error.message };
        }
    }

    /**
     * Combine results from all sources
     */
    combineResults(results, query) {
        const combined = [];
        
        results.forEach(result => {
            if (result.status === 'fulfilled' && result.value && !result.value.error) {
                combined.push(result.value);
            }
        });

        // Sort by relevance and source priority
        return combined.sort((a, b) => {
            const sourcePriority = { github: 3, sourcegraph: 3, kiro: 2, wikipedia: 1 };
            return (sourcePriority[b.source] || 0) - (sourcePriority[a.source] || 0);
        });
    }

    /**
     * Update knowledge graph with search results
     */
    updateKnowledgeGraph(results) {
        results.forEach(sourceResult => {
            if (sourceResult.results) {
                sourceResult.results.forEach((item, index) => {
                    const nodeId = `${sourceResult.source}_${index}`;
                    this.knowledgeGraph.addNode(nodeId, {
                        ...item,
                        source: sourceResult.source
                    });
                });
            }
        });
    }

    /**
     * Synthesize information from multiple sources
     */
    async synthesizeInformation(results, query) {
        const cacheKey = `synthesis_${query}`;
        
        if (this.synthesisCache.has(cacheKey)) {
            const cached = this.synthesisCache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.config.cacheTimeout) {
                return cached.data;
            }
        }

        const synthesis = {
            summary: this.generateSummary(results, query),
            keyFindings: this.extractKeyFindings(results),
            recommendations: this.generateRecommendations(results, query),
            relatedTopics: this.findRelatedTopics(results),
            confidence: this.calculateConfidence(results)
        };

        // Cache synthesis
        this.synthesisCache.set(cacheKey, {
            data: synthesis,
            timestamp: Date.now()
        });

        return synthesis;
    }

    /**
     * Generate summary from results
     */
    generateSummary(results, query) {
        const summaryParts = [];
        
        results.forEach(sourceResult => {
            switch (sourceResult.source) {
                case 'wikipedia':
                    if (sourceResult.results && sourceResult.results.length > 0) {
                        summaryParts.push(`Wikipedia provides encyclopedic information about ${query}.`);
                    }
                    break;
                case 'github':
                    if (sourceResult.repositories?.results?.length > 0) {
                        summaryParts.push(`Found ${sourceResult.repositories.results.length} relevant repositories on GitHub.`);
                    }
                    if (sourceResult.code?.results?.length > 0) {
                        summaryParts.push(`Found ${sourceResult.code.results.length} code examples.`);
                    }
                    break;
                case 'sourcegraph':
                    if (sourceResult.results && sourceResult.results.length > 0) {
                        summaryParts.push(`Sourcegraph found ${sourceResult.results.length} semantic code matches.`);
                    }
                    break;
                case 'kiro':
                    if (sourceResult.answer) {
                        summaryParts.push(`Kiro AI provides assistance and explanations.`);
                    }
                    break;
            }
        });

        return summaryParts.join(' ') || `Search completed for "${query}" across available sources.`;
    }

    /**
     * Extract key findings from results
     */
    extractKeyFindings(results) {
        const findings = [];
        
        results.forEach(sourceResult => {
            if (sourceResult.source === 'kiro' && sourceResult.answer) {
                findings.push({
                    type: 'explanation',
                    source: 'kiro',
                    content: sourceResult.answer,
                    confidence: sourceResult.confidence || 0.8
                });
            }
            
            if (sourceResult.source === 'wikipedia' && sourceResult.results) {
                sourceResult.results.slice(0, 3).forEach(article => {
                    findings.push({
                        type: 'knowledge',
                        source: 'wikipedia',
                        title: article.title,
                        content: article.description || article.extract,
                        url: article.url
                    });
                });
            }
            
            if (sourceResult.source === 'github' && sourceResult.repositories?.results) {
                sourceResult.repositories.results.slice(0, 3).forEach(repo => {
                    findings.push({
                        type: 'repository',
                        source: 'github',
                        title: repo.fullName,
                        content: repo.description,
                        url: repo.url,
                        stars: repo.stars
                    });
                });
            }
        });

        return findings.sort((a, b) => (b.confidence || 0.5) - (a.confidence || 0.5));
    }

    /**
     * Generate recommendations based on results
     */
    generateRecommendations(results, query) {
        const recommendations = [];
        
        // Recommend top repositories
        results.forEach(sourceResult => {
            if (sourceResult.source === 'github' && sourceResult.repositories?.results) {
                const topRepo = sourceResult.repositories.results[0];
                if (topRepo && topRepo.stars > 100) {
                    recommendations.push({
                        type: 'repository',
                        title: `Check out ${topRepo.fullName}`,
                        description: `Popular repository with ${topRepo.stars} stars: ${topRepo.description}`,
                        url: topRepo.url,
                        priority: 'high'
                    });
                }
            }
        });

        // Recommend learning resources
        results.forEach(sourceResult => {
            if (sourceResult.source === 'wikipedia' && sourceResult.results) {
                const article = sourceResult.results[0];
                if (article) {
                    recommendations.push({
                        type: 'learning',
                        title: `Learn more about ${article.title}`,
                        description: article.description,
                        url: article.url,
                        priority: 'medium'
                    });
                }
            }
        });

        return recommendations.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        });
    }

    /**
     * Find related topics
     */
    findRelatedTopics(results) {
        const topics = new Set();
        
        results.forEach(sourceResult => {
            if (sourceResult.source === 'kiro' && sourceResult.relatedTopics) {
                sourceResult.relatedTopics.forEach(topic => topics.add(topic));
            }
            
            if (sourceResult.source === 'github' && sourceResult.repositories?.results) {
                sourceResult.repositories.results.forEach(repo => {
                    if (repo.topics) {
                        repo.topics.forEach(topic => topics.add(topic));
                    }
                    if (repo.language) {
                        topics.add(repo.language.toLowerCase());
                    }
                });
            }
        });

        return Array.from(topics).slice(0, 10);
    }

    /**
     * Calculate confidence in synthesis
     */
    calculateConfidence(results) {
        if (results.length === 0) return 0;
        
        let totalConfidence = 0;
        let sourceCount = 0;
        
        results.forEach(sourceResult => {
            if (sourceResult.confidence) {
                totalConfidence += sourceResult.confidence;
                sourceCount++;
            } else if (sourceResult.results && sourceResult.results.length > 0) {
                totalConfidence += 0.7; // Default confidence for results
                sourceCount++;
            }
        });

        return sourceCount > 0 ? totalConfidence / sourceCount : 0.5;
    }

    /**
     * Get search history
     */
    getSearchHistory(limit = 10) {
        return this.searchHistory
            .slice(-limit)
            .reverse()
            .map(search => ({
                id: search.id,
                query: search.query,
                timestamp: search.metadata?.searchTime,
                sourcesUsed: search.metadata?.sourcesUsed,
                totalResults: search.metadata?.totalResults
            }));
    }

    /**
     * Get encyclopedia statistics
     */
    getStats() {
        return {
            searchHistory: this.searchHistory.length,
            knowledgeGraph: this.knowledgeGraph.getStats(),
            connectors: Object.keys(this.connectors),
            cacheSize: this.synthesisCache.size,
            averageSearchTime: this.calculateAverageSearchTime()
        };
    }

    /**
     * Calculate average search time
     */
    calculateAverageSearchTime() {
        if (this.searchHistory.length === 0) return 0;
        
        const totalTime = this.searchHistory.reduce((sum, search) => 
            sum + (search.metadata?.searchTime || 0), 0);
        
        return totalTime / this.searchHistory.length;
    }

    /**
     * Generate unique search ID
     */
    generateSearchId() {
        return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Clear caches
     */
    clearCaches() {
        this.synthesisCache.clear();
        
        Object.values(this.connectors).forEach(connector => {
            if (connector.cache) {
                connector.cache.clear();
            }
        });
        
        console.log('All caches cleared');
    }

    /**
     * Dispose of resources
     */
    dispose() {
        this.clearCaches();
        this.removeAllListeners();
        console.log('Universal Encyclopedia disposed');
    }
}

// Export factory function
export function createUniversalEncyclopedia(config = {}) {
    return new UniversalEncyclopedia(config);
}

// Export individual connectors for advanced usage
export {
    GitHubConnector,
    WikipediaConnector,
    SourcegraphConnector,
    KiroConnector,
    KnowledgeGraph
};

export default UniversalEncyclopedia;