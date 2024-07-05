const {
    verifyToken
} = require("../Utils/jwt.utils");

const usnauthorisedAccess = ['/login', '/register']
const usersRestriction = ['/all-users', '/search-user', '/remove-user', '/update-withdrawl', '/all-withdrawls'];
const sellerRestriction = ['/'];

const authorize = async (req, res, next) => {
    try {
        const endpoint = req.url?.toString();

        const token = req.cookies.jwti || req.headers['authorization'];

        console.log('toka toka', token, req.headers, req.Authorization)
        if (!token) {
            if (usnauthorisedAccess.some(elem=> elem == endpoint)) {
                return next()
            } else {
                return res.status(401).send({
                    msg: "Invalid attempt missing auth token"
                })
            }
        }

        let data = await verifyToken(token);
        req.data = data;

        console.log(data)

        if (data.role == 'User' && req.baseUrl != '/api/v1') {
            console.log('v1')
            return res.status(402).send({
                msg: "You are not allowed to perform this action !"
            })
        } else if (data.role == 'Seller' && sellerRestriction.some(elem => elem == endpoint)) {
            console.log('v12')
            return res.status(402).send({
                msg: "You are not allowed to perform this action ! try anything else."
            })
        } else if (data.role == 'Manager') {
            console.log('v123')
            return res.status(402).send({
                msg: "You are not allowed to perform this action ! try anything else."
            })
        }

        next();
    } catch (error) {
        console.error('error in middle ware', error);
        return res.status(500).send({
            msg: error.message || 'Internal server error ! try later',
            error: error.message
        })
    }
}
module.exports = authorize;