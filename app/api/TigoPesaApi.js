'use strict'

const querystring = require('querystring')
const ApiError = require('./ApiError')
const codes = require('./response-codes')
const debug = require('debug')('tigoapi')

class TigoPesaApi {
  /**
   * @param {import('..')} app - Applicaiton instance
   */
  constructor (app) {
    this.app = app
  }

  /**
   * Authentication request
   * @typedef {object} AuthRequest
   * @property {string} username - Tigo merchant username
   * @property {string} password - Tigo merchant password
   */

  /**
   * Authentication response
   * @typedef {object} AuthResponse
   * @property {string} token - Access token
   * @property {string} tokenType - Token type
   * @property {number} expiresIn - Number of seconds after which the token expires
   */

  /**
   * Sends request to TigoPesa API to obtain authentication token
   * @param {AuthRequest} request - Authentication request
   * @return {Promise<AuthResponse>}
   */
  async authenticate (request) {
    const data = {
      user_name: request.username,
      password: request.password,
      grant_type: 'password'
    }
    const headers = {
      'Cache-Control': 'no-cache'
    }
    // Send data as application/x-www-form-urlencoded
    debug('Auth request', data)
    const response = await this.app.http
      .post('/token', querystring.stringify(data), { headers })
      .catch(error => {
        debug('Auth error', error.message)
        return Promise.reject(ApiError.fromResponse(error))
      })

    if (response.data.error) {
      // debug('Auth error', response)
      return Promise.reject(ApiError.fromResponse({ response }))
    }
    const result = response.data
    debug('Auth success', response.data)
    return {
      token: result.access_token,
      tokenType: result.token_type,
      expiresIn: result.expires_in
    }
  }

  /**
   * @typedef {object} ChargeRequest
   * @property {string} token - API access token
   * @property {string} username - Tigo merchant username
   * @property {string} password - Tigo merchant password
   * @property {string} msisdn - Customer MSISDN. Must start with 255 followed by 9 digits
   * @property {string} billerMsisdn - Biller MSISDN
   * @property {number} amount - Amount the customer should be charged
   * @property {string} [remarks] - Remarks associated with charge request
   * @property {string} reference - A unique reference ID that can be used to track this request
   */

  /**
   *
   * @param {ChargeRequest} request - Charge request parameters
   */
  async chargeCustomer (request) {
    const headers = {
      'Authorization': 'Bearer ' + request.token,
      'Username': request.username,
      'Password': request.password,
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json'
    }

    // JSON request payload data
    const data = {
      CustomerMSISDN: request.msisdn,
      BillerMSISDN: request.billerMsisdn,
      Amount: request.amount,
      Remarks: request.remarks,
      ReferenceID: request.reference
    }
    debug('Sending charge request', data, headers)
    const response = await this.app.http
      .post('/API/BillerPayment/BillerPay', data, { headers })
      .catch(error => {
        return Promise.reject(ApiError.fromResponse(error))
      })

    if (response.data.ResponseCode !== codes.SUCCESS) {
      debug('Charge customer failed', response.data)
      return Promise.reject(ApiError.fromResponse({ response }))
    }

    debug('Charge customer succeeded', response.data)
  }

  /**
   * Reverse transaction request parameters
   * @typedef {object} ReverseTransactionRequest
   * @property {string} msisdn - Customer MSISDN
   * @property {string} billeryMsisdn - Merchant MSISDN
   * @property {string} username - Merchant account username
   * @property {string} password - Merchant account password
   * @property {string} token - Authorization token
   * @property {string} pin - MFS PIN of the merchant account
   * @property {number} amount - Transaction amount
   * @property {string} transactionId - ID of the transction to be reversed. Either transctionId or
   * purchaseReference must be specified
   * @property {string} reference - A unique ID to track this transaction
   * @property {string} purchaseReference - The original reference that was specified in
   * transaction that should be reversed. If this is not specifed, the the transactionId must
   * be specified
   */

  /**
   * Reverse transaction response
   * @typedef {object} ReverseTransactionResponse
   * @property {string} description - Response description
   * @property {string} dmReference - A unique ID generated for reverse transaction request
   * @property {string} reference - The original reference passed to the request
   * @property {string} transactionId - Transaction id of the refund transaction
   */

  /**
   * Reverses a successful customer charge transaction and refund money to customer
   * @param {ReverseTransactionRequest} request - Transaction request parameters
   * @return {ReverseTransactionResponse}
   */
  async reverseTransaction (request) {
    const headers = {
      'Authorization': 'Bearer ' + request.token,
      'Cache-Control': 'no-cache',
      'Username': request.username,
      'Password': request.password,
      'Content-Type': 'application/json'
    }

    const data = {
      CustomerMSISDN: request.msisdn,
      ChannelMSISDN: request.billerMsisdn,
      ChannelPIN: request.pin,
      Amount: request.amount,
      MFSTransactionID: request.transactionId,
      ReferenceID: request.reference,
      PurchaseReferenceID: request.purchaseReference
    }

    const response = await this.app.http
      .post('/API/Reverse/ReverseTransacation', data, { headers })
      .catch(error => {
        debug('Reverse transaction error', request)
        return Promise.reject(ApiError.fromResponse(error))
      })

    if (response.data.ResponseCode !== codes.REVERSE_SUCCESS) {
      return Promise.reject(ApiError.fromResponse({ response }))
    }

    const body = response.data
    return {
      description: body.ResponseDescription,
      dmReference: body.DMReferenceID,
      reference: body.ReferenceID,
      transctionId: body.MFSTransactionID
    }
  }

  /**
   * @typedef {object} HeartbeatRequest
   * @property {string} username - Tigo merchant username
   * @property {string} password - Tigo mearchat password
   * @property {string} reference - A unique reference that can be used to track this request
   */

  /**
   * Send heartbeat request to API server to check if it is up and running
   * @param {HeartbeatRequest} request - Request params
   */
  async checkHeartbeat (request) {
    const headers = {
      'Username': request.username,
      'Password': request.password,
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json'
    }
    const data = {
      ReferenceID: request.reference
    }
    debug('Sending heartbeat request', data, headers)
    const response = await this.app.http
      .post('/API/Heartbeat/Heartbeat', data, { headers })
      .catch(error => {
        return Promise.reject(ApiError.fromResponse(error))
      })

    debug('Heartbeat response', response.data)
    if (response.data.ReferenceID !== request.reference) {
      throw new ApiError(codes.INVALID_RESPONSE, 'Invalid reference returned by server')
    }
  }
}

module.exports = TigoPesaApi
