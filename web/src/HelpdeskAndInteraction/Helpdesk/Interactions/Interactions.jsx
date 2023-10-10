import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { useState } from 'react';
import { AppContext } from '../../../AppContext';
import Filter from '../../../Dashboard/filter';
import LeftDropdownMenu from './LeftDropdownMenu';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import InteractionListItem from './InteractionListItem';
import InteractionDetailedView from './InteractionDetailedView';

import { post, put } from '../../../common/util/restUtil';
import { properties } from '../../../properties';
import InteractionViewTicketDetailsModal from './InteractionViewTicketDetailsModal';
import { toast } from 'react-toastify';
import { unstable_batchedUpdates } from 'react-dom';
import moment from 'moment';
import SimilarSearch from './shared/SimilarSearch';
import Swal from 'sweetalert2';

const Interactions = () => {

    let { auth, setAuth } = useContext(AppContext);
    const [refresh, setRefresh] = useState(auth?.helpDeskInteractionData?.refresh || false);
    const [autoRefresh, setAutoRefresh] = useState(auth?.helpDeskInteractionData?.autoRefresh || false);
    const [timer, setTimer] = useState(auth?.helpDeskInteractionData?.timer || 1);
    const [dateRange, setDateRange] = useState(
        {
            startDate: auth?.helpDeskInteractionData?.startDate || moment().startOf('year').format('DD-MM-YYYY'),
            endDate: auth?.helpDeskInteractionData?.endDate || moment().format('DD-MM-YYYY'),
        }
    );

    const handleAuthChange = (helpDeskInteractionData) => {
        setAuth({ ...auth, helpDeskInteractionData })
    }

    const [statusFilter, setStatusFilter] = useState('');
    const [queueList, setQueueList] = useState({
        items: [],
        selected: []
    });
    const [detailedViewItem, setDetailedViewItem] = useState(undefined);
    const [isViewTicketDetailsOpen, setIsViewTicketDetailsOpen] = useState(false);
    const interactionData = useRef();

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
    const [isQuickLinkEnabled, setIsQuickLinkEnabled] = useState(false)

    const executeInteractions = () => {
        const queueStatus = getInteractionQueueList();
        queueStatus.then((resolve, reject) => {
            if (resolve?.status) {
                getInteractionAssignedQueueList();
            }
        }).catch(error => console.log(error))
    }

    const getInteractionQueueList = () => {
        setIsQueueListLoading(true);
        
        return new Promise((resolve, reject) => {
            const requestBody = {
                status: "",
                assign: false,
                sort: queueSort
            }
            post(`${properties.INTERACTION_API}/helpdesk?limit=10&page=${queuePageCount}`, requestBody)
                .then((response) => {
                    const { status, data } = response;
                    if (status === 200 && !!Object.keys(data).length) {
                        if (!!data.rows.length) {
                            data?.rows?.forEach((d) => {
                                d?.chatDetails?.message?.forEach((m, i) => {
                                    if (i === 0) {
                                        d.chatDetails.messageColorAlign = []
                                    }
                                    d.chatDetails.messageColorAlign.push({ ...m })
                                })
                            })
                        }
                        setIsQueueListLoading(false);
                        resolve({ status: true, queueList: data.rows })
                        setQueueList((list) => {
                            let updatedLength = mergeQueuePrevList.current ? list.items.length + data.rows.length : data.rows.length;
                            hasMoreQueueList.current = updatedLength < Number(data.count) ? true : false;
                            return {
                                selected: list.selected,
                                items: mergeQueuePrevList.current ? [...list.items, ...data.rows] : data.rows
                            }
                        })
                        mergeQueuePrevList.current = false;
                    }
                })
                .catch(error => {
                    console.error(error);
                    setIsQueueListLoading(false);
                    reject({ status: false, queueList: [] })
                })
                .finally()
        })
    }

    const getInteractionAssignedQueueList = () => {
        setIsAssignedQueueListLoading(true);
        
        return new Promise((resolve, reject) => {
            const requestBody = {
                status: "",
                assign: true,
                sort: assignedQueueSort
            }
            post(`${properties.INTERACTION_API}/helpdesk?limit=10&page=${assignedPageCount}`, requestBody)
                .then((response) => {
                    const { status, data } = response;
                    if (status === 200 && data && !!Object.keys(data).length) {
                        data?.rows?.forEach((d) => {
                            d?.chatDetails?.message?.forEach((m, i) => {
                                if (i === 0) {
                                    d.chatDetails.messageColorAlign = []
                                }
                                d.chatDetails.messageColorAlign.push({ ...m })
                            })
                        })
                        setIsAssignedQueueListLoading(false);
                        resolve(data.rows);
                        setQueueList((list) => {
                            let updatedLength = mergeAssignedPrevList.current ? list.selected.length + data.rows.length : data.rows.length;
                            hasMoreAssignedList.current = updatedLength < Number(data.count) ? true : false;
                            return {
                                items: list.items,
                                selected: mergeAssignedPrevList.current ? [...list.selected, ...data.rows] : data.rows
                            }
                        })
                        mergeAssignedPrevList.current = false;
                    }
                })
                .catch(error => {
                    console.error(error);
                    setIsAssignedQueueListLoading(false);
                    reject(error);
                })
                .finally()
        })
    }

    const assignInteraction = (intxnId) => {
        
        return new Promise((resolve, reject) => {
            
            put(`${properties.INTERACTION_API}/assignSelf/${intxnId}`, {type: 'SELF'})
                .then((response) => {
                    const { status, message } = response;
                    if (status === 200) {
                        toast.success(message);
                        resolve(true);
                    }
                })
                .catch(error => {
                    console.error(error);
                })
                .finally()
        })
    }


    useEffect(() => {
        executeInteractions();
    }, [refresh, autoRefresh, statusFilter])

    useEffect(() => {
        if (!isFirstRenderForQueue.current) {
            getInteractionQueueList();
        }
        else {
            isFirstRenderForQueue.current = false;
        }
    }, [queueSort, queuePageCount])

    useEffect(() => {
        if (!isFirstRenderForAssignedQueue.current) {
            getInteractionAssignedQueueList();
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
        const sourceClone = Array.from(source);
        const destClone = Array.from(destination);
        const [removed] = sourceClone.splice(droppableSource.index, 1);

        if (droppableSource.droppableId === 'queue' && droppableDestination.droppableId === 'assigned') {
            const assignStatus = assignInteraction(draggableId);
            assignStatus.then((resolved, rejected) => {
                if (resolved) {
                    setSearchAssignedQueueFilter("");
                    doSoftRefresh();
                }
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
        background: '#FBFBFB',
        ...draggableStyle
    });

    const getListStyle = (isDraggingOver) => ({
        background: '#F3F4F6',
        padding: 8,
        width: 'inherit',
        height: '1000px',
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
            setQueueList({
                items: result.queue,
                selected: result.assigned
            });
        }
    };

    const getInteractionDataById = useCallback((interactionId) => {
        
        return new Promise((resolve, reject) => {
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
                })
                .finally(() => {
                    
                })
        })
    }, [])

    const handleOnIdSelection = (detailedViewItem, laneSource) => {
        unstable_batchedUpdates(() => {
            setDetailedViewItem({ ...detailedViewItem, laneSource })
            if (['QUEUE'].includes(laneSource)) {
                let interactionResponse = getInteractionDataById(detailedViewItem.intxnId);
                interactionResponse.then((resolved, rejected) => {
                    if (resolved && !!Object.keys(resolved).length) {
                        interactionData.current = resolved;
                        setIsViewTicketDetailsOpen(true);
                    }
                }).catch(error => console.log(error))
            }
        })
    }

    const doSoftRefresh = (stateTo, intxnId = undefined) => {
        unstable_batchedUpdates(() => {
            switch (stateTo) {
                case 'UPDATE_INTERACTIONS':
                    const assignedResponse = getInteractionAssignedQueueList();
                    assignedResponse.then((resolved, rejected) => {
                        if (resolved && !!resolved.length) {
                            const view = resolved.find((interaction) => interaction.intxnId === intxnId);
                            if (view) {
                                setDetailedViewItem({
                                    ...view,
                                    laneSource: 'ASSIGNED'
                                });
                            }
                            else {
                                setDetailedViewItem(undefined);
                            }
                        }
                    }).catch(error => console.log(error))
                    break;
                default:
                    executeInteractions();
                    setDetailedViewItem(undefined);
            }
        })
    };

    const handleOnSearchQueueChange = (e) => {
        const { value, name, id } = e.target;
        unstable_batchedUpdates(() => {
            if (!value) {
                setQueueList({
                    ...queueList,
                    [name]: queueListBeforeFilter[name]
                })
            }
            else if (value && value !== searchQueueFilter) {
                if (queueListBeforeFilter[name].length) {
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
                    if (searchInput?.includes(item?.intxnId) || searchInput?.includes(item?.helpdeskId || item?.chatId) || item?.customerDetails?.contact?.email?.includes(searchInput) || item?.customerDetails?.firstName?.toLowerCase()?.includes(searchInput?.toLowerCase()) || item?.customerDetails?.lastName?.toLowerCase()?.includes(searchInput?.toLowerCase())) {
                        isTrue = true;
                    }
                    return isTrue;
                })
                setQueueListBeforeFilter({
                    ...queueListBeforeFilter,
                    [type]: queueList[type]
                })
                setQueueList({
                    ...queueList,
                    [type]: list
                })
            }
            else {
                setQueueList({
                    ...queueList,
                    [type]: queueListBeforeFilter.items
                })
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
            setQueueSort(value);
            setSearchQueueFilter("");
        }
        else {
            setAssignedQueueSort(value);
            setSearchAssignedQueueFilter("");
        }
    }

    const handleOnAssignForMobile = (viewItem) => {
        Swal.fire({
            title: 'Confirm move to my interactions?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Confirm'
        }).then((result) => {
            if (result.isConfirmed) {
                let responseStatus = assignInteraction(viewItem?.intxnId);
                responseStatus.then((resolved, rejected) => {
                    setSearchAssignedQueueFilter("");
                    doSoftRefresh();
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Moved to My interactions!'
                    })
                }).catch(error => console.log(error))
            }
        }).catch(error => console.log(error))
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
        console.log((Math.abs(scrollHeight - scrollTop - clientHeight)));
        if ((((Math.abs(scrollHeight - scrollTop - clientHeight)) <= 0.59) || ((Math.abs(scrollHeight - scrollTop - clientHeight)) <= 0.61)) && (id === 'Queue' ? hasMoreQueueList.current : hasMoreAssignedList.current)) {
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

    return (
        <div className="row">
            <div className="col-12 p-0">
                <fieldset className="scheduler-border" data-select2-id="7">
                    <div className="row channel-sel align-items-center">
                        <div className="col-6">
                            <h4 className="page-title">Helpdesk 360 - Interactions</h4>
                        </div>
                        {/* <div className="col-md-2">
                            <SimilarSearch
                            data={{
                                screenType:"Interaction"
                            }}
                            />
                        </div> */}
                        {/* <div className="col-md-2">
                        <div className="form-inline">
                            <span className="ml-1" >Quick Link</span>
                            <div className="switchToggle ml-1">
                                <input type="checkbox" id="quickLink" checked={isQuickLinkEnabled} onChange={() => {
                                    setIsQuickLinkEnabled(!isQuickLinkEnabled)
                                }} />
                                <label htmlFor="quickLink">Toggle</label>
                            </div>
                        </div>
                        </div> */}
                        <div className="col-md-6">
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
            </div>
            {/* <div className="col-12 p-0 text-right">
                <button className="skel-btn-submit" type="button" data-toggle="modal" data-target="#create-incident">Create Interaction</button>
            </div> */}
            <div className="col-12 px-0 pt-2">
                <div className='row'>
                    <div className='col-lg-6 px-1'>
                        <DragDropContext onDragEnd={onDragEnd}>
                            <div className='row mb-3'>
                                <div className='col-6 pl-0 pr-1'>
                                    <div className='card-box bg-light border p-0'>
                                        <Droppable droppableId="queue">
                                            {(provided, snapshot) => (
                                                <ul className="sortable-list tasklist list-unstyled" id='Queue'
                                                    onScroll={handleOnScroll}
                                                    ref={provided.innerRef}
                                                    style={getListStyle(snapshot.isDraggingOver)}>
                                                    <h4 className='header-title bold text-center help-title'>
                                                        Interactions Queue
                                                        &nbsp;<span className="badge badge-danger rounded-circle noti-icon-badge">{queueList.items.length}</span>
                                                    </h4>
                                                    <form onSubmit={(e) => handleOnSearchQueue(e, 'items')}>
                                                        <div className="row p-0 help-filter">
                                                            <div className="col-6 p-0">
                                                                <select className="form-control border" id="queueSort" value={queueSort} onChange={handleOnSortChange}>
                                                                    <option value='NEW'>Newest</option>
                                                                    <option value='OLD'>Oldest</option>
                                                                </select>
                                                            </div>
                                                            <div className="col-6 p-0">
                                                                <div className="input-group mb-3">
                                                                    <input type="text" className="form-control input-sm border" id='searchQueueFilter' name='items' value={searchQueueFilter} onChange={handleOnSearchQueueChange} placeholder="Search" aria-label="Search" />
                                                                    <div className="input-group-append">
                                                                        <button className="btn btn-light btn-sm border " type="button" onClick={(e) => handleOnSearchQueue(e, 'items')}><i className="fe-search text-dark"></i></button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </form>
                                                    <div className='drop-space'>
                                                        {
                                                            !!queueList.items.length ? queueList.items.map((item, index) => (
                                                                <Draggable
                                                                    key={String(item.intxnId)}
                                                                    draggableId={String(item.intxnNo)}
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
                                                                        >
                                                                            <InteractionListItem item={item} source={'QUEUE'} handleOnIdSelection={handleOnIdSelection} handleOnAssignForMobile={handleOnAssignForMobile} />
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
                                <div className='col-6 px-0'>
                                    <div className='card-box bg-light border p-0'>
                                        <Droppable droppableId="assigned">
                                            {(provided, snapshot) => (
                                                <ul className="sortable-list tasklist list-unstyled" id='Assigned'
                                                    onScroll={handleOnScroll}
                                                    ref={provided.innerRef}
                                                    style={getListStyle(snapshot.isDraggingOver)}>
                                                    <h4 className='header-title bold text-center help-title'>
                                                        My Interactions Queue
                                                        &nbsp;<span className="badge badge-danger rounded-circle noti-icon-badge">{queueList.selected.length}</span>
                                                    </h4>
                                                    <form onSubmit={(e) => handleOnSearchQueue(e, 'selected')}>
                                                        <div className="row p-0 help-filter">
                                                            <div className="col-6 p-0">
                                                                <select className="form-control border" id="assignedQueueSort" value={assignedQueueSort} onChange={handleOnSortChange}>
                                                                    <option value='NEW'>Newest</option>
                                                                    <option value='OLD'>Oldest</option>
                                                                </select>
                                                            </div>
                                                            <div className="col-6 p-0">
                                                                <div className="input-group mb-3">
                                                                    <input type="text" className="form-control input-sm border" id="searchAssignQueueFilter" name='selected' value={searchAssignedQueueFilter} onChange={handleOnSearchQueueChange} placeholder="Search" aria-label="Search" />
                                                                    <div className="input-group-append">
                                                                        <button className="btn btn-light btn-sm border " type="button" onClick={(e) => handleOnSearchQueue(e, 'selected')}><i className="fe-search text-dark"></i></button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </form>
                                                    <div className='drop-space'>
                                                        {
                                                            !!queueList.selected.length ? queueList.selected.map((item, index) => (
                                                                <Draggable
                                                                    key={String(item.intxnId)}
                                                                    draggableId={String(item.intxnId)}
                                                                    index={index}>
                                                                    {(provided, snapshot) => (
                                                                        <div
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                            style={getItemStyle(
                                                                                snapshot.isDragging,
                                                                                provided.draggableProps.style
                                                                            )}>
                                                                            <InteractionListItem item={item} source={'ASSIGNED'} handleOnIdSelection={handleOnIdSelection} />
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
                    <div className={isQuickLinkEnabled ? "col-lg-4 px-0":"col-lg-6 px-0"}>
                        {
                            detailedViewItem && detailedViewItem.laneSource === 'ASSIGNED' ? (
                                <InteractionDetailedView
                                    data={{
                                        detailedViewItem,
                                    }}
                                    handlers={{
                                        doSoftRefresh,
                                        getInteractionDataById
                                    }}
                                />
                            )
                                : (
                                    <div className="bg-helpdesk-img" />
                                )
                        }
                    </div>
                    {isQuickLinkEnabled && <div className="col-lg-2 px-1">
                        <LeftDropdownMenu
                            handlers={{
                                setStatusFilter
                            }}
                        />
                    </div>}
                </div>
                {
                    isViewTicketDetailsOpen &&
                    <InteractionViewTicketDetailsModal
                        data={{
                            isViewTicketDetailsOpen,
                            interactionData,
                            detailedViewItem
                        }}
                        handlers={{
                            setIsViewTicketDetailsOpen
                        }}
                    />
                }
            </div>
        </div>
    )
}

export default Interactions;