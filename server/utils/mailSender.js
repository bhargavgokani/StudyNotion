const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
    try{

        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
              user: process.env.MAIL_USER,
              pass: process.env.MAIL_PASS,
            },
          });

          const info = await transporter.sendMail({
            from: 'StudyNotaion', // sender address
            to: `${email}`, // list of receivers
            subject: `${title}`, // Subject line
            // text: "Hello world", // plain text body
            html: `${body}`, 
          });
          console.log(info);
          return info;

    }catch(e){
        console.log(e);
    }
}

module.exports = mailSender;