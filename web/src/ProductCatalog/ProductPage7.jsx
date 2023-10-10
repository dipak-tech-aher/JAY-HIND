/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import { properties } from "../properties";
import { post } from "../common/util/restUtil";

const ProductPage7 = (props) => {    
    const {productData, productSubCategoryLookup,
        productSubTypeLookup,
        serviceTypeLookup,
        provisionTypeLookup,productClassLookup,
        serviceClassLookup,
        uomCategoryLookup,
        chargeData,
        chargeList,frequencyLookup,productFamilyLookup, productCategoryLookup,
        productTypeLookup} = props.data
    return (   
        <div className="col-md-10 skel-cr-rht-sect-form">
            <div className="skel-step-process">Step-7<span>Preview</span></div>

            <div className="">

                <div className="col-12 p-0">
                    <section className="triangle"><h5 id="list-item-1" className="pl-2">Product Details</h5></section>
                </div>
                <div className="form-row p-2">
                    <div className="col-md-4">
                        <div className="form-group">
                            <label for="customerTitle" className="col-form-label">Product Name </label>
                            <p>{productData.productName}</p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="form-group">
                            <label for="Surname" className="col-form-label">Product Family</label>
                            <p>{productFamilyLookup.find(f=>f.code === productData.productFamily).description}</p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="form-group">
                            <label for="Surname" className="col-form-label">Product Category</label>
                            <p>{productCategoryLookup.find(f=>f.code === productData.productCategory).description}</p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="form-group">
                            <label for="Surname" className="col-form-label">Product Type</label>
                            <p>{productTypeLookup.find(f=>f.code === productData.productType).description}</p>
                        </div>
                    </div>
                </div>

                <div className="col-12 p-0">
                    <section className="triangle"><h5 id="list-item-1" className="pl-2">Sub Type and Service Type Details</h5></section>
                </div>
                <div className="col-12 p-2">
                    <div className="form-row p-2">
                        <div className="col-md-4">
                            <div className="form-group">
                                <label for="customerTitle" className="col-form-label">Product Sub Type</label>
                                <p>{productSubTypeLookup.find(f=>f.code === productData.productSubType).description}</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <label for="Surname" className="col-form-label">Service Type</label>
                                <p>{serviceTypeLookup.find(f=>f.code === productData.serviceType).description}</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <label for="Surname" className="col-form-label">Product Subcategory</label>
                                <p>{productSubCategoryLookup.find(f=>f.code === productData.productSubCategory).description}</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <label for="Surname" className="col-form-label">Provisioning Type</label>
                                <p>{provisionTypeLookup.find(f=>f.code === productData.provisioningType).description}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 p-0">
                    <section className="triangle"><h5 id="list-item-1" className="pl-2">Product Class and Charge Details</h5></section>
                </div>
                <div className="col-12 row p-2">
                    <div className="col-md-3">
                        <div className="form-group">
                            <label for="Surname" className="col-form-label">Service Class</label>
                            <p>{serviceClassLookup.find(f=>f.code === productData.serviceClass).description}</p>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="form-group">
                            <label for="Surname" className="col-form-label">Product Class</label>
                            <p>{productClassLookup.find(f=>f.code === productData.productClass).description}</p>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="form-group">
                            <label for="Surname" className="col-form-label">UOM</label>
                            <p>{uomCategoryLookup.find(f=>f.code === productData.uomCategory).description}</p>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="form-group">
                            <label for="Surname" className="col-form-label">Activation Date</label>
                            <p>{productData.activationDate}</p>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="form-group">
                            <label for="Surname" className="col-form-label">Expirty Date</label>
                            <p>{productData.expiryDate}</p>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="form-group">
                            <label for="Surname" className="col-form-label">Is Appointment Required</label>
                            <p>{productData.isAppointRequired}</p>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="form-group">
                            <label for="Surname" className="col-form-label">Frequency</label>
                            <p>{productTypeLookup.find(f=>f.code === productData.productType).description}</p>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="form-group">
                            <label for="Surname" className="col-form-label">Contract Availability</label>
                            <p>{productData.contractFlag}</p>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="form-group">
                            <label for="Surname" className="col-form-label">Contract Duration</label>
                            <p>12 Months</p>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="form-group">
                            <label for="Surname" className="col-form-label">Product Benefits</label>
                            <p>Product benefit details</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>      
    )
}

export default ProductPage7;