import React, { useState, useContext, useEffect, useRef } from "react";
import { post, get, put } from "../common/util/restUtil";
import { properties } from "../properties";
import { string, object, array } from "yup";
import { toast } from "react-toastify";
import { MultiSelect } from "react-multi-select-component";
import { Modal as ReactModal, CloseButton } from 'react-bootstrap';
import Modal from "react-modal"
import Switch from "react-switch";
import icon from "../assets/images/template-img.png";
import exchangetemp from "../assets/images/exchange-temp.svg";
import rhtexchange from "../assets/images/rht-exchange.svg";
import lftexchange from "../assets/images/lft-exchange.svg";
import DynamicTable from "../common/table/DynamicTable";
import moment from 'moment';
import { AddEditMapProductTemplateColumns, SelectConfirmProductMappingTemplateColumns, ConfirmProductMappingTemplateColumnsPromo } from './AddEditMapColumns'
import Swal from 'sweetalert2';
import AddEditChargeModal from "../ProductCatalog/addEditChargeModal";
import ChargeListView from "../ProductCatalog/chargeListView";
import ReactSelect from "react-select";
import DOMPurify from 'dompurify';

const MapTemplateForm = (props) => {
    const selectedTemplateData = props?.location?.state?.data
    const mode = props?.location?.state?.mode
    // const isEdit = mode === 'Edit' ? true : false;
    const objectReferenceId = useRef()

    const [categories, setCategories] = useState([])
    const [types, setTypes] = useState([])
    const [serviceCategories, setServiceCategories] = useState([])
    const [serviceTypes, setServiceTypes] = useState([])
    const [customerCategories, setCustomerCategories] = useState([])
    const [priorities, setPriorities] = useState([])
    const [selectedCategory, setSelectedCategory] = useState([]);
    const [selectedType, setSelectedType] = useState([]);
    const [selectedServiceCat, setSelectedServiceCat] = useState([]);
    const [selectedServiceType, setSelectedServiceType] = useState([]);
    const [selectedCustomerCat, setSelectedCustomerCat] = useState([]);
    const [selectedPriority, setSelectedPriority] = useState([]);
    const [templateMapCategory, setTemplateMapCategory] = useState([]);
    const [confirmedTemplateList, setConfirmedTemplateList] = useState([]);
    const [templateList, setTemplateList] = useState([]);
    const [templateListCount, setTemplateListCount] = useState(0);

    const [templateData, setTemplateData] = useState([]);
    const [data, setData] = useState({
        entityType: 'TMC_INTERACTION'
    });
    const [showMapSection, setShowMapSection] = useState(false);
    const [showChargePopup, setShowChargePopup] = useState(false);
    const [chargeMode, setChargeMode] = useState('ADD');
    const [templateCategories, setTemplateCategories] = useState([]);
    const [templateCategory, setTemplateCategory] = useState();
    const [openMapTemplateModal, setOpenMapTemplateModal] = useState(false);
    const [templateStatus, setTemplateStatus] = useState(false)
    const [selectedTemplates, setSelectedTemplates] = useState([]);
    const [unSelectedTemplates, setUnselectedTemplates] = useState([]);
    const selectedTemplateRef = useRef({});

    const entityRef = useRef()
    const clearAllFields = () => {
        setSelectedCategory([])
        setSelectedType([])
        setSelectedServiceType([])
        setSelectedServiceCat([])
        setSelectedPriority([])
        setSelectedCustomerCat([])
        setTemplateData([])
        setChargeList([])
        setTerms([])
        setConfirmedTemplateList([])
        setSelectedTemplates([])
        setUnselectedTemplates([])
        setShowChargeDropdown([])
        setShowTermDropdown([])
        setChargeName('')
        setChargeNameList([])
    }
    // console.log(selectedTemplateData)

    useEffect(() => {

        get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam=TEMPLATE_CATEGORY,TEMPLATE_MAP_CATEGORY,INTXN_TYPE,INTXN_CATEGORY,SERVICE_TYPE,PROD_SUB_TYPE,PRODUCT_FAMILY,CUSTOMER_CATEGORY,PRIORITY,ORDER_CATEGORY,ORDER_TYPE,PRODUCT_CATEGORY,PRODUCT_TYPE')
            .then((response) => {
                if (response.data) {
                    entityRef.current = response.data
                    setCategories(getBusinessEntityVal('INTXN_CATEGORY', 'category'))
                    setTypes(getBusinessEntityVal('INTXN_TYPE', 'type'))
                    setServiceTypes(getBusinessEntityVal('SERVICE_TYPE', 'serviceType'))
                    setServiceCategories(getBusinessEntityVal('PROD_SUB_TYPE', 'serviceCategory'))
                    setPriorities(getBusinessEntityVal('PRIORITY', 'priority'))
                    setCustomerCategories(getBusinessEntityVal('CUSTOMER_CATEGORY', 'customerCategory'))
                    setTemplateMapCategory(getBusinessEntityVal('TEMPLATE_MAP_CATEGORY', 'templateMapCategory'))
                    setTemplateCategories(getBusinessEntityVal('TEMPLATE_CATEGORY', 'templateCategories'))
                }
                // console.log({ mode })
                if (mode === 'COPY' || mode === "EDIT") {

                    let scArr = new Set(), tcArr = new Set(),
                        ccArr = new Set(), stArr = new Set(),
                        tpArr = new Set(), ttArr = new Set()
                    let mapCategory = data.entityType;
                    let tranEntity = data.tranEntity;

                    objectReferenceId.current = selectedTemplateData.templateCategory == 'TC_PROMOCODE' ? selectedTemplateData?.promoHdr?.promoId : selectedTemplateData.templateCategory == 'TC_PRODUCTBUNDLE' ? selectedTemplateData?.productBundleHdr?.prodBundleId : null

                    selectedTemplateData.templateMap?.map(e => {
                        e.tranCategory && tcArr.add(e.tranCategory)
                        e.customerCategory && ccArr.add(e.customerCategory)
                        e.tranPriority && tpArr.add(e.tranPriority)
                        e.serviceCategory && scArr.add(e.serviceCategory)
                        e.serviceType && stArr.add(e.serviceType)
                        e.tranType && ttArr.add(e.tranType)
                        setTemplateStatus(e.statusDesc.code === 'AC' || e.statusDesc.code === 'TPL_ACTIVE' ? true : false)
                        setData({
                            ...data,
                            entityType: e.mapCategory,
                            tranEntity: e.tranEntity
                        })
                        mapCategory = e.mapCategory
                        tranEntity = e.tranEntity
                    })

                    // console.log(selectedTemplateData.templateMap)
                    // console.log(tcArr, ttArr)
                    let catKey = "", typeKey = "";
                    if (mapCategory == "TMC_APPOINT") {
                        catKey = tranEntity == "TMC_INTERACTION" ? "INTXN_CATEGORY" : "ORDER_CATEGORY";
                        typeKey = tranEntity == "TMC_INTERACTION" ? "INTXN_TYPE" : "ORDER_TYPE";
                    } else {
                        catKey = mapCategory == "TMC_INTERACTION" ? "INTXN_CATEGORY" : "ORDER_CATEGORY";
                        typeKey = mapCategory == "TMC_INTERACTION" ? "INTXN_TYPE" : "ORDER_TYPE";
                    }

                    setSelectedCategory(getBusinessEntityVal(catKey, 'category', Array.from(tcArr)))
                    setSelectedType(getBusinessEntityVal(typeKey, 'type', Array.from(ttArr)))
                    setSelectedServiceType(getBusinessEntityVal('SERVICE_TYPE', 'serviceType', Array.from(stArr)))
                    setSelectedServiceCat(getBusinessEntityVal('PROD_SUB_TYPE', 'serviceCategory', Array.from(scArr)))
                    setSelectedPriority(getBusinessEntityVal('PRIORITY', 'priority', Array.from(tpArr)))
                    setSelectedCustomerCat(getBusinessEntityVal('CUSTOMER_CATEGORY', 'customerCategory', Array.from(ccArr)))
                    //setTemplateData(selectedTemplateData)
                    const reqBody = {
                        mapCategory: mapCategory,
                        tranEntity: tranEntity,
                        serviceCategory: Array.from(scArr),
                        serviceType: Array.from(stArr),
                        customerCategory: Array.from(ccArr),
                        tranType: Array.from(ttArr),
                        tranCategory: Array.from(tcArr),
                        tranPriority: Array.from(tpArr)
                    }
                    post(properties.MASTER_API + '/template/get-mapped-unmapped', { ...reqBody }).then((resp) => {
                        if (resp.status === 200) {
                            const mappedArr = [], unmappArr = []

                            resp.data.unMappedTemplate.filter(e => {
                                if (e.templateId === selectedTemplateData.templateId) {
                                    const obj = {
                                        ...selectedTemplateData,
                                        ...e
                                    }
                                    unmappArr.push(obj)
                                }
                            })
                            resp.data.mappedTemplate.filter(e => {
                                if (e.templateId === selectedTemplateData.templateId) {
                                    const obj = {
                                        ...selectedTemplateData,
                                        ...e
                                    }
                                    mappedArr.push(obj)
                                }
                            })

                            if (['TMC_PRODUCTBUNDLE', 'TMC_PROMOCODE', 'TMC_TERMSCONDITION'].includes(mapCategory)) {
                                getTemplateList()
                            }

                            toast.success(resp.message)
                            setTemplateData({ mappedTemplate: mappedArr, unMappedTemplate: unmappArr })
                            setShowMapSection(true)
                        }
                    }).catch(error => console.log(error))
                }
            })
            .catch(error => {
                console.error(error);
            });

        get(properties.MASTER_API + '/template/get-terms-conditions')
            .then((response) => {
                const termsList = response.data?.map(m => {
                    return {
                        label: m.termName,
                        value: m.termId
                    }
                })
                setTermsAndConditionLookup(termsList)
            })
            .catch((error) => {
                console.log("error", error)
            })


    }, [])

    useEffect(() => {
        if (['TMC_INTERACTION', 'TMC_ORDER', 'TMC_APPOINT'].includes(data.entityType)
            && selectedServiceCat?.length && selectedServiceType
            && selectedCustomerCat?.length && selectedType?.length
            && selectedCategory?.length && selectedPriority?.length
        ) {
            findTemplateMapping();
        }
    }, [data, selectedServiceCat, selectedServiceType, selectedCustomerCat, selectedType, selectedCategory, selectedPriority])

    function getBusinessEntityVal(entityName, id, arr) {
        const retArr = []
        // console.log(entityRef.current);
        if (arr && arr?.length > 0) {
            entityRef.current[entityName]?.map(e => {
                if (arr.includes(e.code)) {
                    const obj = {
                        mapping: e.mapping ?? {},
                        value: e.code,
                        label: e.description,
                        id
                    }
                    retArr.push(obj)
                }
            })
        } else {
            entityRef.current[entityName]?.map(e => {
                const obj = {
                    mapping: e.mapping ?? {},
                    value: e.code,
                    label: e.description,
                    id
                }
                retArr.push(obj)
            })
        }

        return retArr
    }

    /* JIRAID:dtWorks-275-Product Bundle Module-Srinivasan.N-19-June-2023 */
    const [termsAndConditionLookup, setTermsAndConditionLookup] = useState([])
    const [terms, setTerms] = useState([])
    const [chargeNameLookup, setChargeNameLookup] = useState([])
    const [showChargeDropdown, setShowChargeDropdown] = useState([]);
    const [showTermDropdown, setShowTermDropdown] = useState([]);

    const [chargeName, setChargeName] = useState('')
    const [chargeNameList, setChargeNameList] = useState([])
    const [selectedProductId, setSelectedProductId] = useState('')
    const [error, setError] = useState([])
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

    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [initialRender, setInitialRender] = useState(true);
    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    useEffect(() => {
        if (initialRender) {
            setInitialRender(false);
            return;
        }

        getTemplateList()
        setSelectedTemplates([])
        setUnselectedTemplates([])
    }, [currentPage, perPage])

    useEffect(() => {
        if (chargeList?.length > 0) {
            setConfirmedTemplateList((prevList) =>
                prevList?.map((item) => {
                    if (item.productId === selectedProductId) {
                        const updatedNewChargeList = item.newChargeList
                            ? item.newChargeList.filter(
                                (charge) => !chargeList.some((newCharge) => newCharge.chargeId === charge.chargeId)
                            )
                            : [];

                        const newChargeListWithObjectReferenceId = updatedNewChargeList?.map((charge) => ({
                            ...charge,
                            objectReferenceId: templateData.bundleId || null,
                        }));

                        return {
                            ...item,
                            newChargeList: [...newChargeListWithObjectReferenceId, ...chargeList],
                        };
                    }
                    return item;
                })
            );
            setSelectedTemplates([])
            setUnselectedTemplates([])
        }

    }, [chargeList])

    const getTemplateList = () => {

        const reqBody = {
            mapCategory: data.entityType,
            serviceCategory: selectedServiceCat?.map(e => e.value),
            serviceType: selectedServiceType?.map(e => e.value),
            customerCategory: selectedCustomerCat?.map(e => e.value),
            tranType: selectedType?.map(e => e.value),
            tranCategory: selectedCategory?.map(e => e.value),
            tranPriority: selectedPriority?.map(e => e.value)
        }
        // const queryString = Object.entries(reqBody)
        //     ?.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        //     .join('&');

        // console.log(queryString);
        post(`${properties.PRODUCT_API}/search?limit=${perPage}&page=${currentPage}`, reqBody)
            .then((response) => {
                const { status, data } = response;
                if (status === 200 && data) {
                    setTemplateList(data.rows);
                    setTemplateListCount(data.count)
                }
            })
            .catch((error) => {
                console.error(error);
            })
            .finally()

        let list = []

        get(properties.CHARGE_API + "/search/all")
            .then((resp) => {
                list = resp.data
                setChargeNameLookup(resp.data.filter((charge) => charge.status !== 'IN'))
            }).catch(error => console.log(error))
            .finally()
    }

    const handleChargeNameSearch = (e, obj) => {
        let charge = null
        if (e == 'ADD') {
            if (chargeList?.length > 0) {
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

            charge = chargeNameLookup.filter((charge) => Number(charge.chargeId) === (Number(chargeName)))
            setChargeData({
                chargeId: charge[0]?.chargeId,
                planChargeId: '',
                chargeName: charge[0]?.chargeName,
                chargeType: charge[0]?.chargeCat,
                chargeTypeDesc: charge[0]?.chargeCatDesc?.description,
                currencyDesc: charge[0]?.currencyDesc?.description,
                currency: charge[0]?.currency,
                chargeAmount: charge[0]?.chargeAmount,
                frequency: '',
                prorated: '',
                billingEffective: 1,
                advanceCharge: '',
                chargeUpfront: '',
                startDate: '',
                endDate: '',
                changesApplied: ''
            })
        } else {
            charge = chargeNameLookup.filter((charge) => Number(charge.chargeId) === (Number(obj.chargeId)))

            setChargeData({
                chargeId: obj?.chargeId,
                chargeName: obj?.chargeName,
                chargeType: charge[0]?.chargeCat,
                chargeTypeDesc: charge[0]?.chargeCatDesc?.description,
                currencyDesc: charge[0]?.currencyDesc?.description,
                currency: charge[0]?.currency,
                chargeAmount: obj?.chargeAmount,
                frequency: obj?.frequency,
                prorated: obj?.prorated,
                billingEffective: 1,
                advanceCharge: obj?.advanceCharge,
                chargeUpfront: obj?.chargeUpfront,
                startDate: obj?.startDate,
                endDate: obj?.endDate,
                changesApplied: obj?.changesApplied
            })
        }
        // console.log('charge ', charge)

        setChargeList([])
        setShowChargePopup(true)
        // setChargeName('')
        // setShowChargeDropdown([])
    }

    const handleOnChangeEntity = (e) => {
        /* JIRAID:dtWorks-275-Product Bundle Module-Srinivasan.N-19-June-2023 */
        let category = "";
        let type = "";
        if (e.target.value === 'TMC_INTERACTION') {
            category = 'INTXN_CATEGORY';
            type = 'INTXN_TYPE';
        } else if (e.target.value === 'TMC_ORDER') {
            category = 'ORDER_CATEGORY';
            type = 'ORDER_TYPE';
        } else if (e.target.value === 'TMC_PRODUCTBUNDLE') {
            category = 'PRODUCT_CATEGORY';
            type = 'PRODUCT_TYPE';
        }

        setCategories(
            entityRef.current[category]?.map((col, i) => ({
                label: col.description,
                value: col.code,
                id: 'category',
                mapping: col.mapping
            }))
        )
        setTypes(
            entityRef.current[type]?.map((col, i) => ({
                label: col.description,
                value: col.code,
                id: 'type',
                mapping: col.mapping
            }))
        )
        setSelectedCategory([]);
        setSelectedType([]);
        setData({
            ...data,
            [e.target.id]: e.target.value
        })
    }
    const handleOnChangeServiceCat = (e) => {
        const arr = []
        if (e?.length > 0) {
            for (const d of e) {
                if (d.id === 'serviceCategory') {
                    entityRef.current.SERVICE_TYPE.filter(col => {
                        if (col?.mapping?.mapEntity && col?.mapping?.mapEntity.includes(d.value)) {
                            arr.push(col)
                        }
                    })

                    setSelectedServiceType([]);
                    setServiceTypes(arr?.map(val => (
                        {
                            label: val.description,
                            value: val.code,
                            id: 'serviceType',
                            mapping: val.mapping
                        }
                    )))
                }
            }
        } else {
            setServiceTypes([])
        }

    }
    const findTemplateMapping = () => {
        if (['TMC_INTERACTION', 'TMC_ORDER', 'TMC_APPOINT'].includes(data.entityType) && (selectedServiceCat?.length === 0 || selectedServiceType === 0
            || selectedCustomerCat?.length === 0 || selectedType?.length === 0
            || selectedCategory?.length === 0 || selectedPriority?.length === 0)) {
            toast.error('Mandatory fields are missing')
            return false
        }
        /* JIRAID:dtWorks-275-Product Bundle Module-Srinivasan.N-19-June-2023 */
        if (['TMC_PRODUCTBUNDLE', 'TMC_PROMOCODE', 'TMC_TERMSCONDITION'].includes(data.entityType)) {
            // if (confirmedTemplateList?.length === 0) {
            //     toast.error('Map the required products to bundle')
            //     return false   
            // } else {
            getTemplateList()
            setChargeList([])
            setTerms([])
            setConfirmedTemplateList([])
            setSelectedTemplates([])
            setUnselectedTemplates([])
            setShowChargeDropdown([])
            setShowTermDropdown([])
            setChargeName('')
            setChargeNameList([])
            //}

        }
        const reqBody = {
            mapCategory: data.entityType,
            serviceCategory: selectedServiceCat?.map(e => e.value),
            serviceType: selectedServiceType?.map(e => e.value),
            customerCategory: selectedCustomerCat?.map(e => e.value),
            tranType: selectedType?.map(e => e.value),
            tranCategory: selectedCategory?.map(e => e.value),
            tranPriority: selectedPriority?.map(e => e.value)
        }
        if (['TMC_APPOINT'].includes(data.entityType)) {
            reqBody['tranEntity'] = data.tranEntity;
        }
        post(properties.MASTER_API + '/template/search', reqBody).then((resp) => {
            if (resp.status === 200) {
                post(properties.MASTER_API + '/template/get-mapped-unmapped', { ...reqBody }).then((mapResp) => {
                    if (mapResp.status === 200) {
                        const mappedArr = [], unmappArr = []
                        for (const d of resp.data) {
                            mapResp.data.unMappedTemplate.filter(e => {
                                if (e.templateId === d.templateId) {
                                    const obj = {
                                        ...d,
                                        ...e
                                    }
                                    unmappArr.push(obj)
                                }
                            })
                            mapResp.data.mappedTemplate.filter(e => {
                                if (e.templateId === d.templateId) {
                                    const obj = {
                                        ...d,
                                        ...e
                                    }
                                    mappedArr.push(obj)
                                }
                            })
                        }
                        toast.success(resp.message)
                        setTemplateData({ mappedTemplate: mappedArr, unMappedTemplate: unmappArr })
                        setShowMapSection(true)
                    }
                }).catch(error => console.log(error))
            }
        }).catch(error => console.log(error))
        // post(properties.MASTER_API + '/template/get-mapped-unmapped',{...reqBody}).then((resp) => {
        //     if (resp.status === 200) {
        //         toast.success(resp.message)
        //         setTemplateData(resp.data)
        //         setShowMapSection(true)
        //     }            
        // })
    }
    const handleSubmit = () => {
        if (['TMC_INTERACTION', 'TMC_ORDER', 'TMC_APPOINT'].includes(data.entityType) && (selectedServiceCat?.length === 0 || selectedServiceType === 0
            || selectedCustomerCat?.length === 0 || selectedType?.length === 0
            || selectedCategory?.length === 0 || selectedPriority?.length === 0)) {
            toast.error('Mandatory fields are missing')
            return false
        }
        if (templateData.mappedTemplate?.length === 0) {
            toast.error('Please choose a template to map')
            return false
        }
        /* JIRAID:dtWorks-275-Product Bundle Module-Srinivasan.N-19-June-2023 */
        if (['TMC_PRODUCTBUNDLE', 'TMC_PROMOCODE', 'TMC_TERMSCONDITION'].includes(data.entityType) && confirmedTemplateList?.length === 0) {
            toast.error('Map the required products')
            return false
        }
        const reqObj = {
            mapCategory: data.entityType,
            tranEntity: data.tranEntity,
            serviceCategory: selectedServiceCat?.map(e => e.value),
            serviceType: selectedServiceType?.map(e => e.value),
            customerCategory: selectedCustomerCat?.map(e => e.value),
            tranType: selectedType?.map(e => e.value),
            tranCategory: selectedCategory?.map(e => e.value),
            tranPriority: selectedPriority?.map(e => e.value)
        }

        if (mode == 'EDIT') {
            post(properties.MASTER_API + '/template/mapping/update', { ...templateData, ...reqObj }).then((resp) => {
                // console.log(resp)
                if (resp.status === 200) {
                    toast.success(resp.message)
                }
            }).catch(error => console.log(error))
        } else {
            post(properties.MASTER_API + '/template/mapping/create', { ...templateData, ...reqObj }).then((resp) => {
                // console.log(resp)
                if (resp.status === 200) {
                    toast.success(resp.message)
                    clearAllFields()
                }
            }).catch(error => console.log(error))
        }

    }
    const handleTemplateSelection = (val, type) => {
        //console.log(val)
        let mappedValue, unMappedValue
        if (type === 'SELECT') {
            mappedValue = [...templateData.mappedTemplate, { ...val, type, confirmedTemplateList }]
            unMappedValue = templateData.unMappedTemplate.filter(e => e.templateId !== val.templateId)
        } else {
            mappedValue = templateData.mappedTemplate.filter(e => e.templateId !== val.templateId)
            unMappedValue = [...templateData.unMappedTemplate, { ...val, type, confirmedTemplateList }]
        }
        // console.log('mappedValue==>', mappedValue)
        // console.log('unMappedValue==>', unMappedValue)

        setTemplateData({
            ...templateData,
            mappedTemplate: mappedValue.filter((item, index) => mappedValue.indexOf(item) === index),
            unMappedTemplate: unMappedValue.filter((item, index) => unMappedValue.indexOf(item) === index)
        })
    }
    /* JIRAID:dtWorks-275-Product Bundle Module-Srinivasan.N-19-June-2023 starts*/

    const handleOnSelectChecked = (e, row, type, id) => {
        const { target } = e;
        const template = row.original;
        if (id === 'selection') {
            if (type === 'select') {
                if (target.checked) {
                    setSelectedTemplates((prevSelectedTemplates) => [...prevSelectedTemplates, template]);
                } else {
                    setSelectedTemplates((prevSelectedTemplates) => prevSelectedTemplates.filter((t) => t.productId !== template.productId));
                }
            } else if (type === 'unselect') {
                if (target.checked) {
                    setUnselectedTemplates((prevUnselectedTemplates) => [...prevUnselectedTemplates, template]);
                } else {
                    setUnselectedTemplates((prevUnselectedTemplates) =>
                        prevUnselectedTemplates.filter((t) => t.productId !== template.productId)
                    );
                }
            }
        } else if (id === 'useExistingCharge') {
            setConfirmedTemplateList((prevList) =>
                prevList?.map((item) =>
                    item.productId === template.productId
                        ? { ...item, useExistingCharge: true, useNewCharge: false }
                        : item
                )
            );
            setShowChargeDropdown((prevList) => {
                const updatedList = [...prevList];
                updatedList[row.index] = false;
                return updatedList;
            });

        } else if (id === 'useExistingTerm') {
            setConfirmedTemplateList((prevList) =>
                prevList?.map((item) =>
                    item.productId === template.productId
                        ? { ...item, useExistingTerm: true, useNewTerm: false, }
                        : item
                )
            );

            setShowTermDropdown((prevList) => {
                const updatedList = [...prevList];
                updatedList[row.index] = false;
                return updatedList;
            });
        }

    };

    const validate = (section, schema, data) => {
        try {
            if (section === 'CHARGE') {
                setError({})
            }
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                if (section === 'CHARGE') {
                    setError((prevState) => {
                        return { ...prevState, [err.params.path]: err.message };
                    });
                }
            });
            return e;
        }
    };

    const isSelected = (template) => {
        // console.log(template)
        return selectedTemplates.some((t) => t.productId === template.productId);
    };

    const isUnselected = (template) => {
        return unSelectedTemplates.some((t) => t.productId === template.productId);
    };

    const handleCellRender = (cell, row) => {
        if (cell.column.Header === 'Select') {
            return (
                <div className="custom-control custom-checkbox">
                    <input
                        type="checkbox"
                        id={`unSelectedTemplate${row?.original?.productId}`}
                        name="unSelectedTemplate"
                        className="custom-control-input"
                        checked={isSelected(row.original)}
                        onChange={(e) => handleOnSelectChecked(e, row, 'select', cell.column.id)}
                    />
                    <label className="custom-control-label cursor-pointer" htmlFor={`unSelectedTemplate${row?.original?.productId}`}></label>
                </div>
            );
        } else if (cell.column.id === 'nrcAmount') {
            const productChargesList = row.original.productChargesList
            let updatedChargeAmount = 0;
            let currency = ''
            productChargesList?.map((item) => {
                const { chargeDetails, chargeAmount } = item;
                const { chargeCat, currencyDesc } = chargeDetails;
                currency = currencyDesc.description
                if (chargeCat === "CC_NRC") {
                    updatedChargeAmount = Number(updatedChargeAmount) + Number(chargeAmount);
                }

            });
            return <span>{currency + ' ' + updatedChargeAmount || '-'}</span>;

        } else if (cell.column.id === 'rcAmount') {
            const productChargesList = row.original.productChargesList
            let updatedChargeAmount = 0;
            let currency = ''
            productChargesList?.map((item) => {
                const { chargeDetails, chargeAmount } = item;
                const { chargeCat, currencyDesc } = chargeDetails;
                currency = currencyDesc.description

                if (chargeCat === "CC_RC") {
                    updatedChargeAmount = Number(updatedChargeAmount) + Number(chargeAmount);
                }

            });
            return <span>{currency + ' ' + updatedChargeAmount || '-'}</span>;

        }
        else {
            return <span>{cell.value || '-'}</span>;
        }
    };

    const handleUnmappedCellRender = (cell, row) => {
        if (cell.column.Header === 'Select') {
            return (
                <div className="custom-control custom-checkbox">
                    <input
                        type="checkbox"
                        id={`selectedTemplate${row?.original?.productId}`}
                        name="selectedTemplate"
                        className="custom-control-input"
                        checked={isUnselected(row.original)}
                        onChange={(e) => handleOnSelectChecked(e, row, 'unselect', cell.column.id)}
                    />
                    <label className="custom-control-label cursor-pointer" htmlFor={`selectedTemplate${row?.original?.productId}`}></label>
                </div>
            );
        } else if (cell.column.id === 'useExistingCharge') {
            return (
                <div className="custom-control custom-checkbox">
                    <input
                        type="checkbox"
                        id={`selectedCharge${row?.original?.productId}`}
                        name="selectedCharge"
                        className="custom-control-input"
                        checked={row.original.useExistingCharge}
                        onChange={(e) => handleOnSelectChecked(e, row, 'unselect', cell.column.id)}
                    />
                    <label className="custom-control-label cursor-pointer" htmlFor={`selectedCharge${row?.original?.productId}`}></label>
                </div>
            );
        } else if (cell.column.id === 'useNewCharge') {
            const handleUseNewChargeChange = (e) => {
                const { target } = e;
                const checked = target.checked;
                const productId = row.original.productId;

                setShowChargeDropdown((prevShowChargeDropdown) => {
                    const updatedShowChargeDropdown = [...prevShowChargeDropdown];
                    updatedShowChargeDropdown[row.index] = checked;
                    return updatedShowChargeDropdown;
                });

                setConfirmedTemplateList((prevList) =>
                    prevList?.map((item) =>
                        item.productId === productId ? { ...item, useNewCharge: checked, useExistingCharge: false } : item
                    )
                );

                if (templateData.mappedTemplate && templateData.mappedTemplate?.length > 0) {
                    const confirmedTemplates = []
                    confirmedTemplateList?.map((item) =>
                        item.productId === productId ? confirmedTemplates.push({ ...item, useNewCharge: checked, useExistingCharge: false }) : confirmedTemplates.push(item)
                    )
                    setTemplateData((prevTemplateData) => {
                        const lastMappedTemplate = prevTemplateData.mappedTemplate[prevTemplateData.mappedTemplate?.length - 1];
                        const updatedLastMappedTemplate = {
                            ...lastMappedTemplate,
                            confirmedTemplateList: confirmedTemplates,
                        };

                        const updatedMappedTemplate = [
                            ...prevTemplateData.mappedTemplate.slice(0, prevTemplateData.mappedTemplate?.length - 1),
                            updatedLastMappedTemplate,
                        ];

                        return {
                            ...prevTemplateData,
                            mappedTemplate: updatedMappedTemplate,
                            unMappedTemplate: [...prevTemplateData.unMappedTemplate],
                        };
                    });
                }
            };
            return (
                <div className="custom-control custom-checkbox">
                    <input
                        type="checkbox"
                        id={`selectedNewCharge${row?.original?.productId}`}
                        name="selectedNewCharge"
                        className="custom-control-input"
                        checked={row.original.useNewCharge}
                        onChange={handleUseNewChargeChange}
                    />
                    <label className="custom-control-label cursor-pointer" htmlFor={`selectedNewCharge${row?.original?.productId}`}></label>
                </div>
            );
        } else if (cell.column.id === 'nrcAmount') {
            const productChargesList = row.original.productChargesList
            let updatedChargeAmount = 0, currency = '', chargeType = '', chargeAmount = 0, currencyDesc
            productChargesList?.map((item) => {
                // if(item.productId == row.original.productId){
                //     if(!item.objectReferenceId){
                // console.log(mode, item.objectType , data.entityType , item.objectReferenceId , objectReferenceId.current)

                if (mode == 'ADD') {
                    chargeType = item.chargeDetails ? item.chargeDetails.chargeCat : item.chargeType
                    chargeAmount = item.chargeAmount
                    currencyDesc = item.chargeDetails ? item.chargeDetails.currencyDesc.description : item.currencyDesc
                    currency = currencyDesc || item.currency

                    if (chargeType === "CC_NRC") {
                        updatedChargeAmount = Number(updatedChargeAmount) + Number(chargeAmount);
                    }
                }
                if (mode == 'EDIT' && item.objectType == null && item.objectReferenceId == null) {
                    chargeType = item.chargeDetails ? item.chargeDetails.chargeCat : item.chargeType
                    chargeAmount = item.chargeAmount
                    currencyDesc = item.chargeDetails ? item.chargeDetails.currencyDesc.description : item.currencyDesc
                    currency = currencyDesc || item.currency

                    if (chargeType === "CC_NRC") {
                        updatedChargeAmount = Number(updatedChargeAmount) + Number(chargeAmount);
                    }
                }
                //     }
                // }
            });
            return <span>{currency + ' ' + updatedChargeAmount || '-'}</span>;

        } else if (cell.column.id === 'rcAmount') {
            const productChargesList = row.original.productChargesList
            let updatedChargeAmount = 0, currency = '', chargeType = '', chargeAmount = 0, currencyDesc
            productChargesList?.map((item) => {
                // if(item.productId == row.original.productId){
                //     if(!item.objectReferenceId){
                if (mode == 'ADD') {
                    chargeType = item.chargeDetails ? item.chargeDetails.chargeCat : item.chargeType
                    chargeAmount = item.chargeAmount
                    currencyDesc = item.chargeDetails ? item.chargeDetails.currencyDesc.description : item.currencyDesc
                    currency = currencyDesc || item.currency

                    if (chargeType === "CC_RC") {
                        updatedChargeAmount = Number(updatedChargeAmount) + Number(chargeAmount);
                    }
                }
                if (mode == 'EDIT' && item.objectType == null && item.objectReferenceId == null) {
                    chargeType = item.chargeDetails ? item.chargeDetails.chargeCat : item.chargeType
                    chargeAmount = item.chargeAmount
                    currencyDesc = item.chargeDetails ? item.chargeDetails.currencyDesc.description : item.currencyDesc
                    currency = currencyDesc || item.currency

                    if (chargeType === "CC_RC") {
                        updatedChargeAmount = Number(updatedChargeAmount) + Number(chargeAmount);
                    }
                }
                //     }
                // }
            });
            return <span>{currency + ' ' + updatedChargeAmount || '-'}</span>;

        } else if (cell.column.id === 'newNrcAmount') {
            let updatedChargeAmount = 0, currency = '', chargeType = '', chargeAmount = 0, currencyDesc

            if (data.entityType !== 'TMC_PROMOCODE') {
                const productChargesList = row.original.newChargeList && row.original.newChargeList?.length > 0 ?
                    row.original.newChargeList : row.original.productChargesList

                productChargesList?.map((item) => {

                    if (mode == 'ADD') {
                        chargeType = item.chargeDetails ? item.chargeDetails.chargeCat : item.chargeType
                        chargeAmount = item.chargeAmount
                        currencyDesc = item.chargeDetails ? item.chargeDetails.currencyDesc.description : item.currencyDesc
                        currency = currencyDesc || item.currency

                        if (chargeType === "CC_NRC") {
                            updatedChargeAmount = Number(updatedChargeAmount) + Number(chargeAmount);
                        }
                    }
                    if (mode == 'EDIT' && item.objectType == data.entityType && item.objectReferenceId == objectReferenceId.current) {
                        chargeType = item.chargeDetails ? item.chargeDetails.chargeCat : item.chargeType
                        chargeAmount = item.chargeAmount
                        currencyDesc = item.chargeDetails ? item.chargeDetails.currencyDesc.description : item.currencyDesc
                        currency = currencyDesc || item.currency

                        if (chargeType === "CC_NRC") {
                            updatedChargeAmount = Number(updatedChargeAmount) + Number(chargeAmount);
                        }
                    }
                })
            }

            return <span>{currency + ' ' + updatedChargeAmount || '-'}</span>;

        } else if (cell.column.id === 'newRcAmount') {
            let updatedChargeAmount = 0, currency = '', chargeType = '', chargeAmount = 0, currencyDesc

            if (data.entityType !== 'TMC_PROMOCODE') {
                const productChargesList = row.original.newChargeList && row.original.newChargeList?.length > 0 ?
                    row.original.newChargeList : row.original.productChargesList

                productChargesList?.map((item) => {
                    if (mode == 'ADD') {
                        chargeType = item.chargeDetails ? item.chargeDetails.chargeCat : item.chargeType
                        chargeAmount = item.chargeAmount
                        currencyDesc = item.chargeDetails ? item.chargeDetails.currencyDesc.description : item.currencyDesc
                        currency = currencyDesc || item.currency

                        if (chargeType === "CC_RC") {
                            updatedChargeAmount = Number(updatedChargeAmount) + Number(chargeAmount);
                        }
                    }
                    if (mode == 'EDIT' && item.objectType == data.entityType && item.objectReferenceId == objectReferenceId.current) {
                        chargeType = item.chargeDetails ? item.chargeDetails.chargeCat : item.chargeType
                        chargeAmount = item.chargeAmount
                        currencyDesc = item.chargeDetails ? item.chargeDetails.currencyDesc.description : item.currencyDesc
                        currency = currencyDesc || item.currency

                        if (chargeType === "CC_RC") {
                            updatedChargeAmount = Number(updatedChargeAmount) + Number(chargeAmount);
                        }
                    }
                })
            }

            // if (data.entityType === 'TMC_PROMOCODE') {
            //     const chargeDetails = [];

            //     templateData.mappedTemplate.forEach((mt) => {
            //         if (!mt.templateMap) {
            //             mt.promoHdr.forEach((ph) => {
            //                 chargeDetails.push(ph.chargeDet);
            //             });
            //         }
            //     });
            //     chargeDetails?.map((item) => {
            //         console.log('item====', item[0].currencyDesc.description)
            //         chargeType = item[0].chargeType ? item[0].chargeType : item[0].chargeCat
            //         chargeAmount = item[0].chargeAmount
            //         currencyDesc = item[0].chargeDetails ? item[0].chargeDetails.currencyDesc.description : item[0].currencyDesc.description ? item[0].currencyDesc.description : item[0].currencyDesc
            //         currency = currencyDesc

            //         if (chargeType === "CC_RC") {
            //             updatedChargeAmount = Number(updatedChargeAmount) + Number(chargeAmount);
            //         }
            //     })
            // }
            return <span>{currency + ' ' + updatedChargeAmount || '-'}</span>;

        } else if (cell.column.id === 'createNewCharge' && data.entityType === 'TMC_PRODUCTBUNDLE') {
            const handleChargeName = (e) => {
                const { target } = e;
                const tvalue = target.value;
                setChargeName(tvalue)
                setChargeNameList((prevChargeName) => {
                    const updatedChargeName = [...prevChargeName];
                    updatedChargeName[row.index] = tvalue;
                    return updatedChargeName;
                });

            };
            return (
                showChargeDropdown[row.index] === true &&
                <div className="col-12 pt-0 pl-0 pb-0 row ml-0">
                    <div className="col-md-8 pl-0">
                        <div className="form-group">
                            <div className="input-group">
                                <select className="form-control" value={chargeNameList[row.index] || ""}
                                    onChange={handleChargeName}
                                >
                                    <option value="">Select..</option>
                                    {
                                        chargeNameLookup && chargeNameLookup?.map((charge, key) => {
                                            if (charge.serviceType == row.original.serviceType) {

                                                return (<option key={key} value={charge.chargeId}>{charge.chargeName}</option>)

                                            }
                                        }
                                        )
                                    }
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-2 pl-0 mt-0">
                        <button type="button" className="btn btn-primary btn-sm waves-effect waves-light ml-2" disabled={false}
                            onClick={() => {
                                setSelectedProductId(row?.original?.productId)
                                setChargeMode('ADD')
                                handleChargeNameSearch('ADD')
                            }}
                        >
                            +
                        </button>
                    </div>
                </div>

            );
        } else if (cell.column.id === 'addedCharges') {
            return (
                showChargeDropdown[row.index] === true &&
                    confirmedTemplateList ? confirmedTemplateList?.map((val) =>
                        val.productId === row?.original?.productId ? (
                            val?.newChargeList?.map((m, i) => (
                                <React.Fragment key={i}>
                                    <div className="col-md-2 pl-0 mt-0">
                                        <a href="javascript:void(0)" onClick={() => {
                                            setSelectedProductId(row?.original?.productId)
                                            setChargeMode('EDIT')
                                            handleChargeNameSearch('EDIT', m)
                                        }}>{m.chargeName || "-"}</a>
                                    </div>
                                    <br />
                                </React.Fragment>
                            ))) : null
                    ) : <span>{"-"}</span>
            );
        } else if (cell.column.id === 'useExistingTerm') {
            return (
                <div className="custom-control custom-checkbox">
                    <input
                        type="checkbox"
                        id={`selectedTerm${row?.original?.productId}`}
                        name="selectedTerm"
                        className="custom-control-input"
                        checked={row.original.useExistingTerm}
                        onChange={(e) => handleOnSelectChecked(e, row, 'unselect', cell.column.id)}
                    />
                    <label className="custom-control-label cursor-pointer" htmlFor={`selectedTerm${row?.original?.productId}`}></label>
                </div>
            );
        } else if (cell.column.id === 'useNewTerm') {
            const handleUseNewTermChange = (e) => {
                const { target } = e;
                const checked = target.checked;
                const productId = row.original.productId;
                setShowTermDropdown((prevShowTermDropdown) => {
                    const updatedShowTermDropdown = [...prevShowTermDropdown];
                    updatedShowTermDropdown[row.index] = checked;
                    return updatedShowTermDropdown;
                });

                // Update the useNewCharge property in the template object
                setConfirmedTemplateList((prevList) =>
                    prevList?.map((item) =>
                        item.productId === productId ? { ...item, useNewTerm: checked, useExistingTerm: false } : item
                    )
                );

                if (templateData.mappedTemplate && templateData.mappedTemplate?.length > 0) {
                    const confirmedTemplates = []
                    confirmedTemplateList?.map((item) =>
                        item.productId === productId ? confirmedTemplates.push({ ...item, useNewTerm: checked, useExistingTerm: false }) : confirmedTemplates.push(item)
                    )
                    setTemplateData((prevTemplateData) => {
                        const lastMappedTemplate = prevTemplateData.mappedTemplate[prevTemplateData.mappedTemplate?.length - 1];
                        const updatedLastMappedTemplate = {
                            ...lastMappedTemplate,
                            confirmedTemplateList: confirmedTemplates,
                        };

                        const updatedMappedTemplate = [
                            ...prevTemplateData.mappedTemplate.slice(0, prevTemplateData.mappedTemplate?.length - 1),
                            updatedLastMappedTemplate,
                        ];

                        return {
                            ...prevTemplateData,
                            mappedTemplate: updatedMappedTemplate,
                            unMappedTemplate: [...prevTemplateData.unMappedTemplate],
                        };
                    });
                }
            }
            return (
                <div className="custom-control custom-checkbox">
                    <input
                        type="checkbox"
                        id={`selectedNewTerm${row?.original?.productId}`}
                        name="selectedNewTerm"
                        className="custom-control-input"
                        checked={row.original.useNewTerm}
                        onChange={handleUseNewTermChange}
                    />
                    <label className="custom-control-label cursor-pointer" htmlFor={`selectedNewTerm${row?.original?.productId}`}></label>
                </div>
            );
        } else if (cell.column.id === 'createNewTerm' && data.entityType === 'TMC_PRODUCTBUNDLE') {
            return (
                showTermDropdown[row.index] === true && <div className="col-12 pt-2 pl-0 pb-2 row ml-1">
                    <div className="form-group">
                        <div className="input-group">
                            <ReactSelect
                                className="w-100"
                                menuPortalTarget={document.body}
                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                options={termsAndConditionLookup}
                                value={terms[row.index] || []}
                                isMulti={true}
                                onChange={(val) => {
                                    const updatedTerms = [...terms];
                                    updatedTerms[row.index] = val;
                                    setTerms(updatedTerms);
                                    const termsList = val?.map(m => m?.value)
                                    setConfirmedTemplateList((prevList) =>
                                        prevList?.map((item) =>
                                            item.productId === row?.original?.productId ? { ...item, termsId: termsList } : item
                                        )
                                    );
                                }}
                            />
                        </div>
                    </div>
                </div>
            );
        }
        else {
            return <span>{cell.value || '-'}</span>;
        }
    };

    const handleOnSelectConfirmWorkflowTemplate = () => {
        // setConfirmedTemplateList(selectedTemplates);
        setConfirmedTemplateList((prevList) => [
            ...prevList,
            ...selectedTemplates?.map((template) => ({
                ...template,
                useExistingCharge: true,
                useExistingTerm: true,
                useNewCharge: false,
                useNewTerm: false,
                newChargeList: [],
                termsId: []
            }))
        ]);
        setChargeList([])
        setTerms([])
        setChargeName('')
        setTemplateList((prevTemplateList) =>
            prevTemplateList.filter((template) => !selectedTemplates.some((selected) => selected.productId === template.productId))
        );

        if (templateData.mappedTemplate && templateData.mappedTemplate?.length > 0) {
            setTemplateData((prevTemplateData) => {
                const lastMappedTemplate = prevTemplateData.mappedTemplate[prevTemplateData.mappedTemplate?.length - 1];
                const updatedLastMappedTemplate = {
                    ...lastMappedTemplate,
                    confirmedTemplateList: selectedTemplates,
                };

                const updatedMappedTemplate = [
                    ...prevTemplateData.mappedTemplate.slice(0, prevTemplateData.mappedTemplate?.length - 1),
                    updatedLastMappedTemplate,
                ];

                return {
                    ...prevTemplateData,
                    mappedTemplate: updatedMappedTemplate,
                    unMappedTemplate: [...prevTemplateData.unMappedTemplate],
                };
            });
        }

        setShowChargeDropdown((prevList) => {
            const updatedList = [...prevList];
            const rowIndex = confirmedTemplateList?.length + selectedTemplates?.length - 1;
            updatedList[rowIndex] = false;
            return updatedList;
        });
        setSelectedTemplates([])
        setUnselectedTemplates([])

    };

    const handleOnUnSelectConfirmWorkflowTemplate = () => {
        const remainingSelectedTemplates = confirmedTemplateList.filter(
            (selected) => !unSelectedTemplates.some((template) => template.productId === selected.productId)
        );
        setUnselectedTemplates((prevUnselectedTemplates) =>
            prevUnselectedTemplates.filter((template) => !selectedTemplates.some((selected) => selected.productId === template.productId))
        );

        setConfirmedTemplateList(remainingSelectedTemplates);
        setSelectedTemplates(remainingSelectedTemplates);

        setTemplateList((prevTemplateList) => [...unSelectedTemplates, ...prevTemplateList]);
        if (templateData.mappedTemplate && templateData.mappedTemplate?.length > 0) {
            setTemplateData((prevTemplateData) => {
                const lastMappedTemplate = prevTemplateData.mappedTemplate[prevTemplateData.mappedTemplate?.length - 1];
                const updatedLastMappedTemplate = {
                    ...lastMappedTemplate,
                    confirmedTemplateList: remainingSelectedTemplates,
                };

                const updatedMappedTemplate = [
                    ...prevTemplateData.mappedTemplate.slice(0, prevTemplateData.mappedTemplate?.length - 1),
                    updatedLastMappedTemplate,
                ];

                return {
                    ...prevTemplateData,
                    mappedTemplate: updatedMappedTemplate,
                    unMappedTemplate: [...prevTemplateData.unMappedTemplate],
                };
            });
        }
        setSelectedTemplates([])
        setUnselectedTemplates([])

    };

    const handleLoadConfirmedTemplateList = (e) => {
        // console.log('eeeeee', e)
        const templateList = e.confirmedTemplateList ? e.confirmedTemplateList?.map(m => m) : []
        setSelectedTemplates(templateList)
        setConfirmedTemplateList(templateList);
        setTemplateList((prevTemplateList) =>
            prevTemplateList.filter((template) => !templateList.some((selected) => selected.productId === template.productId))
        );
    }
    /* JIRAID:dtWorks-275-Product Bundle Module-Srinivasan.N-19-June-2023 ends */
    // console.log('confirmedTemplateList ', confirmedTemplateList)
    // console.log('templateData', templateData)

    const getMappedTemplateCats = () => {
        return (
            templateMapCategory.find(f => f.value === data.entityType)?.mapping?.templateCats?.map((tempCat) => (
                <div className="col-md-3" key={tempCat}>
                    <div className="skel-map-templ-data">
                        <span className="skel-map-title">{templateCategories?.find(x => x.value == tempCat)?.label}</span>
                        {
                            templateData.mappedTemplate && templateData.mappedTemplate?.map((e, i) => (
                                (e.templateCategory ? e.templateCategory : e.templateMst.templateCategory) === tempCat &&
                                <div key={i}>
                                    <div className="skel-templ-cust-ht" onClick={() => {
                                        if (['TMC_PRODUCTBUNDLE', 'TMC_PROMOCODE', 'TMC_TERMSCONDITION'].includes(data.entityType)) {
                                            handleLoadConfirmedTemplateList(e);
                                        }
                                    }}>
                                        <div className="skel-templ-details">
                                            <div className="skel-templ-id">
                                                <i className={`fa fa-times mr-1`} onClick={() => handleTemplateSelection(e, 'UNSELECT')}></i>
                                                {["TC_EMAIL", "TC_SMS", "TC_WHATSAPP"].includes(e?.templateCategory ? e?.templateCategory : e?.templateMst?.templateCategory) && (
                                                    <i className={`fa fa-eye mr-1`} onClick={() => previewTemplateContent(e)}></i>
                                                )}
                                                {(e.templateNo ? e.templateNo : e.templateMst.templateNo)}
                                            </div>
                                            <div className="skel-templ-name">{(e.templateName ? e.templateName : e.templateMst.templateName)}</div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                        <div className="skel-templ-cust-ht skel-add-templ">
                            <div className="skel-create" data-target="#addappt-modal" data-toggle="modal">
                                <i className="material-icons" onClick={(e) => { setOpenMapTemplateModal(true); setTemplateCategory(tempCat) }}>add</i>
                            </div>
                        </div>
                    </div>
                </div>
            ))
        )
    }

    const checkCondition = (val, type = "mapped") => {
        let condition;
        let incomingTC = val?.templateCategory ? val?.templateCategory : val?.templateMst?.templateCategory;
        let incomingEntity = val?.entity ? val?.entity : val?.templateMst?.entity;
        let selectedEntity = data.entityType === "TMC_APPOINT" ? data.tranEntity : data.entityType;
        console.log(val);
        console.log({ incomingTC, incomingEntity, selectedEntity })
        if (type == "mapped") {
            condition = !val.templateMap && incomingTC === templateCategory;
        } else {
            condition = incomingTC === templateCategory;
        }
        
        if(["TC_EMAIL", "TC_SMS", "TC_WHATSAPP"].includes(incomingTC)) {
            condition = condition && incomingEntity == selectedEntity
        }

        return condition;
    }

    const [previewTemplate, setPreviewTemplate] = useState({ show: false, content: "" });
    const previewTemplateContent = (val) => {
        const content = val?.notificationTemplate?.body;
        setPreviewTemplate({ show: true, content: content });
    }

    const closePreview = () => {
        setPreviewTemplate({ show: false, content: "" });
    }

    const createMarkup = (html) => {
        return {
            __html: DOMPurify.sanitize(html)
        }
    }

    return (
        <div className="customer-skel">
            <div className="cmmn-skeleton">
                <div className="row">
                    <div className="col-md-4">
                        <div className="skel-create-template-base">
                            <img src={icon} alt="" className="img-fluid" />
                        </div>
                    </div>
                    <div className="col-md-8 mt-2">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label htmlFor="entityType" className="control-label">Type of Entity<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                    <div className="">
                                        <select className="form-control" id="entityType" value={data.entityType}
                                            disabled={(mode == 'EDIT')} onChange={handleOnChangeEntity}
                                        >
                                            {/* JIRAID:dtWorks-275-Product Bundle Module-Srinivasan.N-19-June-2023 */}
                                            <option value="">Select...</option>
                                            {
                                                templateMapCategory?.map((val, key) => (
                                                    <option key={key} value={val.value}>{val.label}</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                </div>
                            </div>
                            {["TMC_APPOINT"].includes(data.entityType) && (
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label htmlFor="tranEntity" className="control-label">Transaction Entity<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                        <div className="">
                                            <select className="form-control" id="tranEntity" value={data.tranEntity}
                                                disabled={(mode == 'EDIT')} onChange={handleOnChangeEntity}
                                            >
                                                <option value="">Select...</option>
                                                <option value={"TMC_INTERACTION"}>Interaction</option>
                                                <option value={"TMC_ORDER"}>Order</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {data.entityType &&
                            <React.Fragment>
                                <div className="row">
                                    {(['TMC_INTERACTION', 'TMC_ORDER'].includes(data.entityType) || ['TMC_INTERACTION', 'TMC_ORDER'].includes(data.tranEntity)) &&
                                        <React.Fragment>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label htmlFor="Interactiontype" className="control-label">{templateMapCategory.find(f => f.value === (data.entityType == "TMC_APPOINT" ? data.tranEntity : data.entityType))?.label} Category <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                    <div className="">
                                                        <MultiSelect
                                                            disabled={(mode == 'EDIT')}
                                                            options={categories?.length > 0 ? categories : []}
                                                            value={selectedCategory?.length > 0 ? selectedCategory : []}
                                                            onChange={setSelectedCategory}
                                                            labelledBy="Select Columns"
                                                            className="skel-temp-mulit-dropdown"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label htmlFor="Interactiontype" className="control-label">{templateMapCategory.find(f => f.value === (data.entityType == "TMC_APPOINT" ? data.tranEntity : data.entityType))?.label} Type <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                    <div className="">
                                                        <MultiSelect
                                                            disabled={(mode == 'EDIT')}
                                                            options={types?.length > 0 ? types : []}
                                                            value={selectedType?.length > 0 ? selectedType : []}
                                                            onChange={setSelectedType}
                                                            labelledBy="Select Columns"
                                                            className="skel-temp-mulit-dropdown"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    }
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="Servicetype" className="control-label">Service Category <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <div className="">
                                                <MultiSelect
                                                    disabled={(mode == 'EDIT')}
                                                    options={serviceCategories?.length > 0 ? serviceCategories : []}
                                                    value={selectedServiceCat?.length > 0 ? selectedServiceCat : []}
                                                    onChange={
                                                        (e) => {
                                                            // console.log(e)
                                                            handleOnChangeServiceCat(e)
                                                            setSelectedServiceCat(e)
                                                        }
                                                    }
                                                    labelledBy="Select Columns"
                                                    className="skel-temp-mulit-dropdown"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="Servicetype" className="control-label">Service Type <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <div className="">
                                                <MultiSelect
                                                    disabled={(mode == 'EDIT')}
                                                    options={serviceTypes?.length > 0 ? serviceTypes : []}
                                                    value={selectedServiceType?.length > 0 ? selectedServiceType : []}
                                                    onChange={setSelectedServiceType}
                                                    labelledBy="Select Columns"
                                                    className="skel-temp-mulit-dropdown"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="Channel" className="control-label">Customer Category <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <div className="">
                                                <MultiSelect
                                                    disabled={(mode == 'EDIT')}
                                                    options={customerCategories?.length > 0 ? customerCategories : []}
                                                    value={selectedCustomerCat?.length > 0 ? selectedCustomerCat : []}
                                                    onChange={setSelectedCustomerCat}
                                                    labelledBy="Select Columns"
                                                    className="skel-temp-mulit-dropdown"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {
                                        ['TMC_INTERACTION', 'TMC_ORDER', 'TMC_APPOINT'].includes(data.entityType) &&
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="Priority" className="control-label">Priority <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                <div className="">
                                                    <MultiSelect
                                                        disabled={(mode == 'EDIT')}
                                                        options={priorities?.length > 0 ? priorities : []}
                                                        value={selectedPriority?.length > 0 ? selectedPriority : []}
                                                        onChange={setSelectedPriority}
                                                        labelledBy="Select Columns"
                                                        className="skel-temp-mulit-dropdown"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    }
                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label htmlFor="status" className="control-label">Status <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <div className="">
                                                <Switch checked={templateStatus}
                                                    onChange={(e) => {
                                                        setTemplateStatus(!templateStatus)
                                                        setTemplateData({
                                                            ...templateData,
                                                            status: e === false ? 'IN' : 'AC'
                                                        });

                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="">
                                            <button className="skel-btn-submit" onClick={findTemplateMapping}>Show templates to map</button>
                                        </div>
                                    </div>
                                </div>
                            </React.Fragment>
                        }
                    </div>
                </div>
                <hr className="cmmn-hline" />
                {showMapSection &&
                    <div className="skel-map-template mt-2">
                        <span className="skel-profile-heading">Map Template</span>
                        <div className="row mt-4">
                            {getMappedTemplateCats()}
                        </div>
                    </div>
                }
                {['TMC_PRODUCTBUNDLE', 'TMC_PROMOCODE', 'TMC_TERMSCONDITION'].includes(data.entityType) &&
                    <section>
                        <div className='row'>
                            <div className="col-md-5">
                                <DynamicTable
                                    row={templateList}
                                    header={AddEditMapProductTemplateColumns}
                                    rowCount={templateListCount}
                                    itemsPerPage={perPage}
                                    backendPaging={true}
                                    backendCurrentPage={currentPage}
                                    handler={{
                                        handleCellRender: handleCellRender,
                                        handlePageSelect: handlePageSelect,
                                        handleItemPerPage: setPerPage,
                                        handleCurrentPage: setCurrentPage,
                                    }}
                                />
                            </div>
                            <div className="col-md-1" style={{ maxWidth: "45px", paddingTop: "150px" }}>
                                <a onClick={handleOnSelectConfirmWorkflowTemplate} ><i className="fas fa-arrow-circle-right text-primary" style={{ fontSize: "30px" }}></i></a>
                                <a onClick={handleOnUnSelectConfirmWorkflowTemplate} ><i className="fas fa-arrow-circle-left text-primary" style={{ fontSize: "30px" }}></i></a>
                            </div>
                            <div className="col-md-6">
                                <DynamicTable
                                    row={confirmedTemplateList && confirmedTemplateList?.length > 0 ? confirmedTemplateList : []}
                                    header={data.entityType === "TMC_PRODUCTBUNDLE" ? SelectConfirmProductMappingTemplateColumns : ConfirmProductMappingTemplateColumnsPromo}
                                    rowCount={confirmedTemplateList && confirmedTemplateList?.length > 0 ? confirmedTemplateList?.length : 0}
                                    itemsPerPage={10}
                                    backendPaging={false}
                                    handler={{
                                        handleCellRender: handleUnmappedCellRender
                                    }}
                                />
                            </div>
                        </div>
                    </section>
                }
                {showChargePopup &&
                    <AddEditChargeModal
                        data={{
                            chargeList: chargeList,
                            isOpen: showChargePopup,
                            chargeData: chargeData,
                            error,
                            mode: 'create',
                        }}
                        handler={{
                            setIsOpen: setShowChargePopup,
                            setChargeData: setChargeData,
                            setError: setError,
                            setChargeList: setChargeList,
                            validate: validate
                        }}
                    />
                }
                {
                    <Modal isOpen={openMapTemplateModal}>
                        <div className="modal-content">
                            <div className="modal-header px-4 border-bottom-0 d-block">
                                <button type="button" className="close" data-dismiss="modal" onClick={() => {
                                    setOpenMapTemplateModal(false)
                                }}
                                    aria-hidden="true">&times;</button>
                                <h5 className="modal-title">Map Template</h5>
                            </div>
                            <div className="modal-body px-4">
                                <div className="row">
                                    <div className="col-md-7">
                                        <div className="container-two-row">
                                            <div className="skel-plans skel-map-plans-template">
                                                {
                                                    templateData.unMappedTemplate && templateData.unMappedTemplate?.map((val, idx) => (checkCondition(val, "unmapped") &&
                                                        <div key={idx} className="skel-templ-cust-ht skel-plans-product skel-plan">
                                                            <label className="premium-plan" forhtml={"unmap" + idx}>
                                                                <div className="skel-templ-details">
                                                                    <div className="skel-templ-id">
                                                                        {["TC_EMAIL", "TC_SMS", "TC_WHATSAPP"].includes(val?.templateCategory ? val?.templateCategory : val?.templateMst?.templateCategory) && (
                                                                            <i className={`fa fa-eye mr-1`} onClick={() => previewTemplateContent(val)}></i>
                                                                        )}
                                                                        {(val.templateNo ? val.templateNo : val.templateMst.templateNo)}
                                                                    </div>
                                                                    <div className="skel-templ-name">{(val.templateName ? val.templateName : val.templateMst.templateName)}</div>
                                                                    <img src={rhtexchange} className="skel-pos-ab-img" name={"unmap" + idx} id={"unmap" + idx} onClick={(e) => {
                                                                        handleTemplateSelection(val, 'SELECT')
                                                                    }} />
                                                                </div>
                                                            </label>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-1 skel-exch-img">
                                        <img src={exchangetemp} />
                                    </div>
                                    <div className="col-md-4">
                                        <div className="skel-drag-prodt">
                                            <span className="skel-heading">Mapped Templates</span>
                                            <div className="skel-plans">
                                                { /*console.log('templateData.mappedTemplate===', templateData.mappedTemplate) */}
                                                {
                                                    templateData.mappedTemplate && templateData.mappedTemplate?.length > 0
                                                    && templateData.mappedTemplate?.map((val, idx) => (checkCondition(val, "mapped") &&
                                                        <div key={idx} style={{ width: "100%" }} className="skel-templ-cust-ht skel-plans-product skel-plan">
                                                            <label className="premium-plan" forhtml={"map" + idx}>
                                                                <div className="skel-templ-details">
                                                                    <div className="skel-templ-id">
                                                                        {["TC_EMAIL", "TC_SMS", "TC_WHATSAPP"].includes(val?.templateCategory ? val?.templateCategory : val?.templateMst?.templateCategory) && (
                                                                            <i className={`fa fa-eye mr-1`} onClick={() => previewTemplateContent(val)}></i>
                                                                        )}
                                                                        {(val?.templateNo ? val?.templateNo : val?.templateMst?.templateNo)}
                                                                    </div>
                                                                    <div className="skel-templ-name">{(val?.templateName ? val?.templateName : val?.templateMst?.templateName)}</div>
                                                                    <img src={lftexchange} className="skel-pos-ab-img" name={"map" + idx} id={"map" + idx} onClick={(e) => {
                                                                        handleTemplateSelection(val, 'UNSELECT')
                                                                    }} />
                                                                </div>
                                                            </label>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer d-flex mt-2 justify-content-center">
                                <button type="button" className="skel-btn-cancel" onClick={() => { setOpenMapTemplateModal(false) }} data-dismiss="modal">Close</button>
                                {/* <button type="submit" className="skel-btn-submit" id="btn-save-event">Submit</button> */}
                            </div>
                        </div>
                    </Modal>
                }
            </div>
            <div className="skel-pg-bot-sect-btn">
                <span>Now map any combinations with your preffered template !!</span>
                <div className="skel-btn-sect">
                    {/* <button className="skel-btn-cancel">Cancel</button> */}
                    <button className="skel-btn-submit" onClick={handleSubmit}>{mode === 'COPY' ? 'Clone Template' : mode === 'EDIT' ? 'Edit Template' : 'Map Template'}</button>
                </div>
            </div>
            <ReactModal show={previewTemplate?.show} onHide={closePreview} dialogClassName="wsc-cust-mdl-temp-prev">
                <ReactModal.Header>
                    <ReactModal.Title>Content</ReactModal.Title>
                    <CloseButton onClick={closePreview} style={{ backgroundColor: 'transparent', fontWeight: 700, color: '#373737', fontSize: '1.5rem' }}>
                        <span>×</span>
                    </CloseButton>
                </ReactModal.Header>
                <ReactModal.Body>
                    <React.Fragment><div dangerouslySetInnerHTML={createMarkup(previewTemplate?.content ?? "")} /></React.Fragment>
                </ReactModal.Body>
                <ReactModal.Footer style={{ display: 'block' }}>
                    <div className="skel-btn-center-cmmn">
                        <button type="button" className="skel-btn-cancel" onClick={closePreview}>Close</button>
                    </div>
                </ReactModal.Footer>
            </ReactModal>
        </div>
    )
}

export default MapTemplateForm