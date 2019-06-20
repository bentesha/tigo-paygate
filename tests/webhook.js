'use strict'

const sinon = require('sinon')
const supertest = require('supertest')
const chai = require('chai')
const express = require('express')
const webhook = require('../app/api/webhook')
const codes = require('../app/api/response-codes')
const bodyParser = require('body-parser')

const expect = chai.expect

describe('webhook', () => {
  it('should return transcation data', async () => {
    const app = express()
    app.use(bodyParser.json())
    const callback = sinon.fake.returns(true)
    const middleware = webhook(callback)
    app.use('/webhook', middleware)

    const transactionId = 'transaction id'
    const reference = 'refence'
    const amount = 1000

    const { body } = await supertest(app)
      .get('/webhook')
      .send({
        Status: true,
        MFSTransactionID: transactionId,
        ReferenceID: reference,
        Amount: amount
      })
      .expect(200)
    
    expect(callback.called).to.be.true
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