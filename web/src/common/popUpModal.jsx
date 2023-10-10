import React, {useEffect, useState} from 'react';
import {Button, Modal} from 'react-bootstrap';

export default function PopupModal(props) {
    const {popup, setPopup, setConfirmation, title, body, btnCancel, btnSubmit} = props?.data
    const [show, setShow] = useState(popup);
  
    useEffect(()=>{
        setShow(popup)
    },[popup, show])

    const handleClose = (e) => {
        setShow(false)
        setPopup(false)
        setConfirmation(e)
    };
    return (
      <>  
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>{title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{body}</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={()=>{handleClose('cancel')}}>
              {btnCancel}
            </Button>
            <Button variant="primary" onClick={()=>{handleClose('proceed')}}>
              {btnSubmit}
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }

  