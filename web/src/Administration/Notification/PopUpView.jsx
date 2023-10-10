import moment from 'moment';
import { nanoid } from 'nanoid';
import React, { useCallback, useEffect, useRef, useState } from "react";
import { CloseButton, Modal as ReactModal } from 'react-bootstrap';
import { unstable_batchedUpdates } from 'react-dom';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
// import Lottie from 'react-lottie';
import { toast } from 'react-toastify';
import { object, string } from 'yup';
import { statusConstantCode } from '../../AppConstants';
import { get, put } from '../../common/util/restUtil';
import { properties } from '../../properties';
import { Link } from 'react-router-dom';
import noNotification from '../../assets/images/no_notification.png'

const PopUpView = (props) => {
    const [isOpenModal, setIsOpenModal] = useState(false)
    const [interaction, setInteraction] = useState({})
    const [workflowLookup, setWorkflowLookup] = useState();
    const [interactionInputs, setInteractionInputs] = useState({
        user: "",
        assignRole: "",
        assignDept: "",
        currStatus: "",
        remarks: "",
    })

    const [roleLookup, setRoleLookup] = useState();
    const [currStatusLookup, setCurrStatusLookup] = useState();
    const isRoleChangedByUserRef = useRef(false);
    const [error, setError] = useState({});
    const [userLookup, setUserLookup] = useState();
    const { notifications = [{ rows: [], count: 0 }], isQueueListLoading, pageRefresh, animationData } = props?.data
    const { handleMarkAsReadAndUnRead, handleisPinned, handleOnScroll, setPageRefresh, getNotifications, getNotificationsCount } = props?.handler
    // const handleMarkAsReadAndUnRead = props?.handler?.handleMarkAsReadAndUnRead
    const colorCode = statusConstantCode.colorCode
    let defaultOptions = {}
    if (animationData) {
        defaultOptions = {
            loop: true,
            autoplay: true,
            speed: '1',
            animationData: animationData,
            // height:'60%',
            rendererSettings: {
                preserveAspectRatio: "xMidYMid slice"
            }
        };
    }

    const ticketDetailsValidationSchema = object().shape({
        assignRole: string().required("Department/Role is required"),
        currStatus: string().required("Status is required"),
    });

    const getNotificationAgeing = (data) => {
        let ageing = '0 to 3 days'
        if (!data) {
            data = moment.format('YYYY-MM-DD')
        }
        const count = moment().diff(moment(data), 'days')
        ageing = count <= 3 ? '0 to 3 days' : count <= 5 ? '3 to 5 days' : 'Greater than 5 days'
        return ageing
    }

    /**
     * @param {String} intxnNo 
     * @param {String} type  @enum [SELF,REASSIGN_TO_SELF ]
     * @returns 
     */
    const handleOnAssignToSelf = (txnNo, type, entityCategory, notificationId) => {

        if (statusConstantCode.entityCategory.INTERACTION === entityCategory) {
            if (!txnNo) {
                toast.warn('we are not able to find the Interaction Details')
                return
            }
            put(`${properties.INTERACTION_API}/assignSelf/${txnNo}`, {
                type,
            })
                .then((response) => {
                    toast.success(`${response.message}`)
                    getNotifications(notificationId)
                    getNotificationsCount()
                    // setPageRefresh(!pageRefresh)
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally();
        } else if (statusConstantCode.entityCategory.ORDER === entityCategory) {
            put(`${properties.ORDER_API}/assignSelf`, { order: [{ orderNo: txnNo, type: type }] })
                .then((response) => {
                    toast.success(`${response.message}`)
                    getNotifications(notificationId)
                    getNotificationsCount()
                    // setPageRefresh(!pageRefresh)
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally();
        }
    };


    const getWorkflowStatus = useCallback((uuid, type) => {
        if (!uuid || !type) {
            toast.warn('we are not able to find the Interaction Details')
            return
        }
        get(`${properties.WORKFLOW_DEFN_API}/get-status?entityId=${uuid}&entity=${type}`)
            .then((response) => {
                if (response.data) {
                    let statusArray = [];
                    unstable_batchedUpdates(() => {
                        setWorkflowLookup(response.data);
                        response?.data?.entities &&
                            response?.data?.entities.map((node) => {
                                node?.status?.map((st) => {
                                    statusArray.push(st);
                                });
                            });
                        let statusLookup = [
                            ...new Map(
                                statusArray.map((item) => [item["code"], item])
                            ).values(),
                        ];
                        setRoleLookup([]);
                        setCurrStatusLookup(statusLookup)
                    })
                }
            }).catch((error) => {
                console.error(error);
            })
            .finally();
    }, [])

    useEffect(() => {
        if (isOpenModal) {
            getWorkflowStatus(interaction?.intxnUuid, 'INTERACTION')
        }
    }, [getWorkflowStatus, isOpenModal])


    useEffect(() => {
        if (interactionInputs.assignRole !== "") {
            getUsersBasedOnRole();
        } else {
            setUserLookup([])
        }
    }, [interactionInputs.assignRole]);

    const handleOnClickModal = (obj, notificationId) => {
        unstable_batchedUpdates(() => {
            if (obj) {
                setInteraction({ ...obj, notificationId })
            }
            setIsOpenModal(!isOpenModal)
        })
    }

    const handleOnClose = () => {
        unstable_batchedUpdates(() => {
            setIsOpenModal(!isOpenModal)
            setWorkflowLookup()
            setInteraction({})
            setRoleLookup()
            setCurrStatusLookup()
            setError()
            setUserLookup()
            setInteractionInputs({
                user: "",
                assignRole: "",
                assignDept: "",
                currStatus: "",
                remarks: "",
            })
        })
    }

    const handleStatusChange = (e) => {
        let entity = [];
        const { target } = e;
        handleOnTicketDetailsInputsChange(e);
        workflowLookup && workflowLookup.entities.map((unit) => {
            for (const property in unit.status) {
                if (unit.status[property].code === e.target.value) {
                    entity.push(unit);
                    break;
                }
            }
        });

        if (entity && entity?.length === 1 && entity?.[0]?.roles.length === 1 && entity?.[0]?.entity.length === 1 &&
            entity?.[0]?.roles?.[0].roleId && entity?.[0]?.entity?.[0]?.unitId) {
            setInteractionInputs({
                ...interactionInputs,
                [target.id]: target.value,
                assignRole: entity?.[0]?.roles?.[0].roleId,
                assignDept: entity?.[0]?.entity?.[0]?.unitId
            })
        }
        setRoleLookup(entity);
    };

    const getUsersBasedOnRole = () => {
        get(`${properties.USER_API}/by-role?roleId=${interaction?.currRole}&deptId=${interaction?.currDept}`)
            .then((userResponse) => {
                let { data } = userResponse;
         //       data = data.sort((a,b) => (a.firstName > b.firstName) ? 1 : ((b.firstName > a.firstName) ? -1 : 0))
                setUserLookup(data);
                if (isRoleChangedByUserRef.current) {
                    if (data.length === 1) {
                        setInteractionInputs({
                            ...interactionInputs,
                            user: data[0].userId,
                        });
                    }
                }
            }).catch((error) => {
                console.error(error);
            })
            .finally();
    };

    const handleOnTicketDetailsInputsChange = (e) => {
        const { target } = e;
        if (target.id === "assignRole") {
            const { unitId = "" } = target.value !== "" && JSON.parse(target.options[target.selectedIndex].dataset.entity);
            setInteractionInputs({
                ...interactionInputs,
                [target.id]: target.value,
                assignDept: unitId,
            })
            isRoleChangedByUserRef.current = true;
        } else {
            setInteractionInputs({
                ...interactionInputs,
                [target.id]: target.value,
            })
        }
        setError({
            ...error,
            [target.id]: "",
        });
    };

    const checkTicketDetails = () => {
        let error = validate("DETAILS", ticketDetailsValidationSchema, interactionInputs)
        if (error) {
            toast.error("Validation errors found. Please check highlighted fields");
            return false;
        }
        return true;
    }

    const handleTicketDetailsSubmit = (e) => {
        e.preventDefault();
        if (checkTicketDetails()) {
            let reqBody = {
                roleId: Number(interactionInputs?.assignRole),
                departmentId: interactionInputs?.assignDept,
                status: interactionInputs?.currStatus,
            };
            if (interactionInputs?.user) {
                reqBody.userId = Number(interactionInputs?.user);
            }
            if (interactionInputs?.remarks) {
                reqBody.remarks = interactionInputs?.remarks;
            }

            put(properties.INTERACTION_API + "/update/" + interaction.intxnNo, {
                ...reqBody,
            }).then((response) => {
                toast.success(`${response?.message}`);
                handleOnClickModal();
                getNotifications(interaction?.notificationId)
                getNotificationsCount()
                // setPageRefresh(!pageRefresh)
            }).catch((error) => {
                console.error(error);
            }).finally();
        }
    };

    const validate = (section, schema, data) => {
        try {
            if (section === "DETAILS") {
                setError({})
            }
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                if (section === "DETAILS") {
                    setError((prevState) => {
                        return { ...prevState, [err.params.path]: err.message }
                    });
                }
            })
            return e
        }
    }

    const handleAppointment = (link) => {
        window.open(link)
    }

    return (
        <>
            {(notifications?.rows?.length > 0 || notifications?.today?.length > 0 || notifications?.yesterday?.length > 0 || notifications?.pinned?.length > 0) ?
                <div className="cust-sect-full-grid">
                    <div className="cmmn-container-base no-brd">
                        <div className="noti-scroll overflow-auto" data-simplebar onScroll={handleOnScroll}>

                            {/* Pinned */}

                            {notifications?.pinned?.length > 0 &&
                                <>
                                    {notifications?.pinned?.map((n) => {
                                        return (
                                            // bg-light border
                                            <div className="mwidth100 m-2 p-2 bg-light border" key={nanoid()} role="alert" aria-live="assertive" aria-atomic="true" data-toggle="toast" id={`unread_` + nanoid()}>
                                                <div className="px-2">
                                                    <div className="row">
                                                        <div className="col-12">
                                                            <div className="notify">
                                                                {/* p-1 */}
                                                                <div className="row">
                                                                    {/* <div className="col-1">
                                                        </div> */}
                                                                    <span className="badge badge-outline-white bg-white font-14 font-weight-normal p-1" onClick={() => { handleisPinned(n?.notificationEvents?.isPinned, n?.notificationId) }}>
                                                                        <i class="fas fa-thumbtack fa-xs" style={{ "color": n?.notificationEvents?.isPinned ? '#fe4000' : '#454545' }}></i>
                                                                    </span>
                                                                    <div className="col-md-8">
                                                                        <p className="py-1 mb-0">{n?.payload?.entity?.entityId}  {n?.payload?.entity?.customerNo ? `| ${n?.payload?.entity?.customerNo}` : ''}
                                                                            <small className="text-primary pl-1">{n?.createdAt ? moment(n.createdAt).fromNow() : ''}</small>
                                                                        </p>
                                                                    </div>
                                                                    {/*  pull-right */}
                                                                    <div className="col-3">
                                                                        <span onClick={() => { handleMarkAsReadAndUnRead(n?.notificationEvents?.isRead, n?.notificationId) }} className='cursor-pointer'>
                                                                            <span className="badge badge-outline-white bg-white font-14 font-weight-normal p-1 border">{`Mark as ${n?.notificationEvents?.isRead ? 'un-read' : 'read'}`}</span>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <span className="font-16 font-weight-bold text-dark">{n?.subject}</span>
                                                                <p className="mt-1">
                                                                    <span className="mr-3">{n?.notificationSourceDesc?.description}</span>
                                                                    <span className="mr-3">
                                                                        {
                                                                            console.log(n?.payload?.entity?.priority)
                                                                        }
                                                                        <i className={`fas fa-dot-circle ${colorCode[n?.payload?.entity?.priority]?.color ?? 'text-info'}  mr-1`}></i>
                                                                        {colorCode[n?.payload?.entity?.priority]?.desc ?? '-'}</span>
                                                                    <span className="mr-1">
                                                                        <i className="fas fa-minus text-success font-18 alignmiddle"></i>
                                                                    </span><span>{getNotificationAgeing(n?.createdAt)}</span>
                                                                </p>
                                                                <div className="row pt-2">
                                                                    {n?.entity?.source === statusConstantCode.entityCategory.INTERACTION &&
                                                                        n?.entity?.isEnabled &&
                                                                        n?.entity?.type === 'REASSIGN' &&
                                                                        <div className="col-6">
                                                                            <div className="noti-approve-reject">
                                                                                <button
                                                                                    className="styl-edti-btn font-weight-light font-14 mb-1" onClick={() => { handleOnClickModal(n?.entity, n?.notificationId) }}>
                                                                                    Reassign</button>
                                                                            </div>
                                                                        </div>}
                                                                    {n?.entity?.source === statusConstantCode.entityCategory.ORDER &&
                                                                        n?.entity?.isEnabled &&
                                                                        n?.entity?.type === 'REASSIGN' &&
                                                                        <div className="col-6">
                                                                            <div className="noti-approve-reject">
                                                                                <Link
                                                                                    className="styl-edti-btn font-weight-light font-14 mb-1"
                                                                                    data-toggle="modal"
                                                                                    data-target="#reassign-modal"
                                                                                    //customerUid: n?.entity?.customerUuid
                                                                                    to={{
                                                                                        pathname: `${process.env.REACT_APP_BASE}/order360`,
                                                                                        state: {
                                                                                            data: { orderNo: n?.entity?.orderNo },
                                                                                        }
                                                                                    }}>
                                                                                    View Order</Link>
                                                                            </div>
                                                                        </div>}
                                                                    {n?.entity?.source === statusConstantCode.entityCategory.APPOINTMENT &&
                                                                        n?.entity?.isEnabled &&
                                                                        (n?.entity?.type === 'VIDEO_CONF' || n?.entity?.type === 'AUDIO_CONF') &&
                                                                        n?.entity?.link &&
                                                                        <div className="col-6">
                                                                            <div className="noti-approve-reject">
                                                                                <button className="styl-edti-btn font-weight-light font-14 mb-1" onClick={() => { handleAppointment(n.entity.link) }}>
                                                                                    <i className="mdi mdi-video-check-outline"></i>
                                                                                    Join VC</button>
                                                                            </div>
                                                                        </div>}
                                                                    {[statusConstantCode.entityCategory.INTERACTION, statusConstantCode?.entityCategory?.ORDER].includes(n?.entity?.source) &&
                                                                        n?.entity?.isEnabled &&
                                                                        n?.entity?.type === 'ASSIGNTOSELF' &&
                                                                        <div className="col-6">
                                                                            <div className="noti-approve-reject">
                                                                                <button
                                                                                    className="styl-edti-btn font-weight-light font-14 mb-1" onClick={() => { handleOnAssignToSelf(n?.payload?.entity?.entityId, 'SELF', n?.entity?.source, n?.notificationId) }}>
                                                                                    {/* <i className="mdi mdi-arrow-right"></i> */}
                                                                                    Assign to Me</button>
                                                                            </div>
                                                                        </div>}
                                                                    {n?.entity?.source === statusConstantCode.entityCategory.REQUEST &&
                                                                        n?.entity?.isEnabled &&
                                                                        n?.entity?.type === 'APPROVE' && <div className="col-6">
                                                                            <div className="noti-approve-reject">
                                                                                <button
                                                                                    className="styl-edti-btn font-weight-light font-14 mb-1"
                                                                                    data-toggle="modal"
                                                                                    data-target="#"><i
                                                                                        className="mdi mdi-check"></i>
                                                                                    Approve</button> <button
                                                                                        className="styl-del-btn font-weight-light font-14 mb-1"
                                                                                        data-toggle="modal"
                                                                                        data-target="#"><i
                                                                                            className="mdi mdi-close"></i>
                                                                                    Reject</button>
                                                                            </div>
                                                                        </div>}
                                                                </div>

                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </>
                            }

                            {/* Today */}

                            {notifications?.today.length > 0 &&
                                <>
                                    <div className="text-small text-dark px-2">TODAY</div>
                                    {notifications?.today?.map((n) => {
                                        return (
                                            // bg-light border
                                            <div className="mwidth100 m-2 p-2 border" key={nanoid()} role="alert" aria-live="assertive" aria-atomic="true" data-toggle="toast" id={`unread_` + nanoid()}>
                                                <div className="px-2">
                                                    <div className="row">
                                                        <div className="col-12">
                                                            <div className="notify">
                                                                {/* p-1 */}
                                                                <div className="row">
                                                                    {/* <div className="col-1">
                                                        </div> */}
                                                                    <span className="badge badge-outline-white bg-white font-14 font-weight-normal p-1" onClick={() => { handleisPinned(n?.notificationEvents?.isPinned, n?.notificationId) }}>
                                                                        <i class="fas fa-thumbtack fa-xs" style={{ "color": n?.notificationEvents?.isPinned ? '#fe4000' : '#454545' }}></i>
                                                                    </span>
                                                                    <div className="col-md-8">
                                                                        <p className="py-1 mb-0">{n?.payload?.entity?.entityId}  {n?.payload?.entity?.customerNo ? `| ${n?.payload?.entity?.customerNo}` : ''}
                                                                            <small className="text-primary pl-1">{n?.createdAt ? moment(n.createdAt).fromNow() : ''}</small>
                                                                        </p>
                                                                    </div>
                                                                    {/*  pull-right */}
                                                                    <div className="col-3">
                                                                        <span onClick={() => { handleMarkAsReadAndUnRead(n?.notificationEvents?.isRead, n?.notificationId) }} className='cursor-pointer'>
                                                                            <span className="badge badge-outline-white bg-white font-14 font-weight-normal p-1 border">{`Mark as ${n?.notificationEvents?.isRead ? 'un-read' : 'read'}`}</span>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <span className="font-16 font-weight-bold text-dark">{n?.subject}</span>
                                                                <p className="mt-1">
                                                                    <span className="mr-3">{n?.notificationSourceDesc?.description}</span>
                                                                    <span className="mr-3">
                                                                        <i className={`fas fa-dot-circle ${colorCode[n?.payload?.entity?.priority]?.color ?? 'text-info'} mr-1`}></i>
                                                                        {colorCode[n?.payload?.entity?.priority]?.desc ?? '-'}</span>
                                                                    <span className="mr-1">
                                                                        <i className="fas fa-minus text-success font-18 alignmiddle"></i>
                                                                    </span><span>{getNotificationAgeing(n?.createdAt)}</span>
                                                                </p>
                                                                <div className="row pt-2">
                                                                    {n?.entity?.source === statusConstantCode.entityCategory.INTERACTION &&
                                                                        n?.entity?.isEnabled &&
                                                                        n?.entity?.type === 'REASSIGN' &&
                                                                        <div className="col-6">
                                                                            <div className="noti-approve-reject">
                                                                                <button
                                                                                    className="styl-edti-btn font-weight-light font-14 mb-1" onClick={() => { handleOnClickModal(n?.entity, n?.notificationId) }}>
                                                                                    Reassign</button>
                                                                            </div>
                                                                        </div>}
                                                                    {n?.entity?.source === statusConstantCode.entityCategory.ORDER &&
                                                                        n?.entity?.isEnabled &&
                                                                        n?.entity?.type === 'REASSIGN' &&
                                                                        <div className="col-6">
                                                                            <div className="noti-approve-reject">
                                                                                <Link
                                                                                    className="styl-edti-btn font-weight-light font-14 mb-1"
                                                                                    data-toggle="modal"
                                                                                    data-target="#reassign-modal"
                                                                                    //customerUid: n?.entity?.customerUuid
                                                                                    to={{
                                                                                        pathname: `${process.env.REACT_APP_BASE}/order360`,
                                                                                        state: {
                                                                                            data: { orderNo: n?.entity?.orderNo },
                                                                                        }
                                                                                    }}>
                                                                                    View Order</Link>
                                                                            </div>
                                                                        </div>}
                                                                    {n?.entity?.source === statusConstantCode.entityCategory.APPOINTMENT &&
                                                                        n?.entity?.isEnabled &&
                                                                        (n?.entity?.type === 'VIDEO_CONF' || n?.entity?.type === 'AUDIO_CONF') &&
                                                                        n?.entity?.link &&
                                                                        <div className="col-6">
                                                                            <div className="noti-approve-reject">
                                                                                <button className="styl-edti-btn font-weight-light font-14 mb-1" onClick={() => { handleAppointment(n.entity.link) }}>
                                                                                    <i className="mdi mdi-video-check-outline"></i>
                                                                                    Join VC</button>
                                                                            </div>
                                                                        </div>}
                                                                    {[statusConstantCode.entityCategory.INTERACTION, statusConstantCode?.entityCategory?.ORDER].includes(n?.entity?.source) &&
                                                                        n?.entity?.isEnabled &&
                                                                        n?.entity?.type === 'ASSIGNTOSELF' &&
                                                                        <div className="col-6">
                                                                            <div className="noti-approve-reject">
                                                                                <button
                                                                                    className="styl-edti-btn font-weight-light font-14 mb-1" onClick={() => { handleOnAssignToSelf(n?.payload?.entity?.entityId, 'SELF', n?.entity?.source, n?.notificationId) }}>
                                                                                    {/* <i className="mdi mdi-arrow-right"></i> */}
                                                                                    Assign to Me</button>
                                                                            </div>
                                                                        </div>}
                                                                    {n?.entity?.source === statusConstantCode.entityCategory.REQUEST &&
                                                                        n?.entity?.isEnabled &&
                                                                        n?.entity?.type === 'APPROVE' && <div className="col-6">
                                                                            <div className="noti-approve-reject">
                                                                                <button
                                                                                    className="styl-edti-btn font-weight-light font-14 mb-1"
                                                                                    data-toggle="modal"
                                                                                    data-target="#"><i
                                                                                        className="mdi mdi-check"></i>
                                                                                    Approve</button> <button
                                                                                        className="styl-del-btn font-weight-light font-14 mb-1"
                                                                                        data-toggle="modal"
                                                                                        data-target="#"><i
                                                                                            className="mdi mdi-close"></i>
                                                                                    Reject</button>
                                                                            </div>
                                                                        </div>}
                                                                </div>

                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </>
                            }

                            {/* Yesterday */}

                            {notifications?.yesterday.length > 0 &&
                                <>
                                    <div className="text-small text-dark px-2">YESTERDAY</div>
                                    {notifications?.yesterday?.map((n) => {
                                        return (
                                            // bg-light border
                                            <div className="mwidth100 m-2 p-2 border" key={nanoid()} role="alert" aria-live="assertive" aria-atomic="true" data-toggle="toast" id={`unread_` + nanoid()}>
                                                <div className="px-2">
                                                    <div className="row">
                                                        <div className="col-12">
                                                            <div className="notify">
                                                                {/* p-1 */}
                                                                <div className="row">
                                                                    {/* <div className="col-1">
                                                        </div> */}
                                                                    <span className="badge badge-outline-white bg-white font-14 font-weight-normal p-1" onClick={() => { handleisPinned(n?.notificationEvents?.isPinned, n?.notificationId) }}>
                                                                        <i class="fas fa-thumbtack fa-xs" style={{ "color": n?.notificationEvents?.isPinned ? '#fe4000' : '#454545' }}></i>
                                                                    </span>
                                                                    <div className="col-md-8">
                                                                        <p className="py-1 mb-0">{n?.payload?.entity?.entityId}  {n?.payload?.entity?.customerNo ? `| ${n?.payload?.entity?.customerNo}` : ''}
                                                                            <small className="text-primary pl-1">{n?.createdAt ? moment(n.createdAt).fromNow() : ''}</small>
                                                                        </p>
                                                                    </div>
                                                                    {/*  pull-right */}
                                                                    <div className="col-3">
                                                                        <span onClick={() => { handleMarkAsReadAndUnRead(n?.notificationEvents?.isRead, n?.notificationId) }} className='cursor-pointer'>
                                                                            <span className="badge badge-outline-white bg-white font-14 font-weight-normal p-1 border">{`Mark as ${n?.notificationEvents?.isRead ? 'un-read' : 'read'}`}</span>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <span className="font-16 font-weight-bold text-dark">{n?.subject}</span>
                                                                <p className="mt-1">
                                                                    <span className="mr-3">{n?.notificationSourceDesc?.description}</span>
                                                                    <span className="mr-3">
                                                                        <i className={`fas fa-dot-circle ${colorCode[n?.payload?.entity?.priority]?.color ?? 'text-info'} mr-1`}></i>
                                                                        {colorCode[n?.payload?.entity?.priority]?.desc ?? '-'}</span>
                                                                    <span className="mr-1">
                                                                        <i className="fas fa-minus text-success font-18 alignmiddle"></i>
                                                                    </span><span>{getNotificationAgeing(n?.createdAt)}</span>
                                                                </p>
                                                                <div className="row pt-2">
                                                                    {n?.entity?.source === statusConstantCode.entityCategory.INTERACTION &&
                                                                        n?.entity?.isEnabled &&
                                                                        n?.entity?.type === 'REASSIGN' &&
                                                                        <div className="col-6">
                                                                            <div className="noti-approve-reject">
                                                                                <button
                                                                                    className="styl-edti-btn font-weight-light font-14 mb-1" onClick={() => { handleOnClickModal(n?.entity, n?.notificationId) }}>
                                                                                    Reassign</button>
                                                                            </div>
                                                                        </div>}
                                                                    {n?.entity?.source === statusConstantCode.entityCategory.APPOINTMENT &&
                                                                        n?.entity?.isEnabled &&
                                                                        (n?.entity?.type === 'VIDEO_CONF' || n?.entity?.type === 'AUDIO_CONF') &&
                                                                        n?.entity?.link &&
                                                                        <div className="col-6">
                                                                            <div className="noti-approve-reject">
                                                                                <button
                                                                                    className="styl-edti-btn font-weight-light font-14 mb-1"
                                                                                    data-toggle="modal"
                                                                                    data-target="#reassign-modal">
                                                                                    <i className="mdi mdi-video-check-outline"></i>
                                                                                    Join VC</button>
                                                                            </div>
                                                                        </div>}
                                                                    {[statusConstantCode.entityCategory.INTERACTION, statusConstantCode?.entityCategory?.ORDER].includes(n?.entity?.source) &&
                                                                        n?.entity?.isEnabled &&
                                                                        n?.entity?.type === 'ASSIGNTOSELF' &&
                                                                        <div className="col-6">
                                                                            <div className="noti-approve-reject">
                                                                                <button
                                                                                    className="styl-edti-btn font-weight-light font-14 mb-1" onClick={() => { handleOnAssignToSelf(n?.payload?.entity?.entityId, 'SELF', n?.entity?.source, n?.notificationId) }}>
                                                                                    {/* <i className="mdi mdi-arrow-right"></i> */}
                                                                                    Assign to Me</button>
                                                                            </div>
                                                                        </div>}
                                                                    {n?.entity?.source === statusConstantCode.entityCategory.REQUEST &&
                                                                        n?.entity?.isEnabled &&
                                                                        n?.entity?.type === 'APPROVE' && <div className="col-6">
                                                                            <div className="noti-approve-reject">
                                                                                <button
                                                                                    className="styl-edti-btn font-weight-light font-14 mb-1"
                                                                                    data-toggle="modal"
                                                                                    data-target="#"><i
                                                                                        className="mdi mdi-check"></i>
                                                                                    Approve</button> <button
                                                                                        className="styl-del-btn font-weight-light font-14 mb-1"
                                                                                        data-toggle="modal"
                                                                                        data-target="#"><i
                                                                                            className="mdi mdi-close"></i>
                                                                                    Reject</button>
                                                                            </div>
                                                                        </div>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </>
                            }

                            {/* Others */}

                            {notifications?.rows.length > 0 &&
                                <>
                                    <div className="text-small text-dark px-2">Older</div>
                                    {notifications?.rows?.map((n) => {
                                        return (
                                            // bg-light border
                                            <div className="mwidth100 m-2 p-2 border" key={nanoid()} role="alert" aria-live="assertive" aria-atomic="true" data-toggle="toast" id={`unread_` + nanoid()}>
                                                <div className="px-2">
                                                    <div className="row">
                                                        <div className="col-12">
                                                            <div className="notify">
                                                                {/* p-1 */}
                                                                <div className="row">
                                                                    {/* <div className="col-1">
                                                        </div> */}
                                                                    <span className="badge badge-outline-white bg-white font-14 font-weight-normal p-1" onClick={() => { handleisPinned(n?.notificationEvents?.isPinned, n?.notificationId) }}>
                                                                        <i class="fas fa-thumbtack fa-xs" style={{ "color": n?.notificationEvents?.isPinned ? '#fe4000' : '#454545' }}></i>
                                                                    </span>
                                                                    <div className="col-md-8">
                                                                        <p className="py-1 mb-0">{n?.payload?.entity?.entityId}  {n?.payload?.entity?.customerNo ? `| ${n?.payload?.entity?.customerNo}` : ''}
                                                                            <small className="text-primary pl-1">{n?.createdAt ? moment(n.createdAt).fromNow() : ''}</small>
                                                                        </p>
                                                                    </div>
                                                                    {/*  pull-right */}
                                                                    <div className="col-3">
                                                                        <span onClick={() => { handleMarkAsReadAndUnRead(n?.notificationEvents?.isRead, n?.notificationId) }} className='cursor-pointer'>
                                                                            <span className="badge badge-outline-white bg-white font-14 font-weight-normal p-1 border">{`Mark as ${n?.notificationEvents?.isRead ? 'un-read' : 'read'}`}</span>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <span className="font-16 font-weight-bold text-dark">{n?.subject}</span>
                                                                <p className="mt-1">
                                                                    <span className="mr-3">{n?.notificationSourceDesc?.description}</span>
                                                                    <span className="mr-3">
                                                                        <i className={`fas fa-dot-circle ${colorCode[n?.payload?.entity?.priority]?.color ?? 'text-info'} mr-1`}></i>
                                                                        {colorCode[n?.payload?.entity?.priority]?.desc ?? '-'}</span>
                                                                    <span className="mr-1">
                                                                        <i className="fas fa-minus text-success font-18 alignmiddle"></i>
                                                                    </span><span>{getNotificationAgeing(n?.createdAt)}</span>
                                                                </p>
                                                                <div className="row pt-2">
                                                                    {n?.entity?.source === statusConstantCode.entityCategory.INTERACTION &&
                                                                        n?.entity?.isEnabled &&
                                                                        n?.entity?.type === 'REASSIGN' &&
                                                                        <div className="col-6">
                                                                            <div className="noti-approve-reject">
                                                                                <button
                                                                                    className="styl-edti-btn font-weight-light font-14 mb-1"
                                                                                    data-toggle="modal"
                                                                                    data-target="#reassign-modal">
                                                                                    Reassign</button>
                                                                            </div>
                                                                        </div>}
                                                                    {n?.entity?.source === statusConstantCode.entityCategory.ORDER &&
                                                                        n?.entity?.isEnabled &&
                                                                        n?.entity?.type === 'REASSIGN' &&
                                                                        <div className="col-6">
                                                                            <div className="noti-approve-reject">
                                                                                <Link
                                                                                    className="styl-edti-btn font-weight-light font-14 mb-1"
                                                                                    data-toggle="modal"
                                                                                    data-target="#reassign-modal"
                                                                                    //customerUid: n?.entity?.customerUuid
                                                                                    to={{
                                                                                        pathname: `${process.env.REACT_APP_BASE}/order360`,
                                                                                        state: {
                                                                                            data: { orderNo: n?.entity?.orderNo },
                                                                                        }
                                                                                    }}>
                                                                                    View Order</Link>
                                                                            </div>
                                                                        </div>}
                                                                    {n?.entity?.source === statusConstantCode.entityCategory.APPOINTMENT &&
                                                                        n?.entity?.isEnabled &&
                                                                        (n?.entity?.type === 'VIDEO_CONF' || n?.entity?.type === 'AUDIO_CONF') &&
                                                                        n?.entity?.link &&
                                                                        <div className="col-6">
                                                                            <div className="noti-approve-reject">
                                                                                <button
                                                                                    className="styl-edti-btn font-weight-light font-14 mb-1"
                                                                                    data-toggle="modal"
                                                                                    data-target="#reassign-modal">
                                                                                    <i className="mdi mdi-video-check-outline"></i>
                                                                                    Join VC</button>
                                                                            </div>
                                                                        </div>}
                                                                    {[statusConstantCode.entityCategory.INTERACTION, statusConstantCode?.entityCategory?.ORDER].includes(n?.entity?.source) &&
                                                                        n?.entity?.isEnabled &&
                                                                        n?.entity?.type === 'ASSIGNTOSELF' &&
                                                                        <div className="col-6">
                                                                            <div className="noti-approve-reject">
                                                                                <button
                                                                                    className="styl-edti-btn font-weight-light font-14 mb-1" onClick={() => { handleOnAssignToSelf(n?.payload?.entity?.entityId, 'SELF', n?.entity?.source, n?.notificationId) }}>
                                                                                    {/* <i className="mdi mdi-arrow-right"></i> */}
                                                                                    Assign to Me</button>
                                                                            </div>
                                                                        </div>}
                                                                    {n?.entity?.source === statusConstantCode.entityCategory.REQUEST &&
                                                                        n?.entity?.isEnabled &&
                                                                        n?.entity?.type === 'APPROVE' && <div className="col-6">
                                                                            <div className="noti-approve-reject">
                                                                                <button
                                                                                    className="styl-edti-btn font-weight-light font-14 mb-1"
                                                                                    data-toggle="modal"
                                                                                    data-target="#"><i
                                                                                        className="mdi mdi-check"></i>
                                                                                    Approve</button> <button
                                                                                        className="styl-del-btn font-weight-light font-14 mb-1"
                                                                                        data-toggle="modal"
                                                                                        data-target="#"><i
                                                                                            className="mdi mdi-close"></i>
                                                                                    Reject</button>
                                                                            </div>
                                                                        </div>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </>
                            }
                        </div>
                    </div>
                </div>
                :
                <>
                    {!isQueueListLoading && animationData && <div className='text-center'>
                        {/* <Lottie style={{ pointerEvents: 'none' }}
                        options={defaultOptions}
                        height={'60%'}
                        width={'50%'}
                    /> */}
                    <img src ={noNotification} alt='no_notification' style={{width: '400px'}}/>
                        <p style={{ textAlign: 'center', padding: "30px" }}>You've read all your notifications</p>
                    </div>}
                </>

            }

            <ReactModal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered show={isOpenModal} onHide={handleOnClickModal} dialogClassName="wsc-cust-mdl-temp-prev">
                <ReactModal.Header>
                    <ReactModal.Title><h5 class="modal-title">Reassign the Interaction ID - {interaction?.intxnNo || ''}</h5></ReactModal.Title>
                    <CloseButton onClick={handleOnClickModal} style={{ backgroundColor: 'transparent', fontWeight: 700, color: '#373737', fontSize: '1.5rem' }}>
                        <span>×</span>
                    </CloseButton>
                </ReactModal.Header>
                <ReactModal.Body>
                    <React.Fragment>
                        <form class="needs-validation p-2" name="event-form" id="form-event" novalidate>
                            <div class="">
                                <div class="row skel-active-exs-field mt-3">
                                    <div class="col-md-4">
                                        <div class="form-group">
                                            <label for="Channel" class="control-label">Status<span class="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <select id="currStatus" value={interactionInputs?.currStatus || ''} onChange={(e) => { handleStatusChange(e) }}
                                                className={`form-control ${error?.currStatus && "error-border"}`}>
                                                <option key="status" value="">Select...</option>
                                                {currStatusLookup && currStatusLookup.map((currStatus, index) => (
                                                    <option key={index} value={currStatus?.code}>{currStatus?.description}</option>
                                                ))}
                                            </select>
                                            <span className="errormsg">{error?.currStatus ? error.currStatus : ""}</span>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="form-group">
                                            <label for="Channel" class="control-label">Deparment/Role<span class="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <select class="form-control" id="assignRole" value={interactionInputs?.assignRole || ''} onChange={(e) => { handleOnTicketDetailsInputsChange(e) }}
                                                className={`form-control ${error?.assignRole && "error-border"}`}>
                                                <option key="role" value="" data-entity="">
                                                    Select Role
                                                </option>
                                                {roleLookup &&
                                                    roleLookup.map((dept, key) => (
                                                        <optgroup key={key} label={dept?.entity[0]?.unitDesc}>
                                                            {!!dept?.roles?.length &&
                                                                dept?.roles?.map((data, childKey) => (
                                                                    <option
                                                                        key={childKey}
                                                                        value={data.roleId}
                                                                        data-entity={JSON.stringify(dept.entity?.[0])}
                                                                    >
                                                                        {data.roleDesc}
                                                                    </option>
                                                                ))}
                                                        </optgroup>
                                                    ))}
                                            </select>
                                            <span className="errormsg">
                                                {error?.assignRole ? error?.assignRole : ""}
                                            </span>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="form-group">
                                            <label for="Channel" class="control-label">User</label>
                                            <select class="form-control" id="user" className={`form-control ${error?.user && "error-border"}`}
                                                value={interactionInputs?.user || ''}
                                                onChange={handleOnTicketDetailsInputsChange}>
                                                <option key="user" value="">
                                                    Select User
                                                </option>
                                                {userLookup &&
                                                    userLookup.map((user) => (
                                                        <option key={user.userId} value={user.userId}>
                                                            {user.firstName} {user.lastName}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </React.Fragment>
                </ReactModal.Body>
                <ReactModal.Footer style={{ display: 'block' }}>
                    <div className="skel-btn-center-cmmn">
                        <button type="button" className="skel-btn-cancel" onClick={() => { handleOnClose() }}>Close</button>
                        <button type="submit" class="skel-btn-submit" id="btn-del-event" data-dismiss="modal" onClick={handleTicketDetailsSubmit}>Submit</button>
                    </div>
                </ReactModal.Footer>
            </ReactModal>
        </>
    )
}
export default PopUpView