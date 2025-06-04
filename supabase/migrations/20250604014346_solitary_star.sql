/*
  # Initial Schema for Vaccination Management System

  1. New Tables
    - `admins`
      - `id` (char(36), primary key)
      - `username` (varchar(255), unique)
      - `password` (varchar(255))
      - `created_at` (datetime)
    
    - `patients`
      - `id` (char(36), primary key)
      - `name` (varchar(255))
      - `address` (text)
      - `birth_date` (date)
      - `vaccine_type` (varchar(255))
      - `vaccine_date` (date)
      - `valid_until` (date)
      - `administration_location` (varchar(255))
      - `slug` (varchar(255), unique)
      - `created_at` (datetime)

  2. Security
    - Add indexes for performance
*/

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id char(36) PRIMARY KEY,
  username varchar(255) UNIQUE NOT NULL,
  password varchar(255) NOT NULL,
  created_at datetime DEFAULT CURRENT_TIMESTAMP
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id char(36) PRIMARY KEY,
  name varchar(255) NOT NULL,
  address text NOT NULL,
  birth_date date NOT NULL,
  vaccine_type varchar(255) NOT NULL,
  vaccine_date date NOT NULL,
  valid_until date NOT NULL,
  administration_location varchar(255) NOT NULL,
  slug varchar(255) UNIQUE NOT NULL,
  created_at datetime DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_admins_username ON admins(username);
CREATE INDEX idx_patients_slug ON patients(slug);

-- Create default admin user (password: admin123)
INSERT INTO admins (id, username, password)
SELECT UUID(), 'admin', '$2a$10$xP3Dj1QGkOHJe8rV.jNlAO8B4ImYuKjyXXbewDR0g3YEjpD2H7LSe'
WHERE NOT EXISTS (SELECT 1 FROM admins WHERE username = 'admin');