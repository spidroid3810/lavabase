const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const dbFile = './database.json';

// Load DB
function loadDB() {
  return JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
}

// Save DB
function saveDB(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

// GET
app.get('/data/:collection', (req, res) => {
  const db = loadDB();
  const { collection } = req.params;
  res.json(db[collection] || []);
});

// POST
app.post('/data/:collection', (req, res) => {
  const db = loadDB();
  const { collection } = req.params;
  const data = req.body;
  data.id = Date.now();

  if (!db[collection]) db[collection] = [];
  db[collection].push(data);

  saveDB(db);
  res.json(data);
});

// PUT
app.put('/data/:collection/:id', (req, res) => {
  const db = loadDB();
  const { collection, id } = req.params;
  const data = req.body;

  const items = db[collection];
  const index = items.findIndex(i => i.id == id);
  if (index === -1) return res.status(404).send("Not found");

  items[index] = { ...items[index], ...data };
  saveDB(db);
  res.json(items[index]);
});

// DELETE
app.delete('/data/:collection/:id', (req, res) => {
  const db = loadDB();
  const { collection, id } = req.params;

  db[collection] = db[collection].filter(i => i.id != id);
  saveDB(db);
  res.send("Deleted");
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
