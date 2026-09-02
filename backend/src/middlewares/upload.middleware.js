const multer = require('multer');
const path = require('path');
const fs = require('fs');
const env = require('../config/env');

// ======================================================
// VERCEL / LOCAL UPLOAD PATH
// ======================================================

// Vercel serverless filesystem only allows temporary writes in /tmp.
// Local development continues to use backend/src/uploads.
const isVercel = !!process.env.VERCEL;

const uploadBaseDir = isVercel
  ? path.join('/tmp', 'uploads')
  : path.join(__dirname, '../uploads');

// ======================================================
// ENSURE ALL UPLOAD DIRECTORIES EXIST
// ======================================================

const uploadFolders = [
  'categories',
  'contests',
  'profile_pics',
  'adhar_images',
  'others',
];

uploadFolders.forEach(folder => {
  try {
    const dir = path.join(uploadBaseDir, folder);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (error) {
    // Non-fatal warning on read-only environments
    console.warn(`Upload directory note (${folder}):`, error.message);
  }
});


// Memory storage works across Vercel, Docker, Serverless, and Localhost reliably
const storage = multer.memoryStorage();


// ======================================================
// FILE FILTER
// ======================================================

const fileFilter = (req, file, cb) => {

  const allowedImageMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/svg+xml',
  ];

  const allowedDocMimes = [
    'text/csv',
    'application/vnd.ms-excel',
    'text/plain',
    'application/csv',
  ];

  const ext =
    path.extname(
      file.originalname
    ).toLowerCase();


  // CSV question bank upload
  if (
    file.fieldname === 'file' ||
    ext === '.csv'
  ) {

    if (
      allowedDocMimes.includes(
        file.mimetype
      ) ||
      ext === '.csv'
    ) {
      return cb(null, true);
    }

    return cb(
      new Error(
        'Only CSV files are allowed for question bank upload'
      ),
      false
    );
  }


  // Image uploads
  if (
    allowedImageMimes.includes(
      file.mimetype
    ) ||
    [
      '.jpg',
      '.jpeg',
      '.png',
      '.webp',
      '.svg',
    ].includes(ext)
  ) {

    return cb(null, true);
  }


  return cb(
    new Error(
      'Only JPG, JPEG, PNG, WEBP, and SVG image files are allowed'
    ),
    false
  );
};


// ======================================================
// MULTER CONFIGURATION
// ======================================================

const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize:
      env?.upload?.maxSize ||
      5 * 1024 * 1024,
  },
});


module.exports = upload;