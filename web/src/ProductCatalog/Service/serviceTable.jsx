import React, { useEffect, useState, useCallback, useRef } from 'react'

import DynamicTable from '../../common/table/DynamicTable'
import { properties } from '../../properties'
import { get, post } from '../../common/util/restUtil'
import moment from 'moment'
import { toast } from 'react-toastify'
import PreviewModal from '../previewModal'
import { formFilterObject, USNumberFormat } from '../../common/util/util'
import { unstable_batchedUpdates } from 'react-dom'

const ServiceTable = (props) => {

    const setIsActive = props.handler.setIsActive
    const setServiceData = props.handler.setServiceData
    const setLocation = props.handler.setLocation
    const [serviceList, setServiceList] = useState([]);
    const [chargeList, setChargeList] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [data, setData] = useState();
    const [serviceName, setServiceName] = useState("");

    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const [exportBtn, setExportBtn] = useState(true);
    const [listSearch, setListSearch] = useState([]);


    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);

    const getServiceList = useCallback((name = serviceName) => {
        
        const requestBody = {
            name,
            filters: formFilterObject(filters)
        }
        setListSearch(requestBody);
        post(`${properties.CATALOG_SERVICE_API}/search?limit=${perPage}&page=${currentPage}`, requestBody)
            .then((response) => {
                const { count, rows = [] } = response.data;
                if (rows.length === 0) {
                    toast.error("No Records Found")
                    return
                }
                unstable_batchedUpdates(() => {
                    setTotalCount(count);
                    setServiceList(rows);

                    get(properties.CHARGE_API + "/search/all")
                        .then((resp) => {
                            if (resp.data.length > 0) {
                                setChargeList(resp.data)
                            }
                        }).catch(error => console.log(error))
                })
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }, [perPage, currentPage])

    useEffect(() => {
        getServiceList();
    }, [getServiceList])

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const handleCellRender = (cell, row) => {
        if (cell.column.Header === "Service Item Id") {
            return (<span className="text-secondary cursor-pointer" onClick={() => { setData(row.original); setIsModalOpen(true) }}>{cell.value}</span>)
        }
        else if (cell.column.Header === "Action") {
            return (
                <button type="button" className="btn btn-labeled btn-primary btn-sm ml-1" onClick={() => { setIsActive('create-edit'); setLocation('edit'); setServiceData(row.original) }}><i className="mdi mdi-file-document-edit-outline font10 mr-1"></i><small>Edit</small></button>
            )
        }
        else if (cell.column.Header === "Start Date" || cell.column.Header === "End Date") {
            return (<span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : ''}</span>)
        }
        else if (cell.column.Header === "Charge Name") {
            let chargeName = []
            row?.original?.serviceCharges.map((charge) => {
                chargeList.map((chargeNode) => {
                    if (Number(charge.chargeId) === Number(chargeNode.chargeId)) {
                        chargeName.push(chargeNode.chargeName)
                    }
                })
            })
            return (<span>{chargeName.toString()}</span>)
        }
        else if (cell.column.Header === "Charge Amount") {
            let chargeAmount = 0;
            row?.original?.serviceCharges.forEach((charge) => {
                chargeAmount += Number(charge.chargeAmount)
            })
            return (<span>{USNumberFormat(chargeAmount)}</span>)
        }
        else if (cell.column.Header === "Updated At" || cell.column.Header === "Created At") {
            return (<span>{moment(cell.value).format('DD MMM YYYY hh:mm:ss A')}</span>)
        }
        else if (cell.column.Header === "Created By") {
            return (<span>{row?.original?.createdByName?.firstName + " " + row?.original?.createdByName?.lastName}</span>)
        }
        else if (cell.column.Header === "Updated By") {
            return (<span>{row?.original?.updatedByName?.firstName + " " + row?.original?.updatedByName?.lastName}</span>)
        }
        else {
            return (<span>{cell.value}</span>)
        }
    }

    const handleOnServiceNameSearch = () => {
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
        <>
            <div className="row mt-1">
                <div className="col-lg-12">
                    <div className="col-12 pr-0">
                        <section className="triangle">
                            <div className="row">
                                <div className="col mx-auto">
                                    <h4 id="list-item-1" className="pl-1">Add / Edit Service</h4>
                                </div>
                                <div className="col-auto mx-auto">
                                    <div className="input-group input-group-sm pr-1 pt-1 form-inline">
                                        <input type="text" className="form-control border-0" placeholder="Search Service Name" value={serviceName} onChange={(e) => setServiceName(e.target.value)} />
                                        <div className="input-group-append">
                                            <div className="btn-group" role="group" aria-label="Basic example">
                                                <button className="btn btn-primary btn-sm btn-sm append-button" onClick={handleOnServiceNameSearch}>
                                                    <i className="fe-search" />
                                                </button>
                                            </div>
                                        </div>
                                        <button type="button" className="btn btn-labeled btn-primary btn-sm ml-1" onClick={() => { setIsActive('create-edit'); setLocation('create') }}><small>Add New service</small></button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                    <div className='m-1'>
                        {
                            !!serviceList.length &&
                            <DynamicTable
                                listSearch={listSearch}
                                listKey={"Service List"}
                                row={serviceList}
                                rowCount={totalCount}
                                header={planTableColumns}
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
                        }
                    </div>
                    {
                        isModalOpen &&
                        <PreviewModal
                            data={{
                                isOpen: isModalOpen,
                                data: data,
                                module: 'Service'
                            }}
                            handler={{
                                setIsOpen: setIsModalOpen
                            }}
                        />
                    }
                </div>
            </div>
        </>
    )
}

export default ServiceTable

const planTableColumns = [
    {
        Header: "Service Item Id",
        accessor: "serviceId",
        disableFilters: false
    },
    {
        Header: "Service Name",
        accessor: "serviceName",
        disableFilters: false
    },
    {
        Header: "Service Type",
        accessor: "serviceTypeDesc.description",
        disableFilters: false,
        id: 'serviceType'
    },
    {
        Header: "Charge Name",
        accessor: "chargeName",
        disableFilters: false
    },
    {
        Header: "Charge Amount",
        accessor: "chargeAmount",
        disableFilters: false
    },
    {
        Header: "Start Date",
        accessor: "startDate",
        disableFilters: true
    },
    {
        Header: "End Date",
        accessor: "endDate",
        disableFilters: true
    },
    {
        Header: "Status",
        accessor: "statusDesc.description",
        disableFilters: false,
        id: 'serviceStatus'
    },
    {
        Header: "Updated By",
        accessor: "updatedBy",
        disableFilters: false
    },
    {
        Header: "Updated At",
        accessor: "updatedAt",
        disableFilters: false
    },
    {
        Header: "Created By",
        accessor: "createdBy",
        disableFilters: false
    },
    {
        Header: "Created At",
        accessor: "createdAt",
        disableFilters: true
    },
    {
        Header: "Action",
        accessor: "action",
        disableFilters: true
    }
]