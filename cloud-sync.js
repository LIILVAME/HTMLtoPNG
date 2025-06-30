/**
 * Cloud Sync Manager for HTML to PNG Converter
 * Handles synchronization of user data across devices
 * Version 2.0.0
 */

class CloudSyncManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.syncQueue = [];
        this.lastSyncTime = localStorage.getItem('lastSyncTime') || 0;
        this.syncInProgress = false;
        this.conflictResolutionStrategy = 'latest'; // 'latest', 'manual', 'merge'
        this.syncEndpoint = '/api/sync';
        this.userId = null;
        this.deviceId = this.generateDeviceId();
        
        // Initialize event listeners
        this.initializeEventListeners();
        
        // Initialize IndexedDB for offline storage
        this.initializeDatabase();
    }
    
    /**
     * Initialize the cloud sync manager
     */
    async init() {
        console.log('🔄 Initializing Cloud Sync Manager...');
        
        try {
            // Check authentication status
            await this.checkAuthStatus();
            
            // Setup periodic sync
            this.setupPeriodicSync();
            
            // Process any pending sync operations
            await this.processSyncQueue();
            
            console.log('✅ Cloud Sync Manager initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Cloud Sync Manager:', error);
        }
    }
    
    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        // Network status changes
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.onConnectionRestored();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.onConnectionLost();
        });
        
        // Page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isOnline) {
                this.triggerSync();
            }
        });
        
        // Before page unload
        window.addEventListener('beforeunload', () => {
            this.flushSyncQueue();
        });
    }
    
    /**
     * Initialize IndexedDB for offline storage
     */
    async initializeDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('CloudSyncDB', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores
                if (!db.objectStoreNames.contains('syncQueue')) {
                    const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
                    syncStore.createIndex('timestamp', 'timestamp');
                    syncStore.createIndex('type', 'type');
                }
                
                if (!db.objectStoreNames.contains('conflicts')) {
                    const conflictStore = db.createObjectStore('conflicts', { keyPath: 'id', autoIncrement: true });
                    conflictStore.createIndex('timestamp', 'timestamp');
                }
                
                if (!db.objectStoreNames.contains('metadata')) {
                    db.createObjectStore('metadata', { keyPath: 'key' });
                }
            };
        });
    }
    
    /**
     * Check authentication status
     */
    async checkAuthStatus() {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const response = await fetch('/api/auth/verify', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const userData = await response.json();
                    this.userId = userData.userId;
                    return true;
                }
            } catch (error) {
                console.log('Auth verification failed:', error);
            }
        }
        
        this.userId = null;
        return false;
    }
    
    /**
     * Sync data to cloud
     */
    async syncToCloud(data, type) {
        if (!this.userId) {
            console.log('User not authenticated, skipping cloud sync');
            return;
        }
        
        const syncItem = {
            id: Date.now() + Math.random(),
            type: type,
            data: data,
            timestamp: Date.now(),
            deviceId: this.deviceId,
            userId: this.userId,
            action: 'upload'
        };
        
        if (this.isOnline && !this.syncInProgress) {
            try {
                await this.uploadToCloud(syncItem);
            } catch (error) {
                console.error('Failed to sync to cloud:', error);
                this.addToSyncQueue(syncItem);
            }
        } else {
            this.addToSyncQueue(syncItem);
        }
    }
    
    /**
     * Sync data from cloud
     */
    async syncFromCloud(type = null) {
        if (!this.userId || !this.isOnline) {
            return null;
        }
        
        try {
            const url = type ? `${this.syncEndpoint}/${type}` : this.syncEndpoint;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'X-Device-ID': this.deviceId,
                    'X-Last-Sync': this.lastSyncTime
                }
            });
            
            if (response.ok) {
                const cloudData = await response.json();
                await this.processCloudData(cloudData);
                this.lastSyncTime = Date.now();
                localStorage.setItem('lastSyncTime', this.lastSyncTime);
                return cloudData;
            }
        } catch (error) {
            console.error('Failed to sync from cloud:', error);
        }
        
        return null;
    }
    
    /**
     * Upload data to cloud
     */
    async uploadToCloud(syncItem) {
        const response = await fetch(this.syncEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'X-Device-ID': this.deviceId
            },
            body: JSON.stringify(syncItem)
        });
        
        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        // Handle conflicts
        if (result.conflict) {
            await this.handleConflict(syncItem, result.conflictData);
        }
        
        return result;
    }
    
    /**
     * Process cloud data
     */
    async processCloudData(cloudData) {
        for (const item of cloudData.items || []) {
            try {
                await this.applyCloudChange(item);
            } catch (error) {
                console.error('Failed to apply cloud change:', error);
            }
        }
    }
    
    /**
     * Apply cloud change to local data
     */
    async applyCloudChange(item) {
        const { type, data, timestamp, deviceId } = item;
        
        // Skip changes from this device
        if (deviceId === this.deviceId) {
            return;
        }
        
        switch (type) {
            case 'conversion':
                await this.applyConversionChange(data, timestamp);
                break;
            case 'template':
                await this.applyTemplateChange(data, timestamp);
                break;
            case 'history':
                await this.applyHistoryChange(data, timestamp);
                break;
            case 'settings':
                await this.applySettingsChange(data, timestamp);
                break;
            default:
                console.warn('Unknown sync type:', type);
        }
    }
    
    /**
     * Apply conversion change
     */
    async applyConversionChange(data, timestamp) {
        if (window.htmlToPngConverter && window.htmlToPngConverter.historyManager) {
            const existing = window.htmlToPngConverter.historyManager.getConversion(data.id);
            
            if (!existing || existing.timestamp < timestamp) {
                window.htmlToPngConverter.historyManager.addConversion(data, false); // Don't trigger sync
            }
        }
    }
    
    /**
     * Apply template change
     */
    async applyTemplateChange(data, timestamp) {
        if (window.htmlToPngConverter && window.htmlToPngConverter.templateManager) {
            const existing = window.htmlToPngConverter.templateManager.getTemplate(data.id);
            
            if (!existing || existing.timestamp < timestamp) {
                window.htmlToPngConverter.templateManager.saveTemplate(data, false); // Don't trigger sync
            }
        }
    }
    
    /**
     * Apply history change
     */
    async applyHistoryChange(data, timestamp) {
        // Handle history-specific changes
        console.log('Applying history change:', data);
    }
    
    /**
     * Apply settings change
     */
    async applySettingsChange(data, timestamp) {
        const currentSettings = JSON.parse(localStorage.getItem('appSettings') || '{}');
        const currentTimestamp = currentSettings.timestamp || 0;
        
        if (timestamp > currentTimestamp) {
            localStorage.setItem('appSettings', JSON.stringify({
                ...data,
                timestamp: timestamp
            }));
            
            // Apply settings to UI
            this.applySettingsToUI(data);
        }
    }
    
    /**
     * Handle sync conflicts
     */
    async handleConflict(localItem, cloudItem) {
        console.log('Conflict detected:', { local: localItem, cloud: cloudItem });
        
        switch (this.conflictResolutionStrategy) {
            case 'latest':
                return localItem.timestamp > cloudItem.timestamp ? localItem : cloudItem;
            
            case 'manual':
                await this.storeConflictForResolution(localItem, cloudItem);
                this.showConflictNotification();
                return null;
            
            case 'merge':
                return await this.mergeConflictingItems(localItem, cloudItem);
            
            default:
                return cloudItem; // Default to cloud version
        }
    }
    
    /**
     * Store conflict for manual resolution
     */
    async storeConflictForResolution(localItem, cloudItem) {
        const transaction = this.db.transaction(['conflicts'], 'readwrite');
        const store = transaction.objectStore('conflicts');
        
        await store.add({
            localItem: localItem,
            cloudItem: cloudItem,
            timestamp: Date.now(),
            resolved: false
        });
    }
    
    /**
     * Add item to sync queue
     */
    async addToSyncQueue(item) {
        this.syncQueue.push(item);
        
        // Also store in IndexedDB for persistence
        if (this.db) {
            const transaction = this.db.transaction(['syncQueue'], 'readwrite');
            const store = transaction.objectStore('syncQueue');
            await store.add(item);
        }
    }
    
    /**
     * Process sync queue
     */
    async processSyncQueue() {
        if (!this.isOnline || this.syncInProgress || this.syncQueue.length === 0) {
            return;
        }
        
        this.syncInProgress = true;
        
        try {
            const itemsToSync = [...this.syncQueue];
            this.syncQueue = [];
            
            for (const item of itemsToSync) {
                try {
                    await this.uploadToCloud(item);
                } catch (error) {
                    console.error('Failed to sync item:', error);
                    this.syncQueue.push(item); // Re-add to queue
                }
            }
        } finally {
            this.syncInProgress = false;
        }
    }
    
    /**
     * Trigger manual sync
     */
    async triggerSync() {
        if (!this.isOnline || !this.userId) {
            return false;
        }
        
        try {
            // Sync from cloud first
            await this.syncFromCloud();
            
            // Then process local queue
            await this.processSyncQueue();
            
            this.showSyncSuccessNotification();
            return true;
        } catch (error) {
            console.error('Manual sync failed:', error);
            this.showSyncErrorNotification(error.message);
            return false;
        }
    }
    
    /**
     * Setup periodic sync
     */
    setupPeriodicSync() {
        // Sync every 5 minutes when online
        setInterval(() => {
            if (this.isOnline && this.userId) {
                this.triggerSync();
            }
        }, 5 * 60 * 1000);
    }
    
    /**
     * Handle connection restored
     */
    async onConnectionRestored() {
        console.log('🌐 Connection restored, triggering sync...');
        await this.triggerSync();
    }
    
    /**
     * Handle connection lost
     */
    onConnectionLost() {
        console.log('📴 Connection lost, switching to offline mode...');
    }
    
    /**
     * Flush sync queue (called before page unload)
     */
    async flushSyncQueue() {
        if (this.syncQueue.length > 0 && this.isOnline) {
            // Use sendBeacon for reliable delivery
            const data = JSON.stringify({
                items: this.syncQueue,
                deviceId: this.deviceId,
                userId: this.userId
            });
            
            navigator.sendBeacon(this.syncEndpoint + '/batch', data);
        }
    }
    
    /**
     * Generate unique device ID
     */
    generateDeviceId() {
        let deviceId = localStorage.getItem('deviceId');
        
        if (!deviceId) {
            deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('deviceId', deviceId);
        }
        
        return deviceId;
    }
    
    /**
     * Show sync success notification
     */
    showSyncSuccessNotification() {
        if (window.htmlToPngConverter && window.htmlToPngConverter.showToast) {
            window.htmlToPngConverter.showToast('Données synchronisées avec succès', 'success');
        }
    }
    
    /**
     * Show sync error notification
     */
    showSyncErrorNotification(message) {
        if (window.htmlToPngConverter && window.htmlToPngConverter.showToast) {
            window.htmlToPngConverter.showToast(`Erreur de synchronisation: ${message}`, 'error');
        }
    }
    
    /**
     * Show conflict notification
     */
    showConflictNotification() {
        if (window.htmlToPngConverter && window.htmlToPngConverter.showToast) {
            window.htmlToPngConverter.showToast('Conflit de synchronisation détecté', 'warning');
        }
    }
    
    /**
     * Apply settings to UI
     */
    applySettingsToUI(settings) {
        // Apply theme
        if (settings.theme) {
            document.documentElement.setAttribute('data-theme', settings.theme);
        }
        
        // Apply language
        if (settings.language && window.changeLanguage) {
            window.changeLanguage(settings.language);
        }
        
        // Apply other settings
        Object.keys(settings).forEach(key => {
            const element = document.getElementById(key);
            if (element && settings[key] !== undefined) {
                if (element.type === 'checkbox') {
                    element.checked = settings[key];
                } else {
                    element.value = settings[key];
                }
            }
        });
    }
    
    /**
     * Get sync status
     */
    getSyncStatus() {
        return {
            isOnline: this.isOnline,
            isAuthenticated: !!this.userId,
            syncInProgress: this.syncInProgress,
            queueLength: this.syncQueue.length,
            lastSyncTime: this.lastSyncTime,
            deviceId: this.deviceId
        };
    }
    
    /**
     * Clear all sync data
     */
    async clearSyncData() {
        // Clear sync queue
        this.syncQueue = [];
        
        // Clear IndexedDB
        if (this.db) {
            const transaction = this.db.transaction(['syncQueue', 'conflicts', 'metadata'], 'readwrite');
            await transaction.objectStore('syncQueue').clear();
            await transaction.objectStore('conflicts').clear();
            await transaction.objectStore('metadata').clear();
        }
        
        // Clear localStorage
        localStorage.removeItem('lastSyncTime');
        localStorage.removeItem('deviceId');
        
        console.log('Sync data cleared');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CloudSyncManager;
} else {
    window.CloudSyncManager = CloudSyncManager;
}