// backend/routes/loans.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
  const { bookId, userId } = req.body;
  if(!bookId || !userId) return res.status(400).json({error:'missing'});
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // check availability
    const [[book]] = await conn.execute('SELECT total FROM books WHERE id = ?', [bookId]);
    if(!book) throw new Error('book not found');

    const [[borrowed]] = await conn.execute('SELECT COUNT(*) AS c FROM loans WHERE book_id = ? AND returned = 0', [bookId]);
    if (borrowed.c >= book.total) {
      await conn.rollback();
      return res.status(409).json({error:'no copies available'});
    }
    // insert loan
    await conn.execute('INSERT INTO loans (book_id, user_id, borrowed_at, returned) VALUES (?, ?, NOW(), 0)', [bookId, userId]);
    await conn.commit();
    res.json({ok:true});
  } catch(err) {
    await conn.rollback().catch(()=>{});
    console.error(err);
    res.status(500).json({error:'internal'});
  } finally {
    conn.release();
  }
});

router.post('/return', async (req, res) => {
  const { bookId, userId } = req.body;
  if(!bookId || !userId) return res.status(400).json({error:'missing'});
  try {
    const [result] = await pool.execute(
      'UPDATE loans SET returned = 1, returned_at = NOW() WHERE book_id = ? AND user_id = ? AND returned = 0 LIMIT 1',
      [bookId, userId]
    );
    if (result.affectedRows === 0) return res.status(404).json({error:'no active loan'});
    res.json({ok:true});
  } catch(err){
    console.error(err);
    res.status(500).json({error:'internal'});
  }
});

module.exports = router;
