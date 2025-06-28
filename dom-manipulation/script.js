// Initialize quotes array with sample data
const quotes = [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Inspiration" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "The way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "It is during our darkest moments that we must focus to see the light.", category: "Inspiration" }
];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners
    newQuoteBtn.addEventListener('click', displayRandomQuote);
    
    // Populate category filter
    updateCategoryFilter();
    
    // Display initial random quote
    displayRandomQuote();
});

// Display a random quote
function displayRandomQuote() {
    const selectedCategory = categoryFilter.value;
    let filteredQuotes = quotes;
    
    // Filter quotes by category if not "all"
    if (selectedCategory !== 'all') {
        filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
    }
    
    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = '<p>No quotes available for the selected category.</p>';
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[randomIndex];
    
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
