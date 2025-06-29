// Dynamic Quote Generator with Server Sync and Conflict Resolution

// Configuration
const CONFIG = {
  serverUrl: 'https://jsonplaceholder.typicode.com/posts/1',
  syncInterval: 30000, // 30 seconds
  defaultQuotes: [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
    { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
    { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
    { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" }
  ]
};

// State management
class QuoteManager {
  constructor() {
    this.currentQuote = null;
    this.isEditing = false;
    this.lastSyncTime = null;
    this.pendingChanges = false;
    this.syncInterval = null;
  }

  // Initialize the application
  init() {
    this.loadLocalQuote();
    this.startSyncInterval();
    this.setupEventListeners();
  }

  // Quote management
  generateNewQuote() {
    this.currentQuote = CONFIG.defaultQuotes[
      Math.floor(Math.random() * CONFIG.defaultQuotes.length)
    ];
    this.pendingChanges = true;
    this.updateUI();
    this.saveLocalQuote();
  }

  toggleEditQuote() {
    if (this.isEditing) {
      const newText = prompt("Edit the quote text:", this.currentQuote.text);
      if (newText !== null) {
        this.currentQuote.text = newText;
        const newAuthor = prompt("Edit the author:", this.currentQuote.author);
        if (newAuthor !== null) {
          this.currentQuote.author = newAuthor;
          this.pendingChanges = true;
          this.saveLocalQuote();
          this.updateUI();
          this.showNotification("Quote edited locally");
        }
      }
      this.isEditing = false;
      document.getElementById('edit-quote').textContent = "Edit Current Quote";
    } else {
      this.isEditing = true;
      document.getElementById('edit-quote').textContent = "Save Edits";
    }
  }

  // Local storage operations
  saveLocalQuote() {
    if (this.currentQuote) {
      localStorage.setItem('currentQuote', JSON.stringify(this.currentQuote));
      localStorage.setItem('quoteLastModified', new Date().toISOString());
    }
  }

  loadLocalQuote() {
    const savedQuote = localStorage.getItem('currentQuote');
    if (savedQuote) {
      this.currentQuote = JSON.parse(savedQuote);
      this.updateUI();
    } else {
      this.generateNewQuote();
    }
  }

  // Server synchronization
  async syncWithServer() {
    try {
      this.showNotification("Syncing with server...");
      
      // Get server version
      const serverResponse = await fetch(CONFIG.serverUrl);
      const serverData = await serverResponse.json();
      
      // Simulate server response (mock implementation)
      const serverQuote = serverData.id === 1 ? { 
        text: serverData.title || "Default server quote text", 
        author: "Server Author",
        serverModified: new Date().toISOString()
      } : null;
      
      // Get local last modified time
      const localLastModified = localStorage.getItem('quoteLastModified');
      
      if (serverQuote) {
        // Check for conflicts
        if (this.pendingChanges && localLastModified && 
            new Date(localLastModified) > new Date(serverQuote.serverModified)) {
          this.showConflictDialog(serverQuote);
          return;
        }
        
        // No conflict or server has newer version
        if (!this.pendingChanges || (localLastModified && 
            new Date(localLastModified) < new Date(serverQuote.serverModified))) {
          this.currentQuote = {
            text: serverQuote.text,
            author: serverQuote.author
          };
          this.saveLocalQuote();
          this.showNotification("Quote updated from server");
        }
      }
      
      // Send local changes to server if any
      if (this.pendingChanges && this.currentQuote) {
        await fetch(CONFIG.serverUrl, {
          method: 'PUT',
          body: JSON.stringify({
            title: this.currentQuote.text,
            body: this.currentQuote.author,
            userId: 1,
          }),
          headers: {
            'Content-type': 'application/json; charset=UTF-8',
          },
        });
        
        this.pendingChanges = false;
        this.showNotification("Changes synced to server");
      }
      
      this.lastSyncTime = new Date();
      this.updateUI();
      
    } catch (error) {
      console.error("Sync failed:", error);
      this.showNotification("Sync failed", true);
    }
  }

  // Conflict resolution
  showConflictDialog(serverQuote) {
    document.getElementById('server-version').textContent = 
      `${serverQuote.text} — ${serverQuote.author}`;
    document.getElementById('local-version').textContent = 
      `${this.currentQuote.text} — ${this.currentQuote.author}`;
    document.getElementById('conflict-dialog').style.display = 'block';
  }

  resolveConflict(useServerVersion) {
    if (useServerVersion) {
      const serverText = document.getElementById('server-version').textContent.split(' — ')[0];
      const serverAuthor = document.getElementById('server-version').textContent.split(' — ')[1];
      this.currentQuote = {
        text: serverText,
        author: serverAuthor
      };
      this.showNotification("Used server version (your changes were discarded)");
    } else {
      this.showNotification("Keeping your version (will upload to server)");
    }
    
    this.pendingChanges = !useServerVersion;
    this.saveLocalQuote();
    this.updateUI();
    document.getElementById('conflict-dialog').style.display = 'none';
    
    // Continue with sync
    setTimeout(() => this.syncWithServer(), 0);
  }

  // UI updates
  updateUI() {
    if (this.currentQuote) {
      document.getElementById('quote-text').textContent = this.currentQuote.text;
      document.getElementById('quote-author').textContent = `— ${this.currentQuote.author}`;
    }
    
    if (this.lastSyncTime) {
      document.getElementById('sync-status').textContent = 
        `Last sync: ${this.lastSyncTime.toLocaleString()}`;
    }
  }

  showNotification(message, isError = false) {
    const notificationEl = document.getElementById('notification');
    notificationEl.textContent = message;
    notificationEl.style.backgroundColor = isError ? '#f44336' : '#4CAF50';
    notificationEl.style.display = 'block';
    
    setTimeout(() => {
      notificationEl.style.display = 'none';
    }, 3000);
  }

  // Utility functions
  startSyncInterval() {
    this.syncInterval = setInterval(
      () => this.syncWithServer(), 
      CONFIG.syncInterval
    );
  }

  setupEventListeners() {
    document.getElementById('new-quote').addEventListener('click', () => this.generateNewQuote());
    document.getElementById('edit-quote').addEventListener('click', () => this.toggleEditQuote());
    document.getElementById('sync-now').addEventListener('click', () => this.syncWithServer());
    document.getElementById('use-server').addEventListener('click', () => this.resolveConflict(true));
    document.getElementById('use-local').addEventListener('click', () => this.resolveConflict(false));
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const quoteApp = new QuoteManager();
  quoteApp.init();
});
