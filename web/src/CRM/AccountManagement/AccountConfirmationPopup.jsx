import React from 'react'
import {Modal, Button} from 'react-bootstrap';

const AccountConfirmationPopup = (props) => {

    const { isOpen, isOpen1, isOpen2, } = props?.data
    const { setIsOpen, setIsOpen1, setIsOpen2, handleYesCreateAccount, handleNoCreateAccount, handleYesUseCustomerAsAccount, handleNoUseCustomerAsAccount, handleYesUseCustomerAddressAsAccountAddress, handleNoUseCustomerAddressAsAccountAddress } = props?.handler

    const YES = "😃";
    const NO = "🤔";

    return (
        <>
            <Modal className={'confirmation-popup'} show={isOpen} onHide={() => setIsOpen(false)} backdrop="static" aria-labelledby="example-custom-modal-styling-title" centered>
                <Modal.Header >
                    <Modal.Title id="example-custom-modal-styling-title">Do you want to create an account?</Modal.Title>
                    <button type="button" className="close" onClick={() => setIsOpen(false)}><span aria-hidden="true">×</span></button>
                </Modal.Header>
                <Modal.Body>
                    <div className='skel-yes-no'>
                        <div className='skel-yy-nn'>
                            <span className='f-170'>{NO}</span><br />
                            <Button variant="" className='skel-btn-cancel' onClick={handleNoCreateAccount}>No</Button>
                        </div>
                        <div className='skel-yy-nn'>
                            <span className='f-170'>{YES}</span><br />
                            <Button variant="" className="skel-btn-submit" onClick={handleYesCreateAccount}>Yes</Button>
                        </div>
                        
                    </div>
                </Modal.Body>
            </Modal>
            <Modal className={'confirmation-popup'} show={isOpen1} onHide={() => setIsOpen1(false)} backdrop="static" aria-labelledby="example-modal-sizes-title-lg" centered>
                <Modal.Header>
                    <Modal.Title>Do you want to use account details same as customer details?</Modal.Title>
                    <button type="button" className="close" onClick={() => setIsOpen1(false)}><span aria-hidden="true">×</span></button>
                </Modal.Header>
                <Modal.Body>
                    <div className='skel-yes-no'>                        
                        <div className='skel-yy-nn'>
                            <span className='f-170'>{NO}</span><br />
                            <Button variant="" className='skel-btn-cancel' onClick={handleNoUseCustomerAsAccount}>No</Button>
                        </div>
                        <div className='skel-yy-nn'>
                            <span className='f-170'>{YES}</span><br />
                            <Button variant="" className="skel-btn-submit" onClick={handleYesUseCustomerAsAccount}>Yes</Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
            <Modal className={'confirmation-popup'} show={isOpen2} onHide={() => setIsOpen2(false)} backdrop="static" size="lg" aria-labelledby="example-modal-sizes-title-lg" centered>
                <Modal.Header>
                    <Modal.Title>Do you want to use the account address same as customer address?</Modal.Title>
                    <button type="button" className="close" onClick={() => setIsOpen2(false)}><span aria-hidden="true">×</span></button>

                </Modal.Header>
                <Modal.Body>
                    <div className='skel-yes-no'>

                        <div className='skel-yy-nn'>
                            <span className='f-170'>{NO}</span><br />
                            <Button variant="" className='skel-btn-cancel' onClick={handleNoUseCustomerAddressAsAccountAddress}>No</Button>
                        </div>
                        <div className='skel-yy-nn'>
                            <span className='f-170'>{YES}</span><br />
                            <Button variant="" className="skel-btn-submit" onClick={handleYesUseCustomerAddressAsAccountAddress}>Yes</Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default AccountConfirmationPopup