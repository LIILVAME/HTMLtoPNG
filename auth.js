class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Check if user is already logged in
        this.checkAuthState();
        
        // Bind event listeners
        this.bindEvents();
        
        // Initialize language manager globally if not already initialized
        if (typeof LanguageManager !== 'undefined' && !window.languageManager) {
            window.languageManager = new LanguageManager();
            this.languageManager = window.languageManager;
        } else if (window.languageManager) {
            this.languageManager = window.languageManager;
        }
    }

    bindEvents() {
        // Google login
        const googleBtn = document.getElementById('googleLogin');
        if (googleBtn) {
            googleBtn.addEventListener('click', () => this.loginWithGoogle());
        }

        // GitHub login
        const githubBtn = document.getElementById('githubLogin');
        if (githubBtn) {
            githubBtn.addEventListener('click', () => this.loginWithGitHub());
        }

        // Manual login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleManualLogin(e));
        }

        // Signup link
        const signupLink = document.getElementById('signupLink');
        if (signupLink) {
            signupLink.addEventListener('click', (e) => this.handleSignup(e));
        }

        // Logout button (if exists)
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    checkAuthState() {
        // Check localStorage for existing session
        const savedUser = localStorage.getItem('htmltopng_user');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                // If we're on login page and user is logged in, redirect to main app
                if (window.location.pathname.includes('login.html')) {
                    window.location.href = 'index.html';
                }
            } catch (e) {
                localStorage.removeItem('htmltopng_user');
            }
        } else {
            // If we're on main app and user is not logged in, redirect to login
            if (!window.location.pathname.includes('login.html') && window.location.pathname !== '/') {
                window.location.href = 'login.html';
            }
        }
    }

    async loginWithGoogle() {
        try {
            // In a real implementation, you would use Google OAuth2
            // For demo purposes, we'll simulate the login
            this.showLoading('Connexion avec Google...');
            
            // Simulate API call delay
            await this.delay(2000);
            
            // Simulate successful Google login
            const user = {
                id: 'google_' + Date.now(),
                name: 'Utilisateur Google',
                email: 'user@gmail.com',
                provider: 'google',
                avatar: 'data:image/svg+xml;base64,' + btoa('<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#4285f4"/><text x="20" y="25" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">G</text></svg>')
            };
            
            this.setCurrentUser(user);
            this.redirectToApp();
            
        } catch (error) {
            this.hideLoading();
            this.showError('Erreur lors de la connexion avec Google');
        }
    }

    async loginWithGitHub() {
        try {
            // In a real implementation, you would use GitHub OAuth
            // For demo purposes, we'll simulate the login
            this.showLoading('Connexion avec GitHub...');
            
            // Simulate API call delay
            await this.delay(2000);
            
            // Simulate successful GitHub login
            const user = {
                id: 'github_' + Date.now(),
                name: 'Utilisateur GitHub',
                email: 'user@github.com',
                provider: 'github',
                avatar: 'data:image/svg+xml;base64,' + btoa('<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#333333"/><text x="20" y="25" text-anchor="middle" fill="white" font-family="Arial" font-size="14" font-weight="bold">GH</text></svg>')
            };
            
            this.setCurrentUser(user);
            this.redirectToApp();
            
        } catch (error) {
            this.hideLoading();
            this.showError('Erreur lors de la connexion avec GitHub');
        }
    }

    async handleManualLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            this.showError('Veuillez remplir tous les champs');
            return;
        }
        
        try {
            this.showLoading('Connexion en cours...');
            
            // Simulate API call delay
            await this.delay(1500);
            
            // Simulate successful manual login
            const user = {
                id: 'manual_' + Date.now(),
                name: email.split('@')[0],
                email: email,
                provider: 'manual',
                avatar: 'data:image/svg+xml;base64,' + btoa('<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#667eea"/><text x="20" y="25" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">' + email.charAt(0).toUpperCase() + '</text></svg>')
            };
            
            this.setCurrentUser(user);
            this.redirectToApp();
            
        } catch (error) {
            this.hideLoading();
            this.showError('Email ou mot de passe incorrect');
        }
    }

    handleSignup(e) {
        e.preventDefault();
        // For demo purposes, we'll just show an alert
        alert('Fonctionnalité d\'inscription à venir ! Pour le moment, utilisez la connexion manuelle avec n\'importe quel email/mot de passe.');
    }

    setCurrentUser(user) {
        this.currentUser = user;
        localStorage.setItem('htmltopng_user', JSON.stringify(user));
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('htmltopng_user');
        window.location.href = 'login.html';
    }

    redirectToApp() {
        window.location.href = 'index.html';
    }

    showLoading(message) {
        // Create loading overlay if it doesn't exist
        let overlay = document.getElementById('authLoadingOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'authLoadingOverlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            `;
            
            const spinner = document.createElement('div');
            spinner.style.cssText = `
                background: white;
                padding: 30px;
                border-radius: 15px;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            `;
            
            spinner.innerHTML = `
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #667eea; margin-bottom: 15px;"></i>
                <p style="margin: 0; color: #333; font-weight: 500;">${message}</p>
            `;
            
            overlay.appendChild(spinner);
            document.body.appendChild(overlay);
        }
        
        overlay.style.display = 'flex';
    }

    hideLoading() {
        const overlay = document.getElementById('authLoadingOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    showError(message) {
        // Create error notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4757;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(255,71,87,0.3);
            z-index: 10000;
            font-weight: 500;
            animation: slideIn 0.3s ease;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Add animation keyframes
        if (!document.getElementById('errorAnimationStyle')) {
            const style = document.createElement('style');
            style.id = 'errorAnimationStyle';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }
}

// Auth manager will be initialized by the main application