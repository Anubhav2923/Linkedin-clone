import cloudinary from "../lib/cloudinary.js";
import User from "../models/user.model.js"

export const getSuggestedConnections = async(req, res)=> {

    try{
        const currentUser = await User.findById(req.user._id).select('connections');

        //find users who are not already connected, and also do not recommend our own profile 
        const suggestedUser = await User.find({
            _id: {
                $ne: req.user._id, $nin: currentUser.connections
            }
        }).select('name username profilePicture headline').limit(7);

        res.json(suggestedUser);
    } catch(error){
        console.log('Error in get SuggestedUser Controller', error);
        res.status(500).json({message: 'Server Error'});
    }
}

export const getPublicProfile = async(req, res)=> {
    try{
        const user = await User.findOne({
            username: req.params.username
        }).select('-password');

        if(!user){
            return res.status(404).json({message: 'User not found'});
        }

        res.json(user);

    } catch(error){
        console.log('Error in getPublicProfile Controller', error);
        res.status(500).json({message: 'Server Error'});
    }
}

export const updateProfile = async (req, res)=> {
    try{
        const allowedField =[
            'name',
            'headline',
            'about',
            'location',
            'profilePicture',
            'bannerImg',
            'skills',
            'experience',
            'education',
        ];

        const updatedData = {};

        for(const field of allowedField) {
            if(req.body[field]){
                updatedData[field]= req.body[field];
            }
        }

        //  check for the profileImg and banner img uploaded to cloudinary
        if(req.body.profilePicture) {
            const result = await cloudinary.uploader.upload(req.body.profilePicture)
            updatedData.profilePicture = result.secure_url;
        }

        if(req.body.bannerImg) {
            const result = await cloudinary.uploader.upload(req.body.bannerImg)
            updatedData.bannerImg = result.secure_url;
        }


        const user = await User.findByIdAndUpdate(req.user._id, 
            {$set: updatedData },
            {new : true}
        ).select('-password');
        
        res.json(user)
    } catch(error) {
        console.log('Error in updateProfile controller: ', error);
        res.status(500).json({message: 'Server Error'});
    }
}