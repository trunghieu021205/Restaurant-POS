const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const bcrypt = require('bcryptjs');
const connectDB = require('./utils/db');
const User = require('./models/User');

const [,, emailArg, passwordArg, nameArg] = process.argv;
const email = emailArg;
const password = passwordArg;
const name = nameArg || 'Admin User';

if (!email || !password) {
    console.error('Usage: node src/createAdmin.js admin@gmail.com Secret123 "Administrator"');
    process.exit(1);
}

(async () => {
    await connectDB();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        existingUser.role = 'admin';
        existingUser.name = name;
        await existingUser.save();
        console.log(`Updated existing user ${email} to role=admin`);
        process.exit(0);
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, role: 'admin' });
    console.log('Admin user created:');
    console.log(`  id: ${user._id}`);
    console.log(`  email: ${user.email}`);
    console.log(`  role: ${user.role}`);
    process.exit(0);
})().catch((error) => {
    console.error('Error creating admin user:', error);
    process.exit(1);
});