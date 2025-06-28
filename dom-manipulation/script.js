// Initialize quotes array
let quotes = [];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');

// Storage keys
const LOCAL_STORAGE_KEY = 'quoteGeneratorQuotes';
const SESSION_STORAGE_KEY = 'lastViewedQuote';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Load quotes from local storage
    loadQuotes();
    
    // Set up event listeners
    newQuoteBtn.addEventListener('click', displayRandomQuote);
    
    // Populate category filter
    updateCategoryFilter();
    
    // Display initial random quote
    displayRandomQuote();
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
            { text: "Life is what happens when you're busy making other plans.", category: "Life" }
        ];
        saveQuotes();
    }
    
    // Check for last viewed quote in session storage
    const lastQuote = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (lastQuote) {
        const quote = JSON.parse(lastQuote);
        displayQuote(quote);
    }
}

// Save quotes to local storage
function saveQuotes() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quotes));
}

// Display a random quote
function displayRandomQuote() {
    const selectedCategory = categoryFilter.value;
    let filteredQuotes = quotes;
    
    if (selectedCategory !== 'all') {
        filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
    }
    
    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = '<p>No quotes available for the selected category.</p>';
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[randomIndex];
    
    displayQuote(quote);
    
    // Store last viewed quote in session storage
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(quote));
}

// Display a specific quote
function displayQuote(quote) {
    quoteDisplay.innerHTML = `
        <blockquote>"${quote.text}"</blockquote>
        <p>- ${quote.category}</p>
    `;
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
    
    // Display success message
    alert('Quote added successfully!');
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
    }
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
        quotes = [];
        saveQuotes();
        updateCategoryFilter();
        quoteDisplay.innerHTML = '<p>All quotes have been cleared.</p>';
    }
}
