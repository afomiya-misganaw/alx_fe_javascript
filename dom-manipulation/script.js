
const quotes = [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Inspiration" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

document.getElementById('newQuote').addEventListener('click', showRandomQuote);

function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    document.getElementById('quoteDisplay').innerHTML = `
        <blockquote>${quote.text}</blockquote>
        <p>— ${quote.category}</p>
    `;
}

function createAddQuoteForm() {
    // Implementation to create form dynamically
}

function addQuote() {
    // Implementation to add new quote from form inputs
}
