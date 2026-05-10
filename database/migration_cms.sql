-- =====================================================
-- CMS Migration: Banners, Promos, Announcements
-- Sanggar Bunda Sari
-- =====================================================

USE `sanggar_bunda_sari`;

-- =====================================================
-- 1. Table: banners
-- =====================================================
CREATE TABLE IF NOT EXISTS `banners` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL COMMENT 'Judul banner',
  `subtitle` VARCHAR(500) DEFAULT NULL COMMENT 'Subtitle/deskripsi singkat',
  `image_url` VARCHAR(500) DEFAULT NULL COMMENT 'Path gambar banner',
  `link_url` VARCHAR(500) DEFAULT NULL COMMENT 'URL tujuan saat diklik',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=aktif, 0=nonaktif',
  `sort_order` INT(11) NOT NULL DEFAULT 0 COMMENT 'Urutan tampil',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_active` (`is_active`),
  KEY `idx_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Banner carousel untuk homepage';

-- =====================================================
-- 2. Table: promos
-- =====================================================
CREATE TABLE IF NOT EXISTS `promos` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL COMMENT 'Judul promo',
  `description` TEXT DEFAULT NULL COMMENT 'Deskripsi promo',
  `discount_text` VARCHAR(100) DEFAULT NULL COMMENT 'Teks diskon (contoh: 20% OFF)',
  `image_url` VARCHAR(500) DEFAULT NULL COMMENT 'Path gambar promo',
  `start_date` DATE DEFAULT NULL COMMENT 'Tanggal mulai promo',
  `end_date` DATE DEFAULT NULL COMMENT 'Tanggal berakhir promo',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=aktif, 0=nonaktif',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_active` (`is_active`),
  KEY `idx_dates` (`start_date`, `end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Data promo dan penawaran';

-- =====================================================
-- 3. Table: announcements
-- =====================================================
CREATE TABLE IF NOT EXISTS `announcements` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL COMMENT 'Judul pengumuman',
  `message` TEXT NOT NULL COMMENT 'Isi pengumuman',
  `type` ENUM('info', 'warning', 'success') NOT NULL DEFAULT 'info' COMMENT 'Tipe pengumuman',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=aktif, 0=nonaktif',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Pengumuman yang tampil di halaman publik';

-- =====================================================
-- Sample Data
-- =====================================================
INSERT INTO `banners` (`title`, `subtitle`, `image_url`, `is_active`, `sort_order`) VALUES
('Pendaftaran Dibuka!', 'Segera daftarkan putra-putri Anda di Sanggar Bunda Sari', NULL, 1, 1),
('Program Baru: English Club', 'Belajar bahasa Inggris dengan metode fun learning', NULL, 1, 2);

INSERT INTO `promos` (`title`, `description`, `discount_text`, `start_date`, `end_date`, `is_active`) VALUES
('Diskon Awal Tahun', 'Dapatkan potongan biaya pendaftaran untuk semester baru', '20% OFF', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 1),
('Paket Bundling', 'Daftar 2 kelas sekaligus dan hemat lebih banyak', 'HEMAT 15%', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 1);

INSERT INTO `announcements` (`title`, `message`, `type`, `is_active`) VALUES
('Jadwal Baru Semester 2', 'Kelas semester 2 dimulai tanggal 1 Maret 2026. Pastikan untuk mengecek jadwal terbaru.', 'info', 1);

SELECT 'CMS Migration completed successfully!' AS message;
