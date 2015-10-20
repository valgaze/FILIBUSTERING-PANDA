export const ADD_MESSAGE = 'ADD_MESSAGE';
export const RECEIVE_MESSAGE = 'RECEIVE_MESSAGE';
export const REMOVE_MESSAGE = 'REMOVE_MESSAGE';

const Firebase = require('firebase');
const GeoFire = require('geoFire');
const config = require('../../../config');
const ref = new Firebase(`${ config.FIREBASE_ROOT }`);
const commentsRef = ref.child("commentsBox");


// "actions" in redux are just objects describing a type and the change desired (in this case a new message to be added)
export function addMessage (message, location) {  //ES6-style module.exports.addMessage = addMessage
    var newRef = commentsRef.push({text: message});
    var geoRef = ref.child("geolocations");
    var geoFire = new GeoFire(geoRef);
    var randomLoc = [Math.random()*90, Math.random()*90];
    geoFire.set(newRef.key(), randomLoc);

  return {
    type: ADD_MESSAGE,
    message,
    location
  };
};

export function receiveMessage (message, location, distance, key) {  //ES6-style module.exports.addMessage = addMessage
 // console.log("\n\n\n\n IT GOES TO ACTIONS.JS")
  return {
    type: RECEIVE_MESSAGE,
    message,
    location,
    distance,
    key
  };
};

export function removeMessage (key) {
  console.log("actions.js FIRE", key)
  return {
    type: REMOVE_MESSAGE,
    key
  };
};