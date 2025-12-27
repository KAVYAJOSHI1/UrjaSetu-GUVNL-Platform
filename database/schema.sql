-- URJASETU DATABASE SCHEMA
-- Platform: Supabase (PostgreSQL)
-- Description: Core database structure for GUVNL Issue Tracking System

-- 1. PROFILES
-- Extends the default Supabase Auth user with role-based access control.
-- Roles: 'citizen', 'admin', 'lineman'
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT,
    role TEXT NOT NULL CHECK (role IN ('citizen', 'admin', 'lineman')),
    phone TEXT,
    zone TEXT, -- Administrative zone for linemen
    status TEXT DEFAULT 'active',
    avatar_url TEXT
);

-- 2. ISSUES (Main Ticket Table)
-- Stores all complaints filed by citizens.
CREATE TABLE issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    citizen_id UUID REFERENCES profiles(id), -- The user who reported it
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    issue_type TEXT NOT NULL, -- e.g., 'voltage_issue', 'broken_pole'
    location USER-DEFINED, -- PostGIS Geometry (Lat/Long)
    address_text TEXT,
    image_url TEXT,
    status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority TEXT NOT NULL DEFAULT 'medium',
    assigned_to UUID REFERENCES profiles(id), -- The Lineman assigned
    assigned_at TIMESTAMP WITH TIME ZONE
);

-- 3. PROOF OF WORK
-- Verification system where linemen upload photo evidence of repairs.
CREATE TABLE proof_of_work (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    issue_id UUID REFERENCES issues(id),
    technician_id UUID REFERENCES profiles(id),
    notes TEXT NOT NULL,
    image_url TEXT NOT NULL, -- The 'After' photo
    verified BOOLEAN DEFAULT FALSE -- Admin approval status
);

-- 4. STATUS HISTORY
-- Audit trail to track the lifecycle of a complaint.
CREATE TABLE status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    issue_id UUID REFERENCES issues(id),
    status TEXT NOT NULL, -- The new status
    comment TEXT
);

-- 5. SUGGESTIONS (Community Feedback)
-- A public forum for citizens to suggest improvements.
CREATE TABLE suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    citizen_id UUID REFERENCES profiles(id),
    title TEXT NOT NULL,
    description TEXT,
    upvotes INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0
