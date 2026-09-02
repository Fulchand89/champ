const fs = require('fs');
const path = require('path');

const optimizeImage = async (req, res, next) => {
  const filesToProcess = [];
  
  if (req.file) {
    filesToProcess.push(req.file);
  } else if (req.files) {
    for (const key in req.files) {
      const files = req.files[key];
      if (Array.isArray(files)) {
        files.forEach(file => filesToProcess.push(file));
      } else if (files) {
        filesToProcess.push(files);
      }
    }
  }

  if (filesToProcess.length === 0) return next();

  let sharp;
  try {
    sharp = require('sharp');
  } catch (err) {
    console.warn('Sharp module not available on this environment, bypassing image optimization:', err.message);
    return next();
  }

  try {
    await Promise.all(filesToProcess.map(async (file) => {
      if (!file || !file.path || !fs.existsSync(file.path)) return;

      const ext = path.extname(file.originalname || '').toLowerCase();
      if (
        file.mimetype === 'image/svg+xml' ||
        ext === '.svg' ||
        (!file.mimetype?.startsWith('image/') && !['.jpg', '.jpeg', '.png', '.webp', '.svg'].includes(ext))
      ) {
        return;
      }

      const originalPath = file.path;
      const parsedPath = path.parse(originalPath);
      
      const newFilename = `${parsedPath.name}-opt.webp`;
      const newPath = path.join(parsedPath.dir, newFilename);

      try {
        await sharp(originalPath)
          .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true }) 
          .webp({ quality: 85, effort: 4 })
          .toFile(newPath);

        if (fs.existsSync(originalPath) && originalPath !== newPath) {
          try { fs.unlinkSync(originalPath); } catch (err) {}
        }

        file.path = newPath;
        file.filename = newFilename;
        file.mimetype = 'image/webp';
        
        try {
          file.size = fs.statSync(newPath).size;
        } catch (statErr) {}
      } catch (sharpErr) {
        console.warn(`Sharp processing skipped for ${file.originalname}:`, sharpErr.message);
      }
    }));

    next();
  } catch (error) {
    console.warn('Image optimization notice:', error.message);
    next();
  }
};

module.exports = optimizeImage;
