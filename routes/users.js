var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/tits', function(req, res, next) {
  res.send('respond with a resource you morgan');
});

module.exports = router;
