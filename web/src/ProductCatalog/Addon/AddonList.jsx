import React, { useState, useEffect, useRef, useCallback } from 'react';

import DynamicTable from '../../common/table/DynamicTable'
import { properties } from '../../properties';
import { post } from '../../common/util/restUtil';
import moment from 'moment';
import { unstable_batchedUpdates } from 'react-dom';
import { AddonListColumns } from './AddonListColumns';
import PreviewModal from '../previewModal'
import { formFilterObject, USNumberFormat } from '../../common/util/util';
import { toast } from 'react-toastify';

const AddonList = (props) => {

    const { setIsActive, setLocation, setAddonData } = props.handler;
    const [addonList, setAddonList] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [data, setData] = useState()
    const [addonName, setAddonName] = useState("");
    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const [exportBtn, setExportBtn] = useState(true);

    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);
    const [listSearch, setListSearch] = useState([]);

    const getAddonList = useCallback((name = addonName) => {
        
        const requestBody = {
            name,
            filters: formFilterObject(filters)
        }
        setListSearch(requestBody);
        post(`${properties.ADDON_API}/all-list?limit=${perPage}&page=${currentPage}`, requestBody)
            .then((response) => {
                const { count, rows = [] } = response.data;
                if (rows.length === 0) {
                    toast.error("No Records Found")
                    return
                }
                unstable_batchedUpdates(() => {
                    setTotalCount(count);
                    setAddonList(rows);
                })
            }).catch(error => console.log(error))
            .finally()
    }, [perPage, currentPage])


    useEffect(() => {
        getAddonList();
    }, [getAddonList])

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const handleOnAddonNameSearch = () => {
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

    const handleCellRender = (cell, row) => {
        if (cell.column.Header === "Addon Id") {
            return (<span className="text-secondary cursor-pointer px-3" onClick={() => { setData(row.original); setIsModalOpen(true) }}>{cell.value}</span>)
        }
        else if (cell.column.Header === "Charge Name") {
            let chargeName = []
            row?.original?.addonCharges.map((charge) => {
                charge?.chargeDetails && chargeName.push(charge?.chargeDetails?.chargeName) 
            })
            return (<span>{chargeName.toString()}</span>)
        }
        else if (cell.column.Header === "Charge Amount") {
            let chargeAmount = 0;
            row?.original?.addonCharges.forEach((charge) => {
                chargeAmount += Number(charge.chargeAmount)
            })
            return (<span>{USNumberFormat(chargeAmount)}</span>)
        }
        else if (cell.column.Header === "Action") {
            return (
                <button type="button" className="btn btn-labeled btn-primary btn-sm ml-1" onClick={() => handleOnEdit(row)}><i className="mdi mdi-file-document-edit-outline font10 mr-1"></i><small>Edit</small></button>
            )
        }
        if (["Start Date", "End Date"].includes(cell.column.Header)) {
            return (<span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>)
        }
        if (["Created At", "Updated At"].includes(cell.column.Header)) {
            return (<span>{cell.value ? moment(cell.value).format('DD MMM YYYY hh:mm:ss A') : '-'}</span>)
        }
        else {
            return (<span>{cell.value ? cell.value : '-'}</span>)
        }
    }

    const handleOnEdit = (row) => {
        unstable_batchedUpdates(() => {
            setIsActive('create-edit');
            setLocation('edit');
            setAddonData(row.original)
        })
    }

    const handleOnAddAddon = () => {
        setIsActive('create-edit');
        setLocation('create');
    }

    return (
        <div className="row mt-1">
            <div className="col-lg-12">
                <section className="triangle">
                    <div className="row align-items-center">
                        <div className="col max-auto">
                            <h4 id="list-item-1" className="pl-1">Add / Edit Addon</h4>
                        </div>
                        <div className="col-auto max-auto">
                            <div className="input-group input-group-sm pr-1 pt-1 form-inline">
                                <input type="text" className="form-control border-0" placeholder="Search Addon Name" value={addonName} onChange={(e) => setAddonName(e.target.value)} />
                                <div className="input-group-append">
                                    <div className="btn-group" role="group" aria-label="Basic example">
                                        <button className="btn btn-primary btn-sm btn-sm append-button" onClick={handleOnAddonNameSearch}>
                                            <i className="fe-search"></i>
                                        </button>
                                    </div>
                                </div>
                                <button className="btn btn-labeled btn-primary btn-sm ml-1" onClick={handleOnAddAddon}>
                                    <small className="align-middle">Add Addon</small>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
                <div className='mt-1'>
                    {
                        !!addonList.length &&
                        <DynamicTable
                            listSearch={listSearch}
                            listKey={"Addon List"}
                            row={addonList}
                            rowCount={totalCount}
                            header={AddonListColumns}
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
                            module: 'Addon'
                        }}
                        handler={{
                            setIsOpen: setIsModalOpen
                        }}
                    />
                }
            </div>
        </div>
    )
}

export default AddonList;