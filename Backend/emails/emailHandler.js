
import { mailtrapClient, sender } from "../lib/mail.trap.js"
import { createCommentNotificationEmailTemplate, createConnectionAcceptedEmailTemplate, createWelcomeEmailTemplate } from "./emailTemplates.js";

export const sendWelcomeEmail = async (email, name, profileUrl)=> {
    const recipent = [{email}]

    try{
        const response = await mailtrapClient.send({
            from: sender, 
            to: recipent,
            subject: "Welcome to DevConnect",
            html: createWelcomeEmailTemplate(name, profileUrl),
            category: 'welcome'
        })

        console.log('Welcome Email sent successfully', response);
    } catch (error) {
        throw(error);
    }
}

export const sendCommentNotificationEmail = async (
    recipentEmail, recipentName, commenterName, postUrl, commentContent
)=>{
    const recipent = [{email: recipentEmail}];

    try{
        const response = await mailtrapClient.send({
            from: sender,
            to: recipent,
            subject: 'New comment on your Post',
            html: createCommentNotificationEmailTemplate(
                recipentName, commenterName, postUrl, commentContent 
            ),
            category: 'Comment_Notification',
        })
    } catch(error) {

    }
}

export const sendConnectionAcceptedEmail = async(senderEmail, senderName, recipientName, profileUrl) => {
    const recipient= [{email: senderEmail}];
    try{    
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: `${recipientName} accepted your connection request`,
            html: createConnectionAcceptedEmailTemplate(senderName, recipientName,  profileUrl),
            category: 'Connection_Accepted',
        })

    } catch(error) {

    }
}