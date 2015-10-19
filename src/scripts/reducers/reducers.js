import { ADD_MESSAGE, RECEIVE_MESSAGE } from '../actions/actions.js'  // ES6note: like var ADD_MESSAGE = require('../actions/actions.js').ADD_MESSAGE
      var ref = new Firebase('https://luminous-torch-3310.firebaseio.com');
        var commentsRef = ref.child("commentsBox");

const initialState = {
  messages: []
};

export function messages (state = initialState, action) {  // ES6note: default assignment to [] if state is undefined
  switch (action.type) {
    case ADD_MESSAGE:

      var newRef = commentsRef.push({text: action.message});
      var geoRef = ref.child("geolocations");
      var geoFire = new GeoFire(geoRef);
        var randomLoc = [Math.random()*90, Math.random()*90];
        geoFire.set(newRef.key(), randomLoc);
      return Object.assign({}, state, {});

      case RECEIVE_MESSAGE:
        
        return Object.assign({}, state,
        {
          messages: [...state.messages,               // ES6note: '...' spreads an array into individual values (makes adding the next array item without mutating (i.e. push) easy)
          {
            message: action.message,
            location: action.location
          }
        ]
        });
    default:
      return state;
  }
};