/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';

import { properties } from "../properties";
import { post } from "../common/util/restUtil";



import { unstable_batchedUpdates } from 'react-dom';


const ProductPage3 = (props) => {
    const [serviceTypeList, setServiceTypeList] = useState([])

    const {setProductData, handleOnchange} = props.handler
    const {productData, productSubCategoryLookup, productSubTypeLookup, serviceTypeLookup, provisionTypeLookup, error, mode} = props.data

    const productSubTypeList = productSubTypeLookup.filter(f=> f?.mapping?.productFamily?.includes(productData.productFamily))

    useEffect(()=>{

        const stList = serviceTypeLookup.filter(f=> f.mapping?.mapEntity?.includes(productData.productSubType))

        setServiceTypeList(stList)

    },[productData.productSubType, serviceTypeLookup])

 

    return (        
        <div className="col-md-10 skel-cr-rht-sect-form">
            <div className="skel-step-process">Step-3<span>Add Product Sub Details</span></div>
            <div className="row px-2 py-2">
                <div className="row">
                    <div className="col-md-6">
                        <div className="form-group">
                            <label for="dob" className="control-label">Product Sub Type<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                            <select id="productSubType" className="form-control" 
                            value={productData.productSubType}
                            onChange={(e)=>{
                                const stList = serviceTypeLookup && serviceTypeLookup.filter(f=> {
                                    // console.log(f)
                                    return f.mapping?.mapEntity?.includes(e.target.value)})
                                    setServiceTypeList(stList)
                                    handleOnchange(e)
                                }}
                                
                            > 
                                
                                <option>Select...</option>      
                                {
                                    productSubTypeList && productSubTypeList.map((val, key)=>(
                                        <option key={key} value={val.code}>{val.description}</option>

                                    ))
                                }

                            </select>
                        </div>
                        <span className="errormsg">{error.productSubType ? error.productSubType : ""}</span>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label for="dob" className="control-label">Service Type<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                            
                            <select className="form-control" id="serviceType" value={productData.serviceType} onChange={handleOnchange}> 
                                <option>Select...</option>
                                {
                                    serviceTypeList && serviceTypeList.map((val, key)=>(
                                        <option key={key} value={val.code}>{val.description}</option>

                                    ))
                                }
                            </select>
                        </div>
                        <span className="errormsg">{error.serviceType ? error.serviceType : ""}</span>
                    </div>

                    <div className="col-md-6">
                        <div className="form-group">
                            <label for="dob" className="control-label">Product Subcategory<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                            <select className="form-control" id="productSubCategory" value={productData.productSubCategory} onChange={handleOnchange}> 
                                <option>Select...</option>
                                {
                                    productSubCategoryLookup && productSubCategoryLookup.map((val, key)=>(
                                        <option key={key} value={val.code}>{val.description}</option>

                                    ))
                                }
                            </select>
                        </div>
                        <span className="errormsg">{error.productSubCategory ? error.productSubCategory : ""}</span>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label for="dob" className="control-label">Provisioning Type<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                            <select className="form-control" id="provisioningType" value={productData.provisioningType} onChange={handleOnchange}>
                                <option>Select...</option>
                                {
                                    provisionTypeLookup && provisionTypeLookup.map((val, key)=>(
                                        <option key={key} value={val.code}>{val.description}</option>

                                    ))
                                }
                            </select>
                        </div>
                        <span className="errormsg">{error.provisioningType ? error.provisioningType : ""}</span>
                    </div>
                </div>
            </div>
        </div>                                        
    )
}

export default ProductPage3;