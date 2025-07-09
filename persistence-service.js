/**
 * Persistence Service - Centralise la gestion de la persistance des données
 * Gère l'auto-sauvegarde, le localStorage, et la synchronisation des données
 */
class PersistenceService {
    constructor(eventManager, stateManager) {
        this.events = eventManager;
        this.state = stateManager;
        this.autoSaveInterval = null;
        this.autoSaveDelay = 30000; // 30 secondes par défaut
        this.maxAge = 24 * 60 * 60 * 1000; // 24 heures
        this.storageKeys = {
            autosave: 'htmltopng-autosave',
            theme: 'htmltopng-theme',
            onboarding: 'onboarding_completed',
            settings: 'htmltopng-settings',
            history: 'htmltopng-history',
            templates: 'htmltopng-templates'
        };
        
        this.init();
    }

    init() {
        this.setupAutoSave();
        this.setupEventListeners();
        this.loadInitialData();
    }

    /**
     * Configure les écouteurs d'événements
     */
    setupEventListeners() {
        // Sauvegarder avant de quitter la page
        window.addEventListener('beforeunload', () => {
            this.saveCurrentState();
        });

        // Sauvegarder lors de changements importants
        this.events.on('content:changed', () => {
            this.debouncedSave();
        });

        this.events.on('settings:changed', (data) => {
            this.saveSettings(data);
        });

        this.events.on('template:saved', (template) => {
            this.saveTemplate(template);
        });

        this.events.on('history:add', (entry) => {
            this.addToHistory(entry);
        });
    }

    /**
     * Configure la sauvegarde automatique
     */
    setupAutoSave() {
        // Créer une version debouncée de la sauvegarde
        this.debouncedSave = this.debounce(() => {
            this.saveCurrentState();
        }, 2000); // Attendre 2 secondes après le dernier changement

        // Sauvegarde périodique
        this.autoSaveInterval = setInterval(() => {
            this.saveCurrentState();
        }, this.autoSaveDelay);
    }

    /**
     * Charge les données initiales
     */
    loadInitialData() {
        this.loadAutoSavedData();
        this.loadSettings();
        this.loadTemplates();
        this.loadHistory();
    }

    // ==================== AUTO-SAVE ====================

    /**
     * Sauvegarde l'état actuel de l'application
     */
    saveCurrentState() {
        const htmlInput = document.getElementById('htmlInput');
        const cssInput = document.getElementById('cssInput');
        const widthInput = document.getElementById('widthInput');
        const heightInput = document.getElementById('heightInput');
        const formatSelect = document.getElementById('formatSelect');
        
        if (!htmlInput || !cssInput || !widthInput || !heightInput) {
            return false;
        }
        
        const saveData = {
            html: htmlInput.value,
            css: cssInput.value,
            width: widthInput.value,
            height: heightInput.value,
            format: formatSelect ? formatSelect.value : 'png',
            timestamp: Date.now(),
            version: '1.0'
        };
        
        return this.setItem(this.storageKeys.autosave, saveData);
    }

    /**
     * Charge les données auto-sauvegardées
     */
    loadAutoSavedData() {
        const savedData = this.getItem(this.storageKeys.autosave);
        if (!savedData) return false;
        
        // Vérifier l'âge des données
        if (Date.now() - savedData.timestamp > this.maxAge) {
            this.removeItem(this.storageKeys.autosave);
            return false;
        }
        
        try {
            const htmlInput = document.getElementById('htmlInput');
            const cssInput = document.getElementById('cssInput');
            const widthInput = document.getElementById('widthInput');
            const heightInput = document.getElementById('heightInput');
            const formatSelect = document.getElementById('formatSelect');
            
            if (htmlInput && savedData.html !== undefined) htmlInput.value = savedData.html;
            if (cssInput && savedData.css !== undefined) cssInput.value = savedData.css;
            if (widthInput && savedData.width !== undefined) widthInput.value = savedData.width;
            if (heightInput && savedData.height !== undefined) heightInput.value = savedData.height;
            if (formatSelect && savedData.format !== undefined) formatSelect.value = savedData.format;
            
            // Notifier que les données ont été chargées
            this.events.emit('persistence:autosave:loaded', savedData);
            
            // Mettre à jour la prévisualisation si du contenu existe
            if (savedData.html || savedData.css) {
                setTimeout(() => {
                    this.events.emit('preview:update');
                }, 500);
            }
            
            return true;
        } catch (error) {
            console.warn('Erreur lors du chargement des données auto-sauvegardées:', error);
            this.events.emit('persistence:autosave:error', error);
            return false;
        }
    }

    // ==================== SETTINGS ====================

    /**
     * Sauvegarde les paramètres de l'application
     * @param {Object} settings - Les paramètres à sauvegarder
     */
    saveSettings(settings) {
        const currentSettings = this.getItem(this.storageKeys.settings) || {};
        const updatedSettings = { ...currentSettings, ...settings, timestamp: Date.now() };
        
        return this.setItem(this.storageKeys.settings, updatedSettings);
    }

    /**
     * Charge les paramètres de l'application
     * @returns {Object} Les paramètres chargés
     */
    loadSettings() {
        const settings = this.getItem(this.storageKeys.settings) || {};
        this.events.emit('persistence:settings:loaded', settings);
        return settings;
    }

    /**
     * Obtient un paramètre spécifique
     * @param {string} key - La clé du paramètre
     * @param {*} defaultValue - Valeur par défaut
     * @returns {*} La valeur du paramètre
     */
    getSetting(key, defaultValue = null) {
        const settings = this.getItem(this.storageKeys.settings) || {};
        return settings[key] !== undefined ? settings[key] : defaultValue;
    }

    /**
     * Définit un paramètre spécifique
     * @param {string} key - La clé du paramètre
     * @param {*} value - La valeur à définir
     */
    setSetting(key, value) {
        const settings = this.getItem(this.storageKeys.settings) || {};
        settings[key] = value;
        settings.timestamp = Date.now();
        
        this.setItem(this.storageKeys.settings, settings);
        this.events.emit('persistence:setting:changed', { key, value });
    }

    // ==================== TEMPLATES ====================

    /**
     * Sauvegarde un template
     * @param {Object} template - Le template à sauvegarder
     */
    saveTemplate(template) {
        const templates = this.getItem(this.storageKeys.templates) || [];
        
        // Ajouter un ID unique si pas présent
        if (!template.id) {
            template.id = 'template_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        
        template.timestamp = Date.now();
        
        // Vérifier si le template existe déjà
        const existingIndex = templates.findIndex(t => t.id === template.id);
        if (existingIndex >= 0) {
            templates[existingIndex] = template;
        } else {
            templates.push(template);
        }
        
        this.setItem(this.storageKeys.templates, templates);
        this.events.emit('persistence:template:saved', template);
        
        return template.id;
    }

    /**
     * Charge tous les templates
     * @returns {Array} Liste des templates
     */
    loadTemplates() {
        const templates = this.getItem(this.storageKeys.templates) || [];
        this.events.emit('persistence:templates:loaded', templates);
        return templates;
    }

    /**
     * Supprime un template
     * @param {string} templateId - L'ID du template à supprimer
     */
    deleteTemplate(templateId) {
        const templates = this.getItem(this.storageKeys.templates) || [];
        const filteredTemplates = templates.filter(t => t.id !== templateId);
        
        this.setItem(this.storageKeys.templates, filteredTemplates);
        this.events.emit('persistence:template:deleted', { templateId });
        
        return filteredTemplates.length < templates.length;
    }

    // ==================== HISTORY ====================

    /**
     * Ajoute une entrée à l'historique
     * @param {Object} entry - L'entrée à ajouter
     */
    addToHistory(entry) {
        const history = this.getItem(this.storageKeys.history) || [];
        
        entry.id = 'history_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        entry.timestamp = Date.now();
        
        // Ajouter au début de l'historique
        history.unshift(entry);
        
        // Limiter la taille de l'historique (garder les 50 dernières entrées)
        if (history.length > 50) {
            history.splice(50);
        }
        
        this.setItem(this.storageKeys.history, history);
        this.events.emit('persistence:history:added', entry);
        
        return entry.id;
    }

    /**
     * Charge l'historique
     * @returns {Array} L'historique
     */
    loadHistory() {
        const history = this.getItem(this.storageKeys.history) || [];
        this.events.emit('persistence:history:loaded', history);
        return history;
    }

    /**
     * Nettoie l'historique ancien
     * @param {number} maxAge - Âge maximum en millisecondes
     */
    cleanHistory(maxAge = this.maxAge * 7) { // 7 jours par défaut
        const history = this.getItem(this.storageKeys.history) || [];
        const cutoff = Date.now() - maxAge;
        const cleanedHistory = history.filter(entry => entry.timestamp > cutoff);
        
        this.setItem(this.storageKeys.history, cleanedHistory);
        this.events.emit('persistence:history:cleaned', { 
            removed: history.length - cleanedHistory.length 
        });
        
        return cleanedHistory;
    }

    // ==================== UTILITY METHODS ====================

    /**
     * Sauvegarde un élément dans le localStorage avec gestion d'erreurs
     * @param {string} key - La clé de stockage
     * @param {*} value - La valeur à stocker
     * @returns {boolean} Succès de l'opération
     */
    setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            this.events.emit('persistence:save:success', { key });
            return true;
        } catch (error) {
            console.warn(`Erreur lors de la sauvegarde de ${key}:`, error);
            this.events.emit('persistence:save:error', { key, error });
            return false;
        }
    }

    /**
     * Récupère un élément du localStorage avec gestion d'erreurs
     * @param {string} key - La clé de stockage
     * @returns {*} La valeur récupérée ou null
     */
    getItem(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.warn(`Erreur lors du chargement de ${key}:`, error);
            this.events.emit('persistence:load:error', { key, error });
            return null;
        }
    }

    /**
     * Supprime un élément du localStorage
     * @param {string} key - La clé à supprimer
     * @returns {boolean} Succès de l'opération
     */
    removeItem(key) {
        try {
            localStorage.removeItem(key);
            this.events.emit('persistence:remove:success', { key });
            return true;
        } catch (error) {
            console.warn(`Erreur lors de la suppression de ${key}:`, error);
            this.events.emit('persistence:remove:error', { key, error });
            return false;
        }
    }

    /**
     * Nettoie toutes les données de l'application
     */
    clearAllData() {
        Object.values(this.storageKeys).forEach(key => {
            this.removeItem(key);
        });
        
        this.events.emit('persistence:cleared');
    }

    /**
     * Exporte toutes les données de l'application
     * @returns {Object} Les données exportées
     */
    exportData() {
        const data = {};
        
        Object.entries(this.storageKeys).forEach(([name, key]) => {
            data[name] = this.getItem(key);
        });
        
        data.exportTimestamp = Date.now();
        data.version = '1.0';
        
        return data;
    }

    /**
     * Importe des données dans l'application
     * @param {Object} data - Les données à importer
     * @returns {boolean} Succès de l'opération
     */
    importData(data) {
        try {
            Object.entries(this.storageKeys).forEach(([name, key]) => {
                if (data[name] !== undefined) {
                    this.setItem(key, data[name]);
                }
            });
            
            this.events.emit('persistence:imported', data);
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'importation:', error);
            this.events.emit('persistence:import:error', error);
            return false;
        }
    }

    /**
     * Fonction utilitaire de debounce
     * @param {Function} func - La fonction à debouncer
     * @param {number} wait - Le délai d'attente
     * @returns {Function} La fonction debouncée
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Configure le délai d'auto-sauvegarde
     * @param {number} delay - Le nouveau délai en millisecondes
     */
    setAutoSaveDelay(delay) {
        this.autoSaveDelay = delay;
        
        // Redémarrer l'intervalle avec le nouveau délai
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = setInterval(() => {
                this.saveCurrentState();
            }, this.autoSaveDelay);
        }
        
        this.events.emit('persistence:autosave:delay:changed', { delay });
    }

    /**
     * Nettoie le service
     */
    destroy() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
        
        // Sauvegarder une dernière fois
        this.saveCurrentState();
    }
}

// Export pour utilisation en module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PersistenceService;
}