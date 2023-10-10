/***********************************Inventory Module- Create Inventory- Srinivasan.N-31-July-2023********************************/
import React, { useEffect, useState } from 'react';
import { string, object } from "yup";
import { properties } from "../properties";
import { post, get, put } from "../common/util/restUtil";
import { unstable_batchedUpdates } from 'react-dom';
import AssetDetail from './AssetDetail';
import Hardware from './Hardware';
import Software from './Software';
import Contracts from './Contracts';
import Financial from './Financial';
import Allocation from './Allocation';
import { toast } from 'react-toastify';
import moment from 'moment'
import { history } from '../common/util/history';

const CreateProduct = (props) => {
    const data = props.location?.state?.data

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

    const tabsData = [
        { id: "Asset", label: "Asset Detail", component: <AssetDetail /> },
        { id: "Hardware", label: "Hardware", component: <Hardware /> },
        { id: "Software", label: "Software", component: <Software /> },
        { id: "Contracts", label: "Contracts", component: <Contracts /> },
        { id: "Financial", label: "Financial", component: <Financial /> },
        { id: "Allocation", label: "Allocation", component: <Allocation /> },
      ];
    
    const [activeTab, setActiveTab] = useState(0);

    const [file, setFile] = useState({});

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
            })
        } else {
            put(`${properties.PRODUCT_API}/update/${reqBody.productUuid}`, reqBody).then((resp) => {
                if (resp.status === 200) {
                    setProductData({
                        ...productData,
                        ...resp.data
                    })
                    toast.success(resp.message)
                }
            })
        }

    }

    return (
        <div className="card-skeleton">
            <div className="cutomer-skel mt-1">
                <form id="msform">
                    <div className="form-row">
                        <div className="tabbable mt-2">
                            <ul className="nav nav-tabs" id="myTab" role="tablist">
                                {tabsData.map((tab, index) => (
                                <li className="nav-item" key={tab.id}>
                                    <a
                                    className={index === 0 ? "nav-link active" : "nav-link"}
                                    id={`${tab.id}-tab`}
                                    data-toggle="tab"
                                    href={`#${tab.id}Tab`}
                                    role="tab"
                                    aria-controls={`${tab.id}Tab`}
                                    aria-selected={index === 0 ? "true" : "false"}
                                    onClick={(e) => {
                                        setActiveTab(index);
                                    }}
                                    >
                                    {tab.label}
                                    </a>
                                </li>
                                ))}
                            </ul>
                        </div>
                        <div className="col-md-10">
                            <fieldset>
                                <div className="cmmn-skeleton skel-cr-cust-form1">
                                    <div className="form-row">                                
                                    {tabsData.map((tab, index) => (
                                        <div
                                            key={`tabContent-${index}`}
                                            className={`tab-pane fade ${index === activeTab ? "show active" : ""}`}
                                            id={`${tab.id}Tab`}
                                            role="tabpanel"
                                            aria-labelledby={`${tab.id}-tab`}
                                        >
                                            {console.log(index, activeTab , tab.component)}
                                            {index === activeTab && tab.component}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <input type="button" name="next" className="btn waves-effect waves-light btn-primary next action-button" onClick={handleNext} value={pageIndex === 6 ? "Finish" : "Save and Continue"} />
                                {pageIndex !== 1 && <input type="button" name="previous" className="btn waves-effect waves-light btn-secondary previous action-button-previous" onClick={handlePrevious} value="Previous" />}

                            </fieldset>
                        </div>        
                    </div>
                </form>
            </div>


        </div>
    )
}

export default CreateProduct;