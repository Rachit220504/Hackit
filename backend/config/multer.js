const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Set storage engine
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    // Generate unique filename with original extension
    crypto.randomBytes(16, (err, buf) => {
      if (err) {
        return cb(err);
      }
      cb(null, buf.toString('hex') + path.extname(file.originalname));
    });
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|gif/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Images only (jpeg, jpg, png, gif)'));
  }
};

// Initialize multer
const upload = multer({
  storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter
});

module.exports = upload;
