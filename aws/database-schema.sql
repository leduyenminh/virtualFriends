# Magent Database Schema
# Run this script against your RDS PostgreSQL instance

-- Create database (if not exists)
CREATE DATABASE magent;

-- Connect to magent database
\c magent;

-- Create schemas for each service
CREATE SCHEMA IF NOT EXISTS agent;
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS avatar;
CREATE SCHEMA IF NOT EXISTS voice;

-- Agent Service Tables
CREATE TABLE IF NOT EXISTS agent.chat_history (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_timestamp (user_id, timestamp DESC)
);

CREATE TABLE IF NOT EXISTS agent.stickers (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    data BYTEA NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id)
);

-- Auth Service Tables (if needed)
CREATE TABLE IF NOT EXISTS auth.users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_history_user_timestamp ON agent.chat_history(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_stickers_user ON agent.stickers(user_id);

-- Insert sample data (optional)
-- INSERT INTO auth.users (username, email, password_hash) VALUES ('admin', 'admin@magent.ai', '$2a$10$...');