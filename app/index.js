'use strict'

const http = require('http')
const chalk = require('chalk')

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
    this.http = require('./http').init(this)

    // TigoPesa API client
    this.api = require('./api').init(this)

    // Init express app instance
    this.express = require('./express').init(this)

    // Init job queue
    this.jobs = require('./jobs').init(this)
  }

  /**
   * Runs our application instance
   */
  run () {
    // Run web server
    const server = http.createServer(this.express)
    server.listen(this.config.server.port, () => {
      console.log(chalk.green('Server listening on port:'), server.address().port)
    })

    // Create a worker to process queued jobs
    const worker = require('./worker')(this)
    this.jobs.process(worker)

    process.on('exit', () => {
      // Properly shutdown job queue
      this.jobs.shutdown()
    })
  }
}

module.exports = new Application()
