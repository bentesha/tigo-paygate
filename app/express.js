'use strict'

const express = require('express')
const morgan = require('morgan')

/**
 * Initializes express app
 * @param {import('../app')} app - Application instance
 */
const init = (app) => {
  const expressApp = express()

  if (app.config.env === 'development') {
    // Log http traffic if in dev mode
    expressApp.use(morgan('combined'))
  }

  return expressApp
}

exports.init = init
