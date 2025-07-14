/**
 * Moniteur des Presets - Surveillance des tailles et performances
 * Analyse en temps réel des presets utilisés et de leurs dimensions
 */

class PresetMonitor {
    constructor() {
        this.presetUsage = new Map();
        this.performanceData = new Map();
        this.currentPreset = null;
        this.startTime = Date.now();
        
        this.init();
    }

    init() {
        console.log('🔍 PresetMonitor: Initialisation de la surveillance des presets');
        
        // Surveiller les changements de presets
        this.observePresetChanges();
        
        // Analyser les presets existants
        this.analyzeExistingPresets();
        
        // Surveiller les performances
        this.monitorPerformance();
        
        // Afficher le tableau de bord
        this.createDashboard();
        
        // Mise à jour périodique
        setInterval(() => this.updateDashboard(), 2000);
    }

    analyzeExistingPresets() {
        console.log('📊 Analyse des presets configurés:');
        
        // Presets de base depuis script.js
        const basePresets = {
            mobile: { width: 375, height: 667, scale: 0.4 },
            iphone: { width: 375, height: 812, scale: 0.35 },
            tablet: { width: 768, height: 1024, scale: 0.7 },
            desktop: { width: 1920, height: 1080, scale: 1.0 },
            social: { width: 1200, height: 630, scale: 0.8 },
            'instagram-post': { width: 1080, height: 1080, scale: 0.8 },
            'instagram-story': { width: 1080, height: 1920, scale: 0.6 },
            'facebook-post': { width: 1200, height: 630, scale: 0.8 },
            'facebook-cover': { width: 1640, height: 859, scale: 0.7 },
            'twitter-post': { width: 1200, height: 675, scale: 0.8 },
            'twitter-header': { width: 1500, height: 500, scale: 0.7 },
            'linkedin-post': { width: 1200, height: 627, scale: 0.8 },
            'youtube-thumbnail': { width: 1280, height: 720, scale: 0.8 }
        };

        console.table(basePresets);
        
        // Analyser les tailles
        this.analyzeSizes(basePresets);
        
        return basePresets;
    }

    analyzeSizes(presets) {
        const sizeAnalysis = {
            totalPresets: Object.keys(presets).length,
            averageWidth: 0,
            averageHeight: 0,
            minWidth: Infinity,
            maxWidth: 0,
            minHeight: Infinity,
            maxHeight: 0,
            aspectRatios: new Map(),
            categories: {
                mobile: [],
                desktop: [],
                social: [],
                square: [],
                landscape: [],
                portrait: []
            }
        };

        let totalWidth = 0;
        let totalHeight = 0;

        Object.entries(presets).forEach(([name, preset]) => {
            const { width, height } = preset;
            const aspectRatio = (width / height).toFixed(2);
            
            // Statistiques générales
            totalWidth += width;
            totalHeight += height;
            sizeAnalysis.minWidth = Math.min(sizeAnalysis.minWidth, width);
            sizeAnalysis.maxWidth = Math.max(sizeAnalysis.maxWidth, width);
            sizeAnalysis.minHeight = Math.min(sizeAnalysis.minHeight, height);
            sizeAnalysis.maxHeight = Math.max(sizeAnalysis.maxHeight, height);
            
            // Ratios d'aspect
            const ratioKey = `${aspectRatio}:1`;
            if (!sizeAnalysis.aspectRatios.has(ratioKey)) {
                sizeAnalysis.aspectRatios.set(ratioKey, []);
            }
            sizeAnalysis.aspectRatios.get(ratioKey).push(name);
            
            // Catégorisation
            if (name.includes('mobile') || name.includes('iphone')) {
                sizeAnalysis.categories.mobile.push(name);
            } else if (name.includes('desktop')) {
                sizeAnalysis.categories.desktop.push(name);
            } else if (name.includes('instagram') || name.includes('facebook') || 
                      name.includes('twitter') || name.includes('linkedin') || 
                      name.includes('youtube')) {
                sizeAnalysis.categories.social.push(name);
            }
            
            // Format
            if (width === height) {
                sizeAnalysis.categories.square.push(name);
            } else if (width > height) {
                sizeAnalysis.categories.landscape.push(name);
            } else {
                sizeAnalysis.categories.portrait.push(name);
            }
        });

        sizeAnalysis.averageWidth = Math.round(totalWidth / sizeAnalysis.totalPresets);
        sizeAnalysis.averageHeight = Math.round(totalHeight / sizeAnalysis.totalPresets);

        console.log('📏 Analyse des tailles:', sizeAnalysis);
        this.sizeAnalysis = sizeAnalysis;
        
        return sizeAnalysis;
    }

    observePresetChanges() {
        // Observer les clics sur les boutons de preset
        document.addEventListener('click', (e) => {
            if (e.target.matches('.preset-btn, .social-preset-btn') || 
                e.target.closest('.preset-btn, .social-preset-btn')) {
                
                const btn = e.target.closest('.preset-btn, .social-preset-btn') || e.target;
                const presetName = btn.dataset.preset;
                
                if (presetName) {
                    this.recordPresetUsage(presetName);
                }
            }
        });

        // Observer les changements de dimensions
        const widthInput = document.getElementById('widthInput');
        const heightInput = document.getElementById('heightInput');
        
        if (widthInput && heightInput) {
            [widthInput, heightInput].forEach(input => {
                input.addEventListener('change', () => {
                    this.recordCustomDimensions(widthInput.value, heightInput.value);
                });
            });
        }
    }

    recordPresetUsage(presetName) {
        const timestamp = Date.now();
        
        if (!this.presetUsage.has(presetName)) {
            this.presetUsage.set(presetName, {
                count: 0,
                firstUsed: timestamp,
                lastUsed: timestamp,
                totalTime: 0
            });
        }
        
        const usage = this.presetUsage.get(presetName);
        
        // Si on change de preset, enregistrer le temps passé sur le précédent
        if (this.currentPreset && this.currentPreset !== presetName) {
            const prevUsage = this.presetUsage.get(this.currentPreset);
            if (prevUsage) {
                prevUsage.totalTime += timestamp - prevUsage.lastUsed;
            }
        }
        
        usage.count++;
        usage.lastUsed = timestamp;
        this.currentPreset = presetName;
        
        console.log(`🎯 Preset utilisé: ${presetName} (${usage.count}x)`);
    }

    recordCustomDimensions(width, height) {
        const key = `${width}x${height}`;
        const timestamp = Date.now();
        
        if (!this.performanceData.has('custom_dimensions')) {
            this.performanceData.set('custom_dimensions', new Map());
        }
        
        const customDims = this.performanceData.get('custom_dimensions');
        if (!customDims.has(key)) {
            customDims.set(key, { count: 0, firstUsed: timestamp });
        }
        
        customDims.get(key).count++;
        console.log(`📐 Dimensions personnalisées: ${key}`);
    }

    monitorPerformance() {
        // Surveiller les temps de rendu
        const originalUpdatePreview = window.converter?.updatePreview;
        if (originalUpdatePreview) {
            window.converter.updatePreview = (...args) => {
                const start = performance.now();
                const result = originalUpdatePreview.apply(window.converter, args);
                const duration = performance.now() - start;
                
                this.recordPerformance('preview_update', duration);
                return result;
            };
        }
    }

    recordPerformance(operation, duration) {
        if (!this.performanceData.has(operation)) {
            this.performanceData.set(operation, []);
        }
        
        this.performanceData.get(operation).push({
            duration,
            timestamp: Date.now(),
            preset: this.currentPreset
        });
        
        // Garder seulement les 100 dernières mesures
        const data = this.performanceData.get(operation);
        if (data.length > 100) {
            data.splice(0, data.length - 100);
        }
    }

    createDashboard() {
        const dashboard = document.createElement('div');
        dashboard.id = 'preset-monitor-dashboard';
        dashboard.innerHTML = `
            <div style="
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 15px;
                border-radius: 8px;
                font-family: monospace;
                font-size: 12px;
                z-index: 10000;
                max-width: 300px;
                max-height: 400px;
                overflow-y: auto;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            ">
                <div style="font-weight: bold; margin-bottom: 10px; color: #4CAF50;">
                    🔍 Moniteur des Presets
                </div>
                <div id="preset-stats"></div>
                <div id="performance-stats"></div>
                <button onclick="this.parentElement.parentElement.style.display='none'" 
                        style="position: absolute; top: 5px; right: 5px; background: none; border: none; color: white; cursor: pointer;">
                    ✕
                </button>
            </div>
        `;
        
        document.body.appendChild(dashboard);
    }

    updateDashboard() {
        const statsDiv = document.getElementById('preset-stats');
        const perfDiv = document.getElementById('performance-stats');
        
        if (!statsDiv || !perfDiv) return;
        
        // Statistiques d'utilisation
        let usageStats = '<div style="margin-bottom: 10px;"><strong>📊 Utilisation:</strong></div>';
        
        if (this.presetUsage.size === 0) {
            usageStats += '<div style="color: #888;">Aucun preset utilisé</div>';
        } else {
            const sortedUsage = Array.from(this.presetUsage.entries())
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 5);
            
            sortedUsage.forEach(([name, data]) => {
                usageStats += `<div>${name}: ${data.count}x</div>`;
            });
        }
        
        // Statistiques de performance
        let perfStats = '<div style="margin-top: 10px; margin-bottom: 5px;"><strong>⚡ Performance:</strong></div>';
        
        if (this.performanceData.has('preview_update')) {
            const updates = this.performanceData.get('preview_update');
            if (updates.length > 0) {
                const avgTime = updates.reduce((sum, item) => sum + item.duration, 0) / updates.length;
                perfStats += `<div>Rendu moyen: ${avgTime.toFixed(1)}ms</div>`;
            }
        }
        
        perfStats += `<div>Preset actuel: ${this.currentPreset || 'Aucun'}</div>`;
        perfStats += `<div>Uptime: ${Math.round((Date.now() - this.startTime) / 1000)}s</div>`;
        
        statsDiv.innerHTML = usageStats;
        perfDiv.innerHTML = perfStats;
    }

    getReport() {
        return {
            sizeAnalysis: this.sizeAnalysis,
            usage: Object.fromEntries(this.presetUsage),
            performance: Object.fromEntries(this.performanceData),
            currentPreset: this.currentPreset,
            uptime: Date.now() - this.startTime
        };
    }

    exportReport() {
        const report = this.getReport();
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `preset-monitor-report-${new Date().toISOString().slice(0, 19)}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        console.log('📄 Rapport exporté:', report);
    }
}

// Initialisation automatique
if (typeof window !== 'undefined') {
    window.presetMonitor = new PresetMonitor();
    
    // Commandes de console pour le debug
    window.getPresetReport = () => window.presetMonitor.getReport();
    window.exportPresetReport = () => window.presetMonitor.exportReport();
    
    console.log('🔍 PresetMonitor initialisé. Utilisez getPresetReport() ou exportPresetReport() dans la console.');
}

// Export pour les modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PresetMonitor;
}