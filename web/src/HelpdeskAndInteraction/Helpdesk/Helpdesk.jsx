import React, { useContext, useCallback, useState, useEffect, useRef } from 'react';
import { AppContext } from '../../AppContext';
import Filter from '../../Dashboard/filter';
import ListItem from './ListItem';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import LeftBar from './LeftBar';

import { post, put, get } from '../../common/util/restUtil';
import { properties } from '../../properties';
import { toast } from 'react-toastify';
import DetailedView from './DetailedView';
import { unstable_batchedUpdates } from 'react-dom';
import { Link } from 'react-router-dom';
import ViewTicketDetailsModal from './ViewTicketDetailsModal/ViewTicketDetailsModal';
import moment from 'moment';
import { unionBy, map } from "lodash";
import SimilarSearch from './Interactions/shared/SimilarSearch';
import { getReleventHelpdeskDetailedData } from '../../common/util/util';
import Swal from 'sweetalert2';
import { history } from '../../common/util/history';
import { statusConstantCode } from '../../AppConstants';

let clone = require('clone')

const Helpdesk = (props) => {
    let { auth, setAuth } = useContext(AppContext);
    const [refresh, setRefresh] = useState(auth?.helpDeskData?.refresh || false);
    const [autoRefresh, setAutoRefresh] = useState(auth?.helpDeskData?.autoRefresh || false);
    const [timer, setTimer] = useState(auth?.helpDeskData?.timer || 1);
    const [dateRange, setDateRange] = useState(
        {
            startDate: auth?.helpDeskData?.startDate || moment().startOf('year').format('DD-MM-YYYY'),
            endDate: auth?.helpDeskData?.endDate || moment().format('DD-MM-YYYY'),
        }
    );

    const handleAuthChange = (helpDeskData) => {
        setAuth({ ...auth, helpDeskData })
    }

    const [statusFilter, setStatusFilter] = useState('ALL');
    const [allList, setAllList] = useState([]);
    const [detailedViewItem, setDetailedViewItem] = useState(undefined);
    const [queueList, setQueueList] = useState({
        items: [],
        selected: []
    });

    const [isViewTicketDetailsOpen, setIsViewTicketDetailsOpen] = useState(false);
    const [socket, setSocket] = useState();
    const [isQueueListLoading, setIsQueueListLoading] = useState(false);
    const [isAssignedQueueListLoading, setIsAssignedQueueListLoading] = useState(false);
    const isFirstRenderForQueue = useRef(true);
    const isFirstRenderForAssignedQueue = useRef(true);
    const [queueSort, setQueueSort] = useState('NEW');
    const [assignedQueueSort, setAssignedQueueSort] = useState('NEW');
    const [searchQueueFilter, setSearchQueueFilter] = useState("");
    const [searchAssignedQueueFilter, setSearchAssignedQueueFilter] = useState("");
    const [queueListBeforeFilter, setQueueListBeforeFilter] = useState({
        items: [],
        selected: []
    });

    const hasMoreQueueList = useRef(true);
    const mergeQueuePrevList = useRef(false);
    const hasMoreAssignedList = useRef(true);
    const mergeAssignedPrevList = useRef(false);

    const [queuePageCount, setQueuePageCount] = useState(0);
    const [assignedPageCount, setAssignedPageCount] = useState(0);

    const getLeftBarCounts = () => {
        const requestBody = {
            project: [
                statusConstantCode.common.ALL
            ],
            assign: statusConstantCode.common.AVAILABLE
        }
        post(`${properties.HELPDESK_API}/source-counts`, requestBody)
            .then((response) => {
                const { data } = response;
                if (data && !!data.length) {
                    setAllList([
                        {
                            source: { code: statusConstantCode.common.ALL, description: statusConstantCode.common.ALL },
                            count: 0
                        },
                        ...data
                    ]);
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }

    const executeHelpdesk = () => {
        return new Promise((resolveHelpdesk, rejectHelpdesk) => {
            const queueStatus = getQueueList();
            queueStatus.then((resolve, reject) => {
                if (resolve?.status) {
                    const assignedStatus = getAssignedQueueList();
                    assignedStatus.then((assignResolved, assignRejected) => {
                        if (assignResolved) {
                            resolveHelpdesk(true);
                        }
                    }).catch(error => console.log(error))
                }
            }).catch((error) => {
                const assignedStatus = getAssignedQueueList();
                assignedStatus.then((assignResolved, assignRejected) => {
                    if (assignResolved) {
                        resolveHelpdesk(true);
                    }
                }).catch(error => console.log(error))
                console.log(error)
            })
        })
    }

    const getQueueList = useCallback(() => {
        setIsQueueListLoading(true);

        let startDate = dateRange.startDate.split("-").reverse().join("-");
        let endDate = dateRange.endDate.split("-").reverse().join("-");
        return new Promise((resolve, reject) => {
            const requestBody = {
                helpdeskSource: statusFilter,
                assigned: false,
                sort: queueSort,
                startDate: startDate,
                endDate: endDate,
                contain: ['CUSTOMER']
            }
            post(`${properties.HELPDESK_API}/search?limit=10&page=${queuePageCount}`, requestBody)
                .then((response) => {
                    const { status, data } = response;
                    if (status === 200 && data && !!Object.keys(data).length) {
                        data.rows.map((x) => {
                            x.source = x.helpdeskSource?.description
                            return x
                        })
                        setIsQueueListLoading(false);
                        resolve({ status: true, queueList: data.rows })
                        // console.log('1q')
                        setQueueList((list) => {
                            /***Srini added for help desk scroll issue start***/
                            if (data.rows.length > 0) {
                                let updatedLength = mergeQueuePrevList.current ? list.items.length + data.rows.length : data.rows.length;
                                hasMoreQueueList.current = updatedLength < Number(data.count) ? true : false;

                                return {
                                    selected: list.selected,
                                    items: mergeQueuePrevList.current ? [...list.items, ...data.rows] : data.rows
                                }
                            }
                            return {
                                selected: list.selected,
                                items: [...list.items, ...data.rows]
                            }
                            /***Srini added for help desk scroll issue end***/
                        })
                        mergeQueuePrevList.current = false;
                    }
                }).catch((error) => {
                    console.error(error);
                    setIsQueueListLoading(false);
                    reject({ status: true, queueList: [] })
                })
                .finally()
        })
    }, [queuePageCount, dateRange])

    const getAssignedQueueList = useCallback(() => {
        setIsAssignedQueueListLoading(true);

        // console.log('getAssignedQueueList ------------>')

        let startDate = dateRange.startDate.split("-").reverse().join("-");
        let endDate = dateRange.endDate.split("-").reverse().join("-");
        return new Promise((resolve, reject) => {
            const requestBody = {
                helpdeskSource: statusFilter,
                assigned: true,
                sort: assignedQueueSort,
                startDate: startDate,
                endDate: endDate,
                contain: ['CUSTOMER']
            }
            // console.log('requestBody ------------>', requestBody)
            post(`${properties.HELPDESK_API}/search?limit=10&page=${assignedPageCount}`, requestBody)
                .then((response) => {
                    const { status, data } = response;
                    if (status === 200 && data && !!Object.keys(data).length) {
                        data?.rows?.map((x) => {
                            x.source = x.helpdeskSource?.description
                            return x
                        })
                        if (statusFilter === 'ALL' && !!data?.rows?.length) {
                            new Promise((res, rej) => {
                                let results = data?.rows?.filter((ele) => ele?.chat?.length === 0);
                                new Promise((msgResolve, msgReject) => {
                                    const chatList = data?.rows?.filter((ele, idx) => ele?.source === 'LIVECHAT');
                                    if (!!chatList?.length) {
                                        chatList?.forEach((chatElem, chatIdx) => {
                                            let messages = [];
                                            get(`${properties.CHAT_API}/message?email=${chatElem?.chat[0]?.emailId}&id=${chatElem?.chat[0]?.chatId}`)
                                                .then((response) => {
                                                    if (response?.data) {
                                                        messages = response?.data
                                                        chatElem["chat"][0]["message"] = map(response?.data, 'msg');
                                                        chatElem["chat"][0]["messageColorAlign"] = messages.map((agentMsg) => { delete agentMsg?.msg; return agentMsg })
                                                    }
                                                    else {
                                                        if (chatElem['chat'].length != 0) {
                                                            chatElem["chat"][0]["message"] = [];
                                                            chatElem["chat"][0]["messageColorAlign"] = [];
                                                        }

                                                    }
                                                    if (chatList?.length === chatIdx + 1) {
                                                        msgResolve(chatList);
                                                    }
                                                })
                                                .catch((error) => {
                                                    console.error(error);
                                                    rej(true);
                                                    msgReject(true);
                                                })
                                        })
                                    }
                                    else {
                                        msgResolve(results);
                                    }
                                })
                                    .then((msgResolved, msgRejected) => {
                                        if (msgResolved) {
                                            results = unionBy(msgResolved, data?.rows, 'helpdeskId');
                                            res(results);
                                        }
                                    }).catch((error) => {
                                        console.log(error)
                                    })
                            })
                                .then((resolvedChat, rejectedChat) => {
                                    if (resolvedChat) {
                                        setIsAssignedQueueListLoading(false);
                                        resolve(resolvedChat);
                                        setQueueList((list) => {
                                            let updatedLength = mergeAssignedPrevList.current ? list.selected.length + data.rows.length : data.rows.length;
                                            hasMoreAssignedList.current = updatedLength < Number(data.count) ? true : false;
                                            return {
                                                items: list.items,
                                                selected: mergeAssignedPrevList.current ? [...list.selected, ...resolvedChat] : data.rows
                                            }
                                        })
                                        mergeAssignedPrevList.current = false;
                                    }
                                }).catch((error) => {
                                    console.log(error)
                                })
                        }
                        else {
                            setIsAssignedQueueListLoading(false);
                            resolve(data?.rows || []);
                            setQueueList((list) => {
                                /***Srini added for help desk scroll issue start***/
                                if (data.rows.length > 0) {
                                    let updatedLength = mergeAssignedPrevList.current ? list.selected.length + data.rows.length : data.rows.length;
                                    hasMoreAssignedList.current = updatedLength < Number(data.count) ? true : false;
                                    return {
                                        items: list.items,
                                        selected: mergeAssignedPrevList.current ? [...list.selected, ...data.rows] : data.rows
                                    }
                                } else {
                                    return {
                                        items: list.items,
                                        // selected: [...list?.selected, ...data?.rows]
                                        selected: [...data?.rows]

                                    }
                                }
                                /***Srini added for help desk scroll issue end***/

                            })
                            mergeAssignedPrevList.current = false;
                        }
                    }
                })
                .catch(error => {
                    console.error(error);
                    setIsAssignedQueueListLoading(false);
                    reject(error);
                })
                .finally()
        })
    }, [assignedPageCount, dateRange])

    const assignHelpdesk = (helpdeskId) => {

        return new Promise((resolve, reject) => {
            put(`${properties.HELPDESK_API}/assign/${helpdeskId}`, { status: statusConstantCode.status.HELPDESK_ASSIGN })
                .then((response) => {
                    const { status, message } = response;
                    if (status === 200) {
                        toast.success(message);
                        resolve(true);
                    }
                })
                .catch(error => {
                    console.error(error);
                    reject(false);
                })
                .finally()
        })
    }

    const executeChat = () => {
        // console.log('2gcq')
        const chatStatus = getChatQueue();
        chatStatus.then((resolve, reject) => {
            if (resolve.status) {
                getAssignedChatQueue().then(response => console.log(response)).catch(error => console.log(error));
            }
        }).catch((error) => {
            console.log(error)
        })
    }

    const getChatQueue = () => {
        //load the new user's in queue-If status is "New"
        setIsQueueListLoading(true);
        return new Promise((resolve, reject) => {

            get(`${properties.CHAT_API}`)
                .then((resp) => {
                    if (resp.data) {
                        if (resp.status === 200) {
                            const { count, rows } = resp.data;
                            // console.log('3q', queueList.items, rows)
                            setQueueList((list) => {
                                let newItems = []
                                for (let l of list.items) {
                                    if (!l.chatId) {
                                        newItems.push(l)
                                    }
                                }
                                return {
                                    selected: list.selected,
                                    items: [...newItems, ...rows]
                                }
                            })
                            setIsQueueListLoading(false);
                            resolve({ status: true, queueList: rows });
                        } else {
                            toast.error("Failed to create - " + resp.status);
                        }
                    } else {
                        toast.error("Uexpected error ocurred " + resp.statusCode);
                    }
                })
                .catch(error => {
                    console.error(error);
                    setIsQueueListLoading(false);
                    resolve({ status: false, queueList: [] });
                })
                .finally();
        })
    }

    const getAssignedChatQueue = () => {
        setIsAssignedQueueListLoading(true);
        return new Promise((resolve, reject) => {

            get(`${properties.CHAT_API}/assigned`)
                .then((resp) => {
                    if (resp.data) {
                        if (resp.status === 200) {
                            new Promise((res, rej) => {
                                let results = [];
                                resp?.data?.forEach((element, idx) => {
                                    let messages = [];
                                    get(`${properties.CHAT_API}/message?email=${element?.emailId}&id=${element?.chatId}`)
                                        .then((response) => {
                                            if (response?.data) {
                                                messages = response?.data
                                                element["message"] = map(response?.data, 'msg');
                                                element["messageColorAlign"] = messages.map((agentMsg) => { delete agentMsg?.msg; return agentMsg })
                                            }
                                            else {
                                                element["message"] = [];
                                                element["messageColorAlign"] = [];
                                            }
                                            results = unionBy(results, resp.data, 'chatId');
                                            if (resp.data.length === idx + 1) {
                                                res({ status: true, finalAssignedData: results })
                                            }
                                        })
                                        .catch((error) => {
                                            console.error(error);
                                            rej(true);
                                        })
                                });
                            })
                                .then((resolvedChat, rejectedChat) => {
                                    if (resolvedChat) {
                                        setIsAssignedQueueListLoading(false);
                                        // console.log('resolvedChat.finalAssignedData', resolvedChat.finalAssignedData)
                                        // console.log('4q')
                                        setQueueList((list) => {
                                            return {
                                                selected: [...resolvedChat.finalAssignedData],
                                                items: list.items
                                            }
                                        })
                                        resolve({ status: true, queueList: resolvedChat.finalAssignedData });
                                    }
                                }).catch((error) => {
                                    console.log(error)
                                })
                        }
                        else {
                            toast.error("Failed to create - " + resp.status);
                            setIsAssignedQueueListLoading(false);
                            reject({ status: false, queueList: [] });
                        }
                    }
                    else {
                        toast.error("Uexpected error ocurred " + resp.statusCode);
                        setIsAssignedQueueListLoading(false);
                        reject({ status: false, queueList: [] });
                    }
                })
                .catch(error => {
                    console.error(error);
                    setIsAssignedQueueListLoading(false);
                    reject({ status: false, queueList: [] });
                })
                .finally();
        })
    }

    const assignChat = (chatId) => {

        return new Promise((resolve, reject) => {
            put(`${properties.CHAT_API}/assign/${chatId}`)
                .then((response) => {
                    if (response.status === 200) {
                        resolve(true);
                    } else {
                        toast.error("Failed to update - " + response.status);
                    }
                })
                .catch(error => {
                    console.error(error);
                    reject(false);
                })
                .finally();
        })
    }

    useEffect(() => {
        unstable_batchedUpdates(() => {
            // console.log('1', JSON.stringify(detailedViewItem))
            setDetailedViewItem(undefined);
            // console.log('4q')
            setQueueList({
                items: [],
                selected: []
            })
            setQueueSort("NEW");
            setAssignedQueueSort("NEW");
            setSearchQueueFilter("");
            setSearchAssignedQueueFilter("");
            // console.log('5q')
            setQueueListBeforeFilter({
                items: [],
                selected: []
            })
        })
    }, [statusFilter])

    useEffect(() => {
        getLeftBarCounts();
        executeHelpdesk().then(response => console.log(response)).catch(error => console.log(error));
        getQueueList().then(response => console.log(response)).catch(error => console.log(error));
    }, [refresh, autoRefresh, statusFilter])

    useEffect(() => {
        if (!isFirstRenderForQueue.current) {
            getQueueList().then(response => console.log(response)).catch(error => console.log(error));
        }
        else {
            isFirstRenderForQueue.current = false;
        }
    }, [queueSort, queuePageCount])

    useEffect(() => {
        if (!isFirstRenderForAssignedQueue.current) {
            getAssignedQueueList().catch(error => {
                console.error(error);
            });
        }
        else {
            isFirstRenderForAssignedQueue.current = false;
        }
    }, [assignedQueueSort, assignedPageCount])


    const reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        return result;
    };

    const move = (source, destination, droppableSource, droppableDestination, draggableId) => {
        const draggableIdArray = draggableId?.split('-');
        const ticketSource = draggableId?.split('-')[0];
        const sourceClone = Array.from(source);
        const destClone = Array.from(destination);
        const [removed] = sourceClone.splice(droppableSource.index, 1);
        if (droppableSource.droppableId === 'queue' && droppableDestination.droppableId === 'assigned') {
            //const status = ticketSource === 'LIVE' ? assignChat(draggableIdArray[2] || undefined) : assignHelpdesk(draggableIdArray[1] || undefined);
            const status = assignHelpdesk(draggableIdArray[1] || undefined);
            status.then((handleResolve, handleReject) => {
                setSearchAssignedQueueFilter("");
                doSoftRefresh();
            }).catch(error => console.log(error))
        }
        else if (droppableSource.droppableId === 'assigned' && droppableDestination.droppableId === 'queue') {
            // Un-assigned functionality
        }

        destClone.splice(droppableDestination.index, 0, removed);

        const result = {};
        result[droppableSource.droppableId] = sourceClone;
        result[droppableDestination.droppableId] = destClone;

        return result;
    };

    const getItemStyle = (isDragging, draggableStyle) => ({
        userSelect: 'none',
        padding: 6,
        margin: `0 0 ${8}px 0`,
        background: '#FFFFFF',
        ...draggableStyle
    });

    const getListStyle = (isDraggingOver) => ({
        background: '#F3F4F6',
        padding: 8,
        width: 'inherit',
        height: '1001px',
        overflow: 'auto'
    });

    const id2List = {
        queue: 'items',
        assigned: 'selected'
    };

    const getList = id => queueList[id2List[id]];

    const onDragEnd = result => {
        const { source, destination, draggableId } = result;
        if (!destination) {
            return;
        }
        if (source.droppableId === destination.droppableId) {
            const items = reorder(
                getList(source.droppableId),
                source.index,
                destination.index
            );
            let finalState = { items };
            if (source.droppableId === 'assigned') {
                finalState = { items: queueList.items, selected: items };
            }
            else {
                finalState = { items, selected: queueList.selected };
            }
            setQueueList(finalState);
        } else {
            const result = move(
                getList(source.droppableId),
                getList(destination.droppableId),
                source,
                destination,
                draggableId
            );
            console.log(result)
            setQueueList({
                items: result.queue,
                selected: result.assigned
            });
        }
    };

    const getCustomerDetails = async (helpdeskId, laneSource, tktWithLoggedIn, from) => {
        // console.log('helpdeskId, laneSource, tktWithLoggedIn, from---->', helpdeskId, laneSource, tktWithLoggedIn, from)
        try {
            const requestBody = {
                helpdeskId: Number(helpdeskId),
                helpdeskSource: statusFilter,
                assigned: laneSource === 'ASSIGNED' ? true : false,
                contain: ['CUSTOMER', 'INTERACTION'],
                tktWithLoggedIn,
                from
            }

            const response = await post(`${properties.HELPDESK_API}/search?limit=10&page=0`, requestBody)
            // console.log('response',response)
            // const response = await get(`${properties.HELPDESK_API}/${helpdeskId}`)
            if (response && response?.data && response?.data?.rows && response?.data?.rows.length > 0) {
                return { ...response?.data?.rows[0], source: response?.data?.rows[0]?.helpdeskSource?.description };
            }
            else {
                return null;
            }
        }
        catch (error) {
            console.error(error);
        }
        finally {

        }
    }

    const formCustomerDetailsForChat = (detailedViewItem) => {
        // console.log('In formCustomerDetailsForChat', formCustomerDetailsForChat)
        if (detailedViewItem && detailedViewItem.contactDetails && detailedViewItem.contactDetails.length > 0) {

            const contactDetails = detailedViewItem.contactDetails[0];
            if (contactDetails && !!Object.keys(contactDetails).length) {
                let data = contactDetails?.customerDetails && !!contactDetails.customerDetails.length ? contactDetails.customerDetails[0] : {};
                return {
                    customer: {
                        crmCustomerNo: data?.crmCustomerNo,
                        customerId: data?.customerId,
                        contactId: contactDetails?.contactId,
                        fullName: `${data?.firstName} ${data?.lastName}`,
                        customerType: data?.custType,
                        contactNumber: contactDetails?.contactNo,
                        email: contactDetails?.email,
                        contactPreference: contactDetails?.contactPreferenceDesc?.description,
                        idType: data?.idTypeDesc?.description,
                        idValue: data?.idValue,
                        customerTypeCode: data?.custType,
                        contactPreferenceCode: contactDetails?.contactPreference,
                        idTypeCode: data?.idType
                    },
                    interaction: data.interactionDetails
                }
            }
            return undefined;
        } else {
            return undefined;
        }

    }

    const handleOnIdSelection = (detailedViewItem, laneSource, tktWithLoggedIn, from) => {
        // console.log('from------------>', from)
        // console.log('source------------>', laneSource)
        // console.log('tktWithLoggedIn------------>', tktWithLoggedIn)
        // console.log('detailedViewItem?.source------------>', detailedViewItem?.source)
        // console.log('detailedViewItem?.oHelpdeskSource------------>', detailedViewItem?.oHelpdeskSource)
        // console.log('detailedViewItem------>', JSON.stringify(detailedViewItem))
        unstable_batchedUpdates(async () => {
            if (detailedViewItem?.source !== undefined || detailedViewItem?.oHelpdeskSource !== undefined || detailedViewItem?.helpdeskSourceDesc?.description !== undefined) {
                const responseData = await getCustomerDetails(
                    detailedViewItem?.oHelpdeskId ?? detailedViewItem?.helpdeskId ?? detailedViewItem?.chatId,
                    laneSource,
                    tktWithLoggedIn,
                    from);
                // console.log('responseData------>', responseData)
                if (responseData?.customerDetails && !!Object.keys(responseData?.customerDetails).length) {
                    // console.log('2----------')
                    setDetailedViewItem({ ...detailedViewItem, laneSource, customerDetails: responseData.customerDetails, conversation: responseData.conversation, ...responseData })
                } else {
                    // console.log('3-----------')
                    setDetailedViewItem({ ...detailedViewItem, laneSource, conversation: responseData?.conversation, ...responseData })
                }
            }
            else {
                // console.log('formCustomerDetailsForChat', detailedViewItem.name, detailedViewItem.customerName)
                const customerDetails = formCustomerDetailsForChat(detailedViewItem);
                // console.log('formCustomerDetailsForChat', customerDetails)
                // console.log('4')
                setDetailedViewItem({ ...detailedViewItem, laneSource, customerDetails })
            }
            console.log('laneSource', laneSource)
            if (['QUEUE'].includes(laneSource)) {
                setIsViewTicketDetailsOpen(true);
            }
        })
    }

    const doSoftRefresh = (stateTo, helpdeskId = undefined, source = undefined) => {
        // console.log('doSoftRefresh', stateTo)
        unstable_batchedUpdates(async () => {
            switch (stateTo) {
                case 'UPDATE_DETAILED_VIEW':

                    getLeftBarCounts();
                    const assignedList = getAssignedQueueList();
                    assignedList.then(async (resolved, rejected) => {
                        if (!!resolved.length) {
                            const view = resolved.find((assigned) => helpdeskId === assigned.helpdeskId);
                            if (view) {
                                const responseData = await getCustomerDetails(helpdeskId, 'ASSIGNED');
                                if (!!Object.keys(responseData?.customerDetails ?? {}).length) {
                                    // console.log('5')
                                    setDetailedViewItem({
                                        ...view,
                                        laneSource: 'ASSIGNED',
                                        customerDetails: responseData.customerDetails,
                                        conversation: responseData.conversation
                                    });
                                } else {
                                    // console.log('6')
                                    setDetailedViewItem({
                                        ...view,
                                        laneSource: 'ASSIGNED',
                                        conversation: responseData.conversation
                                    });
                                }
                            }
                            else {
                                // console.log('7')
                                setDetailedViewItem(undefined);
                            }
                        }
                        else {
                            // console.log('8') 
                            setDetailedViewItem(undefined);
                        }
                    }).catch(error => console.log(error)).finally()
                    break;
                case 'CANCEL_VIEW': setDetailedViewItem(undefined);
                    break;
                case 'UPDATE_CUSTOMER_DETAILS':
                    // console.log('queueList', queueList)

                    const responseData = await getCustomerDetails(helpdeskId, source);
                    if (!!Object.keys(responseData?.customerDetails ?? {}).length) {
                        let newQList = clone(queueList)

                        for (let q of newQList.selected) {
                            // console.log(q.helpdeskId, helpdeskId)
                            if (q.helpdeskId === helpdeskId) {
                                q.contactDetails = [{
                                    contactNo: responseData?.customerDetails?.customer?.contactNumber
                                }]
                            }
                        }
                        // console.log('newQList', newQList)
                        // console.log('8q')
                        setQueueList(newQList)
                        // console.log('10')
                        setDetailedViewItem({ ...detailedViewItem, customerDetails: responseData.customerDetails, conversation: responseData.conversation })

                    } else {
                        // console.log('11')
                        setDetailedViewItem({ ...detailedViewItem, conversation: responseData.conversation })
                    }

                    break;
                case 'UPDATE_CUSTOMER_DETAILS_CHAT':

                    const assignedChatList = getAssignedChatQueue();
                    assignedChatList.then((resolved, reject) => {
                        let customerDetails;
                        if (resolved.status && resolved?.queueList.length) {
                            let view = resolved?.queueList?.find((assigned) => helpdeskId === assigned.chatId);
                            if (view) {
                                customerDetails = formCustomerDetailsForChat(view);
                                // console.log('12')
                                setDetailedViewItem({
                                    ...view,
                                    customerDetails,
                                    laneSource: 'ASSIGNED',
                                })
                            }
                            else {
                                // console.log('13')
                                setDetailedViewItem(undefined);
                            }
                        }
                        else {
                            // console.log('14')
                            setDetailedViewItem(undefined);
                        }
                    }).catch(error => console.log(error)).finally()
                    break;
                default:
                    setBothPageCountToZero();
                    //executeHelpdesk();
                    setDetailedViewItem(undefined);
            }
        })
    };

    const handleOnSearchQueueChange = (e) => {
        const { value, name, id } = e.target;
        unstable_batchedUpdates(() => {
            if (!value) {
                // console.log('9q')
                setQueueList({
                    ...queueList,
                    [name]: queueListBeforeFilter[name]
                })
            }
            else if (value && value !== searchQueueFilter) {
                if (queueListBeforeFilter[name].length) {
                    // console.log('10q')
                    setQueueList({
                        ...queueList,
                        [name]: queueListBeforeFilter[name]
                    })
                }
            }
            if (id === 'searchQueueFilter') {
                setSearchQueueFilter(value);
            }
            else {
                setSearchAssignedQueueFilter(value);
            }
        })
    }

    const handleOnSearchQueue = (e, type) => {
        e.preventDefault();
        unstable_batchedUpdates(() => {
            const searchInput = type === 'items' ? searchQueueFilter : searchAssignedQueueFilter;
            if (searchInput) {
                let list = queueList[type]?.filter((item) => {
                    let isTrue = false;
                    if ((item?.source !== 'LIVECHAT' ? String(item?.helpdeskId) : !!item?.chat?.length ? String(item?.chat[0]?.chatId) : String(item?.helpdeskId)).includes(searchInput) || item?.email?.includes(searchInput) || item?.name?.toLowerCase()?.includes(searchInput?.toLowerCase()) || item?.emailId?.includes(searchInput) || item?.customerName?.toLowerCase()?.includes(searchInput?.toLowerCase()) || item?.title?.toLowerCase()?.includes(searchInput?.toLowerCase())) {
                        isTrue = true;
                    }
                    return isTrue;
                })
                // console.log('11q')
                setQueueListBeforeFilter({
                    ...queueListBeforeFilter,
                    [type]: queueList[type]
                })
                // console.log('12q')
                setQueueList({
                    ...queueList,
                    [type]: list
                })
            }
            else {
                // console.log('13q')
                setQueueList({
                    ...queueList,
                    [type]: queueListBeforeFilter.items
                })
                // console.log('14q')
                setQueueListBeforeFilter({
                    ...queueListBeforeFilter,
                    [type]: []
                })
            }
        })
    }

    const handleOnSortChange = (e) => {
        const { value, id } = e.target;
        if (id === 'queueSort') {
            queuePageCountToZero();
            setQueueSort(value);
            setSearchQueueFilter("");
        }
        else {
            assignedPageCountToZero();
            setAssignedQueueSort(value);
            setSearchAssignedQueueFilter("");
        }
    }

    const queuePageCountToZero = () => {
        setQueuePageCount((pageCount) => {
            if (pageCount === '0') {
                return 0;
            }
            else {
                return '0'
            }
        })
    }

    const assignedPageCountToZero = () => {
        setAssignedPageCount((pageCount) => {
            if (pageCount === '0') {
                return 0;
            }
            else {
                return '0'
            }
        })
    }

    const setBothPageCountToZero = () => {
        queuePageCountToZero();
        assignedPageCountToZero();
    }

    const handleOnScroll = (e) => {

        const { scrollHeight, scrollTop, clientHeight, id } = e.target;
        // Srini modified for help desk scroll issue
        if (((scrollHeight - Math.ceil(scrollTop) === clientHeight)) && (id === 'Queue' ? hasMoreQueueList.current : hasMoreAssignedList.current)) {
            if (id === 'Queue') {
                mergeQueuePrevList.current = true;
                setQueuePageCount(Number(queuePageCount) + 1);
            }
            else {

                mergeAssignedPrevList.current = true;
                setAssignedPageCount(Number(assignedPageCount) + 1);
            }
        }
    }

    const handleOnAssignForMobile = (viewItem) => {
        Swal.fire({
            title: 'Confirm move to my helpdesk?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Confirm'
        }).then((result) => {
            if (result.isConfirmed) {
                let responseStatus;
                if (viewItem?.source === 'LIVECHAT') {
                    responseStatus = assignChat(viewItem?.chatId);
                }
                else {
                    responseStatus = assignHelpdesk(viewItem?.helpdeskId);
                }
                responseStatus.then((resolved, rejected) => {
                    setSearchAssignedQueueFilter("");
                    doSoftRefresh();
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Moved to My helpdesk!'
                    })
                }).catch(error => console.log(error))
            }
        }).catch(error => console.log(error))
    }

    useEffect(() => {
        // console.log('props--------->', props?.data?.props?.location?.state?.data?.payload)
        // console.log('props-----source---->', props?.data?.props?.location?.state?.data?.payload?.oStatus)
        console.log('props-----source---->', props?.data?.props?.location)
        const queryParams = new URLSearchParams(props?.data?.props?.location?.search);
        const idFrom = queryParams.get('from');
        const payloadData = props?.data?.props?.location?.state?.data;
        const payload = payloadData?.payload;
        const payloadStatus = payload?.oStatus;
        const tktWithLoggedIn = payloadData?.tktWithLoggedIn;
        if (idFrom === "DASHBOARD") {
            if (payloadStatus === "New") {
                handleOnIdSelection(payload, "QUEUE", tktWithLoggedIn, "DASHBOARD")
            } else {
                handleOnIdSelection(payload, tktWithLoggedIn ? "ASSIGNED" : "QUEUE", tktWithLoggedIn, "DASHBOARD")
            }
            const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.replaceState({ path: newurl }, "", newurl);
        }
    }, [])

    return (
        <div className="row">

            {/* <div className="bar-left pr-0 col-lg-1 col-md-12 col-xs-12">
                    <LeftBar
                        data={{
                            allList
                        }}
                        handlers={{
                            setAllList,
                            setStatusFilter,
                            setBothPageCountToZero,
                        }}
                    />
                </div> */}
            <div className="col-lg-12 col-md-12 col-xs-12 pt-1">
                <fieldset className="scheduler-border" data-select2-id="7">
                    <div className="row channel-sel align-items-center">
                        <div className="col-lg-2 col-md-6 hd-tit">
                            <h4 className="page-title">Helpdesk 360</h4>
                        </div>
                        <div className="col-lg-2 col-md-6 hd-tit text-right">
                            <Link to={`${process.env.REACT_APP_BASE}/agent-chat`}>
                                <span className="badge badge-primary badgefont p-1 font-12">
                                    <i className="mdi mdi-chat-outline text-white font-16 pr-2" />
                                    Live Chat
                                </span>
                            </Link>
                        </div>
                        <div className="col-lg-3 col-md-3">
                            <SimilarSearch
                                data={{
                                    screenType: "Helpdesk"
                                }}
                            />
                        </div>
                        <div className="col-lg-5 col-md-9">
                            <div className="page-title-right">
                                <div className="page-title-right">
                                    <Filter
                                        refresh={refresh}
                                        setRefresh={setRefresh}
                                        data={{
                                            selfDept: "",
                                            dateRange,
                                            autoRefresh,
                                            timer,
                                            hideTimer: true
                                        }}
                                        handlers={{
                                            setSelfDept: () => { },
                                            setDateRange,
                                            setTodoPageCount: () => { },
                                            setAutoRefresh,
                                            setTimer,
                                            handleAuthChange
                                        }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </fieldset>
                <div className="row pt-2 px-0">
                    <div className="col-lg-7 p-0">
                        <DragDropContext onDragEnd={onDragEnd}>
                            <div className='row mb-3'>
                                <div className='col-lg-6 col-md-12 col-xs-12'>
                                    <div className='card-box border p-0'>
                                        <Droppable droppableId="queue">
                                            {(provided, snapshot) => (
                                                <ul className="skel-helpdesk-sortable-list sortable-list tasklist list-unstyled" id="Queue"
                                                    onScroll={handleOnScroll}
                                                    ref={provided.innerRef}
                                                    style={getListStyle(snapshot.isDraggingOver)}>
                                                    <h4 className='header-title bold text-center help-title'>
                                                        Queue
                                                        &nbsp;<span className="badge badge-danger rounded-circle noti-icon-badge">{queueList.items.length}</span>
                                                    </h4>
                                                    <form onSubmit={(e) => handleOnSearchQueue(e, 'items')}>
                                                        <div className="row help-filter">
                                                            <div className="col-md-6 col-xs-6">
                                                                <select className="form-control border" id="queueSort" value={queueSort} onChange={handleOnSortChange}>
                                                                    <option value="NEW">Newest</option>
                                                                    <option value="OLD">Oldest</option>
                                                                </select>
                                                            </div>
                                                            <div className="col-md-6 col-xs-6">
                                                                <div className="input-group mb-3">
                                                                    <input type="text" className="form-control input-sm border" id='searchQueueFilter' name='items' value={searchQueueFilter} onChange={handleOnSearchQueueChange} placeholder="Search" aria-label="Search" />
                                                                    <div className="input-group-append">
                                                                        <button className="btn btn-light btn-sm border " type="button" onClick={(e) => handleOnSearchQueue(e, 'items')}><i className="fe-search text-dark"></i></button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </form>
                                                    {/* <div className='drop-space'> */}
                                                    <div className='skel-helpdesk-draggable'>
                                                        {
                                                            !!queueList.items.length ? queueList.items.map((item, index) => (
                                                                <Draggable
                                                                    key={`h-drg-${item.helpdeskId}`}
                                                                    draggableId={`${item?.source}-${item?.helpdeskId}`}
                                                                    index={index}>
                                                                    {(provided, snapshot) => (
                                                                        <div
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                            style={getItemStyle(
                                                                                snapshot.isDragging,
                                                                                provided.draggableProps.style
                                                                            )}
                                                                            className="skel-helpdesk-draggable-content"
                                                                        >
                                                                            <ListItem item={item} source={'QUEUE'} handleOnIdSelection={handleOnIdSelection} handleOnAssignForMobile={handleOnAssignForMobile} />
                                                                        </div>
                                                                    )}
                                                                </Draggable>
                                                            ))
                                                                :
                                                                isQueueListLoading ?
                                                                    <p className='text-center'>Loading..</p>
                                                                    :
                                                                    <p class="skel-widget-warning">No records found!!!</p>
                                                        }
                                                    </div>
                                                    {provided.placeholder}
                                                </ul>
                                            )}
                                        </Droppable>
                                    </div>
                                </div>
                                <div className='col-lg-6 col-md-12 col-xs-12  skel-resp-mt'>
                                    <div className='card-box border p-0'>
                                        <Droppable droppableId="assigned">
                                            {(provided, snapshot) => (
                                                <ul className="skel-helpdesk-sortable-list sortable-list tasklist list-unstyled" id="Assigned"
                                                    onScroll={handleOnScroll}
                                                    ref={provided.innerRef}
                                                    style={getListStyle(snapshot.isDraggingOver)}>
                                                    <h4 className='header-title bold text-center help-title'>
                                                        My Helpdesk
                                                        &nbsp;<span className="badge badge-danger rounded-circle noti-icon-badge">{queueList.selected.length}</span>
                                                    </h4>
                                                    <form onSubmit={(e) => handleOnSearchQueue(e, 'selected')}>
                                                        <div className="row help-filter">
                                                            <div className="col-md-6 col-xs-6">
                                                                <select className="form-control border" id="assignedQueueSort" value={assignedQueueSort} onChange={handleOnSortChange}>
                                                                    <option value="NEW">Newest</option>
                                                                    <option value="OLD">Oldest</option>
                                                                </select>
                                                            </div>
                                                            <div className="col-md-6 col-xs-6">
                                                                <div className="input-group mb-3">
                                                                    <input type="text" className="form-control input-sm border" id="searchAssignQueueFilter" name='selected' value={searchAssignedQueueFilter} onChange={handleOnSearchQueueChange} placeholder="Search" aria-label="Search" />
                                                                    <div className="input-group-append">
                                                                        <button className="btn btn-light btn-sm border " type="button" onClick={(e) => handleOnSearchQueue(e, 'selected')}><i className="fe-search text-dark"></i></button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </form>
                                                    <div className='skel-helpdesk-draggable skel-helpdesk-mh'>
                                                        {
                                                            !!queueList.selected.length ? queueList.selected.map((item, index) => (
                                                                <Draggable
                                                                    key={item?.source !== 'LIVECHAT' ? `h-drg-${item.helpdeskId}` : item?.source === 'LIVECHAT' ? `c-drg-${item?.chat[0]?.chatId}` : 'id-drg-notknown'}
                                                                    draggableId={String(item?.source !== 'LIVECHAT' ? `${item?.source}-${item?.helpdeskId}` : `${item?.source}-${item?.chat[0]?.chatId}`)}
                                                                    index={index}
                                                                >
                                                                    {(provided, snapshot) => (
                                                                        <div
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                            style={getItemStyle(
                                                                                snapshot.isDragging,
                                                                                provided.draggableProps.style
                                                                            )}
                                                                            className="skel-helpdesk-draggable-content"
                                                                        >
                                                                            <ListItem item={item} source={'ASSIGNED'} handleOnIdSelection={handleOnIdSelection} />
                                                                        </div>
                                                                    )}
                                                                </Draggable>
                                                            ))
                                                                :
                                                                isAssignedQueueListLoading ?
                                                                    <p className='text-center'>Loading..</p>
                                                                    :
                                                                    <p class="skel-widget-warning">No records found!!!</p>
                                                        }
                                                    </div>
                                                    {provided.placeholder}
                                                </ul>
                                            )}
                                        </Droppable>
                                    </div>
                                </div>
                            </div>
                        </DragDropContext>
                    </div>
                    <div className="col-lg-5">
                        {
                            detailedViewItem && detailedViewItem.laneSource === 'ASSIGNED' ? (
                                <DetailedView
                                    data={{
                                        detailedViewItem: getReleventHelpdeskDetailedData(detailedViewItem?.source, detailedViewItem),
                                        socket: socket
                                    }}
                                    handlers={{
                                        doSoftRefresh
                                    }}
                                />
                            )
                                : (
                                    <div className="bg-helpdesk-img" />
                                )
                        }
                    </div>
                    {isViewTicketDetailsOpen &&
                        <ViewTicketDetailsModal
                            data={{
                                isViewTicketDetailsOpen,
                                detailedViewItem: getReleventHelpdeskDetailedData(detailedViewItem?.source ?? detailedViewItem?.helpdeskSource?.description, detailedViewItem)
                            }}
                            handlers={{
                                setIsViewTicketDetailsOpen
                            }}
                        />
                    }
                </div>
            </div>

        </div>
    )
}

export default Helpdesk;