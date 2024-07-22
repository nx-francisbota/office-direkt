const express = require('express');
const { logger } = require('../utils/logger');
const { scanDir } = require("../helpers/ftpconnector");
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/ftp', function(req, res, next) {
  scanDir().then(r => res.send("Scan Complete")).catch((err) => {
    console.error(err)
    logger.trace(err)
  });
});

module.exports = router;
