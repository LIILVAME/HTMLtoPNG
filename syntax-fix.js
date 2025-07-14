// Script de diagnostic et correction des erreurs de syntaxe
class SyntaxFixer {
    constructor() {
        this.errors = [];
        this.fixes = [];
    }

    async diagnoseSyntaxError() {
        console.log('🔍 Diagnostic de l\'erreur de syntaxe à la ligne 2383...');
        
        try {
            // Tenter de charger et analyser script.js
            const response = await fetch('./script.js');
            const scriptContent = await response.text();
            
            // Analyser le contenu ligne par ligne
            const lines = scriptContent.split('\n');
            
            // Vérifier la ligne 2383 spécifiquement
            if (lines.length >= 2383) {
                const problematicLine = lines[2382]; // Index 0-based
                const previousLine = lines[2381];
                const nextLine = lines[2383];
                
                console.log('📍 Ligne 2383:', problematicLine);
                console.log('📍 Ligne 2382:', previousLine);
                console.log('📍 Ligne 2384:', nextLine);
                
                // Analyser les erreurs communes
                this.analyzeCommonSyntaxErrors(problematicLine, 2383);
                this.analyzeParenthesesBalance(lines, 2383);
                
                return this.generateDiagnosticReport();
            } else {
                console.error('❌ Le fichier script.js a moins de 2383 lignes');
                return { error: 'Fichier trop court' };
            }
            
        } catch (error) {
            console.error('❌ Erreur lors du diagnostic:', error);
            return { error: error.message };
        }
    }

    analyzeCommonSyntaxErrors(line, lineNumber) {
        const commonErrors = [
            {
                pattern: /\([^)]*$/,
                description: 'Parenthèse ouvrante sans fermeture',
                fix: 'Ajouter )'
            },
            {
                pattern: /[^(]*\)$/,
                description: 'Parenthèse fermante sans ouverture',
                fix: 'Ajouter ('
            },
            {
                pattern: /\{[^}]*$/,
                description: 'Accolade ouvrante sans fermeture',
                fix: 'Ajouter }'
            },
            {
                pattern: /[^{]*\}$/,
                description: 'Accolade fermante sans ouverture',
                fix: 'Ajouter {'
            },
            {
                pattern: /\[[^\]]*$/,
                description: 'Crochet ouvrant sans fermeture',
                fix: 'Ajouter ]'
            },
            {
                pattern: /[^\[]*\]$/,
                description: 'Crochet fermant sans ouverture',
                fix: 'Ajouter ['
            },
            {
                pattern: /['"][^'"]*$/,
                description: 'Guillemet non fermé',
                fix: 'Ajouter guillemet fermant'
            },
            {
                pattern: /,\s*[}\])]/,
                description: 'Virgule avant fermeture',
                fix: 'Supprimer la virgule'
            }
        ];

        for (const error of commonErrors) {
            if (error.pattern.test(line)) {
                this.errors.push({
                    line: lineNumber,
                    content: line,
                    type: error.description,
                    suggestedFix: error.fix
                });
            }
        }
    }

    analyzeParenthesesBalance(lines, targetLine) {
        let openParens = 0;
        let openBraces = 0;
        let openBrackets = 0;
        
        // Analyser jusqu'à la ligne problématique
        for (let i = 0; i < Math.min(targetLine, lines.length); i++) {
            const line = lines[i];
            
            // Compter les parenthèses
            for (const char of line) {
                switch (char) {
                    case '(':
                        openParens++;
                        break;
                    case ')':
                        openParens--;
                        break;
                    case '{':
                        openBraces++;
                        break;
                    case '}':
                        openBraces--;
                        break;
                    case '[':
                        openBrackets++;
                        break;
                    case ']':
                        openBrackets--;
                        break;
                }
            }
        }
        
        if (openParens !== 0) {
            this.errors.push({
                line: targetLine,
                type: 'Déséquilibre des parenthèses',
                details: `${openParens > 0 ? openParens + ' parenthèses non fermées' : Math.abs(openParens) + ' parenthèses en trop'}`,
                suggestedFix: openParens > 0 ? 'Ajouter )' : 'Supprimer )'
            });
        }
        
        if (openBraces !== 0) {
            this.errors.push({
                line: targetLine,
                type: 'Déséquilibre des accolades',
                details: `${openBraces > 0 ? openBraces + ' accolades non fermées' : Math.abs(openBraces) + ' accolades en trop'}`,
                suggestedFix: openBraces > 0 ? 'Ajouter }' : 'Supprimer }'
            });
        }
    }

    generateDiagnosticReport() {
        const report = {
            timestamp: new Date().toISOString(),
            errorsFound: this.errors.length,
            errors: this.errors,
            fixes: this.fixes,
            recommendations: []
        };
        
        if (this.errors.length === 0) {
            report.recommendations.push('Aucune erreur de syntaxe détectée dans l\'analyse statique');
            report.recommendations.push('L\'erreur pourrait être due à un caractère invisible ou un encodage');
        } else {
            report.recommendations.push('Corriger les erreurs de syntaxe identifiées');
            report.recommendations.push('Vérifier l\'équilibrage des parenthèses/accolades');
        }
        
        return report;
    }

    async autoFix() {
        console.log('🔧 Tentative de correction automatique...');
        
        try {
            const response = await fetch('./script.js');
            const scriptContent = await response.text();
            const lines = scriptContent.split('\n');
            
            // Corrections automatiques simples
            let modified = false;
            
            // Vérifier et corriger la ligne 2383
            if (lines.length >= 2383) {
                const line2383 = lines[2382];
                
                // Corrections communes
                if (line2383.includes('console.log(') && !line2383.includes(');')) {
                    lines[2382] = line2383 + ');';
                    modified = true;
                    this.fixes.push('Ajout de ); manquant à la ligne 2383');
                }
                
                // Vérifier les parenthèses non fermées
                const openParens = (line2383.match(/\(/g) || []).length;
                const closeParens = (line2383.match(/\)/g) || []).length;
                
                if (openParens > closeParens) {
                    lines[2382] = line2383 + ')'.repeat(openParens - closeParens);
                    modified = true;
                    this.fixes.push(`Ajout de ${openParens - closeParens} parenthèse(s) fermante(s) à la ligne 2383`);
                }
            }
            
            if (modified) {
                const fixedContent = lines.join('\n');
                
                // Créer un fichier de sauvegarde
                const blob = new Blob([fixedContent], { type: 'text/javascript' });
                const url = URL.createObjectURL(blob);
                
                const link = document.createElement('a');
                link.href = url;
                link.download = 'script-fixed.js';
                link.click();
                
                console.log('✅ Fichier corrigé téléchargé: script-fixed.js');
                return { success: true, fixes: this.fixes };
            } else {
                console.log('ℹ️ Aucune correction automatique appliquée');
                return { success: false, message: 'Aucune correction automatique possible' };
            }
            
        } catch (error) {
            console.error('❌ Erreur lors de la correction automatique:', error);
            return { success: false, error: error.message };
        }
    }
}

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
    window.syntaxFixer = new SyntaxFixer();
    
    // Diagnostic automatique
    window.syntaxFixer.diagnoseSyntaxError().then(report => {
        console.log('📋 Rapport de diagnostic:', report);
        
        if (report.errorsFound > 0) {
            console.log('🔧 Tentative de correction automatique...');
            window.syntaxFixer.autoFix().then(result => {
                console.log('📋 Résultat de la correction:', result);
            });
        }
    });
    
    // Commandes disponibles dans la console
    console.log('🛠️ Commandes disponibles:');
    console.log('- syntaxFixer.diagnoseSyntaxError() : Diagnostic complet');
    console.log('- syntaxFixer.autoFix() : Correction automatique');
});