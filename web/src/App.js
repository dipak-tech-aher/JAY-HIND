import React from "react";
import { Switch, Redirect, Router } from "react-router-dom";
import { history } from "./common/util/history";
import { PrivateRoute, PublicRoute } from "./common/route";
import Login from "./Authentication/login";
import Signup from "./Authentication/signup";
import Logout from "./common/logout";
import FAQ from "./Authentication/FAQ";
import LoginToForgotPass from "./Authentication/loginToForgot";
import Register from "./Authentication/register";
import RegisterVerify from "./Authentication/registerVerify";
import ClearAuth from "./common/clearAuth";
import FirstTimeChangePassword from "./Authentication/firstTimeChangePassword";
import ExternalLogin from "./Authentication/ExternalLogin";
import ScrollToTop from "./ScrollToTop";
import OperationalDashboard from "./Dashboard/operational/Dashboard";

import SuspenseFallbackLoader from "./common/components/SuspenseFallbackLoader";
import Request from "./CRM/Request";
import NotificationView from "./Administration/Notification/NotificationView"
import HelpdeskDashboard from "./Dashboard/helpdesk/dashboard";
import UpdateInteraction from "./HelpdeskAndInteraction/Interaction/UpdateInteraction";
import InteractionDashboard from "./Dashboard/interaction/dashboard";

const NewCustomer = React.lazy(() => import('./CRM/Customer/newCustomer'));
const CustomerSearch = React.lazy(() => import('./CRM/Customer/customerSearch'));
const Customer360 = React.lazy(() => import("./CRM/Customer360/customer360"));
const FileUpload = React.lazy(() => import("./common/uploadAttachment/fileUpload"));
const CreateEnquireNewCustomer = React.lazy(() => import("./HelpdeskAndInteraction/Interaction/Inquiry/createInquiryNewCustomer"));
const EditTicketsLandingPage = React.lazy(() => import("./HelpdeskAndInteraction/Interaction/Complaint/EditTicketsLandingPage"));
const CreateComplaintOrServiceRequest = React.lazy(() => import("./HelpdeskAndInteraction/Interaction/Complaint/CreateComplaintOrServiceRequest"));
const ExistingCustomerCreateInquiry = React.lazy(() => import("./HelpdeskAndInteraction/Interaction/Inquiry/exsitingCustomerCreateInquiry"));
const InteractionSearch = React.lazy(() => import("./HelpdeskAndInteraction/Interaction/InteractionSearch/InteractionSearch"));
const AdvanceSearch = React.lazy(() => import("./CRM/AdvanceSearch/AdvanceSearch"));
const EditCustomersInquiryDetails = React.lazy(() => import("./HelpdeskAndInteraction/Interaction/Inquiry/editCustomerInquiryNew"));
const NotificationTable = React.lazy(() => import("./common/notificationTable"));
const AgentChatBox = React.lazy(() => import("./Chat/AgentChat/agent-chat"));
const Billing = React.lazy(() => import("./InvoiceAndBilling/BillGeneration/Billing"));
const SearchContract = React.lazy(() => import("./InvoiceAndBilling/Contract/SearchContract"));
const UnbilledSearchContractView = React.lazy(() => import("./InvoiceAndBilling/Contract/UnbilledSearchContractView"));
const SearchInvoice = React.lazy(() => import("./InvoiceAndBilling/Invoice/SearchInvoice"));
const SearchAccount = React.lazy(() => import("./InvoiceAndBilling/Accounting/SearchAccount"));
const CreateContract = React.lazy(() => import("./InvoiceAndBilling/Contract/CreateContract"));
const BillingUsage = React.lazy(() => import("./InvoiceAndBilling/Invoice/BillingUsage"));
const InvoiceDetailsView = React.lazy(() => import("./InvoiceAndBilling/Invoice/InvoiceDetailsView"));
const AccountBillingDetailsView = React.lazy(() => import("./InvoiceAndBilling/Accounting/AccountDetailsView/AccountBillingDetailsView"));
const ContractSearchView = React.lazy(() => import("./InvoiceAndBilling/Contract/ContractSearchView"));
const NewContract = React.lazy(() => import('./InvoiceAndBilling/Contract/newContract'));
const BillingHistory = React.lazy(() => import("./InvoiceAndBilling/BillGeneration/BillingHistory/BillingHistory"));
const AgentChatListView = React.lazy(() => import("./Chat/agentChatListView"));
const ChatDashboard = React.lazy(() => import("./Chat/chatMonitoring/ChatDashboard"));
const UploadTemplate = React.lazy(() => import("./common/Templates/uploadTemplate"));
const SearchCustomer = React.lazy(() => import("./CRM/Customer/SearchCustomer"));
const HelpdeskContainer = React.lazy(() => import("./HelpdeskAndInteraction/Helpdesk/HelpdeskContainer"));
const HelpdeskSearch = React.lazy(() => import("./HelpdeskAndInteraction/Helpdesk/HelpdeskSearch/HelpdeskSearch"));
const MonitoringSearch = React.lazy(() => import("./HelpdeskAndInteraction/Helpdesk/MonitoringSearch/MonitoringSearch"));
const MonitoringView = React.lazy(() => import("./HelpdeskAndInteraction/Helpdesk/MonitoringSearch/MonitoringView"));
const ViewHelpdeskTicket = React.lazy(() => import("./HelpdeskAndInteraction/Helpdesk/HelpdeskSearch/ViewHelpdeskTicket"));
const WorkflowLayout = React.lazy(() => import("./common/Layout/WorkflowLayout/WorkflowLayout"));
const QAMonitoringLayout = React.lazy(() => import("./common/Layout/QAMonitoringLayout/QAMonitoringLayout"));
const PrintLayout = React.lazy(() => import("./common/Layout/PrintLayout/PrintLayout"));
const PdfARView = React.lazy(() => import("./InvoiceAndBilling/Accounting/AccountDetailsView/PdfARView"));
const Pdf360View = React.lazy(() => import("./CRM/Customer360/Pdf360View"));
const AgentMonitoring = React.lazy(() => import("./HelpdeskAndInteraction/Helpdesk/Monitoring/Monitoring"));
const EditOrderLandingPage = React.lazy(() => import("./HelpdeskAndInteraction/Interaction/Complaint/EditOrder/EditOrderLandingPage"));
const MasterTicket = React.lazy(() => import("./HelpdeskAndInteraction/Interaction/MasterTicket/MasterTicket"));
const CreateInteraction = React.lazy(() => import("./HelpdeskAndInteraction/Interaction/CreateInteraction/CreateInteraction"));
const EditViewInteractionLandingPage = React.lazy(() => import("./HelpdeskAndInteraction/Interaction/EditViewInteraction/EditViewInteractionLandingPage"));
const EditViewOrderInteraction = React.lazy(() => import("./HelpdeskAndInteraction/Interaction/EditViewOrderInteraction"));
const EditViewInteractionPage = React.lazy(() => import("./HelpdeskAndInteraction/Interaction/EditViewInteractionPage"));

// 360 SCREENS
const Interaction360 = React.lazy(() => import("./HelpdeskAndInteraction/Interaction/Interaction360"));
const Order360 = React.lazy(() => import("./HelpdeskAndInteraction/Interaction/Order360"));
const SalesOrder360 = React.lazy(() => import("./InvoiceAndBilling/SalesOrder360/SalesOrder360"));
const CustomerDetailsView = React.lazy(() => import('./CRM/Customer/CustomerDetailsView'));

// Dashboard
const CustomerDashboard = React.lazy(() => import("./Dashboard/CustomerDashboard"));
const OmniChannelDashboard = React.lazy(() => import("./Dashboard/OmniChannel/Dashboard"));
const WhatsAppDashboard = React.lazy(() => import('./Dashboard/whatsApp/WhatsAppDashboard'));
// const CatalougeDashboard = React.lazy(() => import('./Dashboard/catalougeDashboard'));
// const SalesDashboardNew = React.lazy(() => import("./Dashboard/salesDashboardNew"));
// const FinanceDashboard = React.lazy(() => import("./Dashboard/financeDashboard"));
// const AdminDashboard = React.lazy(() => import("./Dashboard/adminDashborad"));
const CustomerEngagement = React.lazy(() => import("./Dashboard/CustomerEngagementDashboard/customerEngagement"));
const ChatAgentDashboard = React.lazy(() => import("./Dashboard/ChatAgentDashboard/Dashboard"));
const SalesDashboard = React.lazy(() => import('./Dashboard/Sales/Dashboard'));


//REPORTS AND BI
const CreatedOrderReport = React.lazy(() => import("./ReportsAndBI/Reports/Order/CreatedOrderReport"));
const OpenOrderReport = React.lazy(() => import("./ReportsAndBI/Reports/Order/OpenOrderReport"));
const ClosedOrderReport = React.lazy(() => import("./ReportsAndBI/Reports/Order/ClosedOrderReport"));
const CreatedCustomerReport = React.lazy(() => import("./ReportsAndBI/Reports/Customer/CreatedCustomerReport"));
const FollowupCountReport = React.lazy(() => import("./ReportsAndBI/Reports/followupCountReport"));
const FollowupReport = React.lazy(() => import("./ReportsAndBI/Reports/followupReport"));
const TATReport = React.lazy(() => import("./ReportsAndBI/Reports/tatReport"));
const FCRMISReport = React.lazy(() => import("./ReportsAndBI/Reports/fcrMisReport"));
const FCRReport = React.lazy(() => import('./ReportsAndBI/Reports/FCRReport'));
const FCRAgentReport = React.lazy(() => import("./ReportsAndBI/Reports/FCRAgentReport"));
const TicketStatisticsReport = React.lazy(() => import("./ReportsAndBI/Reports/TicketStatisticsReport"));
const BIViewer = React.lazy(() => import("./ReportsAndBI/BI/bi-viewer"));
const LoginReport = React.lazy(() => import("./ReportsAndBI/Reports/loginReport"));
const ChatReport = React.lazy(() => import("./ReportsAndBI/Reports/chatReport"));
const AuditTrailReport = React.lazy(() => import("./ReportsAndBI/Reports/auditTrailReport"));
const ProductReport = React.lazy(() => import("./ReportsAndBI/Reports/productReport"));
const BillingReport = React.lazy(() => import("./ReportsAndBI/Reports/billingReport"));
const CreatedInteractionReport = React.lazy(() => import("./ReportsAndBI/Reports/Interaction/createdInteractionReport"));
const OpenInteractionReport = React.lazy(() => import("./ReportsAndBI/Reports/Interaction/openInteractionReport"));
const ClosedInteractionReport = React.lazy(() => import("./ReportsAndBI/Reports/Interaction/closedInteractionReport"));
const SalesReport = React.lazy(() => import("./ReportsAndBI/Reports/salesReport"));
const InvoiceReport = React.lazy(() => import("./ReportsAndBI/Reports/invoiceReport"));
const SLAReport = React.lazy(() => import("./ReportsAndBI/Reports/slaReport"));
const DeptInteractionReport = React.lazy(() => import("./ReportsAndBI/Reports/deptInteractionReport"));
const BIAggregation = React.lazy(() => import("./ReportsAndBI/BI/Aggregation"));

//Adminstration
const RequestStatementList = React.lazy(() => import("./Administration/RequestStatement/RequestStatementList"));
const ConfigurationSettings = React.lazy(() => import("./Administration/Configuration/ConfigurationSettings"));
const SystemParamters = React.lazy(() => import("./Administration/Configuration/SystemParameters"));
const ApplicationDataConfiguration = React.lazy(() => import("./Administration/Configuration/ApplicationDataConfiguration"));
const UserManagement = React.lazy(() => import("./Administration/User/userManagement"));
const OrgHierarchy = React.lazy(() => import("./Administration/Organization/orgHierarchy"));
const NewUserRequest = React.lazy(() => import("./Administration/User/newUserRequest"));
const ApplicationDataConfigurationMenu = React.lazy(() => import("./Administration/Configuration/ApplicationDataConfigurationMenu"));
const AddEditSMSSettings = React.lazy(() => import("./Administration/PortalSetting/SMS/AddEditSMSSettings"));
const ApiSettingList = React.lazy(() => import("./Administration/PortalSetting/API/ApiSettingList"));
const AddEditAPISettings = React.lazy(() => import("./Administration/PortalSetting/APISettings/APISettings"));
const AddEditLDAPSettings = React.lazy(() => import("./Administration/PortalSetting/LdapSettings/LdapSettings"));
const channelSettings = React.lazy(() => import("./Administration/PortalSetting/ChannelSettings/ChannelSettings"));
const ApplicationLog = React.lazy(() => import("./Administration/PortalSetting/LOGS/ApplicationLog"));
const ServiceStatus = React.lazy(() => import("./Administration/PortalSetting/LOGS/ServiceStatus"));
const QAMonitoring = React.lazy(() => import("./Administration/PortalSetting/QAMonitoring/QAMonitoring"));
const SearchBulkUpload = React.lazy(() => import("./Administration/BulkUpload/SearchBulkUpload"));
const CreateBulkUpload = React.lazy(() => import("./Administration/BulkUpload/CreateBulkUpload"));
const SlaSettings = React.lazy(() => import("./Administration/PortalSetting/SLA/SlaSettings"));
const AddEditMapWorkflow = React.lazy(() => import("./Administration/MapWorkflow/AddEditMapWorkflow"));
const MapWorkflowList = React.lazy(() => import("./Administration/MapWorkflow/MapWorkflowList"));
const PortalSettingMenu = React.lazy(() => import("./Administration/PortalSetting/PortalSettingMenu"));
const AddEditSMTPSettings = React.lazy(() => import("./Administration/PortalSetting/SMTP/AddEditSMTPSettings"));
const EmailSmsTemplateList = React.lazy(() => import("./Administration/PortalSetting/EmailSmsTemplate/EmailSmsTemplateList"));
const WFViewer = React.lazy(() => import("./Administration/Workflow/wfViewer"));
const WFModeler = React.lazy(() => import("./Administration/Workflow/wfModeler"));
const AddEditWorkflow = React.lazy(() => import("./Administration/Workflow/addEditWorkflow"));
const WFStatusViewer = React.lazy(() => import("./Administration/Workflow/wfStatusViewer"));
const AddParameter = React.lazy(() => import("./Administration/ManageParameters/addParameter"));
const EditParameter = React.lazy(() => import("./Administration/ManageParameters/editParameter"));
const ParametersMapping = React.lazy(() => import("./Administration/ManageParameters/ParametersMapping"));
const ManageParameters = React.lazy(() => import("./Administration/ManageParameters/manageParameters"));
const MyProfile = React.lazy(() => import("./Administration/User/Profile/myProfile"));
const EditProfile = React.lazy(() => import("./Administration/User/Profile/EditProfile"));
const UserManagementForm = React.lazy(() => import("./Administration/User/userManagementForm"));
const UserView = React.lazy(() => import("./Administration/userView"));
const RoleTable = React.lazy(() => import("./Administration/RolesAndPermissions/RoleTable"));
const NewRole = React.lazy(() => import("./Administration/RolesAndPermissions/NewRole"));
const UpdateRole = React.lazy(() => import("./Administration/RolesAndPermissions/UpdateRole"));
// TEMPLATES COMPONENTS START
const Templates = React.lazy(() => import("./Templates"));
const MapTemplate = React.lazy(() => import("./Templates/MapTemplate"));
const MapTemplateForm = React.lazy(() => import("./Templates/MapTemplateForm"));
const AppoinmentDashboard = React.lazy(() => import("./Dashboard/appoinment/AppoinmentDashboard"));
const BusinessConfig = React.lazy(() => import("./common/header/BusinessConfig"));
// TEMPLATES COMPONENTS END

//PRODUCT MASTER START

const AddEditCharge = React.lazy(() => import("./ProductCatalog/Charge/AddEditCharge"));
const ListCharge = React.lazy(() => import("./ProductCatalog/Charge/ListCharge"));
const CreateProduct = React.lazy(() => import("./ProductCatalog/CreateProduct"));
const SearchProduct = React.lazy(() => import("./ProductCatalog/SearchProduct"));
const BundleProductMapping = React.lazy(() => import("./ProductCatalog/Bundle/AddEditMapBundle"));
//PRODUCT MASTER END

// SearchAR 

const searchAR = React.lazy(() => import("./InvoiceAndBilling/AR/SearchAR"))


//INVENTORY MASTER START
const VendorList = React.lazy(() => import("./Inventory/VendorManagement/VendorList"));
const AddInventory = React.lazy(() => import("./Inventory/InventoryManagement/CreateInventoryItem"));
const SearchInventory = React.lazy(() => import("./Inventory/InventoryManagement/InventoryList"));
//INVENTORY MASTER END

// const BIToolCreation = React.lazy(() => import("./BITool/BIToolCreation"));
const BIToolCreation = React.lazy(() => import("./ReportsAndBI/BI/BILogin"));

function App() {
  return (
    <Router history={history} basename={`${process.env.REACT_APP_BASE}`}>
      <ScrollToTop />
      <React.Suspense fallback={SuspenseFallbackLoader}>
        <Switch>
          <PublicRoute exact path={`${process.env.REACT_APP_BASE}/user/login`} component={Login} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/logout`} component={Logout} />
          <PublicRoute exact path={`${process.env.REACT_APP_BASE}/user/faq`} component={FAQ} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/clearAuth`} component={ClearAuth} />
          <PublicRoute exact path={`${process.env.REACT_APP_BASE}/user/signup/:inviteToken`} component={Signup} />
          <PublicRoute exact path={`${process.env.REACT_APP_BASE}/user/forgotpassword`} component={LoginToForgotPass} />
          <PublicRoute exact path={`${process.env.REACT_APP_BASE}/user/register`} component={Register} />
          <PublicRoute exact path={`${process.env.REACT_APP_BASE}/user/registerverify/:inviteToken`} component={RegisterVerify} />

          {/* <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/design-form`} component={AddEditForm} props={{ screenName: 'Form Designer', screenAction: 'Edit' }} /> */}
          <PublicRoute exact path={`${process.env.REACT_APP_BASE}/wf-modeler`} component={WFModeler} props={{ screenName: 'Workflow Designer', screenAction: 'Edit' }} />
          <PublicRoute exact path={`${process.env.REACT_APP_BASE}/wf-viewer`} component={WFViewer} props={{ screenName: 'Workflow Designer', screenAction: 'View' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/wf-addedit`} component={AddEditWorkflow} props={{ screenName: 'Workflow Designer', screenAction: 'Add/Update' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/wf-status-viewer`} component={WFStatusViewer} props={{ screenName: 'Workflow Designer', screenAction: 'Status View' }} />

          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/admin-user-view`} component={UserView} props={{ screenName: 'Admin Management', screenAction: 'View' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/search`} component={CustomerSearch} props={{ screenName: 'Customer Management', screenAction: 'Search' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/new-customer`} component={NewCustomer} props={{ screenName: 'Customer Management', screenAction: 'Create' }} />
          {/* <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/new-service-account`} component={NewServiceAccount} props={{screenName: 'User Management', screenAction: 'Search'}}/> */}
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/customer360`} component={Customer360} props={{ screenName: 'Customer 360', screenAction: 'View' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/create-inquiry-new-customer`} component={CreateEnquireNewCustomer} props={{ screenName: 'Inquiry', screenAction: 'Create' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/create-inquiry-existing-customer`} component={ExistingCustomerCreateInquiry} props={{ screenName: 'Inquiry', screenAction: 'Create' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/edit-customer-inquiry`} component={EditCustomersInquiryDetails} props={{ screenName: 'Inquiry', screenAction: 'Edit' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/`} component={OperationalDashboard} props={{ screenName: 'Dashboard', screenAction: 'Operational' }} />

          {/* <PublicRoute exact path={`${process.env.REACT_APP_BASE}/`} component={HomeScreen} props={{screenName: 'User Management', screenAction: 'Search'}}/> */}
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/role`} component={RoleTable} props={{ screenName: 'Role Management', screenAction: 'Search' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/newrole`} component={NewRole} props={{ screenName: 'Role Management', screenAction: 'Create' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/attachment`} component={FileUpload} props={{ screenName: 'Attachment', screenAction: 'Add' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/updaterole`} component={UpdateRole} props={{ screenName: 'Role Management', screenAction: 'Update' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/create-complaint`} component={CreateComplaintOrServiceRequest} props={{ screenName: 'Complaint', screenAction: 'Create' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/create-service-request`} component={CreateComplaintOrServiceRequest} props={{ screenName: 'Request', screenAction: 'Create' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/edit-complaint`} component={EditTicketsLandingPage} props={{ screenName: 'Complaint', screenAction: 'Update' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/edit-inquiry`} component={EditTicketsLandingPage} props={{ screenName: 'Inquiry', screenAction: 'Update' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/edit-service-request`} component={EditTicketsLandingPage} props={{ screenName: 'Request', screenAction: 'Update' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/ticket-search`} component={InteractionSearch} props={{ screenName: 'Interaction', screenAction: 'Search' }} />
          {/* <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/lead`} component={LeadDataTable} props={{screenName: 'User Management', screenAction: 'Search'}}/> */}
          {/* <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/edit-service-request`} component={EditServiceRequest} props={{screenName: 'User Management', screenAction: 'Search'}}/> */}
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/manage-parameters`} component={ManageParameters} props={{ screenName: 'Parameter Management', screenAction: 'View' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/edit-parameters`} component={EditParameter} props={{ screenName: 'Parameter Management', screenAction: 'Update' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/add-parameters`} component={AddParameter} props={{ screenName: 'Parameter Management', screenAction: 'Create' }} />
          {/* <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/notification`} component={NotificationTable} props={{ screenName: 'Notification', screenAction: 'View' }} /> */}
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/edit-customer`} component={NewCustomer} props={{ screenName: 'Customer Management', screenAction: 'Create' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/mapping-parameters`} component={ParametersMapping} props={{ screenName: 'Parameter Management', screenAction: 'Search' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/advance-search`} component={AdvanceSearch} props={{ screenName: 'Advance Search', screenAction: 'View' }} />
          {/*<PrivateRoute exact path={`${process.env.REACT_APP_BASE}/new-user-request`} component={NewUserRequest} props={{screenName: 'User Management', screenAction: 'Search'}}/>*/}
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/user/myprofile`} component={MyProfile} props={{ screenName: 'My Account', screenAction: 'View' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/business-config`} component={BusinessConfig} props={{ screenName: 'Business Config', screenAction: 'Edit' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/user/editprofile`} component={EditProfile} props={{ screenName: 'My Account', screenAction: 'Edit' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/new-contract`} component={NewContract} props={{ screenName: 'Contract Management', screenAction: 'Create' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/add-charge`} component={AddEditCharge} props={{ screenName: 'Charge Management', screenAction: 'Create' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/list-charge`} component={ListCharge} props={{ screenName: 'Charge Management', screenAction: 'List' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/create-product`} component={CreateProduct} props={{ screenName: 'Product Management', screenAction: 'Add' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/search-product`} component={SearchProduct} props={{ screenName: 'Product Management', screenAction: 'Search' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/edit-charge`} component={AddEditCharge} props={{ screenName: 'Charge Management', screenAction: 'Update' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/product-bundle-list`} component={BundleProductMapping} props={{ screenName: 'Product Bundle Management', screenAction: 'Map' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/agent-chat`} component={AgentChatBox} props={{ screenName: 'Chat Management', screenAction: 'View' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/agentChatListView`} component={AgentChatListView} props={{ screenName: 'Chat Management', screenAction: 'List' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/chat-monitoring`} component={ChatDashboard} props={{ screenName: 'Dashboard', screenAction: 'Chat' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/billing`} component={Billing} props={{ screenName: 'Billing Management', screenAction: 'View' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/billing-history`} component={BillingHistory} props={{ screenName: 'Billing Management', screenAction: 'View' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/billing-usage`} component={BillingUsage} props={{ screenName: 'Billing Management', screenAction: 'View' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/create-contract`} component={CreateContract} props={{ screenName: 'Contract Management', screenAction: 'Create' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/search-contract`} component={SearchContract} props={{ screenName: 'Contract Management', screenAction: 'Search' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/unbilled-search-contract`} component={SearchContract} props={{ screenName: 'Contract Management', screenAction: 'View' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/contract-search-view`} component={ContractSearchView} props={{ screenName: 'Contract Management', screenAction: 'Search' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/unbilled-contract-search-view`} component={UnbilledSearchContractView} props={{ screenName: 'Contract Management', screenAction: 'View' }} />

          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/search-invoice`} component={SearchInvoice} props={{ screenName: 'Invoice Management', screenAction: 'Search' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/search-account`} component={SearchAccount} props={{ screenName: 'Invoice Management', screenAction: 'Search' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/invoice-details-view`} component={InvoiceDetailsView} props={{ screenName: 'Invoice Management', screenAction: 'View' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/account-billing-details-view`} component={AccountBillingDetailsView} props={{ screenName: 'AR', screenAction: 'View' }} />

          {/* DASHBOARD STARTS*/}

          {/* <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/catalouge-dashboard`} component={CatalougeDashboard} props={{ screenName: 'Dashboard', screenAction: 'Product Catalog' }} /> */}
          {/* <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/sales-dashboard`} component={SalesDashboardNew} props={{ screenName: 'Dashboard', screenAction: 'Sales' }} /> */}
          {/* <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/finance-dashboard`} component={FinanceDashboard} props={{ screenName: 'Dashboard', screenAction: 'Finance' }} /> */}
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/operational-dashboard`} component={OperationalDashboard} props={{ screenName: 'Dashboard', screenAction: 'Operational' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/appointment-dashboard`} component={AppoinmentDashboard} props={{ screenName: 'Dashboard', screenAction: 'Appoinment' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/agent-chat-dashboard`} component={ChatAgentDashboard} props={{ screenName: 'Dashboard', screenAction: 'Chat Agent' }} />

          {/* <PublicRoute exact path={`${process.env.REACT_APP_BASE}/sales-dashboard-new`} component={SalesDashboardNew} props={{ screenName: 'Dashboard', screenAction: 'Sales' }} /> */}
          {/* <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/admin-dashboard`} component={AdminDashboard} props={{ screenName: 'Dashboard', screenAction: 'Admin' }} /> */}
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/customer-engagement-dashboard`} component={CustomerEngagement} props={{ screenName: 'Dashboard', screenAction: 'Customer Engagement' }} />
          {/* DASHBOARD ENDS*/}

          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/helpdesk`} component={HelpdeskContainer} props={{ screenName: 'Helpdesk Management', screenAction: 'Create' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/helpdesk-search`} component={HelpdeskSearch} props={{ screenName: 'Helpdesk Management', screenAction: 'Search' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/view-helpdesk-ticket`} component={ViewHelpdeskTicket} props={{ screenName: 'Helpdesk Management', screenAction: 'View' }} />
          {/* <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/new-service`} component={AddNewService} props={{screenName: 'User Management', screenAction: 'Search'}}/> */}


          <PublicRoute exact path={`${process.env.REACT_APP_BASE}/user/change-password/:forgotpasswordtoken`} component={FirstTimeChangePassword} />

          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/login-report`} component={LoginReport} props={{ screenName: 'Report', screenAction: 'Login' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/chat-report`} component={ChatReport} props={{ screenName: 'Report', screenAction: 'Chat' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/audit-trail-report`} component={AuditTrailReport} props={{ screenName: 'Report', screenAction: 'Audit' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/product-report`} component={ProductReport} props={{ screenName: 'Report', screenAction: 'Product' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/billing-report`} component={BillingReport} props={{ screenName: 'Report', screenAction: 'Billing' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/created-interaction-report`} component={CreatedInteractionReport} props={{ screenName: 'Report', screenAction: 'Created Interaction' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/open-interaction-report`} component={OpenInteractionReport} props={{ screenName: 'Report', screenAction: 'Open Interaction' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/closed-interaction-report`} component={ClosedInteractionReport} props={{ screenName: 'Report', screenAction: 'Closed Interaction' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/sales-report`} component={SalesReport} props={{ screenName: 'Report', screenAction: 'Sales' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/invoice-report`} component={InvoiceReport} props={{ screenName: 'Report', screenAction: 'Invoice' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/sla-report`} component={SLAReport} props={{ screenName: 'Report', screenAction: 'SLA' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/dep-interaction-report`} component={DeptInteractionReport} props={{ screenName: 'Report', screenAction: 'Department Interaction' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/upload-template`} component={UploadTemplate} props={{ screenName: 'Bulk Upload', screenAction: 'Upload' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/customer-search`} component={SearchCustomer} props={{ screenName: 'Customer Management', screenAction: 'Search' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/portal-settings`} component={PortalSettingMenu} props={{ screenName: 'Portal Settings', screenAction: 'Menu' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/portal-settings/smtp`} component={AddEditSMTPSettings} props={{ screenName: 'Portal Settings', screenAction: 'SMTP' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/portal-settings/sms`} component={AddEditSMSSettings} props={{ screenName: 'Portal Settings', screenAction: 'SMS' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/portal-settings/api-setting`} component={ApiSettingList} props={{ screenName: 'Portal Settings', screenAction: 'API' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/portal-settings/email-sms-template`} component={EmailSmsTemplateList} props={{ screenName: 'Portal Settings', screenAction: 'EMAIL' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/bi-viewer`} component={BIViewer} props={{ screenName: 'BI Management', screenAction: 'View' }} />
          {/* <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/test`} component={Test} props={{screenName: 'User Management', screenAction: 'Search'}}/>*/}
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/map-workflow-template`} layout={WorkflowLayout} component={AddEditMapWorkflow} props={{ screenName: 'Workflow Management', screenAction: 'Mapping' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/map-workflow-template-list`} layout={WorkflowLayout} component={MapWorkflowList} props={{ screenName: 'Workflow Management', screenAction: 'List' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/portal-settings/quality-monitoring/evaluation`} layout={QAMonitoringLayout} component={QAMonitoring} props={{ screenName: 'Portal Settings', screenAction: 'Evaluation' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/portal-settings/quality-monitoring/guidelines`} layout={QAMonitoringLayout} component={QAMonitoring} props={{ screenName: 'Portal Settings', screenAction: 'Guidelines' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/search-bulk-upload`} component={SearchBulkUpload} props={{ screenName: 'Bulk Upload', screenAction: 'Upload' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/create-bulk-upload`} component={CreateBulkUpload} props={{ screenName: 'Bulk Upload', screenAction: 'Upload' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/monitoring-search`} component={MonitoringSearch} props={{ screenName: 'Quality Monitoring', screenAction: 'Search' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/quality-monitoring-view`} component={MonitoringView} props={{ screenName: 'Quality Monitoring', screenAction: 'View' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/customer360/preview-print`} layout={PrintLayout} component={Pdf360View} props={{ screenName: 'Customer 360', screenAction: 'Print' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/account-receivable/preview-print`} layout={PrintLayout} component={PdfARView} props={{ screenName: 'AR', screenAction: 'Print' }} />
          <PublicRoute exact path={`${process.env.REACT_APP_BASE}/user/external-login`} component={ExternalLogin} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/followup-count-report`} component={FollowupCountReport} props={{ screenName: 'Report', screenAction: 'Follow Up Count' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/followup-report`} component={FollowupReport} props={{ screenName: 'Report', screenAction: 'Follow Up' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/tat-report`} component={TATReport} props={{ screenName: 'Report', screenAction: 'TAT' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/fcr-mis-report`} component={FCRMISReport} props={{ screenName: 'Report', screenAction: 'FCR-MIS' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/fcr-report`} component={FCRReport} props={{ screenName: 'Report', screenAction: 'FCR' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/fcr-agent-report`} component={FCRAgentReport} props={{ screenName: 'Report', screenAction: 'FCR Agent' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/ticket-statistics-report`} component={TicketStatisticsReport} props={{ screenName: 'Report', screenAction: 'Statistics' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/portal-settings/add-api-settings`} component={AddEditAPISettings} props={{ screenName: 'Portal Settings', screenAction: 'API' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/portal-settings/add-ldap-settings`} component={AddEditLDAPSettings} props={{ screenName: 'Portal Settings', screenAction: 'LDAP' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/portal-settings/channel-settings`} component={channelSettings} props={{ screenName: 'Portal Settings', screenAction: 'Channel' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/portal-settings/sla-settings`} component={SlaSettings} props={{ screenName: 'Portal Settings', screenAction: 'SLA' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/edit-work-order`} component={EditOrderLandingPage} props={{ screenName: 'Order Management', screenAction: 'Update' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/agent-monitoring`} component={AgentMonitoring} props={{ screenName: 'Agent Monitoring', screenAction: 'Update' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/sales-order-360`} component={SalesOrder360} props={{ screenName: 'Order 360', screenAction: 'View' }} />
          <PublicRoute exact path={`${process.env.REACT_APP_BASE}/customer-dashboard`} component={CustomerDashboard} props={{ screenName: 'Dashboard', screenAction: 'Customer' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/portal-settings/application-logs`} component={ApplicationLog} props={{ screenName: 'Portal Settings', screenAction: 'Search' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/portal-settings/service-status`} component={ServiceStatus} props={{ screenName: 'Portal Settings', screenAction: 'Service Status' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/master-ticket`} component={MasterTicket} props={{ screenName: 'Master Management', screenAction: 'Search' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/create-master-ticket`} component={MasterTicket} props={{ screenName: 'Master Management', screenAction: 'Create' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/edit-master-ticket`} component={MasterTicket} props={{ screenName: 'Master Management', screenAction: 'Update' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/whatsapp-dashboard`} component={WhatsAppDashboard} props={{ screenName: 'Dashboard', screenAction: 'WhatsApp' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/create-interaction`} component={CreateInteraction} props={{ screenName: 'Interaction Management', screenAction: 'Create' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/edit-view-interaction`} component={EditViewInteractionLandingPage} props={{ screenName: 'Interaction Management', screenAction: 'View/Update' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/view-customer`} component={CustomerDetailsView} props={{ screenName: 'Customer Management', screenAction: 'View' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/edit-order`} component={EditViewOrderInteraction} props={{ screenName: 'Order Management', screenAction: 'Update' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/edit-interaction`} component={EditViewInteractionPage} props={{ screenName: 'Interaction Management', screenAction: 'Update' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/update-user`} component={UserManagementForm} props={{ screenName: 'User Management', screenAction: 'Create/Update' }} />

          {/* System Configuration */}
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/configuration-settings`} component={ConfigurationSettings} props={{ screenName: 'Configuration Settings', screenAction: 'View' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/system-parameters`} component={SystemParamters} props={{ screenName: 'System Parameters', screenAction: 'Edit' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/application-data-configuration`} component={ApplicationDataConfigurationMenu} layout={ApplicationDataConfiguration} props={{ screenName: 'Application Data Configuration', screenAction: 'View', screenInfo: 'Application Data Configuration' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/user-management`} component={UserManagement} layout={ApplicationDataConfiguration} props={{ screenName: 'User Managment', screenAction: 'View', screenInfo: 'User Data Configuration' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/organisation-management`} component={OrgHierarchy} layout={ApplicationDataConfiguration} props={{ screenName: 'Business Unit Managment', screenAction: 'View', screenInfo: 'Business Unit Data Configuration' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/role-management`} component={RoleTable} layout={ApplicationDataConfiguration} props={{ screenName: 'Role Managment', screenAction: 'View', screenInfo: 'Role Data Configuration' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/business-parameter-management`} component={ManageParameters} layout={ApplicationDataConfiguration} props={{ screenName: 'Business Parameter Management', screenAction: 'View', screenInfo: 'Business Parameter Data Configuration' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/request-statement-list`} component={RequestStatementList} layout={ApplicationDataConfiguration} props={{ screenName: 'Request Statement Configuration', screenAction: 'View', screenInfo: 'Request Statement Data Configuration' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/business-parameter-mapping`} component={ManageParameters} layout={ApplicationDataConfiguration} props={{ screenName: 'Business Parameter Mapping', screenAction: 'View', screenInfo: 'Business Parameter Mapping Configuration' }} />

          {/* APPOINTMENT ROUTES START */}

          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/templates`} component={Templates} props={{ screenName: 'Template Management', screenAction: 'Create' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/map-templates`} component={MapTemplate} props={{ screenName: 'Template Management', screenAction: 'View' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/map-template-form`} component={MapTemplateForm} props={{ screenName: 'Template Management', screenAction: 'Map' }} />

          {/* APPOINTMENT ROUTES END */}

          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/closed-order-report`} component={ClosedOrderReport} props={{ screenName: 'Report', screenAction: 'Closed Order' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/open-order-report`} component={OpenOrderReport} props={{ screenName: 'Report', screenAction: 'Open Order' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/created-order-report`} component={CreatedOrderReport} props={{ screenName: 'Report', screenAction: 'Created Order' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/created-customer-report`} component={CreatedCustomerReport} props={{ screenName: 'Report', screenAction: 'Created Customer' }} />

          {/** OMNI CHANNEL DASHBOARD */}
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/omni-channel-dashboard`} component={OmniChannelDashboard} props={{ screenName: 'Dashboard', screenAction: 'Omni Channel Dashboard' }} />

          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/new-user-management`} component={NewUserRequest} props={{ screenName: 'User Management', screenAction: 'Create' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/interaction360`} component={Interaction360} props={{ screenName: 'Interaction 360', screenAction: 'View' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/order360`} component={Order360} props={{ screenName: 'Order 360', screenAction: 'View' }} />

          {/* REQUEST ROUTES START */}
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/manage-request`} component={Request} props={{ screenName: 'Request', type: "open", screenAction: 'Manage Request' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/closed-request`} component={Request} props={{ screenName: 'Request', type: "closed", screenAction: 'Closed Request' }} />
          {/* REQUEST ROUTES END */}

          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/search-ar`} component={searchAR} props={{ screenName: 'AR', screenAction: 'Search' }} />

          {/* INVENTORY ROUTE START */}
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/create-item`} component={AddInventory} props={{ screenName: 'Inventory Management', screenAction: 'Add' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/item-list`} component={SearchInventory} props={{ screenName: 'Inventory Management', screenAction: 'Search' }} />
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/vendor-list`} component={VendorList} props={{ screenName: 'Inventory Management', screenAction: 'Vendor List' }} />
          {/* INVENTORY ROUTE END */}
          {/* Notification  */}
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/notification`} component={NotificationView} props={{ screenName: 'Notification', screenAction: 'View' }} />

          {/* Sales Dashboard */}
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/sales-dashboard`} component={SalesDashboard} props={{ screenName: 'Sales Dashboard', screenAction: 'View' }} />
          <PublicRoute exact path={`${process.env.REACT_APP_BASE}/bi-creation`} component={BIToolCreation} props={{ screenName: 'BI', screenAction: 'Create' }} />

          {/* Helpdesk Dashboard */}
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/helpdesk-dashboard`} component={HelpdeskDashboard} props={{ screenName: 'Helpdesk Dashboard', screenAction: 'View' }} />

          {/* Interaction Dashboard */}
          <PrivateRoute exact path={`${process.env.REACT_APP_BASE}/interaction-dashboard`} component={InteractionDashboard} props={{ screenName: 'Interaction Dashboard', screenAction: 'View' }} />

          {/* Interaction update route */}
          <PublicRoute exact path={`${process.env.REACT_APP_BASE}/update-interaction-status/:token`} component={UpdateInteraction} props={{ screenName: 'BI', screenAction: 'Create' }} />
       
          {/* BI Aggregation */}
          <PublicRoute exact path={`${process.env.REACT_APP_BASE}/bi-aggregation`} component={BIAggregation} props={{ screenName: 'BI', screenAction: 'Create' }} />

          <Redirect to={`${process.env.REACT_APP_BASE}/`} />
        </Switch>
      </React.Suspense>
    </Router>
  );
}

export default App;

