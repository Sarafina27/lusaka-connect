-- MySQL schema for Kuwala event platform

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(32) DEFAULT NULL,
  password_hash VARCHAR(128) NOT NULL,
  role ENUM('attendee', 'organizer', 'admin') NOT NULL DEFAULT 'attendee',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  slug VARCHAR(120) NOT NULL UNIQUE,
  description TEXT DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
  id VARCHAR(36) PRIMARY KEY,
  organizer_id VARCHAR(36) NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  venue VARCHAR(255) NOT NULL,
  event_date DATETIME NOT NULL,
  time VARCHAR(16) NOT NULL,
  badge VARCHAR(120) DEFAULT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  image_url VARCHAR(1024) DEFAULT NULL,
  capacity INT UNSIGNED NOT NULL DEFAULT 0,
  sold INT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('draft', 'published', 'cancelled') NOT NULL DEFAULT 'published',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  event_id VARCHAR(36) NOT NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  ticket_number VARCHAR(64) NOT NULL UNIQUE,
  qr_code TEXT DEFAULT NULL,
  delivery_channel ENUM('email', 'sms') NOT NULL,
  delivery_target VARCHAR(255) NOT NULL,
  status ENUM(
'pending_payment',
'paid',
'cancelled',
'refunded'
)
DEFAULT 'pending_payment'
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS saved_events (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  event_id VARCHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY user_event_unique (user_id, event_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  event_id VARCHAR(36) NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  comment TEXT DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(36) PRIMARY KEY,
  booking_id VARCHAR(36) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(64) NOT NULL,
  provider VARCHAR(64) DEFAULT NULL,
  status ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending',
  transaction_id VARCHAR(128) DEFAULT NULL,
  metadata JSON DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);
-- Stores Lusaka Connect commission earned from each payment
CREATE TABLE IF NOT EXISTS commissions (
  id VARCHAR(36) PRIMARY KEY,
  payment_id VARCHAR(36) NOT NULL,
  event_id VARCHAR(36) NOT NULL,

  commission_rate DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);


-- Stores every wallet movement
-- Credit = money added to organizer
-- Debit = money withdrawn

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id VARCHAR(36) PRIMARY KEY,

  organizer_id VARCHAR(36) NOT NULL,

  type ENUM('credit','debit') NOT NULL,

  amount DECIMAL(10,2) NOT NULL,

  reference_type ENUM(
    'ticket_sale',
    'withdrawal',
    'refund',
    'adjustment'
  ) NOT NULL,

  reference_id VARCHAR(36) NOT NULL,

  description VARCHAR(255),

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (organizer_id) REFERENCES users(id)
  ON DELETE CASCADE
);


-- Organizer requests money withdrawal

CREATE TABLE IF NOT EXISTS withdrawal_requests (

  id VARCHAR(36) PRIMARY KEY,

  organizer_id VARCHAR(36) NOT NULL,

  amount DECIMAL(10,2) NOT NULL,

  payment_method ENUM(
    'bank',
    'mobile_money'
  ) NOT NULL,

  account_name VARCHAR(255) NOT NULL,

  account_number VARCHAR(128) NOT NULL,

  status ENUM(
    'pending',
    'approved',
    'rejected',
    'paid'
  ) DEFAULT 'pending',

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  ON UPDATE CURRENT_TIMESTAMP,


  FOREIGN KEY (organizer_id)
  REFERENCES users(id)
  ON DELETE CASCADE

);


-- Records actual payouts made by admin

CREATE TABLE IF NOT EXISTS payouts (

  id VARCHAR(36) PRIMARY KEY,

  withdrawal_id VARCHAR(36) NOT NULL,

  amount DECIMAL(10,2) NOT NULL,

  payment_reference VARCHAR(128),

  status ENUM(
    'pending',
    'completed',
    'failed'
  ) DEFAULT 'pending',

  paid_at DATETIME DEFAULT NULL,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,


  FOREIGN KEY (withdrawal_id)
  REFERENCES withdrawal_requests(id)
  ON DELETE CASCADE

);

CREATE INDEX idx_events_category ON events(category_id);
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_event ON bookings(event_id);
CREATE INDEX idx_saved_events_user ON saved_events(user_id);
CREATE INDEX idx_reviews_event ON reviews(event_id);
CREATE INDEX idx_payments_status ON payments(status);
