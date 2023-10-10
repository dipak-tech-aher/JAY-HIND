import React from 'react';
import Modal from 'react-modal';
import { useState, useEffect } from 'react';
import { get, post } from '../../common/util/restUtil';
import { properties } from '../../properties';

import { toast } from 'react-toastify';
import DynamicTable from '../../common/table/DynamicTable';
import { ContractDetailCols } from "./contractSerachCols"
import { string, object } from "yup";
import { NumberFormatBase } from 'react-number-format';
import moment from 'moment'
import { RegularModalCustomStyles, USNumberFormat, validateNumber } from '../../common/util/util';



const CreateContract = (props) => {
    const { isOpen, customer, refresh } = props.data;

    const [error, setError] = useState({});
    const [detailsError,setDetailsError] = useState({});
    const [contractNameRef, setContractNameRef] = useState([]);

    const { setIsOpen, setRefresh ,setSelectedContractId } = props.modalStateHandlers;
    const [contractTypes, setContractTypes] = useState([]);
    const [contractNames, setContractNames] = useState([]);
    const [exportBtn, setExportBtn] = useState(false);
    const [addDetail, setAddDetail] = useState(false);
    const [contractDetailData, setContractDetailData] = useState([])
    const [removeIndex, setRemoveIndex] = useState(0)
    const prorateArray = [
        { label: "Yes", value: "Y" },
        { label: "No", value: "N" }
    ]

    const [chargeTypes, setChargeTypes] = useState([]);
    const [frequency, setFrequency] = useState([])
    const [contractForm, setContractForm] = useState({
        customerId: customer.customerId,
        customerNumber: customer.crmCustomerNo,
        accountId: customer.account[0].accountId,
        customerName: customer.firstName + " " + customer.lastName,
        billRefNo: customer.crmCustomerNo,
        startDate: "",
        endDate: ""

    })
    const [contractDetailForm, setContractDetailForm] = useState({
        billRefNo: customer.crmCustomerNo,
        contractType: "",
        contractTypeDesc: "",
        contractName: "",
        contractStartDate: "",
        contractEndDate: "",
        adhocContract: "NO",
        itemId: "",
        prorated: "",
        chargeId: "",
        chargeAmount: "",
        frequency: "",
        frequencyDesc: "",
        chargeName: "",
        chargeType: "",
        serviceType: "",
    })

    const validationSchema = object().shape({
        startDate: string().required("Please enter start date"),
        endDate: string().required("Please enter end date").test(
            "Date",
            "End date should not be less than from Start date",
            (endDate) => validateToDate(endDate)
        )
    });
    const contractDetailValidationSchema = object().shape({
        contractName: contractDetailForm?.adhocContract === 'YES' ? string().required("Please enter Contract Name") : string().nullable(true),
        itemId: contractDetailForm?.adhocContract !== 'YES' ? string().required("Please enter Contract Name") : string().nullable(true),
        contractType: string().required("Please enter Contract Type"),
        contractStartDate: string().required("Please enter Contract Start date"),
        contractEndDate: string().required("Please enter Contract End date").test(
            "Date",
            "End date should not be less than from Start date",
            (endDate) => validateToDateContractDetails(endDate)
        ),
        chargeName: contractDetailForm?.adhocContract === 'YES' ? string().required("Please enter Charge Name") : string().nullable(true),
        chargeType:contractDetailForm?.adhocContract === 'YES' ? string().required("Please enter Charge Type") : string().nullable(true),
        chargeAmount:contractDetailForm?.adhocContract === 'YES' ? string().required("Please enter Charge Amount") : string().nullable(true),
        frequency:(contractDetailForm?.adhocContract === 'YES' && contractDetailForm?.chargeType === 'CC_RC') ? string().required("Please enter Frequency") : string().nullable(true),
        prorated:(contractDetailForm?.adhocContract === 'YES' && contractDetailForm?.chargeType === 'CC_RC') ? string().required("Please enter Prorated") : string().nullable(true),
    });
    const validateToDate = (value) => {
        try {
            if (Date.parse(value) < Date.parse(contractForm.startDate))
                return false;
            return true
        } catch (e) {
            return false
        }
    }

    const validateToDateContractDetails = (value) => {
        try {
            if (Date.parse(value) < Date.parse(contractDetailForm?.contractStartDate))
                return false;
            return true
        } catch (e) {
            return false
        }
    }

    useEffect(() => {
        
        post(properties.BUSINESS_ENTITY_API, [
            "CATALOG_TYPE", "CHARGE_CATEGORY", "CHARGE_FREQUENCY"
        ])
            .then((response) => {
                if (response.data) {
                    setContractTypes(response.data["CATALOG_TYPE"])
                    setChargeTypes(response.data["CHARGE_CATEGORY"])
                    setFrequency(response.data["CHARGE_FREQUENCY"])
                }
            })
            .catch(error => {
                console.error(error);
            })
        get(properties.LOOKUP_ITEMS).then((resp) => {
            if (resp.data) {

                setContractNames(resp.data)
            }
        }).catch(error => {
            console.error(error);
        }).finally()
    }, [])



    const validate = () => {
        try {
            validationSchema.validateSync(contractForm, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                setError((prevState) => {
                    return { ...prevState, [err.params.path]: err.message };
                });
            });
            return e;
        }
    }

    const validateDetails = () => {
        try {
            contractDetailValidationSchema.validateSync(contractDetailForm, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                setDetailsError((prevState) => {
                    return { ...prevState, [err.params.path]: err.message };
                });
            });
            return e;
        }
    }

    const handleRemove = (data) => {
        setContractDetailData(
            contractDetailData.filter((contract) => {
                if (contract.indexId !== data.indexId) {
                    return contract;
                }
            })
        )
    }


    const handleCellRender = (cell, row) => {
        if (cell.column.Header === "Billable Reference Number") {
            return (
                <span>{cell.value}</span>
            )
        }
        else if (['Service Number', 'Contract Id', 'Status', 'Actual End Date'].includes(cell.column.Header)) {
            return (
                <span>-</span>
            )
        }
        else if (cell.column.Header === 'Charge Name') {
            let chargeName = row?.original?.chargeName
            return (
                <span>{chargeName}</span>
            )
        }
        else if (cell.column.Header === "Contract Name") {
            let contractName = row?.original?.contractName
            return (
                <span>{contractName}</span>
            )
        }
        else if (cell.column.Header === "Charge Amount") {
            let chargeAmount = row?.original?.chargeAmount
            return (
                <span>{USNumberFormat(chargeAmount)}</span>
            )
        }
        else if (cell.column.Header === "Charge Type") {
            let chargeType = row?.original?.chargeTypeDesc
            return (
                <span>{chargeType}</span>
            )
        }
        else if (cell.column.Header === "Contract Type") {
            let contractType = row?.original?.contractType
            return (
                <span>{contractType}</span>
            )
        }
        else if (cell.column.Header === "Frequency") {
            let frequency = row?.original?.frequencyDesc
            return (
                <span>{frequency}</span>
            )
        }
        else if (cell.column.Header === "Actual Start Date") {
            let contractStartDate = row?.original?.contractStartDate
            return (
                <span>{contractStartDate ? moment(contractStartDate).format('DD MMM YYYY') : '-'}</span>
            )
        }
        else if (cell.column.Header === "End Date") {
            let contractEndDate = row?.original?.contractEndDate
            return (
                <span>{contractEndDate ? moment(contractEndDate).format('DD MMM YYYY') : '-'}</span>
            )
        }
        else if (cell.column.Header === "Prorated") {
            return (
                <span>{cell.value === 'Y' ? 'Yes' : cell.value === 'N' ? 'No' : '-'}</span>
            )
        }
        else if (["Credit Adjustment", "Debit Adjustment"].includes(cell.column.Header)) {
            return (
                <span>{USNumberFormat(cell.value)}</span>
            )
        }
        else if (cell.column.Header === "Remove") {
            return (
                <button type="button" className="btn btn-primary btn-sm waves-effect waves-light mr-2" onClick={() => { handleRemove(row.original) }}>Remove</button>
            )
        }
        else {
            return (
                <span>{cell.value}</span>
            )
        }
    }

    const handleOnModelClose = () => {
        setIsOpen({ openModal: false });
    }

    const handleCancle = () => {

        setContractForm({
            ...contractForm,
            serviceNbr: "",
            contractName: "",
            contractType: "",
            startDate: "",
            endDate: "",
        })

    }

    const handleClear = () => {
        setDetailsError({})
        setContractDetailForm({
            billRefNo: customer.crmCustomerNo,
            contractType: "",
            contractTypeDesc: "",
            contractName: "",
            contractStartDate: "",
            contractEndDate: "",
            adhocContract: "NO",
            itemId: "",
            prorated: "",
            chargeId: "",
            chargeAmount: "",
            frequency: "",
            frequencyDesc: "",
            chargeName: "",
            chargeType: "",
            serviceType: "",
        });
    }
    const handleContractDetail = () => {
        let count = removeIndex + 1
        setRemoveIndex(count)
        
        if (contractDetailForm.adhocContract === "YES") {
            setContractDetailForm({ ...contractDetailForm, contractType: "Service", indexId: count })
            if (true) {
                const error = validateDetails(contractDetailValidationSchema, contractDetailForm);
                if (error) {
                    toast.error("Validation Error Found, Please Add Contract Details")
                    return;
                }
                if(contractDetailForm.chargeType !== 'CC_RC')
                {
                    contractDetailForm.frequency = ""
                    contractDetailForm.frequencyDesc = ""  
                }
                else
                {   
                    if(contractDetailForm.frequency === "")
                    {
                        toast.error("Frequency is Required")
                        return 
                    }
                }
                if(contractDetailForm.chargeType !== 'CC_RC')
                { 
                    contractDetailForm.prorated = ""
                }
                else
                {   
                    if(contractDetailForm.prorated === "")
                    {
                        toast.error("Prorated is Required")
                        return 
                    }
                }
                if (moment(contractDetailForm.contractEndDate).isBefore(contractDetailForm.contractStartDate)) {
                    toast.error("End Date Cannot be less than Start Date")
                    return
                }
                if (!moment(contractDetailForm.contractStartDate).isBetween(moment(contractForm?.startDate).format('YYYY-MM-DD'), moment(contractForm?.endDate).format('YYYY-MM-DD'), null, '[]')) {
                    toast.error("Contract Detail Start Date Should be between Contract Start and End Date")
                    return
                }
                if (!moment(contractDetailForm.contractEndDate).isBetween(moment(contractForm?.startDate).format('YYYY-MM-DD'), moment(contractForm?.endDate).format('YYYY-MM-DD'), null, '[]')) {
                    toast.error("Contract Detail End Date Should be between Contract Start and End Date")
                    return
                }
                setContractDetailData([...contractDetailData, contractDetailForm])
                setAddDetail(false);
            } else { toast.error("Please Enter the Contract Details") }

        } else {
            if (true) {
                let contractData = contractDetailForm
                const error = validateDetails(contractDetailValidationSchema, contractData);
                if (error) {
                    toast.error("Validation Error Found, Please Add Contract Details")
                    return;
                }
                if (moment(contractDetailForm.contractEndDate).isBefore(contractDetailForm.contractStartDate)) {
                    toast.error("End Date Cannot be less than Start Date")
                    return
                }
                if (!moment(contractDetailForm.contractStartDate).isBetween(moment(contractForm?.startDate).format('YYYY-MM-DD'), moment(contractForm?.endDate).format('YYYY-MM-DD'), null, '[]')) {
                    toast.error("Contract Detail Start Date Should be between Contract Start and End Date")
                    return
                }
                if (!moment(contractDetailForm.contractEndDate).isBetween(moment(contractForm?.startDate).format('YYYY-MM-DD'), moment(contractForm?.endDate).format('YYYY-MM-DD'), null, '[]')) {
                    toast.error("Contract Detail End Date Should be between Contract Start and End Date")
                    return
                }
                contractNames.map((a) => {
                    if (contractData.adhocContract === "NO" && Number(contractData.itemId) === Number(a.itemId)) {
                        contractData.contractName = a.itemName
                        contractData.serviceType = a.serviceType
                        contractData.chargeId = a.chargeId
                        contractData.chargeName = a.chargeName
                        contractData.chargeAmount = a.chargeAmount
                        contractData.chargeType = a.chargeCat
                        let desc = ""
                        chargeTypes && chargeTypes.map((charge) => {
                            if (charge.code === a.chargeCat) {
                                desc = charge.description
                            }
                        })
                        contractData.chargeTypeDesc = desc
                        contractData.indexId = count
                        contractData.frequency = a?.frequency ? a?.frequency : 'FREQ_MONTH' 
                        contractData.frequencyDesc = a?.frequencyDesc ? a?.frequencyDesc : 'Monthly'
                        //contractData.frequency = a?.frequency ? a?.frequency : 'FREQ_MONTH'
                        //contractData.frequencyDesc = a?.frequencyDesc ? a?.frequencyDesc : 'Monthly'
                        contractData.prorated =  a?.prorated ? a?.prorated : ''
                        //contractData.prorated = 'N'
                    }
                })
                
                setContractDetailData([...contractDetailData, contractData])
                setAddDetail(false);
            } else { toast.error("Please Enter the Contract Details") }
        }


        setContractDetailForm({
            billRefNo: customer.crmCustomerNo,
            contractType: "",
            contractTypeDesc: "",
            contractName: "",
            contractStartDate: "",
            contractEndDate: "",
            adhocContract: "NO",
            itemId: "",
            prorated: "",
            chargeId: "",
            chargeAmount: "",
            frequency: "",
            frequencyDesc: "",
            chargeName: "",
            chargeType: "",
            serviceType: ""
        });
    }



    const handleSubmit = () => {
        const error = validate(validationSchema, contractForm);
        if (error) {
            toast.error("Please Add Contract Details")
            return;
        }
        if (contractDetailData.length === 0) {
            setAddDetail(true)
            toast.error('Please Add Contract Details')
            return false
        }
        let array = contractDetailData

        array.map((p) => {
            contractNames.map((a) => {
                if (p.itemId === "") {
                    delete p.itemId
                }
                if (p.chargeId === "") {
                    delete p.chargeId
                }
                contractTypes.map((type) => {
                    if(type.description === p.contractType)
                    {
                        p.contractType = type.code
                    }
                })
                if (p.adhocContract === "NO" && Number(p.itemId) === Number(a.itemId)) {
                    p.contractName = a.itemName
                    p.serviceType = a.serviceType
                    p.chargeId = a.chargeId
                    p.chargeName = a.chargeName
                    p.chargeAmount = a.chargeAmount
                    p.chargeType = a.chargeCat
                }
                return p;
            })
        })

        let reqBody = { ...contractForm, contractDtl: array }

        
        post(properties.CONTRACT_API, reqBody).then((resp) => {
            if (resp.status === 200) {
                setSelectedContractId(resp?.data?.contractId)
                toast.success("Contract Created Successfully");
                handleOnModelClose();
                setRefresh(!refresh)
                setContractDetailData([]);
                setContractDetailForm({});
                setContractForm({});
            }

        }).catch((error) => {
            console.log(error)
            toast.error(error);

        }).finally()
    }

    return (
        <Modal isOpen={isOpen.openModal} contentLabel="Contract Search Modal" style={RegularModalCustomStyles}>
            <div className="modal-content">
                <div className="modal-header">
                    <h4 className="page-title">Create Contract</h4>
                    <button type="button" className="close" onClick={handleOnModelClose}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="col-12 p-0">
                    <section className="triangle">
                        <h4 className="pl-2" style={{ alignContent: 'left' }}>Contract</h4>
                    </section>
                </div>
                <div className="modal-body overflow-auto cus-srch">
                    <div className="row">
                        <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="inputState" className="col-form-label">Customer Number</label>
                                <p>{contractForm.customerNumber}</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="inputState" className="col-form-label">Customer Name</label>
                                <p>{contractForm.customerName}</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group ">
                                <label htmlFor="inputState" className="col-form-label">Billble Reference Number</label>
                                <p>{contractForm.billRefNo}</p>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4">
                            <div className="form-group ">
                                <label htmlFor="inputState" className="col-form-label">Contract Start Date<span>*</span></label>
                                <input type="date" className={`form-control ${(error.startDate ? "input-error" : "")}`} value={contractForm.startDate}
                                    //min={formatDateForBirthDate(new Date())}
                                    onChange={(e) => {
                                        setContractForm({ ...contractForm, startDate: e.target.value });
                                        setContractDetailForm({ ...contractDetailForm, contractStartDate: "" });
                                        setError({ ...error, startDate: "" })
                                    }}>
                                </input>
                                {error.startDate ? <span className="errormsg">{error.startDate}</span> : ""}
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group ">
                                <label htmlFor="inputState" className="col-form-label">Contract End Date<span>*</span></label>
                                <input type="date" className={`form-control ${(error.endDate ? "input-error" : "")}`} value={contractForm.endDate}
                                    min={contractForm.startDate}
                                    onChange={(e) => {
                                        setContractForm({ ...contractForm, endDate: e.target.value });
                                        setContractDetailForm({ ...contractDetailForm, contractEndDate: "" });
                                        setError({ ...error, endDate: "" })
                                    }}
                                ></input>
                                {error.endDate ? <span className="errormsg">{error.endDate}</span> : ""}
                            </div>
                        </div>
                    </div>
                    <br /><br /><br />
                    <div className="row">
                        <section className="triangle col-12">
                            <div className="row col-12">
                                <div className="col-10">
                                    <h4 id="list-item-0" className="pl-1">Contract Details</h4>
                                </div>
                                <div className="col-2 adjus-btn pt-1 pl-5">
                                    <button
                                        className="btn btn-primary btn-sm waves-effect waves-light"
                                        onClick={() => { setAddDetail(!addDetail);setDetailsError({}) }}
                                    >
                                        {
                                            addDetail ? 'Cancel' : 'Add'
                                        }
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                    {
                        addDetail === true &&
                        <div className="add-line card-box mt-2" style={{ border: "1px solid grey" }}>
                            <div className="overflow-auto cus-srch">
                                <div className="row">
                                    <div className="col-md-2">
                                        <div className="form-group">
                                            <label htmlFor="contactType" className="col-form-label"></label>
                                            <div className="custom-control custom-checkbox">
                                                <input type="checkbox" className="control-input" id="adhocContract" checked={contractDetailForm.adhocContract === "YES" ? true : false}
                                                    onChange={(e) => {
                                                        if (e.target.checked === true) {
                                                            setContractDetailForm({ ...contractDetailForm, adhocContract: 'YES', contractType: "Service" })
                                                        }
                                                        else if (e.target.checked === false) {
                                                            setContractDetailForm({ ...contractDetailForm, adhocContract: 'NO' })
                                                        }
                                                        setDetailsError({})
                                                    }}
                                                />
                                                <label htmlFor="inputState" className="col-form-label">Adhoc Contract</label>
                                            </div>
                                        </div>
                                    </div>
                                    {
                                        contractDetailForm.adhocContract === "YES" ?
                                            <>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label htmlFor="inputState" className="col-form-label">Contract Type<span>*</span></label>
                                                        <input className="form-control" value={contractDetailForm.contractType} disabled>
                                                        </input>
                                                        {detailsError.contractType ? <span className="errormsg">{detailsError.contractType}</span> : ""}
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label htmlFor="inputState" className="col-form-label">Contract Name<span>*</span></label>
                                                        <input type="text" className="form-control" value={contractDetailForm.contractName}
                                                            onChange={(e) => {
                                                                setContractDetailForm({ ...contractDetailForm, contractName: e.target.value });
                                                                setDetailsError({ ...detailsError, contractName: "" })

                                                            }}>

                                                        </input>
                                                        {detailsError.contractName? <span className="errormsg">{detailsError.contractName}</span> : ""}
                                                    </div>
                                                </div>
                                            </>
                                            :
                                            <>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label htmlFor="inputState" className="col-form-label">Contract Type<span>*</span></label>
                                                        <select className="form-control" value={contractDetailForm.contractType}
                                                            onChange={(e) => {
                                                                setContractDetailForm({
                                                                    ...contractDetailForm,
                                                                    contractType: e.target.value,
                                                                    itemId: ""
                                                                });

                                                                setDetailsError({ ...detailsError, contractType: "" })
                                                                let list = []
                                                                setContractNameRef([])
                                                                contractNames.map((c) => {

                                                                    if (c.contractType === e.target.value.toLowerCase()) {

                                                                        list.push(c)
                                                                    }
                                                                })


                                                                setContractNameRef(list)
                                                            }}>

                                                            <option value="">Select contract type</option>
                                                            {
                                                                contractTypes.map((e) => (
                                                                    <option key={e.code} value={e.description}>{e.description}</option>
                                                                ))
                                                            }

                                                        </select>
                                                        {detailsError.contractType? <span className="errormsg">{detailsError.contractType}</span> : ""}
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label htmlFor="inputState" className="col-form-label">Contract Name<span>*</span></label>
                                                        <select className="form-control" value={contractDetailForm.itemId}
                                                            onChange={(e) => {
                                                                setContractDetailForm({ ...contractDetailForm, itemId: e.target.value });
                                                                setDetailsError({ ...detailsError, itemId: "" })
                                                            }}>
                                                            <option value="">Select contract name</option>
                                                            {contractNameRef && contractNameRef.map((c) => {

                                                                return (<option key={c.itemId} value={c.itemId}>{c.itemName}</option>)
                                                            })
                                                            }

                                                        </select>
                                                        {detailsError.itemId ? <span className="errormsg">{detailsError.itemId}</span> : ""}
                                                    </div>
                                                </div></>
                                    }
                                    <div className="col-md-2">
                                        <div className="form-group">
                                            <label htmlFor="inputState" className="col-form-label">Contract Start Date<span>*</span></label>
                                            <input type="date" className="form-control"
                                                min={contractForm.startDate}
                                                value={contractDetailForm.contractStartDate}
                                                onChange={(e) => {
                                                    setContractDetailForm({ ...contractDetailForm, 
                                                        contractStartDate: e.target.value ,
                                                        contractEndDate: contractDetailForm.chargeType === 'CC_NRC' ? e.target.value : ""
                                                    });
                                                    setDetailsError({ ...detailsError, contractStartDate: "",contractEndDate: "" })
                                                }}>
                                            </input>
                                            {detailsError.contractStartDate ? <span className="errormsg">{detailsError.contractStartDate}</span> : ""}
                                        </div>
                                    </div>
                                    <div className="col-md-2">
                                        <div className="form-group">
                                            <label htmlFor="inputState" className="col-form-label">Contract End Date<span>*</span></label>
                                            <input type="date" className="form-control"
                                                value={contractDetailForm.contractEndDate}
                                                disabled={contractDetailForm?.chargeType === 'CC_NRC'}
                                                //min={contractDetailForm.contractStartDate}
                                                //max={contractForm.endDate}
                                                onChange={(e) => {
                                                    setContractDetailForm({ ...contractDetailForm, contractEndDate: e.target.value });
                                                    setDetailsError({ ...detailsError, contractEndDate: "" })
                                                }}></input>
                                                {detailsError.contractEndDate ? <span className="errormsg">{detailsError.contractEndDate}</span> : ""}
                                        </div>
                                    </div>
                                </div>
                                {
                                    contractDetailForm.adhocContract === "YES" &&
                                    <div className="row">
                                        <div className="col-md-2">
                                            <div className="form-group">
                                                <label htmlFor="inputState" className="col-form-label">Charge Name<span>*</span></label>
                                                <input type="text" className="form-control"
                                                    value={contractDetailForm.chargeName}

                                                    onChange={(e) => {
                                                        setContractDetailForm({ ...contractDetailForm, chargeName: e.target.value });
                                                        setDetailsError({ ...detailsError, chargeName: "" })
                                                    }}></input>
                                                    {detailsError.chargeName ? <span className="errormsg">{detailsError.chargeName}</span> : ""}

                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="inputState" className="col-form-label">Charge Type<span>*</span></label>
                                                <select className="form-control" value={contractDetailForm.chargeType}
                                                    onChange={(e) => {
                                                        setContractDetailForm({ ...contractDetailForm, 
                                                            chargeType: e.target.value, 
                                                            chargeTypeDesc: e.target.options[e.target.selectedIndex].label ,
                                                            contractEndDate: e.target.value === 'CC_NRC' ? contractDetailForm.contractStartDate : ""
                                                        });
                                                        setDetailsError({ ...detailsError, chargeType: "" ,frequency:"",prorated:"", contractEndDate:""})
                                                    }}>
                                                    <option  value="">Select charge type</option>
                                                    {chargeTypes && chargeTypes.map((c) => {

                                                        return (<option key={c.code} value={c.code}>{c.description}</option>)
                                                    })
                                                    }
                                                </select>
                                                {detailsError.chargeType ? <span className="errormsg">{detailsError.chargeType}</span> : ""}
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="inputState" className="col-form-label">Charge Amount<span>*</span></label>
                                                <NumberFormatBase className="form-control"
                                                    value={contractDetailForm.chargeAmount}
                                                    //onKeyPress={(e) => { validateNumber(e) }}
                                                    onChange={(e) => {
                                                        setContractDetailForm({ ...contractDetailForm, chargeAmount: e.target.value });
                                                        setDetailsError({ ...detailsError, chargeAmount: "" })
                                                    }}></NumberFormatBase>
                                                    {detailsError.chargeAmount ? <span className="errormsg">{detailsError.chargeAmount}</span> : ""}
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <div className="form-group">
                                                <label htmlFor="inputState" className="col-form-label">Frequency<span>*</span></label>
                                                <select className="form-control" value={contractDetailForm.frequency} disabled={contractDetailForm?.chargeType !== 'CC_RC'}
                                                    onChange={(e) => { 
                                                        setContractDetailForm({ ...contractDetailForm, frequency: e.target.value, frequencyDesc: e.target.options[e.target.selectedIndex].label });
                                                        setDetailsError({ ...detailsError, frequency: "" })
                                                    }}>
                                                    <option   value="">Select frequency</option>
                                                    {frequency && frequency.map((c) => {

                                                        return (<option key={c.code} value={c.code}>{c.description}</option>)
                                                    })
                                                    }
                                                </select>
                                                {detailsError.frequency ? <span className="errormsg">{detailsError.frequency}</span> : ""}
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <div className="form-group">
                                                <label htmlFor="inputState" className="col-form-label">Prorated<span>*</span></label>
                                                <select type="text" className="form-control"
                                                    value={contractDetailForm.prorated}
                                                    disabled={contractDetailForm?.chargeType !== 'CC_RC'}
                                                    onChange={(e) => {
                                                        setContractDetailForm({ ...contractDetailForm, prorated: e.target.value });
                                                        setDetailsError({ ...detailsError, prorated: "" })
                                                    }}>
                                                    <option  value="">Select prorated</option>
                                                    {prorateArray && prorateArray.map((c) => {

                                                        return (<option value={c.value}>{c.label}</option>)
                                                    })
                                                    }
                                                </select>
                                                {detailsError.prorated ? <span className="errormsg">{detailsError.prorated}</span> : ""}
                                            </div>
                                        </div>
                                    </div>
                                }
                            </div>
                            <div className="d-flex justify-content-center mt-2">
                                <button type="submit" className="btn btn-primary btn-sm waves-effect waves-light mr-2" onClick={handleContractDetail}>Done</button>
                                <button type="submit" className="btn btn-primary btn-sm waves-effect waves-light ml-2" onClick={handleClear} >Clear</button>
                            </div>

                        </div>
                    }
                    <br /><br />
                    <div className="card mt-2">

                        {(contractDetailData && contractDetailData.length > 0) ?
                            <DynamicTable
                                listKey={"Contract List"}
                                exportBtn={exportBtn}
                                row={contractDetailData}
                                itemsPerPage={10}
                                filterRequired={false}
                                header={ContractDetailCols}
                                hiddenColumns={['select', 'contractStartDate', 'contractRefId', 'contractEndDate', 'billPeriod', 'totalCharge', 'nextBillPeriod', 'lastBillPeriod','updatedAt','updatedBy','createdAt','createdBy']}
                                handler={{
                                    handleCellRender: handleCellRender,
                                    handleExportButton: setExportBtn
                                }}
                            /> : <DynamicTable
                                listKey={"Contract List"}
                                exportBtn={exportBtn}
                                row={[]}
                                itemsPerPage={10}
                                filterRequired={false}
                                header={ContractDetailCols}
                                hiddenColumns={['select', 'contractStartDate', 'contractRefId', 'contractEndDate', 'billPeriod', 'totalCharge', 'nextBillPeriod', 'lastBillPeriod','updatedAt','updatedBy','createdAt','createdBy']}
                                handler={{
                                    handleCellRender: handleCellRender,
                                    handleExportButton: setExportBtn
                                }}
                            />}
                    </div>
                    <div className="d-flex justify-content-center mt-5">
                        <button type="submit" className="btn btn-primary btn-sm waves-effect waves-light mr-2" onClick={handleSubmit}>Submit</button>
                        <button type="submit" className="btn btn-primary btn-sm waves-effect waves-light ml-2" onClick={() => { handleCancle(); handleOnModelClose() }}>Cancel</button>
                    </div>
                </div>
            </div>
        </Modal >

    )
}

export default CreateContract;