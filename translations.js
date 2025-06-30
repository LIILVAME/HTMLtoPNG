// Translations for the HTML to PNG Converter
const translations = {
    en: {
        title: "HTML to PNG",
        subtitle: "Convert your HTML & CSS code to high-quality images",
        input_title: "HTML & CSS Code",
        preview_title: "Live Preview",
        expanded_preview_title: "Expanded Preview",
        resolution_title: "Output Settings",
        social_presets_title: "Social Media",
        width_label: "Width (px)",
        height_label: "Height (px)",
        quality_label: "Quality",
        convert_btn: "Convert to Image",
        html_placeholder: "Paste your HTML code here...",
        css_placeholder: "Paste your CSS code here...",
        preview_placeholder: "Your HTML preview will appear here",
        footer_text: "Made with ❤️ for developers and designers",
        loading_text: "Converting your code...",
        download_success: "Image downloaded successfully!",
        error_empty_code: "Please enter some HTML code to convert",
        error_conversion: "Error during conversion. Please check your code.",
        login_title: "HTML to PNG",
        login_subtitle: "Sign in to access the converter",
        login_google: "Continue with Google",
        login_github: "Continue with GitHub",
        login_or: "or",
        login_email: "Email",
        login_password: "Password",
        login_btn: "Sign In",
        login_no_account: "No account?",
        login_signup: "Sign Up",
        logout: "Logout"
    },
    fr: {
        title: "HTML vers PNG",
        subtitle: "Convertissez votre code HTML et CSS en images haute qualité",
        input_title: "Code HTML et CSS",
        preview_title: "Aperçu en Direct",
        expanded_preview_title: "Aperçu Agrandie",
        resolution_title: "Paramètres de Sortie",
        social_presets_title: "Réseaux Sociaux",
        width_label: "Largeur (px)",
        height_label: "Hauteur (px)",
        quality_label: "Qualité",
        convert_btn: "Convertir en Image",
        html_placeholder: "Collez votre code HTML ici...",
        css_placeholder: "Collez votre code CSS ici...",
        preview_placeholder: "Votre aperçu HTML apparaîtra ici",
        footer_text: "Fait avec ❤️ pour les développeurs et designers",
        loading_text: "Conversion de votre code...",
        download_success: "Image téléchargée avec succès !",
        error_empty_code: "Veuillez entrer du code HTML à convertir",
        error_conversion: "Erreur lors de la conversion. Vérifiez votre code.",
        login_title: "HTML vers PNG",
        login_subtitle: "Connectez-vous pour accéder au convertisseur",
        login_google: "Continuer avec Google",
        login_github: "Continuer avec GitHub",
        login_or: "ou",
        login_email: "Email",
        login_password: "Mot de passe",
        login_btn: "Se connecter",
        login_no_account: "Pas de compte ?",
        login_signup: "S'inscrire",
        logout: "Déconnexion"
    },
    es: {
        title: "HTML a PNG",
        subtitle: "Convierte tu código HTML y CSS en imágenes de alta calidad",
        input_title: "Código HTML y CSS",
        preview_title: "Vista Previa en Vivo",
        resolution_title: "Configuración de Salida",
        social_presets_title: "Redes Sociales",
        width_label: "Ancho (px)",
        height_label: "Alto (px)",
        quality_label: "Calidad",
        convert_btn: "Convertir a Imagen",
        html_placeholder: "Pega tu código HTML aquí...",
        css_placeholder: "Pega tu código CSS aquí...",
        preview_placeholder: "Tu vista previa HTML aparecerá aquí",
        footer_text: "Hecho con ❤️ para desarrolladores y diseñadores",
        loading_text: "Convirtiendo tu código...",
        download_success: "¡Imagen descargada exitosamente!",
        error_empty_code: "Por favor ingresa código HTML para convertir",
        error_conversion: "Error durante la conversión. Revisa tu código.",
        login_title: "HTML a PNG",
        login_subtitle: "Inicia sesión para acceder al convertidor",
        login_google: "Continuar con Google",
        login_github: "Continuar con GitHub",
        login_or: "o",
        login_email: "Email",
        login_password: "Contraseña",
        login_btn: "Iniciar Sesión",
        login_no_account: "¿No tienes cuenta?",
        login_signup: "Registrarse",
        logout: "Cerrar Sesión"
    },
    de: {
        title: "HTML zu PNG",
        subtitle: "Konvertieren Sie Ihren HTML- und CSS-Code in hochwertige Bilder",
        input_title: "HTML- und CSS-Code",
        preview_title: "Live-Vorschau",
        resolution_title: "Ausgabe-Einstellungen",
        social_presets_title: "Soziale Medien",
        width_label: "Breite (px)",
        height_label: "Höhe (px)",
        quality_label: "Qualität",
        convert_btn: "In Bild konvertieren",
        html_placeholder: "Fügen Sie Ihren HTML-Code hier ein...",
        css_placeholder: "Fügen Sie Ihren CSS-Code hier ein...",
        preview_placeholder: "Ihre HTML-Vorschau wird hier angezeigt",
        footer_text: "Mit ❤️ für Entwickler und Designer gemacht",
        loading_text: "Konvertierung Ihres Codes...",
        download_success: "Bild erfolgreich heruntergeladen!",
        error_empty_code: "Bitte geben Sie HTML-Code zum Konvertieren ein",
        error_conversion: "Fehler bei der Konvertierung. Überprüfen Sie Ihren Code.",
        login_title: "HTML zu PNG",
        login_subtitle: "Melden Sie sich an, um auf den Konverter zuzugreifen",
        login_google: "Mit Google fortfahren",
        login_github: "Mit GitHub fortfahren",
        login_or: "oder",
        login_email: "E-Mail",
        login_password: "Passwort",
        login_btn: "Anmelden",
        login_no_account: "Kein Konto?",
        login_signup: "Registrieren",
        logout: "Abmelden"
    }
};

// Language management
class LanguageManager {
    constructor() {
        this.currentLanguage = this.detectLanguage();
        this.init();
    }

    detectLanguage() {
        // Check localStorage first
        const saved = localStorage.getItem('htmltopng_language');
        if (saved && translations[saved]) {
            return saved;
        }

        // Check browser language
        const browserLang = navigator.language.split('-')[0];
        if (translations[browserLang]) {
            return browserLang;
        }

        // Default to English
        return 'en';
    }

    init() {
        this.updateLanguageSelector();
        this.translatePage();
        this.bindEvents();
    }

    updateLanguageSelector() {
        const selector = document.getElementById('languageSelect');
        if (selector) {
            selector.value = this.currentLanguage;
        }
    }

    bindEvents() {
        const selector = document.getElementById('languageSelect');
        if (selector) {
            selector.addEventListener('change', (e) => {
                this.changeLanguage(e.target.value);
            });
        }
    }

    changeLanguage(lang) {
        if (translations[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('htmltopng_language', lang);
            this.translatePage();
            
            // Update HTML lang attribute
            document.documentElement.lang = lang;
            
            // Trigger custom event for other components
            window.dispatchEvent(new CustomEvent('languageChanged', {
                detail: { language: lang }
            }));
        }
    }

    translatePage() {
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations[this.currentLanguage][key]) {
                element.textContent = translations[this.currentLanguage][key];
            }
        });

        // Translate placeholders
        const placeholderElements = document.querySelectorAll('[data-translate-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-translate-placeholder');
            if (translations[this.currentLanguage][key]) {
                element.placeholder = translations[this.currentLanguage][key];
            }
        });
    }

    getText(key) {
        return translations[this.currentLanguage][key] || translations.en[key] || key;
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }
}

// Language manager will be initialized by the main application or auth manager
let languageManager;

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { translations, LanguageManager };
}