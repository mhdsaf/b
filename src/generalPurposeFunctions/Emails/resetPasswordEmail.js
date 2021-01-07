var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: 'alhussein_99@hotmail.com',
    pass: './q1m2n3/.'
  }
});

const resetPassword = async(email, token) => {
    try{
      var mailOptions = {
        from: 'alhussein_99@hotmail.com',
        to: email,
        subject: 'Password Reset',
        html: `<h1>Hello ${email}</h1><p>As per your request, please click on the below link to reset your password. Note that the link is valid for 1 hour only.</p> <a href=http://localhost:3000/resetpassword/${token}>Reset password</a>`
      };
      const message = await transporter.sendMail(mailOptions)
      console.log('mail sent')
      return message
    }catch(e){
      return "error"
    }
};
module.exports = resetPassword