// Script de correction automatique de l'erreur de syntaxe ligne 2383
class SyntaxErrorFixer {
    constructor() {
        this.fixApplied = false;
    }

    async fixSyntaxError() {
        console.log('🔧 Correction automatique de l\'erreur de syntaxe...');
        
        try {
            // Charger le contenu de script.js
            const response = await fetch('./script.js');
            const content = await response.text();
            const lines = content.split('\n');
            
            console.log(`📄 Fichier script.js chargé: ${lines.length} lignes`);
            
            // Analyser et corriger les erreurs communes
            let corrected = false;
            let corrections = [];
            
            // Vérifier chaque ligne pour des erreurs de syntaxe
            for (let i = 0; i < lines.length; i++) {
                const lineNum = i + 1;
                const line = lines[i];
                
                // Vérifier les parenthèses non fermées dans console.log
                if (line.includes('console.log(') && !this.isProperlyClosedConsoleLog(line)) {
                    const fixed = this.fixConsoleLog(line);
                    if (fixed !== line) {
                        lines[i] = fixed;
                        corrected = true;
                        corrections.push(`Ligne ${lineNum}: Parenthèse manquante ajoutée`);
                        console.log(`✅ Ligne ${lineNum} corrigée: ${line.trim()} -> ${fixed.trim()}`);
                    }
                }
                
                // Vérifier les accolades non fermées
                if (this.hasUnclosedBraces(line)) {
                    const fixed = this.fixUnclosedBraces(line);
                    if (fixed !== line) {
                        lines[i] = fixed;
                        corrected = true;
                        corrections.push(`Ligne ${lineNum}: Accolade manquante ajoutée`);
                        console.log(`✅ Ligne ${lineNum} corrigée: ${line.trim()} -> ${fixed.trim()}`);
                    }
                }
                
                // Vérifier les virgules en trop
                if (this.hasTrailingComma(line)) {
                    const fixed = this.fixTrailingComma(line);
                    if (fixed !== line) {
                        lines[i] = fixed;
                        corrected = true;
                        corrections.push(`Ligne ${lineNum}: Virgule en trop supprimée`);
                        console.log(`✅ Ligne ${lineNum} corrigée: ${line.trim()} -> ${fixed.trim()}`);
                    }
                }
            }
            
            if (corrected) {
                const fixedContent = lines.join('\n');
                
                // Créer un fichier corrigé
                const blob = new Blob([fixedContent], { type: 'text/javascript' });
                const url = URL.createObjectURL(blob);
                
                // Télécharger le fichier corrigé
                const link = document.createElement('a');
                link.href = url;
                link.download = 'script-fixed.js';
                link.click();
                
                console.log('✅ Fichier corrigé créé et téléchargé');
                console.log('📋 Corrections appliquées:', corrections);
                
                // Proposer de remplacer le fichier
                if (confirm('Voulez-vous appliquer automatiquement les corrections? (Rechargez la page après)')) {
                    this.applyFixToCurrentScript(fixedContent);
                }
                
                return {
                    success: true,
                    corrections: corrections,
                    fixedContent: fixedContent
                };
            } else {
                console.log('ℹ️ Aucune erreur de syntaxe détectée');
                return {
                    success: false,
                    message: 'Aucune erreur trouvée'
                };
            }
            
        } catch (error) {
            console.error('❌ Erreur lors de la correction:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    isProperlyClosedConsoleLog(line) {
        // Vérifier si un console.log est correctement fermé
        const consoleLogMatch = line.match(/console\.log\(/);
        if (!consoleLogMatch) return true;
        
        let openParens = 0;
        let inString = false;
        let stringChar = null;
        
        for (let i = consoleLogMatch.index; i < line.length; i++) {
            const char = line[i];
            
            if (!inString && (char === '"' || char === "'" || char === '`')) {
                inString = true;
                stringChar = char;
            } else if (inString && char === stringChar && line[i-1] !== '\\') {
                inString = false;
                stringChar = null;
            } else if (!inString) {
                if (char === '(') openParens++;
                else if (char === ')') openParens--;
            }
        }
        
        return openParens === 0;
    }
    
    fixConsoleLog(line) {
        // Corriger un console.log mal fermé
        if (!line.includes('console.log(')) return line;
        
        let openParens = 0;
        let inString = false;
        let stringChar = null;
        let consoleLogStart = line.indexOf('console.log(');
        
        for (let i = consoleLogStart; i < line.length; i++) {
            const char = line[i];
            
            if (!inString && (char === '"' || char === "'" || char === '`')) {
                inString = true;
                stringChar = char;
            } else if (inString && char === stringChar && line[i-1] !== '\\') {
                inString = false;
                stringChar = null;
            } else if (!inString) {
                if (char === '(') openParens++;
                else if (char === ')') openParens--;
            }
        }
        
        if (openParens > 0) {
            // Ajouter les parenthèses manquantes
            return line + ')'.repeat(openParens) + ';';
        }
        
        return line;
    }
    
    hasUnclosedBraces(line) {
        let openBraces = 0;
        let inString = false;
        let stringChar = null;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (!inString && (char === '"' || char === "'" || char === '`')) {
                inString = true;
                stringChar = char;
            } else if (inString && char === stringChar && line[i-1] !== '\\') {
                inString = false;
                stringChar = null;
            } else if (!inString) {
                if (char === '{') openBraces++;
                else if (char === '}') openBraces--;
            }
        }
        
        return openBraces > 0;
    }
    
    fixUnclosedBraces(line) {
        let openBraces = 0;
        let inString = false;
        let stringChar = null;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (!inString && (char === '"' || char === "'" || char === '`')) {
                inString = true;
                stringChar = char;
            } else if (inString && char === stringChar && line[i-1] !== '\\') {
                inString = false;
                stringChar = null;
            } else if (!inString) {
                if (char === '{') openBraces++;
                else if (char === '}') openBraces--;
            }
        }
        
        if (openBraces > 0) {
            return line + '}'.repeat(openBraces);
        }
        
        return line;
    }
    
    hasTrailingComma(line) {
        // Vérifier les virgules avant } ou )
        return /,\s*[})]/.test(line);
    }
    
    fixTrailingComma(line) {
        // Supprimer les virgules avant } ou )
        return line.replace(/,\s*([})])/g, '$1');
    }
    
    applyFixToCurrentScript(fixedContent) {
        try {
            // Créer un nouveau script avec le contenu corrigé
            const newScript = document.createElement('script');
            newScript.textContent = fixedContent;
            
            // Supprimer l'ancien script
            const oldScript = document.querySelector('script[src="script.js"]');
            if (oldScript) {
                oldScript.remove();
            }
            
            // Ajouter le nouveau script
            document.head.appendChild(newScript);
            
            console.log('✅ Script corrigé appliqué');
            this.fixApplied = true;
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'application du script corrigé:', error);
        }
    }
}

// Auto-exécution
document.addEventListener('DOMContentLoaded', () => {
    // Attendre un peu pour que l'erreur se manifeste
    setTimeout(() => {
        console.log('🔍 Vérification des erreurs de syntaxe...');
        
        window.syntaxErrorFixer = new SyntaxErrorFixer();
        
        // Correction automatique
        window.syntaxErrorFixer.fixSyntaxError().then(result => {
            if (result.success) {
                console.log('✅ Corrections appliquées avec succès');
                console.log('📋 Détails:', result.corrections);
            } else {
                console.log('ℹ️ Aucune correction nécessaire');
            }
        }).catch(error => {
            console.error('❌ Erreur lors de la correction automatique:', error);
        });
        
        // Commandes disponibles
        console.log('🛠️ Commandes disponibles:');
        console.log('- syntaxErrorFixer.fixSyntaxError() : Correction automatique');
        
    }, 2000); // Attendre 2 secondes
});