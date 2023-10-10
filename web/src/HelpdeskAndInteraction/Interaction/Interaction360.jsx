/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { object, string } from "yup";
// import vImp from "../../assets/images/v-img.png";
import moment from "moment";
import { unstable_batchedUpdates } from "react-dom";
import Modal from "react-modal";
import { Link } from "react-router-dom";
import { history } from "../../common/util/history";
// import Slider from "react-slick";
import Swal from "sweetalert2";
import { AppContext } from "../../AppContext";
import { get, post, put } from "../../common/util/restUtil";
import { RegularModalCustomStyles } from "../../common/util/util";
import { properties } from "../../properties";
// import OrderJourney from './OrderJourney';
import { isEmpty } from "lodash";
// import CustomerDetailsFormViewMin from "../../CRM/Customer/CustomerDetailsFormViewMin";
// import CustomerJourney from "../../CRM/Customer/CustomerJourney";
// import IntelligenceCorner from "../../CRM/Customer/IntelligenceCorner";
import DynamicTable from "../../common/table/DynamicTable";
// import InteractionChannelActivity from "./InteractionChannelActivity";
// import InteractionCustomerHistory from "./InteractionCustomerHistory";
// import InteractionResolutionHistory from "./InteractionResolutionHistory";
import CustomerHistory from "../../CRM/Customer/CustomerHistory";
import EditCustomerModal from "../../CRM/Customer/EditCustomerModal";
import dislike from "../../assets/images/dislike.png";
import like from "../../assets/images/like.png";
import notsure from "../../assets/images/not-sure.png";
import sure from "../../assets/images/sure.png";
import verydislike from "../../assets/images/very-dislike.png";
import CalendarComponent from "../../common/CalendarComponent";
import InteractionChartBar from "./InteractionChartBar";
import InteractionChartBarStacked from "./InteractionChartBarStacked";
import InteractionChartGauge from "./InteractionChartGauge";
import InteractionChartPie from "./InteractionChartPie";
import { statusConstantCode } from "../../AppConstants";
import DynamicForm from "./CreateInteraction/DynamicForm";
import FileUpload from "../../common/uploadAttachment/fileUpload";

const Interaction360 = (props) => {
  const { auth, appConfig } = useContext(AppContext);
  const [submitted, setSubmitted] = useState(false);//Inventory form submitted
  const [interactionData, setInteractionData] = useState({});
  const [intxnContact, setIntxnContact] = useState({});
  const [customerDetails, setCustomerDetails] = useState(
    props?.location?.state?.data?.customerDetails
  );
  // console.log(props?.location?.state?.data)
  // console.log('props?.location?.state?.data?.customerDetails------>', props?.appsConfig)
  const customerUuid = props?.location?.state?.data?.customerUid
    ? props?.location?.state?.data?.customerUid
    : props?.location?.state?.data?.customerDetails?.customerUuid;
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
  const [isEditCustomerDetailsOpen, setIsEditCustomerDetailsOpen] =
    useState(false);
  const [isCustomerDetailsHistoryOpen, setIsCustomerDetailsHistoryOpen] =
    useState(false);
  const [show, setShow] = useState(false);
  const [events, setEvents] = useState([]);
  const [isWorflowHistoryOpen, setIsWorkflowHistoryOpen] = useState(false);
  const [isInteractionListOpen, setIsInteractionListOpen] = useState(false);
  const [isFollowupOpen, setIsFollowupOpen] = useState(false);
  const [popupType, setPopupType] = useState("");
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
  // const [perPage, setPerPage] = useState(10);
  // const [currentPage, setCurrentPage] = useState(0);
  const [revenueDetails, setRevenueDetails] = useState({});

  const [
    interactionCustomerHistoryDetails,
    setInteractionCustomerHistoryDetails,
  ] = useState([]);

  const [statementHistory, setStatementHistory] = useState([]);

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
  // const [CustomerActivityType, setCustomerActivityType] = useState("");
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
  // const [soluationActivityType, setSoluationActivityType] = useState("");
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
  const [values, setValues] = useState([])
  const [isRemarkRequired, setIsRemarkRequired] = useState(false)
  const [currentFiles, setCurrentFiles] = useState([])
  const [existingFiles, setExistingFiles] = useState([])

  // Customer service
  const [serviceList, setServiceList] = useState();
  // const recentActivitySettings = {
  //   dots: true,
  //   infinite: true,
  //   arrows: false,
  //   speed: 500,
  //   slidesToShow: 1,
  //   slidesToScroll: 1,
  //   initialSlide: 0,
  //   autoplay: false,
  //   autoplaySpeed: 10000,
  //   responsive: [
  //     {
  //       breakpoint: 1024,
  //       settings: {
  //         slidesToShow: 1,
  //         slidesToScroll: 1,
  //         infinite: true,
  //         dots: false,
  //       },
  //     },
  //     {
  //       breakpoint: 600,
  //       settings: {
  //         slidesToShow: 1,
  //         slidesToScroll: 1,
  //         initialSlide: 1,
  //       },
  //     },
  //     {
  //       breakpoint: 480,
  //       settings: {
  //         slidesToShow: 1,
  //         slidesToScroll: 1,
  //       },
  //     },
  //   ],
  // };

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

  // const handleOnModelClose = () => {
  //   setIsInteractionListOpen(false);
  // };

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
    const { target } = e;
    if (target?.value === 'REJECT') {
      setIsRemarkRequired(true)
    } else {
      setIsRemarkRequired(false)
    }
    handleOnTicketDetailsInputsChange(e);
    workflowLookup &&
      // eslint-disable-next-line array-callback-return
      workflowLookup.entities.map((unit) => {
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
          unstable_batchedUpdates(() => {
            setInteractionData(response?.data?.rows[0]);
            setCustomerDetails(response?.data?.rows[0].customerDetails);
            setIntxnContact(response?.data?.rows[0].intxnContact);
          })
          let assignRole = !!response?.data?.rows[0]?.currentRole?.code
            ? parseInt(response?.data?.rows[0]?.currentRole?.code)
            : "";
          let assignDept = !!response?.data?.rows[0]?.currentDepartment?.code
            ? response?.data?.rows[0]?.currentDepartment?.code
            : "";
          let user = !!response?.data?.rows[0]?.currentUser?.code
            ? parseInt(response?.data?.rows[0]?.currentUser?.code)
            : "";

          if (response?.data?.rows?.[0].formDetails?.signature) {
            sigPad?.current?.fromDataURL(response?.data?.rows?.[0].formDetails?.signature)
            sigPad?.current?.off()
          }
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
      const statusDetails = currStatusLookup.find(x => x.code == interactionInputs?.currStatus);
      if (statusDetails?.mappingPayload?.requiredFields?.includes("remarks")
        && (!interactionInputs?.remarks || interactionInputs?.remarks == "")
      ) {
        toast.error('Remarks Required.')
        return false
      }

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
            `${properties.INTERACTION_API
            }/get-customer-history/${customerUuid}?limit=${perPageModal}&page=${currentPageModal}${status ? `&status=${status}` : ""
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

  const [statementWiseIntxns, setStatementWiseIntxns] = useState([]);
  const handleCellRenderStatements = (cell, row) => {
    console.log(row);
    if (["open", "closed"].includes(cell.column.id)) {
      return (
        <span onClick={() => {
          setIsInteractionListOpen(true);
          setPopupType("ST-STATEMENTWISE");
          setStatementWiseIntxns(cell.value ?? [])
        }}>{cell.value?.length ?? 0}</span>
      );
    } else {
      return (
        <span>{cell.value}</span>
      );
    }
  }

  const handleCellRender = (cell, row) => {
    if (cell.column.Header === "Interaction No") {
      return (
        <span className="cursor-pointer txt-lnk-cmmn"
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
          {row?.original?.createdAt ? moment(row.original?.createdAt).format("DD-MM-YYYY HH:mm:ss a") : '-'}
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
      setPopupType(status)
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
   * The function takes a status code as input and returns a corresponding CSS className based on the
   * code.
   * @returns The function `getStatusclassName` returns a string representing a CSS className name based on
   * the input `statusCode`. If the `statusCode` matches one of the conditions in the `if` statements,
   * a corresponding className name is returned. If none of the conditions are met, an empty string is
   * returned.
   */
  const getStatusclassName = (statusCode) => {
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
      setIsInteractionListOpen(false);
      setPopupType("");
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
              unstable_batchedUpdates(() => {
                // interactionInputs
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
                // console.log("statusLookup ===> ", statusLookup);
                setCurrStatusLookup(statusLookup);
                // if (statusLookup && statusLookup.length === 1) {
                //   setInteractionInputs({ ...interactionInputs, currStatus: statusLookup?.[0]?.code })
                // }
              })
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
    if (customerUuid && customerUuid !== "") {
      get(properties.CUSTOMER_API + "/customers-interaction/" + customerUuid)
        .then((resp) => {
          if (resp && resp.data) {
            setCustomerEmotions([...resp.data]);
          }
        })
        .catch((error) => console.error(error));

      get(`${properties.CUSTOMER_API}/getCustomerRevenue/${customerUuid}`)
        .then((response) => {
          if (response?.data && response?.data) {
            setRevenueDetails(response?.data);
          }
        })
        .catch((error) => {
          console.error(error);
        })
        .finally();
    }
  }, []);

  const [statementClosed, setStatementClosed] = useState([]);
  const [statementClosedPie, setStatementClosedPie] = useState([]);
  const [statementOpen, setStatementOpen] = useState([]);
  const [statementOpenPie, setStatementOpenPie] = useState([]);
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const [appointmentChart, setAppointmentChart] = useState([]);
  const [categoryAppointmentList, setCategoryAppointmentList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [categoryChannelWise, setCategoryChannelWise] = useState([]);
  const [typeList, setTypeList] = useState([]);
  const [statementChannelWise, setStatementChannelWise] = useState([]);
  const [statementProductWise, setStatementProductWise] = useState([]);
  const [statementAvgDays, setStatementAvgDays] = useState(0);
  const [categoryAvgDays, setCategoryAvgDays] = useState(0);

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
    //get related statement list
    if (interactionData.requestId) {
      get(
        `${properties.INTERACTION_API}/get-related-statement-info/${interactionData.requestId}`
      )
        .then((response) => {
          if (response?.data) {
            // setStatementHistory(
            //   response?.data.interactions.filter(
            //     (e) => e.intxnNo !== interactionData.intxnNo
            //   )
            // );
            setStatementHistory(
              response?.data?.interactions ?? []
            );
            const dataModified = response?.data.interactions.map((x) => ({
              ...x,
              channelDescription: x.channleDescription?.description,
            }));

            const apptModified = response?.data.appointments.map((e) => {
              return { ...e, statusDesc: e.statusDesc?.description };
            });

            const apptList = []
            // console.log('dataModified-------->', dataModified)
            for (const intxn of dataModified) {
              for (const appt of apptModified) {
                if (
                  intxn.intxnNo === appt.tranCategoryNo &&
                  apptList.every((e) => e.intxnNo !== intxn.intxnNo)
                ) {
                  apptList.push({
                    ...appt,
                    ...intxn,
                  });
                }
              }
            }
            setAppointmentHistory(apptList);

            const groupByAppoint = groupBy(apptList, "statusDesc");
            const appointmentKeys = Object.keys(groupByAppoint);
            const appt = [];
            for (const key of appointmentKeys) {
              const obj = {
                name: key,
                value: groupByAppoint[key].length,
              };
              appt.push(obj);
            }

            setAppointmentChart(appt);

            const productData = [];
            for (const intxn of dataModified) {
              for (const prod of response?.data.products) {
                if (Number(intxn?.productId) === Number(prod?.productId) && productData.every((e) => e.intxnNo !== intxn.intxnNo)) {
                  productData.push({
                    ...prod,
                    ...intxn,
                  });
                }
              }
            }
            const groupByProduct = groupBy(productData, "productName");
            const productKeys = Object.keys(groupByProduct);
            const prod = [];
            for (const key of productKeys) {
              const obj = {
                name: key,
                category: {
                  open: groupByProduct[key].filter(
                    (f) =>
                      !["CANCELLED", "CLOSED", "CANCEL"].includes(
                        f.intxnStatus
                      ) // && f.intxnNo !== interactionData.intxnNo
                  ).length,
                  closed: groupByProduct[key].filter(
                    (f) =>
                      ["CANCELLED", "CLOSED", "CANCEL"].includes(
                        f.intxnStatus
                      ) // && f.intxnNo !== interactionData.intxnNo
                  ).length,
                },
              };
              prod.push(obj);
            }
            setStatementProductWise(prod);
            const groupByChannel = groupBy(dataModified, "channelDescription");
            const ch = [];
            const channelKeys = Object.keys(groupByChannel);
            for (const key of channelKeys) {
              const obj = {
                channel: key,
                open: groupByChannel[key].filter(
                  (f) =>
                    !["CANCELLED", "CLOSED", "CANCEL"].includes(
                      f.intxnStatus
                    ) // && f.intxnNo !== interactionData.intxnNo
                ).length,
                closed: groupByChannel[key].filter(
                  (f) =>
                    ["CANCELLED", "CLOSED", "CANCEL"].includes(f.intxnStatus)
                  // && f.intxnNo !== interactionData.intxnNo
                ).length,
              };
              ch.push(obj);
            }
            setStatementChannelWise(ch);
            let totalDays = 0;
            const open = response?.data.interactions.filter(
              (f) =>
                !["CANCELLED", "CLOSED", "CANCEL"].includes(f.intxnStatus)
              // && f.intxnNo !== interactionData.intxnNo
            );
            const closed = response?.data.interactions.filter(
              (f) =>
                ["CANCELLED", "CLOSED", "CANCEL"].includes(f.intxnStatus)
              //  && f.intxnNo !== interactionData.intxnNo
            );
            setStatementClosed(closed);
            setStatementOpen(open);

            setStatementOpenPie([
              {
                value: open.length,
                name: "Open",
              },
              {
                value: response?.data.interactions
                  // .filter(
                  //   (f) => f.intxnNo !== interactionData.intxnNo
                  // )
                  .length,
                name: "Total",
              },
            ]);

            setStatementClosedPie([
              {
                value: closed.length,
                name: "Closed",
              },
              {
                value: response?.data.interactions
                  // .filter(
                  //   (f) => f.intxnNo !== interactionData.intxnNo
                  // )
                  .length,
                name: "Total",
              },
            ]);

            statementClosed.filter((e) => {
              if (e?.assignedDate && e?.createdAt) {
                const a = moment(moment(e.assignedDate).format("YYYY-MM-DD"));
                const b = moment(moment(e.createdAt).format("YYYY-MM-DD"));
                totalDays += a.diff(b, "days");
              }
            });
            const avgDays = totalDays / statementClosed.length;
            setStatementAvgDays(avgDays ? avgDays : 0);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }

    if (interactionData.intxnCategory && interactionData.intxnType) {
      post(`${properties.INTERACTION_API}/get-related-category-info`, {
        intxnCategory: interactionData.intxnCategory,
        intxnType: interactionData.intxnType,
      }).then((response) => {
        if (response?.data) {
          setCategoryAppointmentList(response?.data.appointments);
          setCategoryList(response?.data.interactions);
          const dataModified = response?.data.interactions.map((x) => ({
            ...x,
            statement: x.requestStatement,
          }));
          // console.log('dataModified ', dataModified)
          const groupByStatement = groupBy(dataModified, "statement");
          const groupByType = groupBy(dataModified, "intxnType");
          const ch = [];
          const closed = response?.data.interactions.filter(
            (f) =>
              ["CANCELLED", "CLOSED", "CANCEL"].includes(f.intxnStatus)
            // && f.intxnNo !== interactionData.intxnNo
          );
          const statementKeys = Object.keys(groupByStatement);
          for (const key of statementKeys) {
            const obj = {
              statement: key,
              open: groupByStatement[key].filter(
                (f) =>
                  !["CANCELLED", "CLOSED", "CANCEL"].includes(f.intxnStatus)
                // && f.intxnNo !== interactionData.intxnNo
              ),
              closed: groupByStatement[key].filter(
                (f) =>
                  ["CANCELLED", "CLOSED", "CANCEL"].includes(f.intxnStatus)
                // && f.intxnNo !== interactionData.intxnNo
              ),
            };
            ch.push(obj);
          }
          setCategoryChannelWise(ch);
          const type = [];
          const typeKeys = Object.keys(groupByType);
          for (const key of typeKeys) {
            const obj = {
              type: key,
              count: groupByType[key].length,
            };
            type.push(obj);
          }
          setTypeList(type);
          let totalDays = 0;
          closed.filter((e) => {
            if (e.assignedDate) {
              const a = moment(moment(e.assignedDate).format("YYYY-MM-DD"));
              const b = moment(moment(e.createdAt).format("YYYY-MM-DD"));
              totalDays += a.diff(b, "days");
            }
          });
          const avgDays = totalDays / closed.length;
          setCategoryAvgDays(avgDays ? avgDays : 0);
        }
      }).catch(error => console.log(error));
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

  useEffect(() => {
    if (typeof customerDetails === "object" && customerDetails !== null && customerDetails.customerUuid) {
      get(
        `${properties.INTELLIGENCE_API}/get-events?customerUuid=${customerDetails.customerUuid}&for=calendar`
      )
        .then((resp) => {
          if (resp.data && resp.data.length > 0) {
            setEvents([...resp.data]);
          } else {
            setEvents([]);
          }
        })
        .catch((error) => console.error(error))
        .finally();
    }
  }, [customerDetails]);

  const groupBy = (items, key) =>
    items.reduce(
      (result, item) => ({
        ...result,
        [item[key]]: [...(result[item[key]] || []), item],
      }),
      {}
    );

  const [assetData, setAssetData] = useState([])
  const [mappedAssetData, setMappedAssetData] = useState([])
  const [inventoryData, setInventoryData] = useState([])
  const [assetFormDetails, setAssetFormDetails] = useState({})

  useEffect(() => {
    post(`${properties.ACCOUNT_DETAILS_API}/get-asset-list`, {
      "serviceType": "ST_LAPTOP"
    })
      .then((resp) => {
        if (resp.data && resp.data.length > 0) {
          setAssetData(resp.data);
        } else {
          setAssetData([]);
        }
      })
      .catch((error) => console.error(error))
      .finally();
  }, [])

  useEffect(() => {
    post(`${properties.ACCOUNT_DETAILS_API}/get-mapped-service-ai`, {
      "serviceType": "ST_LAPTOP",
      "customerId": interactionData?.customerId
    })
      .then((resp) => {
        if (resp.data && resp.data.length > 0) {
          setMappedAssetData(resp.data);
        } else {
          setMappedAssetData([]);
        }
      })
      .catch((error) => console.error(error))
      .finally();
  }, [submitted])

  const handleFormOnChange = (e) => {
    const { value, id } = e.target;

    setAssetFormDetails({
      [id]: value
    })
    post(`${properties.ACCOUNT_DETAILS_API}/get-asset-inventory`, {
      "assetInvPrdId": value
    })
      .then((resp) => {
        if (resp.data && resp.data.length > 0) {
          setInventoryData(resp.data);
        } else {
          setInventoryData([]);
        }
      })
      .catch((error) => console.error(error))
      .finally();


  };

  const handleInventoryFormOnChange = (key, value) => {
    setAssetFormDetails({
      ...assetFormDetails,
      [key]: value
    })
  };


  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!assetFormDetails?.asset || !assetFormDetails?.inventory) {
      toast.error('Please Select Inventory')
      return
    }

    const payload = {
      ...assetFormDetails,
      assignedTo: interactionData?.customerId,
      assignReferNo: interactionData?.intxnNo,
      assignReferType: 'INTERACTION',
    }

    post(`${properties.ACCOUNT_DETAILS_API}/assign-asset-inventory`, payload)
      .then((resp) => {
        setSubmitted(true);
      })
      .catch((error) => console.error(error))
      .finally();
  }

  const formRef = useRef()
  const sigPad = useRef()
  const [isFormDisabled, setIsFormDisabled] = useState(true)
  const [isButtonHide, setIsButtonHide] = useState(true)

  useEffect(() => {
    if (interactionData?.intxnUuid) {
      getAttachmentList()
    }
  }, [interactionData?.intxnUuid])


  const getAttachmentList = useCallback(() => {
    if (interactionData?.intxnUuid) {
      get(`${properties?.COMMON_API}/attachment/${interactionData?.intxnUuid}`).then((response) => {
        if (response?.status === 200 && response?.data && Array?.isArray(response?.data) && response?.data?.length > 0) {
          setExistingFiles(response?.data)
        }
      })
    }
  }, [interactionData?.intxnUuid])

  return (
    <div className="row px-2 pt-2">
      <div className="col-3">
        <div className="">
          <div className="">
            <div className="cust-sect-1">
              <div className="bg-secondary text-center p-1 int-h4-title">
                <h4>Interaction Details</h4>
              </div>
              <div className="cust-profile card-box border">
                <img
                  src={customerDetails?.customerPhoto}
                  alt=""
                  className="img-fluid profile-img border-radius50"
                />
                <div className="profile-info-rht">
                  <div className="cust-profile-top">
                    <div className="profile-top-head">
                      <span className="profile-name">
                        {customerDetails?.firstName ||
                          customerDetails?.lastName}
                      </span>
                      <p>{props?.appsConfig?.clientFacingName?.customer ?? "Customer"} Id: {customerDetails?.customerNo}</p>
                    </div>
                    <div className="customer-buttons-top pull-right">
                      <span
                        className="icons-md-icon"
                        onClick={() => setShow(true)}
                      >
                        <i
                          className="fa fa-calendar"
                          data-target="#calendarModal"
                          data-toggle="modal"
                        ></i>
                      </span>
                      <button
                        className="styl-btn-history mt-2"
                        data-target="#customerhistoryModal"
                        data-toggle="modal"
                        onClick={() => {
                          setIsCustomerDetailsHistoryOpen(true);
                        }}
                      >
                        History
                      </button>
                      {/* <span className="pull-right">
                        <button
                          className="styl-edti-btn mt-2"
                          data-target="#editbusinessModal"
                          data-toggle="modal"
                          onClick={()=>{setIsEditCustomerDetailsOpen(true)}}
                        >
                          Edit
                        </button>
                      </span> */}
                    </div>
                  </div>
                </div>
              </div>
              <div className="interaction-cust-profile card-box border">
                <div className="profile-qcnt">
                  <a href="#" mailto="">
                    {(intxnContact && intxnContact?.length) ? intxnContact.emailId : (customerDetails?.customerContact &&
                      customerDetails?.customerContact[0]?.emailId) ||
                      "NA"}
                  </a>
                  <p>
                    Contact:{" "}
                    {(intxnContact && intxnContact?.length) ? intxnContact.mobileNo : (customerDetails?.customerContact &&
                      customerDetails?.customerContact[0]?.mobileNo) ||
                      "NA"}
                  </p>
                </div>
                <div className="d-flex">
                  <div className="interaction-bussiness-info">
                    <span className="bussiness-type px-1 font-12">
                      Category: {customerDetails?.customerCatDesc?.description ||
                        customerDetails?.customerCategory?.description ||
                        "NA"}
                    </span>
                  </div>
                  <div className="interaction-bussiness-info">
                    <span className="profile-status px-1 font-12">
                      Status: {customerDetails?.statusDesc?.description ||
                        customerDetails?.status?.description ||
                        "NA"}
                    </span>
                  </div>
                </div>
              </div>
              {/* <div className="cmmn-container-base"> */}
              <div>
                {!!!statusConstantCode?.bussinessSetup.includes(appConfig?.businessSetup?.[0]) &&
                  appConfig?.clientConfig?.order?.enabled &&
                  <div className="d-flex bg-light card-box border p-2">
                    <div className="col-6">
                      <div className="text-center">
                        <p className="mb-2 text-truncate">Revenue</p>
                        <h6 className="text-danger">
                          <p style={{ cursor: "pointer" }} onclick="">
                            {revenueDetails?.totalAmount
                              ? Number(revenueDetails?.totalAmount)
                              : 0}{" "}

                            {revenueDetails?.currency}
                          </p>
                        </h6>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-center">
                        <p className="mb-2 text-truncate">Average</p>
                        <h6 className="text-primary">
                          <p style={{ cursor: "pointer" }} onclick="">
                            {revenueDetails?.averageAmount
                              ? Number(revenueDetails?.averageAmount).toFixed(2)
                              : 0}{" "}
                            {revenueDetails?.currency}
                          </p>
                        </h6>
                      </div>
                    </div>
                  </div>}
                <div className=" my-2">
                  <span className="container-title">Interaction Summary</span>
                </div>
                <div className="skel-tot-inter w-100">
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
                        {interactionCustomerHistory?.totalInteractionCount || 0}
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

                <div className="skel-inter-statement card-box border mt-2">
                  <span className="container-title"> Interaction Details</span>
                  {/* <span><a className="styl-edti-btn p-1" href="#additional" type="button">Edit</a></span> */}
                  <div className="rht-skel skel-int-360-btns">

                    {!["CLOSED", "CANCELLED"].includes(
                      interactionData?.intxnStatus?.code
                    ) && (
                        <>
                          {statusConstantCode.cancelStatus.includes(interactionData?.intxnStatus?.code) && <button
                            className="skel-btn-cancel"
                            data-target="#cancelModal"
                            data-toggle="modal"
                            onClick={() => setIsCancelOpen(true)}
                          >
                            Cancel Interaction
                          </button>}

                          {permissions.readOnly &&
                            auth.currDeptId ===
                            interactionData?.currentDepartment?.code &&
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
                    <button
                      className="skel-btn-submit"
                      data-target="#skel-view-modal-workflow"
                      data-toggle="modal"
                      onClick={() => setIsWorkflowHistoryOpen(true)}
                    >
                      Workflow History
                    </button>
                  </div>

                  <ul className="mt-2">
                    <li className="skel-lbl-flds pl-1">Statement</li>
                  </ul>
                  <div className="">
                    <div className="skel-heading mb-2 pl-1">
                      {interactionData?.requestStatement}
                    </div>
                    {/* <div className="skel-view-interaction-stat"> */}
                    <div className="">
                      <div className="view-int-details-key">
                        <table className="bg-light w-100">
                          <tr>
                            <td className="p-1">
                              <span className="font-weight-bold">
                                Interaction No
                              </span>
                            </td>
                            <td className="p-1">
                              : {interactionData?.intxnNo}
                            </td>
                          </tr>
                          <tr>
                            <td className="p-1">
                              <span className="font-weight-bold">Category</span>
                            </td>
                            <td className="p-1">
                              : {interactionData?.intxnCategory?.description}
                            </td>
                          </tr>
                          <tr>
                            <td className="p-1">
                              <span className="font-weight-bold">Type</span>
                            </td>
                            <td className="p-1">
                              : {interactionData?.intxnType?.description}
                            </td>
                          </tr>
                          <tr>
                            <td className="p-1">
                              <span className="font-weight-bold">
                                Service Category
                              </span>
                            </td>
                            <td className="p-1">
                              : {interactionData?.serviceCategory?.description}
                            </td>
                          </tr>
                          <tr>
                            <td className="p-1">
                              <span className="font-weight-bold">
                                Service Type
                              </span>
                            </td>
                            <td className="p-1">
                              : {interactionData?.serviceType?.description}
                            </td>
                          </tr>
                          <tr>
                            <td className="p-1">
                              <span className="font-weight-bold">Channel</span>
                            </td>
                            <td className="p-1">
                              : {interactionData?.intxnChannel?.description}
                            </td>
                          </tr>
                          <tr>
                            <td className="p-1">
                              <span className="font-weight-bold">
                                Contact Preference
                              </span>
                            </td>
                            <td className="p-1">
                              :
                              {(interactionData?.contactPreference &&
                                interactionData?.contactPreference
                                  .map((m) => m?.description)
                                  .join(",")) ||
                                ""}
                            </td>
                          </tr>
                          <tr>
                            <td className="p-1">
                              <span className="font-weight-bold">Priority</span>
                            </td>
                            <td className="p-1">
                              : {interactionData?.intxnPriority?.description}
                            </td>
                          </tr>
                          <tr>
                            <td className="p-1">
                              <span className="font-weight-bold">
                                Current Deparment / Role
                              </span>
                            </td>
                            <td className="p-1">
                              :{" "}
                              {interactionData?.currentDepartment?.description
                                ?.unitDesc || ""}
                              /
                              {interactionData?.currentRole?.description
                                ?.roleDesc || ""}
                            </td>
                          </tr>
                          <tr>
                            <td className="p-1">
                              <span className="font-weight-bold">
                                Current User
                              </span>
                            </td>
                            <td className="p-1">
                              :{" "}
                              {interactionData?.currentUser?.description
                                ?.firstName || ""}
                              {interactionData?.currentUser?.description
                                ?.lastName || ""}
                            </td>
                          </tr>
                          <tr>
                            <td className="p-1">
                              <span className="font-weight-bold">Status</span>
                            </td>
                            <td className="p-1">
                              : {interactionData?.intxnStatus?.description}
                            </td>
                          </tr>
                          <tr>
                            <td className="p-1">
                              <span className="font-weight-bold">Expected Completion Date</span>
                            </td>
                            <td className="p-1">
                              : {interactionData?.edoc}
                            </td>
                          </tr>
                        </table>
                        <span id="additional"></span>
                        <p className="pt-2">
                          <span className="font-weight-bold">
                            Solutions Solved by:
                          </span>
                          {interactionData?.isResolvedBy === "BOT"
                            ? "BOT ✅  HUMAN ❌"
                            : "BOT ❌  HUMAN ✅"}
                        </p>
                        <div>
                          <span className="font-weight-bold">
                            Attachment:
                          </span>
                          <FileUpload
                            data={{
                              currentFiles: currentFiles,
                              entityType: 'INTERACTION',
                              existingFiles: existingFiles,
                              interactionId: interactionData?.intxnUuid,
                              permission: true
                            }}
                            handlers={{
                              setCurrentFiles: setCurrentFiles,
                              setExistingFiles: setExistingFiles
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {!!!['CLOSED', 'CANCELLED'].includes(interactionData?.intxnStatus?.code) && !!!permissions.readOnly && <div className=" mb-2 second mt-2 card-box border">
                  <div className="w-100 p-1 text-center">
                    <div className="container-heading">
                      <span className="container-title">Edit Interaction</span>
                    </div>
                  </div>
                  <div className="pb-1 p-1" id="content">
                    <label for="serviceNumber" className="control-label">
                      Additional Remarks{isRemarkRequired && <span className="text-danger">*</span>}
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
                    <span className="text-muted">maximum 2500 Characters</span>
                  </div>

                  <div className="pb-1 p-1">
                    <label for="idType" className="control-label">
                      Status
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
                        Select...
                      </option>
                      {currStatusLookup &&
                        currStatusLookup.map((currStatus, index) => (
                          <option key={index} value={currStatus?.code}>
                            {currStatus?.description}
                          </option>
                        ))}
                    </select>
                    <span className="errormsg">
                      {error.currStatus ? error.currStatus : ""}
                    </span>
                  </div>

                  <div className="pb-1 p-1">
                    <label for="idType" className="control-label">
                      Deparment/Role
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
                          <optgroup key={key} label={dept?.entity[0]?.unitDesc}>
                            {!!dept.roles.length &&
                              dept.roles.map((data, childKey) => (
                                <option
                                  key={childKey}
                                  value={data.roleId}
                                  data-entity={JSON.stringify(dept.entity[0])}
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

                  <div className="pb-1 p-1">
                    <label for="idType" className="control-label">
                      User
                    </label>
                    <select
                      disabled={permissions.readOnly}
                      id="user"
                      className={`form-control ${error.user && "error-border"}`}
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
                  <div className="form-group skel-filter-frm-btn text-center mt-2 p-1">
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
                </div>
                }
                {appConfig?.clientConfig?.appointments?.enabled && !!!statusConstantCode?.bussinessSetup.includes(appConfig?.businessSetup?.[0]) && <div className="cmmn-container-base border mt-2">
                  <div className="container-heading">
                    <span className="container-title">
                      <i className="fe-pocket"></i> Upcoming Appointments{" "}
                    </span>
                  </div>
                  {!isEmpty(appointmentDetails) ? (
                    <div className="skel-int-360-appt">
                      <div className="skel-appt-det">
                        <div className={`skel-appt-date ${moment(
                          appointmentDetails?.rows?.[0]?.appointDate
                        ).format("DD MMM YYYY") === moment().format("DD MMM YYYY") ? 'skel-appt-date' : 'skel-fut-date'}`}>
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
                              customerDetails?.customerContact?.[0]
                                ?.mobileNo) ||
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
                                appointmentDetails?.rows?.[0]
                                  ?.appointEndTime
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
                    </div>
                  ) : (
                    <span className="skel-widget-warning">
                      {" "}
                      No Appointment Available!!!
                    </span>
                  )}
                </div>}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-6">
        <div className="">
          <div className="cardbody">
            <div className="cardbody">
              <div className="bg-secondary text-center p-1 int-h4-title">
                <h4>Statement Level Overview</h4>
              </div>
            </div>
          </div>
          <div className="container mb-2">
            <div className="row mt-2">
              <div className="">
                <div className="card border">
                  <div className="card-body bg-primary">
                    <div className="media">
                      <div className="media-body overflow-hidden text-center">
                        <h4 className="header-title mb-2 font-weight-bold text-white text-center">
                          Statement - Last 7 Days Created
                        </h4>
                        <h3 className="mb-0 font-weight-bold text-white text-center">
                          <span
                            data-plugin="counterup"
                            onClick={(e) => {
                              setIsInteractionListOpen(true);
                              setPopupType("ST-TOTAL");
                            }}
                          >
                            {statementHistory.length || 0}
                          </span>
                        </h3>
                      </div>
                      {/* <div className="text-primary">
                      <i className="fe-file-text mr-1 noti-icon"></i>
                    </div> */}
                    </div>
                  </div>
                  <div className="card-body border-top p-0">
                    <div className="row">
                      <div className="col-6 p-0">
                        <div className="text-center p-0">
                          <InteractionChartPie
                            data={{ chartData: statementOpenPie }}
                            handler={{ setIsSoluationActivityOpen }}
                          />

                          <p className="mb-2 text-truncate">Open</p>
                          <h4 className="text-danger font-weight-bold">
                            <span style={{ cursor: 'pointer' }}
                              data-plugin="counterup"
                              onClick={(e) => {
                                setIsInteractionListOpen(true);
                                setPopupType("ST-OPEN");
                              }}
                            >
                              {statementOpen.length || 0}
                            </span>
                          </h4>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="text-center">
                          <InteractionChartPie
                            data={{ chartData: statementClosedPie }}
                            handler={{ setIsSoluationActivityOpen }}
                          />

                          <p className="mb-2 text-truncate">Closed</p>
                          <h4 className="text-success font-weight-bold">
                            <span style={{ cursor: 'pointer' }}
                              data-plugin="counterup"
                              onClick={(e) => {
                                setIsInteractionListOpen(true);
                                setPopupType("ST-CLOSED");
                              }}
                            >
                              {statementClosed.length || 0}
                            </span>
                          </h4>
                        </div>
                      </div>
                      <div className="col-12">
                        <InteractionChartGauge
                          data={{
                            score: statementAvgDays ? statementAvgDays.toFixed(2) : 0 || 0,
                            height: "240px",
                            width: "100%",
                          }}
                        />
                        <div className="text-center mb-3">
                          <p className="mb-1 text-truncate">
                            Average Turn-around Time
                          </p>
                          <h4 className="text-sucess font-weight-bold">
                            <span data-plugin="counterup">
                              {statementAvgDays ? statementAvgDays.toFixed(2) : 0 || 0}
                            </span>{" "}
                            Days{" "}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {!!!statusConstantCode?.bussinessSetup.includes(appConfig?.businessSetup?.[0]) &&
                appConfig?.clientConfig?.product?.enabled && <div className="col p-0 mt-2 mb-2">
                  <div className="card border">
                    <div className="card-body bg-dark">
                      <div className="media">
                        <div className="media-body  overflow-hidden text-center">
                          <h4 className="header-title mb-2 text-white text-center">
                            Appointment Last 7 Days Created Total
                          </h4>
                          <h3 className="mb-0 font-weight-bold text-white  text-center">
                            <span style={{ cursor: 'pointer' }}
                              data-plugin="counterup"
                              onClick={(e) => {
                                setIsInteractionListOpen(true);
                                setPopupType("AP-TOTAL");
                              }}
                            >
                              {appointmentHistory.length || 0}
                            </span>
                          </h3>
                        </div>
                      </div>
                    </div>
                    <div className="card-body border-top p-0">
                      <div className="row">
                        <InteractionChartBar
                          data={{ chartData: appointmentChart, popupOpen: isInteractionListOpen, popupType }}
                          handler={{
                            setPopupOpen: setIsInteractionListOpen,
                            setPopupType: setPopupType,
                          }}
                        />

                        <div className="col-6 mt-4">
                          <div className="text-center">
                            <p className="mb-2 text-truncate">Upcoming</p>
                            <h3 className="text-warning font-weight-bold">
                              <span style={{ cursor: 'pointer' }}
                                data-plugin="counterup"
                                onClick={(e) => {
                                  setIsInteractionListOpen(true);
                                  setPopupType("AP-UPCOMING");
                                }}
                              >
                                {appointmentHistory.filter(
                                  (f) => f.status === "AS_SCHED"
                                ).length || 0}
                              </span>
                            </h3>
                          </div>
                        </div>
                        <div className="col-6 mt-4">
                          <div className="text-center">
                            <p className="mb-2 text-truncate">Completed</p>
                            <h3 className="text-primary font-weight-bold">
                              <span style={{ cursor: 'pointer' }}
                                data-plugin="counterup"
                                onClick={(e) => {
                                  setIsInteractionListOpen(true);
                                  setPopupType("AP-COMP");
                                }}
                              >
                                {appointmentHistory.filter(
                                  (f) => f.status !== "AS_SCHED"
                                ).length || 0}
                              </span>
                            </h3>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>}
            </div>
          </div>
          <div className="card-box border mb-2">
            <div className="card-body">
              <div className="media">
                <div className="media-body overflow-hidden">
                  <h4 className="header-title mb-2 font-weight-bold">
                    Requirment Details
                  </h4>
                </div>
              </div>
              <DynamicForm
                data={{
                  formAttributes: interactionData?.formAttributes || [],
                  formRef,
                  isFormDisabled,
                  sigPad,
                  isButtonHide,
                  formDetails: interactionData?.formDetails || {},
                  values,

                }}
                handlers={{
                  handleFormSubmit,
                  handleFormOnChange,
                  setValues
                }}
              />
            </div>
          </div>
          {(interactionData?.intxnCategory?.code === 'ASSET_RELATED' && interactionData?.intxnType?.code === 'REQUEST' && interactionData?.serviceCategory?.code === 'PST_ITSRV' && interactionData?.serviceType?.code === 'ST_LAPTOP' && auth?.permissions?.find((ele) => ele['Interaction'])?.Interaction?.find((ele) => ele?.screenName === 'Inventory Assignment')?.accessType === 'allow') && <div className="card-box border mb-2">
            <div className="card-body">
              <div className="media">
                <div className="media-body overflow-hidden">
                  <h4 className="header-title mb-2 font-weight-bold">
                    Inventory Assignment
                  </h4>
                </div>
              </div>
              {assetData?.length > 0 ? <form ref={formRef} onSubmit={(e) => { handleFormSubmit(e) }} id="myForm">
                <div className="mb-3">
                  <span><b>Select Asset</b> </span>
                  {assetData?.map((ele, i) => (
                    <div key={i}>
                      <div className="form-check">
                        <input type="radio" id='asset' defaultValue={ele?.assetInvPrdId} name="assetName" data-raw-data={JSON.stringify(ele)} onChange={(e) => handleFormOnChange(e)} required={true} className="form-check-input" />
                        <label htmlFor={`asset${i}`} className="form-check-label">{ele?.productName}</label>
                      </div>
                    </div>
                  ))}
                </div>

                {inventoryData?.length > 0 && <div className="mb-3">
                  <span><b>Select Inventory</b> </span>
                  {inventoryData?.map((ele, i) => (
                    <div key={i}>
                      <div className="form-check">
                        <input type="radio" id={`inventory_${i}`} value={ele?.assetInvPrdDtlId} name="inventory" checked={ele?.assetInvPrdDtlId == assetFormDetails['inventory']} onChange={() => handleInventoryFormOnChange("inventory", ele?.assetInvPrdDtlId)} required={true} className="form-check-input" />
                        <label htmlFor={`inventory_${i}`} className="form-check-label">{ele?.productDesc}</label>
                      </div>
                    </div>
                  ))}
                </div>}

                <button className="btn btn-primary">Submit</button>
              </form> : <span><b>Assets are not available at this moment!</b></span>}

            </div>
          </div>}
          <div className="card-box border mb-2">
            <div className="card-body">
              <div className="media">
                <div className="media-body overflow-hidden">
                  <h4 className="header-title mb-2 font-weight-bold">
                    Channels Last 7 Days
                  </h4>
                </div>
              </div>
              <DynamicTable
                isScroll={true}
                row={statementChannelWise}
                header={statementChannelWiseColumns}
                itemsPerPage={10}
                handler={{
                  handleCellRender: handleCellRender,
                }}
              />
            </div>
          </div>

          {appConfig?.clientConfig?.product?.enabled &&
            <div className="card-box border mb-2" dir="ltr">
              <h4 className="header-title mb-2 font-weight-bold">
                Products Overview
              </h4>
              {/* {console.log('statementProductWise------->', statementProductWise)} */}
              <InteractionChartBarStacked
                data={{ chartData: statementProductWise }}
                handler={{
                  setPopupOpen: false,
                  setPopupType: "INTERACTION",
                }}
              />
            </div>}
        </div>
      </div>
      <div className="col-3">
        {/* <div className="card p-2"> */}
        <div className="">
          <div className="cardbody">
            <div className="bg-secondary text-center p-1 int-h4-title">
              <h4>Category and Type Level Overview</h4>
            </div>
          </div>
          <div className="p-0">
            <table className="table table-striped dt-responsive nowrap w-100 mt-1 border text-center">
              <thead>
                <tr>
                  <th width="50%">Category</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{interactionData.intxnCategory?.description}</td>
                  <td>{interactionData.intxnType?.description}</td>
                </tr>
              </tbody>
            </table>
            <div className="border">
              <div className="card-body bg-primary">
                <div className="media ">
                  <div className="media-body overflow-hidden">
                    <h4 className="header-title mb-2 font-weight-bold text-white text-center">
                      Category Total
                    </h4>
                    <h3 className="mb-0 text-white text-center" style={{ cursor: 'pointer' }}>
                      <span
                        data-plugin="counterup"
                        onClick={(e) => {
                          setIsInteractionListOpen(true);
                          setPopupType("CAT-TOTAL");
                        }}
                      >
                        {categoryList.length}
                      </span>
                    </h3>
                  </div>
                </div>
              </div>
              <div className="card-body border-top p-0">
                <div className="d-flex">
                  <div className="col-3 border p-1 bg-primary">
                    <div className="text-center">
                      <p className="mb-2 text-white">Open</p>
                      <h4 className="text-white" style={{ cursor: 'pointer' }}>
                        <span
                          data-plugin="counterup"
                          onClick={(e) => {
                            setIsInteractionListOpen(true);
                            setPopupType("CAT-OPEN");
                          }}
                        >
                          {
                            categoryList.filter(
                              (f) =>
                                !["CLOSED", "CANCELLED", "CANCEL"].includes(
                                  f.intxnStatus
                                )
                            ).length
                          }
                        </span>
                      </h4>
                    </div>
                  </div>
                  <div className="col-3 border p-1 bg-primary">
                    <div className="text-center">
                      <p className="mb-2 text-white">Closed</p>
                      <h4 className="text-white" style={{ cursor: 'pointer' }}>
                        <span
                          data-plugin="counterup"
                          onClick={(e) => {
                            setIsInteractionListOpen(true);
                            setPopupType("CAT-CLOSED");
                          }}
                        >
                          {
                            categoryList.filter((f) =>
                              ["CLOSED", "CANCELLED", "CANCEL"].includes(
                                f.intxnStatus
                              )
                            ).length
                          }
                        </span>
                      </h4>
                    </div>
                  </div>
                  <div className="col-6 border p-1 bg-primary">
                    <div className="text-center">
                      <p className="mb-2 text-white">Turnaround Time</p>
                      <h4 className="text-white">
                        <span data-plugin="counterup">{categoryAvgDays ? categoryAvgDays.toFixed(2) : 0 || 0}</span>{" "}
                        Days
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-box border p-1 mt-2">
              <div className="media">
                <div className="media-body overflow-hidden">
                  <h4 className="header-title mb-2 font-weight-bold">
                    Top 5 Interaction Statements for last 7 days
                  </h4>
                </div>
              </div>
              <div className="">
                <div className="tab-pane p-0" id="home-b1">
                  {console.log("categoryChannelWise => ", categoryChannelWise)}
                  <DynamicTable
                    isScroll={true}
                    row={categoryChannelWise}
                    header={categoryChannelWiseColumns}
                    itemsPerPage={10}
                    handler={{
                      handleCellRender: handleCellRenderStatements,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="card-box border mt-2" dir="ltr">
              <h4 className="header-title mb-2 font-weight-bold">
                Category /Type Sentiment
              </h4>
              <div className="mb-2">
                <div className="card-body border-top py-3">
                  <div className="row">
                    <div className="col-4 p-0">
                      <div className="text-center">
                        <img alt='' src={verydislike} height="40px" />
                        <h4
                          onClick={(e) => {
                            setIsInteractionListOpen(true);
                            setPopupType("CAT-VNEG");
                          }}
                        >
                          {typeList.find((f) => f.type === "GRIEVANCE")
                            ?.count || 0}
                        </h4>
                        <p>V.Negative</p>
                      </div>
                    </div>
                    <div className="col-4 p-0">
                      <div className="text-center">
                        <img alt='' src={dislike} height="40px" />
                        <h4
                          onClick={(e) => {
                            setIsInteractionListOpen(true);
                            setPopupType("CAT-NEG");
                          }}
                        >
                          {typeList.find((f) => f.type === "APPEALS")?.count ||
                            0}
                        </h4>
                        <p>Negative</p>
                      </div>
                    </div>
                    <div className="col-4 p-0">
                      <div className="text-center">
                        <img alt='' src={notsure} height="40px" />
                        <h4
                          onClick={(e) => {
                            setIsInteractionListOpen(true);
                            setPopupType("CAT-NEUT");
                          }}
                        >
                          {typeList.find((f) => ["REQUEST"].includes(f.type))
                            ?.count || 0}
                        </h4>
                        <p>Neutral</p>
                      </div>
                    </div>
                    <div className="col-4 p-0">
                      <div className="text-center">
                        <img alt='' src={sure} height="40px" />
                        <h4
                          onClick={(e) => {
                            setIsInteractionListOpen(true);
                            setPopupType("CAT-POS");
                          }}
                        >
                          {typeList.find((f) =>
                            [
                              "FEEDBACK",
                              "SUGGESTION",
                              "RECOMMENDATION",
                            ].includes(f.type)
                          )?.count || 0}
                        </h4>
                        <p>Positive</p>
                      </div>
                    </div>
                    <div className="col-4 p-0">
                      <div className="text-center">
                        <img alt='' src={like} height="40px" />
                        <h4
                          onClick={(e) => {
                            setIsInteractionListOpen(true);
                            setPopupType("CAT-VPOS");
                          }}
                        >
                          {typeList.find((f) =>
                            ["INTEREST", "PURCHASE"].includes(f.type)
                          )?.count || 0}
                        </h4>
                        <p>V.Positive</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {!!!statusConstantCode?.bussinessSetup.includes(appConfig?.businessSetup?.[0]) &&
              appConfig?.clientConfig?.appointments?.enabled &&
              <div className="card-box border mt-2" dir="ltr">
                <h4 className="header-title mb-2 font-weight-bold">
                  Appointments and Success{" "}
                </h4>
                <div className="mb-2">
                  <div className="card-body border-top p-0">
                    <div className="col-12 p-0">
                      <div className="card border">
                        <div className="card-body bg-dark">
                          <div className="media ">
                            <div className="media-body overflow-hidden">
                              <h4 className="header-title mb-2 font-weight-bold text-white text-center text-truncate">
                                Appointment Total
                              </h4>
                              <h3 className="mb-0 text-white text-center">
                                <span data-plugin="counterup" className="cursor-pointer">
                                  {categoryAppointmentList.length}
                                </span>
                              </h3>
                            </div>
                          </div>
                        </div>

                        <div className="card-body border-top p-0">
                          <div className="row">
                            <div className="col-4 border p-2 bg-dark">
                              <div className="text-center">
                                <p className="mb-2 text-white text-truncate">
                                  Upcoming
                                </p>
                                <h4 className="text-white">
                                  <span
                                    data-plugin="counterup"
                                    className="cursor-pointer"
                                    onClick={(e) => {
                                      setIsInteractionListOpen(true);
                                      setPopupType("CAT-AP-SCH");
                                    }}
                                  >
                                    {
                                      categoryAppointmentList.filter(
                                        (f) => f.status === "AS_SCHED"
                                      ).length
                                    }
                                  </span>
                                </h4>
                              </div>
                            </div>
                            <div className="col-4 border p-2 bg-dark">
                              <div className="text-center">
                                <p className="mb-2 text-white text-truncate">
                                  Completed
                                </p>
                                <h4 className="text-white">
                                  <span
                                    data-plugin="counterup"
                                    className="cursor-pointer"
                                    onClick={(e) => {
                                      setIsInteractionListOpen(true);
                                      setPopupType("CAT-AP-COMP");
                                    }}
                                  >
                                    {
                                      categoryAppointmentList.filter((f) =>
                                        [
                                          "AS_COMP_SUCCESS",
                                          "AS_COMP_UNSUCCESS",
                                        ].includes(f.status)
                                      ).length
                                    }
                                  </span>
                                </h4>
                              </div>
                            </div>
                            <div className="col-4 border p-2 bg-dark">
                              <div className="text-center">
                                <p className="mb-2 text-white text-truncate">
                                  Success
                                </p>
                                <h4 className="text-white">
                                  <span data-plugin="counterup" className="cursor-pointer">
                                    {
                                      categoryAppointmentList.filter(
                                        (f) => f.status === "AS_COMP_SUCCESS"
                                      ).length
                                    }
                                  </span>
                                </h4>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>}
          </div>
        </div>
      </div>
      <Modal isOpen={isInteractionListOpen} style={RegularModalCustomStyles}>
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
                  Interaction Details
                  {/* for {props?.appsConfig?.clientFacingName?.customer ?? 'Customer'} Number{" "} */}
                  {/* {customerDetails?.customerNo} */}
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
                    <DynamicTable
                      listKey={"Interactions"}
                      row={
                        popupType === "ST-STATEMENTWISE"
                          ? statementWiseIntxns
                          : popupType === "ST-TOTAL"
                            ? statementHistory
                            : popupType === "ST-OPEN"
                              ? statementOpen
                              : popupType === "ST-CLOSED"
                                ? statementClosed
                                : popupType === "CAT-TOTAL"
                                  ? categoryList
                                  : popupType === "CAT-OPEN"
                                    ? categoryList.filter(
                                      (f) =>
                                        !["CLOSED", "CANCELLED", "CANCEL"].includes(
                                          f.intxnStatus
                                        )
                                    )
                                    : popupType === "CAT-CLOSED"
                                      ? categoryList.filter((f) =>
                                        ["CLOSED", "CANCELLED", "CANCEL"].includes(
                                          f.intxnStatus
                                        )
                                      )
                                      : popupType === "CAT-VNEG"
                                        ? categoryList.filter((f) => f.intxnType === "GREVIANCE")
                                        : popupType === "CAT-NEG"
                                          ? categoryList.filter((f) => f.intxnType === "APPEALS")
                                          : popupType === "CAT-NEUT"
                                            ? categoryList.filter((f) =>
                                              ["REQUEST"].includes(f.intxnType)
                                            )
                                            : popupType === "CAT-POS"
                                              ? categoryList.filter((f) =>
                                                [
                                                  "FEEDBACK",
                                                  "SUGGESTION",
                                                  "RECOMMENDATION",
                                                ].includes(f.intxnType)
                                              )
                                              : popupType === "CAT-VPOS"
                                                ? categoryList.filter((f) =>
                                                  ["INTEREST", "PURCHASE"].includes(f.intxnType)
                                                )
                                                : ["TOTAL", "OPEN", "CLOSED"].includes(popupType)
                                                  ? interactionCustomerHistoryDetails
                                                  : popupType === "AP-TOTAL"
                                                    ? appointmentHistory
                                                    : popupType === "AP-UPCOMING"
                                                      ? appointmentHistory.filter(
                                                        (f) => f.status === "AS_SCHED"
                                                      )
                                                      : popupType === "AP-COMP"
                                                        ? appointmentHistory.filter(
                                                          (f) => f.status !== "AS_SCHED"
                                                        )
                                                        : (appointmentHistory.filter(
                                                          (f) => f.statusDesc === popupType
                                                        )
                                                          || [])
                      }
                      rowCount={
                        popupType === "ST-STATEMENTWISE"
                          ? statementWiseIntxns.length
                          : popupType === "ST-TOTAL"
                            ? statementHistory.length
                            : popupType === "ST-OPEN"
                              ? statementOpen.length
                              : popupType === "ST-CLOSED"
                                ? statementClosed.length
                                : popupType === "CAT-TOTAL"
                                  ? categoryList.length
                                  : popupType === "CAT-OPEN"
                                    ? categoryList.filter(
                                      (f) =>
                                        !["CLOSED", "CANCELLED", "CANCEL"].includes(
                                          f.intxnStatus
                                        )
                                    ).length
                                    : popupType === "CAT-CLOSED"
                                      ? categoryList.filter((f) =>
                                        ["CLOSED", "CANCELLED", "CANCEL"].includes(
                                          f.intxnStatus
                                        )
                                      ).length
                                      : popupType === "CAT-VNEG"
                                        ? categoryList.filter((f) => f.intxnType === "GREVIANCE").length
                                        : popupType === "CAT-NEG"
                                          ? categoryList.filter((f) => f.intxnType === "APPEALS").length
                                          : popupType === "CAT-NEUT"
                                            ? categoryList.filter((f) =>
                                              ["REQUEST"].includes(f.intxnType)
                                            ).length
                                            : popupType === "CAT-POS"
                                              ? categoryList.filter((f) =>
                                                [
                                                  "FEEDBACK",
                                                  "SUGGESTION",
                                                  "RECOMMENDATION",
                                                ].includes(f.intxnType)
                                              ).length
                                              : popupType === "CAT-VPOS"
                                                ? categoryList.filter((f) =>
                                                  ["INTEREST", "PURCHASE"].includes(f.intxnType)
                                                ).length
                                                : ["TOTAL", "OPEN", "CLOSED"].includes(popupType)
                                                  ? totalCount
                                                  : popupType === "AP-TOTAL"
                                                    ? appointmentHistory.length
                                                    : popupType === "AP-UPCOMING"
                                                      ? appointmentHistory.filter(
                                                        (f) => f.status === "AS_SCHED"
                                                      ).length
                                                      : popupType === "AP-COMP"
                                                        ? appointmentHistory.filter(
                                                          (f) => f.status !== "AS_SCHED"
                                                        ).length : (appointmentHistory.filter(
                                                          (f) => f.statusDesc === popupType
                                                        )
                                                          || 0)
                      }
                      header={interactionListColumns}
                      itemsPerPage={perPageModal}
                      isScroll={true}
                      backendPaging={["TOTAL", "OPEN", "CLOSED"].includes(popupType)
                        ? true : false}
                      columnFilter={true}
                      backendCurrentPage={currentPageModal}
                      handler={{
                        handleCellRender: handleCellRender,
                        handlePageSelect: handlePageSelect,
                        handleItemPerPage: setPerPageModal,
                        handleCurrentPage: setCurrentPageModal,
                      }}
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <Modal isOpen={isWorflowHistoryOpen} style={RegularModalCustomStyles}>
        <div
          className="modal-center"
          id="followupModal"
          tabindex="-1"
          role="dialog"
          aria-labelledby="followupModal"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header px-4 border-bottom-0 d-block">
                <button
                  type="button"
                  className="close"
                  // data-dismiss="modal"
                  // aria-hidden="true"
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
                      className="btn waves-effect waves-light btn-primary cmmn-styl-btn-sm"
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
      </Modal>
      {/* <Modal
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
            
          </div>
        </>
      </Modal> */}
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
                            <option key={e.code} value={e?.code}>
                              {e?.description}
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
      {isEditCustomerDetailsOpen && (
        <EditCustomerModal
          data={{
            isEditCustomerDetailsOpen,
            customerDetails,
            //isOpen: true
          }}
          handlers={{
            setIsEditCustomerDetailsOpen,
            setCustomerDetails,
          }}
        />
      )}
      {isCustomerDetailsHistoryOpen && (
        <CustomerHistory
          data={{
            isOpen: isCustomerDetailsHistoryOpen,
            customerData: customerDetails,
          }}
          handler={{
            setIsOpen: setIsCustomerDetailsHistoryOpen,
          }}
        />
      )}

      <CalendarComponent
        data={{
          show,
          events,
        }}
        handlers={{
          setShow,
        }}
      />
    </div>
  );
};

const interactionListColumns = [
  {
    Header: "Interaction No",
    accessor: "intxnNo",
    disableFilters: true,
  },
  // {
  //   Header: "Remarks",
  //   accessor: "remarks",
  //   disableFilters: true,
  // },
  {
    Header: "Interaction Category",
    accessor: "intxnCategoryDesc.description",
    disableFilters: true
  },
  {
    Header: "Interaction Type",
    accessor: "srType.description",
    disableFilters: true
  },
  {
    Header: "Service Category",
    accessor: "categoryDescription.description",
    disableFilters: true
  },
  {
    Header: "Service Type",
    accessor: "serviceTypeDesc.description",
    disableFilters: true
  },
  {
    Header: "Status",
    accessor: "currStatusDesc.description",
    disableFilters: true
  },
  {
    Header: "Created At",
    accessor: "createdAt",
    disableFilters: true,
  },
];
const statementChannelWiseColumns = [
  {
    Header: "Channel",
    accessor: "channel",
    id: "channel",
  },
  {
    Header: "Open",
    accessor: "open",
    disableFilters: false,
    id: "open",
  },
  {
    Header: "Closed",
    accessor: "closed",
    id: "closed",
    disableFilters: false,
  },
];

const categoryChannelWiseColumns = [
  {
    Header: "Statement",
    accessor: "statement",
    id: "statement",
  },
  {
    Header: "Open",
    accessor: "open",
    disableFilters: false,
    id: "open",
  },
  {
    Header: "Closed",
    accessor: "closed",
    id: "closed",
    disableFilters: false,
  },
];

// const CustomerSearchColumns = [
//   {
//     Header: "Customer Number",
//     accessor: "customerNo",
//     id: "customerNo",
//   },
//   {
//     Header: "Customer Name",
//     accessor: "firstName",
//     disableFilters: false,
//     id: "customerName",
//   },
//   {
//     Header: "Mobile Number",
//     accessor: "customerContact[0].mobileNo",
//     id: "mobileNo",
//     disableFilters: false,
//   },
//   {
//     Header: "Email",
//     accessor: "customerContact[0].emailId",
//     disableFilters: true,
//   },
//   {
//     Header: "Customer Status",
//     accessor: "statusDesc.description",
//     disableFilters: true,
//     id: "customerServiceStatus",
//   },
// ];

export default Interaction360;
