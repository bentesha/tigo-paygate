'use strict'

const TigoPesaApi = require('./TigoPesaApi')

/**
 * Init TigoPesa api client
 * @param {import('..')} app - Application instance
 */
const init = app => {
  return new TigoPesaApi(app)
}

exports.init = init
