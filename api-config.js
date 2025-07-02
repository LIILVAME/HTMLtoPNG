/**
 * Configuration des APIs et services externes
 * Centralise tous les endpoints et paramètres d'API
 */
class APIConfig {
    constructor() {
        this.environment = this.detectEnvironment();
        this.config = this.getConfigForEnvironment();
    }

    detectEnvironment() {
        const hostname = window.location.hostname;
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'development';
        } else if (hostname.includes('staging') || hostname.includes('test')) {
            return 'staging';
        } else {
            return 'production';
        }
    }

    // Méthode pour gérer les variables d'environnement côté navigateur
    getEnvVar(varName) {
        // En développement, on peut utiliser des valeurs par défaut
        if (this.environment === 'development') {
            const defaults = {};
            return defaults[varName] || null;
        }
        
        // En production, les clés devraient être configurées côté serveur
        // ou injectées lors du build
        return window.ENV?.[varName] || null;
    }

    getConfigForEnvironment() {
        const configs = {
            development: {
                api: {
                    baseURL: 'http://localhost:3000/api/v1',
                    timeout: 10000,
                    retries: 3
                },
                services: {
                    conversion: {
                        baseURL: 'http://localhost:3001/convert',
                        maxFileSize: 10 * 1024 * 1024, // 10MB
                        supportedFormats: ['png', 'jpeg', 'webp', 'pdf']
                    },
                    storage: {
                        baseURL: 'http://localhost:3002/storage',
                        maxFileSize: 50 * 1024 * 1024, // 50MB
                        allowedTypes: ['image/*', 'application/pdf', 'text/html']
                    },
                    auth: {
                        baseURL: 'http://localhost:3003/auth',
                        providers: ['google', 'github', 'email'],
                        tokenExpiry: 24 * 60 * 60 * 1000 // 24 heures
                    }
                },

            },
            staging: {
                api: {
                    baseURL: 'https://api-staging.htmltopng.com/v1',
                    timeout: 15000,
                    retries: 3
                },
                services: {
                    conversion: {
                        baseURL: 'https://convert-staging.htmltopng.com',
                        maxFileSize: 25 * 1024 * 1024, // 25MB
                        supportedFormats: ['png', 'jpeg', 'webp', 'pdf']
                    },
                    storage: {
                        baseURL: 'https://storage-staging.htmltopng.com',
                        maxFileSize: 100 * 1024 * 1024, // 100MB
                        allowedTypes: ['image/*', 'application/pdf', 'text/html']
                    },
                    auth: {
                        baseURL: 'https://auth-staging.htmltopng.com',
                        providers: ['google', 'github', 'email'],
                        tokenExpiry: 24 * 60 * 60 * 1000
                    }
                },

            },
            production: {
                api: {
                    baseURL: 'https://api.htmltopng.com/v1',
                    timeout: 20000,
                    retries: 5
                },
                services: {
                    conversion: {
                        baseURL: 'https://convert.htmltopng.com',
                        maxFileSize: 50 * 1024 * 1024, // 50MB
                        supportedFormats: ['png', 'jpeg', 'webp', 'pdf', 'svg']
                    },
                    storage: {
                        baseURL: 'https://storage.htmltopng.com',
                        maxFileSize: 200 * 1024 * 1024, // 200MB
                        allowedTypes: ['image/*', 'application/pdf', 'text/html', 'text/css', 'application/javascript']
                    },
                    auth: {
                        baseURL: 'https://auth.htmltopng.com',
                        providers: ['google', 'github', 'email', 'microsoft', 'apple'],
                        tokenExpiry: 24 * 60 * 60 * 1000
                    }
                },

            }
        };

        return configs[this.environment];
    }

    // Getters pour accéder facilement aux configurations
    get apiConfig() {
        return this.config.api;
    }

    get servicesConfig() {
        return this.config.services;
    }



    // Méthodes utilitaires
    getServiceURL(serviceName) {
        return this.config.services[serviceName]?.baseURL || null;
    }



    isServiceEnabled(serviceName) {
        return !!this.config.services[serviceName];
    }

    getMaxFileSize(serviceName) {
        return this.config.services[serviceName]?.maxFileSize || 10 * 1024 * 1024;
    }

    getSupportedFormats(serviceName) {
        return this.config.services[serviceName]?.supportedFormats || [];
    }



    // Configuration des endpoints spécifiques
    getEndpoints() {
        return {
            // Authentification
            auth: {
                login: '/auth/login',
                logout: '/auth/logout',
                refresh: '/auth/refresh',
                register: '/auth/register',
                verify: '/auth/verify',
                resetPassword: '/auth/reset-password',
                changePassword: '/auth/change-password',
                profile: '/auth/profile'
            },

            // Conversion
            conversion: {
                convert: '/convert',
                status: '/convert/status/:jobId',
                download: '/convert/download/:jobId',
                history: '/convert/history',
                cancel: '/convert/cancel/:jobId',
                batch: '/convert/batch'
            },

            // Templates
            templates: {
                list: '/templates',
                get: '/templates/:id',
                create: '/templates',
                update: '/templates/:id',
                delete: '/templates/:id',
                share: '/templates/:id/share',
                clone: '/templates/:id/clone',
                categories: '/templates/categories',
                featured: '/templates/featured'
            },

            // Stockage
            storage: {
                upload: '/storage/upload',
                download: '/storage/download/:id',
                list: '/storage/files',
                delete: '/storage/:id',
                share: '/storage/:id/share',
                metadata: '/storage/:id/metadata',
                thumbnail: '/storage/:id/thumbnail'
            },

            // Analytics
            analytics: {
                track: '/analytics/track',
                stats: '/analytics/stats',
                usage: '/analytics/usage',
                performance: '/analytics/performance',
                errors: '/analytics/errors'
            },

            // Collaboration
            collaboration: {
                projects: '/collaboration/projects',
                invite: '/collaboration/invite',
                permissions: '/collaboration/permissions',
                comments: '/collaboration/comments',
                versions: '/collaboration/versions'
            },



            // Système
            system: {
                health: '/system/health',
                status: '/system/status',
                version: '/system/version',
                maintenance: '/system/maintenance'
            }
        };
    }

    // Configuration des headers par défaut
    getDefaultHeaders() {
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Client-Version': '1.0.0',
            'X-Client-Platform': 'web',
            'X-Environment': this.environment
        };
    }

    // Configuration des timeouts
    getTimeouts() {
        return {
            default: this.config.api.timeout,
            upload: 60000, // 1 minute pour les uploads
            conversion: 120000, // 2 minutes pour les conversions
            download: 30000 // 30 secondes pour les téléchargements
        };
    }

    // Configuration de la gestion d'erreurs
    getErrorConfig() {
        return {
            retries: this.config.api.retries,
            retryDelay: 1000, // 1 seconde
            retryMultiplier: 2, // Backoff exponentiel
            maxRetryDelay: 10000, // 10 secondes max
            retryableStatusCodes: [408, 429, 500, 502, 503, 504]
        };
    }

    // Configuration du cache
    getCacheConfig() {
        return {
            enabled: true,
            defaultTTL: 5 * 60 * 1000, // 5 minutes
            maxSize: 100, // 100 entrées max
            strategies: {
                templates: 30 * 60 * 1000, // 30 minutes
                user: 10 * 60 * 1000 // 10 minutes
            }
        };
    }

    // Validation de la configuration
    validateConfig() {
        const required = ['api.baseURL', 'services.conversion.baseURL', 'services.auth.baseURL'];
        const missing = [];

        required.forEach(path => {
            const value = this.getNestedValue(this.config, path);
            if (!value) {
                missing.push(path);
            }
        });

        if (missing.length > 0) {
            console.warn('Configuration incomplète:', missing);
            return false;
        }

        return true;
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    // Méthode pour mettre à jour la configuration dynamiquement
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        return this.validateConfig();
    }

    // Export de la configuration pour debugging
    exportConfig() {
        return {
            environment: this.environment,
            config: this.config,
            endpoints: this.getEndpoints(),
            headers: this.getDefaultHeaders(),
            timeouts: this.getTimeouts(),
            errors: this.getErrorConfig(),
            cache: this.getCacheConfig()
        };
    }
}

// Export pour utilisation globale
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIConfig;
} else {
    window.APIConfig = APIConfig;
}