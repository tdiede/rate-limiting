/* Fetch data
 * @param {number} [page] - Page of data to return, optional
 * @returns {Promise} Promise Object - Payload of the request
 */

const {
  getData
} = require('./api');

/*
 * Working with legacy and unreliable APIs is a common problem we have to
 * solve for at Point. For this challenge you must successfully fetch all pages from
 * an external API and sum all of the pages of data to a single integer value.
 * An example successful response from the API is:
 *
    {
      "data": [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150],
      "page": 0,
      "pageCount": 15
    }
 *
 * Things to watch out for:
 *  1. The API is rated limited and only allows 5 requests per 3 seconds
 *  2. The API is unreliable and has been known to fail randomly
 *  3. You can only use core NodeJS modules
 *
 *  Good luck!
 */

const REQUEST_LIMIT = 5
const INTERVAL = 3000

async function main() {
  const sum = await sumPages()
  console.log(`The total sum is: ${sum}`);
}

const sumPages = async (page = 0, tries = 0, maxTries = 5) => {
  try {
    const res = await getData(page)
    if (res["pageCount"] == 1) {
      return reduceSum(res["data"])
    }
    // TODO: batch, get chunks of 5 pages and return as soon as received
    return reduceSum(res["data"]) + getRemainingPages(page + 1, res["pageCount"])
  } catch (e) {
    while (tries < maxTries) {
      console.log(tries, 'num tries for failedPage', page)
      tries += 1
      // TODO: try again, depending on error
      setTimeout(await sumPages(page, tries).catch(e => e), INTERVAL)
    }
  } finally {
    // TODO: throw exception
    return
  }
}

const getRemainingPages = async (page, pageCount) => {
  try {
    let remainingSum = 0
    for (let i = page; i < pageCount; i + REQUEST_LIMIT) {
      let batchSum = 0
      setTimeout(Promise.all(makeBatchCalls(i)).then(
        batchSum => remainingSum += batchSum
      ).catch(e => e), INTERVAL)
    }
    return remainingSum
  } catch (e) {
    return e
  }
}

const makeBatchCalls = async (i, batch_increment = 0) => {
  try {
    let batchSum = 0
    while (batch_increment < REQUEST_LIMIT) {
      let res = await getData(i + batch_increment) // 1, 6, 11
      batchSum += reduceSum(res["data"])
      batch_increment += 1
    }
    return batchSum
  } catch (e) {
    console.log('wait 3s before retry: inside makeBatchCalls')
    setTimeout(await sumPages(i + batch_increment).catch(e => e), INTERVAL)
  }
  // 2, 7, 12
  // 3, 8, 13
  // 4, 9, 14
  // 5, 10
}

// utilities
const concatArrays = (...arrays) => arrays.reduce((accumulator, currVal) => [...accumulator, ...currVal])
const reduceSum = (arr, n = 0) => arr.reduce((accumulator, currVal) => accumulator + currVal, n)

main();


// all pages iterate through, combine into single integer value
// make 5 requests, wait 3 seconds, until #pages reached...
