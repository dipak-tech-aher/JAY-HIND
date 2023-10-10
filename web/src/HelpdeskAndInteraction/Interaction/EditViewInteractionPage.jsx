/* eslint-disable array-callback-return */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import { object, string } from "yup";
import vImp from "../../assets/images/v-img.png";
import { history } from "../../common/util/history";
import moment from "moment";
import { unstable_batchedUpdates } from "react-dom";
import Modal from "react-modal";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import Swal from "sweetalert2";
import { AppContext } from "../../AppContext";
import { get, post, put } from "../../common/util/restUtil";
import { RegularModalCustomStyles } from "../../common/util/util";
import { properties } from "../../properties";
// import OrderJourney from './OrderJourney';
import { isEmpty } from "lodash";
import CustomerDetailsFormViewMin from "../../CRM/Customer/CustomerDetailsFormViewMin";
import CustomerJourney from "../../CRM/Customer/CustomerJourney";
import IntelligenceCorner from "../../CRM/Customer/IntelligenceCorner";
import DynamicTable from "../../common/table/DynamicTable";
import InteractionChannelActivity from "./InteractionChannelActivity";
import InteractionCustomerHistory from "./InteractionCustomerHistory";
import InteractionResolutionHistory from "./InteractionResolutionHistory";

const EditViewInteractionPage = (props) => {
  console.log(
    "props?.location?.state?.data?.intxnNo",
    props?.location?.state?.data?.intxnNo
  );
  const { auth, appConfig } = useContext(AppContext);
  const [interactionData, setInteractionData] = useState({});
  const [customerDetails, setCustomerDetails] = useState(
    props?.location?.state?.data?.customerDetails
  );

  const customerUuid = props?.location?.state?.data?.customerUid ? props?.location?.state?.data?.customerUid : props?.location?.state?.data?.customerDetails?.customerUuid
  const [interactionInputs, setInteractionInputs] = useState({
    user: "",
    assignRole: "",
    assignDept: "",
    currStatus: "",
    remarks: "",
  });
  const [error, setError] = useState({});
  const [workflowHistory, setWorkflowHistory] = useState({
    rows: [],
    count: 0,
  });
  const [followUpHistory, setFollowUpHistory] = useState({
    rows: [],
    count: 0,
  });
  const [permissions, setPermissions] = useState({
    assignToSlef: false,
    followup: false,
    readOnly: false,
    reAssign: false,
  });

  const isRoleChangedByUserRef = useRef(false);
  const currentWorkflowRef = useRef();
  const ticketDetailsValidationSchema = object().shape({
    assignRole: string().required("Assgin to Department/Role is required"),
    currStatus: string().required("Current Status is required"),
  });
  const [isWorflowHistoryOpen, setIsWorkflowHistoryOpen] = useState(false);
  const [isInteractionListOpen, setIsInteractionListOpen] = useState(false);
  const [isFollowupOpen, setIsFollowupOpen] = useState(false);
  const [isReAssignOpen, setIsReAssignOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [priorityLookup, setPriorityLookup] = useState([]);
  const [sourceLookup, setSourceLookup] = useState([]);
  const [reAssignUserLookup, setReAssignUserLookup] = useState();
  const [followupInputs, setFollowupInputs] = useState({
    priority: "",
    source: "",
    remarks: "",
  });
  const [reAssignInputs, setReAssignInputs] = useState({
    userId: "",
  });
  const [cancellationReason, setCancellationReason] = useState();
  const [cancellationReasonLookup, setCancellationReasonLookup] = useState([]);
  const [workflowLookup, setWorkflowLookup] = useState();
  const [roleLookup, setRoleLookup] = useState();
  const [userLookup, setUserLookup] = useState();
  const [currStatusLookup, setCurrStatusLookup] = useState();
  const [interactionCustomerHistory, setInteractionCustomerHistory] = useState(
    {}
  );
  const [isFollowUpHistoryOpen, setIsFollowUpHistoryOpen] = useState(false);
  const [interactionWorkflow, setInteractionWorkflow] = useState({});
  const [customerEmotions, setCustomerEmotions] = useState([]);
  const [appointmentDetails, setAppointmentDetails] = useState({});
  const [interactionStatusType, setInteractionStatusType] = useState();
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);

  const [
    interactionCustomerHistoryDetails,
    setInteractionCustomerHistoryDetails,
  ] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [perPageModal, setPerPageModal] = useState(10);
  const [currentPageModal, setCurrentPageModal] = useState(0);

  // customer Insight States
  const [interactionInsightCount, setInteractionInsightCount] = useState([]);
  const [isChannelActivityOpen, setIsChannelActivityOpen] = useState(false);
  const [channelActivityType, setChannelActivityType] = useState("");
  const [channelActivityTotalCount, setChannelActivityTotalCount] = useState(0);
  const [channelActivityPerPageModal, setChannelActivityPerPageModal] =
    useState(10);
  const [channelActivityCurrentPageModal, setChannelActivityCurrentPageModal] =
    useState(0);
  const [channelInteractionInsight, setChannelInteractionInsight] = useState(
    []
  );

  const [isCustomerActivityOpen, setIsCustomerActivityOpen] = useState(false);
  const [CustomerActivityType, setCustomerActivityType] = useState("");
  const [CustomerActivityTotalCount, setCustomerActivityTotalCount] =
    useState(0);
  const [CustomerActivityPerPageModal, setCustomerActivityPerPageModal] =
    useState(10);
  const [
    CustomerActivityCurrentPageModal,
    setCustomerActivityCurrentPageModal,
  ] = useState(0);
  const [customerInteractionInsight, setCustomerInteractionInsight] = useState(
    []
  );

  const [isSoluationActivityOpen, setIsSoluationActivityOpen] = useState(false);
  const [soluationActivityType, setSoluationActivityType] = useState("");
  const [soluationActivityTotalCount, setSoluationActivityTotalCount] =
    useState(0);
  const [soluationActivityPerPageModal, setSoluationActivityPerPageModal] =
    useState(10);
  const [
    soluationActivityCurrentPageModal,
    setSoluationActivityCurrentPageModal,
  ] = useState(0);
  const [soluationInteractionInsight, setSolutionInteractionInsight] = useState(
    []
  );

  // Customer service
  const [serviceList, setServiceList] = useState();
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
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
          dots: false,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
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

  const handleOnCancel = () => {
    if (!cancellationReason) {
      toast.error("Cancellation Reason is Mandatory");
      return;
    }
    const payload = {
      cancelReason: cancellationReason,
    };

    put(
      `${properties.INTERACTION_API}/cancel/${interactionData?.intxnNo}`,
      payload
    )
      .then((response) => {
        toast.success(`${response.message}`);
        setIsCancelOpen(false);
        initialize();
      })
      .catch((error) => {
        console.error(error);
      })
      .finally();
  };

  const handleOnAssignToSelf = (type) => {
    put(`${properties.INTERACTION_API}/assignSelf/${interactionData.intxnNo}`, {
      type,
    })
      .then((response) => {
        toast.success(`${response.message}`);
        initialize();
      })
      .catch((error) => {
        console.error(error);
      })
      .finally();
  };

  const handleOnAddFollowup = (e) => {
    e.preventDefault();
    const { priority, source, remarks } = followupInputs;
    if (!priority || !source || !remarks) {
      toast.error("Please provide mandatory fields");
      return;
    }
    let payload = {
      priorityCode: priority,
      source,
      remarks,
      interactionNumber: interactionData?.intxnNo,
    };

    post(`${properties.INTERACTION_API}/followUp`, { ...payload })
      .then((response) => {
        if (response?.status === 200) {
          toast.success("Follow Up Created Successfully");
          setIsFollowupOpen(false);
          setFollowupInputs({
            priority: "",
            source: "",
            remarks: "",
          });
          initialize();
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally();
  };

  const handleOnFollowupInputsChange = (e) => {
    const { target } = e;
    setFollowupInputs({
      ...followupInputs,
      [target.id]: target.value,
    });
  };

  const handleOnReAssignToSelf = () => {
    Swal.fire({
      title: "Are you sure?",
      text: `Confirm Re-Assign To Self`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, Submit it!`,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        handleOnAssignToSelf("REASSIGN_TO_SELF");
      }
    }).catch(error => console.log(error));
  };

  const handleOnReAssignInputsChange = (e) => {
    const { target } = e;
    setReAssignInputs({
      userId: target.value,
    });
  };

  const handleOnModelClose = () => {
    setIsInteractionListOpen(false);
  };

  const handleOnReAssign = (e) => {
    e.preventDefault();
    const { userId } = reAssignInputs;
    let payload = {
      userId: userId,
      type: "REASSIGN",
      // roleId: interactionData?.currentRole?.code,
      // departmentId: interactionData?.currentDepartment?.code,
      // remarks: "Reassigned to User"
    };
    if (!userId) {
      toast.error("User is Mandatory");
      return;
    }

    put(
      `${properties.INTERACTION_API}/assignSelf/${interactionData?.intxnNo}`,
      { ...payload }
    )
      .then((response) => {
        toast.success(`${response.message}`);
        setIsReAssignOpen(false);
        initialize();
      })
      .catch((error) => {
        console.error(error);
      })
      .finally();
  };

  const handleStatusChange = (e) => {
    let entity = [];
    handleOnTicketDetailsInputsChange(e);
    workflowLookup &&
      workflowLookup.entities.map((unit) => {
        for (const property in unit.status) {
          if (unit.status[property].code === e.target.value) {
            entity.push(unit);
            break;
          }
        }
      });
    setRoleLookup(entity);
  };

  const getUsersBasedOnRole = (source = undefined) => {
    const data = source
      ? {
        roleId: interactionData?.currentRole?.code,
        deptId: interactionData?.currentDepartment?.code,
      }
      : {
        roleId: interactionInputs.assignRole,
        deptId: interactionInputs.assignDept,
      };

    get(
      `${properties.USER_API}/by-role?roleId=${data.roleId}&deptId=${data.deptId}`
    )
      .then((userResponse) => {
        const { data } = userResponse;
        if (source) {
          setReAssignUserLookup(
            data.filter((x) => x.userId !== interactionData?.currentUser?.code)
          );
        } else {
          setUserLookup(data);
          if (isRoleChangedByUserRef.current) {
            if (data.length === 1) {
              setInteractionInputs({
                ...interactionInputs,
                user: data[0].userId,
              });
            }
          }
        }
      }).catch(error => console.log(error))
      .finally();
  };

  const initialize = () => {
    isRoleChangedByUserRef.current = false;
    post(`${properties.INTERACTION_API}/search?limit=1&page=0`, {
      searchParams: {
        interactionNumber: props?.location?.state?.data?.intxnNo,
      },
    })
      .then((response) => {
        if (response?.data?.rows && response?.data?.rows.length > 0) {
          setInteractionData(response?.data?.rows[0]);
          setCustomerDetails(response?.data?.rows[0].customerDetails);
          let assignRole = !!response?.data?.rows[0]?.currentRole?.code
            ? parseInt(response?.data?.rows[0]?.currentRole?.code)
            : "";
          let assignDept = !!response?.data?.rows[0]?.currentDepartment?.code
            ? response?.data?.rows[0]?.currentDepartment?.code
            : "";
          let user = !!response?.data?.rows[0]?.currentUser?.code
            ? parseInt(response?.data?.rows[0]?.currentUser?.code)
            : "";
          grantPermissions(
            assignRole,
            user,
            response?.data?.rows[0]?.intxnStatus?.code,
            assignDept
          );
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally();

    get(
      `${properties.INTERACTION_API}/history/${props?.location?.state?.data?.intxnNo}?getFollowUp=false`
    )
      .then((response) => {
        if (response?.data && response?.data) {
          setWorkflowHistory(response?.data);
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally();

    // get Interaction Followup History
    get(
      `${properties.INTERACTION_API}/history/${props?.location?.state?.data?.intxnNo}?getFollowUp=true`
    )
      .then((response) => {
        if (response?.data && response?.data) {
          setFollowUpHistory(response?.data);
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally();
    console.log('customerUuid ', customerUuid)
    // get Customer Interaction count based on status
    get(
      `${properties.INTERACTION_API}/get-customer-history-count/${customerUuid}`
    )
      .then((response) => {
        if (response?.data) {
          setInteractionCustomerHistory(response?.data);
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally();

    //get Appointment Details
    get(
      `${properties.APPOINTMENT_API}/interaction/${props?.location?.state?.data?.intxnNo}`
    )
      .then((response) => {
        if (response?.data) {
          setAppointmentDetails(response?.data);
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally();

    // get Customer Product Details
    post(`${properties.ACCOUNT_DETAILS_API}/get-service-list`, {
      customerUuid: customerUuid,
      limit: "10",
      page: "0",
    })
      .then((response) => {
        if (response?.data) {
          setServiceList(response?.data);
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally();
  };

  const handleOnTicketDetailsInputsChange = (e) => {
    const { target } = e;
    if (target.id === "assignRole") {
      const { unitId = "" } =
        target.value !== "" &&
        JSON.parse(target.options[target.selectedIndex].dataset.entity);
      setInteractionInputs({
        ...interactionInputs,
        [target.id]: target.value,
        assignDept: unitId,
      });
      isRoleChangedByUserRef.current = true;
    } else {
      setInteractionInputs({
        ...interactionInputs,
        [target.id]: target.value,
      });
    }
    setError({
      ...error,
      [target.id]: "",
    });
  };

  const validate = (section, schema, data) => {
    try {
      if (section === "DETAILS") {
        setError({});
      }
      schema.validateSync(data, { abortEarly: false });
    } catch (e) {
      e.inner.forEach((err) => {
        if (section === "DETAILS") {
          setError((prevState) => {
            return { ...prevState, [err.params.path]: err.message };
          });
        }
      });
      return e;
    }
  };

  const checkTicketDetails = () => {
    let error = validate(
      "DETAILS",
      ticketDetailsValidationSchema,
      interactionInputs
    );
    if (error) {
      toast.error("Validation errors found. Please check highlighted fields");
      return false;
    }
    return true;
  };

  const grantPermissions = (
    assignedRole,
    assignedUserId,
    status,
    assignedDept
  ) => {
    const fromHelpDesk = false;
    const helpDeskView = "QUEUE";
    if (fromHelpDesk && helpDeskView === "QUEUE") {
      setPermissions({
        assignToSlef: false,
        followup: false,
        readOnly: true,
        reAssign: false,
      });
    } else if (["CLOSED", "CANCELLED"].includes(status)) {
      setPermissions({
        assignToSlef: false,
        followup: false,
        readOnly: true,
        reAssign: false,
      });
    } else {
      const { user, currRoleId, currDeptId } = auth;
      if (
        Number(assignedRole) === Number(currRoleId) &&
        assignedDept === currDeptId
      ) {
        if (assignedUserId !== "") {
          if (Number(assignedUserId) === Number(user.userId)) {
            setPermissions({
              assignToSlef: false,
              followup: false,
              readOnly: false,
              reAssign: true,
            });
          } else {
            setPermissions({
              assignToSlef: false,
              followup: true,
              readOnly: true,
              reAssign: false,
            });
          }
        } else {
          setPermissions({
            assignToSlef: true,
            followup: true,
            readOnly: true,
            reAssign: false,
          });
        }
      } else {
        if (assignedUserId !== "") {
          setPermissions({
            assignToSlef: false,
            followup: true,
            readOnly: true,
            reAssign: false,
          });
        } else {
          setPermissions({
            assignToSlef: false,
            followup: true,
            readOnly: true,
            reAssign: false,
          });
        }
      }
    }
  };

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

      put(properties.INTERACTION_API + "/update/" + interactionData.intxnNo, {
        ...reqBody,
      })
        .then((response) => {
          toast.success(`${response?.message}`);
          props.history.push(`${process.env.REACT_APP_BASE}/`);
        })
        .catch((error) => {
          console.error(error);
          toast.error(error);
        })
        .finally();
    }
  };

  const getCustomerInteractionDetails = useCallback(
    (status) => {
      try {
        if (customerUuid && status) {
          get(
            `${properties.INTERACTION_API}/get-customer-history/${customerUuid
            }?type=ROWS&limit=${perPageModal}&page=${currentPageModal}${status ? `&status=${status}` : ""
            }`
          )
            .then((response) => {
              if (response?.data) {
                setInteractionCustomerHistoryDetails(response?.data?.rows);
                setTotalCount(response?.data?.count);
              }
            })
            .catch((error) => {
              console.error(error);
            })
            .finally();
        }
      } catch (error) {
        console.error(error);
      }
    },
    [currentPageModal, perPageModal]
  );

  const fetchInteractionDetail = (intxnNo) => {
    get(`${properties.INTERACTION_API}/search?q=${intxnNo}`).then((resp) => {
      if (resp.status === 200) {
        const response = resp.data?.[0];
        const data = {
          ...response,
          sourceName: 'customer360'
        }
        if (response.customerUuid) {
          sessionStorage.setItem("customerUuid", response.customerUuid)
          sessionStorage.setItem("customerIds", response.customerId)
        }
        history.push(`${process.env.REACT_APP_BASE}/interaction360`, { data })
      } else {
        //
      }
    }).catch(error => {
      console.log(error);
    });
  }

  const handleCellRender = (cell, row) => {
    if (cell.column.Header === "Interaction No") {
      return (
        <span
          className="text-secondary cursor-pointer"
          onClick={(e) =>
            fetchInteractionDetail(cell.value)
          }
        >
          {cell.value}
        </span>
      );
    } else if (cell.column.id === "createdAt") {
      return (
        <span>
          {moment(row.original?.oCreatedAt).format("DD-MM-YYYY HH:mm:ss a")}
        </span>
      );
    } else {
      return <span>{cell.value}</span>;
    }
  };

  const handlePageSelect = (pageNo) => {
    setCurrentPageModal(pageNo);
  };

  const handleInteractionModal = (status) => {
    unstable_batchedUpdates(() => {
      setInteractionStatusType(status);
      setIsInteractionListOpen(!isInteractionListOpen);
      setCurrentPageModal(0);
      setPerPageModal(10);
      setTotalCount(0);
    });
  };

  /** Get Interaction Insights
   */
  const getInteractionInsightCount = useCallback(() => {
    try {
      if (interactionData?.requestId) {
        const requestBody = {
          type: "INSIGHTS_COUNT",
          requestId: interactionData?.requestId,
          intxnNo: interactionData?.intxnNo,
          customerUuid: customerUuid,
        };
        console.log("requestBody===>", requestBody);
        post(`${properties.INTERACTION_API}/get-Interaction-insight`, {
          ...requestBody,
        })
          .then((resp) => {
            if (resp?.data) {
              setInteractionInsightCount(resp.data);
            }
          })
          .catch((error) => console.error(error))
          .finally();
      }
    } catch (error) {
      console.error(error);
    }
  }, [interactionData]);

  /**
   * This function retrieves interaction insight details from an API endpoint based on certain
   * parameters.
   */
  const getInteractionInsightDetails = () => {
    try {
      if (interactionData?.requestId && channelActivityType) {
        const requestBody = {
          type: "INSIGHTS",
          requestId: interactionData?.requestId,
          channel: channelActivityType,
          limit: channelActivityPerPageModal,
          page: channelActivityCurrentPageModal,
          customer: false,
          solutioned: false,
        };
        post(`${properties.INTERACTION_API}/get-Interaction-insight`, {
          ...requestBody,
        })
          .then((resp) => {
            if (resp?.data) {
              unstable_batchedUpdates(() => {
                setChannelActivityTotalCount(resp.data.count);
                setChannelInteractionInsight(resp.data.rows);
              });
            }
          })
          .catch((error) => console.error(error))
          .finally();
      }
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * This function retrieves customer interaction insight details from an API endpoint and updates state
   * variables accordingly.
   */
  const getInteractionCustomerInsightDetails = () => {
    try {
      if (interactionData?.requestId && isCustomerActivityOpen) {
        const requestBody = {
          type: "INSIGHTS",
          requestId: interactionData?.requestId,
          limit: CustomerActivityPerPageModal,
          page: CustomerActivityCurrentPageModal,
          customer: true,
          solutioned: false,
        };
        post(`${properties.INTERACTION_API}/get-Interaction-insight`, {
          ...requestBody,
        })
          .then((resp) => {
            if (resp?.data) {
              unstable_batchedUpdates(() => {
                setCustomerActivityTotalCount(resp.data.count);
                setCustomerInteractionInsight(resp.data.rows);
              });
            }
          })
          .catch((error) => console.error(error))
          .finally();
      }
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * This function retrieves interaction solution insight details based on certain conditions.
   */
  const getInteractionSolutionInsightDetails = () => {
    try {
      if (interactionData?.requestId && isSoluationActivityOpen) {
        const requestBody = {
          type: "INSIGHTS",
          requestId: interactionData?.requestId,
          limit: soluationActivityPerPageModal,
          page: soluationActivityCurrentPageModal,
          customer: false,
          solutioned: true,
        };
        post(`${properties.INTERACTION_API}/get-Interaction-insight`, {
          ...requestBody,
        })
          .then((resp) => {
            if (resp?.data) {
              unstable_batchedUpdates(() => {
                setSoluationActivityTotalCount(resp.data.count);
                setSolutionInteractionInsight(resp.data.rows);
              });
            }
          })
          .catch((error) => console.error(error))
          .finally();
      }
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * @param {String} statusCode
   * The function takes a status code as input and returns a corresponding CSS class based on the
   * code.
   * @returns The function `getStatusClass` returns a string representing a CSS class name based on
   * the input `statusCode`. If the `statusCode` matches one of the conditions in the `if` statements,
   * a corresponding class name is returned. If none of the conditions are met, an empty string is
   * returned.
   */
  const getStatusClass = (statusCode) => {
    if (
      ["Cancelled", "Rejected", "Closed", "Pending Close", "Reject"].includes(
        statusCode
      )
    ) {
      return "skel-h-status";
    } else if (["Inactive"].includes(statusCode)) {
      return "skel-m-status";
    } else if (["Active"].includes(statusCode)) {
      return "skel-l-status";
    } else if (["Suspended", "Prospect"].includes(statusCode)) {
      return "skel-r-status";
    } else if (["Pending"].includes(statusCode)) {
      return "skel-d-status";
    } else if (["Temporary"].includes(statusCode)) {
      return "skel-rej-status";
    } else {
      return "";
    }
  };

  /**
   * @param {Integer} pageNo
   * This function sets the current page number for a modal displaying channel activity.
   */
  const handlePageSelectforChannelActivity = (pageNo) => {
    setChannelActivityCurrentPageModal(pageNo);
  };

  /**
   * @param {Integer} pageNo
   * This function sets the current page number for a solution activity modal.
   */
  const handlePageSelectforSolutionActivity = (pageNo) => {
    setSoluationActivityCurrentPageModal(pageNo);
  };

  /**
   *  @param {Integer} pageNo
   * This function sets the current page number for a customer activity modal.
   */
  const handlePageSelectforCustomerActivity = (pageNo) => {
    setCustomerActivityCurrentPageModal(pageNo);
  };

  /**
   * This function uses the `unstable_batchedUpdates` method to update multiple state variables
   * related to a channel activity modal and set them to their initial values.
   */
  const handleOnCloseChannelModal = () => {
    unstable_batchedUpdates(() => {
      setIsChannelActivityOpen(false);
      setChannelActivityType("");
      setChannelActivityTotalCount(0);
      setChannelActivityPerPageModal(10);
      setChannelActivityCurrentPageModal(0);
      setChannelInteractionInsight([]);
    });
  };

  /**
   * This function uses the `unstable_batchedUpdates` method to update multiple state variables
   * related to customer activity and interaction insight and close a customer modal.
   */
  const handleOnCloseCustomerModal = () => {
    unstable_batchedUpdates(() => {
      setIsCustomerActivityOpen(false);
      setCustomerActivityTotalCount(0);
      setCustomerActivityPerPageModal(10);
      setCustomerActivityCurrentPageModal(0);
      setCustomerInteractionInsight([]);
    });
  };

  /**
   * This function uses the `unstable_batchedUpdates` method to update multiple state variables related
   * to a solution activity modal and reset them to their initial values.
   */
  const handleOnCloseSoluationModal = () => {
    unstable_batchedUpdates(() => {
      setIsSoluationActivityOpen(false);
      setSoluationActivityTotalCount(0);
      setSoluationActivityPerPageModal(10);
      setSoluationActivityCurrentPageModal(0);
      setSolutionInteractionInsight([]);
    });
  };

  useEffect(() => {
    if (interactionData?.requestId) {
      getInteractionInsightCount();
    }
  }, [getInteractionInsightCount, interactionData]);

  useEffect(() => {
    if (interactionData?.requestId && channelActivityType) {
      getInteractionInsightDetails();
    }
  }, [
    channelActivityType,
    channelActivityPerPageModal,
    channelActivityCurrentPageModal,
  ]);

  useEffect(() => {
    if (interactionData?.requestId) {
      getInteractionCustomerInsightDetails();
    }
  }, [
    CustomerActivityPerPageModal,
    CustomerActivityCurrentPageModal,
    isCustomerActivityOpen,
  ]);

  useEffect(() => {
    if (interactionData?.requestId) {
      getInteractionSolutionInsightDetails();
    }
  }, [
    soluationActivityCurrentPageModal,
    soluationActivityPerPageModal,
    isSoluationActivityOpen,
  ]);

  useEffect(() => {
    initialize();
  }, []);

  // useEffect(() => {
  //     if (customerUuid && customerUuid !== '') {

  //         if (!customerDetails) {

  //             const searchParams = {
  //                 customerUuid
  //             }
  //             post(`${properties.INTERACTION_API}/search?limit=${perPage}&page=${currentPage}`, { searchParams })
  //                 .then((resp) => {
  //                     setInteractionList(resp.data)
  //                     setInteractionData(resp.data?.rows)
  //                 }).finally()
  //         }
  //     }
  // }, [currentPage, perPage])

  useEffect(() => {
    if (
      interactionData?.currentDepartment?.code &&
      interactionData?.currentDepartment?.code !== "" &&
      permissions.readOnly === false
    ) {
      get(
        `${properties.WORKFLOW_DEFN_API}/get-status?entityId=${interactionData?.intxnUuid}&entity=INTERACTION`
      )
        .then((response) => {
          if (response.data) {
            const { flow, flwId } = response?.data;
            currentWorkflowRef.current = { flwId };
            if (flow !== "DONE") {
              let statusArray = [];
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
              setCurrStatusLookup(statusLookup);
            } else if (flow === "DONE") {
              setPermissions({
                assignToSlef: false,
                followup: false,
                readOnly: true,
                reAssign: false,
              });
            }

            if (interactionData?.intxnStatus?.code === "CLOSED") {
              setPermissions({
                assignToSlef: false,
                followup: false,
                readOnly: true,
                reAssign: false,
              });
            }
          }
        }).catch(error => console.log(error))
        .finally();
    }
  }, [permissions, interactionData?.currentDepartment?.code]);

  useEffect(() => {
    get(
      properties.MASTER_API +
      "/lookup?searchParam=code_type&valueParam=TICKET_SOURCE,TICKET_PRIORITY,INTXN_STATUS_REASON"
    )
      .then((resp) => {
        if (resp.data) {
          setSourceLookup(resp.data["TICKET_SOURCE"]);
          setPriorityLookup(resp.data["TICKET_PRIORITY"]);
          setCancellationReasonLookup(resp.data["INTXN_STATUS_REASON"]);
        } else {
          toast.error("Error while fetching address details");
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally();
  }, []);

  useEffect(() => {
    if (interactionInputs.assignRole !== "") {
      getUsersBasedOnRole();
    } else {
      setUserLookup([]);
    }
    if (isReAssignOpen) {
      getUsersBasedOnRole("RE-ASSIGN");
    }
  }, [interactionInputs.assignRole, isReAssignOpen]);

  useEffect(() => {
    if (
      customerUuid &&
      customerUuid !== ""
    ) {
      get(
        properties.CUSTOMER_API +
        "/customers-interaction/" +
        customerUuid
      )
        .then((resp) => {
          if (resp && resp.data) {
            setCustomerEmotions([...resp.data]);
          }
        })
        .catch((error) => console.error(error));
    }
  }, []);

  useEffect(() => {
    if (interactionData?.intxnNo) {
      post(`${properties.INTERACTION_API}/flow/${interactionData?.intxnNo}`)
        .then((resp) => {
          if (resp.data) {
            setInteractionWorkflow({ ...resp.data, source: "INTERACTION" });
          }
        })
        .catch((error) => console.error(error))
        .finally();
    }
  }, [interactionData]);

  useEffect(() => {
    getCustomerInteractionDetails(interactionStatusType);
  }, [
    currentPageModal,
    getCustomerInteractionDetails,
    interactionStatusType,
    perPageModal,
  ]);

  return (
    <div className="cnt-wrapper">
      {/* <div className="top-breadcrumb cmmn-skeleton">
                <div className="lft-skel">
                    <ul>
                        <li><a href="javascript" onClick={() => props.history.push(`${process.env.REACT_APP_BASE}/`)}><i className="material-icons">arrow_back</i>Back</a></li>
                        <li>Interaction Details - {interactionData?.intxnNo}</li>
                    </ul>
                </div>
                
            </div> */}
      <div className="mt-2">
        <div className="rht-skel">
          {!["CLOSED", "CANCELLED"].includes(
            interactionData?.intxnStatus?.code
          ) && (
              <>
                <button
                  className="skel-btn-cancel"
                  data-target="#cancelModal"
                  data-toggle="modal"
                  onClick={() => setIsCancelOpen(true)}
                >
                  Cancel Interaction
                </button>
                {/* <button className="skel-btn-submit" onClick="window.location.href='edit-interaction.html'">Edit</button> */}
                {permissions.readOnly &&
                  auth.currDeptId === interactionData?.currentDepartment?.code &&
                  Number(auth.currRoleId) ===
                  Number(interactionData?.currentRole?.code) &&
                  interactionData?.currentUser?.code && (
                    <button
                      className="skel-btn-submit"
                      data-target="#reassignModal"
                      data-toggle="modal"
                      onClick={handleOnReAssignToSelf}
                    >
                      Re-Assign to Self
                    </button>
                  )}
                <button
                  className={`skel-btn-submit ${!permissions.assignToSlef && "d-none"
                    }`}
                  onClick={() => handleOnAssignToSelf("SELF")}
                >
                  Assign To Self
                </button>
                <button
                  className={`skel-btn-submit ${!permissions.reAssign && "d-none"
                    }`}
                  onClick={() => setIsReAssignOpen(true)}
                >
                  Re-Assign
                </button>
                <button
                  className={`skel-btn-submit  ${!permissions.followup && "d-none"
                    }`}
                  onClick={() => setIsFollowupOpen(true)}
                  data-target="#followupModal"
                  data-toggle="modal"
                >
                  Add Followup
                </button>
              </>
            )}
          {/* <button className='skel-btn-submit'  onClick={() => setIsWorkflowHistoryOpen(true)} >Workflow History</button> */}
          <a
            className="skel-btn-submit"
            data-target="#skel-view-modal-workflow"
            data-toggle="modal"
            onClick={() => setIsWorkflowHistoryOpen(true)}
          >
            Workflow History
          </a>
        </div>
        <div className="">
          <div className="form-row">
            <div className="col-lg-6 col-md-12 col-xs-12">
              <div className="skel-view-base-card">
                <div className="skel-profile-base">
                  {/* <img src={profileLogo} alt="" className="img-fluid" width="50" height="50" /> */}
                  <div className="skel-profile-info">
                    {customerDetails && (
                      <CustomerDetailsFormViewMin
                        data={{
                          customerData: customerDetails,
                          hideAccSerInt: true,
                          source: "INTERACTION",
                        }}
                        handler={{ setCustomerDetails }}
                      />
                    )}
                    {/* <span className="skel-profile-name">{interactionData?.customerDetails?.firstName || ""} {interactionData?.customerDetails?.lastName || ""}</span>
                                        <span><a >{interactionData?.customerDetails?.customerContact[0]?.emailId || ""}</a></span>
                                        <span>+ {interactionData?.customerDetails?.customerContact[0]?.mobilePrefix || ""} {interactionData?.customerDetails?.customerContact[0]?.mobileNo || ""}</span>
                                        <p className="mt-1">
                                            <span className="skel-business">{interactionData?.customerDetails?.customerCategory?.description || ""}</span>
                                            <span className="skel-active">{interactionData?.customerDetails?.status?.description || ""}</span>
                                        </p> */}
                  </div>
                </div>
                <hr className="cmmn-hline" />
                <div className="skel-inter-view-history">
                  <span className="skel-header-title">Interactions</span>
                  <div className="skel-tot-inter">
                    <div className="skel-tot">
                      Total
                      <span>
                        <a
                          data-toggle="modal"
                          data-target="#skel-view-modal-interactions"
                          onClick={() => {
                            handleInteractionModal("TOTAL");
                          }}
                        >
                          {interactionCustomerHistory?.totalInteractionCount ||
                            0}
                        </a>
                      </span>
                    </div>
                    <div className="skel-tot">
                      Open
                      <span>
                        <a
                          data-toggle="modal"
                          data-target="#skel-view-modal-interactions"
                          onClick={() => {
                            handleInteractionModal("OPEN");
                          }}
                        >
                          {interactionCustomerHistory?.openInteraction}
                        </a>
                      </span>
                    </div>
                    <div className="skel-tot">
                      Closed
                      <span>
                        <a
                          data-toggle="modal"
                          data-target="#skel-view-modal-interactions"
                          onClick={() => {
                            handleInteractionModal("CLOSED");
                          }}
                        >
                          {interactionCustomerHistory?.closedInteraction}
                        </a>
                      </span>
                    </div>
                  </div>
                </div>
                <img src={vImp} alt="" className="img-fluid skel-place-img" />
              </div>
            </div>
            <div className="col-lg-6 col-md-12 col-xs-12">
              {/* <div className="skel-view-base-card">
                                <span className="skel-profile-heading">Interaction Flow</span>
                                <div className="skel-ai-sect">
                                    <IntelligenceCorner />
                                </div>
                            </div> */}
              <div className="skel-view-base-card">
                <span className="skel-profile-heading">
                  Resolution History on this Statement
                </span>
                <InteractionResolutionHistory
                  data={{
                    chartData: interactionInsightCount?.solutioned || [],
                    isSoluationActivityOpen,
                  }}
                  handler={{
                    setIsSoluationActivityOpen,
                  }}
                />
              </div>
            </div>
          </div>
          <div className="form-row">
            <div className="col-lg-7 col-md-12 col-xs-12">
              <div className="skel-view-base-card mh-370">
                <div className="skel-inter-statement">
                  {/* <span className="skel-profile-heading">Interaction Details</span> */}

                  <ul className="mt-0">
                    <li className="skel-lbl-flds">Statement</li>
                  </ul>

                  <div className="skel-tbl-col">
                    <div className="skel-heading">
                      {interactionData?.requestStatement}
                    </div>
                    <div className="skel-view-interaction-stat">
                      <div className="view-int-details-key">
                        <p>
                          <span className="skel-lbl-f-sm">Interaction No</span>{" "}
                          <span>:</span>
                          <span>{interactionData?.intxnNo}</span>
                        </p>
                        <p>
                          <span className="skel-lbl-f-sm">Category</span>{" "}
                          <span>:</span>
                          <span>
                            {interactionData?.intxnCategory?.description}
                          </span>
                        </p>
                        <p>
                          <span className="skel-lbl-f-sm">Type</span>{" "}
                          <span>:</span>
                          <span>{interactionData?.intxnType?.description}</span>
                        </p>
                        <p>
                          <span className="skel-lbl-f-sm">
                            Service Category
                          </span>{" "}
                          <span>:</span>
                          <span>
                            {interactionData?.serviceCategory?.description}
                          </span>
                        </p>
                        <p>
                          <span className="skel-lbl-f-sm">Service Type</span>{" "}
                          <span>:</span>
                          <span>
                            {interactionData?.serviceType?.description}
                          </span>
                        </p>
                        <p>
                          <span className="skel-lbl-f-sm">Channel</span>{" "}
                          <span>:</span>
                          <span>
                            {interactionData?.intxnChannel?.description}
                          </span>
                        </p>
                      </div>
                      <div className="view-int-details-key">
                        <p>
                          <span className="skel-lbl-f-sm">
                            Contact Preference
                          </span>{" "}
                          <span>:</span>
                          <span>
                            {(interactionData?.contactPreference &&
                              interactionData?.contactPreference[0]
                                ?.description) ||
                              ""}
                          </span>
                        </p>
                        <p>
                          <span className="skel-lbl-f-sm">Priority</span>{" "}
                          <span>:</span>
                          <span className="txt-r-color">
                            {interactionData?.intxnPriority?.description}
                          </span>
                        </p>
                        <p>
                          <span className="skel-lbl-f-sm">
                            Current Deparment / Role
                          </span>{" "}
                          <span>:</span>
                          <span>
                            {interactionData?.currentDepartment?.description
                              ?.unitDesc || ""}{" "}
                            /{" "}
                            {interactionData?.currentRole?.description
                              ?.roleDesc || ""}
                          </span>
                        </p>
                        <p>
                          <span className="skel-lbl-f-sm">Current User</span>{" "}
                          <span>:</span>
                          <span>
                            {interactionData?.currentUser?.description
                              ?.firstName || ""}{" "}
                            {interactionData?.currentUser?.description
                              ?.lastName || ""}
                          </span>
                        </p>
                        <p>
                          <span className="skel-lbl-f-sm">Status</span>{" "}
                          <span>:</span>
                          <span>
                            {interactionData?.intxnStatus?.description}
                          </span>
                        </p>
                      </div>
                    </div>
                    <hr className="cmmn-hline" />
                    <p>
                      <span className="skel-lbl-f-sm">
                        Solutions Solved by:
                      </span>{" "}
                      {interactionData?.isResolvedBy === "BOT"
                        ? "BOT ✅ " + " HUMAN ❌"
                        : "BOT ❌ " + " HUMAN ✅"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-5 col-md-12 col-xs-12">
              <div className="skel-view-base-card mh-370">
                <div>
                  <span className="skel-profile-heading">
                    Other Customers with same interaction statement
                  </span>
                  <div className="skel-wrk-ord-insight">
                    <InteractionCustomerHistory
                      data={{
                        chartData: interactionInsightCount?.customer || [],
                        roseType: "area",
                        isCustomerActivityOpen,
                      }}
                      handler={{
                        setIsCustomerActivityOpen,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="form-row">
            <div className="col-lg-5 col-md-12 col-xs-12">
              <div className="skel-view-base-card">
                <span className="skel-profile-heading">{`Product (${serviceList?.length || 0
                  })`}</span>
                {serviceList && serviceList.length > 0 ? (
                  <Slider {...recentActivitySettings} className="px-0">
                    {serviceList.map((val, idx) => (
                      <div
                        key={idx}
                        className="skel-wrk-ord-summ"
                        data-Modal={val}
                      >
                        {console.log(val)}
                        <div className="skel-heading">
                          Product Name:{" "}
                          {val?.productDetails?.[0]?.productName || ""}
                        </div>
                        <div className="skel-wrk-ord-graph skel-ord-prdt-name mt-4">
                          <div className="pieID pie">
                            <img
                              src={val?.productDetails?.[0]?.productImage}
                              alt="ProductImage"
                              srcSet=""
                              className="skel-prdt-cust-size"
                            />
                          </div>
                          <div className="view-int-details-key ml-2">
                            <p>
                              <span className="skel-lbl-f-sm">
                                Product Type
                              </span>{" "}
                              <span>:</span>
                              <span>
                                {val?.productDetails?.[0][
                                  "productTypeDescription.description"
                                ] || ""}
                              </span>
                            </p>
                            <p>
                              <span className="skel-lbl-f-sm">Status</span>{" "}
                              <span>:</span>
                              <span
                                className={getStatusClass(
                                  val?.serviceStatus?.description ||
                                  "skel-d-status"
                                )}
                              >
                                {val?.serviceStatus?.description || ""}
                              </span>
                            </p>
                            <p>
                              <span className="skel-lbl-f-sm">Amount</span>{" "}
                              <span>:</span>
                              <span>
                                {Number(
                                  val?.productDetails?.[0][
                                  "productChargesList.chargeAmount"
                                  ]
                                ) || "0"}
                              </span>
                            </p>
                            <p>
                              <span className="skel-lbl-f-sm">Agreement</span>{" "}
                              <span>:</span>
                              <span>-</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </Slider>
                ) : (
                  <span className="skel-widget-warning">
                    No Products Available
                  </span>
                )}
              </div>
            </div>
            <div className="col-lg-4 col-md-12 col-xs-12">
              <div className="skel-view-base-card">
                <span className="skel-profile-heading">Channel Activity</span>
                <InteractionChannelActivity
                  data={{
                    chartData: interactionInsightCount?.channel || [],
                    isChannelActivityOpen,
                  }}
                  handler={{
                    setIsChannelActivityOpen,
                    setChannelActivityType,
                  }}
                />
              </div>
            </div>
            <div className="col-lg-3 col-md-12 col-xs-12">
              <div className="skel-view-base-card">
                <span className="skel-profile-heading">
                  Appointment Details
                </span>
                {!isEmpty(appointmentDetails) ? (
                  <>
                    <div className="skel-appt-det">
                      <div className="skel-appt-date">
                        {moment(
                          appointmentDetails?.rows?.[0]?.appointDate
                        ).format("DD MMM")}{" "}
                        <span>
                          {" "}
                          {moment(
                            appointmentDetails?.rows?.[0]?.appointDate
                          ).format("YYYY")}
                        </span>
                      </div>
                      <div className="skel-appt-bk-det">
                        <span>
                          {customerDetails?.firstName ||
                            customerDetails?.lastName}
                        </span>
                        <span>
                          {(customerDetails?.customerContact &&
                            customerDetails?.customerContact?.[0]?.mobileNo) ||
                            "NA"}
                        </span>
                        <span className="skel-cr-date">
                          {appointmentDetails?.rows?.[0]?.appointStartTime
                            ? moment(
                              "1970-01-01 " +
                              appointmentDetails?.rows?.[0]
                                ?.appointStartTime
                            ).format("hh:mm a")
                            : "-"}
                          -
                          {appointmentDetails?.rows?.[0]?.appointEndTime
                            ? moment(
                              "1970-01-01 " +
                              appointmentDetails?.rows?.[0]?.appointEndTime
                            ).format("hh:mm a")
                            : ""}
                        </span>
                        <div className="skel-appt-type-bk">
                          <ul>
                            <li className="skel-ty-clr">
                              {
                                appointmentDetails?.rows?.[0]?.status
                                  ?.description
                              }
                            </li>
                            <li className="skel-ch-clr">
                              {
                                appointmentDetails?.rows?.[0]?.appointMode
                                  ?.description
                              }
                            </li>
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
                    {!isEmpty(appointmentDetails?.insight) && (
                      <div className="skel-widget-warning">
                        {appointmentDetails?.insight?.message}
                      </div>
                    )}
                  </>
                ) : (
                  <span className="skel-widget-warning">
                    {" "}
                    No Appointment Available!!!
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="form-row">
            <div
              className={
                permissions.readOnly !== true ? "col-md-6" : "col-md-12"
              }
            >
              <div className="skel-view-base-card skel-emoji-sect-base">
                <span className="skel-profile-heading">
                  Last 5 Interactions
                </span>
                {/* <div className="skel-ls-inter-det mt-2">
                                    <div className="skel-inter-hist">
                                        <span>Purchased a Plan C</span>
                                        <span className="skel-cr-date">23 Feb, 2023</span>
                                    </div>

                                    <div className="skel-inter-hist">
                                        <span>Upgrade the plan to premium plan</span>
                                        <span className="skel-cr-date">23 Feb, 2023</span>
                                    </div>
                                </div> */}
                <div className="skel-emoj-data mt-3">
                  <CustomerJourney
                    data={{ customerEmotions, height: "350%" }}
                  />

                  {/* <img src={emojiIcon} alt="" className="img-fluid" /> */}
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-md-12 col-xs-12">
              {permissions.readOnly !== true && (
                <>
                  <div className="skel-form-sect">
                    <div className="form-group">
                      {/* <label htmlFor="Contactpreferenece" className="control-label">Remarks</label>
                                            <textarea className="form-control" maxlength="2500" id="remarks" name="remarks" rows="4"></textarea> */}
                      <label htmlFor="remarks" className="control-label">
                        Add Additional Remarks
                      </label>
                      <textarea
                        disabled={permissions.readOnly}
                        maxLength="2500"
                        className={`form-control ${error.remarks && "error-border"
                          }`}
                        id="remarks"
                        name="remarks"
                        rows="4"
                        value={interactionInputs.remarks}
                        onChange={handleOnTicketDetailsInputsChange}
                        autofocus
                      ></textarea>
                      <span className="errormsg">
                        {error.remarks ? error.remarks : ""}
                      </span>
                      <span>Maximum 2500 characters</span>
                    </div>
                    <div className="row">
                      <div className="col-md-4">
                        <div className="form-group">
                          <label
                            htmlFor="currStatus"
                            className="col-form-label"
                          >
                            Status
                            <span className="text-danger font-20 pl-1 fld-imp">
                              *
                            </span>
                          </label>
                          <select
                            disabled={permissions.readOnly}
                            id="currStatus"
                            value={interactionInputs.currStatus}
                            onChange={(e) => {
                              handleStatusChange(e);
                            }}
                            className={`form-control ${error.currStatus && "error-border"
                              }`}
                          >
                            <option key="status" value="">
                              Select Status
                            </option>
                            {currStatusLookup &&
                              currStatusLookup.map((currStatus, index) => (
                                <option key={index} value={currStatus.code}>
                                  {currStatus.description}
                                </option>
                              ))}
                          </select>
                          <span className="errormsg">
                            {error.currStatus ? error.currStatus : ""}
                          </span>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label
                            htmlFor="assignRole"
                            className="col-form-label"
                          >
                            Department/Role
                            <span className="text-danger font-20 pl-1 fld-imp">
                              *
                            </span>
                          </label>
                          <select
                            disabled={permissions.readOnly}
                            id="assignRole"
                            value={interactionInputs.assignRole}
                            onChange={(e) => {
                              handleOnTicketDetailsInputsChange(e);
                            }}
                            className={`form-control ${error.assignRole && "error-border"
                              }`}
                          >
                            <option key="role" value="" data-entity="">
                              Select Role
                            </option>
                            {roleLookup &&
                              roleLookup.map((dept, key) => (
                                <optgroup
                                  key={key}
                                  label={dept?.entity[0]?.unitDesc}
                                >
                                  {!!dept.roles.length &&
                                    dept.roles.map((data, childKey) => (
                                      <option
                                        key={childKey}
                                        value={data.roleId}
                                        data-entity={JSON.stringify(
                                          dept.entity[0]
                                        )}
                                      >
                                        {data.roleDesc}
                                      </option>
                                    ))}
                                </optgroup>
                              ))}
                          </select>
                          <span className="errormsg">
                            {error.assignRole ? error.assignRole : ""}
                          </span>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="user" className="col-form-label">
                            User
                          </label>
                          <select
                            disabled={permissions.readOnly}
                            id="user"
                            className={`form-control ${error.user && "error-border"
                              }`}
                            value={interactionInputs.user}
                            onChange={handleOnTicketDetailsInputsChange}
                          >
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
                  <div className="skel-pg-bot-sect-btn">
                    <div className="skel-btn-sect">
                      <Link
                        className="skel-btn-cancel"
                        to={`${process.env.REACT_APP_BASE}/`}
                      >
                        Cancel
                      </Link>
                      <button
                        className="skel-btn-submit"
                        disabled={permissions.readOnly}
                        onClick={handleTicketDetailsSubmit}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={isWorflowHistoryOpen}
        contentLabel="Followup Modal"
        style={RegularModalCustomStyles}
      >
        <>
          <div
            className="modal fade order-search"
            id="skel-view-modal-workflow"
            tabindex="-1"
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header px-4 border-bottom-0 d-block">
                  <button
                    type="button"
                    className="close"
                    data-dismiss="modal"
                    aria-hidden="true"
                    onClick={() => setIsWorkflowHistoryOpen(false)}
                  >
                    &times;
                  </button>
                  <h5 className="modal-title">
                    {!isFollowUpHistoryOpen
                      ? "Workflow History"
                      : "Followup History"}{" "}
                    for Interaction No {interactionData?.intxnNo}
                  </h5>
                </div>
                <div className="modal-body px-4">
                  <div className="row">
                    <div className="col-md-12 pull-right">
                      <button
                        type="button"
                        className="skel-btn-submit"
                        onClick={(e) => {
                          e.preventDefault();
                          if (followUpHistory?.count === 0) {
                            toast.error(
                              "No follow-up is available for this interaction."
                            );
                            return;
                          }
                          setIsFollowUpHistoryOpen(!isFollowUpHistoryOpen);
                        }}
                      >
                        {!isFollowUpHistoryOpen
                          ? `Followup History - ${followUpHistory?.count}`
                          : `WorkFlow History - ${workflowHistory?.count}`}
                      </button>
                    </div>
                  </div>
                  {!isFollowUpHistoryOpen ? (
                    <div className="timeline-workflow">
                      <ul>
                        {workflowHistory?.rows &&
                          workflowHistory?.rows.length > 0 &&
                          workflowHistory?.rows.map((data) => (
                            <li>
                              <div className="content">
                                <div className="row">
                                  <div className="col-md-4">
                                    <div className="form-group">
                                      <label
                                        htmlFor="Interactiontype"
                                        className="control-label"
                                      >
                                        From Department/Role
                                      </label>
                                      <span className="data-cnt">
                                        {data?.fromEntityName?.unitDesc || ""} -{" "}
                                        {data?.fromRoleName?.roleDesc || ""}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="col-md-4">
                                    <div className="form-group">
                                      <label
                                        htmlFor="Servicetype"
                                        className="control-label"
                                      >
                                        To Department/Role
                                      </label>
                                      <span className="data-cnt">
                                        {data?.toEntityName?.unitDesc || ""} -{" "}
                                        {data?.toRoleName?.roleDesc || ""}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="col-md-4">
                                    <div className="form-group">
                                      <label
                                        htmlFor="Channel"
                                        className="control-label"
                                      >
                                        User
                                      </label>
                                      <span className="data-cnt">
                                        {data.flwCreatedby.flwCreatedBy}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="row">
                                  <div className="col-md-4">
                                    <div className="form-group">
                                      <label
                                        htmlFor="Interactiontype"
                                        className="control-label"
                                      >
                                        Status
                                      </label>
                                      <span className="data-cnt">
                                        {data?.statusDescription?.description}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="col-md-4">
                                    <div className="form-group">
                                      <label
                                        htmlFor="Servicetype"
                                        className="control-label"
                                      >
                                        Action Performed
                                      </label>
                                      <span className="data-cnt">
                                        {data?.flowActionDesc?.description}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="row">
                                  <div className="col-md-12">
                                    <div className="form-group">
                                      <label
                                        htmlFor="Interactiontype"
                                        className="control-label"
                                      >
                                        Comments
                                      </label>
                                      <span className="data-cnt">
                                        {data?.remarks}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="time">
                                <h4>
                                  {moment(
                                    data?.intxnCreatedDate || new Date()
                                  ).format("DD MMM YYYY hh:mm:ss A")}
                                </h4>
                              </div>
                            </li>
                          ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="timeline-workflow">
                      <ul>
                        {followUpHistory?.rows &&
                          followUpHistory?.rows.length > 0 &&
                          followUpHistory?.rows.map((data) => (
                            <li>
                              <div className="content">
                                <div className="row">
                                  <div className="col-md-4">
                                    <div className="form-group">
                                      <label
                                        htmlFor="Interactiontype"
                                        className="control-label"
                                      >
                                        From Department/Role
                                      </label>
                                      <span className="data-cnt">
                                        {data?.fromEntityName?.unitDesc || ""} -{" "}
                                        {data?.fromRoleName?.roleDesc || ""}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="col-md-4">
                                    <div className="form-group">
                                      <label
                                        htmlFor="Servicetype"
                                        className="control-label"
                                      >
                                        To Department/Role
                                      </label>
                                      <span className="data-cnt">
                                        {data?.toEntityName?.unitDesc || ""} -{" "}
                                        {data?.toRoleName?.roleDesc || ""}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="col-md-4">
                                    <div className="form-group">
                                      <label
                                        htmlFor="Channel"
                                        className="control-label"
                                      >
                                        User
                                      </label>
                                      <span className="data-cnt">
                                        {data.flwCreatedby.flwCreatedBy}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="row">
                                  <div className="col-md-4">
                                    <div className="form-group">
                                      <label
                                        htmlFor="Interactiontype"
                                        className="control-label"
                                      >
                                        Status
                                      </label>
                                      <span className="data-cnt">
                                        {data?.statusDescription?.description}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="col-md-4">
                                    <div className="form-group">
                                      <label
                                        htmlFor="Servicetype"
                                        className="control-label"
                                      >
                                        Action Performed
                                      </label>
                                      <span className="data-cnt">
                                        {data?.flowActionDesc?.description}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="row">
                                  <div className="col-md-12">
                                    <div className="form-group">
                                      <label
                                        htmlFor="Interactiontype"
                                        className="control-label"
                                      >
                                        Comments
                                      </label>
                                      <span className="data-cnt">
                                        {data?.remarks}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="time">
                                <h4>
                                  {moment(
                                    data?.intxnCreatedDate || new Date()
                                  ).format("DD MMM YYYY hh:mm:ss A")}
                                </h4>
                              </div>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      </Modal>
      <Modal
        isOpen={isFollowupOpen}
        contentLabel="Followup Modal"
        style={RegularModalCustomStyles}
      >
        <div
          className="modal-center"
          id="cancelModal"
          tabindex="-1"
          role="dialog"
          aria-labelledby="cancelModal"
          aria-hidden="true"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="cancelModal">
                  Followup for Interaction No {interactionData?.intxnNo}
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                  onClick={() => setIsFollowupOpen(false)}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <hr className="cmmn-hline" />
                <div className="clearfix"></div>
                <div className="row">
                  <div className="col-md-12 pt-2">
                    <p style={{ fontWeight: "600" }}>
                      You Currently have {followUpHistory?.count || 0}{" "}
                      <a style={{ textDecoration: "underline" }}>
                        Followup(s)
                      </a>
                    </p>
                  </div>
                </div>
                <div className="row pt-3">
                  <div className="col-6">
                    <div className="form-group">
                      <label htmlFor="priority" className="col-form-label">
                        Priority{" "}
                        <span className="text-danger font-20 pl-1 fld-imp">
                          *
                        </span>
                      </label>
                      <select
                        required
                        value={followupInputs.priority}
                        id="priority"
                        className="form-control"
                        onChange={handleOnFollowupInputsChange}
                      >
                        <option key="priority" value="">
                          Select Priority
                        </option>
                        {priorityLookup &&
                          priorityLookup.map((e) => (
                            <option key={e.code} value={e.code}>
                              {e.description}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group">
                      <label htmlFor="source" className="col-form-label">
                        Source{" "}
                        <span className="text-danger font-20 pl-1 fld-imp">
                          *
                        </span>
                      </label>
                      <select
                        required
                        id="source"
                        className="form-control"
                        value={followupInputs.source}
                        onChange={handleOnFollowupInputsChange}
                      >
                        <option key="source" value="">
                          Select Source
                        </option>
                        {sourceLookup &&
                          sourceLookup.map((e) => (
                            <option key={e.code} value={e.code}>
                              {e.description}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-12 ">
                    <div className="form-group ">
                      <label
                        htmlFor="inputState"
                        className="col-form-label pt-0"
                      >
                        Remarks{" "}
                        <span className="text-danger font-20 pl-1 fld-imp">
                          *
                        </span>
                      </label>
                      <textarea
                        required
                        className="form-control"
                        maxLength="2500"
                        id="remarks"
                        value={followupInputs.remarks}
                        onChange={handleOnFollowupInputsChange}
                        name="remarks"
                        rows="4"
                      ></textarea>
                      <span>Maximum 2500 characters</span>
                    </div>
                  </div>
                  <div className="col-md-12 pl-2">
                    <div className="form-group pb-1">
                      <div className="d-flex justify-content-center">
                        <button
                          type="button"
                          className="skel-btn-cancel"
                          onClick={() => setIsFollowupOpen(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="skel-btn-submit"
                          onClick={handleOnAddFollowup}
                        >
                          Submit
                        </button>
                        
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isReAssignOpen}
        contentLabel="Followup Modal"
        style={RegularModalCustomStyles}
      >
        <div
          className="modal-center"
          id="reassignModal"
          tabindex="-1"
          role="dialog"
          aria-labelledby="reassignModal"
          aria-hidden="true"
        >
          <div className="modal-dialog " role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="reassignModal">
                  Re-assign for Interaction No - {interactionData?.intxnNo}
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                  onClick={() => setIsReAssignOpen(false)}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <hr className="cmmn-hline" />
                <div className="clearfix"></div>
                <div className="row pt-4">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="reAssignUser" className="control-label">
                        User{" "}
                        <span className="text-danger font-20 pl-1 fld-imp">
                          *
                        </span>
                      </label>
                      <select
                        required
                        value={reAssignInputs.userId}
                        id="reAssignUser"
                        className="form-control"
                        onChange={handleOnReAssignInputsChange}
                      >
                        <option key="reAssignUser" value="">
                          Select User
                        </option>
                        {reAssignUserLookup &&
                          reAssignUserLookup.map((user) => (
                            <option key={user.userId} value={user.userId}>
                              {user?.firstName || ""} {user?.lastName || ""}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="col-md-12 pl-2 mt-2">
                  <div className="form-group pb-1">
                    <div className="d-flex justify-content-center">
                      <button
                        type="button"
                        className="skel-btn-cancel"
                        onClick={() => setIsReAssignOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="skel-btn-submit"
                        onClick={handleOnReAssign}
                      >
                        Submit
                      </button>
                      
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isCancelOpen}
        contentLabel="Followup Modal"
        style={RegularModalCustomStyles}
      >
        <div
          className="modal-center"
          id="followupModal"
          tabindex="-1"
          role="dialog"
          aria-labelledby="followupModal"
          aria-hidden="true"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="followupModal">
                  Cancellation for Interaction No - {interactionData?.intxnNo}
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                  onClick={() => setIsCancelOpen(false)}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <hr className="cmmn-hline" />
                <div className="clearfix"></div>
                <div className="row">
                  <div className="col-md-12">
                    <div className="cancel-info">
                      Once you cancel you can't reassign/change the status
                      again. <br />
                      Before proceeding to "Cancel" you must agree to proceed!
                    </div>
                  </div>
                </div>
                <div className="row pt-3">
                  <div className="col-md-12 pb-3">
                    <div className="form-group ">
                      <label
                        htmlFor="cancellationReason"
                        className="col-form-label"
                      >
                        Reason for Cancellation{" "}
                        <span className="text-danger font-20 pl-1 fld-imp">
                          *
                        </span>
                      </label>
                      <select
                        value={cancellationReason}
                        id="cancellationReason"
                        className="form-control"
                        onChange={(e) => setCancellationReason(e.target.value)}
                        required
                      >
                        <option key="cancellationReason" value="">
                          Select Reason
                        </option>
                        {cancellationReasonLookup &&
                          cancellationReasonLookup.map((e) => (
                            <option key={e.code} value={e.code}>
                              {e.description}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-12 pl-2">
                    <div className="form-group pb-1">
                      <div className="d-flex justify-content-center">
                        
                        <button
                          type="button"
                          className="btn skel-btn-cancel"
                          onClick={() => setIsCancelOpen(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn skel-btn-submit"
                          onClick={handleOnCancel}
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <Modal isOpen={isInteractionListOpen} style={RegularModalCustomStyles}>
        <div
          className="modal fade order-search"
          id="skel-view-modal-interactions"
          tabindex="-1"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header px-4 border-bottom-0 d-block">
                <button
                  onClick={handleOnModelClose}
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-hidden="true"
                >
                  &times;
                </button>
                <h5 className="modal-title">
                  Interaction Details for {appConfig?.clientFacingName?.customer ?? 'Customer'} Number{" "}
                  {customerDetails?.customerNo}
                </h5>
              </div>
              {/* {console.log(interactionCustomerHistory?.openInteraction,  interactionCustomerHistory?.closedInteraction, interactionData)} */}
              <div className="modal-body px-4">
                <form
                  className="needs-validation p-2"
                  name="event-form"
                  id="form-event"
                  novalidate
                >
                  <div className="">
                    {interactionCustomerHistoryDetails.length > 0 && (
                      <DynamicTable
                        listKey={"Interactions"}
                        row={interactionCustomerHistoryDetails}
                        rowCount={totalCount}
                        header={interactionListColumns}
                        // fixedHeader={true}
                        itemsPerPage={perPageModal}
                        isScroll={true}
                        backendPaging={true}
                        // isTableFirstRender={tableRef}
                        // hasExternalSearch={hasExternalSearch}
                        backendCurrentPage={currentPageModal}
                        url={`${properties.INTERACTION_API
                          }/get-customer-history/${customerUuid
                          }?type=ROWS&limit=${perPageModal}&page=${currentPageModal}${interactionStatusType
                            ? `&status=${interactionStatusType}`
                            : ""
                          }`}
                        method="POST"
                        handler={{
                          handleCellRender: handleCellRender,
                          handlePageSelect: handlePageSelect,
                          handleItemPerPage: setPerPageModal,
                          handleCurrentPage: setCurrentPageModal,
                        }}
                      />
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isChannelActivityOpen}
        contentLabel="Followup Modal"
        style={RegularModalCustomStyles}
      >
        <div
          className="modal-center"
          id="followupModal"
          tabindex="-1"
          role="dialog"
          aria-labelledby="followupModal"
          aria-hidden="true"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="followupModal">
                  Interaction Details for {appConfig?.clientFacingName?.customer ?? 'Customer'} Number {customerDetails?.customerNo}
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                  onClick={handleOnCloseChannelModal}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body px-4">
                <form
                  className="needs-validation p-2"
                  name="event-form"
                  id="form-event"
                  novalidate
                >
                  <div className="">
                    {channelInteractionInsight.length > 0 && (
                      <DynamicTable
                        listKey={"Interactions"}
                        row={channelInteractionInsight}
                        rowCount={channelActivityTotalCount}
                        header={interactionListColumns}
                        // fixedHeader={true}
                        itemsPerPage={channelActivityPerPageModal}
                        isScroll={true}
                        backendPaging={true}
                        backendCurrentPage={channelActivityCurrentPageModal}
                        // url={`${properties.INTERACTION_API}/get-customer-history/${props?.location?.state?.data?.customerUid}?type=ROWS&limit=${perPageModal}&page=${currentPageModal}${interactionStatusType ? `&status=${interactionStatusType}` : ''}`}
                        // method='POST'
                        handler={{
                          handleCellRender: handleCellRender,
                          handlePageSelect: handlePageSelectforChannelActivity,
                          handleItemPerPage: setChannelActivityPerPageModal,
                          handleCurrentPage: setChannelActivityCurrentPageModal,
                        }}
                      />
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isCustomerActivityOpen}
        contentLabel="Followup Modal"
        style={RegularModalCustomStyles}
      >
        <div
          className="modal-center"
          id="followupModal"
          tabindex="-1"
          role="dialog"
          aria-labelledby="followupModal"
          aria-hidden="true"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="followupModal">
                  Customer list raised similar statement
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                  onClick={handleOnCloseCustomerModal}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body px-4">
                <form
                  className="needs-validation p-2"
                  name="event-form"
                  id="form-event"
                  novalidate
                >
                  <div className="">
                    {customerInteractionInsight.length > 0 && (
                      <DynamicTable
                        listKey={"Interactions"}
                        row={customerInteractionInsight}
                        rowCount={CustomerActivityTotalCount}
                        header={CustomerSearchColumns}
                        // fixedHeader={true}
                        itemsPerPage={CustomerActivityPerPageModal}
                        isScroll={true}
                        backendPaging={true}
                        backendCurrentPage={CustomerActivityCurrentPageModal}
                        // url={`${properties.INTERACTION_API}/get-customer-history/${props?.location?.state?.data?.customerUid}?type=ROWS&limit=${perPageModal}&page=${currentPageModal}${interactionStatusType ? `&status=${interactionStatusType}` : ''}`}
                        // method='POST'
                        handler={{
                          handleCellRender: handleCellRender,
                          handlePageSelect: handlePageSelectforCustomerActivity,
                          handleItemPerPage: setCustomerActivityPerPageModal,
                          handleCurrentPage:
                            setCustomerActivityCurrentPageModal,
                        }}
                      />
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isSoluationActivityOpen}
        contentLabel="Followup Modal"
        style={RegularModalCustomStyles}
      >
        <div
          className="modal-center"
          id="followupModal"
          tabindex="-1"
          role="dialog"
          aria-labelledby="followupModal"
          aria-hidden="true"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="followupModal">
                  Similar Interaction Details{" "}
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                  onClick={handleOnCloseSoluationModal}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body px-4">
                <form
                  className="needs-validation p-2"
                  name="event-form"
                  id="form-event"
                  novalidate
                >
                  <div className="">
                    {soluationInteractionInsight.length > 0 && (
                      <DynamicTable
                        listKey={"Interactions"}
                        row={soluationInteractionInsight}
                        rowCount={soluationActivityTotalCount}
                        header={interactionListColumns}
                        // fixedHeader={true}
                        itemsPerPage={soluationActivityPerPageModal}
                        isScroll={true}
                        backendPaging={true}
                        backendCurrentPage={soluationActivityCurrentPageModal}
                        // url={`${properties.INTERACTION_API}/get-customer-history/${props?.location?.state?.data?.customerUid}?type=ROWS&limit=${perPageModal}&page=${currentPageModal}${interactionStatusType ? `&status=${interactionStatusType}` : ''}`}
                        // method='POST'
                        handler={{
                          handleCellRender: handleCellRender,
                          handlePageSelect: handlePageSelectforSolutionActivity,
                          handleItemPerPage: setSoluationActivityPerPageModal,
                          handleCurrentPage:
                            setSoluationActivityCurrentPageModal,
                        }}
                      />
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const interactionListColumns = [
  {
    Header: "Interaction No",
    accessor: "intxnId",
    disableFilters: true,
  },
  {
    Header: "Remarks",
    accessor: "remarks",
    disableFilters: true,
  },
  // {
  //     Header: "Interaction Category",
  //     accessor: "intxnCategoryDesc.description",
  //     disableFilters: true
  // },
  // {
  //     Header: "Interaction Type",
  //     accessor: "srType.description",
  //     disableFilters: true
  // },
  // {
  //     Header: "Service Category",
  //     accessor: "categoryDescription.description",
  //     disableFilters: true
  // },
  // {
  //     Header: "Service Type",
  //     accessor: "serviceTypeDesc.description",
  //     disableFilters: true
  // },
  // {
  //     Header: "Status",
  //     accessor: "currStatusDesc.description",
  //     disableFilters: true
  // },
  {
    Header: "Created At",
    accessor: "createdAt",
    disableFilters: true,
  },
];

const CustomerSearchColumns = [
  {
    Header: "Customer Number",
    accessor: "customerNo",
    id: "customerNo",
  },
  {
    Header: "Customer Name",
    accessor: "firstName",
    disableFilters: false,
    id: "customerName",
  },
  {
    Header: "Mobile Number",
    accessor: "customerContact[0].mobileNo",
    id: "mobileNo",
    disableFilters: false,
  },
  {
    Header: "Email",
    accessor: "customerContact[0].emailId",
    disableFilters: true,
  },
  {
    Header: "Customer Status",
    accessor: "statusDesc.description",
    disableFilters: true,
    id: "customerServiceStatus",
  },
];

export default EditViewInteractionPage;
