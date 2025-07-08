// HTML to PNG Converter - Main Application Logic
class HTMLtoPNGConverter {
    constructor() {
        this.currentFormat = 'html';
        this.previewTimeout = null;
        this.lastGeneratedImage = null;
        this.workerManager = null;
        
        this.init();
    }

    init() {
        console.log('HTMLtoPNGConverter: Initialisation...');
        try {
            this.initializeTheme();
            this.bindEvents();
            this.setupPresets();
            this.initializePreview();
            this.setupKeyboardShortcuts();
            this.setupAutoSave();
            
            // Initialize Web Worker for performance
            this.initializeWorkerManager();
            
            // Initialize Cache Manager for performance
            this.initializeCacheManager();
            
            // Initialize Lazy Loader for performance
            this.initializeLazyLoader();
            
            // Initialize API Services
            this.initializeAPIServices();
            
            // Initialize Phase 2 Features
            this.initializeImageManager();
            this.initializeHistoryManager();

            this.initializeSocialShare();
            this.initializeQuickToolbar();
            
            // Initialize empty preview
            setTimeout(() => this.updatePreview(), 500);
            
            // Set default preset to desktop
            this.applyPreset('desktop');
            
            // Initialize UX improvements
            this.initializeOnboarding();
            this.initializeProgressTracking();
            this.initializeMicroInteractions();
            
            console.log('HTMLtoPNGConverter: Initialisation réussie');
        } catch (error) {
            console.error('HTMLtoPNGConverter: Erreur lors de l\'initialisation:', error);
        }
    }

    bindEvents() {
        // Format switching
        document.querySelectorAll('.format-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchFormat(e.target.closest('.format-btn').dataset.format);
            });
        });

        // Code input changes
        const htmlInput = document.getElementById('htmlInput');
        const cssInput = document.getElementById('cssInput');
        
        if (htmlInput) {
            htmlInput.addEventListener('input', () => this.debouncePreview());
        }
        if (cssInput) {
            cssInput.addEventListener('input', () => this.debouncePreview());
        }

        // Resolution presets
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.applyPreset(e.target.closest('.preset-btn').dataset.preset);
            });
        });

        // Social media presets
        document.querySelectorAll('.social-preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.applyPreset(e.target.closest('.social-preset-btn').dataset.preset);
            });
        });

        // Convert button with Web Worker support
        const convertBtn = document.getElementById('convertBtn');
        if (convertBtn) {
            convertBtn.addEventListener('click', () => {
                // Use Web Worker if available, fallback to original method
                if (this.workerManager && this.workerManager.isReady()) {
                    this.convertToImageWithWorker();
                } else {
                    this.convertToImage();
                }
            });
        }

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Help modal
        const helpBtn = document.getElementById('helpBtn');
        const helpModal = document.getElementById('helpModal');
        const closeHelpModal = document.getElementById('closeHelpModal');
        
        if (helpBtn && helpModal && closeHelpModal) {
            helpBtn.addEventListener('click', () => {
                helpModal.style.display = 'flex';
            });
            
            closeHelpModal.addEventListener('click', () => {
                helpModal.style.display = 'none';
            });
            
            helpModal.addEventListener('click', (e) => {
                if (e.target === helpModal) {
                    helpModal.style.display = 'none';
                }
            });
        }



        // Format selection
        const formatSelect = document.getElementById('formatSelect');
        if (formatSelect) {
            formatSelect.addEventListener('change', () => {
                this.updatePreview();
            });
        }

        // Control buttons
        const refreshBtn = document.getElementById('refreshBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const expandBtn = document.getElementById('expandBtn');
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshPreview());
        }
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadImage());
        }
        if (expandBtn) {
            expandBtn.addEventListener('click', () => this.expandPreview());
        }
        
        // Preview expand modal
        const previewExpandModal = document.getElementById('previewExpandModal');
        const previewExpandClose = document.getElementById('previewExpandClose');
        
        if (previewExpandClose) {
            previewExpandClose.addEventListener('click', () => this.closeExpandedPreview());
        }
        if (previewExpandModal) {
            previewExpandModal.addEventListener('click', (e) => {
                if (e.target === previewExpandModal) {
                    this.closeExpandedPreview();
                }
            });
        }

        // Resolution inputs
        const widthInput = document.getElementById('widthInput');
        const heightInput = document.getElementById('heightInput');
        
        if (widthInput) {
            widthInput.addEventListener('change', () => this.updatePreviewSize());
        }
        if (heightInput) {
            heightInput.addEventListener('change', () => this.updatePreviewSize());
        }

        // Social sharing event listeners
        const shareTwitter = document.getElementById('shareTwitter');
        const shareFacebook = document.getElementById('shareFacebook');
        const shareLinkedIn = document.getElementById('shareLinkedIn');
        const sharePinterest = document.getElementById('sharePinterest');
        const copyImageLink = document.getElementById('copyImageLink');

        if (shareTwitter) {
            shareTwitter.addEventListener('click', () => this.shareOnTwitter());
        }
        if (shareFacebook) {
            shareFacebook.addEventListener('click', () => this.shareOnFacebook());
        }
        if (shareLinkedIn) {
            shareLinkedIn.addEventListener('click', () => this.shareOnLinkedIn());
        }
        if (sharePinterest) {
            sharePinterest.addEventListener('click', () => this.shareOnPinterest());
        }
        if (copyImageLink) {
            copyImageLink.addEventListener('click', () => this.copyImageLink());
        }



        // External services event listeners

    }

    switchFormat(format) {
        this.currentFormat = format;
        
        // Update button states
        document.querySelectorAll('.format-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-format="${format}"]`).classList.add('active');
        
        // Update input visibility
        document.querySelectorAll('.code-input').forEach(input => {
            input.classList.remove('active');
        });
        document.getElementById(`${format}Input`).classList.add('active');
        
        // Update preview container format
        const previewContainer = document.querySelector('.preview-container');
        if (previewContainer) {
            previewContainer.setAttribute('data-format', format);
        }
    }

    setupPresets() {
        this.presets = {
            mobile: { width: 375, height: 667, scale: 0.4 },
            iphone: { width: 375, height: 812, scale: 0.35 }, // iPhone X/11/12/13 dimensions
            tablet: { width: 768, height: 1024, scale: 0.7 },
            desktop: { width: 1920, height: 1080, scale: 1.0 },
            social: { width: 1200, height: 630, scale: 0.8 },
            // Social Media Presets
            'instagram-post': { width: 1080, height: 1080, scale: 0.8 },
            'instagram-story': { width: 1080, height: 1920, scale: 0.6 },
            'facebook-post': { width: 1200, height: 630, scale: 0.8 },
            'facebook-cover': { width: 1640, height: 859, scale: 0.7 },
            'twitter-post': { width: 1200, height: 675, scale: 0.8 },
            'twitter-header': { width: 1500, height: 500, scale: 0.7 },
            'linkedin-post': { width: 1200, height: 627, scale: 0.8 },
            'youtube-thumbnail': { width: 1280, height: 720, scale: 0.8 }
        };
        this.currentPreset = 'desktop'; // Default preset
    }

    applyPreset(presetName) {
        const preset = this.presets[presetName];
        if (preset) {
            this.currentPreset = presetName;
            document.getElementById('widthInput').value = preset.width;
            document.getElementById('heightInput').value = preset.height;
            this.updatePreviewSize();
            this.updatePreview(); // Refresh preview with new scaling
            
            // Update preview container preset
            const previewContainer = document.querySelector('.preview-container');
            if (previewContainer) {
                previewContainer.setAttribute('data-preset', presetName);
                
                // Add specific classes based on preset type
                previewContainer.classList.remove('mobile-preset', 'iphone-preset', 'tablet-preset', 'desktop-preset', 'social-preset');
                if (presetName === 'mobile') {
                    previewContainer.classList.add('mobile-preset');
                } else if (presetName === 'iphone') {
                    previewContainer.classList.add('iphone-preset');
                } else if (presetName === 'tablet') {
                    previewContainer.classList.add('tablet-preset');
                } else if (presetName === 'desktop') {
                    previewContainer.classList.add('desktop-preset');
                } else if (presetName.includes('social') || presetName.includes('instagram') || presetName.includes('facebook') || presetName.includes('twitter') || presetName.includes('linkedin') || presetName.includes('youtube')) {
                    previewContainer.classList.add('social-preset');
                }
            }
            
            // Remove active state from all preset buttons
            document.querySelectorAll('.preset-btn, .social-preset-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active state to current preset button
            const btn = document.querySelector(`[data-preset="${presetName}"]`);
            if (btn) {
                btn.classList.add('active');
                btn.classList.add('pulse');
                setTimeout(() => btn.classList.remove('pulse'), 1000);
            }
            
            // Show success message with preset info
            this.showSuccess(`Preset appliqué: ${preset.width}×${preset.height}px`);
        }
    }



    debouncePreview() {
        clearTimeout(this.previewTimeout);
        this.previewTimeout = setTimeout(() => {
            this.updatePreview();
        }, 300);
    }

    updatePreview() {
        console.log('HTMLtoPNGConverter: updatePreview() appelée');
        try {
            const htmlInput = document.getElementById('htmlInput');
            const cssInput = document.getElementById('cssInput');
            
            if (!htmlInput || !cssInput) {
                console.error('Elements input non trouvés');
                return;
            }
            
            const htmlCode = htmlInput.value;
            const cssCode = cssInput.value;
            
            console.log('HTML Code length:', htmlCode.length);
            console.log('CSS Code length:', cssCode.length);
            
            if (!htmlCode.trim()) {
                this.showPreviewPlaceholder();
                return;
            }

            const combinedHTML = this.combineHTMLCSS(htmlCode, cssCode);
            this.renderPreview(combinedHTML);
        } catch (error) {
            console.error('Erreur dans updatePreview:', error);
        }
    }

    combineHTMLCSS(html, css) {
        // Apply responsive scaling to CSS
        const scaledCSS = this.applyResponsiveScaling(css);
        
        let combinedHTML = html.trim();
        
        // Ensure proper HTML structure
        if (!combinedHTML.includes('<!DOCTYPE')) {
            combinedHTML = '<!DOCTYPE html>\n' + combinedHTML;
        }
        
        if (!combinedHTML.includes('<html')) {
            combinedHTML = combinedHTML.replace('<!DOCTYPE html>', '<!DOCTYPE html>\n<html>');
            combinedHTML += '</html>';
        }
        
        // Ensure head section exists
        if (!combinedHTML.includes('<head>')) {
            if (combinedHTML.includes('<html>')) {
                combinedHTML = combinedHTML.replace('<html>', '<html>\n<head></head>');
            } else {
                combinedHTML = combinedHTML.replace('<html', '<html>\n<head></head><html');
            }
        }
        
        // Ensure body section exists
        if (!combinedHTML.includes('<body>')) {
            if (combinedHTML.includes('</head>')) {
                combinedHTML = combinedHTML.replace('</head>', '</head>\n<body>');
                if (!combinedHTML.includes('</body>')) {
                    combinedHTML = combinedHTML.replace('</html>', '</body>\n</html>');
                }
            }
        }
        
        // Add CSS if provided
        if (scaledCSS.trim()) {
            const cssBlock = `<style type="text/css">\n${scaledCSS}\n</style>`;
            combinedHTML = combinedHTML.replace('</head>', `${cssBlock}\n</head>`);
        }
        
        // Add essential meta tags for better rendering
        const metaTags = `
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                * { box-sizing: border-box; }
                body { margin: 0; padding: 0; }
            </style>
        `;
        
        if (!combinedHTML.includes('<meta charset')) {
            combinedHTML = combinedHTML.replace('<head>', `<head>${metaTags}`);
        }
        
        return combinedHTML;
    }

    applyResponsiveScaling(css) {
        if (!css || !this.currentPreset || !this.presets[this.currentPreset]) {
            return css;
        }

        const scale = this.presets[this.currentPreset].scale;
        if (scale === 1.0) {
            return css; // No scaling needed for desktop
        }

        // Apply scaling to various CSS properties
        let scaledCSS = css;

        // Scale font sizes (px, em, rem)
        scaledCSS = scaledCSS.replace(/font-size\s*:\s*([0-9.]+)(px|em|rem)/gi, (match, value, unit) => {
            const scaledValue = (parseFloat(value) * scale).toFixed(2);
            return `font-size: ${scaledValue}${unit}`;
        });

        // Scale padding and margin (px, em, rem) - handle multiple values
         scaledCSS = scaledCSS.replace(/(padding|margin)(-[a-z]+)?\s*:\s*([^;]+)/gi, (match, property, direction, values) => {
             const scaledValues = values.replace(/([0-9.]+)(px|em|rem)/g, (valueMatch, value, unit) => {
                 const scaledValue = (parseFloat(value) * scale).toFixed(2);
                 return `${scaledValue}${unit}`;
             });
             return `${property}${direction || ''}: ${scaledValues}`;
         });

        // Scale border-radius
        scaledCSS = scaledCSS.replace(/border-radius\s*:\s*([0-9.]+)(px|em|rem)/gi, (match, value, unit) => {
            const scaledValue = (parseFloat(value) * scale).toFixed(2);
            return `border-radius: ${scaledValue}${unit}`;
        });

        // Scale width and height (px, em, rem)
        scaledCSS = scaledCSS.replace(/(width|height|max-width|max-height|min-width|min-height)\s*:\s*([0-9.]+)(px|em|rem)/gi, (match, property, value, unit) => {
            const scaledValue = (parseFloat(value) * scale).toFixed(2);
            return `${property}: ${scaledValue}${unit}`;
        });

        // Scale line-height when specified in px
        scaledCSS = scaledCSS.replace(/line-height\s*:\s*([0-9.]+)(px)/gi, (match, value, unit) => {
            const scaledValue = (parseFloat(value) * scale).toFixed(2);
            return `line-height: ${scaledValue}${unit}`;
        });

        // Scale box-shadow blur and spread
        scaledCSS = scaledCSS.replace(/box-shadow\s*:\s*([^;]+)/gi, (match, shadowValue) => {
            const scaledShadow = shadowValue.replace(/([0-9.]+)(px)/g, (shadowMatch, value, unit) => {
                const scaledValue = (parseFloat(value) * scale).toFixed(2);
                return `${scaledValue}${unit}`;
            });
            return `box-shadow: ${scaledShadow}`;
        });

        // Scale border width - handle shorthand and longhand properties
         scaledCSS = scaledCSS.replace(/border(-[a-z]+)?(-width)?\s*:\s*([^;]+)/gi, (match, side, width, values) => {
             const scaledValues = values.replace(/([0-9.]+)(px)/g, (valueMatch, value, unit) => {
                 const scaledValue = (parseFloat(value) * scale).toFixed(2);
                 return `${scaledValue}${unit}`;
             });
             return `border${side || ''}${width || ''}: ${scaledValues}`;
         });

         // Scale additional properties that affect layout
         scaledCSS = scaledCSS.replace(/(top|right|bottom|left|gap|column-gap|row-gap)\s*:\s*([0-9.]+)(px|em|rem)/gi, (match, property, value, unit) => {
             const scaledValue = (parseFloat(value) * scale).toFixed(2);
             return `${property}: ${scaledValue}${unit}`;
         });

         // Scale transform translate values
         scaledCSS = scaledCSS.replace(/transform\s*:\s*([^;]+)/gi, (match, transformValue) => {
             const scaledTransform = transformValue.replace(/translate[XY]?\(([^)]+)\)/g, (translateMatch, values) => {
                 const scaledValues = values.replace(/([0-9.]+)(px|em|rem)/g, (valueMatch, value, unit) => {
                     const scaledValue = (parseFloat(value) * scale).toFixed(2);
                     return `${scaledValue}${unit}`;
                 });
                 return translateMatch.replace(values, scaledValues);
             });
             return `transform: ${scaledTransform}`;
         });

        // Add responsive CSS rules for all formats
        const responsiveCSS = this.generateResponsiveCSS(scaledCSS, this.currentPreset);
        scaledCSS = responsiveCSS;

        // Add responsive meta tag injection for better mobile rendering
        if (this.currentPreset === 'mobile' || this.currentPreset === 'iphone') {
            scaledCSS = `
                /* Responsive scaling applied for mobile format */
                * {
                    -webkit-text-size-adjust: 100%;
                    -ms-text-size-adjust: 100%;
                }
                body {
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }
                ${scaledCSS}
            `;
        }

        return scaledCSS;
    }

    generateResponsiveCSS(css, currentPreset) {
        const breakpoints = {
            mobile: { max: 480, min: 0 },
            tablet: { max: 768, min: 481 },
            desktop: { max: 1920, min: 769 },
            social: { max: 1200, min: 0 }
        };

        let responsiveCSS = css;

        // Add base responsive rules
        const baseResponsiveRules = `
            /* Base responsive rules */
            * {
                box-sizing: border-box;
            }
            
            img, video, iframe {
                max-width: 100%;
                height: auto;
            }
            
            .responsive-container {
                width: 100%;
                max-width: 100%;
                overflow-x: auto;
            }
            
            .responsive-text {
                word-wrap: break-word;
                overflow-wrap: break-word;
            }
        `;

        // Generate media queries for different screen sizes
        const mediaQueries = `
            /* Mobile First Approach */
            @media screen and (max-width: 480px) {
                body {
                    font-size: ${(currentPreset === 'mobile' || currentPreset === 'iphone') ? '1em' : '0.9em'};
                    line-height: 1.4;
                }
                
                .container, .content {
                    padding: 10px;
                    margin: 5px;
                }
                
                h1, h2, h3, h4, h5, h6 {
                    line-height: 1.2;
                }
                
                table {
                    font-size: 0.8em;
                }
            }
            
            /* Tablet */
            @media screen and (min-width: 481px) and (max-width: 768px) {
                body {
                    font-size: ${currentPreset === 'tablet' ? '1em' : '0.95em'};
                    line-height: 1.5;
                }
                
                .container, .content {
                    padding: 15px;
                    margin: 10px;
                }
            }
            
            /* Desktop */
            @media screen and (min-width: 769px) {
                body {
                    font-size: ${currentPreset === 'desktop' ? '1em' : '1em'};
                    line-height: 1.6;
                }
                
                .container, .content {
                    padding: 20px;
                    margin: 15px;
                }
            }
            
            /* High DPI displays */
            @media screen and (-webkit-min-device-pixel-ratio: 2),
                   screen and (min-resolution: 192dpi) {
                body {
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }
            }
            
            /* Print styles for better image generation */
            @media print {
                * {
                    background: transparent !important;
                    color: black !important;
                    box-shadow: none !important;
                    text-shadow: none !important;
                }
                
                body {
                    font-size: 12pt;
                    line-height: 1.4;
                }
            }
        `;

        // Add responsive utilities
        const responsiveUtilities = `
            /* Responsive utilities */
            .hide-mobile { display: block; }
            .hide-tablet { display: block; }
            .hide-desktop { display: block; }
            
            @media screen and (max-width: 480px) {
                .hide-mobile { display: none !important; }
                .show-mobile { display: block !important; }
            }
            
            @media screen and (min-width: 481px) and (max-width: 768px) {
                .hide-tablet { display: none !important; }
                .show-tablet { display: block !important; }
            }
            
            @media screen and (min-width: 769px) {
                .hide-desktop { display: none !important; }
                .show-desktop { display: block !important; }
            }
            
            /* Responsive grid system */
            .row {
                display: flex;
                flex-wrap: wrap;
                margin: -5px;
            }
            
            .col {
                flex: 1;
                padding: 5px;
                min-width: 0;
            }
            
            @media screen and (max-width: 480px) {
                .row {
                    flex-direction: column;
                }
                
                .col {
                    flex: none;
                    width: 100%;
                }
            }
        `;

        return baseResponsiveRules + responsiveCSS + mediaQueries + responsiveUtilities;
    }

    renderPreview(html) {
        console.log('HTMLtoPNGConverter: renderPreview() appelée');
        try {
            const previewFrame = document.getElementById('previewFrame');
            const placeholder = document.getElementById('previewPlaceholder');
            
            if (!previewFrame) {
                console.error('Element previewFrame non trouvé');
                return;
            }
            
            if (!placeholder) {
                console.error('Element previewPlaceholder non trouvé');
                return;
            }
            
            // Create blob URL for the HTML content
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            console.log('Blob URL créé:', url);
            
            previewFrame.src = url;
            previewFrame.style.display = 'block';
            placeholder.style.display = 'none';
            
            // Clean up previous blob URL
            previewFrame.onload = () => {
                console.log('Preview frame chargé avec succès');
                URL.revokeObjectURL(url);
            };
            
            previewFrame.onerror = (error) => {
                console.error('Erreur lors du chargement du preview frame:', error);
            };
        } catch (error) {
            console.error('Erreur dans renderPreview:', error);
        }
    }

    showPreviewPlaceholder() {
        const previewFrame = document.getElementById('previewFrame');
        const placeholder = document.getElementById('previewPlaceholder');
        
        if (previewFrame && placeholder) {
            previewFrame.style.display = 'none';
            placeholder.style.display = 'flex';
        }
    }

    updatePreviewSize() {
        const width = parseInt(document.getElementById('widthInput').value) || 800;
        const height = parseInt(document.getElementById('heightInput').value) || 600;
        const previewFrame = document.getElementById('previewFrame');
        const previewContainer = document.querySelector('.preview-container');
        
        if (previewFrame && previewContainer) {
            // Adapter la taille du container selon le preset
            this.adaptContainerToPreset(previewContainer, width, height);
            
            // Calculer les dimensions optimales pour la prévisualisation
            const containerRect = previewContainer.getBoundingClientRect();
            const availableWidth = containerRect.width - 40; // Padding
            const availableHeight = containerRect.height - 40; // Padding
            const aspectRatio = width / height;
            
            let previewWidth, previewHeight;
            
            // Calculer les dimensions pour s'adapter au container tout en gardant le ratio
            if (availableWidth / aspectRatio <= availableHeight) {
                previewWidth = Math.min(availableWidth, width * 0.8); // Max 80% de la taille réelle
                previewHeight = previewWidth / aspectRatio;
            } else {
                previewHeight = Math.min(availableHeight, height * 0.8); // Max 80% de la taille réelle
                previewWidth = previewHeight * aspectRatio;
            }
            
            // Taille minimale pour la lisibilité
            const minSize = this.getMinSizeForPreset();
            if (previewWidth < minSize) {
                previewWidth = minSize;
                previewHeight = minSize / aspectRatio;
            }
            if (previewHeight < minSize) {
                previewHeight = minSize;
                previewWidth = minSize * aspectRatio;
            }
            
            // Appliquer les dimensions de prévisualisation
            previewFrame.style.width = `${Math.round(previewWidth)}px`;
            previewFrame.style.height = `${Math.round(previewHeight)}px`;
            previewFrame.style.margin = 'auto';
            previewFrame.style.display = 'block';
            
            // Stocker les dimensions réelles pour l'export (inchangées)
            previewFrame.setAttribute('data-real-width', width);
            previewFrame.setAttribute('data-real-height', height);
        }
    }

    adaptContainerToPreset(container, width, height) {
        const preset = this.currentPreset || 'desktop';
        
        // Supprimer les styles inline précédents
        container.style.width = '';
        container.style.height = '';
        container.style.maxWidth = '';
        container.style.maxHeight = '';
        
        // Adapter selon le type de preset
        switch (preset) {
            case 'mobile':
                container.style.maxWidth = '420px';
                container.style.height = 'auto';
                container.style.minHeight = '600px';
                break;
                
            case 'iphone':
                container.style.maxWidth = '400px';
                container.style.height = 'auto';
                container.style.minHeight = '700px';
                break;
                
            case 'tablet':
                container.style.maxWidth = '700px';
                container.style.height = 'auto';
                container.style.minHeight = '500px';
                break;
                
            case 'desktop':
                container.style.maxWidth = '100%';
                container.style.height = 'auto';
                container.style.minHeight = '400px';
                break;
                
            default:
                if (preset.includes('social') || preset.includes('instagram') || 
                    preset.includes('facebook') || preset.includes('twitter') || 
                    preset.includes('linkedin') || preset.includes('youtube')) {
                    // Pour les presets sociaux, adapter selon les dimensions
                    if (width <= 500 && height <= 500) {
                        container.style.maxWidth = '450px';
                        container.style.minHeight = '450px';
                    } else {
                        container.style.maxWidth = '600px';
                        container.style.minHeight = '400px';
                    }
                } else {
                    container.style.maxWidth = '100%';
                    container.style.minHeight = '400px';
                }
                break;
        }
    }
    
    getMinSizeForPreset() {
        const preset = this.currentPreset || 'desktop';
        
        switch (preset) {
            case 'mobile':
            case 'iphone':
                return 180;
            case 'tablet':
                return 220;
            case 'desktop':
                return 250;
            default:
                if (preset.includes('social')) {
                    return 150;
                }
                return 200;
        }
    }

    refreshPreview() {
        this.updatePreview();
        
        // Visual feedback
        const refreshBtn = document.getElementById('refreshBtn');
        refreshBtn.classList.add('pulse');
        setTimeout(() => refreshBtn.classList.remove('pulse'), 1000);
    }

    async convertToImage() {
        console.log('🚀 Starting image conversion...');
        const htmlCode = document.getElementById('htmlInput').value;
        const cssCode = document.getElementById('cssInput').value;
        
        console.log('📝 HTML Code length:', htmlCode.length);
        console.log('🎨 CSS Code length:', cssCode.length);
        
        if (!htmlCode.trim()) {
            console.log('❌ Empty HTML code');
            this.showError('HTML code is required for conversion');
            return;
        }

        this.showLoading(true);
        
        try {
            const width = parseInt(document.getElementById('widthInput').value);
            const height = parseInt(document.getElementById('heightInput').value);
            const quality = parseInt(document.getElementById('qualitySelect').value);
            const format = document.querySelector('.format-btn.active')?.dataset.format || 'png';
            
            console.log('📐 Dimensions:', { width, height, quality, format });
            
            // Vérifier le cache d'abord
            let imageDataUrl = null;
            if (this.cacheManager) {
                const cacheKey = this.cacheManager.generateKey(htmlCode, cssCode, width, height, format);
                imageDataUrl = this.cacheManager.get(cacheKey);
                
                if (imageDataUrl) {
                    console.log('✅ Cache hit! Using cached image');
                    this.lastGeneratedImage = imageDataUrl;
                    this.updatePreviewInfo(width, height, quality);
                    this.enableDownloadAndSharing();
                    this.showSuccess('Image récupérée du cache! Cliquez sur télécharger pour sauvegarder.');
                    return;
                }
            }
            
            const combinedHTML = this.combineHTMLCSS(htmlCode, cssCode);
            console.log('🔗 Combined HTML length:', combinedHTML.length);
            
            imageDataUrl = await this.htmlToCanvas(combinedHTML, width, height, quality);
            console.log('🖼️ Image generated successfully, data URL length:', imageDataUrl.length);
            
            // Mettre en cache le résultat
            if (this.cacheManager && imageDataUrl) {
                const cacheKey = this.cacheManager.generateKey(htmlCode, cssCode, width, height, format);
                this.cacheManager.set(cacheKey, imageDataUrl, {
                    timestamp: Date.now(),
                    dimensions: { width, height },
                    format: format
                });
            }
            
            this.lastGeneratedImage = imageDataUrl;
            this.updatePreviewInfo(width, height, quality);
            this.enableDownloadAndSharing();
            
            // Add to history if HistoryManager is available
            if (this.historyManager) {
                const conversionData = {
                    id: Date.now().toString(),
                    timestamp: Date.now(),
                    html: htmlCode,
                    css: cssCode,
                    dimensions: { width, height },
                    format: format,
                    quality: quality,
                    thumbnail: imageDataUrl,
                    size: this.calculateImageSize(imageDataUrl)
                };
                this.historyManager.addConversion(conversionData);
            }
            
            this.showSuccess('Image convertie avec succès! Cliquez sur télécharger pour sauvegarder.');
            
        } catch (error) {
            console.error('❌ Conversion error:', error);
            console.error('Error stack:', error.stack);
            this.showError(`Conversion failed: ${error.message}`);
        } finally {
            this.showLoading(false);
        }
    }

    async htmlToCanvas(html, width, height, quality) {
        console.log('🎬 Starting htmlToCanvas conversion...');
        return new Promise((resolve, reject) => {
            // Utiliser les dimensions réelles pour l'export
            const previewFrame = document.getElementById('previewFrame');
            let realWidth = width, realHeight = height;
            
            if (previewFrame && previewFrame.hasAttribute('data-real-width') && previewFrame.hasAttribute('data-real-height')) {
                realWidth = parseInt(previewFrame.getAttribute('data-real-width'));
                realHeight = parseInt(previewFrame.getAttribute('data-real-height'));
                console.log('📐 Using stored real dimensions for export:', { realWidth, realHeight });
                console.log('📐 Preview dimensions were:', { width, height });
            }
            
            // Create a temporary iframe
            console.log('📦 Creating iframe with real dimensions:', { width: realWidth, height: realHeight, quality });
            const iframe = document.createElement('iframe');
            iframe.style.position = 'absolute';
            iframe.style.left = '-9999px';
            iframe.style.width = `${realWidth}px`;
            iframe.style.height = `${realHeight}px`;
            iframe.style.border = 'none';
            iframe.style.overflow = 'visible';
            iframe.style.minWidth = `${realWidth}px`;
            iframe.style.minHeight = `${realHeight}px`;
            
            document.body.appendChild(iframe);
            console.log('✅ Iframe added to DOM');
            
            iframe.onload = () => {
                console.log('📄 Iframe loaded successfully');
                try {
                    // Use html2canvas library (we'll load it dynamically)
                    console.log('📚 Loading html2canvas library...');
                    this.loadHtml2Canvas().then(() => {
                        console.log('✅ html2canvas library loaded');
                        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                        
                        // Wait for fonts and images to load
                        console.log('⏳ Waiting for content to load...');
                        setTimeout(() => {
                            console.log('🎯 Starting canvas capture...');
                            // Capture the entire document, not just body
                            const targetElement = iframeDoc.documentElement || iframeDoc.body;
                            console.log('🎯 Target element:', targetElement.tagName);
                            
                            // Calculate actual content dimensions
                            const body = iframeDoc.body;
                            const html = iframeDoc.documentElement;
                            
                            // Add safety margin to prevent cropping
                            const safetyMargin = 50;
                            
                            const actualWidth = Math.max(
                                body.scrollWidth,
                                body.offsetWidth,
                                html.clientWidth,
                                html.scrollWidth,
                                html.offsetWidth,
                                realWidth
                            ) + safetyMargin;
                            
                            const actualHeight = Math.max(
                                body.scrollHeight,
                                body.offsetHeight,
                                html.clientHeight,
                                html.scrollHeight,
                                html.offsetHeight,
                                realHeight
                            ) + safetyMargin;
                            
                            console.log('📏 Content dimensions:', { 
                                requested: { width: realWidth, height: realHeight },
                                preview: { width, height },
                                actual: { width: actualWidth, height: actualHeight },
                                body: { scrollWidth: body.scrollWidth, scrollHeight: body.scrollHeight },
                                html: { scrollWidth: html.scrollWidth, scrollHeight: html.scrollHeight }
                            });
                            
                            // Adjust iframe size to content
                            iframe.style.width = actualWidth + 'px';
                            iframe.style.height = actualHeight + 'px';
                            
                            const options = {
                                width: actualWidth,
                                height: actualHeight,
                                scale: quality,
                                useCORS: true,
                                allowTaint: true,
                                backgroundColor: '#ffffff',
                                scrollX: 0,
                                scrollY: 0,
                                windowWidth: actualWidth,
                                windowHeight: actualHeight,
                                foreignObjectRendering: true,
                                removeContainer: true,
                                logging: true,
                                x: 0,
                                y: 0
                            };
                            console.log('⚙️ html2canvas options:', options);
                            
                            html2canvas(targetElement, options).then(canvas => {
                                console.log('🎨 Canvas created successfully:', { width: canvas.width, height: canvas.height });
                                
                                // Get selected format
                                const formatSelect = document.getElementById('formatSelect');
                                const selectedFormat = formatSelect ? formatSelect.value : 'png';
                                
                                let mimeType, fileExtension, qualityValue;
                                switch(selectedFormat) {
                                    case 'jpeg':
                                        mimeType = 'image/jpeg';
                                        fileExtension = 'jpg';
                                        qualityValue = quality / 100; // Convert to 0-1 range
                                        break;
                                    case 'webp':
                                        mimeType = 'image/webp';
                                        fileExtension = 'webp';
                                        qualityValue = quality / 100; // Convert to 0-1 range
                                        break;
                                    default:
                                        mimeType = 'image/png';
                                        fileExtension = 'png';
                                        qualityValue = 1.0; // PNG is lossless
                                }
                                
                                const dataUrl = canvas.toDataURL(mimeType, qualityValue);
                                console.log(`🖼️ ${selectedFormat.toUpperCase()} image generated, data URL length:`, dataUrl.length);
                                
                                // Store format info for download
                                this.currentImageFormat = {
                                    format: selectedFormat,
                                    extension: fileExtension,
                                    mimeType: mimeType
                                };
                                
                                document.body.removeChild(iframe);
                                console.log('🧹 Iframe removed from DOM');
                                resolve(dataUrl);
                            }).catch(error => {
                                console.error('❌ html2canvas error:', error);
                                document.body.removeChild(iframe);
                                reject(error);
                            });
                        }, 1000); // Wait 1 second for content to fully load
                    }).catch(error => {
                        console.error('❌ Failed to load html2canvas:', error);
                        document.body.removeChild(iframe);
                        reject(error);
                    });
                } catch (error) {
                    console.error('❌ Error in iframe onload:', error);
                    document.body.removeChild(iframe);
                    reject(error);
                }
            };
            
            iframe.onerror = (error) => {
                console.error('❌ Iframe error:', error);
                document.body.removeChild(iframe);
                reject(new Error('Failed to load iframe'));
            };
            
            // Write HTML to iframe with proper DOCTYPE and meta tags
            console.log('📝 Writing HTML to iframe...');
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            iframeDoc.open();
            
            // Ensure proper HTML structure
            let completeHTML = html;
            if (!html.includes('<!DOCTYPE')) {
                completeHTML = '<!DOCTYPE html>' + html;
                console.log('📄 Added DOCTYPE');
            }
            if (!html.includes('<meta charset')) {
                completeHTML = completeHTML.replace('<head>', '<head><meta charset="UTF-8">');
                console.log('🔤 Added charset meta');
            }
            if (!html.includes('viewport')) {
                completeHTML = completeHTML.replace('<head>', `<head><meta name="viewport" content="width=${width}, height=${height}, initial-scale=1.0">`);
                console.log('📱 Added viewport meta');
            }
            
            // Add CSS to prevent overflow and ensure proper sizing
            const preventOverflowCSS = `
                <style>
                    * { box-sizing: border-box; }
                    html, body {
                        margin: 0 !important;
                        padding: 20px !important;
                        overflow: visible !important;
                        width: auto !important;
                        height: auto !important;
                        min-width: ${width}px !important;
                        min-height: ${height}px !important;
                    }
                    body > * {
                        max-width: none !important;
                        word-wrap: break-word !important;
                    }
                </style>
            `;
            
            if (completeHTML.includes('</head>')) {
                completeHTML = completeHTML.replace('</head>', preventOverflowCSS + '</head>');
            } else if (completeHTML.includes('<head>')) {
                completeHTML = completeHTML.replace('<head>', '<head>' + preventOverflowCSS);
            } else {
                completeHTML = preventOverflowCSS + completeHTML;
            }
            console.log('🎨 Added overflow prevention CSS');
            
            console.log('📄 Final HTML length:', completeHTML.length);
            iframeDoc.write(completeHTML);
            iframeDoc.close();
            console.log('✅ HTML written to iframe');
        });
    }

    async loadHtml2Canvas() {
        if (window.html2canvas) {
            return Promise.resolve();
        }
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    downloadImage() {
        if (!this.lastGeneratedImage) {
            this.showError('Aucune image à télécharger. Veuillez d\'abord convertir votre code.');
            return;
        }
        
        // Get format from last conversion or default to PNG
        const format = this.lastGeneratedFormat || 'png';
        
        // Handle blob data from Web Worker
        if (this.lastGeneratedImage instanceof Blob) {
            this.downloadImageBlob(this.lastGeneratedImage, `html-to-png.${format}`);
        } else {
            // Handle data URL (legacy)
            const link = document.createElement('a');
            link.download = `html-to-png.${format}`;
            link.href = this.lastGeneratedImage;
            link.click();
        }
        
        this.showSuccess(`Image ${format.toUpperCase()} téléchargée avec succès!`);
    }

    updatePreviewInfo(width, height, quality) {
        const previewInfo = document.getElementById('previewInfo');
        const dimensionsInfo = document.getElementById('dimensionsInfo');
        const sizeInfo = document.getElementById('sizeInfo');
        
        if (previewInfo && dimensionsInfo && sizeInfo) {
            dimensionsInfo.textContent = `${width} × ${height}px`;
            
            // Estimate file size (rough calculation)
            const estimatedSize = Math.round((width * height * 4 * quality) / 1024);
            sizeInfo.textContent = `~${estimatedSize}KB`;
            
            previewInfo.style.display = 'flex';
            previewInfo.classList.add('fade-in');
        }
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = show ? 'flex' : 'none';
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Create a simple notification system
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '16px 24px',
            borderRadius: '12px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            backgroundColor: type === 'success' ? '#10b981' : '#ef4444'
        });
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Social sharing methods
    shareOnTwitter() {
        if (!this.lastGeneratedImage) {
            this.showError('Please generate an image first');
            return;
        }
        
        const text = encodeURIComponent('Check out this awesome image I created with HTML to PNG Converter! 🎨');
        const url = encodeURIComponent(window.location.href);
        const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        
        window.open(twitterUrl, '_blank', 'width=600,height=400');
        this.showSuccess('Opening Twitter share dialog...');
    }

    shareOnFacebook() {
        if (!this.lastGeneratedImage) {
            this.showError('Please generate an image first');
            return;
        }
        
        const url = encodeURIComponent(window.location.href);
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        
        window.open(facebookUrl, '_blank', 'width=600,height=400');
        this.showSuccess('Opening Facebook share dialog...');
    }

    async shareOnLinkedIn() {
        if (!this.lastGeneratedImage) {
            this.showError('Please generate an image first');
            return;
        }
        
        try {
            // Convert data URL to blob
            const response = await fetch(this.lastGeneratedImage);
            const blob = await response.blob();
            
            // Copy image to clipboard
            await navigator.clipboard.write([
                new ClipboardItem({
                    [blob.type]: blob
                })
            ]);
            
            // Open LinkedIn post creation page
            const linkedinUrl = 'https://www.linkedin.com/feed/?shareActive=true';
            window.open(linkedinUrl, '_blank', 'width=800,height=600');
            
            this.showSuccess('Image copied to clipboard! Paste it in the LinkedIn post editor that just opened.');
        } catch (err) {
            console.error('Error copying image to clipboard:', err);
            
            // Fallback: download the image and open LinkedIn
            this.downloadImage();
            const linkedinUrl = 'https://www.linkedin.com/feed/?shareActive=true';
            window.open(linkedinUrl, '_blank', 'width=800,height=600');
            
            this.showSuccess('Image downloaded! Upload it manually in the LinkedIn post editor that just opened.');
        }
    }

    shareOnPinterest() {
        if (!this.lastGeneratedImage) {
            this.showError('Please generate an image first');
            return;
        }
        
        const url = encodeURIComponent(window.location.href);
        const media = encodeURIComponent(this.lastGeneratedImage);
        const description = encodeURIComponent('Created with HTML to PNG Converter - Amazing tool for converting HTML to images!');
        const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${url}&media=${media}&description=${description}`;
        
        window.open(pinterestUrl, '_blank', 'width=600,height=400');
        this.showSuccess('Opening Pinterest share dialog...');
    }

    async copyImageLink() {
        if (!this.lastGeneratedImage) {
            this.showError('Please generate an image first');
            return;
        }
        
        try {
            // Try to copy the data URL to clipboard
            await navigator.clipboard.writeText(this.lastGeneratedImage);
            this.showSuccess('Image data URL copied to clipboard!');
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = this.lastGeneratedImage;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showSuccess('Image data URL copied to clipboard!');
        }
    }

    showSocialShare() {
        const socialShare = document.getElementById('socialShare');
        if (socialShare && this.lastGeneratedImage) {
            socialShare.style.display = 'block';
            socialShare.classList.add('fade-in');
        }
    }

    hideSocialShare() {
        const socialShare = document.getElementById('socialShare');
        if (socialShare) {
            socialShare.style.display = 'none';
        }
    }



    initializePreview() {
        // Set initial preview size
        setTimeout(() => {
            this.updatePreviewSize();
        }, 100);
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.updatePreviewSize();
        });
    }

    // Theme Management
    initializeTheme() {
        const savedTheme = localStorage.getItem('htmltopng-theme') || 'light';
        this.setTheme(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('htmltopng-theme', theme);
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    // Keyboard Shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter to convert
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.convertToImage();
            }
            
            // Ctrl/Cmd + S to save/download
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (this.lastGeneratedImage) {
                    this.downloadImage();
                }
            }
            
            // Ctrl/Cmd + R to refresh preview
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                this.refreshPreview();
            }
            
            // F11 to expand preview
            if (e.key === 'F11') {
                e.preventDefault();
                this.expandPreview();
            }
            
            // Ctrl/Cmd + D to toggle theme
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }

    // Auto-save functionality
    setupAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            this.saveToLocalStorage();
        }, 30000); // Save every 30 seconds
        
        // Load saved content on initialization
        this.loadFromLocalStorage();
    }

    saveToLocalStorage() {
        const htmlContent = document.getElementById('htmlInput').value;
        const cssContent = document.getElementById('cssInput').value;
        const width = document.getElementById('widthInput').value;
        const height = document.getElementById('heightInput').value;
        
        const saveData = {
            html: htmlContent,
            css: cssContent,
            width: width,
            height: height,
            timestamp: Date.now()
        };
        
        localStorage.setItem('htmltopng-autosave', JSON.stringify(saveData));
    }

    loadFromLocalStorage() {
        const savedData = localStorage.getItem('htmltopng-autosave');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                // Only load if saved within last 24 hours
                if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
                    document.getElementById('htmlInput').value = data.html || '';
                    document.getElementById('cssInput').value = data.css || '';
                    document.getElementById('widthInput').value = data.width || '800';
                    document.getElementById('heightInput').value = data.height || '600';
                    
                    // Update preview if content exists
                    if (data.html || data.css) {
                        setTimeout(() => this.updatePreview(), 500);
                    }
                }
            } catch (e) {
                console.warn('Failed to load auto-saved data:', e);
            }
        }
    }

    // Onboarding System
    initializeOnboarding() {
        // Check if user has completed onboarding
        const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
        
        if (!hasCompletedOnboarding) {
            this.showOnboarding();
        }
    }

    showOnboarding() {
        const overlay = document.getElementById('onboardingOverlay');
        if (!overlay) return;

        overlay.style.display = 'flex';
        
        const steps = [
            {
                icon: '🎨',
                title: 'Bienvenue dans HTML to PNG',
                description: 'Convertissez facilement votre code HTML/CSS en images de haute qualité'
            },
            {
                icon: '⚡',
                title: 'Aperçu en temps réel',
                description: 'Voyez vos modifications instantanément avec notre système de prévisualisation'
            },
            {
                icon: '📱',
                title: 'Formats optimisés',
                description: 'Choisissez parmi des presets pour réseaux sociaux, mobiles et plus encore'
            }
        ];

        let currentStep = 0;
        this.renderOnboardingStep(steps[currentStep], currentStep, steps.length);

        // Handle navigation
        const nextBtn = document.getElementById('onboardingNext');
        const skipBtn = document.getElementById('onboardingSkip');
        const prevBtn = document.getElementById('onboardingPrev');

        const showStep = (stepIndex) => {
            if (stepIndex >= steps.length) {
                this.completeOnboarding();
                return;
            }
            currentStep = stepIndex;
            this.renderOnboardingStep(steps[currentStep], currentStep, steps.length);
        };

        nextBtn.onclick = () => showStep(currentStep + 1);
        skipBtn.onclick = () => this.completeOnboarding();
        prevBtn.onclick = () => {
            if (currentStep > 0) showStep(currentStep - 1);
        };
    }

    renderOnboardingStep(step, index, total) {
        const stepContent = document.querySelector('.onboarding-step');
        const indicators = document.querySelector('.step-indicators');
        const prevBtn = document.getElementById('onboardingPrev');
        const nextBtn = document.getElementById('onboardingNext');

        // Update step content
        stepContent.innerHTML = `
            <div class="step-icon">${step.icon}</div>
            <h3>${step.title}</h3>
            <p>${step.description}</p>
        `;

        // Update indicators
        indicators.innerHTML = '';
        for (let i = 0; i < total; i++) {
            const dot = document.createElement('div');
            dot.className = `step-dot ${i === index ? 'active' : ''}`;
            indicators.appendChild(dot);
        }

        // Update button states
        prevBtn.style.display = index === 0 ? 'none' : 'inline-block';
        nextBtn.textContent = index === total - 1 ? 'Commencer' : 'Suivant';
    }

    completeOnboarding() {
        const overlay = document.getElementById('onboardingOverlay');
        overlay.style.display = 'none';
        localStorage.setItem('onboarding_completed', 'true');
        
        // Show welcome toast
        this.showToast('Bienvenue ! Commencez à créer vos premières images.', 'success');
    }

    // Progress Tracking
    initializeProgressTracking() {
        this.userProgress = {
            htmlEntered: false,
            cssEntered: false,
            previewGenerated: false,
            imageDownloaded: false
        };
        
        this.updateProgressBar();
        this.trackUserActions();
    }

    trackUserActions() {
        // Track HTML input
        const htmlInput = document.getElementById('htmlInput');
        if (htmlInput) {
            htmlInput.addEventListener('input', () => {
                if (htmlInput.value.trim().length > 10 && !this.userProgress.htmlEntered) {
                    this.userProgress.htmlEntered = true;
                    this.updateProgressBar();
                    this.showToast('Super ! Votre HTML est prêt.', 'success');
                }
            });
        }

        // Track CSS input
        const cssInput = document.getElementById('cssInput');
        if (cssInput) {
            cssInput.addEventListener('input', () => {
                if (cssInput.value.trim().length > 5 && !this.userProgress.cssEntered) {
                    this.userProgress.cssEntered = true;
                    this.updateProgressBar();
                    this.showToast('Excellent ! Votre CSS ajoute du style.', 'success');
                }
            });
        }

        // Track preview generation
        const originalUpdatePreview = this.updatePreview.bind(this);
        this.updatePreview = () => {
            originalUpdatePreview();
            if (!this.userProgress.previewGenerated) {
                this.userProgress.previewGenerated = true;
                this.updateProgressBar();
                this.showToast('Parfait ! Votre aperçu est généré.', 'success');
            }
        };

        // Track image download
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                if (!this.userProgress.imageDownloaded) {
                    this.userProgress.imageDownloaded = true;
                    this.updateProgressBar();
                    this.showToast('Bravo ! Votre première image est téléchargée !', 'success');
                }
            });
        }
    }

    updateProgressBar() {
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (!progressFill || !progressText) return;

        const completed = Object.values(this.userProgress).filter(Boolean).length;
        const total = Object.keys(this.userProgress).length;
        const percentage = (completed / total) * 100;

        progressFill.style.width = `${percentage}%`;
        
        const messages = [
            'Commencez votre création',
            'Ajoutez votre contenu',
            'Stylisez avec CSS',
            'Générez l\'aperçu',
            'Téléchargez votre image'
        ];
        
        progressText.textContent = messages[completed] || 'Création terminée !';
        
        if (percentage === 100) {
            setTimeout(() => {
                progressFill.parentElement.style.display = 'none';
                progressText.style.display = 'none';
            }, 3000);
        }
    }

    // Toast Notifications
    showToast(message, type = 'success') {
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle',
            warning: 'fas fa-exclamation-triangle'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="${icons[type] || icons.success}"></i>
                <span class="toast-message">${message}</span>
            </div>
        `;

        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Hide toast after duration based on type
        const duration = type === 'error' ? 6000 : 4000;
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, duration);
     }

    // Micro-interactions
    initializeMicroInteractions() {
        // Add pulse effect to buttons on click (excluding close buttons)
        document.addEventListener('click', (e) => {
            // Stop processing if it's a close button
            if (e.target.closest('[data-close-section]') || e.target.closest('[data-close-modal]')) {
                return;
            }
            
            if (e.target.matches('button, .btn, .preset-btn')) {
                e.target.classList.add('pulse-on-click');
                setTimeout(() => {
                    e.target.classList.remove('pulse-on-click');
                }, 300);
            }
        });

        // Enhanced convert button with loading state
        const convertBtn = document.getElementById('convertBtn');
        if (convertBtn) {
            const originalConvert = this.convertToImage?.bind(this);
            if (originalConvert) {
                convertBtn.onclick = async () => {
                    this.showLoadingState(convertBtn);
                    try {
                        await originalConvert();
                    } finally {
                        this.hideLoadingState(convertBtn);
                    }
                };
            }
        }

        // Add hover effects to preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                this.showPresetPreview(btn.dataset.preset);
            });
        });

        // Add focus indicators for accessibility
        document.querySelectorAll('input, textarea, button').forEach(element => {
            element.addEventListener('focus', () => {
                element.style.outline = '2px solid var(--accent)';
                element.style.outlineOffset = '2px';
            });
            
            element.addEventListener('blur', () => {
                element.style.outline = 'none';
            });
        });

        // Smart placeholder text that adapts to user input
        this.initializeSmartPlaceholders();
    }

    showLoadingState(button) {
        button.classList.add('loading');
        button.disabled = true;
        const originalText = button.innerHTML;
        button.dataset.originalText = originalText;
        button.innerHTML = '<span>Conversion en cours...</span>';
    }

    hideLoadingState(button) {
        button.classList.remove('loading');
        button.disabled = false;
        if (button.dataset.originalText) {
            button.innerHTML = button.dataset.originalText;
        }
    }

    showPresetPreview(preset) {
        const presets = {
            'instagram-post': { width: 1080, height: 1080, name: 'Instagram Post' },
            'instagram-story': { width: 1080, height: 1920, name: 'Instagram Story' },
            'facebook-post': { width: 1200, height: 630, name: 'Facebook Post' },
            'twitter-post': { width: 1024, height: 512, name: 'Twitter Post' },
            'linkedin-post': { width: 1200, height: 627, name: 'LinkedIn Post' },
            'youtube-thumbnail': { width: 1280, height: 720, name: 'YouTube Thumbnail' }
        };

        const presetInfo = presets[preset];
        if (presetInfo) {
            this.showToast(`${presetInfo.name}: ${presetInfo.width}×${presetInfo.height}px`, 'info');
        }
    }

    initializeSmartPlaceholders() {
        const htmlInput = document.getElementById('htmlInput');
        const cssInput = document.getElementById('cssInput');

        if (htmlInput) {
            const htmlTips = [
                'Essayez: <div class="card">Hello World</div>',
                'Astuce: Utilisez des classes pour styliser',
                'Exemple: <h1>Mon Titre</h1><p>Mon contenu</p>',
                'Conseil: Structurez avec des div et sections'
            ];
            
            this.rotatePlaceholder(htmlInput, htmlTips, 5000);
        }

        if (cssInput) {
            const cssTips = [
                'Essayez: .card { padding: 20px; border-radius: 10px; }',
                'Astuce: Utilisez flexbox pour l\'alignement',
                'Exemple: body { font-family: Arial; background: #f0f0f0; }',
                'Conseil: Ajoutez des ombres avec box-shadow'
            ];
            
            this.rotatePlaceholder(cssInput, cssTips, 5000);
        }
    }

    rotatePlaceholder(element, tips, interval) {
        let currentTip = 0;
        
        const rotate = () => {
            if (element.value.trim() === '') {
                element.placeholder = tips[currentTip];
                currentTip = (currentTip + 1) % tips.length;
            }
        };

        setInterval(rotate, interval);
    }

    // Enhanced error handling with user-friendly messages
    handleError(error, context = '') {
        console.error(`Error in ${context}:`, error);
        
        const userFriendlyMessages = {
            'conversion': 'Erreur lors de la conversion. Vérifiez votre code HTML/CSS.',
            'download': 'Erreur lors du téléchargement. Réessayez dans quelques instants.',
            'preview': 'Erreur lors de la génération de l\'aperçu.',
            'default': 'Une erreur inattendue s\'est produite. Réessayez.'
        };

        const message = userFriendlyMessages[context] || userFriendlyMessages.default;
        this.showToast(message, 'error');
    }

    // Performance optimization for preview updates
    optimizedPreviewUpdate() {
        // Cancel previous update if still pending
        if (this.previewUpdateTimeout) {
            clearTimeout(this.previewUpdateTimeout);
        }

        // Debounce the update
        this.previewUpdateTimeout = setTimeout(() => {
            try {
                this.updatePreview();
            } catch (error) {
                this.handleError(error, 'preview');
            }
        }, 300);
    }

    // Web Worker Management - Performance Enhancement Phase 1
    initializeWorkerManager() {
        this.workerManager = new WorkerManager();
        this.workerManager.initialize().then(() => {
            console.log('🚀 Web Worker initialized for enhanced performance');
            
            // Show performance badge
            const performanceBadge = document.getElementById('performanceBadge');
            if (performanceBadge) {
                performanceBadge.style.display = 'inline-flex';
                performanceBadge.title = 'Web Worker actif - Performances optimisées';
            }
            
            this.showToast('🚀 Performances améliorées avec Web Worker', 'info');
        }).catch(error => {
            console.warn('Web Worker not available, falling back to main thread:', error);
            this.workerManager = null;
        });
    }

    // Cache Manager - Performance Enhancement Phase 1
     initializeCacheManager() {
         try {
             this.cacheManager = new CacheManager(50, 300000); // 50 entrées, 5 min TTL
             console.log('📦 Cache Manager initialized');
             
             // Debug mode removed for production
         } catch (error) {
             console.warn('Cache Manager initialization failed:', error);
             this.cacheManager = null;
         }
     }

     // Helper method to enable download and sharing
      enableDownloadAndSharing() {
          // Enable download button
          const downloadBtn = document.getElementById('downloadBtn');
          if (downloadBtn) {
              downloadBtn.disabled = false;
              // Download button enabled
          }
          
          // Show social sharing options
          this.showSocialShare();
      }

      // Lazy Loader - Performance Enhancement Phase 1
      initializeLazyLoader() {
          try {
              this.lazyLoader = new LazyLoader();
              // Lazy Loader initialized
              
              // Observer les éléments qui nécessitent un lazy loading
              this.setupLazyLoadingObservers();
              
              // Précharger les ressources critiques
              this.lazyLoader.preloadCritical(['color-picker']).then(() => {
                  // Critical resources preloaded
              });
              
          } catch (error) {
              console.warn('Lazy Loader initialization failed:', error);
              this.lazyLoader = null;
          }
      }

      // Configurer les observateurs pour le lazy loading
      setupLazyLoadingObservers() {
          // Observer les sections qui peuvent être chargées de manière lazy
          const lazyElements = document.querySelectorAll('[data-lazy-load]');
          
          lazyElements.forEach(element => {
              if (this.lazyLoader) {
                  this.lazyLoader.observe(element);
              }
          });
          
          // Observing elements for lazy loading
      }

    // Enhanced conversion method using Web Worker
    async convertToImageWithWorker() {
        if (!this.workerManager || !this.workerManager.isReady()) {
            // Fallback to original method
            return this.convertToImage();
        }

        try {
            const convertBtn = document.getElementById('convertBtn');
            if (convertBtn) {
                this.showLoadingState(convertBtn);
            }
            
            const htmlContent = document.getElementById('htmlInput').value;
            const cssContent = document.getElementById('cssInput').value;
            const width = parseInt(document.getElementById('widthInput').value) || 1920;
            const height = parseInt(document.getElementById('heightInput').value) || 1080;
            const format = document.getElementById('formatSelect')?.value || 'png';

            const result = await this.workerManager.convert({
                htmlContent,
                cssContent,
                width,
                height,
                format
            });

            if (result.success) {
                this.lastGeneratedImage = result.data;
                this.lastGeneratedFormat = format;
                if (convertBtn) {
                    this.hideLoadingState(convertBtn);
                }
                this.showToast(`Image générée (${result.metadata.width}×${result.metadata.height}). Cliquez sur télécharger pour sauvegarder.`, 'success');
                
                // Enable download button
                const downloadBtn = document.getElementById('downloadBtn');
                if (downloadBtn) {
                    downloadBtn.disabled = false;
                    downloadBtn.style.opacity = '1';
                }
            } else {
                throw new Error(result.error);
            }

        } catch (error) {
            const convertBtn = document.getElementById('convertBtn');
            if (convertBtn) {
                this.hideLoadingState(convertBtn);
            }
            this.handleError(error, 'conversion');
        }
    }

    // Helper method to download blob
    downloadImageBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Phase 2 Features Initialization Methods
    
    /**
     * Initialize Image Manager
     */
    initializeImageManager() {
        if (typeof ImageManager !== 'undefined') {
            this.imageManager = new ImageManager();
            this.imageManager.init();
            // Image Manager initialized
        }
    }
    
    /**
     * Initialize History Manager
     */
    initializeHistoryManager() {
        if (typeof HistoryManager !== 'undefined') {
            this.historyManager = new HistoryManager();
            this.historyManager.init();
            // History Manager initialized
        }
    }
    
    /**
     * Initialize Template Manager
     */
    initializeTemplateManager() {
        if (typeof TemplateManager !== 'undefined') {
            this.templateManager = new TemplateManager();
            this.templateManager.init();
            // Template Manager initialized
        }
    }
    
    /**
     * Initialize Social Share Manager
     */
    initializeSocialShare() {
        if (typeof SocialShareManager !== 'undefined') {
            this.socialShareManager = new SocialShareManager();
            this.socialShareManager.init();
            window.socialShareManager = this.socialShareManager; // Global access for HTML events
            // Social Share Manager initialized
        }
    }
    
    /**
     * Initialize Quick Toolbar
     */
    initializeQuickToolbar() {
        const toolbar = document.getElementById('quickToolbar');
        if (!toolbar) return;
        
        // Quick Share Button - handled by SocialShareManager
        
        // Show History Button
        const showHistoryBtn = document.getElementById('showHistoryBtn');
        if (showHistoryBtn) {
            showHistoryBtn.addEventListener('click', () => {
                this.toggleFeatureSection('historyManagerSection');
            });
        }
        
        // Show Templates Button
        const showTemplatesBtn = document.getElementById('showTemplatesBtn');
        if (showTemplatesBtn) {
            showTemplatesBtn.addEventListener('click', () => {
                this.toggleFeatureSection('templateManagerSection');
            });
        }
        
        // Show Images Button
        const showImagesBtn = document.getElementById('showImagesBtn');
        if (showImagesBtn) {
            showImagesBtn.addEventListener('click', () => {
                this.toggleFeatureSection('imageManagerSection');
            });
        }
        
        // Share History Button - handled by SocialShareManager
        
        // Setup close section buttons
        this.setupCloseSectionButtons();
        
        console.log('Quick Toolbar initialized');
    }
    
    /**
     * Setup close section buttons
     */
    setupCloseSectionButtons() {
        document.addEventListener('click', (e) => {
            console.log('Click detected:', e.target);
            
            // Check if the clicked element or its parent has the close attribute
            const closeButton = e.target.closest('[data-close-section]');
            if (closeButton) {
                console.log('Close button clicked:', closeButton);
                e.preventDefault();
                e.stopPropagation();
                
                const section = closeButton.closest('.feature-section');
                console.log('Section found:', section);
                
                if (section) {
                    console.log('Section classes:', section.classList.toString());
                    console.log('Section display:', section.style.display);
                    
                    // Remove active class to trigger CSS transition
                    section.classList.remove('active');
                    
                    // Hide section after transition completes
                    setTimeout(() => {
                        section.style.display = 'none';
                        console.log('Section hidden');
                    }, 300);
                }
            }
        });
    }
    
    /**
     * Toggle feature section visibility
     */
    toggleFeatureSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;
        
        // Check if section is currently visible
        const isVisible = section.style.display === 'block' && section.classList.contains('active');
        
        // Close all sections first
        document.querySelectorAll('.feature-section').forEach(s => {
            s.classList.remove('active');
            setTimeout(() => s.style.display = 'none', 300);
        });
        
        // If section wasn't visible, open it after a delay
        if (!isVisible) {
            setTimeout(() => {
                section.style.display = 'block';
                setTimeout(() => section.classList.add('active'), 10);
            }, 320);
        }
    }
    
    /**
     * Load template into editor
     */
    loadTemplate(template) {
        const htmlInput = document.getElementById('htmlInput');
        const cssInput = document.getElementById('cssInput');
        
        if (htmlInput && template.html) {
            htmlInput.value = template.html;
        }
        
        if (cssInput && template.css) {
            cssInput.value = template.css;
        }
        
        // Update preview
        this.updatePreview();
        
        // Show success message
        this.showToast('Modèle chargé avec succès', 'success');
    }
    
    /**
     * Save current content as template
     */
    saveAsTemplate(name, category = 'custom') {
        if (!this.templateManager) return;
        
        const htmlContent = document.getElementById('htmlInput')?.value || '';
        const cssContent = document.getElementById('cssInput')?.value || '';
        
        if (!htmlContent.trim()) {
            this.showToast('Veuillez ajouter du contenu HTML avant de sauvegarder', 'error');
            return;
        }
        
        const template = {
            id: Date.now().toString(),
            name: name,
            category: category,
            html: htmlContent,
            css: cssContent,
            thumbnail: this.lastGeneratedImage || null,
            created: Date.now()
        };
        
        this.templateManager.saveTemplate(template);
        this.showToast('Modèle sauvegardé avec succès', 'success');
    }
    
    /**
     * Get current dimensions
     */
    getCurrentDimensions() {
        const widthInput = document.getElementById('widthInput');
        const heightInput = document.getElementById('heightInput');
        
        return {
            width: widthInput ? parseInt(widthInput.value) || 800 : 800,
            height: heightInput ? parseInt(heightInput.value) || 600 : 600
        };
    }
    
    /**
     * Calculate image size from data URL
     */
    calculateImageSize(dataUrl) {
        if (!dataUrl) return 0;
        
        // Remove data URL prefix to get base64 data
        const base64 = dataUrl.split(',')[1] || dataUrl;
        
        // Calculate size in bytes (base64 is ~4/3 the size of original)
        const sizeInBytes = (base64.length * 3) / 4;
        
        // Convert to appropriate unit
        if (sizeInBytes < 1024) {
            return `${Math.round(sizeInBytes)} B`;
        } else if (sizeInBytes < 1024 * 1024) {
            return `${Math.round(sizeInBytes / 1024)} KB`;
        } else {
            return `${Math.round(sizeInBytes / (1024 * 1024))} MB`;
        }
    }

}

// Web Worker Manager Class
class WorkerManager {
    constructor() {
        this.worker = null;
        this.ready = false;
        this.pendingOperations = new Map();
        this.operationId = 0;
    }

    async initialize() {
        return new Promise((resolve, reject) => {
            try {
                this.worker = new Worker('./conversion-worker.js');
                
                this.worker.onmessage = (event) => {
                    this.handleWorkerMessage(event);
                };
                
                this.worker.onerror = (error) => {
                    console.error('Worker error:', error);
                    reject(error);
                };
                
                // Set timeout for initialization
                const timeout = setTimeout(() => {
                    reject(new Error('Worker initialization timeout'));
                }, 5000);
                
                // Wait for ready signal
                const readyHandler = (event) => {
                    if (event.data.type === 'ready') {
                        clearTimeout(timeout);
                        this.ready = true;
                        resolve();
                    }
                };
                
                this.worker.addEventListener('message', readyHandler, { once: true });
                
            } catch (error) {
                reject(error);
            }
        });
    }

    handleWorkerMessage(event) {
        const { type, data, id } = event.data;
        
        switch (type) {
            case 'ready':
                this.ready = true;
                break;
                
            case 'progress':
                this.handleProgress(data, id);
                break;
                
            case 'result':
                this.handleResult(data, id);
                break;
                
            case 'pong':
                // Health check response
                break;
                
            default:
                console.warn('Unknown worker message type:', type);
        }
    }

    handleProgress(progressData, operationId) {
        const operation = this.pendingOperations.get(operationId);
        if (operation && operation.onProgress) {
            operation.onProgress(progressData);
        }
        
        // Update global progress bar
        this.updateProgressBar(progressData);
    }

    handleResult(result, operationId) {
        const operation = this.pendingOperations.get(operationId);
        if (operation) {
            if (result.success) {
                operation.resolve(result);
            } else {
                operation.reject(new Error(result.error));
            }
            this.pendingOperations.delete(operationId);
        }
    }

    updateProgressBar(progressData) {
        const progressBar = document.getElementById('progressBar');
        const progressFill = progressBar?.querySelector('.progress-fill');
        const progressText = progressBar?.querySelector('.progress-text');
        
        if (progressBar && progressFill && progressText) {
            progressBar.style.display = 'block';
            progressFill.style.width = `${progressData.progress}%`;
            
            const stepMessages = {
                'preparation': 'Préparation du contenu...',
                'dom_creation': 'Création du DOM virtuel...',
                'rendering': 'Rendu de l\'image...',
                'conversion': 'Conversion au format final...',
                'finalization': 'Finalisation...'
            };
            
            progressText.textContent = stepMessages[progressData.step] || 'Traitement en cours...';
            
            if (progressData.progress >= 100) {
                setTimeout(() => {
                    progressBar.style.display = 'none';
                }, 1000);
            }
        }
    }

    async convert(data) {
        if (!this.ready) {
            throw new Error('Worker not ready');
        }
        
        const operationId = ++this.operationId;
        
        return new Promise((resolve, reject) => {
            this.pendingOperations.set(operationId, {
                resolve,
                reject,
                onProgress: (progressData) => {
                    // Progress handling is done in handleProgress
                }
            });
            
            this.worker.postMessage({
                type: 'convert',
                data,
                id: operationId
            });
        });
    }

    isReady() {
        return this.ready && this.worker;
    }

    terminate() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
            this.ready = false;
            this.pendingOperations.clear();
        }
    }

    // Health check
    ping() {
        if (this.worker) {
            this.worker.postMessage({ type: 'ping' });
        }
    }
}

// Initialize API Services
HTMLtoPNGConverter.prototype.initializeAPIServices = function() {
    // Initialize API Manager
    if (typeof APIManager !== 'undefined') {
        this.apiManager = new APIManager();
    }
    
    // Initialize External Services Manager
    if (typeof ExternalServicesManager !== 'undefined') {
        this.externalServices = new ExternalServicesManager();
    }
    
    console.log('API Services initialized successfully');
};



// Preview expand functionality
HTMLtoPNGConverter.prototype.expandPreview = function() {
    console.log('🔍 expandPreview() appelée');
    const previewExpandModal = document.getElementById('previewExpandModal');
    const previewExpandFrame = document.getElementById('previewExpandFrame');
    const htmlInput = document.getElementById('htmlInput');
    const cssInput = document.getElementById('cssInput');
    
    console.log('Elements trouvés:', {
        previewExpandModal: !!previewExpandModal,
        previewExpandFrame: !!previewExpandFrame,
        htmlInput: !!htmlInput,
        cssInput: !!cssInput
    });
    
    if (previewExpandModal && previewExpandFrame && htmlInput && cssInput) {
        const htmlCode = htmlInput.value.trim();
        const cssCode = cssInput.value.trim();
        
        console.log('HTML Code length:', htmlCode.length);
        console.log('CSS Code length:', cssCode.length);
        
        if (htmlCode) {
            // Always regenerate content for expanded preview to avoid blob URL issues
            console.log('🔄 Génération du contenu pour expanded frame...');
            const combinedHTML = this.combineHTMLCSS(htmlCode, cssCode);
            const blob = new Blob([combinedHTML], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            // Clear any existing content first
            previewExpandFrame.src = 'about:blank';
            
            // Set new content
            setTimeout(() => {
                previewExpandFrame.src = url;
                console.log('✅ Contenu défini pour expanded frame:', url);
                
                // Clean up blob URL after load
                previewExpandFrame.onload = () => {
                    console.log('✅ Expanded frame chargé avec succès');
                    URL.revokeObjectURL(url);
                };
                
                previewExpandFrame.onerror = (error) => {
                    console.error('❌ Erreur lors du chargement expanded frame:', error);
                };
            }, 100);
        } else {
            console.log('⚠️ Aucun contenu HTML à afficher');
            previewExpandFrame.src = 'about:blank';
        }
        
        // Show the modal
        previewExpandModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('✅ Modal affichée');
        
        // Add keyboard listener for ESC key
        this.handleExpandKeydown = (e) => {
            if (e.key === 'Escape') {
                this.closeExpandedPreview();
            }
        };
        document.addEventListener('keydown', this.handleExpandKeydown);
    } else {
        console.error('❌ Elements manquants pour expandPreview');
    }
};

HTMLtoPNGConverter.prototype.closeExpandedPreview = function() {
    console.log('🔍 closeExpandedPreview() appelée');
    const previewExpandModal = document.getElementById('previewExpandModal');
    const previewExpandFrame = document.getElementById('previewExpandFrame');
    
    if (previewExpandModal) {
        previewExpandModal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Clear the expanded frame content
        if (previewExpandFrame) {
            previewExpandFrame.src = '';
            previewExpandFrame.srcdoc = '';
        }
        
        // Remove keyboard listener
        if (this.handleExpandKeydown) {
            document.removeEventListener('keydown', this.handleExpandKeydown);
            this.handleExpandKeydown = null;
        }
        
        console.log('✅ Modal fermée');
    }
}

// Initialize the converter when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.converter = new HTMLtoPNGConverter();
});

// Handle language changes
window.addEventListener('languageChanged', (e) => {
    // Update any dynamic content that needs translation
    console.log('Language changed to:', e.detail.language);
});

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // We can add a service worker later for offline functionality
    });
}