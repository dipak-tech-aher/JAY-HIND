import React, { useState } from 'react';
import Modal from 'react-modal';
import { formatISODateDDMMMYY, formatISODateTime, formatISODDMMMYY } from '../../common/util/dateUtil'
import printHeader from '../../assets/images/print-header.jpg'
import logo from '../../assets/images/new_dtworks_logo_full.png'
import SelectedCatalogCard from './createServices/SelectedCatalogCard';
import SelectedPlanServiceAssetAddonCard from './createServices/SelectedPlanServiceAssetAddonCard';

const customStyles = {
    content: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: '75%'
    }
};

const NewCustomerPreview = React.forwardRef((props, ref) => {

    const [showHeader, setShowHeader] = useState(true)
    const newCustomerData = props?.data?.newCustomerData
    //const plansList = props?.data?.plansList
    const { title, foreName, surName, customerType, companyName } = newCustomerData?.current?.customer
    document.title = customerType === 'BUSINESS' || customerType === 'GOVERNMENT' ? `dtWorks-${companyName ? companyName : ''}` : `dtWorks-${title ? `${title}.` : ''}${surName ? `${surName} ` : ''}${foreName ? `${foreName}` : ''}`
    const serviceRequestData = (props?.data?.serviceRequestData) ? props?.data?.serviceRequestData : null
    const { renderMode } = props?.previewData;
    const { handleSubmit, handleNewCustomerPreviewModalClose, handlePreviewCancel, handlePrint } = props?.modalStateHandlers;
    const printPreviewCssClass = customerType === 'BUSINESS' || customerType === 'GOVERNMENT' ? 'business' : 'residential';


    return (
        <div className="modal-content custom-app">
            <div className="modal-header">
                <h4 className="modal-title">Preview</h4>
                {
                    (renderMode?.previewCancelButton === 'show') ?
                        <button type="button" className="close" onClick={() => { handlePreviewCancel(); document.title = "dtWorks" }}>
                            <span>&times;</span>
                        </button>
                        :
                        <></>
                }
                {
                    (renderMode?.previewCloseButton === 'show') ?
                        <button type="button" className="close" onClick={() => { handleNewCustomerPreviewModalClose(); document.title = "dtWorks" }}>
                            <span>&times;</span>
                        </button>
                        :
                        <></>
                }
            </div>
            <div><hr /></div>
            <div className={`preview-box ${printPreviewCssClass}`} ref={ref}>
                <div className="modal-body ml-2 mr-2 pr-0 pl-0">
                    <fieldset className="scheduler-border2">

                        <div className="row">
                            <div className="row col-12 pb-2 text-center" style={{ backgroundImage: `url(${printHeader})`, backgroundSize: "cover" }}>
                                <div className="col-md-2 mt-2 h-logo">
                                    <img src={logo} width="120px" />
                                </div>
                                <div className="col-md-10 pt-3 text-left h-text">
                                    <h4 style={{ marginLeft: "250px" }}>Customer Application Form</h4>
                                </div>
                            </div>
                        </div>
                        <div className="row tri-sec">
                            <div className="col-12">
                                <section className="triangle">
                                    <h4 id="list-item-2" className="pl-2">
                                        Customer Details</h4>
                                </section>
                            </div>
                        </div>
                        <div className="col-12 row pr-0 break-page">
                            <div className="row col-12 pl-2">
                                {
                                    (newCustomerData?.current?.customer?.customerType === 'RESIDENTIAL') ?
                                        <>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="inputName" className="col-form-label">Title</label>
                                                    <p>{newCustomerData?.current?.customer?.title}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="inputName" className="col-form-label">Surname</label>
                                                    <p>{newCustomerData?.current?.customer?.surName}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="inputName" className="col-form-label">Forename</label>
                                                    <p>{newCustomerData?.current?.customer?.foreName}</p>
                                                </div>
                                            </div>
                                        </>
                                        :
                                        <></>
                                }
                                {
                                    (newCustomerData?.current?.customer?.customerType === 'BUSINESS' || newCustomerData?.current?.customer?.customerType === 'GOVERNMENT') ?
                                        <>
                                            <div className="bussi comp-print col-md-9">
                                                <div className="form-group">
                                                    <label htmlFor="inputName" className="col-form-label">Company Name</label>
                                                    <p>{newCustomerData?.current?.customer?.companyName}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-2"></div>
                                        </>
                                        :
                                        <></>
                                }
                                <div className="col-md-4">
                                    <div className="form-group">
                                        <label htmlFor="inputState" className="col-form-label">Customer Type</label>
                                        <p>{newCustomerData?.current?.customer?.customerType === 'BUSINESS' ? 'Business' : newCustomerData?.current?.customer?.customerType === 'GOVERNMENT' ? 'Government' : 'Residential'}</p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="form-group">
                                        <label htmlFor="inputState" className="col-form-label">Email</label>
                                        <p>{newCustomerData?.current?.customer?.email}</p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="form-group">
                                        <label htmlFor="inputState" className="col-form-label">Contact No.</label>
                                        <p>{newCustomerData?.current?.customer?.contactNbr}</p>
                                    </div>
                                </div>
                                {
                                    (newCustomerData?.current?.customer?.customerType === 'BUSINESS' || newCustomerData?.current?.customer?.customerType === 'GOVERNMENT') &&
                                    <>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="dob" className="col-form-label">Registered Date</label>
                                                <p>{formatISODDMMMYY(newCustomerData?.current?.customer?.registeredDate)}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="idType" className="col-form-label">Registered No</label>
                                                <p>{newCustomerData?.current?.customer?.registeredNbr}</p>
                                            </div>
                                        </div>
                                    </>
                                }
                                {
                                    newCustomerData?.current?.customer?.customerType === 'RESIDENTIAL' &&
                                    <>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <div className="d-flex  flex-column">
                                                    <label htmlFor="accountmfbtn" className="col-form-label">Gender</label>
                                                    <p>{(newCustomerData?.current?.customer?.gender === 'M') ? 'Male' : 'Female'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="dob" className="col-form-label">Date of Birth</label>
                                                <p>{formatISODDMMMYY(newCustomerData?.current?.customer?.dob)}</p>
                                            </div>
                                        </div>

                                    </>
                                }
                                <div className="col-md-4">
                                    <div className="form-group">
                                        <label htmlFor="idType" className="col-form-label">ID Type</label>
                                        <p>{newCustomerData?.current?.customer?.idTypeDesc}</p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="form-group">
                                        <label htmlFor="idNbr" className="col-form-label">ID Number</label>
                                        <p>{newCustomerData?.current?.customer?.idNbr}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 pl-2 pr-2 pt-2" id="address-form">
                                <fieldset className="scheduler-border1">
                                    <legend className="scheduler-border">Customer Address</legend>
                                    <div className="row col-md-12 p-0">
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="flatHouseUnitNo" className="col-form-label">Flat/House/Unit No</label>
                                                <p>{newCustomerData?.current?.customer?.address[0]?.flatHouseUnitNo}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="building" className="col-form-label">Building Name/Others</label>
                                                <p>{newCustomerData?.current?.customer?.address[0]?.building}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="simpang" className="col-form-label">Street/Area</label>
                                                <p>{newCustomerData?.current?.customer?.address[0]?.street}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="cityTown" className="col-form-label">City/Town</label>
                                                <p>{newCustomerData?.current?.customer?.address[0]?.cityTown}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="district" className="col-form-label">District/Province</label>
                                                <p>{newCustomerData?.current?.customer?.address[0]?.districtDesc}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-3 text-left">
                                            <div className="form-group">
                                                <label htmlFor="mukim" className="col-form-label">State/Region</label>
                                                <p>{newCustomerData?.current?.customer?.address[0]?.stateDesc}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="postcode" className="col-form-label">Postcode</label>
                                                <p>{newCustomerData?.current?.customer?.address[0]?.postCodeDesc}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-3 pr-align-btm">
                                            <div className="form-group">
                                                <label htmlFor="country" className="col-form-label">Country</label>
                                                <p>{newCustomerData?.current?.customer?.address[0]?.countryDesc}</p>

                                            </div>
                                        </div>
                                    </div>
                                    <div className="row pt-2"> <i className="fas fa-map-marker-alt text-primary font-18 pr-1"></i>
                                        <p className="address-line">
                                            {(newCustomerData?.current?.customer?.address[0]?.flatHouseUnitNo && newCustomerData?.current?.customer?.address[0]?.flatHouseUnitNo !== '') ? `${newCustomerData?.current?.customer?.address[0]?.flatHouseUnitNo}, ` : ''}
                                            {/* {(newCustomerData?.current?.customer?.address[0]?.block && newCustomerData?.current?.customer?.address[0]?.block !== '') ? `${newCustomerData?.current?.customer?.address[0]?.block}, ` : ''} */}
                                            {(newCustomerData?.current?.customer?.address[0]?.building && newCustomerData?.current?.customer?.address[0]?.building !== '') ? `${newCustomerData?.current?.customer?.address[0]?.building}, ` : ''}
                                            {(newCustomerData?.current?.customer?.address[0]?.street && newCustomerData?.current?.customer?.address[0]?.street !== '') ? `${newCustomerData?.current?.customer?.address[0]?.street}, ` : ''}
                                            {/* {(newCustomerData?.current?.customer?.address[0]?.road && newCustomerData?.current?.customer?.address[0]?.road !== '') ? `${newCustomerData?.current?.customer?.address[0]?.road}, ` : ''} */}
                                            {(newCustomerData?.current?.customer?.address[0]?.state && newCustomerData?.current?.customer?.address[0]?.state !== '') ? `${newCustomerData?.current?.customer?.address[0]?.stateDesc}, ` : ''}
                                            {/* {(newCustomerData?.current?.customer?.address[0]?.village && newCustomerData?.current?.customer?.address[0]?.village !== '') ? `${newCustomerData?.current?.customer?.address[0]?.village}, ` : ''} */}
                                            {(newCustomerData?.current?.customer?.address[0]?.cityTown && newCustomerData?.current?.customer?.address[0]?.cityTown !== '') ? `${newCustomerData?.current?.customer?.address[0]?.cityTown}, ` : ''}
                                            {(newCustomerData?.current?.customer?.address[0]?.district && newCustomerData?.current?.customer?.address[0]?.district !== '') ? `${newCustomerData?.current?.customer?.address[0]?.districtDesc}, ` : ''}
                                            {(newCustomerData?.current?.customer?.address[0]?.country && newCustomerData?.current?.customer?.address[0]?.country !== '') ? `${newCustomerData?.current?.customer?.address[0]?.countryDesc}, ` : ''}
                                            {(newCustomerData?.current?.customer?.address[0]?.postCode && newCustomerData?.current?.customer?.address[0]?.postCode !== '') ? `${newCustomerData?.current?.customer?.address[0]?.postCodeDesc}` : ''}
                                        </p>
                                    </div>
                                </fieldset>
                            </div>

                            <div className="col-12 pl-1">
                                <div className="col-12 pl-2 bg-light border pr-view">
                                    <h5 className="text-primary">Customer Property</h5>
                                </div>
                            </div>
                            <div className="form-row pl-2 col-12 pl-2 cus-prop">
                                <div className="col-md-4">
                                    <div className="form-group">
                                        <label htmlFor="category" className="col-form-label">Customer Property 1</label>
                                        <p>{newCustomerData?.current?.customer?.property1}</p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="form-group">
                                        <label htmlFor="class" className="col-form-label">Customer Property 2</label>
                                        <p>{newCustomerData?.current?.customer?.property2}</p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="form-group">
                                        <label htmlFor="class" className="col-form-label">Customer Property 3</label>
                                        <p>{newCustomerData?.current?.customer?.property3}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {
                            newCustomerData.current.customer.isCustBillable === 'N' &&
                            <div>
                                <div className="row tri-sec">
                                    <div className="col-12 mb-1">
                                        <section className="triangle">
                                            <h4 id="list-item-2" className="pl-2">Account Details</h4>
                                        </section>
                                    </div>
                                </div>

                                <div className="col-12 pl-1 pt-2">
                                    <div className="col-12 pl-2 bg-light border">
                                        <h5 className="text-primary">Account Contact</h5>
                                    </div>
                                </div>
                                <div className="form-row pl-2 pr-form scd-form acc-detail">
                                    {
                                        (newCustomerData?.current?.customer?.customerType === 'RESIDENTIAL') ?
                                            <>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label htmlFor="accountTitle" className="col-form-label">Title</label>
                                                        <p>{newCustomerData?.current?.customer?.account[0]?.title}</p>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label htmlFor="accountSurname" className="col-form-label">Surname</label>

                                                        <p>{newCustomerData?.current?.customer?.account[0]?.surName}</p>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label htmlFor="accountForename" className="col-form-label">Forename</label>
                                                        <p>{newCustomerData?.current?.customer?.account[0]?.foreName}</p>

                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label htmlFor="accountForename" className="col-form-label">Email</label>
                                                        <p>{newCustomerData?.current?.customer?.account[0]?.email}</p>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label htmlFor="accountForename" className="col-form-label">Contact No.</label>
                                                        <p>{newCustomerData?.current?.customer?.account[0]?.contactNbr}</p>
                                                    </div>
                                                </div>
                                            </>
                                            :
                                            <></>
                                    }
                                    {
                                        (newCustomerData?.current?.customer?.customerType === 'BUSINESS' || newCustomerData?.current?.customer?.customerType === 'GOVERNMENT') ?
                                            <>

                                                <div className="comp-print col-md-9">
                                                    <div className="form-group">
                                                        <label htmlFor="accountTitle" className="col-form-label">Company Name</label>
                                                        <p>{newCustomerData?.current?.customer?.account[0]?.companyName}</p>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label htmlFor="contactTitle" className="col-form-label">Title</label>
                                                        <p>{newCustomerData?.current?.customer?.account[0]?.contactTitle}</p>

                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label htmlFor="contactSurname" className="col-form-label">Surname</label>
                                                        <p>{newCustomerData?.current?.customer?.account[0]?.contactSurName}</p>

                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label htmlFor="contactForename" className="col-form-label">Forename</label>
                                                        <p>{newCustomerData?.current?.customer?.account[0]?.contactForeName}</p>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label htmlFor="email" className="col-form-label">Email</label>
                                                        <p>{newCustomerData?.current?.customer?.account[0]?.email}</p>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label htmlFor="contactNbr" className="col-form-label">Contact No.</label>
                                                        <p>{newCustomerData?.current?.customer?.account[0]?.contactNbr}</p>
                                                    </div>
                                                </div>

                                            </>
                                            :
                                            <></>
                                    }

                                </div>

                                <div className="col-12 pl-1">
                                    <div className="col-12 pl-2 bg-light border ">
                                        <h5 className="text-primary">Billing Address</h5>
                                    </div>
                                </div>

                                <div className="col-12 pl-2 pr-2 pt-2">
                                    <fieldset className="scheduler-border1 bill-add">
                                        <legend className="scheduler-border">Billing Address</legend>
                                        {
                                            (!newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.sameAsCustomerAddress) ?
                                                <>
                                                    <div className="row">
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label htmlFor="flatHouseUnitNo" className="col-form-label">Flat/House/Unit No</label>
                                                                <p>{newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.flatHouseUnitNo}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label htmlFor="building" className="col-form-label">Building Name/Others</label>
                                                                <p>{newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.building}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label htmlFor="simpang" className="col-form-label">Street/Area</label>
                                                                <p>{newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.street}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label htmlFor="cityTown" className="col-form-label">City/Town</label>
                                                                <p>{newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.cityTown}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label htmlFor="district" className="col-form-label">District/Province</label>
                                                                <p>{newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.districtDesc}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label htmlFor="mukim" className="col-form-label">State/Region</label>
                                                                <p>{newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.stateDesc}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label htmlFor="postcode" className="col-form-label">Postcode</label>
                                                                <p>{newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.postCodeDesc}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label htmlFor="country" className="col-form-label">Country</label>
                                                                <p>{newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.country}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row pt-2"> <i className="fas fa-map-marker-alt text-primary font-18 pr-1"></i>
                                                        <p className="address-line">
                                                            {(newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.flatHouseUnitNo && newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.flatHouseUnitNo !== '') ? `${newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.flatHouseUnitNo}, ` : ''}
                                                            {/* {(newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.block && newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.block !== '') ? `${newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.block}, ` : ''} */}
                                                            {(newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.building && newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.building !== '') ? `${newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.building}, ` : ''}
                                                            {(newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.street && newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.street !== '') ? `${newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.street}, ` : ''}
                                                            {/* {(newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.road && newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.road !== '') ? `${newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.road}, ` : ''} */}
                                                            {(newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.state && newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.state !== '') ? `${newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.stateDesc}, ` : ''}
                                                            {/* {(newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.village && newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.village !== '') ? `${newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.village}, ` : ''} */}
                                                            {(newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.cityTown && newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.cityTown !== '') ? `${newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.cityTown}, ` : ''}
                                                            {(newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.district && newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.district !== '') ? `${newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.districtDesc}, ` : ''}
                                                            {(newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.country && newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.country !== '') ? `${newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.countryDesc}, ` : ''}
                                                            {(newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.postCode && newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.postCode !== '') ? `${newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.postCodeDesc}` : ''}
                                                        </p>
                                                    </div>

                                                </>
                                                :
                                                <></>
                                        }
                                        {
                                            (newCustomerData?.current?.customer?.account[0]?.billingAddress[0]?.sameAsCustomerAddress) ?
                                                <>
                                                    <div className="row">
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label htmlFor="flatHouseUnitNo" className="col-form-label">Flat/House/Unit No</label>
                                                                <p>{newCustomerData?.current?.customer?.address[0]?.flatHouseUnitNo}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label htmlFor="building" className="col-form-label">Building Name/Others</label>
                                                                <p>{newCustomerData?.current?.customer?.address[0]?.building}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label htmlFor="simpang" className="col-form-label">Street/Area</label>
                                                                <p>{newCustomerData?.current?.customer?.address[0]?.street}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label htmlFor="cityTown" className="col-form-label">City/Town</label>
                                                                <p>{newCustomerData?.current?.customer?.address[0]?.cityTown}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label htmlFor="district" className="col-form-label">District/Province</label>
                                                                <p>{newCustomerData?.current?.customer?.address[0]?.districtDesc}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3 text-left">
                                                            <div className="form-group">
                                                                <label htmlFor="mukim" className="col-form-label">State/Region</label>
                                                                <p>{newCustomerData?.current?.customer?.address[0]?.stateDesc}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label htmlFor="postcode" className="col-form-label">Postcode</label>
                                                                <p>{newCustomerData?.current?.customer?.address[0]?.postCodeDesc}</p>

                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label htmlFor="country" className="col-form-label">Country</label>
                                                                <p>{newCustomerData?.current?.customer?.address[0]?.countryDesc}</p>

                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row pt-2"> <i className="fas fa-map-marker-alt text-primary font-18 pr-1"></i>
                                                        <p className="address-line">
                                                            {(newCustomerData?.current?.customer?.address[0]?.flatHouseUnitNo && newCustomerData?.current?.customer?.address[0]?.flatHouseUnitNo !== '') ? `${newCustomerData?.current?.customer?.address[0]?.flatHouseUnitNo}, ` : ''}

                                                            {(newCustomerData?.current?.customer?.address[0]?.building && newCustomerData?.current?.customer?.address[0]?.building !== '') ? `${newCustomerData?.current?.customer?.address[0]?.building}, ` : ''}
                                                            {(newCustomerData?.current?.customer?.address[0]?.street && newCustomerData?.current?.customer?.address[0]?.street !== '') ? `${newCustomerData?.current?.customer?.address[0]?.street}, ` : ''}

                                                            {(newCustomerData?.current?.customer?.address[0]?.state && newCustomerData?.current?.customer?.address[0]?.state !== '') ? `${newCustomerData?.current?.customer?.address[0]?.stateDesc}, ` : ''}

                                                            {(newCustomerData?.current?.customer?.address[0]?.cityTown && newCustomerData?.current?.customer?.address[0]?.cityTown !== '') ? `${newCustomerData?.current?.customer?.address[0]?.cityTown}, ` : ''}
                                                            {(newCustomerData?.current?.customer?.address[0]?.district && newCustomerData?.current?.customer?.address[0]?.district !== '') ? `${newCustomerData?.current?.customer?.address[0]?.districtDesc}, ` : ''}
                                                            {(newCustomerData?.current?.customer?.address[0]?.country && newCustomerData?.current?.customer?.address[0]?.country !== '') ? `${newCustomerData?.current?.customer?.address[0]?.countryDesc}, ` : ''}
                                                            {(newCustomerData?.current?.customer?.address[0]?.postCode && newCustomerData?.current?.customer?.address[0]?.postCode !== '') ? `${newCustomerData?.current?.customer?.address[0]?.postCodeDesc}` : ''}
                                                        </p>
                                                    </div>

                                                </>
                                                :
                                                <></>
                                        }
                                    </fieldset>
                                </div>

                                <div className="col-12 pl-1">
                                    <div className="col-12 pl-2 bg-light border ">
                                        <h5 className="text-primary">Account Property</h5>
                                    </div>
                                </div>
                                <div className="form-row pl-2 pr-form scd-form acc-detail2 break-page">
                                    <div className="col-md-3 pr-align3">
                                        <div className="form-group">
                                            <label htmlFor="category" className="col-form-label">Account Property 1</label>
                                            <p>{newCustomerData?.current?.customer?.account[0]?.property1}</p>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label htmlFor="category" className="col-form-label">Account Property 1</label>
                                            <p>{newCustomerData?.current?.customer?.account[0]?.property2}</p>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label htmlFor="category" className="col-form-label">Account Property 3</label>
                                            <p>{newCustomerData?.current?.customer?.account[0]?.property3}</p>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        }

                        <div className="row tri-sec">
                            <div className="col-12">
                                <section className="triangle">
                                    <h4 id="list-item-2" className="pl-2">Service Details</h4>
                                </section>
                            </div>
                        </div>
                        <div><br></br></div>
                        <div className="col-12 pl-1">
                            <div className="col-12 pl-2 bg-light border ">
                                <h5 className="text-primary">Service Selection Details</h5>
                            </div>
                        </div>

                        <div className="form-row pl-2 pr-form secure-block">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label htmlFor="catalog" className="col-form-label">Service Type</label>
                                    <p>{newCustomerData?.current?.customer?.account[0]?.service[0]?.serviceTypeDesc}</p>
                                </div>
                            </div>
                        </div>
                        <>
                            <div className="col-12 pl-1">
                                <div className="col-12 pl-2 bg-light border install-add">
                                    <h5 className="text-primary">Installation Address</h5>
                                </div>
                            </div>

                            <div className="mt-2">
                                <div className="col-12 pl-2 pr-2 pt-2">
                                    <fieldset className="scheduler-border1 prv-top">
                                        <legend className="scheduler-border">Installation Address</legend>
                                        {
                                            (!newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.sameAsCustomerAddress) ?
                                                <>
                                                    <div className="row col-md-12 p-0">
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label htmlFor="flatHouseUnitNo" className="col-form-label">Flat/House/Unit No</label>
                                                                <p>{newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.flatHouseUnitNo}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label htmlFor="building" className="col-form-label">Building Name/Others</label>
                                                                <p>{newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.building}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label htmlFor="simpang" className="col-form-label">Street/Area</label>
                                                                <p>{newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.street}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label htmlFor="cityTown" className="col-form-label">City/Town</label>
                                                                <p>{newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.cityTown}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label htmlFor="district" className="col-form-label">District/Province</label>
                                                                <p>{newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.districtDesc}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label htmlFor="mukim" className="col-form-label">State/Region</label>
                                                                <p>{newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.stateDesc}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label htmlFor="postcode" className="col-form-label">Postcode</label>
                                                                <p>{newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.postCodeDesc}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label htmlFor="country" className="col-form-label">Country</label>
                                                                <p>{newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.countryDesc}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row pt-2">
                                                        <i className="fas fa-map-marker-alt text-primary font-18 pr-1"></i>
                                                        <p className="address-line">
                                                            {(newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.flatHouseUnitNo && newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.flatHouseUnitNo !== '') ? `${newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.flatHouseUnitNo}, ` : ''}
                                                            {/* {(newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.block && newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.block !== '') ? `${newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.block}, ` : ''} */}
                                                            {(newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.building && newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.building !== '') ? `${newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.building}, ` : ''}
                                                            {(newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.street && newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.street !== '') ? `${newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.street}, ` : ''}
                                                            {/* {(newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.road && newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.road !== '') ? `${newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.road}, ` : ''} */}
                                                            {(newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.state && newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.state !== '') ? `${newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.stateDesc}, ` : ''}
                                                            {/* {(newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.village && newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.village !== '') ? `${newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.village}, ` : ''} */}
                                                            {(newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.cityTown && newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.cityTown !== '') ? `${newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.cityTown}, ` : ''}
                                                            {(newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.district && newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.district !== '') ? `${newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.districtDesc}, ` : ''}
                                                            {(newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.country && newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.country !== '') ? `${newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.countryDesc}, ` : ''}
                                                            {(newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.postCode && newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.postCode !== '') ? `${newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.postCodeDesc}` : ''}
                                                        </p>
                                                    </div>
                                                </>
                                                :
                                                <></>
                                        }
                                        {
                                            (newCustomerData?.current?.customer?.account[0]?.service[0]?.installationAddress[0]?.sameAsCustomerAddress) ?
                                                <>
                                                    <div className="row">
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label htmlFor="flatHouseUnitNo" className="col-form-label">Flat/House/Unit No</label>
                                                                <p>{newCustomerData?.current?.customer?.address[0]?.flatHouseUnitNo}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label htmlFor="building" className="col-form-label">Building Name/Others</label>
                                                                <p>{newCustomerData?.current?.customer?.address[0]?.building}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label htmlFor="simpang" className="col-form-label">Street/Area</label>
                                                                <p>{newCustomerData?.current?.customer?.address[0]?.street}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label htmlFor="cityTown" className="col-form-label">City/Town</label>
                                                                <p>{newCustomerData?.current?.customer?.address[0]?.cityTown}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label htmlFor="district" className="col-form-label">District/Province</label>
                                                                <p>{newCustomerData?.current?.customer?.address[0]?.districtDesc}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3 text-left">
                                                            <div className="form-group">
                                                                <label htmlFor="mukim" className="col-form-label">State/Region</label>
                                                                <p>{newCustomerData?.current?.customer?.address[0]?.stateDesc}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label htmlFor="postcode" className="col-form-label">Postcode</label>
                                                                <p>{newCustomerData?.current?.customer?.address[0]?.postCodeDesc}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label htmlFor="country" className="col-form-label">Country</label>
                                                                <p>{newCustomerData?.current?.customer?.address[0]?.countryDesc}</p>

                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row pt-2"> <i className="fas fa-map-marker-alt text-primary font-18 pr-1"></i>
                                                        <p className="address-line">
                                                            {(newCustomerData?.current?.customer?.address[0]?.flatHouseUnitNo && newCustomerData?.current?.customer?.address[0]?.flatHouseUnitNo !== '') ? `${newCustomerData?.current?.customer?.address[0]?.flatHouseUnitNo}, ` : ''}
                                                            {/* {(newCustomerData?.current?.customer?.address[0]?.block && newCustomerData?.current?.customer?.address[0]?.block !== '') ? `${newCustomerData?.current?.customer?.address[0]?.block}, ` : ''} */}
                                                            {(newCustomerData?.current?.customer?.address[0]?.building && newCustomerData?.current?.customer?.address[0]?.building !== '') ? `${newCustomerData?.current?.customer?.address[0]?.building}, ` : ''}
                                                            {(newCustomerData?.current?.customer?.address[0]?.street && newCustomerData?.current?.customer?.address[0]?.street !== '') ? `${newCustomerData?.current?.customer?.address[0]?.street}, ` : ''}
                                                            {/* {(newCustomerData?.current?.customer?.address[0]?.road && newCustomerData?.current?.customer?.address[0]?.road !== '') ? `${newCustomerData?.current?.customer?.address[0]?.road}, ` : ''} */}
                                                            {(newCustomerData?.current?.customer?.address[0]?.state && newCustomerData?.current?.customer?.address[0]?.state !== '') ? `${newCustomerData?.current?.customer?.address[0]?.stateDesc}, ` : ''}
                                                            {/* {(newCustomerData?.current?.customer?.address[0]?.village && newCustomerData?.current?.customer?.address[0]?.village !== '') ? `${newCustomerData?.current?.customer?.address[0]?.village}, ` : ''} */}
                                                            {(newCustomerData?.current?.customer?.address[0]?.cityTown && newCustomerData?.current?.customer?.address[0]?.cityTown !== '') ? `${newCustomerData?.current?.customer?.address[0]?.cityTownDesc}, ` : ''}
                                                            {(newCustomerData?.current?.customer?.address[0]?.district && newCustomerData?.current?.customer?.address[0]?.district !== '') ? `${newCustomerData?.current?.customer?.address[0]?.districtDesc}, ` : ''}
                                                            {(newCustomerData?.current?.customer?.address[0]?.country && newCustomerData?.current?.customer?.address[0]?.country !== '') ? `${newCustomerData?.current?.customer?.address[0]?.countryDesc}, ` : ''}
                                                            {(newCustomerData?.current?.customer?.address[0]?.postCode && newCustomerData?.current?.customer?.address[0]?.postCode !== '') ? `${newCustomerData?.current?.customer?.address[0]?.postCodeDesc}` : ''}
                                                        </p>
                                                    </div>
                                                </>
                                                :
                                                <></>
                                        }


                                    </fieldset>
                                </div>
                            </div>
                        </>

                        <div className="col-12 pl-1">
                            <div className="col-12 pl-2 bg-light border pr-view">
                                <h5 className="text-primary">Catalog</h5>
                            </div>
                        </div>
                        <div className="col-xl-12">
                            <div className="card-box mt-1">
                                <div className="tab-content">
                                    <div className="tab-pane active">
                                        <SelectedCatalogCard
                                            data={{
                                                selectedCatalog: newCustomerData?.current?.customer?.account[0]?.service[0]?.selectedCatalog || {}
                                            }}
                                        />
                                        <SelectedPlanServiceAssetAddonCard
                                            data={{
                                                selectedPlan: newCustomerData?.current?.customer?.account[0]?.service[0]?.selectedPlan || {},
                                                selectedServiceList: newCustomerData?.current?.customer?.account[0]?.service[0]?.selectedServiceList || [],
                                                selectedAssetList: newCustomerData?.current?.customer?.account[0]?.service[0]?.selectedAssetList || []
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 pl-1">
                            <div className="col-12 pl-2 bg-light border pr-view">
                                <h5 className="text-primary">Service Property</h5>
                            </div>
                        </div>
                        <div className="form-row pl-2 col-12 pl-2 cus-prop">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="category" className="col-form-label">Service Property 1</label>
                                    <p>{newCustomerData?.current?.customer?.account[0]?.service[0]?.property1}</p>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="class" className="col-form-label">Service Property 2</label>
                                    <p>{newCustomerData?.current?.customer?.account[0]?.service[0]?.property2}</p>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="class" className="col-form-label">Service Property 3</label>
                                    <p>{newCustomerData?.current?.customer?.account[0]?.service[0]?.property3}</p>
                                </div>
                            </div>
                        </div>
                        <br></br>

                        {
                            renderMode?.serviceWorkOrderSection === 'show' &&
                            <>
                                <div className="row tri-sec">
                                    <div className="col-12">
                                        <section className="triangle">
                                            <h4 id="list-item-2" className="pl-2">Service Request</h4>
                                        </section>
                                    </div>
                                </div>
                                <div className="col-12 pl-1 mt-2">
                                    <div className="col-12 pl-2 bg-light border ">
                                        <h5 className="text-primary">Work Order Details</h5>
                                    </div>
                                </div>
                                <div className="col-12 pl-1 acc-detail">
                                    <div className="row">
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="woType" className="col-form-label">Service Request Number</label>
                                                <p>{serviceRequestData && serviceRequestData?.interactionId !== null && serviceRequestData?.interactionId}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="woType" className="col-form-label">Work Order Type</label>
                                                <p>{serviceRequestData && serviceRequestData?.woTypeDesc !== null && serviceRequestData?.woTypeDesc}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="woType" className="col-form-label">Access Number</label>
                                                <p>{serviceRequestData && serviceRequestData?.accessNumber !== null && serviceRequestData?.accessNumber}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="woType" className="col-form-label">Service Type</label>
                                                <p>{serviceRequestData && serviceRequestData?.serviceType !== null && serviceRequestData?.serviceType}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="woType" className="col-form-label">Created On</label>
                                                <p>{serviceRequestData && serviceRequestData?.createdOn !== null && formatISODateTime(serviceRequestData?.createdOn)}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="woType" className="col-form-label">Created By</label>
                                                <p>{serviceRequestData && serviceRequestData?.createdBy !== null && serviceRequestData?.createdBy}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="woType" className="col-form-label">SR Current Status</label>
                                                <p>{serviceRequestData && serviceRequestData?.status !== null && serviceRequestData?.status}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        }
                    </fieldset >
                </div >
            </div >
            <div className="modal-body ml-2 mr-2 pr-0 pl-0">
                <div className="form-row pl-2 mt-2 justify-content-center">
                    {
                        (renderMode?.printButton === 'show') ?
                            <button type="button" onClick={handlePrint} className="btn btn-primary btn-md  waves-effect waves-light">Print</button>
                            :
                            <></>
                    }
                    {
                        (renderMode?.submitButton === 'show') ?
                            <button type="button" className="btn btn-primary btn-md  waves-effect waves-light ml-2" onClick={handleSubmit}>Submit</button>
                            :
                            <></>
                    }
                    {
                        (renderMode?.previewCancelButton === 'show') ?
                            <button type="button" className="btn btn-secondary btn-md  waves-effect waves-light ml-2" onClick={() => { handlePreviewCancel(); document.title = "dtWorks" }}>Cancel</button>
                            :
                            <></>
                    }
                    {
                        (renderMode?.previewCloseButton === 'show') ?
                            <button type="button" className="btn btn-secondary btn-md  waves-effect waves-light ml-2" onClick={() => { handleNewCustomerPreviewModalClose(); document.title = "dtWorks" }}>Close</button>
                            :
                            <></>
                    }
                </div>
            </div>
        </div >
    )
})

export default NewCustomerPreview;

