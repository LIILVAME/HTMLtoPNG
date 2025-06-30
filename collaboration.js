/**
 * Real-time Collaboration Manager for HTML to PNG Converter
 * Handles multi-user editing and real-time synchronization
 * Version 2.0.0
 */

class CollaborationManager {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.roomId = null;
        this.userId = null;
        this.userName = null;
        this.collaborators = new Map();
        this.cursors = new Map();
        this.isHost = false;
        this.permissions = {
            edit: false,
            view: true,
            share: false
        };
        
        // Operational Transform for conflict resolution
        this.operationQueue = [];
        this.localVersion = 0;
        this.serverVersion = 0;
        
        // Debounce timers
        this.sendTimer = null;
        this.cursorTimer = null;
        
        // WebRTC for direct peer connections
        this.peerConnections = new Map();
        this.dataChannels = new Map();
        
        this.initializeEventListeners();
    }
    
    /**
     * Initialize collaboration manager
     */
    async init() {
        console.log('🤝 Initializing Collaboration Manager...');
        
        try {
            // Check if user is authenticated
            await this.checkAuthentication();
            
            // Initialize WebSocket connection
            await this.initializeWebSocket();
            
            // Setup UI elements
            this.setupCollaborationUI();
            
            console.log('✅ Collaboration Manager initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Collaboration Manager:', error);
        }
    }
    
    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        // Code editor changes
        const htmlInput = document.getElementById('htmlInput');
        const cssInput = document.getElementById('cssInput');
        
        if (htmlInput) {
            htmlInput.addEventListener('input', (e) => this.handleTextChange(e, 'html'));
            htmlInput.addEventListener('selectionchange', () => this.handleCursorChange('html'));
        }
        
        if (cssInput) {
            cssInput.addEventListener('input', (e) => this.handleTextChange(e, 'css'));
            cssInput.addEventListener('selectionchange', () => this.handleCursorChange('css'));
        }
        
        // Window events
        window.addEventListener('beforeunload', () => this.disconnect());
        window.addEventListener('focus', () => this.sendPresenceUpdate());
        window.addEventListener('blur', () => this.sendPresenceUpdate());
    }
    
    /**
     * Check user authentication
     */
    async checkAuthentication() {
        const token = localStorage.getItem('authToken');
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        if (token && userData.id) {
            this.userId = userData.id;
            this.userName = userData.name || 'Anonymous User';
            return true;
        }
        
        throw new Error('User not authenticated');
    }
    
    /**
     * Initialize WebSocket connection
     */
    async initializeWebSocket() {
        const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/collaboration`;
        
        return new Promise((resolve, reject) => {
            this.socket = new WebSocket(wsUrl);
            
            this.socket.onopen = () => {
                console.log('🔌 WebSocket connected');
                this.isConnected = true;
                this.authenticate();
                resolve();
            };
            
            this.socket.onmessage = (event) => {
                this.handleMessage(JSON.parse(event.data));
            };
            
            this.socket.onclose = () => {
                console.log('🔌 WebSocket disconnected');
                this.isConnected = false;
                this.handleDisconnection();
            };
            
            this.socket.onerror = (error) => {
                console.error('🔌 WebSocket error:', error);
                reject(error);
            };
            
            // Connection timeout
            setTimeout(() => {
                if (!this.isConnected) {
                    reject(new Error('WebSocket connection timeout'));
                }
            }, 10000);
        });
    }
    
    /**
     * Authenticate with the server
     */
    authenticate() {
        this.sendMessage({
            type: 'auth',
            token: localStorage.getItem('authToken'),
            userId: this.userId,
            userName: this.userName
        });
    }
    
    /**
     * Create a new collaboration room
     */
    async createRoom(options = {}) {
        const roomData = {
            name: options.name || 'Untitled Project',
            description: options.description || '',
            isPublic: options.isPublic || false,
            maxCollaborators: options.maxCollaborators || 10,
            permissions: options.permissions || {
                allowEdit: true,
                allowView: true,
                allowShare: false
            }
        };
        
        this.sendMessage({
            type: 'createRoom',
            data: roomData
        });
    }
    
    /**
     * Join an existing collaboration room
     */
    async joinRoom(roomId, password = null) {
        this.roomId = roomId;
        
        this.sendMessage({
            type: 'joinRoom',
            roomId: roomId,
            password: password
        });
    }
    
    /**
     * Leave the current room
     */
    leaveRoom() {
        if (this.roomId) {
            this.sendMessage({
                type: 'leaveRoom',
                roomId: this.roomId
            });
            
            this.roomId = null;
            this.collaborators.clear();
            this.cursors.clear();
            this.updateCollaboratorsUI();
        }
    }
    
    /**
     * Handle incoming WebSocket messages
     */
    handleMessage(message) {
        switch (message.type) {
            case 'authenticated':
                this.handleAuthenticated(message.data);
                break;
            
            case 'roomCreated':
                this.handleRoomCreated(message.data);
                break;
            
            case 'roomJoined':
                this.handleRoomJoined(message.data);
                break;
            
            case 'userJoined':
                this.handleUserJoined(message.data);
                break;
            
            case 'userLeft':
                this.handleUserLeft(message.data);
                break;
            
            case 'textChange':
                this.handleRemoteTextChange(message.data);
                break;
            
            case 'cursorUpdate':
                this.handleRemoteCursorUpdate(message.data);
                break;
            
            case 'presenceUpdate':
                this.handlePresenceUpdate(message.data);
                break;
            
            case 'operationAck':
                this.handleOperationAck(message.data);
                break;
            
            case 'error':
                this.handleError(message.data);
                break;
            
            default:
                console.warn('Unknown message type:', message.type);
        }
    }
    
    /**
     * Handle text changes in editors
     */
    handleTextChange(event, editorType) {
        if (!this.isConnected || !this.roomId) return;
        
        const element = event.target;
        const operation = {
            type: 'textChange',
            editorType: editorType,
            content: element.value,
            selectionStart: element.selectionStart,
            selectionEnd: element.selectionEnd,
            timestamp: Date.now(),
            userId: this.userId,
            version: ++this.localVersion
        };
        
        // Debounce sending to avoid flooding
        clearTimeout(this.sendTimer);
        this.sendTimer = setTimeout(() => {
            this.sendMessage({
                type: 'textChange',
                data: operation
            });
        }, 300);
    }
    
    /**
     * Handle cursor position changes
     */
    handleCursorChange(editorType) {
        if (!this.isConnected || !this.roomId) return;
        
        const element = document.getElementById(editorType === 'html' ? 'htmlInput' : 'cssInput');
        if (!element) return;
        
        const cursorData = {
            editorType: editorType,
            selectionStart: element.selectionStart,
            selectionEnd: element.selectionEnd,
            userId: this.userId,
            userName: this.userName,
            timestamp: Date.now()
        };
        
        // Debounce cursor updates
        clearTimeout(this.cursorTimer);
        this.cursorTimer = setTimeout(() => {
            this.sendMessage({
                type: 'cursorUpdate',
                data: cursorData
            });
        }, 100);
    }
    
    /**
     * Handle remote text changes
     */
    handleRemoteTextChange(data) {
        if (data.userId === this.userId) return;
        
        const element = document.getElementById(data.editorType === 'html' ? 'htmlInput' : 'cssInput');
        if (!element) return;
        
        // Apply operational transform
        const transformedContent = this.applyOperationalTransform(element.value, data);
        
        // Update editor content
        const currentSelection = {
            start: element.selectionStart,
            end: element.selectionEnd
        };
        
        element.value = transformedContent;
        
        // Restore cursor position (with adjustment for changes)
        const adjustedSelection = this.adjustSelectionForChange(currentSelection, data);
        element.setSelectionRange(adjustedSelection.start, adjustedSelection.end);
        
        // Update server version
        this.serverVersion = Math.max(this.serverVersion, data.version);
        
        // Trigger preview update
        if (window.htmlToPngConverter && window.htmlToPngConverter.updatePreview) {
            window.htmlToPngConverter.updatePreview();
        }
    }
    
    /**
     * Handle remote cursor updates
     */
    handleRemoteCursorUpdate(data) {
        if (data.userId === this.userId) return;
        
        this.cursors.set(data.userId, data);
        this.updateCursorDisplay(data);
    }
    
    /**
     * Apply operational transform for conflict resolution
     */
    applyOperationalTransform(localContent, remoteOperation) {
        // Simple operational transform implementation
        // In a production environment, you'd want a more sophisticated OT algorithm
        
        if (remoteOperation.version <= this.serverVersion) {
            // Operation already applied
            return localContent;
        }
        
        // For now, use last-write-wins with timestamp comparison
        const localTimestamp = this.getLastLocalChangeTimestamp();
        
        if (remoteOperation.timestamp > localTimestamp) {
            return remoteOperation.content;
        }
        
        return localContent;
    }
    
    /**
     * Adjust selection for remote changes
     */
    adjustSelectionForChange(selection, change) {
        // Simple adjustment - in production, you'd want more sophisticated logic
        return selection;
    }
    
    /**
     * Update cursor display for remote users
     */
    updateCursorDisplay(cursorData) {
        const editorId = cursorData.editorType === 'html' ? 'htmlInput' : 'cssInput';
        const editor = document.getElementById(editorId);
        if (!editor) return;
        
        // Remove existing cursor for this user
        const existingCursor = document.getElementById(`cursor-${cursorData.userId}`);
        if (existingCursor) {
            existingCursor.remove();
        }
        
        // Create new cursor element
        const cursor = document.createElement('div');
        cursor.id = `cursor-${cursorData.userId}`;
        cursor.className = 'remote-cursor';
        cursor.style.cssText = `
            position: absolute;
            width: 2px;
            height: 20px;
            background-color: ${this.getUserColor(cursorData.userId)};
            pointer-events: none;
            z-index: 1000;
            transition: all 0.1s ease;
        `;
        
        // Add user label
        const label = document.createElement('div');
        label.className = 'cursor-label';
        label.textContent = cursorData.userName;
        label.style.cssText = `
            position: absolute;
            top: -25px;
            left: 0;
            background-color: ${this.getUserColor(cursorData.userId)};
            color: white;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 12px;
            white-space: nowrap;
        `;
        
        cursor.appendChild(label);
        
        // Calculate cursor position
        const position = this.calculateCursorPosition(editor, cursorData.selectionStart);
        cursor.style.left = position.left + 'px';
        cursor.style.top = position.top + 'px';
        
        // Add to editor container
        const editorContainer = editor.parentElement;
        editorContainer.style.position = 'relative';
        editorContainer.appendChild(cursor);
        
        // Auto-remove after inactivity
        setTimeout(() => {
            if (cursor.parentElement) {
                cursor.remove();
            }
        }, 5000);
    }
    
    /**
     * Calculate cursor position in editor
     */
    calculateCursorPosition(editor, selectionStart) {
        // Create a temporary element to measure text
        const temp = document.createElement('div');
        temp.style.cssText = window.getComputedStyle(editor).cssText;
        temp.style.position = 'absolute';
        temp.style.visibility = 'hidden';
        temp.style.height = 'auto';
        temp.style.width = editor.offsetWidth + 'px';
        
        const textBeforeCursor = editor.value.substring(0, selectionStart);
        temp.textContent = textBeforeCursor;
        
        document.body.appendChild(temp);
        
        const position = {
            left: temp.offsetWidth % editor.offsetWidth,
            top: Math.floor(temp.offsetWidth / editor.offsetWidth) * 20 // Approximate line height
        };
        
        document.body.removeChild(temp);
        
        return position;
    }
    
    /**
     * Get user color for cursors and indicators
     */
    getUserColor(userId) {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
        ];
        
        const hash = userId.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        
        return colors[Math.abs(hash) % colors.length];
    }
    
    /**
     * Setup collaboration UI elements
     */
    setupCollaborationUI() {
        // Add collaboration panel to the page
        const collaborationPanel = document.createElement('div');
        collaborationPanel.id = 'collaborationPanel';
        collaborationPanel.innerHTML = `
            <div class="collaboration-header">
                <h3>Collaboration</h3>
                <button id="toggleCollaboration" class="btn-icon">
                    <i class="fas fa-users"></i>
                </button>
            </div>
            <div class="collaboration-content">
                <div class="room-info" id="roomInfo" style="display: none;">
                    <div class="room-details">
                        <span class="room-name" id="roomName"></span>
                        <span class="room-id" id="roomIdDisplay"></span>
                    </div>
                    <button id="leaveRoomBtn" class="btn btn-sm btn-danger">Leave</button>
                </div>
                
                <div class="room-actions" id="roomActions">
                    <button id="createRoomBtn" class="btn btn-primary">Create Room</button>
                    <button id="joinRoomBtn" class="btn btn-secondary">Join Room</button>
                </div>
                
                <div class="collaborators" id="collaboratorsList">
                    <h4>Collaborators</h4>
                    <div class="collaborators-list" id="collaboratorsContainer"></div>
                </div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #collaborationPanel {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 300px;
                background: white;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                z-index: 1000;
                border: 1px solid #e1e5e9;
            }
            
            .collaboration-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                border-bottom: 1px solid #e1e5e9;
            }
            
            .collaboration-content {
                padding: 15px;
                max-height: 400px;
                overflow-y: auto;
            }
            
            .room-info {
                margin-bottom: 15px;
                padding: 10px;
                background: #f8f9fa;
                border-radius: 5px;
            }
            
            .collaborators-list {
                max-height: 200px;
                overflow-y: auto;
            }
            
            .collaborator-item {
                display: flex;
                align-items: center;
                padding: 8px;
                margin-bottom: 5px;
                background: #f8f9fa;
                border-radius: 5px;
            }
            
            .collaborator-avatar {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                margin-right: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
            }
            
            .remote-cursor {
                animation: blink 1s infinite;
            }
            
            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0; }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(collaborationPanel);
        
        // Bind events
        this.bindCollaborationEvents();
    }
    
    /**
     * Bind collaboration UI events
     */
    bindCollaborationEvents() {
        document.getElementById('createRoomBtn')?.addEventListener('click', () => {
            this.showCreateRoomModal();
        });
        
        document.getElementById('joinRoomBtn')?.addEventListener('click', () => {
            this.showJoinRoomModal();
        });
        
        document.getElementById('leaveRoomBtn')?.addEventListener('click', () => {
            this.leaveRoom();
        });
    }
    
    /**
     * Show create room modal
     */
    showCreateRoomModal() {
        const roomName = prompt('Enter room name:');
        if (roomName) {
            this.createRoom({ name: roomName });
        }
    }
    
    /**
     * Show join room modal
     */
    showJoinRoomModal() {
        const roomId = prompt('Enter room ID:');
        if (roomId) {
            this.joinRoom(roomId);
        }
    }
    
    /**
     * Update collaborators UI
     */
    updateCollaboratorsUI() {
        const container = document.getElementById('collaboratorsContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.collaborators.forEach((collaborator, userId) => {
            const item = document.createElement('div');
            item.className = 'collaborator-item';
            
            const avatar = document.createElement('div');
            avatar.className = 'collaborator-avatar';
            avatar.style.backgroundColor = this.getUserColor(userId);
            avatar.textContent = collaborator.name.charAt(0).toUpperCase();
            
            const info = document.createElement('div');
            info.innerHTML = `
                <div class="collaborator-name">${collaborator.name}</div>
                <div class="collaborator-status">${collaborator.isActive ? 'Active' : 'Away'}</div>
            `;
            
            item.appendChild(avatar);
            item.appendChild(info);
            container.appendChild(item);
        });
    }
    
    /**
     * Send message to server
     */
    sendMessage(message) {
        if (this.isConnected && this.socket) {
            this.socket.send(JSON.stringify(message));
        }
    }
    
    /**
     * Send presence update
     */
    sendPresenceUpdate() {
        if (!this.isConnected || !this.roomId) return;
        
        this.sendMessage({
            type: 'presenceUpdate',
            data: {
                userId: this.userId,
                isActive: !document.hidden,
                timestamp: Date.now()
            }
        });
    }
    
    /**
     * Handle various server responses
     */
    handleAuthenticated(data) {
        console.log('✅ Authenticated successfully');
    }
    
    handleRoomCreated(data) {
        this.roomId = data.roomId;
        this.isHost = true;
        this.updateRoomUI(data);
        console.log('🏠 Room created:', data.roomId);
    }
    
    handleRoomJoined(data) {
        this.roomId = data.roomId;
        this.isHost = false;
        this.updateRoomUI(data);
        console.log('🚪 Joined room:', data.roomId);
    }
    
    handleUserJoined(data) {
        this.collaborators.set(data.userId, data);
        this.updateCollaboratorsUI();
        console.log('👋 User joined:', data.userName);
    }
    
    handleUserLeft(data) {
        this.collaborators.delete(data.userId);
        this.cursors.delete(data.userId);
        this.updateCollaboratorsUI();
        console.log('👋 User left:', data.userName);
    }
    
    handlePresenceUpdate(data) {
        const collaborator = this.collaborators.get(data.userId);
        if (collaborator) {
            collaborator.isActive = data.isActive;
            this.updateCollaboratorsUI();
        }
    }
    
    handleOperationAck(data) {
        this.serverVersion = data.version;
    }
    
    handleError(data) {
        console.error('Collaboration error:', data.message);
        if (window.htmlToPngConverter && window.htmlToPngConverter.showToast) {
            window.htmlToPngConverter.showToast(data.message, 'error');
        }
    }
    
    handleDisconnection() {
        this.isConnected = false;
        this.collaborators.clear();
        this.cursors.clear();
        this.updateCollaboratorsUI();
        
        // Attempt to reconnect
        setTimeout(() => {
            if (!this.isConnected) {
                this.initializeWebSocket().catch(console.error);
            }
        }, 5000);
    }
    
    /**
     * Update room UI
     */
    updateRoomUI(roomData) {
        const roomInfo = document.getElementById('roomInfo');
        const roomActions = document.getElementById('roomActions');
        const roomName = document.getElementById('roomName');
        const roomIdDisplay = document.getElementById('roomIdDisplay');
        
        if (roomInfo && roomActions && roomName && roomIdDisplay) {
            roomInfo.style.display = 'block';
            roomActions.style.display = 'none';
            roomName.textContent = roomData.name;
            roomIdDisplay.textContent = `ID: ${roomData.roomId}`;
        }
    }
    
    /**
     * Get last local change timestamp
     */
    getLastLocalChangeTimestamp() {
        return this.lastLocalChange || 0;
    }
    
    /**
     * Disconnect from collaboration
     */
    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
        
        this.isConnected = false;
        this.roomId = null;
        this.collaborators.clear();
        this.cursors.clear();
    }
    
    /**
     * Get collaboration status
     */
    getStatus() {
        return {
            isConnected: this.isConnected,
            roomId: this.roomId,
            isHost: this.isHost,
            collaboratorCount: this.collaborators.size,
            permissions: this.permissions
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CollaborationManager;
} else {
    window.CollaborationManager = CollaborationManager;
}