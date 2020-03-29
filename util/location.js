const axios = require('axios');

const HttpError = require('../models/http-error');


async function getCoordsForAddress(loginName,repoName) {
  const response = await axios.get(
    `https://api.github.com/repos/${loginName}/${repoName}`
  );

  const data = response.data;

  if (!data || data.status === 'ZERO_RESULTS') {
    const error = new HttpError(
      'Could not find this repo for the specified address.',
      422
    );
    throw error;
  }

  const coordinates = data;
  console.log(coordinates);
  return coordinates;
}

module.exports = getCoordsForAddress;
