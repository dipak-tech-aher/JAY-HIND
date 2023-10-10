import React, { useEffect, useState, useRef, useCallback } from 'react'

import DynamicTable from '../../common/table/DynamicTable'
import { properties } from '../../properties'
import { get, post, put } from '../../common/util/restUtil'
import moment from 'moment'
import { toast } from 'react-toastify'
import PreviewModal from './previewModal'
import { formFilterObject, USNumberFormat } from '../../common/util/util'
import { unstable_batchedUpdates } from 'react-dom'
import { history } from '../../common/util/history'
import Switch from "react-switch";

const InventoryList = (props) => {


    const [data, setData] = useState()
    const [itemList, setItemList] = useState([]);
    const [chargeList, setChargeList] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemName, setItemName] = useState("");
    const [mode, setMode] = useState("");
    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const [exportBtn, setExportBtn] = useState(true);
    const [listSearch, setListSearch] = useState([]);
    const [itemData, setItemData] = useState([]);
    const [isActive, setIsActive] = useState();
    const [itemBenefitLookup, setItemBenefitLookup] = useState([])

    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);

    useEffect(() => {
        get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam=PRODUCT_BENEFIT')
            .then((response) => {              
                setItemBenefitLookup(response.data.PRODUCT_BENEFIT)
            })
            .catch((error) => {
                console.log("error", error)
            })
        },[])

    const getItemList = useCallback((name = itemName) => {

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
                unstable_batchedUpdates(() => {
                    setTotalCount(count);
                    setItemList(rows);

                    get(properties.CHARGE_API + "/search/all")
                        .then((resp) => {
                            if (resp.data.length > 0) {
                                setChargeList(resp.data)
                            }
                        })
                })
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }, [perPage, currentPage])

    useEffect(() => {
        getItemList();
    }, [getItemList])

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const handleAddEditButton = (mode, data) => {
        const reqBody = {
            mode: mode,
            itemData: data
        }
        history.push(`${process.env.REACT_APP_BASE}/create-item`, { data: reqBody })
    }

    const handleCellRender = (cell, row) => {
        if (cell.column.Header === "Item Name") {
            return (<span className="text-secondary cursor-pointer" onClick={() => { setData(row.original); setIsModalOpen(true) }}>{cell.value}</span>)
        }
        else if (cell.column.Header === "Action") {
            return (
                <button type="button" className="skel-btn-submit ml-1" onClick={() => { handleAddEditButton('edit', row.original) }}><i className="mdi mdi-file-document-edit-outline font10 mr-1"></i><small>Edit</small></button>
            )
        }
        else if (cell.column.Header === "Activation Date" || cell.column.Header === "Expiry Date") {
            return (<span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : ''}</span>)
        }
        else if (cell.column.Header === "Charge Name") {

            let chargeName = []
            row?.original?.itemChargesList.map((charge) => {
                chargeList.map((chargeNode) => {
                    if (Number(charge.chargeId) === Number(chargeNode.chargeId) && charge.objectReferenceId === null) {
                        chargeName.push(chargeNode.chargeName)
                    }
                })
            })

            return (<span>{chargeName.toString()}</span>)
        }
        else if (cell.column.Header === "Charge Amount") {

            let chargeAmount = 0;
            row?.original?.itemChargesList.forEach((charge) => {
                chargeAmount += Number(charge.chargeAmount)
            })

            return (<span>{USNumberFormat(chargeAmount)}</span>)
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
                    <Switch onChange={(e) => switchChange(row.original.itemUuid, e)} checked={cell.value === 'Active' ? true : false} />
                }</span>)
        }
        else {
            return (<span>{cell.value}</span>)
        }
    }

    const switchChange = (key, status) => {
        const reqBody = {
            status: status ? 'AC' : 'IN',
            itemUuid: key
        }
        put(`${properties.INVENTORY_API}/update/${key}`, reqBody).then((resp) => {
            if (resp.status === 200) {
                getItemList()
                toast.success(resp.message)
            }
        })
    };

    const handleOnItemNameSearch = () => {
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
                                <h5 id="list-item-1" className="pl-1">Add / Edit Inventory</h5>
                            </div>
                            <div className="col-auto mx-auto">
                                <div className="input-group input-group-sm pr-1 form-inline">
                                    {/* <input type="text" className="form-control border-0" placeholder="Search Item Name" value={itemName} 
									onChange={(e) => setItemName(e.target.value)} />
                                    <div className="input-group-append">
                                        <div className="btn-group" role="group" aria-label="Basic example">
                                            <button className="btn btn-primary btn-sm btn-sm append-button" onClick={handleOnItemNameSearch}>
                                                <i className="fe-search" />
                                            </button>
                                        </div>
                                    </div> */}
                                    <button type="button" className="skel-btn-submit"
                                        onClick={() => { handleAddEditButton('create', null) }}><small>Add Inventory</small></button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
                <div className='m-1 skel-table-list-single'>
                    {
                        !!itemList.length &&
                        <DynamicTable
                            listSearch={listSearch}
                            listKey={"Item List"}
                            row={itemList}
                            rowCount={totalCount}
                            header={itemTableColumns}
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
                    isModalOpen &&
                    <PreviewModal
                        data={{
                            isOpen: isModalOpen,
                            data: data,
                            module: 'Item'
                        }}
                        handler={{
                            setIsOpen: setIsModalOpen,
                            itemBenefitLookup: itemBenefitLookup
                        }}
                    />
                }
            </div>
        </div>
    )
}

export default InventoryList

const itemTableColumns = [
    {
        Header: "Item Name",
        accessor: "itemName",
        disableFilters: false,
        id: "itemName"
    },
    {
        Header: "Action",
        accessor: "action",
        disableFilters: true
    },
    {
        Header: "Item Type",
        accessor: "itemTypeDescription.description",
        disableFilters: true
    },
    {
        Header: "Item Sub Type",
        accessor: "itemSubTypeDesc.description",
        disableFilters: true,
        id: "itemSubTypeDesc"
    },
    {
        Header: "Service Type",
        accessor: "serviceTypeDescription.description",
        disableFilters: false,
        id: 'serviceType'
    },
    {
        Header: "Charge Name",
        accessor: "chargeName",
        disableFilters: true
    },
    {
        Header: "Charge Amount",
        accessor: "chargeAmount",
        disableFilters: true
    },
    {
        Header: "Activation Date",
        accessor: "activationDate",
        disableFilters: true
    },
    {
        Header: "Expiry Date",
        accessor: "expiryDate",
        disableFilters: true
    },
    {
        Header: "Status",
        accessor: "statusDesc.description",
        disableFilters: true,
        id: 'status'
    },
    {
        Header: "Updated By",
        accessor: "updatedByUser",
        disableFilters: false
    },
    {
        Header: "Updated At",
        accessor: "updatedAt",
        disableFilters: true
    },
    {
        Header: "Created By",
        accessor: "createdByUser",
        disableFilters: false
    },
    {
        Header: "Created At",
        accessor: "createdAt",
        disableFilters: true
    }
]