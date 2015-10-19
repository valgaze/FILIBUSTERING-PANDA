/**
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */


import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { addMessage } from '../actions/actions.js';
   var ref = new Firebase('https://luminous-torch-3310.firebaseio.com');
    var commentsRef = ref.child("commentsBox");
//store.dispatch(addMessage('testing 123...', [45,65]))
// <form onSubmit={() => { dispatch(addMessage("hey hey", [45,65]))}  }>

class App extends Component {
  // componentDidMount(){
  //   console.log("damn thing loaded");
  //   commentsRef.on('child_added', function(snapshot) {
  //     var message = snapshot.val();
  //     console.log("This is the message that should render:", message.text)
  //     //store.dispatch(addMessage(message.text, [50,50]));
  //   });
  // }
 handleClick(e) {
   const node = this.refs.input;
   const text = node.value.trim();
   var randomLoc = [Math.random()*90, Math.random()*90];
   this.props.dispatch(addMessage(text, [45,65]));
   node.value = '';
 }
  render () {
    // from store via connect call (below)
    const { messages, dispatch } = this.props;
    const previewList = messages.map( (msg) => 
      {return (<div> At these coords-- {msg.location.join(", ")} -- the user says "{msg.message}" </div>);}
    );
    return (
      <div>
        <div>
               <input type='text' ref='input' />
               <button onClick={e => this.handleClick(e)}>
                 Add
               </button>
        </div>
        {previewList}
      </div>
    );
  };
};


// App.PropTypes = {
//   messages: PropTypes.arrayOf()
// }

function select(state) {
  return {
    messages: state.messages
  };
};


export default connect(select)(App);


/////
// export default class AddTodo extends Component {
//   render() {
//     return (
//       <div>
//         <input type='text' ref='input' />
//         <button onClick={e => this.handleClick(e)}>
//           Add
//         </button>
//       </div>
//     );
//   }

//   handleClick(e) {
//     const node = this.refs.input;
//     const text = node.value.trim();
//     this.props.onAddClick(text);
//     node.value = '';
//   }
// }

// AddTodo.propTypes = {
//   onAddClick: PropTypes.func.isRequired
// };


// var React = require('react');

// var Hello = React.createClass({
//   render: function() {
//     return ( <p> Hello World </p> );
//   }
// });

// module.exports = Hello;
