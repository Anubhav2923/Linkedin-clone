import User from '../models/user.model.js'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendWelcomeEmail } from '../emails/emailHandler.js';

export const signupController = async(req, res)=> {
    try{
        const {name, username, email,password} = req.body;
        const existingEmail = await User.findOne({email});

        if(!name || !username || !email || !password) {
            return res.status(400).json({message: 'All fields are required'});
        }
        if(existingEmail){
            return res.status(400).json({message: 'Email Already exits'});
        }
        const existingUsername = await User.findOne({username});
        if(existingUsername){
            return res.status(400).json({message:'Username already exits'});
        }

        if(password.length<6) {
            return res.status(400).json({message: 'Password must be at least 6 characters long'});
        }
        
        //hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const user = new User({
            name,email , password: hashedPassword, username
        })
        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {expiresIn: '3d'});
        
        res.cookie('jwt-linkedin', token, {
            httpOnly: true,
            maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days in
            sameSite: 'strict',
            secure: process.env.NODE_ENV ==='production',
        })

        res.status(201).json({message: 'User registered Successfully'});

        const profileUrl = process.env.CLIENT_URL + '/profile/'+ user.username;

        // todo : send welcome Email
        try{
            await sendWelcomeEmail(user.email, user.name, profileUrl)
        } catch(emailError) {
            console.error('Error sending welcome Email:', emailError);
        }


    } catch (error) {
        console.log('Error in signup', error.messgage);
        res.status(500).json({message: 'Internal server error'});
    }
}

export const loginController = async(req, res)=> {
   try{
    const{username, password} = req.body;

    //check if user exists
    const user = await User.findOne({username});
    if(!user){
        return res.status(400).json({message: 'Invalid credentials'});
    }

    // const userEmail = User.findOne({email});
    // if(!userEmail){
    //     return res.status(400).json({message: 'Invalid credentials'});
    // }

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch){
        return res.status(400).json({message: 'Invalid credentials'});
    }

    //create and send token
    const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET,{expiresIn: '3d'});

    await res.cookie('jwt-linkedin', token, {
        httpOnly: true,
        maxAge: 3 * 24 * 60 * 60 * 1000,
        sameSite: 'strict',
        secure: process.env.NODE_ENV ==='production',
    });

    res.json({message: 'Logged in successfully'});

   } catch(error){
    console.error('Error in login controller:', error.message);
    res.status(500).json({message: 'server Error'});
   }
}

export const logoutController = (req, res)=> {
    res.clearCookie('jwt-linkedin');
    res.json({message: 'User logged out successfully'});
}

export const getCurrentUser = async(req, res)=> {
    try{
        res.json(req.user);
    } catch(error){
        console.log('Error in getCurrentuser controller', error);
        res.status(500).json({message: 'Server Error'});
    }
}