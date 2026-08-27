const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const ApiError = require('../shared/exceptions/ApiError');

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

  try {
    await Promise.all(filesToProcess.map(async (file) => {
      // Only process actual raster images (skip SVG, CSV, etc.)
      const ext = path.extname(file.originalname).toLowerCase();
      if (
        file.mimetype === 'image/svg+xml' ||
        (!file.mimetype.startsWith('image/') && !['.jpg', '.jpeg', '.png', '.webp'].includes(ext))
      ) {
        return;
      }

      const originalPath = file.path;
      const parsedPath = path.parse(originalPath);
      
      const newFilename = `${parsedPath.name}-opt.webp`;
      const newPath = path.join(parsedPath.dir, newFilename);

      // Compress and optimize image to WebP with max 800x800 bounding box
      await sharp(originalPath)
        .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true }) 
        .webp({ quality: 85, effort: 4 })
        .toFile(newPath);

      // Clean up raw unoptimized file
      try {
        if (fs.existsSync(originalPath) && originalPath !== newPath) {
          fs.unlinkSync(originalPath);
        }
      } catch (err) {
        console.error(`Failed to delete raw image: ${originalPath}`, err);
      }

      file.path = newPath;
      file.filename = newFilename;
      file.mimetype = 'image/webp';
      
      try {
        file.size = fs.statSync(newPath).size;
      } catch (statErr) {}
    }));

    next();
  } catch (error) {
    console.error('Image optimization failed:', error);
    next(new ApiError(500, `Failed to optimize image: ${error.message}`));
  }
};

module.exports = optimizeImage;
