const express = require('express')
const R = require('ramda')
const Blih = require('../../../utils/blih')

const router = express.Router()

const emailReg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const pwdValid = data => data.pwd.length >= 8 ? { value: true, ...data } : { value: false, error: 'Password must be at least 8 characters', ...data }

const emailValid = data => emailReg.test(data.email) ? { value: true, ...data } : { value: false, error: 'Wrong Email', ...data }

const validateLogin = R.compose(emailValid, pwdValid)

const loginValidation = req => {
  const valid = validateLogin(req)
  if (valid.error) return { status: false, error: valid.error, email: valid.email, pwd: valid.pwd }
  return { status: true, email: valid.email, pwd: valid.pwd }
}

router.post('/', (req, res) => {
  const { status, error, email, pwd } = loginValidation(req.body)
  if (!status) {
    res.status = 401
    return res.json({ status: false, error })
  }
  const token = Blih.generateToken(pwd)
  const blih = new Blih(email, token)
  return blih.getRepositories((err, body) => {
    if (err === null || err === undefined) return res.json({ token, body })
    res.status = 500
    return res.json({ err })
  })
})

module.exports = router
