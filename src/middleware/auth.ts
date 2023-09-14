import jwt = require('jsonwebtoken');

const authMiddleWare = (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.status(401).json({
                message: 'Auth failed: please provide token'
            })
        }
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            message: 'Auth failed: invalid token'
        })
    }
}

export default authMiddleWare;
