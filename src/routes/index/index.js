const express = require('express')

const router = express.Router()

router.get('/', (_, res) => res.render('index'))

module.exports = router
