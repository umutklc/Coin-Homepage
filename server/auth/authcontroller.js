var authcontroller = function (req, res, next) {
  if (req.session.user && req.cookies.user_sid) {
    next()
  } else {
    res.status(401).json({
      status: 'fail',
      errorCode: 'LoginRequired'
    })
  }
}

module.exports = authcontroller
