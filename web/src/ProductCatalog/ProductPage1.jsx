/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import { properties } from "../properties";
import { post } from "../common/util/restUtil";
import telecom from "../assets/images/telecommunication.png"
import insurance from "../assets/images/insurance.png"
import banking from "../assets/images/bank.png"
import utility from "../assets/images/digital-services.png"



const ProductPage1 = (props) => {

    const imageSources = {
        telecom,
        insurance,
        banking,
        utility
      };

    const {setProductData, setFile} = props.handler
    const {productData, productFamilyLookup, error, file, mode} = props.data

    const convertBase64 = (e) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(e.target.files[0]);

            fileReader.onload = () => {
                resolve(fileReader.result);
                return fileReader.result
            };

            fileReader.onerror = (error) => {
                reject(error);
            };
        });
    };


    const handleChangeStatus = async (e, type = undefined) => {
        let image = null
        if(type === 'UPLOAD') {
            image = await convertBase64(e);
        }
        setFile(image)
        setProductData({
            ...productData,
            productImage: image
        })
       
    }

    return (     
        <div className="col-md-8 skel-cr-rht-sect-form">
            <div className="skel-step-process">Step-1<span>Add Product Name and Product Family</span></div>
            <div className="pl-1 pt-0">
                <label>Product Name<span className="text-danger font-20 pl-1 fld-imp">*</span></label><br />
                <div className="col-md-6 mt-1 pl-0">
                    <input className="form-control" id="productName" placeholder="Product Name" type="text" value={productData.productName} 
                    onChange={(e)=>{
                        setProductData({
                            ...productData,
                            productName: e.target.value
                        })
                    }}
                    />
                    <span className="errormsg">{error.productName ? error.productName : ""}</span>

                </div>
                <label>Product Image<span className="text-danger font-20 pl-1 fld-imp">*</span></label><br />
                <div className="col-md-6 mt-1 pl-0">
                    <div className="text-center">
                        <img className="mb-2" id="img" src={file} width="150px" height="150px" style={{ objectFit: "cover" }}>
                        </img>
                    </div>
                    <input type="file"
                        accept="image/*"
                        name="image-upload"
                        id="input"
                        style={{ display: "none" }}
                        onChange={(e) => handleChangeStatus(e, 'UPLOAD')}
                    />
                    <div style={{marginTop: "1rem", display: "flex", justifyContent: "center" }} className="button_outer">
                        <label style={{
                            margin: "auto",
                            padding: "10px",
                            color: "white",
                            textJustify: "auto",
                            textAlign: "center",
                            cursor: "pointer",

                        }} htmlFor="input" className="btn_upload">

                            Upload Image
                        </label>
                    </div>
                    {
                        file && 
                        <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center" }} className="button_outer" onClick={handleChangeStatus}>
                            <label style={{
                                margin: "auto",
                                padding: "10px",
                                color: "white",
                                textJustify: "auto",
                                textAlign: "center",
                                cursor: "pointer",

                            }} className="btn_upload">

                                Remove Image
                        </label>
                        </div>
                    }
                    
                </div>
                <div className="pl-0 pt-2">
                    <label>Product Family<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                </div>
                <div className="d-flex mt-2 grid-col-auto mi-20">
                    {
                        productFamilyLookup && productFamilyLookup.map((val, key)=>(
                            <label key={key} htmlFor={"radio-card-"+key} className="radio-card">
                                <input type="radio" name="radio-card" id={"radio-card-"+key} 
                                checked={productData.productFamily === val.code}
                                onChange={(e)=>{
                                    setProductData({
                                        ...productData,
                                        productFamily: val.code
                                    })
                                }}
                                disabled={mode== 'edit' ? true : false}
                                />
                                <div className="card-content-wrapper">
                                    <span className="check-icon"></span>
                                    <div className="card-content text-center">
                                        <img
                                            src={imageSources[val?.description?.toLowerCase()]}
                                            alt=""
                                        />
                                        <h5>{val?.description}</h5>

                                    </div>
                                </div>
                            </label>
                        ))
                    }

                </div>
                <span className="errormsg">{error.productFamily ? error.productFamily : ""}</span>

            </div>
        </div>       
    )
}

export default ProductPage1;