const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require('../models/User')



exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email đã được sử dụng' });
        }
        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hash, role: 'user' });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({ token, 
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
         });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Đăng ký thất bại' });
    }
}

exports.registerStaff = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email đã được sử dụng' });
        }
        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hash, role: 'staff' });

        res.status(201).json({
            message: 'Tạo tài khoản staff thành công',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Register staff error:', error);
        res.status(500).json({ message: 'Tạo tài khoản staff thất bại' });
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Thiếu email hoặc mật khẩu' });
        }
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password)))
            return res.status(401).json({ message: 'Sai email hoặc mật khẩu' });

        if (user.isActive === false) {
            return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Quản trị viên.' });
        }
        
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        res.json({ token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Đăng nhập thất bại' });
    }
}
