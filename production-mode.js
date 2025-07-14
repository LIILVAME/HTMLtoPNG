/**
 * Production Mode Script
 * À inclure en premier dans index.html pour la production
 */

(function() {
    'use strict';
    
    // Détection de l'environnement de production
    const isProduction = window.location.hostname !== 'localhost' && 
                        window.location.hostname !== '127.0.0.1' &&
                        !window.location.hostname.includes('github.io') &&
                        !window.location.search.includes('debug=true');
    
    if (isProduction) {
        // Désactiver tous les console statements
        const noop = function() {};
        console.log = noop;
        console.warn = noop;
        console.error = noop;
        console.debug = noop;
        console.info = noop;
        console.trace = noop;
        console.group = noop;
        console.groupEnd = noop;
        console.groupCollapsed = noop;
        
        // Désactiver les outils de développement
        document.addEventListener('keydown', function(e) {
            // F12
            if (e.keyCode === 123) {
                e.preventDefault();
                return false;
            }
            // Ctrl+Shift+I
            if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
                e.preventDefault();
                return false;
            }
            // Ctrl+Shift+C
            if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
                e.preventDefault();
                return false;
            }
            // Ctrl+U
            if (e.ctrlKey && e.keyCode === 85) {
                e.preventDefault();
                return false;
            }
        });
        
        // Désactiver le clic droit
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });
        
        // Désactiver la sélection de texte sur les éléments sensibles
        document.addEventListener('selectstart', function(e) {
            if (e.target.classList.contains('no-select')) {
                e.preventDefault();
                return false;
            }
        });
    }
    
    // Configuration globale de production
    window.PRODUCTION_CONFIG = {
        isProduction: isProduction,
        enableDebugMode: !isProduction,
        enableConsoleLogging: !isProduction,
        enablePerformanceMonitoring: true,
        enableErrorReporting: isProduction,
        minifyOutput: isProduction,
        cacheEnabled: isProduction,
        compressionEnabled: isProduction
    };
    
    // Override des configurations de debug
    if (isProduction && typeof Config !== 'undefined') {
        // Forcer la désactivation du debug dans tous les environnements
        const originalGet = Config.get;
        Config.get = function(key, defaultValue) {
            if (key === 'DEV.enableDebugMode') {
                return false;
            }
            if (key.includes('debug') || key.includes('Debug')) {
                return false;
            }
            return originalGet.call(this, key, defaultValue);
        };
    }
    
    // Nettoyage des variables globales de debug
    if (isProduction) {
        window.addEventListener('load', function() {
            // Supprimer les commandes de debug après un délai
            setTimeout(function() {
                delete window.debugTests;
                delete window.debugMonitor;
                delete window.debugLauncher;
                delete window.debugToolbar;
                delete window.productionCleanup;
            }, 5000);
        });
    }
    
    // Monitoring des performances en production
    if (isProduction && typeof performance !== 'undefined') {
        performance.mark('production-mode-start');
        
        window.addEventListener('load', function() {
            performance.mark('production-mode-loaded');
            performance.measure('production-mode-time', 'production-mode-start', 'production-mode-loaded');
            
            // Envoyer les métriques (si service d'analytics configuré)
            const loadTime = performance.getEntriesByName('production-mode-time')[0];
            if (loadTime && typeof gtag !== 'undefined') {
                gtag('event', 'page_load_time', {
                    value: Math.round(loadTime.duration),
                    custom_parameter: 'production_mode'
                });
            }
        });
    }
    
    // Protection contre l'inspection du code
    if (isProduction) {
        // Détection des DevTools
        let devtools = {
            open: false,
            orientation: null
        };
        
        const threshold = 160;
        
        setInterval(function() {
            if (window.outerHeight - window.innerHeight > threshold || 
                window.outerWidth - window.innerWidth > threshold) {
                if (!devtools.open) {
                    devtools.open = true;
                    // Rediriger ou masquer le contenu
                    document.body.style.display = 'none';
                    alert('Cette application n\'est pas disponible en mode développeur.');
                    window.location.href = 'about:blank';
                }
            } else {
                devtools.open = false;
                document.body.style.display = 'block';
            }
        }, 500);
    }
    
    // Log de confirmation (uniquement en développement)
    if (!isProduction) {
        console.log('🔧 Mode développement activé');
        console.log('📊 Configuration:', window.PRODUCTION_CONFIG);
    }
    
})();