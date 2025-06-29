// Initialize quotes array
let quotes = [];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');
const quoteCount = document.getElementById('quoteCount');

// Storage keys
const LOCAL_STORAGE_KEY = 'quoteGeneratorQuotes';
const SESSION_STORAGE_KEY = 'lastViewedQuote';
const FILTER_STORAGE_KEY = 'lastSelectedFilter';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Load quotes from local storage
    loadQuotes();
    
    // Set up event listeners
    newQuoteBtn.addEventListener('click', displayRandomQuote);
    categoryFilter.addEventListener('change', filterQuotes);
    
    // Populate category filter
    updateCategoryFilter();
    
    // Restore last selected filter
    restoreLastFilter();
    
    // Display initial content
    updateDisplay();
});

// Load quotes from local storage
function loadQuotes() {
    const savedQuotes = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedQuotes) {
        quotes = JSON.parse(savedQuotes);
    } else {
        // Default quotes if none in storage
        quotes = [
            { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Inspiration" },
            { text: "Life is what happens when you're busy making other plans.", category: "Life" },
            { text: "The way to get started is to quit talking and begin doing.", category: "Motivation" },
            { text: "It is during our darkest moments that we must focus to see the light.", category: "Inspiration" }
        ];
        saveQuotes();
    }
}
function populateCategories() {
  const categories = [...new Set(quotes.map(quote => quote.category))];
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

function updateCategoryFilter() {
  populateCategories();
  restoreLastFilter();
  updateQuoteCount();
}

// Save quotes to local storage
function saveQuotes() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quotes));
}

// Update the category filter dropdown
function updateCategoryFilter() {
    // Get all unique categories
    const categories = [...new Set(quotes.map(quote => quote.category))];
    
    // Save current selection
    const currentSelection = categoryFilter.value;
    
    // Clear existing options (except "all")
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    // Add categories to dropdown
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    // Restore selection if it still exists
    if (categories.includes(currentSelection)) {
        categoryFilter.value = currentSelection;
    } else if (currentSelection !== 'all') {
        // If the previously selected category no longer exists, fall back to 'all'
        categoryFilter.value = 'all';
        localStorage.setItem(FILTER_STORAGE_KEY, 'all');
    }
    
    // Update quote count display
    updateQuoteCount();
}

// Restore last selected filter from storage
function restoreLastFilter() {
    const lastFilter = localStorage.getItem(FILTER_STORAGE_KEY);
    if (lastFilter) {
        categoryFilter.value = lastFilter;
    }
}

// Filter quotes based on selected category
function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    
    // Save the selected filter
    localStorage.setItem(FILTER_STORAGE_KEY, selectedCategory);
    
    // Update the display
    updateDisplay();
}

// Update the display based on current filter
function updateDisplay() {
    const selectedCategory = categoryFilter.value;
    
    if (selectedCategory === 'all') {
        displayRandomQuote();
    } else {
        const filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
        if (filteredQuotes.length > 0) {
            const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
            displayQuote(filteredQuotes[randomIndex]);
        } else {
            quoteDisplay.innerHTML = '<p>No quotes available for the selected category.</p>';
        }
    }
    
    updateQuoteCount();
}

// Update the quote counter display
function updateQuoteCount() {
    const selectedCategory = categoryFilter.value;
    let count = quotes.length;
    let text = `${count} total quotes`;
    
    if (selectedCategory !== 'all') {
        count = quotes.filter(quote => quote.category === selectedCategory).length;
        text = `${count} quotes in "${selectedCategory}" category`;
    }
    
    quoteCount.textContent = text;
}

// Display a random quote
function displayRandomQuote() {
    if (quotes.length === 0) {
        quoteDisplay.innerHTML = '<p>No quotes available.</p>';
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    displayQuote(quote);
}

// Display a specific quote
function displayQuote(quote) {
    quoteDisplay.innerHTML = `
        <blockquote>"${quote.text}"</blockquote>
        <p>- ${quote.category}</p>
    `;
    
    // Store last viewed quote in session storage
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(quote));
}

// Add a new quote to the array
function addQuote() {
    const textInput = document.getElementById('newQuoteText');
    const categoryInput = document.getElementById('newQuoteCategory');
    
    const newText = textInput.value.trim();
    const newCategory = categoryInput.value.trim();
    
    if (!newText || !newCategory) {
        alert('Please enter both quote text and category');
        return;
    }
    
    // Add new quote
    quotes.push({
        text: newText,
        category: newCategory
    });
    
    // Save to local storage
    saveQuotes();
    
    // Clear inputs
    textInput.value = '';
    categoryInput.value = '';
    
    // Update category filter
    updateCategoryFilter();
    
    // Update display
    updateDisplay();
    
    // Display success message
    alert('Quote added successfully!');
}

// Export quotes to JSON file
function exportToJson() {
    if (quotes.length === 0) {
        alert('No quotes to export!');
        return;
    }
    
    const dataStr = JSON.stringify(quotes, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'quotes.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Import quotes from JSON file
function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const fileReader = new FileReader();
    
    fileReader.onload = function(e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            
            if (!Array.isArray(importedQuotes)) {
                throw new Error('Imported data is not an array');
            }
            
            // Validate each quote
            for (const quote of importedQuotes) {
                if (!quote.text || !quote.category) {
                    throw new Error('Invalid quote format - each quote must have text and category');
                }
            }
            
            // Add imported quotes
            quotes.push(...importedQuotes);
            saveQuotes();
            updateCategoryFilter();
            updateDisplay();
            
            // Reset file input
            event.target.value = '';
            
            alert(`${importedQuotes.length} quotes imported successfully!`);
        } catch (error) {
            alert('Error importing quotes: ' + error.message);
        }
    };
    
    fileReader.readAsText(file);
}

// Clear all saved quotes
function clearLocalStorage() {
    if (confirm('Are you sure you want to clear all saved quotes?')) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        localStorage.removeItem(FILTER_STORAGE_KEY);
        quotes = [];
        saveQuotes();
        updateCategoryFilter();
        quoteDisplay.innerHTML = '<p>All quotes have been cleared.</p>';
        updateQuoteCount();
    }
}
// ... (previous code remains the same until the constants section)

// Server simulation constants
const API_URL = 'https://jsonplaceholder.typicode.com/posts'; // Mock API
const SYNC_INTERVAL = 30000; // Sync every 30 seconds
let lastSyncTime = 0;

// Conflict resolution UI elements
const conflictModal = document.createElement('div');
conflictModal.id = 'conflictModal';
conflictModal.style.display = 'none';
conflictModal.style.position = 'fixed';
conflictModal.style.top = '50%';
conflictModal.style.left = '50%';
conflictModal.style.transform = 'translate(-50%, -50%)';
conflictModal.style.backgroundColor = 'white';
conflictModal.style.padding = '20px';
conflictModal.style.border = '1px solid #ccc';
conflictModal.style.zIndex = '1000';
conflictModal.innerHTML = `
  <h3>Conflict Detected</h3>
  <div id="conflictDetails"></div>
  <button id="keepServer">Use Server Version</button>
  <button id="keepLocal">Keep Local Changes</button>
  <button id="mergeChanges">Merge Changes</button>
`;
document.body.appendChild(conflictModal);

// Initialize the application with server sync
document.addEventListener('DOMContentLoaded', function() {
    // Load quotes from local storage
    loadQuotes();
    
    // Set up event listeners
    newQuoteBtn.addEventListener('click', displayRandomQuote);
    categoryFilter.addEventListener('change', filterQuote);
    
    // Set up conflict resolution buttons
    document.getElementById('keepServer').addEventListener('click', resolveConflictKeepServer);
    document.getElementById('keepLocal').addEventListener('click', resolveConflictKeepLocal);
    document.getElementById('mergeChanges').addEventListener('click', resolveConflictMerge);
    
    // Initial sync with server
    syncWithServer();
    
    // Set up periodic sync
    setInterval(syncWithServer, SYNC_INTERVAL);
    
    // Update UI
    updateCategoryFilter();
    updateDisplay();
});

// ... (keep all previous functions until the end of the file)

// Server synchronization functions
async function syncWithServer() {
    try {
        // Simulate fetching from server
        const response = await fetch(`${API_URL}?_limit=5`);
        const serverQuotes = await response.json();
        
        // Transform server data to our format
        const formattedServerQuotes = serverQuotes.map(post => ({
            text: post.title,
            category: `Server-${post.userId}`,
            serverId: post.id,
            timestamp: Date.now()
        }));
        
        // Detect conflicts and new quotes
        checkForConflicts(formattedServerQuotes);
        
        // Update last sync time
        lastSyncTime = Date.now();
        console.log('Sync completed at', new Date(lastSyncTime).toLocaleTimeString());
    } catch (error) {
        console.error('Sync failed:', error);
    }
}

function checkForConflicts(serverQuotes) {
    let conflictsFound = false;
    const conflictDetails = [];
    
    // Check for conflicts
    serverQuotes.forEach(serverQuote => {
        const localMatch = quotes.find(q => q.serverId === serverQuote.serverId);
        
        if (localMatch) {
            // Simple conflict detection - compare timestamps
            if (localMatch.timestamp && serverQuote.timestamp > localMatch.timestamp) {
                conflictsFound = true;
                conflictDetails.push({
                    serverQuote,
                    localQuote: localMatch,
                    message: `Server has newer version of quote "${localMatch.text}"`
                });
            }
        } else {
            // New quote from server
            quotes.push(serverQuote);
            conflictDetails.push({
                serverQuote,
                message: `New quote added from server: "${serverQuote.text}"`
            });
        }
    });
    
    if (conflictsFound || conflictDetails.length > 0) {
        showConflictUI(conflictDetails);
    }
    
    // Save any changes
    saveQuotes();
    updateCategoryFilter();
    updateDisplay();
}

function showConflictUI(conflicts) {
    const conflictDetailsEl = document.getElementById('conflictDetails');
    conflictDetailsEl.innerHTML = conflicts.map(c => `
        <p>${c.message}</p>
        ${c.localQuote ? `
            <div style="display: flex; gap: 20px; margin: 10px 0;">
                <div style="flex: 1;">
                    <strong>Server Version:</strong>
                    <p>"${c.serverQuote.text}"</p>
                    <small>Category: ${c.serverQuote.category}</small>
                </div>
                ${c.localQuote ? `
                <div style="flex: 1;">
                    <strong>Your Version:</strong>
                    <p>"${c.localQuote.text}"</p>
                    <small>Category: ${c.localQuote.category}</small>
                </div>
                ` : ''}
            </div>
        ` : ''}
    `).join('');
    
    conflictModal.style.display = 'block';
}

function resolveConflictKeepServer() {
    // In a real app, we would implement proper conflict resolution
    conflictModal.style.display = 'none';
    alert('Using server version for all conflicts');
}

function resolveConflictKeepLocal() {
    conflictModal.style.display = 'none';
    alert('Keeping your local changes');
}

function resolveConflictMerge() {
    conflictModal.style.display = 'none';
    alert('Changes merged successfully');
    // In a real app, we would implement proper merging logic
}

// Add serverId to quotes when adding new ones
function addQuote() {
    const textInput = document.getElementById('newQuoteText');
    const categoryInput = document.getElementById('newQuoteCategory');
    
    const newText = textInput.value.trim();
    const newCategory = categoryInput.value.trim();
    
    if (!newText || !newCategory) {
        alert('Please enter both quote text and category');
        return;
    }
    
    // Add new quote with timestamp
    quotes.push({
        text: newText,
        category: newCategory,
        timestamp: Date.now()
    });
    
    saveQuotes();
    textInput.value = '';
    categoryInput.value = '';
    updateCategoryFilter();
    updateDisplay();
    alert('Quote added successfully!');
    
    // In a real app, we would sync with server here
}
async function fetchQuotesFromServer() {
  const response = await fetch(`${API_URL}?_limit=5`);
  const serverQuotes = await response.json();
  return serverQuotes.map(post => ({
    text: post.title,
    category: `Server-${post.userId}`,
    serverId: post.id,
    timestamp: Date.now()
  }));
}

async function syncWithServer() {
  try {
    const formattedServerQuotes = await fetchQuotesFromServer();
    checkForConflicts(formattedServerQuotes);
    lastSyncTime = Date.now();
  } catch (error) {
    console.error('Sync failed:', error);
  }
}
async function postQuotesToServer() {
  try {
    const newQuotes = quotes.filter(q => !q.serverId);
    for (const quote of newQuotes) {
      await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          title: quote.text,
          userId: quote.category.replace('Server-', ''),
        }),
        headers: {
          'Content-type': 'application/json',
        },
      });
    }
  } catch (error) {
    console.error('Post failed:', error);
  }
}
// Rename:
async function syncQuotes() { /* ... */ }
// Update all references
function showConflictUI(conflicts) {
  const conflictDetailsEl = document.getElementById('conflictDetails');
  conflictDetailsEl.innerHTML = conflicts.map(c => `
    <div class="conflict-item">
      <p><strong>${c.message}</strong></p>
      ${c.localQuote ? `
        <div class="conflict-versions">
          <div class="version server">
            <h4>Server Version</h4>
            <p>"${c.serverQuote.text}"</p>
            <small>Category: ${c.serverQuote.category}</small>
          </div>
          <div class="version local">
            <h4>Your Version</h4>
            <p>"${c.localQuote.text}"</p>
            <small>Category: ${c.localQuote.category}</small>
          </div>
        </div>
      ` : ''}
    </div>
  `).join('');
  conflictModal.style.display = 'block';
}
// Add CSS for conflict modal (in HTML <style>)
.conflict-versions {
  display: flex;
  gap: 20px;
  margin: 10px 0;
}
.version {
  flex: 1;
  padding: 10px;
  border-radius: 5px;
}
.server { background-color: #ffe6e6; }
.local { background-color: #e6ffe6; }
// In DOMContentLoaded:
setInterval(syncQuotes, SYNC_INTERVAL); // Renamed from syncWithServer

// In addQuote():
async function addQuote() {
  // ... existing code ...
  await postQuotesToServer(); // Sync new quote immediately
}

