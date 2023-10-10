import React from 'react';
import Modal from 'react-modal';
import { useState, useEffect } from 'react';
import { get, post } from '../../common/util/restUtil';
import { properties } from '../../properties';

import { toast } from 'react-toastify';
import DynamicTable from '../../common/table/DynamicTable';
import { ContractDetailCols, ContractDetailEditCols } from "./contractSerachCols"
import { string, object } from "yup";
import moment from 'moment'
import { RegularModalCustomStyles, USNumberFormat } from '../../common/util/util';
import CreateContractDetailForm from './CreateContractDetailForm';



const CreateContract = (props) => {
    const { isOpen, customer, refresh } = props.data;

    const [error, setError] = useState({});
    const [detailsError, setDetailsError] = useState({});

    const { setIsOpen, setRefresh } = props.modalStateHandlers;
    const [contractTypes, setContractTypes] = useState([]);
    const [contractNames, setContractNames] = useState([]);
    const [exportBtn, setExportBtn] = useState(false);
    const [addDetail, setAddDetail] = useState(false);
    const [contractDetailData, setContractDetailData] = useState([])
    const [removeIndex, setRemoveIndex] = useState(0)
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

    const validateToDate = (value) => {
        try {
            if (Date.parse(value) < Date.parse(contractForm.startDate))
                return false;
            return true
        } catch (e) {
            return false
        }
    }

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
        if (cell.column.Header === "Credit Adjustment" || cell.column.Header === "Debit Adjustment"  || cell.column.Header === "Last Bill Period" || cell.column.Header === "Minimum Commitment" || cell.column.Header === "Total Consumption" ) {
            return (
                <span>{"-"}</span>
            )
        }
        else if (cell.column.Header === "Total Amount" || cell.column.Header === "Balance Amount") {
            return (
                <span>{USNumberFormat(cell.value)}</span>
            )
        }
        else if (cell.column.Header === "Contract Start Date" || cell.column.Header === "Contract End Date") {
            return (
                <span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>
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
 
    const handleAdd = () => {
        const error = validate(validationSchema, contractForm);
        if (error) {
            toast.error("Please Add Contract Details")
            return;
        }
        setAddDetail(!addDetail); 
        setDetailsError({})
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
        let reqBody = { ...contractForm, contractDtl: contractDetailData }
        
        post(properties.CONTRACT_API + '/sales-order/contract', reqBody).then((resp) => {
            if (resp.status === 200) {
                toast.success("Contract Created Successfully");
                handleOnModelClose();
                setRefresh(!refresh)
                setContractDetailData([]);
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
                                    min={moment(new Date()).format('YYYY-MM-DD')}
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
                                        onClick={handleAdd}
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
                        <div className='mt-1'>
                            <CreateContractDetailForm
                                data={{
                                    selectedContractId: null,
                                    customer: customer,
                                    refresh: refresh,
                                    contractData: contractForm,
                                    contractDetailData,
                                    isOpen: addDetail
                                }}
                                handler={{
                                    pageRefresh: () => {},
                                    setRefresh: setRefresh,
                                    setIsOpen: setAddDetail,
                                    setContractDetailData
                                }}
                            />
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
                                header={ContractDetailColumns}
                                //header={ContractDetailCols}
                                //hiddenColumns={['soNumber','select', 'contractStartDate', 'contractRefId', 'contractEndDate', 'billPeriod', 'totalCharge', 'nextBillPeriod', 'lastBillPeriod', 'updatedAt', 'updatedBy', 'createdAt', 'createdBy']}
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
                                header={ContractDetailColumns}
                                //header={ContractDetailCols}
                                //hiddenColumns={['soNumber','select', 'contractStartDate', 'contractRefId', 'contractEndDate', 'billPeriod', 'totalCharge', 'nextBillPeriod', 'lastBillPeriod', 'updatedAt', 'updatedBy', 'createdAt', 'createdBy']}
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

export const ContractDetailColumns = [
    {
        Header: "Product Type",
        accessor: "contractTypeDesc",
        disableFilters: true
    },
    {
        Header: "Product Name",
        accessor: "itemName",
        disableFilters: true
    },
    {
        Header: "Product Description",
        accessor: "contractName",
        disableFilters: true
    },
    {
        Header: "Total Amount",
        accessor: "chargeAmount",
        disableFilters: true,
        id: "chargeAmount"
    },
    {
        Header: "Balance Amount",
        accessor: "chargeAmount",
        disableFilters: true,
        id: "balanceAmount"
    },
    {
        Header: "Minimum Commitment",
        accessor: "minCommitment",
        disableFilters: true
    },
    {
        Header: "Total Consumption",
        accessor: "totalConsumption",
        disableFilters: true
    },
    {
        Header: "Tier Type",
        accessor: "isTierType",
        disableFilters: true,
    },
    {
        Header: "Charge Type",
        accessor: "chargeTypeDesc",
        disableFilters: true
    },
    {
        Header: "Fee Type",
        accessor: "frequencyDesc",
        disableFilters: true
    },
    {
        Header: "Prorated",
        accessor: "prorated",
        disableFilters: true
    },
    {
        Header: "Quantity",
        accessor: "quantity",
        disableFilters: true
    },
    {
        Header: "Duration",
        accessor: "durationMonth",
        disableFilters: true
    },
    {
        Header: "Advance Flag",
        accessor: "upfrontPayment",
        disableFilters: true
    },
    {
        Header: "Credit Adjustment",
        accessor: "creditAdjAmount",
        disableFilters: true
    },
    {
        Header: "Debit Adjustment",
        accessor: "debitAdjAmount",
        disableFilters: true
    },
    {
        Header: "Last Bill Period",
        accessor: "lastBillPeriod",
        disableFilters: true,
    },
    {
        Header: "Next Bill Period",
        accessor: "nextBillPeriod",
        disableFilters: true
    },
    {
        Header: "Remove",
        accessor: "remove",
        disableFilters: true
    }
]