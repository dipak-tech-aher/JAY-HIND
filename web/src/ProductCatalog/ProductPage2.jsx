/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import { properties } from "../properties";
import { post } from "../common/util/restUtil";
import service from "../assets/images/support.png"
import plan from "../assets/images/plan.png"
import addon from "../assets/images/puzzle.png"
import asset from "../assets/images/package.png"
import bundle from "../assets/images/boxes.png"
import prepaid from "../assets/images/prepaid.png"
import postpaid from "../assets/images/postpaid.png"
import hybrid from "../assets/images/hybrid.png"


import { unstable_batchedUpdates } from 'react-dom';


const ProductPage2 = (props) => {

    const imageSources = {
        plan,
        addon,
        service,
        asset,
        bundle,
        prepaid,
        postpaid,
        hybrid
      };

    const {setProductData} = props.handler
    const {productData, productCategoryLookup, productTypeLookup, error, mode} = props.data

    return (
        <div className="col-md-10 skel-cr-rht-sect-form">
            <div className="skel-step-process">Step-2<span>Select Product Category & Type</span></div>
            <div className="row">
                <div className="col-md-12">
                    <div className="form-group">
                        <label for="customerName" className="control-label">Product Category<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                        <div className="d-flex mt-2 mi-20">
                            {
                                productCategoryLookup && productCategoryLookup.map((val, key)=>(
                                    <label key={key} for={"productCategory-"+key} className="radio-card">
                                    <input type="radio" name="productCategory" id={"productCategory-"+key}  
                                    checked={productData.productCategory === val.code}
                                    onChange={(e)=>{
                                        setProductData({
                                            ...productData,
                                            productCategory: val.code
                                        })
                                    }}
                                    disabled={mode== 'edit' ? true : false}
                                    />
                                    <div className="card-content-wrapper">
                                        <span className="check-icon"></span>
                                        <div className="card-content">
                                            <img
                                                src={imageSources[val?.description?.toLowerCase()]}
                                                alt=""
                                            />
                                            <h5>{val.description}</h5>

                                        </div>
                                    </div>
                                </label>
                                ))
                            }                              
                        </div>  
                        <span className="errormsg">{error.productCategory ? error.productCategory : ""}</span>

                    </div>
                </div>

                <div className="col-md-12">
                    <div className="form-group">
                        <label for="customerName" className="control-label">Product Type<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                        <div className="d-flex mt-2 mi-20">
                            {
                                productTypeLookup && productTypeLookup.map((val, key)=>(
                                    <label key={key} for={"productType-"+key} className="radio-card">
                                    <input type="radio" name="productType" id={"productType-"+key} 
                                    checked={productData.productType === val.code}                                            
                                    onChange={(e)=>{
                                        setProductData({
                                            ...productData,
                                            productType: val.code
                                        })
                                    }}
                                    disabled={mode== 'edit' ? true : false}
                                    />
                                    <div className="card-content-wrapper">
                                        <span className="check-icon"></span>
                                        <div className="card-content">
                                            <img
                                                src={imageSources[val?.description?.toLowerCase()]}
                                                alt=""
                                            />
                                            <h5>{val.description}</h5>

                                        </div>
                                    </div>
                                </label>
                                ))
                            }
                        </div>
                        <span className="errormsg">{error.productType ? error.productType : ""}</span>
                    </div>
                </div>
            </div>

        </div>                           
    )
}

export default ProductPage2;