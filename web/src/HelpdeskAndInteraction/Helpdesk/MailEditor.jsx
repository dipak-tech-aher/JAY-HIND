import moment from 'moment';
import React, { useState, useEffect, useCallback, memo, useContext } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import ReactQuill from 'react-quill';
import { toast } from 'react-toastify';

import FileUpload from '../../common/uploadAttachment/fileUpload';
import { properties } from '../../properties';
import { get, put } from '../../common/util/restUtil';
import { removeEmptyKey } from '../../common/util/util'
import CannedMessageModal from './CannedMessageModal';
import { Markup } from 'interweave';
import Attachements from './shared/Attachments';
import { AppContext } from '../../AppContext';
import { statusConstantCode } from '../../AppConstants'

const MailEditor = memo((props) => {

    const { detailedViewItem, isDisabled, isVerified } = props.data;
    const { doSoftRefresh } = props.handlers;
    const { auth } = useContext(AppContext)
    const [text, setText] = useState("");
    const [status, setStatus] = useState("");
    const [conversationIndex, setConversationIndex] = useState(-1);
    const [currentFiles, setCurrentFiles] = useState([]);
    const [mailAttachments, setMailAttachments] = useState([]);
    const [replyAttachments, setReplyAttachments] = useState([]);
    const [isCannedOpen, setIsCannedOpen] = useState(false);
    const [isCust, setIsCust] = useState(false)
    const [projectTypes, setProjectTypes] = useState([])
    const [helpdeskStatus, setHelpdeskStatus] = useState([])
    const [helpdeskTypes, setHelpdeskTypes] = useState([])
    const [severities, setSeverities] = useState([])
    const [currProject, setCurrProject] = useState("");
    const [currHelpdeskType, setCurrHelpdeskType] = useState("");
    const [currSeverity, setCurrSeverity] = useState("");
    const [cancelReasonLookup, setCancelReasonLookup] = useState([])
    const [cancelReason, setCancelReason] = useState()

    // const getAttachments = useCallback((type) => {
    //     // Commented for dtWorks 2.0
    //     const isHelpdesk = type === 'HELPDESK' ? true : false;
    //     get(`${properties.ATTACHMENT_API}?entity-id=${isHelpdesk ? detailedViewItem?.helpdeskId : detailedViewItem?.conversation[0]?.helpdeskTxnId}&entity-type=${type}`)
    //         .then((response) => {
    //             if (response.data && response.data.length) {
    //                 isHelpdesk ? setMailAttachments(response.data) : setReplyAttachments(response.data)
    //             }
    //         })
    //         .catch((error) => {
    //             console.error("error", error)
    //         })
    //         .finally()
    // }, [])

    console.log('conversationIndex ------------>', conversationIndex)

    const handleOnProjectChange = (e) => {
        const { value } = e.target;
        setCurrProject(value);
    }

    const handleOnTypeChange = (e) => {
        const { value } = e.target;
        setCurrHelpdeskType(value);
    }

    const handleOnSeverityChange = (e) => {
        const { value } = e.target;
        setCurrSeverity(value);
    }

    const handleOnCancelReason = (e) => {
        const { value } = e.target;
        setCancelReason(value)
    }

    useEffect(() => {
        // console.log('--------------> clear')
        unstable_batchedUpdates(() => {
            setText("<br/>Regards,<br/>Support Team");
            setStatus(detailedViewItem?.status?.code);
            setCurrProject(detailedViewItem?.project?.code)
            setCurrHelpdeskType(detailedViewItem?.helpdeskType?.code)
            setCurrSeverity(detailedViewItem?.severity?.code)
            setCurrentFiles([]);
        })
        // Commented for dtWorks 2.0
        // getAttachments('HELPDESK');
        if (detailedViewItem?.conversation && !!detailedViewItem.conversation.length) {
            // Commented for dtWorks 2.0
            // getAttachments('HELPDESKTXN');
            // for (let idx = 0; idx < detailedViewItem.conversation.length; idx++) {
            //     if (detailedViewItem.conversation[idx].inOut === 'OUT') {
            //         setConversationIndex(idx)
            //         break
            //     }
            // }
            setConversationIndex(detailedViewItem.conversation.length - 1)
        }
    }, [detailedViewItem])

    // useEffect(() => {
    //     if (detailedViewItem?.customerDetails) {
    //         console.log('customerDetails ------------->', detailedViewItem?.customerDetails)
    //         get(properties.CUSTOMER_API + '/' + detailedViewItem?.customerDetails?.customer?.customerId).then((response) => {
    //             if (response.data) {

    //                 setIsCust(true)
    //                 post(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam=PROJECT')
    //                     .then((resp) => {
    //                         if (resp.data) {
    //                             let projects


    //                             let projectArray = response?.data?.project.find((f) => f.entity === auth?.currDeptId)
    //                             if (projectArray && projectArray?.project.length > 0 && !projectArray?.project.includes("ALL")) {
    //                                 projects = resp.data.PROJECT.filter((f) => f.mapping && f.mapping.hasOwnProperty('department') && f.mapping.department.includes(detailedViewItem?.entity))
    //                                 let filteredProjects = projects.filter((f) => projectArray?.project.includes(f.code))
    //                                 setProjectTypes(filteredProjects);
    //                             } else {
    //                                 projects = resp.data.PROJECT.filter((f) => f.mapping && f.mapping.hasOwnProperty('department') && f.mapping.department.includes(detailedViewItem?.entity))
    //                                 setProjectTypes(projects);
    //                             }

    //                         }
    //                     }).finally();
    //             }
    //         }).finally()
    //     } else {
    //         setIsCust(false)
    //         setProjectTypes([])
    //     }


    // }, [props])

    useEffect(() => {
        get(properties.MASTER_API + `/lookup?searchParam=code_type&valueParam=${statusConstantCode.businessEntity.HELPDESK_TYPE},${statusConstantCode.businessEntity.SEVERITY},${statusConstantCode.businessEntity.PROJECT},${statusConstantCode.businessEntity.HELPDESKSTATUS},${statusConstantCode.businessEntity.HELPDESKCANCELREASON}`).then((resp) => {
            if (resp?.data) {
                const { PROJECT, HELPDESK_STATUS, HELPDESK_CANCEL_REASON, HELPDESK_TYPE, SEVERITY } = resp?.data

                const helpdeskStatusList = HELPDESK_STATUS && HELPDESK_STATUS.filter((e) => {
                    //&& e.code !== detailedViewItem?.status?.code
                    if (e.code !== statusConstantCode?.status?.HELPDESK_NEW) {
                        return true
                    }
                    return false
                })
                unstable_batchedUpdates(() => {
                    setCancelReasonLookup(HELPDESK_CANCEL_REASON)
                    setProjectTypes(PROJECT)
                    setHelpdeskTypes(HELPDESK_TYPE)
                    setSeverities(SEVERITY)
                    setHelpdeskStatus(helpdeskStatusList)
                })
            }
        }).catch((error) => console.log(error))
            .finally()
    }, [props])

    const handleOnRichTextChange = (text) => {
        setText(text)
    }

    const handleOnStatusChange = (e) => {
        const { value } = e.target;
        setStatus(value);
    }

    const handleOnSubmit = () => {
        console.log("detailedViewItem ===> ", detailedViewItem);
        console.log("currHelpdeskType ===> ", currHelpdeskType);
        console.log("currSeverity ===> ", currSeverity);
        console.log("currProject ===> ", currProject);
        console.log("status ===> ", status);

        if (detailedViewItem?.status?.code === status && (!text || text.trim() === '')) {
            toast.warn('There is no change in status and reply to customer has not been specified')
            return false
        }

        if (currentFiles && currentFiles.length > 0 && (!text || text.trim() === '')) {
            toast.info('A reply to customer must be provided along with attachments')
            return false
        }

        if (status === statusConstantCode?.status?.HELPDESK_CLOSED && !detailedViewItem.project && currProject === "") {
            toast.warn('Please select project')
            return false
        }

        if (status === statusConstantCode?.status?.HELPDESK_CLOSED && !detailedViewItem.helpdeskType && currHelpdeskType === "") {
            toast.warn('Please select helpdesk type')
            return false
        }

        if (status === statusConstantCode?.status?.HELPDESK_CLOSED && !detailedViewItem.severity && currSeverity === "") {
            toast.warn('Please select severity')
            return false
        }

        if (status === statusConstantCode?.status?.HELPDESK_CANCEL && !cancelReason) {
            toast.warn('Please select cancel reason')
            return false
        }

        let requestBody = {
            helpdeskId: detailedViewItem?.helpdeskId,
            content: text,
            status,
            helpdeskType: currHelpdeskType,
            severity: currSeverity,
            cancelReason: cancelReason || null,
            project: currProject,
            attachments: currentFiles?.map((file) => file.entityId),
            entityType: statusConstantCode.entityCategory.HELPDESK
        }
        /** Remove the empty keys in given objects */
        requestBody = removeEmptyKey(requestBody)

        put(`${properties.HELPDESK_API}/update/${detailedViewItem?.helpdeskId}/REPLY`, requestBody)
            .then((response) => {
                const { status, message } = response;
                if (status === 200) {
                    // doSoftRefresh('UPDATE_CUSTOMER_DETAILS', detailedViewItem?.helpdeskId, detailedViewItem?.currUser ? 'ASSIGNED' : 'QUEUE')
                    doSoftRefresh('UPDATE_DETAILED_VIEW', detailedViewItem?.helpdeskId)
                    doSoftRefresh('CANCEL_VIEW');
                    toast.success(message);
                }
            })
            .catch(error => {
                console.log(error);
            })
            .finally()
    }

    const handleOnCancel = () => {
        doSoftRefresh('CANCEL_VIEW');
    }

    return (
        <div className="col-12 row pt-2 m-0 helpdesk-padding-left-0 skel-interaction-detail-section">

            <table>
                <tr>
                    <td width="100%" className='form-label'>Helpdesk No</td>
                    <td width="5%">:</td>
                    <td width="50%">{detailedViewItem?.helpdeskNo}</td>
                </tr>
                <tr>
                    <td width="100%" className='form-label'>Status</td>
                    <td width="5%">:</td>
                    <td width="50%">{detailedViewItem?.status?.description}</td>
                </tr>
                <tr>
                    <td className='form-label'>Subject</td>
                    <td width="5%">:</td>
                    <td width="50%">{detailedViewItem?.helpdeskSubject}</td>
                </tr>
                <tr>
                    <td className='form-label'>Mail Content</td>
                    <td width="5%">:</td>
                    <td width="50%">{detailedViewItem?.helpdeskContent}</td>
                </tr>
                <tr>
                    <td className='form-label'>Domain</td>
                    <td width="5%">:</td>
                    <td width="50%">{detailedViewItem?.email ? detailedViewItem?.email.split('@')[1] : ''}</td>
                </tr>
                <tr>
                    <td className='form-label'>Attachments</td>
                    <td width="5%">:</td>
                    <td width="50%"><Attachements
                        data={{
                            attachmentList: mailAttachments,
                            entityId: detailedViewItem?.helpdeskId,
                            entityType: 'HELPDESK'
                        }}
                    /></td>
                </tr>
                <tr>
                    <td className='form-label'>Last Conversation</td>
                    <td width="5%">:</td>
                    <td width="50%"><div className={`form-vtext col-auto p-0 ml-auto ${isDisabled ? 'd-none' : ''}`}>
                        <button className='badge badge-pill badge-primary p-1' onClick={() => setIsCannedOpen(true)}>Reply from Canned Message</button>
                    </div></td>
                </tr>

            </table>
            {/* <div className="row col-12">
                <div className="col-3 form-label">Subject:</div>
                <div className="col-9 form-vtext">{detailedViewItem?.helpdeskSubject}</div>
            </div>
            <div className="col-12 row pt-2">
                <div className="col-3 form-label">Mail Content:</div> */}
            {/*<div className="col-9 form-vtext" dangerouslySetInnerHTML={{ __html: detailedViewItem?.content }}></div>*/}
            {/* <div className="col-9 form-vtext">{detailedViewItem?.helpdeskContent}</div>
            </div> */}
            {/*
            <div className="col-12 row pt-2">
                <div className="col-3 form-label">Domain:</div>
                <div className="col-9 form-vtext">{detailedViewItem?.email ? detailedViewItem?.email.split('@')[1] : ''}</div>
            </div>
            */}
            {/* <div className={`col-12 row pt-2 mb-2`}>
                <div className="col-3 form-label">Attachment</div>
                <Attachements
                    data={{
                        attachmentList: mailAttachments,
                        entityId: detailedViewItem?.helpdeskId,
                        entityType: 'HELPDESK'
                    }}
                />
            </div>
            <div className='col-12 row pt-2'>
                <div className="col-4 form-label">Reply Message:</div>
                <div className={`form-vtext col-auto p-0 ml-auto ${isDisabled ? 'd-none' : ''}`}>
                    <button className='badge badge-pill badge-primary p-1' onClick={() => setIsCannedOpen(true)}>Reply from Canned Message</button>
                </div>
            </div> */}
            <div className='col-12 mb-1'>
                {/*
                    detailedViewItem?.conversation && detailedViewItem.conversation?.map((reply, indx) => (
                        <div className="col-12 row pt-2" key={indx}>
                            <div className="col-3 form-vtext">
                                {reply?.sender}
                                <div className='badge badge-pill badge-success'>{reply?.messageDateTime ? moment(reply.messageDateTime).format('DD-MMM-YYYY HH:MM A') : ''}</div>
                            </div>
                            <div className="col-9 form-vtext">{reply?.content}</div>
                        </div>
                    ))
                    */}
                {
                    detailedViewItem?.conversation && !!detailedViewItem?.conversation?.length && conversationIndex > -1 && (
                        <>
                            <div className="col-12 skel-transcript-conversation">
                                <div className="col-5 form-vtext skel-form-vtext">
                                    {detailedViewItem?.conversation[conversationIndex]?.sender}
                                    <div className='badge badge-pill badge-success'>{detailedViewItem?.conversation[conversationIndex]?.createdAt ? moment(detailedViewItem?.conversation[conversationIndex]?.createdAt).format('DD-MMM-YYYY HH:MM A') : ''}</div>
                                </div>
                                <div className="col-7 form-vtext skel-form-vtext">
                                    <Markup content={detailedViewItem?.conversation[conversationIndex]?.helpdeskContent} />
                                </div>
                            </div>
                            <div className={`col-12 row pt-2 ${!replyAttachments.length ? 'd-none' : ''}`}>
                                <div className="col-3 form-vtext">Attachment</div>
                                <Attachements
                                    data={{
                                        attachmentList: replyAttachments,
                                        entityId: detailedViewItem?.conversation[conversationIndex]?.helpdeskTxnId,
                                        entityType: 'HELPDESKTXN'
                                    }}
                                />
                            </div>
                        </>
                    )
                }
            </div>
            <div className={`col-12 mt-2 ${isDisabled ? 'd-none' : ''}`}>
                <ReactQuill
                    placeholder='Write Something...'
                    value={text} modules={MailEditor.modules}
                    formats={MailEditor.formats}
                    onChange={handleOnRichTextChange}
                />
            </div>
            <div className={`col-12 ${isDisabled ? 'd-none' : ''}`}>
                <FileUpload
                    data={{
                        currentFiles,
                        entityType: 'HELPDESK',
                        shouldGetExistingFiles: false,
                    }}
                    handlers={{
                        setCurrentFiles
                    }}
                />
            </div>
            <div className={`col p-0 mb-2 ${detailedViewItem?.laneSource === undefined || detailedViewItem?.laneSource === 'QUEUE' ? 'd-none' : ''}`}>
                <div className="ds-form-group2 clearfix">
                    <div className="form-label">Update Status :</div><span className='text-danger font-20 pl-1 fld-imp'>*</span>
                    <select id="mailStatus" className="form-control" value={status} onChange={handleOnStatusChange}>
                        <option value="">Select Status</option>
                        {
                            helpdeskStatus && helpdeskStatus?.map((e) => (
                                <option key={e.code} value={e.code}>{e.description}</option>
                            ))
                        }
                    </select>
                </div>
                <div className="ds-form-group2 clearfix">
                    <div className="form-label">Update Type:</div>
                    <select id="mailStatus" className="form-control" value={currHelpdeskType} onChange={handleOnTypeChange}>
                        <option value="">Select Type</option>
                        {
                            helpdeskTypes && helpdeskTypes.map((e) => (
                                <option key={e.code} value={e.code}>{e.description}</option>
                            ))
                        }
                    </select>
                </div>
                <div className="ds-form-group2 clearfix">
                    <div className="form-label">Update Severity:</div>
                    <select id="mailStatus" className="form-control" value={currSeverity} onChange={handleOnSeverityChange}>
                        <option value="">Select Severity</option>
                        {
                            severities && severities.map((e) => (
                                <option key={e.code} value={e.code}>{e.description}</option>
                            ))
                        }
                    </select>
                </div>
                <div className="ds-form-group2 clearfix">
                    <div className="form-label">Update Project:</div>
                    <select id="mailStatus" className="form-control" value={currProject} onChange={handleOnProjectChange}>
                        <option value="">Select Project Type</option>
                        {
                            projectTypes && projectTypes.map((e) => (
                                <option key={e.code} value={e.code}>{e.description}</option>
                            ))
                        }
                    </select>
                </div>
                {status && status === statusConstantCode.status.HELPDESK_CANCEL &&
                    <div className="ds-form-group2 clearfix">
                        <div className="form-label">Cancel Reason</div><span className='text-danger font-20 pl-1 fld-imp'>*</span>

                        <select id="cancelReason" className="form-control" value={cancelReason} onChange={handleOnCancelReason}>
                            <option value="">Select Cancel Reason</option>
                            {
                                cancelReasonLookup && cancelReasonLookup.map((e) => (
                                    <option key={e.code} value={e.code}>{e.description}</option>
                                ))
                            }
                        </select>
                    </div>
                }
            </div>
            <div className={`row col-12 justify-content-center ${detailedViewItem?.laneSource === 'QUEUE' ? 'd-none' : ''}`}>
                <button type="button" className="skel-btn-cancel" onClick={handleOnCancel}>Cancel</button>
                <button type="button" className="skel-btn-submit skel-custom-submit-btn" onClick={handleOnSubmit}>Submit</button>
            </div>
            {
                isCannedOpen &&
                <CannedMessageModal
                    data={{
                        isCannedOpen
                    }}
                    handlers={{
                        setIsCannedOpen,
                        setText
                    }}
                />
            }
        </div>
    )
})

MailEditor.modules = {
    toolbar: [
        [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
        [{ size: [] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' },
        { 'indent': '-1' }, { 'indent': '+1' }],
        ['link', 'video', { 'color': ['#000000', '#e60000', '#ff9900', '#ffff00', '#008a00', '#0066cc', '#9933ff', '#ffffff', '#facccc', '#ffebcc', '#ffffcc', '#cce8cc', '#cce0f5', '#ebd6ff', '#bbbbbb', '#f06666', '#ffc266', '#ffff66', '#66b966', '#66a3e0', '#c285ff', '#888888', '#a10000', '#b26b00', '#b2b200', '#006100', '#0047b2', '#6b24b2', '#444444', '#5c0000', '#663d00', '#666600', '#003700', '#002966', '#3d1466', 'custom-color'] }, { 'background': [] }],
        ['clean']
    ],
    clipboard: {
        matchVisual: true,
    }
}

MailEditor.formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'video', 'color', 'background'
]


export default MailEditor;