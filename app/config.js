'use strict'

const dotenv = require('dotenv')

const init = () => {
  dotenv.config() // Load configurations from .env file

  return {
    authApiUrl: process.env.TIGOPESA_AUTH_API,
    billApiUrl: process.env.TIGOPESA_BILL_API,

    username: process.env.TIGOPESA_MERCHANT_USERNAME,
    password: process.env.TIGOPESA_MERCHANT_PASSWORD,
    merchantCode: process.env.TIGOPESA_MERCHANT_CODE,

    // Web server port
    server: {
      port: process.env.PORT || 8080
    },

    env: process.env.ENV, // production || test || production

    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      db: process.env.REDIS_DB,
      password: process.env.REDIS_PASSWORD
    }
  }
}

exports.init = init
