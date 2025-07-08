/**
 * Système de tracking complet des activités utilisateur
 * Analyse du parcours utilisateur et des interactions
 */

class UserAnalytics {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.userId = this.getUserId();
        this.startTime = Date.now();
        this.pageViews = [];
        this.userActions = [];
        this.conversionFunnel = {
            landing: false,
            interaction: false,
            conversion: false,
            completion: false
        };
        this.heatmapData = [];
        this.scrollData = [];
        this.timeOnElements = new Map();
        this.clickPaths = [];
        this.formInteractions = [];
        this.errorEvents = [];
        this.performanceMetrics = [];
        
        this.init();
    }

    init() {
        console.log('📈 Analytics utilisateur initialisées');
        this.trackPageView();
        this.setupEventListeners();
        this.startSessionTracking();
        this.setupHeatmapTracking();
        this.setupScrollTracking();
        this.setupFormTracking();
        this.setupConversionTracking();
        this.createAnalyticsDashboard();
    }

    // Générer un ID de session unique
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Obtenir ou créer un ID utilisateur
    getUserId() {
        let userId = localStorage.getItem('user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('user_id', userId);
        }
        return userId;
    }

    // Configuration du suivi heatmap
    setupHeatmapTracking() {
        // Initialiser les données de heatmap si pas déjà fait
        if (!this.heatmapData) {
            this.heatmapData = [];
        }
        
        // Configuration des zones de suivi
        this.heatmapConfig = {
            maxDataPoints: 1000,
            sampleRate: 0.1, // 10% des mouvements de souris
            clickTracking: true,
            scrollTracking: true
        };
        
        console.log('🔥 Heatmap tracking configuré');
    }

    // Tracker une vue de page
    trackPageView() {
        const pageView = {
            timestamp: Date.now(),
            url: window.location.href,
            title: document.title,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            sessionId: this.sessionId,
            userId: this.userId
        };
        
        this.pageViews.push(pageView);
        this.conversionFunnel.landing = true;
        
        console.log('📄 Page view tracked:', pageView);
    }

    // Configuration des écouteurs d'événements
    setupEventListeners() {
        // Clics avec coordonnées pour heatmap
        document.addEventListener('click', (e) => {
            this.trackClick(e);
        });

        // Mouvements de souris (throttled)
        let mouseMoveTimeout;
        document.addEventListener('mousemove', (e) => {
            clearTimeout(mouseMoveTimeout);
            mouseMoveTimeout = setTimeout(() => {
                this.trackMouseMove(e);
            }, 100);
        });

        // Survols d'éléments
        document.addEventListener('mouseover', (e) => {
            this.trackElementHover(e);
        });

        document.addEventListener('mouseout', (e) => {
            this.trackElementLeave(e);
        });

        // Saisie de texte
        document.addEventListener('input', (e) => {
            this.trackInput(e);
        });

        // Changements de focus
        document.addEventListener('focusin', (e) => {
            this.trackFocus(e);
        });

        // Raccourcis clavier
        document.addEventListener('keydown', (e) => {
            this.trackKeyboard(e);
        });

        // Changements de visibilité de la page
        document.addEventListener('visibilitychange', () => {
            this.trackVisibilityChange();
        });

        // Avant fermeture de page
        window.addEventListener('beforeunload', () => {
            this.trackSessionEnd();
        });
    }

    // Tracker les clics avec heatmap
    trackClick(event) {
        const clickData = {
            timestamp: Date.now(),
            type: 'click',
            element: this.getElementInfo(event.target),
            coordinates: {
                x: event.clientX,
                y: event.clientY,
                pageX: event.pageX,
                pageY: event.pageY
            },
            sessionId: this.sessionId
        };

        this.userActions.push(clickData);
        this.heatmapData.push(clickData);
        this.clickPaths.push(clickData);
        
        // Marquer l'interaction dans le funnel
        this.conversionFunnel.interaction = true;
        
        // Vérifier si c'est un élément de conversion
        this.checkConversionEvent(event.target);
        
        console.log('🖱️ Click tracked:', clickData);
    }

    // Tracker les mouvements de souris
    trackMouseMove(event) {
        const moveData = {
            timestamp: Date.now(),
            type: 'mousemove',
            coordinates: {
                x: event.clientX,
                y: event.clientY
            }
        };
        
        // Ajouter aux données de heatmap (échantillonnage)
        if (Math.random() < 0.1) { // 10% des mouvements
            this.heatmapData.push(moveData);
        }
    }

    // Tracker le survol d'éléments
    trackElementHover(event) {
        const element = event.target;
        const elementKey = this.getElementKey(element);
        
        this.timeOnElements.set(elementKey, {
            element: this.getElementInfo(element),
            startTime: Date.now()
        });
    }

    // Tracker la sortie d'éléments
    trackElementLeave(event) {
        const element = event.target;
        const elementKey = this.getElementKey(element);
        const hoverData = this.timeOnElements.get(elementKey);
        
        if (hoverData) {
            const duration = Date.now() - hoverData.startTime;
            
            this.userActions.push({
                timestamp: Date.now(),
                type: 'hover',
                element: hoverData.element,
                duration: duration,
                sessionId: this.sessionId
            });
            
            this.timeOnElements.delete(elementKey);
        }
    }

    // Tracker les saisies
    trackInput(event) {
        const inputData = {
            timestamp: Date.now(),
            type: 'input',
            element: this.getElementInfo(event.target),
            valueLength: event.target.value.length,
            sessionId: this.sessionId
        };
        
        this.userActions.push(inputData);
        this.formInteractions.push(inputData);
        
        console.log('⌨️ Input tracked:', inputData);
    }

    // Tracker le focus
    trackFocus(event) {
        const focusData = {
            timestamp: Date.now(),
            type: 'focus',
            element: this.getElementInfo(event.target),
            sessionId: this.sessionId
        };
        
        this.userActions.push(focusData);
    }

    // Tracker les raccourcis clavier
    trackKeyboard(event) {
        // Seulement les raccourcis importants
        if (event.ctrlKey || event.metaKey || event.altKey) {
            const keyboardData = {
                timestamp: Date.now(),
                type: 'keyboard',
                key: event.key,
                ctrlKey: event.ctrlKey,
                metaKey: event.metaKey,
                altKey: event.altKey,
                shiftKey: event.shiftKey,
                sessionId: this.sessionId
            };
            
            this.userActions.push(keyboardData);
        }
    }

    // Tracker les changements de visibilité
    trackVisibilityChange() {
        const visibilityData = {
            timestamp: Date.now(),
            type: 'visibility',
            hidden: document.hidden,
            sessionId: this.sessionId
        };
        
        this.userActions.push(visibilityData);
    }

    // Configuration du tracking de scroll
    setupScrollTracking() {
        let scrollTimeout;
        let maxScroll = 0;
        
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );
            
            maxScroll = Math.max(maxScroll, scrollPercent);
            
            scrollTimeout = setTimeout(() => {
                const scrollData = {
                    timestamp: Date.now(),
                    type: 'scroll',
                    scrollY: window.scrollY,
                    scrollPercent: scrollPercent,
                    maxScrollPercent: maxScroll,
                    sessionId: this.sessionId
                };
                
                this.scrollData.push(scrollData);
                this.userActions.push(scrollData);
            }, 150);
        });
    }

    // Configuration du tracking de formulaires
    setupFormTracking() {
        document.addEventListener('submit', (e) => {
            const formData = {
                timestamp: Date.now(),
                type: 'form_submit',
                form: this.getElementInfo(e.target),
                sessionId: this.sessionId
            };
            
            this.formInteractions.push(formData);
            this.userActions.push(formData);
            
            // Marquer comme conversion
            this.conversionFunnel.conversion = true;
        });
    }

    // Configuration du tracking de conversion
    setupConversionTracking() {
        // Observer les boutons de téléchargement
        const downloadButtons = document.querySelectorAll('[id*="download"], [class*="download"], [onclick*="download"]');
        downloadButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.trackConversion('download', btn);
            });
        });
        
        // Observer les boutons de conversion
        const convertButtons = document.querySelectorAll('[id*="convert"], [class*="convert"], [onclick*="convert"]');
        convertButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.trackConversion('convert', btn);
            });
        });
    }

    // Tracker une conversion
    trackConversion(type, element) {
        const conversionData = {
            timestamp: Date.now(),
            type: 'conversion',
            conversionType: type,
            element: this.getElementInfo(element),
            sessionId: this.sessionId,
            timeToConversion: Date.now() - this.startTime
        };
        
        this.userActions.push(conversionData);
        this.conversionFunnel.completion = true;
        
        console.log('🎯 Conversion tracked:', conversionData);
    }

    // Vérifier les événements de conversion
    checkConversionEvent(element) {
        const elementInfo = this.getElementInfo(element);
        
        // Vérifier si c'est un élément de conversion
        if (elementInfo.id.includes('convert') || 
            elementInfo.classes.some(cls => cls.includes('convert')) ||
            elementInfo.id.includes('download') ||
            elementInfo.classes.some(cls => cls.includes('download'))) {
            
            this.trackConversion('button_click', element);
        }
    }

    // Obtenir les informations d'un élément
    getElementInfo(element) {
        return {
            tagName: element.tagName,
            id: element.id || '',
            classes: Array.from(element.classList),
            text: element.textContent?.substring(0, 50) || '',
            type: element.type || '',
            href: element.href || '',
            src: element.src || ''
        };
    }

    // Obtenir une clé unique pour un élément
    getElementKey(element) {
        return element.tagName + '#' + element.id + '.' + Array.from(element.classList).join('.');
    }

    // Démarrer le tracking de session
    startSessionTracking() {
        // Enregistrer la durée de session toutes les 30 secondes
        setInterval(() => {
            this.updateSessionDuration();
        }, 30000);
    }

    // Mettre à jour la durée de session
    updateSessionDuration() {
        const sessionData = {
            timestamp: Date.now(),
            type: 'session_update',
            duration: Date.now() - this.startTime,
            sessionId: this.sessionId
        };
        
        this.userActions.push(sessionData);
    }

    // Tracker la fin de session
    trackSessionEnd() {
        const sessionEndData = {
            timestamp: Date.now(),
            type: 'session_end',
            totalDuration: Date.now() - this.startTime,
            totalActions: this.userActions.length,
            conversionFunnel: this.conversionFunnel,
            sessionId: this.sessionId
        };
        
        this.userActions.push(sessionEndData);
        
        // Sauvegarder les données
        this.saveAnalyticsData();
        
        console.log('📊 Session ended:', sessionEndData);
    }

    // Sauvegarder les données analytics
    saveAnalyticsData() {
        const analyticsData = {
            sessionId: this.sessionId,
            userId: this.userId,
            startTime: this.startTime,
            endTime: Date.now(),
            pageViews: this.pageViews,
            userActions: this.userActions,
            conversionFunnel: this.conversionFunnel,
            heatmapData: this.heatmapData,
            scrollData: this.scrollData,
            formInteractions: this.formInteractions,
            clickPaths: this.clickPaths
        };
        
        // Sauvegarder localement
        localStorage.setItem('analytics_' + this.sessionId, JSON.stringify(analyticsData));
        
        // Envoyer au serveur si configuré
        this.sendToServer(analyticsData);
    }

    // Envoyer les données au serveur
    async sendToServer(data) {
        try {
            // Vérifier si les analytics sont activées
            const config = await fetch('./config.json').then(r => r.json());
            if (!config.analytics.enabled) return;
            
            // Simuler l'envoi (remplacer par votre endpoint)
            console.log('📤 Sending analytics data:', data);
            
            // Exemple d'envoi
            // await fetch('/api/analytics', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(data)
            // });
            
        } catch (error) {
            console.error('❌ Failed to send analytics:', error);
        }
    }

    // Créer le dashboard analytics
    createAnalyticsDashboard() {
        const dashboardBtn = document.createElement('button');
        dashboardBtn.style.cssText = `
            position: fixed;
            bottom: 170px;
            left: 20px;
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 50%;
            color: white;
            font-size: 16px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            transition: all 0.3s ease;
        `;
        
        dashboardBtn.innerHTML = '📊';
        dashboardBtn.title = 'Analytics Dashboard';
        
        dashboardBtn.addEventListener('click', () => {
            this.showAnalyticsDashboard();
        });
        
        document.body.appendChild(dashboardBtn);
    }

    // Afficher le dashboard analytics
    showAnalyticsDashboard() {
        const dashboard = document.createElement('div');
        dashboard.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90%;
            max-width: 800px;
            height: 80%;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            z-index: 2000;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        dashboard.innerHTML = `
            <div style="padding: 20px; height: 100%; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="margin: 0; color: #333;">📊 Analytics Dashboard</h2>
                    <button onclick="this.closest('div[style*="position: fixed"]').remove()" style="
                        background: #e74c3c;
                        border: none;
                        color: white;
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        cursor: pointer;
                    ">×</button>
                </div>
                
                ${this.generateAnalyticsReport()}
            </div>
        `;
        
        document.body.appendChild(dashboard);
    }

    // Générer le rapport analytics
    generateAnalyticsReport() {
        const sessionDuration = Date.now() - this.startTime;
        const clickCount = this.userActions.filter(a => a.type === 'click').length;
        const inputCount = this.userActions.filter(a => a.type === 'input').length;
        const maxScroll = Math.max(...this.scrollData.map(s => s.scrollPercent), 0);
        
        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                <div style="background: #3498db; color: white; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 5px 0;">⏱️ Durée de session</h3>
                    <p style="margin: 0; font-size: 18px; font-weight: bold;">${Math.round(sessionDuration / 1000)}s</p>
                </div>
                
                <div style="background: #e74c3c; color: white; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 5px 0;">🖱️ Clics</h3>
                    <p style="margin: 0; font-size: 18px; font-weight: bold;">${clickCount}</p>
                </div>
                
                <div style="background: #27ae60; color: white; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 5px 0;">⌨️ Saisies</h3>
                    <p style="margin: 0; font-size: 18px; font-weight: bold;">${inputCount}</p>
                </div>
                
                <div style="background: #f39c12; color: white; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 5px 0;">📜 Scroll max</h3>
                    <p style="margin: 0; font-size: 18px; font-weight: bold;">${maxScroll}%</p>
                </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h3 style="margin: 0 0 10px 0;">🎯 Funnel de conversion</h3>
                <div style="display: flex; gap: 10px;">
                    <span style="padding: 5px 10px; border-radius: 15px; background: ${this.conversionFunnel.landing ? '#27ae60' : '#bdc3c7'}; color: white; font-size: 12px;">Landing</span>
                    <span style="padding: 5px 10px; border-radius: 15px; background: ${this.conversionFunnel.interaction ? '#27ae60' : '#bdc3c7'}; color: white; font-size: 12px;">Interaction</span>
                    <span style="padding: 5px 10px; border-radius: 15px; background: ${this.conversionFunnel.conversion ? '#27ae60' : '#bdc3c7'}; color: white; font-size: 12px;">Conversion</span>
                    <span style="padding: 5px 10px; border-radius: 15px; background: ${this.conversionFunnel.completion ? '#27ae60' : '#bdc3c7'}; color: white; font-size: 12px;">Completion</span>
                </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                <h3 style="margin: 0 0 10px 0;">📈 Dernières actions</h3>
                <div style="max-height: 200px; overflow-y: auto;">
                    ${this.userActions.slice(-10).reverse().map(action => `
                        <div style="padding: 8px; border-bottom: 1px solid #eee; font-size: 12px;">
                            <strong>${action.type}</strong> - ${new Date(action.timestamp).toLocaleTimeString()}
                            ${action.element ? `<br><span style="color: #666;">${action.element.tagName}${action.element.id ? '#' + action.element.id : ''}</span>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Obtenir les statistiques
    getStats() {
        return {
            sessionId: this.sessionId,
            userId: this.userId,
            sessionDuration: Date.now() - this.startTime,
            totalActions: this.userActions.length,
            clickCount: this.userActions.filter(a => a.type === 'click').length,
            inputCount: this.userActions.filter(a => a.type === 'input').length,
            conversionFunnel: this.conversionFunnel,
            maxScroll: Math.max(...this.scrollData.map(s => s.scrollPercent), 0)
        };
    }
}

// Initialiser les analytics si activées
if (typeof window !== 'undefined') {
    // Vérifier la configuration
    fetch('./config.json')
        .then(response => response.json())
        .then(config => {
            if (config.analytics.enabled) {
                window.userAnalytics = new UserAnalytics();
                console.log('✅ User Analytics activées');
            } else {
                console.log('ℹ️ User Analytics désactivées dans la configuration');
            }
        })
        .catch(error => {
            console.warn('⚠️ Impossible de charger la configuration analytics:', error);
        });
}

// Export pour utilisation en module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserAnalytics;
}