'use strict'

const nock = require('nock')
const chai = require('chai')
const querystring = require('querystring')
const app = require('../app')
const worker = require('../app/worker')
const codes = require('../app/api/response-codes')

const expect = chai.expect

describe('worker', () => {
  before(() => {
    // Init application
    process.env.TIGOPESA_API_URL = 'http://fake/url'
    app.init()
    nock.disableNetConnect()
  })

  after(() => {
    nock.enableNetConnect()
  })

  it('should successfully process customer charge request jobs', async () => {
    const username = 'username'
    const password = 'password'
    const merchantCode = '255987654321'

    app.config.username = username
    app.config.password = password
    app.config.merchantCode = merchantCode

    const token = 'access token'

    // Charge request
    const msisdn = '255123456789'
    const remarks = 'remarks'
    const reference = 'reference'
    const amount = 5000

    const authResponse = {
      access_token: token,
      token_type: 'bearer',
      expires_in: 1000
    }

    const chargeResponse = {
      ResponseCode: codes.SUCCESS,
      ResponseStatus: true,
      ResponseDescription: 'Valid Request',
      ReferenceID: reference
    }

    const scope = nock(app.config.apiUrl)
      .post('/token', querystring.stringify({
        user_name: username,
        password,
        grant_type: 'password'
      }))
      .reply(200, authResponse)
      .post('/API/BillerPayment/BillerPay', {
        CustomerMSISDN: msisdn,
        BillerMSISDN: merchantCode,
        Amount: amount,
        Remarks: remarks,
        ReferenceID: reference
      })
      .reply(200, chargeResponse)

    const callback = worker(app)

    const result = await callback({
      msisdn,
      amount,
      reference,
      remarks
    })

    scope.done()
    expect(result).to.equal('Success')
  })
})