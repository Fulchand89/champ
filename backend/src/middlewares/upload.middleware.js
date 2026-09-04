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
  if (!file || !file.originalname) {
    return cb(null, true);
  }

  const ext = path.extname(file.originalname).toLowerCase();

  // Reject only dangerous executable extensions
  const dangerousExts = ['.exe', '.sh', '.bat', '.php', '.py', '.js', '.bin', '.cmd'];
  if (dangerousExts.includes(ext)) {
    return cb(
      new Error('Executable or script files are not allowed'),
      false
    );
  }

  // Accept all image formats and valid documents
  return cb(null, true);
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