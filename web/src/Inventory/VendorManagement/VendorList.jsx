import React, { useEffect, useState, useRef, useCallback } from 'react'

import DynamicTable from '../../common/table/DynamicTable'
import { properties } from '../../properties'
import { get, post, put } from '../../common/util/restUtil'
import moment from 'moment'
import { toast } from 'react-toastify'
// import PreviewModal from './previewModal'
import { formFilterObject, USNumberFormat } from '../../common/util/util'
import { unstable_batchedUpdates } from 'react-dom'
import { history } from '../../common/util/history'
import Switch from "react-switch";

const VendorList = (props) => {


    const [data, setData] = useState()
    const [vendorList, setVendorList] = useState([]);
    const [chargeList, setChargeList] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vendorName, setVendorName] = useState("");
    const [mode, setMode] = useState("");
    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const [exportBtn, setExportBtn] = useState(true);
    const [listSearch, setListSearch] = useState([]);
    const [vendorData, setVendorData] = useState([]);
    const [isActive, setIsActive] = useState();
    const [vendorBenefitLookup, setVendorBenefitLookup] = useState([])

    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);

    const getVendorList = useCallback((name = vendorName) => {

        const requestBody = {
            name,
            filters: formFilterObject(filters)
        }
        setListSearch(requestBody);
        post(`${properties.INVENTORY_API}/search?limit=${perPage}&page=${currentPage}`, requestBody)
            .then((response) => {
                const { rows = [], count } = response.data;
                if (count === 0) {
                    toast.error("No Records Found")
                    return
                }       
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }, [perPage, currentPage])

    useEffect(() => {
        getVendorList();
    }, [getVendorList])

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const handleAddEditButton = (mode, data) => {
        const reqBody = {
            mode: mode,
            vendorData: data
        }
        history.push(`${process.env.REACT_APP_BASE}/create-vendor`, { data: reqBody })
    }

    const handleCellRender = (cell, row) => {
        if (cell.column.Header === "Vendor Name") {
            return (<span className="text-secondary cursor-pointer" onClick={() => { setData(row.original); setIsModalOpen(true) }}>{cell.value}</span>)
        }
        else if (cell.column.Header === "Action") {
            return (
                <button type="button" className="skel-btn-submit ml-1" onClick={() => { handleAddEditButton('edit', row.original) }}><i className="mdi mdi-file-document-edit-outline font10 mr-1"></i><small>Edit</small></button>
            )
        }
        else if (cell.column.Header === "Updated At" || cell.column.Header === "Created At") {
            return (<span>{moment(cell.value).format('DD MMM YYYY')}</span>)
        }
        else if (cell.column.Header === "Created By") {
            return (<span>{(row?.original?.createdByUser?.firstName || row?.original?.createdByUser?.lastName) ?
                `${row?.original?.createdByUser?.firstName || ''} ${row?.original?.createdByUser?.lastName || ''}` :
                '-'
            }</span>)
        }
        else if (cell.column.Header === "Updated By") {
            return (<span>
                {(row?.original?.updatedByUser?.firstName || row?.original?.updatedByUser?.lastName) ?
                    `${row?.original?.updatedByUser?.firstName || ''} ${row?.original?.updatedByUser?.lastName || ''}` :
                    '-'
                }</span>)
        }
        else if (cell.column.Header === "Status") {
            return (<span>
                {
                    <Switch onChange={(e) => switchChange(row.original.vendorUuid, e)} checked={cell.value === 'Active' ? true : false} />
                }</span>)
        }
        else {
            return (<span>{cell.value}</span>)
        }
    }

    const switchChange = (key, status) => {
        const reqBody = {
            status: status ? 'AC' : 'IN',
            vendorUuid: key
        }
        put(`${properties.INVENTORY_API}/update/${key}`, reqBody).then((resp) => {
            if (resp.status === 200) {
                getVendorList()
                toast.success(resp.message)
            }
        })
    };

    const handleOnVendorNameSearch = () => {
        unstable_batchedUpdates(() => {
            setPerPage((perPage) => {
                if (perPage === 10) {
                    return '10';
                }
                return 10;
            });
            setCurrentPage((currentPage) => {
                if (currentPage === 0) {
                    return '0';
                }
                return 0;
            });
        })
    }

    return (
        <div className="row mt-1">
            <div className="col-lg-12">
                <div className="col-12 pr-0">
                    <section className="triangle">
                        <div className="row align-items-center">
                            <div className="col max-auto">
                                <h5 id="list-item-1" className="pl-1">Inventory</h5>
                            </div>
                            <div className="col-auto mx-auto">
                                <div className="input-group input-group-sm pr-1 form-inline">
                                    {/* <input type="text" className="form-control border-0" placeholder="Search Vendor Name" value={vendorName} 
									onChange={(e) => setVendorName(e.target.value)} />
                                    <div className="input-group-append">
                                        <div className="btn-group" role="group" aria-label="Basic example">
                                            <button className="btn btn-primary btn-sm btn-sm append-button" onClick={handleOnVendorNameSearch}>
                                                <i className="fe-search" />
                                            </button>
                                        </div>
                                    </div> */}
                                    <button type="button" className="skel-btn-submit"
                                        onClick={() => { handleAddEditButton('create', null) }}><small>Add Vendor</small>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
                <div className='m-1 skel-table-list-single'>
                    {
                        !!vendorList.length &&
                        <DynamicTable
                            listSearch={listSearch}
                            listKey={"Vendor List"}
                            row={vendorList}
                            rowCount={totalCount}
                            header={vendorTableColumns}
                            itemsPerPage={perPage}
                            backendPaging={true}
                            backendCurrentPage={currentPage}
                            isTableFirstRender={isTableFirstRender}
                            hasExternalSearch={hasExternalSearch}
                            handler={{
                                handleCellRender: handleCellRender,
                                handlePageSelect: handlePageSelect,
                                handleItemPerPage: setPerPage,
                                handleCurrentPage: setCurrentPage,
                                handleFilters: setFilters
                            }}
                        />
                    }
                </div>
                {
                    // isModalOpen &&
                    // <PreviewModal
                    //     data={{
                    //         isOpen: isModalOpen,
                    //         data: data,
                    //         module: 'Vendor'
                    //     }}
                    //     handler={{
                    //         setIsOpen: setIsModalOpen,
                    //         vendorBenefitLookup: vendorBenefitLookup
                    //     }}
                    // />
                }
            </div>
        </div>
    )
}

export default VendorList

const vendorTableColumns = [
    {
        Header: "Action",
        accessor: "action",
        disableFilters: true
    },
    {
        Header: "Vendor Name",
        accessor: "vendorName",
        disableFilters: false,
        id: "vendorName"
    },    
    {
        Header: "Primary Person",
        accessor: "vendorTypeDescription.description",
        disableFilters: true
    },
    {
        Header: "Email",
        accessor: "vendorSubTypeDesc.description",
        disableFilters: true,
        id: "vendorSubTypeDesc"
    },
    {
        Header: "Phone",
        accessor: "serviceTypeDescription.description",
        disableFilters: false,
        id: 'serviceType'
    },
    {
        Header: "Address",
        accessor: "chargeName",
        disableFilters: true
    },
    {
        Header: "Bank",
        accessor: "chargeAmount",
        disableFilters: true
    }
]