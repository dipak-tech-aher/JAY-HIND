/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import { properties } from "../properties";
import { post } from "../common/util/restUtil";
import { unstable_batchedUpdates } from 'react-dom';


const ProductPage4 = (props) => {

    const { handleOnchange } = props.handler
    const { productData, productClassLookup, serviceClassLookup, uomCategoryLookup, error } = props.data

    return (
        <div className="col-md-10 skel-cr-rht-sect-form">
            <div className="skel-step-process">Step-4<span>Add Product Class</span></div>
            <div className="row px-2 py-2">

                <div className="row">
                    <div className="col-md-6">
                        <div className="form-group">
                            <label for="dob" className="control-label">Service Class</label>
                            <select className="form-control" id="serviceClass" value={productData.serviceClass} onChange={handleOnchange}>
                                <option>Select...</option>
                                {
                                    serviceClassLookup && serviceClassLookup.map((val, key) => (
                                        <option key={key} value={val.code}>{val.description}</option>

                                    ))
                                }
                            </select>
                        </div>
                        <span className="errormsg">{error.serviceClass ? error.serviceClass : ""}</span>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label for="dob" className="control-label">Product Class<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                            <select className="form-control" id="productClass" value={productData.productClass} onChange={handleOnchange}>
                                <option>Select...</option>
                                {
                                    productClassLookup && productClassLookup.map((val, key) => (
                                        <option key={key} value={val.code}>{val.description}</option>

                                    ))
                                }
                            </select>
                        </div>
                        <span className="errormsg">{error.productClass ? error.productClass : ""}</span>
                    </div>

                    <div className="col-md-6">
                        <div className="form-group">
                            <label for="dob" className="control-label">UOM<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                            <select className="form-control" id="uomCategory" value={productData.uomCategory} onChange={handleOnchange}>
                                <option>Select...</option>
                                {
                                    uomCategoryLookup && uomCategoryLookup.map((val, key) => (
                                        <option key={key} value={val.code}>{val.description}</option>

                                    ))
                                }
                            </select>
                        </div>
                        <span className="errormsg">{error.uomCategory ? error.uomCategory : ""}</span>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label for="dob" className="control-label">Activation Date<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                            <input type="date" className="form-control" id="activationDate" placeholder="" value={productData.activationDate} onChange={handleOnchange} />
                        </div>
                        <span className="errormsg">{error.activationDate ? error.activationDate : ""}</span>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label for="dob" className="control-label">Expiry Date<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                            <input type="date" className="form-control" id="expiryDate" placeholder="" value={productData.expiryDate} onChange={handleOnchange} />
                        </div>
                        <span className="errormsg">{error.expiryDate ? error.expiryDate : ""}</span>
                    </div>

                    <div className="col-md-6">
                        <div className="form-group">
                            <label for="dob" className="control-label">Is Appointment Required<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                            <select className="form-control" id="isAppointRequired" onChange={handleOnchange} value={productData.isAppointRequired}>
                                <option>Select...</option>
                                <option value='Y'>Yes</option>
                                <option value='N'>No</option>
                            </select>
                        </div>
                        <span className="errormsg">{error.isAppointRequired ? error.isAppointRequired : ""}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductPage4;