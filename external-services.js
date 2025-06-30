/**
 * External Services Integration - Intégration des services externes
 * Gère les connexions avec Unsplash, Google Fonts, Iconify, etc.
 */
class ExternalServicesManager {
    constructor(apiManager, cacheManager) {
        this.apiManager = apiManager;
        this.cache = cacheManager;
        this.config = new APIConfig();
        
        this.services = {
            unsplash: new UnsplashService(this),
            googleFonts: new GoogleFontsService(this),
            iconify: new IconifyService(this),
            pexels: new PexelsService(this),
            colorAPI: new ColorAPIService(this)
        };
        
        this.rateLimiters = new Map();
        this.init();
    }

    init() {
        this.setupRateLimiters();
        this.bindEvents();
    }

    setupRateLimiters() {
        // Configuration des limiteurs de taux pour chaque service
        Object.keys(this.services).forEach(serviceName => {
            const config = this.config.getExternalServiceConfig(serviceName);
            if (config && config.rateLimit) {
                this.rateLimiters.set(serviceName, new RateLimiter(config.rateLimit));
            }
        });
    }

    bindEvents() {
        // Écouter les événements de l'application
        document.addEventListener('external-service-request', (event) => {
            this.handleServiceRequest(event.detail);
        });
    }

    async handleServiceRequest(request) {
        const { service, method, params } = request;
        
        if (this.services[service]) {
            return await this.services[service][method](params);
        }
        
        throw new Error(`Service ${service} non disponible`);
    }

    getService(serviceName) {
        return this.services[serviceName];
    }

    async checkRateLimit(serviceName) {
        const limiter = this.rateLimiters.get(serviceName);
        if (limiter) {
            return await limiter.checkLimit();
        }
        return true;
    }
}

/**
 * Service Unsplash - Intégration avec l'API Unsplash
 */
class UnsplashService {
    constructor(manager) {
        this.manager = manager;
        this.config = manager.config.getExternalServiceConfig('unsplash');
        this.baseURL = this.config?.baseURL || 'https://api.unsplash.com';
        this.accessKey = this.config?.accessKey;
    }

    async searchPhotos(query, options = {}) {
        const cacheKey = `unsplash_search_${query}_${JSON.stringify(options)}`;
        
        return await this.manager.cache.getOrFetch(cacheKey, async () => {
            if (!await this.manager.checkRateLimit('unsplash')) {
                throw new Error('Limite de taux Unsplash atteinte');
            }

            const params = new URLSearchParams({
                query,
                page: options.page || 1,
                per_page: options.perPage || 20,
                orientation: options.orientation || 'all',
                color: options.color || '',
                order_by: options.orderBy || 'relevant'
            });

            const response = await fetch(`${this.baseURL}/search/photos?${params}`, {
                headers: {
                    'Authorization': `Client-ID ${this.accessKey}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erreur Unsplash: ${response.status}`);
            }

            const data = await response.json();
            return this.formatPhotosResponse(data);
        }, { ttl: 30 * 60 * 1000 }); // Cache 30 minutes
    }

    async getPhoto(photoId) {
        const cacheKey = `unsplash_photo_${photoId}`;
        
        return await this.manager.cache.getOrFetch(cacheKey, async () => {
            const response = await fetch(`${this.baseURL}/photos/${photoId}`, {
                headers: {
                    'Authorization': `Client-ID ${this.accessKey}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erreur Unsplash: ${response.status}`);
            }

            const data = await response.json();
            return this.formatPhotoResponse(data);
        }, { ttl: 60 * 60 * 1000 }); // Cache 1 heure
    }

    async downloadPhoto(photoId) {
        // Déclencher le téléchargement (requis par Unsplash)
        await fetch(`${this.baseURL}/photos/${photoId}/download`, {
            headers: {
                'Authorization': `Client-ID ${this.accessKey}`
            }
        });
    }

    formatPhotosResponse(data) {
        return {
            total: data.total,
            totalPages: data.total_pages,
            results: data.results.map(photo => this.formatPhotoResponse(photo))
        };
    }

    formatPhotoResponse(photo) {
        return {
            id: photo.id,
            description: photo.description || photo.alt_description,
            urls: {
                raw: photo.urls.raw,
                full: photo.urls.full,
                regular: photo.urls.regular,
                small: photo.urls.small,
                thumb: photo.urls.thumb
            },
            user: {
                name: photo.user.name,
                username: photo.user.username,
                profileImage: photo.user.profile_image.medium
            },
            width: photo.width,
            height: photo.height,
            color: photo.color,
            likes: photo.likes,
            downloadUrl: photo.links.download
        };
    }
}

/**
 * Service Google Fonts - Intégration avec l'API Google Fonts
 */
class GoogleFontsService {
    constructor(manager) {
        this.manager = manager;
        this.config = manager.config.getExternalServiceConfig('googleFonts');
        this.baseURL = this.config?.baseURL || 'https://www.googleapis.com/webfonts/v1';
        this.apiKey = this.config?.apiKey;
    }

    async getFontsList(options = {}) {
        const cacheKey = `google_fonts_list_${JSON.stringify(options)}`;
        
        return await this.manager.cache.getOrFetch(cacheKey, async () => {
            const params = new URLSearchParams({
                key: this.apiKey,
                sort: options.sort || 'popularity',
                subset: options.subset || ''
            });

            const response = await fetch(`${this.baseURL}/webfonts?${params}`);

            if (!response.ok) {
                throw new Error(`Erreur Google Fonts: ${response.status}`);
            }

            const data = await response.json();
            return this.formatFontsResponse(data);
        }, { ttl: 24 * 60 * 60 * 1000 }); // Cache 24 heures
    }

    async searchFonts(query, options = {}) {
        const fonts = await this.getFontsList(options);
        
        return fonts.filter(font => 
            font.family.toLowerCase().includes(query.toLowerCase()) ||
            font.category.toLowerCase().includes(query.toLowerCase())
        );
    }

    generateFontURL(fontFamily, variants = ['400'], subsets = ['latin']) {
        const family = `${fontFamily}:${variants.join(',')}`;
        const params = new URLSearchParams({
            family,
            subset: subsets.join(',')
        });
        
        return `https://fonts.googleapis.com/css2?${params}&display=swap`;
    }

    async loadFont(fontFamily, variants = ['400']) {
        const fontURL = this.generateFontURL(fontFamily, variants);
        
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = fontURL;
            
            link.onload = () => resolve(fontFamily);
            link.onerror = () => reject(new Error(`Impossible de charger la police ${fontFamily}`));
            
            document.head.appendChild(link);
        });
    }

    formatFontsResponse(data) {
        return data.items.map(font => ({
            family: font.family,
            category: font.category,
            variants: font.variants,
            subsets: font.subsets,
            version: font.version,
            lastModified: font.lastModified,
            files: font.files,
            popularity: data.items.indexOf(font) + 1
        }));
    }
}

/**
 * Service Iconify - Intégration avec l'API Iconify
 */
class IconifyService {
    constructor(manager) {
        this.manager = manager;
        this.config = manager.config.getExternalServiceConfig('iconify');
        this.baseURL = this.config?.baseURL || 'https://api.iconify.design';
    }

    async searchIcons(query, options = {}) {
        const cacheKey = `iconify_search_${query}_${JSON.stringify(options)}`;
        
        return await this.manager.cache.getOrFetch(cacheKey, async () => {
            const params = new URLSearchParams({
                query,
                limit: options.limit || 50,
                start: options.start || 0,
                category: options.category || '',
                style: options.style || ''
            });

            const response = await fetch(`${this.baseURL}/search?${params}`);

            if (!response.ok) {
                throw new Error(`Erreur Iconify: ${response.status}`);
            }

            const data = await response.json();
            return this.formatIconsResponse(data);
        }, { ttl: 60 * 60 * 1000 }); // Cache 1 heure
    }

    async getIconCollections() {
        const cacheKey = 'iconify_collections';
        
        return await this.manager.cache.getOrFetch(cacheKey, async () => {
            const response = await fetch(`${this.baseURL}/collections`);

            if (!response.ok) {
                throw new Error(`Erreur Iconify: ${response.status}`);
            }

            return await response.json();
        }, { ttl: 24 * 60 * 60 * 1000 }); // Cache 24 heures
    }

    async getIcon(iconName, options = {}) {
        const cacheKey = `iconify_icon_${iconName}_${JSON.stringify(options)}`;
        
        return await this.manager.cache.getOrFetch(cacheKey, async () => {
            const params = new URLSearchParams({
                height: options.height || 24,
                color: options.color || 'currentColor',
                format: options.format || 'svg'
            });

            const response = await fetch(`${this.baseURL}/${iconName}.svg?${params}`);

            if (!response.ok) {
                throw new Error(`Erreur Iconify: ${response.status}`);
            }

            return await response.text();
        }, { ttl: 24 * 60 * 60 * 1000 }); // Cache 24 heures
    }

    formatIconsResponse(data) {
        return {
            total: data.total,
            icons: data.icons.map(icon => ({
                name: icon,
                collection: icon.split(':')[0],
                iconName: icon.split(':')[1],
                url: `${this.baseURL}/${icon}.svg`
            }))
        };
    }
}

/**
 * Service Pexels - Intégration avec l'API Pexels
 */
class PexelsService {
    constructor(manager) {
        this.manager = manager;
        this.config = manager.config.getExternalServiceConfig('pexels');
        this.baseURL = this.config?.baseURL || 'https://api.pexels.com/v1';
        this.apiKey = this.config?.apiKey;
    }

    async searchPhotos(query, options = {}) {
        const cacheKey = `pexels_search_${query}_${JSON.stringify(options)}`;
        
        return await this.manager.cache.getOrFetch(cacheKey, async () => {
            const params = new URLSearchParams({
                query,
                page: options.page || 1,
                per_page: options.perPage || 20,
                orientation: options.orientation || 'all',
                size: options.size || 'all',
                color: options.color || ''
            });

            const response = await fetch(`${this.baseURL}/search?${params}`, {
                headers: {
                    'Authorization': this.apiKey,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erreur Pexels: ${response.status}`);
            }

            const data = await response.json();
            return this.formatPhotosResponse(data);
        }, { ttl: 30 * 60 * 1000 }); // Cache 30 minutes
    }

    formatPhotosResponse(data) {
        return {
            total: data.total_results,
            page: data.page,
            perPage: data.per_page,
            photos: data.photos.map(photo => ({
                id: photo.id,
                width: photo.width,
                height: photo.height,
                url: photo.url,
                photographer: photo.photographer,
                photographerUrl: photo.photographer_url,
                src: {
                    original: photo.src.original,
                    large: photo.src.large,
                    medium: photo.src.medium,
                    small: photo.src.small,
                    tiny: photo.src.tiny
                },
                alt: photo.alt
            }))
        };
    }
}

/**
 * Service Color API - Génération de palettes de couleurs
 */
class ColorAPIService {
    constructor(manager) {
        this.manager = manager;
    }

    async generatePalette(baseColor, options = {}) {
        const cacheKey = `color_palette_${baseColor}_${JSON.stringify(options)}`;
        
        return await this.manager.cache.getOrFetch(cacheKey, async () => {
            // Utiliser une API de couleurs ou générer localement
            return this.generateLocalPalette(baseColor, options);
        }, { ttl: 60 * 60 * 1000 }); // Cache 1 heure
    }

    generateLocalPalette(baseColor, options = {}) {
        const type = options.type || 'complementary';
        const count = options.count || 5;
        
        const hsl = this.hexToHsl(baseColor);
        const palette = [baseColor];
        
        switch (type) {
            case 'complementary':
                palette.push(this.hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l));
                break;
            case 'triadic':
                palette.push(this.hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l));
                palette.push(this.hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l));
                break;
            case 'analogous':
                for (let i = 1; i < count; i++) {
                    palette.push(this.hslToHex((hsl.h + i * 30) % 360, hsl.s, hsl.l));
                }
                break;
            case 'monochromatic':
                for (let i = 1; i < count; i++) {
                    const lightness = Math.max(0, Math.min(100, hsl.l + (i - count/2) * 20));
                    palette.push(this.hslToHex(hsl.h, hsl.s, lightness));
                }
                break;
        }
        
        return {
            baseColor,
            type,
            colors: palette.slice(0, count)
        };
    }

    hexToHsl(hex) {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return { h: h * 360, s: s * 100, l: l * 100 };
    }

    hslToHex(h, s, l) {
        h /= 360; s /= 100; l /= 100;
        
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        const toHex = (c) => {
            const hex = Math.round(c * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
}

/**
 * Rate Limiter - Gestionnaire de limitation de taux
 */
class RateLimiter {
    constructor(maxRequests, timeWindow = 60000) {
        this.maxRequests = maxRequests;
        this.timeWindow = timeWindow;
        this.requests = [];
    }

    async checkLimit() {
        const now = Date.now();
        
        // Nettoyer les anciennes requêtes
        this.requests = this.requests.filter(time => now - time < this.timeWindow);
        
        if (this.requests.length >= this.maxRequests) {
            const oldestRequest = Math.min(...this.requests);
            const waitTime = this.timeWindow - (now - oldestRequest);
            
            if (waitTime > 0) {
                await new Promise(resolve => setTimeout(resolve, waitTime));
                return this.checkLimit();
            }
        }
        
        this.requests.push(now);
        return true;
    }

    getRemainingRequests() {
        const now = Date.now();
        this.requests = this.requests.filter(time => now - time < this.timeWindow);
        return Math.max(0, this.maxRequests - this.requests.length);
    }

    getResetTime() {
        if (this.requests.length === 0) return 0;
        
        const oldestRequest = Math.min(...this.requests);
        return Math.max(0, this.timeWindow - (Date.now() - oldestRequest));
    }
}

// Export pour utilisation globale
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ExternalServicesManager, UnsplashService, GoogleFontsService, IconifyService, PexelsService, ColorAPIService, RateLimiter };
} else {
    window.ExternalServicesManager = ExternalServicesManager;
    window.UnsplashService = UnsplashService;
    window.GoogleFontsService = GoogleFontsService;
    window.IconifyService = IconifyService;
    window.PexelsService = PexelsService;
    window.ColorAPIService = ColorAPIService;
    window.RateLimiter = RateLimiter;
}