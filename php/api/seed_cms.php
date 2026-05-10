<?php
/**
 * CMS Seed — Isi data awal Banner, Promo & Pengumuman
 * Jalankan sekali: http://localhost/sistem-pendaftaran-siswa/php/api/seed_cms.php
 */

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../db.php';

$pdo = get_pdo();

// ===== AUTO-CREATE TABLES =====
$pdo->exec("
    CREATE TABLE IF NOT EXISTS banners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(500) DEFAULT NULL,
        image_url VARCHAR(500) DEFAULT NULL,
        link_url VARCHAR(500) DEFAULT NULL,
        is_active TINYINT(1) DEFAULT 1,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

$pdo->exec("
    CREATE TABLE IF NOT EXISTS promos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        discount_text VARCHAR(100) DEFAULT NULL,
        image_url VARCHAR(500) DEFAULT NULL,
        start_date DATE DEFAULT NULL,
        end_date DATE DEFAULT NULL,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

$pdo->exec("
    CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('info','warning','success') DEFAULT 'info',
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

$results = [];

// ===== BANNERS SEED =====
$bannerCount = $pdo->query("SELECT COUNT(*) FROM banners")->fetchColumn();
if ($bannerCount == 0) {
    $banners = [
        [
            'title'      => 'Selamat Datang di Sanggar Bunda Sari',
            'subtitle'   => 'Tempat terbaik untuk belajar seni dan budaya Indonesia',
            'image_url'  => null,
            'link_url'   => null,
            'sort_order' => 1,
            'is_active'  => 1,
        ],
        [
            'title'      => 'Pendaftaran Kelas Baru T.A. 2025/2026',
            'subtitle'   => 'Daftar sekarang dan dapatkan diskon spesial untuk pendaftar pertama',
            'image_url'  => null,
            'link_url'   => null,
            'sort_order' => 2,
            'is_active'  => 1,
        ],
        [
            'title'      => 'Program Tari, Musik & Drama',
            'subtitle'   => 'Pilih program sesuai minat dan bakat si kecil',
            'image_url'  => null,
            'link_url'   => null,
            'sort_order' => 3,
            'is_active'  => 1,
        ],
    ];

    $stmt = $pdo->prepare("INSERT INTO banners (title, subtitle, image_url, link_url, sort_order, is_active) VALUES (?,?,?,?,?,?)");
    foreach ($banners as $b) {
        $stmt->execute([$b['title'], $b['subtitle'], $b['image_url'], $b['link_url'], $b['sort_order'], $b['is_active']]);
    }
    $results['banners'] = count($banners) . ' banner berhasil ditambahkan';
} else {
    $results['banners'] = "Tabel banners sudah berisi {$bannerCount} data, seed dilewati";
}

// ===== PROMOS SEED =====
$promoCount = $pdo->query("SELECT COUNT(*) FROM promos")->fetchColumn();
if ($promoCount == 0) {
    $promos = [
        [
            'title'         => 'Promo Pendaftaran Awal Tahun 2025',
            'description'   => 'Daftar sebelum 31 Januari 2025 dan dapatkan diskon biaya pendaftaran sebesar 20%. Berlaku untuk semua program kelas.',
            'discount_text' => '20% OFF',
            'image_url'     => null,
            'start_date'    => '2025-01-01',
            'end_date'      => '2025-03-31',
            'is_active'     => 1,
        ],
        [
            'title'         => 'Gratis Seragam untuk Pendaftar Baru',
            'description'   => 'Setiap siswa baru yang mendaftar pada bulan April akan mendapatkan seragam latihan gratis senilai Rp150.000.',
            'discount_text' => 'GRATIS SERAGAM',
            'image_url'     => null,
            'start_date'    => '2025-04-01',
            'end_date'      => '2025-04-30',
            'is_active'     => 1,
        ],
        [
            'title'         => 'Diskon SPP Kakak-Adik',
            'description'   => 'Daftar 2 anak atau lebih dari keluarga yang sama dan dapatkan diskon SPP 15% untuk anak kedua dan seterusnya.',
            'discount_text' => '15% OFF SPP',
            'image_url'     => null,
            'start_date'    => null,
            'end_date'      => null,
            'is_active'     => 1,
        ],
    ];

    $stmt = $pdo->prepare("INSERT INTO promos (title, description, discount_text, image_url, start_date, end_date, is_active) VALUES (?,?,?,?,?,?,?)");
    foreach ($promos as $p) {
        $stmt->execute([$p['title'], $p['description'], $p['discount_text'], $p['image_url'], $p['start_date'], $p['end_date'], $p['is_active']]);
    }
    $results['promos'] = count($promos) . ' promo berhasil ditambahkan';
} else {
    $results['promos'] = "Tabel promos sudah berisi {$promoCount} data, seed dilewati";
}

// ===== ANNOUNCEMENTS SEED =====
$announcCount = $pdo->query("SELECT COUNT(*) FROM announcements")->fetchColumn();
if ($announcCount == 0) {
    $announcements = [
        [
            'title'     => 'Jadwal Libur Lebaran 2025',
            'message'   => 'Seluruh kegiatan belajar mengajar di Sanggar Bunda Sari akan diliburkan mulai tanggal 28 Maret – 6 April 2025 dalam rangka Hari Raya Idul Fitri 1446 H. Kegiatan akan kembali normal pada tanggal 7 April 2025.',
            'type'      => 'info',
            'is_active' => 1,
        ],
        [
            'title'     => 'Pembayaran SPP Bulan April 2025',
            'message'   => 'Pembayaran SPP bulan April 2025 dibuka mulai tanggal 1 April s/d 10 April 2025. Pembayaran setelah tanggal 10 akan dikenakan denda administrasi sebesar Rp10.000. Harap segera melakukan pembayaran tepat waktu.',
            'type'      => 'warning',
            'is_active' => 1,
        ],
        [
            'title'     => 'Selamat! Sanggar Terbaik Provinsi 2024',
            'message'   => 'Dengan bangga kami mengumumkan bahwa Sanggar Bunda Sari telah meraih penghargaan sebagai Sanggar Seni Terbaik tingkat Provinsi tahun 2024. Terima kasih atas kepercayaan dan dukungan seluruh orang tua dan siswa.',
            'type'      => 'success',
            'is_active' => 1,
        ],
        [
            'title'     => 'Penerimaan Siswa Baru T.A. 2025/2026',
            'message'   => 'Penerimaan siswa baru untuk Tahun Ajaran 2025/2026 akan dibuka mulai 1 Mei 2025. Tersedia program Tari Tradisional, Tari Modern, Paduan Suara, Teater, dan Alat Musik. Segera daftarkan putra-putri Anda sebelum kuota penuh.',
            'type'      => 'info',
            'is_active' => 1,
        ],
    ];

    $stmt = $pdo->prepare("INSERT INTO announcements (title, message, type, is_active) VALUES (?,?,?,?)");
    foreach ($announcements as $a) {
        $stmt->execute([$a['title'], $a['message'], $a['type'], $a['is_active']]);
    }
    $results['announcements'] = count($announcements) . ' pengumuman berhasil ditambahkan';
} else {
    $results['announcements'] = "Tabel announcements sudah berisi {$announcCount} data, seed dilewati";
}

echo json_encode(['success' => true, 'results' => $results], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
