/**
 * API Cache Manager - Gestionnaire de cache pour les requêtes API
 * Optimise les performances en mettant en cache les réponses API
 */
class APICacheManager {
    constructor(options = {}) {
        this.cache = new Map();
        this.config = {
            defaultTTL: options.defaultTTL || 5 * 60 * 1000, // 5 minutes
            maxSize: options.maxSize || 100,
            storageType: options.storageType || 'memory', // 'memory' ou 'localStorage'
            keyPrefix: options.keyPrefix || 'api_cache_',
            enableCompression: options.enableCompression || false,
            ...options
        };
        
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            evictions: 0
        };
        
        this.init();
    }

    init() {
        // Charger le cache depuis localStorage si configuré
        if (this.config.storageType === 'localStorage') {
            this.loadFromStorage();
        }
        
        // Nettoyer le cache périodiquement
        this.startCleanupInterval();
        
        // Écouter les événements de fermeture pour sauvegarder
        if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', () => this.saveToStorage());
        }
    }

    // === MÉTHODES PRINCIPALES ===
    
    get(key) {
        const cacheKey = this.generateKey(key);
        const entry = this.getEntry(cacheKey);
        
        if (!entry) {
            this.stats.misses++;
            return null;
        }
        
        // Vérifier l'expiration
        if (this.isExpired(entry)) {
            this.delete(key);
            this.stats.misses++;
            return null;
        }
        
        // Mettre à jour l'accès
        entry.lastAccessed = Date.now();
        entry.accessCount++;
        
        this.stats.hits++;
        return this.deserializeData(entry.data);
    }

    set(key, data, ttl = null) {
        const cacheKey = this.generateKey(key);
        const expiresAt = Date.now() + (ttl || this.config.defaultTTL);
        
        const entry = {
            data: this.serializeData(data),
            expiresAt,
            createdAt: Date.now(),
            lastAccessed: Date.now(),
            accessCount: 0,
            size: this.calculateSize(data)
        };
        
        // Vérifier la taille du cache
        if (this.cache.size >= this.config.maxSize) {
            this.evictLRU();
        }
        
        this.setEntry(cacheKey, entry);
        this.stats.sets++;
        
        return true;
    }

    delete(key) {
        const cacheKey = this.generateKey(key);
        const deleted = this.deleteEntry(cacheKey);
        
        if (deleted) {
            this.stats.deletes++;
        }
        
        return deleted;
    }

    clear() {
        if (this.config.storageType === 'localStorage') {
            this.clearFromStorage();
        }
        
        this.cache.clear();
        this.resetStats();
    }

    has(key) {
        const cacheKey = this.generateKey(key);
        const entry = this.getEntry(cacheKey);
        
        if (!entry) return false;
        
        if (this.isExpired(entry)) {
            this.delete(key);
            return false;
        }
        
        return true;
    }

    // === MÉTHODES DE CACHE INTELLIGENT ===
    
    async getOrFetch(key, fetchFunction, options = {}) {
        const cached = this.get(key);
        
        if (cached !== null) {
            return cached;
        }
        
        try {
            const data = await fetchFunction();
            
            if (data !== null && data !== undefined) {
                this.set(key, data, options.ttl);
            }
            
            return data;
        } catch (error) {
            // En cas d'erreur, retourner les données en cache même expirées si disponibles
            if (options.fallbackToExpired) {
                const expiredEntry = this.getExpiredEntry(key);
                if (expiredEntry) {
                    return this.deserializeData(expiredEntry.data);
                }
            }
            
            throw error;
        }
    }

    invalidatePattern(pattern) {
        const regex = new RegExp(pattern);
        const keysToDelete = [];
        
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                keysToDelete.push(key);
            }
        }
        
        keysToDelete.forEach(key => {
            this.cache.delete(key);
            this.stats.deletes++;
        });
        
        return keysToDelete.length;
    }

    refresh(key, fetchFunction, options = {}) {
        this.delete(key);
        return this.getOrFetch(key, fetchFunction, options);
    }

    // === MÉTHODES DE GESTION DES ENTRÉES ===
    
    getEntry(key) {
        if (this.config.storageType === 'localStorage') {
            return this.getFromStorage(key);
        }
        
        return this.cache.get(key);
    }

    setEntry(key, entry) {
        if (this.config.storageType === 'localStorage') {
            this.saveToStorageKey(key, entry);
        }
        
        this.cache.set(key, entry);
    }

    deleteEntry(key) {
        if (this.config.storageType === 'localStorage') {
            this.deleteFromStorage(key);
        }
        
        return this.cache.delete(key);
    }

    getExpiredEntry(key) {
        const cacheKey = this.generateKey(key);
        const entry = this.getEntry(cacheKey);
        
        return entry && this.isExpired(entry) ? entry : null;
    }

    // === MÉTHODES D'ÉVICTION ===
    
    evictLRU() {
        let oldestKey = null;
        let oldestTime = Date.now();
        
        for (const [key, entry] of this.cache.entries()) {
            if (entry.lastAccessed < oldestTime) {
                oldestTime = entry.lastAccessed;
                oldestKey = key;
            }
        }
        
        if (oldestKey) {
            this.deleteEntry(oldestKey);
            this.stats.evictions++;
        }
    }

    evictExpired() {
        const now = Date.now();
        const expiredKeys = [];
        
        for (const [key, entry] of this.cache.entries()) {
            if (entry.expiresAt <= now) {
                expiredKeys.push(key);
            }
        }
        
        expiredKeys.forEach(key => {
            this.deleteEntry(key);
            this.stats.evictions++;
        });
        
        return expiredKeys.length;
    }

    // === MÉTHODES DE STOCKAGE PERSISTANT ===
    
    loadFromStorage() {
        if (typeof localStorage === 'undefined') return;
        
        try {
            const keys = Object.keys(localStorage).filter(key => 
                key.startsWith(this.config.keyPrefix)
            );
            
            keys.forEach(storageKey => {
                const data = localStorage.getItem(storageKey);
                if (data) {
                    const entry = JSON.parse(data);
                    const cacheKey = storageKey.replace(this.config.keyPrefix, '');
                    
                    if (!this.isExpired(entry)) {
                        this.cache.set(cacheKey, entry);
                    } else {
                        localStorage.removeItem(storageKey);
                    }
                }
            });
        } catch (error) {
            console.warn('Erreur lors du chargement du cache:', error);
        }
    }

    saveToStorage() {
        if (typeof localStorage === 'undefined') return;
        
        try {
            for (const [key, entry] of this.cache.entries()) {
                if (!this.isExpired(entry)) {
                    const storageKey = this.config.keyPrefix + key;
                    localStorage.setItem(storageKey, JSON.stringify(entry));
                }
            }
        } catch (error) {
            console.warn('Erreur lors de la sauvegarde du cache:', error);
        }
    }

    saveToStorageKey(key, entry) {
        if (typeof localStorage === 'undefined') return;
        
        try {
            const storageKey = this.config.keyPrefix + key;
            localStorage.setItem(storageKey, JSON.stringify(entry));
        } catch (error) {
            console.warn('Erreur lors de la sauvegarde de la clé:', key, error);
        }
    }

    getFromStorage(key) {
        if (typeof localStorage === 'undefined') return null;
        
        try {
            const storageKey = this.config.keyPrefix + key;
            const data = localStorage.getItem(storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.warn('Erreur lors de la lecture du cache:', key, error);
            return null;
        }
    }

    deleteFromStorage(key) {
        if (typeof localStorage === 'undefined') return false;
        
        try {
            const storageKey = this.config.keyPrefix + key;
            localStorage.removeItem(storageKey);
            return true;
        } catch (error) {
            console.warn('Erreur lors de la suppression du cache:', key, error);
            return false;
        }
    }

    clearFromStorage() {
        if (typeof localStorage === 'undefined') return;
        
        try {
            const keys = Object.keys(localStorage).filter(key => 
                key.startsWith(this.config.keyPrefix)
            );
            
            keys.forEach(key => localStorage.removeItem(key));
        } catch (error) {
            console.warn('Erreur lors du nettoyage du cache:', error);
        }
    }

    // === MÉTHODES UTILITAIRES ===
    
    generateKey(key) {
        if (typeof key === 'object') {
            return JSON.stringify(key);
        }
        return String(key);
    }

    isExpired(entry) {
        return Date.now() > entry.expiresAt;
    }

    calculateSize(data) {
        try {
            return JSON.stringify(data).length;
        } catch {
            return 0;
        }
    }

    serializeData(data) {
        if (this.config.enableCompression && typeof data === 'object') {
            // Compression simple (peut être améliorée avec LZ-string)
            return JSON.stringify(data);
        }
        return data;
    }

    deserializeData(data) {
        if (this.config.enableCompression && typeof data === 'string') {
            try {
                return JSON.parse(data);
            } catch {
                return data;
            }
        }
        return data;
    }

    startCleanupInterval() {
        // Nettoyer les entrées expirées toutes les 5 minutes
        setInterval(() => {
            this.evictExpired();
        }, 5 * 60 * 1000);
    }

    // === MÉTHODES DE STATISTIQUES ===
    
    getStats() {
        const hitRate = this.stats.hits + this.stats.misses > 0 
            ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
            : 0;
        
        return {
            ...this.stats,
            hitRate: `${hitRate}%`,
            size: this.cache.size,
            maxSize: this.config.maxSize,
            memoryUsage: this.getMemoryUsage()
        };
    }

    getMemoryUsage() {
        let totalSize = 0;
        
        for (const entry of this.cache.values()) {
            totalSize += entry.size || 0;
        }
        
        return {
            bytes: totalSize,
            kb: (totalSize / 1024).toFixed(2),
            mb: (totalSize / (1024 * 1024)).toFixed(2)
        };
    }

    resetStats() {
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            evictions: 0
        };
    }

    // === MÉTHODES DE CONFIGURATION ===
    
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    getConfig() {
        return { ...this.config };
    }

    // === MÉTHODES DE DEBUGGING ===
    
    debug() {
        console.group('API Cache Debug');
        console.log('Configuration:', this.config);
        console.log('Statistiques:', this.getStats());
        console.log('Entrées du cache:');
        
        for (const [key, entry] of this.cache.entries()) {
            console.log(`  ${key}:`, {
                expired: this.isExpired(entry),
                expiresIn: Math.max(0, entry.expiresAt - Date.now()),
                accessCount: entry.accessCount,
                size: entry.size
            });
        }
        
        console.groupEnd();
    }

    // === MÉTHODES DE STRATÉGIES DE CACHE ===
    
    setStrategy(pattern, ttl) {
        if (!this.strategies) {
            this.strategies = new Map();
        }
        
        this.strategies.set(pattern, ttl);
    }

    getStrategyTTL(key) {
        if (!this.strategies) return this.config.defaultTTL;
        
        for (const [pattern, ttl] of this.strategies.entries()) {
            if (new RegExp(pattern).test(key)) {
                return ttl;
            }
        }
        
        return this.config.defaultTTL;
    }

    // === MÉTHODES DE PRÉCHARGEMENT ===
    
    async preload(keys, fetchFunction) {
        const promises = keys.map(key => 
            this.getOrFetch(key, () => fetchFunction(key))
        );
        
        return Promise.allSettled(promises);
    }

    // === MÉTHODES DE SYNCHRONISATION ===
    
    async sync(remoteCache) {
        // Synchroniser avec un cache distant (pour les environnements multi-onglets)
        try {
            const remoteEntries = await remoteCache.getAll();
            
            for (const [key, entry] of Object.entries(remoteEntries)) {
                if (!this.has(key) || this.getEntry(key).createdAt < entry.createdAt) {
                    this.setEntry(key, entry);
                }
            }
        } catch (error) {
            console.warn('Erreur lors de la synchronisation du cache:', error);
        }
    }
}

// Export pour utilisation globale
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APICacheManager;
} else {
    window.APICacheManager = APICacheManager;
}