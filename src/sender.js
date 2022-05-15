const config = JSON.parse(require('fs').readFileSync('config.json'));

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: config.sender_service,
    host: config.sender_host,
    auth: {
      user: config.sender_email,
      pass: config.sender_pass
    }
});

function send(to, html, subject) {
    var mailOptions = {
        from: config.sender_email,
        to: to,
        subject: subject,
        text: html
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log('Failed to send email.');
        } else {
          console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = {send, config};