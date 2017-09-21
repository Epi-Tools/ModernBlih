const express = require('express')

const router = express.Router()

router.get('/', (_, res) => res.send('respond with a resource'))

module.exports = router
