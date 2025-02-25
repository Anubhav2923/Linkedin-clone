import { MailtrapClient } from "mailtrap";
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.MAIL_TRAP_TOKEN;

export const mailtrapClient = new MailtrapClient({
    token: TOKEN
})

export const sender = {
    email: process.env.EMAIL_FROM_MAIL,
    name: process.env.EMAIL_FROM_NAME
}