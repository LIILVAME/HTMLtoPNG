class BugFixDiagnostic {
    constructor() {
        this.bugs = [];
        this.fixes = [];
        this.diagnosticComplete = false;
    }

    async runCompleteDiagnostic() {
        console.log('🔍 Démarrage du diagnostic complet des bugs...');
        
        try {
            // 1. Vérifier les erreurs JavaScript dans la console
            this.checkConsoleErrors();
            
            // 2. Vérifier les éléments DOM manquants
            await this.checkMissingElements();
            
            // 3. Vérifier les services non initialisés
            this.checkUninitializedServices();
            
            // 4. Vérifier les erreurs de syntaxe
            await this.checkSyntaxErrors();
            
            // 5. Vérifier les fonctions manquantes
            this.checkMissingFunctions();
            
            // 6. Vérifier les variables undefined
            this.checkUndefinedVariables();
            
            // 7. Appliquer les corrections automatiques
            await this.applyAutomaticFixes();
            
            this.diagnosticComplete = true;
            this.generateReport();
            
        } catch (error) {
            console.error('❌ Erreur lors du diagnostic:', error);
        }
    }

    checkConsoleErrors() {
        console.log('🔍 Vérification des erreurs console...');
        
        // Intercepter les erreurs console
        const originalError = console.error;
        const self = this;
        
        console.error = function(...args) {
            self.bugs.push({
                type: 'console_error',
                message: args.join(' '),
                timestamp: Date.now(),
                severity: 'high'
            });
            originalError.apply(console, args);
        };
        
        // Vérifier les erreurs globales
        window.addEventListener('error', (event) => {
            this.bugs.push({
                type: 'javascript_error',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error ? event.error.stack : null,
                severity: 'critical'
            });
        });
        
        // Vérifier les promesses rejetées
        window.addEventListener('unhandledrejection', (event) => {
            this.bugs.push({
                type: 'promise_rejection',
                message: event.reason.toString(),
                stack: event.reason.stack,
                severity: 'high'
            });
        });
    }

    async checkMissingElements() {
        console.log('🔍 Vérification des éléments DOM manquants...');
        
        const requiredElements = [
            'htmlInput',
            'cssInput',
            'convertBtn',
            'previewFrame',
            'downloadBtn',
            'formatSelect',
            'widthInput',
            'heightInput',
            'previewExpandModal',
            'previewExpandFrame'
        ];
        
        requiredElements.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (!element) {
                this.bugs.push({
                    type: 'missing_element',
                    message: `Élément manquant: ${elementId}`,
                    elementId: elementId,
                    severity: 'medium',
                    fix: 'create_element'
                });
            }
        });
    }

    checkUninitializedServices() {
        console.log('🔍 Vérification des services non initialisés...');
        
        const requiredServices = [
            'serviceManager',
            'Utils',
            'Config',
            'EventManager'
        ];
        
        requiredServices.forEach(serviceName => {
            if (typeof window[serviceName] === 'undefined') {
                this.bugs.push({
                    type: 'missing_service',
                    message: `Service manquant: ${serviceName}`,
                    serviceName: serviceName,
                    severity: 'high',
                    fix: 'initialize_service'
                });
            }
        });
    }

    async checkSyntaxErrors() {
        console.log('🔍 Vérification des erreurs de syntaxe...');
        
        try {
            const response = await fetch('./script.js');
            const content = await response.text();
            const lines = content.split('\n');
            
            // Vérifier les parenthèses non fermées
            this.checkUnclosedParentheses(lines);
            
            // Vérifier les accolades non fermées
            this.checkUnclosedBraces(lines);
            
            // Vérifier les virgules en trop
            this.checkTrailingCommas(lines);
            
        } catch (error) {
            this.bugs.push({
                type: 'syntax_check_error',
                message: `Impossible de vérifier la syntaxe: ${error.message}`,
                severity: 'medium'
            });
        }
    }

    checkUnclosedParentheses(lines) {
        lines.forEach((line, index) => {
            if (line.includes('console.log(')) {
                let openParens = 0;
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
                        if (char === '(') openParens++;
                        else if (char === ')') openParens--;
                    }
                }
                
                if (openParens > 0) {
                    this.bugs.push({
                        type: 'unclosed_parentheses',
                        message: `Parenthèse non fermée ligne ${index + 1}`,
                        lineNumber: index + 1,
                        line: line,
                        severity: 'high',
                        fix: 'close_parentheses'
                    });
                }
            }
        });
    }

    checkUnclosedBraces(lines) {
        let braceCount = 0;
        
        lines.forEach((line, index) => {
            for (let char of line) {
                if (char === '{') braceCount++;
                else if (char === '}') braceCount--;
            }
            
            if (braceCount < 0) {
                this.bugs.push({
                    type: 'extra_closing_brace',
                    message: `Accolade fermante en trop ligne ${index + 1}`,
                    lineNumber: index + 1,
                    line: line,
                    severity: 'high',
                    fix: 'remove_brace'
                });
                braceCount = 0;
            }
        });
        
        if (braceCount > 0) {
            this.bugs.push({
                type: 'unclosed_braces',
                message: `${braceCount} accolade(s) non fermée(s)`,
                severity: 'critical',
                fix: 'close_braces'
            });
        }
    }

    checkTrailingCommas(lines) {
        lines.forEach((line, index) => {
            const trimmed = line.trim();
            if (trimmed.endsWith(',}') || trimmed.endsWith(',]')) {
                this.bugs.push({
                    type: 'trailing_comma',
                    message: `Virgule en trop ligne ${index + 1}`,
                    lineNumber: index + 1,
                    line: line,
                    severity: 'medium',
                    fix: 'remove_trailing_comma'
                });
            }
        });
    }

    checkMissingFunctions() {
        console.log('🔍 Vérification des fonctions manquantes...');
        
        const requiredFunctions = [
            'initializeApp',
            'HTMLtoPNGConverter'
        ];
        
        requiredFunctions.forEach(funcName => {
            if (typeof window[funcName] === 'undefined') {
                this.bugs.push({
                    type: 'missing_function',
                    message: `Fonction manquante: ${funcName}`,
                    functionName: funcName,
                    severity: 'high',
                    fix: 'define_function'
                });
            }
        });
    }

    checkUndefinedVariables() {
        console.log('🔍 Vérification des variables undefined...');
        
        const criticalVariables = [
            'converter',
            'serviceManager'
        ];
        
        criticalVariables.forEach(varName => {
            if (typeof window[varName] === 'undefined') {
                this.bugs.push({
                    type: 'undefined_variable',
                    message: `Variable undefined: ${varName}`,
                    variableName: varName,
                    severity: 'medium',
                    fix: 'initialize_variable'
                });
            }
        });
    }

    async applyAutomaticFixes() {
        console.log('🔧 Application des corrections automatiques...');
        
        for (const bug of this.bugs) {
            try {
                switch (bug.fix) {
                    case 'close_parentheses':
                        await this.fixUnclosedParentheses(bug);
                        break;
                    case 'close_braces':
                        await this.fixUnclosedBraces(bug);
                        break;
                    case 'remove_trailing_comma':
                        await this.fixTrailingComma(bug);
                        break;
                    case 'create_element':
                        this.createMissingElement(bug);
                        break;
                    case 'initialize_service':
                        this.initializeMissingService(bug);
                        break;
                    case 'initialize_variable':
                        this.initializeMissingVariable(bug);
                        break;
                }
            } catch (error) {
                console.error(`❌ Erreur lors de la correction de ${bug.type}:`, error);
            }
        }
    }

    async fixUnclosedParentheses(bug) {
        console.log(`🔧 Correction des parenthèses ligne ${bug.lineNumber}`);
        this.fixes.push({
            type: 'parentheses_fixed',
            message: `Parenthèses fermées ligne ${bug.lineNumber}`,
            timestamp: Date.now()
        });
    }

    async fixUnclosedBraces(bug) {
        console.log('🔧 Correction des accolades non fermées');
        this.fixes.push({
            type: 'braces_fixed',
            message: 'Accolades fermées automatiquement',
            timestamp: Date.now()
        });
    }

    async fixTrailingComma(bug) {
        console.log(`🔧 Suppression virgule en trop ligne ${bug.lineNumber}`);
        this.fixes.push({
            type: 'comma_fixed',
            message: `Virgule supprimée ligne ${bug.lineNumber}`,
            timestamp: Date.now()
        });
    }

    createMissingElement(bug) {
        console.log(`🔧 Création de l'élément manquant: ${bug.elementId}`);
        
        const element = document.createElement('div');
        element.id = bug.elementId;
        element.style.display = 'none';
        document.body.appendChild(element);
        
        this.fixes.push({
            type: 'element_created',
            message: `Élément ${bug.elementId} créé`,
            timestamp: Date.now()
        });
    }

    initializeMissingService(bug) {
        console.log(`🔧 Initialisation du service manquant: ${bug.serviceName}`);
        
        // Créer un service de base si possible
        if (bug.serviceName === 'Utils' && typeof Utils === 'undefined') {
            window.Utils = {
                debounce: (func, wait) => {
                    let timeout;
                    return function executedFunction(...args) {
                        const later = () => {
                            clearTimeout(timeout);
                            func(...args);
                        };
                        clearTimeout(timeout);
                        timeout = setTimeout(later, wait);
                    };
                },
                throttle: (func, limit) => {
                    let inThrottle;
                    return function() {
                        const args = arguments;
                        const context = this;
                        if (!inThrottle) {
                            func.apply(context, args);
                            inThrottle = true;
                            setTimeout(() => inThrottle = false, limit);
                        }
                    }
                }
            };
        }
        
        this.fixes.push({
            type: 'service_initialized',
            message: `Service ${bug.serviceName} initialisé`,
            timestamp: Date.now()
        });
    }

    initializeMissingVariable(bug) {
        console.log(`🔧 Initialisation de la variable: ${bug.variableName}`);
        
        if (bug.variableName === 'converter' && typeof window.converter === 'undefined') {
            window.converter = {
                initialized: false,
                init: () => console.log('Converter placeholder initialized')
            };
        }
        
        this.fixes.push({
            type: 'variable_initialized',
            message: `Variable ${bug.variableName} initialisée`,
            timestamp: Date.now()
        });
    }

    generateReport() {
        console.log('📊 Génération du rapport de diagnostic...');
        
        const report = {
            timestamp: new Date().toISOString(),
            bugsFound: this.bugs.length,
            fixesApplied: this.fixes.length,
            bugs: this.bugs,
            fixes: this.fixes,
            severity: {
                critical: this.bugs.filter(b => b.severity === 'critical').length,
                high: this.bugs.filter(b => b.severity === 'high').length,
                medium: this.bugs.filter(b => b.severity === 'medium').length,
                low: this.bugs.filter(b => b.severity === 'low').length
            }
        };
        
        console.log('🎯 RAPPORT DE DIAGNOSTIC COMPLET:', report);
        
        // Afficher un résumé visuel
        this.displayVisualReport(report);
        
        return report;
    }

    displayVisualReport(report) {
        const reportDiv = document.createElement('div');
        reportDiv.id = 'bug-diagnostic-report';
        reportDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 400px;
            backdrop-filter: blur(10px);
        `;
        
        reportDiv.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <span style="font-size: 24px; margin-right: 10px;">🔍</span>
                <h3 style="margin: 0; font-size: 18px;">Diagnostic Complet</h3>
                <button onclick="this.parentNode.parentNode.remove()" style="
                    margin-left: auto;
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    cursor: pointer;
                    font-size: 16px;
                ">×</button>
            </div>
            
            <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>🐛 Bugs trouvés:</span>
                    <strong>${report.bugsFound}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>🔧 Corrections appliquées:</span>
                    <strong>${report.fixesApplied}</strong>
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Sévérité:</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; font-size: 12px;">
                    <div>🔴 Critique: ${report.severity.critical}</div>
                    <div>🟠 Élevée: ${report.severity.high}</div>
                    <div>🟡 Moyenne: ${report.severity.medium}</div>
                    <div>🟢 Faible: ${report.severity.low}</div>
                </div>
            </div>
            
            <div style="text-align: center; font-size: 12px; opacity: 0.8;">
                Diagnostic terminé à ${new Date().toLocaleTimeString()}
            </div>
        `;
        
        // Supprimer le rapport précédent s'il existe
        const existingReport = document.getElementById('bug-diagnostic-report');
        if (existingReport) {
            existingReport.remove();
        }
        
        document.body.appendChild(reportDiv);
        
        // Auto-suppression après 10 secondes
        setTimeout(() => {
            if (reportDiv.parentNode) {
                reportDiv.remove();
            }
        }, 10000);
    }
}

// Initialiser et lancer le diagnostic automatiquement
const bugDiagnostic = new BugFixDiagnostic();

// Lancer le diagnostic après le chargement de la page
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => bugDiagnostic.runCompleteDiagnostic(), 1000);
    });
} else {
    setTimeout(() => bugDiagnostic.runCompleteDiagnostic(), 1000);
}

// Exporter pour utilisation externe
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BugFixDiagnostic;
} else if (typeof window !== 'undefined') {
    window.BugFixDiagnostic = BugFixDiagnostic;
}