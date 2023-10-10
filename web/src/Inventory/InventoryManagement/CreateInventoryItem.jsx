/***********************************Inventory Module- Create Inventory- Srinivasan.N-31-July-2023********************************/
import React, { useEffect, useState } from 'react';
import { InventoryContext } from "../../AppContext";
import { string, object } from "yup";
import { properties } from "../../properties";
import { post, get, put } from "../../common/util/restUtil";
import { unstable_batchedUpdates } from 'react-dom';
import AssetDetail from './AssetDetail';
import Hardware from './Hardware';
import Software from './Software';
import Contracts from './Contracts';
import Financial from './Financial';
import Allocation from './Allocation';
import { toast } from 'react-toastify';
import moment from 'moment'
import { history } from '../../common/util/history';
import Variations from './Variations';

const CreateInventoryItem = (props) => {
    const data = props.location?.state?.data

    const init = {
        itemName: "",
        status: "AC",
        itemUuid: null
    }
    const [mode, setMode] = useState(data?.mode || 'create')
    const [error, setError] = useState([])
    const [pageIndex, setPageIndex] = useState(1)
    const [percentage, setPercentage] = useState(0)
    const [itemData, setItemData] = useState({})
    const [itemTypeLookup, setItemTypeLookup] = useState([])
    const [itemCategoryLookup, setItemCategoryLookup] = useState([])
    const [itemBrandLookup, setItemBrandLookup] = useState([])
    const [itemModelLookup, setItemModelLookup] = useState([])
    const [serviceTypeLookup, setServiceTypeLookup] = useState([])
    const [provisionTypeLookup, setProvisionTypeLookup] = useState([])
    const [serviceClassLookup, setServiceClassLookup] = useState([])
    const [uomCategoryLookup, setUomCategoryLookup] = useState([])
    const [itemStatusLookup, setItemStatusLookup] = useState([])
    const [itemVariantLookup, setItemVariantLookup] = useState([])
    const [itemVariantTypeLookup, setItemVariantTypeLookup] = useState([])
    const [itemOSLookup, setItemOSLookup] = useState([])
    const [showChargeDropdown, setShowChargeDropdown] = useState(false)
    const [termsAndConditionLookup, setTermsAndConditionLookup] = useState([])
    
    const page1Schema = object().shape({
        itemName: string().required("This field is required"),
        itemType: string().required("This field is required"),
        itemCategory: string().required("This field is required"),
        itemCode: string().required("This field is required"),
        itemLocation: string().required("This field is required"),
        itemManagedBy: string().required("This field is required"),
        invItemStatus: string().required("This field is required"),
    });
    const page2Schema = object().shape({
        itemCategory: string().required("Item Category is required"),
        itemType: string().required("Item Type is required")
    });
    const page3Schema = object().shape({
        itemSubType: string().required("Item Sub Type is required"),
        serviceType: string().required("Service Type is required"),
        itemSubCategory: string().required("Item Sub category is required"),
        provisioningType: string().required("Provision Type is required"),
    });
    const page4Schema = object().shape({
        serviceClass: string().required("Service Class is required"),
        itemClass: string().required("Item Class is required"),
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
        { id: "Asset", label: "Asset Detail", component: <AssetDetail /> }
      ];
      
      if (itemData.itemType === 'INV_ITEM_HARDWARE') {
        tabsData.push({ id: "Hardware", label: "Hardware", component: <Hardware /> });
      }
      
      if (itemData.itemType === 'INV_ITEM_SOFTWARE') {
        tabsData.push({ id: "Software", label: "Software", component: <Software /> });
      }
      
      tabsData.push(
        { id: "Variations", label: "Variations", component: <Variations /> },
        { id: "Contracts", label: "Contracts", component: <Contracts /> },
        { id: "Financial", label: "Financials", component: <Financial /> }
        // Uncomment the lines below if needed
        // { id: "Order", label: "Orders", component: <Orders /> },
        // { id: "History", label: "History", component: <History /> },
      );
      
    
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
            setItemData(init)
        }
        else if (data?.mode === 'edit') {
            setItemData(data?.itemData)
            setFile(data?.itemData.itemImage)
        }
    }, [data])

    useEffect(() => {
        get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam=INV_ITEM_OS,INV_ITEM_TYPE,INV_ITEM_CAT,STATEMENT_CLASS,UOM_CATEGORY,SRVC_PROVISIONING_TYPE,SERVICE_TYPE,INV_ITEM_STATUS,INV_ITEM_VARIANT,INV_ITEM_BRAND,INV_ITEM_MODEL')
            .then((response) => {
                setItemTypeLookup(response.data.INV_ITEM_TYPE)
                setItemCategoryLookup(response.data.INV_ITEM_CAT)
                setServiceTypeLookup(response.data.SERVICE_TYPE)
                setProvisionTypeLookup(response.data.SRVC_PROVISIONING_TYPE)
                setServiceClassLookup(response.data.STATEMENT_CLASS)
                setUomCategoryLookup(response.data.UOM_CATEGORY)
                setItemStatusLookup(response.data.INV_ITEM_STATUS)
                setItemVariantLookup(response.data.INV_ITEM_VARIANT)
                setItemBrandLookup(response.data.INV_ITEM_BRAND)
                setItemModelLookup(response.data.INV_ITEM_MODEL)
                setItemOSLookup(response.data.INV_ITEM_MODEL)
            })
            .catch((error) => {
                console.log("error", error)
            })
            .finally()
        
        // get(properties.MASTER_API + '/template/get-terms-conditions')
        //     .then((response) => {
        //         setTermsAndConditionLookup(response.data)          
        //     })
        //     .catch((error) => {
        //         console.log("error", error)
        //     })
        //     .finally()

    }, [])  

    const handleNext = () => {
        let count = pageIndex
        let error = true    

        if(validateSchema[`page${pageIndex}Schema`]){
            error = validate('DETAILS', validateSchema[`page${pageIndex}Schema`], itemData);
            if (error) {
                toast.error("Validation errors found. Please check highlighted fields");
                return false;
            }
        }       

        if(pageIndex === 6){
            toast.success('Item Create Successfully with reference number '+ itemData.itemNo)
            history.push(process.env.REACT_APP_BASE+'/search-item')
        }else{
            setPageIndex(count + 1)
            window.scrollTo(0, 0);
            setPercentage(count + 1)
            saveItem()
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

    const saveItem = () => {
        const reqBody = {
            ...itemData            
        }
     
        console.log('reqBody ', reqBody)

        if (!reqBody.itemUuid) {
            post(`${properties.INVENTORY_API}/create`, reqBody).then((resp) => {
                if (resp.status === 200) {
                    console.log(resp.data)
                    setItemData({
                        ...itemData,
                        ...resp.data
                    })
                    toast.success(resp.message)
                }
            })
        } else {
            put(`${properties.INVENTORY_API}/update/${reqBody.itemUuid}`, reqBody).then((resp) => {
                if (resp.status === 200) {
                    setItemData({
                        ...itemData,
                        ...resp.data
                    })
                    toast.success(resp.message)
                }
            })
        }

    }

    const handleOnchange = (e) => {
        const { name, value } = e.target;
        setItemData({
            ...itemData,
            [name]: value
        })
    }

    const contextProvider = {
        data: {
            itemData,
            itemCategoryLookup,
            itemStatusLookup,
            itemTypeLookup,
            serviceTypeLookup,
            provisionTypeLookup,
            serviceClassLookup,
            uomCategoryLookup,
            itemVariantLookup,
            itemVariantTypeLookup,
            itemBrandLookup,
            itemModelLookup,
            itemOSLookup,
            error
        },
        handlers: {
            setItemData,
            handleOnchange,
            setItemVariantTypeLookup
        }
    }

    return (
        <InventoryContext.Provider value={contextProvider}>
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
        </InventoryContext.Provider>
    )
}

export default CreateInventoryItem;