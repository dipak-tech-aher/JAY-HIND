import React, { useEffect, useState } from 'react';
import AddressDetailsFormView from '../Address/AddressDetailsFormView'
import Modal from 'react-modal';
import moment from 'moment'
import { RegularModalCustomStyles } from '../../common/util/util';
import  BillableDetailsForm  from './billableDetailsForm';

const CustomerDetailsFormView = React.forwardRef((props, ref) => {
    const selectedCustomerType = props?.data?.selectedCustomerType;
    const customerData = props?.data?.customerData
    const customerAddress = props?.data?.customerAddress

    const billableData = props?.data?.billableData
    const [customerTypeString, setCustomerTypeString] = useState(props?.data?.selectedCustomerType)
    const isOpen = props?.data.isOpen
    const setIsOpen = props?.modalStateHandlers.setIsOpen
    const handlePrint = props?.modalStateHandlers.handlePrint
    const printPreviewCssClass = selectedCustomerType === 'BUSINESS' || selectedCustomerType === 'GOVERNMENT' ? 'business' : 'residential';
    console.log(props.data)

    useEffect(() => {
        getCustomerType();
    }, [])
    const getCustomerType = () => {
        let str
        str = customerTypeString.toLowerCase()
        setCustomerTypeString(str.charAt(0).toUpperCase() + str.substr(1))
    }
    const handleClick = () => {
        setIsOpen(false)
    }
    return (<>
        < Modal style={RegularModalCustomStyles}

            isOpen={isOpen} >
            <div className="modal-content ">
                <div className="modal-header p-1">
                    <h4 className="modal-title" >Preview</h4>
                    <button type="button" className="close" onClick={() => {
                        setIsOpen(false)
                    }}> <span aria-hidden="true">&times;</span>
                    </button>

                </div><br></br>
                <div className={`preview-box ${printPreviewCssClass}`} ref={ref}>
                    <div className="modal-body">
                        <div className="scheduler-border">
                            {
                                customerTypeString && <div className="col-12 pl-2 bg-light border">
                                    <h5 className="text-primary">{customerTypeString + ' Customer Details'}</h5>
                                </div>
                            }

                            <div className="row col-13">
                                <div className="col-13 ">
                                    <div className="scheduler-border scheduler-box mt-2 bg-white border pb-2 ml-2 mr-2 pl-1 pr-2">
                                        <div className="row col-12 pl-1 pt-1 m-0">
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label htmlFor="customerNumber" className="col-form-label">Customer Number</label>
                                                    <p>{customerData.crmCustomerNo}</p>
                                                </div>
                                            </div>
                                            <div className="col-3">
                                                <div className="form-group">
                                                    <label htmlFor="customerNumber" className="col-form-label">Title</label>
                                                    <p>{customerData?.title}</p>
                                                </div>
                                            </div>                                                   
                                            <div className="col-3">
                                                <div className="form-group">
                                                    <label htmlFor="customerNumber" className="col-form-label">Surename</label>
                                                    <p>{customerData?.lastName}</p>
                                                </div>
                                            </div>
                                            <div className="col-3">
                                                <div className="form-group">
                                                    <label htmlFor="customerNumber" className="col-form-label">Forename</label>
                                                    <p>{customerData?.firstName}</p>
                                                </div>
                                            </div>
                                            
                                            {
                                                (selectedCustomerType === 'BUSINESS' || selectedCustomerType === 'GOVERNMENT') &&
                                                <>
                                                    <div className="col-3">
                                                        <div className="form-group">
                                                            <label htmlFor="customerTitle" className="col-form-label">Company Name</label>
                                                            <p>{customerData?.companyName}</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-3">
                                                        <div className="form-group">
                                                            <label htmlFor="customerNumber" className="col-form-label">Registration Number</label>
                                                            <p>{customerData?.registrationNbr}</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-3">
                                                        <div className="form-group">
                                                            <label htmlFor="Surname" className="col-form-label">Registration Date</label>
                                                            <p>{moment(customerData?.registrationDate).format('DD-MMM-YYYY')}

                                                            </p>
                                                        </div>
                                                    </div>
                                                </>
                                            }   

                                            {
                                                selectedCustomerType === 'RESIDENTIAL' &&
                                                <>
                                                    <div className="col-3">
                                                        <div className="form-group">
                                                            <label htmlFor="Forename" className="col-form-label">Gender</label>
                                                            <p>{customerData.gender === "M" ? "Male" : "Female"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="col-3">
                                                        <div className="form-group">
                                                            <label className="col-form-label">Date of Birth</label>
                                                            <p>{moment(customerData.dob).format('DD-MMM-YYYY')}</p>
                                                        </div>

                                                    </div>
                                                </>
                                            }

                                            <div className="col-3">
                                                <div className="form-group">
                                                    <label className="col-form-label">ID Type</label>
                                                    <p>{customerData?.idTypeDesc}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="col-3">
                                                <div className="form-group">
                                                    <label className="col-form-label">ID Number</label>
                                                    <p>{customerData?.idNumber}</p>
                                                </div>
                                            </div>
                                            <div className="col-3">
                                                <div className="form-group">
                                                    <label className="col-form-label">Email</label>
                                                    <p>{customerData?.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="col-3">
                                                <div className="form-group">
                                                    <label className="col-form-label">Contact Type</label>
                                                    <p>{customerData?.contactTypeDesc}</p>
                                                </div>
                                            </div>
                                            <div className="col-3">
                                                <div className="form-group">
                                                    <label className="col-form-label">Contact Number</label>
                                                    <p>{customerData?.contactNbr}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label className="col-form-label">Billable</label>
                                                    <input disabled type="checkbox" checked={customerData.billable} className={`form-control`} id="billable"/>                                               
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <br /><br />
                            {
                                customerData.billable === true &&
                                <BillableDetailsForm data={{ billableDetails: billableData }} />
                            }
                            <br /><br />
                            <AddressDetailsFormView
                                data={{
                                    title: "customer_address",
                                    addressData: customerAddress
                                }}
                            />
                            <br /><br />

                            <div className="col-12 pl-2 bg-light border">
                                <h5 className="text-primary">Customer Property</h5> 
                            </div>
                            <div className="row pt-2 pl-2 pr-2">
                                <div className="col-4">
                                    <div className="form-group">
                                        <label className="col-form-label">Customer Property 1</label>
                                        <p>{customerData?.property1}</p>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="form-group">
                                        <label className="col-form-label">Customer Property 2</label>
                                        <p>{customerData?.property2}</p>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="form-group">
                                        <label className="col-form-label">Customer Property 3</label>
                                        <p>{customerData?.property3}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <br />
            <div style={{ display: "flex", justifyContent: "center" }}>
                <button className="btn btn-primary" onClick={handlePrint} >Print</button>&nbsp;
                <button className="btn btn-secondary" onClick={handleClick}>Close</button>
            </div>
        </Modal>
    </>)
})
export default CustomerDetailsFormView;