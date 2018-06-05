'use strict'

const mongoose = require('mongoose')

class MongooseHelper {

  constructor () {
    this.connectionString = 'mongodb://admin:Qweasd123@ds159187.mlab.com:59187/authentication'
    this.subscribeToEvents()
  }

  connect () {
    mongoose.connect(this.connectionString, (err, db) => {
      if (err) {
        console.log("Couldn't connect to database")
      } else {
        console.log('Connected')
      // this.subscribeToEvents()
      }
    })
  }

  subscribeToEvents () {
    mongoose.connection.on('connected', () => {
      console.log('Connected to MongoDB')
    })

    mongoose.connection.on('error', (err) => {
      console.log(err)
    })

    mongoose.connection.on('close', () => {
      console.log('Connection is closed')
    })

    mongoose.connection.on('disconnected', () => {
      console.log('connection disconnected')
    })
  }
}

module.exports = MongooseHelper
