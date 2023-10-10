import React, { useRef } from 'react'
import printHeader from '../../../assets/images/print-header.jpg'
import logo from '../../../assets/images/new_dtworks_logo_full.png'
import moment from 'moment'
import avatarPlaceholder from '../../../assets/images/profile-placeholder.png'


const CustomerPreviewPrint = React.forwardRef((props, ref) => {
    const { orderedProductDetails } = props?.data;
    const accountDetails = orderedProductDetails?.childOrder?.customerDetails?.customerAccounts?.filter((x) => x?.accountId === orderedProductDetails?.childOrder?.accountId);
    const accountData = accountDetails?.length >= 0 ? accountDetails[0] : {};
    const accountAddress = (accountDetails?.length >= 0 && accountDetails[0]?.accountAddress[0]) ? accountDetails[0]?.accountAddress[0] : {};
    document.title = 'dtWorks'

    const { handlePreviewCancel, handlePrint } = props?.handler;

    function arrayBufferToString(buffer) {
        var arr = new Uint8Array(buffer);
        var str = String.fromCharCode.apply(String, arr);
        if (/[\u0080-\uffff]/.test(str)) {
            throw new Error("this string seems to contain (still encoded) multibytes");
        }
        return str;
    }

    return (
        <div >
            <div className="addresshadow show" id="previewform" tabIndex="-1" role="dialog"
                style={{ paddingRight: "5px", paddingLeft: "5px" }} aria-modal="true">
                <div className="modal-content border bg-light">
                    <div className="modal-header p-1">
                        <h4 className="modal-title" id="myCenterModalLabel">Aggreement</h4>
                        <button style={{ marginLeft: "1100px" }} type="button" className="skel-btn-print" data-dismiss="modal" onClick={handlePrint}>Download</button>
                        <button type="button" className="close" data-dismiss="modal" aria-hidden="true" onClick={handlePreviewCancel}>X</button>
                    </div>
                    <div className="modal-body bg-white">
                        <div id="personal" style={{ display: "block" }} className="personal business-fileds" ref={ref}>
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
                            <fieldset className="scheduler-border">
                                <div className="row col-12 form-row mb-2">
                                    <div className="col-12 pl-2 bg-light border"><h5 className="text-primary">{orderedProductDetails?.childOrder?.customerDetails?.customerCategory?.description} Customer Details</h5></div>
                                </div>
                                <div className="row col-12">
                                    <div className="col-md-2">
                                        <div>
                                            <div className="d-flex flex-column mt-2">
                                                <img className="mb-2" src={orderedProductDetails?.childOrder?.customerDetails?.customerPhoto ? orderedProductDetails?.childOrder?.customerDetails?.customerPhoto : avatarPlaceholder} width="145px" height="200px" style={{ objectFit: "cover" }} />

                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-10">
                                        <div>
                                            <div className="form-row">
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label htmlFor="customerTitle" className="col-form-label">First Name</label>
                                                        <p>{orderedProductDetails?.childOrder?.customerDetails?.firstName}</p>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label htmlFor="Surname" className="col-form-label">Last Name</label>
                                                        <p>{orderedProductDetails?.childOrder?.customerDetails?.lastName}</p>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        {console.log(orderedProductDetails?.childOrder?.customerDetails, "print")}
                                                        <label htmlFor="Forename" className="col-form-label">Gender</label>
                                                        <p>{orderedProductDetails?.childOrder?.customerDetails?.gender?.description || ""}</p>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label htmlFor="Gender" className="col-form-label">Date of Birth</label>
                                                        <p>{moment(orderedProductDetails?.childOrder?.customerDetails?.dob).format('DD-MMM-YYYY')}</p>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label htmlFor="customerid" className="col-form-label">ID Type</label>
                                                        <p>{orderedProductDetails?.childOrder?.customerDetails?.idType?.description || ""}</p>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label htmlFor="idnumber" className="col-form-label">ID Number</label>
                                                        <p>{orderedProductDetails?.childOrder?.customerDetails?.idValue}</p>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label htmlFor="email" className="col-form-label">Email</label>
                                                        <p>{orderedProductDetails?.childOrder?.customerDetails?.customerContact[0]?.emailId}</p>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label htmlFor="contactNbr" className="col-form-label">Contact Number</label>
                                                        <p>+{orderedProductDetails?.childOrder?.customerDetails?.customerContact[0]?.mobilePrefix
                                                        } {orderedProductDetails?.childOrder?.customerDetails?.customerContact[0]?.mobileNo}</p>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label htmlFor="contactNbr" className="col-form-label">Customer Category</label>
                                                        <p>{orderedProductDetails?.childOrder?.customerDetails?.customerCategory?.description}</p>
                                                    </div>
                                                </div>
                                                {/* {
                                                    selectedCustomerType !== 'REG' &&
                                                    <>
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="customerid" className="col-form-label">Registration Number</label>
                                                                <p>{orderedProductDetails?.childOrder?.customerDetails?.registrationNbr}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="idnumber" className="col-form-label">Registration Date</label>
                                                                <p>{moment(orderedProductDetails?.childOrder?.customerDetails?.registrationDate).format('DD-MMM-YYYY')}</p>
                                                            </div>
                                                        </div>
                                                    </>
                                                } */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row col-12 p-0">
                                    <form id="address-form" className="col-12 pl-2 pr-0">
                                        <div className="col-12 pl-0 pr-0">
                                            <div className="col-12">
                                                {/* <div className="answer pb-2 d-none" style={{ display: "block" }}>
                                                    <div className="row pl-2">
                                                        <div className="col-12 bg-light border pl-2"><h5 className="text-primary">Billing Details</h5> </div>                                              <div className="col-3">
                                                            <div className="form-group">
                                                                <label htmlFor="billgroup" className="col-form-label">Bill Group</label>
                                                                <p>Group 1</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-3">
                                                            <div className="form-group">
                                                                <label htmlFor="currency" className="col-form-label">Currency</label>
                                                                <p>AED</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-3">
                                                            <div className="form-group">
                                                                <label htmlFor="postcode" className="col-form-label">Account Credit Limit</label>
                                                                <p>300</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-3">
                                                            <div className="form-group">
                                                                <label htmlFor="country" className="col-form-label">Exempt Credit Control</label>
                                                                <p>Yes</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div> */}
                                                <div className="row col-12 form-row mb-2 pl-0 pr-0 pt-2">
                                                    <div className="col-12  bg-light border"><h5 className="text-primary">Customer Address</h5> </div>
                                                </div>
                                                <div className="border bg-white p-2">
                                                    <div className="row">
                                                        <div className="col-4">
                                                            <div className="form-group">
                                                                <label htmlFor="flatHouseUnitNo" className="col-form-label">Address Line 1</label>
                                                                <p>{orderedProductDetails?.childOrder?.customerDetails?.customerAddress[0]?.address1}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div className="form-group">
                                                                <label htmlFor="building" className="col-form-label">Address Line 2</label>
                                                                <p>{orderedProductDetails?.childOrder?.customerDetails?.customerAddress[0]?.address2}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div className="form-group">
                                                                <label htmlFor="building" className="col-form-label">Address Line 3</label>
                                                                <p>{orderedProductDetails?.childOrder?.customerDetails?.customerAddress[0]?.address3 || '-'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div className="form-group">
                                                                <label htmlFor="simpang" className="col-form-label">City</label>
                                                                <p>{orderedProductDetails?.childOrder?.customerDetails?.customerAddress[0]?.city}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div className="form-group">
                                                                <label htmlFor="jalan" className="col-form-label">District</label>
                                                                <p>{orderedProductDetails?.childOrder?.customerDetails?.customerAddress[0]?.district}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div className="form-group">
                                                                <label htmlFor="district" className="col-form-label">State</label>
                                                                <p>{orderedProductDetails?.childOrder?.customerDetails?.customerAddress[0]?.state}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div className="form-group">
                                                                <label htmlFor="Country" className="col-form-label">Country</label>
                                                                <p>{orderedProductDetails?.childOrder?.customerDetails?.customerAddress[0]?.country}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div className="form-group">
                                                                <label htmlFor="Country" className="col-form-label">Postcode</label>
                                                                <p>{orderedProductDetails?.childOrder?.customerDetails?.customerAddress[0]?.postcode}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row pl-2">
                                                        <i className="fas fa-map-marker-alt text-primary font-18 pr-1"></i>
                                                        <p>{orderedProductDetails?.childOrder?.customerDetails?.customerAddress[0]?.address1}, {orderedProductDetails?.childOrder?.customerDetails?.customerAddress[0]?.address2}, {orderedProductDetails?.childOrder?.customerDetails?.customerAddress[0]?.address3 ? orderedProductDetails?.childOrder?.customerDetails?.customerAddress[0]?.address3 + ',' : ''} {orderedProductDetails?.childOrder?.customerDetails?.customerAddress[0]?.city}, {orderedProductDetails?.childOrder?.customerDetails?.customerAddress[0]?.district}, {orderedProductDetails?.childOrder?.customerDetails?.customerAddress[0]?.state}, {orderedProductDetails?.childOrder?.customerDetails?.customerAddress[0]?.country}, {orderedProductDetails?.childOrder?.customerDetails?.customerAddress[0]?.postcode}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row col-12 form-row mb-2 mt-4">
                                            <div className="col-12 pl-2 bg-light border"><h5 className="text-primary">Product Details</h5></div>
                                        </div>
                                        <div className="form-row pt-2 sekl-modal-plans">
                                            {

                                                <div className="skel-plans-product skel-plan p-2">
                                                    <label className="premium-plan" htmlFor="prd">
                                                        <div className="plan-content">
                                                            <div className="">
                                                                <span>{orderedProductDetails?.productDetails?.productName}</span>
                                                                <hr className="cmmn-hline" />
                                                                <table width={"100%"}>
                                                                    <tr><td>Product Type: </td><td>{" "}</td><td>{orderedProductDetails?.productDetails?.productType.description}</td></tr>
                                                                    <tr><td>Product Category: </td><td>{" "}</td><td>{orderedProductDetails?.productDetails?.productCategory.description}</td></tr>
                                                                    <tr><td>Service Type: </td><td>{" "}</td><td>{orderedProductDetails?.productDetails?.serviceType.description}</td></tr>
                                                                </table>

                                                                <div className="skel-plan-details">
                                                                    <hr className="cmmn-hline" />
                                                                    <span className="skel-plans-price mt-0">Qty: {Number(orderedProductDetails?.productQuantity)}</span>
                                                                    <span className="skel-plans-price">RC: ${Number(orderedProductDetails?.childOrder?.rcAmount).toFixed(2)}</span>
                                                                    <span className="skel-plans-price">NRC: ${Number(orderedProductDetails?.childOrder?.nrcAmount).toFixed(2)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </label>
                                                </div>

                                            }
                                        </div>
                                        {/* {
                                            serviceData?.isNeedQuoteOnly === "N" &&
                                            <>
                                                <div className="row col-12 form-row mb-2 pl-0 pr-0 pt-2">
                                                    <div className="col-12  bg-light border"><h5 className="text-primary">Service Address</h5> </div>
                                                </div>
                                                <div className="border bg-white p-2">
                                                    <div className="row">
                                                        <div className="col-4">
                                                            <div className="form-group">
                                                                <label htmlFor="flatHouseUnitNo" className="col-form-label">Address Line 1</label>
                                                                <p>{serviceAddress?.address1}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div className="form-group">
                                                                <label htmlFor="building" className="col-form-label">Address Line 2</label>
                                                                <p>{serviceAddress?.address2}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div className="form-group">
                                                                <label htmlFor="building" className="col-form-label">Address Line 3</label>
                                                                <p>{serviceAddress?.address3}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div className="form-group">
                                                                <label htmlFor="simpang" className="col-form-label">City</label>
                                                                <p>{serviceAddress?.city}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div className="form-group">
                                                                <label htmlFor="jalan" className="col-form-label">District</label>
                                                                <p>{serviceAddress?.district}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div className="form-group">
                                                                <label htmlFor="district" className="col-form-label">State</label>
                                                                <p>{serviceAddress?.state}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div className="form-group">
                                                                <label htmlFor="Country" className="col-form-label">Country</label>
                                                                <p>{serviceAddress?.country}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div className="form-group">
                                                                <label htmlFor="Country" className="col-form-label">Postcode</label>
                                                                <p>{serviceAddress?.postcode}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row pl-2">
                                                        <i className="fas fa-map-marker-alt text-primary font-18 pr-1"></i>
                                                        <p>{serviceAddress?.address1}, {serviceAddress?.address2}, {serviceAddress?.address3 ? serviceAddress?.address3 + ',' : ''} {serviceAddress?.city}, {serviceAddress?.district}, {serviceAddress?.state}, {serviceAddress?.country}, {serviceAddress?.postcode}</p>
                                                    </div>
                                                </div>
                                            </>
                                        } */}
                                    </form>
                                </div>
                                {

                                    <>
                                        {console.log('accountData------->', accountData)}
                                        <div className="row col-12 form-row mb-2 mt-4">
                                            <div className="col-12 pl-2 bg-light border"><h5 className="text-primary">Account Details</h5></div>
                                        </div>
                                        <div className="row col-12">
                                            <div className="col-md-12">
                                                <div>
                                                    <div className="form-row">
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="customerTitle" className="col-form-label">First Name</label>
                                                                <p>{accountData?.firstName}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="Surname" className="col-form-label">Last Name</label>
                                                                <p>{accountData?.lastName}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="Forename" className="col-form-label">Gender</label>
                                                                <p>{accountData?.gender || ''}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="customerid" className="col-form-label">ID Type</label>
                                                                <p>{accountData?.idTypeDesc?.description || ""}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="idnumber" className="col-form-label">ID Number</label>
                                                                <p>{accountData?.idValue}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="email" className="col-form-label">Email</label>
                                                                <p>{orderedProductDetails?.childOrder?.customerDetails?.customerContact[0]?.emailId}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="contactNbr" className="col-form-label">Contact Number</label>
                                                                <p>+{orderedProductDetails?.childOrder?.customerDetails?.customerContact[0]?.mobilePrefix
                                                                } {orderedProductDetails?.childOrder?.customerDetails?.customerContact[0]?.mobileNo}</p>
                                                            </div>
                                                        </div>
                                                        {/* {
                                                            selectedCustomerType !== 'REG' &&
                                                            <>
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label htmlFor="customerid" className="col-form-label">Registration Number</label>
                                                                        <p>{accountData?.registrationNbr}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label htmlFor="idnumber" className="col-form-label">Registration Date</label>
                                                                        <p>{moment(accountData?.registrationDate).format('DD-MMM-YYYY')}</p>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        } */}
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="email" className="col-form-label">Account Category</label>
                                                                <p>{accountData?.accountCatagoryDesc?.description || accountData?.accountCatagoryDesc?.code || ""}</p>
                                                            </div>
                                                        </div><div className="col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="email" className="col-form-label">Account Level</label>
                                                                <p>{accountData?.accountLevelDesc?.description || "-"}</p>
                                                            </div>
                                                        </div><div className="col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="email" className="col-form-label">Bill Language</label>
                                                                <p>{accountData?.billLanguageDesc?.description || "-"}</p>
                                                            </div>
                                                        </div><div className="col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="email" className="col-form-label">Account Type</label>
                                                                <p>{accountData?.accountTypeDesc?.description || "-"}</p>
                                                            </div>
                                                        </div><div className="col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="email" className="col-form-label">Notification Preference</label>
                                                                <p>{accountData?.notificationPreference || ""}</p>
                                                            </div>
                                                        </div><div className="col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="email" className="col-form-label">Currency</label>
                                                                <p>{accountData?.currencyDesc?.description || ""}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row col-12 form-row mb-2 pl-0 pr-0 pt-2">
                                            <div className="col-12  bg-light border"><h5 className="text-primary">Account Address</h5> </div>
                                        </div>
                                        <div className="border bg-white p-2">
                                            <div className="row">
                                                <div className="col-4">
                                                    <div className="form-group">
                                                        <label htmlFor="flatHouseUnitNo" className="col-form-label">Address Line 1</label>
                                                        <p>{accountAddress?.address1}</p>
                                                    </div>
                                                </div>
                                                <div className="col-4">
                                                    <div className="form-group">
                                                        <label htmlFor="building" className="col-form-label">Address Line 2</label>
                                                        <p>{accountAddress?.address2}</p>
                                                    </div>
                                                </div>
                                                <div className="col-4">
                                                    <div className="form-group">
                                                        <label htmlFor="building" className="col-form-label">Address Line 3</label>
                                                        <p>{accountAddress?.address3}</p>
                                                    </div>
                                                </div>
                                                <div className="col-4">
                                                    <div className="form-group">
                                                        <label htmlFor="simpang" className="col-form-label">City</label>
                                                        <p>{accountAddress?.city}</p>
                                                    </div>
                                                </div>
                                                <div className="col-4">
                                                    <div className="form-group">
                                                        <label htmlFor="jalan" className="col-form-label">District</label>
                                                        <p>{accountAddress?.district}</p>
                                                    </div>
                                                </div>
                                                <div className="col-4">
                                                    <div className="form-group">
                                                        <label htmlFor="district" className="col-form-label">State</label>
                                                        <p>{accountAddress?.state}</p>
                                                    </div>
                                                </div>
                                                <div className="col-4">
                                                    <div className="form-group">
                                                        <label htmlFor="Country" className="col-form-label">Country</label>
                                                        <p>{accountAddress?.country}</p>
                                                    </div>
                                                </div>
                                                <div className="col-4">
                                                    <div className="form-group">
                                                        <label htmlFor="Country" className="col-form-label">Postcode</label>
                                                        <p>{accountAddress?.postcode}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row pl-2">
                                                <i className="fas fa-map-marker-alt text-primary font-18 pr-1"></i>
                                                <p>{accountAddress?.address1}, {accountAddress?.address2}, {accountAddress?.address3 ? accountAddress?.address3 + ',' : ''} {accountAddress?.city}, {accountAddress?.district}, {accountAddress?.state}, {accountAddress?.country}, {accountAddress?.postcode}</p>
                                            </div>
                                        </div>
                                    </>
                                }
                                {
                                    <>
                                        <div className="row col-12 form-row mb-2 pl-0 pr-0 pt-2">
                                            <div className="col-12  bg-light border"><h5 className="text-primary">Customer Agreement</h5> </div>
                                        </div>
                                        <div className="col-md-2">
                                            <div>
                                                <div className="d-flex flex-column mt-2">
                                                    {console.log('serviceDetails----->', orderedProductDetails?.childOrder?.serviceDetails?.serviceAgreement)}
                                                    <img

                                                        src={`${arrayBufferToString(orderedProductDetails?.childOrder?.serviceDetails?.serviceAgreement?.data)}`
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                }
                            </fieldset>
                        </div>
                        <div className="col-12 p-1">
                            <div id="customer-buttons" className="d-flex justify-content-center">
                                <div id="customer-buttons" className="d-flex justify-content-center">
                                    <button type="button" className="skel-btn-cancel" data-dismiss="modal" onClick={handlePreviewCancel}>Close</button>
                                    <button type="button" className="skel-btn-print" data-dismiss="modal" onClick={handlePrint}>Download</button>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
})

export default CustomerPreviewPrint