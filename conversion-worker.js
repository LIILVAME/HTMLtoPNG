// Web Worker pour la conversion HTML vers PNG
// Amélioration Performance - Phase 1

class ConversionWorker {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.initializeCanvas();
    }

    initializeCanvas() {
        // Créer un canvas off-screen pour le traitement
        this.canvas = new OffscreenCanvas(1920, 1080);
        this.ctx = this.canvas.getContext('2d');
    }

    async processConversion(data) {
        const { htmlContent, cssContent, width, height, format } = data;
        
        try {
            // Étape 1: Préparation du contenu
            this.postProgress({ step: 'preparation', progress: 10 });
            const combinedHTML = this.combineHTMLCSS(htmlContent, cssContent);
            
            // Étape 2: Création du DOM virtuel
            this.postProgress({ step: 'dom_creation', progress: 30 });
            const blob = new Blob([combinedHTML], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            // Étape 3: Rendu de l'image
            this.postProgress({ step: 'rendering', progress: 60 });
            const imageData = await this.renderToCanvas(url, width, height);
            
            // Étape 4: Conversion au format final
            this.postProgress({ step: 'conversion', progress: 80 });
            const result = await this.convertToFormat(imageData, format);
            
            // Étape 5: Finalisation
            this.postProgress({ step: 'finalization', progress: 100 });
            
            // Nettoyage
            URL.revokeObjectURL(url);
            
            return {
                success: true,
                data: result,
                metadata: {
                    width,
                    height,
                    format,
                    size: result.size || 0
                }
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                step: this.currentStep
            };
        }
    }

    combineHTMLCSS(html, css) {
        let combinedHTML = html.trim();
        
        // Assurer une structure HTML complète
        if (!combinedHTML.includes('<!DOCTYPE')) {
            combinedHTML = '<!DOCTYPE html>\n' + combinedHTML;
        }
        
        if (!combinedHTML.includes('<html')) {
            combinedHTML = combinedHTML.replace('<!DOCTYPE html>', '<!DOCTYPE html>\n<html>');
            combinedHTML += '</html>';
        }
        
        // Ajouter head si nécessaire
        if (!combinedHTML.includes('<head>')) {
            combinedHTML = combinedHTML.replace('<html>', '<html>\n<head></head>');
        }
        
        // Ajouter body si nécessaire
        if (!combinedHTML.includes('<body>')) {
            combinedHTML = combinedHTML.replace('</head>', '</head>\n<body>');
            if (!combinedHTML.includes('</body>')) {
                combinedHTML = combinedHTML.replace('</html>', '</body>\n</html>');
            }
        }
        
        // Injecter le CSS
        if (css.trim()) {
            const cssBlock = `<style type="text/css">\n${css}\n</style>`;
            combinedHTML = combinedHTML.replace('</head>', `${cssBlock}\n</head>`);
        }
        
        // Ajouter les meta tags essentiels
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

    async renderToCanvas(url, width, height) {
        // Redimensionner le canvas
        this.canvas.width = width;
        this.canvas.height = height;
        
        // Simuler le rendu (dans un vrai worker, on utiliserait html2canvas ou similar)
        // Pour l'instant, on crée une image de base
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, width, height);
        
        // Ajouter du contenu de base
        this.ctx.fillStyle = '#333333';
        this.ctx.font = '24px Arial';
        this.ctx.fillText('HTML to PNG Conversion', 50, 50);
        
        return this.ctx.getImageData(0, 0, width, height);
    }

    async convertToFormat(imageData, format) {
        // Convertir ImageData en Blob
        const canvas = new OffscreenCanvas(imageData.width, imageData.height);
        const ctx = canvas.getContext('2d');
        ctx.putImageData(imageData, 0, 0);
        
        const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
        const quality = format === 'jpeg' ? 0.9 : undefined;
        
        return await canvas.convertToBlob({ type: mimeType, quality });
    }

    postProgress(data) {
        this.currentStep = data.step;
        self.postMessage({
            type: 'progress',
            data
        });
    }
}

// Instance du worker
const worker = new ConversionWorker();

// Écouter les messages du thread principal
self.addEventListener('message', async (event) => {
    const { type, data, id } = event.data;
    
    switch (type) {
        case 'convert':
            const result = await worker.processConversion(data);
            self.postMessage({
                type: 'result',
                data: result,
                id
            });
            break;
            
        case 'ping':
            self.postMessage({
                type: 'pong',
                id
            });
            break;
            
        default:
            console.warn('Unknown message type:', type);
    }
});

// Signaler que le worker est prêt
self.postMessage({
    type: 'ready'
});