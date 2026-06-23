const { validateToken } = require("../services/authentication");

function checkForAuth(cookieName) {

    return (req, res, next) => {
        const cookieVal = req.cookies[cookieName];
        if (!cookieVal) {
            return next();
        }
        try {
            const userPayload = validateToken(cookieVal);
            req.user = userPayload;
        } catch (error) {
            console.log(error);
        }
        return next();
    };
}


module.exports = checkForAuth;