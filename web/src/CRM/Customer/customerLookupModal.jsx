import React, { useState, useEffect, useRef } from 'react'
import { NumberFormatBase } from 'react-number-format';
import Modal from 'react-modal';
import { post } from "../../common/util/restUtil";
import { toast } from 'react-toastify';
import { properties } from '../../properties';
import { CustomerLookupModalCols } from './customerLookupCols'
import DynamicTable from '../../common/table/DynamicTable';
import { formFilterObject, RegularModalCustomStyles } from '../../common/util/util';
import { unstable_batchedUpdates } from 'react-dom';

const CustomerLookupModal = (props) => {

    const { isOpen } = props.data;
    const { setIsOpen , handleModalClick} = props.modalStateHandlers;
    const [customerType, setCustomerType] = useState();
    const isFirstRender = useRef(true);
    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const [exportBtn, setExportBtn] = useState(false)

    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);
    const [customerSearchData, setCustomerSearchData] = useState([]);

  
    const initialValues = {
        customerName: "",
        customerNumber: "",
        primaryContactNumber: "",
        customerType: "",
    }
    const [data, setData] = useState(initialValues)
    const handleOnModelClose = () => {
        setIsOpen(false);
    }
    useEffect(() => {
        if (!isFirstRender.current) {
            onHandleSubmit();
        }
        else {
            isFirstRender.current = false;
        }
    }, [currentPage, perPage])

    useEffect(() => {
        post(properties.BUSINESS_ENTITY_API, ['CUSTOMER_TYPE']).then((resp) => {
            if (resp.data) {
                setCustomerType(resp.data.CUSTOMER_TYPE)
            }
        }).catch((error) => {
            console.log(error)
        })
    }, [])

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const onHandleSubmit = () => {
        if(data.customerName === "" && data.customerNumber === "" && data.customerType === "")
        {
            toast.error("Please Provide the Search Values")
            return
        }
        
        const requestBody = {
            ...data,
            filters: formFilterObject(filters)
        }
        post(`${properties.CUSTOMER_API}/searching?limit=${perPage}&page=${currentPage}`, requestBody)
            .then((resp) => {
                if (resp.data) {
                    if (resp.status === 200) {
                        const { count, rows } = resp.data;
                        console.log(resp.data)
                        unstable_batchedUpdates(() => {
                            setTotalCount(count)
                            setCustomerSearchData(rows);
                        })
                        if(count === 0) {
                            toast.error("Records Not Found")
                        }
                    } else {
                        setCustomerSearchData([])
                        toast.error("Records Not Found")
                        //toast.error("Error searching for customer - " + resp.status + ', ' + resp.message);
                    }
                } else {
                    setCustomerSearchData([])
                    toast.error("Records Not Found")
                    //toast.error("Uexpected error searching for customer " + resp.statusCode);
                }
            }).catch((error) => {
                console.log(error)
            }).finally(() => {
                
                // isTableFirstRender.current = false;
            });

    }
    const handleTableClick = (rowData) => {
        handleModalClick(rowData, true)
        setIsOpen(false)
        // history.push(`${process.env.REACT_APP_BASE}/new-service-account`, {
        //     data: {
        //         rowData,
        //         viewContractDetails: true,
        //     }
        // })
    }
    const handleCellRender = (cell, row) => {
        if (cell.column.Header === "Customer Number") {
            let cNo = row?.original?.crmCustomerNo
            return (
                <span className="text-secondary cursor-pointer" onClick={() => handleTableClick(row.original)}>
                {cNo}
            </span>
            )
        }
        else if (cell.column.Header === "Customer Name") {
            let name = (row?.original?.firstName || "") + " " + (row?.original?.lastName || "")
            return (<span>{name}</span>);
        }
        return (
            <span>{cell.value}</span>
        )
    }



    return (
        < Modal style={RegularModalCustomStyles} isOpen={isOpen} >
            <div className="modal-content">
                <div className="modal-header">
                    <h4 className="modal-title">Customer Lookup</h4>
                    <button type="button" className="close" onClick={() => {
                        handleOnModelClose()
                        setData(initialValues)
                    }}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div></div>
                <div className="modal-body">
                    <fieldset className="scheduler-border">
                        <form className="d-flex justify-content-center">
                            <div className="form-row col-md-12">

                                <div className="col-md-3">
                                    <label >Customer Number</label>
                                    <NumberFormatBase value={data.customerNumber} className="form-control" type="text" required="" placeholder="Customer Number"
                                        onChange={(e) => {
                                            setData({ ...data, customerNumber: e.target.value })

                                        }
                                        } />
                                </div>
                                <div className="col-md-3">
                                    <label >Customer Name</label>
                                    <input id="roleDesc" value={data.customerName} className="form-control" type="text" required="" placeholder="First Name"
                                        onChange={(e) => {
                                            setData({ ...data, customerName: e.target.value })
                                        }
                                        } />
                                </div>
                                <div  className="col-md-3">
                                    <label >Customer Type</label>
                                    <select id="contactType" value={data.customerType} className="form-control"
                                        onChange={(e) => {
                                            setData({ ...data, customerType: e.target.value })

                                        }
                                        }
                                    >
                                        <option value="">Choose Customer Type</option>
                                        {
                                            customerType && customerType.map((e) => (
                                                <option key={e.code} value={e.code}>{e.description}</option>
                                            ))
                                        }
                                    </select>

                                </div>
                                <div  className="col-md-3 mt-1">
                                    <button type="button" className="btn waves-effect waves-light btn-primary mt-3 p-1 ml-1 btn-l" onClick={onHandleSubmit}><i className="fa fa-search mr-1"></i> Search</button>
                                </div>

                            </div>
                        </form>


                    </fieldset>
                    <div className="modal-body overflow-auto cus-srch">
                        {
                            customerSearchData && customerSearchData?.length > 0 &&
                            <div className="card">
                                {/* <DynamicTable
                                    listKey={"Customer List"}
                                    exportBtn={exportBtn}
                                    row={customerSearchData}
                                    itemsPerPage={10}
                                    header={CustomerLookupModalCols}
                                    handler={{
                                        handleCellRender: handleCellRender,
                                        handleExportButton: setExportBtn
                                    }}
                                /> */}
                                <DynamicTable
                                    listKey={"Customer List"}
                                    row={customerSearchData}
                                    rowCount={totalCount}
                                    header={CustomerLookupModalCols}
                                    itemsPerPage={perPage}
                                    backendPaging={true}
                                    backendCurrentPage={currentPage}
                                    isTableFirstRender={isTableFirstRender}
                                    hasExternalSearch={hasExternalSearch}
                                    exportBtn={exportBtn}
                                    handler={{
                                        handleCellRender: handleCellRender,
                                        handlePageSelect: handlePageSelect,
                                        handleItemPerPage: setPerPage,
                                        handleCurrentPage: setCurrentPage,
                                        handleFilters: setFilters,
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
export default CustomerLookupModal