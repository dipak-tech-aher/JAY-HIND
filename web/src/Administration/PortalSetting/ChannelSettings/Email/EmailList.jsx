import { useCallback, useEffect, useState } from "react";
import { unstable_batchedUpdates } from "react-dom";
import { toast } from 'react-toastify';

import DynamicTable from '../../../../common/table/DynamicTable';
import { properties } from '../../../../properties';
import { history } from '../../../../common/util/history';
import { get } from '../../../../common/util/restUtil';

const EmailList = () => {

    const [emailSettingsData, setEmailSettingsData] = useState(null)
    const [tableRowData, setTableRowData] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [Mode, setMode] = useState('ADD')

    useEffect(() => {
        
        get(`${properties.PORTAL_SETTING_API}/EMAIL`)
            .then((response) => {
                const { status, data } = response;
                if (data) {
                    if (status === 200 && !!Object.keys(data).length) {
                        setTableRowData(data)
                    }
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }, [])

    const handleCellRender = (cell, row) => {
        if (cell.column.Header === "Channel ID") {
            return (<span className="text-secondary cursor-pointer" onClick={(e) => handleCellLinkClick(e, row.original, 'EMAIL_VIEW')}>{cell.value}</span>)
        }

        else if (['Status'].includes(cell.column.Header)) {
            return (<span>{cell.value === 'Active' ? 'Active' : cell.value === 'Inactive' ? 'Inactive' : ''}</span>)
        }
        else if (cell.column.Header === "Action") {
            return (
                <button type="button" className="btn btn-labeled btn-primary btn-sm" onClick={(e) => handleCellLinkClick(e, row.original, 'EMAIL_EDIT')}>
                    Edit
                </button>)
        }
        else {
            return (<span>{cell.value}</span>)
        }
    }

    const handleCellLinkClick = useCallback((e, rowData, mode) => {
        unstable_batchedUpdates(() => {
            setMode(mode)
            setIsModalOpen(true)
            if (['EMAIL_EDIT', 'EMAIL_VIEW'].includes(mode)) {
                setEmailSettingsData(rowData)
            } else {
                setEmailSettingsData(null)
            }
        })
    })

    useEffect(() => {

        if (isModalOpen) {
            const data = {
                ActiveTab: "create-email-list",
                Mode,
                emailSettingsData,
                tableRowData
            }
            history.push(`${process.env.REACT_APP_BASE}/portal-settings/channel-settings`, { data })
        }
        return () => { }
    }, [isModalOpen])

    return (
        <>

            <div className="row mt-1">
                <div className="col-12">
                    <div className="m-t-30 card-box">
                        <div className="col-12 pr-0">
                            <section className="triangle">
                                <div className="col-md-12 row">
                                    <div className="col-md-8">
                                        <h4 id="list-item-1" className="pl-2">Email Accounts</h4>
                                    </div>
                                    <div className="col-md-4">
                                        <span style={{ float: "right" }}>
                                            <button type="button" className="btn btn-labeled btn-primary btn-sm mt-1" onClick={(e) => handleCellLinkClick(e, {}, 'ADD')}>
                                                <small>Add Email Support</small>
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
                                           ( tableRowData && tableRowData?.mappingPayload && !!tableRowData?.mappingPayload.length>0) ?
                                            <div className="card">
                                                <DynamicTable
                                                    listKey={"API Setting List"}
                                                    row={tableRowData?.mappingPayload || []}
                                                    filterRequired={false}
                                                    header={EmailSettingColumns}
                                                    itemsPerPage={10}
                                                    exportBtn={false}
                                                    handler={{
                                                        handleCellRender: handleCellRender
                                                    }}
                                                />
                                            </div>
                                            :
                                            <p className="p-1" style={{textAlign:"center"}}>No Record Found</p>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default EmailList;


const EmailSettingColumns = [
    {
        Header: "Channel ID",
        accessor: "id",
        disableFilters: true,
    },
    {
        Header: "Email Id",
        accessor: "emailId",
        disableFilters: true,
    },
    {
        Header: "Email Type",
        accessor: "AccountType",
        disableFilters: true,
    },
    {
        Header: "Outgoing Mail Server",
        accessor: "outgoingServer",
        disableFilters: true,
    },
    {
        Header: "Channel Category",
        accessor: "channelCategory",
        disableFilters: true,
    },
    {
        Header: "Status",
        accessor: "Status",
        disableFilters: true,
    },
    {
        Header: "Action",
        accessor: "action",
        disableFilters: true,
    }
]