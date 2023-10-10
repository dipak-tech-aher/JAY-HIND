import React from 'react';
import BillableDetailsForm from './billableDetailsForm';
import AddressDetailsFormViewMin from '../Address/AddressDetailsFormViewMin';
import ContactDetailsFormViewMin from '../Contact/ContactDetailsFormViewMin';
import CustomerDetailsFormViewMin from './CustomerDetailsFormViewMin'

const CustomerDetailsFormView = ((props) => {
    const { customerData, sectionConfig, customizedLable } = props?.data
    const { setCustomerDetails, handlePrintClick } = props?.handler
    const accountCount = props?.data?.accountCount
    const serviceCount = props?.data?.serviceCount
    const interactionCount = props?.data?.interactionCount
    return (
        <>
            <div className="cust-profile">
                <CustomerDetailsFormViewMin
                    data={{ customerData, accountCount, serviceCount, interactionCount, source: 'CUSTOMER', sectionConfig, customizedLable }}
                    handler={{ setCustomerDetails, handlePrintClick }}
                />
                {/* <div className="cust-open-accounts">
                        <a >Total Account(s) - {accountCount}</a>
                        <hr className="cmmn-hline"/>
                        <a >Total Service(s) - {serviceCount}</a>
                    </div>
                    <div className="cust-open-tickets">
                        <a >Open Interactions(s) - {interactionCount}</a>                     
                    </div> */}
            </div>

            <div className="cmmn-container-base">
                <div className="container-heading">
                    <span className="container-title"><i className="fe-pocket"></i> Contact Details</span>
                    <span><a ><i className="fe-maximize noti-icon" data-toggle="modal" data-target="#myModal"></i></a></span>
                </div>
                <ContactDetailsFormViewMin data={{ contactDetails: customerData?.customerContact[0] }} />
                <div className="cust-sect-full-grid container-three-row">

                    {
                        customerData?.customerAddress?.length > 0 ?
                            <AddressDetailsFormViewMin data={{ addressDetails: customerData?.customerAddress[0] }} />
                            : <>NA</>
                    }


                </div>
            </div>

            <div className="cmmn-container-base">
                <div className="container-heading">
                    <span className="container-title"><i className="fe-pocket"></i> {customizedLable} Identification</span>
                    <span><a >
                        <i className="fe-maximize noti-icon" data-toggle="modal" data-target="#myModal"></i>
                    </a></span>
                </div>
                <div className="container-four-row">
                    {
                        customerData?.customerCategory === 'CATRES' ?
                            <>
                                <div className="container-label">
                                    <span className="label-container-style">Date of Birth</span>
                                    <span>{customerData?.birthDate || 'NA'}</span>
                                </div>
                                <div className="container-label">
                                    <span className="label-container-style">Gender</span>
                                    <span>{customerData?.gender || 'NA'}</span>
                                </div>
                            </>
                            :
                            <>
                                <div className="container-label">
                                    <span className="label-container-style">Registered Number</span>
                                    <span>{customerData?.registeredNo || 'NA'}</span>
                                </div>
                                <div className="container-label">
                                    <span className="label-container-style">Registered Date</span>
                                    <span>{customerData?.registeredDate || 'NA'}</span>
                                </div>
                            </>
                    }

                    <div className="container-label">
                        <span className="label-container-style">ID Type</span>
                        <span>{customerData?.idTypeDesc?.description || 'NA'}</span>
                    </div>
                    <div className="container-label">
                        <span className="label-container-style">ID Number</span>
                        <span>{customerData?.idValue || 'NA'}</span>
                    </div>
                    <div className="container-label">
                        <span className="label-container-style">Billable</span>
                        <span>{customerData?.billable === 'Y' ? 'Yes' : 'No'}</span>
                    </div>
                </div>
            </div>
        </>
    )
})
export default CustomerDetailsFormView;