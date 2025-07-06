let quotes = [];

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  populateCategories();
  restoreFilter();
  attachListeners();

  // Restore last quote if available
  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    document.getElementById("quoteDisplay").innerHTML = lastQuote;
  }
});

function attachListeners() {
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
  document.getElementById("exportBtn").addEventListener("click", exportToJson);
  document.getElementById("importFile").addEventListener("change", importFromJsonFile);
}

function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) {
    quotes = JSON.parse(stored);
  } else {
    quotes = [
      { text: "Be yourself; everyone else is already taken.", category: "Inspiration" },
      { text: "Do or do not. There is no try.", category: "Motivation" }
    ];
    saveQuotes();
  }
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function showRandomQuote() {
  const category = document.getElementById("categoryFilter").value;
  const filtered = (category === "all") ? quotes : quotes.filter(q => q.category === category);

  if (filtered.length === 0) {
    document.getElementById("quoteDisplay").innerHTML = "<p>No quotes found in this category.</p>";
    return;
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  const html = `<p>"${random.text}"</p><small>Category: ${random.category}</small>`;
  document.getElementById("quoteDisplay").innerHTML = html;

  sessionStorage.setItem("lastQuote", html);
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both quote and category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories(); // Ensure category dropdown updates
  showRandomQuote();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  const select = document.getElementById("categoryFilter");

  // Clear existing options except "all"
  select.innerHTML = `<option value="all">All Categories</option>`;

  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });

  // Restore selection
  const lastFilter = localStorage.getItem("selectedCategory");
  if (lastFilter && categories.includes(lastFilter)) {
    select.value = lastFilter;
  }
}

function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selected);
  showRandomQuote();
}

function restoreFilter() {
  const lastFilter = localStorage.getItem("selectedCategory");
  if (lastFilter) {
    const dropdown = document.getElementById("categoryFilter");
    dropdown.value = lastFilter;
  }
}

function exportToJson() {
  const data = JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
        showRandomQuote();
      } else {
        alert("Invalid JSON format.");
      }
    } catch {
      alert("Failed to read JSON.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}
