const express = require('express')
const Blih = require('../../utils/blih')
const R = require('ramda')

const router = express.Router()

const emailReg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const tokenValid = data => data.token.length >= 8 ? { value: true, ...data } : { value: false, error: 'Token must be at least 8 characters', ...data }

const emailValid = data => emailReg.test(data.email) ? { value: true, ...data } : { value: false, error: 'Wrong Email', ...data }

const nameValid = data => data.token.length >= 2 ? { value: true, ...data } : { value: false, error: 'Wrong Repo Name', ...data }

const aclValid = data => data.acl === true || data.acl === false ? { value: true, ...data } : { value: false, error: 'Wrong Acl', ...data }

const validateAdd = R.compose(emailValid, tokenValid, nameValid, aclValid)

const validateList = R.compose(emailValid, tokenValid)

const validateDelete = R.compose(emailValid, tokenValid, nameValid)

const addValidation = req => {
  const valid = validateAdd(req)
  const obj = {
    email: valid.email,
    token: valid.token,
    name: valid.name,
    acl: valid.acl
  }
  if (valid.error) return { status: false, error: valid.error, ...obj }
  return { status: true, ...obj }
}

const listValidation = req => {
  const valid = validateList(req)
  const obj = {
    email: valid.email,
    token: valid.token
  }
  if (valid.error) return { status: false, error: valid.error, ...obj }
  return { status: true, ...obj }
}

const deleteValidation = req => {
  const valid = validateDelete(req)
  const obj = {
    email: valid.email,
    token: valid.token,
    name: valid.name
  }
  if (valid.error) return { status: false, error: valid.error, ...obj }
  return { status: true, ...obj }
}

router.post('/list', (req, res) => {
  const { status, error, email, token } = listValidation(req.body)
  if (!status) {
    res.status = 401
    return res.json({ status: false, error })
  }
  const blih = new Blih(email, token)
  return blih.getRepositories((err, body) => {
    if (err === null || err === undefined) return res.json({ token, body })
    res.status = 500
    return res.json({ err })
  })
})

router.post('/create', (req, res) => {
  const { status, error, email, name, acl, token } = addValidation(req.body)
  if (!status) {
    res.status = 401
    return res.json({ status: false, error })
  }
  const blih = new Blih(email, token)
  return blih.createRepository(name, (err, body) => {
    if (err === null || err === undefined) {
      if (acl) return blih.setAcl(name, email, 'r', (_err, _body) => {
        if (err === null || err === undefined) return res.json({ token, _body })
        res.status = 500
        return res.json({ err })
      })
      return res.json({ token, body })
    }
    res.status = 500
    return res.json({ err })
  })
})

router.post('/delete', (req, res) => {
  const { status, error, email, token, name } = deleteValidation(req.body)
  if (!status) {
    res.status = 401
    return res.json({ status: false, error })
  }
  const blih = new Blih(email, token)
  return blih.deleteRepository(name, (err, body) => {
    if (err === null || err === undefined) return res.json({ token, body })
    res.status = 500
    return res.json({ err })
  })
})

router.post('/acl/list', (req, res) => {
  const { status, error, email, token, name } = deleteValidation(req.body)
  if (!status) {
    res.status = 401
    return res.json({ status: false, error })
  }
  const blih = new Blih(email, token)
  return blih.getAcl(name, (err, body) => {
    if (err === null || err === undefined) return res.json({ token, body })
    res.status = 500
    return res.json({ err })
  })
})

module.exports = router
