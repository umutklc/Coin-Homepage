const respy = require('../lib/respy')

exports.createUser = function (req, res, userData) {
  initializeUserCoins(userData)
  User.create(userData)
    .then((user) => {
      req.session.user = user
      respy.sendSuccess(res, 'UserCreated')
    })
    .catch((err) => {
      if (err.code === 11000) {
        sendDuplicatedItemError(res, userData)
      } else {
        respy.sendFail(res, err.message)
      }
    })
}

exports.updateUser = function (user) {
  return new Promise((resolve, reject) => {
    User.where({
      _id: user._id
    }).update(user, (error, userDoc) => {
      if (error) {
        let errorCode = 'CouldNotUpdateUser'
        return reject(errorCode)
      } else {
        return resolve(user)
      }
    })
  })
}

exports.changePassword = function (userData, newPassword) {
  if (!userData) {
    return Promise.reject('WrongPassResetKey')
  } else {
    let now = new Date().getTime()
    if (userData.passKeyExpires > now) {
      userData.password = newPassword
      userData.passKeyExpires = null
      userData.passResetKey = null
      return userData
    } else {
      return Promise.reject('PassResetKeyExpired')
    }
  }
}

exports.activateCoin = function (response, userDoc, coin) {
  if (!userDoc.coins.includes(coin)) {
    userDoc.coins.push(coin)
    userDoc.save((err, doc) => {
      if (err) {
        console.log(err)
        respy.sendFail(res, 'CouldnotUpdate')
      } else {
        respy.sendData(res, userDoc.coins)
      }
    })
  } else {
    respy.sendFail('CoinAlreadyActivated')
  }
}

exports.deActivateCoin = function (response, userDoc, coin) {
  if (userDoc.coins.includes(coin)) {
    userDoc.coins = userDoc.coins.filter(coin != req.body.coin)
    userDoc.save((err, doc) => {
      if (err) {
        console.log(err)
        respy.sendFail(res, 'CouldnotUpdate')
      } else {
        respy.sendData(res, userDoc.coins)
      }
    })
  }
}

var initializeUserCoins = function (userData) {
  userData.coins = ['BTC', 'ETH', 'LTC', 'BCH', 'XRP', 'ETC', 'NEO', 'STR']
}

var sendDuplicatedItemError = function (response, user) {
  User.findOne({
    userName: user.userName
  })
    .then((result) => {
      respy.sendFail(response, 'NotUniqueUserName')
      return
    })

  User.findOne({
    email: user.email
  })
    .then((result) => {
      respy.sendFail(response, 'NotUniqueEmail')
      return
    })
}
