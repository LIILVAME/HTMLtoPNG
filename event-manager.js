/**
 * Gestionnaire d'événements centralisé
 * Évite la duplication des écouteurs d'événements et centralise leur gestion
 */

class EventManager {
    constructor() {
        this.listeners = new Map();
        this.globalListeners = new Map();
        this.eventQueue = [];
        this.isProcessing = false;
        this.debugMode = Config.get('DEV.enableDebugMode', false);
    }

    /**
     * Ajouter un écouteur d'événement avec gestion automatique
     */
    on(element, eventType, handler, options = {}) {
        const listenerId = Utils.generateId('listener');
        const elementKey = this.getElementKey(element);
        
        // Créer l'entrée pour l'élément si elle n'existe pas
        if (!this.listeners.has(elementKey)) {
            this.listeners.set(elementKey, new Map());
        }
        
        const elementListeners = this.listeners.get(elementKey);
        
        // Créer l'entrée pour le type d'événement si elle n'existe pas
        if (!elementListeners.has(eventType)) {
            elementListeners.set(eventType, new Map());
        }
        
        const typeListeners = elementListeners.get(eventType);
        
        // Wrapper pour le handler avec fonctionnalités supplémentaires
        const wrappedHandler = this.createWrappedHandler(handler, options);
        
        // Ajouter l'écouteur
        element.addEventListener(eventType, wrappedHandler, options.native || false);
        
        // Stocker les informations pour pouvoir supprimer l'écouteur plus tard
        typeListeners.set(listenerId, {
            handler: wrappedHandler,
            originalHandler: handler,
            options,
            element,
            eventType,
            createdAt: Date.now()
        });
        
        if (this.debugMode) {
            console.log(`📡 EventManager: Ajout écouteur ${eventType} sur`, element);
        }
        
        return listenerId;
    }

    /**
     * Supprimer un écouteur d'événement
     */
    off(listenerId) {
        for (const [elementKey, elementListeners] of this.listeners) {
            for (const [eventType, typeListeners] of elementListeners) {
                if (typeListeners.has(listenerId)) {
                    const listenerInfo = typeListeners.get(listenerId);
                    
                    // Supprimer l'écouteur du DOM
                    listenerInfo.element.removeEventListener(
                        listenerInfo.eventType,
                        listenerInfo.handler,
                        listenerInfo.options.native || false
                    );
                    
                    // Supprimer de notre registre
                    typeListeners.delete(listenerId);
                    
                    if (this.debugMode) {
                        console.log(`📡 EventManager: Suppression écouteur ${listenerInfo.eventType}`);
                    }
                    
                    return true;
                }
            }
        }
        
        return false;
    }

    /**
     * Supprimer tous les écouteurs d'un élément
     */
    offElement(element) {
        const elementKey = this.getElementKey(element);
        const elementListeners = this.listeners.get(elementKey);
        
        if (!elementListeners) return 0;
        
        let removedCount = 0;
        
        for (const [eventType, typeListeners] of elementListeners) {
            for (const [listenerId, listenerInfo] of typeListeners) {
                element.removeEventListener(
                    eventType,
                    listenerInfo.handler,
                    listenerInfo.options.native || false
                );
                removedCount++;
            }
        }
        
        this.listeners.delete(elementKey);
        
        if (this.debugMode) {
            console.log(`📡 EventManager: Suppression ${removedCount} écouteurs de l'élément`);
        }
        
        return removedCount;
    }

    /**
     * Ajouter un écouteur global (document/window)
     */
    onGlobal(target, eventType, handler, options = {}) {
        const targetElement = target === 'document' ? document : window;
        const listenerId = this.on(targetElement, eventType, handler, options);
        
        // Marquer comme global pour un nettoyage facile
        this.globalListeners.set(listenerId, {
            target,
            eventType,
            handler
        });
        
        return listenerId;
    }

    /**
     * Créer un wrapper pour le handler avec fonctionnalités supplémentaires
     */
    createWrappedHandler(handler, options) {
        return (event) => {
            try {
                // Throttling
                if (options.throttle) {
                    if (!handler._throttled) {
                        handler._throttled = Utils.throttle(handler, options.throttle);
                    }
                    return handler._throttled(event);
                }
                
                // Debouncing
                if (options.debounce) {
                    if (!handler._debounced) {
                        handler._debounced = Utils.debounce(handler, options.debounce);
                    }
                    return handler._debounced(event);
                }
                
                // Condition d'exécution
                if (options.condition && !options.condition(event)) {
                    return;
                }
                
                // Exécution normale
                const result = handler(event);
                
                // Logging en mode debug
                if (this.debugMode && options.debug) {
                    console.log(`📡 Event ${event.type}:`, event, result);
                }
                
                return result;
                
            } catch (error) {
                console.error('Erreur dans le gestionnaire d\'événement:', error);
                Utils.logError(error, `EventManager handler for ${event.type}`);
                
                // Ne pas propager l'erreur pour éviter de casser l'application
                if (!options.propagateErrors) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
        };
    }

    /**
     * Obtenir une clé unique pour un élément
     */
    getElementKey(element) {
        if (element === document) return 'document';
        if (element === window) return 'window';
        
        // Utiliser l'ID s'il existe
        if (element.id) {
            return `#${element.id}`;
        }
        
        // Sinon, créer une clé basée sur la position dans le DOM
        const path = [];
        let current = element;
        
        while (current && current !== document.body) {
            const index = Array.from(current.parentNode?.children || []).indexOf(current);
            path.unshift(`${current.tagName.toLowerCase()}[${index}]`);
            current = current.parentNode;
        }
        
        return path.join(' > ');
    }

    /**
     * Émettre un événement personnalisé
     */
    emit(eventName, detail = {}, target = document) {
        const customEvent = new CustomEvent(eventName, {
            detail,
            bubbles: true,
            cancelable: true
        });
        
        target.dispatchEvent(customEvent);
        
        if (this.debugMode) {
            console.log(`📡 EventManager: Émission événement ${eventName}`, detail);
        }
        
        return customEvent;
    }

    /**
     * Ajouter un événement à la file d'attente pour traitement différé
     */
    queue(eventName, detail = {}, target = document) {
        this.eventQueue.push({ eventName, detail, target, timestamp: Date.now() });
        
        if (!this.isProcessing) {
            this.processQueue();
        }
    }

    /**
     * Traiter la file d'attente d'événements
     */
    async processQueue() {
        if (this.isProcessing || this.eventQueue.length === 0) return;
        
        this.isProcessing = true;
        
        while (this.eventQueue.length > 0) {
            const event = this.eventQueue.shift();
            
            try {
                this.emit(event.eventName, event.detail, event.target);
                
                // Petite pause pour éviter de bloquer le thread principal
                await Utils.delay(1);
                
            } catch (error) {
                console.error('Erreur lors du traitement de la file d\'événements:', error);
            }
        }
        
        this.isProcessing = false;
    }

    /**
     * Obtenir des statistiques sur les écouteurs
     */
    getStats() {
        let totalListeners = 0;
        let elementCount = 0;
        const eventTypes = new Set();
        
        for (const [elementKey, elementListeners] of this.listeners) {
            elementCount++;
            
            for (const [eventType, typeListeners] of elementListeners) {
                eventTypes.add(eventType);
                totalListeners += typeListeners.size;
            }
        }
        
        return {
            totalListeners,
            elementCount,
            eventTypes: Array.from(eventTypes),
            globalListeners: this.globalListeners.size,
            queuedEvents: this.eventQueue.length
        };
    }

    /**
     * Nettoyer tous les écouteurs
     */
    cleanup() {
        let removedCount = 0;
        
        // Supprimer tous les écouteurs
        for (const [elementKey, elementListeners] of this.listeners) {
            for (const [eventType, typeListeners] of elementListeners) {
                for (const [listenerId, listenerInfo] of typeListeners) {
                    listenerInfo.element.removeEventListener(
                        eventType,
                        listenerInfo.handler,
                        listenerInfo.options.native || false
                    );
                    removedCount++;
                }
            }
        }
        
        // Vider les registres
        this.listeners.clear();
        this.globalListeners.clear();
        this.eventQueue.length = 0;
        
        if (this.debugMode) {
            console.log(`📡 EventManager: Nettoyage complet - ${removedCount} écouteurs supprimés`);
        }
        
        return removedCount;
    }

    /**
     * Méthodes de convenance pour les événements courants
     */
    onClick(element, handler, options = {}) {
        return this.on(element, 'click', handler, options);
    }

    onInput(element, handler, options = {}) {
        return this.on(element, 'input', handler, {
            debounce: Config.get('UI.debounceDelay', 300),
            ...options
        });
    }

    onMouseMove(element, handler, options = {}) {
        return this.on(element, 'mousemove', handler, {
            throttle: Config.get('UI.throttleDelay', 100),
            ...options
        });
    }

    onScroll(element, handler, options = {}) {
        return this.on(element, 'scroll', handler, {
            throttle: Config.get('UI.throttleDelay', 100),
            ...options
        });
    }

    onResize(handler, options = {}) {
        return this.onGlobal('window', 'resize', handler, {
            throttle: 250,
            ...options
        });
    }

    onKeydown(handler, options = {}) {
        return this.onGlobal('document', 'keydown', handler, options);
    }

    onBeforeUnload(handler, options = {}) {
        return this.onGlobal('window', 'beforeunload', handler, options);
    }
}

// Instance globale
const eventManager = new EventManager();

// Nettoyage automatique avant fermeture
eventManager.onBeforeUnload(() => {
    eventManager.cleanup();
});

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EventManager, eventManager };
}

// Disponible globalement
window.EventManager = EventManager;
window.eventManager = eventManager;