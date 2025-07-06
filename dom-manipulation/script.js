// Declare the quotes array globally
let quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Life" },
  { text: "Creativity is intelligence having fun.", category: "Inspiration" }
];

// Function to display a random quote
function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");

  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available. Add some!";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  quoteDisplay.innerHTML = `<p>"${quote.text}"</p><small>— ${quote.category}</small>`;
}

// ✅ Function to add a new quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (text === "" || category === "") {
    alert("Please enter both a quote and a category.");
    return;
  }

  // ✅ Add new quote object to the array
  quotes.push({ text, category });

  // ✅ Clear input fields
  textInput.value = "";
  categoryInput.value = "";

  // ✅ Update DOM (optional: show the newly added quote)
  showRandomQuote();
}

// ✅ Add event listeners
document.addEventListener("DOMContentLoaded", () => {
  const showQuoteButton = document.getElementById("newQuote");
  const addQuoteButton = document.getElementById("addQuoteBtn");

  // ✅ Event listener for showing a random quote
  showQuoteButton.addEventListener("click", showRandomQuote);

  // ✅ Event listener for adding a new quote
  addQuoteButton.addEventListener("click", addQuote);
});
