const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

require('dotenv').config()

const index = require('./routes/index/index')
const repo = require('./routes/repo/repo')
const apiAuth = require('./routes/api/auth/index')

const app = express()
const server = require('http').createServer(app)

const { PORT } = process.env

const wesh = console.log

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, '../public')))

app.use('/', index)
app.use('/api/repo', repo)
app.use('/api/auth', apiAuth)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

const handleError = (err) => {
  wesh(err)
  process.exit(1)
}

const listenHandler = err => err ? handleError(err) : wesh(`App listen to ${PORT || 3000}`)

server.listen(PORT || 3000, listenHandler)
