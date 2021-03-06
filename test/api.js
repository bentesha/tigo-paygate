'use strict'

const chai = require('chai')
const nock = require('nock')
const querystring = require('querystring')
const app = require('../app')

const expect = chai.expect

describe('TigoPesaApi', () => {
  before(() => {
    // Init dependencies
    process.env.TIGOPESA_AUTH_API = 'http://fake/url/'
    process.env.TIGOPESA_BILL_API = 'http://fake/bill/url/'
    app.init()
    nock.disableNetConnect()
  })

  after(() => {
    nock.enableNetConnect()
  })

  describe(':authenticate', () => {
    it('should succeed and return access token', async () => {
      const username = 'username'
      const password = 'password'

      const response = {
        access_token: 'access token',
        token_type: 'bearer',
        expires_in: 1000
      }

      const formData = {
        username: username,
        password: password,
        grant_type: 'password'
      }

      const scope = nock(app.config.authApiUrl)
        .post('/', querystring.stringify(formData))
        .matchHeader('content-type', 'application/x-www-form-urlencoded')
        .reply(200, response)

      const result = await app.api.authenticate({ username, password })

      scope.done() // Ensure API endpoint is called

      expect(result.token).to.equal(response.access_token)
      expect(result.tokenType).to.equal(response.token_type)
      expect(result.expiresIn).to.equal(response.expires_in)
    })

    it('should fail with code INVALID_GRANT', async () => {
      // Should faild with code INVALID_GRANT if username/password combination is invalid
      const response = {
        error: 'invalid_grant',
        error_description: 'Provide username and password is incorrect'
      }

      const username = 'username'
      const password = 'wrong password'

      const postData = {
        username: username,
        password: password,
        grant_type: 'password'
      }

      let scope = nock(app.config.authApiUrl)
        .post('/', querystring.stringify(postData))
        .matchHeader('content-type', 'application/x-www-form-urlencoded')
        .reply(200, response)

      let error = await app.api
        .authenticate({ username, password })
        .catch(error => error)

      scope.done()

      expect(error.code).to.equal('INVALID_GRANT')
      expect(error.message).to.equal(response.error_description)

      // Shoule also handle cases where a non 200 status is returned
      scope = nock(app.config.authApiUrl)
        .post('/', querystring.stringify(postData))
        .reply(400, response)

      error = await app.api
        .authenticate({ username, password })
        .catch(error => error)

      scope.done()

      expect(error.code).to.equal('INVALID_GRANT')
      expect(error.message).to.equal(response.error_description)
    })

    it('should fail with code UNSUPPORTED_GRANT_TYPE', async () => {
      const response = {
        error: 'unsupported_grant_type',
        error_description: 'Invalid grant type'
      }
      const scope = nock(app.config.authApiUrl)
        .post('/')
        .reply(200, response)

      const error = await app.api
        .authenticate({ username: 'username', password: 'password' })
        .catch(error => error)

      scope.done()

      expect(error.code).to.equal('UNSUPPORTED_GRANT_TYPE')
      expect(error.message).to.equal(response.error_description)
    })
  })

  describe(':chargeCustomer', () => {
    it('should successfully send charge request', async () => {
      const username = 'username'
      const password = 'password'
      const token = 'access token'
      const msisdn = '255123456789'
      const billerMsisdn = '255987654321'
      const amount = 1000
      const remarks = 'Some remarks'
      const reference = 'REF39388383'

      const response = {
        ResponseCode: 'BILLER-18-0000-S',
        ResponseStatus: true,
        ResponseDescription: 'Valid Request',
        ReferenceID: reference
      }

      const postData = {
        CustomerMSISDN: msisdn,
        BillerMSISDN: billerMsisdn,
        Amount: amount,
        Remarks: remarks,
        ReferenceID: reference
      }

      const scope = nock(app.config.billApiUrl)
        .post('/', postData)
        .matchHeader('Username', username)
        .matchHeader('Password', password)
        .matchHeader('Authorization', 'Bearer ' + token)
        .matchHeader('Content-Type', 'application/json')
        .matchHeader('Cache-Control', 'no-cache')
        .reply(200, response)

      await app.api.chargeCustomer({
        msisdn,
        billerMsisdn,
        token,
        username,
        password,
        amount,
        remarks,
        reference
      })

      scope.done()
    })

    it('should fail with code INTERNAL_SERVICE_ERROR', async () => {
      const response = {
        ResponseCode: 'DebitMandate-10-1000-E',
        ResponseStatus: false,
        ResponseDescription: 'Internal Service Error',
        ReferenceID: 'reference'
      }

      const scope = nock(app.config.billApiUrl)
        .post('/')
        .reply(200, response)

      const error = await app.api
        .chargeCustomer({
          msisdn: "'255123456789",
          billerMsisdn: '255987654321',
          token: 'token',
          username: 'username',
          password: 'password',
          amount: 'amount',
          remarks: 'remarks',
          reference: 'reference'
        })
        .catch(error => error)

      scope.done()

      expect(error.code).to.equal('INTERNAL_SERVICE_ERROR')
    })
  })

  // describe(':checkHeartbeat', () => {
  //   it('should successfully send heartbeat request', async () => {
  //     const username = 'username'
  //     const password = 'password'
  //     const reference = 'reference'

  //     const response = {
  //       ReferenceID: reference
  //     }

  //     const scope = nock(app.config.apiUrl)
  //       .post('/API/Heartbeat/Heartbeat', { ReferenceID: reference })
  //       .matchHeader('content-type', 'application/json')
  //       .matchHeader('cache-control', 'no-cache')
  //       .matchHeader('username', username)
  //       .matchHeader('password', password)
  //       .reply(200, response)

  //     await app.api.checkHeartbeat({
  //       username,
  //       password,
  //       reference
  //     })

  //     scope.done()
  //   }).skip()

  //   it('should fail with code INVALID_RESPONSE', async () => {
  //     const username = 'username'
  //     const password = 'password'
  //     const reference = 'reference'

  //     const scope = nock(app.config.apiUrl)
  //       .post('/API/Heartbeat/Heartbeat')
  //       .reply(200, { ReferenceID: 'invalid reference' })

  //     const error = await app.api
  //       .checkHeartbeat({
  //         username,
  //         password,
  //         reference
  //       })
  //       .catch(error => error)

  //     scope.done()
  //     expect(error.code).to.equal('INVALID_RESPONSE')
  //   }).skip()
  // })

  // describe(':reverseTransaction', () => {
  //   it('should successfully reverse customer transaction', async () => {
  //     const username = 'username'
  //     const password = 'password'
  //     const token = 'access token'
  //     const msisdn = '255123456789'
  //     const billerMsisdn = '255987654321'
  //     const pin = '2355'
  //     const amount = 5000
  //     const transactionId = 'transaction id'
  //     const purchaseReference = 'purchase reference'
  //     const dmReference = 'dm reference'
  //     const reference = 'reference'
  //     const responseDescription = 'response description'

  //     const postData = {
  //       CustomerMSISDN: msisdn,
  //       ChannelMSISDN: billerMsisdn,
  //       ChannelPIN: pin,
  //       Amount: amount,
  //       MFSTransactionID: transactionId,
  //       ReferenceID: reference,
  //       PurchaseReferenceID: purchaseReference
  //     }

  //     const scope = nock(app.config.apiUrl)
  //       .post('/API/Reverse/ReverseTransacation', postData)
  //       .matchHeader('Authorization', 'Bearer ' + token)
  //       .matchHeader('Username', username)
  //       .matchHeader('Password', password)
  //       .matchHeader('Cache-Control', 'no-cache')
  //       .matchHeader('Content-Type', 'application/json')
  //       .reply(200, {
  //         ResponseCode: 'RefundTransaction-20-0000-S',
  //         ResponseStatus: true,
  //         ResponseDescription: responseDescription,
  //         DMReferenceID: dmReference,
  //         ReferenceID: reference,
  //         MFSTransactionID: transactionId
  //       })

  //     const result = await app.api.reverseTransaction({
  //       token,
  //       msisdn,
  //       username,
  //       billerMsisdn,
  //       pin,
  //       password,
  //       transactionId,
  //       reference,
  //       purchaseReference,
  //       amount
  //     })

  //     scope.done()

  //     expect(result.reference).to.equal(reference)
  //     expect(result.description).to.equal(responseDescription)
  //     expect(result.dmReference).to.equal(dmReference)
  //     expect(result.transactionId).to.equal(transactionId)
  //   }).skip()
  // })
})
