import { sendConnectionAcceptedEmail } from "../emails/emailHandler.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";


export const sendConnectionRequest = async(req, res)=> {
    try{
        const {userId} = req.parms;
        const senderId = req.user._id;

        if(senderId.toString() === userId){
            return res.status(400).json({message: 'you cannot send  a request to yourself'});
        }
        if(req.user.connections.includes(userId)){
            return res.status(400).json({message: 'You are already connected'});
        }

        const existingRequest = await ConnectionRequest.findOne({
            sender: senderId,
            recipient: userId,
            status: 'pending',
        });

        if(existingRequest) {
            return res.status(400).json({message: 'A connection request already exits'});
        }

        const newRequest = new ConnectionRequest({
            sender: senderId,
            recipient: userId
        });

        await newRequest.save();
        res.status(201).json({message: 'Connection request sent successfully'});
    } catch(error) {
        res.status(500).json({message: 'Server Error'});
    }
}


export const acceptConnectionRequest = async(req,res)=> {
    try{
        const {requestId} = req.params;
        const userId = req.user._id;

        const request = await ConnectionRequest.findById(requestId)
        .populate('sender', 'name email username')
        .populate('recipient', 'name username')

        if(!request) {
            return res.status(400).json({message: 'Connection request not found'});
        }

        //check if the request is for current user
        if(request.recipient._id.toString()!== userId.toString()) {
            return res.status(400).json({message: 'Not authorized to accept this request'});
        }

        if(request.status !== 'pending') {
            return res.status(400).json({message: 'This request has already been procesed'})
        }

        request.status  = 'accepted';
        

        // update connection to both of the friend list connection list
        await User.findByIdAndUpdate(request.sender._id, {$addToSet: {connection: userId}});

        await User.findByIdAndUpdate(userId, {$addToSet: {connection: request.sender._id}});

        const notification = new Notification({
            recipient: request.sender._id,
            type: 'connectionAccepted',
            relateduser: userId,
        })

        await request.save();

        res.status(200).json({message: 'Connection request acepted successfully'})
        

        // send Email to the reciever for the connection accepted notification
        const senderEmail = request.sender.email;
        const senderName = request.sender.name;
        const recipientName = request.recipient.name;

        const profileUrl = process.env.CLIENT_URL + '/profile/'+ request.recipient.username;

        try{
            await sendConnectionAcceptedEmail(senderEmail, senderName, recipientName, profileUrl);
        } catch(error) {
            console.error('sendConnectionAcceptedEmail : ', error);
        }


    } catch(error){
        console.error('Error in acceptConnectionRequest controller : ', error);

        res.status(500).json({message: 'Server error'});
    }
}


export const rejectConnectionRequest = async(req,res)=> {
    try{
        const {requestId} = req.params;
        const userId = req.user._id;

        const request = await ConnectionRequest.findById(requestId);

        if(request.recipient.toString() !== userId.toString()) {
            return res.status(403).json({message: 'Not authorized to reject this request'});
        }

        if(request.status !== 'pending') {
            return res.status(400).json({message: 'This request has already been processed'});
        }

        request.status = 'rejected';
        await request.save();

        res.json({message:'Connection request rejected'});


    } catch(error) {
        console.error('Error in rejectConnectionRequest controller : ', error);
        res.status(500).json({message: 'Server Error'})
    }
}

export const getConnectionRequests = async(req,res)=> {
    try{
        const userId = req.user._id;

        const requests = await ConnectionRequest.find({
            recipient:userId,
            status: 'pending',
        })
        .populate('sender', 'name username profilePicture headline connections');

        res.json(requests);

    } catch(error){
        res.status(500).json({message: 'Server error'});
    }
}


export const  getUserConnection = async(req,res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId)
        .populate('connections', 'name username profilePicture headline connections');

        res.json(user.connections);

    } catch(error) {
        console.error('Error in getUserConection controller: ', error);
        res.status(500).json({message: 'Server Error'})
    }
} 


export const removeConnection = async(req,res) => {
    try{
        const myId = req.user._id;
        const {userId} = req.params;

        await User.findByIdAndUpdate(myId, {$pull: {connections: userId}});

        await User.findByIdAndUpdate(userId, {$pull: {connections: myId}});

        res.json({message: 'Connection removed successfully'});


    } catch(error) {
        console.error('Error in removeConnection controller: ', error);
        res.status(500).json({message: 'Server Error'})
    }
}

export const getConnectionStatus = async(req,res)=> {
    try{
        const targetUserId = req.params.userId;
        const currentuserId = req.usr._id;

        const currentUser = req.user;
        if(currentUser.connection.includes(targetUserId)){
            return res.json({status: 'connected'});
        }

        const pendingRequest = await ConnectionRequest.findOne({
            $or: [
                {sender: currentuserId, recipient: targetUserId},
                {sender: targetUserId, recipient: currentuserId}
            ],
            status: 'pending',
        })

        if(pendingRequest) {
            if(pendingRequest.sender.toString() === currentuserId.toString()) {
                return res.json({status: 'pending'});
            }
            else {
                return res.json({status: 'received', requestId: pendingRequest._id});
            }
        }

        // if no connection or pending req found
        res.json({status: 'not_connected'});
        
    } catch(error) {
        console.error('Error in getConnectionStatus controller: ', error);
        res.status(500).json({message: 'Server Error'})
    }
}