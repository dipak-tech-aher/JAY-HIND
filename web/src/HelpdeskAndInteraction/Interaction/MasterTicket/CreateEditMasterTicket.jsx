/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useRef, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { useTranslation } from "react-i18next";
import { toast } from 'react-toastify';
import { object, string } from 'yup';

import { properties } from '../../../properties';
import { get, post, put } from "../../../common/util/restUtil";
import CreateEditMasterTicketDetails from './CreateEditMasterTicketDetails';
import MasterTicketSettings from './MasterTicketSettings';
import PreviewValidate from './PreviewValidate';
import AddChildTickets from './SearchAndImport/AddChildTickets';
import SubmitMasterTicket from './SubmitMasterTicket';

const CreateEditMasterTicket = (props) => {
    const { intialValue } = props?.data
    const { t } = useTranslation()
    const tabs = [
        {
            Add: 'Ticket Details',
            Edit: 'Edit Ticket Details',
            index: 0,
        },
        {
            Add: 'Add Child Tickets',
            Edit: 'Edit Child Tickets',
            index: 1,
        },
        {
            Add: 'Preview / Validate',
            Edit: 'Preview / Validate',
            index: 2,
        }, {
            Add: 'Settings',
            Edit: 'Settings',
            index: 3,
        },
        {
            Add: 'Submit',
            Edit: 'Submit',
            index: 4,
        }
    ];
    const lookupData = useRef()
    const addressLookup = useRef({})
    const [countries, setCountries] = useState()
    const [activeTab, setActiveTab] = useState(tabs[0]);
    const [kampongLookup, setKampongLookup] = useState([])
    const [districtLookup, setDistrictLookup] = useState([])
    const [postCodeLookup, setPostCodeLookup] = useState([])
    const [priorityLookup, setPriorityLookup] = useState([]);
    const [servcieTypeLookup, setServiceTypeLookup] = useState([]);
    const [problemCodeLookup, setProblemCodeLookup] = useState([]);
    const [ticketSourceLookup, setTicketSourceLookup] = useState([]);
    const [interactionLookup, setInteractionLookup] = useState([]);
    const [addressLookUpRef, setAddressLookUpRef] = useState(null)
    const [organization, setOrganization] = useState([])
    const [department, setDepartment] = useState([])
    const [role, setRole] = useState([])
    const departmentRef = useRef()
    const organisationRef = useRef()
    const roleRef = useRef()
    const [masterTicketDataError, setMasterTicketDataError] = useState({})
    const [masterTicketData, setMasterTicketData] = useState({
        title: "",
        description: "",
        ouId: "",
        entityId: "",
        userId: "",
        serviceType: "",
        problemCode: "",
        priorityCode: "",
        ticketSource: "",
        hno: "",
        buildingName: "",
        street: "",
        city: "",
        district: "",
        state: "",
        postCode: "",
        country: "",
        roleId: "",
        replyToChildTicket: "",
        editTicket: "",
        closeAllChildTicket: "",
        closeMasterTicket: ""
    })
    const [masterTicketId, setMasterTicketId] = useState()
    const [masterTicketDetails, setMasterTicketDetails] = useState()

    //Add Child Tickets - Import
    const [uploadTemplateList, setUploadTemplateList] = useState({
        uploadList: [],
        rejectedList: [],
        finalList: [],
        extraList: []
    })
    const [templateUploadCounts, setTemplateUploadCounts] = useState({
        success: 0,
        failed: 0,
        total: 0
    })
    const [templateStatusFlags, setTemplateStatusFlags] = useState({
        validateCheck: false,
        showErrorCheck: false,
        proceedCheck: false
    })
    const [childTicketChoice, setChildTicketChoice] = useState('search')
    const [file, setFile] = useState()
    const [fileName, setFileName] = useState("")
    const [uploadStatusResponse, setUploadStatusResponse] = useState()
    const [showImportantInstruction, setShowImportantInstruction] = useState(true)

    //Add Child Tickets - Search
    const [childTicketData, setChildTicketData] = useState()
    const [totalCount, setTotalCount] = useState(0);
    const [selectedMappedChildTicketIdList, setSelectedMappedChildTicketIdList] = useState([])
    const [deleteChildTicketIdList, setDeleteChildTicketIdList] = useState([])


    /**
     * Validation Schema for Ticket Details
     */
    const validationSchema = object().shape({
        title: string().required("Title is required"),
        description: string().required("Description is required"),
        ouId: string().required("Operational Unit is required"),
        entityId: string().required("Department is required"),
        // userId: string().required("User is required"),
        serviceType: string().required("Service Type is required"),
        problemCode: string().required("Problem Code is required"),
        priorityCode: string().required("Priority is required"),
        ticketSource: string().required("Ticket Source is required"),
        // hno: string().required("Flat/House/Unit No is required"),
        // buildingName: string().required("Building Name/Others is required"),
        street: string().required("Street/ Area is required"),
        city: string().required("City/ Town is required"),
        district: string().required("District is required"),
        state: string().required("State is required"),
        postCode: string().required("PostalCode is required"),
        country: string().required("Country is required"),
        roleId: string().required("Role is Required")
    })

    /**
     * Handle Intial Data API Call
     */
    useEffect(() => {
        
        get(properties.ORGANIZATION)
            .then(resp => {
                if (resp && resp.data && resp.data.length > 0) {
                    const org = resp.data.filter(e => e.unitType === "OU")
                    const dept = resp.data.filter(e => e.unitType === "DEPT")
                    organisationRef.current = org
                    departmentRef.current = dept
                    unstable_batchedUpdates(() => {
                        setDepartment(dept)
                        setOrganization(org)
                    })
                }
            }).catch(error => console.log(error))

        get(`${properties.ROLE_API}`).then(resp => {
            if (resp.data) {
                const role = resp.data.filter(e => e.status === "AC")
                setRole(role)
                roleRef.current = role
            }
        }).catch(error => console.log(error)).finally()

        post(properties.BUSINESS_ENTITY_API, [
            'SERVICE_TYPE',
            'PROBLEM_CODE',
            'TICKET_PRIORITY',
            'TICKET_SOURCE',
            "COUNTRY",
            "INTERACTION_STATUS"
            // "STATE",
            // "DISTRICT",
            // "POSTCODE"
        ])
            .then((r) => {
                if (r.data) {
                    get(properties.ADDRESS_LOOKUP_API)
                        .then((resp) => {
                            if (resp && resp.data) {
                                let district = []
                                let kampong = []
                                let postCode = []
                                addressLookup.current = resp.data
                                setAddressLookUpRef(resp.data)
                                for (let e of addressLookup.current) {
                                    if (!district.includes(e.district)) {
                                        district.push(e.district)
                                    }
                                    if (!kampong.includes(e.kampong)) {
                                        kampong.push(e.kampong)
                                    }
                                    if (!postCode.includes(e.postCode)) {
                                        postCode.push(e.postCode)
                                    }
                                }
                                setDistrictLookup(district)
                                setKampongLookup(kampong)
                                setPostCodeLookup(postCode)
                            }
                        }).catch(error => console.log(error))
                    lookupData.current = r.data;
                    unstable_batchedUpdates(() => {
                        setServiceTypeLookup(lookupData.current['SERVICE_TYPE'])
                        setProblemCodeLookup(lookupData.current['PROBLEM_CODE'])
                        setPriorityLookup(lookupData.current['TICKET_PRIORITY'])
                        setTicketSourceLookup(lookupData.current['TICKET_SOURCE'])
                        setCountries(lookupData.current['COUNTRY'])
                        setInteractionLookup(lookupData.current['INTERACTION_STATUS'])
                    })

                }
            }).catch(error => {
                console.error(error);
            })
            .finally()
    }, [])

    /**
     * @param {Event} e  Handle tab change and Validation while move from 
     * one tab to next using Next or Previous Button
     * @returns 
     */

    const handleOnPreviousNext = (e) => {
        const { target } = e;
        if (target.id === 'prev') {
            const index = tabs[--activeTab.index]
            unstable_batchedUpdates(() => {
                setActiveTab(index);
            })
        }
        else {
            if (activeTab.index === 0) {
                let error = validate(validationSchema, masterTicketData);
                if (error) {
                    toast.error("Validation errors found. Please check all fields");
                    return false
                }
                else {
                    const index = tabs[++activeTab.index]
                    setActiveTab(index)
                }
            }
            else if (activeTab.index === 1) {
                handleProcessChildTicket()
            }
            else if (activeTab.index === 2) {
                if (templateStatusFlags.showErrorCheck === true && templateStatusFlags.proceedCheck !== true) {
                    toast.error('Please Confirm the Skip Check to Upload the Records')
                    return false
                } else {
                    const index = tabs[++activeTab.index]
                    setActiveTab(index)
                }
            }
            else {
                const index = tabs[++activeTab.index]
                setActiveTab(index)
            }
        }
    }

    /**
     * Handle Tab Change
     * @param {Integer} selectedTab  
     * @returns {boolean}
     */
    const handleOnTabChange = (selectedTab) => {
        if (activeTab.index === 1 && selectedTab.index === 0) {
            setActiveTab(selectedTab);
            return;
        }
        setActiveTab(selectedTab);
    }

    /**
     * If the schema is invalid, set the error state to the error message.
     * @returns {object} The error object.
     */
    const validate = (schema, data) => {
        try {
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                setMasterTicketDataError((prevState) => {
                    return { ...prevState, [err.params.path]: err.message };
                });
            });
            return e;
        }
    }

    /**
     *  handle Child Ticket Process
     */
    const handleProcessChildTicket = () => {
        if (intialValue.mode === "ADD") {
            if (childTicketChoice === "search") {
                if (selectedMappedChildTicketIdList.length < 1) {
                    toast.warn('Please select Atleat OneChild Ticket')
                }
                else if (selectedMappedChildTicketIdList.length > 0) {
                    const index = tabs[++activeTab.index]
                    setUploadTemplateList({ ...uploadTemplateList, uploadList: selectedMappedChildTicketIdList, rejectedList: [], finalList: [] })
                    setActiveTab(index)
                    setTemplateStatusFlags({
                        validateCheck: false,
                        showErrorCheck: false,
                        proceedCheck: false
                    })
                    setTemplateUploadCounts({
                        ...templateUploadCounts,
                        total: selectedMappedChildTicketIdList?.length,
                        failed: 0, success: 0
                    })
                }
            }
            else {
                if (uploadTemplateList?.uploadList?.length < 1) {
                    toast.warn('Please select Atleat OneChild Ticket')
                }
                else {
                    const index = tabs[++activeTab.index]
                    setActiveTab(index)
                    setTemplateStatusFlags({
                        validateCheck: false,
                        showErrorCheck: false,
                        proceedCheck: false
                    })
                    setTemplateUploadCounts({
                        ...templateUploadCounts,
                        total: uploadTemplateList?.uploadList?.length,
                        failed: 0, success: 0
                    })
                }
            }
        }
        else if (intialValue.mode === "EDIT") {
            // if (deleteChildTicketIdList.length < 1 && (uploadTemplateList?.uploadList?.length < 1 && selectedMappedChildTicketIdList.length < 1)) {
            //     toast.warn('Please select or Delete Atleat OneChild Ticket')
            // }
            if (selectedMappedChildTicketIdList.length > 0) {
                setUploadTemplateList({ ...uploadTemplateList, uploadList: selectedMappedChildTicketIdList, rejectedList: [], finalList: [] })
            }
            const index = tabs[++activeTab.index]
            setActiveTab(index)
            setTemplateStatusFlags({
                validateCheck: false,
                showErrorCheck: false,
                proceedCheck: false
            })
            setTemplateUploadCounts({
                ...templateUploadCounts,
                total: selectedMappedChildTicketIdList.length > 0 ? selectedMappedChildTicketIdList.length : uploadTemplateList?.uploadList?.length,
                failed: 0, success: 0
            })
        }

    }

    const handleFinish = (e) => {
        handleSubmit(e)
    }

    /**
     * @param {Event} e 
     * @returns 
     */
    const handleSubmit = (e) => {
        e.preventDefault()
        let error = validate(validationSchema, masterTicketData);
        if (error) {
            toast.error("Validation errors found. Please check all fields");
            return false
        }
        if (intialValue.mode === "ADD") {
            if (childTicketChoice === "search" && selectedMappedChildTicketIdList.length < 1) {
                toast.error("Please select Atleat OneChild Ticket");
                return false
            }
            if (childTicketChoice === "import" && uploadTemplateList?.uploadList?.length < 1) {
                toast.error("Please select Atleat OneChild Ticket");
                return false
            }
            if (templateStatusFlags.validateCheck === false) {
                toast.error('Please Validate the Records')
                return false
            }
            if (uploadTemplateList.finalList.length === 0) {
                toast.error('No Valid Records Available')
                return false
            }
            if (templateStatusFlags.showErrorCheck === true && templateStatusFlags.proceedCheck !== true) {
                toast.error('Please Confirm the Skip Check to Upload the Records')
                return false
            }
        }

        if (intialValue.mode === "EDIT") {
            if ((uploadTemplateList?.uploadList?.length > 0 || selectedMappedChildTicketIdList.length > 0)) {
                if (templateStatusFlags.validateCheck === false) {
                    toast.error('Please Validate the Records')
                    return false
                }
                if (templateStatusFlags.showErrorCheck === true && templateStatusFlags.proceedCheck !== true) {
                    toast.error('Please Confirm the Skip Check to Upload the Records')
                    return false
                }
            }
        }

        if (intialValue.mode === "ADD" && (masterTicketId === null || masterTicketId === undefined)) {
            const requestBody = {
                title: masterTicketData?.title,
                description: masterTicketData?.description,
                ouId: masterTicketData?.ouId,
                entityId: masterTicketData?.entityId,
                userId: masterTicketData?.userId,
                serviceType: masterTicketData?.serviceType,
                problemCode: masterTicketData?.problemCode,
                priorityCode: masterTicketData?.priorityCode,
                ticketSource: masterTicketData?.ticketSource,
                roleId: masterTicketData?.roleId,
                address: {
                    hno: masterTicketData?.hno,
                    buildingName: masterTicketData?.buildingName,
                    street: masterTicketData?.street,
                    city: masterTicketData?.city,
                    district: masterTicketData?.district,
                    state: masterTicketData?.state,
                    postCode: masterTicketData?.postCode,
                    country: masterTicketData?.country,
                },
                childTickets: uploadTemplateList?.finalList || [],
                settings: {
                    replyToChildTicket: masterTicketData?.replyToChildTicket,
                    editTicket: masterTicketData?.editTicket,
                    closeAllChildTicket: masterTicketData?.closeAllChildTicket,
                    closeMasterTicket: masterTicketData?.closeMasterTicket
                }
            }
            
            post(`${properties.INTERACTION_API}/master-tickets`, requestBody)
                .then((resp) => {
                    if (resp.status === 200) {
                        toast.success(resp.message)
                        const index = tabs[++activeTab.index]
                        unstable_batchedUpdates(() => {
                            setActiveTab(index)
                            setMasterTicketId(resp?.data?.mstIntxnId)
                            setMasterTicketDetails(resp?.data)
                        })
                    }
                })
                .catch(error => {
                    console.error(error)
                })
                .finally()
        } else if (intialValue.mode === "EDIT" && masterTicketId !== null && masterTicketId !== undefined) {
            const requestBody = {
                title: masterTicketData?.title,
                description: masterTicketData?.description,
                ouId: masterTicketData?.ouId,
                entityId: masterTicketData?.entityId,
                userId: masterTicketData?.userId,
                serviceType: masterTicketData?.serviceType,
                problemCode: masterTicketData?.problemCode,
                priorityCode: masterTicketData?.priorityCode,
                ticketSource: masterTicketData?.ticketSource,
                roleId: masterTicketData?.roleId,
                address: {
                    addressId: masterTicketData?.addressId,
                    hno: masterTicketData?.hno,
                    buildingName: masterTicketData?.buildingName,
                    street: masterTicketData?.street,
                    city: masterTicketData?.city,
                    district: masterTicketData?.district,
                    state: masterTicketData?.state,
                    postCode: masterTicketData?.postCode,
                    country: masterTicketData?.country,
                },
                deleteChildTickets: deleteChildTicketIdList || [],
                newChildTickets: uploadTemplateList?.finalList || [],
                settings: {
                    replyToChildTicket: masterTicketData?.replyToChildTicket,
                    editTicket: masterTicketData?.editTicket,
                    closeAllChildTicket: masterTicketData?.closeAllChildTicket,
                    closeMasterTicket: masterTicketData?.closeMasterTicket
                }
            }
            
            put(`${properties.INTERACTION_API}/master-tickets/${masterTicketId}`, requestBody)
                .then((response) => {
                    if (response.status === 200) {
                        toast.success(response.message)
                        const index = tabs[++activeTab.index]
                        unstable_batchedUpdates(() => {
                            setActiveTab(index)
                            setMasterTicketId(response?.data?.mstIntxnId)
                            setMasterTicketDetails(response?.data)
                        })
                    }
                })
                .catch(error => {
                    console.error(error)
                })
                .finally()
        }
    }

    /**
     * Get Master Ticket Details for EDIT
     */
    useEffect(() => {
        if (intialValue?.mode === "EDIT" && intialValue && intialValue?.mstIntxnId !== null && intialValue?.mstIntxnId !== undefined) {
            
            get(`${properties.INTERACTION_API}/master-tickets/${intialValue?.mstIntxnId}`)
                .then((resp) => {
                    if (resp.data) {
                        const masterTicketData = {
                            title: resp?.data?.title,
                            description: resp?.data?.description,
                            ouId: resp?.data?.ouId,
                            entityId: resp?.data?.entityId,
                            userId: resp?.data?.userId,
                            roleId: resp?.data?.roleId,
                            serviceType: resp?.data?.serviceTypeDesc?.code,
                            problemCode: resp?.data?.problemCodeDesc?.code,
                            priorityCode: resp?.data?.priorityDescription?.code,
                            ticketSource: resp?.data?.ticketSourceDescription?.code,
                            hno: resp?.data?.address?.hno,
                            buildingName: resp?.data?.address?.buildingName,
                            street: resp?.data?.address?.street,
                            city: resp?.data?.address?.city,
                            district: resp?.data?.address?.district,
                            state: resp?.data?.address?.state,
                            postCode: resp?.data?.address?.postCode,
                            country: resp?.data?.address?.country,
                            addressId: resp?.data?.address?.addressId,
                            replyToChildTicket: resp?.data?.payload?.replyToChildTicket,
                            editTicket: resp?.data?.payload?.editTicket,
                            closeAllChildTicket: resp?.data?.payload?.closeAllChildTicket,
                            closeMasterTicket: resp?.data?.payload?.closeMasterTicket
                        }
                        unstable_batchedUpdates(() => {
                            setMasterTicketData(masterTicketData)
                            setMasterTicketId(intialValue?.mstIntxnId)
                        })
                    }
                })
                .catch(error => {
                    console.error(error)
                })
                .finally()
        }
    }, [intialValue.mstIntxnId])

    return (
        <>
            {/* <div id="main p-0">
                <div className="row p-0">
                    <div className="col p-0">
                        <div className="card-body insta-page row">
                            <div className="col-md-12"> */}
            <div>
                <div className="row mt-1 col-md-12 p-0 mb-3">
                    <section className="triangle col-md-12">
                        <div className="row col-md-12">
                            <div className="col-md-8">
                                <h5>{t("create_master_tickets")}</h5>
                            </div>
                        </div>
                    </section>
                </div>
                <div className="row">
                    <div className="col-xl-12">
                        <div className="card">
                            <div className="card-body">
                                <div id="progressbarwizard">
                                    <ul className="nav nav-pills bg-light nav-justified form-wizard-header mb-3">
                                        {
                                            tabs.map((tab, index) => (
                                                <li key={tab.name} className="nav-item">
                                                    <a className={`nav-link rounded-0 pt-2 pb-2 cursor-pointer ${activeTab?.index === index ? 'active' : ''}`} onClick={() => handleOnTabChange(tab)}>
                                                        <i className={tab.index === 0 ? "mdi mdi-progress-download mr-1 font-17" : tab.index === 1 ? "mdi mdi-view-list font-17 mr-1" : "mdi mdi-checkbox-marked-circle-outline mr-1 font-17"}></i>
                                                        <span className="d-none d-sm-inline">{intialValue.mode === "EDIT" ? tab.Edit : tab.Add}</span>
                                                    </a>
                                                </li>
                                            ))
                                        }
                                    </ul>
                                    <div className="tab-content b-0 mb-0 pt-0">
                                        <div id="bar" className="progress mb-3" style={{ height: "7px" }}>

                                        </div>
                                        <div className={`tab-pane ${activeTab.index === 0 ? 'show active' : ''}`} >
                                            {activeTab.index === 0 && <CreateEditMasterTicketDetails
                                                data={{
                                                    masterTicketData,
                                                    masterTicketDataError,
                                                    servcieTypeLookup,
                                                    problemCodeLookup,
                                                    priorityLookup,
                                                    ticketSourceLookup,
                                                    districtLookup,
                                                    kampongLookup,
                                                    postCodeLookup,
                                                    countries,
                                                    department,
                                                    organization,
                                                    role
                                                }}
                                                handler={{
                                                    setMasterTicketDataError,
                                                    setMasterTicketData,
                                                    setDepartment,
                                                    setRole,
                                                    setKampongLookup,
                                                    setPostCodeLookup
                                                }}
                                                reference={{
                                                    organisationRef,
                                                    departmentRef,
                                                    addressLookUpRef,
                                                    roleRef
                                                }}
                                            ></CreateEditMasterTicketDetails>
                                            }
                                        </div>
                                        <div className={`tab-pane ${activeTab.index === 1 ? 'show active' : ''}`} >
                                            {activeTab.index === 1 && <AddChildTickets
                                                data={{
                                                    servcieTypeLookup,
                                                    problemCodeLookup,
                                                    interactionLookup,
                                                    templateStatusFlags,
                                                    templateUploadCounts,
                                                    uploadTemplateList,
                                                    childTicketChoice,
                                                    file,
                                                    fileName,
                                                    uploadStatusResponse,
                                                    showImportantInstruction,
                                                    totalCount,
                                                    childTicketData,
                                                    selectedMappedChildTicketIdList,
                                                    intialValue,
                                                    masterTicketId,
                                                    deleteChildTicketIdList
                                                }}
                                                handler={{
                                                    setActiveTab,
                                                    setTemplateUploadCounts,
                                                    setUploadTemplateList,
                                                    setTemplateStatusFlags,
                                                    setChildTicketChoice,
                                                    setFile,
                                                    setFileName,
                                                    setUploadStatusResponse,
                                                    setShowImportantInstruction,
                                                    setTotalCount,
                                                    setChildTicketData,
                                                    setSelectedMappedChildTicketIdList,
                                                    handleProcessChildTicket,
                                                    setDeleteChildTicketIdList
                                                }}
                                            ></AddChildTickets>
                                            }
                                        </div>
                                        <div className={`tab-pane ${activeTab.index === 2 ? 'show active' : ''}`} >
                                            {activeTab.index === 2 && <PreviewValidate
                                                data={{
                                                    templateStatusFlags,
                                                    templateUploadCounts,
                                                    uploadTemplateList,
                                                    childTicketChoice,
                                                    selectedMappedChildTicketIdList,
                                                    intialValue,
                                                    deleteChildTicketIdList
                                                }}
                                                handler={{
                                                    setTemplateUploadCounts,
                                                    setUploadTemplateList,
                                                    setTemplateStatusFlags
                                                }}
                                            ></PreviewValidate>
                                            }
                                        </div>
                                        <div className={`tab-pane ${activeTab.index === 3 ? 'show active' : ''}`}>
                                            {
                                                activeTab.index === 3 && <MasterTicketSettings
                                                    data={{
                                                        masterTicketData
                                                    }}
                                                    handler={{
                                                        setMasterTicketData
                                                    }}
                                                ></MasterTicketSettings>
                                            }
                                        </div>
                                        <div className={`tab-pane text-center p-2 ${activeTab.index === 4 ? 'show active' : ''}`}>
                                            {
                                                activeTab.index === 4 && <SubmitMasterTicket
                                                    data={{
                                                        masterTicketDetails
                                                    }}
                                                ></SubmitMasterTicket>
                                            }
                                        </div>

                                    </div>
                                    <ul className="list-inline wizard mb-0">
                                        <li className="previous list-inline-item">
                                            <button className={`btn btn-primary ${activeTab.index === 0 || activeTab.index === 4 ? 'd-none' : ''}`} id='prev' onClick={handleOnPreviousNext}>Previous</button>
                                        </li>
                                        {
                                            (activeTab.index === 3) ?
                                                <li className="next list-inline-item float-right">
                                                    <button className="btn btn-primary" id="finish" onClick={(e) => { handleFinish(e) }}>
                                                        Finish
                                                    </button>
                                                </li>
                                                :
                                                <li className="next list-inline-item float-right">
                                                    <button className={`btn btn-primary ${activeTab.index === 4 ? 'd-none' : ''}`} id="next" onClick={handleOnPreviousNext}>Next</button>
                                                </li>
                                        }
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* </div>
                        </div>
                    </div>
                </div>
            </div> */}
        </>
    )
}
export default CreateEditMasterTicket;