import React, { useState } from 'react'
import { Link } from "react-router-dom";
import DownloadTemplate from './BulkUploadCreate/DownloadTemplate';
import PreviewValidateTemplate from './BulkUploadCreate/PreviewValidateTemplate';
import SubmitTemplate from './BulkUploadCreate/SubmitTemplate';
import Customer_Template from './BulkUploadExcelTemplates/Customer_Template.xlsx'
// import Contract_Template from './BulkUploadExcelTemplates/Contract_Template.xlsx'
import Product_Master_Template from './BulkUploadExcelTemplates/Product_Master_Template.xlsx'
import User_Template from './BulkUploadExcelTemplates/User_Template.xlsx'
// import Business_Entity_Template from './BulkUploadExcelTemplates/Business_Entity_Template.xlsx'
// import Role_Template from './BulkUploadExcelTemplates/Role_Template.xlsx'
// import User_Role_Mapping from './BulkUploadExcelTemplates/User_Role_Mapping.xlsx'
import Request_Statement_Template from './BulkUploadExcelTemplates/Request_Statement_Template.xlsx'
import Order_Template from './BulkUploadExcelTemplates/Order_Template.xlsx'
import Profile_Template from './BulkUploadExcelTemplates/Profile_Template.xlsx'
import Service_Template from './BulkUploadExcelTemplates/Service_Template.xlsx'
import Interaction_Template from './BulkUploadExcelTemplates/Interaction_Template.xlsx'
import Charge_Template from './BulkUploadExcelTemplates/Charge_Template.xlsx'
import Entity_Transaction_Mapping_Template from './BulkUploadExcelTemplates/Entity_Transaction_Mapping_Template.xlsx'
import Units_Template from './BulkUploadExcelTemplates/Units_Template.xlsx'
import Calender_Template from './BulkUploadExcelTemplates/Calender_Template.xlsx'
import shift_Template from './BulkUploadExcelTemplates/Shift_Template.xlsx'
import Skill_Template from './BulkUploadExcelTemplates/Skill_Template.xlsx'
import Holiday_Calender_Template from './BulkUploadExcelTemplates/Holiday_Calender_Template.xlsx'
import User_Skill_Mapping_Template from './BulkUploadExcelTemplates/User_Skill_Mapping_Template.xlsx'
import appointment_Template from './BulkUploadExcelTemplates/appointment_Template.xlsx'
import contract_Template from './BulkUploadExcelTemplates/contract_Template.xlsx'
import invoice_Template from './BulkUploadExcelTemplates/Invoice_Template.xlsx'
import payment_Template from './BulkUploadExcelTemplates/Payment_Template.xlsx'


import {
    CustomerMandatoryColumns, CustomerTemplateColumns, BillingContractTemplateColumns,
    ProductTemplateColumns, ProductMandatoryColumns, SalesOrderTemplateColumns, SalesOrderMandatoryColumns, BillingContractMandatoryColumns,
    IncidentTemplateColumns, IncidentMandatoryColumns, UserColumns, UserMandatoryColumns, BusinessEntityColumns, BusinessEntityMandatoryCols, RoleColumns, RolesMandatoryCols,
    UserRoleMandatoryCols, UserRoleColumns, RequestStatementMandatoryCols, RequestStatementColumns, OrderTemplateColumns, OrderMandatoryColumns, ProfileTemplateColumns, ProfileMandatoryColumns, ServiceMandatoryColumns, ServiceTemplateColumns,
    InteractionMandatoryColumns, InteractionTemplateColumns, ChargeMandatoryColumns, ChargeTemplateColumns,UserSkillTemplateColumns,UserSkillMandatoryColumns,
    EntityTransactionMappingMandatoryColumns, EntityTransactionMappingTemplateColumns,BusinessUnitsMandatoryColumns, BusinessUnitsTemplateColumns,
    CalenderMandatoryColumns, CalenderTemplateColumns, ShiftMandatoryColumns, ShiftTemplateColumns,
    SkillMandatoryColumns,SkillTemplateColumns,HolidayCalenderMandatoryColumns,HolidayCalenderTemplateColumns,
    AppointmentMandatoryColumns,AppointmentTemplateColumns,contractMandatoryColumns, contractTemplateColumns,
    invoiceMandatoryColumns, invoiceTemplateColumns, paymentMandatoryColumns, paymentTemplateColumns
} from './BulkUploadColumns';

import { post } from '../../common/util/restUtil';
import { properties } from '../../properties';
import { toast } from 'react-toastify';
import { unstable_batchedUpdates } from 'react-dom';

const CreateBulkUpload = (props) => {

    const templateType = props?.location?.state?.data?.selectedTemplateType

    const tabs = [
        {
            name: 'Download Template',
            index: 0
        },
        {
            name: 'Preview and Validate',
            index: 1
        },
        {
            name: 'Submit',
            index: 2
        }
    ];
    const bulkUploadTemplateList = [
        {
            type: "CHARGE",
            displayName: "Charge",
            name: "Charge_Template",
            template: Charge_Template,
            description: "Download Charge Template",
            mandatoryColumns: ChargeMandatoryColumns,
            tableColumns: ChargeTemplateColumns,
            enabled: true
        },
        {
            type: "CUSTOMER",
            displayName: "Customer",
            name: "Customer_Template.xlsx",
            template: Customer_Template,
            description: "Download Customer Template",
            mandatoryColumns: CustomerMandatoryColumns,
            tableColumns: CustomerTemplateColumns,
            enabled: true
        },
        {
            type: "INTERACTION",
            displayName: "Interaction",
            name: "Interaction_Template",
            template: Interaction_Template,
            description: "Download Interaction Template",
            mandatoryColumns: InteractionMandatoryColumns,
            tableColumns: InteractionTemplateColumns,
            enabled: true
        },
        {
            type: "REQUEST_STATEMENT",
            displayName: "Request Statement",
            name: "Request_Statement_Template",
            template: Request_Statement_Template,
            description: "Download Request Statement Template",
            mandatoryColumns: RequestStatementMandatoryCols,
            tableColumns: RequestStatementColumns,
            enabled: true
        },
        {
            type: "ORDER",
            displayName: "Order",
            name: "Order_Template",
            template: Order_Template,
            description: "Download Order Template",
            mandatoryColumns: OrderMandatoryColumns,
            tableColumns: OrderTemplateColumns,
            enabled: true
        },
        {
            type: "USER",
            displayName: "User-Business",
            name: "User_Template.xlsx",
            template: User_Template,
            description: "Download User Template",
            mandatoryColumns: UserMandatoryColumns,
            tableColumns: UserColumns,
            enabled: true
        },
        // {
        //     type: "BUSINESS_ENTITY",
        //     displayName: "Business Entity",
        //     name: "Business Entity Template.xlsx",
        //     template: Business_Entity_Template,
        //     description: "Download Business Entity Template",
        //     mandatoryColumns: BusinessEntityMandatoryCols,
        //     tableColumns: BusinessEntityColumns,
        //     enabled: false
        // },
        // {
        //     type: "ROLE",
        //     displayName: "Role",
        //     name: "Role_Template.xlsx",
        //     template: Role_Template,
        //     description: "Download Role Template",
        //     mandatoryColumns: RolesMandatoryCols,
        //     tableColumns: RoleColumns,
        //     enabled: false
        // },
        // {
        //     type: "CONTRACT",
        //     displayName: "Contract",
        //     name: "Contract_Template.xlsx",
        //     template: Contract_Template,
        //     description: "Download Customer Contract Template",
        //     mandatoryColumns: BillingContractMandatoryColumns,
        //     tableColumns: BillingContractTemplateColumns,
        //     enabled: false
        // },
        {
            type: "PRODUCT",
            displayName: "Product",
            name: "Product_Master_Template.xlsx",
            template: Product_Master_Template,
            description: "Download Product Master Template",
            mandatoryColumns: ProductMandatoryColumns,
            tableColumns: ProductTemplateColumns,
            enabled: true
        },
        {
            type: "PROFILE",
            displayName: "Profile",
            name: "Profile_Template",
            template: Profile_Template,
            description: "Download Profile Template",
            mandatoryColumns: ProfileMandatoryColumns,
            tableColumns: ProfileTemplateColumns,
            enabled: true
        },
        {
            type: "SERVICE",
            displayName: "Account and Service",
            name: "Service_Template",
            template: Service_Template,
            description: "Download Service Template",
            mandatoryColumns: ServiceMandatoryColumns,
            tableColumns: ServiceTemplateColumns,
            enabled: true
        },
        {
            type: "ENTITY_TRANSACTION_MAPPING",
            displayName: "Entity Transaction Mapping",
            name: "Entity_Transaction_Mapping_Template",
            template: Entity_Transaction_Mapping_Template,
            description: "Download Entity Transaction Mapping Template",
            mandatoryColumns: EntityTransactionMappingMandatoryColumns,
            tableColumns: EntityTransactionMappingTemplateColumns,
            enabled: true
        },{
            type: "BUSINESS_UNITS",
            displayName: "Business Units",
            name: "Units_Template",
            template: Units_Template,
            description: "Download Units Template",
            mandatoryColumns: BusinessUnitsMandatoryColumns,
            tableColumns: BusinessUnitsTemplateColumns,
            enabled: true
        },
        {
            type: "CALENDAR",
            displayName: "Calendar",
            name: "Calender_Template",
            template: Calender_Template,
            description: "Download Calendar Template",
            mandatoryColumns: CalenderMandatoryColumns,
            tableColumns: CalenderTemplateColumns,
            enabled: true
        },
        {
            type: "SHIFT",
            displayName: "Shift",
            name: "shift_Template",
            template: shift_Template,
            description: "Download Shift Template",
            mandatoryColumns: ShiftMandatoryColumns,
            tableColumns: ShiftTemplateColumns,
            enabled: true
        },{
        },
        {
            type: "HOLIDAY_CALENDAR",
            displayName: "Holiday Calender",
            name: "Holiday_Calendar_Template",
            template: Holiday_Calender_Template,
            description: "Download Holiday Calendar Template",
            mandatoryColumns: HolidayCalenderMandatoryColumns,
            tableColumns: HolidayCalenderTemplateColumns,
            enabled: true
        },
        {
            type: "SKILL",
            displayName: "Skill",
            name: "Skill_Template",
            template: Skill_Template,
            description: "Download Skill Template",
            mandatoryColumns: SkillMandatoryColumns,
            tableColumns: SkillTemplateColumns,
            enabled: true
        },
        {
            type: "USER_SKILL",
            displayName: "User Skill Mapping",
            name: "User_Skill_Mapping_Template",
            template: User_Skill_Mapping_Template,
            description: "Download User Skill Mapping Template",
            mandatoryColumns: UserSkillMandatoryColumns,
            tableColumns: UserSkillTemplateColumns,
            enabled: true
        },{
            type: "APPOINTMENT",
            displayName: "Appointment",
            name: "appointment_Template",
            template: appointment_Template,
            description: "Download Appointment Template",
            mandatoryColumns: AppointmentMandatoryColumns,
            tableColumns: AppointmentTemplateColumns,
            enabled: true
        },{
            type: "CONTRACT",
            displayName: "Contract",
            name: "contract_Template",
            template: contract_Template,
            description: "Download Contract Template",
            mandatoryColumns: contractMandatoryColumns,
            tableColumns: contractTemplateColumns,
            enabled: true
        },{
            type: "INVOICE",
            displayName: "Invoice",
            name: "invoice_Template",
            template: invoice_Template,
            description: "Download Invoice Template",
            mandatoryColumns: invoiceMandatoryColumns,
            tableColumns: invoiceTemplateColumns,
            enabled: true
        },{
            type: "PAYMENT",
            displayName: "Payment",
            name: "payment_Template",
            template: payment_Template,
            description: "Download Payment Template",
            mandatoryColumns: paymentMandatoryColumns,
            tableColumns: paymentTemplateColumns,
            enabled: true
        }
    ]
    const [activeTab, setActiveTab] = useState(tabs[0]);
    const [selectedTemplateType, setSelectedTemplateType] = useState(templateType ? templateType : '')
    const [uploadTemplateList, setUploadTemplateList] = useState({
        uploadList: [],
        rejectedList: [],
        finalList: [],
        extraList: []
    })
    const [file, setFile] = useState();
    const [fileName, setFileName] = useState("")
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
    const [uploadStatusResponse, setUploadStatusResponse] = useState()
    const handleOnPreviousNext = (e) => {
        const { target } = e;
        if (target.id === 'prev') {
            setActiveTab(tabs[--activeTab.index])
        }
        else {
            // if (verifyUserNaviagtion(activeTab.index)) {
            //     return;
            // }
            setActiveTab(tabs[++activeTab.index]);
        }
    }

    const handleOnTabChange = (selectedTab) => {
        if (activeTab.index === 1 && selectedTab.index === 0) {
            setActiveTab(selectedTab);
            return;
        }
        // if (verifyUserNaviagtion(activeTab.index)) {
        //     return;
        // }
        setActiveTab(selectedTab);
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (templateStatusFlags.validateCheck === false) {
            toast.error('Please Validate the Records')
            return false
        }
        if (templateStatusFlags.showErrorCheck === true && templateStatusFlags.proceedCheck !== true) {
            toast.error('Please Confirm the Skip Check to Upload the Records')
            return false
        }
        if (uploadTemplateList.finalList.length === 0) {
            toast.error('No Valid Records Available')
            return false
        }
        let tranId = uploadTemplateList.finalList[0].tranId
        let bulkUploadId = uploadTemplateList.finalList[0].bulkUploadId

        const endPointMapping = {
            CUSTOMER: properties.BULK_UPLOAD_API + "/customer",
            USER: properties.BULK_UPLOAD_API + "/user",
            CHARGE: properties.BULK_UPLOAD_API + "/charge",
            REQUEST_STATEMENT: properties.BULK_UPLOAD_API + "/request-statement",
            PRODUCT: properties.BULK_UPLOAD_API + "/product",
            ORDER: properties.BULK_UPLOAD_API + "/order",
            PROFILE: properties.BULK_UPLOAD_API + "/profile",
            SERVICE: properties.BULK_UPLOAD_API + "/service",
            INTERACTION: properties.BULK_UPLOAD_API + "/interaction",
            BUSINESS_UNITS: properties.BULK_UPLOAD_API + "/business-units",
            ENTITY_TRANSACTION_MAPPING: properties.BULK_UPLOAD_API + "/entity-transaction-mapping",
            CUSTOMER_CONTRACT: properties.ORDERS_API + "/customer-contract/bulk",
            // CONTRACT: properties.ORDERS_API + "/create-bill-contract",
            SALES_ORDER: properties.ORDERS_API + "/create-sales-order",
            INCIDENT: properties.COMPLAINT_API + "/create-bulk-incident",
            // PRODUCT: properties.PLANS_API + "/create-bulk-product",
            // INVOICE: properties.INVOICE_API + "/create-bulk-invoice",
            BUSINESS_ENTITY: properties.BUSINESS_PARAMETER_API + "/bulk",
            ROLE: properties.ROLE_API + "/bulk",
            CALENDAR: properties.BULK_UPLOAD_API + "/calendar",
            SHIFT: properties.BULK_UPLOAD_API + "/shift",
            HOLIDAY_CALENDAR: properties.BULK_UPLOAD_API + "/holiday/calendar",
            SKILL: properties.BULK_UPLOAD_API + "/skill",
            USER_SKILL: properties.BULK_UPLOAD_API + "/user/skill",
            APPOINTMENT: properties.BULK_UPLOAD_API + "/appointment",
            CONTRACT: properties.BULK_UPLOAD_API + "/contract",
            INVOICE: properties.BULK_UPLOAD_API + "/invoice",            
            PAYMENT: properties.BULK_UPLOAD_API + "/payment",

            //USER_ROLE_MAPPING: properties.USER_API + "/bulk-user-mapping"
        }
        let requestBody = {
            list: uploadTemplateList.finalList,
            extraList: uploadTemplateList.extraList,
            counts: templateUploadCounts,
            type: selectedTemplateType.replace(/_/g, ' '),
            fileName,
            tranId,
            bulkUploadId
        }
        post(endPointMapping[selectedTemplateType], requestBody)
            .then((resp) => {
                if (resp.data) {

                    unstable_batchedUpdates(() => {
                        setUploadStatusResponse({
                            ...resp.data,
                            finalList: uploadTemplateList?.finalList
                        })
                    })
                    handleClear()
                    handleOnPreviousNext(e)
                }
            })
            .catch((error) => {
                console.log(error)
            })
            .finally()
    }

    const handleFinish = (e) => {
        handleSubmit(e)
    }

    const handleClear = () => {
        setUploadTemplateList({
            uploadList: [],
            rejectedList: [],
            finalList: [],
            extraList: []
        })
        setTemplateUploadCounts({
            success: 0,
            failed: 0,
            total: 0
        })
        setTemplateStatusFlags({
            validateCheck: false,
            showErrorCheck: false,
            proceedCheck: false
        })
        setFile()
        setFileName("")
        setSelectedTemplateType('')
    }

    return (
        <React.Fragment>
            <div id="main pt-0" className='cmmn-skeleton mt-2'>
                <div className="row p-0">
                    <div className="col p-0">
                        <div className="card-body insta-page row">
                            <div className="col-md-12">
                                <div className="">
                                    <div className="row mt-1 col-md-12 p-0 mb-2">
                                        <div className="col-md-12 d-flex">
                                            <h5>Migration Data</h5>
                                            <Link style={{ marginLeft: 'auto' }} to={{ pathname: `${process.env.REACT_APP_BASE}/search-bulk-upload` }} className="skel-btn-submit">
                                                Search Migration
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-xl-12">
                                            <div className="">
                                                <div className="">
                                                    <div id="progressbarwizard">
                                                        <ul className="nav nav-pills bg-light nav-justified form-wizard-header mb-3">
                                                            {tabs.map((tab, index) => (
                                                                <li key={tab.name} className="nav-item">
                                                                    <a className={`cursor-pointer nav-link rounded-0 pt-2 pb-2 cursor-pointer ${activeTab.index === index ? 'active' : ''}`} onClick={() => handleOnTabChange(tab)}>
                                                                        <i className={tab.index === 0 ? "mdi mdi-progress-download mr-1 font-17" : tab.index === 1 ? "mdi mdi-view-list font-17 mr-1" : "mdi mdi-checkbox-marked-circle-outline mr-1 font-17"}></i>
                                                                        <span className="d-none d-sm-inline">{tab.name}</span>
                                                                    </a>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                        <div className="tab-content b-0 mb-0 pt-0">
                                                            <div id="bar" className="progress mb-3" style={{ height: "7px" }}>
                                                                <div className="bar progress-bar progress-bar-striped progress-bar-animated bg-success"></div>
                                                            </div>

                                                            <div className={`tab-pane ${activeTab.index === 0 ? 'show active' : ''}`} >
                                                                {
                                                                    activeTab.index === 0 &&
                                                                    <DownloadTemplate
                                                                        data={{
                                                                            selectedTemplateType,
                                                                            bulkUploadTemplateList: bulkUploadTemplateList?.filter(x => x.enabled),
                                                                            uploadTemplateList,
                                                                            file,
                                                                            fileName,
                                                                            templateUploadCounts
                                                                        }}
                                                                        handler={{
                                                                            setSelectedTemplateType,
                                                                            setUploadTemplateList,
                                                                            setFile,
                                                                            setFileName,
                                                                            setTemplateUploadCounts,
                                                                            setTemplateStatusFlags
                                                                        }}
                                                                    />
                                                                }

                                                            </div>
                                                            <div className={`tab-pane ${activeTab.index === 1 ? 'show active' : ''}`} >
                                                                {
                                                                    activeTab.index === 1 &&
                                                                    <PreviewValidateTemplate
                                                                        data={{
                                                                            selectedTemplateType,
                                                                            bulkUploadTemplateList: bulkUploadTemplateList?.filter(x => x.enabled),
                                                                            uploadTemplateList,
                                                                            templateUploadCounts,
                                                                            templateStatusFlags,
                                                                            fileName
                                                                        }}
                                                                        handler={{
                                                                            setUploadTemplateList,
                                                                            setTemplateUploadCounts,
                                                                            setTemplateStatusFlags
                                                                        }}
                                                                    />
                                                                }
                                                            </div>
                                                            <div className={`tab-pane text-center p-2 ${activeTab.index === 2 ? 'show active' : ''}`}>
                                                                {
                                                                    activeTab.index === 2 &&
                                                                    <SubmitTemplate
                                                                        data={{
                                                                            selectedTemplateType,
                                                                            uploadStatusResponse
                                                                        }}
                                                                    />
                                                                }

                                                            </div>
                                                        </div>
                                                        <hr className='cmmn-hline mt-2 mb-2' />
                                                        <ul className="list-inline wizard mb-0">
                                                            <li className="previous list-inline-item">
                                                                <button className={`skel-btn-cancel ${activeTab.index === 0 || activeTab.index === 2 ? 'd-none' : ''}`} id='prev' onClick={handleOnPreviousNext}>Previous</button>
                                                            </li>
                                                            {(activeTab.index === 1) ? (
                                                                <li className="next list-inline-item float-right">
                                                                    <button className="skel-btn-submit" id="finish" onClick={(e) => { handleFinish(e) }}>
                                                                        Finish
                                                                    </button>
                                                                </li>
                                                            ) : (
                                                                <li className="next list-inline-item float-right">
                                                                    <button className={`skel-btn-submit ${activeTab.index === 1 || activeTab.index === 2 ? 'd-none' : ''}`} id="next" onClick={handleOnPreviousNext}>Next</button>
                                                                </li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}

export default CreateBulkUpload