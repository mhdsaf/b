var nodemailer = require('nodemailer');

const sendEmail = async (body)=>{
    try{
        var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'safieddinemhd@gmail.com',
            pass: 'Ghassan62131121'
        }
        });
        var mailOptions = {
        from: 'safieddinemhd@gmail.com',
        to: 'hsenwehbe1@gmail.com',
        subject: 'confirmation',
        html: '<h1>Welcome</h1><p>That was easy!</p>'
        };
        const message = await transporter.sendMail(mailOptions)
        console.log(message.messageId)
    }catch(e){
        console.log(e)
    }
}
// module.exports = sendEmail
sendEmail()