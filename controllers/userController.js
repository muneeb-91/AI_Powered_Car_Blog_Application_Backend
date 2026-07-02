import User from "../models/userModel.js";
import {generateToken} from "../utils/generateToken.js";
import bcrypt from 'bcrypt';

export const register = async (req, res) => {
    const {name, email, password, confirm_password} = req.body;

    if(!name) throw 'Name is required';
    if(!email) throw 'Email is required';
    if(!password) throw 'Password is required';
    if(password.length < 6) throw 'Password should be at least 6 characters';
    if(!confirm_password) throw 'Please confirm the password';
    if(password !== confirm_password) throw "password doesn't match!";

    const getDuplicateEmail = await User.findOne({email: email});
    if(getDuplicateEmail) throw 'Email already exists!';

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const createdUser = await User.create({
        name,
        email,
        password: hashedPassword,
    })

    const accessToken = generateToken(createdUser._id, res);

    res.status(200).json({
        success: true,
        message: 'User registered successfully!',
        user:{_id: createdUser._id, name: createdUser.name, email:createdUser.email},
        accessToken: accessToken,
    })

};

export const login = async (req, res) => {
    
    const {email, password} = req.body;

    const getUser = await User.findOne({email: email});
    if(!getUser) throw 'Invalid Credentials!';

    const comparePassword = await bcrypt.compare(password, getUser.password);
    if(!comparePassword) throw 'Invalid Credentials!';

    const accessToken = generateToken(getUser._id, res);

    res.status(200).json({
        success: true,
        message: 'Login successful',
        user:{_id: getUser._id, name:getUser.name, email: getUser.email},
        accessToken,
    });
};

export const checkAuth = async (req, res) => {
  res.json(req.user);
};

export const logout = (req, res) => {
    res.cookie("jwt_cba", "", {maxAge: 0});
    res.status(200).json({
        message: 'Logout successfull'       
    })
}