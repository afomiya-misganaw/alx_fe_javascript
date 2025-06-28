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

