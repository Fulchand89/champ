const multer = require('multer');
const path = require('path');
const fs = require('fs');
const env = require('../config/env');

// Ensure all upload directories exist
const uploadDirs = [
  path.join(__dirname, '../uploads/categories'),
  path.join(__dirname, '../uploads/contests'),
  path.join(__dirname, '../uploads/profile_pics'),
  path.join(__dirname, '../uploads/adhar_images'),
  path.join(__dirname, '../uploads/others'),
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'others';
    const url = (req.originalUrl || req.baseUrl || '').toLowerCase();

    if (file.fieldname === 'categoryImage' || url.includes('categor')) {
      folder = 'categories';
    } else if (file.fieldname === 'contestImage' || url.includes('contest')) {
      folder = 'contests';
    } else if (file.fieldname === 'profile_pic' || file.fieldname === 'profilePic') {
      folder = 'profile_pics';
    } else if (
      file.fieldname === 'adhar_images' ||
      file.fieldname === 'adharImages' ||
      file.fieldname === 'aadhar_images' ||
      file.fieldname === 'aadharImages'
    ) {
      folder = 'adhar_images';
    }

    const uploadPath = path.join(__dirname, `../uploads/${folder}`);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const ext = path.extname(sanitizedOriginalName).toLowerCase() || '.png';
    const prefix = file.fieldname || 'upload';
    cb(null, `${prefix}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedImageMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const allowedDocMimes = ['text/csv', 'application/vnd.ms-excel', 'text/plain', 'application/csv'];
  const ext = path.extname(file.originalname).toLowerCase();

  // If uploading question CSV template
  if (file.fieldname === 'file' || ext === '.csv') {
    if (allowedDocMimes.includes(file.mimetype) || ext === '.csv') {
      return cb(null, true);
    }
    return cb(new Error('Only CSV files are allowed for question bank upload'), false);
  }

  // Image uploads (categories, contests, avatars, branding)
  if (allowedImageMimes.includes(file.mimetype) || ['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
    return cb(null, true);
  }

  cb(new Error('Only JPG, JPEG, PNG, and WEBP image files are allowed'), false);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: env?.upload?.maxSize || 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = upload;