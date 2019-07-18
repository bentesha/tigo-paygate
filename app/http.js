'use strict'

const axios = require('axios')
const debug = require('debug')('http')
const _ = require('lodash')

/**
 * Init axios instance
 * @param {import('.')} app
 */
function init (app) {
  const http = axios.default.create({
    baseURL: app.config.apiUrl,
    timeout: 5000, // Default request timeout
    headers: { } // Add custom headers if required
  })

  http.interceptors.request.use(request => {
    debug('------------- REQUEST -------------')
    const fields = ['url', 'method', 'data', 'headers']
    debug(_.pick(request, fields))
    debug('----------- END REQUEST -----------')
    return request
  })

  http.interceptors.response.use(response => {
    debug('------------- RESPONSE ---------------')
    const fields = ['status', 'statusText', 'headers', 'data']
    debug(_.pick(response, fields))
    debug('----------- END RESPONSE -------------')
    return response
  })

  return http
}

exports.init = init
