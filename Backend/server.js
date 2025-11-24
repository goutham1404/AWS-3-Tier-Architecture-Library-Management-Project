// backend/server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const books = require('./routes/books');
const loans = require('./routes/loans');

const app = express();
app.use(bodyParser.json());

// CORS if needed (for dev)
app.use((req,res,next)=>{
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use('/api/books', books);
app.use('/api/loans', loans);

// health
app.get('/api/health', (req,res) => res.json({status:'ok'}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Library backend running on port', PORT);
});
