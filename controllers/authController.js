const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const {
    attachCookiesToResponse,
    createTokenUser,
} = require('../utils');

const register = async(req, res) => {
    const {
        email,
        name,
        password
    } = req.body;

    const isEmailAlreadyExist = await User.findOne({ email });
    if(isEmailAlreadyExist){
        throw new CustomError.BadRequestError('Email Already Exists');
    }

    const isFirstAccount = (await User.countDocuments({})) === 0;
    const role = isFirstAccount ? 'admin' : 'user';
    const user = await User.create({
        name,
        email,
        password,
        role
    });
    const userToken = createTokenUser(user);
    attachCookiesToResponse({ res, user: userToken });
    res.status(StatusCodes.CREATED).json({ user: userToken});

}


const login = async(req, res) => {

    const {
        email,
        password
    } = req.body;

    if(!email || !password){
        throw new CustomError.BadRequestError('Email and Password Cannot be empty');
    }
    const user = await User.findOne({ email });
    if(!user){
        throw new CustomError.UnauthenticatedError(`There is no Email with value : ${email}, Register to Create Account`);
    }
    const isPasswordCorrect = await user.comparePasswords(password);
    if(!isPasswordCorrect){
        throw new CustomError.UnauthenticatedError('Pasword Not Correct');
    }
    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({ res, user: tokenUser });
    res.status(StatusCodes.OK).json({ user: tokenUser });
}


const logout = async(req, res) => {

    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now() + 1000),
    });
    res.status(StatusCodes.OK).json({ msg: 'User Logged Out '});
}

module.exports = {
    register,
    login,
    logout,
};