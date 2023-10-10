import React from 'react';
import moment from 'moment';
import PriorityBadge from './shared/PriorityBadge';

const InteractionListItem = (props) => {
    const { item, source, handleOnIdSelection, handleOnAssignForMobile = () => { } } = props;

    const interactionNames = {
        REQCOMP: 'Complaints',
        REQSR: 'Service Request',
        REQINQ: 'Inquiry'
    }

    return (
        <li id="task1" draggable="false" className="">
            <div className="status-card" id="mail">
                <div className="row bg-light  p-0">
                    <div className="col-3">
                        <div className="status-num">
                            <h5>
                                <span className='text-primary cursor-pointer' onClick={() => handleOnIdSelection(item, source)}>
                                    Int.ID:{item?.intxnId}
                                </span>
                            </h5>
                            {
                                source === 'QUEUE' &&
                                <div className="dropdown float-right drag-drop" onClick={() => handleOnAssignForMobile(item)}>
                                    <i className="fa fa-arrow-circle-right arrow1" aria-hidden="true"></i>
                                </div>
                            }
                        </div>
                    </div>
                    <div className="col-9 ml-auto">
                        <h5 className="pl-2 text-break">{item?.helpdeskDetails?.title}</h5>
                    </div>
                </div>
                <hr />
                <div className="col-12 row p-1 m-0">
                    <div className="col-6">
                        <div>
                            <i className="fa fa-clock text-muted pr-1" />
                            {item?.createdAt ? moment(item.createdAt).format('DD/MM/YYYY HH:MM') : '-'}
                        </div>
                    </div>
                    <div className="col-6">
                        <div className='text-capitalize'>
                            <i className="fa fa-arrow-right text-muted pr-2 " />
                            {item?.helpdeskDetails?.source?.toLowerCase() || 'Live Chat'}
                        </div>
                    </div>
                    <div className="col-12">
                        <div className="p-2">Interaction Type - {interactionNames[item?.intxnType]}
                        </div>
                    </div>
                </div>
                <div className="status-card-btm m-1 px-2">
                    <div className="row pt-2">
                        <div className="col-sm-12 text-left">
                            <div className="fr-icon">
                                <i className="fas fa-user text-secondary pr-1"></i>
                                <span>HD ID:{item?.helpdeskDetails?.helpdeskId || item?.chatDetails?.chatId}</span>
                            </div>
                        </div>
                        <div className="col-sm-6 text-left">
                            <div className="fr-icon">
                                <i className="fas fa-user text-secondary pr-1"></i>
                                <span>SLA: -</span>
                            </div>
                        </div>
                        <div className="col-sm-6 text-left">
                            <div className="fr-icon">
                                Priority -
                                <PriorityBadge data={{ priority: item?.priorityDescription?.description }} />
                            </div>
                        </div>
                        <div className="col-sm-6 text-left pt-1">
                            <div className="fr-icon">
                                <i className="fas fa-user text-secondary pr-1"></i>
                                <span>{item?.customerDetails?.firstName}{item?.customerDetails?.lastName}</span>
                            </div>
                        </div>

                        <div className="col-sm-6 text-left pt-1">
                            <div className="fr-icon">
                                <i className="fas fa-phone text-secondary pr-1"></i>
                                <span className='text-break'>{item?.customerDetails?.contact?.contactNo}</span>
                            </div>
                        </div>
                        <div className="col-sm-12 text-left pt-1">
                            <div className="fr-icon">
                                <i className="fas fa-envelope text-secondary pr-1"></i>
                                <span className='text-break'>{item?.customerDetails?.contact?.email}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    )
}

export default InteractionListItem;