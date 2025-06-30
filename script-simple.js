// Version simplifiée pour diagnostic
class HTMLtoPNGConverter {
    constructor() {
        console.log('HTMLtoPNGConverter: Initialisation...');
        this.currentFormat = 'html';
        this.previewTimeout = null;
        this.lastGeneratedImage = null;
        
        this.init();
    }

    init() {
        console.log('HTMLtoPNGConverter: init() appelée');
        try {
            this.bindEvents();
            this.initializePreview();
            console.log('HTMLtoPNGConverter: Initialisation réussie');
        } catch (error) {
            console.error('HTMLtoPNGConverter: Erreur lors de l\'initialisation:', error);
        }
    }

    bindEvents() {
        console.log('HTMLtoPNGConverter: bindEvents() appelée');
        
        // Input events
        const htmlInput = document.getElementById('htmlInput');
        const cssInput = document.getElementById('cssInput');
        
        if (htmlInput) {
            htmlInput.addEventListener('input', () => {
                console.log('HTML input changé');
                this.updatePreview();
            });
        } else {
            console.error('Element htmlInput non trouvé');
        }
        
        if (cssInput) {
            cssInput.addEventListener('input', () => {
                console.log('CSS input changé');
                this.updatePreview();
            });
        } else {
            console.error('Element cssInput non trouvé');
        }
        
        // Convert button
        const convertBtn = document.getElementById('convertBtn');
        if (convertBtn) {
            convertBtn.addEventListener('click', () => {
                console.log('Bouton convert cliqué');
                this.convertToImage();
            });
        } else {
            console.error('Element convertBtn non trouvé');
        }
    }

    initializePreview() {
        console.log('HTMLtoPNGConverter: initializePreview() appelée');
        setTimeout(() => {
            this.updatePreview();
        }, 500);
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
        console.log('HTMLtoPNGConverter: combineHTMLCSS() appelée');
        
        let combinedHTML = html.trim();
        
        // Structure HTML basique
        if (!combinedHTML.includes('<!DOCTYPE')) {
            combinedHTML = '<!DOCTYPE html>\n' + combinedHTML;
        }
        
        if (!combinedHTML.includes('<html')) {
            combinedHTML = combinedHTML.replace('<!DOCTYPE html>', '<!DOCTYPE html>\n<html>');
            combinedHTML += '</html>';
        }
        
        // Ajouter head si nécessaire
        if (!combinedHTML.includes('<head>')) {
            combinedHTML = combinedHTML.replace('<html>', '<html>\n<head><meta charset="UTF-8"></head>');
        }
        
        // Ajouter body si nécessaire
        if (!combinedHTML.includes('<body>')) {
            combinedHTML = combinedHTML.replace('</head>', '</head>\n<body>');
            if (!combinedHTML.includes('</body>')) {
                combinedHTML = combinedHTML.replace('</html>', '</body>\n</html>');
            }
        }
        
        // Ajouter CSS
        if (css.trim()) {
            const cssBlock = `<style type="text/css">\n${css}\n</style>`;
            combinedHTML = combinedHTML.replace('</head>', `${cssBlock}\n</head>`);
        }
        
        console.log('HTML combiné généré, longueur:', combinedHTML.length);
        return combinedHTML;
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
            
            // Créer blob URL
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            console.log('Blob URL créé:', url);
            
            previewFrame.src = url;
            previewFrame.style.display = 'block';
            placeholder.style.display = 'none';
            
            // Nettoyer l'URL précédente
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
        console.log('HTMLtoPNGConverter: showPreviewPlaceholder() appelée');
        
        const previewFrame = document.getElementById('previewFrame');
        const placeholder = document.getElementById('previewPlaceholder');
        
        if (previewFrame && placeholder) {
            previewFrame.style.display = 'none';
            placeholder.style.display = 'flex';
            console.log('Placeholder affiché');
        } else {
            console.error('Elements preview non trouvés');
        }
    }

    async convertToImage() {
        console.log('HTMLtoPNGConverter: convertToImage() appelée');
        
        try {
            const previewFrame = document.getElementById('previewFrame');
            
            if (!previewFrame || previewFrame.style.display === 'none') {
                alert('Veuillez d\'abord générer un aperçu');
                return;
            }
            
            // Utiliser html2canvas sur le contenu de l'iframe
            const frameDocument = previewFrame.contentDocument || previewFrame.contentWindow.document;
            const frameBody = frameDocument.body;
            
            if (!frameBody) {
                console.error('Contenu de l\'iframe non accessible');
                return;
            }
            
            console.log('Début de la conversion avec html2canvas...');
            
            // Charger html2canvas si pas déjà chargé
            if (typeof html2canvas === 'undefined') {
                console.log('Chargement de html2canvas...');
                await this.loadHtml2Canvas();
            }
            
            const canvas = await html2canvas(frameBody, {
                backgroundColor: '#ffffff',
                scale: 2,
                useCORS: true,
                allowTaint: true
            });
            
            // Télécharger l'image
            const link = document.createElement('a');
            link.download = 'converted-image.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            console.log('Conversion réussie!');
            
        } catch (error) {
            console.error('Erreur lors de la conversion:', error);
            alert('Erreur lors de la conversion: ' + error.message);
        }
    }
    
    loadHtml2Canvas() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM chargé, initialisation du converter...');
    try {
        window.converter = new HTMLtoPNGConverter();
        console.log('Converter initialisé avec succès');
    } catch (error) {
        console.error('Erreur lors de l\'initialisation du converter:', error);
    }
});

console.log('Script simple chargé');