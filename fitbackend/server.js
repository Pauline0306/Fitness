const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: ''  // default XAMPP password is empty
});

// Create database if it doesn't exist
connection.query('CREATE DATABASE IF NOT EXISTS training_db', (err) => {
    if (err) {
        console.error('Error creating database:', err);
        return;
    }
    console.log('Database created or already exists');
    
    connection.query('USE training_db', (err) => {
        if (err) {
            console.error('Error using database:', err);
            return;
        }
        console.log('Using training_db database');
        
        // Create users table with additional fields
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('trainer', 'trainee') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        connection.query(createTableQuery, (err) => {
            if (err) {
                console.error('Error creating table:', err);
                return;
            }
            console.log('Users table created or already exists');
        });
          const createMessagesTableQuery = `
            CREATE TABLE IF NOT EXISTS messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sender_id INT NOT NULL,
            receiver_id INT NOT NULL,
            content TEXT NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sender_id) REFERENCES users(id),
            FOREIGN KEY (receiver_id) REFERENCES users(id)
            )`;

connection.query(createMessagesTableQuery, (err) => {
    if (err) {
        console.error('Error creating messages table:', err);
        return;
    }
    console.log('Messages table created or already exists');
});

    });
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate role
    if (role !== 'trainer' && role !== 'trainee') {
      return res.status(400).json({ message: 'Invalid role. Must be either trainer or trainee' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    connection.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role],
      (error, results) => {
        if (error) {
          if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Email already exists' });
          }
          return res.status(500).json({ message: 'Error creating user' });
        }
        res.status(201).json({ message: 'User registered successfully' });
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    connection.query(
      'SELECT * FROM users WHERE email = ?',
      [email],
      async (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Server error' });
        }

        if (results.length === 0) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = results[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
          { 
            userId: user.id, 
            email: user.email,
            name: user.name,
            role: user.role 
          },
          'your_jwt_secret',
          { expiresIn: '5h' }
        );

        res.json({ 
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (with role-based access)

// Get all trainers endpoint
app.get('/api/trainers', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    
    // Only trainees can see trainers
    if (decoded.role !== 'trainee') {
      return res.status(403).json({ message: 'Access denied. Trainees only.' });
    }

    connection.query(
      'SELECT id, name, email, created_at FROM users WHERE role = "trainer"',
      (err, results) => {
        if (err) {
          console.error('Error fetching trainers:', err);
          return res.status(500).json({ message: 'Error fetching trainers' });
        }

        res.json(results);
      }
    );
  } catch (err) {
    console.error('Token verification failed:', err);
    return res.status(401).json({ message: 'Invalid token' });
  }
});

app.get('/api/trainee', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');

    // Only trainers can see trainees
    if (decoded.role !== 'trainer') {
      return res.status(403).json({ message: 'Access denied. Trainers only.' });
    }

    connection.query(
      'SELECT id, name, email, created_at FROM users WHERE role = "trainee"',
      (err, results) => {
        if (err) {
          console.error('Error fetching trainees:', err);
          return res.status(500).json({ message: 'Error fetching trainees' });
        }

        res.json(results);
      }
    );
  } catch (err) {
    console.error('Token verification failed:', err);
    return res.status(401).json({ message: 'Invalid token' });
  }
});

app.post('/api/messages', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
      const decoded = jwt.verify(token, 'your_jwt_secret');
      const { receiverId, content } = req.body;

      const query = `
          INSERT INTO messages (sender_id, receiver_id, content)
          VALUES (?, ?, ?)
      `;

      connection.query(
          query,
          [decoded.userId, receiverId, content],
          (err, results) => {
              if (err) {
                  console.error('Error sending message:', err);
                  return res.status(500).json({ message: 'Error sending message' });
              }
              res.status(201).json({ message: 'Message sent successfully' });
          }
      );
  } catch (err) {
      console.error('Token verification failed:', err);
      return res.status(401).json({ message: 'Invalid token' });
  }
});

app.get('/api/messages/:userId', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
      const decoded = jwt.verify(token, 'your_jwt_secret');
      const otherUserId = req.params.userId;

      const query = `
          SELECT 
              m.*,
              sender.name as sender_name,
              receiver.name as receiver_name
          FROM messages m
          JOIN users sender ON m.sender_id = sender.id
          JOIN users receiver ON m.receiver_id = receiver.id
          WHERE 
              (m.sender_id = ? AND m.receiver_id = ?) 
              OR 
              (m.sender_id = ? AND m.receiver_id = ?)
          ORDER BY m.created_at ASC
      `;

      connection.query(
          query,
          [decoded.userId, otherUserId, otherUserId, decoded.userId],
          (err, results) => {
              if (err) {
                  console.error('Error fetching messages:', err);
                  return res.status(500).json({ message: 'Error fetching messages' });
              }
              res.json(results);
          }
      );
  } catch (err) {
      console.error('Token verification failed:', err);
      return res.status(401).json({ message: 'Invalid token' });
  }
});


// Mark message as read
app.put('/api/messages/:messageId/read', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
      const decoded = jwt.verify(token, 'your_jwt_secret');
      const messageId = req.params.messageId;

      const query = `
          UPDATE messages 
          SET is_read = TRUE 
          WHERE id = ? AND receiver_id = ?
      `;

      connection.query(
          query,
          [messageId, decoded.userId],
          (err, results) => {
              if (err) {
                  console.error('Error marking message as read:', err);
                  return res.status(500).json({ message: 'Error marking message as read' });
              }
              res.json({ message: 'Message marked as read' });
          }
      );
  } catch (err) {
      console.error('Token verification failed:', err);
      return res.status(401).json({ message: 'Invalid token' });
  }
});

app.get('/api/conversations', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    const role = decoded.role;

    let roleToFetch = '';
    if (role === 'trainer') {
      roleToFetch = 'trainee';
    } else if (role === 'trainee') {
      roleToFetch = 'trainer';
    } else {
      return res.status(403).json({ message: 'Invalid user role' });
    }

    const query = `
      SELECT 
        u.id, 
        u.name, 
        u.role,
        COALESCE(
          (SELECT m.content 
           FROM messages m 
           WHERE m.sender_id = u.id OR m.receiver_id = u.id 
           ORDER BY m.created_at DESC 
           LIMIT 1
          ), 
          'No messages yet'
        ) AS lastMessage
      FROM users u
      WHERE u.role = ?
    `;

    connection.query(query, [roleToFetch], (err, results) => {
      if (err) {
        console.error('Error fetching conversations:', err);
        return res.status(500).json({ message: 'Error fetching conversations' });
      }

      res.json(results);
    });
  } catch (err) {
    console.error('Token verification failed:', err);
    return res.status(401).json({ message: 'Invalid token' });
  }
});




connection.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL database:', err);
      return;
    }
    console.log('Successfully connected to MySQL database');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});