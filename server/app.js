const express = require('express')
const bodyParser = require('body-parser')
const database = require('./lib/mongooseHelper')

const session = require('express-session')
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt')
const cors = require('cors')
const UserRouter = require('./api/user')
const user = require('./models/user.js')
const authcontroller = require('./auth/authcontroller')
const app = express()
const db = new database()
const Port = 3000

db.connect()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(cookieParser())
app.use(session({
  key: 'user_sid',
  secret: 'iy98hcbh489n38984y4h498',
  resave: true,
  saveUninitialized: false,
  cookie: {
    expires: new Date(Date.now() + 36000000),
    secure: false
  }
}))

app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
    res.clearCookie('user_sid')
  }
  next()
})
app.get('/', (req, res) => {
  res.send('Welcome to the Home of our APP')
})

app.use('/user', UserRouter)

/*app.use((req, res, next) => {
  if (req.session.user && req.cookies.user_sid) {
    next()
  } else {
    res.status(401).send('Authrization failed! Please login')
  }
})*/

app.get('/protected', authcontroller, (req, res) => {
  res.send('This page is protected')
})

app.listen(Port, () => {
  console.log('server is running')
})
