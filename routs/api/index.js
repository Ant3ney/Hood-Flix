let router = require('express').Router();


router.get('/addChannel', (req, res) => {

    
    res.send('In api add chanel route');
});

module.exports = router;