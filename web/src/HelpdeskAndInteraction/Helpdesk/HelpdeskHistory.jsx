import React, { useCallback, useEffect, useState } from 'react';

import { properties } from '../../properties';
import { get, post } from '../../common/util/restUtil';
import DynamicTable from '../../common/table/DynamicTable';
import { HelpdeskHistoryColumns } from './HelpdeskSearch/HelpdeskSearchColumnLits';
import { history } from '../../common/util/history';
import { toast } from 'react-toastify';
import moment from 'moment';

const HelpdeskHistory = (props) => {

    const { customerId } = props.data;

    const [helpdeskHistoryList, setHelpdeskHistoryList] = useState([]);

    const getHelpdeskHistory = useCallback(() => {
        
        const requestBody = {
            customerId
        }
        post(`${properties.HELPDESK_API}/search`, requestBody)
            .then((response) => {
                const { status, data } = response;
                if (status === 200) {
                    setHelpdeskHistoryList(data?.rows);
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }, [])

    useEffect(() => {
        getHelpdeskHistory();
    }, [getHelpdeskHistory])


    const handleCellRender = (cell, row) => {
        if (cell.column.Header === "Customer Name") {
            return (
                <span>{
                    cell?.row?.original?.contactDetails[0]?.customerDetails?.length ? `${cell?.row?.original?.contactDetails[0]?.customerDetails[0]?.firstName || ''} ${cell?.row?.original?.contactDetails[0]?.customerDetails[0]?.lastName || ''}` : ''
                }
                </span>
            )
        }
        else if (['Created On', 'Closed On'].includes(cell.column.Header)) {
            return (<span>{cell.value ? moment(cell.value).format('DD MMM YYYY hh:mm:ss A') : '-'}</span>)
        }
        else if (cell.column.Header === "Action") {
            return (
                <button type="button" className="btn btn-sm btn-primary p-1"
                    onClick={() => handleOnView(row.original)}
                >
                    View
                </button>
            )
        }
        else {
            return (<span>{cell.value || ''}</span>)
        }
    }

    const getHelpdeskData = useCallback((helpdeskId) => {
        return new Promise((resolve, reject) => {
            
            get(`${properties.HELPDESK_API}/${helpdeskId}`)
                .then((response) => {
                    const { status, data } = response;
                    if (status === 200) {
                        resolve(data);
                    }
                })
                .catch(error => {
                    console.error(error);
                    reject(true);
                })
                .finally()
        })
    }, [])

    const getInteractionDataById = useCallback((interactionId) => {
        
        return new Promise((resolve, reject) => {
            if (interactionId) {
                const requestBody = {
                    searchType: "ADV_SEARCH",
                    interactionId,
                    filters: []
                }
                post(`${properties.INTERACTION_API}/search?limit=${10}&page=${0}`, requestBody)
                    .then((response) => {
                        if (response.data) {
                            if (Number(response.data.count) > 0) {
                                const { rows } = response.data;
                                const { intxnId, customerId, intxnType, intxnTypeDesc, serviceId, accountId, woType, woTypeDesc } = rows[0];
                                if (intxnType === 'REQCOMP' || intxnType === 'REQINQ' || intxnType === 'REQSR') {
                                    const isAdjustmentOrRefund = ['Adjustment', 'Refund'].includes(woTypeDesc) ? true : ['Fault'].includes(woTypeDesc) && intxnType === 'REQSR' ? true : false;
                                    let data = {
                                        customerId,
                                        serviceId,
                                        interactionId: intxnId,
                                        accountId,
                                        type: isAdjustmentOrRefund ? 'complaint' : intxnTypeDesc.toLowerCase(),
                                        woType,
                                        isAdjustmentOrRefund,
                                        row: rows[0]
                                    }
                                    resolve(data);
                                }
                            }
                            else {
                                reject(undefined);
                                toast.error("Records not Found")
                            }
                        }
                    }).catch(error => {
                        console.error(error);
                    }).finally(() => {
                        
                    })
            }
            else {
                
                resolve({ noInteraction: true })
            }
        })
    }, [])

    const handleOnView = (row) => {
        const { helpdeskId, interactionDetails } = row
        const helpdeskResponse = getHelpdeskData(helpdeskId);
        helpdeskResponse.then((resolvedHD, rejectedHD) => {
            if (resolvedHD) {
                const interactionResponse = getInteractionDataById(interactionDetails[0]?.intxnId);
                interactionResponse.then((resolvedIntxn, rejectedIntxn) => {
                    if (resolvedIntxn) {
                        history.push(`${process.env.REACT_APP_BASE}/edit-${resolvedIntxn?.type?.toLowerCase()?.replace(' ', '-') || 'complaint'}`, {
                            data: {
                                ...resolvedIntxn,
                                detailedViewItem: resolvedHD,
                                fromHelpDesk: true,
                                helpDeskView: 'Customer360'
                            }
                        })
                    }
                }).catch(error => console.log(error))
            }
        }).catch(error => console.log(error))
    }

    return (
        !!helpdeskHistoryList?.length ?
            <DynamicTable
                listKey={"Helpdesk History"}
                row={helpdeskHistoryList}
                header={HelpdeskHistoryColumns}
                rowCount={helpdeskHistoryList.length}
                itemsPerPage={10}
                backendPaging={false}
                columnFilter={true}
                hasExternalSearch={false}
                handler={{
                    handleCellRender: handleCellRender
                }}
            />
            :
            <span className="msg-txt pt-1">No Heldesk History Available</span>
    )
}

export default HelpdeskHistory;