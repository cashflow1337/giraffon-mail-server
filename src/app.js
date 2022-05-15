const store = require('./store');
const SMTPServer = require("smtp-server").SMTPServer;
const parser = require("mailparser").simpleParser

const server = new SMTPServer({
    onData(stream, session, callback) {
        parser(stream, {}, (err, parsed) => {
            if (err) {
                console.log("Error:", err);
            }
            store.onEmail(parsed);
            stream.on("end", callback)
        })

    },
    disabledCommands: ['AUTH']
});

server.listen(25, require('./sender').config.public_ip)
console.log('SMTP server listening on port 25');

require('./api');