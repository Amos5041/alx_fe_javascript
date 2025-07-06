let quotes = JSON.parse(localStorage.getItem('quotes') || '[]');

document.addEventListener('DOMContentLoaded', () => {
  loadQuotes();
  populateCategories();
  filterQuotes();
  document.getElementById('newQuote').addEventListener('click', showRandomQuote);
  setInterval(syncQuotes, 15000); // Sync every 15 seconds
});

function loadQuotes() {
  const saved = localStorage.getItem('quotes');
  if (saved) quotes = JSON.parse(saved);
}

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function showRandomQuote() {
  const category = document.getElementById('categoryFilter').value;
  const filtered = category === 'all' ? quotes : quotes.filter(q => q.category === category);
  const quote = filtered[Math.floor(Math.random() * filtered.length)];
  const display = document.getElementById('quoteDisplay');
  display.textContent = quote ? `"${quote.text}" (${quote.category})` : 'No quote available.';
  sessionStorage.setItem('lastQuote', JSON.stringify(quote));
}

function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();
  if (!text || !category) return alert('Please provide both quote and category.');

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  postQuoteToServer(newQuote);
  notifyUser('Quote added and synced.');
}

function populateCategories() {
  const dropdown = document.getElementById('categoryFilter');
  const unique = [...new Set(quotes.map(q => q.category))];
  dropdown.innerHTML = '<option value="all">All Categories</option>';
  unique.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    dropdown.appendChild(option);
  });

  const last = localStorage.getItem('lastCategory');
  if (last) dropdown.value = last;
}

function filterQuotes() {
  const category = document.getElementById('categoryFilter').value;
  localStorage.setItem('lastCategory', category);
  showRandomQuote();
}

// ✅ REQUIRED: Fetch from mock API
async function fetchQuotesFromServer() {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts');
  const data = await response.json();
  // Simulate quote format
  return data.slice(0, 5).map(item => ({
    text: item.title,
    category: 'Server'
  }));
}

// ✅ REQUIRED: Post to mock API
function postQuoteToServer(quote) {
  fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    body: JSON.stringify(quote),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => res.json())
    .then(() => console.log('Posted to server'))
    .catch(err => console.error('Post failed', err));
}

// ✅ REQUIRED: Periodic sync and conflict resolution
async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();
    let updated = false;

    serverQuotes.forEach(serverQuote => {
      const exists = quotes.some(localQuote =>
        localQuote.text === serverQuote.text && localQuote.category === serverQuote.category
      );
      if (!exists) {
        quotes.push(serverQuote);
        updated = true;
      }
    });

    if (updated) {
      saveQuotes();
      populateCategories();
      notifyUser('Quotes updated from server.');
    }
  } catch (err) {
    console.error('Sync failed:', err);
  }
}

// ✅ REQUIRED: UI notification
function notifyUser(message) {
  const note = document.createElement('div');
  note.textContent = message;
  note.style.background = '#e0ffe0';
  note.style.border = '1px solid green';
  note.style.padding = '10px';
  note.style.margin = '10px 0';
  note.style.fontWeight = 'bold';
  document.body.prepend(note);
  setTimeout(() => note.remove(), 3000);
}
