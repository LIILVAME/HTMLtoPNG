// Phase 2 - Advanced Features: History Management
class HistoryManager {
    constructor() {
        this.maxHistoryItems = 50;
        this.storageKey = 'htmltopng_history';
        this.history = this.loadHistory();
        this.currentIndex = -1;
    }

    /**
     * Initialize history management
     */
    init() {
        this.setupHistoryPanel();
        this.setupKeyboardShortcuts();
        this.renderHistory();
    }

    /**
     * Add a new conversion to history
     */
    addToHistory(conversionData) {
        const historyItem = {
            id: Utils.generateId('conversion'),
            timestamp: Date.now(),
            html: conversionData.html,
            css: conversionData.css,
            width: conversionData.width,
            height: conversionData.height,
            format: conversionData.format || 'png',
            quality: conversionData.quality || 1,
            preset: conversionData.preset || 'custom',
            thumbnail: conversionData.thumbnail, // Base64 thumbnail
            title: this.generateTitle(conversionData)
        };

        // Remove oldest items if we exceed max
        if (this.history.length >= this.maxHistoryItems) {
            this.history = this.history.slice(-(this.maxHistoryItems - 1));
        }

        this.history.push(historyItem);
        this.currentIndex = this.history.length - 1;
        this.saveHistory();
        this.renderHistory();
        
        Utils.showToast('Conversion ajoutée à l\'historique', 'success');
    }

    /**
     * Add a conversion to history (alias for addToHistory)
     */
    addConversion(conversionData) {
        return this.addToHistory(conversionData);
    }

    /**
     * Load a conversion from history
     */
    loadFromHistory(id) {
        const item = this.history.find(h => h.id === id);
        if (!item) return false;

        // Update current index
        this.currentIndex = this.history.findIndex(h => h.id === id);

        // Load the conversion data
        const htmlInput = document.getElementById('htmlInput');
        const cssInput = document.getElementById('cssInput');
        const widthInput = document.getElementById('widthInput');
        const heightInput = document.getElementById('heightInput');
        const formatSelector = document.getElementById('formatSelector');

        if (htmlInput) htmlInput.value = item.html;
        if (cssInput) cssInput.value = item.css;
        if (widthInput) widthInput.value = item.width;
        if (heightInput) heightInput.value = item.height;
        if (formatSelector) formatSelector.value = item.format;

        // Trigger preview update
        if (window.htmlToPngConverter && window.htmlToPngConverter.updatePreview) {
            window.htmlToPngConverter.updatePreview();
        }

        Utils.showToast(`Conversion "${item.title}" chargée`, 'success');
        return true;
    }

    /**
     * Delete item from history
     */
    deleteFromHistory(id) {
        const index = this.history.findIndex(h => h.id === id);
        if (index === -1) return false;

        this.history.splice(index, 1);
        
        // Adjust current index
        if (this.currentIndex >= index) {
            this.currentIndex = Math.max(0, this.currentIndex - 1);
        }
        
        this.saveHistory();
        this.renderHistory();
        Utils.showToast('Élément supprimé de l\'historique', 'info');
        return true;
    }

    /**
     * Clear all history
     */
    clearHistory() {
        if (confirm('Êtes-vous sûr de vouloir effacer tout l\'historique ?')) {
            this.history = [];
            this.currentIndex = -1;
            this.saveHistory();
            this.renderHistory();
            Utils.showToast('Historique effacé', 'info');
        }
    }

    /**
     * Navigate to previous conversion
     */
    goToPrevious() {
        if (this.currentIndex > 0) {
            const prevItem = this.history[this.currentIndex - 1];
            this.loadFromHistory(prevItem.id);
        }
    }

    /**
     * Navigate to next conversion
     */
    goToNext() {
        if (this.currentIndex < this.history.length - 1) {
            const nextItem = this.history[this.currentIndex + 1];
            this.loadFromHistory(nextItem.id);
        }
    }

    /**
     * Setup history panel UI
     */
    setupHistoryPanel() {
        const historyToggle = document.getElementById('historyToggle');
        const historyPanel = document.getElementById('historyPanel');
        const historyClose = document.getElementById('historyClose');
        const historyClear = document.getElementById('historyClear');

        if (historyToggle && historyPanel) {
            historyToggle.addEventListener('click', () => {
                historyPanel.classList.toggle('open');
            });
        }

        if (historyClose && historyPanel) {
            historyClose.addEventListener('click', () => {
                historyPanel.classList.remove('open');
            });
        }

        if (historyClear) {
            historyClear.addEventListener('click', () => {
                this.clearHistory();
            });
        }
    }

    /**
     * Setup keyboard shortcuts for history navigation
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Left Arrow: Previous
            if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowLeft') {
                e.preventDefault();
                this.goToPrevious();
            }
            
            // Ctrl/Cmd + Right Arrow: Next
            if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowRight') {
                e.preventDefault();
                this.goToNext();
            }
            
            // Ctrl/Cmd + H: Toggle history panel
            if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
                e.preventDefault();
                const historyPanel = document.getElementById('historyPanel');
                if (historyPanel) {
                    historyPanel.classList.toggle('open');
                }
            }
        });
    }

    /**
     * Render history items in the panel
     */
    renderHistory() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;

        if (this.history.length === 0) {
            historyList.innerHTML = `
                <div class="history-empty">
                    <i class="fas fa-history"></i>
                    <p>Aucune conversion dans l'historique</p>
                    <small>Vos conversions apparaîtront ici</small>
                </div>
            `;
            return;
        }

        historyList.innerHTML = this.history
            .slice()
            .reverse()
            .map((item, index) => {
                const isActive = this.history.length - 1 - index === this.currentIndex;
                const date = new Date(item.timestamp);
                const timeAgo = this.getTimeAgo(item.timestamp);
                
                return `
                    <div class="history-item ${isActive ? 'active' : ''}" data-id="${item.id}">
                        <div class="history-thumbnail">
                            ${item.thumbnail ? 
                                `<img src="${item.thumbnail}" alt="Thumbnail" loading="lazy">` : 
                                `<div class="thumbnail-placeholder"><i class="fas fa-image"></i></div>`
                            }
                        </div>
                        <div class="history-content">
                            <div class="history-title">${item.title}</div>
                            <div class="history-meta">
                                <span class="history-format">${item.format.toUpperCase()}</span>
                                <span class="history-size">${item.width}×${item.height}</span>
                                <span class="history-time">${timeAgo}</span>
                            </div>
                        </div>
                        <div class="history-actions">
                            <button class="btn-icon" onclick="historyManager.loadFromHistory('${item.id}')" title="Charger">
                                <i class="fas fa-upload"></i>
                            </button>
                            <button class="btn-icon" onclick="historyManager.duplicateItem('${item.id}')" title="Dupliquer">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button class="btn-icon danger" onclick="historyManager.deleteFromHistory('${item.id}')" title="Supprimer">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            })
            .join('');

        // Update navigation buttons
        this.updateNavigationButtons();
    }

    /**
     * Update navigation button states
     */
    updateNavigationButtons() {
        const prevBtn = document.getElementById('historyPrev');
        const nextBtn = document.getElementById('historyNext');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentIndex <= 0;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentIndex >= this.history.length - 1;
        }
    }

    /**
     * Duplicate a history item
     */
    duplicateItem(id) {
        const item = this.history.find(h => h.id === id);
        if (!item) return;

        const duplicatedItem = {
            ...item,
            id: this.generateId(),
            timestamp: Date.now(),
            title: item.title + ' (Copie)'
        };

        this.history.push(duplicatedItem);
        this.saveHistory();
        this.renderHistory();
        this.showToast('Élément dupliqué', 'success');
    }

    /**
     * Export history as JSON
     */
    exportHistory() {
        const dataStr = JSON.stringify(this.history, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `htmltopng-history-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showToast('Historique exporté', 'success');
    }

    /**
     * Import history from JSON file
     */
    importHistory(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedHistory = JSON.parse(e.target.result);
                
                if (Array.isArray(importedHistory)) {
                    // Merge with existing history
                    this.history = [...this.history, ...importedHistory];
                    
                    // Remove duplicates and limit size
                    this.history = this.history
                        .filter((item, index, arr) => 
                            arr.findIndex(h => h.id === item.id) === index
                        )
                        .slice(-this.maxHistoryItems);
                    
                    this.saveHistory();
                    this.renderHistory();
                    this.showToast(`${importedHistory.length} éléments importés`, 'success');
                } else {
                    throw new Error('Format de fichier invalide');
                }
            } catch (error) {
                this.showToast('Erreur lors de l\'importation : ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Generate title from conversion data
     */
    generateTitle(data) {
        if (data.preset && data.preset !== 'custom') {
            return `${data.preset} (${data.width}×${data.height})`;
        }
        
        // Extract title from HTML if possible
        const titleMatch = data.html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch) {
            return titleMatch[1].substring(0, 30);
        }
        
        // Extract first heading
        const headingMatch = data.html.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i);
        if (headingMatch) {
            return headingMatch[1].substring(0, 30);
        }
        
        return `Conversion ${data.width}×${data.height}`;
    }

    /**
     * Get time ago string
     */
    getTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'À l\'instant';
        if (minutes < 60) return `Il y a ${minutes}min`;
        if (hours < 24) return `Il y a ${hours}h`;
        if (days < 7) return `Il y a ${days}j`;
        
        return new Date(timestamp).toLocaleDateString();
    }

    /**
     * Load history from localStorage
     */
    loadHistory() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading history:', error);
            return [];
        }
    }

    /**
     * Save history to localStorage
     */
    saveHistory() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.history));
        } catch (error) {
            console.error('Error saving history:', error);
            this.showToast('Erreur lors de la sauvegarde de l\'historique', 'error');
        }
    }

    /**
     * Show toast message
     */
    showToast(message, type = 'info') {
        if (window.htmlToPngConverter && window.htmlToPngConverter.showToast) {
            window.htmlToPngConverter.showToast(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    /**
     * Get history statistics
     */
    getStatistics() {
        const totalSize = this.history.reduce((sum, item) => {
            return sum + (item.thumbnail ? item.thumbnail.length : 0);
        }, 0);
        
        const formatCounts = this.history.reduce((counts, item) => {
            counts[item.format] = (counts[item.format] || 0) + 1;
            return counts;
        }, {});
        
        return {
            totalItems: this.history.length,
            totalSize: totalSize,
            formatCounts: formatCounts,
            oldestItem: this.history.length > 0 ? this.history[0].timestamp : null,
            newestItem: this.history.length > 0 ? this.history[this.history.length - 1].timestamp : null
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HistoryManager;
}