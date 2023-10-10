import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Link, Element } from 'react-scroll';
import * as XLSX from "xlsx";
import { get, post } from "../../common/util/restUtil";

import { toast } from "react-toastify";
import { properties } from "../../properties";
import DynamicTable from '../table/DynamicTable';
// import CampaignUploadList from './campaignUploadList';
import { useTranslation } from "react-i18next";
import ProductCatalogTemplate from './Product_catalog_template.xlsx'
import incident_template from './incident_template.xlsx'
import sales_orderTemplate from './sales_order_template.xlsx'
import customer_template from './customer_template.xlsx'
import Contract_template from './Contract_template.xlsx'
import moment from 'moment';
import ProductCatalogTemplateCols from './ProductCatalogTemplateCols'
import CustomerCols from './customerCols'
import ContractCols from './contractCols'
import SalesOrderCols from "./salesOrderCols";
import IncidentCols from "./incidentCols";

const UploadTemplate = () => {
    const history = useHistory();
    const [error, setError] = useState(false);
    const { t } = useTranslation();
    const [campaign, setCampaign] = useState([]);
    const [file, setFile] = useState();
    const options = [
        { label: "Contract Template", value: "contract" },
        { label: "Cutomer Template", value: "customer" },
        { label: "Product Catalog Template", value: "product catalog" },
        { label: "Incident Template", value: "incident" },
        { label: "Sales Order Template", value: "sales order" },
    ]
    const [renderMode, setRenderMode] = useState({
        isContract: false,
        isCustomer: false,
        isCatalog: false,
        isIncident: false,
        isSales: false,
    })
    const [selectedTemplateType, setSelectedTemplateType] = useState(false);
    const [isTemplateTypeSelected, setIsTemplateTypeSelected] = useState(false);
    const [data, setData] = useState([])
    // let arrayCamps = []
    // const [ServiceNumbers, setServiceNumbers] = useState([]);
    // const [campaignNames, setCampaignNames] = useState([])

    // useEffect(() => {
    //     
    //     get(properties.CONNECTION_API)
    //         .then((resp) => {
    //             if (resp.status == 200) {
    //                 setServiceNumbers(resp.data)
    //             }
    //         })
    //         .finally();
    //     post(`${properties.CAMPAIGN_API}/list?allNames=` + true)
    //         .then((response) => {
    //             setCampaignNames(response.data)

    //         })
    //         .finally()
    // }, []);


    const readExcel = () => {
        let fi = document.getElementById('file');
        var extension = file.name.substr(file.name.lastIndexOf('.'));
        if ((extension.toLowerCase() === ".xls") || (extension.toLowerCase() === ".xlsx")) {
            setError(false)
        }
        else {
            setError(true)
            toast.error(file.name + ' is not a excel file, Please try again');
            return false;
        }

        if (fi.files.length > 0) {
            for (let i = 0; i <= fi.files.length - 1; i++) {
                let fsize = fi.files.item(i).size;
                if (fsize > 5242880) {
                    setError(true)
                    toast.error("File too Big, please select a file less than 4mb");
                    history.push(`${process.env.REACT_APP_BASE}/`)
                }
            }
        }
        if (error) { return; } else {
            const promise = new Promise((resolve, reject) => {
                const fileReader = new FileReader();
                fileReader.readAsArrayBuffer(file);
                fileReader.onload = (e) => {
                    const bufferArray = e.target.result;
                    const wb = XLSX.read(bufferArray, { type: "buffer" });
                    const wsname = wb.SheetNames[0];
                    const ws = wb.Sheets[wsname];
                    const data = XLSX.utils.sheet_to_json(ws);
                    resolve(data);
                };
                fileReader.onerror = (error) => {
                    reject(error);
                };
            });
            promise.then((d) => {
                console.log(d)
                validation(d);
                fi.value = "";
                setFile(null)
            }).catch((error) => {
                console.log(error)
            });
        }
    };

    const validation = async (d) => {
        let acceptFile = false
        
        let array = []
        const todayDate = moment(new Date()).format('DD MMM YYYY')

        if (renderMode.isCatalog === true) {
            d.map((z) => {
                if ("Product Name" in z && "Product Type" in z && "Service Type" in z && "Start Date" in z
                ) {
                    acceptFile = true
                    if (moment(z["Start Date"]).isBefore(todayDate) || moment(z["End Date"]).isBefore(todayDate) || moment(z["Start Date"]).isAfter(z["End Date"])) {
                        toast.error("Invalid date range in one or more rows")
                        acceptFile = false
                        setIsTemplateTypeSelected(false)

                    }
                    let today = new Date(z["Start Date"])
                    let date = today.getDate() + "-" + parseInt(today.getMonth() + 1) + "-" + today.getFullYear();
                    z["Start Date"] = date
                    today = new Date(z["End Date"])
                    date = today.getDate() + "-" + parseInt(today.getMonth() + 1) + "-" + today.getFullYear();
                    z["End Date"] = date
                }


            })


        }
        else if (renderMode.isContract === true) {

            d.map((z) => {
                if ("Customer Reference No" in z && "Contract Start Date" in z && "Contract End Date" in z && "Product Name" in z &&
                    "Product Start Date" in z && "Product End Date" in z && "Status" in z && "Statuss" in z
                ) {
                    acceptFile = true
                    if (moment(z["Contract Start Date"]).isBefore(todayDate) || moment(z["Contract End Date"]).isBefore(todayDate) || moment(z["Contract Start Date"]).isAfter(z["Contract End Date"])) {
                        toast.error("Invalid date range in one or more rows")
                        acceptFile = false
                        setIsTemplateTypeSelected(false)

                    }
                    if (moment(z["Product Start Date"]).isBefore(todayDate) || moment(z["Product End Date"]).isBefore(todayDate) || moment(z["Product Start Date"]).isAfter(z["Product End Date"])) {
                        toast.error("Invalid date range in one or more rows")
                        acceptFile = false
                        setIsTemplateTypeSelected(false)

                    }
                    let today = new Date(z["Contract Start Date"])
                    let date = today.getDate() + "-" + parseInt(today.getMonth() + 1) + "-" + today.getFullYear();
                    z["Contract Start Date"] = date

                    today = new Date(z["Contract End Date"])
                    date = today.getDate() + "-" + parseInt(today.getMonth() + 1) + "-" + today.getFullYear();
                    z["Contract End Date"] = date

                    today = new Date(z["Product Start Date"])
                    date = today.getDate() + "-" + parseInt(today.getMonth() + 1) + "-" + today.getFullYear();
                    z["Product Start Date"] = date

                    today = new Date(z["Product End Date"])
                    date = today.getDate() + "-" + parseInt(today.getMonth() + 1) + "-" + today.getFullYear();
                    z["Product End Date"] = date
                }

            })

        }


        else if (renderMode.isCustomer === true) {

            d.map((z) => {
                if ("Customer Reference No" in z && "First Name" in z && "Customer Type" in z && "Status" in z && "No" in z && "District" in z && "Postcode" in z && "Country" in z && "Contact No" in z && "Email" in z
                ) {
                    acceptFile = true
                }
            })

        }




        else if (renderMode.isSales === true) {

            d.map((z) => {
                if ("SO ID" in z && "Customer Reference No" in z && "Description" in z && "Current Status" in z && "Created Date" in z && "Recent Modified Date" in z &&
                    "SO Type" in z && "SLA Breached" in z && "Product Name" in z && "Product Start Date" in z && "Product End Date" in z
                ) {
                    acceptFile = true
                    if (moment(z["Product Start Date"]).isBefore(todayDate) || moment(z["Product End Date"]).isBefore(todayDate) || moment(z["Product Start Date"]).isAfter(z["Product End Date"])) {
                        toast.error("Invalid date range in one or more rows")
                        acceptFile = false
                        setIsTemplateTypeSelected(false)

                    }
                }
            })

        }

        else if (renderMode.isIncident === true) {

            d.map((z) => {
                if ("Incident ID" in z && "Customer Reference No" in z && "Description" in z && "Current Status" in z && "Created Date" in z && "Recent Modified Date" in z &&
                    "Incident Type" in z && "SLA Breached" in z
                ) {
                    acceptFile = true
                }
            })

        }
        if (acceptFile === false) {
            toast.error("Fields are not matching, Please try again")
            
            setIsTemplateTypeSelected(false)
            return false;
        }
        toast.success(file.name + ' uploaded successfully');
        acceptFile = true
        

        setData(d)



    }



    const handleTemplates = (value) => {

        console.log(value)
        if (value === "contract") {
            setRenderMode({
                ...renderMode,
                isContract: true,
                isCustomer: false,
                isCatalog: false,
                isIncident: false,
                isSales: false,
            })
        }
        else if (value === "customer") {
            setRenderMode({
                ...renderMode,
                isContract: false,
                isCustomer: true,
                isCatalog: false,
                isIncident: false,
                isSales: false,
            })
        }

        else if (value === "product catalog") {
            setRenderMode({
                ...renderMode,
                isContract: false,
                isCustomer: false,
                isCatalog: true,
                isIncident: false,
                isSales: false,
            })
        }
        else if (value === "incident") {
            setRenderMode({
                ...renderMode,
                isContract: false,
                isCustomer: false,
                isCatalog: false,
                isIncident: true,
                isSales: false,
            })
        }
        else if (value === "sales order") {
            setRenderMode({
                ...renderMode,
                isContract: false,
                isCustomer: false,
                isCatalog: false,
                isIncident: false,
                isSales: true,
            })
        }


    }

    const handleCellRender = (cell, row) => {
        return (<span>{cell.value}</span>)
    }
    const handleClick = () => {
        console.log(data)

        if (renderMode.isCatalog === true) {
            let tempArray = []
            data.map((e) => {
                let obj = {}
                obj.ProductName = e["Product Name"]
                obj.ProductType = e["Product Type"]
                obj.IsBundle = e["Is Bundle"]
                obj.BundleName = e["Bundle Name"]
                obj.ServiceType = e["Service Type"]
                obj.StartDate = e["Start Date"]
                obj.EndDate = e["End Date"]
                obj.ChargeName = e["Charge Name"]
                obj.ChargeCategory = e["Charge Category"]
                obj.Currency = e["Currency"]
                obj.GlCode = e["GL Code"]
                obj.ChargeAmount = e["Charge Amount"]
                obj.Frequency = e["Frequency"]
                obj.Prorated = e["Prorated"]
                obj.Status = e["Status"]

                tempArray.push(obj)


            })

            
            post(properties.CATALOG_SERVICE_API + "/bulk", tempArray)
                .then((resp) => {
                    if (resp.data) {
                        toast.success("Catalog created successfully ");
                        history.push(`${process.env.REACT_APP_BASE}/`);
                    } else {
                        toast.error("Error while creating campings")
                    }

                }).catch((error) => {
                    console.log(error)
                }).finally()
            
        }


        else if (renderMode.isContract === true) {
            let tempArray = []
            data.map((e) => {
                let obj = {}
                obj.CustomerRefNo = e["Customer Reference No"]
                obj.ContractStartDate = e["Contract Start Date"]
                obj.ContractEndDate = e["Contract End Date"]
                obj.Status = e["Status"]
                obj.ProductName = e["Product Name"]

                obj.ServiceRefNo = e["Service Ref No"]
                obj.ProductStartDate = e["Product Start Date"]
                obj.ProductEndDate = e["Product End Date"]
                obj.ChargeName = e["Charge Name"]
                obj.ChargeType = e["Charge Type"]
                obj.ChargeAmount = e["Charge Amount"]

                obj.Frequency = e["Frequency"]
                obj.Prorated = e["Prorated"]
                obj.CreditAdjAmt = e["Credit Adj Amt"]
                obj.DebitAdjAmt = e["Debit Adj Amt"]
                obj.LastBillPeriod = e["Last Bill Period"]
                obj.NextBillPeriod = e["Next Bill Period"]
                obj.Statuss = e["Statuss"]

                tempArray.push(obj)


            })

            
            post(properties.CONTRACT_API + "/bulk", tempArray)
                .then((resp) => {
                    if (resp.data) {
                        toast.success("Contracts created successfully ");
                        history.push(`${process.env.REACT_APP_BASE}/`);
                    } else {
                        toast.error("Error while creating contracts")
                    }

                }).catch((error) => {
                    console.log(error)
                }).finally()
            
        }

        else if (renderMode.isCustomer === true) {
            let tempArray = []
            data.map((e) => {
                let obj = {}
                obj.CustomerRefNo = e["Customer Reference No"]
                obj.Title = e["Title"]
                obj.FirstName = e["First Name"]
                obj.LastName = e["Last Name"]
                obj.CustomerType = e["Customer Type"]
                obj.SalesPerson = e["Sales Person"]
                obj.AccountNumber = e["Account Number"]
                obj.BillableReference = e["Billable Reference"]
                obj.Status = e["Status"]
                obj.AddressType = e["Address Type"]
                obj.No = e["No"]
                obj.Block = e["Block"]
                obj.BuildingName = e["Building Name"]
                obj.Street = e["Street"]
                obj.Road = e["Road"]
                obj.City = e["City"]
                obj.Town = e["Town"]
                obj.District = e["District"]
                obj.Country = e["Country"]
                obj.PostCode = e["Post Code"]
                obj.Latitude = e["Latitude"]
                obj.Longitude = e["Longitude"]
                obj.ContactType = e["Contact Type"]
                obj.ContactNo = e["Contact No"]
                obj.ContactNoPfx = e["Contact No Pfx"]
                obj.AltContactNo1 = e["Alt Contact No1"]
                obj.AltContactNo2 = e["Alt Contact No2"]
                obj.Email = e["Email"]
                obj.AltEmail = e["Alt Email"]

                tempArray.push(obj)


            })

            
            post(properties.CUSTOMER_API + "/bulk", tempArray)
                .then((resp) => {
                    if (resp.data) {
                        toast.success("Customers created successfully ");
                        history.push(`${process.env.REACT_APP_BASE}/`);
                    } else {
                        toast.error("Error while creating customers")
                    }

                }).catch((error) => {
                    console.log(error)
                }).finally()
            
        }
        else if (renderMode.isIncident === true) {
            let tempArray = []
            data.map((e) => {
                let obj = {}
                obj.IncidentId = e["Incident ID"]
                obj.CustomerReferenceNo = e["Customer Reference No"]
                obj.Description = e["Description"]
                obj.CurrentStatus = e["Current Status"]
                obj.CreatedDate = e["Created Date"]
                obj.RecentModifiedDate = e["Recent Modified Date"]
                obj.IncidentType = e["Incident Type"]
                obj.ServiceType = e["Service Type"]
                obj.ProblemType = e["Problem Type"]
                obj.Resolution = e["Resolution"]
                obj.ProblemCause = e["Problem Cause"]
                obj.Priority = e["Priority"]
                obj.SlaBreached = e["SLA Breached"]

                tempArray.push(obj)


            })

            
            post(properties.COMPLAINT_API + "/bulk", tempArray)
                .then((resp) => {
                    if (resp.data) {
                        toast.success("Incidents created successfully ");
                        history.push(`${process.env.REACT_APP_BASE}/`);
                    } else {
                        toast.error("Error while creating incidents")
                    }

                }).catch((error) => {
                    console.log(error)
                }).finally()
            
        }
        else if (renderMode.isSales === true) {
            let tempArray = []
            data.map((e) => {
                let obj = {}
                obj.SoId = e["SO ID"]
                obj.CustomerReferenceNo = e["Customer Reference No"]
                obj.Description = e["Description"]
                obj.CurrentStatus = e["Current Status"]
                obj.CreatedDate = e["Created Date"]
                obj.RecentModifiedDate = e["Recent Modified Date"]
                obj.SoType = e["SO Type"]
                obj.SlaBreached = e["SLA Breached"]
                obj.ProductName = e["Product Name"]
                obj.ServiceType = e["Service Type"]
                obj.ServiceReferenceNo = e["Service Reference No"]
                obj.ProductStartDate = e["Product Start Date"]
                obj.ProductEndDate = e["Product End Date"]
                obj.ChargeName = e["Charge Name"]
                obj.ChargeType = e["Charge Type"]
                obj.ChargeAmount = e["Charge Amount"]
                obj.Frequency = e["Frequency"]
                obj.Prorated = e["Prorated"]

                tempArray.push(obj)


            })

            
            post(properties.SERVICE_REQUEST_DETAILS + "/bulk", tempArray)
                .then((resp) => {
                    if (resp.data) {
                        toast.success("Service orders created successfully ");
                        history.push(`${process.env.REACT_APP_BASE}/`);
                    } else {
                        toast.error("Error while creating service orders")
                    }

                }).catch((error) => {
                    console.log(error)
                }).finally()
            
        }
    }
    return (
        <>

            <div className="row">
                <div className="col-12">
                    <div className="page-title-box">
                        <h4 className="page-title">Upload</h4>
                    </div>
                </div>
            </div>
            <div className="row mt-1">
                <div className="col-12 p-0">
                    <div className="card-box">
                        <div className="d-flex">

                            <div className="new-customer col-md-12">
                                <div className="scrollspy-div">
                                    <Element name="customersection" className="element" >
                                        <div className="row pl-0">
                                            <div className="title-box col-12 pl-0">
                                                <section className="triangle pl-0">


                                                    <h4 className="pl-2" style={{ alignContent: 'left' }}>Upload Template</h4>
                                                </section>
                                            </div>
                                        </div>



                                        <div className="pt-2 pr-2 pl-2">
                                            <fieldset className="scheduler-border">
                                                <div className="form-row">
                                                    <div className="col-12 pl-2 bg-light border">
                                                        <h5 className="text-primary">Template Type</h5>
                                                    </div>
                                                </div>
                                                <div className="d-flex flex-row pt-2">
                                                    <div className="col-md-4 pl-0">
                                                        <div className="form-group">

                                                            <select className="form-control "
                                                                value={selectedTemplateType}
                                                                onChange={e => {
                                                                    setSelectedTemplateType(e.target.value);
                                                                    setIsTemplateTypeSelected(true)
                                                                    handleTemplates(e.target.value)
                                                                }}
                                                            >
                                                                <option key="1" value="">Select Template Type...</option>
                                                                {
                                                                    options.map((e) => (
                                                                        <option key={e.value} value={e.value}>{e.label}</option>
                                                                    ))
                                                                }
                                                            </select>

                                                        </div>
                                                    </div>
                                                </div>
                                                {isTemplateTypeSelected &&
                                                    <div>
                                                        {renderMode.isCatalog === true && <div className="form-row">
                                                            <div className="col-12 pl-2 bg-light border">
                                                                <span>
                                                                    <h5 className="text-primary float-left">Catalog Details</h5></span>
                                                                <span>
                                                                    <a className="text-primary pt-1 float-right" download={"Product_catalog_template.xlsx"} href={ProductCatalogTemplate}><b>Catalog Upload Template</b>&nbsp;<i className="fa fa-download" aria-hidden="true"></i></a>
                                                                    {/* <a href={CampaignUploadTemplate} download="sampleCampaign.xlxs"> Download Here </a> */}
                                                                </span>
                                                            </div>
                                                        </div>}

                                                        {renderMode.isCustomer === true && <div className="form-row">
                                                            <div className="col-12 pl-2 bg-light border">
                                                                <span>
                                                                    <h5 className="text-primary float-left">Customer Details</h5></span>
                                                                <span>
                                                                    <a className="text-primary pt-1 float-right" download={"customer_template.xlsx"} href={customer_template}><b>Customer Upload Template</b>&nbsp;<i className="fa fa-download" aria-hidden="true"></i></a>
                                                                    {/* <a href={CampaignUploadTemplate} download="sampleCampaign.xlxs"> Download Here </a> */}
                                                                </span>
                                                            </div>
                                                        </div>}

                                                        {renderMode.isContract === true && <div className="form-row">
                                                            <div className="col-12 pl-2 bg-light border">
                                                                <span>
                                                                    <h5 className="text-primary float-left">Contract Details</h5></span>
                                                                <span>
                                                                    <a className="text-primary pt-1 float-right" download={"Contract_template.xlsx"} href={Contract_template}><b>Contract Upload Template</b>&nbsp;<i className="fa fa-download" aria-hidden="true"></i></a>
                                                                    {/* <a href={CampaignUploadTemplate} download="sampleCampaign.xlxs"> Download Here </a> */}
                                                                </span>
                                                            </div>
                                                        </div>}

                                                        {renderMode.isIncident === true && <div className="form-row">
                                                            <div className="col-12 pl-2 bg-light border">
                                                                <span>
                                                                    <h5 className="text-primary float-left">Incident Details</h5></span>
                                                                <span>
                                                                    <a className="text-primary pt-1 float-right" download={"incident_template.xlsx"} href={incident_template}><b>Incident Upload Template</b>&nbsp;<i className="fa fa-download" aria-hidden="true"></i></a>
                                                                    {/* <a href={CampaignUploadTemplate} download="sampleCampaign.xlxs"> Download Here </a> */}
                                                                </span>
                                                            </div>
                                                        </div>}

                                                        {renderMode.isSales === true && <div className="form-row">
                                                            <div className="col-12 pl-2 bg-light border">
                                                                <span>
                                                                    <h5 className="text-primary float-left">Sales Details</h5></span>
                                                                <span>
                                                                    <a className="text-primary pt-1 float-right" download={"sales_order_template.xlsx"} href={sales_orderTemplate}><b>Catalog Upload Template</b>&nbsp;<i className="fa fa-download" aria-hidden="true"></i></a>
                                                                    {/* <a href={CampaignUploadTemplate} download="sampleCampaign.xlxs"> Download Here </a> */}
                                                                </span>
                                                            </div>
                                                        </div>}


                                                        <div className="row col-12">
                                                            <div className="col-md-3">
                                                                <div className="form-group">
                                                                    <label
                                                                        htmlFor="inputState"
                                                                        className="col-form-label">
                                                                        Upload Excel File<span>*</span>
                                                                    </label>
                                                                    <input
                                                                        type="file"
                                                                        accept=".xlsx, .xls"
                                                                        id="file"
                                                                        onChange={(e) => {
                                                                            setFile(e.target.files[0])
                                                                            const file = e.target.files[0];
                                                                        }}
                                                                    />


                                                                </div>
                                                            </div>
                                                        </div></div>}
                                            </fieldset>
                                        </div>
                                        <div className="d-flex justify-content-center">
                                            <button type="button"
                                                className="btn btn-primary"
                                                disabled={!file}
                                                onClick={readExcel}>Upload
                                            </button>

                                        </div>





                                    </Element>

                                    <Element name="topreview" className="element">
                                        <div id="preview" >
                                            <h4 className="ml-2" id="list-item-1">Preview</h4>
                                            <hr />
                                            <div className="row" >
                                                <div className="col-lg-12">

                                                    <div className="card">
                                                        <div className="card-body">
                                                            <div style={{ border: "1px solid #ccc", overflowX: "auto", overflowY: "hidden", whiteSpace: "nowrap" }}>
                                                                {isTemplateTypeSelected === true && renderMode.isCatalog === true &&
                                                                    <DynamicTable
                                                                        row={data}
                                                                        header={ProductCatalogTemplateCols}
                                                                        itemsPerPage={10}
                                                                        handler={{
                                                                            handleCellRender: handleCellRender,
                                                                        }}
                                                                    />}
                                                                {isTemplateTypeSelected === true && renderMode.isContract === true &&
                                                                    <DynamicTable
                                                                        row={data}
                                                                        header={ContractCols}
                                                                        itemsPerPage={10}
                                                                        handler={{
                                                                            handleCellRender: handleCellRender,
                                                                        }}
                                                                    />}
                                                                {isTemplateTypeSelected === true && renderMode.isCustomer === true &&
                                                                    <DynamicTable
                                                                        row={data}
                                                                        header={CustomerCols}
                                                                        itemsPerPage={10}
                                                                        handler={{
                                                                            handleCellRender: handleCellRender,
                                                                        }}
                                                                    />}
                                                                {isTemplateTypeSelected === true && renderMode.isIncident === true &&
                                                                    <DynamicTable
                                                                        row={data}
                                                                        header={IncidentCols}
                                                                        itemsPerPage={10}
                                                                        handler={{
                                                                            handleCellRender: handleCellRender,
                                                                        }}
                                                                    />}
                                                                {isTemplateTypeSelected === true && renderMode.isSales === true &&
                                                                    <DynamicTable
                                                                        row={data}
                                                                        header={SalesOrderCols}
                                                                        itemsPerPage={10}
                                                                        handler={{
                                                                            handleCellRender: handleCellRender,
                                                                        }}
                                                                    />}

                                                            </div>
                                                            <br></br>
                                                            {isTemplateTypeSelected === true && <div className="d-flex col-12 justify-content-center">
                                                                
                                                                <button type="button" className="skel-btn-cancel">Cancel</button>
                                                                <button type="button" className="skel-btn-submit" onClick={handleClick} >Import</button>

                                                            </div>}
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>

                                        </div>
                                    </Element>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>

    );
}

export default UploadTemplate;



