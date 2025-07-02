const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection live
// const pool = mysql.createPool({
//   host: "localhost",
//   user: "isad8273_vaccination",
//   password: "isad8273_vaccination",
//   database: "isad8273_vaccination",
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// Database connection
// const pool = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "vaccination_db",
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });


// Initialize database tables
const initDb = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Create admin table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create patients table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS patients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        birth_date DATE NOT NULL,
        sex VARCHAR(255) NOT NULL,
        nationality VARCHAR(255) NOT NULL,
        national_id VARCHAR(255),
        doctor_name VARCHAR(255) NOT NULL,
        vaccine_type VARCHAR(255) NOT NULL,
        vaccine_date DATE NOT NULL,
        valid_until DATE,
        administration_location VARCHAR(255) NOT NULL,
        vaccine_batch_number VARCHAR(255),
        disease_targeted VARCHAR(255),
        disease_date DATE,
        manufacture_brand_batch VARCHAR(255),
        next_booster_date DATE,
        official_stamp_signature VARCHAR(255),
        slug VARCHAR(50) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Check if admin user exists and create default if not
    const [admins] = await connection.execute('SELECT * FROM admins LIMIT 1');
    if (admins.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await connection.execute(
        'INSERT INTO admins (username, password) VALUES (?, ?)',
        ['admin', hashedPassword]
      );
      console.log('Default admin created: admin/admin123');
    }
    
    connection.release();
    console.log('Database initialized successfully oke');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Initialize database on server start
// initDb();


// ========= PATIENST APP API ==============

// Database connection live
const pool = mysql.createPool({
  host: "localhost",
  user: "isad8273_vaccination",
  password: "isad8273_vaccination",
  database: "isad8273_vaccination",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Generate unique slug
const generateUniqueSlug = async () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let slug;
  let isUnique = false;
  
  while (!isUnique) {
    // Format: E-XXXXX
    slug = 'E-';
    for (let i = 0; i < 5; i++) {
      slug += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    // Check if slug exists in database
    const [rows] = await pool.execute(
      'SELECT id FROM patients WHERE slug = ?',
      [slug]
    );
    
    if (rows.length === 0) {
      isUnique = true;
    }
  }
  
  return slug;
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Access denied' });
  
  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Login route
app.post('/api/patiens/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const [rows] = await pool.execute(
      'SELECT * FROM admins WHERE username = ?',
      [username]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const admin = rows[0];
    const validPassword = await bcrypt.compare(password, admin.password);
    
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );
    
    res.status(200).json({
      token,
      admin: {
        id: admin.id,
        username: admin.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new patient
app.post('/api/patients', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      address,
      birth_date,
      sex,
      nationality,
      national_id,
      doctor_name,
      vaccine_type,
      vaccine_date,
      valid_until,
      administration_location,
      vaccine_batch_number,
      disease_targeted,
      disease_date,
      manufacture_brand_batch,
      next_booster_date,
      official_stamp_signature
    } = req.body;
    
    const slug = await generateUniqueSlug();
    
    const [result] = await pool.execute(
      `INSERT INTO patients 
       (name, address, birth_date, sex, nationality, national_id, doctor_name, vaccine_type, vaccine_date, valid_until, administration_location, vaccine_batch_number, disease_targeted, disease_date, manufacture_brand_batch, next_booster_date, official_stamp_signature, slug)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, address, birth_date, sex, nationality, national_id, doctor_name, vaccine_type, vaccine_date, valid_until, administration_location, vaccine_batch_number, disease_targeted, disease_date, manufacture_brand_batch, next_booster_date, official_stamp_signature, slug]
    );
    
    res.status(201).json({
      id: result.insertId,
      slug,
      message: 'Patient record created successfully'
    });
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all patients with pagination
app.get('/api/patients', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Get total count
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM patients');
    const total = countResult[0].total;
    
    // Get paginated data
    const [rows] = await pool.execute(
      'SELECT * FROM patients ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    
    res.status(200).json({
      patients: rows,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        recordsPerPage: limit,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get patient by slug (public route)
app.get('/api/patients/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const [rows] = await pool.execute(
      'SELECT * FROM patients WHERE slug = ?',
      [slug]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update patient
app.put('/api/patients/:slug', authenticateToken, async (req, res) => {
  try {
    const { slug } = req.params;
    const {
      name,
      address,
      birth_date,
      sex,
      nationality,
      national_id,
      doctor_name,
      vaccine_type,
      vaccine_date,
      valid_until,
      administration_location,
      vaccine_batch_number,
      disease_targeted,
      disease_date,
      manufacture_brand_batch,
      next_booster_date,
      official_stamp_signature
    } = req.body;
    
    await pool.execute(
      `UPDATE patients 
       SET name = ?, address = ?, birth_date = ?, sex = ?, nationality = ?, national_id = ?, doctor_name = ?, vaccine_type = ?, 
       vaccine_date = ?, valid_until = ?, administration_location = ?, vaccine_batch_number = ?, disease_targeted = ?, disease_date = ?, manufacture_brand_batch = ?, next_booster_date = ?, official_stamp_signature = ?
       WHERE slug = ?`,
      [name, address, birth_date, sex, nationality, national_id, doctor_name, vaccine_type, vaccine_date, valid_until, administration_location, vaccine_batch_number, disease_targeted, disease_date, manufacture_brand_batch, next_booster_date, official_stamp_signature, slug]
    );
    
    res.status(200).json({ message: 'Patient updated successfully' });
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete patient
app.delete('/api/patients/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute('DELETE FROM patients WHERE id = ?', [id]);
    
    res.status(200).json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});