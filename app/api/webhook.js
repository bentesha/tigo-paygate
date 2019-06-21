'use strict'

const codes = require('./response-codes')
const debug = require('debug')('tigoapi')

/**
 * A function to be called with result of the customer charge request
 * @callback callbackFn
 * @param {object} result - An object containing result of the customer charge request
 * @param {boolean} result.status - True if the request was successful
 * @param {string} result.transactionId - Transaction ID
 * @param {number} result.amount - The amount requested the customer be charged
 * @param {string} result.reference - The reference associated with the charge request
 * @return {boolean} True to confirm transaction or false to cancel transaction
 */

/**
 * TigoPesa webhook middleware handler
 * @param {callbackFn} callback - A function that will be called with reference and amount for
 * successful transctions. Should return true to confirm transction. Otherwise transaction will be rejected
 */
module.exports = callback => ({ body }, response, next) => {
  (async () => {
    debug('Webhook callback', body)
    const status = body.Status
    const transactionId = body.MFSTransactionID
    const reference = body.ReferenceID
    const amount = body.Amount

    const ok = await callback({ // eslint-disable-line standard/no-callback-literal
      status,
      transactionId,
      reference,
      amount
    })

    debug('Callback result', ok)

    const result = {
      ResponseCode: ok ? codes.CALLBACK_SUCCESS : codes.CALLBACK_FAILED,
      ResponseStatus: !!ok,
      ResponseDescription: ok ? 'Callback Successful' : 'Callback failed',
      ReferenceID: reference
    }
    debug('Webhook callback response', result)
    response.json(result)
  })().catch(next)
}
