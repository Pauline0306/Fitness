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
    password: '',  // default XAMPP password is empty
    database: 'training_db'
});


// Create database if it doesn't exist
connection.query('CREATE DATABASE IF NOT EXISTS Training_db', (err) => {
  if (err) {
      console.error('Error creating database:', err);
      return;
  }
  console.log('Database created or already exists');

  connection.query('USE Training_db', (err) => {
      if (err) {
          console.error('Error using database:', err);
          return;
      }
      console.log('Using Training_db database');

      // Create users table
      const createUsersTableQuery = `
          CREATE TABLE IF NOT EXISTS users (
              id INT AUTO_INCREMENT PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              email VARCHAR(255) UNIQUE NOT NULL,
              password VARCHAR(255) NOT NULL,
              role ENUM('trainer', 'trainee') NOT NULL,
              age INT,
              gender VARCHAR(10),
              height FLOAT,
              weight FLOAT,
              qualifications TEXT,
              experience TEXT,
              specialization TEXT,
              availability TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
      `;
      connection.query(createUsersTableQuery, (err) => {
          if (err) {
              console.error('Error creating users table:', err);
              return;
          }
          console.log('Users table created or already exists');
      });

      const createWorkoutRoutinesTable = `
    CREATE TABLE IF NOT EXISTS workout_routines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    body_part VARCHAR(255),
    exercises TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    completion_date DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)`;

    connection.query(createWorkoutRoutinesTable, (err) => {
      if (err) {
          console.error('Error creating workout tracking table:', err);
          return;
      }
      console.log('Workout routines created or already exists');
    });






      // Create diet_entries table
   

   

      // Create messages table
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
          )
      `;
      connection.query(createMessagesTableQuery, (err) => {
          if (err) {
              console.error('Error creating messages table:', err);
              return;
          }
          console.log('Messages table created or already exists');
      });

      // Create trainee_profiles table
      const createTraineeProfilesQuery = `
          CREATE TABLE IF NOT EXISTS trainee_profiles (
              id INT AUTO_INCREMENT PRIMARY KEY,
              user_id INT NOT NULL,
              health_history TEXT,
              medication_history TEXT,
              fitness_goal TEXT,
              preferred_schedule TEXT,
              experience_level ENUM('beginner', 'intermediate', 'pro'),
              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
      `;
      connection.query(createTraineeProfilesQuery, (err) => {
          if (err) {
              console.error('Error creating trainee_profiles table:', err);
              return;
          }
          console.log('Trainee profiles table created or already exists');
      });

      // Create weight_tracking table
      const createWeightTrackingQuery = `
          CREATE TABLE IF NOT EXISTS weight_tracking (
              id INT AUTO_INCREMENT PRIMARY KEY,
              trainee_id INT NOT NULL,
              weight FLOAT NOT NULL,
              date DATE NOT NULL,
              FOREIGN KEY (trainee_id) REFERENCES users(id) ON DELETE CASCADE
          )
      `;
      connection.query(createWeightTrackingQuery, (err) => {
          if (err) {
              console.error('Error creating weight_tracking table:', err);
              return;
          }
          console.log('Weight tracking table created or already exists');
      });

      const createBookingsTable = `
    CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        trainer_id INT NOT NULL,
        health_history TEXT NOT NULL,
        medication_history TEXT,
        fitness_goal TEXT NOT NULL,
        preferred_schedule TEXT NOT NULL,
        experience_level ENUM('beginner', 'intermediate', 'pro') NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status ENUM('pending', 'accepted', 'rejected', 'completed') NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE CASCADE
    )`;
    connection.query(createBookingsTable, (err) => {
      if (err) {
          console.error('Error creating weight_tracking table:', err);
          return;
      }
      console.log('Bookings table created or already exists');
  });
  const createTraineeTrainerMapTable = `
    CREATE TABLE IF NOT EXISTS trainee_trainer_map (
        id INT AUTO_INCREMENT PRIMARY KEY,
        trainee_id INT NOT NULL,
        trainer_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_mapping (trainee_id, trainer_id),
        FOREIGN KEY (trainee_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE CASCADE
    )`;

    connection.query(createTraineeTrainerMapTable, (err) => {
      if (err) {
          console.error('Error creating weight_tracking table:', err);
          return;
      }
      console.log('Trainer Trainee map table created or already exists');
  });

  const createDietRecommendationTable = `
    CREATE TABLE IF NOT EXISTS diet_recommendation (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        recommendation TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
`;

connection.query(createDietRecommendationTable, (err) => {
    if (err) {
        console.error('Error creating diet recommendation table:', err);
        return;
    }
    console.log('Diet recommendation table created or already exists');
});
      
  });
});

app.put('/api/bookings/:bookingId/status', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        const bookingId = req.params.bookingId;
        const { status } = req.body;

        // Input validation
        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }

        // Validate status
        const validStatuses = ['accepted', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be "accepted" or "rejected"' });
        }

        // Verify user is a trainer
        if (decoded.role !== 'trainer') {
            return res.status(403).json({ message: 'Only trainers can update booking status' });
        }

        // Begin transaction
        connection.beginTransaction(err => {
            if (err) {
                console.error('Error starting transaction:', err);
                return res.status(500).json({ message: 'Database error' });
            }

            // Check if booking exists and belongs to this trainer
            const checkQuery = `
                SELECT * FROM bookings 
                WHERE id = ? 
                AND trainer_id = ? 
                AND status = 'pending'
            `;

            connection.query(checkQuery, [bookingId, decoded.userId], (err, results) => {
                if (err) {
                    return connection.rollback(() => {
                        console.error('Error checking booking:', err);
                        res.status(500).json({ message: 'Error checking booking' });
                    });
                }

                if (results.length === 0) {
                    return connection.rollback(() => {
                        res.status(404).json({ 
                            message: 'Booking not found or not pending or not assigned to this trainer' 
                        });
                    });
                }

                const booking = results[0];

                // Function to complete the booking update
                const completeBookingUpdate = () => {
                    const updateQuery = `
                        UPDATE bookings 
                        SET status = ?
                        WHERE id = ? 
                        AND trainer_id = ?
                    `;

                    connection.query(
                        updateQuery,
                        [status, bookingId, decoded.userId],
                        (updateErr, updateResult) => {
                            if (updateErr) {
                                return connection.rollback(() => {
                                    console.error('Error updating booking:', updateErr);
                                    res.status(500).json({ message: 'Error updating booking status' });
                                });
                            }

                            if (updateResult.affectedRows === 0) {
                                return connection.rollback(() => {
                                    res.status(404).json({ message: 'Booking not found or not authorized' });
                                });
                            }

                            // Commit the transaction
                            connection.commit(commitErr => {
                                if (commitErr) {
                                    return connection.rollback(() => {
                                        console.error('Error committing transaction:', commitErr);
                                        res.status(500).json({ message: 'Error finalizing booking update' });
                                    });
                                }

                                res.json({ 
                                    message: `Booking ${status} successfully`,
                                    status: status,
                                    bookingId: bookingId
                                });
                            });
                        }
                    );
                };

                // If status is accepted, create trainer-trainee mapping
                if (status === 'accepted') {
                    const mapping = {
                        trainee_id: booking.user_id,
                        trainer_id: decoded.userId
                    };

                    connection.query(
                        'INSERT INTO trainee_trainer_map SET ?',
                        mapping,
                        (mappingErr) => {
                            if (mappingErr) {
                                // If it's not a duplicate entry error, roll back
                                if (mappingErr.code !== 'ER_DUP_ENTRY') {
                                    return connection.rollback(() => {
                                        console.error('Error creating trainer-trainee mapping:', mappingErr);
                                        res.status(500).json({ 
                                            message: 'Error creating trainer-trainee relationship' 
                                        });
                                    });
                                }
                            }

                            // Continue with updating booking status
                            completeBookingUpdate();
                        }
                    );
                } else {
                    // If rejected, just update the status
                    completeBookingUpdate();
                }
            });
        });

    } catch (err) {
        console.error('Token verification failed:', err);
        return res.status(401).json({ message: 'Invalid token' });
    }
});




// Replace the duplicate /api/bookings POST endpoints with this single implementation
app.post('/api/bookings', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        const {
            trainerId,
            healthHistory,
            medicationHistory,
            fitnessGoal,
            preferredSchedule,
            experienceLevel,
            startDate,
            endDate
        } = req.body;

        // Validate required fields
        if (!trainerId || !healthHistory || !fitnessGoal || !preferredSchedule || 
            !experienceLevel || !startDate || !endDate) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                required: [
                    'trainerId',
                    'healthHistory',
                    'fitnessGoal',
                    'preferredSchedule',
                    'experienceLevel',
                    'startDate',
                    'endDate'
                ]
            });
        }

        // Verify user role
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

                // Insert or update trainee profile first
                const upsertProfileQuery = `
                    INSERT INTO trainee_profiles (
                        user_id,
                        health_history,
                        medication_history,
                        fitness_goal,
                        preferred_schedule,
                        experience_level
                    ) VALUES (?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        health_history = VALUES(health_history),
                        medication_history = VALUES(medication_history),
                        fitness_goal = VALUES(fitness_goal),
                        preferred_schedule = VALUES(preferred_schedule),
                        experience_level = VALUES(experience_level)
                `;

                connection.query(
                    upsertProfileQuery,
                    [
                        decoded.userId,
                        healthHistory,
                        medicationHistory || '',
                        fitnessGoal,
                        preferredSchedule,
                        experienceLevel
                    ],
                    (profileErr) => {
                        if (profileErr) {
                            console.error('Error upserting trainee profile:', profileErr);
                            // Continue with booking even if profile update fails
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

                                // Create new booking with all fields
                                const insertQuery = `
                                    INSERT INTO bookings (
                                        user_id, 
                                        trainer_id, 
                                        health_history,
                                        medication_history,
                                        fitness_goal,
                                        preferred_schedule,
                                        experience_level,
                                        start_date,
                                        end_date,
                                        status
                                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
                                `;

                                connection.query(
                                    insertQuery,
                                    [
                                        decoded.userId,
                                        trainerId,
                                        healthHistory,
                                        medicationHistory || '',
                                        fitnessGoal,
                                        preferredSchedule,
                                        experienceLevel,
                                        startDate,
                                        endDate
                                    ],
                                    (err, results) => {
                                        if (err) {
                                            console.error('Error creating booking:', err);
                                            return res.status(500).json({ message: 'Error creating booking' });
                                        }

                                        // Fetch the created booking to return
                                        const selectQuery = `
                                            SELECT b.*, u.name as trainee_name, t.name as trainer_name
                                            FROM bookings b
                                            JOIN users u ON b.user_id = u.id
                                            JOIN users t ON b.trainer_id = t.id
                                            WHERE b.id = ?
                                        `;

                                        connection.query(selectQuery, [results.insertId], (err, bookings) => {
                                            if (err) {
                                                console.error('Error fetching created booking:', err);
                                                return res.status(500).json({ message: 'Booking created but failed to fetch details' });
                                            }

                                            res.status(201).json({
                                                message: 'Booking created successfully',
                                                booking: bookings[0]
                                            });
                                        });
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    } catch (err) {
        console.error('Token verification failed:', err);
        return res.status(401).json({ message: 'Invalid token' });
    }
});

app.get('/api/bookings', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    try {
      const decoded = jwt.verify(token, 'your_jwt_secret');
  
      let query;
      let queryParams;
  
      // Different queries based on user role
      if (decoded.role === 'trainee') {
        // Get bookings where user is the trainee
        query = `
          SELECT b.*, u.name AS trainee_name, t.name AS trainer_name, b.status
          FROM bookings b
          JOIN users u ON b.user_id = u.id
          JOIN users t ON b.trainer_id = t.id
          WHERE b.user_id = ?
          ORDER BY b.created_at DESC
        `;
        queryParams = [decoded.userId];
      } else if (decoded.role === 'trainer') {
        // Get bookings where user is the trainer
        query = `
          SELECT b.*, u.name AS trainee_name, t.name AS trainer_name, b.status,
                tp.health_history, tp.medication_history, tp.fitness_goal,
                tp.preferred_schedule, tp.experience_level
          FROM bookings b
          JOIN users u ON b.user_id = u.id
          JOIN users t ON b.trainer_id = t.id
          LEFT JOIN trainee_profiles tp ON b.user_id = tp.user_id
          WHERE b.trainer_id = ?
          ORDER BY b.created_at DESC
        `;
        queryParams = [decoded.userId];
      } else {
        return res.status(403).json({ message: 'Invalid user role' });
      }
  
      connection.query(query, queryParams, (err, results) => {
        if (err) {
          console.error('Error fetching bookings:', err);
          return res.status(500).json({ message: 'Error fetching bookings' });
        }
  
        res.json(results);
      });
    } catch (err) {
      console.error('Token verification failed:', err);
      return res.status(401).json({ message: 'Invalid token' });
    }
  });
  

  
// Update booking status
app.get('/api/bookings/:bookingId', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
      const decoded = jwt.verify(token, 'your_jwt_secret');
      const bookingId = req.params.bookingId;

      const query = `
          SELECT 
              b.*,
              u.name as trainee_name,
              t.name as trainer_name
          FROM bookings b
          JOIN users u ON b.user_id = u.id
          JOIN users t ON b.trainer_id = t.id
          WHERE b.id = ?
          AND (b.user_id = ? OR b.trainer_id = ?)
      `;

      connection.query(
          query,
          [bookingId, decoded.userId, decoded.userId],
          (err, results) => {
              if (err) {
                  console.error('Error fetching booking:', err);
                  return res.status(500).json({ message: 'Error fetching booking details' });
              }

              if (results.length === 0) {
                  return res.status(404).json({ message: 'Booking not found or access denied' });
              }

              res.json(results[0]);
          }
      );
  } catch (err) {
      console.error('Token verification failed:', err);
      return res.status(401).json({ message: 'Invalid token' });
  }
});

app.post('/api/workout-routines', async (req, res) => {
    const { user_id, body_part, exercises } = req.body;

    try {
        // Input validation
        if (!user_id || !body_part) {
            return res.status(400).json({
                error: 'Invalid input',
                details: 'user_id and body_part are required fields'
            });
        }

        // Validate exercises as JSON
        let exercisesJson = null;
        if (exercises) {
            try {
                exercisesJson = JSON.stringify(exercises);
            } catch (err) {
                return res.status(400).json({
                    error: 'Invalid input',
                    details: 'exercises must be a valid JSON object'
                });
            }
        }

        const query = `
            INSERT INTO workout_routines (
                user_id, 
                body_part, 
                exercises,
                created_at,
                is_completed,
                completion_date
            ) VALUES (?, ?, ?, CURRENT_TIMESTAMP, 0, NULL)
        `;

        const values = [
            user_id,
            body_part,
            exercisesJson
        ];

        const [result] = await connection.promise().query(query, values);

        return res.status(201).json({
            message: 'Workout routine created successfully',
            workoutId: result.insertId,
            data: {
                id: result.insertId,
                user_id,
                body_part,
                exercises: exercises,
                created_at: new Date(),
                is_completed: 0,
                completion_date: null
            }
        });

    } catch (error) {
        console.error('Error creating workout routine:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create workout routine'
        });
    }
});


app.put('/api/workout-routines/:id', async (req, res) => {
    const { id } = req.params;
    const { body_part, exercises } = req.body;

    try {
        // Validate input
        if (!body_part) {
            return res.status(400).json({
                error: 'Invalid input',
                details: 'body_part is a required field'
            });
        }

        let exercisesJson = null;
        if (exercises) {
            try {
                exercisesJson = JSON.stringify(exercises);
            } catch (err) {
                return res.status(400).json({
                    error: 'Invalid input',
                    details: 'exercises must be a valid JSON object'
                });
            }
        }

        // Update query
        const query = `
            UPDATE workout_routines
            SET 
                body_part = ?,
                exercises = ?
            WHERE id = ?
        `;
        const values = [body_part, exercisesJson, id];

        await connection.promise().query(query, values);

        return res.status(200).json({
            message: 'Workout routine updated successfully'
        });

    } catch (error) {
        console.error('Error updating workout routine:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update workout routine'
        });
    }
});

app.delete('/api/workout-routines/:id', (req, res) => {
    const { id } = req.params;
    console.log('Deleting workout with ID:', id);
  
    const query = 'DELETE FROM workout_routines WHERE id = ?';
    connection.query(query, [id], (err, result) => {  // Use `connection` instead of `db`
      if (err) {
        console.error('Error deleting workout:', err);
        return res.status(500).json({ message: 'Database error' });
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Workout not found' });
      }
  
      res.json({ message: 'Workout deleted successfully' });
    });
  });
  
  

  app.get('/api/workout_routines/:userId', (req, res) => {
    const traineeId = req.params.userId;
    const token = req.headers.authorization?.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: Token is missing' });
    }
  
    try {
      const decoded = jwt.verify(token, 'your_jwt_secret');
      const trainerId = decoded.userId;
  
      const bookingQuery = `
        SELECT * FROM bookings 
        WHERE user_id = ? AND trainer_id = ? AND status = 'accepted'
      `;
  
      connection.query(bookingQuery, [traineeId, trainerId], (bookingErr, bookingResults) => {
        if (bookingErr) {
          console.error('Error verifying booking:', bookingErr);
          return res.status(500).json({ message: 'Error verifying booking' });
        }
  
        if (bookingResults.length === 0) {
          return res.status(403).json({ message: 'Forbidden: No accepted booking with this trainee' });
        }
  
        const workoutQuery = `
          SELECT id, user_id, body_part, exercises, is_completed, completion_date, created_at 
          FROM workout_routines 
          WHERE user_id = ?
          ORDER BY id DESC
        `;
  
        connection.query(workoutQuery, [traineeId], (workoutErr, workoutResults) => {
          if (workoutErr) {
            console.error('Error fetching workout routines:', workoutErr);
            return res.status(500).json({ message: 'Error fetching workout routines' });
          }
  
          const formattedResults = workoutResults.map(routine => {
            let exercises = routine.exercises;
  
            // Safely parse the exercises field
            if (typeof exercises === 'string') {
              try {
                exercises = JSON.parse(exercises);
              } catch (err) {
                console.warn(`Invalid JSON in exercises field for routine ID ${routine.id}:`, exercises);
              }
            }
  
            return {
              ...routine,
              exercises,
            };
          });
  
          res.json(formattedResults);
        });
      });
    } catch (err) {
      console.error('Token error:', err);
      return res.status(401).json({ message: 'Invalid token', error: err.message });
    }
  });

  app.get('/api/goals', (req, res) => {
    const traineeId = req.query.user_id;
    const token = req.headers.authorization?.split(' ')[1];
  
    if (!traineeId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: Token is missing' });
    }
  
    try {
      const decoded = jwt.verify(token, 'your_jwt_secret');
      const trainerId = decoded.userId;
  
      const bookingQuery = `
        SELECT * FROM bookings 
        WHERE user_id = ? AND trainer_id = ? AND status = 'accepted'
      `;
  
      connection.query(bookingQuery, [traineeId, trainerId], (bookingErr, bookingResults) => {
        if (bookingErr) {
          console.error('Error verifying booking:', bookingErr);
          return res.status(500).json({ message: 'Error verifying booking' });
        }
  
        if (bookingResults.length === 0) {
          return res.status(403).json({ message: 'Forbidden: No accepted booking with this trainee' });
        }
  
        const goalsQuery = `
          SELECT id, name, target, current_progress 
          FROM goals 
          WHERE user_id = ?
          ORDER BY id DESC
        `;
  
        connection.query(goalsQuery, [traineeId], (goalsErr, goalsResults) => {
          if (goalsErr) {
            console.error('Error fetching trainee goals:', goalsErr);
            return res.status(500).json({ message: 'Error fetching trainee goals' });
          }
  
          // Calculate progress percentage
          const goalsWithProgress = goalsResults.map(goal => ({
            ...goal,
            progress_percentage: goal.target > 0 
              ? Math.round((goal.current_progress / goal.target) * 100) 
              : 0
          }));
  
          res.json({
            data: goalsWithProgress || [],
            message: goalsWithProgress.length > 0 
              ? 'Trainee goals retrieved successfully' 
              : 'No goals found for this trainee'
          });
        });
      });
    } catch (err) {
      console.error('Token error:', err);
      return res.status(401).json({ message: 'Invalid token', error: err.message });
    }
  });

  // POST route for adding diet recommendation
app.post('/api/diet-recommendations', async (req, res) => {
    const { user_id, recommendation } = req.body;

    try {
        // Input validation
        if (!user_id || !recommendation) {
            return res.status(400).json({
                error: 'Invalid input',
                details: 'user_id and recommendation are required fields'
            });
        }

        // Check if user exists
        const [userCheck] = await connection.promise().query(
            'SELECT id FROM users WHERE id = ?', 
            [user_id]
        );

        if (userCheck.length === 0) {
            return res.status(404).json({
                error: 'Not Found',
                details: 'User not found'
            });
        }

        const query = `
            INSERT INTO diet_recommendation (
                user_id, 
                recommendation, 
                created_at
            ) VALUES (?, ?, CURRENT_TIMESTAMP)
        `;

        const [result] = await connection.promise().query(query, [user_id, recommendation]);

        return res.status(201).json({
            message: 'Diet recommendation created successfully',
            dietRecommendationId: result.insertId,
            data: {
                id: result.insertId,
                user_id,
                recommendation,
                created_at: new Date()
            }
        });

    } catch (error) {
        console.error('Error creating diet recommendation:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create diet recommendation'
        });
    }
});

// GET route for retrieving diet recommendations for a specific user
app.get('/api/diet-recommendations/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const query = `
            SELECT id, user_id, recommendation, created_at 
            FROM diet_recommendation 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        `;

        const [recommendations] = await connection.promise().query(query, [userId]);

        return res.status(200).json({
            message: 'Diet recommendations retrieved successfully',
            data: recommendations
        });

    } catch (error) {
        console.error('Error retrieving diet recommendations:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to retrieve diet recommendations'
        });
    }
});

// DELETE route for removing a diet recommendation
app.delete('/api/diet-recommendations/:id', async (req, res) => {
    const recommendationId = req.params.id;

    try {
        const [result] = await connection.promise().query(
            'DELETE FROM diet_recommendation WHERE id = ?', 
            [recommendationId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Not Found',
                details: 'Diet recommendation not found'
            });
        }

        return res.status(200).json({
            message: 'Diet recommendation deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting diet recommendation:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to delete diet recommendation'
        });
    }
});



app.post('/api/bookings/check-completion', (req, res) => {
  const query = `
      UPDATE bookings 
      SET status = 'completed' 
      WHERE status = 'accepted' 
      AND end_date < CURDATE()
  `;

  connection.query(query, (err, results) => {
      if (err) {
          console.error('Error updating completed bookings:', err);
          return res.status(500).json({ message: 'Error updating bookings' });
      }

      res.json({ 
          message: 'Bookings updated successfully',
          completedBookings: results.affectedRows
      });
  });
});


// Register endpoint
app.post('/api/auth/register/trainee', async (req, res) => {
  try {
      const {
          name, email, password, age, gender, height, weight,
          healthHistory, medicationHistory, fitnessGoal,
          preferredSchedule, experienceLevel
      } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10);

      connection.beginTransaction(async (err) => {
          if (err) throw err;

          try {
              // Insert into users table
              const [userResult] = await connection.promise().query(
                  'INSERT INTO users (name, email, password, role, age, gender, height, weight) VALUES (?, ?, ?, "trainee", ?, ?, ?, ?)',
                  [name, email, hashedPassword, age, gender, height, weight]
              );

              // Insert into trainee_profiles
              await connection.promise().query(
                  'INSERT INTO trainee_profiles (user_id, health_history, medication_history, fitness_goal, preferred_schedule, experience_level) VALUES (?, ?, ?, ?, ?, ?)',
                  [userResult.insertId, healthHistory, medicationHistory, fitnessGoal, preferredSchedule, experienceLevel]
              );

              // Insert initial weight record
              await connection.promise().query(
                  'INSERT INTO weight_tracking (trainee_id, weight, date) VALUES (?, ?, CURDATE())',
                  [userResult.insertId, weight]
              );

              await connection.promise().commit();
              res.status(201).json({ message: 'Trainee registered successfully' });
          } catch (error) {
              await connection.promise().rollback();
              throw error;
          }
      });
  } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/auth/register/trainer', async (req, res) => {
  try {
      const {
          name, email, password, qualifications,
          experience, specialization, availability
      } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10);

      const query = `
          INSERT INTO users (
              name, email, password, role,
              qualifications, experience, specialization, availability
          ) VALUES (?, ?, ?, "trainer", ?, ?, ?, ?)
      `;

      connection.query(
          query,
          [name, email, hashedPassword, qualifications, experience, specialization, availability],
          (error, results) => {
              if (error) {
                  if (error.code === 'ER_DUP_ENTRY') {
                      return res.status(400).json({ message: 'Email already exists' });
                  }
                  return res.status(500).json({ message: 'Error creating trainer' });
              }
              res.status(201).json({ message: 'Trainer registered successfully' });
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
  
          if (!user.role) {
            return res.status(500).json({ message: 'User role is missing in the database' });
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
              role: user.role // Ensure role is passed to the client
            }
          });
        }
      );
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  


app.post('/api/workout/track', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
      const decoded = jwt.verify(token, 'your_jwt_secret');
      const { workoutId, completed, notes } = req.body;

      const query = `
          INSERT INTO workout_tracking (
              trainee_id, workout_id, completed,
              completion_date, notes
          ) VALUES (?, ?, ?, IF(? = true, CURDATE(), NULL), ?)
      `;

      connection.query(
          query,
          [decoded.userId, workoutId, completed, completed, notes],
          (err) => {
              if (err) return res.status(500).json({ message: 'Error tracking workout' });
              res.json({ message: 'Workout tracked successfully' });
          }
      );
  } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
  }
});






app.post('/api/weight/update', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
      const decoded = jwt.verify(token, 'your_jwt_secret');
      if (decoded.role !== 'trainee') {
          return res.status(403).json({ message: 'Only trainees can update weight' });
      }

      const { weight } = req.body;
      if (!weight) return res.status(400).json({ message: 'Weight is required' });

      const query = `
          INSERT INTO weight_tracking (trainee_id, weight, date)
          VALUES (?, ?, CURDATE())
      `;

      connection.query(query, [decoded.userId, weight], (err) => {
          if (err) return res.status(500).json({ message: 'Error updating weight' });
          res.json({ message: 'Weight updated successfully' });
      });
  } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
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
  
      // Fetch additional trainer details: qualifications, experience, and availability
      connection.query(
        `
        SELECT 
          id, 
          name, 
          email, 
          qualifications, 
          experience, 
          availability, 
          created_at 
        FROM users 
        WHERE role = 'trainer'
        `,
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