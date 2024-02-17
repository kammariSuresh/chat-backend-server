// server.js
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());
app.use(cors());

const db = new sqlite3.Database('database.db');

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, message TEXT, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
});

app.get('/messages', (req, res) => {
    
  db.all("SELECT * FROM messages ORDER BY timestamp DESC", (err, rows) => {
    if (err) {
      console.error('Error fetching messages:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
        
      res.status(200).json(rows);
    }
  });
});

app.post('/messages', (req, res) => {
  const { message } = req.body;
  // console.log(message)
  db.run("INSERT INTO messages (message) VALUES (?)", [message], (err) => {
    if (err) {
      console.error('Error creating message:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.status(201).json({ success: true });
      
    }
  });
});

app.put('/messages/:id', (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  db.run("UPDATE messages SET message = ? WHERE id = ?", [message, id], (err) => {
    if (err) {
      console.error('Error updating message:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.status(200).json({ success: true });
    }
  });
});

app.delete('/messages/:id', (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM messages WHERE id = ?", [id], (err) => {
    if (err) {
      console.error('Error deleting message:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.status(200).json({ success: true });
    }
  });
});

io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
