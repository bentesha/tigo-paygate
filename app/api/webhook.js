'use strict'

const codes = require('./response-codes')
const debug = require('debug')('tigoapi')

/**
 * @typedef {object} ChargeRequestResult
 * @property {boolean} status - True if the request was successful
 * @property {string} transactionId - Transaction ID
 * @property {number} amount - The amount requested the customer be charged
 * @property {string} reference - The reference associated with the charge request
 */

/**
 * A function to be called with result of the customer charge request
 * @callback callbackFn
 * @param {ChargeRequestResult} result - An object containing result of the customer charge request
 * @return {boolean} True to confirm transaction or false to cancel transaction
 */

/**
 * TigoPesa webhook middleware handler
 * @param {callbackFn} callback - A function that will be called with reference and amount for
 * successful transctions. Should return true to confirm transction. Otherwise transaction will be rejected
 */
module.exports = app => callback => ({ body }, response, next) => {
  (async () => {
    debug('----------- WEBHOOK CALL --------------')
    debug({ data : body })
    debug('--------- END WEBHOOK CALL ------------')
    const status = body.Status
    const transactionId = body.MFSTransactionID
    const reference = body.ReferenceID
    const amount = body.Amount

    const ok = await callback({ // eslint-disable-line standard/no-callback-literal
      status,
      transactionId,
      amount,
      reference: reference.replace(app.config.billerCode, '') // Remove biller prefix from reference
    })

    debug('Callback result', ok)

    const result = {
      ResponseCode: ok ? codes.CALLBACK_SUCCESS : codes.CALLBACK_FAILED,
      ResponseStatus: !!ok,
      ResponseDescription: ok ? 'Callback Successful' : 'Callback failed',
      ReferenceID: reference
    }
    debug('----------- WEBHOOK RESPONSE -----------')
    debug( { data: result })
    debug('--------- END WEBHOOK RESPONSE ---------')
    response.json(result)
  })().catch(next)
}
