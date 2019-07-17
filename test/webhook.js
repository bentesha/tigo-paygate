'use strict'

const sinon = require('sinon')
const supertest = require('supertest')
const chai = require('chai')
const express = require('express')
const webhook = require('../app/api/webhook')
const codes = require('../app/api/response-codes')
const bodyParser = require('body-parser')
const app = require('../app')

const expect = chai.expect

describe('webhook', () => {
  before(() => {
    process.env.TIGOPESA_BILLER_CODE = 'DEMO'
    app.init()
  })

  it('should callback with transaction data and respond with json', async () => {
    const exp = express()
    exp.use(bodyParser.json())
    const callback = sinon.fake.returns(true)
    const middleware = webhook(app)(callback)
    exp.use('/webhook', middleware)

    const transactionId = 'transaction id'
    const reference = 'refence'
    const amount = 1000

    const { body } = await supertest(exp)
      .get('/webhook')
      .send({
        Status: true,
        MFSTransactionID: transactionId,
        ReferenceID: reference,
        Amount: amount
      })
      .expect(200)

    expect(callback.called).to.equal(true)
    const arg = callback.firstCall.args[0]

    expect(arg).to.deep.equal({
      transactionId,
      reference,
      amount,
      status: true
    })

    expect(body.ResponseCode).to.equal(codes.CALLBACK_SUCCESS)
    expect(body.ResponseStatus).to.equal(true)
    expect(body.ReferenceID).to.equal(reference)
  })
})
