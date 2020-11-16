var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'safieddinemhd@gmail.com',
    pass: 'ghassan62131121'
  }
});

const welcomeEmail = async(email, username, URL) => {
    try{
      var mailOptions = {
        from: 'safieddinemhd@gmail.com',
        to: email,
        subject: 'Welcome to Task Manager',
        html: `<h1>thank you ${username} for signing in !<h1><p>please validate your account by clicking the following url :\n ${URL}</p> `
      };
      const message = await transporter.sendMail(mailOptions) 
      return message
    }catch(e){
      return "error"
    }
};
module.exports = welcomeEmail