let quotes = JSON.parse(localStorage.getItem('quotes') || '[]');

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const categoryFilter = document.getElementById('categoryFilter');
const newQuoteBtn = document.getElementById('newQuote');

document.addEventListener('DOMContentLoaded', () => {
  loadQuotes();
  populateCategories();
  filterQuotes();
  newQuoteBtn.addEventListener('click', showRandomQuote);
  setInterval(syncWithServer, 15000); // sync every 15 seconds
});

function loadQuotes() {
  const saved = localStorage.getItem('quotes');
  if (saved) {
    quotes = JSON.parse(saved);
  }
}

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  const filtered = selectedCategory === 'all' ? quotes : quotes.filter(q => q.category === selectedCategory);
  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = random ? `"${random.text}" (${random.category})` : 'No quotes available';
  sessionStorage.setItem('lastQuote', JSON.stringify(random));
}

function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();
  if (!text || !category) return alert('Please fill both fields.');

  const newQ = { text, category };
  quotes.push(newQ);
  saveQuotes();
  populateCategories();
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
  alert('Quote added!');
}

function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });

  const lastFilter = localStorage.getItem('lastCategory');
  if (lastFilter) {
    categoryFilter.value = lastFilter;
  }
}

function filterQuotes() {
  localStorage.setItem('lastCategory', categoryFilter.value);
  showRandomQuote();
}

// Export
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    const imported = JSON.parse(e.target.result);
    quotes.push(...imported);
    saveQuotes();
    populateCategories();
    alert('Quotes imported!');
  };
  fileReader.readAsText(event.target.files[0]);
}

// Simulated Server Sync
function fetchServerQuotes() {
  return new Promise(resolve => {
    setTimeout(() => {
      const serverQuotes = [
        { text: "Do what you can, with what you have, where you are.", category: "Motivation" },
        { text: "A journey of a thousand miles begins with a single step.", category: "Wisdom" }
      ];
      resolve(serverQuotes);
    }, 1000);
  });
}

async function syncWithServer() {
  const serverQuotes = await fetchServerQuotes();
  const localQuotes = JSON.parse(localStorage.getItem("quotes") || "[]");
  let updated = false;

  serverQuotes.forEach(sq => {
    const exists = localQuotes.some(lq => lq.text === sq.text && lq.category === sq.category);
    if (!exists) {
      quotes.push(sq);
      updated = true;
    }
  });

  if (updated) {
    saveQuotes();
    populateCategories();
    displayConflictNotification();
    showRandomQuote();
  }
}

function displayConflictNotification() {
  const notif = document.createElement("div");
  notif.textContent = "Quotes synced from server.";
  notif.style.background = "#f9c74f";
  notif.style.padding = "10px";
  notif.style.margin = "10px 0";
  notif.style.fontWeight = "bold";
  document.body.insertBefore(notif, document.body.firstChild);
  setTimeout(() => notif.remove(), 4000);
}
