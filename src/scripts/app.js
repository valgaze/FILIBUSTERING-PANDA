// var React = require('react');

// var App = require('./components/tinyList');

import React from 'react';
import { render } from 'react-dom';
import { createStore } from 'redux';  //ES6-style createStore = require('redux').createStore
import { Provider } from 'react-redux';


import App from './components/tinyList.js';
import { messages } from './reducers/reducers.js';
import { addMessage, receiveMessage, removeMessage } from './actions/actions.js'

const Firebase = require('firebase');
const GeoFire = require('geoFire');
const config = require('../../config');
const ref = new Firebase(`${ config.FIREBASE_ROOT }`);
const commentsRef = ref.child("commentsBox");

let store = createStore(messages);      //ES6-style var declaration

console.log("INITIAL STATE:", typeof store, store.getState());



var geoRef = ref.child("geolocations");
var geoFire = new GeoFire(geoRef);

window.geoQuery = geoFire.query({
      center: [50,50],
      radius: 5000
});

geoQuery.on("key_entered", function(key, location, distance) {  
   commentsRef
    .child(key)
    .once('value', function(snapshot) {
        setTimeout(function(){
          store.dispatch(receiveMessage(snapshot.val().text, location, distance, key));
        }, 50);
    });
});

geoQuery.on('key_exited', function(oldChildSnapshot) {
  console.log("app.js FIRE", oldChildSnapshot);
  setTimeout(function(){
    store.dispatch(removeMessage(oldChildSnapshot));
  }, 50);
  
});

geoQuery.on('key_moved', function(oldChildSnapshot) {
  console.log("\n\n\n\n\n\n\nOMG SOMETHING FIRED!", oldChildSnapshot);
});


// commentsRef.on('child_added', function(snapshot) {
//   console.log("child_added FIRED.")
//   setTimeout(function(){
//     store.dispatch(receiveMessage(snapshot.val().text, [45,50]))
//   }, 50);

// });

  // commentsRef.on('child_added', function(snapshot) {
      //   var message = snapshot.val();
      //     displayChatMessage(message.name, message.text);

      // });

let unsubscribe = store.subscribe(     //redux "subscribe" is a listener for changes, takes a callback, returns a function to cancel the same listener (hence "unsubscribe")
  () => console.log(store.getState())  //ES6-style anonymous function for callback (just log the whole state on change)
);



let rootElement = document.getElementById('app');
render(
  <Provider store={store}>
    <App />
  </Provider>,
  rootElement
);


// redux: store.dispatch is the only way to trigger state changes. takes an action as arg
// store.dispatch(addMessage('testing 123...', [45,65]));
// store.dispatch(addMessage('testing 456...', [10,15]));
// store.dispatch(addMessage('boo yeah!', [1,2]));
// store.dispatch(addMessage('now we are cooking.', [4,88]));
// store.dispatch(addMessage('Sup guys.', [50,50]));


//stop listening/logging
// unsubscribe();