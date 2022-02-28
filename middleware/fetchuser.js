const jwt = require('jsonwebtoken')
const JWT_SECRET = "Harryisagoodboy"
const { model } = require('mongoose')
const fetchuser = (req, res, next) => {
    const token = req.header('auth-token')
    if (!token) {
        res.status(401).send({ error: " Please authenticate usig a valid token" })
    }
    try {
        const data = jwt.verify(token, JWT_SECRET)
        req.user = data.user

        next()

    } catch (error) {
        res.status(401).send({ error: " Please authenticate usig a valid token" })
    }

}
module.exports = fetchuser