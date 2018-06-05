const express = require('express')
const bcrypt = require('bcrypt')
const shortid = require('shortid')

const respy = require('../lib/respy')
const Mailer = require('../lib/mailer')
const User = require('../models/user')
const authcontroller = require('../auth/authcontroller')
const config = require('../config')
const UserRouter = express.Router()

UserRouter.post('/signup', (req, res) => {
  if (req.body.userName && req.body.email && req.body.password && req.body.firstName && req.body.lastName) {
    let {userName, firstName, lastName, email, password} = req.body
    let userData = {
      userName,
      password: bcrypt.hashSync(password, 5),
      firstName,
      lastName,
    email}
    createUser(req, res, userData)
  } else {
    respy.sendFail(res, 'MissingInfo')
  }
})

UserRouter.post('/login', (req, res) => {
  if (req.body.userName && req.body.password) {
    let userName = req.body.userName
    let password = req.body.password

    User.findOne({
      userName: userName
    }, 'userName email +password')
      .then((user) => {
        if (user) {
          bcrypt.compare(password, user.password)
            .then((comparedResult) => {
              if (comparedResult) {
                req.session.user = {
                  userName: user.userName,
                  email: user.email,
                  _id: user._id
                }
                req.session.user.expires = new Date(Date.now() + config.userSessionExpireTime)
                respy.sendSuccess(res, 'LoggedIn')
              } else {
                respy.sendFail(res, 'WrongPassword')
              }
            })
        } else {
          respy.sendFail(res, 'UserNotExist')
        }
      })
      .catch((err) => {
        console.error(err)
        respy.sendFail(res, 'UnexpectedError')
      })
  }
})

UserRouter.get('/all', (req, res) => {
  User.find({}, (err, users) => {
    if (err) throw (`{err.name}: err.message `)

    if (users.length > 0) {
      users.map((user) => {
        user.password = undefined
        return user
      })
      respy.sendData(res, users)
    } else {
      respy.sendFail(res, 'NoUserFound')
    }
  })
})

UserRouter.post('/logout', (req, res) => {
  if (req.cookies.user_sid && req.session.user) {
    req.session.destroy((err) => {
      console.log(err)
    })
    res.clearCookie('user_sid').status(200).json({
      status: 'success',
      message: 'Logout'
    })
  }
})

UserRouter.post('/activateCoin', authcontroller, (req, res) => {
  User.findOne({
    _id: req.session.user._id
  }, (err, userDoc) => {
    if (err) {
      console.log(err)
      respy.sendFail(res, 'CouldnotUpdate')
    } else {
      if (validateCoinName(req.body.coin)) {
        activateCoin(res, userDoc, req.body.coin)
      }
    }
  })
})

UserRouter.post('/deActivateCoin', authcontroller, (req, res) => {
  User.findOne({
    _id: req.session.user._id
  }, (err, userDoc) => {
    if (err) {
      console.log(err)
      respy.sendFail('CannotDeleteCoin')
    } else {
      if (validateCoinName(req.body.coin)) {
        deActivateCoin(res, userDoc, req.body.coin)
      }
    }
  })
})

UserRouter.post('/forgotPassword', (req, res) => {
  let userName = req.body.userName
  User.findOne({
    userName: userName
  })
    .then((userData) => {
      userData.passResetKey = shortid.generate()
      userData.passKeyExpires = new Date().getTime() + config.passKeyExpireTime
      return updateUser(userData)
    })
    .then((userData) => {
      let mailer = new Mailer()
      mailer.setMail({
        _subject: 'CoinHomePage',
        _html: `
        <h1>Hi,</h1>
        <h2>Here is your password reset key</h2>
        <h2><code contenteditable="false" style="font-weight:200;font-size:1.5rem;padding:5px 10px; background: #EEEEEE; border:0">${userData.passResetKey}</code></h4>
        <p>Please ignore if you didn't try to reset your password on our platform</p>`
      })
      return mailer.sendMail(userData.email, userData.userName)
    })
    .then(() => {
      respy.sendSuccess(res, 'MailSent')
    })
    .catch((error) => {
      respy.sendFail(res, error)
    })
})

UserRouter.post('/resetPass', (req, res) => {
  let {resetKey, newPassword} = req.body
  User.findOne({
    passResetKey: resetKey
  })
    .catch((err) => {
      respy.sendFail(res, 'ErrorAtDatabase')
      return null
    })
    .then((userData) => {
      return changePassword(userData, newPassword)
    })
    .then(updateUser)
    .then(() => {
      respy.sendSuccess(res, 'PasswordChanged')
    })
    .catch((err) => {
      // if (err == string) {
      respy.sendFail(res, err)
      // }

      console.log(err)
      return null
    })
    .then()
    .catch(() => {
      console.log('deneme')
    })
})

module.exports = UserRouter
