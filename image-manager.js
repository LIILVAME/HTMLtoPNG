// Phase 2 - Advanced Features: Image Management
class ImageManager {
    constructor() {
        this.supportedFormats = ['png', 'jpeg', 'webp'];
        this.imageCache = new Map();
        this.corsProxyUrl = 'https://cors-anywhere.herokuapp.com/';
        this.maxImageSize = 5 * 1024 * 1024; // 5MB
    }

    /**
     * Initialize image management features
     */
    init() {
        this.setupFormatSelector();
        this.setupImageUpload();
        this.setupExternalImageSupport();
        this.setupQualityControls();
    }

    /**
     * Setup format selector for different export formats
     */
    setupFormatSelector() {
        const formatSelector = document.getElementById('formatSelector');
        if (!formatSelector) return;

        formatSelector.innerHTML = `
            <option value="png">PNG (Transparent)</option>
            <option value="jpeg">JPEG (Compressed)</option>
            <option value="webp">WebP (Modern)</option>
        `;

        formatSelector.addEventListener('change', (e) => {
            this.updateFormatSettings(e.target.value);
        });
    }

    /**
     * Setup image upload functionality
     */
    setupImageUpload() {
        const uploadArea = document.getElementById('imageUploadArea');
        const fileInput = document.getElementById('imageFileInput');
        
        if (!uploadArea || !fileInput) return;

        // Drag and drop functionality
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            this.handleImageFiles(e.dataTransfer.files);
        });

        // Click to upload
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            this.handleImageFiles(e.target.files);
        });
    }

    /**
     * Handle uploaded image files
     */
    async handleImageFiles(files) {
        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                this.showError('Veuillez sélectionner uniquement des fichiers image.');
                continue;
            }

            if (file.size > this.maxImageSize) {
                this.showError('L\'image est trop volumineuse. Taille maximale : 5MB.');
                continue;
            }

            try {
                const imageData = await this.processImageFile(file);
                this.addImageToGallery(imageData);
            } catch (error) {
                this.showError(`Erreur lors du traitement de l'image : ${error.message}`);
            }
        }
    }

    /**
     * Process image file and convert to base64
     */
    processImageFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    resolve({
                        name: file.name,
                        src: e.target.result,
                        width: img.width,
                        height: img.height,
                        size: file.size
                    });
                };
                img.onerror = () => reject(new Error('Image invalide'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * Add image to gallery
     */
    addImageToGallery(imageData) {
        const gallery = document.getElementById('imageGallery');
        if (!gallery) return;

        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';
        imageItem.innerHTML = `
            <img src="${imageData.src}" alt="${imageData.name}" loading="lazy">
            <div class="image-info">
                <span class="image-name">${imageData.name}</span>
                <span class="image-size">${imageData.width}×${imageData.height}</span>
            </div>
            <div class="image-actions">
                <button class="btn-icon" onclick="imageManager.insertImage('${imageData.src}')" title="Insérer dans le code">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="btn-icon" onclick="imageManager.removeImage(this)" title="Supprimer">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        gallery.appendChild(imageItem);
        this.imageCache.set(imageData.name, imageData);
    }

    /**
     * Insert image into HTML code
     */
    insertImage(src) {
        const htmlInput = document.getElementById('htmlInput');
        if (!htmlInput) return;

        const imageTag = `<img src="${src}" alt="Uploaded image" style="max-width: 100%; height: auto;">`;
        const currentValue = htmlInput.value;
        const cursorPosition = htmlInput.selectionStart;
        
        const newValue = currentValue.slice(0, cursorPosition) + imageTag + currentValue.slice(cursorPosition);
        htmlInput.value = newValue;
        
        // Trigger input event to update preview
        htmlInput.dispatchEvent(new Event('input'));
        
        this.showSuccess('Image insérée dans le code HTML !');
    }

    /**
     * Remove image from gallery
     */
    removeImage(button) {
        const imageItem = button.closest('.image-item');
        const imageName = imageItem.querySelector('.image-name').textContent;
        
        imageItem.remove();
        this.imageCache.delete(imageName);
        
        this.showSuccess('Image supprimée de la galerie.');
    }

    /**
     * Setup external image support with CORS proxy
     */
    setupExternalImageSupport() {
        const urlInput = document.getElementById('externalImageUrl');
        const addButton = document.getElementById('addExternalImage');
        
        if (!urlInput || !addButton) return;

        addButton.addEventListener('click', () => {
            this.loadExternalImage(urlInput.value);
        });

        urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.loadExternalImage(urlInput.value);
            }
        });
    }

    /**
     * Load external image with CORS handling
     */
    async loadExternalImage(url) {
        if (!url) {
            this.showError('Veuillez entrer une URL d\'image valide.');
            return;
        }

        try {
            const proxyUrl = this.corsProxyUrl + url;
            const response = await fetch(proxyUrl);
            
            if (!response.ok) {
                throw new Error('Impossible de charger l\'image');
            }

            const blob = await response.blob();
            const file = new File([blob], 'external-image.jpg', { type: blob.type });
            
            await this.handleImageFiles([file]);
            document.getElementById('externalImageUrl').value = '';
            
        } catch (error) {
            this.showError(`Erreur lors du chargement de l'image externe : ${error.message}`);
        }
    }

    /**
     * Setup quality controls for different formats
     */
    setupQualityControls() {
        const qualitySlider = document.getElementById('qualitySlider');
        const qualityValue = document.getElementById('qualityValue');
        
        if (!qualitySlider || !qualityValue) return;

        qualitySlider.addEventListener('input', (e) => {
            qualityValue.textContent = e.target.value + '%';
        });
    }

    /**
     * Update format-specific settings
     */
    updateFormatSettings(format) {
        const qualityControls = document.getElementById('qualityControls');
        const transparencyNote = document.getElementById('transparencyNote');
        
        if (qualityControls) {
            qualityControls.style.display = format === 'png' ? 'none' : 'block';
        }
        
        if (transparencyNote) {
            transparencyNote.style.display = format === 'png' ? 'block' : 'none';
        }
    }

    /**
     * Convert canvas to specified format
     */
    convertCanvasToFormat(canvas, format, quality = 0.9) {
        switch (format) {
            case 'jpeg':
                return canvas.toDataURL('image/jpeg', quality);
            case 'webp':
                return canvas.toDataURL('image/webp', quality);
            case 'png':
            default:
                return canvas.toDataURL('image/png');
        }
    }

    /**
     * Get file extension for format
     */
    getFileExtension(format) {
        const extensions = {
            'png': 'png',
            'jpeg': 'jpg',
            'webp': 'webp'
        };
        return extensions[format] || 'png';
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        // Use existing toast system if available
        if (window.htmlToPngConverter && window.htmlToPngConverter.showToast) {
            window.htmlToPngConverter.showToast(message, 'success');
        } else {
            console.log('Success:', message);
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        // Use existing toast system if available
        if (window.htmlToPngConverter && window.htmlToPngConverter.showToast) {
            window.htmlToPngConverter.showToast(message, 'error');
        } else {
            console.error('Error:', message);
        }
    }

    /**
     * Get statistics about loaded images
     */
    getStatistics() {
        return {
            totalImages: this.imageCache.size,
            totalSize: Array.from(this.imageCache.values()).reduce((sum, img) => sum + img.size, 0),
            supportedFormats: this.supportedFormats
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageManager;
}