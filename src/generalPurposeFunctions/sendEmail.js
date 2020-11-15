var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'safov.safov@gmail.com',
    pass: 'ghassan123'
  }
});

const welcomeEmail = (email, username, URL) => {
    var mailOptions = {
        from: 'safieddinemhd@gmail.com',
        to: email,
        subject: 'Welcome to Task Manager',
        text: `Hello ${username.toUpperCase()}. Welcome to Task Manager Application. We hope that you have an excellent experience using our platform! Please take a few minutes to verify your account: jot--down.herokuapp.com/users/verify/${URL} `
    };
      
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
    });   
};
welcomeEmail('safieddinemhd@gmail.com', 'mhdsaf', 'aksdjhas')