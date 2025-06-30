// Phase 2 - Advanced Features: Social Media Sharing
class SocialShareManager {
    constructor() {
        this.platforms = {
            twitter: {
                name: 'Twitter',
                icon: 'fab fa-twitter',
                color: '#1da1f2',
                shareUrl: 'https://twitter.com/intent/tweet',
                params: ['text', 'url', 'hashtags']
            },
            facebook: {
                name: 'Facebook',
                icon: 'fab fa-facebook-f',
                color: '#4267b2',
                shareUrl: 'https://www.facebook.com/sharer/sharer.php',
                params: ['u', 'quote']
            },
            linkedin: {
                name: 'LinkedIn',
                icon: 'fab fa-linkedin-in',
                color: '#0077b5',
                shareUrl: 'https://www.linkedin.com/sharing/share-offsite/',
                params: ['url', 'title', 'summary']
            },
            pinterest: {
                name: 'Pinterest',
                icon: 'fab fa-pinterest-p',
                color: '#bd081c',
                shareUrl: 'https://pinterest.com/pin/create/button/',
                params: ['url', 'media', 'description']
            },
            reddit: {
                name: 'Reddit',
                icon: 'fab fa-reddit-alien',
                color: '#ff4500',
                shareUrl: 'https://reddit.com/submit',
                params: ['url', 'title']
            },
            whatsapp: {
                name: 'WhatsApp',
                icon: 'fab fa-whatsapp',
                color: '#25d366',
                shareUrl: 'https://wa.me/',
                params: ['text']
            },
            telegram: {
                name: 'Telegram',
                icon: 'fab fa-telegram-plane',
                color: '#0088cc',
                shareUrl: 'https://t.me/share/url',
                params: ['url', 'text']
            }
        };
        
        this.uploadServices = {
            imgur: {
                name: 'Imgur',
                apiUrl: 'https://api.imgur.com/3/image',
                clientId: 'YOUR_IMGUR_CLIENT_ID' // À remplacer par votre client ID
            },
            cloudinary: {
                name: 'Cloudinary',
                apiUrl: 'https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload',
                uploadPreset: 'YOUR_UPLOAD_PRESET' // À remplacer par votre preset
            }
        };
        
        this.shareHistory = this.loadShareHistory();
    }

    /**
     * Initialize social sharing features
     */
    init() {
        this.setupShareButtons();
        this.setupQuickShare();
        this.setupCustomMessages();
        this.setupShareHistory();
    }

    /**
     * Setup share buttons
     */
    setupShareButtons() {
        const shareContainer = document.getElementById('socialShareContainer');
        if (!shareContainer) return;

        shareContainer.innerHTML = `
            <div class="share-header">
                <h3><i class="fas fa-share-alt"></i> Partager votre création</h3>
                <p>Partagez directement sur vos réseaux sociaux préférés</p>
            </div>
            <div class="share-platforms">
                ${Object.entries(this.platforms).map(([key, platform]) => `
                    <button class="share-btn" data-platform="${key}" style="--platform-color: ${platform.color}">
                        <i class="${platform.icon}"></i>
                        <span>${platform.name}</span>
                    </button>
                `).join('')}
            </div>
            <div class="share-options">
                <div class="share-option">
                    <label for="shareMessage">Message personnalisé :</label>
                    <textarea id="shareMessage" placeholder="Ajoutez votre message..." rows="3"></textarea>
                </div>
                <div class="share-option">
                    <label for="shareHashtags">Hashtags :</label>
                    <input type="text" id="shareHashtags" placeholder="#design #htmltopng #creation" />
                </div>
                <div class="share-option">
                    <label>
                        <input type="checkbox" id="uploadToCloud" checked>
                        Héberger l'image automatiquement
                    </label>
                </div>
            </div>
        `;

        // Add event listeners
        shareContainer.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const platform = e.currentTarget.dataset.platform;
                this.shareToplatform(platform);
            });
        });
    }

    /**
     * Setup quick share functionality
     */
    setupQuickShare() {
        const quickShareBtn = document.getElementById('quickShareBtn');
        if (!quickShareBtn) return;

        quickShareBtn.addEventListener('click', () => {
            this.showQuickShareModal();
        });
    }

    /**
     * Share to specific platform
     */
    async shareToplatform(platformKey) {
        const platform = this.platforms[platformKey];
        if (!platform) return;

        try {
            // Get current image
            const imageData = await this.getCurrentImage();
            if (!imageData) {
                this.showToast('Veuillez d\'abord générer une image', 'error');
                return;
            }

            // Upload image if needed
            let imageUrl = null;
            const uploadToCloud = document.getElementById('uploadToCloud')?.checked;
            
            if (uploadToCloud) {
                imageUrl = await this.uploadImage(imageData);
            }

            // Get custom message and hashtags
            const customMessage = document.getElementById('shareMessage')?.value || '';
            const hashtags = document.getElementById('shareHashtags')?.value || '';

            // Build share URL
            const shareUrl = this.buildShareUrl(platformKey, {
                imageUrl,
                message: customMessage,
                hashtags
            });

            // Open share window
            this.openShareWindow(shareUrl, platform.name);

            // Save to history
            this.addToShareHistory({
                platform: platformKey,
                message: customMessage,
                hashtags,
                imageUrl,
                timestamp: Date.now()
            });

        } catch (error) {
            console.error('Share error:', error);
            this.showToast('Erreur lors du partage : ' + error.message, 'error');
        }
    }

    /**
     * Get current image data
     */
    async getCurrentImage() {
        // Try to get from the main converter
        if (window.htmlToPngConverter && window.htmlToPngConverter.lastGeneratedImage) {
            return window.htmlToPngConverter.lastGeneratedImage;
        }

        // Try to generate new image
        const canvas = document.querySelector('canvas');
        if (canvas) {
            return canvas.toDataURL('image/png');
        }

        return null;
    }

    /**
     * Upload image to cloud service
     */
    async uploadImage(imageData) {
        try {
            // Try Imgur first (free and no account needed)
            const response = await this.uploadToImgur(imageData);
            return response.link;
        } catch (error) {
            console.error('Upload error:', error);
            throw new Error('Impossible d\'héberger l\'image');
        }
    }

    /**
     * Upload to Imgur
     */
    async uploadToImgur(imageData) {
        const base64Data = imageData.split(',')[1]; // Remove data:image/png;base64, prefix
        
        const response = await fetch('https://api.imgur.com/3/image', {
            method: 'POST',
            headers: {
                'Authorization': `Client-ID ${this.uploadServices.imgur.clientId}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image: base64Data,
                type: 'base64',
                title: 'HTML to PNG Creation',
                description: 'Created with HTML to PNG Converter'
            })
        });

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        const result = await response.json();
        return result.data;
    }

    /**
     * Build share URL for platform
     */
    buildShareUrl(platformKey, options) {
        const platform = this.platforms[platformKey];
        const params = new URLSearchParams();

        switch (platformKey) {
            case 'twitter':
                if (options.message) params.append('text', options.message);
                if (options.imageUrl) params.append('url', options.imageUrl);
                if (options.hashtags) params.append('hashtags', options.hashtags.replace(/#/g, ''));
                break;

            case 'facebook':
                if (options.imageUrl) params.append('u', options.imageUrl);
                if (options.message) params.append('quote', options.message);
                break;

            case 'linkedin':
                if (options.imageUrl) params.append('url', options.imageUrl);
                if (options.message) {
                    params.append('title', 'Ma création HTML to PNG');
                    params.append('summary', options.message);
                }
                break;

            case 'pinterest':
                if (options.imageUrl) {
                    params.append('url', window.location.href);
                    params.append('media', options.imageUrl);
                    params.append('description', options.message || 'Créé avec HTML to PNG Converter');
                }
                break;

            case 'reddit':
                if (options.imageUrl) params.append('url', options.imageUrl);
                params.append('title', options.message || 'Ma création HTML to PNG');
                break;

            case 'whatsapp':
                const whatsappText = `${options.message || 'Regardez ma création !'} ${options.imageUrl || ''}`;
                return `${platform.shareUrl}?text=${encodeURIComponent(whatsappText)}`;

            case 'telegram':
                if (options.imageUrl) params.append('url', options.imageUrl);
                if (options.message) params.append('text', options.message);
                break;
        }

        return `${platform.shareUrl}?${params.toString()}`;
    }

    /**
     * Open share window
     */
    openShareWindow(url, platformName) {
        const width = 600;
        const height = 400;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;

        const popup = window.open(
            url,
            `share-${platformName}`,
            `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
        );

        if (!popup) {
            // Fallback if popup blocked
            window.open(url, '_blank');
        }

        this.showToast(`Partage vers ${platformName} ouvert`, 'success');
    }

    /**
     * Show quick share modal
     */
    showQuickShareModal() {
        const modal = document.createElement('div');
        modal.className = 'quick-share-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Partage Rapide</h3>
                    <button class="close-modal" data-close-modal="quick-share-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="quick-share-grid">
                        ${Object.entries(this.platforms).slice(0, 4).map(([key, platform]) => `
                            <button class="quick-share-btn" data-platform="${key}" data-close-after-share="true">
                                <i class="${platform.icon}" style="color: ${platform.color}"></i>
                                <span>${platform.name}</span>
                            </button>
                        `).join('')}
                    </div>
                    <div class="share-actions">
                        <button class="btn-secondary" data-action="copy">
                            <i class="fas fa-copy"></i> Copier l'image
                        </button>
                        <button class="btn-secondary" data-action="download">
                            <i class="fas fa-download"></i> Télécharger
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Add event listeners for modal interactions
        const closeBtn = modal.querySelector('[data-close-modal]');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                modal.remove();
            });
        }
        
        // Add event listeners for platform buttons
        const platformBtns = modal.querySelectorAll('[data-platform]');
        platformBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const platform = btn.getAttribute('data-platform');
                this.shareToplatform(platform);
                if (btn.getAttribute('data-close-after-share') === 'true') {
                    modal.remove();
                }
            });
        });
        
        // Add event listeners for action buttons
        const actionBtns = modal.querySelectorAll('[data-action]');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const action = btn.getAttribute('data-action');
                if (action === 'copy') {
                    this.copyImageToClipboard();
                } else if (action === 'download') {
                    this.downloadAndShare();
                }
            });
        });
    }

    /**
     * Copy image to clipboard
     */
    async copyImageToClipboard() {
        try {
            const imageData = await this.getCurrentImage();
            if (!imageData) {
                this.showToast('Aucune image à copier', 'error');
                return;
            }

            // Convert data URL to blob
            const response = await fetch(imageData);
            const blob = await response.blob();

            // Copy to clipboard
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);

            this.showToast('Image copiée dans le presse-papiers', 'success');
        } catch (error) {
            console.error('Copy error:', error);
            this.showToast('Impossible de copier l\'image', 'error');
        }
    }

    /**
     * Download and share
     */
    async downloadAndShare() {
        try {
            const imageData = await this.getCurrentImage();
            if (!imageData) {
                this.showToast('Aucune image à télécharger', 'error');
                return;
            }

            // Create download link
            const link = document.createElement('a');
            link.href = imageData;
            link.download = `htmltopng-creation-${Date.now()}.png`;
            link.click();

            // Show native share if available
            if (navigator.share) {
                const response = await fetch(imageData);
                const blob = await response.blob();
                const file = new File([blob], 'creation.png', { type: 'image/png' });

                await navigator.share({
                    title: 'Ma création HTML to PNG',
                    text: 'Regardez ce que j\'ai créé avec HTML to PNG Converter !',
                    files: [file]
                });
            }

            this.showToast('Image téléchargée', 'success');
        } catch (error) {
            console.error('Download error:', error);
            this.showToast('Erreur lors du téléchargement', 'error');
        }
    }

    /**
     * Setup custom messages
     */
    setupCustomMessages() {
        const messageTemplates = {
            creative: "Regardez ma dernière création ! 🎨 #design #creativity",
            business: "Nouveau design professionnel créé avec HTML to PNG 💼 #business #design",
            code: "Partage de code stylé ! 💻 #coding #webdev #htmltopng",
            social: "Ma nouvelle création pour les réseaux sociaux ! 📱 #socialmedia #design"
        };

        const templateSelector = document.getElementById('messageTemplate');
        if (templateSelector) {
            templateSelector.innerHTML = `
                <option value="">Message personnalisé</option>
                ${Object.entries(messageTemplates).map(([key, template]) => 
                    `<option value="${template}">${key.charAt(0).toUpperCase() + key.slice(1)}</option>`
                ).join('')}
            `;

            templateSelector.addEventListener('change', (e) => {
                const messageInput = document.getElementById('shareMessage');
                if (messageInput && e.target.value) {
                    messageInput.value = e.target.value;
                }
            });
        }
    }

    /**
     * Setup share history
     */
    setupShareHistory() {
        const historyBtn = document.getElementById('shareHistoryBtn');
        if (historyBtn) {
            historyBtn.addEventListener('click', () => {
                this.showShareHistory();
            });
        }
    }

    /**
     * Show share history
     */
    showShareHistory() {
        const modal = document.createElement('div');
        modal.className = 'share-history-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Historique des Partages</h3>
                    <button class="close-modal" data-close-modal="share-history-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${this.renderShareHistory()}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Add event listener for close button
        const closeBtn = modal.querySelector('[data-close-modal]');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                modal.remove();
            });
        }
        
        // Add event listeners for reshare buttons
        const reshareBtns = modal.querySelectorAll('[data-reshare-platform]');
        reshareBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const platform = btn.getAttribute('data-reshare-platform');
                const message = btn.getAttribute('data-reshare-message');
                this.reshare(platform, message);
            });
        });
    }

    /**
     * Render share history
     */
    renderShareHistory() {
        if (this.shareHistory.length === 0) {
            return `
                <div class="history-empty">
                    <i class="fas fa-share-alt"></i>
                    <p>Aucun partage dans l'historique</p>
                </div>
            `;
        }

        return `
            <div class="share-history-list">
                ${this.shareHistory.slice(-10).reverse().map(share => `
                    <div class="share-history-item">
                        <div class="share-platform">
                            <i class="${this.platforms[share.platform].icon}" style="color: ${this.platforms[share.platform].color}"></i>
                            <span>${this.platforms[share.platform].name}</span>
                        </div>
                        <div class="share-content">
                            <p class="share-message">${share.message || 'Pas de message'}</p>
                            <small class="share-time">${new Date(share.timestamp).toLocaleString()}</small>
                        </div>
                        <div class="share-actions">
                            <button class="btn-icon" data-reshare-platform="${share.platform}" data-reshare-message="${share.message}" title="Repartager">
                                <i class="fas fa-redo"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Reshare from history
     */
    reshare(platform, message) {
        const messageInput = document.getElementById('shareMessage');
        if (messageInput) {
            messageInput.value = message;
        }
        
        this.shareToplatform(platform);
        
        // Close history modal
        const modal = document.querySelector('.share-history-modal');
        if (modal) modal.remove();
    }

    /**
     * Add to share history
     */
    addToShareHistory(shareData) {
        this.shareHistory.push(shareData);
        
        // Keep only last 50 shares
        if (this.shareHistory.length > 50) {
            this.shareHistory = this.shareHistory.slice(-50);
        }
        
        this.saveShareHistory();
    }

    /**
     * Load share history from localStorage
     */
    loadShareHistory() {
        try {
            const stored = localStorage.getItem('htmltopng_share_history');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading share history:', error);
            return [];
        }
    }

    /**
     * Save share history to localStorage
     */
    saveShareHistory() {
        try {
            localStorage.setItem('htmltopng_share_history', JSON.stringify(this.shareHistory));
        } catch (error) {
            console.error('Error saving share history:', error);
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
     * Get sharing statistics
     */
    getStatistics() {
        const platformCounts = {};
        Object.keys(this.platforms).forEach(platform => platformCounts[platform] = 0);
        
        this.shareHistory.forEach(share => {
            platformCounts[share.platform] = (platformCounts[share.platform] || 0) + 1;
        });
        
        return {
            totalShares: this.shareHistory.length,
            platformCounts: platformCounts,
            lastShare: this.shareHistory.length > 0 ? this.shareHistory[this.shareHistory.length - 1].timestamp : null
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SocialShareManager;
}