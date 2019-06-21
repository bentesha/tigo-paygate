'use strict'

const Queue = require('bull')

class JobQueue {
  /**
   *
   * @param {import('.')} app - Application instance
   */
  constructor (app) {
    this.app = app
    this.requestQueue = new Queue('payment:request', app.config.redis)
    this.responseQueue = new Queue('payment:response', app.config.redis)
  }

  /**
   * Waits for the queues to be ready to process messages
   */
  async isReady () {
    await this.requestQueue.isReady()
    await this.requestQueue.isReady()
  }

  /**
   * Stutdown all queues
   */
  async shutdown () {
    return this.requestQueue.pause()
  }

  /**
   * Add customer charge result into the queue
   * @param {response} response
   */
  async addChargeResult (response) {
    return this.responseQueue.add(response)
  }

  /**
   * The data structure of customer charge request job
   * @typedef {object} ChargeRequest
   * @property {string} msisdn - MSISDN of the customer. Must start with 255 followed by 9 digits
   * @property {number} amount - Amount the customer should be charged
   * @property {string} reference - A reference that can be used to track this request
   */

  /**
   * A callback function that is called to process a charge request
   * @callback callbackFn
   * @param {ChargeRequest} request - A charge request to process
   * @return {Promise<void>} Returns a promise that resolves successfully if request was successfully process.
   * The returned promise should resolve with an error if the charge could not be successfully sent
   */

  /**
   * Supply a callback function that should be called to process customer charge requests
   * that were placed in the queue by consumer services
   * @param {callbackFn} callback
   */
  process (callback) {
    this.requestQueue.isReady()
      .then(() => this.requestQueue.process(callback))
      .catch(() => {}) // Do nothing
  }
}

/**
 * Initializes an instance of JobQueue class
 * @param {import('.')} app - Application instance
 */
const init = app => {
  return new JobQueue(app)
}

exports.init = init
