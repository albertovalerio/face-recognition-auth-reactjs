const jwt = require("jsonwebtoken")
const { TOKEN_KEY } = process.env

const verifyToken = async (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers['X-Access-Token']

    if (!token) {
        return res.status(403).send('Missing token.')
    }
    try {
        const decoded = await jwt.verify(token, TOKEN_KEY)
        req.user = decoded
    } catch (err) {
        return res.status(401).send('Session timed out or invalid token. Please log in.')
    }
    return next()
}

module.exports = verifyToken