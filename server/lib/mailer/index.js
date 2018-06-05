const nodemailer = require('nodemailer')
const config = require('./config')

class Mailer {

  constructor ({ host = config.host, port = config.port, mailAddress = config.address, password = config.password, useSMTP = config.useSMTP } = {}) {
    this.host = host
    this.port = port
    this.mailAddress = mailAddress
    this.password = password
    this.useSMTP = useSMTP
    this.transporter = this.createTransporter()
  }

  createTransporter () {
    let transporter = nodemailer.createTransport({
      service: this.host,
      port: this.port,
      secure: this.useSMTP,
      auth: {
        user: this.mailAddress,
        pass: this.password
      }
    })

    return transporter
  }

  setMail ({_subject, _html}) {
    this.mail = {
      subject: _subject,
      html: _html
    }
  }

  sendMail ({_address, _name = '' }) {
    return new Promise((resolve, reject) => {
      if (!this.mail.subject || !this.mail.html) {
        let error = new Error('Error at creating mail')
        reject(error)
      }

      this.mail.to = {
        name: _name,
        adddress: _address
      }

      this.mail.from = this.mailAddress

      this.transporter.sendMail(this.mail, (err, info) => {
        if (err) {
          console.log(err)
          reject(err)
        } else {
          console.log(info)
          resolve()
        }
      })
    })
  }

}

module.exports = Mailer
