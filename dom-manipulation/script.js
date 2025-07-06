let quotes = JSON.parse(localStorage.getItem('quotes') || '[]');

const quoteDisplay = document.getElementById('quoteDisplay');
const categoryFilter = document.getElementById('categoryFilter');
const newQuoteBtn = document.getElementById('newQuote');

// Called on page load
document.addEventListener('DOMContentLoaded', () => {
  loadQuotes();
  populateCategories();
  filterQuotes();
  newQuoteBtn.addEventListener('click', showRandomQuote);
  setInterval(syncQuotes, 15000); // every 15s
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

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  postQuoteToServer(newQuote);
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

function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const imported = JSON.parse(e.target.result);
    quotes.push(...imported);
    saveQuotes();
    populateCategories();
    alert('Quotes imported!');
  };
  reader.readAsText(event.target.files[0]);
}

// ✅ Required: Use fetch to simulate server fetch
async function fetchQuotesFromServer() {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts');
  const data = await response.json();
  // Only simulate a few fake quotes from the server
  return data.slice(0, 3).map(item => ({
    text: item.title,
    category: 'Server'
  }));
}

// ✅ Required: Use fetch POST to mock quote sync
function postQuoteToServer(quote) {
  fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    body: JSON.stringify(quote),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .then(() => console.log('Quote posted to server'))
    .catch(err => console.error('Post failed', err));
}

// ✅ Required: Periodically check for updates from server and resolve conflicts
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  let updated = false;

  serverQuotes.forEach(sq => {
    const exists = quotes.some(lq => lq.text === sq.text && lq.category === sq.category);
    if (!exists) {
      quotes.push(sq);
      updated = true;
    }
  });

  if (updated) {
    saveQuotes();
    populateCategories();
    notifyUser("Quotes updated from server.");
  }
}

// ✅ UI Notification
function notifyUser(message) {
  const notif = document.createElement('div');
  notif.textContent = message;
  notif.style.background = "#90ee90";
  notif.style.padding = "10px";
  notif.style.fontWeight = "bold";
  document.body.insertBefore(notif, document.body.firstChild);
  setTimeout(() => notif.remove(), 3000);
}
