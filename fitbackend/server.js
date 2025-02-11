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
const createBookingsTableQuery = `
    CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        trainer_id INT NOT NULL,
        status ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY user_id_idx (user_id),
        KEY trainer_id_idx (trainer_id),
        CONSTRAINT bookings_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT bookings_trainer_fk FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE CASCADE
    )
`;



connection.query(createBookingsTableQuery, (err) => {
    if (err) {
        console.error('Error creating bookings table:', err);
        return;
    }
    console.log('Bookings table created or already exists');
});

const createSuggestionsTableQuery = `
    CREATE TABLE IF NOT EXISTS suggestions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        suggestion TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
`;

connection.query(createSuggestionsTableQuery, (err) => {
    if (err) {
        console.error('Error creating suggestions table:', err);
        return;
    }
    console.log('Suggestions table created or already exists');
});



    });
});

app.post('/api/bookings', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
      const decoded = jwt.verify(token, 'your_jwt_secret');
      const { trainerId } = req.body;

      if (!trainerId) {
          return res.status(400).json({ message: 'Trainer ID is required' });
      }

      if (decoded.role !== 'trainee') {
          return res.status(403).json({ message: 'Access denied. Trainees only.' });
      }

      // Check if trainer exists and is actually a trainer
      connection.query(
          'SELECT id, role FROM users WHERE id = ?',
          [trainerId],
          (err, results) => {
              if (err) {
                  console.error('Error checking trainer:', err);
                  return res.status(500).json({ message: 'Error checking trainer' });
              }

              if (results.length === 0) {
                  return res.status(404).json({ message: 'Trainer not found' });
              }

              if (results[0].role !== 'trainer') {
                  return res.status(400).json({ message: 'Selected user is not a trainer' });
              }

              // Check for existing pending or accepted booking
              connection.query(
                  'SELECT id, status FROM bookings WHERE user_id = ? AND trainer_id = ? AND (status = "pending" OR status = "accepted")',
                  [decoded.userId, trainerId],
                  (err, bookings) => {
                      if (err) {
                          console.error('Error checking existing bookings:', err);
                          return res.status(500).json({ message: 'Error checking existing bookings' });
                      }

                      if (bookings.length > 0) {
                          return res.status(400).json({
                              message: `You already have a ${bookings[0].status} booking with this trainer`
                          });
                      }

                      // Create new booking
                      const query = `
                          INSERT INTO bookings (user_id, trainer_id, status)
                          VALUES (?, ?, 'pending')
                      `;

                      connection.query(query, [decoded.userId, trainerId], (err, results) => {
                          if (err) {
                              console.error('Error creating booking:', err);
                              return res.status(500).json({ message: 'Error creating booking' });
                          }
                          res.status(201).json({
                              message: 'Booking request sent successfully',
                              bookingId: results.insertId
                          });
                      });
                  }
              );
          }
      );
  } catch (err) {
      console.error('Token verification failed:', err);
      return res.status(401).json({ message: 'Invalid token' });
  }
});

// Get bookings for a user
app.get('/api/bookings', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
      const decoded = jwt.verify(token, 'your_jwt_secret');

      const query = `
          SELECT 
              b.id,
              u.name AS opposite_name,
              u.role AS opposite_role,
              b.status,
              b.created_at
          FROM bookings b
          JOIN users u ON (
              CASE 
                  WHEN b.user_id = ? THEN b.trainer_id = u.id
                  WHEN b.trainer_id = ? THEN b.user_id = u.id
              END
          )
          WHERE b.user_id = ? OR b.trainer_id = ?
      `;

      connection.query(
          query, 
          [decoded.userId, decoded.userId, decoded.userId, decoded.userId], 
          (err, results) => {
              if (err) {
                  console.error('Error fetching bookings:', err);
                  return res.status(500).json({ message: 'Error fetching bookings' });
              }
              res.json(results);
          }
      );
  } catch (err) {
      console.error('Token verification failed:', err);
      return res.status(401).json({ message: 'Invalid token' });
  }
});

app.post('/api/suggestions', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    const { user_id, suggestion } = req.body;

    if (!user_id || !suggestion) {
      return res.status(400).json({ message: 'user_id and suggestion are required' });
    }

    // Verify that the requesting user is a trainer
    if (decoded.role !== 'trainer') {
      return res.status(403).json({ message: 'Only trainers can post suggestions' });
    }

    const query = 'INSERT INTO suggestions (user_id, suggestion) VALUES (?, ?)';
    connection.query(query, [user_id, suggestion], (err, result) => {
      if (err) {
        console.error('Error inserting suggestion:', err);
        return res.status(500).json({ message: 'Failed to insert suggestion' });
      }
      res.status(201).json({ message: 'Suggestion added successfully' });
    });
  } catch (err) {
    console.error('Token verification failed:', err);
    return res.status(401).json({ message: 'Invalid token' });
  }
});


// Update booking status
app.put('/api/bookings/:bookingId/status', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
      const decoded = jwt.verify(token, 'your_jwt_secret');
      const bookingId = req.params.bookingId;
      const { status } = req.body;

      if (!status || !['accepted', 'rejected'].includes(status)) {
          return res.status(400).json({ message: 'Invalid status. Must be accepted or rejected.' });
      }

      if (decoded.role !== 'trainer') {
          return res.status(403).json({ message: 'Access denied. Trainers only.' });
      }

      const checkBookingQuery = `
          SELECT b.*, 
                 user.id AS user_id, 
                 trainer.id AS trainer_id 
          FROM bookings b
          JOIN users user ON b.user_id = user.id
          JOIN users trainer ON b.trainer_id = trainer.id
          WHERE b.id = ?
      `;

      connection.query(checkBookingQuery, [bookingId], (err, bookings) => {
          if (err) return res.status(500).json({ message: 'Database error', error: err.message });

          if (bookings.length === 0) return res.status(404).json({ message: 'Booking not found' });

          const booking = bookings[0];

          if (booking.trainer_id !== decoded.userId) {
              return res.status(403).json({ message: 'Not authorized to update this booking' });
          }

          const updateQuery = 'UPDATE bookings SET status = ? WHERE id = ?';
          connection.query(updateQuery, [status, bookingId], (updateErr) => {
              if (updateErr) return res.status(500).json({ message: 'Failed to update booking status' });

              if (status === 'accepted') {
                  // Store user-trainer mapping
                  const mapQuery = `
                      INSERT INTO trainee_trainer_map (trainee_id, trainer_id) 
                      VALUES (?, ?) 
                      ON DUPLICATE KEY UPDATE trainer_id = ?
                  `;
                  connection.query(mapQuery, [booking.user_id, booking.trainer_id, booking.trainer_id], (mapErr) => {
                      if (mapErr) return res.status(500).json({ message: 'Failed to save trainee-trainer mapping' });
                  });
              }

              res.json({ message: `Booking ${status} successfully` });
          });
      });
  } catch (err) {
      res.status(401).json({ message: 'Invalid token', error: err.message });
  }
});


app.get('/api/bookings/accepted-trainers', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
      const decoded = jwt.verify(token, 'your_jwt_secret');
      if (decoded.role !== 'trainee') return res.status(403).json({ message: 'Only trainees can view accepted trainers.' });

      connection.query(
          `
          SELECT u.id, u.name, u.email 
          FROM bookings b
          JOIN users u ON b.trainer_id = u.id
          WHERE b.trainee_id = ? AND b.status = 'accepted'
          `,
          [decoded.userId],
          (err, results) => {
              if (err) {
                  console.error('Error fetching accepted trainers:', err);
                  return res.status(500).json({ message: 'Error fetching accepted trainers.' });
              }
              res.json(results);
          }
      );
  } catch (err) {
      console.error('Token verification failed:', err);
      res.status(401).json({ message: 'Invalid token' });
  }
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
app.get('/api/workout_routines/:userId', (req, res) => {
  const userId = req.params.userId;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');

    const mapQuery = `SELECT trainer_id FROM trainee_trainer_map WHERE trainee_id = ?`;
    connection.query(mapQuery, [decoded.userId], (mapErr, mapResult) => {
      if (mapErr) return res.status(500).json({ message: 'Failed to fetch trainer mapping' });

      const trainerId = mapResult.length ? mapResult[0].trainer_id : userId;

      const query = `
        SELECT id, user_id, body_part, exercises 
        FROM workout_routines 
        WHERE user_id = ?
        ORDER BY id DESC
      `;
      connection.query(query, [trainerId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching workout routines' });

        const formattedResults = results.map(routine => ({
          ...routine,
          exercises: typeof routine.exercises === 'string' ? JSON.parse(routine.exercises) : routine.exercises,
        }));

        res.json(formattedResults);
      });
    });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token', error: err.message });
  }
});


app.get('/api/diet_entries/:userId', (req, res) => {
  const userId = req.params.userId;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');

    const mapQuery = `SELECT trainer_id FROM trainee_trainer_map WHERE trainee_id = ?`;
    connection.query(mapQuery, [decoded.userId], (mapErr, mapResult) => {
      if (mapErr) return res.status(500).json({ message: 'Failed to fetch trainer mapping' });

      const trainerId = mapResult.length ? mapResult[0].trainer_id : userId;

      const query = `
        SELECT id, user_id, meal, food_name, calories, created_at 
        FROM diet_entries 
        WHERE user_id = ?
        ORDER BY created_at DESC
      `;
      connection.query(query, [trainerId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching diet entries' });

        res.json(results);
      });
    });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token', error: err.message });
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
        u.email,  -- Include email field in the result
        u.role,
        COALESCE(
          (SELECT m.content 
           FROM messages m 
           WHERE (m.sender_id = u.id AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = u.id)
           ORDER BY m.created_at DESC 
           LIMIT 1
          ), 
          'No messages yet'
        ) AS lastMessage
      FROM users u
      WHERE u.role = ?
    `;

    connection.query(query, [decoded.userId, decoded.userId, roleToFetch], (err, results) => {
      if (err) {
        console.error('Error fetching conversations:', err);
        return res.status(500).json({ message: 'Error fetching conversations' });
      }

      // Return email with other conversation details
      res.json(results.map(conversation => ({
        id: conversation.id,
        name: conversation.name,
        email: conversation.email || 'No email provided', // Default to 'No email provided'
        role: conversation.role,
        lastMessage: conversation.lastMessage
      })));
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