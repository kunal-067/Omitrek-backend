require('dotenv').config();
const nodemailer = require('nodemailer');

// Create a transporter using your email service credentials
const omniEmail = process.env.OMNI_EMAIL ;
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: omniEmail ,
        pass: process.env.OMNI_EMAIL_PASSWORD
    }
});

async function sendMail(mail, subject, message) {
    if(!mail || message){
        throw error('missing parameter')
    }
    // Email content
    const mailOptions = {
        from: omniEmail ,
        to: mail ,
        subject: subject ,
        text: message
    };

    // Send the email
    transporter.sendMail(mailOptions, (error) => {
        if (error) {
            console.error('Error in sending email', error);
            throw error('error in sending mail at sendMail', error)
        } else {
            console.log('Email sent successfully');
        }
    });

}

module.exports = sendMail