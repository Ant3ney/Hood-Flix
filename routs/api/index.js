let router = require('express').Router();
let url = require('url')


router.get('/addChannel', (req, res) => {
    res.send('In api add chanel route');
});

module.exports = router;