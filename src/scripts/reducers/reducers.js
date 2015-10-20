import { ADD_MESSAGE, RECEIVE_MESSAGE, REMOVE_MESSAGE } from '../actions/actions.js'  // ES6note: like var ADD_MESSAGE = require('../actions/actions.js').ADD_MESSAGE
      // var ref = new Firebase('https://luminous-torch-3310.firebaseio.com');
      //   var commentsRef = ref.child("commentsBox");


const initialState = {
  messages: []
};

export function messages (state = initialState, action) {  // ES6note: default assignment to [] if state is undefined
  switch (action.type) {
    case REMOVE_MESSAGE:
      console.log("REDUCERS.JS fire", action.key);
      console.log("State:", state.messages)

      var filteredMessages = state.messages.filter((message) => message.key !== action.key);

      return Object.assign({}, state, {
          messages: filteredMessages
      });

    case ADD_MESSAGE:
      return Object.assign({}, state);

      case RECEIVE_MESSAGE:
        return Object.assign({}, state, {
            messages: [...state.messages, {
                message: action.message,
                location: action.location,
                distance: action.distance, 
                key: action.key
            }]
        });
    default:
      return state;
  }
};