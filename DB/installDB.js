'use strict'

const conn = require('../lib/connectMongoose')
const Advertisement = require('../models/Advertisement')
const adsInit = require('./ads.json')

conn.once('open', async () => {
  try {
    await initAdsNodepop()
    console.log('The initialization of the database has been successfully.')
    conn.close()
  } catch (err) {
    console.error('There was an error:', err)
    process.exit(1)
  }
})

async function initAdsNodepop () {
  await Advertisement.deleteMany()
  await Advertisement.insertMany(adsInit)
}
