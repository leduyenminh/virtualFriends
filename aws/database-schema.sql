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

-- Avatar Service Tables
CREATE TABLE IF NOT EXISTS avatar.avatars (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'character',
    model_path VARCHAR(500),
    thumbnail_path VARCHAR(500),
    created_by VARCHAR(255),
    is_public BOOLEAN DEFAULT true,
    download_count INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS avatar.avatar_instances (
    id BIGSERIAL PRIMARY KEY,
    avatar_id BIGINT NOT NULL,
    user_id VARCHAR(255),
    custom_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (avatar_id) REFERENCES avatar.avatars(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS avatar.avatar_tags (
    avatar_id BIGINT NOT NULL,
    tag VARCHAR(100) NOT NULL,
    PRIMARY KEY (avatar_id, tag),
    FOREIGN KEY (avatar_id) REFERENCES avatar.avatars(id) ON DELETE CASCADE
);

-- Avatar indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_avatar_category ON avatar.avatars(category);
CREATE INDEX IF NOT EXISTS idx_avatar_created_by ON avatar.avatars(created_by);
CREATE INDEX IF NOT EXISTS idx_avatar_public ON avatar.avatars(is_public, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_avatar_instances_user ON avatar.avatar_instances(user_id);
CREATE INDEX IF NOT EXISTS idx_avatar_instances_avatar ON avatar.avatar_instances(avatar_id);
CREATE INDEX IF NOT EXISTS idx_avatar_tags_tag ON avatar.avatar_tags(tag);

-- Insert sample data (optional)
-- INSERT INTO auth.users (username, email, password_hash) VALUES ('admin', 'admin@magent.ai', '$2a$10$...');