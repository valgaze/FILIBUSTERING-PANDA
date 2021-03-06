import React from 'react';
import { Modal, Button, Input } from 'react-bootstrap';

export default class CreateMemoryModal extends React.Component {
  static propTypes = {
    modalType: React.PropTypes.string,
    modalState: React.PropTypes.string,
    dismissCreateMemory: React.PropTypes.func,
    sendMemory: React.PropTypes.func
  };

  memoryTypes = {
    text: 'Text',
    music: 'Music',
    drawing: 'Drawing'
  };

  handleClick() {
    const title = this.refs.title.refs.input;
    const data = this.refs.data.refs.input;
    const priv = this.refs.priv.refs.input;
    // alert(priv.checked);
    this.props.sendMemory({data: data.value, title: title.value, type: 'text'}, priv.checked);
    title.value = '';
    data.value = '';
    priv.checked = false;
  }

  renderContentInput() {
    if (this.props.modalType === 'text') {
      return this.renderTextInput();
    }
    if (this.props.modalType === 'music') {
      return this.renderMusicInput();
    }
    if (this.props.modalType === 'drawing') {
      return this.renderDrawingInput();
    }
  }

  renderTextInput() {
    return (
      <Input
        type='text'
        ref='data'
        placeholder='Memory..'/>
    );
  }

  renderMusicInput() {
    return (
      <Input
        type='text'
        ref='data'
        placeholder='Search for music..'/>
    );
  }

  renderDrawingInput() {
    return (
      'DRAWING '
    );
  }

  renderTitleInput() {
    return (
      <Input
        type='text'
        ref='title'
        placeholder='Title' />
    );
  }

  render () {
    let showModal = false;
    if (this.props.modalType) {
      showModal = true;
      if (this.props.modalType === 'hide') {
        showModal = false;
      }
    }

    /* TODO: render correct memory fields based on memory type */

    return (
      <Modal show={ showModal }
             onHide={this.props.dismissCreateMemory}>
        <div className="memory-modal">
          <Modal.Header className="memory-modal-title">
            <Modal.Title>New {this.memoryTypes[this.props.modalType]} Memory</Modal.Title>
          </Modal.Header>
          <Modal.Body className="memory-modal-body">
            { this.renderTitleInput() }
            { this.renderContentInput() }
            Private:
            <Input
              className='message-private'
              type='checkbox'
              ref='priv'
              placeholder='Memory..'/>
          </Modal.Body>
          <Modal.Footer className="memory-modal-footer">
            <Button
              className='add-memory-btn'
              onClick={() => this.handleClick()}>
              Add
            </Button>
            <Button
              className='close-modal-btn'
              onClick={this.props.dismissCreateMemory}>
              Close
            </Button>
          </Modal.Footer>
        </div>
      </Modal>
    );
  }
}
// const mapStateToProps = (state) => ({
//   userUID: state.getIn(['auth', 'uid'])
// });
// const mapDispatchToProps = (dispatch) => ({
//   sendMemory : bindActionCreators(sendMemory, dispatch)
// });

// export default connect(mapStateToProps, mapDispatchToProps)(CreateMemoryModal);

