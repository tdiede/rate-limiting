const fetch = require('node-fetch');

function APIException(message, statusCode) {
  this.message = message;
  this.statusCode = statusCode;
}

async function getData(page) {
  const url = `https://wgcvq4480c.execute-api.us-west-2.amazonaws.com/dev${
    page ? `?page=${page}` : ''
  }`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const body = await response.json();

    if (!response.ok) {
      throw new APIException(body.message, response.status);
    }

    return body;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

module.exports = { getData };
