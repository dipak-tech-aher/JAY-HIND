import React from 'react';
import Modal from 'react-modal';
import { useState, useEffect } from 'react';
import { post } from '../../common/util/restUtil';
import { properties } from '../../properties';

import { toast } from 'react-toastify';
import DynamicTable from '../../common/table/DynamicTable';
import { CustomerSearchModalColumns } from './customerSearchModalCols';
import { useHistory } from "react-router-dom";
import { NumberFormatBase } from 'react-number-format';
import { RegularModalCustomStyles } from '../../common/util/util';


const SearchCustomerContract = (props) => {
    const history = useHistory();
    const { isOpen, billRefNbr } = props.data;
    const { setIsOpen } = props.modalStateHandlers;
    const [contractTypes, setContractTypes] = useState([]);
    const [customerData, setCustomerData] = useState([]);
    const [exportBtn, setExportBtn] = useState(false)

    const [contractForm, setContractForm] = useState({
        billRefNo: billRefNbr ? Number(billRefNbr) : '',
        customerName: "",
        customerNumber: "",
        contractId: ""
    })

    useEffect(() => {
        if (billRefNbr !== undefined && billRefNbr !== "") {
            handleSubmit()
        }
    }, [])


    const handleViewContract = (rowData) => {
        history.push(`${process.env.REACT_APP_BASE}/new-contract`, {
            data: {
                rowData,
                viewContractDetails: true,
            }
        })
    }

    const handleCellRender = (cell, row) => {
        if (cell.column.Header === "Billable Reference Number") {
            let billRefNo = row?.original?.account[0]?.accountNo
            return (
                <span className="text-secondary cursor-pointer" onClick={() => handleViewContract(row.original)}>
                    {billRefNo}
                </span>
            )
        }
        else if (cell.column.Header === "Customer Number") {
            let cNo = row?.original?.crmCustomerNo
            return (
                <span>{cNo}</span>
            )
        }
        else if (cell.column.Header === "Customer Name") {
            let name = row?.original?.firstName + " " + row?.original?.lastName
            return (
                <span>{name}</span>
            )
        }
        return (
            <span>{cell.value}</span>
        )
    }

    const handleOnModelClose = () => {
        setIsOpen({ ...isOpen, openModal: false });

    }


    const handleSubmit = () => {
        if (contractForm.billRefNo || contractForm.customerName || contractForm.customerNumber || contractForm.contractId) {
            
            post(properties.CONTRACT_API + "/customer/search", contractForm).then((resp) => {
                if (resp.data) {
                    setCustomerData(resp.data);
                    if(resp.data.length === 0) {
                        toast.error("Record Not Found")
                    }
                }
                else { toast.error("Error while fetching customer data") }
            }).catch(error => console.log(error)).finally()

        }
        else {
            toast.error("Please enter value for at least one filed")
        }
    }

    const handleClear = () => {
        setContractForm({
            billRefNo: '',
            customerName: "",
            customerNumber: "",
            contractId: ""
        })
        setCustomerData([]);
    }

    return (
        <Modal isOpen={isOpen.openModal} contentLabel="Contract Search Modal" style={RegularModalCustomStyles}>
            <div className="modal-content">
                <div className="modal-header">
                    <h4 className="page-title">Search Customer</h4>
                    <button type="button" className="close" onClick={handleOnModelClose}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="modal-body overflow-auto cus-srch">
                    <div className="row">
                        <div className="col-md-3">
                            <div className="form-group">
                                <label htmlFor="inputState" className="col-form-label">Billable Reference Number</label>
                                <NumberFormatBase className="form-control mr-2" value={contractForm.billRefNo}
                                    onChange={(e) => { setContractForm({ ...contractForm, billRefNo: e.target.value }) }}
                                />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-group ">
                                <label htmlFor="inputState" className="col-form-label">Customer Name</label>
                                <input type="text" className="form-control mr-2" value={contractForm.customerName}
                                    onChange={(e) => { setContractForm({ ...contractForm, customerName: e.target.value }) }}
                                ></input>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-group ">
                                <label htmlFor="inputState" className="col-form-label">Customer Number</label>
                                <NumberFormatBase type="text" className="form-control mr-2" value={contractForm.customerNumber}
                                    onChange={(e) => { setContractForm({ ...contractForm, customerNumber: e.target.value }) }}
                                />
                            </div>
                        </div>
                    </div>
                    {/* <div className="row">
                        <div className="col-md-3">
                            <div className="form-group ">
                                <label htmlFor="inputState" className="col-form-label">Contract Id</label>
                                <NumberFormatBase className="form-control mr-2" value={contractForm.contractId}
                                    onChange={(e) => { setContractForm({ ...contractForm, contractId: e.target.value }) }}
                                />
                            </div>
                        </div>
                    </div> */}
                    <br /><br /><br />
                    <div className="d-flex justify-content-center">
                        <button type="button" className="btn waves-effect waves-light btn-primary" onClick={handleSubmit} ><i className="fa fa-search mr-1"></i> Search</button>&nbsp;
                        <button type="button" className="btn waves-effect waves-light btn-secondary" onClick={handleClear}>Clear</button>
                    </div>
                    <br />
                    <div className="modal-body overflow-auto cus-srch">
                        {
                            customerData && customerData?.length > 0 &&
                            <div className="card">
                                <DynamicTable
                                    listKey={"Contract List"}
                                    exportBtn={exportBtn}
                                    row={customerData}
                                    itemsPerPage={10}
                                    header={CustomerSearchModalColumns}
                                    handler={{
                                        handleCellRender: handleCellRender,
                                        handleExportButton: setExportBtn
                                    }}
                                />
                            </div>
                        }
                    </div>
                    <br />
                </div>
            </div>
        </Modal >

    )
}

export default SearchCustomerContract;