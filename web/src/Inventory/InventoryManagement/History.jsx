/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import { properties } from "../../properties";
import { post } from "../../common/util/restUtil";

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
        <div>
        <span>History</span>
        <div className="skel-role-base">
           <div className="skel-tabs-role-config">
              <div className="skel-app-tile">
                 <div className="col-12">
                    <embed type="text/html" src="timeline.html" width="1000px" height="600"/>
                 </div>
              </div>
           </div>
        </div>
     </div>     
    )
}

export default ProductPage7;