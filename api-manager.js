/**
 * API Manager - Gestionnaire des connexions externes via API REST
 * Gère toutes les interactions avec les services externes
 */
class APIManager {
    constructor() {
        this.baseURL = this.getBaseURL();
        this.apiKey = null;
        this.authToken = null;
        this.requestQueue = [];
        this.rateLimitDelay = 1000; // 1 seconde entre les requêtes
        this.maxRetries = 3;
        
        this.init();
    }

    init() {
        this.loadConfiguration();
        this.setupInterceptors();
        this.initializeEndpoints();
    }

    getBaseURL() {
        // Détermine l'URL de base selon l'environnement
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3000/api';
        }
        return 'https://api.htmltopng.com/v1';
    }

    loadConfiguration() {
        // Charge la configuration depuis localStorage ou config
        const savedConfig = localStorage.getItem('api_config');
        if (savedConfig) {
            const config = JSON.parse(savedConfig);
            this.apiKey = config.apiKey;
            this.authToken = config.authToken;
        }
    }

    saveConfiguration() {
        // Sauvegarde la configuration
        const config = {
            apiKey: this.apiKey,
            authToken: this.authToken
        };
        localStorage.setItem('api_config', JSON.stringify(config));
    }

    initializeEndpoints() {
        this.endpoints = {
            // Authentification
            auth: {
                login: '/auth/login',
                logout: '/auth/logout',
                refresh: '/auth/refresh',
                register: '/auth/register',
                verify: '/auth/verify'
            },
            // Conversion d'images
            conversion: {
                htmlToPng: '/convert/html-to-png',
                htmlToJpeg: '/convert/html-to-jpeg',
                htmlToWebp: '/convert/html-to-webp',
                htmlToPdf: '/convert/html-to-pdf',
                status: '/convert/status',
                download: '/convert/download'
            },
            // Gestion des templates
            templates: {
                list: '/templates',
                get: '/templates/:id',
                create: '/templates',
                update: '/templates/:id',
                delete: '/templates/:id',
                share: '/templates/:id/share'
            },
            // Stockage cloud
            storage: {
                upload: '/storage/upload',
                download: '/storage/download/:id',
                list: '/storage/files',
                delete: '/storage/:id',
                share: '/storage/:id/share'
            },
            // Analytics et monitoring
            analytics: {
                track: '/analytics/track',
                stats: '/analytics/stats',
                usage: '/analytics/usage'
            },
            // Services externes
            external: {
                unsplash: '/external/unsplash/search',
                fonts: '/external/fonts/list',
                icons: '/external/icons/search',
                colors: '/external/colors/palette'
            }
        };
    }

    setupInterceptors() {
        // Configuration des intercepteurs pour les requêtes
        this.requestInterceptor = (config) => {
            // Ajouter l'authentification
            if (this.authToken) {
                config.headers = config.headers || {};
                config.headers['Authorization'] = `Bearer ${this.authToken}`;
            }
            
            if (this.apiKey) {
                config.headers = config.headers || {};
                config.headers['X-API-Key'] = this.apiKey;
            }
            
            // Ajouter des headers par défaut
            config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
            config.headers['Accept'] = 'application/json';
            
            return config;
        };

        this.responseInterceptor = (response) => {
            // Gestion des réponses
            if (response.status === 401) {
                this.handleUnauthorized();
            }
            return response;
        };
    }

    async makeRequest(method, endpoint, data = null, options = {}) {
        const config = {
            method: method.toUpperCase(),
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Appliquer l'intercepteur de requête
        this.requestInterceptor(config);

        if (data && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT' || method.toUpperCase() === 'PATCH')) {
            config.body = JSON.stringify(data);
        }

        const url = `${this.baseURL}${endpoint}`;
        
        try {
            const response = await this.fetchWithRetry(url, config);
            
            // Appliquer l'intercepteur de réponse
            this.responseInterceptor(response);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            return { success: true, data: result, status: response.status };
            
        } catch (error) {
            console.error('API Request failed:', error);
            return { success: false, error: error.message, status: error.status || 500 };
        }
    }

    async fetchWithRetry(url, config, retryCount = 0) {
        try {
            const response = await fetch(url, config);
            return response;
        } catch (error) {
            if (retryCount < this.maxRetries) {
                await this.delay(Math.pow(2, retryCount) * 1000); // Backoff exponentiel
                return this.fetchWithRetry(url, config, retryCount + 1);
            }
            throw error;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // === MÉTHODES D'AUTHENTIFICATION ===
    
    async login(credentials) {
        const response = await this.makeRequest('POST', this.endpoints.auth.login, credentials);
        
        if (response.success && response.data.token) {
            this.authToken = response.data.token;
            this.saveConfiguration();
        }
        
        return response;
    }

    async logout() {
        const response = await this.makeRequest('POST', this.endpoints.auth.logout);
        
        // Nettoyer les tokens localement même si la requête échoue
        this.authToken = null;
        this.apiKey = null;
        localStorage.removeItem('api_config');
        
        return response;
    }

    async refreshToken() {
        const response = await this.makeRequest('POST', this.endpoints.auth.refresh);
        
        if (response.success && response.data.token) {
            this.authToken = response.data.token;
            this.saveConfiguration();
        }
        
        return response;
    }

    // === MÉTHODES DE CONVERSION ===
    
    async convertHtmlToPng(htmlContent, options = {}) {
        const payload = {
            html: htmlContent,
            options: {
                width: options.width || 1200,
                height: options.height || 800,
                quality: options.quality || 90,
                format: 'png',
                ...options
            }
        };
        
        return await this.makeRequest('POST', this.endpoints.conversion.htmlToPng, payload);
    }

    async convertHtmlToJpeg(htmlContent, options = {}) {
        const payload = {
            html: htmlContent,
            options: {
                width: options.width || 1200,
                height: options.height || 800,
                quality: options.quality || 85,
                format: 'jpeg',
                ...options
            }
        };
        
        return await this.makeRequest('POST', this.endpoints.conversion.htmlToJpeg, payload);
    }

    async getConversionStatus(jobId) {
        return await this.makeRequest('GET', `${this.endpoints.conversion.status}/${jobId}`);
    }

    async downloadConvertedFile(jobId) {
        const endpoint = this.endpoints.conversion.download.replace(':id', jobId);
        return await this.makeRequest('GET', endpoint, null, {
            headers: { 'Accept': 'application/octet-stream' }
        });
    }

    // === MÉTHODES DE TEMPLATES ===
    
    async getTemplates(page = 1, limit = 20) {
        return await this.makeRequest('GET', `${this.endpoints.templates.list}?page=${page}&limit=${limit}`);
    }

    async getTemplate(templateId) {
        const endpoint = this.endpoints.templates.get.replace(':id', templateId);
        return await this.makeRequest('GET', endpoint);
    }

    async createTemplate(templateData) {
        return await this.makeRequest('POST', this.endpoints.templates.create, templateData);
    }

    async updateTemplate(templateId, templateData) {
        const endpoint = this.endpoints.templates.update.replace(':id', templateId);
        return await this.makeRequest('PUT', endpoint, templateData);
    }

    async deleteTemplate(templateId) {
        const endpoint = this.endpoints.templates.delete.replace(':id', templateId);
        return await this.makeRequest('DELETE', endpoint);
    }

    // === MÉTHODES DE STOCKAGE CLOUD ===
    
    async uploadFile(file, metadata = {}) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('metadata', JSON.stringify(metadata));
        
        return await this.makeRequest('POST', this.endpoints.storage.upload, formData, {
            headers: {} // Laisser le navigateur définir le Content-Type pour FormData
        });
    }

    async getStoredFiles(page = 1, limit = 20) {
        return await this.makeRequest('GET', `${this.endpoints.storage.list}?page=${page}&limit=${limit}`);
    }

    async deleteStoredFile(fileId) {
        const endpoint = this.endpoints.storage.delete.replace(':id', fileId);
        return await this.makeRequest('DELETE', endpoint);
    }

    // === MÉTHODES D'ANALYTICS ===
    
    async trackEvent(eventName, eventData = {}) {
        const payload = {
            event: eventName,
            data: eventData,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        return await this.makeRequest('POST', this.endpoints.analytics.track, payload);
    }

    async getUsageStats(period = '30d') {
        return await this.makeRequest('GET', `${this.endpoints.analytics.usage}?period=${period}`);
    }

    // === SERVICES EXTERNES ===
    
    async searchUnsplashImages(query, page = 1) {
        return await this.makeRequest('GET', `${this.endpoints.external.unsplash}?q=${encodeURIComponent(query)}&page=${page}`);
    }

    async getAvailableFonts() {
        return await this.makeRequest('GET', this.endpoints.external.fonts);
    }

    async searchIcons(query) {
        return await this.makeRequest('GET', `${this.endpoints.external.icons}?q=${encodeURIComponent(query)}`);
    }

    async generateColorPalette(baseColor) {
        return await this.makeRequest('POST', this.endpoints.external.colors, { baseColor });
    }

    // === GESTION DES ERREURS ===
    
    handleUnauthorized() {
        // Token expiré ou invalide
        this.authToken = null;
        localStorage.removeItem('api_config');
        
        // Rediriger vers la page de connexion si nécessaire
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }

    // === MÉTHODES UTILITAIRES ===
    
    isAuthenticated() {
        return !!this.authToken;
    }

    setApiKey(apiKey) {
        this.apiKey = apiKey;
        this.saveConfiguration();
    }

    setAuthToken(token) {
        this.authToken = token;
        this.saveConfiguration();
    }

    getHealthStatus() {
        return this.makeRequest('GET', '/health');
    }

    // === GESTION DE LA QUEUE DE REQUÊTES ===
    
    async queueRequest(requestFn) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ requestFn, resolve, reject });
            this.processQueue();
        });
    }

    async processQueue() {
        if (this.requestQueue.length === 0) return;
        
        const { requestFn, resolve, reject } = this.requestQueue.shift();
        
        try {
            const result = await requestFn();
            resolve(result);
        } catch (error) {
            reject(error);
        }
        
        // Délai entre les requêtes pour respecter les limites de taux
        await this.delay(this.rateLimitDelay);
        
        // Traiter la prochaine requête
        if (this.requestQueue.length > 0) {
            this.processQueue();
        }
    }
}

// Export pour utilisation globale
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIManager;
} else {
    window.APIManager = APIManager;
}