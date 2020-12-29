var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: 'alhussein_99@hotmail.com',
    pass: './q1m2n3/.'
  }
});

const welcomeEmail = async(email, fname, lname, token) => {
    try{
      var mailOptions = {
        from: 'alhussein_99@hotmail.com',
        to: email,
        subject: 'Welcome to LinkedEd',
        html: `<h1>Thank you ${fname} ${lname} for signing in!</h1><p>Please validate your account by clicking the following link:</p> <a>localhost:3000/students/verify/${token}</a>`
      };
      const message = await transporter.sendMail(mailOptions)
      console.log('mail sent')
      return message
    }catch(e){
      return "error"
    }
};
module.exports = welcomeEmail