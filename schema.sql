DROP TABLE IF EXISTS members;
CREATE TABLE members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT DEFAULT '',
    photo_url TEXT DEFAULT '',
    paid_amount INTEGER DEFAULT 0,
    due_amount INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS contributors;
CREATE TABLE contributors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    amount TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS events;
CREATE TABLE events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS site_settings;
CREATE TABLE site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Default contribution month
INSERT INTO site_settings (key, value) VALUES ('contribution_month', 'JUNE');