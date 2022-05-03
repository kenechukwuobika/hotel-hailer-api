const axios = require('axios');
const constants = require('../../constants');

const service = axios.create({
    baseURL: constants.PAYSTACK_TRANSACTION_URL,
    timeout: 60000
})

service.interceptors.request.use(config => {
    config.headers = {
        'Authorization': `Bearer ${process.env.PAYSTACK_TEST_SECRET}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }

  return config
}, error => {
  Promise.reject(error)
})

module.exports = service;