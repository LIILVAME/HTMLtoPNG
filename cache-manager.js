// Cache Manager pour optimiser les performances
// Amélioration Performance - Phase 1

class CacheManager {
    constructor(maxSize = 50, ttl = 300000) { // 5 minutes TTL par défaut
        this.cache = new Map();
        this.maxSize = maxSize;
        this.ttl = ttl; // Time to live en millisecondes
        this.accessOrder = new Map(); // Pour LRU
        this.stats = {
            hits: 0,
            misses: 0,
            evictions: 0
        };
        
        // Nettoyage périodique
        this.cleanupInterval = setInterval(() => this.cleanup(), 60000); // Chaque minute
    }

    // Générer une clé de cache basée sur le contenu
    generateKey(htmlContent, cssContent, width, height, format) {
        return Utils.generateCacheKey(htmlContent, cssContent, width, height, format);
    }

    // Mettre en cache un résultat
    set(key, value, metadata = {}) {
        const now = Date.now();
        const entry = {
            value,
            timestamp: now,
            lastAccessed: now,
            metadata: {
                size: this.estimateSize(value),
                ...metadata
            }
        };

        // Vérifier si on dépasse la taille max
        if (this.cache.size >= this.maxSize) {
            this.evictLRU();
        }

        this.cache.set(key, entry);
        this.accessOrder.set(key, now);
        
        console.log(`📦 Cache: Stored entry ${key} (${entry.metadata.size} bytes)`);
    }

    // Récupérer du cache
    get(key) {
        const entry = this.cache.get(key);
        
        if (!entry) {
            this.stats.misses++;
            return null;
        }

        // Vérifier l'expiration
        const now = Date.now();
        if (now - entry.timestamp > this.ttl) {
            this.cache.delete(key);
            this.accessOrder.delete(key);
            this.stats.misses++;
            console.log(`⏰ Cache: Entry ${key} expired`);
            return null;
        }

        // Mettre à jour l'accès
        entry.lastAccessed = now;
        this.accessOrder.set(key, now);
        this.stats.hits++;
        
        console.log(`✅ Cache: Hit for ${key}`);
        return entry.value;
    }

    // Éviction LRU (Least Recently Used)
    evictLRU() {
        let oldestKey = null;
        let oldestTime = Date.now();

        for (const [key, time] of this.accessOrder) {
            if (time < oldestTime) {
                oldestTime = time;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            this.cache.delete(oldestKey);
            this.accessOrder.delete(oldestKey);
            this.stats.evictions++;
            console.log(`🗑️ Cache: Evicted ${oldestKey}`);
        }
    }

    // Nettoyage des entrées expirées
    cleanup() {
        const now = Date.now();
        const expiredKeys = [];

        for (const [key, entry] of this.cache) {
            if (now - entry.timestamp > this.ttl) {
                expiredKeys.push(key);
            }
        }

        expiredKeys.forEach(key => {
            this.cache.delete(key);
            this.accessOrder.delete(key);
        });

        if (expiredKeys.length > 0) {
            console.log(`🧹 Cache: Cleaned up ${expiredKeys.length} expired entries`);
        }
    }

    // Estimer la taille d'un objet
    estimateSize(obj) {
        return Utils.estimateSize(obj);
    }

    // Obtenir les statistiques du cache
    getStats() {
        const totalRequests = this.stats.hits + this.stats.misses;
        const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests * 100).toFixed(2) : 0;
        
        return {
            ...this.stats,
            hitRate: `${hitRate}%`,
            size: this.cache.size,
            maxSize: this.maxSize,
            memoryUsage: this.getMemoryUsage()
        };
    }

    // Calculer l'utilisation mémoire
    getMemoryUsage() {
        let totalSize = 0;
        for (const [key, entry] of this.cache) {
            totalSize += entry.metadata.size || 0;
        }
        return this.formatBytes(totalSize);
    }

    // Formater les bytes en unités lisibles
    formatBytes(bytes) {
        return Utils.formatBytes(bytes);
    }

    // Vider le cache
    clear() {
        const size = this.cache.size;
        this.cache.clear();
        this.accessOrder.clear();
        console.log(`🗑️ Cache: Cleared ${size} entries`);
    }

    // Précharger des éléments populaires
    async preload(popularItems) {
        console.log(`🔄 Cache: Preloading ${popularItems.length} popular items`);
        
        for (const item of popularItems) {
            try {
                // Simuler le préchargement
                const key = this.generateKey(
                    item.html, 
                    item.css, 
                    item.width, 
                    item.height, 
                    item.format
                );
                
                // Vérifier si déjà en cache
                if (!this.get(key)) {
                    // Ici on pourrait déclencher une conversion en arrière-plan
                    console.log(`📋 Cache: Queued for preload: ${key}`);
                }
            } catch (error) {
                console.warn('Cache preload error:', error);
            }
        }
    }

    // Optimiser le cache
    optimize() {
        // Supprimer les entrées les moins utilisées si on approche de la limite
        if (this.cache.size > this.maxSize * 0.8) {
            const entriesToRemove = Math.floor(this.maxSize * 0.2);
            
            // Trier par fréquence d'accès
            const entries = Array.from(this.accessOrder.entries())
                .sort((a, b) => a[1] - b[1])
                .slice(0, entriesToRemove);
            
            entries.forEach(([key]) => {
                this.cache.delete(key);
                this.accessOrder.delete(key);
            });
            
            console.log(`⚡ Cache: Optimized - removed ${entriesToRemove} entries`);
        }
    }

    // Détruire le cache manager
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.clear();
    }
}

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CacheManager;
} else if (typeof window !== 'undefined') {
    window.CacheManager = CacheManager;
}