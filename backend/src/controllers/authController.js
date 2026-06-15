const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require('../models/User');
const { encrypt, decrypt } = require('../utils/crypto');

const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

function buildUserPayload(user) {
    // Encrypt the email before sending to frontend
    const encryptedEmail = encrypt(user.email);
    return {
        id: user._id,
        name: user.name,
        encryptedEmail,
        role: user.role
    };
}

function signAccessToken(user) {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );
}

function signRefreshToken(user) {
    if (!['staff', 'admin'].includes(user.role)) return null;
    return jwt.sign(
        { id: user._id, role: user.role, purpose: 'refresh' },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );
}

function buildAuthResponse(user) {
    const refreshToken = signRefreshToken(user);
    return {
        token: signAccessToken(user),
        ...(refreshToken ? { refreshToken } : {}),
        user: buildUserPayload(user)
    };
}



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

        res.status(201).json(buildAuthResponse(user));
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
        let email, password;
        
        // Decrypt the encrypted payload if present
        if (req.body.encryptedData) {
            try {
                const decryptedData = decrypt(req.body.encryptedData);
                const parsedData = JSON.parse(decryptedData);
                email = parsedData.email;
                password = parsedData.password;
            } catch (decryptError) {
                console.error('Decryption error:', decryptError);
                return res.status(400).json({ message: 'Dữ liệu mã hóa không hợp lệ' });
            }
        } else {
            // Fallback to unencrypted data for backward compatibility
            email = req.body.email;
            password = req.body.password;
        }
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Thiếu email hoặc mật khẩu' });
        }
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password)))
            return res.status(401).json({ message: 'Sai email hoặc mật khẩu' });

        if (user.isActive === false) {
            return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Quản trị viên.' });
        }
        
        res.json(buildAuthResponse(user));
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Đăng nhập thất bại' });
    }
}

exports.refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: 'Thiếu refresh token' });
        }

        const payload = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
        );

        if (payload.purpose !== 'refresh' || !['staff', 'admin'].includes(payload.role)) {
            return res.status(401).json({ message: 'Refresh token không hợp lệ' });
        }

        const user = await User.findById(payload.id);
        if (!user || user.role !== payload.role || !['staff', 'admin'].includes(user.role)) {
            return res.status(401).json({ message: 'Refresh token không hợp lệ' });
        }

        return res.json(buildAuthResponse(user));
    } catch (error) {
        console.error('Refresh token error:', error);
        return res.status(401).json({ message: 'Refresh token hết hạn hoặc không hợp lệ' });
    }
}

exports.logout = async (req, res) => {
    try {
        res.json({ message: 'Đăng xuất thành công' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Đăng xuất thất bại' });
    }
}
