// backend/routes/books.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const q = req.query.q ? `%${req.query.q}%` : '%';
    const [rows] = await pool.execute(
      `SELECT id, title, author, total, (total - IFNULL(borrowed_count,0)) AS available
       FROM books
       LEFT JOIN (
         SELECT book_id, COUNT(*) AS borrowed_count FROM loans WHERE returned = 0 GROUP BY book_id
       ) l ON books.id = l.book_id
       WHERE title LIKE ? OR author LIKE ?`, [q, q]
    );
    res.json(rows);
  } catch(err) {
    console.error(err);
    res.status(500).json({error:'internal'});
  }
});

module.exports = router;
