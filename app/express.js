'use strict'

const express = require('express')
const morgan = require('morgan')

const healthcheck = express.Router() // Healthcheck middleware
healthcheck.use('/healthcheck', (request, response) => {
  response.sendStatus(200)
})

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

  // Healthcheck middleware
  expressApp.use(healthcheck)

  return expressApp
}

exports.init = init
