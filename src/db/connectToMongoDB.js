const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

const CONNECTION_URL = process.env.CONNECTION_URL.replace(
  '<password>',
  process.env.PASSWORD
)

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(CONNECTION_URL)
    console.log('Connected to MongoDB')
  } catch (error) {
    console.log('Error connecting to MongoDB', error.message)
  }
}

module.exports = connectToMongoDB;