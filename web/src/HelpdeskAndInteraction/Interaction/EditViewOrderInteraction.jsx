/* eslint-disable array-callback-return */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { object, string } from "yup";
import { AppContext } from "../../AppContext";
import vImp from '../../assets/images/v-img.png';

import { get, post, put } from '../../common/util/restUtil';
import { properties } from '../../properties';
// import robotai1 from "../../assets/images/robot-ai-sett.svg";
// import robotai2 from "../../assets/images/robot-ai-idea.svg";
// import emojiIcon from '../../assets/images/emoji.png';
import moment from 'moment';
import Modal from 'react-modal';
import { Link } from "react-router-dom";
import Slider from "react-slick";
import Swal from 'sweetalert2';
import { RegularModalCustomStyles } from '../../common/util/util';
import OrderJourney from './OrderJourney';
// import OrderTasks from './OrderTasks';
import _ from 'lodash';
import { unstable_batchedUpdates } from 'react-dom';
import CustomerDetailsFormViewMin from '../../CRM/Customer/CustomerDetailsFormViewMin';
import DynamicTable from '../../common/table/DynamicTable';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { saveAs } from 'file-saver';

const EditViewOrderInteraction = (props) => {
    const { auth } = useContext(AppContext);
    // const [timer, setTimer] = useState(null);
    // const [workflowAuthData, setWorkflowAuthData] = useState();
    const [selectedTask, setSelectedTask] = useState([]);
    const [childOrderWithDeptRole, setChildOrderWithDeptRole] = useState([]);
    const [childOrder, setChildOrder] = useState([]);
    const [interactionData, setInteractionData] = useState({});
    const [orderedProductDetails, setOrderedProductDetails] = useState([]);
    const [customerDetails, setCustomerDetails] = useState({})
    const [interactionInputs, setInteractionInputs] = useState({
        user: "",
        assignRole: "",
        assignDept: "",
        currStatus: "",
        remarks: ""
    })
    const [error, setError] = useState({})
    const [orderWorkflow, setOrderWorkflow] = useState({})
    const [workflowHistory, setWorkflowHistory] = useState({
        count: 0,
        rows: []
    })
    const [followUpHistory, setFollowUpHistory] = useState({
        rows: [],
        count: 0
    })
    const [permissions, setPermissions] = useState({
        assignToSlef: false,
        followup: false,
        readOnly: false,
        reAssign: false,
        displayOnly: true
    });

    const isRoleChangedByUserRef = useRef(false);
    const currentWorkflowRef = useRef();
    const ticketDetailsValidationSchema = object().shape({
        assignRole: string().required("Assgin to Department/Role is required"),
        currStatus: string().required("Current Status is required")
    });
    const [isWorflowHistoryOpen, setIsWorkflowHistoryOpen] = useState(false)
    const [isFollowupOpen, setIsFollowupOpen] = useState(false);
    const [isReAssignOpen, setIsReAssignOpen] = useState(false);
    const [isCancelOpen, setIsCancelOpen] = useState(false)
    const [priorityLookup, setPriorityLookup] = useState([]);
    const [sourceLookup, setSourceLookup] = useState([]);
    const [reAssignUserLookup, setReAssignUserLookup] = useState();
    const [followupInputs, setFollowupInputs] = useState({
        priority: "",
        source: "",
        remarks: ""
    })
    const [reAssignInputs, setReAssignInputs] = useState({
        userId: ""
    })
    const [cancellationReason, setCancellationReason] = useState()
    const [cancellationReasonLookup, setCancellationReasonLookup] = useState([])
    const [workflowLookup, setWorkflowLookup] = useState()
    const [taskDetails, setTaskDetails] = useState([])
    const [roleLookup, setRoleLookup] = useState();
    const [userLookup, setUserLookup] = useState();
    const [currStatusLookup, setCurrStatusLookup] = useState();
    const [isFollowUpHistoryOpen, setIsFollowUpHistoryOpen] = useState(false)
    const [orderCountHistory, setOrderCountHistory] = useState({
        totalOrderCount: 0,
        openOrderCount: 0,
        closedOrderCount: 0
    })

    const [appointmentDetails, setAppointmentDetails] = useState({})
    const [lastOrderRemark, setLastOrderRemark] = useState('')
    const [productPopup, setProductPopup] = useState(false)
    const wrapperRef = useRef(null);
    const [selectedProduct, setSelectedProduct] = useState()
    const [orderCustomerHistoryDetails, setOrderCustomerHistoryDetails] = useState([])
    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [orderStatusType, setOrderStatusType] = useState();
    const [isOrderListOpen, setIsOrderListOpen] = useState()
    const [scheduleContract, setScheduleContract] = useState([])

    useEffect(() => {
        if ((childOrder?.currEntity?.unitId && childOrder?.currEntity?.unitId !== '') && permissions.readOnly === false) {

            get(`${properties.WORKFLOW_DEFN_API}/get-status?entityId=${childOrder?.orderUuid}&entity=ORDER`)
                .then((response) => {
                    if (response.data) {
                        const { flow, flwId } = response?.data;
                        currentWorkflowRef.current = { flwId }
                        if (flow !== 'DONE') {
                            let statusArray = []
                            setWorkflowLookup(response.data)
                            response?.data?.entities && response?.data?.entities.map((node) => {
                                node?.status?.map((st) => {
                                    statusArray.push(st)
                                })
                            })
                            let statusLookup = [...new Map(statusArray.map(item => [item["code"], item])).values()]

                            setRoleLookup([]);
                            setCurrStatusLookup(statusLookup)
                            setInteractionInputs({
                                user: "",
                                assignRole: "",
                                assignDept: "",
                                currStatus: "",
                                remarks: ""
                            })
                        }
                        else if (flow === 'DONE') {
                            setPermissions({
                                assignToSlef: false,
                                followup: false,
                                readOnly: true,
                                reAssign: false,
                                displayOnly: true
                            })
                        }

                        if (childOrder?.orderStatus?.code === "CLS") {
                            setPermissions({
                                assignToSlef: false,
                                followup: false,
                                readOnly: true,
                                reAssign: false,
                                displayOnly: true

                            })
                        }
                    }
                }).catch(error => console.log(error))
                .finally()
        }
        console.log('childOrder?.orderNo===>', childOrder?.orderNo)
        if (childOrder?.orderNo) {
            // get workflow history
            get(`${properties.ORDER_API}/history?orderNo=${childOrder?.orderNo}`)
                .then((response) => {
                    if (response?.data && response?.data) {
                        setWorkflowHistory(response?.data)
                    }
                })
                .catch((error) => {
                    console.error(error)
                })
                .finally()

            //get followup history
            get(`${properties.ORDER_API}/history/${childOrder?.orderNo}?getFollowUp=true`)
                .then((response) => {
                    if (response?.data && response?.data) {
                        setFollowUpHistory(response?.data)
                    }
                })
                .catch((error) => {
                    console.error(error)
                })
                .finally()

            // get Flow Diagram
            post(`${properties.ORDER_API}/flow/${childOrder?.orderNo}`)
                .then((resp) => {
                    if (resp.data) {
                        setOrderWorkflow({ ...resp.data, source: 'ORDER' });
                    }
                })
                .catch(error => console.error(error))
                .finally()

            //get Appointment Details
            get(`${properties.APPOINTMENT_API}/order/${childOrder?.orderNo}`)
                .then((response) => {
                    if (response?.data) {
                        setAppointmentDetails(response?.data)
                    }
                })
                .catch((error) => {
                    console.error(error)
                })
                .finally()

        }


        // clearing previous value when changing product details
        unstable_batchedUpdates(() => {
            setIsFollowUpHistoryOpen(false)
            setIsWorkflowHistoryOpen(false)
        })

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [childOrder, childOrder?.currEntity?.unitId])

    useEffect(() => {

        get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam=TICKET_SOURCE,TICKET_PRIORITY,ORD_STATUS_REASON').then((resp) => {
            if (resp.data) {
                setSourceLookup(resp.data['TICKET_SOURCE']);
                setPriorityLookup(resp.data['TICKET_PRIORITY']);
                setCancellationReasonLookup(resp.data['ORD_STATUS_REASON']);
            }
            else {
                toast.error("Error while fetching address details")
            }
        })
            .catch((error) => {
                console.error(error)
            })
            .finally()
    }, [])

    const handleOnCancel = () => {
        if (!cancellationReason) {
            toast.error('Cancellation Reason is Mandatory')
            return
        }
        const payload = {
            cancelReason: cancellationReason
        }

        put(`${properties.ORDER_API}/cancel/${childOrder?.orderNo}`, payload)
            .then((response) => {
                toast.success(`${response.message}`);
                setIsCancelOpen(false);
                initialize();
            })
            .catch((error) => {
                console.error(error)
            })
            .finally()
    }

    const handleOnAssignToSelf = (types) => {

        let childOrderIds = []
        childOrderWithDeptRole.forEach((e) => {
            if ((e?.currUser?.userId !== auth?.user?.userId || !e.currUser) && e?.currEntity?.unitId === auth?.currDeptId && e?.currRole?.roleId === auth?.currRoleId && (e?.orderStatus?.code && !["CLS", "CNCLED"].includes(e?.orderStatus?.code))) {
                childOrderIds.push({
                    orderNo: e.orderNo,
                    type: types
                })
            }
        })

        put(`${properties.ORDER_API}/assignSelf`, { "order": childOrderIds })
            .then((response) => {
                toast.success(`${response.message}`);
                initialize();
            })
            .catch((error) => {
                console.error(error)
            })
            .finally()
    }

    const handleOnAddFollowup = (e) => {
        e.preventDefault();
        const { priority, source, remarks } = followupInputs;
        if (!priority || !source || !remarks) {
            toast.error('Please provide mandatory fields')
            return
        }
        let payload = {
            priorityCode: priority,
            source,
            remarks,
            orderNo: childOrder?.orderNo,
        }

        post(`${properties.ORDER_API}/followUp`, { ...payload })
            .then((response) => {
                if (response?.status === 200) {
                    toast.success("Follow Up Created Successfully");
                    setIsFollowupOpen(false);
                    setFollowupInputs({
                        priority: "",
                        source: "",
                        remarks: ""
                    })
                    initialize();
                }
            })
            .catch((error) => {
                console.error(error)
            })
            .finally()
    }

    const handleOnFollowupInputsChange = (e) => {
        const { target } = e;
        setFollowupInputs({
            ...followupInputs,
            [target.id]: target.value
        })
    }

    const handleOnReAssignToSelf = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: `Confirm Re-Assign To Self`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: `Yes, Submit it!`,
            allowOutsideClick: false
        }).then((result) => {
            if (result.isConfirmed) {
                handleOnAssignToSelf("REASSIGN")
            }
        }).catch(error => console.log(error))
    }

    const handleOnReAssignInputsChange = (e) => {
        const { target } = e;
        setReAssignInputs({
            userId: target.value
        })
    }

    const handleOnReAssign = (e) => {
        e.preventDefault();
        const { userId } = reAssignInputs;
        let payload = {
            userId: userId,
            roleId: interactionData?.currRole?.roleId,
            departmentId: interactionData?.currEntity?.unitId,
            status: "REASSIGNED",
            remarks: "Reassigned to User"
        }
        if (!userId) {
            toast.error('User is Mandatory')
            return
        }

        put(`${properties.ORDER_API}/edit/${childOrder?.orderNo}`, { ...payload })
            .then((response) => {
                toast.success(`${response.message}`);
                setIsReAssignOpen(false);
                initialize();
            })
            .catch((error) => {
                console.error(error)
            })
            .finally()
    }

    const handleStatusChange = (e) => {
        let entity = []
        handleOnTicketDetailsInputsChange(e)
        // eslint-disable-next-line array-callback-return
        workflowLookup && workflowLookup.entities.map((unit) => {
            for (const property in unit.status) {
                if (unit.status[property].code === e.target.value) {
                    entity.push(unit)
                    break
                }
            }
        })
        setRoleLookup(entity)
    }

    useEffect(() => {
        if (interactionInputs.assignRole !== "") {
            getUsersBasedOnRole();
        }
        else {
            setUserLookup([]);
        }
        if (isReAssignOpen) {
            getUsersBasedOnRole('RE-ASSIGN');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [interactionInputs.assignRole, isReAssignOpen])

    const getUsersBasedOnRole = (source = undefined) => {
        const data = source ? {
            roleId: interactionData?.currRole?.roleId,
            deptId: interactionData?.currEntity?.unitId
        } : {
            roleId: interactionInputs.assignRole,
            deptId: interactionInputs.assignDept
        }

        get(`${properties.USER_API}/by-role?roleId=${data.roleId}&deptId=${data.deptId}`)
            .then((userResponse) => {
                const { data } = userResponse;
                if (source) {
                    setReAssignUserLookup(data.filter((x) => x.userId !== interactionData?.currentUser?.code));
                }
                else {
                    setUserLookup(data);
                    if (isRoleChangedByUserRef.current) {
                        if (data.length === 1) {
                            setInteractionInputs({
                                ...interactionInputs,
                                user: data[0].userId,
                            })
                        }
                    }
                }
            }).catch(error => console.log(error))
            .finally()
    }

    useEffect(() => {

        if (interactionData?.customerDetails?.customerUuid) {

            get(`${properties.ORDER_API}/get-customer-history-count/${interactionData?.customerDetails?.customerUuid}`)
                .then((response) => {
                    if (response?.data && response?.data) {
                        setOrderCountHistory(response?.data)
                    }
                })
                .catch((error) => {
                    console.error(error)
                })
                .finally()

            // get schedule contract
            get(`${properties.CONTRACT_API}/get-scheduled-contracts/${interactionData?.customerDetails?.customerUuid}`)
                .then((response) => {
                    if (response?.data && response?.data) {
                        setScheduleContract(response?.data)
                    }
                })
                .catch((error) => {
                    console.error(error)
                })
                .finally()
        }

    }, [interactionData])

    const getTaskData = async (orderUuid, productId, deptId, roleId, masterOrder, childOrders) => {
        let assignRole = !!childOrders?.currRole?.roleId ? parseInt(childOrders?.currRole?.roleId) : "";
        let assignDept = !!childOrders?.currEntity?.unitId ? childOrders?.currEntity?.unitId : "";
        let user = !!childOrders?.currUser?.userId ? parseInt(childOrders?.currUser?.userId) : "";

        const filteredData = masterOrder?.childOrder.filter(item =>
            item.currEntity?.unitId === deptId && Number(item.currRole?.roleId) === Number(roleId)
        )

        grantPermissions(assignRole, user, childOrders?.orderStatus?.code, assignDept);

        // setWorkflowAuthData({
        //     deptId,
        //     roleId
        // })
        console.log('childOrderschildOrderschildOrderschildOrders', childOrders)
        unstable_batchedUpdates(() => {
            setChildOrderWithDeptRole(filteredData);
            setChildOrder(childOrders)
        })

        get(`${properties.WORKFLOW_DEFN_API}/task-details?entityId=${orderUuid}&entity=ORDER`)
            .then((responseWorkflowTaskDetailsData) => {
                if (responseWorkflowTaskDetailsData?.code === '201') {
                    setTaskDetails([]);
                    return
                }
                if (responseWorkflowTaskDetailsData.data) {
                    post(`${properties.PRODUCT_API}/get-task-product-map`, [productId])
                        .then((responseData) => {
                            if (responseData.data) {

                                const taskIdsFromProductTaskMap = _.map(responseData.data, task => task.task_id);
                                const taskFromWorkflow = _.flatMap(responseWorkflowTaskDetailsData.data.entities, (item) => item.task)
                                let tasks = taskFromWorkflow.filter((ele) => {
                                    return taskIdsFromProductTaskMap.includes(ele.taskId)
                                })
                                const uniqueTasks = _.uniqBy(tasks, 'taskId');
                                setTaskDetails(uniqueTasks)
                            }
                        }).catch(error => console.log(error))
                    post(`${properties.ORDER_API}/flow/${childOrders?.orderNo}`)
                        .then((resp) => {
                            if (resp.data) {
                                setOrderWorkflow({ ...resp.data, source: 'ORDER' });
                            }
                        })
                        .catch(error => console.error(error))
                        .finally(() => console.log())

                }
            }).catch((err) => {
                console.error(err)
                if (err.message === 'There not Workflow transaction wait for Manual Action') {
                    setTaskDetails([]);
                }
            })
    }

    /* Get Order Last Order remark - start */

    const getOrderLastRemark = (data) => {
        if (data && Array.isArray(data) && data.length > 0) {
            const filteredData = data.filter((d) => {
                if (!['ORDER_FOLLOWUP', 'ODR_ASSIGN_TO_SELF', 'ORDER_REASSIGN'].includes(d.orderFlow.code)) {
                    return true
                }
                return false
            })
            const sortedObject = _.orderBy(filteredData, [(obj) => new Date(obj.createdAt)], ['desc']) || []
            if (sortedObject.length > 0) {
                setLastOrderRemark(sortedObject[0].remarks)
            }
        }
    }

    useEffect(() => {
        if (workflowHistory?.rows?.length > 0) {
            getOrderLastRemark(workflowHistory?.rows)
        }
    }, [workflowHistory, workflowHistory?.rows])
    /* Get Order Last Order remark - END */

    const initialize = async () => {

        isRoleChangedByUserRef.current = false;
        const orderNo = props?.location?.state?.data?.rowData ? props?.location?.state?.data?.rowData?.orderNo : props?.location?.state?.data?.orderNo;
        post(`${properties.ORDER_API}/search?limit=10&page=0`, { searchParams: { orderNo } })
            .then((response) => {
                if (response?.data?.row && response?.data?.row.length > 0) {
                    setInteractionData(response?.data?.row[0]);
                    // console.log('response?.data?.row[0]===', response?.data?.row[0])
                    setCustomerDetails(response?.data?.row[0].customerDetails)
                    // let assignRole = !!response?.data?.row[0]?.currRole?.roleId ? parseInt(response?.data?.row[0]?.currRole?.roleId) : "";
                    // let assignDept = !!response?.data?.row[0]?.currEntity?.unitId ? response?.data?.row[0]?.currEntity?.unitId : "";
                    // let user = !!response?.data?.row[0]?.currUser?.userId ? parseInt(response?.data?.row[0]?.currUser?.userId) : "";
                    // grantPermissions(assignRole, user, response?.data?.row[0]?.orderStatus?.code, assignDept);
                    // child order products need to populated here, interactionData?.orderProductDetails
                    let orderDetails = response?.data?.row[0];
                    let orderProductDetails = [];
                    if (orderDetails.childOrder.length > 0) {

                        orderDetails.childOrder.forEach(childOrder => {
                            const childOrderId = childOrder.orderUuid;
                            const deptId = childOrder.currEntity?.unitId;
                            const roleId = childOrder.currRole?.roleId;
                            childOrder.orderProductDetails.forEach(productDetail => {
                                orderProductDetails.push({ ...productDetail, childOrderUuId: childOrderId, deptId, roleId, childOrder });
                            });
                        });
                    } else {
                        orderProductDetails.push(orderDetails.orderProductDetails);
                    }

                    getTaskData(
                        response?.data?.row[0]?.childOrder[0]?.orderUuid,
                        orderProductDetails[0]?.productId,
                        response?.data?.row[0]?.childOrder[0]?.currEntity?.unitId,
                        response?.data?.row[0]?.childOrder[0]?.currRole?.roleId,
                        response?.data?.row[0],
                        response?.data?.row[0]?.childOrder[0]
                    );

                    setOrderedProductDetails(orderProductDetails);
                    if (orderProductDetails.length > 1) {
                        setSelectedProduct(orderProductDetails[0])
                    }

                }

            })
            .catch((error) => {
                console.error(error)
            })
            .finally()
    }

    useEffect(() => {
        initialize();
    }, [])


    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setProductPopup(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);


    const handleOnTicketDetailsInputsChange = (e) => {
        const { target } = e
        if (target.id === 'assignRole') {
            const { unitId = "" } = target.value !== "" && JSON.parse(target.options[target.selectedIndex].dataset.entity)
            setInteractionInputs({
                ...interactionInputs,
                [target.id]: target.value,
                assignDept: unitId,
            })
            isRoleChangedByUserRef.current = true;
        } else {
            setInteractionInputs({
                ...interactionInputs,
                [target.id]: target.value
            })
        }
        setError({
            ...error,
            [target.id]: ""
        })
    }

    const validate = (section, schema, data) => {
        try {
            if (section === 'DETAILS') {
                setError({})
            }
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                if (section === 'DETAILS') {
                    setError((prevState) => {
                        return { ...prevState, [err.params.path]: err.message };
                    });
                }
            });
            return e;
        }
    };

    const checkTicketDetails = () => {
        let error = validate('DETAILS', ticketDetailsValidationSchema, interactionInputs);
        if (error) {
            toast.error("Validation errors found. Please check highlighted fields");
            return false;
        }
        return true;
    }

    const grantPermissions = (assignedRole, assignedUserId, status, assignedDept) => {
        const fromHelpDesk = false
        const helpDeskView = 'QUEUE'
        if (fromHelpDesk && helpDeskView === 'QUEUE') {
            setPermissions({
                assignToSlef: false,
                followup: false,
                readOnly: true,
                reAssign: false,
                displayOnly: true
            })
        } else if (["CLS", "CNCLED"].includes(status)) {
            setPermissions({
                assignToSlef: false,
                followup: false,
                readOnly: true,
                reAssign: false,
                displayOnly: true
            })
        }
        else {
            const { user, currRoleId, currDeptId } = auth;
            if (Number(assignedRole) === Number(currRoleId) && assignedDept === currDeptId) {
                if (assignedUserId !== "") {
                    if (Number(assignedUserId) === Number(user.userId)) {
                        setPermissions({
                            assignToSlef: false,
                            followup: false,
                            readOnly: false,
                            reAssign: true,
                            displayOnly: true
                        })
                    }
                    else {
                        setPermissions({
                            assignToSlef: false,
                            followup: true,
                            readOnly: true,
                            reAssign: false,
                            displayOnly: true
                        })
                    }
                }
                else {
                    setPermissions({
                        assignToSlef: true,
                        followup: true,
                        readOnly: true,
                        reAssign: false,
                        displayOnly: true
                    })
                }
            }
            else {
                if (assignedUserId !== "") {
                    setPermissions({
                        assignToSlef: false,
                        followup: true,
                        readOnly: true,
                        reAssign: false,
                        displayOnly: true
                    })
                }
                else {
                    setPermissions({
                        assignToSlef: false,
                        followup: true,
                        readOnly: true,
                        reAssign: false,
                        displayOnly: true
                    })
                }
            }
        }
    }

    const handleTicketDetailsSubmit = (e) => {
        e.preventDefault();
        if (checkTicketDetails()) {
            let reqBody = {
                roleId: Number(interactionInputs?.assignRole),
                departmentId: interactionInputs?.assignDept,
                status: interactionInputs?.currStatus
                // ,task: selectedTask || []
            }

            if (interactionInputs?.user) {
                reqBody.userId = Number(interactionInputs?.user)
            }
            if (interactionInputs?.remarks) {
                reqBody.remarks = interactionInputs?.remarks
            }

            put(properties.ORDER_API + '/edit/' + childOrder.orderNo, { ...reqBody })
                .then((response) => {
                    toast.success(`${response?.message}`);
                    props.history.push(`${process.env.REACT_APP_BASE}/`);
                })
                .catch((error) => {
                    console.error(error);
                    toast.error(error);
                })
                .finally()
        }
    }

    const recentActivitySettings = {
        dots: true,
        infinite: true,
        arrows: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 0,
        autoplay: false,
        autoplaySpeed: 10000,
        adaptiveHeight: true,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: false
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    initialSlide: 1
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ],
        // beforeChange: (currentSlide, nextSlide) => {
        //     if (timer) {
        //         clearTimeout(timer);
        //     }
        //     setTimer(setTimeout(() => {
        //         const data = orderedProductDetails[currentSlide];
        //         console.log('slide data------->', data)
        //         // trigger API call here
        //         get--Task--Data(data?.childOrderUuId, data?.productId, data.deptId, data.roleId);
        //     }, 10000)); // set to 0.5 seconds delay before API call
        // }
    };

    const billingSliderSettings = {
        dots: false,
        infinite: true,
        arrows: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 3,
        initialSlide: 0,
        autoplay: false,
        autoplaySpeed: 10000,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: false
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    initialSlide: 1
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ],
    }

    const handleAfterChange = (index, data) => {
        data = orderedProductDetails[index];
        setSelectedProduct(data)
        getTaskData(data?.childOrderUuId, data?.productId, data?.deptId, data?.roleId, interactionData, data?.childOrder)
    };

    const handleTaskStatusChange = (taskOptions, value, taskId) => {
        let obj = {
            taskId, type: value.Type, value: value.value
        }
        const index = selectedTask.findIndex((ele) => ele.taskId === taskId)
        if (index !== -1) {
            selectedTask[index] = obj
        } else {
            selectedTask.push(obj)
        }
        setSelectedTask([...selectedTask])
        // const hasPositive = _.every(selectedTask, { 'type': 'positive' });
    }

    const handleCellRender = (cell, row) => {
        if (cell.column.id === "createdAt") {
            return (<span>{moment(row.original?.oCreatedAt).format('DD-MM-YYYY HH:mm:ss a')}</span>)
        } else {
            return (<span>{cell.value}</span>)
        }
    }

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const handleOrderModal = (status) => {
        unstable_batchedUpdates(() => {
            setOrderStatusType(status)
            setIsOrderListOpen(!isOrderListOpen)
            setCurrentPage(0)
            setPerPage(10)
            setTotalCount(0)
        })
    }

    const handleOnModelClose = () => {
        setIsOrderListOpen(false)
        setOrderStatusType('')
    }

    const getCustomerOrderDetails = useCallback((status) => {
        try {
            if (interactionData?.customerDetails?.customerUuid && status) {

                get(`${properties.ORDER_API}/get-customer-history/${interactionData?.customerDetails?.customerUuid}?limit=${perPage}&page=${currentPage}${status ? `&status=${status}` : ''}`)
                    .then((response) => {
                        if (response?.data) {
                            setOrderCustomerHistoryDetails(response?.data?.rows)
                            setTotalCount(response?.data?.count)
                        }
                    })
                    .catch((error) => {
                        console.error(error)
                    })
                    .finally()
            }
        } catch (error) {
            console.error(error)
        }
    }, [currentPage, perPage])

    useEffect(() => {
        getCustomerOrderDetails(orderStatusType)
    }, [currentPage, getCustomerOrderDetails, orderStatusType, perPage])

    const convertBase64ToFile = (base64String, fileName) => {
        let arr = base64String.split(',');
        let mime = arr[0].match(/:(.*?);/)[1];
        let bstr = atob(arr[1]);
        let n = bstr.length;
        let uint8Array = new Uint8Array(n);
        while (n--) {
            uint8Array[n] = bstr.charCodeAt(n);
        }
        let file = new File([uint8Array], fileName, { type: mime });
        return file;
    }

    const handleAgreementDownload = (base64String, fileName) => {
        let file = convertBase64ToFile(base64String, fileName);
        saveAs(file, fileName);
    }

    const samplebase64 = 'data:application/pdf;base64,JVBERi0xLjMNCiXi48/TDQoNCjEgMCBvYmoNCjw8DQovVHlwZSAvQ2F0YWxvZw0KL091dGxpbmVzIDIgMCBSDQovUGFnZXMgMyAwIFINCj4+DQplbmRvYmoNCg0KMiAwIG9iag0KPDwNCi9UeXBlIC9PdXRsaW5lcw0KL0NvdW50IDANCj4+DQplbmRvYmoNCg0KMyAwIG9iag0KPDwNCi9UeXBlIC9QYWdlcw0KL0NvdW50IDINCi9LaWRzIFsgNCAwIFIgNiAwIFIgXSANCj4+DQplbmRvYmoNCg0KNCAwIG9iag0KPDwNCi9UeXBlIC9QYWdlDQovUGFyZW50IDMgMCBSDQovUmVzb3VyY2VzIDw8DQovRm9udCA8PA0KL0YxIDkgMCBSIA0KPj4NCi9Qcm9jU2V0IDggMCBSDQo+Pg0KL01lZGlhQm94IFswIDAgNjEyLjAwMDAgNzkyLjAwMDBdDQovQ29udGVudHMgNSAwIFINCj4+DQplbmRvYmoNCg0KNSAwIG9iag0KPDwgL0xlbmd0aCAxMDc0ID4+DQpzdHJlYW0NCjIgSg0KQlQNCjAgMCAwIHJnDQovRjEgMDAyNyBUZg0KNTcuMzc1MCA3MjIuMjgwMCBUZA0KKCBBIFNpbXBsZSBQREYgRmlsZSApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDY4OC42MDgwIFRkDQooIFRoaXMgaXMgYSBzbWFsbCBkZW1vbnN0cmF0aW9uIC5wZGYgZmlsZSAtICkgVGoNCkVUDQpCVA0KL0YxIDAwMTAgVGYNCjY5LjI1MDAgNjY0LjcwNDAgVGQNCigganVzdCBmb3IgdXNlIGluIHRoZSBWaXJ0dWFsIE1lY2hhbmljcyB0dXRvcmlhbHMuIE1vcmUgdGV4dC4gQW5kIG1vcmUgKSBUag0KRVQNCkJUDQovRjEgMDAxMCBUZg0KNjkuMjUwMCA2NTIuNzUyMCBUZA0KKCB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDYyOC44NDgwIFRkDQooIEFuZCBtb3JlIHRleHQuIEFuZCBtb3JlIHRleHQuIEFuZCBtb3JlIHRleHQuIEFuZCBtb3JlIHRleHQuIEFuZCBtb3JlICkgVGoNCkVUDQpCVA0KL0YxIDAwMTAgVGYNCjY5LjI1MDAgNjE2Ljg5NjAgVGQNCiggdGV4dC4gQW5kIG1vcmUgdGV4dC4gQm9yaW5nLCB6enp6ei4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kICkgVGoNCkVUDQpCVA0KL0YxIDAwMTAgVGYNCjY5LjI1MDAgNjA0Ljk0NDAgVGQNCiggbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDU5Mi45OTIwIFRkDQooIEFuZCBtb3JlIHRleHQuIEFuZCBtb3JlIHRleHQuICkgVGoNCkVUDQpCVA0KL0YxIDAwMTAgVGYNCjY5LjI1MDAgNTY5LjA4ODAgVGQNCiggQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgKSBUag0KRVQNCkJUDQovRjEgMDAxMCBUZg0KNjkuMjUwMCA1NTcuMTM2MCBUZA0KKCB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBFdmVuIG1vcmUuIENvbnRpbnVlZCBvbiBwYWdlIDIgLi4uKSBUag0KRVQNCmVuZHN0cmVhbQ0KZW5kb2JqDQoNCjYgMCBvYmoNCjw8DQovVHlwZSAvUGFnZQ0KL1BhcmVudCAzIDAgUg0KL1Jlc291cmNlcyA8PA0KL0ZvbnQgPDwNCi9GMSA5IDAgUiANCj4+DQovUHJvY1NldCA4IDAgUg0KPj4NCi9NZWRpYUJveCBbMCAwIDYxMi4wMDAwIDc5Mi4wMDAwXQ0KL0NvbnRlbnRzIDcgMCBSDQo+Pg0KZW5kb2JqDQoNCjcgMCBvYmoNCjw8IC9MZW5ndGggNjc2ID4+DQpzdHJlYW0NCjIgSg0KQlQNCjAgMCAwIHJnDQovRjEgMDAyNyBUZg0KNTcuMzc1MCA3MjIuMjgwMCBUZA0KKCBTaW1wbGUgUERGIEZpbGUgMiApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDY4OC42MDgwIFRkDQooIC4uLmNvbnRpbnVlZCBmcm9tIHBhZ2UgMS4gWWV0IG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gKSBUag0KRVQNCkJUDQovRjEgMDAxMCBUZg0KNjkuMjUwMCA2NzYuNjU2MCBUZA0KKCBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDY2NC43MDQwIFRkDQooIHRleHQuIE9oLCBob3cgYm9yaW5nIHR5cGluZyB0aGlzIHN0dWZmLiBCdXQgbm90IGFzIGJvcmluZyBhcyB3YXRjaGluZyApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDY1Mi43NTIwIFRkDQooIHBhaW50IGRyeS4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gKSBUag0KRVQNCkJUDQovRjEgMDAxMCBUZg0KNjkuMjUwMCA2NDAuODAwMCBUZA0KKCBCb3JpbmcuICBNb3JlLCBhIGxpdHRsZSBtb3JlIHRleHQuIFRoZSBlbmQsIGFuZCBqdXN0IGFzIHdlbGwuICkgVGoNCkVUDQplbmRzdHJlYW0NCmVuZG9iag0KDQo4IDAgb2JqDQpbL1BERiAvVGV4dF0NCmVuZG9iag0KDQo5IDAgb2JqDQo8PA0KL1R5cGUgL0ZvbnQNCi9TdWJ0eXBlIC9UeXBlMQ0KL05hbWUgL0YxDQovQmFzZUZvbnQgL0hlbHZldGljYQ0KL0VuY29kaW5nIC9XaW5BbnNpRW5jb2RpbmcNCj4+DQplbmRvYmoNCg0KMTAgMCBvYmoNCjw8DQovQ3JlYXRvciAoUmF2ZSBcKGh0dHA6Ly93d3cubmV2cm9uYS5jb20vcmF2ZVwpKQ0KL1Byb2R1Y2VyIChOZXZyb25hIERlc2lnbnMpDQovQ3JlYXRpb25EYXRlIChEOjIwMDYwMzAxMDcyODI2KQ0KPj4NCmVuZG9iag0KDQp4cmVmDQowIDExDQowMDAwMDAwMDAwIDY1NTM1IGYNCjAwMDAwMDAwMTkgMDAwMDAgbg0KMDAwMDAwMDA5MyAwMDAwMCBuDQowMDAwMDAwMTQ3IDAwMDAwIG4NCjAwMDAwMDAyMjIgMDAwMDAgbg0KMDAwMDAwMDM5MCAwMDAwMCBuDQowMDAwMDAxNTIyIDAwMDAwIG4NCjAwMDAwMDE2OTAgMDAwMDAgbg0KMDAwMDAwMjQyMyAwMDAwMCBuDQowMDAwMDAyNDU2IDAwMDAwIG4NCjAwMDAwMDI1NzQgMDAwMDAgbg0KDQp0cmFpbGVyDQo8PA0KL1NpemUgMTENCi9Sb290IDEgMCBSDQovSW5mbyAxMCAwIFINCj4+DQoNCnN0YXJ0eHJlZg0KMjcxNA0KJSVFT0YNCg=='

    const [sliderDetails, setSliderDetails] = useState({})

    const handleSlidlerChange = (index, data) => {
        data = scheduleContract.rows?.[0]?.billing[index];
        console.log(data)
        setSliderDetails(data)
    }

    return (
        <div className="cnt-wrapper">
            {/* <div className="top-breadcrumb cmmn-skeleton">
                <div className="lft-skel">
                    <ul>
                        <li><a href="javascript" onClick={() => props.history.push(`${process.env.REACT_APP_BASE}/`)}><i className="material-icons">arrow_back</i>Back</a></li>
                        <li>Order Details - {interactionData?.orderNo}</li>
                    </ul>
                </div>
                
            </div> */}
            <div className="mt-2">
                <div className="rht-skel">
                    {
                        !["CLS", "CNCLED"].includes(childOrder?.orderStatus?.code) &&
                        <>
                            {/* <button className="skel-btn-cancel" data-target="#cancelModal" data-toggle="modal" onClick={() => setIsCancelOpen(true)}>Cancel Order</button> */}
                            {/* <button className="skel-btn-submit " onClick="window.location.href='edit-interaction.html'">Edit</button> */}
                            {
                                permissions.readOnly && auth.currDeptId === childOrder?.currEntity?.unitId && Number(auth.currRoleId) === Number(childOrder?.currRole?.roleId) && childOrder?.currUser?.userId &&
                                <button className="skel-btn-submit " data-target="#reassignModal" data-toggle="modal" onClick={handleOnReAssignToSelf}>Re-Assign to Self</button>
                            }

                            <button className={`skel-btn-submit ${(!permissions.assignToSlef) && 'd-none'}`} onClick={() => handleOnAssignToSelf("SELF")}>Assign To Self</button>

                            <button className={`skel-btn-submit ${(!permissions.reAssign) && 'd-none'}`} onClick={() => setIsReAssignOpen(true)} >Re-Assign</button>
                            {/* <button className={`skel-btn-submit  ${(!permissions.followup) && 'd-none'}`} onClick={() => setIsFollowupOpen(true)} data-target="#followupModal" data-toggle="modal">Add Followup</button> */}
                        </>
                    }
                    {/* <a className="skel-btn-submit " data-target="#skel-view-modal-workflow" data-toggle="modal" onClick={() => setIsWorkflowHistoryOpen(true)}>Workflow History</a> */}

                </div>
                <div className="container-fluid pl-0 pr-0">
                    <div className="form-row">
                        <div className="col-lg-6 col-md-12 col-xs-12">
                            <div className="skel-view-base-card">
                                <div className="skel-profile-base">
                                    {/* <img src={profileLogo} alt="" className="img-fluid" width="50" height="50" /> */}
                                    <div className="skel-profile-info">
                                        {customerDetails && <CustomerDetailsFormViewMin data={{
                                            customerData: customerDetails,
                                            hideAccSerInt: true,
                                            source: 'ORDER'
                                        }} handler={{ setCustomerDetails }} />}
                                        {/* <span className="skel-profile-name">{interactionData?.customerDetails?.firstName || ""} {interactionData?.customerDetails?.lastName || ""}</span>
                                        <span><a >{interactionData?.customerDetails?.customerContact[0]?.emailId || ""}</a></span>
                                        <span>+ {interactionData?.customerDetails?.customerContact[0]?.mobilePrefix || ""} {interactionData?.customerDetails?.customerContact[0]?.mobileNo || ""}</span>
                                        <p className="mt-1">
                                            <span className="skel-business">{interactionData?.customerDetails?.customerCategory?.description || ""}</span>
                                            <span className="skel-active">{interactionData?.customerDetails?.status?.description || ""}</span>
                                        </p> */}
                                    </div>
                                </div>
                                <hr className="cmmn-hline mt-2 mb-2" />
                                <div className="skel-inter-view-history">
                                    <span className="skel-header-title">Orders</span>
                                    <div className="skel-tot-inter">
                                        <div className="skel-tot">
                                            Total<span><a data-toggle="modal" data-target="#skel-view-modal-interactions" onClick={() => { handleOrderModal('TOTAL') }}>{orderCountHistory?.totalOrderCount}</a></span>
                                        </div>
                                        <div className="skel-tot">
                                            Open<span><a data-toggle="modal" data-target="#skel-view-modal-interactions" onClick={() => { handleOrderModal('OPEN') }}>{orderCountHistory?.openOrderCount}</a></span>
                                        </div>
                                        <div className="skel-tot">
                                            Closed<span><a data-toggle="modal" data-target="#skel-view-modal-interactions" onClick={() => { handleOrderModal('CLOSED') }}>{orderCountHistory?.closedOrderCount}</a></span>
                                        </div>
                                    </div>
                                </div>
                                <img src={vImp} alt="" className="img-fluid skel-place-img" />
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-12 col-xs-12">
                            <div className="skel-view-base-card">
                                <span className="skel-profile-heading">Order workflow</span>
                                <div className="skel-ai-sect">
                                    <OrderJourney data={orderWorkflow} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="col-lg-6 col-md-12 col-xs-12">
                            <div className="skel-view-base-card">
                                <span className="skel-profile-heading">Order Details - {props?.location?.state?.data?.rowData ? props?.location?.state?.data?.rowData?.orderNo : props?.location?.state?.data?.orderNo}</span>
                                <div className="skel-inter-statement skel-order-statement mh-250-scrll">

                                    {/* <p className="mt-2">
                                        <span className="skel-lbl-flds">Statement</span>
                                        <span>{interactionData?.orderDescription}</span>
                                    </p> */}


                                    <div className='view-int-details-key mt-2'>
                                        <p><span className='skel-lbl-f-sm'>Category</span> <span>:</span><span>{childOrder?.orderCategory?.description}</span></p>
                                        <p><span className='skel-lbl-f-sm'>Family</span> <span>:</span><span>{childOrder?.orderFamily?.description}</span></p>
                                        <p><span className='skel-lbl-f-sm'>Type</span> <span>:</span><span>{childOrder?.orderType?.description}</span></p>


                                        <p><span className='skel-lbl-f-sm'>Channel</span> <span>:</span><span>{childOrder?.orderChannel?.description}</span></p>

                                        <p><span className='skel-lbl-f-sm'>Source</span> <span>:</span><span>{childOrder?.orderSource?.description}</span></p>
                                        <p><span className='skel-lbl-f-sm'>Mode</span> <span>:</span><span>{childOrder?.orderMode?.description}</span></p>
                                        {/* <p><span className='skel-lbl-f-sm'>Cause</span> <span>:</span><span>{childOrder?.orderCause?.description}</span></p> */}
                                        <p><span className='skel-lbl-f-sm'>Priority</span> <span>:</span><span className='txt-r-color'>{childOrder?.orderPriority?.description}</span></p>

                                        <p><span className='skel-lbl-f-sm'>Status</span> <span>:</span><span>{childOrder?.orderStatus?.description}</span></p>
                                    </div>


                                    {/* <div className="skel-inter-st-types">
                                        <ul> */}
                                    {/* Master order details */}
                                    {/* <li>Order Category : {interactionData?.orderCategory?.description}</li>
                                            <li>Order Cause : {interactionData?.orderCause?.description}</li>
                                            <li>Order Channel : {interactionData?.orderChannel?.description}</li>
                                            <li>Order Family : {interactionData?.orderFamily?.description}</li>
                                            <li>Order Mode : {interactionData?.orderMode?.description}</li>
                                            <li>Order Priority : {interactionData?.orderPriority?.description}</li>
                                            <li>Order Source : {interactionData?.orderSource?.description}</li>
                                            <li>Order Status : {interactionData?.orderStatus?.description}</li>
                                            <li>Order Type : {interactionData?.orderType?.description}</li> */}

                                    {/* <li>Order Category : {childOrder?.orderCategory?.description}</li>
                                            <li>Order Cause : {childOrder?.orderCause?.description}</li>
                                            <li>Order Channel : {childOrder?.orderChannel?.description}</li>
                                            <li>Order Family : {childOrder?.orderFamily?.description}</li>
                                            <li>Order Mode : {childOrder?.orderMode?.description}</li>
                                            <li>Order Priority : {childOrder?.orderPriority?.description}</li>
                                            <li>Order Source : {childOrder?.orderSource?.description}</li>
                                            <li>Order Status : {childOrder?.orderStatus?.description}</li>
                                            <li>Order Type : {childOrder?.orderType?.description}</li>

                                        </ul> */}
                                    {/* <a className="skel-wf-history-lnk" data-target="#skel-view-modal-workflow" data-toggle="modal" onClick={() => setIsWorkflowHistoryOpen(true)}>Workflow History</a> */}
                                    {/* </div> */}
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-12 col-xs-12">
                            <div className="skel-view-base-card">
                                <span className="skel-profile-heading">Order Product Details - {`(${orderedProductDetails?.length || 0})`}

                                    <div ref={wrapperRef}>
                                        <a className="skel-sm-popup-view"><i className="material-icons" onClick={() => { setProductPopup(!productPopup) }}>more_horiz</i></a>
                                        {productPopup &&
                                            <ul className="skel-ul-data">
                                                {
                                                    !["CLS", "CNCLED"].includes(childOrder?.orderStatus?.code) &&
                                                    <>
                                                        <li><a onClick={() => setIsCancelOpen(true)}><i className="fa fa-times" aria-hidden="true"></i> Cancel Order</a></li>
                                                        <li><a onClick={() => setIsFollowupOpen(true)}><i className="fa fa-plus" aria-hidden="true"></i> Add Followup</a></li>

                                                    </>
                                                }
                                                {/* <li><a onClick={() => setIsWorkflowHistoryOpen(true)}><i className="fa fa-sitemap" ></i> Workflow History</a></li> */}
                                                <a data-target="#skel-view-modal-workflow" data-toggle="modal" onClick={() => setIsWorkflowHistoryOpen(true)}><i className="fa fa-sitemap" ></i>Workflow History</a>


                                                {/* <li><a ><i className="material-icons">edit</i> Edit</a></li>
                                                <li><a  data-toggle="modal" data-target="#view-right-modal"><i className="material-icons">visibility</i>
                                                    View</a></li>
                                                <li><a ><i className="material-icons">delete</i> Delete</a></li> */}
                                            </ul>
                                        }
                                    </div>
                                </span>
                                {
                                    orderedProductDetails && orderedProductDetails.length > 0 ?
                                        <Slider {...recentActivitySettings} className="px-0" afterChange={handleAfterChange}>
                                            {
                                                orderedProductDetails.map((val, idx) => (
                                                    <div key={idx} className="skel-wrk-ord-summ mt-2" data-Modal={val}>
                                                        <div className='skel-heading'>Product Name: {val?.productDetails?.productName || ""}</div>
                                                        <div className="skel-wrk-ord-graph skel-ord-prdt-name mt-4">
                                                            <div className="pieID pie">
                                                                <img src={val?.productDetails?.productImage} alt="ProductImage" srcSet="" className='skel-prdt-cust-size' />
                                                            </div>
                                                            <div className='view-int-details-key ml-2'>

                                                                <p><span className='skel-lbl-f-sm'>Product Type</span> <span>:</span><span>{val?.productDetails?.productType?.description || ""}</span></p>
                                                                <p><span className='skel-lbl-f-sm'>Quantity</span> <span>:</span><span>{val?.productQuantity || 0}</span></p>
                                                                <p><span className='skel-lbl-f-sm'>Amount</span> <span>:</span><span>{val?.billAmount || 0}</span></p>
                                                                <p><span className='skel-lbl-f-sm'>Agreement</span> <span>:</span><span>{<PictureAsPdfIcon color='primary' style={{ cursor: 'pointer' }} onClick={() => { handleAgreementDownload(samplebase64, (val?.productDetails?.productName + '_agreement')) }} />}</span></p>
                                                            </div>
                                                            {/* <ul className="pieID legend">
                                                                <li>
                                                                    <span>Product Name: {val?.productDetails?.productName || ""}</span>
                                                                </li>
                                                                <li>
                                                                    
                                                                    <span>Product Type: {val?.productDetails?.productType?.description || ""}</span>
                                                                </li>
                                                                <li>
                                                                    <span>Quantity: {val?.productQuantity || 0}</span>
                                                                </li>
                                                                <li>
                                                                    
                                                                    <span>Amount: {val?.billAmount || 0}</span>
                                                                </li>
                                                               { <li>
                                                                    
                                                                    <span>Agreement:&nbsp; {<PictureAsPdfIcon color = 'primary' style={{cursor: 'pointer'}} onClick={()=> {handleAgreementDownload(samplebase64, (val?.productDetails?.productName+'_agreement'))}} />} </span>
                                                                </li>}
                                                            </ul> */}
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </Slider>
                                        :
                                        <span className="actv-list activity-cnt no-pro-found">No Products Available</span>
                                }
                            </div>
                        </div>

                    </div>
                    <div className="form-row">
                        <div className="col-lg-8 col-md-12 col-xs-12">
                            <div className='skel-schedule-payment-base'>
                                <div className="skel-view-base-card" >
                                    <div className="skel-inter-statement">
                                        <span className="skel-profile-heading">Scheduled Billing & Payment</span>
                                        {
                                            scheduleContract.rows && scheduleContract?.rows?.length > 0 ?
                                                <>
                                                    <Slider {...recentActivitySettings} className="px-0">
                                                        {
                                                            scheduleContract.rows?.map((val, idx) => (
                                                                <div key={idx} className="skel-wrk-ord-summ" data-Modal={val}>
                                                                    <p><span className="">Contract Name:</span> <span>{val?.contractName || ""}</span></p>
                                                                    <div className="skel-wrk-ord-graph">
                                                                        {/* <div className="pieID pie">
                                                                            <img src={val?.productDetails?.productImage} alt="ProductImage" srcSet="" className='skel-prdt-cust-size' />
                                                                        </div> */}

                                                                        <div className='skel-wiz-flow mt-2'>
                                                                            <Slider {...billingSliderSettings} afterChange={handleSlidlerChange}>
                                                                                {val && val?.billing && val.billing.map((b, i) => (
                                                                                    <>
                                                                                        <div className='skel-wiz-flow-base'>
                                                                                            <div className={b.paymentPaid ? 'skel-wiz-date skel-paid-status' : 'skel-wiz-date skel-upcoming-status'}>
                                                                                                <span><i className="fas fa-check-circle"></i></span> {moment(b?.startDate).format('DD MMM')} <br /> {moment(b?.startDate).format('YYYY')}
                                                                                            </div>
                                                                                            {/* <div className='skel-wiz-date skel-overdue-status'>
                                                                                                <span><i className="fas fa-times-circle"></i></span>
                                                                                                Apr 10<br />2023
                                                                                            </div>
                                                                                            <div className='skel-wiz-date skel-current-status'>
                                                                                                <span><i className="fas fa-check-circle"></i></span>
                                                                                                May 10<br />2023
                                                                                            </div>
                                                                                            <div className='skel-wiz-date skel-upcoming-status'>
                                                                                                <span><i className="fas fa-check-circle"></i></span>
                                                                                                June 10<br />2023
                                                                                            </div>
                                                                                            <div className='skel-wiz-date skel-upcoming-status'>
                                                                                                <span><i className="fas fa-check-circle"></i></span>
                                                                                                July 10<br />2023
                                                                                            </div> */}
                                                                                        </div>
                                                                                    </>
                                                                                ))}
                                                                            </Slider >
                                                                            <div className='skel-wiz-bill-details'>
                                                                                <div className='skel-wiz-bill-amt'>
                                                                                    <div className='skel-billing-schedule'>
                                                                                        <table>
                                                                                            <tr>
                                                                                                <td width="40%" className='skel-lbl-f-sm'>Billing Status</td>
                                                                                                <td width="10%">:</td>
                                                                                                <td>{sliderDetails?.status?.description || ""}</td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td width="40%" className='skel-lbl-f-sm'>Start Date</td>
                                                                                                <td width="10%">:</td>
                                                                                                <td>{sliderDetails?.startDate ? moment(sliderDetails?.startDate).format('DD-MM-YYYY') : ''}</td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td width="40%" className='skel-lbl-f-sm'>End Date</td>
                                                                                                <td width="10%">:</td>
                                                                                                <td>{sliderDetails?.endDate ? moment(sliderDetails?.endDate).format('DD-MM-YYYY') : ''}</td>
                                                                                            </tr>
                                                                                        </table>

                                                                                        <table>
                                                                                            <tr>
                                                                                                <td width="60%" className='skel-lbl-f-sm'>RC Amt</td>
                                                                                                <td width="10%">:</td>
                                                                                                <td width="30%">{(sliderDetails?.rcAmount ? Number(sliderDetails?.rcAmount) : 0).toFixed(2)}</td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td width="60%" className='skel-lbl-f-sm'>OTC Amt</td>
                                                                                                <td width="10%">:</td>
                                                                                                <td width="30%">{(sliderDetails?.otcAmount ? Number(sliderDetails?.otcAmount) : 0).toFixed(2)}</td>
                                                                                            </tr>
                                                                                            <tr className='skel-warn-sect'>
                                                                                                <td width="60%" className='skel-lbl-f-sm'>Overdue Amt</td>
                                                                                                <td width="10%">:</td>
                                                                                                <td width="30%">{0}</td>
                                                                                            </tr>
                                                                                            <tr className='sk-fnt-lg'>
                                                                                                <td width="60%" className='skel-lbl-f-sm'>Total Amt</td>
                                                                                                <td width="10%">:</td>
                                                                                                <td className='skel-lbl-f-sm' width="30%">{((sliderDetails?.rcAmount ? Number(sliderDetails?.rcAmount) : 0) + (sliderDetails?.otcAmount ? Number(sliderDetails?.otcAmount) : 0)).toFixed(2)}</td>
                                                                                            </tr>
                                                                                        </table>
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                        </div>


                                                                        {/* <ul className="pieID legend">
                                                                            <li>
                                                                                <span>Billing Status: {val?.statusDesc?.description || ""}</span>
                                                                            </li>
                                                                            <li>
                                                                                {/* - {val?.actualEndDate ? moment(val?.actualEndDate).format('DD-MM-YYYY')
                                                                                <span>Start Date: {val?.actualStartDate ? moment(val?.actualStartDate).format('DD-MM-YYYY') : ''}</span>
                                                                            </li>
                                                                            <li>
                                                                                {/* - {val?.actualEndDate ? moment(val?.actualEndDate).format('DD-MM-YYYY') 
                                                                                <span>End Date: {val?.actualEndDate ? moment(val?.actualEndDate).format('DD-MM-YYYY') : ''}</span>
                                                                            </li>
                                                                             <li>
                                                                                <em>RC Amount</em>
                                                                                <span>{!isNaN(val?.rcAmount) ? Number(val?.rcAmount).toFixed(2) : 0}</span>
                                                                            </li>
                                                                            <li>
                                                                                <em>OTC Amount</em>
                                                                                <span>{!isNaN(val?.otcAmount) ? Number(val?.otcAmount).toFixed(2) : 0}</span>
                                                                            </li>
                                                                        </ul> */}
                                                                    </div>
                                                                </div>
                                                            ))
                                                        }
                                                    </Slider>
                                                </> :
                                                <span className="skel-widget-warning">No Schedule Billing & Payment Found !!!</span>

                                        }

                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* <div className="col-md-4">
                            <div className="skel-view-base-card">
                                <div className="skel-inter-statement">
                                    <span className="skel-profile-heading">Scheduled Payment </span>
                                    {
                                        scheduleContract.rows && scheduleContract?.rows?.length > 0 ?
                                            <>
                                                <Slider {...recentActivitySettings} className="px-0">
                                                    {
                                                        scheduleContract.rows?.map((val, idx) => (
                                                            <div key={idx} className="skel-wrk-ord-summ" data-Modal={val}>
                                                                <p>Contract Name: {val?.contractName || ""}</p>
                                                                <div className="skel-wrk-ord-graph">
                                                                   
                                                                    <ul className="pieID legend">
                                                                        <li>
                                                                            <span>Payment Status: {val?.statusDesc?.description || ""}</span>
                                                                        </li>
                                                                        <li>
                                                                            - {val?.actualEndDate ? moment(val?.actualEndDate).format('DD-MM-YYYY')
                                                                            <span>Planned Date: {val?.actualStartDate ? moment(val?.actualStartDate).add(30, 'days').format('DD-MM-YYYY') : ''}</span>
                                                                        </li>
                                                                        <li>
                                                                            <span>RC Amount: {!isNaN(val?.rcAmount) ? Number(val?.rcAmount).toFixed(2) : 0}</span>
                                                                        </li>
                                                                        <li>
                                                                            <span>OTC Amount: {!isNaN(val?.otcAmount) ? Number(val?.otcAmount).toFixed(2) : 0}</span>
                                                                        </li>
                                                                        <li>
                                                                            <span>Total Amount: {(!isNaN(val?.otcAmount) && !isNaN(val?.rcAmount)) ? (Number(val?.rcAmount).toFixed(2) + Number(val?.otcAmount).toFixed(2)) : 0}</span>
                                                                        </li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        ))
                                                    }
                                                </Slider>
                                            </> :
                                            <span className="skel-widget-warning">No Schedule Payment</span>

                                    }

                                </div>
                            </div>
                        </div> */}
                        <div className="col-lg-4 col-md-12 col-xs-12">
                            <div className="skel-view-base-card">
                                <span className="skel-profile-heading">Appointment Details</span>
                                {!_.isEmpty(appointmentDetails) ?
                                    <><div className="skel-appt-det">
                                        <div className="skel-appt-date">
                                            {moment(appointmentDetails?.rows?.[0]?.appointDate).format('DD MMM')} <span> {moment(appointmentDetails?.rows?.[0]?.appointDate).format('YYYY')}</span>
                                        </div>
                                        <div className="skel-appt-bk-det">
                                            <span>{customerDetails?.firstName || customerDetails?.lastName}</span>
                                            <span>{(customerDetails?.customerContact && customerDetails?.customerContact?.[0]?.mobileNo) || 'NA'}</span>
                                            <span className="skel-cr-date">{appointmentDetails?.rows?.[0]?.appointStartTime ? moment('1970-01-01 ' + appointmentDetails?.rows?.[0]?.appointStartTime).format('hh:mm a') : '-'}-{appointmentDetails?.rows?.[0]?.appointEndTime ? moment('1970-01-01 ' + appointmentDetails?.rows?.[0]?.appointEndTime).format('hh:mm a') : ''}</span>
                                            <div className="skel-appt-type-bk">
                                                <ul>
                                                    <li className="skel-ty-clr">{appointmentDetails?.rows?.[0]?.status?.description}</li>
                                                    <li className="skel-ch-clr">{appointmentDetails?.rows?.[0]?.appointMode?.description}</li>
                                                    <li>
                                                        {["AUDIO_CONF", "VIDEO_CONF"].includes(appointmentDetails?.rows?.[0]?.appointMode) ? (
                                                            <a href={appointmentDetails?.rows?.[0]?.appointModeValue} target="_blank">Click here</a>
                                                        ) : (
                                                            <a>{appointmentDetails?.rows?.[0]?.appointModeValue}</a>
                                                        )}
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                        {!_.isEmpty(appointmentDetails?.insight) && <div className='skel-widget-warning'>{appointmentDetails?.insight?.message}</div>}
                                    </>
                                    :
                                    <span className='skel-widget-warning'> No Appointment Available!!!</span>}
                            </div>
                            {/* <div className="skel-view-base-card">
                                <div className="skel-inter-statement">
                                    <span className="skel-profile-heading">Customer Support </span>
                                    <div className="skel-wrk-ord-summ" >
                                        
                                        <div className="skel-wrk-ord-graph">
                                            <ul className="pieID legend">
                                                <li>
                                                    <span> Name: { }</span>
                                                </li>
                                                <li>
                                                   
                                                    <span>Email: {}</span>
                                                </li>
                                                <li>
                                                    
                                                    <span>Contact No: {}</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div> */}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="col-lg-6 col-md-12 col-xs-12">
                            <div className="skel-view-base-card">
                                <span className="skel-profile-heading">Order task</span>
                                <div className="skel-emoj-data mt-3">
                                    {taskDetails && taskDetails.length > 0 ? <div id="explanation-table">
                                        {taskDetails?.map((e) => {
                                            return <div className='row'>
                                                <div className='col-md-6'>
                                                    <span>{e.taskName}</span>
                                                    <span>
                                                        {<select
                                                            onChange={(event) => {
                                                                const selectedIndex = event.target.selectedIndex;
                                                                const selectedOption = e.taskOptions?.Options[selectedIndex - 1];
                                                                handleTaskStatusChange(e.taskOptions, selectedOption, e.taskId);
                                                            }}
                                                            disabled={permissions.readOnly}
                                                            id="taskCompletion"
                                                            className="form-control"
                                                        >
                                                            <option key="taskCompletion" value="">
                                                                Select Status
                                                            </option>
                                                            {e.taskOptions?.Options.map((option) => (
                                                                <option key={option.Type} value={option.value}>
                                                                    {option.value}
                                                                </option>
                                                            ))}
                                                        </select>}
                                                    </span>
                                                </div>
                                            </div>
                                        })}
                                    </div>
                                        : <span className='skel-widget-warning'>No Pending Task Found</span>
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-12 col-xs-12">
                            {
                                permissions.displayOnly === true &&
                                <>
                                    <div className="skel-form-sect">
                                        <div className="form-group">
                                            <label htmlFor="remarks" className="control-label">{!permissions.readOnly ? 'Add Additional Remarks' : 'Last Additional Remarks'}</label>
                                            {!permissions.readOnly ? <div>
                                                <textarea disabled={permissions.readOnly} maxLength="2500" className={`form-control ${error.remarks && "error-border"}`} id="remarks" name="remarks" rows="4" value={interactionInputs.remarks} onChange={handleOnTicketDetailsInputsChange}></textarea>
                                                <span className="errormsg">{error.remarks ? error.remarks : ""}</span>
                                                <span>Maximum 2500 characters</span>
                                            </div> : <textarea disabled={true} maxLength="2500" className='form-control' rows="4" value={lastOrderRemark || childOrder?.orderDescription || null}></textarea>}
                                        </div>
                                        <div className="row">
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="currStatus" className="col-form-label">Status<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                    {!permissions.readOnly ? <select disabled={permissions.readOnly} id="currStatus" value={interactionInputs.currStatus}
                                                        onChange={(e) => {
                                                            handleStatusChange(e)
                                                        }}
                                                        className={`form-control ${error.currStatus && "error-border"}`}>
                                                        <option key="status" value="">Select Status</option>
                                                        {
                                                            currStatusLookup && currStatusLookup.map((currStatus, index) => (
                                                                <option key={index} value={currStatus.code}>{currStatus.description}</option>
                                                            ))
                                                        }
                                                    </select>
                                                        :
                                                        <span>{childOrder.orderStatus?.description || ''}</span>
                                                    }
                                                    <span className="errormsg">{error.currStatus ? error.currStatus : ""}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="assignRole" className="col-form-label">Department/Role<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                    {!permissions.readOnly ? <select disabled={permissions.readOnly} id="assignRole" value={interactionInputs.assignRole}
                                                        onChange={(e) => {
                                                            handleOnTicketDetailsInputsChange(e)
                                                        }}
                                                        className={`form-control ${error.assignRole && "error-border"}`}>
                                                        <option key="role" value="" data-entity="" >Select Role</option>
                                                        {
                                                            roleLookup && roleLookup.map((dept, key) => (
                                                                <optgroup key={key} label={dept?.entity[0]?.unitDesc}>
                                                                    {
                                                                        !!dept.roles.length && dept.roles.map((data, childKey) => (
                                                                            <option key={childKey} value={data.roleId} data-entity={JSON.stringify(dept.entity[0])}>{data.roleDesc}</option>
                                                                        ))
                                                                    }
                                                                </optgroup>
                                                            ))
                                                        }
                                                    </select> :
                                                        <span>{`${childOrder?.currEntity?.unitDesc} / ${childOrder?.currRole?.roleDesc}` || ''}</span>
                                                    }
                                                    <span className="errormsg">{error.assignRole ? error.assignRole : ""}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="user" className="col-form-label">User</label>
                                                    {!permissions.readOnly ? <select disabled={permissions.readOnly} id="user" className={`form-control ${error.user && "error-border"}`} value={interactionInputs.user} onChange={handleOnTicketDetailsInputsChange}>
                                                        <option key="user" value="">Select User</option>
                                                        {
                                                            userLookup && userLookup.map((user) => (
                                                                <option key={user.userId} value={user.userId}>{user.firstName} {user.lastName}</option>
                                                            ))
                                                        }
                                                    </select> :
                                                        <span>{(childOrder?.currUser?.firstName || '') + ' ' + (childOrder.currUser?.lastName || '')}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="skel-pg-bot-sect-btn">
                                        <div className="skel-btn-sect" disabled={permissions.readOnly}>
                                            <Link className="skel-btn-cancel" to={`${process.env.REACT_APP_BASE}/`}>Cancel</Link>
                                            <button className="skel-btn-submit " disabled={(permissions.readOnly)} onClick={handleTicketDetailsSubmit}>Submit</button>
                                        </div>
                                    </div>
                                </>
                            }
                        </div>
                    </div>
                </div>
            </div>
            <Modal isOpen={isWorflowHistoryOpen} contentLabel="Followup Modal" style={RegularModalCustomStyles}>
                <>
                    <div className="modal fade order-search" id="skel-view-modal-workflow" tabindex="-1">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header px-4 border-bottom-0 d-block">
                                    <button type="button" className="close" data-dismiss="modal" aria-hidden="true" onClick={() => setIsWorkflowHistoryOpen(false)}>&times;</button>
                                    <h5 className="modal-title">{!isFollowUpHistoryOpen ? 'Workflow History' : 'Followup History'}  for Order No {interactionData?.orderNo}</h5>
                                </div>
                                <div className="modal-body px-4">
                                    <div className="row">
                                        <div className="col-md-12 pull-right">
                                            <button type="button" className="skel-btn-submit" onClick={(e) => {
                                                e.preventDefault();
                                                if ((followUpHistory?.count || 0) === 0) {
                                                    toast.error('No follow-up is available for this Product.')
                                                    return;
                                                }
                                                setIsFollowUpHistoryOpen(!isFollowUpHistoryOpen)
                                            }}> {!isFollowUpHistoryOpen ? `Followup History - ${followUpHistory?.count || 0}` : `WorkFlow History - ${workflowHistory?.count || 0}`}</button>
                                        </div>
                                    </div>
                                    {
                                        !isFollowUpHistoryOpen ? <div className="timeline-workflow">
                                            <ul>
                                                {
                                                    workflowHistory?.rows && workflowHistory.rows.length > 0 && workflowHistory?.rows.map((data) => (
                                                        <li>
                                                            <div className="content">
                                                                <div className="row">
                                                                    <div className="col-md-4">
                                                                        <div className="form-group">
                                                                            <label htmlFor="Interactiontype" className="control-label">From Department/Role</label>
                                                                            <span className="data-cnt">{(data?.fromEntityId?.unitDesc || "")} - {(data?.fromRoleId?.roleDesc || "")}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-md-4">
                                                                        <div className="form-group">
                                                                            <label htmlFor="Servicetype" className="control-label">To Department/Role</label>
                                                                            <span className="data-cnt">{(data?.toEntityId?.unitDesc || "")} - {(data?.toRoleId?.roleDesc || "")}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-md-4">
                                                                        <div className="form-group">
                                                                            <label htmlFor="Channel" className="control-label">User</label>
                                                                            <span className="data-cnt">{data?.createdByDescription?.firstName || ""} {data?.createdByDescription?.lastName || ""}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="row">
                                                                    <div className="col-md-4">
                                                                        <div className="form-group">
                                                                            <label htmlFor="Interactiontype" className="control-label">Status</label>
                                                                            <span className="data-cnt">{data?.orderStatus?.description}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-md-4">
                                                                        <div className="form-group">
                                                                            <label htmlFor="Servicetype" className="control-label">Action Performed</label>
                                                                            <span className="data-cnt">{data?.orderFlow?.description}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="row">
                                                                    <div className="col-md-12">
                                                                        <div className="form-group">
                                                                            <label htmlFor="Interactiontype" className="control-label">Comments</label>
                                                                            <span className="data-cnt">{data?.remarks}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="time">
                                                                <h4>{moment(data?.createdAt).format('DD MMM YYYY hh:mm:ss A') || ''}</h4>
                                                            </div>
                                                        </li>
                                                    ))
                                                }
                                            </ul>
                                        </div>
                                            :
                                            <div className="timeline-workflow">
                                                <ul>
                                                    {
                                                        followUpHistory?.rows && followUpHistory?.rows.length > 0 && followUpHistory?.rows.map((data) => (
                                                            <li>
                                                                <div className="content">
                                                                    <div className="row">
                                                                        <div className="col-md-4">
                                                                            <div className="form-group">
                                                                                <label htmlFor="Interactiontype" className="control-label">From Department/Role</label>
                                                                                <span className="data-cnt">{(data?.fromEntityId?.unitDesc || "")} - {(data?.fromRoleId?.roleDesc || "")}</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-md-4">
                                                                            <div className="form-group">
                                                                                <label htmlFor="Servicetype" className="control-label">To Department/Role</label>
                                                                                <span className="data-cnt">{(data?.toEntityId?.unitDesc || "")} - {(data?.toRoleId?.roleDesc || "")}</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-md-4">
                                                                            <div className="form-group">
                                                                                <label htmlFor="Channel" className="control-label">User</label>
                                                                                <span className="data-cnt">{data?.createdByDescription?.firstName || ""} {data?.createdByDescription?.lastName || ""}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="row">
                                                                        <div className="col-md-4">
                                                                            <div className="form-group">
                                                                                <label htmlFor="Interactiontype" className="control-label">Status</label>
                                                                                <span className="data-cnt">{data?.orderStatus?.description}</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-md-4">
                                                                            <div className="form-group">
                                                                                <label htmlFor="Servicetype" className="control-label">Action Performed</label>
                                                                                <span className="data-cnt">{data?.orderFlow?.description}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="row">
                                                                        <div className="col-md-12">
                                                                            <div className="form-group">
                                                                                <label htmlFor="Interactiontype" className="control-label">Comments</label>
                                                                                <span className="data-cnt">{data?.remarks}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="time">
                                                                    <h4>{moment(data?.createdAt).format('DD MMM YYYY hh:mm:ss A') || ''}</h4>
                                                                </div>
                                                            </li>
                                                        ))
                                                    }
                                                </ul>
                                            </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            </Modal>
            <Modal isOpen={isFollowupOpen} contentLabel="Followup Modal" style={RegularModalCustomStyles}>
                <div className="modal-center" id="cancelModal" tabindex="-1" role="dialog" aria-labelledby="cancelModal" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="cancelModal">Followup for Order No {interactionData?.orderNo}</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => setIsFollowupOpen(false)}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <hr className="cmmn-hline" />
                                <div className="clearfix"></div>
                                <div className="row">
                                    <div className="col-md-12 pt-2">
                                        <p style={{ fontWeight: "600" }}>You Currently have {(followUpHistory?.count || 0)}{" "}<a style={{ textDecoration: "underline" }}>Followup(s)</a></p>
                                    </div>
                                </div>
                                <div className="row pt-3">
                                    <div className="col-6">
                                        <div className="form-group">
                                            <label htmlFor="priority" className="col-form-label">Priority <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <select required value={followupInputs.priority} id="priority" className="form-control" onChange={handleOnFollowupInputsChange}>
                                                <option key="priority" value="">Select Priority</option>
                                                {
                                                    priorityLookup && priorityLookup.map((e) => (
                                                        <option key={e.code} value={e.code}>{e.description}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="form-group">
                                            <label htmlFor="source" className="col-form-label">Source <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <select required id="source" className="form-control" value={followupInputs.source} onChange={handleOnFollowupInputsChange}>
                                                <option key="source" value="">Select Source</option>
                                                {
                                                    sourceLookup && sourceLookup.map((e) => (
                                                        <option key={e.code} value={e.code}>{e.description}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-12 ">
                                        <div className="form-group ">
                                            <label htmlFor="inputState" className="col-form-label pt-0">Remarks <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <textarea required className="form-control" maxLength='2500' id="remarks" value={followupInputs.remarks} onChange={handleOnFollowupInputsChange} name="remarks" rows="4"></textarea>
                                            <span>Maximum 2500 characters</span>
                                        </div>
                                    </div>
                                    <div className="col-md-12 pl-2">
                                        <div className="form-group pb-1">
                                            <div className="d-flex justify-content-center">
                                                <button type="button" className="btn btn-primary waves-effect waves-light mr-2" onClick={handleOnAddFollowup}>Submit</button>
                                                <button type="button" className="btn btn-light waves-effect waves-light" onClick={() => setIsFollowupOpen(false)}>Cancel</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
            <Modal isOpen={isReAssignOpen} contentLabel="Followup Modal" style={RegularModalCustomStyles}>
                <div className="modal-center" id="reassignModal" tabindex="-1" role="dialog" aria-labelledby="reassignModal" aria-hidden="true">
                    <div className="modal-dialog " role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="reassignModal">Re-assign for Order No - {interactionData?.orderNo}</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => setIsReAssignOpen(false)}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <hr className="cmmn-hline" />
                                <div className="clearfix"></div>
                                <div className="row pt-4">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="reAssignUser" className="control-label">User <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <select required value={reAssignInputs.userId} id="reAssignUser" className="form-control" onChange={handleOnReAssignInputsChange}>
                                                <option key="reAssignUser" value="">Select User</option>
                                                {
                                                    reAssignUserLookup && reAssignUserLookup.map((user) => (
                                                        <option key={user.userId} value={user.userId}>{user?.firstName || ""} {user?.lastName || ""}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-12 pl-2 mt-2">
                                    <div className="form-group pb-1">
                                        <div className="d-flex justify-content-center">
                                            <button type="button" className="btn btn-primary waves-effect waves-light mr-2" onClick={handleOnReAssign}>Submit</button>
                                            <button type="button" className="btn btn-light waves-effect waves-light" onClick={() => setIsReAssignOpen(false)}>Cancel</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
            <Modal isOpen={isCancelOpen} contentLabel="Followup Modal" style={RegularModalCustomStyles}>
                <div className="modal-center" id="followupModal" tabindex="-1" role="dialog" aria-labelledby="followupModal" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="followupModal">Cancellation for Order No - {interactionData?.orderNo}</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => setIsCancelOpen(false)}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <hr className="cmmn-hline" />
                                <div className="clearfix"></div>
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="cancel-info">
                                            Once you cancel you can't reassign/change the status again. <br />Before proceeding to "Cancel" you must agree to proceed!
                                        </div>
                                    </div>
                                </div>
                                <div className="skel-wrk-ord-summ">
                                    <p>Product Name: {selectedProduct?.productDetails?.productName || ""}</p>
                                    <div className="skel-wrk-ord-graph">
                                        <div className="pieID pie">
                                            <img src={selectedProduct?.productDetails?.productImage} alt="ProductImage" srcSet="" className='skel-prdt-cust-size' />
                                        </div>
                                        <ul className="pieID legend">
                                            <li>
                                                <em>Product Type</em>
                                                <span>{selectedProduct?.productDetails?.productType.description || ""}</span>
                                            </li>
                                            <li>
                                                <em>Quantity</em>
                                                <span>{selectedProduct?.productQuantity || 0}</span>
                                            </li>
                                            <li>
                                                <em>Amount</em>
                                                <span>{selectedProduct?.billAmount || 0}</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="row pt-3">
                                    <div className="col-md-12 pb-3">
                                        <div className="form-group ">
                                            <label htmlFor="cancellationReason" className="col-form-label">Reason for Cancellation <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <select value={cancellationReason} id="cancellationReason" className="form-control" onChange={(e) => setCancellationReason(e.target.value)} required>
                                                <option key="cancellationReason" value="">Select Reason</option>
                                                {
                                                    cancellationReasonLookup && cancellationReasonLookup.map((e) => (
                                                        <option key={e.code} value={e.code}>{e.description}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-12 pl-2">
                                        <div className="form-group pb-1">
                                            <div className="d-flex justify-content-center">
                                                <button type="button" className="skel-btn-cancel" onClick={() => setIsCancelOpen(false)}>Cancel</button>
                                                <button type="button" className="skel-btn-submit " onClick={handleOnCancel}>Submit</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
            <Modal isOpen={isOrderListOpen} style={RegularModalCustomStyles}>
                <div className="modal fade order-search" id="skel-view-modal-interactions" tabindex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header px-4 border-bottom-0 d-block">
                                <button onClick={handleOnModelClose} type="button" className="close" data-dismiss="modal"
                                    aria-hidden="true">&times;</button>
                                <h5 className="modal-title">Order Details for Customer Number {customerDetails?.customerNo}</h5>
                            </div>
                            {/* {console.log(interactionCustomerHistory?.openInteraction,  interactionCustomerHistory?.closedInteraction, interactionData)} */}
                            <div className="modal-body px-4">
                                <form className="needs-validation p-2" name="event-form" id="form-event" novalidate>
                                    <div className="">
                                        {
                                            orderCustomerHistoryDetails.length > 0 &&
                                            <DynamicTable
                                                listKey={"Interactions"}
                                                row={orderCustomerHistoryDetails}
                                                rowCount={totalCount}
                                                header={orderListColumns}
                                                // fixedHeader={true}
                                                itemsPerPage={perPage}
                                                isScroll={true}
                                                backendPaging={true}
                                                // isTableFirstRender={tableRef}
                                                // hasExternalSearch={hasExternalSearch}
                                                backendCurrentPage={currentPage}
                                                // url={`${properties.INTERACTION_API}/get-customer-history/${props?.location?.state?.data?.customerUid}?type=ROWS&limit=${perPage}&page=${currentPage}${orderStatusType ? `&status=${orderStatusType}` : ''}`}
                                                method='POST'
                                                handler={{
                                                    handleCellRender: handleCellRender,
                                                    handlePageSelect: handlePageSelect,
                                                    handleItemPerPage: setPerPage,
                                                    handleCurrentPage: setCurrentPage
                                                }}
                                            />}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default EditViewOrderInteraction


const orderListColumns = [
    {
        Header: "Order No",
        accessor: "orderNo",
        disableFilters: true
    },
    {
        Header: "Order Category",
        accessor: "orderCategoryDesc.description",
        disableFilters: true
    },
    {
        Header: "Order Type",
        accessor: "orderTypeDesc.description",
        disableFilters: true
    },
    // {
    //     Header: "Service Type",
    //     accessor: "serviceTypeDesc.description",
    //     disableFilters: true
    // },
    {
        Header: "Status",
        accessor: "orderStatusDesc.description",
        disableFilters: true
    },
    {
        Header: "Created At",
        accessor: "createdAt",
        disableFilters: true
    }
]