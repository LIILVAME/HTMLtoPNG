/**
 * Système de monitoring en temps réel
 * Surveillance continue des performances et détection d'anomalies
 */

class RealTimeMonitor {
    constructor() {
        this.metrics = {
            performance: [],
            errors: [],
            userActions: [],
            systemHealth: {
                memory: [],
                fps: [],
                loadTimes: []
            }
        };
        this.thresholds = {
            maxMemoryMB: 150,
            minFPS: 30,
            maxLoadTimeMS: 3000,
            maxErrorRate: 0.05
        };
        this.alerts = [];
        this.isMonitoring = false;
        this.init();
    }

    init() {
        console.log('📊 Monitoring en temps réel initialisé');
        this.startMonitoring();
        this.setupErrorTracking();
        this.setupPerformanceObserver();
        this.setupUserActionTracking();
        this.createMonitoringUI();
    }

    // Démarrer le monitoring
    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        
        // Monitoring des performances toutes les 5 secondes
        this.performanceInterval = setInterval(() => {
            this.collectPerformanceMetrics();
        }, 5000);
        
        // Monitoring de la mémoire toutes les 10 secondes
        this.memoryInterval = setInterval(() => {
            this.collectMemoryMetrics();
        }, 10000);
        
        // Monitoring des FPS en continu
        this.startFPSMonitoring();
        
        console.log('🟢 Monitoring démarré');
    }

    // Arrêter le monitoring
    stopMonitoring() {
        this.isMonitoring = false;
        
        if (this.performanceInterval) clearInterval(this.performanceInterval);
        if (this.memoryInterval) clearInterval(this.memoryInterval);
        if (this.fpsMonitoring) cancelAnimationFrame(this.fpsMonitoring);
        
        console.log('🔴 Monitoring arrêté');
    }

    // Collecter les métriques de performance
    collectPerformanceMetrics() {
        const now = performance.now();
        const navigation = performance.getEntriesByType('navigation')[0];
        
        if (navigation) {
            const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
            const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
            
            const metric = {
                timestamp: Date.now(),
                loadTime,
                domContentLoaded,
                timeToFirstByte: navigation.responseStart - navigation.requestStart,
                domInteractive: navigation.domInteractive - navigation.navigationStart
            };
            
            this.metrics.performance.push(metric);
            
            // Vérifier les seuils
            if (loadTime > this.thresholds.maxLoadTimeMS) {
                this.createAlert('performance', `Temps de chargement élevé: ${loadTime.toFixed(0)}ms`, 'warning');
            }
        }
        
        // Limiter l'historique
        if (this.metrics.performance.length > 100) {
            this.metrics.performance = this.metrics.performance.slice(-50);
        }
    }

    // Collecter les métriques de mémoire
    collectMemoryMetrics() {
        if (!performance.memory) return;
        
        const memoryUsage = {
            timestamp: Date.now(),
            used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
            total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
            limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
        };
        
        this.metrics.systemHealth.memory.push(memoryUsage);
        
        // Vérifier les seuils
        if (memoryUsage.used > this.thresholds.maxMemoryMB) {
            this.createAlert('memory', `Utilisation mémoire élevée: ${memoryUsage.used}MB`, 'warning');
        }
        
        // Limiter l'historique
        if (this.metrics.systemHealth.memory.length > 50) {
            this.metrics.systemHealth.memory = this.metrics.systemHealth.memory.slice(-25);
        }
    }

    // Monitoring des FPS
    startFPSMonitoring() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const measureFPS = (currentTime) => {
            frameCount++;
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                
                this.metrics.systemHealth.fps.push({
                    timestamp: Date.now(),
                    fps
                });
                
                // Vérifier les seuils
                if (fps < this.thresholds.minFPS) {
                    this.createAlert('fps', `FPS faible détecté: ${fps}`, 'warning');
                }
                
                frameCount = 0;
                lastTime = currentTime;
                
                // Limiter l'historique
                if (this.metrics.systemHealth.fps.length > 60) {
                    this.metrics.systemHealth.fps = this.metrics.systemHealth.fps.slice(-30);
                }
            }
            
            if (this.isMonitoring) {
                this.fpsMonitoring = requestAnimationFrame(measureFPS);
            }
        };
        
        this.fpsMonitoring = requestAnimationFrame(measureFPS);
    }

    // Configuration du suivi d'erreurs
    setupErrorTracking() {
        // Erreurs JavaScript
        window.addEventListener('error', (event) => {
            this.logError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error ? event.error.stack : null,
                timestamp: Date.now()
            });
        });
        
        // Promesses rejetées
        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                type: 'promise',
                message: event.reason.toString(),
                stack: event.reason.stack,
                timestamp: Date.now()
            });
        });
        
        // Erreurs de ressources
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.logError({
                    type: 'resource',
                    message: `Failed to load: ${event.target.src || event.target.href}`,
                    element: event.target.tagName,
                    timestamp: Date.now()
                });
            }
        }, true);
    }

    // Enregistrer une erreur
    logError(error) {
        this.metrics.errors.push(error);
        
        // Créer une alerte pour les erreurs critiques
        if (error.type === 'javascript' || error.type === 'promise') {
            this.createAlert('error', `Erreur ${error.type}: ${error.message}`, 'error');
        }
        
        // Limiter l'historique des erreurs
        if (this.metrics.errors.length > 100) {
            this.metrics.errors = this.metrics.errors.slice(-50);
        }
        
        console.error('🚨 Erreur détectée:', error);
    }

    // Configuration de l'observateur de performance
    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            // Observer les métriques de peinture
            const paintObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.name === 'first-contentful-paint') {
                        this.metrics.systemHealth.loadTimes.push({
                            type: 'fcp',
                            value: entry.startTime,
                            timestamp: Date.now()
                        });
                    }
                }
            });
            
            try {
                paintObserver.observe({ entryTypes: ['paint'] });
            } catch (e) {
                console.warn('Paint observer non supporté');
            }
            
            // Observer les métriques de navigation
            const navObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.metrics.systemHealth.loadTimes.push({
                        type: 'navigation',
                        value: entry.duration,
                        timestamp: Date.now()
                    });
                }
            });
            
            try {
                navObserver.observe({ entryTypes: ['navigation'] });
            } catch (e) {
                console.warn('Navigation observer non supporté');
            }
        }
    }

    // Suivi des actions utilisateur
    setupUserActionTracking() {
        const trackAction = (type, target) => {
            this.metrics.userActions.push({
                type,
                target: target.tagName + (target.id ? `#${target.id}` : '') + (target.className ? `.${target.className.split(' ')[0]}` : ''),
                timestamp: Date.now()
            });
            
            // Limiter l'historique
            if (this.metrics.userActions.length > 200) {
                this.metrics.userActions = this.metrics.userActions.slice(-100);
            }
        };
        
        // Clics
        document.addEventListener('click', (e) => {
            trackAction('click', e.target);
        });
        
        // Survols (throttled)
        let hoverTimeout;
        document.addEventListener('mouseover', (e) => {
            clearTimeout(hoverTimeout);
            hoverTimeout = setTimeout(() => {
                trackAction('hover', e.target);
            }, 500);
        });
        
        // Saisie de texte
        document.addEventListener('input', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                trackAction('input', e.target);
            }
        });
    }

    // Créer une alerte
    createAlert(category, message, severity = 'info') {
        const alert = {
            id: Date.now() + Math.random(),
            category,
            message,
            severity,
            timestamp: Date.now()
        };
        
        this.alerts.push(alert);
        
        // Afficher l'alerte
        this.showAlert(alert);
        
        // Limiter le nombre d'alertes
        if (this.alerts.length > 50) {
            this.alerts = this.alerts.slice(-25);
        }
        
        // Auto-correction si possible
        this.attemptAutoFix(alert);
    }

    // Afficher une alerte
    showAlert(alert) {
        const alertElement = document.createElement('div');
        alertElement.style.cssText = `
            position: fixed;
            top: ${20 + (this.getActiveAlerts().length * 70)}px;
            left: 20px;
            background: ${this.getAlertColor(alert.severity)};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 2001;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            max-width: 300px;
            animation: slideInLeft 0.3s ease;
        `;
        
        alertElement.innerHTML = `
            <div style="display: flex; align-items: center;">
                <span style="margin-right: 8px; font-size: 16px;">${this.getAlertIcon(alert.severity)}</span>
                <div>
                    <div style="font-weight: 600; margin-bottom: 2px;">${alert.category.toUpperCase()}</div>
                    <div style="opacity: 0.9;">${alert.message}</div>
                </div>
                <button onclick="this.parentNode.parentNode.remove()" style="
                    margin-left: auto;
                    background: none;
                    border: none;
                    color: white;
                    font-size: 16px;
                    cursor: pointer;
                    opacity: 0.7;
                ">×</button>
            </div>
        `;
        
        document.body.appendChild(alertElement);
        
        // Auto-suppression après 5 secondes pour les alertes info
        if (alert.severity === 'info') {
            setTimeout(() => {
                if (alertElement.parentNode) {
                    alertElement.remove();
                }
            }, 5000);
        }
    }

    // Obtenir les alertes actives
    getActiveAlerts() {
        return document.querySelectorAll('[style*="position: fixed"][style*="top:"]');
    }

    // Couleur selon la sévérité
    getAlertColor(severity) {
        switch (severity) {
            case 'error': return '#e74c3c';
            case 'warning': return '#f39c12';
            case 'success': return '#27ae60';
            default: return '#3498db';
        }
    }

    // Icône selon la sévérité
    getAlertIcon(severity) {
        switch (severity) {
            case 'error': return '🚨';
            case 'warning': return '⚠️';
            case 'success': return '✅';
            default: return 'ℹ️';
        }
    }

    // Tentative d'auto-correction
    attemptAutoFix(alert) {
        switch (alert.category) {
            case 'memory':
                this.fixMemoryIssue();
                break;
            case 'fps':
                this.fixPerformanceIssue();
                break;
            case 'error':
                this.fixErrorIssue(alert);
                break;
        }
    }

    // Correction des problèmes de mémoire
    fixMemoryIssue() {
        // Nettoyer les caches
        if (window.cacheManager) {
            window.cacheManager.clearOldCache();
        }
        
        // Forcer le garbage collection si possible
        if (window.gc) {
            window.gc();
        }
        
        this.createAlert('memory', 'Nettoyage automatique de la mémoire effectué', 'success');
    }

    // Correction des problèmes de performance
    fixPerformanceIssue() {
        // Réduire la qualité des animations
        const style = document.createElement('style');
        style.textContent = `
            * {
                animation-duration: 0.1s !important;
                transition-duration: 0.1s !important;
            }
        `;
        document.head.appendChild(style);
        
        this.createAlert('fps', 'Optimisations de performance appliquées', 'success');
    }

    // Correction des erreurs
    fixErrorIssue(alert) {
        // Relancer l'auto-correction si disponible
        if (window.autoTestFix) {
            setTimeout(() => {
                window.autoTestFix.rerunTests();
            }, 1000);
        }
    }

    // Créer l'interface de monitoring
    createMonitoringUI() {
        const monitorBtn = document.createElement('button');
        monitorBtn.style.cssText = `
            position: fixed;
            bottom: 120px;
            left: 20px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #2ecc71;
            color: white;
            border: none;
            cursor: pointer;
            z-index: 998;
            font-size: 16px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        `;
        monitorBtn.innerHTML = '📊';
        monitorBtn.title = 'Monitoring en temps réel';
        
        monitorBtn.addEventListener('click', () => {
            this.showMonitoringDashboard();
        });
        
        document.body.appendChild(monitorBtn);
    }

    // Afficher le tableau de bord de monitoring
    showMonitoringDashboard() {
        const dashboard = document.createElement('div');
        dashboard.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80%;
            max-width: 800px;
            height: 80%;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            z-index: 2002;
            overflow-y: auto;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        dashboard.innerHTML = this.generateDashboardHTML();
        
        document.body.appendChild(dashboard);
        
        // Fermeture en cliquant à l'extérieur
        dashboard.addEventListener('click', (e) => {
            if (e.target === dashboard) {
                dashboard.remove();
            }
        });
    }

    // Générer le HTML du tableau de bord
    generateDashboardHTML() {
        const currentMemory = this.metrics.systemHealth.memory.slice(-1)[0];
        const currentFPS = this.metrics.systemHealth.fps.slice(-1)[0];
        const errorCount = this.metrics.errors.length;
        const recentErrors = this.metrics.errors.slice(-5);
        
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #333;">📊 Monitoring Dashboard</h2>
                <button onclick="this.parentNode.parentNode.remove()" style="
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #666;
                ">×</button>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
                <div style="background: #3498db; color: white; padding: 20px; border-radius: 12px;">
                    <h3 style="margin: 0 0 10px 0;">💾 Mémoire</h3>
                    <div style="font-size: 24px; font-weight: bold;">${currentMemory ? currentMemory.used : 0} MB</div>
                    <div style="opacity: 0.8;">Utilisée</div>
                </div>
                
                <div style="background: #e74c3c; color: white; padding: 20px; border-radius: 12px;">
                    <h3 style="margin: 0 0 10px 0;">🎯 FPS</h3>
                    <div style="font-size: 24px; font-weight: bold;">${currentFPS ? currentFPS.fps : 0}</div>
                    <div style="opacity: 0.8;">Images/sec</div>
                </div>
                
                <div style="background: #f39c12; color: white; padding: 20px; border-radius: 12px;">
                    <h3 style="margin: 0 0 10px 0;">🚨 Erreurs</h3>
                    <div style="font-size: 24px; font-weight: bold;">${errorCount}</div>
                    <div style="opacity: 0.8;">Total</div>
                </div>
                
                <div style="background: #27ae60; color: white; padding: 20px; border-radius: 12px;">
                    <h3 style="margin: 0 0 10px 0;">📈 Statut</h3>
                    <div style="font-size: 24px; font-weight: bold;">${this.getSystemStatus()}</div>
                    <div style="opacity: 0.8;">Système</div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <h3 style="color: #333; margin-bottom: 15px;">🔥 Erreurs Récentes</h3>
                    <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; max-height: 200px; overflow-y: auto;">
                        ${recentErrors.length > 0 ? recentErrors.map(error => `
                            <div style="margin-bottom: 10px; padding: 8px; background: white; border-radius: 4px; border-left: 3px solid #e74c3c;">
                                <div style="font-weight: 600; color: #e74c3c;">${error.type}</div>
                                <div style="font-size: 12px; color: #666; margin-top: 2px;">${error.message}</div>
                            </div>
                        `).join('') : '<div style="color: #666; text-align: center;">Aucune erreur récente</div>'}
                    </div>
                </div>
                
                <div>
                    <h3 style="color: #333; margin-bottom: 15px;">⚡ Actions Récentes</h3>
                    <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; max-height: 200px; overflow-y: auto;">
                        ${this.metrics.userActions.slice(-10).map(action => `
                            <div style="margin-bottom: 8px; padding: 6px; background: white; border-radius: 4px;">
                                <span style="font-weight: 600; color: #3498db;">${action.type}</span>
                                <span style="color: #666; margin-left: 8px;">${action.target}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // Obtenir le statut du système
    getSystemStatus() {
        const currentMemory = this.metrics.systemHealth.memory.slice(-1)[0];
        const currentFPS = this.metrics.systemHealth.fps.slice(-1)[0];
        const recentErrors = this.metrics.errors.filter(e => Date.now() - e.timestamp < 60000);
        
        if (recentErrors.length > 5) return '🔴 Critique';
        if (currentMemory && currentMemory.used > this.thresholds.maxMemoryMB) return '🟡 Attention';
        if (currentFPS && currentFPS.fps < this.thresholds.minFPS) return '🟡 Attention';
        
        return '🟢 Optimal';
    }

    // Générer un rapport complet
    generateReport() {
        return {
            timestamp: new Date().toISOString(),
            systemStatus: this.getSystemStatus(),
            metrics: this.metrics,
            alerts: this.alerts,
            thresholds: this.thresholds,
            summary: {
                totalErrors: this.metrics.errors.length,
                avgMemoryUsage: this.getAverageMemoryUsage(),
                avgFPS: this.getAverageFPS(),
                mostUsedFeatures: this.getMostUsedFeatures()
            }
        };
    }

    // Calculer l'utilisation moyenne de la mémoire
    getAverageMemoryUsage() {
        if (this.metrics.systemHealth.memory.length === 0) return 0;
        const sum = this.metrics.systemHealth.memory.reduce((acc, m) => acc + m.used, 0);
        return Math.round(sum / this.metrics.systemHealth.memory.length);
    }

    // Calculer les FPS moyens
    getAverageFPS() {
        if (this.metrics.systemHealth.fps.length === 0) return 0;
        const sum = this.metrics.systemHealth.fps.reduce((acc, f) => acc + f.fps, 0);
        return Math.round(sum / this.metrics.systemHealth.fps.length);
    }

    // Obtenir les fonctionnalités les plus utilisées
    getMostUsedFeatures() {
        const actionCounts = {};
        this.metrics.userActions.forEach(action => {
            actionCounts[action.target] = (actionCounts[action.target] || 0) + 1;
        });
        
        return Object.entries(actionCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([target, count]) => ({ target, count }));
    }
}

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.realTimeMonitor = new RealTimeMonitor();
        
        // Commandes de debug
        window.debugMonitor = {
            report: () => window.realTimeMonitor.generateReport(),
            dashboard: () => window.realTimeMonitor.showMonitoringDashboard(),
            stop: () => window.realTimeMonitor.stopMonitoring(),
            start: () => window.realTimeMonitor.startMonitoring()
        };
        
        console.log('📊 Monitoring en temps réel actif. Commandes: window.debugMonitor');
    }, 1000);
});