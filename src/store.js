const send = require('./sender');

const emails = {};

function onEmail(obj) {
    const to = obj.to.text.toLowerCase();
    const html = obj.textAsHtml;

    const domain = to.split('@')[1];
    if (Object.keys(send.config.domains).includes(domain)) {
        send.send(send.config.domains[domain], html, obj.subject);
    }
    var log = true;

    if (Object.keys(emails).includes(to)) {
        const arr = emails[to];
        if (!arr.includes(html)) {
            arr.push(html);
        } else {
            log = false;
        }
    } else {
        emails[to] = [html];
    }

    if (log) {
        console.log(to + ': Received email from ' + obj.from.text);
    }
}

function getEmails(email, limit) {
    if (limit == null || limit == 0) {
        limit = 1;
    }

    email = email.toLowerCase();

    if (Object.keys(emails).includes(email)) {
        //console.log('Emails found: ' + emails[email].length + '.');
        if (limit == -1) {
            return emails[email];
        } else {
            sleep
            return emails[email].slice(-limit);
        }
    }
    return [];
}

module.exports = {onEmail, getEmails};