import { isEmpty } from 'lodash';
import moment from 'moment';
import { useEffect, useRef, useState } from "react";
import { unstable_batchedUpdates } from "react-dom";
import Modal from "react-modal";
import DynamicTable from "../../common/table/DynamicTable";
import { post } from "../../common/util/restUtil";
import { formFilterObject, removeEmptyKey } from "../../common/util/util";
import { properties } from "../../properties";
import BotChat from '../../assets/images/bot-chat.svg';

import _ from "lodash";

const ChatDetailsModel = (props) => {

    const [chatDetailsInfo, setChatDetailsInfo] = useState([])
    const [total, setTotal] = useState(0)
    const [currentPage, setCurrentPage] = useState(0)
    const [perPage, setPerPage] = useState(10)
    const [exportBtn, setExportBtn] = useState(true)
    const [filters, setFilters] = useState([])
    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);
    const [listSearch, setListSearch] = useState([])
    const [isShowChatConversation, setIsShowChatConversation] = useState(false)
    const [chatConversation, setChatConversation] = useState([])

    const customStyles = {
        content: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            maxHeight: '90%',
            // height: 'auto'  /**Srini commented this as the height of pop up should not be changed. Please discuss before touching */
        }
    }

    const { ChatDetailsOpen, chatDetails } = props.data;
    const { setChatDetailsOpen } = props.handler;

    useEffect(() => {
        if (!isEmpty(chatDetails)) {
            let requestBody = removeEmptyKey(chatDetails);
            requestBody = {
                ...requestBody,
                filters: formFilterObject(filters)
            }
            setListSearch(requestBody)
            post(`${properties.CHAT_API}/chat-details?limit=${perPage}&page=${currentPage}`, requestBody).then((res) => {
                if (res.status === 200 && res.data?.count > 0) {
                    const { rows, count } = res.data
                    unstable_batchedUpdates(() => {
                        setChatDetailsInfo(rows)
                        setTotal(count)
                    })
                } else {
                    unstable_batchedUpdates(() => {
                        setChatDetailsInfo([])
                        setTotal(0)
                    })
                }
            }).catch((err) => {
                console.error(err);
            })
        }
    }, [chatDetails, currentPage, perPage])

    const handleCellRender = (cell, row) => {
        if (["Start Date and Time", "End Date and Time", "Created At"].includes(cell.column.Header)) {
            return (<span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>)
        } else if (["Chat Duration"].includes(cell.column.Header)) {
            return (<span>{cell?.value ? Number(cell?.value).toFixed(2) + ' min' : '-'}</span>)
        } else if (["Chat Conversation"].includes(cell.column.Header)) {
            return (
                <button type="button" className="skel-btn-submit" data-toggle="modal" onClick={() => { setIsShowChatConversation(!isShowChatConversation); setChatConversation(row?.original?.message || []) }}>View</button >
            )
        } else if (["Agent Name"].includes(cell.column.Header)) {
            let name = (row?.original?.user?.firstName || "") + " " + (row?.original?.user?.lastName || "")
            return (<span>{name || '-'}</span>)
        }
        else {
            return (<span>{cell.value ? cell.value : "-"}</span>)
        }
    }

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    // const message = _.map(chatConversation, 'msg');
    const messageFrom = _.map(chatConversation, 'from');

    return (
        <>
            <Modal isOpen={ChatDetailsOpen} contentLabel="Modal" style={customStyles}>
                <div className="modal-center" id="followupModal" tabindex="-1" role="dialog" aria-labelledby="followupModal" aria-hidden="true"        >
                    <div className="chat-his">
                        <div className="modal-content">
                            <div className="modal-header mt-2 mb-1">
                                <h4 className="modal-title">Chat Details</h4>
                                <button type="button" className="close pl-2" onClick={() => setChatDetailsOpen(false)}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                        </div>
                        <div className="modal-body">
                            <div className="">
                                {chatDetailsInfo && <DynamicTable
                                    listSearch={listSearch}
                                    listKey={"Chat Details"}
                                    url={`${properties.CHAT_API}/chat-details?limit=${perPage}&page=${currentPage}`}
                                    row={chatDetailsInfo}
                                    rowCount={total}
                                    header={chatDetailsColumns}
                                    itemsPerPage={perPage}
                                    backendPaging={true}
                                    backendCurrentPage={currentPage}
                                    isTableFirstRender={isTableFirstRender}
                                    hasExternalSearch={hasExternalSearch}
                                    exportBtn={exportBtn}
                                    method='POST'
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
                        </div>
                    </div >
                </div>
            </Modal >
            <Modal isOpen={isShowChatConversation} className={"skel-view-rh-modal"} contentLabel="Modal" style={customStyles}>
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header mt-2 mb-1">
                            <h4 className="modal-title">Chat Conversation</h4>
                            <button type="button" className="close pl-2" onClick={() => { setIsShowChatConversation(false); setChatConversation([]) }}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            {chatConversation.length > 0 ?
                                <>
                                    {chatConversation.map((m, index) => {
                                        return (
                                            <div style={{ width: "100%", float: "left" }}>
                                                {
                                                    console.log('m.msg', m.msg)
                                                }
                                                <div style={{ width: "fit-content", float: (messageFrom[index] === 'Agent' ? "right" : "left") }}>
                                                    <div className='form-inline pt-1'>
                                                        {messageFrom[index] !== 'Agent' && <i className="fas fa-user font-22" style={{ float: 'right', paddingRight: '10px' }}></i>}
                                                        <li style={{ borderRadius: "50px", padding: "12px 30px", width: "fit-content", backgroundColor: (messageFrom[index] === 'User' ? '#F7941E' : '#F0532D'), textAlign: (messageFrom[index] === 'User' ? "left" : "left") }}
                                                            key={index}>{m?.msg?.split('@@@')?.[1]?.split('\n')?.[0]}</li>
                                                        {messageFrom[index] === 'Agent' && <i className="fas fa-robot font-22" style={{ float: 'right', paddingLeft: '10px' }}></i>}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </> :
                                <p className='skel-widget'>No Conversation available</p>
                            }
                        </div>
                    </div>
                </div>
            </Modal>
            {/* <>
                {isShowChatConversation && <div className="modal right fade skel-view-rh-modal show" id="test-right-modal" tabIndex="-1" role="dialog" aria-labelledby="testrightmodal">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-body">
                            <div className="skel-profile-base">
                            <div className="skel-profile-info">
                                <span className="skel-profile-name">Hello</span>
                                </div>
                            <button id="modalButton" type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        </div>
                            </div>
                        </div>
                    </div>
                </div>}

            </> */}

        </>
    )
}

export default ChatDetailsModel

const chatDetailsColumns = [
    {
        Header: "ID",
        accessor: "chatId",
        disableFilters: false,
        id: "chatId"
    },
    {
        Header: "Mobile No",
        accessor: "contactNo",
        disableFilters: false,
        id: "contactNo"
    },
    {
        Header: "Customer Name",
        accessor: "customerName",
        disableFilters: false,
        id: "customerName"
    }, {
        Header: "Start Date and Time",
        accessor: "startAt",
        disableFilters: true,
        id: "startAt"
    }, {
        Header: "End Date and Time",
        accessor: "endAt",
        disableFilters: true,
        id: "endAt"
    }, {
        Header: "Agent Name",
        accessor: "user.firstName",
        disableFilters: true,
        id: "user"
    },
    {
        Header: "Status",
        accessor: "statusDesc.description",
        disableFilters: true,
        id: "statusDesc"
    },
    {
        Header: "Source",
        accessor: "chatSourceDesc.description",
        disableFilters: true,
        id: "chatSourceDesc"
    }, {
        Header: "Chat Duration",
        accessor: "chatDuration",
        disableFilters: true,
        id: "chatDuration"
    }, {
        Header: "Chat Conversation",
        accessor: "message",
        disableFilters: true,
        id: "message"
    }, {
        Header: "Interaction Id",
        accessor: "Interaction Id",
        disableFilters: true,
        id: "interactionId"
    }, {
        Header: "Created At",
        accessor: "createdAt",
        disableFilters: true,
        id: "createdAt"
    }
]