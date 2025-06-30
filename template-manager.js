// Phase 2 - Advanced Features: Template Management
class TemplateManager {
    constructor() {
        this.templates = new Map();
        this.categories = ['business', 'social', 'education', 'creative', 'technical'];
        this.customTemplates = this.loadCustomTemplates();
        this.initializeDefaultTemplates();
    }

    /**
     * Initialize template management
     */
    init() {
        this.setupTemplateCategories();
        this.setupTemplateCreation();
        this.setupTemplateSearch();
        this.renderTemplates();
    }

    /**
     * Initialize default templates
     */
    initializeDefaultTemplates() {
        // Business Card Template
        this.addTemplate({
            id: 'business-card',
            name: 'Carte de Visite',
            category: 'business',
            description: 'Carte de visite professionnelle moderne',
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjZjhmOWZhIi8+CjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSIxMDAiIGZpbGw9IndoaXRlIiBzdHJva2U9IiNlNWU3ZWIiLz4KPHN2ZyB4PSIyMCIgeT0iMjAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0iIzM3NDE1MSI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0iIzM3NDE1MSIvPgo8L3N2Zz4KPHN2ZyB4PSIxMDAiIHk9IjMwIiB3aWR0aD0iODAiIGhlaWdodD0iNDAiIGZpbGw9IiM2YjczODAiPgo8cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iMTAiIGZpbGw9IiM2YjczODAiLz4KPHJlY3QgeT0iMjAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI4IiBmaWxsPSIjOWNhM2FmIi8+CjxyZWN0IHk9IjMwIiB3aWR0aD0iNzAiIGhlaWdodD0iOCIgZmlsbD0iIzljYTNhZiIvPgo8L3N2Zz4KPC9zdmc+',
            html: `<div class="business-card">
  <div class="card-header">
    <div class="logo">LOGO</div>
    <div class="company">Votre Entreprise</div>
  </div>
  <div class="card-content">
    <h2>Jean Dupont</h2>
    <p class="title">Directeur Commercial</p>
    <div class="contact">
      <p>📧 jean.dupont@entreprise.com</p>
      <p>📱 +33 1 23 45 67 89</p>
      <p>🌐 www.entreprise.com</p>
    </div>
  </div>
</div>`,
            css: `.business-card {
  width: 350px;
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  padding: 20px;
  color: white;
  font-family: 'Inter', sans-serif;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.logo {
  background: white;
  color: #667eea;
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 14px;
}

.company {
  font-size: 12px;
  opacity: 0.9;
}

.card-content h2 {
  margin: 0 0 5px 0;
  font-size: 24px;
  font-weight: 600;
}

.title {
  margin: 0 0 15px 0;
  opacity: 0.8;
  font-size: 14px;
}

.contact p {
  margin: 5px 0;
  font-size: 12px;
  opacity: 0.9;
}`,
            width: 350,
            height: 200,
            tags: ['business', 'card', 'professional']
        });

        // Instagram Post Template
        this.addTemplate({
            id: 'instagram-post',
            name: 'Post Instagram',
            category: 'social',
            description: 'Post carré optimisé pour Instagram',
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjNmNGY2Ii8+CjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSIxODAiIGZpbGw9IndoaXRlIiBzdHJva2U9IiNlNWU3ZWIiLz4KPHN2ZyB4PSIyMCIgeT0iMjAiIHdpZHRoPSIxNjAiIGhlaWdodD0iNDAiIGZpbGw9IiMzNzQxNTEiPgo8cmVjdCB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE1IiBmaWxsPSIjMzc0MTUxIi8+CjxyZWN0IHk9IjI1IiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjNmI3MzgwIi8+Cjwvc3ZnPgo8c3ZnIHg9IjIwIiB5PSI4MCIgd2lkdGg9IjE2MCIgaGVpZ2h0PSI4MCIgZmlsbD0iIzljYTNhZiI+CjxyZWN0IHdpZHRoPSIxNjAiIGhlaWdodD0iODAiIGZpbGw9IiM5Y2EzYWYiLz4KPC9zdmc+CjxyZWN0IHg9IjIwIiB5PSIxNzAiIHdpZHRoPSIzMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2Y1OWU0MiIvPgo8L3N2Zz4=',
            html: `<div class="instagram-post">
  <div class="post-header">
    <h1>Votre Titre Accrocheur</h1>
    <p class="subtitle">Sous-titre engageant pour votre audience</p>
  </div>
  <div class="post-content">
    <div class="content-block">
      <h3>✨ Point Important 1</h3>
      <p>Description courte et impactante</p>
    </div>
    <div class="content-block">
      <h3>🚀 Point Important 2</h3>
      <p>Autre information clé</p>
    </div>
    <div class="content-block">
      <h3>💡 Point Important 3</h3>
      <p>Dernière information essentielle</p>
    </div>
  </div>
  <div class="post-footer">
    <div class="hashtags">#votremarque #inspiration #motivation</div>
  </div>
</div>`,
            css: `.instagram-post {
  width: 1080px;
  height: 1080px;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  padding: 60px;
  color: white;
  font-family: 'Inter', sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.post-header {
  text-align: center;
}

.post-header h1 {
  font-size: 72px;
  font-weight: 800;
  margin: 0 0 20px 0;
  line-height: 1.1;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.subtitle {
  font-size: 32px;
  opacity: 0.9;
  margin: 0;
  font-weight: 300;
}

.post-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 40px;
  margin: 60px 0;
}

.content-block {
  background: rgba(255,255,255,0.1);
  padding: 30px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.content-block h3 {
  font-size: 36px;
  margin: 0 0 15px 0;
  font-weight: 600;
}

.content-block p {
  font-size: 24px;
  margin: 0;
  opacity: 0.9;
}

.post-footer {
  text-align: center;
}

.hashtags {
  font-size: 28px;
  opacity: 0.8;
  font-weight: 500;
}`,
            width: 1080,
            height: 1080,
            tags: ['instagram', 'social', 'square']
        });

        // Presentation Slide Template
        this.addTemplate({
            id: 'presentation-slide',
            name: 'Slide de Présentation',
            category: 'education',
            description: 'Slide moderne pour présentations',
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjZjNmNGY2Ii8+CjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSIxMzAiIGZpbGw9IndoaXRlIiBzdHJva2U9IiNlNWU3ZWIiLz4KPHN2ZyB4PSIyMCIgeT0iMjAiIHdpZHRoPSIxNjAiIGhlaWdodD0iMjAiIGZpbGw9IiMzNzQxNTEiPgo8cmVjdCB3aWR0aD0iMTYwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjMzc0MTUxIi8+Cjwvc3ZnPgo8c3ZnIHg9IjIwIiB5PSI1MCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjOWNhM2FmIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjOWNhM2FmIi8+Cjwvc3ZnPgo8c3ZnIHg9IjExMCIgeT0iNTAiIHdpZHRoPSI3MCIgaGVpZ2h0PSI4MCIgZmlsbD0iIzZiNzM4MCI+CjxyZWN0IHdpZHRoPSI3MCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzZiNzM4MCIvPgo8cmVjdCB5PSIyMCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjgiIGZpbGw9IiM5Y2EzYWYiLz4KPHJlY3QgeT0iMzAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI4IiBmaWxsPSIjOWNhM2FmIi8+CjxyZWN0IHk9IjQwIiB3aWR0aD0iNDAiIGhlaWdodD0iOCIgZmlsbD0iIzljYTNhZiIvPgo8L3N2Zz4KPC9zdmc+',
            html: `<div class="presentation-slide">
  <div class="slide-header">
    <h1>Titre de votre Slide</h1>
    <div class="slide-number">01</div>
  </div>
  <div class="slide-content">
    <div class="content-left">
      <div class="visual-element">
        <div class="chart-placeholder">
          <div class="bar" style="height: 60%"></div>
          <div class="bar" style="height: 80%"></div>
          <div class="bar" style="height: 45%"></div>
          <div class="bar" style="height: 90%"></div>
        </div>
      </div>
    </div>
    <div class="content-right">
      <h2>Points Clés</h2>
      <ul>
        <li>Premier point important</li>
        <li>Deuxième élément essentiel</li>
        <li>Troisième information clé</li>
        <li>Conclusion marquante</li>
      </ul>
    </div>
  </div>
  <div class="slide-footer">
    <div class="company-logo">Votre Entreprise</div>
  </div>
</div>`,
            css: `.presentation-slide {
  width: 1920px;
  height: 1080px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 80px;
  color: white;
  font-family: 'Inter', sans-serif;
  display: flex;
  flex-direction: column;
}

.slide-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 60px;
}

.slide-header h1 {
  font-size: 64px;
  font-weight: 700;
  margin: 0;
}

.slide-number {
  font-size: 48px;
  font-weight: 300;
  opacity: 0.7;
}

.slide-content {
  flex: 1;
  display: flex;
  gap: 80px;
  align-items: center;
}

.content-left {
  flex: 1;
}

.visual-element {
  background: rgba(255,255,255,0.1);
  border-radius: 20px;
  padding: 60px;
  backdrop-filter: blur(10px);
}

.chart-placeholder {
  display: flex;
  align-items: end;
  gap: 20px;
  height: 300px;
}

.bar {
  background: white;
  width: 60px;
  border-radius: 8px;
  opacity: 0.8;
}

.content-right {
  flex: 1;
}

.content-right h2 {
  font-size: 48px;
  margin: 0 0 40px 0;
  font-weight: 600;
}

.content-right ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.content-right li {
  font-size: 32px;
  margin: 20px 0;
  padding-left: 40px;
  position: relative;
}

.content-right li:before {
  content: '▶';
  position: absolute;
  left: 0;
  color: #ffd700;
}

.slide-footer {
  text-align: center;
  margin-top: 40px;
}

.company-logo {
  font-size: 24px;
  opacity: 0.7;
  font-weight: 500;
}`,
            width: 1920,
            height: 1080,
            tags: ['presentation', 'slide', 'business']
        });

        // Code Snippet Template
        this.addTemplate({
            id: 'code-snippet',
            name: 'Snippet de Code',
            category: 'technical',
            description: 'Template pour partager du code',
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjMWUyMDI0Ii8+CjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSIxMzAiIGZpbGw9IiMyZDMzM2IiIHN0cm9rZT0iIzM3NDE1MSIvPgo8c3ZnIHg9IjIwIiB5PSIyMCIgd2lkdGg9IjE2MCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzM3NDE1MSI+CjxyZWN0IHdpZHRoPSIxNjAiIGhlaWdodD0iMjAiIGZpbGw9IiMzNzQxNTEiLz4KPGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iNCIgZmlsbD0iI2ZmNTU1NSIvPgo8Y2lyY2xlIGN4PSIyNSIgY3k9IjEwIiByPSI0IiBmaWxsPSIjZmZiZDJlIi8+CjxjaXJjbGUgY3g9IjQwIiBjeT0iMTAiIHI9IjQiIGZpbGw9IiMyOGNhNDIiLz4KPC9zdmc+CjxzdmcgeD0iMjAiIHk9IjUwIiB3aWR0aD0iMTYwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZTVlN2ViIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjgiIGZpbGw9IiNmNTllNDIiLz4KPHJlY3QgeT0iMTUiIHdpZHRoPSI4MCIgaGVpZ2h0PSI4IiBmaWxsPSIjMzMzOWZmIi8+CjxyZWN0IHk9IjMwIiB3aWR0aD0iNjAiIGhlaWdodD0iOCIgZmlsbD0iIzI4Y2E0MiIvPgo8cmVjdCB5PSI0NSIgd2lkdGg9IjEwMCIgaGVpZ2h0PSI4IiBmaWxsPSIjZTVlN2ViIi8+CjxyZWN0IHk9IjYwIiB3aWR0aD0iNzAiIGhlaWdodD0iOCIgZmlsbD0iI2Y1OWU0MiIvPgo8L3N2Zz4KPC9zdmc+',
            html: `<div class="code-snippet">
  <div class="window-header">
    <div class="window-controls">
      <span class="control close"></span>
      <span class="control minimize"></span>
      <span class="control maximize"></span>
    </div>
    <div class="window-title">script.js</div>
  </div>
  <div class="code-content">
    <div class="line-numbers">
      <span>1</span>
      <span>2</span>
      <span>3</span>
      <span>4</span>
      <span>5</span>
      <span>6</span>
      <span>7</span>
    </div>
    <div class="code">
      <div class="line"><span class="keyword">function</span> <span class="function">convertToImage</span>() {</div>
      <div class="line">  <span class="keyword">const</span> <span class="variable">canvas</span> = <span class="string">'#canvas'</span>;</div>
      <div class="line">  <span class="keyword">const</span> <span class="variable">options</span> = {</div>
      <div class="line">    <span class="property">width</span>: <span class="number">1080</span>,</div>
      <div class="line">    <span class="property">height</span>: <span class="number">1080</span></div>
      <div class="line">  };</div>
      <div class="line">}</div>
    </div>
  </div>
  <div class="code-footer">
    <div class="language">JavaScript</div>
    <div class="author">@votre_username</div>
  </div>
</div>`,
            css: `.code-snippet {
  width: 800px;
  height: 600px;
  background: #1e1e1e;
  border-radius: 12px;
  overflow: hidden;
  font-family: 'Fira Code', 'Monaco', monospace;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

.window-header {
  background: #2d2d2d;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.window-controls {
  display: flex;
  gap: 8px;
}

.control {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.close { background: #ff5f56; }
.minimize { background: #ffbd2e; }
.maximize { background: #27ca3f; }

.window-title {
  color: #cccccc;
  font-size: 14px;
  font-weight: 500;
}

.code-content {
  display: flex;
  height: 480px;
  background: #1e1e1e;
}

.line-numbers {
  background: #252526;
  padding: 20px 15px;
  color: #858585;
  font-size: 14px;
  line-height: 24px;
  text-align: right;
  min-width: 50px;
}

.code {
  flex: 1;
  padding: 20px;
  color: #d4d4d4;
  font-size: 14px;
  line-height: 24px;
}

.keyword { color: #569cd6; }
.function { color: #dcdcaa; }
.variable { color: #9cdcfe; }
.string { color: #ce9178; }
.number { color: #b5cea8; }
.property { color: #92c5f7; }

.code-footer {
  background: #2d2d2d;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #cccccc;
  font-size: 12px;
}

.language {
  background: #007acc;
  padding: 4px 8px;
  border-radius: 4px;
  color: white;
  font-weight: 500;
}`,
            width: 800,
            height: 600,
            tags: ['code', 'programming', 'snippet']
        });
    }

    /**
     * Add a template to the collection
     */
    addTemplate(template) {
        this.templates.set(template.id, {
            ...template,
            createdAt: Date.now(),
            isCustom: false
        });
    }

    /**
     * Add a custom template
     */
    addCustomTemplate(template) {
        const customTemplate = {
            ...template,
            id: this.generateId(),
            createdAt: Date.now(),
            isCustom: true
        };
        
        this.templates.set(customTemplate.id, customTemplate);
        this.customTemplates.push(customTemplate);
        this.saveCustomTemplates();
        this.renderTemplates();
        
        return customTemplate.id;
    }

    /**
     * Load a template
     */
    loadTemplate(templateId) {
        const template = this.templates.get(templateId);
        if (!template) return false;

        // Load template data into inputs
        const htmlInput = document.getElementById('htmlInput');
        const cssInput = document.getElementById('cssInput');
        const widthInput = document.getElementById('widthInput');
        const heightInput = document.getElementById('heightInput');

        if (htmlInput) htmlInput.value = template.html;
        if (cssInput) cssInput.value = template.css;
        if (widthInput) widthInput.value = template.width;
        if (heightInput) heightInput.value = template.height;

        // Update preview
        if (window.htmlToPngConverter && window.htmlToPngConverter.updatePreview) {
            window.htmlToPngConverter.updatePreview();
        }

        this.showToast(`Template "${template.name}" chargé`, 'success');
        return true;
    }

    /**
     * Delete a custom template
     */
    deleteTemplate(templateId) {
        const template = this.templates.get(templateId);
        if (!template || !template.isCustom) return false;

        if (confirm(`Supprimer le template "${template.name}" ?`)) {
            this.templates.delete(templateId);
            this.customTemplates = this.customTemplates.filter(t => t.id !== templateId);
            this.saveCustomTemplates();
            this.renderTemplates();
            this.showToast('Template supprimé', 'info');
            return true;
        }
        return false;
    }

    /**
     * Setup template categories
     */
    setupTemplateCategories() {
        const categoryFilter = document.getElementById('templateCategoryFilter');
        if (!categoryFilter) return;

        categoryFilter.innerHTML = `
            <option value="all">Toutes les catégories</option>
            ${this.categories.map(cat => 
                `<option value="${cat}">${this.getCategoryName(cat)}</option>`
            ).join('')}
        `;

        categoryFilter.addEventListener('change', () => {
            this.renderTemplates(categoryFilter.value);
        });
    }

    /**
     * Setup template creation
     */
    setupTemplateCreation() {
        const createBtn = document.getElementById('createTemplateBtn');
        const saveBtn = document.getElementById('saveTemplateBtn');
        const modal = document.getElementById('templateModal');
        const closeBtn = document.getElementById('closeTemplateModal');

        if (createBtn && modal) {
            createBtn.addEventListener('click', () => {
                this.openTemplateCreationModal();
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveCurrentAsTemplate();
            });
        }

        if (closeBtn && modal) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
    }

    /**
     * Setup template search
     */
    setupTemplateSearch() {
        const searchInput = document.getElementById('templateSearch');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            this.searchTemplates(e.target.value);
        });
    }

    /**
     * Search templates
     */
    searchTemplates(query) {
        const filteredTemplates = Array.from(this.templates.values()).filter(template => {
            const searchText = `${template.name} ${template.description} ${template.tags.join(' ')}`.toLowerCase();
            return searchText.includes(query.toLowerCase());
        });

        this.renderFilteredTemplates(filteredTemplates);
    }

    /**
     * Render templates
     */
    renderTemplates(categoryFilter = 'all') {
        const container = document.getElementById('templatesContainer');
        if (!container) return;

        let templates = Array.from(this.templates.values());
        
        if (categoryFilter !== 'all') {
            templates = templates.filter(t => t.category === categoryFilter);
        }

        this.renderFilteredTemplates(templates);
    }

    /**
     * Render filtered templates
     */
    renderFilteredTemplates(templates) {
        const container = document.getElementById('templatesContainer');
        if (!container) return;

        if (templates.length === 0) {
            container.innerHTML = `
                <div class="templates-empty">
                    <i class="fas fa-search"></i>
                    <p>Aucun template trouvé</p>
                    <small>Essayez d'autres mots-clés</small>
                </div>
            `;
            return;
        }

        container.innerHTML = templates.map(template => `
            <div class="template-card" data-id="${template.id}">
                <div class="template-thumbnail">
                    <img src="${template.thumbnail}" alt="${template.name}" loading="lazy">
                    ${template.isCustom ? '<span class="custom-badge">Custom</span>' : ''}
                </div>
                <div class="template-info">
                    <h3 class="template-name">${template.name}</h3>
                    <p class="template-description">${template.description}</p>
                    <div class="template-meta">
                        <span class="template-category">${this.getCategoryName(template.category)}</span>
                        <span class="template-size">${template.width}×${template.height}</span>
                    </div>
                    <div class="template-tags">
                        ${template.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
                <div class="template-actions">
                    <button class="btn-primary" onclick="templateManager.loadTemplate('${template.id}')">
                        <i class="fas fa-download"></i> Utiliser
                    </button>
                    <button class="btn-icon" onclick="templateManager.previewTemplate('${template.id}')" title="Aperçu">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${template.isCustom ? 
                        `<button class="btn-icon danger" onclick="templateManager.deleteTemplate('${template.id}')" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>` : ''
                    }
                </div>
            </div>
        `).join('');
    }

    /**
     * Open template creation modal
     */
    openTemplateCreationModal() {
        const modal = document.getElementById('templateModal');
        if (!modal) return;

        // Pre-fill with current content
        const htmlInput = document.getElementById('htmlInput');
        const cssInput = document.getElementById('cssInput');
        const widthInput = document.getElementById('widthInput');
        const heightInput = document.getElementById('heightInput');

        const templateName = document.getElementById('templateName');
        const templateDescription = document.getElementById('templateDescription');
        const templateCategory = document.getElementById('templateCategory');
        const templateTags = document.getElementById('templateTags');

        if (templateName) templateName.value = '';
        if (templateDescription) templateDescription.value = '';
        if (templateCategory) templateCategory.value = 'custom';
        if (templateTags) templateTags.value = '';

        modal.style.display = 'flex';
    }

    /**
     * Save current content as template
     */
    saveCurrentAsTemplate() {
        const htmlInput = document.getElementById('htmlInput');
        const cssInput = document.getElementById('cssInput');
        const widthInput = document.getElementById('widthInput');
        const heightInput = document.getElementById('heightInput');

        const templateName = document.getElementById('templateName');
        const templateDescription = document.getElementById('templateDescription');
        const templateCategory = document.getElementById('templateCategory');
        const templateTags = document.getElementById('templateTags');

        if (!templateName?.value) {
            this.showToast('Veuillez entrer un nom pour le template', 'error');
            return;
        }

        const template = {
            name: templateName.value,
            description: templateDescription?.value || '',
            category: templateCategory?.value || 'custom',
            html: htmlInput?.value || '',
            css: cssInput?.value || '',
            width: parseInt(widthInput?.value) || 800,
            height: parseInt(heightInput?.value) || 600,
            tags: templateTags?.value ? templateTags.value.split(',').map(t => t.trim()) : [],
            thumbnail: this.generateThumbnail()
        };

        const templateId = this.addCustomTemplate(template);
        
        // Close modal
        const modal = document.getElementById('templateModal');
        if (modal) modal.style.display = 'none';

        this.showToast(`Template "${template.name}" créé`, 'success');
    }

    /**
     * Preview template
     */
    previewTemplate(templateId) {
        const template = this.templates.get(templateId);
        if (!template) return;

        // Create preview modal
        const modal = document.createElement('div');
        modal.className = 'template-preview-modal';
        modal.innerHTML = `
            <div class="preview-content">
                <div class="preview-header">
                    <h3>${template.name}</h3>
                    <button class="close-preview" onclick="this.closest('.template-preview-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="preview-body">
                    <iframe srcdoc="${this.generatePreviewHTML(template)}" 
                            style="width: 100%; height: 400px; border: none; border-radius: 8px;">
                    </iframe>
                </div>
                <div class="preview-footer">
                    <button class="btn-primary" onclick="templateManager.loadTemplate('${templateId}'); this.closest('.template-preview-modal').remove();">
                        Utiliser ce template
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * Generate preview HTML
     */
    generatePreviewHTML(template) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>${template.css}</style>
            </head>
            <body>
                ${template.html}
            </body>
            </html>
        `.replace(/"/g, '&quot;');
    }

    /**
     * Generate thumbnail for template
     */
    generateThumbnail() {
        // This would generate a thumbnail from current preview
        // For now, return a placeholder
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjZjNmNGY2Ii8+CjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSIxMzAiIGZpbGw9IndoaXRlIiBzdHJva2U9IiNlNWU3ZWIiLz4KPHN2ZyB4PSI4NSIgeT0iNjAiIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgZmlsbD0iIzljYTNhZiI+CjxyZWN0IHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgZmlsbD0iIzljYTNhZiIvPgo8L3N2Zz4KPC9zdmc+';
    }

    /**
     * Get category display name
     */
    getCategoryName(category) {
        const names = {
            'business': 'Business',
            'social': 'Réseaux Sociaux',
            'education': 'Éducation',
            'creative': 'Créatif',
            'technical': 'Technique',
            'custom': 'Personnalisé'
        };
        return names[category] || category;
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Load custom templates from localStorage
     */
    loadCustomTemplates() {
        try {
            const stored = localStorage.getItem('htmltopng_custom_templates');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading custom templates:', error);
            return [];
        }
    }

    /**
     * Save custom templates to localStorage
     */
    saveCustomTemplates() {
        try {
            localStorage.setItem('htmltopng_custom_templates', JSON.stringify(this.customTemplates));
        } catch (error) {
            console.error('Error saving custom templates:', error);
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
     * Get templates statistics
     */
    getStatistics() {
        const categoryCounts = {};
        this.categories.forEach(cat => categoryCounts[cat] = 0);
        
        Array.from(this.templates.values()).forEach(template => {
            categoryCounts[template.category] = (categoryCounts[template.category] || 0) + 1;
        });
        
        return {
            totalTemplates: this.templates.size,
            customTemplates: this.customTemplates.length,
            categoryCounts: categoryCounts
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TemplateManager;
}