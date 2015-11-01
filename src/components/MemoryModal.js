import React, { Component, PropTypes } from 'react';
import { Modal, Button, Image }        from 'react-bootstrap';
import * as moment                     from 'moment';
import {reactionTypes, reactionsRef}                 from '../actions/firebaseVars.js';
import { connect }                     from 'react-redux';
import { rateMemory, unrateMemory}     from '../actions/memoryActions.js';
import { bindActionCreators }          from 'redux';

export class MemoryModal extends Component {
  static propTypes = {
    userUID: React.PropTypes.string,
    rateMemory: React.PropTypes.func,
    unrateMemory: React.PropTypes.func
  };
  // getInitialState() {
  //   return {
  //     counts: this.props.memoryModalState.memoryInFocus.reactions,
  //     initialVotedOn: {},

  //   };
  // }
  constructor(props) {
    super(props);
    this.state = {
      counts: props.memoryModalState.memoryInFocus.reactions,
      initialVotedOn: {},
      loading:true
    };
  }

  componentWillMount() {
    
    if (this.props.userUID === null) {
      console.log("\n\n\n\n\n\n\n WE NEED TO HANDLE LOGGED OUT SITUATION TO FETCH REACTIONS \n\n\n\n\n\n");
      //votedOn doesn't have anything happen and we have counts to tell us what we need to know
      // User not logged in
      return;
    }

    /*
    // SET STATE WITH SPREAD OPERATOR
    this.setState({...this.state, fro});
    
    */
   // this.setState({...this.state, {THENEWTHING}})
   
    const memoryKey = this.props.memoryModalState.memoryInFocus.key;
      console.log("Full memory:", this.props.memoryModalState.memoryInFocus);
      console.log("Relevant reactions:", this.props.memoryModalState.memoryInFocus.reactions)
    const reactionsFromServer = reactionsRef.child(memoryKey);
      console.log("from server:", reactionsFromServer);
    const currentUser = this.props.userUID;

    reactionsFromServer.once("value", (snapshot) => {
      var result = snapshot.val();
      if (snapshot.val() !== null){
     
        if (result[currentUser]){
          // TODO: Refactor using spread operator
          var votes = result[currentUser];
          for (var vote in votes){
            //this.state.initialVotedOn[vote] = votes[vote];
            //console.log(votes[vote], vote, votes)
            const initialVotedOn = {
              ...this.state.initialVotedOn,
              [vote]: votes[vote]
            };
            this.setState({...this.state, initialVotedOn});
          }
          const loading = false;
          this.setState({...this.state, loading});
          console.log("we have set state:", this.state.initialVotedOn);
          //console.log("componentWillMount status:", this.state.initialVotedOn);

        //  this.setState({... that.state, result[currentUser]}); 
          //console.log("state duddeee:", this.state)

        }
//        this.setState({...this.state, });
        // for (var reaction in result) {
        //   var check = reactionsFromServer.child(reaction).child(userUID);
        //   console.log("This is the result:", check)
        //   //Query on user id for each
        //   //Check if null
        //   //If it's not null then pop it on initialVotedOn

        // }
      }
    }, () => {
      console.log("Tragic error", err);
      this.setState({...this.state, loading});
    });

    // query firebase and initialize state.votedOn
    // {frown:3, smile:2}
      // votedOn{frown};
      // {frown:2, smile2}

  }
  cleanDate (input) {
    const rootDate = moment.default(input).fromNow();
    return rootDate;
  }

  cleanDistance (input) {
    const units = 'km';
    const distanceString = input.toFixed(2) + ' ' + units + ' away';
    return distanceString;
  }

  reactionHandler (payload) {
    if (this.props.userUID === null) {
      // User not logged in
      return;
    }
    const key = payload.key;
    const reactionType = payload.reactionType;
    const context = payload.context;
    const elementKey = payload.elementKey;
    let reactionCount = payload.reactionCount;
         console.log("\n\n\n\nWOOO:", React.DOM.i({key: elementKey}));    

      if (this.state.initialVotedOn[reactionType]){

        this.props.unrateMemory(key, reactionType);
        reactionCount--;

        const initialVotedOn = {
          ...this.state.initialVotedOn,
          [reactionType]: null
        };
        const counts = {...this.state.counts, [reactionType]: reactionCount}
        this.setState({...this.state, initialVotedOn, counts});
        
      } else {
        this.props.rateMemory(key, reactionType);
        reactionCount++;
        const initialVotedOn = {
          ...this.state.initialVotedOn,
          [reactionType]: true
        };
        const counts = {...this.state.counts, [reactionType]: reactionCount}
        this.setState({...this.state, initialVotedOn, counts});   
        
        // console.log("what's in state for", reactionType, ":", this.state.counts[reactionType]);
        // console.log("added", reactionType, ':', reactionCount);
      }
  }

  fetchReactions (memoryObj) {
    const reactions = memoryObj.reactions;
    const output = [];
    for (let i = 0; i < reactionTypes.length; i++) {
      const classRef = reactionTypes[i];
      const reactionCount = this.state.counts[classRef] || 0;


      let classnames = `fa fa-${classRef}-o fa-border fa-2x`;
      
          if (this.state.initialVotedOn[classRef]){
            classnames += ` votedOn`
          }
  
      output.push(
         <i key={i} className={classnames}
           onClick={() =>

             this.reactionHandler({
               key:memoryObj.key,
               reactionType: classRef,
               reactionCount: reactionCount,
               elementKey: i,
               context:this})}>
              { this.state.counts[classRef] || 0 }

           </i>);
    }
    return output;
  }


  render () {
    console.log("\n\n\n\n\n\n\n STATE UPDATED, CALLING RENDERING FUNCTION!!!")
    const { memoryModalState, memoryModalActions } = this.props;
    const memory = memoryModalState.memoryInFocus;
    const dismissMemoryDetails = memoryModalActions.dismissMemoryDetails;

    let memoryBody = null;
    if (memory.content.type === 'text') {
      memoryBody = memory.content.data;
    } else if (memory.content.type === 'music') {
      const musicData = memory.content.data;
      memoryBody = (<div>
        <Image
          src={musicData.artworkUrl100} rounded
          style={{marginRight: 5}}/>
        <h2>{musicData.trackName}</h2>
        <h4>{musicData.artistName}</h4>
        <audio src={memory.content.data.previewUrl} autoPlay controls />
      </div>);
    }

    return (
      <Modal show={memoryModalState.showMemoryModal}
             onHide={dismissMemoryDetails}
             style={{opacity: 1 - (memory.distance / 3000)}}>
        <div className="memory-modal">
          <Modal.Header className="memory-modal-title">
            <Modal.Title>{memory.content.title} {memory.key}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="memory-modal-body">{memoryBody}</Modal.Body>
          <Modal.Footer className="memory-modal-footer">
           <div className="text-left">
            <div>
              { this.cleanDate(memory.createdAt) } ({ this.cleanDistance(memory.distance) })
            </div>
            <div>Reactions:</div>
               <div>
               { this.fetchReactions(memory) }
              </div>
           </div>
            <Button onClick={dismissMemoryDetails}>Close</Button>
          </Modal.Footer>
        </div>
      </Modal>
    );
  }

}

MemoryModal.propTypes = {
  memoryModalState: PropTypes.shape({
    memoryInFocus: PropTypes.object,
    showMemoryModal: PropTypes.boolean
  }),
  memoryModalActions: PropTypes.shape({
    showMemoryDetails: PropTypes.func,
    dismissMemoryDetails: PropTypes.func
  })
};

const mapDispatchToProps = (dispatch) => ({
  rateMemory: bindActionCreators(rateMemory, dispatch),
  unrateMemory: bindActionCreators(unrateMemory, dispatch)
});


const mapStateToProps = (state) => ({
  userUID: state.getIn(['auth', 'uid'])
});

export default connect(mapStateToProps, mapDispatchToProps)(MemoryModal);

