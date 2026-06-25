import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ override: true });

const secret = process.env.SECRET;

function createTokenForUser(user)
{
    const payload = {
        _id : user._id,
        email : user.email,
        userName : user.userName
    }
    const token = jwt.sign(payload , secret, {
        expiresIn : "2d"
    });
    return token;   
}

function validateToken(token)
{
    const payload = jwt.verify(token , secret)
    return payload
}

export {
    createTokenForUser,
    validateToken
};