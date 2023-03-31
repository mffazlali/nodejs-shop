const expressJwt = require('express-jwt')

function authJwt() {
    const secret = process.env.secret
    const api = process.env.API_URL
    return expressJwt
        .expressjwt({
            secret,
            algorithms: ['HS256'],
            isRevoked: isRevoked,
        })
        .unless({
            path: [
                {
                    url: /\/public\/uploads(.*)/,
                    methods: ['GET', 'OPTIONS'],
                },
                {
                    url: /\/api\/v1\/products(.*)/,
                    methods: ['GET', 'OPTIONS'],
                },
                {
                    url: /\/api\/v1\/categories(.*)/,
                    methods: ['GET', 'OPTIONS'],
                },
                {
                    url: /\/api\/v1\/orders(.*)/,
                    methods: ['GET', 'OPTIONS', 'POST'],
                },
                `${api}/users/login`,
                `${api}/users/register`,
                // { url: /(.*)/ },
            ],
        })
}

function isRevoked(req, token) {
    // if (!token.payload.isAdmin) {
    //     return true
    // }
    return false
}

module.exports = authJwt
