/**
 * Keyboard Service - Centralise la gestion des raccourcis clavier
 * Permet d'enregistrer, désactiver et gérer les raccourcis de manière modulaire
 */
class KeyboardService {
    constructor(eventManager) {
        this.events = eventManager;
        this.shortcuts = new Map();
        this.isEnabled = true;
        this.init();
    }

    init() {
        this.setupGlobalListener();
        this.registerDefaultShortcuts();
    }

    /**
     * Configure l'écouteur global pour les raccourcis clavier
     */
    setupGlobalListener() {
        document.addEventListener('keydown', (e) => {
            if (!this.isEnabled) return;
            
            const key = this.getKeyString(e);
            const shortcut = this.shortcuts.get(key);
            
            if (shortcut && this.shouldExecuteShortcut(e, shortcut)) {
                e.preventDefault();
                shortcut.callback(e);
            }
        });
    }

    /**
     * Génère une chaîne unique pour identifier un raccourci
     * @param {KeyboardEvent} e - L'événement clavier
     * @returns {string} La chaîne d'identification
     */
    getKeyString(e) {
        const parts = [];
        
        if (e.ctrlKey || e.metaKey) parts.push('ctrl');
        if (e.altKey) parts.push('alt');
        if (e.shiftKey) parts.push('shift');
        
        parts.push(e.key.toLowerCase());
        
        return parts.join('+');
    }

    /**
     * Vérifie si un raccourci doit être exécuté
     * @param {KeyboardEvent} e - L'événement clavier
     * @param {Object} shortcut - Le raccourci à vérifier
     * @returns {boolean} True si le raccourci doit être exécuté
     */
    shouldExecuteShortcut(e, shortcut) {
        // Ignorer si on est dans un champ de saisie et que le raccourci n'est pas global
        if (!shortcut.global && this.isInInputField(e.target)) {
            return false;
        }
        
        // Vérifier les conditions spécifiques
        if (shortcut.condition && !shortcut.condition()) {
            return false;
        }
        
        return true;
    }

    /**
     * Vérifie si l'élément cible est un champ de saisie
     * @param {Element} target - L'élément cible
     * @returns {boolean} True si c'est un champ de saisie
     */
    isInInputField(target) {
        const inputTypes = ['input', 'textarea', 'select'];
        return inputTypes.includes(target.tagName.toLowerCase()) || 
               target.contentEditable === 'true';
    }

    /**
     * Enregistre un nouveau raccourci clavier
     * @param {string} keys - Les touches du raccourci (ex: 'ctrl+enter')
     * @param {Function} callback - La fonction à exécuter
     * @param {Object} options - Options du raccourci
     */
    register(keys, callback, options = {}) {
        const shortcut = {
            keys: keys.toLowerCase(),
            callback,
            description: options.description || '',
            global: options.global || false,
            condition: options.condition || null,
            category: options.category || 'general'
        };
        
        this.shortcuts.set(keys.toLowerCase(), shortcut);
        
        this.events.emit('keyboard:shortcut:registered', {
            keys,
            description: shortcut.description,
            category: shortcut.category
        });
    }

    /**
     * Supprime un raccourci clavier
     * @param {string} keys - Les touches du raccourci à supprimer
     */
    unregister(keys) {
        const removed = this.shortcuts.delete(keys.toLowerCase());
        
        if (removed) {
            this.events.emit('keyboard:shortcut:unregistered', { keys });
        }
        
        return removed;
    }

    /**
     * Active ou désactive tous les raccourcis
     * @param {boolean} enabled - État d'activation
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        this.events.emit('keyboard:enabled:changed', { enabled });
    }

    /**
     * Retourne la liste de tous les raccourcis enregistrés
     * @returns {Array} Liste des raccourcis
     */
    getShortcuts() {
        return Array.from(this.shortcuts.entries()).map(([keys, shortcut]) => ({
            keys,
            description: shortcut.description,
            category: shortcut.category,
            global: shortcut.global
        }));
    }

    /**
     * Retourne les raccourcis par catégorie
     * @param {string} category - La catégorie à filtrer
     * @returns {Array} Liste des raccourcis de la catégorie
     */
    getShortcutsByCategory(category) {
        return this.getShortcuts().filter(shortcut => shortcut.category === category);
    }

    /**
     * Enregistre les raccourcis par défaut de l'application
     */
    registerDefaultShortcuts() {
        // Raccourcis de conversion
        this.register('ctrl+enter', () => {
            this.events.emit('conversion:start');
        }, {
            description: 'Convertir en image',
            category: 'conversion',
            global: true
        });

        // Raccourcis de sauvegarde
        this.register('ctrl+s', () => {
            this.events.emit('image:download');
        }, {
            description: 'Télécharger l\'image',
            category: 'file',
            global: true,
            condition: () => {
                // Vérifier qu'une image a été générée
                return document.querySelector('.download-btn:not([disabled])');
            }
        });

        // Raccourcis de prévisualisation
        this.register('ctrl+r', () => {
            this.events.emit('preview:refresh');
        }, {
            description: 'Rafraîchir la prévisualisation',
            category: 'preview',
            global: true
        });

        this.register('f11', () => {
            this.events.emit('preview:expand');
        }, {
            description: 'Agrandir la prévisualisation',
            category: 'preview',
            global: true
        });

        // Raccourcis d'interface
        this.register('ctrl+d', () => {
            this.events.emit('theme:toggle');
        }, {
            description: 'Basculer le thème',
            category: 'interface',
            global: true
        });

        // Raccourcis d'aide
        this.register('f1', () => {
            this.events.emit('help:show');
        }, {
            description: 'Afficher l\'aide',
            category: 'help',
            global: true
        });

        this.register('escape', () => {
            this.events.emit('modal:close');
        }, {
            description: 'Fermer les modales',
            category: 'interface',
            global: true
        });

        // Raccourcis de navigation
        this.register('ctrl+1', () => {
            this.events.emit('tab:switch', { tab: 'html' });
        }, {
            description: 'Aller à l\'onglet HTML',
            category: 'navigation'
        });

        this.register('ctrl+2', () => {
            this.events.emit('tab:switch', { tab: 'css' });
        }, {
            description: 'Aller à l\'onglet CSS',
            category: 'navigation'
        });

        // Raccourcis de formatage (dans les éditeurs)
        this.register('ctrl+/', () => {
            this.events.emit('editor:toggle:comment');
        }, {
            description: 'Commenter/décommenter',
            category: 'editor'
        });

        this.register('ctrl+shift+f', () => {
            this.events.emit('editor:format');
        }, {
            description: 'Formater le code',
            category: 'editor'
        });
    }

    /**
     * Affiche l'aide des raccourcis clavier
     */
    showHelp() {
        const shortcuts = this.getShortcuts();
        const groupedShortcuts = shortcuts.reduce((groups, shortcut) => {
            const category = shortcut.category;
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(shortcut);
            return groups;
        }, {});

        this.events.emit('help:shortcuts:show', { shortcuts: groupedShortcuts });
    }

    /**
     * Nettoie le service
     */
    destroy() {
        this.shortcuts.clear();
        this.setEnabled(false);
    }
}

// Export pour utilisation en module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KeyboardService;
}

// Export global pour utilisation dans le navigateur
if (typeof window !== 'undefined') {
    window.KeyboardService = KeyboardService;
}