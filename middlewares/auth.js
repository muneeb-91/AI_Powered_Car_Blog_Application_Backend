import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export const protect = async (req, res, next) => {
    try{
        const token = req.cookies.jwt_cba;
        // const token = req.headers.authorization.replace("Bearer ", "");

        if(!token){
            return res.status(401).json({message: "Not authorized - Token is not provided!"});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        if(!decoded){
            return res.status(400).json({message: "Not authorized - Invalid Token!"});
        }

        const user = await User.findById(decoded.id).select("-password");

        if(!user){
            return res.status(404).json({message: "User not found!"});
        }

        req.user = user;

        next();
    }catch(error){
        console.log("Error in protectRoute middleware: ", error.message);
        return res.status(500).json({message: "Internal server error!"});
    }
};

export default protect;