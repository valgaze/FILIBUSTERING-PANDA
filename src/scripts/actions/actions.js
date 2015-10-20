export const ADD_MESSAGE = 'ADD_MESSAGE';
export const RECEIVE_MESSAGE = 'RECEIVE_MESSAGE';



// "actions" in redux are just objects describing a type and the change desired (in this case a new message to be added)
export function addMessage (message, location) {  //ES6-style module.exports.addMessage = addMessage
  return {
    type: ADD_MESSAGE,
    message,
    location
  };
};

export function receiveMessage (message, location, distance) {  //ES6-style module.exports.addMessage = addMessage
  console.log("\n\n\n\n IT GOES TO ACTIONS.JS")
  return {
    type: RECEIVE_MESSAGE,
    message,
    location,
    distance
  };
};
