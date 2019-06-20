'use strict'

const codes = {

  CALLBACK_SUCCESS: 'BILLER-30-0000-S',

  CALLBACK_FAILED: 'BILLER-30-3030-E',

  SUCCESS: 'BILLER-18-0000-S',

  UNSUPPORTED_GRANT_TYPE: 'unsupported_grant_type',

  INVALID_GRANT: 'invalid_grant',

  INTERNAL_SERVICE_ERROR: 'DebitMandate-10-1000-E',

  // Username or password is not specified
  EMPTY_USERNAME_OR_PASSWORD: 'DebitMandate-10-2001-E',

  // Customer MSISDN was not specified
  CUSTOMER_MSISDN_NOT_SPECIFIED: 'DebitMandate-10-2002-E',

  PASSWORD_NOT_SPECIFIED: 'DebitMandate-10-2003-E',

  INVALID_MSISDN: 'DebitMandate-10-2004-V',

  NOT_REGISTERED: 'DebitMandate-10-2005-E',

  BACKEND_ERROR: 'DebitMandate-10-5000-E',

  INVALID_USERNAME_OR_PASSWORD: 'DebitMandate-10-3000-E',

  BILLER_MSISDN_NOT_SPECIFIED: 'DebitMandate-10-2038-V',

  INVALID_BILLDER_MSISDN: 'BILLER-18-3040-E',

  FAILED_IN_SUM_AMOUNT: 'BILLER-18-3018-E',

  FAILED_IN_MIN_AND_MAX_AMONT: 'BILLER-18-3019-E',

  FAILED_IN_FREQUENCY: 'BILLER-18-3020-E',

  WRONG_BILLER_USERNAME_OR_PASSWORD: 'BILLER-18-3021-E',

  BILLER_NOT_ACTIVE: 'BILLER-18-3022-E',

  INVALID_REFERENCE_ID: 'DebitMandate-10-2020-V',

  // Custom error code
  // Indicating the request was successful but the returned response could be understood
  INVALID_RESPONSE: 'INVALID_RESPONSE'
}

Object.freeze(codes)

module.exports = codes
