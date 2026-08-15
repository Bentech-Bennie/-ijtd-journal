-- backend/setup_db.sql
-- PostgreSQL database setup for IJTD

-- Create the database (run this separately if needed)
-- CREATE DATABASE ijtd_db;

-- Connect to the database
\c ijtd_db;

-- Create extensions for better performance
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search

-- Optional: Create a dedicated user
-- Replace 'your_password' with a secure password
-- CREATE USER ijtd_user WITH PASSWORD 'ijtd_password';
-- GRANT ALL PRIVILEGES ON DATABASE ijtd_db TO ijtd_user;
-- ALTER USER ijtd_user WITH SUPERUSER;  -- Only for development

-- Verify connection
SELECT current_database(), current_user;