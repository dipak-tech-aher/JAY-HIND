import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import business from "../../assets/images/cooperation.png";
import government from "../../assets/images/government.png";
import regular from "../../assets/images/user.png";

const CustomerTypePopup = (props) => {

    const { isOpen, customerTypeLookup, selectedCustomerType } = props?.data
    const { setIsOpen, setSelectedCustomerType, handleMoveNext } = props?.handler

    const RegularModalCustomStyles = {
        content: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '50%',
            maxHeight: '70%'
        }
    }

    return (
        <>
            <Modal className='skel-create-customer-type-modal' show={isOpen} onHide={() => setIsOpen(false)} backdrop="static"
                size="lg"
                aria-labelledby="example-modal-sizes-title-lg"
                centered>
                <Modal.Header>
                    <Modal.Title>What is the purpose for Customer Creation?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="">
                        <div className="form-row">
                            <div className="skel-add-product-stype mt-2">
                                <div className="skel-plans">
                                    {
                                        customerTypeLookup && customerTypeLookup.map((x) => (
                                            <div className={`skel-plans-product skel-plan text-center ${x.code === selectedCustomerType ? 'active' : ''}`} onClick={() => { setSelectedCustomerType(x.code); setIsOpen(false); handleMoveNext() }}>
                                                <label className="premium-plan" htmlFor="prd">
                                                    <div className="plan-content">
                                                        <div className="plan-details">
                                                            <span>{x?.description}</span>
                                                            <hr className="cmmn-hline" />
                                                        </div>
                                                    </div>
                                                </label>
                                                {}
                                                <img src={x.code === "BUS" ? business : x.code === "GOV" ? government : x.code === "REG" ? regular : regular} alt="" className="img-fluid pb-3" width="50" height="50" />
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className='skel-footer-modal-close'>
                    <Button variant="secondary" onClick={() => setIsOpen(false)} className="skel-btn-cancel">
                        Close
                </Button>
                    {/* <Button variant="primary" onClick={() => setIsOpen(false)}>
                    Save
                </Button> */}
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default CustomerTypePopup