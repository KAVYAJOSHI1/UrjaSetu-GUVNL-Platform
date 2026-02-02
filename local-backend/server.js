const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const http = require('http');
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const PORT = 3000;
const SECRET_KEY = 'super_secret_dev_key';

app.use(cors());
app.use(bodyParser.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Body:', JSON.stringify(req.body));
    next();
});

// Initialize Database
const db = new sqlite3.Database('./urjasetu.db', (err) => {
    if (err) {
        console.error("Error opening database " + err.message);
    } else {
        console.log("Connected to SQLite database.");
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Auth/Users Table (Mimics auth.users + profiles)
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE,
            password TEXT,
            name TEXT,
            role TEXT,
            phone TEXT,
            zone TEXT,
            status TEXT DEFAULT 'active'
        )`);

        // Issues Table
        db.run(`CREATE TABLE IF NOT EXISTS issues (
            id TEXT PRIMARY KEY,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            citizen_id TEXT,
            title TEXT,
            description TEXT,
            issue_type TEXT,
            location TEXT, -- JSON string for {lat, long}
            address_text TEXT,
            image_url TEXT,
            status TEXT DEFAULT 'open',
            priority TEXT DEFAULT 'medium',
            assigned_to TEXT,
            assigned_at DATETIME
        )`);

        // Proof of Work
        db.run(`CREATE TABLE IF NOT EXISTS proof_of_work (
            id TEXT PRIMARY KEY,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            issue_id TEXT,
            technician_id TEXT,
            notes TEXT,
            image_url TEXT,
            verified INTEGER DEFAULT 0
        )`);

        // Status History
        db.run(`CREATE TABLE IF NOT EXISTS status_history (
            id TEXT PRIMARY KEY,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            issue_id TEXT,
            status TEXT,
            comment TEXT
        )`);

        // Suggestions
        db.run(`CREATE TABLE IF NOT EXISTS suggestions (
            id TEXT PRIMARY KEY,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            citizen_id TEXT,
            title TEXT,
            description TEXT,
            upvotes INTEGER DEFAULT 0,
            comments_count INTEGER DEFAULT 0
        )`);

        // Seed Admin User
        const adminId = 'admin-user-id';
        db.run(`INSERT OR IGNORE INTO users (id, email, password, name, role, phone) VALUES (?, ?, ?, ?, ?, ?)`,
            [adminId, 'admin@urjasetu.com', 'password123', 'System Admin', 'admin', '9998887776']);

        console.log("Database initialized and seeded.");
    });
}

// --- Auth Routes ---

app.post('/auth/v1/token', (req, res) => {
    const { email, password, grant_type } = req.body;

    // Simulate Login
    db.get("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign({ sub: row.id, role: row.role }, SECRET_KEY, { expiresIn: '1h' });

        res.json({
            access_token: token,
            token_type: "bearer",
            expires_in: 3600,
            user: {
                id: row.id,
                email: row.email,
                role: row.role,
                user_metadata: {
                    name: row.name,
                    phone: row.phone
                }
            }
        });
    });
});

app.post('/auth/v1/signup', (req, res) => {
    const { email, password, data } = req.body;
    const { name, phone, role } = data || {};
    const id = Math.random().toString(36).substr(2, 9);

    db.run("INSERT INTO users (id, email, password, name, role, phone) VALUES (?, ?, ?, ?, ?, ?)",
        [id, email, password, name, role || 'citizen', phone],
        function (err) {
            if (err) return res.status(400).json({ error: err.message });

            // Return session-like object
            const token = jwt.sign({ sub: id, role: role || 'citizen' }, SECRET_KEY, { expiresIn: '1h' });
            res.json({
                user: { id, email, role: role || 'citizen', user_metadata: { name, phone } },
                session: { access_token: token }
            });
        }
    );
});

// --- Generic REST Routes (Mimic PostgREST) ---

// Helper to filter query
function applyFilters(query, reqQuery, params = []) {
    let whereClause = [];
    Object.keys(reqQuery).forEach(key => {
        if (key === 'select' || key === 'order' || key.startsWith('limit')) return;

        let val = reqQuery[key];

        // Handle operators
        if (val.startsWith('eq.')) {
            whereClause.push(`${key} = ?`);
            params.push(val.split('eq.')[1]);
        } else if (val.startsWith('neq.')) {
            whereClause.push(`${key} != ?`);
            params.push(val.split('neq.')[1]);
        } else if (val.startsWith('gt.')) {
            whereClause.push(`${key} > ?`);
            params.push(val.split('gt.')[1]);
        } else if (val.startsWith('gte.')) {
            whereClause.push(`${key} >= ?`);
            params.push(val.split('gte.')[1]);
        } else if (val.startsWith('lt.')) {
            whereClause.push(`${key} < ?`);
            params.push(val.split('lt.')[1]);
        } else if (val.startsWith('lte.')) {
            whereClause.push(`${key} <= ?`);
            params.push(val.split('lte.')[1]);
        } else if (val.startsWith('like.')) {
            whereClause.push(`${key} LIKE ?`);
            params.push(val.split('like.')[1]);
        } else if (val.startsWith('ilike.')) {
            whereClause.push(`${key} LIKE ?`); // SQLite LIKE is case-insensitive for ASCII
            params.push(val.split('ilike.')[1]);
        } else if (val.startsWith('in.')) {
            // in.(val1,val2)
            const raw = val.split('in.')[1];
            const clean = raw.replace('(', '').replace(')', '');
            const values = clean.split(',');
            if (values.length > 0) {
                const placeholders = values.map(() => '?').join(',');
                whereClause.push(`${key} IN (${placeholders})`);
                params.push(...values);
            }
        } else {
            // Default eq
            whereClause.push(`${key} = ?`);
            params.push(val);
        }
    });

    if (whereClause.length > 0) {
        query += " WHERE " + whereClause.join(" AND ");
    }

    if (reqQuery.order) {
        // order=col.desc
        const [col, dir] = reqQuery.order.split('.');
        query += ` ORDER BY ${col} ${dir.toUpperCase()}`;
    }

    if (reqQuery.limit) {
        query += " LIMIT ?";
        params.push(Number(reqQuery.limit));
    }

    return { query, params };
}

// GET /rest/v1/:table
app.get('/rest/v1/:table', (req, res) => {
    const table = req.params.table;
    // Map 'profiles' to 'users' for our simplified schema
    const dbTable = table === 'profiles' ? 'users' : table;

    let sql = `SELECT * FROM ${dbTable}`;
    let params = [];

    try {
        const built = applyFilters(sql, req.query, params);

        db.all(built.query, built.params, (err, rows) => {
            if (err) return res.status(400).json({ error: err.message });

            // Should usually return array, but if 'single' header or limit=1 ??
            // Supabase returns array by default.

            // If header Prefer: count=exact, we should return count? 
            // Simplified: Just return rows.

            res.json(rows);
        });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// POST /rest/v1/:table
app.post('/rest/v1/:table', (req, res) => {
    const table = req.params.table;
    const dbTable = table === 'profiles' ? 'users' : table;
    const data = req.body;

    // Auto-generate ID if not present
    if (!data.id) data.id = Math.random().toString(36).substr(2, 9);

    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(',');

    const sql = `INSERT INTO ${dbTable} (${keys.join(',')}) VALUES (${placeholders})`;

    db.run(sql, values, function (err) {
        if (err) return res.status(400).json({ error: err.message });

        // Emit Real-time Event
        io.emit('db-change', {
            table: dbTable,
            eventType: 'INSERT',
            new: data
        });

        res.status(201).json(data); // Supabase returns inserted data if select=...
    });
});

// PATCH /rest/v1/:table (Update)
app.patch('/rest/v1/:table', (req, res) => {
    const table = req.params.table;
    const dbTable = table === 'profiles' ? 'users' : table;
    const data = req.body;
    const queryParams = req.query; // Usually contains the ID to update e.g. ?id=eq.123

    const updates = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const values = Object.values(data);

    let sql = `UPDATE ${dbTable} SET ${updates}`;

    const { query, params } = applyFilters(sql, queryParams, values);

    db.run(query, params, function (err) {
        if (err) return res.status(400).json({ error: err.message });

        // Emit Real-time Event
        io.emit('db-change', {
            table: dbTable,
            eventType: 'UPDATE',
            new: data, // Note: This is just the changes, not full record. Sufficient for trigger.
            id: queryParams.id ? queryParams.id.split('.').pop() : null
        });

        res.json({ message: "Updated", changes: this.changes });
    });
});

const fs = require('fs');
const path = require('path');

// Multer for file uploads
const multer = require('multer');

// Configure Multer to preserve file extensions
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Use the key from the request parameter if available (mimicking Supabase path) or original name
        // Supabase upload URL: /storage/v1/object/{bucket}/{wildcard}
        // But multer runs before route params are fully parsed sometimes, depending on setup.
        // Simplest: Use original name + timestamp to avoid collisions
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
const upload = multer({ storage: storage });

// Static serving of uploads
// Access via: http://localhost:3000/storage/v1/object/public/issue-images/filename
// We will just serve the 'uploads' directory at that base path for simplicity
app.use('/storage/v1/object/public/issue-images', express.static('uploads'));

// Verify uploads dir exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// --- Storage Upload Route (Mocking Supabase) ---
// POST /storage/v1/object/:bucket/:filename
app.post('/storage/v1/object/:bucket/:filename', upload.single('file'), (req, res) => {
    console.log(`[Storage] Upload to bucket: ${req.params.bucket}, content: ${req.params.filename}`);
    if (req.file) {
        // Return the path that matches our static serve route
        // We aren't preserving the exact user-provided text path for the filename on disk for security/simplicity,
        // but we return the filename we saved so the client can save THAT to the database.
        // WAIT: Supabase expects us to return the 'path' (key) we asked for.
        // But since we randomized the name on disk, we have a mismatch.
        // Let's just return the filename we saved as the 'Key'.

        console.log('[Storage] Saved as:', req.file.filename);
        res.status(200).json({
            Key: `${req.params.bucket}/${req.file.filename}`,
            path: req.file.filename // We'll rely on this returning the actual filename
        });
    } else {
        res.status(400).json({ error: "No file uploaded" });
    }
});

// --- AI Mock Function ---
app.post('/functions/v1/analyze-image', upload.single('file'), (req, res) => {
    console.log('[AI] Received request /functions/v1/analyze-image');
    if (req.file) console.log('[AI] File received:', req.file.path, req.file.size);
    else console.log('[AI] No file received!');
    // In a real scenario, we would pass req.file.path to a Python script
    // E.g., const { exec } = require('child_process');
    // exec(`python3 predict.py ${req.file.path}`, ...)

    // Simulate AI Latency
    setTimeout(() => {
        const classes = [
            { label: 'Transformer Sparking', priority: 'High', desc: 'Sparks detected near transformer unit. Critical fire hazard.' },
            { label: 'Short Circuit', priority: 'High', desc: 'Visible arc flash or burn marks consistent with short circuit.' },
            { label: 'Pole Fallen', priority: 'High', desc: 'Utility pole detected in non-vertical position. Immediate obstruction.' },
            { label: 'Broken Meter Box', priority: 'Medium', desc: 'Energy meter enclosure appears damaged or tampered.' }
        ];

        // Random prediction for demo
        const prediction = classes[Math.floor(Math.random() * classes.length)];
        const confidence = (Math.random() * (99 - 85) + 85).toFixed(1);

        console.log(`[AI] Analyzed image. Prediction: ${prediction.label} (${confidence}%)`);

        res.json({
            prediction: prediction.label,
            confidence: confidence,
            priority: prediction.priority,
            description: prediction.desc
        });
    }, 1500);
});

// --- Start Server ---
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Local Backend running on http://0.0.0.0:${PORT}`);
});
