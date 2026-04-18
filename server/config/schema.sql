-- DOTE Admission Management System - MySQL Schema
-- Run: mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS dote_admission CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dote_admission;

-- 1. Academic Years
CREATE TABLE IF NOT EXISTS academic_years (
  year_id INT AUTO_INCREMENT PRIMARY KEY,
  year_label VARCHAR(20) NOT NULL COMMENT '2025-26',
  is_active TINYINT(1) DEFAULT 0,
  app_open_date DATE NULL,
  app_close_date DATE NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Master Districts
CREATE TABLE IF NOT EXISTS master_districts (
  district_id INT AUTO_INCREMENT PRIMARY KEY,
  district_name VARCHAR(100) NOT NULL,
  state VARCHAR(100) DEFAULT 'Tamil Nadu',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Master Communities
CREATE TABLE IF NOT EXISTS master_communities (
  community_id INT AUTO_INCREMENT PRIMARY KEY,
  community_code VARCHAR(10) NOT NULL UNIQUE,
  community_name VARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. Master Castes
CREATE TABLE IF NOT EXISTS master_castes (
  caste_id INT AUTO_INCREMENT PRIMARY KEY,
  community_id INT NOT NULL,
  caste_name VARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (community_id) REFERENCES master_communities(community_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Colleges
CREATE TABLE IF NOT EXISTS colleges (
  college_id INT AUTO_INCREMENT PRIMARY KEY,
  college_code VARCHAR(20) NOT NULL UNIQUE,
  college_name VARCHAR(255) NOT NULL,
  address TEXT,
  district_id INT,
  gender_type ENUM('MALE','FEMALE','CO-ED') NOT NULL DEFAULT 'CO-ED',
  hostel_available TINYINT(1) DEFAULT 0,
  hostel_gender ENUM('MALE','FEMALE','BOTH') NULL,
  college_type ENUM('GOVERNMENT','AIDED','SELF_FINANCE') DEFAULT 'GOVERNMENT',
  phone VARCHAR(15),
  email VARCHAR(100),
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (district_id) REFERENCES master_districts(district_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 6. Courses
CREATE TABLE IF NOT EXISTS courses (
  course_id INT AUTO_INCREMENT PRIMARY KEY,
  college_id INT NOT NULL,
  course_code VARCHAR(20) NOT NULL,
  course_name VARCHAR(255) NOT NULL,
  intake_seats INT DEFAULT 60,
  duration_years INT DEFAULT 3,
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Users (Admin + College Staff)
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('SUPER_ADMIN','COLLEGE_STAFF') NOT NULL DEFAULT 'COLLEGE_STAFF',
  college_id INT NULL,
  is_active TINYINT(1) DEFAULT 1,
  last_login DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 8. Students
CREATE TABLE IF NOT EXISTS students (
  student_id INT AUTO_INCREMENT PRIMARY KEY,
  mobile VARCHAR(15) NOT NULL UNIQUE,
  email VARCHAR(150),
  password VARCHAR(255) NOT NULL,
  name VARCHAR(150),
  dob DATE,
  gender ENUM('MALE','FEMALE','OTHER'),
  aadhaar VARCHAR(12),
  religion VARCHAR(50),
  community_id INT,
  caste_id INT,
  -- Contact
  comm_address TEXT,
  comm_city VARCHAR(100),
  comm_district_id INT,
  comm_pincode VARCHAR(10),
  perm_address TEXT,
  perm_city VARCHAR(100),
  perm_district_id INT,
  perm_pincode VARCHAR(10),
  alt_mobile VARCHAR(15),
  -- Parent
  father_name VARCHAR(150),
  mother_name VARCHAR(150),
  parent_occupation VARCHAR(100),
  annual_income DECIMAL(10,2),
  -- Academic
  board VARCHAR(100),
  register_no VARCHAR(50),
  last_school VARCHAR(255),
  -- Admission
  admission_type ENUM('FIRST_YEAR','LATERAL','PART_TIME') DEFAULT 'FIRST_YEAR',
  hostel_required TINYINT(1) DEFAULT 0,
  -- Special
  is_differently_abled TINYINT(1) DEFAULT 0,
  is_ex_servicemen TINYINT(1) DEFAULT 0,
  is_sports_person TINYINT(1) DEFAULT 0,
  is_govt_school TINYINT(1) DEFAULT 0,
  -- OTP
  otp VARCHAR(6),
  otp_expires DATETIME,
  is_verified TINYINT(1) DEFAULT 0,
  -- Refresh token
  refresh_token TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (community_id) REFERENCES master_communities(community_id) ON DELETE SET NULL,
  FOREIGN KEY (caste_id) REFERENCES master_castes(caste_id) ON DELETE SET NULL,
  FOREIGN KEY (comm_district_id) REFERENCES master_districts(district_id) ON DELETE SET NULL,
  FOREIGN KEY (perm_district_id) REFERENCES master_districts(district_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 9. Applications
CREATE TABLE IF NOT EXISTS applications (
  application_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  year_id INT NOT NULL,
  application_no VARCHAR(30) UNIQUE,
  aadhaar_number VARCHAR(12) NULL,
  status ENUM('DRAFT','SUBMITTED','PAID','VERIFIED','ALLOCATED','REJECTED') DEFAULT 'DRAFT',
  submitted_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  FOREIGN KEY (year_id) REFERENCES academic_years(year_id) ON DELETE CASCADE,
  CONSTRAINT unique_aadhaar UNIQUE (aadhaar_number)
) ENGINE=InnoDB;

-- Migration for existing databases:
-- ALTER TABLE applications ADD COLUMN IF NOT EXISTS aadhaar_number VARCHAR(12) NULL;
-- ALTER TABLE applications ADD CONSTRAINT unique_aadhaar UNIQUE (aadhaar_number);

-- 10. Application College Preferences (N:M ordered)
CREATE TABLE IF NOT EXISTS application_colleges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  college_id INT NOT NULL,
  course_id INT,
  preference_order INT NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(application_id) ON DELETE CASCADE,
  FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 11. Marks
CREATE TABLE IF NOT EXISTS marks (
  mark_id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  subject_name VARCHAR(100) NOT NULL,
  marks_obtained DECIMAL(6,2) NOT NULL,
  max_marks DECIMAL(6,2) NOT NULL DEFAULT 100,
  exam_year VARCHAR(10),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(application_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 12. Payments
CREATE TABLE IF NOT EXISTS payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  order_id VARCHAR(100) NOT NULL UNIQUE,
  tracking_id VARCHAR(100),
  amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status ENUM('PENDING','SUCCESS','FAILED','ABORTED') DEFAULT 'PENDING',
  bank_ref_no VARCHAR(100),
  payment_mode VARCHAR(50),
  failure_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(application_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 13. Documents
CREATE TABLE IF NOT EXISTS documents (
  doc_id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  doc_type VARCHAR(50) NOT NULL COMMENT 'photo, marksheet, community_cert, etc.',
  file_path VARCHAR(500) NOT NULL,
  original_name VARCHAR(255),
  file_size INT,
  mime_type VARCHAR(100),
  is_verified TINYINT(1) DEFAULT 0,
  verified_by INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(application_id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 14. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  notif_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  type ENUM('EMAIL','SMS') DEFAULT 'EMAIL',
  subject VARCHAR(255),
  body TEXT,
  status ENUM('SENT','FAILED','PENDING') DEFAULT 'PENDING',
  sent_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Fee Structure table
CREATE TABLE IF NOT EXISTS fee_structures (
  fee_id INT AUTO_INCREMENT PRIMARY KEY,
  year_id INT NOT NULL,
  category VARCHAR(50) NOT NULL COMMENT 'GENERAL, SC, ST, OBC',
  amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (year_id) REFERENCES academic_years(year_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Indexes for performance
CREATE INDEX idx_applications_student ON applications(student_id);
CREATE INDEX idx_applications_year ON applications(year_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_app_colleges_app ON application_colleges(application_id);
CREATE INDEX idx_app_colleges_college ON application_colleges(college_id);
CREATE INDEX idx_marks_app ON marks(application_id);
CREATE INDEX idx_payments_app ON payments(application_id);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_colleges_gender ON colleges(gender_type);
CREATE INDEX idx_colleges_hostel ON colleges(hostel_available);
CREATE INDEX idx_students_mobile ON students(mobile);
