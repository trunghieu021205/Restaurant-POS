const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require('../models/User')

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hash });
        res.status(201).json({ id: user._id, email: user.email });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password)))
            return res.status(401).json({ message: 'Sai email hoặc mật khẩu' });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        res.json({ token, role: user.role, name: user.name });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
