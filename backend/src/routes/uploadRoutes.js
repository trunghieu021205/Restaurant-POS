const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { upload } = require('../utils/cloudinary');
const requiredRole = require('../middleware/roleMiddleware');

router.post('/', authMiddleware, requiredRole(['admin']), upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Chọn một file để tải lên' });
        }

        res.status(200).json({ imageUrl: req.file.path });
    } catch (err) {
        console.error('Lỗi tải lên:', err);
        res.status(500).json({ message: 'Không thể upload ảnh, vui lòng thử lại!' });
    }
});

module.exports = router;
