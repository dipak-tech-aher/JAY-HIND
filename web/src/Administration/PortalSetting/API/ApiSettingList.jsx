import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import moment from 'moment'

import { properties } from '../../../properties';
import { get } from '../../../common/util/restUtil';
import DynamicTable from '../../../common/table/DynamicTable';
import AddEditViewApiSetting from './AddEditViewApiSetting';

const ApiSettingList = () => {

    const [tableRowData, setTableRowData] = useState(null);
    const [isModalOpen,setIsModalOpen] = useState(false)
    const [modalMode,setModalMode] = useState('ADD')
    const [apiSettingData,setApiSettingData] = useState(null)

    useEffect(() => {
        
        get(`${properties.PORTAL_SETTING_API}/API`)
            .then((response) => {
                const { status, data } = response;
                if(data) {
                    if (status === 200 && !!Object.keys(data).length) {
                        setTableRowData(data)
                    }
                }
                else {
                    toast.error("Record Not Found")
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }, [])

    const handleCellRender = (cell, row) => {
        if (cell.column.Header === "API Name") {
            return (<span className="text-secondary cursor-pointer" onClick={(e) => handleCellLinkClick(e, row.original,'VIEW')}>{cell.value}</span>)
        }
        else if (['Mode'].includes(cell.column.Header)) {
            return (<span>{cell.value === 'TEST' ? 'Test' : cell.value === 'LIVE' ? 'Live' : cell.value === 'DEBUG' ? 'Debug' : ''}</span>)
        }
        else if (['Status'].includes(cell.column.Header)) {
            return (<span>{cell.value === 'ACTIVE' ? 'Active' : cell.value === 'INACTIVE' ? 'Inactive' : ''}</span>)
        }
        else if (['Created At'].includes(cell.column.Header)) {
            return (<span>{tableRowData?.createdAt ? moment(tableRowData?.createdAt).format('DD MMM YYYY hh:mm:ss A') : '-'}</span>)
        }
        else if (['Updated At'].includes(cell.column.Header)) {
            return (<span>{tableRowData?.updatedAt ? moment(tableRowData?.updatedAt).format('DD MMM YYYY hh:mm:ss A') : '-'}</span>)
        }
        else if (['Created By'].includes(cell.column.Header)) {
            let name = (tableRowData?.createdByName?.firstName || "") + " " + (tableRowData?.createdByName?.lastName || "")
            return (<span>{name}</span>);
        }
        else if (['Updated By'].includes(cell.column.Header)) {
            let name = (tableRowData?.updatedByName?.firstName || "") + " " + (tableRowData?.updatedByName?.lastName || "")
            return (<span>{name}</span>);
        }
        else if (cell.column.Header === "Action") {
            return (
            <button type="button" className="btn btn-labeled btn-primary btn-sm" onClick={(e) => handleCellLinkClick(e, row.original,'EDIT')}>
                Edit
            </button>)
        }
        else {
            return (<span>{cell.value}</span>)
        }
    }

    const handleCellLinkClick = (e, rowData, mode) => {
        setModalMode(mode)
        setIsModalOpen(true)
        if(['EDIT','VIEW'].includes(mode)) {
            setApiSettingData(rowData)
        } else {
            setApiSettingData(null)
        }
    }


    return (
        <div className="row mt-1">
            <div className="col-12">
                <div className="page-title-box">
                    <h4 className="page-title">API</h4>
                </div>
                <div className="m-t-30 card-box">
                    <div className="col-12 pr-0">
					    <section className="triangle">
                            <div className="col-md-12 row">
                                <div className="col-md-8">
                                    <h4 id="list-item-1" className="pl-2">Created API</h4>
                                </div>
                                <div className="col-md-4">
                                    <span style={{float: "right"}}>
                                        <button type="button" className="btn btn-labeled btn-primary btn-sm mt-1" onClick={(e) => handleCellLinkClick(e,{},'ADD')}>
                                            <small>Add New API</small>
                                        </button>
                                    </span>
                                </div>
                            </div>
                        </section>
					</div>
                    <div className="row mt-2 pr-2">
                        <div className="col-lg-12">
                            <div className="card">
                                <div>
                                    {
                                        tableRowData && tableRowData?.mappingPayload && !!tableRowData?.mappingPayload.length &&
                                        <div className="card">
                                            <DynamicTable
                                                listKey={"API Setting List"}
                                                row={tableRowData?.mappingPayload || []}
                                                filterRequired={false}
                                                header={ApiSettingColumns}
                                                itemsPerPage={10}
                                                exportBtn={false}
                                                handler={{
                                                    handleCellRender: handleCellRender
                                                }}
                                            />
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 text-center pt-2 pb-2">
                        <Link className="btn btn-sm waves-effect waves-light btn-primary" to={`${process.env.REACT_APP_BASE}/admin-dashboard`} >Back to Admin Dashboard</Link>
                    </div>
                    {
                        isModalOpen &&
                        <AddEditViewApiSetting
                            data={{
                                isOpen: isModalOpen,
                                modalMode,
                                apiSettingData,
                                tableRowData
                            }}
                            handler={{
                                setIsOpen: setIsModalOpen
                            }}
                        />
                    }
                </div>
            </div>
        </div>
    )
}

export default ApiSettingList;

const ApiSettingColumns = [
    {
        Header: "API Name",
        accessor: "apiName",
        disableFilters: false,
    },
    {
        Header: "API Base URL",
        accessor: "apiBaseUrl",
        disableFilters: false,
    },
    {
        Header: "Application Token/Site Key",
        accessor: "appToken",
        disableFilters: false,
    },
    {
        Header: "Secret Key",
        accessor: "secretKey",
        disableFilters: false,
    },
    {
        Header: "Mode",
        accessor: "mode",
        disableFilters: false,
    },
    {
        Header: "Status",
        accessor: "status",
        disableFilters: false,
    },
    {
        Header: "Created By",
        accessor: "createdBy",
        disableFilters: false,
    },
    {
        Header: "Created At",
        accessor: "createdAt",
        disableFilters: false,
    },
    {
        Header: "Updated By",
        accessor: "updatedBy",
        disableFilters: false,
    },
    {
        Header: "Updated At",
        accessor: "updatedAt",
        disableFilters: false,
    },
    {
        Header: "Action",
        accessor: "action",
        disableFilters: false,
    }
]