'use strict'

const codes = require('./response-codes')
const _ = require('lodash')

class RequestError extends Error {
  /**
   * Construct an instance of RequestError with code and message
   * @param {string} code - Response error code
   * @param {string} message - Error message
   * @param {Error} error - Original error object
   */
  constructor (code, message, error) {
    super(message)
    this.code = code
    this.error = error
  }

  static fromResponse (error) {
    if (_.get(error, 'response.data.error')) {
      const respError = _.get(error, 'response.data.error')
      const [ code ] = Object.entries(codes).find(([, error]) => error === respError) || []
      const message = _.get(error, 'response.data.error_description') || error.message
      return new RequestError(code || 'UNKNOWN_ERROR', message, error)
    } else if (_.get(error, 'response.data.ResponseCode')) {
      const respCode = _.get(error, 'response.data.ResponseCode')
      const [ code ] = Object.entries(codes).find(([, error]) => error === respCode)
      const message = _.get(error, 'response.data.ResponseDescription') || error.message
      const e = new RequestError(code || 'UNKNOWN_ERROR', message, error)
      e.reference = _.get(error, 'response.data.ReferenceID')
      return e
    }
    else {
      return new RequestError('UNKNOWN_ERROR', error.message, error)
    }
  }
}

module.exports = RequestError
