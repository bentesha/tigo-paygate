'use strict'

const dotenv = require('dotenv')

const init = () => {
  dotenv.config() // Load configurations from .env file

  return {
    apiUrl: process.env.TIGOPESA_API_URL,

    username: process.env.TIGOPESA_MERCHANT_USERNAME,
    password: process.env.TIGOPESA_MERCHANT_PASSWORD,
    merchantCode: process.env.TIGOPESA_MERCHANT_CODE,

    env: process.env.ENV // production || test || production
  }
}

exports.init = init
