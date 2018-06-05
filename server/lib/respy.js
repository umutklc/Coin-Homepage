class Respy {
  constructor () {}

  static sendSuccess (res, message) {
    res.status(200).json({
      status: 'success',
      message: message
    })
  }

  static sendFail (res, message) {
    res.status(500).json({
      status: 'fail',
      errorCode: message
    })
  }

  static sendData (res, data) {
    res.status(200).json({
      status: 'success',
      data: data
    })
  }

}

module.exports = Respy
