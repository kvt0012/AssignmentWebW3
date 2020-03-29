const uuid = require('uuid/v4');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');

let DUMMY_PLACES = [
  {
    id: 'p1',
    loginName: 'kvt0012',
    description: 'University of Information Technology, Vietnam National University Ho Chi Minh City (VNU-HCM) is a public university which takes charge in training in Information and Communication Technology (ICT). Established under the Decision No. 134/2006/QD-TTg dated on June 08, 2006 by the Prime Minister, UIT was based on the Center for Information Technology Development. As a member of VNU-HCM, UIT is responsible for training human resources in information technology (IT) in order to contribute to the development of the Vietnam’s IT industry actively. Furthermore, UIT carries out scientific research and advanced IT transfer. It especially focuses on the field of applications in order to boost the industrialization and modernization in the country.',
    address: 'RSPapers',
    star:'300',
    fork:'200',
    creator: 'u1'
  }
];

const getRepoById = (req, res, next) => {
  const placeId = req.params.pid; // { example pid: 'p1' }

  const place = DUMMY_PLACES.find(p => {
    return p.id === placeId;
  });

  if (!place) {
    throw new HttpError('Could not find a place for the provided id.', 404);
  }

  res.json({ place }); // => { place } => { place: place }
};



const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;

  const places = DUMMY_PLACES.filter(p => {
    return p.creator === userId;
  });

  if (!places || places.length === 0) {
    return next(
      new HttpError('Could not find places for the provided user id.', 404)
    );
  }

  res.json({ places });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { loginName, address, creator } = req.body;

  let githubAPI;
  try {
    githubAPI= await getCoordsForAddress(loginName,address);
  } catch (error) {
    return next(error);
  }

 
  const createdPlace = {
    id: githubAPI['id'],
    loginName,
    description: githubAPI['description'],
    star: githubAPI['stargazers_count'],
    fork: githubAPI['forks'],
    address,
    creator
  };

  DUMMY_PLACES.push(createdPlace); //unshift(createdPlace)

  res.status(201).json({ place: createdPlace });
};

const updatePlace = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError('Invalid inputs passed, please check your data.', 422);
  }

  const { loginName, description } = req.body;
  const placeId = req.params.pid;

  const updatedPlace = { ...DUMMY_PLACES.find(p => p.id === placeId) };
  const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId);
  updatedPlace.loginName = loginName;
  updatedPlace.description = description;

  DUMMY_PLACES[placeIndex] = updatedPlace;

  res.status(200).json({ place: updatedPlace });
};

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid;
  if (!DUMMY_PLACES.find(p => p.id === placeId)) {
    throw new HttpError('Could not find a repo for that id.', 404);
  }
  DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);
  res.status(200).json({ message: 'Deleted place.' });
};

exports.getRepoById = getRepoById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
