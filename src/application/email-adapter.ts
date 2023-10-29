//import { nodemailer } from 'nodemailer';

import nodemailer from 'nodemailer'
import { Injectable } from "@nestjs/common"

@Injectable()
export class EmailAdapter {
    async sendEmail(email: string, subject: string, code: string) {
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
            user: 'shamilov.irek.back@gmail.com',
            pass: 'pxaubouunpscxztw'
            }
        });


        await transporter.sendMail({
            from: '"Irek " <shamilov.irek.back@gmail.com>', // sender address
            to: email, // list of receivers
            subject: subject, // Subject line
            // text: message, // plain text body
            html: `<h1>Thank for your registration</h1> <p>To finish registration please follow the link below: <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a> </p>`
        })
        
    }

    async passwordRecovery(email: string, subject: string, recoveryCode: string) {
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
            user: 'shamilov.irek.back@gmail.com',
            pass: 'pxaubouunpscxztw'
            }
        });


        await transporter.sendMail({
            from: '"Irek " <shamilov.irek.back@gmail.com>', // sender address
            to: email, // list of receivers
            subject: subject, // Subject line
            // text: message, // plain text body
            html: `<h1>Password recovery</h1> <p>To finish password recovery please follow the link below:<a href='https://somesite.com/password-recovery?recoveryCode=${recoveryCode}'>recovery password</a> </p>`
            
            })
        
    }
    
}
