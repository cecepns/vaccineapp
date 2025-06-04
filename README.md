# Vaccination Management System

A simple web application for tracking vaccination records with admin management and public record viewing.

## Features

- Admin authentication system
- Patient record management
- QR code generation for each record
- Public URL for each patient record
- PDF export functionality
- MySQL database integration

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- MySQL

### Database Setup

1. Create a MySQL database named `vaccination_db`
2. Update the database credentials in the `.env` file

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the backend server:
   ```bash
   npm run server
   ```

3. Start the frontend development server:
   ```bash
   npm run dev
   ```

### Default Login

- Username: admin
- Password: admin123

## Usage

1. Login to the admin dashboard
2. Add new patient vaccination records
3. View, edit, or delete existing records
4. Share unique URLs with patients to view their records
5. Print or save records as PDFs

## Technologies Used

- Frontend: React with Vite, TailwindCSS
- Backend: Express.js
- Database: MySQL
- Authentication: JWT
- PDF Generation: react-to-pdf
- QR Code: qrcode.react