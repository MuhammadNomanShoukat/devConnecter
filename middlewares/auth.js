const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req, res, next) => {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, config.get('jwtToken'));
        req.user = decoded.user ? decoded.user : null;
        next();
    } catch (err) {
        return res.status(401).send('Token is not valid');
    }
};
