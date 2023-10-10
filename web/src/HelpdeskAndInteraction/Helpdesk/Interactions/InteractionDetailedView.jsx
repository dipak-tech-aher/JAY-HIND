import React, { useCallback, useEffect, useState, memo } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import moment from 'moment';
import MoreDetailsPart1 from './shared/MoreDetailsPart1';
import MoreDetailsPart2 from './shared/MoreDetailsPart2';
import EmailDetailsTab from '../shared/EmailDetailsTab';
import ChatDetails from './shared/ChatDetails';
import PriorityBadge from './shared/PriorityBadge';

import { get, put } from '../../../common/util/restUtil';
import { properties } from '../../../properties';

const InteractionDetailedView = memo((props) => {

    const { detailedViewItem } = props.data;
    const { doSoftRefresh, getInteractionDataById } = props.handlers;
    const [customerDetails, setCustomerDetails] = useState(null);
    const [isDisabled, setIsDisabled] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    // console.log('detailedViewItem', detailedViewItem)

    const ticketDetailsInitialState = {
        problemType: "",
        problemCause: "",
        currStatus: "",
        role: "",
        dept: "",
        remarks: "",
        flwId: "",
        transactionName: ""
    }

    const [ticketDetailsInputs, setTicketDetailsInputs] = useState(ticketDetailsInitialState);
    const [workFlowEntityTypes, setWorkFlowEntityTypes] = useState({
        status: [],
        role: [],
        user: []
    })

    useEffect(() => {
        unstable_batchedUpdates(() => {
            setCustomerDetails(detailedViewItem?.customerDetails);
            setIsDisabled(detailedViewItem?.laneSource === 'QUEUE' || ['HOLD', 'CLOSED'].includes(detailedViewItem?.status) ? true : false);
            ticketDetailsInitialState.problemType = detailedViewItem?.problemType
            ticketDetailsInitialState.problemCause = detailedViewItem?.problemCause
            setTicketDetailsInputs(ticketDetailsInitialState);
        })
    }, [detailedViewItem])

    useEffect(() => {
        setIsVerified(['HOLD', 'NEW'].includes(detailedViewItem?.status) ? true : customerDetails && !!Object.keys(customerDetails).length ? true : false);
    }, [customerDetails, detailedViewItem])

    useEffect(() => {
        // console.log('getUserBasedOnDeptRole useEffect', ticketDetailsInputs.dept, ticketDetailsInputs.role)
        if (ticketDetailsInputs.role) {
            getUserBasedOnDeptRole();
        }
    }, [ticketDetailsInputs.role])

    const handleOnTicketDetailsInputsChange = useCallback((e) => {
        const { target } = e;
        setTicketDetailsInputs({
            ...ticketDetailsInputs,
            [target.id]: target.value
        })
    }, [ticketDetailsInputs])

    const getUserBasedOnDeptRole = () => {
        const { dept, role } = ticketDetailsInputs;

        // console.log('getUserBasedOnDeptRole', dept, role)


        get(`${properties.USER_API}/by-role?roleId=${role}&deptId=${dept}`)
            .then((response) => {
                const { status, data } = response;
                if (status === 200 && data?.length) {
                    setWorkFlowEntityTypes({
                        ...workFlowEntityTypes,
                        user: data
                    })
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }

    const handleOnSubmit = () => {
        const { flwId, transactionName, user, role, dept, currStatus, remarks, problemCause, problemType } = ticketDetailsInputs

        const requestBody = {
            roleId: role,
            departmentId: dept,
            status: currStatus
        }

        if (ticketDetailsInputs?.user) {
            requestBody.userId = Number(ticketDetailsInputs?.user)
        }
        if (ticketDetailsInputs?.remarks) {
            requestBody.remarks = ticketDetailsInputs?.remarks
        }
        put(`${properties.INTERACTION_API}/update/${detailedViewItem?.intxnNo}`, requestBody)
            .then((response) => {
                const { status } = response;
                if (status === 200) {
                    doSoftRefresh()
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }

    const handleOnCancel = () => {
        doSoftRefresh();
    }

    return (
        <div className="helpdesk-detail bg-white" id="server-details1">
            <div className="helpdesk-title">
                <div className="row">
                    <div className="col-md-7">
                        <h3>{detailedViewItem?.customerDetails?.firstName} {detailedViewItem?.customerDetails?.lastName}</h3>
                    </div>
                    <div className="col-md-5">
                        <div className="tic-id">
                            <p>Helpdesk No #{detailedViewItem?.chatDetails?.chatId || detailedViewItem?.helpdeskDetails?.helpdeskId}
                                <PriorityBadge data={{ priority: detailedViewItem?.priorityDescription?.description }} />
                            </p>
                            <p>Interaction ID #{detailedViewItem?.intxnId}</p>
                            <p>Created on {detailedViewItem?.createdAt ? moment(detailedViewItem.createdAt).format('DD/MM/YYYY HH:MM') : ''}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className='col-12'>
                <ul className="nav nav-tabs nav-bordered nav-justified">
                    <li className="nav-item text-capitalize">
                        <a href="#basic" data-toggle="tab" aria-expanded="false" className={`nav-link active`}>
                            Basic Info
                        </a>
                    </li>
                    <li className="nav-item">
                        <a href="#moreDetails" data-toggle="tab" aria-expanded="true" className={`nav-link`}>
                            More Details
                        </a>
                    </li>
                </ul>
                <div className="tab-content p-0">
                    <div className="tab-pane active" id="basic">
                        <MoreDetailsPart1
                            data={{
                                detailedViewItem,
                                customerDetails,
                                readOnly: true
                            }}
                            handlers={{
                                doSoftRefresh,
                                getInteractionDataById
                            }}
                        />
                        <MoreDetailsPart2
                            data={{
                                readOnly: true,
                                detailedViewItem
                            }}
                            handlers={{
                            }}
                        />
                        {
                            detailedViewItem?.helpdeskDetails ? (
                                <EmailDetailsTab
                                    data={{
                                        detailedViewItem: detailedViewItem?.helpdeskDetails
                                    }}
                                />
                            )
                                : (
                                    <ChatDetails
                                        data={{
                                            detailedViewItem: detailedViewItem?.chatDetails
                                        }}
                                    />
                                )
                        }
                    </div>
                    <div className="tab-pane" id="moreDetails">
                        <MoreDetailsPart1
                            data={{
                                detailedViewItem,
                                customerDetails
                            }}
                            handlers={{
                                doSoftRefresh,
                                getInteractionDataById
                            }}
                        />
                        <MoreDetailsPart2
                            data={{
                                ticketDetailsInputs,
                                workFlowEntityTypes,
                                detailedViewItem
                            }}
                            handlers={{
                                handleOnTicketDetailsInputsChange,
                                setTicketDetailsInputs,
                                setWorkFlowEntityTypes
                            }}
                        />
                        {
                            detailedViewItem?.helpdeskDetails ? (
                                <EmailDetailsTab
                                    data={{
                                        detailedViewItem: detailedViewItem?.helpdeskDetails
                                    }}
                                />
                            )
                                : (
                                    <ChatDetails
                                        data={{
                                            detailedViewItem: detailedViewItem?.chatDetails
                                        }}
                                    />
                                )
                        }
                        <div className="col-12 my-2 text-center">
                            <button type="button" className="text-center btn btn-labeled btn-primary btn-sm" onClick={handleOnSubmit}>
                                Submit
                            </button>
                            <button type="button" className="ml-1 text-center btn btn-labeled btn-secondary btn-sm" onClick={handleOnCancel}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
})

export default InteractionDetailedView;