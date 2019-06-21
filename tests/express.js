'use strict'

const sinon = require('sinon')
const chai = require('chai')
const supertest = require('supertest')
const codes = require('../app/api/response-codes')
const app = require('../app')

const expect = chai.expect

describe('express App', () => {
  before(() => {
    // Load app dependencies
    app.init()
  })

  it('should add charge result into a queue when webhook is called', async () => {
    const spy = sinon.fake.resolves()
    app.jobs.addChargeResult = spy

    const status = true
    const transactionId = 'transaction id'
    const reference = 'reference'
    const amount = 1000

    await supertest(app.express)
      .get('/webhooks/tigo/debit-mandate')
      .send({
        Status: true,
        Description: 'OK',
        MFSTransactionID: transactionId,
        ReferenceID: reference,
        Amount: amount
      })
      .expect(200, {
        ResponseCode: codes.CALLBACK_SUCCESS,
        ResponseStatus: status,
        ResponseDescription: 'Callback Successful',
        ReferenceID: reference
      })

    expect(spy.calledOnce).to.equal(true)
    expect(spy.firstCall.args[0]).to.deep.equal({
      status,
      transactionId,
      reference,
      amount
    })
  })

  it('should respond with status 404 for invalid URLs', async () => {
    return supertest(app.express)
      .get('/invalid/url')
      .expect(404)
  })
})
