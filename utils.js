/**
 * Utilitaires centralisés pour HTMLtoPNG
 * Regroupe les fonctions communes utilisées dans plusieurs modules
 */

class Utils {
    /**
     * Génération d'identifiants uniques
     */
    static generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    static generateSessionId() {
        return this.generateId('session');
    }

    static generateUserId() {
        return this.generateId('user');
    }

    /**
     * Fonctions de hachage communes
     */
    static hashCode(str) {
        let hash = 0;
        if (str.length === 0) return hash;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convertir en 32bit integer
        }
        return Math.abs(hash);
    }

    static generateCacheKey(htmlContent, cssContent, width, height, format) {
        const content = `${htmlContent}|${cssContent}|${width}|${height}|${format}`;
        return this.hashCode(content).toString();
    }

    /**
     * Gestion des tailles et formatage
     */
    static estimateSize(obj) {
        if (obj instanceof Blob) {
            return obj.size;
        }
        
        if (typeof obj === 'string') {
            return obj.length * 2; // UTF-16
        }
        
        if (obj instanceof ArrayBuffer) {
            return obj.byteLength;
        }
        
        // Estimation approximative pour les objets
        return JSON.stringify(obj).length * 2;
    }

    static formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Gestion du localStorage avec fallback
     */
    static getFromStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            if (!item) {
                return defaultValue;
            }
            
            // Vérifier si l'item est déjà une chaîne simple (pas du JSON)
            if (item === 'undefined' || item === 'null') {
                return defaultValue;
            }
            
            // Essayer de parser comme JSON
            try {
                return JSON.parse(item);
            } catch (parseError) {
                // Si ce n'est pas du JSON valide, retourner la valeur brute si c'est une chaîne simple
                console.warn(`Valeur localStorage non-JSON pour la clé '${key}':`, item);
                // Nettoyer la valeur corrompue
                localStorage.removeItem(key);
                return defaultValue;
            }
        } catch (error) {
            console.warn('Erreur lecture localStorage:', error);
            return defaultValue;
        }
    }

    static setToStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn('Erreur écriture localStorage:', error);
            return false;
        }
    }

    static removeFromStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn('Erreur suppression localStorage:', error);
            return false;
        }
    }

    /**
     * Gestion des éléments DOM
     */
    static getElementInfo(element) {
        return {
            tagName: element.tagName,
            id: element.id,
            className: element.className,
            textContent: element.textContent?.substring(0, 50),
            attributes: Array.from(element.attributes).reduce((acc, attr) => {
                acc[attr.name] = attr.value;
                return acc;
            }, {})
        };
    }

    static getElementKey(element) {
        const id = element.id;
        const className = element.className;
        const tagName = element.tagName;
        return `${tagName}${id ? '#' + id : ''}${className ? '.' + className.split(' ').join('.') : ''}`;
    }

    /**
     * Fonctions de validation
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    static isValidImageFormat(format) {
        const validFormats = ['png', 'jpeg', 'jpg', 'webp', 'svg', 'pdf'];
        return validFormats.includes(format.toLowerCase());
    }

    /**
     * Fonctions de temporisation et debouncing
     */
    static debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Gestion des erreurs et logging
     */
    static logError(error, context = '') {
        const errorInfo = {
            message: error.message,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        console.error('Erreur capturée:', errorInfo);
        
        // Optionnel: envoyer à un service de logging
        this.sendErrorToService(errorInfo);
    }

    static sendErrorToService(errorInfo) {
        // Implémentation pour envoyer les erreurs à un service externe
        // Par exemple: Sentry, LogRocket, etc.
        try {
            // fetch('/api/errors', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(errorInfo)
            // });
        } catch (e) {
            console.warn('Impossible d\'envoyer l\'erreur au service:', e);
        }
    }

    /**
     * Fonctions de performance
     */
    static measurePerformance(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        
        console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
        return result;
    }

    /**
     * Fonction unifiée pour mesurer les FPS
     * @param {Function} callback - Fonction appelée avec la valeur FPS
     * @param {number} duration - Durée de mesure en ms (défaut: 1000)
     * @param {number} threshold - Seuil d'alerte FPS (défaut: 30)
     * @returns {Function} Fonction pour arrêter la mesure
     */
    static measureFPS(callback, duration = 1000, threshold = 30) {
        let frameCount = 0;
        let lastTime = performance.now();
        let animationId;
        let isRunning = true;
        
        const measure = (currentTime) => {
            if (!isRunning) return;
            
            frameCount++;
            
            if (currentTime - lastTime >= duration) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                
                // Appeler le callback avec les résultats
                callback({
                    fps,
                    isLow: fps < threshold,
                    timestamp: Date.now()
                });
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            if (isRunning) {
                animationId = requestAnimationFrame(measure);
            }
        };
        
        animationId = requestAnimationFrame(measure);
        
        // Retourner une fonction pour arrêter la mesure
        return () => {
            isRunning = false;
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }

    static async measureAsyncPerformance(name, fn) {
        const start = performance.now();
        const result = await fn();
        const end = performance.now();
        
        console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
        return result;
    }

    /**
     * Fonctions de notification/toast
     */
    static showToast(message, type = 'info', duration = 3000) {
        // Créer ou réutiliser le conteneur de toasts
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
            `;
            document.body.appendChild(toastContainer);
        }

        // Créer le toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            background: ${this.getToastColor(type)};
            color: white;
            padding: 12px 20px;
            margin-bottom: 10px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            pointer-events: auto;
            max-width: 300px;
            word-wrap: break-word;
        `;

        toastContainer.appendChild(toast);

        // Animation d'entrée
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 10);

        // Suppression automatique
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }

    static getToastColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return colors[type] || colors.info;
    }

    /**
     * Fonctions de copie dans le presse-papiers
     */
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Copié dans le presse-papiers', 'success');
            return true;
        } catch (error) {
            console.warn('Erreur copie presse-papiers:', error);
            // Fallback pour les navigateurs plus anciens
            return this.fallbackCopyToClipboard(text);
        }
    }

    static fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            if (successful) {
                this.showToast('Copié dans le presse-papiers', 'success');
            }
            return successful;
        } catch (error) {
            document.body.removeChild(textArea);
            this.showToast('Erreur lors de la copie', 'error');
            return false;
        }
    }
}

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}

// Disponible globalement
window.Utils = Utils;