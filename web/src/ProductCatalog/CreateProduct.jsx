/***********************************Product Module- Create Product- Srinivasan.N-16-June-2023********************************/
import React, { useEffect, useState } from 'react';
import { string, object } from "yup";
import { properties } from "../properties";
import { post, get, put } from "../common/util/restUtil";
import { unstable_batchedUpdates } from 'react-dom';
import ProductPage1 from './ProductPage1';
import ProductPage2 from './ProductPage2';
import ProductPage3 from './ProductPage3';
import ProductPage4 from './ProductPage4';
import ProductPage5 from './ProductPage5';
import ProductPage6 from './ProductPage6';
import { toast } from 'react-toastify';

import productimg1 from "../assets/images/product-img1.png"
import productimg2 from "../assets/images/product-img2.png"
import productimg3 from "../assets/images/product-img3.png"
import productimg4 from "../assets/images/product-img4.png"
import productimg5 from "../assets/images/product-img5.png"
import productimg6 from "../assets/images/product-img6.png"
// import productimg7 from "../assets/images/product-img6.png"

import moment from 'moment'
import { history } from '../common/util/history';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';

const CreateProduct = (props) => {
    // console.log('props.location.state ', props.location?.state?.data)
    const data = props.location?.state?.data
    const imageSources = {
        productimg1,
        productimg2,
        productimg3,
        productimg4,
        productimg5,
        productimg6
    };
    const init = {
        productName: "",
        status: "AC",
        productUuid: null
    }
    const [mode, setMode] = useState(data?.mode || 'create')
    const [error, setError] = useState([])
    const [pageIndex, setPageIndex] = useState(1)
    const [percentage, setPercentage] = useState(0)
    const [productData, setProductData] = useState({})
    const [productTypeLookup, setProductTypeLookup] = useState([])
    const [productFamilyLookup, setProductFamilyLookup] = useState([])
    const [productCategoryLookup, setProductCategoryLookup] = useState([])
    const [productSubCategoryLookup, setProductSubCategoryLookup] = useState([])
    const [productSubTypeLookup, setProductSubTypeLookup] = useState([])
    const [productClassLookup, setProductClassLookup] = useState([])
    const [serviceTypeLookup, setServiceTypeLookup] = useState([])
    const [provisionTypeLookup, setProvisionTypeLookup] = useState([])
    const [serviceClassLookup, setServiceClassLookup] = useState([])
    const [uomCategoryLookup, setUomCategoryLookup] = useState([])
    const [frequencyLookup, setFrequencyLookup] = useState([])
    const [productBenefitLookup, setProductBenefitLookup] = useState([])

    const [isPlanTerminated, setIsPlanTerminated] = useState(false)
    const [isChargeModalOpen, setIsChargeModalOpen] = useState(false)
    const [chargeName, setChargeName] = useState('')
    const [showChargeDropdown, setShowChargeDropdown] = useState(false)
    const [chargeNameLookup, setChargeNameLookup] = useState([])
    const [termsAndConditionLookup, setTermsAndConditionLookup] = useState([])
    const [chargeList, setChargeList] = useState([])
    const [chargeData, setChargeData] = useState({
        chargeId: 0,
        chargeName: '',
        chargeType: '',
        chargeTypeDesc: '',
        currencyDesc: '',
        currency: '',
        chargeAmount: '',
        frequency: '',
        prorated: '',
        billingEffective: 1,
        advanceCharge: '',
        chargeUpfront: '',
        startDate: '',
        endDate: '',
        changesApplied: ''
    })

    const page1Schema = object().shape({
        productName: string().required("Product Name is required"),
        productFamily: string().required("Product Family is required")
    });
    const page2Schema = object().shape({
        productCategory: string().required("Product Category is required"),
        productType: string().required("Product Type is required")
    });
    const page3Schema = object().shape({
        productSubType: string().required("Product Sub Type is required"),
        serviceType: string().required("Service Type is required"),
        productSubCategory: string().required("Product Sub category is required"),
        provisioningType: string().required("Provision Type is required"),
    });
    const page4Schema = object().shape({
        serviceClass: string().required("Service Class is required"),
        productClass: string().required("Product Class is required"),
        uomCategory: string().required("Unit of measure is required"),
        activationDate: string().required("Activation Date is required"),
        expiryDate: string().required("Expiry Date is required"),
        isAppointRequired: string().required("This field is required"),
    });
    const page5Schema = object().shape({
        contractFlag: string().required("Contract Flag is required")
    });

    const validateSchema = {
        page1Schema,
        page2Schema,
        page3Schema,
        page4Schema,
        page5Schema
    }

    const [file, setFile] = useState({});

    const validateToDate = (value) => {
        try {
            if (Date.parse(value) < Date.parse(productData.startDate))
                return false;
            return true
        } catch (e) {
            return false
        }
    }

    const validate = (section, schema, data) => {
        try {
            if (section === 'DETAILS') {
                setError({})
            }
            if (section === 'CHARGE') {
                setError({})
            }
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                if (section === 'DETAILS') {
                    setError((prevState) => {
                        return { ...prevState, [err.params.path]: err.message };
                    });
                }
                if (section === 'CHARGE') {
                    setError((prevState) => {
                        return { ...prevState, [err.params.path]: err.message };
                    });
                }
            });
            return e;
        }
    };

    useEffect(() => {
        if (data?.mode === 'create') {
            setProductData(init)
        }
        else if (data?.mode === 'edit') {
            setProductData(data?.productData)
            setFile(data?.productData.productImage)
        }
    }, [data])

    useEffect(() => {
        get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam=PRODUCT_BENEFIT,CHARGE_FREQUENCY,STATEMENT_CLASS,UOM_CATEGORY,SRVC_PROVISIONING_TYPE,SERVICE_TYPE,PRODUCT_FAMILY,PRODUCT_TYPE,PRODUCT_CATEGORY,PRODUCT_SUB_CATEGORY,PROD_SUB_TYPE,PRODUCT_CLASS')
            .then((response) => {
                setProductFamilyLookup(response.data.PRODUCT_FAMILY)
                setProductTypeLookup(response.data.PRODUCT_TYPE)
                setProductCategoryLookup(response.data.PRODUCT_CATEGORY)
                setProductSubCategoryLookup(response.data.PRODUCT_SUB_CATEGORY)
                setProductSubTypeLookup(response.data.PROD_SUB_TYPE)
                setProductClassLookup(response.data.PRODUCT_CLASS)
                setServiceTypeLookup(response.data.SERVICE_TYPE)
                setProvisionTypeLookup(response.data.SRVC_PROVISIONING_TYPE)
                setServiceClassLookup(response.data.STATEMENT_CLASS)
                setUomCategoryLookup(response.data.UOM_CATEGORY)
                setFrequencyLookup(response.data.CHARGE_FREQUENCY)
                setProductBenefitLookup(response.data.PRODUCT_BENEFIT)
            })
            .catch((error) => {
                console.log("error", error)
            })
            .finally()
        
        get(properties.MASTER_API + '/template/get-terms-conditions')
            .then((response) => {
                setTermsAndConditionLookup(response.data)          
            })
            .catch((error) => {
                console.log("error", error)
            })
            .finally()

    }, [])

    useEffect(() => {
        let list = []

        get(properties.CHARGE_API + "/search/all")
            .then((resp) => {
                list = resp.data
                setChargeNameLookup(resp.data.filter((charge) => charge.status !== 'IN'))
                if (mode === 'edit') {
                    if (productData?.status === 'IN') {
                        setIsPlanTerminated(true)
                    }
                    // setproductData({
                    //     ...productData,
                    //     planName: planData.planName,
                    //     serviceType: planData.serviceType,
                    //     startDate: planData.startDate,
                    //     endDate: planData?.endDate || '',
                    //     status: planData.status,
                    //     statusDesc: planData?.statusDesc?.description
                    // })
                    let fullChargeList = productData?.productChargesList || []
                    fullChargeList.map((charge) => {
                        list.map((chargeNode) => {
                            if (Number(charge.chargeId) === Number(chargeNode.chargeId)) {
                                charge["chargeName"] = chargeNode?.chargeName
                                charge["chargeType"] = chargeNode?.chargeCat
                                charge["chargeTypeDesc"] = chargeNode?.chargeCatDesc?.description
                                charge["currency"] = chargeNode?.currency
                                charge["currencyDesc"] = chargeNode?.currencyDesc?.description
                                charge["changesApplied"] = charge?.changesApplied !== '' ? charge?.changesApplied : 'N'
                            }
                        })
                    })
                    // console.log(fullChargeList)
                    setChargeList(fullChargeList)
                }
            }).catch(error => console.log(error))
            .finally()
        setShowChargeDropdown(false)
    }, [productData.serviceType])


    const handleNext = () => {
        let count = pageIndex
        let error = true
        // console.log('productData.productBenefit ', productData.productBenefit)
        const reqBody = {
            ...productData,
            productBenefit: productData.productBenefit?.map((pb, i) => {
              if (Array.isArray(pb)) {
                return pb.map((v, j) => ({
                  ...v,
                  contract:
                    productData.contractList && productData.contractList.length > 0
                      ? String(productData.contractList[i])
                      : '',
                }));
              } else {
                return {
                  ...pb,
                  contract:
                    productData.contractList && productData.contractList.length > 0
                      ? String(productData.contractList[i])
                      : '',
                };
              }
            }),
          };
          
        // console.log('reqBody ', reqBody)

        if(validateSchema[`page${pageIndex}Schema`]){
            error = validate('DETAILS', validateSchema[`page${pageIndex}Schema`], productData);
            if (error) {
                toast.error("Validation errors found. Please check highlighted fields");
                return false;
            }
        }
       
        if (pageIndex === 5) {
            if (chargeList.length === 0) {
                toast.error("Alteast One charge is required");
                return false;
            }
        }
        if(pageIndex === 6){
            toast.success('Product Create Successfully with reference number '+ productData.productNo)
            history.push(process.env.REACT_APP_BASE+'/search-product')
        }else{
            setPageIndex(count + 1)
            window.scrollTo(0, 0);
            setPercentage(count + 1)
            saveProduct()
        }
       

    }

    useEffect(() => {
        setPercentage(pageIndex * 16.5)
    }, [pageIndex])

    const handlePrevious = () => {
        if (pageIndex === 5) {
            setPageIndex(pageIndex - 1)
            window.scrollTo(0, 0);
        } else {
            let count = pageIndex
            setPageIndex(count - 1)
            window.scrollTo(0, 0);
        }
    }

    const saveProduct = () => {
        const reqBody = {
            ...productData,
            productBenefit: productData.contractFlag == 'Y' ? productData.productBenefit?.map((pb, i) => {
                // console.log('pb is ',pb)
                return {
                    benefits: pb.benefits ? pb.benefits : pb,
                    contract: productData.contractList ? String(productData.contractList[i]) : null
                }
            }) : productData.productBenefit
        }

        if (chargeList.length > 0) {
            reqBody.productChargesList = chargeList
        }
        // if (productData?.status === 'NEW') {
        //     if (moment(productData?.startDate).isBefore(moment().add(1, 'days').format('YYYY-MM-DD'))) {
        //         toast.error('Start Date Should be Tomorrow Date')
        //         return
        //     }
        // }
        // if (productData?.endDate !== "" || productData?.endDate !== null || productData?.endDate !== undefined) {
        //     if (moment(productData?.endDate).isBefore(moment().format('YYYY-MM-DD'))) {
        //         toast.error('End Date Cannot be Past Date')
        //         return
        //     }
        // }
        console.log('reqBody ', reqBody)

        if (!reqBody.productUuid) {
            post(`${properties.PRODUCT_API}/create`, reqBody).then((resp) => {
                if (resp.status === 200) {
                    console.log(resp.data)
                    setProductData({
                        ...productData,
                        ...resp.data
                    })
                    toast.success(resp.message)
                }
            }).catch(error => console.log(error))
        } else {
            put(`${properties.PRODUCT_API}/update/${reqBody.productUuid}`, reqBody).then((resp) => {
                if (resp.status === 200) {
                    setProductData({
                        ...productData,
                        ...resp.data
                    })
                    toast.success(resp.message)
                }
            }).catch(error => console.log(error))
        }

    }

    const handleOnchange = (e) => {
        setProductData({
            ...productData,
            [e.target.id]: e.target.value
        })
    }

    const handleAddCharge = () => {
        if (productData.serviceType === '') {
            toast.error("Please Select Service Type")
            return false
        }
        setChargeNameLookup(chargeNameLookup.filter((charge) => charge.serviceType === productData.serviceType))
        setShowChargeDropdown(true)
    }

    const handleChargeNameSearch = (e) => {
        if (chargeList.length > 0) {
            for (let charge in chargeList) {
                if (Number(chargeList[charge].chargeId) === Number(chargeName)) {
                    toast.error("Charge Name Already Added")
                    setChargeName('')
                    return
                }
            }
        }
        if (chargeName === '') {
            toast.error("Please Select Charge Name")
            return
        }
        let charge = chargeNameLookup.filter((charge) => Number(charge.chargeId) === Number(chargeName))
        setChargeData({
            chargeId: charge[0]?.chargeId,
            planChargeId: '',
            chargeName: charge[0]?.chargeName,
            chargeType: charge[0]?.chargeCat,
            chargeTypeDesc: charge[0]?.chargeCatDesc?.description,
            currencyDesc: charge[0]?.currencyDesc?.description,
            currency: charge[0]?.currency,
            chargeAmount: '',
            frequency: '',
            prorated: '',
            billingEffective: 1,
            advanceCharge: '',
            chargeUpfront: '',
            startDate: '',
            endDate: '',
            changesApplied: ''
        })
        console.log('charge ', charge)
        setMode('create')
        setIsChargeModalOpen(true)
        setChargeName('')
        setShowChargeDropdown(false)
    }

    return (
        <div className="card-skeleton">
            <div className="cutomer-skel mt-1">
                <form id="msform">
                    <div className="form-row">
                        <div className="col-md-10">
                            <fieldset>
                                <div className="cmmn-skeleton skel-cr-cust-form1">
                                    <div className="form-row">
                                        <div className="col-md-2 skel-cr-lft-sect-img">
                                            <img src={imageSources[`productimg${pageIndex}`]} alt="" className="img-fluid" width="200" height="200" />
                                        </div>
                                        {
                                            pageIndex === 1 ?
                                                <ProductPage1 data={{
                                                    productData,
                                                    productFamilyLookup,
                                                    error,
                                                    file,
                                                    mode
                                                }}
                                                    handler={{
                                                        setProductData,
                                                        handleOnchange,
                                                        setFile
                                                    }} />
                                                : pageIndex === 2 ?
                                                    <ProductPage2 data={{
                                                        productData,
                                                        productCategoryLookup,
                                                        productTypeLookup,
                                                        error,
                                                        mode
                                                    }}
                                                        handler={{
                                                            setProductData,
                                                            handleOnchange
                                                        }} />
                                                    : pageIndex === 3 ?
                                                        <ProductPage3 data={{
                                                            productData,
                                                            productSubCategoryLookup,
                                                            productSubTypeLookup,
                                                            serviceTypeLookup,
                                                            provisionTypeLookup,
                                                            error,
                                                            mode
                                                        }}
                                                            handler={{
                                                                setProductData,
                                                                setServiceTypeLookup,
                                                                handleOnchange
                                                            }} />
                                                        : pageIndex === 4 ?
                                                            <ProductPage4 data={{
                                                                productData,
                                                                productClassLookup,
                                                                serviceClassLookup,
                                                                uomCategoryLookup,
                                                                chargeData,
                                                                chargeList,
                                                                error,
                                                                mode
                                                            }}
                                                                handler={{
                                                                    handleOnchange
                                                                }} />
                                                            : pageIndex === 5 ?
                                                                <ProductPage5 data={{
                                                                    productData,
                                                                    frequencyLookup,
                                                                    termsAndConditionLookup,
                                                                    chargeData,
                                                                    chargeList,
                                                                    error,
                                                                    isPlanTerminated,
                                                                    showChargeDropdown,
                                                                    chargeNameLookup,
                                                                    chargeName,
                                                                    isChargeModalOpen,
                                                                    productBenefitLookup,
                                                                    mode
                                                                }}
                                                                    handler={{
                                                                        setProductData,
                                                                        handleOnchange,
                                                                        setError,
                                                                        setChargeData,
                                                                        setIsChargeModalOpen,
                                                                        setMode,
                                                                        setChargeName,
                                                                        handleAddCharge,
                                                                        handleChargeNameSearch,
                                                                        setChargeList,
                                                                        validate
                                                                    }} />                                                                
                                                                    : pageIndex === 6 ?
                                                                        <ProductPage6 data={{
                                                                            productData,
                                                                            productFamilyLookup,
                                                                            productClassLookup,
                                                                            serviceClassLookup,
                                                                            uomCategoryLookup,
                                                                            chargeData,
                                                                            chargeList,
                                                                            frequencyLookup,
                                                                            productSubCategoryLookup,
                                                                            productSubTypeLookup,
                                                                            serviceTypeLookup,
                                                                            provisionTypeLookup,
                                                                            productCategoryLookup,
                                                                            productTypeLookup,
                                                                            productBenefitLookup,
                                                                        }}/>
                                                                        : <></>
                                        }
                                    </div>
                                </div>

                                <input type="button" name="next" className="btn waves-effect waves-light btn-primary next action-button" onClick={handleNext} value={pageIndex === 6 ? "Finish" : "Save and Continue"} />
                                {pageIndex !== 1 && <input type="button" name="previous" className="btn waves-effect waves-light btn-secondary previous action-button-previous" onClick={handlePrevious} value="Previous" />}

                            </fieldset>
                        </div>
                        <div className="col-md-2">
                            <div className="cmmn-skeleton skel-hr-progressbar">
                                <span className="pl-2">
                                    <button type="button" className="btn btn-labeled btn-primary btn-sm ml-1" onClick={()=>{history.push(process.env.REACT_APP_BASE+'/create-bulk-upload', {data:{selectedTemplateType: 'PRODUCT'}})}}>Try Bulk Import</button>
                                    <hr className="border-light" />
                                </span>
                                <ul id="progressbar" className="skel-vl-progressbar mt-2" role="tablist">
                                    <li className="active text-left p810" id="customer"><strong> Product Name </strong></li>
                                    <li className={pageIndex > 1 ? "active text-left p810" : "text-left p810"} id="account"><strong> Category and Type </strong></li>
                                    <li className={pageIndex > 2 ? "active text-left p810" : "text-left p810"} id="services"><strong>Sub Details</strong></li>
                                    <li className={pageIndex > 3 ? "active text-left p810" : "text-left p810"} id="agreement"><strong>Product Class</strong></li>
                                    <li className={pageIndex > 4 ? "active text-left p810" : "text-left p810"} id="agreement"><strong>Activation </strong></li>
                                    <li className={pageIndex > 5 ? "active text-left p810" : "text-left p810"} id="agreement"><strong>Preview </strong></li>
                                    <span className="hhlll"></span>
                                </ul>

                                <p className="text-center">Your are still in the process of completing the creation.</p>
                                <div className="skel-progress">
                                    <CircularProgressbar
                                        value={percentage ? (percentage).toFixed(1) : 0}
                                        text={`${percentage ? (percentage).toFixed(1) : 0}%`}
                                        styles={buildStyles({
                                            strokeLinecap: 'butt',
                                            textSize: '13px',
                                            pathTransitionDuration: 0.5,
                                            pathColor: `green`,
                                            textColor: 'grey',
                                            trailColor: 'light-grey',
                                            backgroundColor: 'white',
                                            
                                        })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>


        </div>
    )
}

export default CreateProduct;