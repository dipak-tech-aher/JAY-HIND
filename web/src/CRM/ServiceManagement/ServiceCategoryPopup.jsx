import React from 'react'
import ReactModal from 'react-modal';
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import contactInfo from "../../assets/images/cnt-info.svg";
const ServiceCategoryPopup = (props) => {

    const { isOpen, serviceTypeLookup, serviceData } = props?.data
    const { setIsOpen, fetchProductList } = props?.handler

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
            <Modal show={isOpen} onHide={() => setIsOpen(false)} backdrop="static"
                size="lg"
                aria-labelledby="example-modal-sizes-title-lg"
                centered>
                <Modal.Header>
                    <Modal.Title>What Kind of Services you are interested in?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="">
                        <div className="form-row">
                            {/* <div className="skel-cr-rht-sect-form">
                                <div className="skel-sel-serv-type">
                                    {
                                        serviceTypeLookup && serviceTypeLookup.map((x) => (
                                            <>
                                                <input type="checkbox" name="stype" id={x.code} checked={x.code === serviceData?.serviceType} /><label htmlFor="Accessories" onClick={() => fetchProductList(x, 'POPUP')}>{x?.description}</label>
                                            </>
                                        ))
                                    }
                                </div>
                            </div> */}
                            <div className="skel-add-product-stype mt-4">
                                <div className="skel-plans">
                                    {
                                        serviceTypeLookup && serviceTypeLookup.map((x) => (
                                            <div className={`skel-plans-product skel-plan ${x.code === serviceData?.serviceType ? 'active' : ''}`} onClick={() => { fetchProductList(x, 'POPUP') }}>
                                                <label className="premium-plan" htmlFor="prd">
                                                    <div className="plan-content">
                                                        <div className="plan-details">
                                                            <span>{x?.description}</span>
                                                            <hr className="cmmn-hline" />
                                                        </div>
                                                    </div>
                                                </label>
                                                <img src={contactInfo} alt="" className="img-fluid" width="250" height="250" />
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
            <ReactModal isOpen={false} onRequestClose={() => setIsOpen(false)} contentLabel="Followup Modal" style={RegularModalCustomStyles}>
                <div className="modal-center" id="followhistoryModal" tabIndex="-1" role="dialog" aria-labelledby="followupModal" aria-hidden="true">
                    <div className="modal-dialog " role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="followupModal">What Kind of Services you are interested in?</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => setIsOpen(false)}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-12">
                                        <fieldset>
                                            <div className="cmmn-skeleton skel-cr-cust-form">
                                                <div className="form-row">

                                                    <div className="skel-cr-rht-sect-form">
                                                        <div className="skel-sel-serv-type">
                                                            {
                                                                serviceTypeLookup && serviceTypeLookup.map((x) => (
                                                                    <>
                                                                        <input type="checkbox" name="stype" id={x.code} checked={x.code === serviceData?.serviceType} /><label htmlFor="Accessories" onClick={() => fetchProductList(x, 'POPUP')}>{x?.description}</label>
                                                                    </>
                                                                ))
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </fieldset>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ReactModal>
        </>
    )
}

export default ServiceCategoryPopup