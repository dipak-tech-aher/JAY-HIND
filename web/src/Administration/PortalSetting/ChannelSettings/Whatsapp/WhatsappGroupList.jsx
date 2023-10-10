import { useCallback, useEffect, useState } from "react";
import { unstable_batchedUpdates } from "react-dom";
import { toast } from 'react-toastify';

import DynamicTable from '../../../../common/table/DynamicTable';
import { properties } from '../../../../properties';
import { history } from '../../../../common/util/history';
import { get } from '../../../../common/util/restUtil';

const WhatsappGroupList = (props) => {

    const [whatsappSettingData, setWhatsappSettingData] = useState(null)
    const [tableRowData, setTableRowData] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [Mode, setMode] = useState('ADD')

    useEffect(() => {
        
        get(`${properties.PORTAL_SETTING_API}/WHATSAPP`)
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
            return (<span className="text-secondary cursor-pointer" onClick={(e) => handleCellLinkClick(e, row.original, 'VIEW')}>{cell.value}</span>)
        }
        else if (cell.column.Header === "Status") {
            return (<span>{cell.value === 'Y' ? 'Active' : cell.value === 'N' ? 'Inactive' : ''}</span>)
        }
        else if (cell.column.Header === "Action") {
            return (
                <button type="button" className="btn btn-labeled btn-primary btn-sm" onClick={(e) => handleCellLinkClick(e, row.original, 'EDIT')}>
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
            if (['EDIT', 'VIEW'].includes(mode)) {
                setWhatsappSettingData(rowData)
            } else {
                setWhatsappSettingData(null)
            }
        })


    })

    useEffect(() => {

        if (isModalOpen) {
            const data = {
                ActiveTab: "create-whatsapp-group",
                Mode,
                whatsappSettingData,
                tableRowData
            }
            history.push(`${process.env.REACT_APP_BASE}/portal-settings/channel-settings`, { data })
        }
    }, [isModalOpen])


    return (
        <div className="row mt-1">
            <div className="col-12">
                <div className="m-t-30 card-box">
                    <div className="col-12 pr-0">
                        <section className="triangle">
                            <div className="col-md-12 row">
                                <div className="col-md-8">
                                    <h4 id="list-item-1" className="pl-2">Whatsapp Accounts</h4>
                                </div>
                                <div className="col-md-4">
                                    <span style={{ float: "right" }}>
                                        <button type="button" className="btn btn-labeled btn-primary btn-sm mt-1" onClick={(e) => handleCellLinkClick(e, {}, 'ADD')}>
                                            <small>Add Whatsapp Support</small>
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
                                        (tableRowData && tableRowData?.mappingPayload && !!tableRowData?.mappingPayload.length>0) ?
                                        <div className="card">
                                            <DynamicTable
                                                listKey={"API Setting List"}
                                                row={tableRowData?.mappingPayload || []}
                                                filterRequired={false}
                                                header={WhatsappSettingColumns}
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
    )
}

export default WhatsappGroupList;

const WhatsappSettingColumns = [
    {
        Header: "Channel ID",
        accessor: "id",
        disableFilters: false,
    },
    {
        Header: "Channel Name",
        accessor: "supportGroup",
        disableFilters: false,
    },
    {
        Header: "Channel Category",
        accessor: "channel",
        disableFilters: false,
    },
    {
        Header: "Status",
        accessor: "status",
        disableFilters: false,
    },
    {
        Header: "Action",
        accessor: "action",
        disableFilters: false,
    }
]