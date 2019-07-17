'use strict'

const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const webhook = require('./api/webhook')

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

  // Parse json bodies
  expressApp.use(bodyParser.json())

  // Healthcheck middleware
  expressApp.use(healthcheck)

  const route = webhook(app)(async result => {
    // Add customer charge result into the queue
    await app.jobs.addChargeResult(result)
    return true
  })

  // Webhook handler
  expressApp.use('/webhooks/tigo/debit-mandate', route)

  // Catch all route
  expressApp.use('*', (request, response) => response.sendStatus(404))

  return expressApp
}

exports.init = init
