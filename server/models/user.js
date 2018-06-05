const mongoose = require('mongoose')
const Schema = mongoose.Schema

let userSchema = new Schema({
  firstName: {
    type: String,
    required: [true, 'test'],
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true
  },
  userName: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  gender: {
    type: String,
    required: false
  },
  coins: {
    type: [],
    required: false
  },
  passResetKey: String,
  passKeyExpires: Number,
  createdAt: {
    type: Date,
    required: true
  },
  updatedAt: {
    type: Date,
    required: true
  }
}, {
  runSettersOnQuery: true
})

userSchema.pre('validate', function (next) {
  this.email = this.email.toLowerCase()
  let currentDate = new Date().getTime()
  this.updatedAt = currentDate
  if (!this.createdAt) {
    this.createdAt = currentDate
  }
  next()
})

var User = mongoose.model('User', userSchema, 'users')

module.exports = User
