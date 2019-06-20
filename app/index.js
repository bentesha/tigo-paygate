'use strict'

/**
 * A blueprint for our application instance
 */
class Application {
  /**
   * Loads and initializes application dependencies
   */
  init () {
    // Load application configuration
    this.config = require('./config').init(this)

    // Axios Http client
    this.http = require('./axios').init(this)

    // TigoPesa API client
    this.api = require('./api').init(this)

    // Init express app instance
    this.express = require('./express').init(this)
  }

  /**
   * Runs our application instance
   */
  run () {

  }
}

module.exports = new Application()
