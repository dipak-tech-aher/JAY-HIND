import React, { useState, useEffect, useCallback, useRef } from 'react';

import DynamicTable from '../../common/table/DynamicTable'
import { properties } from '../../properties';
import { post } from '../../common/util/restUtil';
import moment from 'moment';
import { unstable_batchedUpdates } from 'react-dom';
import { AssetListColumns } from './AssetListColumns';
import PreviewModal from '../previewModal'
import { toast } from 'react-toastify';
import { formFilterObject, USNumberFormat } from '../../common/util/util';

const AssetList = (props) => {

    const { setIsActive, setLocation, setAssetData } = props.handler;
    const [assetList, setAssetList] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [data, setData] = useState()

    // useEffect(() => {
    //     
    //     get(properties.ASSET_API)
    //         .then((response) => {
    //             if (response.data) {
    //                 setAssetList(response.data.rows)
    //             }
    //         })
    //         .finally()
    // }, [])

    const [assetName, setAssetName] = useState("");
    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const [exportBtn, setExportBtn] = useState(true);
    const [listSearch, setListSearch] = useState([]);

    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);

    const getAssetList = useCallback((name = assetName) => {
        
        const requestBody = {
            name,
            filters: formFilterObject(filters)
        }
        setListSearch(requestBody);
        post(`${properties.ASSET_API}/all-list?limit=${perPage}&page=${currentPage}`, requestBody)
            .then((response) => {
                const { count, rows = [] } = response.data;
                if (rows.length === 0) {
                    toast.error("No Records Found")
                    return
                }
                unstable_batchedUpdates(() => {
                    setTotalCount(count);
                    setAssetList(rows);
                })
            }).catch(error => console.log(error))
            .finally()
    }, [perPage, currentPage])

    useEffect(() => {
        getAssetList();
    }, [getAssetList])

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const handleOnAssetNameSearch = () => {
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
        if (cell.column.Header === "Asset Id") {
            return (<span className="text-secondary cursor-pointer px-3" onClick={() => { setData(row.original); setIsModalOpen(true) }}>{cell.value}</span>)
        }
        else if (cell.column.Header === "Charge Name") {
            let chargeName = []
            row?.original?.assetCharges.map((charge) => {
                charge?.chargeDetails && chargeName.push(charge?.chargeDetails?.chargeName) 
            })
            return (<span>{chargeName.toString()}</span>)
        }
        else if (cell.column.Header === "Charge Amount") {
            let chargeAmount = 0;
            row?.original?.assetCharges.forEach((charge) => {
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
            setAssetData(row.original)
        })
    }

    const handleOnAddAsset = () => {
        setIsActive('create-edit');
        setLocation('create');
    }

    return (
        <div className="row mt-1">
            <div className="col-lg-12">
                <section className="triangle">
                    <div className="row align-items-center">
                        <div className="col max-auto">
                            <h4 id="list-item-1" className="pl-1">Add / Edit Asset</h4>
                        </div>
                        <div className="col-auto max-auto">
                            <div className="input-group input-group-sm pr-1 form-inline">
                                <input type="text" className="form-control border-0" placeholder="Search Asset Name" value={assetName} onChange={(e) => setAssetName(e.target.value)} />
                                <div className="input-group-append">
                                    <div className="btn-group" role="group" aria-label="Basic example">
                                        <button className="btn btn-primary btn-sm btn-sm append-button" onClick={handleOnAssetNameSearch}>
                                            <i className="fe-search"></i>
                                        </button>
                                    </div>
                                </div>
                                <button className="btn btn-labeled btn-primary btn-sm ml-1" onClick={handleOnAddAsset}>
                                    <small className="align-middle">Add Asset</small>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
                <div className='mt-1'>
                    {
                        !!assetList.length &&
                        <DynamicTable
                            listSearch={listSearch}
                            listKey={"Asset List"}
                            row={assetList}
                            rowCount={totalCount}
                            header={AssetListColumns}
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
                            module: 'Asset'
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

export default AssetList;