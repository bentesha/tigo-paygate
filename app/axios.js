'use strict'

const axios = require('axios')

/**
 * Init axios instance
 * @param {import('../app')} app
 */
function init (app) {
  return axios.default.create({
    baseURL: app.config.apiUrl,
    timeout: 5000, // Default request timeout
    headers: { } // Add custom headers if required
  })
}

exports.init = init
