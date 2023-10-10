import React from 'react'
import printHeader from '../../assets/images/print-header.jpg'
import logo from '../../assets/images/new_dtworks_logo_full.png'
import moment from 'moment'
import avatarPlaceholder from '../../assets/images/profile-placeholder.png'


const CustomerPreviewPrint = React.forwardRef((props, ref) => {
    const printPreviewCssClass = 'business ';
    document.title = 'dtWorks'
    const { customerData, customerAddress, accountData, accountAddress, selectedCustomerType, serviceData, customerTypeLookup,
        selectedProductList, serviceTypeLookup, serviceAddress, genderLookup, idTypeLookup, accountLevelLookup, accountTypeLookup,
        accountCategoryLookup, billLanguageLookup, notificationLookup, currencyLookup, sigPad, appsConfig
    } = props?.data
    const { handlePreviewCancel, handleSubmit, handlePrint } = props?.handler

    return (
        <div >
            <div className="addresshadow show" id="previewform" tabIndex="-1" role="dialog"
                style={{ paddingRight: "5px", paddingLeft: "5px" }} aria-modal="true">
                <div className="modal-content border bg-light">
                    <div className="modal-header p-1">
                        <h4 className="modal-title" id="myCenterModalLabel">Preview</h4>
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
                                        <h4 style={{ marginLeft: "250px" }}>{appsConfig && appsConfig.clientFacingName && appsConfig.clientFacingName['Customer'.toLowerCase()] && appsConfig?.clientFacingName['Customer'.toLowerCase()] || 'Customer'} Application Form</h4>
                                    </div>
                                </div>
                            </div>
                            <fieldset className="scheduler-border">
                                <div className="row col-12 form-row mb-2">
                                    <div className="col-12 pl-2 bg-light border"><h5 className="text-primary">{customerTypeLookup.find((x) => x.code === selectedCustomerType)?.description} {appsConfig && appsConfig.clientFacingName && appsConfig.clientFacingName['Customer'.toLowerCase()] && appsConfig?.clientFacingName['Customer'.toLowerCase()] || 'Customer'} Details</h5></div>
                                </div>
                                <div className="row col-12">
                                    <div className="col-md-2">
                                        <div>
                                            <div className="d-flex flex-column mt-2">
                                                <img className="mb-2" src={customerData?.customerPhoto ? customerData?.customerPhoto : avatarPlaceholder} width="145px" height="200px" style={{ objectFit: "cover" }} />

                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-10">
                                        <div>
                                            <div className="form-row">
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label htmlFor="customerTitle" className="col-form-label">First Name</label>
                                                        <p>{customerData?.firstName}</p>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label htmlFor="Surname" className="col-form-label">Last Name</label>
                                                        <p>{customerData?.lastName}</p>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        {console.log(customerData, "print")}
                                                        <label htmlFor="Forename" className="col-form-label">Gender</label>
                                                        <p>{genderLookup.find((x) => x.code === customerData?.gender)?.description || ""}</p>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label htmlFor="Gender" className="col-form-label">Date of Birth</label>
                                                        <p>{moment(customerData?.dob).format('DD-MMM-YYYY')}</p>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label htmlFor="customerid" className="col-form-label">ID Type</label>
                                                        <p>{idTypeLookup && idTypeLookup.find((x) => x.code === customerData?.idType)?.description || ""}</p>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label htmlFor="idnumber" className="col-form-label">ID Number</label>
                                                        <p>{customerData?.idValue}</p>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label htmlFor="email" className="col-form-label">Email</label>
                                                        <p>{customerAddress?.email}</p>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label htmlFor="contactNbr" className="col-form-label">Contact Number</label>
                                                        <p>+{customerAddress?.countryCode} {customerAddress?.contactNbr}</p>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label htmlFor="contactNbr" className="col-form-label">{appsConfig && appsConfig.clientFacingName && appsConfig.clientFacingName['Customer'.toLowerCase()] && appsConfig?.clientFacingName['Customer'.toLowerCase()] || 'Customer'} Category</label>
                                                        <p>{customerTypeLookup.find((x) => x.code === selectedCustomerType)?.description}</p>
                                                    </div>
                                                </div>
                                                {
                                                    selectedCustomerType !== 'REG' &&
                                                    <>
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="customerid" className="col-form-label">Registration Number</label>
                                                                <p>{customerData?.registrationNbr}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="idnumber" className="col-form-label">Registration Date</label>
                                                                <p>{moment(customerData?.registrationDate).format('DD-MMM-YYYY')}</p>
                                                            </div>
                                                        </div>
                                                    </>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row col-12 p-0">
                                    <form id="address-form" className="col-12 pl-2 pr-0">
                                        <div className="col-12 pl-0 pr-0">
                                            <div className="col-12">
                                                <div className="answer pb-2 d-none" style={{ display: "block" }}>
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
                                                </div>
                                                <div className="row col-12 form-row mb-2 pl-0 pr-0 pt-2">
                                                    <div className="col-12  bg-light border"><h5 className="text-primary">{appsConfig && appsConfig.clientFacingName && appsConfig.clientFacingName['Customer'.toLowerCase()] && appsConfig?.clientFacingName['Customer'.toLowerCase()] || 'Customer'} Address</h5> </div>
                                                </div>
                                                <div className="border bg-white p-2">
                                                    <div className="row">
                                                        <div className="col-4">
                                                            <div className="form-group">
                                                                <label htmlFor="flatHouseUnitNo" className="col-form-label">Address Line 1</label>
                                                                <p>{customerAddress?.address1}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div className="form-group">
                                                                <label htmlFor="building" className="col-form-label">Address Line 2</label>
                                                                <p>{customerAddress?.address2}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div className="form-group">
                                                                <label htmlFor="building" className="col-form-label">Address Line 3</label>
                                                                <p>{customerAddress?.address3}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div className="form-group">
                                                                <label htmlFor="simpang" className="col-form-label">City</label>
                                                                <p>{customerAddress?.city}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div className="form-group">
                                                                <label htmlFor="jalan" className="col-form-label">District</label>
                                                                <p>{customerAddress?.district}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div className="form-group">
                                                                <label htmlFor="district" className="col-form-label">State</label>
                                                                <p>{customerAddress?.state}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div className="form-group">
                                                                <label htmlFor="Country" className="col-form-label">Country</label>
                                                                <p>{customerAddress?.country}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div className="form-group">
                                                                <label htmlFor="Country" className="col-form-label">Postcode</label>
                                                                <p>{customerAddress?.postcode}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row pl-2">
                                                        <i className="fas fa-map-marker-alt text-primary font-18 pr-1"></i>
                                                        <p>{customerAddress?.address1}, {customerAddress?.address2}, {customerAddress?.address3 ? customerAddress?.address3 + ',' : ''} {customerAddress?.city}, {customerAddress?.district}, {customerAddress?.state}, {customerAddress?.country}, {customerAddress?.postcode}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row col-12 form-row mb-2 mt-4">
                                            <div className="col-12 pl-2 bg-light border"><h5 className="text-primary">Product Details</h5></div>
                                        </div>
                                        <div className="form-row pt-2 sekl-modal-plans">
                                            {
                                                selectedProductList && selectedProductList.map((x) => (
                                                    x.productCategory !== "PC_BUNDLE" ? (
                                                        <div className="skel-plans-product skel-plan p-2">
                                                            <label className="premium-plan" htmlFor="prd">
                                                                <div className="plan-content">
                                                                    <div className="">
                                                                        <span>{x?.productName}</span>
                                                                        <hr className="cmmn-hline" />
                                                                        <table width={"100%"}>
                                                                            <tr><td>Product Type: </td><td>{" "}</td><td>{x?.productTypeDescription.description}</td></tr>
                                                                            <tr><td>Product Category: </td><td>{" "}</td><td>{x?.productCategoryDesc.description}</td></tr>
                                                                            <tr><td>Service Type: </td><td>{" "}</td><td>{x?.serviceTypeDescription.description}</td></tr>
                                                                        </table>

                                                                        <div className="skel-plan-details">
                                                                            <hr className="cmmn-hline" />
                                                                            <span className="skel-plans-price mt-0">Qty: {Number(x?.quantity)}</span>
                                                                            <span className="skel-plans-price">RC: ${Number(x?.totalRc).toFixed(2)}</span>
                                                                            <span className="skel-plans-price">NRC: ${Number(x?.totalNrc).toFixed(2)}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </label>
                                                        </div>)
                                                        :
                                                        (
                                                            <div className="skel-plans-product skel-plan p-2" style={{ width: "39%" }}>
                                                                {console.log('selectedProductList------->', selectedProductList)}
                                                                <label className="premium-plan" htmlFor="prd">
                                                                    <div className="plan-content">
                                                                        <div className="">
                                                                            <span>{x?.bundleName}</span>
                                                                            <hr className="cmmn-hline" />
                                                                            <div className="skel-plan-details">

                                                                                <table className="border w-100 ml-2 mt-1">
                                                                                    <tr>
                                                                                        <th>Product Name</th>
                                                                                        <th>Product Type</th>
                                                                                        <th>Product Category</th>
                                                                                        <th>Product sub Category</th>
                                                                                        <th>Service Type</th>
                                                                                    </tr>
                                                                                    {x?.productBundleDtl?.map((ele) => (<tr style={{ fontWeight: "100" }}>
                                                                                        <td>{ele?.productDtl?.productName || ""}</td>
                                                                                        <td>{ele?.productDtl?.productTypeDescription?.description || ""}</td>
                                                                                        <td>{ele?.productDtl?.productCategoryDesc?.description || ""}</td>
                                                                                        <td>{ele?.productDtl?.productSubCategoryDesc?.description || ""}</td>
                                                                                        <td>{ele?.productDtl?.serviceTypeDescription?.description || ""}</td>
                                                                                    </tr>))}
                                                                                </table>

                                                                                <hr className="cmmn-hline" />
                                                                                <span className="skel-plans-price mt-0">Qty: {Number(x?.quantity)}{"  "}</span>
                                                                                <span className="skel-plans-price">RC: ${Number(x?.totalRc).toFixed(2)}{"  "}</span>
                                                                                <span className="skel-plans-price">NRC: ${Number(x?.totalNrc).toFixed(2)}{"  "}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </label>
                                                            </div>)
                                                ))
                                            }
                                        </div>
                                        {
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
                                        }
                                    </form>
                                </div>
                                {
                                    accountData?.isAccountCreate === "Y" &&
                                    <>
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
                                                                <p>{genderLookup.find((x) => x.code === accountData?.gender)?.description || ""}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="customerid" className="col-form-label">ID Type</label>
                                                                <p>{idTypeLookup.find((x) => x.code === accountData?.idType)?.description || ""}</p>
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
                                                                <p>{accountData?.email}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="contactNbr" className="col-form-label">Contact Number</label>
                                                                <p>+{accountAddress?.countryCode} {accountData?.contactNbr}</p>
                                                            </div>
                                                        </div>
                                                        {
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
                                                        }
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="email" className="col-form-label">Account Category</label>
                                                                <p>{accountCategoryLookup.find((x) => x.code === accountData?.accountCategory)?.description || ""}</p>
                                                            </div>
                                                        </div><div className="col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="email" className="col-form-label">Account Level</label>
                                                                <p>{accountLevelLookup.find((x) => x.code === accountData?.accountLevel)?.description || ""}</p>
                                                            </div>
                                                        </div><div className="col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="email" className="col-form-label">Bill Language</label>
                                                                <p>{billLanguageLookup.find((x) => x.code === accountData?.billLanguage)?.description || ""}</p>
                                                            </div>
                                                        </div><div className="col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="email" className="col-form-label">Account Type</label>
                                                                <p>{accountTypeLookup.find((x) => x.code === accountData?.accountType)?.description || ""}</p>
                                                            </div>
                                                        </div><div className="col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="email" className="col-form-label">Notification Preference</label>
                                                                <p>{notificationLookup.find((x) => x.code === accountData?.notificationPreference)?.description || ""}</p>
                                                            </div>
                                                        </div><div className="col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="email" className="col-form-label">Currency</label>
                                                                <p>{currencyLookup.find((x) => x.code === accountData?.currency)?.description || ""}</p>
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
                                    serviceData?.isNeedQuoteOnly === 'N' &&
                                    <>
                                        <div className="row col-12 form-row mb-2 pl-0 pr-0 pt-2">
                                            <div className="col-12  bg-light border"><h5 className="text-primary">{appsConfig && appsConfig.clientFacingName && appsConfig.clientFacingName['Customer'.toLowerCase()] && appsConfig?.clientFacingName['Customer'.toLowerCase()] || 'Customer'} Agreement</h5> </div>
                                        </div>
                                        <div className="col-md-2">
                                            <div>
                                                <div className="d-flex flex-column mt-2">
                                                    <img className="mb-2" src={sigPad.current?.getTrimmedCanvas().toDataURL('image/png')} width="200px" height="50px" style={{ objectFit: "cover" }} />
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
                                    <button type="button" className="skel-btn-print" data-dismiss="modal" onClick={handlePrint}>Print</button>
                                    <button type="button" className="skel-btn-submit" data-dismiss="modal" onClick={handleSubmit}>Submit</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
})

export default CustomerPreviewPrint