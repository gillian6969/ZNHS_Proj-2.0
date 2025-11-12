import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.body.type || 'general';
    let folder = 'uploads/';
    
    if (type === 'material' || file.fieldname === 'material') {
      folder += 'materials/';
    } else if (type === 'submission' || file.fieldname === 'submission') {
      folder += 'submissions/';
    }
    
    const fullPath = path.join(__dirname, '..', folder);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedMaterialTypes = /pdf|doc|docx|ppt|pptx|mp4/;
  const allowedSubmissionTypes = /pdf|doc|docx|jpg|jpeg|png/;
  
  const extname = path.extname(file.originalname).toLowerCase().substring(1);
  const mimetype = file.mimetype;
  
  let isAllowed = false;
  
  if (file.fieldname === 'material' || req.body.type === 'material') {
    isAllowed = allowedMaterialTypes.test(extname);
  } else if (file.fieldname === 'submission' || req.body.type === 'submission') {
    isAllowed = allowedSubmissionTypes.test(extname);
  } else {
    // Default: allow both
    isAllowed = allowedMaterialTypes.test(extname) || allowedSubmissionTypes.test(extname);
  }
  
  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Materials: PDF, DOC, DOCX, PPT, PPTX, MP4. Submissions: PDF, DOC, DOCX, JPG, PNG'));
  }
};

// Create multer upload middleware
export const uploadMaterial = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
  fileFilter: fileFilter
}).single('material');

export const uploadSubmission = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: fileFilter
}).single('submission');

// Avatar upload configuration
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = path.join(__dirname, '..', 'uploads', 'avatars');
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const avatarFileFilter = (req, file, cb) => {
  const allowedTypes = /jpg|jpeg|png|gif/;
  const extname = path.extname(file.originalname).toLowerCase().substring(1);
  
  if (allowedTypes.test(extname)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, PNG, and GIF are allowed.'));
  }
};

export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: avatarFileFilter
}).single('avatar');

