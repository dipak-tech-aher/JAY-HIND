import React, { useState, useEffect, useRef } from 'react';
import { unstable_batchedUpdates } from 'react-dom';

import { properties } from '../../properties';
import { post, put } from '../../common/util/restUtil';
import { string, object, array } from "yup";
import { validateToDate } from '../../common/util/util';
import { toast } from 'react-toastify';
import moment from 'moment'
import AddEditCatalogFrom from './CatalogForm/AddEditCatalogForm';
import AddEditCatalogPlan from './CatalogPlan/AddEditCatalogPlan';
import AddEditCatalogService from './CatalogService/AddEditCatalogService';
import AddEditCatalogAddon from './CatalogAddon/AddEditCatalogAddon';
import AddEditCatalogAsset from './CatalogAsset/AddEditCatalogAsset';

const AddEditCatalog = (props) => {
    const tabs = [
        {
            name: 'Catalog Details',
            index: 0
        },
        {
            name: 'Plan',
            index: 1
        },
        {
            name: 'Service',
            index: 2
        },
        {
            name: 'Add-on',
            index: 3
        },
        {
            name: 'Assets',
            index: 4
        }
    ];
    const location = props.data.location
    const setIsActive = props.handler.setIsActive
    const catalogData = props.data.catalogData
    const lookupData = useRef();
    const [activeTab, setActiveTab] = useState(tabs[0]);
    const [serviceTypeLookup, setServiceTypeLookup] = useState([]);
    const [customerTypeLookup, setCustomerTypeLookup] = useState([]);
    const [statusLookup, setStatusLookup] = useState([]);
    const [catalogDetailsFromInputs, setCatalogDetailsFromInputs] = useState({
        catalogName: "",
        serviceType: "",
        customerType: [],
        startDate: "",
        endDate: "",
        status: "NEW",
        statusDesc: "New"
    });
    const [catalogDetailsFormInputErrors, setCatalogDetailsFormInputErrors] = useState({});
    const [planSelectedList, setPlanSelectedList] = useState([]);
    const [serviceSelectedList, setServiceSelectedList] = useState([]);
    const [addonSelectedList, setAddonSelectedList] = useState([]);
    const [assetSelectedList, setAssetSelectedList] = useState([]);
    const [isCatalogTerminated,setIsCatalogTerminated] = useState(false)

    const CatalogDetailsValidationSchema = object().shape({
        catalogName: string().required("Charge Name is required"),
        serviceType: string().required("Service Type is required"),
        customerType: array().of(object().shape({ value: string(), label: string() })).required("Customer Type is required"),
        startDate: string().required("Start Date is required"),
        endDate: string().nullable(true).test(
            "Date",
            "End date should not be less than from Start date",
            (endDate) => validateToDate(endDate, catalogDetailsFromInputs.startDate)
        ),
        status: string().required("Status is required")
    });

    const validate = (schema, data) => {
        try {
            setCatalogDetailsFormInputErrors({})
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                setCatalogDetailsFormInputErrors((prevState) => {
                    return { ...prevState, [err.params.path]: err.message };
                });
            });
            return e;
        }
    };

    useEffect(() => {
        getLookupData()
    }, [])

    const getLookupData = () => {
        
        post(properties.BUSINESS_ENTITY_API, [
            'PROD_TYPE',
            'CUSTOMER_TYPE',
            'CONNECTION_STATUS',
        ])
            .then((response) => {
                if (response.data) {
                    lookupData.current = response.data;
                    unstable_batchedUpdates(() => {
                        setServiceTypeLookup(lookupData.current['PROD_TYPE']);
                        setCustomerTypeLookup(lookupData.current['CUSTOMER_TYPE']);
                        //setStatusLookup(lookupData.current['CONNECTION_STATUS']);
                        setStatusLookup(lookupData.current['CONNECTION_STATUS'].filter((status) => {
                            if(status.code === 'ACTIVE' || status.code === 'HOLD')
                            {
                                return status
                            }
                        }))
                        if (location === 'edit') {
                            setEditData();
                        }
                    });
                }
            })
            .catch(error => {
                console.log(error);
            })
            .finally()
    }

    const setEditData = () => {
        const { catalogName, serviceType, customerType, startDate, endDate, status, statusDesc, planMap, serviceMap, addonMap, assetMap } = catalogData;
        let custType = customerType.map((cType) => cType.code);
        let filteredCustomerType = lookupData?.current['CUSTOMER_TYPE']?.filter((type) => custType.includes(type.code))
            .map((data) => ({ label: data.description, value: data.code }))
        unstable_batchedUpdates(() => {
            if(status === 'PD')
            {
                setIsCatalogTerminated(true)
            }
            setCatalogDetailsFromInputs({
                catalogName,
                serviceType,
                customerType: filteredCustomerType,
                startDate,
                endDate,
                status,
                statusDesc: statusDesc?.description
            })
            setPlanSelectedList(planMap);
            setServiceSelectedList(serviceMap);
            setAddonSelectedList(addonMap);
            setAssetSelectedList(assetMap);
        })
    }

    const handleOnTabChange = (selectedTab) => {
        if (activeTab.index === 1 && selectedTab.index === 0) {
            setActiveTab(selectedTab);
            return;
        }
        if (verifyUserNaviagtion(activeTab.index)) {
            return;
        }
        setActiveTab(selectedTab);
    }

    const handleOnPreviousNext = (e) => {
        const { target } = e;
        if (target.id === 'prev') {
            setActiveTab(tabs[--activeTab.index])
        }
        else {
            if (verifyUserNaviagtion(activeTab.index)) {
                return;
            }
            setActiveTab(tabs[++activeTab.index]);
        }
    }

    const verifyUserNaviagtion = (index) => {
        if (index === 0 && validate(CatalogDetailsValidationSchema, catalogDetailsFromInputs)) {
            toast.error("Validation errors found. Please check highlighted fields");
            return true;
        }

        if ([1, 2, 3, 4].includes(index) && planSelectedList.filter((plan) => plan.status === 'ACTIVE').length === 0) {
            toast.error("Please Add a Plan");
            return true;
        }
    }

    const handleCatalogDetailsFormInputChange = (e) => {
        const { target } = e;
        unstable_batchedUpdates(() => {
            setCatalogDetailsFromInputs({
                ...catalogDetailsFromInputs,
                [target.id.replace('-', '')]: target.value
            })
            setCatalogDetailsFormInputErrors({
                ...catalogDetailsFormInputErrors,
                [target.id.replace('-', '')]: ""
            })
        })
    }

    const handleCustomerTypeChange = (selectedObjects) => {
        unstable_batchedUpdates(() => {
            setCatalogDetailsFromInputs({
                ...catalogDetailsFromInputs,
                customerType: selectedObjects
            })
            if (selectedObjects)
                setCatalogDetailsFormInputErrors({
                    ...catalogDetailsFormInputErrors,
                    customerType: ""
                })
        })
    }

    const handleSubmit = () => {
        if (planSelectedList.length === 0) {
            toast.error("Please Add a Plan");
            return false;
        }
        let data = {
            ...catalogDetailsFromInputs,
            customerType: catalogDetailsFromInputs?.customerType?.map((type) => type.value),
            plan: planSelectedList,
            service: serviceSelectedList,
            addon: addonSelectedList,
            asset: assetSelectedList
        }
        if(catalogDetailsFromInputs?.status === 'NEW')
        {
            if(moment(catalogDetailsFromInputs?.startDate).isBefore(moment().add(1,'days').format('YYYY-MM-DD')))
            {
                toast.error('Start Date Should be Tomorrow Date')
                return 
            }
        }
        if(catalogDetailsFromInputs?.endDate !== "" || catalogDetailsFromInputs?.endDate !== null || catalogDetailsFromInputs?.endDate !== undefined)
        {
            if(moment(catalogDetailsFromInputs?.endDate).isBefore(moment().format('YYYY-MM-DD')))
            {
                    toast.error('End Date Cannot be Past Date')
                    return 
            }
        }
        if (location === 'create') {
            
            post(properties.CATALOGUE_API, data)
                .then((response) => {
                    if (response.status === 200) {
                        toast.success("Catalog Created Successfully");
                        setIsActive('list');
                    }
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally()
        }
        else if (location === 'edit') {
            
            put(`${properties.CATALOGUE_API}/${catalogData?.catalogId}`, data)
                .then((response) => {
                    if (response.status === 200) {
                        toast.success("Catalog Updated Successfully");
                        setIsActive('list');
                    }
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally()
        }
    }

    return (
        <div className="row mt-1">
            <div className="col-lg-12">
                <div className="card-body">
                    <div id="basicwizard">
                        <ul className="nav nav-pills bg-light nav-justified form-wizard-header mb-4">
                            {
                                tabs.map((tab, index) => (
                                    <li key={tab.name} className="nav-item">
                                        <div className={`nav-link rounded-0 pt-2 pb-2 cursor-pointer ${activeTab.index === index ? 'active' : ''}`} onClick={() => handleOnTabChange(tab)}>
                                            <span className="number mr-1">{++index}</span>
                                            <span className="d-sm-inline">{location === 'create' ? 'Add ' : 'Edit '}{tab.name}</span>
                                        </div>
                                    </li>
                                ))
                            }
                        </ul>
                        <div className="tab-content p-0">
                            <div className="tab-pane active px-2" id={activeTab.name}>
                                <div className="row">
                                    <div className="col-12">
                                        {
                                            activeTab?.index === 0 ?
                                                <AddEditCatalogFrom
                                                    data={{
                                                        catalogDetailsFromInputs,
                                                        isCatalogTerminated,
                                                        location
                                                    }}
                                                    lookup={{
                                                        serviceTypeLookup,
                                                        customerTypeLookup,
                                                        statusLookup
                                                    }}
                                                    handler={{
                                                        setCatalogDetailsFromInputs,
                                                        setCatalogDetailsFormInputErrors,
                                                        handleCatalogDetailsFormInputChange,
                                                        handleCustomerTypeChange
                                                    }}
                                                    error={{
                                                        catalogDetailsFormInputErrors
                                                    }} />
                                                : activeTab?.index === 1 ?
                                                    <AddEditCatalogPlan
                                                        data={{
                                                            planSelectedList: planSelectedList,
                                                            catalogData: catalogDetailsFromInputs,
                                                            isCatalogTerminated
                                                        }}
                                                        handler={{
                                                            setPlanSelectedList: setPlanSelectedList
                                                        }}
                                                    />
                                                    : activeTab?.index === 2 ?
                                                        <AddEditCatalogService
                                                            data={{
                                                                serviceSelectedList: serviceSelectedList,
                                                                catalogData: catalogDetailsFromInputs,
                                                                isCatalogTerminated
                                                            }}
                                                            handler={{
                                                                setServiceSelectedList: setServiceSelectedList
                                                            }}
                                                        />
                                                        : activeTab?.index === 3 ?
                                                            <AddEditCatalogAddon
                                                                data={{
                                                                    addonSelectedList: addonSelectedList,
                                                                    catalogData: catalogDetailsFromInputs,
                                                                    isCatalogTerminated
                                                                }}
                                                                handler={{
                                                                    setAddonSelectedList: setAddonSelectedList
                                                                }}
                                                            />
                                                            :
                                                            <AddEditCatalogAsset
                                                                data={{
                                                                    assetSelectedList: assetSelectedList,
                                                                    catalogData: catalogDetailsFromInputs,
                                                                    isCatalogTerminated
                                                                }}
                                                                handler={{
                                                                    setAssetSelectedList: setAssetSelectedList
                                                                }}
                                                            />
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                        <ul className="list-inline wizard mb-0">
                            <li className="previous list-inline-item disabled">
                                <button className={`btn btn-primary ${activeTab.index === 0 ? 'd-none' : ''}`} id='prev' onClick={handleOnPreviousNext}>Previous</button>
                            </li>
                            <li className="list-inline-item text-center">
                                <button className="btn btn-primary" onClick={() => { setIsActive('list') }}>Back to Catalog List</button>
                            </li>
                            {
                                (activeTab.index === 4) ?
                                    <>
                                        <li className="next list-inline-item float-right pl-1">
                                            <button className="btn btn-secondary" onClick={() => { setIsActive('list') }}>Cancel</button>
                                        </li>
                                        <li className="next list-inline-item float-right">
                                            <button className="btn btn-primary" onClick={handleSubmit} disabled={isCatalogTerminated} >
                                                {
                                                    location === 'create' ? 'Submit' : 'Update'
                                                }
                                            </button>
                                        </li>
                                    </>
                                    :
                                    <li className="next list-inline-item float-right">
                                        <button className="btn btn-primary" id='next' disabled={activeTab.index === 4} onClick={handleOnPreviousNext}>Next</button>
                                    </li>
                            }
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddEditCatalog;