'use strict'

const chalk = require('chalk')

/**
 * Returns a callback function to process queued customer charge request jobs
 * @param {import('.')} app - Application instance
 */
module.exports = app => async ({ data: request }) => {
  // Each job has the following properties
  const msisdn = request.msisdn // Customer MSISDN to be charged
  const amount = request.amount // Amount to charge the customer
  const reference = request.reference // A unique reference that can be used track the charge request
  const remarks = request.remarks || '' // Remarks, if any, associated with the charge

  // Prints error to the console
  const error = error => {
    console.log(chalk.yellow('Failed to process job:'), request)
    console.log(chalk.yellow(error.message || error))
    return Promise.reject(error)
  }

  return (async () => {
    // We first need to authenticate with Tigo API server to obtain access token
    // that we can use to authenticate other API calls
    const auth = await app.api.authenticate({
      username: app.config.username,
      password: app.config.password
    })

    // Send customer charge request
    await app.api.chargeCustomer({
      msisdn,
      amount,
      remarks,
      billerMsisdn: app.config.billerNumber,
      username: app.config.username,
      password: app.config.password,
      token: auth.token,
      // Reference must be prefixed with biller code before calling api
      reference: app.config.billerCode + reference
    })

    // This will be added to job result to indicate it was successfully processed
    return 'Success'
  })().catch(error)
}
