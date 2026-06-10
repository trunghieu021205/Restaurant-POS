const requiredRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const role = req.user.role?.toLowerCase();
        const allowed = allowedRoles.map((allowedRole) => allowedRole.toLowerCase());
        if (!allowed.includes(role)) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        next();
    };
};

module.exports = requiredRole;
