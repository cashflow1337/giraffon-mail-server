const store = require('./store');
const express = require('express')
const app = express()
const port = 80

app.get('/getemail', (req, res) => {
    if (Object.keys(req.query)== 0) {
        res.status(400).send({
            error: 'Invalid Query'
        });
    } else {
        try {
            const email = (req.query.sub + '@' + req.query.domain).toLowerCase();
            var limit = 15;

            if (Object.keys(req.query).includes('limit')) {
                limit = parseInt(req.query.limit);
            }

            console.log(`Requested ${limit} email${limit == 1 ? '' : 's'} from ` + email);
            res.status(200).send(store.getEmails(email, limit));
        } catch {
            res.status(500).send({
                error: 'Internal Error'
            });
        }
    }
});

app.listen(port, () => {
    console.log(`Mail Server API listening at http://localhost:${port}`)
})