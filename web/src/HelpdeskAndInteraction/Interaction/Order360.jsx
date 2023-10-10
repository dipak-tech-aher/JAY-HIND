import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useReactToPrint } from 'react-to-print';
import { toast } from "react-toastify";
import NewCustomerPreviewModal from 'react-modal'
import { object, string } from "yup";
import vImp from "../../assets/images/Avatar2.jpg";
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
import { isEmpty } from "lodash";
import DynamicTable from "../../common/table/DynamicTable";
import InteractionChartBarStacked from "./InteractionChartBarStacked";
import EditCustomerModal from "../../CRM/Customer/EditCustomerModal";
import CustomerHistory from "../../CRM/Customer/CustomerHistory";
import CalendarComponent from "../../common/CalendarComponent";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { saveAs } from "file-saver";
import _ from "lodash";
import OrderJourney from "./OrderJourney";
import InteractionChartPie from "./InteractionChartPie";
import Marquee from "react-fast-marquee";
import CustomerPreviewPrint from "./AggreementPdf/CustomerPreviewPrint";

const ModalCustomStyle = {
  content: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '70%',
    maxHeight: '100%'
  }
}

const Order360 = (props) => {
  const orderNo = props?.location?.state?.data?.rowData
    ? props?.location?.state?.data?.rowData?.orderNo?.split('_')[0]
    : props?.location?.state?.data?.orderNo?.split('_')[0];
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  const { auth } = useContext(AppContext);
  // const [timer, setTimer] = useState(null);
  // const [workflowAuthData, setWorkflowAuthData] = useState();
  const [displayPreview, setDisplayPreview] = useState(false);


  const childOrderNo = props?.location?.state?.data?.rowData?.childOrderId
    ? props?.location?.state?.data?.rowData?.childOrderId
    : props?.location?.state?.data?.childOrderId;

  const [selectedTask, setSelectedTask] = useState([]);
  const [selectedTaskComments, setSelectedTaskComments] = useState({});
  const [childOrderWithDeptRole, setChildOrderWithDeptRole] = useState([]);
  const [childOrder, setChildOrder] = useState([]);
  const [orderData, setOrderData] = useState({});
  const [orderedProductDetails, setOrderedProductDetails] = useState([]);
  const [customerDetails, setCustomerDetails] = useState({});
  const [interactionInputs, setInteractionInputs] = useState({
    user: "",
    assignRole: "",
    assignDept: "",
    currStatus: "",
    remarks: "",
  });
  const [error, setError] = useState({});
  const [orderWorkflow, setOrderWorkflow] = useState({});
  const [workflowHistory, setWorkflowHistory] = useState({
    count: 0,
    rows: [],
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
    displayOnly: true,
  });

  const isRoleChangedByUserRef = useRef(false);
  const currentWorkflowRef = useRef();
  const ticketDetailsValidationSchema = object().shape({
    currStatus: string().required("Current Status is required"),
    //assignRole: string().required("Assgin to Department/Role is required")
    // assignRole: string().when(
    //   "currStatus", {
    //   is: 'CLS',
    //   then: string().optional(),
    //   otherwise: string().required()
    // })
    // string().required("Assgin to Department/Role is required"),

  });
  const [isWorflowHistoryOpen, setIsWorkflowHistoryOpen] = useState(false);
  const [isFollowupOpen, setIsFollowupOpen] = useState(false);
  const [isReAssignOpen, setIsReAssignOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [priorityLookup, setPriorityLookup] = useState([]);
  const [sourceLookup, setSourceLookup] = useState([]);
  const [taskStatuses, setTaskStatuses] = useState([]);
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
  const [taskDetails, setTaskDetails] = useState([]);
  const [roleLookup, setRoleLookup] = useState();
  const [userLookup, setUserLookup] = useState();
  const [currStatusLookup, setCurrStatusLookup] = useState();
  const [isFollowUpHistoryOpen, setIsFollowUpHistoryOpen] = useState(false);
  const [orderCountHistory, setOrderCountHistory] = useState({
    totalOrderCount: 0,
    totalOrderData: [],
    openOrderCount: 0,
    openOrderData: [],
    closedOrderCount: 0,
    closedOrderData: [],
  });

  const [appointmentDetails, setAppointmentDetails] = useState({});
  const [lastOrderRemark, setLastOrderRemark] = useState("");
  const [productPopup, setProductPopup] = useState(false);
  const wrapperRef = useRef(null);
  const [selectedProduct, setSelectedProduct] = useState();
  const [orderCustomerHistoryDetails, setOrderCustomerHistoryDetails] =
    useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [orderStatusType, setOrderStatusType] = useState();
  const [isOrderListOpen, setIsOrderListOpen] = useState(false);
  const [popupType, setPopupType] = useState(false);
  const [isEditCustomerDetailsOpen, setIsEditCustomerDetailsOpen] =
    useState(false);
  const [isCustomerDetailsHistoryOpen, setIsCustomerDetailsHistoryOpen] =
    useState(false);
  const [show, setShow] = useState(false);
  const [events, setEvents] = useState([]);
  const [scheduleContract, setScheduleContract] = useState([]);
  const [statementHistory, setStatementHistory] = useState([]);

  const [perPageModal, setPerPageModal] = useState(10);
  const [currentPageModal, setCurrentPageModal] = useState(0);
  const [revenueDetails, setRevenueDetails] = useState({});
  const [isOrderJournyOpen, setIsOrderJournyOpen] = useState(false);
  const samplebase64 =
    "data:application/pdf;base64,JVBERi0xLjMNCiXi48/TDQoNCjEgMCBvYmoNCjw8DQovVHlwZSAvQ2F0YWxvZw0KL091dGxpbmVzIDIgMCBSDQovUGFnZXMgMyAwIFINCj4+DQplbmRvYmoNCg0KMiAwIG9iag0KPDwNCi9UeXBlIC9PdXRsaW5lcw0KL0NvdW50IDANCj4+DQplbmRvYmoNCg0KMyAwIG9iag0KPDwNCi9UeXBlIC9QYWdlcw0KL0NvdW50IDINCi9LaWRzIFsgNCAwIFIgNiAwIFIgXSANCj4+DQplbmRvYmoNCg0KNCAwIG9iag0KPDwNCi9UeXBlIC9QYWdlDQovUGFyZW50IDMgMCBSDQovUmVzb3VyY2VzIDw8DQovRm9udCA8PA0KL0YxIDkgMCBSIA0KPj4NCi9Qcm9jU2V0IDggMCBSDQo+Pg0KL01lZGlhQm94IFswIDAgNjEyLjAwMDAgNzkyLjAwMDBdDQovQ29udGVudHMgNSAwIFINCj4+DQplbmRvYmoNCg0KNSAwIG9iag0KPDwgL0xlbmd0aCAxMDc0ID4+DQpzdHJlYW0NCjIgSg0KQlQNCjAgMCAwIHJnDQovRjEgMDAyNyBUZg0KNTcuMzc1MCA3MjIuMjgwMCBUZA0KKCBBIFNpbXBsZSBQREYgRmlsZSApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDY4OC42MDgwIFRkDQooIFRoaXMgaXMgYSBzbWFsbCBkZW1vbnN0cmF0aW9uIC5wZGYgZmlsZSAtICkgVGoNCkVUDQpCVA0KL0YxIDAwMTAgVGYNCjY5LjI1MDAgNjY0LjcwNDAgVGQNCigganVzdCBmb3IgdXNlIGluIHRoZSBWaXJ0dWFsIE1lY2hhbmljcyB0dXRvcmlhbHMuIE1vcmUgdGV4dC4gQW5kIG1vcmUgKSBUag0KRVQNCkJUDQovRjEgMDAxMCBUZg0KNjkuMjUwMCA2NTIuNzUyMCBUZA0KKCB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDYyOC44NDgwIFRkDQooIEFuZCBtb3JlIHRleHQuIEFuZCBtb3JlIHRleHQuIEFuZCBtb3JlIHRleHQuIEFuZCBtb3JlIHRleHQuIEFuZCBtb3JlICkgVGoNCkVUDQpCVA0KL0YxIDAwMTAgVGYNCjY5LjI1MDAgNjE2Ljg5NjAgVGQNCiggdGV4dC4gQW5kIG1vcmUgdGV4dC4gQm9yaW5nLCB6enp6ei4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kICkgVGoNCkVUDQpCVA0KL0YxIDAwMTAgVGYNCjY5LjI1MDAgNjA0Ljk0NDAgVGQNCiggbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDU5Mi45OTIwIFRkDQooIEFuZCBtb3JlIHRleHQuIEFuZCBtb3JlIHRleHQuICkgVGoNCkVUDQpCVA0KL0YxIDAwMTAgVGYNCjY5LjI1MDAgNTY5LjA4ODAgVGQNCiggQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgKSBUag0KRVQNCkJUDQovRjEgMDAxMCBUZg0KNjkuMjUwMCA1NTcuMTM2MCBUZA0KKCB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBFdmVuIG1vcmUuIENvbnRpbnVlZCBvbiBwYWdlIDIgLi4uKSBUag0KRVQNCmVuZHN0cmVhbQ0KZW5kb2JqDQoNCjYgMCBvYmoNCjw8DQovVHlwZSAvUGFnZQ0KL1BhcmVudCAzIDAgUg0KL1Jlc291cmNlcyA8PA0KL0ZvbnQgPDwNCi9GMSA5IDAgUiANCj4+DQovUHJvY1NldCA4IDAgUg0KPj4NCi9NZWRpYUJveCBbMCAwIDYxMi4wMDAwIDc5Mi4wMDAwXQ0KL0NvbnRlbnRzIDcgMCBSDQo+Pg0KZW5kb2JqDQoNCjcgMCBvYmoNCjw8IC9MZW5ndGggNjc2ID4+DQpzdHJlYW0NCjIgSg0KQlQNCjAgMCAwIHJnDQovRjEgMDAyNyBUZg0KNTcuMzc1MCA3MjIuMjgwMCBUZA0KKCBTaW1wbGUgUERGIEZpbGUgMiApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDY4OC42MDgwIFRkDQooIC4uLmNvbnRpbnVlZCBmcm9tIHBhZ2UgMS4gWWV0IG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gKSBUag0KRVQNCkJUDQovRjEgMDAxMCBUZg0KNjkuMjUwMCA2NzYuNjU2MCBUZA0KKCBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDY2NC43MDQwIFRkDQooIHRleHQuIE9oLCBob3cgYm9yaW5nIHR5cGluZyB0aGlzIHN0dWZmLiBCdXQgbm90IGFzIGJvcmluZyBhcyB3YXRjaGluZyApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDY1Mi43NTIwIFRkDQooIHBhaW50IGRyeS4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gKSBUag0KRVQNCkJUDQovRjEgMDAxMCBUZg0KNjkuMjUwMCA2NDAuODAwMCBUZA0KKCBCb3JpbmcuICBNb3JlLCBhIGxpdHRsZSBtb3JlIHRleHQuIFRoZSBlbmQsIGFuZCBqdXN0IGFzIHdlbGwuICkgVGoNCkVUDQplbmRzdHJlYW0NCmVuZG9iag0KDQo4IDAgb2JqDQpbL1BERiAvVGV4dF0NCmVuZG9iag0KDQo5IDAgb2JqDQo8PA0KL1R5cGUgL0ZvbnQNCi9TdWJ0eXBlIC9UeXBlMQ0KL05hbWUgL0YxDQovQmFzZUZvbnQgL0hlbHZldGljYQ0KL0VuY29kaW5nIC9XaW5BbnNpRW5jb2RpbmcNCj4+DQplbmRvYmoNCg0KMTAgMCBvYmoNCjw8DQovQ3JlYXRvciAoUmF2ZSBcKGh0dHA6Ly93d3cubmV2cm9uYS5jb20vcmF2ZVwpKQ0KL1Byb2R1Y2VyIChOZXZyb25hIERlc2lnbnMpDQovQ3JlYXRpb25EYXRlIChEOjIwMDYwMzAxMDcyODI2KQ0KPj4NCmVuZG9iag0KDQp4cmVmDQowIDExDQowMDAwMDAwMDAwIDY1NTM1IGYNCjAwMDAwMDAwMTkgMDAwMDAgbg0KMDAwMDAwMDA5MyAwMDAwMCBuDQowMDAwMDAwMTQ3IDAwMDAwIG4NCjAwMDAwMDAyMjIgMDAwMDAgbg0KMDAwMDAwMDM5MCAwMDAwMCBuDQowMDAwMDAxNTIyIDAwMDAwIG4NCjAwMDAwMDE2OTAgMDAwMDAgbg0KMDAwMDAwMjQyMyAwMDAwMCBuDQowMDAwMDAyNDU2IDAwMDAwIG4NCjAwMDAwMDI1NzQgMDAwMDAgbg0KDQp0cmFpbGVyDQo8PA0KL1NpemUgMTENCi9Sb290IDEgMCBSDQovSW5mbyAxMCAwIFINCj4+DQoNCnN0YXJ0eHJlZg0KMjcxNA0KJSVFT0YNCg==";

  const [sliderDetails, setSliderDetails] = useState({});
  const [totalOrderValue, setTotalOrderValue] = useState(0);
  const [totalRCValue, setTotalRCValue] = useState(0);
  const [totalNRCValue, setTotalNRCValue] = useState(0);
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const [categoryAppointmentList, setCategoryAppointmentList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [categorySalesList, setCategorySalesList] = useState([]);
  const [categoryChannelWise, setCategoryChannelWise] = useState([]);
  const [categoryValue, setCategoryValue] = useState(0);
  const [totalBillingContractValue, setTotalBillingContractValue] = useState(0);
  const [totalInvoiceValue, setTotalInvoiceValue] = useState(0);
  const [childOrderId, setChildOrderId] = useState(childOrderNo)
  const [allTaskDetails, setAllTaskDetails] = useState([]);
  const [isRefresh, setIsRefresh] = useState(false);
  const [previousDocumentIndesx, setPreviousDocumetIndex] = useState()

  // Temporray useefect

  useEffect(() => {
    if (childOrder?.orderNo) {
      post(`${properties.ORDER_API}/flow/${childOrder?.orderNo}`)
        .then((resp) => {
          if (resp.data) {
            console.log('resp.data--------->', resp.data)
            setOrderWorkflow({ ...resp.data, source: "ORDER" });
          }
        })
        .catch((error) => console.error(error))
        .finally();
    }
  }, [isRefresh])


  useEffect(() => {
    if (
      childOrder?.currEntity?.unitId &&
      childOrder?.currEntity?.unitId !== "" &&
      permissions.readOnly === false
    ) {
      get(
        `${properties.WORKFLOW_DEFN_API}/get-status?entityId=${childOrder?.orderUuid}&entity=ORDER`
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
              setInteractionInputs({
                user: "",
                assignRole: "",
                assignDept: "",
                currStatus: "",
                remarks: "",
              });
            } else if (flow === "DONE") {
              setPermissions({
                assignToSlef: false,
                followup: false,
                readOnly: true,
                reAssign: false,
                displayOnly: true,
              });
            }

            if (childOrder?.orderStatus?.code === "CLS") {
              setPermissions({
                assignToSlef: false,
                followup: false,
                readOnly: true,
                reAssign: false,
                displayOnly: true,
              });
            }
          }
        }).catch(error => console.log(error))
        .finally();
    }
    if (childOrder?.orderNo) {
      // get workflow history
      get(`${properties.ORDER_API}/history/${childOrder?.orderNo}`)
        .then((response) => {
          if (response?.data && response?.data) {
            setWorkflowHistory(response?.data);
          }
        })
        .catch((error) => {
          console.error(error);
        })
        .finally();

      //get followup history
      get(
        `${properties.ORDER_API}/history/${childOrder?.orderNo}?getFollowUp=true`
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

      // get Flow Diagram

      post(`${properties.ORDER_API}/flow/${childOrder?.orderNo}`)
        .then((resp) => {
          if (resp.data) {
            console.log('resp.data--------->', resp.data)
            setOrderWorkflow({ ...resp.data, source: "ORDER" });
          }
        })
        .catch((error) => console.error(error))
      //get Appointment Details
      get(`${properties.APPOINTMENT_API}/order/${childOrder?.orderNo}`)
        .then((response) => {
          if (response?.data) {
            setAppointmentDetails(response?.data);
          }
        })
        .catch((error) => {
          console.error(error);
        })

    }

    // clearing previous value when changing product details
    unstable_batchedUpdates(() => {
      setIsFollowUpHistoryOpen(false);
      setIsWorkflowHistoryOpen(false);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childOrder, childOrder?.currEntity?.unitId]);

  useEffect(() => {
    get(
      properties.MASTER_API +
      "/lookup?searchParam=code_type&valueParam=TASK_STATUS,TICKET_SOURCE,TICKET_PRIORITY,ORD_STATUS_REASON"
    )
      .then((resp) => {
        if (resp.data) {
          setSourceLookup(resp.data["TICKET_SOURCE"]);
          setPriorityLookup(resp.data["TICKET_PRIORITY"]);
          setCancellationReasonLookup(resp.data["ORD_STATUS_REASON"]);
          setTaskStatuses(resp.data["TASK_STATUS"]);
        } else {
          toast.error("Error while fetching address details");
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally();
  }, []);

  const handleOnCancel = () => {
    if (!cancellationReason) {
      toast.error("Cancellation Reason is Mandatory");
      return;
    }
    const payload = {
      cancelReason: cancellationReason,
    };

    put(`${properties.ORDER_API}/cancel/${childOrder?.orderNo}`, payload)
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

  const handleOnAssignToSelf = (types) => {
    let childOrderIds = [];
    // console.log('childOrder?.orderNo -------->', childOrder?.orderNo)
    // childOrderWithDeptRole.forEach((e) => {
    //   if (
    //     (e?.currUser?.userId !== auth?.user?.userId || !e.currUser) &&
    //     e?.currEntity?.unitId === auth?.currDeptId &&
    //     e?.currRole?.roleId === auth?.currRoleId &&
    //     e?.orderStatus?.code &&
    //     !["CLS", "CNCLED"].includes(e?.orderStatus?.code)
    //   ) {
    //     childOrderIds.push({
    //       orderNo: e.orderNo,
    //       type: types,
    //     });
    //   }
    // });

    // console.log({ order: [{orderNo:childOrder?.orderNo, type: types }] })

    put(`${properties.ORDER_API}/assignSelf`, { order: [{ orderNo: childOrder?.orderNo, type: types }] })
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
      orderNo: childOrder?.orderNo,
    };

    post(`${properties.ORDER_API}/followUp`, { ...payload })
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
        handleOnAssignToSelf("REASSIGN");
      }
    });
  };

  const handleOnReAssignInputsChange = (e) => {
    const { target } = e;
    setReAssignInputs({
      userId: target.value,
    });
  };

  const handleOnReAssign = (e) => {
    e.preventDefault();
    const { userId } = reAssignInputs;
    let payload = {
      userId: userId,
      roleId: orderData?.currRole?.roleId,
      departmentId: orderData?.currEntity?.unitId,
      status: "REASSIGNED",
      remarks: "Reassigned to User",
    };
    if (!userId) {
      toast.error("User is Mandatory");
      return;
    }

    put(`${properties.ORDER_API}/edit/${childOrder?.orderNo}`, { ...payload })
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
    handleOnTicketDetailsInputsChange(e);
    // eslint-disable-next-line array-callback-return
    workflowLookup && workflowLookup.entities.map((unit) => {
      for (const property in unit.status) {
        if (unit.status[property].code === target.value) {
          entity.push(unit);
          break;
        }
      }
    });

    // console.log(entity, "on status change");

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

    const taskFromWorkflow = _.flatMap(entity, (item) => {
      let taskForCurrentRole = item?.roles?.find(x => x.roleId == auth?.currRoleId);
      let taskForCurrentStatus = item?.status?.find(x => x.code == target.value);
      // console.log(taskForCurrentRole, taskForCurrentStatus)
      if (taskForCurrentRole && taskForCurrentStatus) return item.task;
    }).filter(item => !!item);

    // console.log("taskdetails =========> ", taskFromWorkflow)

    setTaskDetails(taskFromWorkflow ?? []);
    taskAvailableAndNotCompletedFunc(taskFromWorkflow ?? [])
  };

  useEffect(() => {
    if (interactionInputs.assignRole !== "") {
      getUsersBasedOnRole();
    } else {
      setUserLookup([]);
    }
    if (isReAssignOpen) {
      getUsersBasedOnRole("RE-ASSIGN");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactionInputs.assignRole, isReAssignOpen]);

  const getUsersBasedOnRole = (source = undefined) => {
    const data = source
      ? {
        roleId: orderData?.currRole?.roleId,
        deptId: orderData?.currEntity?.unitId,
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
            data.filter((x) => x.userId !== orderData?.currentUser?.code)
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

  useEffect(() => {
    if (orderData?.customerDetails?.customerUuid) {
      get(
        `${properties.ORDER_API}/get-customer-history-count/${orderData?.customerDetails?.customerUuid}`
      )
        .then((response) => {
          if (response?.data && response?.data) {
            setOrderCountHistory(response?.data);
          }
        })
        .catch((error) => {
          console.error(error);
        })
        .finally();

      // get schedule contract
      // console.log('orderData===================', orderData)
      // console.log('childOrder===================', childOrder)
      get(
        `${properties.CONTRACT_API}/get-scheduled-contracts?customerUuid=${orderData?.customerDetails?.customerUuid}&orderUuid=${childOrder?.orderUuid}&productId=${childOrder?.serviceDetails?.planPayload}`
      )
        .then((response) => {
          if (response?.data && response?.data) {
            let contractValue = 0;
            for (const contract of response?.data.rows) {
              contractValue +=
                Number(contract.rcAmount) + Number(contract.otcAmount);
            }
            unstable_batchedUpdates(() => {
              setScheduleContract(response?.data);
              setTotalBillingContractValue(contractValue);

              // console.log('response?.data?.rows=========================>', response?.data?.rows)
              setSliderDetails(response?.data?.rows?.[0]?.billing?.[0])
            })
          }
        })
        .catch((error) => {
          console.error(error);
        });
      // console.log('orderData?.customerDetails------->', orderData?.customerDetails)
      // get invoice contract
      get(
        `${properties.INVOICE_API}/ar-bills/${orderData?.customerDetails?.customerId}`
        // `${properties.INVOICE_API}/ar-bill/${orderData?.customerDetails?.customerUuid}`
      )
        .then((response) => {
          if (response?.data && response?.data) {
            setTotalInvoiceValue(response?.data.totoalOutstanding || 0);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [orderData, childOrder]);

  const getTaskData = async (orderUuid, productId, deptId, roleId, masterOrder, childOrders) => {
    // console.log("get task data called", orderUuid, productId, deptId, roleId, masterOrder, childOrders);
    let assignRole = !!childOrders?.currRole?.roleId
      ? parseInt(childOrders?.currRole?.roleId)
      : "";
    let assignDept = !!childOrders?.currEntity?.unitId
      ? childOrders?.currEntity?.unitId
      : "";
    let user = !!childOrders?.currUser?.userId
      ? parseInt(childOrders?.currUser?.userId)
      : "";

    if (childOrderId == '' || childOrderId == null) {
      setChildOrderId(childOrders.orderNo)
    }
    const filteredData = masterOrder?.childOrder.filter((item) =>
      item.currEntity?.unitId === deptId && item.orderNo === childOrderId || childOrders.orderNo &&
      Number(item.currRole?.roleId) === Number(roleId))

    // console.log("calling grantpermissions function");
    grantPermissions(assignRole, user, childOrders?.orderStatus?.code, assignDept);

    // setWorkflowAuthData({
    //     deptId,
    //     roleId
    // })
    unstable_batchedUpdates(() => {
      setChildOrderWithDeptRole(filteredData);
      setChildOrder(childOrders);
    });

    get(
      `${properties.WORKFLOW_DEFN_API}/task-details?entityId=${orderUuid}&entity=ORDER`
    )
      .then((responseWorkflowTaskDetailsData) => {
        // console.log({ responseWorkflowTaskDetailsData });
        if (responseWorkflowTaskDetailsData?.code === "201") {
          return;
        }
        // console.log(1, productId);
        if (responseWorkflowTaskDetailsData.data) {
          // console.log(responseWorkflowTaskDetailsData.data.entities);
          setAllTaskDetails(_.flatMap(responseWorkflowTaskDetailsData?.data?.entities, (item) => item.task));
          post(`${properties.PRODUCT_API}/get-task-product-map`, [
            productId,
          ]).then((responseData) => {
            // console.log(2);
            // console.log(responseData);
            if (responseData.data) {
              // console.log(3);
              // console.log(responseData.data);
            }
          }).catch(error => console.log(error));
          if (childOrders?.orderNo) {
            post(`${properties.ORDER_API}/flow/${childOrders?.orderNo}`)
              .then((resp) => {
                if (resp.data) {
                  setOrderWorkflow({ ...resp.data, source: "ORDER" });
                }
              })
              .catch((error) => console.error(error))
              .finally(() => console.log());
          }
        }
      })
      .catch((err) => {
        console.error(err);
        if (
          err.message ===
          "There not Workflow transaction wait for Manual Action"
        ) {
          setTaskDetails([]);
        }
      });
  };

  /* Get Order Last Order remark - start */

  const getOrderLastRemark = (data) => {
    if (data && Array.isArray(data) && data.length > 0) {
      const filteredData = data.filter((d) => {
        if (
          !["ORDER_FOLLOWUP", "ODR_ASSIGN_TO_SELF", "ORDER_REASSIGN"].includes(
            d.orderFlow.code
          )
        ) {
          return true;
        }
        return false;
      });
      const sortedObject =
        _.orderBy(filteredData, [(obj) => new Date(obj.createdAt)], ["desc"]) ||
        [];
      if (sortedObject.length > 0) {
        setLastOrderRemark(sortedObject[0].remarks);
      }
    }
  };

  useEffect(() => {
    if (workflowHistory?.rows?.length > 0) {
      getOrderLastRemark(workflowHistory?.rows);
    }
  }, [workflowHistory, workflowHistory?.rows]);
  /* Get Order Last Order remark - END */
  const initialize = async () => {
    isRoleChangedByUserRef.current = false;

    post(`${properties.ORDER_API}/search?limit=10&page=0`, {
      searchParams: { orderNo },
    })
      .then((response) => {
        if (response?.data?.row && response?.data?.row.length > 0) {
          setOrderData(response?.data?.row[0]);
          setCustomerDetails(response?.data?.row[0].customerDetails);
          // let assignRole = !!response?.data?.row[0]?.currRole?.roleId ? parseInt(response?.data?.row[0]?.currRole?.roleId) : "";
          // let assignDept = !!response?.data?.row[0]?.currEntity?.unitId ? response?.data?.row[0]?.currEntity?.unitId : "";
          // let user = !!response?.data?.row[0]?.currUser?.userId ? parseInt(response?.data?.row[0]?.currUser?.userId) : "";
          // grantPermissions(assignRole, user, response?.data?.row[0]?.orderStatus?.code, assignDept);
          // child order products need to populated here, orderData?.orderProductDetails
          let orderDetails = response?.data?.row[0];
          let orderProductDetails = [];
          if (orderDetails.childOrder.length > 0) {
            orderDetails.childOrder.forEach((childOrder) => {
              if (childOrderId && childOrderId === childOrder.orderNo) {
                const childOrderId = childOrder.orderUuid;
                const deptId = childOrder.currEntity?.unitId;
                const roleId = childOrder.currRole?.roleId;
                childOrder.orderProductDetails.forEach((productDetail) => {
                  orderProductDetails.push({
                    ...productDetail,
                    childOrderUuId: childOrderId,
                    deptId,
                    roleId,
                    childOrder,
                  });
                });
              } else if (!childOrderId) {
                const childOrderId = childOrder.orderUuid;
                const deptId = childOrder.currEntity?.unitId;
                const roleId = childOrder.currRole?.roleId;
                childOrder.orderProductDetails.forEach((productDetail) => {
                  orderProductDetails.push({
                    ...productDetail,
                    childOrderUuId: childOrderId,
                    deptId,
                    roleId,
                    childOrder,
                  });
                });
              }
            });
          } else {
            orderProductDetails.push(orderDetails.orderProductDetails);
          }
          const childOrderDetails = response?.data?.row[0]?.childOrder.filter(f => f.orderNo === childOrderId)?.[0] || response?.data?.row?.[0]?.childOrder?.[0]
          getTaskData(
            childOrderDetails.orderUuid,
            orderProductDetails[0]?.productId,
            childOrderDetails.currEntity?.unitId,
            childOrderDetails.currRole?.roleId,
            response?.data?.row[0],
            childOrderDetails
          );
          setOrderedProductDetails(orderProductDetails);
          if (orderProductDetails.length > 1) {
            setSelectedProduct(orderProductDetails[0]);
          }
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally();
  };

  useEffect(() => {
    let selectedOrderTasks = childOrder?.orderTasks ?? [];
    let selectedTasks = [];
    for (let index = 0; index < selectedOrderTasks.length; index++) {
      const element = selectedOrderTasks[index];
      const taskNo = allTaskDetails?.find(x => x.taskId == element.taskId)?.taskNo;
      const statusTask = taskDetails.find(x => x.taskNo == taskNo);
      if (statusTask) {
        const type = taskStatuses.find(x => x.code == element?.status)?.mapping?.type;
        selectedTasks.push({
          "orderTaskId": element?.orderTaskId,
          "taskNo": taskNo,
          "type": type,
          "value": element?.status,
          "comments": element?.comments
        })
        selectedTaskComments[taskNo] = element?.comments;
      }
    }
    setSelectedTaskComments({ ...selectedTaskComments });
    setSelectedTask(selectedTasks);
  }, [childOrder, allTaskDetails, taskDetails])

  useEffect(() => {
    initialize();
  }, []);

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
      e?.inner?.forEach((err) => {
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
    // console.log("interactionInputs interactionInputs interactionInputs", interactionInputs);
    let error = validate(
      "DETAILS",
      ticketDetailsValidationSchema,
      interactionInputs
    );

    if (!interactionInputs.assignRole && !interactionInputs.currStatus === 'CLS') {
      toast.error("Validation errors found. Please check assign role field");
      return false;
    }


    if (error) {
      toast.error("Validation errors found. Please check highlighted fields");
      return false;
    }

    return true;
  };

  const grantPermissions = (assignedRole, assignedUserId, status, assignedDept) => {
    // console.log({ status }, 'inside grant permission')
    if (["CLS", "CNCLED"].includes(status)) {
      setPermissions({
        assignToSlef: false,
        followup: false,
        readOnly: true,
        reAssign: false,
        displayOnly: true,
      });
    } else {
      const { user, currRoleId, currDeptId } = auth;
      // console.log({ assignedUserId, assignedRole, currRoleId, assignedDept, currDeptId }, 'inside grant permission')
      if (
        Number(assignedRole) === Number(currRoleId) &&
        assignedDept === currDeptId
      ) {
        if (assignedUserId !== "") {
          // console.log(Number(assignedUserId), '===', Number(user.userId), "set permissions")
          if (Number(assignedUserId) === Number(user.userId)) {
            setPermissions({
              assignToSlef: false,
              followup: false,
              readOnly: false,
              reAssign: true,
              displayOnly: true,
            });
          } else {
            setPermissions({
              assignToSlef: false,
              followup: true,
              readOnly: true,
              reAssign: false,
              displayOnly: true,
            });
          }
        } else {
          setPermissions({
            assignToSlef: true,
            followup: true,
            readOnly: true,
            reAssign: false,
            displayOnly: true,
          });
        }
      } else {
        if (assignedUserId !== "") {
          setPermissions({
            assignToSlef: false,
            followup: true,
            readOnly: true,
            reAssign: false,
            displayOnly: true,
          });
        } else {
          setPermissions({
            assignToSlef: false,
            followup: true,
            readOnly: true,
            reAssign: false,
            displayOnly: true,
          });
        }
      }
    }
  };

  // console.log({selectedTask})
  const [taskAvailableAndNotCompleted, setTaskAvailableAndNotCompleted] = useState(true);
  const taskAvailableAndNotCompletedFunc = (taskDetails) => {
    // console.log(taskDetails, selectedTask);
    if (!taskDetails || !taskDetails.length) {
      setTaskAvailableAndNotCompleted(false);
    } else {
      let isDisabled = false;
      for (let index = 0; index < taskDetails.length; index++) {
        let taskInfo = selectedTask.find(x => x.taskNo == taskDetails?.[index]?.['taskNo']);
        // console.log(selectedTask, "selectedTask");
        let negativeTaskAvailable = selectedTask.find(x => x.type == "negative");
        // console.log(negativeTaskAvailable, "negativeTaskAvailable");
        if (!taskInfo || !taskInfo?.comments || taskInfo?.comments == "" || negativeTaskAvailable) {
          isDisabled = true;
        }
      }
      // console.log({ isDisabled })
      setTaskAvailableAndNotCompleted(isDisabled);
    }
  }

  useEffect(() => {
    if (taskAvailableAndNotCompleted) {
      setTimeout(() => {
        setInteractionInputs({
          ...interactionInputs,
          user: "",
          assignRole: "",
          assignDept: "",
          remarks: ""
        })
      }, 500);
    }
  }, [taskAvailableAndNotCompleted])

  const handleTicketDetailsSubmit = (e) => {
    e.preventDefault();
    if (checkTicketDetails()) {
      let reqBody = {
        roleId: Number(interactionInputs?.assignRole),
        departmentId: interactionInputs?.assignDept,
        status: interactionInputs?.currStatus
      };

      if (selectedTask?.length) {
        reqBody['tasks'] = selectedTask;
      }

      // console.log("taskdetails =========> ", taskDetails)
      // console.log(reqBody);

      for (let index = 0; index < taskDetails.length; index++) {
        let taskInfo = selectedTask.find(x => x.taskNo == taskDetails?.[index]?.['taskNo']);
        if (!taskInfo) {
          toast.error("Please select all task status and give some comments"); return false;
        }

        if (!taskInfo?.comments || taskInfo?.comments == "") {
          toast.error("Please give some comments for all the tasks"); return false;
        }
      }

      if (interactionInputs?.user) {
        reqBody.userId = Number(interactionInputs?.user);
      }
      if (interactionInputs?.remarks) {
        reqBody.remarks = interactionInputs?.remarks;
      }

      put(properties.ORDER_API + "/edit/" + childOrder.orderNo, { ...reqBody })
        .then((response) => {
          // console.log(response);
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

  const recentActivitySettings = {
    dots: true,
    infinite: false,
    arrows: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    initialSlide: 0,
    // autoplay: false,
    // autoplaySpeed: 10000,
    // adaptiveHeight: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      // {
      //   breakpoint: 600,
      //   settings: {
      //     slidesToShow: 1,
      //     slidesToScroll: 1,
      //     initialSlide: 1,
      //   },
      // },
      // {
      //   breakpoint: 480,
      //   settings: {
      //     slidesToShow: 1,
      //     slidesToScroll: 1,
      //   },
      // },
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
          dots: true,
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
  };

  const handleAfterChange = (index) => {
    const data = orderedProductDetails[index];
    setChildOrderId(data.childOrder.orderNo)
    setSelectedProduct(data);
    getTaskData(data?.childOrderUuId, data?.productId, data?.deptId, data?.roleId, orderData, data?.childOrder);
  };

  const handleTaskStatusChange = (value, taskNo) => {
    // console.log(value, taskNo);
    if (value?.code && value?.description && value?.mapping?.type) {
      let selectedOrderTasks = childOrder?.orderTasks ?? [];
      // console.log("selectedOrderTasks ===> ", selectedOrderTasks)
      let selectedOrderTask = selectedOrderTasks.find(x => x.taskId == allTaskDetails.find(y => y.taskNo == taskNo)?.taskId);
      let obj = {};
      if (selectedOrderTask) {
        obj['orderTaskId'] = selectedOrderTask.orderTaskId;
      }
      obj = {
        ...obj,
        taskNo,
        type: value?.mapping?.type,
        value: value?.code,
      };
      if (selectedTaskComments?.[taskNo]) {
        obj['comments'] = selectedTaskComments?.[taskNo];
      }
      const index = selectedTask.findIndex((ele) => ele.taskNo === taskNo);
      if (index !== -1) {
        selectedTask[index] = obj;
      } else {
        selectedTask.push(obj);
      }
      setSelectedTask([...selectedTask]);
      // console.log(selectedTask);
    } else {
      setSelectedTask([]);
    }
  };

  const handleCellRender = (cell, row) => {
    if (cell.column.id === "createdAt") {
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
    setCurrentPage(pageNo);
  };

  const [isOrderSummaryListOpen, setIsOrderSummaryListOpen] = useState(false);
  const [orderSummaryPopupType, setOrderSummaryPopupType] = useState();

  const handleOrderModal = (status) => {
    unstable_batchedUpdates(() => {
      setOrderStatusType(status);
      setPopupType(status);
      setIsOrderListOpen(!isOrderListOpen);
      setCurrentPage(0);
      setPerPage(10);
      setTotalCount(0);
    })
  };

  const handleOrderSummaryModal = (status) => {
    // console.log('status-------->', status)
    unstable_batchedUpdates(() => {
      setOrderSummaryPopupType(status);
      setIsOrderSummaryListOpen(!isOrderSummaryListOpen);
      setCurrentPage(0);
      setPerPage(10);
      setTotalCount(0);
    });
  };

  const handleOnModelClose = () => {
    unstable_batchedUpdates(() => {
      setIsOrderListOpen(false);
      setIsOrderSummaryListOpen(false);
      setOrderStatusType("");
      setOrderCustomerHistoryDetails([])
      setTotalCount(0)
    })
  };

  const getCustomerOrderDetails = useCallback((status) => {
    try {
      // console.log(orderData?.customerDetails?.customerUuid, status, ['TOTAL', 'OPEN', 'CLOSED'].includes(status))
      if ((orderData?.customerDetails?.customerUuid || props?.location?.state?.data?.customerUid) && status && ['TOTAL', 'OPEN', 'CLOSED'].includes(status)) {
        get(
          `${properties.ORDER_API}/get-customer-history/${orderData?.customerDetails?.customerUuid || props?.location?.state?.data?.customerUid
          }?limit=${perPage}&page=${currentPage}${status ? `&status=${status}` : ""}`
        )
          .then((response) => {
            if (response?.data) {
              unstable_batchedUpdates(() => {
                setOrderCustomerHistoryDetails(response?.data?.rows);
                setTotalCount(response?.data?.count);
              })
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
    [currentPage, perPage]
  );

  useEffect(() => {
    getCustomerOrderDetails(orderStatusType);
  }, [currentPage, orderStatusType, perPage, popupType]);

  const convertBase64ToFile = (base64String, fileName) => {
    let arr = base64String.split(",");
    let mime = arr[0].match(/:(.*?);/)[1];
    let bstr = atob(arr[1]);
    let n = bstr.length;
    let uint8Array = new Uint8Array(n);
    while (n--) {
      uint8Array[n] = bstr.charCodeAt(n);
    }
    let file = new File([uint8Array], fileName, { type: mime });
    return file;
  };
  const [productId, setProductId] = useState();
  const [id, setId] = useState();
  const handleAgreementDownload = (productIdData, idx) => {
    // console.log('idx-------->', idx)
    setDisplayPreview(!displayPreview);
    setProductId(productIdData)
    setId(idx)

    // let file = convertBase64ToFile(base64String, fileName);
    // saveAs(file, fileName);
  };

  const handleSlidlerChange = (index, data) => {
    const currentDocument = document.getElementById(index);
    currentDocument.classList.add("skel-order-insights")
    if (previousDocumentIndesx) {
      const previousDocument = document.getElementById(previousDocumentIndesx);
      previousDocument.classList.remove("skel-order-insights")
    }
    data = scheduleContract.rows?.[0]?.billing[index];
    unstable_batchedUpdates(() => {
      setSliderDetails(data);
      setPreviousDocumetIndex(index)
    })
  };

  useEffect(() => {
    setTotalOrderValue(
      Number(childOrder?.rcAmount || 0) + Number(childOrder?.nrcAmount || 0)
    );
    setTotalRCValue(Number(childOrder?.rcAmount || 0));
    setTotalNRCValue(Number(childOrder?.nrcAmount || 0));

    if (childOrder?.orderCategory && !isEmpty(childOrder?.orderCategory) && childOrder?.orderType && !isEmpty(childOrder?.orderType)) {
      post(`${properties.ORDER_API}/get-related-category-info`, {
        orderCategory: orderData?.orderCategory,
        orderType: orderData?.orderType,
      }).then((response) => {
        if (response?.data) {
          setCategoryList(response?.data?.orders || []);
          setCategoryAppointmentList(response?.data?.appointments || []);
          let saleValue = 0;
          if (Array.isArray(response?.data?.orders)) {
            for (const sale of response?.data?.orders) {
              saleValue += Number(sale.billAmount);
            }
          }
          setCategoryValue(saleValue);

          const groupByChannel = groupBy(response.data.orders, "orderChannel", 'description');
          const ch = [];
          const channelKeys = Object.keys(groupByChannel);
          console.log('channelKeys---->', channelKeys)
          for (const key of channelKeys) {
            const obj = {
              channel: key,
              open: groupByChannel[key].filter(
                (f) =>
                  !["CNCLED", "CLS"].includes(f.orderStatus?.code)
                // && f.orderNo !== orderData.orderNo
              ).length,
              closed: groupByChannel[key].filter(
                (f) =>
                  ["CNCLED", "CLS"].includes(f.orderStatus?.code)
                // && f.orderNo !== orderData.orderNo
              ).length,
            };
            ch.push(obj);
          }

          setCategoryChannelWise(ch);

          // const closed = response?.data.orders.filter(
          //   (f) =>
          //     ["CANCELLED", "CLOSED", "CANCEL"].includes(f.orderStatus) &&
          //     f.orderNo !== orderData.orderNo
          // );
          // closed.filter((e) => {
          //   // console.log(moment(new Date(e.assignedDate)), moment(new Date(e.createdAt)))
          //   if (e.assignedDate) {
          //     const a = moment(new Date(e.assignedDate));
          //     const b = moment(new Date(e.createdAt));
          //     totalDays += a.diff(b, "days");
          //   }
          // });
          // const avgDays = totalDays / closed.length;
          // setCategoryValue(avgDays);
        }
      }).catch(error => console.log(error));
    }
  }, [childOrder, orderData]);

  useEffect(() => {
    if (typeof customerDetails === "object" && customerDetails !== null && customerDetails.customerUuid) {
      console.log("customerDetails.customerUuid ====> ", customerDetails.customerUuid);
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
        .catch((error) => console.log(error))
        .finally(() => console.log("final"));
    }
  }, [customerDetails]);

  // const groupBy = (items, key, subkey) => items.reduce(
  //   (result, item) => ({
  //     ...result,
  //     [item?.[key]?.[subkey]]: [...(result[item?.[key]?.[subkey]] || []), item],
  //   }),
  //   {}
  // );

  const groupBy = (items, key, subkey) =>
    items.reduce((result, item) => {
      const subkeyValue = item?.[key]?.[subkey];
      if (subkeyValue !== null && subkeyValue !== undefined) {
        return {
          ...result,
          [subkeyValue]: [...(result[subkeyValue] || []), item],
        };
      }
      return result;
    }, {});

  const isUpcomingAppointment = (appointmentDetails) => {
    if (!isEmpty(appointmentDetails)) {
      const appointDateTime = appointmentDetails?.rows?.[0]?.appointDate + " " + appointmentDetails?.rows?.[0]?.appointStartTime;
      let appointDate = moment(appointDateTime, "YYYY-MM-DD");
      let today = moment();
      return (moment(appointDate).isSame(today) || moment(appointDate).isAfter(today));
    } else {
      return false;
    }
  }

  useEffect(() => {
    if (!isEmpty(appointmentDetails)) {
      // console.log('appointmentDetails--------->', appointmentDetails);
      // console.log(appointmentDetails);
      let appointDate = moment(appointmentDetails?.rows?.[0]?.appointDate).format("DD MMM YYYY");
      let today = moment().format("DD MMM YYYY");
      let title = "";
      let startTime = moment("1970-01-01 " + appointmentDetails?.rows?.[0]?.appointStartTime).format("hh:mm A")
      let endTime = moment("1970-01-01 " + appointmentDetails?.rows?.[0]?.appointEndTime).format("hh:mm A")
      let showAlert = false;
      if (moment(appointDate).isSame(today)) {
        showAlert = true;
        title = "Today's Appointment";
      } else if (moment(appointDate).isAfter(today)) {
        showAlert = true;
        title = `There is an upcoming appointment at ${appointDate}`;
      }
      if (showAlert) {
        Swal.fire({
          title: title,
          text: `${appointmentDetails?.rows?.[0]?.appointMode?.description} Scheduled at ${startTime} to ${endTime} \n
              Pending with ${appointmentDetails?.rows?.[0]?.appointmentAgent?.firstName} ${appointmentDetails?.rows?.[0]?.appointmentAgent?.lastName}
          `,
          icon: "warning",
          confirmButtonColor: "#3085d6",
          confirmButtonText: `Ok!`,
          allowOutsideClick: false,
        });
      }
    }
  }, [appointmentDetails])

  const getAppointmentText = () => {
    let appointDate = moment(appointmentDetails?.rows?.[0]?.appointDate).format("DD MMM YYYY");
    let today = moment().format("DD MMM YYYY");
    let startTime = moment("1970-01-01 " + appointmentDetails?.rows?.[0]?.appointStartTime).format("hh:mm A")
    let endTime = moment("1970-01-01 " + appointmentDetails?.rows?.[0]?.appointEndTime).format("hh:mm A")
    if (moment(appointDate).isSame(today)) {
      return (
        <span><strong>Today -</strong> there is an appointment scheduled for this order at {startTime} to {endTime}</span>
      )
    } else if (moment(appointDate).isAfter(today)) {
      return (
        <span><strong>Upcoming Appointment -</strong> scheduled for this order on <strong>{appointDate} {startTime} to {endTime}</strong></span>
      )
    }
  }


  const [filteredByStatusOrders, setFilteredByStatusOrders] = useState([]);
  const [isOrderByStatusListOpen, setIsOrderByStatusListOpen] = useState(false);
  const handleOpenUpcomingAppointmentOrders = (status) => {
    const orderIds = categoryAppointmentList
      ?.filter((e) => status?.includes(e?.status))
      .map((e) => e?.tranCategoryNo);
    let filteredOrders = [];
    orderIds?.forEach((ele) => {
      const filteredOrder = categoryList?.filter((e) => e?.orderNo === ele);
      filteredOrders.push(filteredOrder[0]);
    });
    setFilteredByStatusOrders(filteredOrders);
    setIsOrderByStatusListOpen(true);
  };


  return (
    <div className="row px-2 pt-2">
      {(!isEmpty(appointmentDetails) && isUpcomingAppointment(appointmentDetails)) && (
        <Marquee direction="right" style={{ fontSize: '18px' }}>
          {getAppointmentText()}
        </Marquee>
      )}
      <div className="col-3">
        <div className="">
          <div className="">
            <div className="cust-sect-1">
              <div className="bg-secondary text-center p-1 int-h4-title">
                <h4>Order Details</h4>
              </div>
              <div className="cust-profile card-box border">
                <img
                  src={customerDetails?.customerPhoto || vImp}
                  alt=""
                  className="img-fluid profile-img border-radius50"
                />
                <div className="profile-info-rht">
                  <div className="cust-profile-top skel-interaction-cust-profile-top">
                    <div className="profile-top-head">
                      <span className="profile-name">
                        {customerDetails?.firstName ||
                          customerDetails?.lastName || '-'}
                      </span>
                      <p>Customer Id: {customerDetails?.customerNo || '-'}</p>
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
                    {(customerDetails?.customerContact &&
                      customerDetails?.customerContact?.[0]?.emailId) ||
                      "NA"}
                  </a>
                  <p>
                    Contact:{" "}
                    {(customerDetails?.customerContact &&
                      customerDetails?.customerContact?.[0]?.mobileNo) ||
                      "NA"}
                  </p>
                </div>
                <div className="d-flex">
                  <div className="interaction-bussiness-info">
                    <span className="bussiness-type px-1 font-12">
                      {customerDetails?.customerCatDesc?.description ||
                        customerDetails?.customerCategory?.description ||
                        "NA"}
                    </span>
                  </div>
                  <div className="interaction-bussiness-info">
                    <span className="profile-status px-1 font-12">
                      {customerDetails?.statusDesc?.description ||
                        customerDetails?.status?.description ||
                        "NA"}
                    </span>
                  </div>
                </div>
              </div>
              {/* <div className="cmmn-container-base"> */}
              <div>
                {/* <div className="d-flex bg-light card-box border p-2">
                  <div className="col-6">
                    <div className="text-center">
                      <p className="mb-2 text-truncate">Revenue</p>
                      <h4 className="text-danger">
                        <p style={{ cursor: "pointer" }} onclick="">
                          {revenueDetails?.totalAmount
                            ? Number(revenueDetails?.totalAmount)
                            : 0}{" "}
                          <br />
                          {revenueDetails?.currency}
                        </p>
                      </h4>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center">
                      <p className="mb-2 text-truncate">Average</p>
                      <h4 className="text-primary">
                        <p style={{ cursor: "pointer" }} onclick="">
                          {revenueDetails?.averageAmount
                            ? Number(revenueDetails?.averageAmount).toFixed(2)
                            : 0}{" "}
                          {revenueDetails?.currency}
                        </p>
                      </h4>
                    </div>
                  </div>
                </div> */}
                <div className=" my-2">
                  <span className="container-title">Order Summary</span>
                </div>
                <div className="skel-tot-inter w-100">
                  <div className="skel-tot">
                    Total
                    <span>
                      <a
                        data-toggle="modal"
                        data-target="#skel-view-modal-interactions"
                        onClick={() => {
                          handleOrderSummaryModal("TOTAL");
                        }}
                      >
                        {orderCountHistory?.totalOrderCount || 0}
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
                          handleOrderSummaryModal("OPEN");
                        }}
                      >
                        {orderCountHistory?.openOrderCount || 0}
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
                          handleOrderSummaryModal("CLOSED");
                        }}
                      >
                        {orderCountHistory?.closedOrderCount || 0}
                      </a>
                    </span>
                  </div>
                </div>

                <div className="skel-inter-statement card-box border mt-2">
                  <span className="container-title"> Order Details</span>
                  {/* <span><a className="styl-edti-btn p-1" href="#additional" type="button">Edit</a></span> */}
                  <div className="rht-skel skel-int-360-btns">
                    {!["CLS", "CNCLED"].includes(
                      orderData?.orderStatus?.code
                    ) && (
                        <>
                          <button
                            className="skel-btn-cancel"
                            data-target="#cancelModal"
                            data-toggle="modal"
                            onClick={() => setIsCancelOpen(true)}
                          >
                            Cancel Order
                          </button>
                          {/* <button className="skel-btn-submit" onClick="window.location.href='edit-interaction.html'">Edit</button> */}
                          {permissions?.readOnly &&
                            auth?.currDeptId ===
                            orderData?.currentDepartment?.code &&
                            Number(auth?.currRoleId) ===
                            Number(orderData?.currentRole?.code) &&
                            orderData?.currentUser?.code && (
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
                            className={`skel-btn-submit ${!permissions?.assignToSlef ? "d-none" : ''
                              }`}
                            onClick={() => handleOnAssignToSelf("SELF")}
                          >
                            Assign To Self
                          </button>
                          <button
                            className={`skel-btn-submit ${!permissions?.reAssign ? "d-none" : ''
                              }`}
                            onClick={() => setIsReAssignOpen(true)}
                          >
                            Re-Assign
                          </button>
                          <button
                            className={`skel-btn-submit  ${!permissions?.followup ? "d-none" : ''
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

                  {/* <ul className="mt-2">
                    <li className="skel-lbl-flds pl-1">Statement</li>
                  </ul> */}
                  <div className="">
                    {/* <div className="skel-heading mb-2 pl-1">
                      {orderData?.requestStatement}
                    </div> */}
                    {/* <div className="skel-view-interaction-stat"> */}
                    <div className="">
                      <div className="view-int-details-key">
                        <table className="bg-light w-100">
                          <tr>
                            <td className="p-1">
                              <span className="font-weight-bold">Order No</span>
                            </td>
                            <td className="p-1">
                              :{" "}
                              {orderNo}
                            </td>
                          </tr>
                          <tr>
                            <td className="p-1">
                              <span className="font-weight-bold">Child Order No</span>
                            </td>
                            <td className="p-1">
                              :{" "}
                              {childOrderId || childOrder.orderNo}
                            </td>
                          </tr>
                          <tr>
                            <td className="p-1">
                              <span className="font-weight-bold">Category</span>
                            </td>
                            <td className="p-1">
                              : {childOrder?.orderCategory?.description}
                            </td>
                          </tr>
                          <tr>
                            <td className="p-1">
                              <span className="font-weight-bold">Family</span>
                            </td>
                            <td className="p-1">
                              : {childOrder?.orderFamily?.description}
                            </td>
                          </tr>
                          <tr>
                            <td className="p-1">
                              <span className="font-weight-bold">Type</span>
                            </td>
                            <td className="p-1">
                              : {childOrder?.orderType?.description}
                            </td>
                          </tr>
                          <tr>
                            <td className="p-1">
                              <span className="font-weight-bold">Source</span>
                            </td>
                            <td className="p-1">
                              : {childOrder?.orderSource?.description}
                            </td>
                          </tr>
                          <tr>
                            <td className="p-1">
                              <span className="font-weight-bold">Channel</span>
                            </td>
                            <td className="p-1">
                              : {childOrder?.orderChannel?.description}
                            </td>
                          </tr>
                          <tr>
                            <td className="p-1">
                              <span className="font-weight-bold">Priority</span>
                            </td>
                            <td className="p-1">
                              : {childOrder?.orderPriority?.description}
                            </td>
                          </tr>
                          <tr>
                            <td className="p-1">
                              <span className="font-weight-bold">
                                Current Deparment / Role
                              </span>
                            </td>
                            <td className="p-1">
                              : {childOrder?.currEntity?.unitDesc || ""}/
                              {childOrder?.currRole?.roleDesc || ""}
                            </td>
                          </tr>
                          <tr>
                            <td className="p-1">
                              <span className="font-weight-bold">
                                Current User
                              </span>
                            </td>
                            <td className="p-1">
                              : {childOrder?.currUser?.firstName || ""}
                              {childOrder?.currUser?.lastName || ""}
                            </td>
                          </tr>
                          <tr>
                            <td className="p-1">
                              <span className="font-weight-bold">Status</span>
                            </td>
                            <td className="p-1">
                              : {childOrder?.orderStatus?.description}
                            </td>
                          </tr>
                        </table>
                        <span id="additional"></span>
                        {/* <p className="pt-2">
                          <span className="font-weight-bold">
                            Solutions Solved by:
                          </span>
                          {orderData?.isResolvedBy === "BOT"
                            ? "BOT ✅ " + " HUMAN ❌"
                            : "BOT ❌ " + " HUMAN ✅"}
                        </p> */}
                      </div>
                    </div>
                  </div>
                </div>

                {!!!['CLS', 'CNCLED'].includes(childOrder?.orderStatus?.code) && <div className=" mb-2 second mt-2 card-box border">
                  <div className="w-100 p-1 text-center">
                    <div className="container-heading">
                      <span className="container-title">Edit Order</span>
                    </div>
                  </div>
                  <div className="pb-1 p-1" id="content">
                    <label htmlFor="serviceNumber" className="control-label">
                      Additional Remarks
                    </label>
                    <textarea
                      disabled={permissions?.readOnly || taskAvailableAndNotCompleted}
                      maxLength="2500"
                      className={`form-control ${error?.remarks && "error-border"
                        }`}
                      id="remarks"
                      name="remarks"
                      rows="4"
                      value={interactionInputs?.remarks}
                      onChange={handleOnTicketDetailsInputsChange}
                      autoFocus
                    ></textarea>
                    <span className="text-muted">maximum 2500 Characters</span>
                  </div>

                  <div className="pb-1 p-1">
                    <label htmlFor="idType" className="control-label">
                      Status
                    </label>
                    <select
                      disabled={permissions?.readOnly}
                      id="currStatus"
                      value={interactionInputs?.currStatus}
                      onChange={(e) => {
                        handleStatusChange(e);
                      }}
                      className={`form-control ${error?.currStatus && "error-border"
                        }`}
                    >
                      <option key="status" value="">
                        Select...
                      </option>
                      {currStatusLookup &&
                        currStatusLookup.map((currStatus, index) => (
                          <option key={index} value={currStatus?.code || ''}>
                            {currStatus?.description}
                          </option>
                        ))}
                    </select>
                    <span className="errormsg">
                      {error.currStatus ? error.currStatus : ""}
                    </span>
                  </div>

                  <div className="pb-1 p-1">
                    <label htmlFor="idType" className="control-label">
                      Deparment/Role
                    </label>
                    <select
                      disabled={permissions?.readOnly || taskAvailableAndNotCompleted}
                      id="assignRole"
                      value={interactionInputs?.assignRole}
                      onChange={(e) => {
                        handleOnTicketDetailsInputsChange(e);
                      }}
                      className={`form-control ${error?.assignRole && "error-border"}`}
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
                                  value={data?.roleId}
                                  data-entity={JSON.stringify(dept?.entity?.[0])}
                                >
                                  {data?.roleDesc}
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
                    <label htmlFor="idType" className="control-label">
                      User
                    </label>
                    <select
                      disabled={permissions?.readOnly || taskAvailableAndNotCompleted}
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
                          <option key={user?.userId} value={user?.userId}>
                            {user?.firstName || ''} {user.lastName || ''}
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
                </div>}
                <div className="cmmn-container-base border">
                  <div className="container-heading">
                    <span className="container-title">
                      <i className="fe-pocket"></i> Upcoming Appointments{" "}
                    </span>
                  </div>
                  {(!isEmpty(appointmentDetails) && isUpcomingAppointment(appointmentDetails)) ? (
                    // <span className="badge badge-success p-1">
                    <div className="skel-int-360-appt">
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
                              ).format("hh:mm A")
                              : "-"}
                            &nbsp;-&nbsp;
                            {appointmentDetails?.rows?.[0]?.appointEndTime
                              ? moment(
                                "1970-01-01 " +
                                appointmentDetails?.rows?.[0]
                                  ?.appointEndTime
                              ).format("hh:mm A")
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
                    // </span>
                  ) : (
                    <span className="skel-widget-warning">
                      {" "}
                      No Appointment Available!!!
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-6">
        <div className="card p-2">
          <div className="cardbody">
            <div className="cardbody">
              <div className="bg-secondary text-center p-1 int-h4-title">
                <h4>Order Overview</h4>
              </div>
            </div>
          </div>
          <div className="container">
            <div className="row mt-2">
              <div className="col-12">
                <div className="card border">
                  <div className="card-body bg-primary">
                    <div className="media">
                      <div className="media-body overflow-hidden text-center">
                        <h4 className="header-title mb-2 font-weight-bold text-white">
                          {" "}
                          Order Insights
                        </h4>
                      </div>
                    </div>
                  </div>
                  <div className="card-body border-top p-0">
                    <div className="pl-2 pt-3 pr-2 pb-3">
                      {scheduleContract.rows &&
                        scheduleContract?.rows?.length > 0 ? (
                        <>
                          <Slider {...recentActivitySettings} className="px-0">
                            {scheduleContract.rows?.map((val, idx) => (
                              <div
                                key={idx}
                                className="skel-wrk-ord-summ"
                                data-Modal={val}
                              >
                                <p>
                                  <span className="">Contract Name:</span>{" "}
                                  <span>{val?.contractName || ""}</span>
                                </p>
                                {/* <div className="skel-wrk-ord-graph"> */}
                                {/* <div className="pieID pie">
                                                        <img src={val?.productDetails?.productImage} alt="ProductImage" srcSet="" className='skel-prdt-cust-size' />
                                                    </div> */}

                                <div className="skel-wiz-flow mt-2">
                                  <Slider
                                    {...billingSliderSettings}
                                  // afterChange={handleSlidlerChange}
                                  >
                                    <div className="skel-wiz-flow-base" >
                                      {val &&
                                        val?.billing &&
                                        val?.billing.map((b, i) => (
                                          <React.Fragment key={i}>
                                            <div id={i}
                                              className={
                                                b?.status?.code === "BILLED"
                                                  ? "skel-wiz-date skel-paid-status"
                                                  : "skel-wiz-date skel-upcoming-status"
                                              }
                                              style={{ width: "200px" }} onClick={() => handleSlidlerChange(i)}
                                            >
                                              <span>
                                                <i className={b?.status?.code === "BILLED" ? "fas fa-check-circle" : ''}></i>
                                              </span>{" "}
                                              {moment(b?.startDate).format(
                                                "DD MMM"
                                              )}{" "}
                                              <br />{" "}
                                              {moment(b?.startDate).format(
                                                "YYYY"
                                              )}
                                            </div>
                                          </React.Fragment>
                                        ))}
                                    </div>
                                  </Slider>
                                  <div className="skel-wiz-bill-details">
                                    <div className="skel-wiz-bill-amt">
                                      <div className="skel-billing-schedule">
                                        <table>
                                          <tr>
                                            <td
                                              width="40%"
                                              className="skel-lbl-f-sm"
                                            >
                                              Billing Status
                                            </td>
                                            <td width="10%">:</td>
                                            <td>
                                              {sliderDetails?.status
                                                ?.description || ""}
                                            </td>
                                          </tr>
                                          <tr>
                                            <td
                                              width="40%"
                                              className="skel-lbl-f-sm"
                                            >
                                              Start Date
                                            </td>
                                            <td width="10%">:</td>
                                            <td>
                                              {sliderDetails?.startDate
                                                ? moment(
                                                  sliderDetails?.startDate
                                                ).format("DD-MM-YYYY")
                                                : ""}
                                            </td>
                                          </tr>
                                          <tr>
                                            <td
                                              width="40%"
                                              className="skel-lbl-f-sm"
                                            >
                                              End Date
                                            </td>
                                            <td width="10%">:</td>
                                            <td>
                                              {sliderDetails?.endDate
                                                ? moment(
                                                  sliderDetails?.endDate
                                                ).format("DD-MM-YYYY")
                                                : ""}
                                            </td>
                                          </tr>
                                        </table>

                                        <table>
                                          <tr>
                                            <td
                                              width="60%"
                                              className="skel-lbl-f-sm"
                                            >
                                              RC Amt
                                            </td>
                                            <td width="10%">:</td>
                                            <td width="30%">
                                              {(sliderDetails?.rcAmount
                                                ? Number(
                                                  sliderDetails?.rcAmount
                                                )
                                                : 0
                                              ).toFixed(2)}
                                            </td>
                                          </tr>
                                          <tr>
                                            <td
                                              width="60%"
                                              className="skel-lbl-f-sm"
                                            >
                                              OTC Amt
                                            </td>
                                            <td width="10%">:</td>
                                            <td width="30%">
                                              {(sliderDetails?.otcAmount
                                                ? Number(
                                                  sliderDetails?.otcAmount
                                                )
                                                : 0
                                              ).toFixed(2)}
                                            </td>
                                          </tr>
                                          <tr className="sk-fnt-lg">
                                            <td
                                              width="60%"
                                              className="skel-lbl-f-sm"
                                            >
                                              Total Amt
                                            </td>
                                            <td width="10%">:</td>
                                            <td
                                              className="skel-lbl-f-sm"
                                              width="30%"
                                            >
                                              {(
                                                (sliderDetails?.rcAmount
                                                  ? Number(
                                                    sliderDetails?.rcAmount
                                                  )
                                                  : 0) +
                                                (sliderDetails?.otcAmount
                                                  ? Number(
                                                    sliderDetails?.otcAmount
                                                  )
                                                  : 0)
                                              ).toFixed(2)}
                                            </td>
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
                                {/* </div> */}
                              </div>
                            ))}
                          </Slider>
                        </>
                      ) : (
                        <span className="skel-widget-warning">
                          No Schedule Billing & Payment Found !!!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card-box border mt-2" dir="ltr">
            <h4 className="header-title mb-2 font-weight-bold">
              Order KPI <hr className="border" />
            </h4>

            <div>
              <div className="col-12 border p-2 bg-primary">
                <div className="text-center">
                  <p className="mb-2 text-white text-truncate">
                    Total Payment Amount
                  </p>
                  <h4 className="text-white">
                    $<span data-plugin="counterup">{totalOrderValue}</span>
                  </h4>
                </div>
              </div>
              <div className="row">
                <div className="col-6 border p-2 bg-light">
                  <div className="text-center">
                    <p className="mb-2 text-dark text-truncate">
                      Total RC Value
                    </p>
                    <h4 className="text-dark">
                      <span data-plugin="counterup">{childOrder?.customerDetails?.currency?.mappingPayload?.symbol || '$'}{totalRCValue}</span>
                    </h4>
                  </div>
                </div>
                <div className="col-6 border p-2 bg-light">
                  <div className="text-center">
                    <p className="mb-2 text-dark text-truncate">
                      Total NRC Value
                    </p>
                    <h4 className="text-dark">
                      <span data-plugin="counterup">{childOrder?.customerDetails?.currency?.mappingPayload?.symbol || '$'}{totalNRCValue}</span>
                    </h4>
                  </div>
                </div>
                <div className="col-6 border p-2 bg-dark">
                  <div className="text-center">
                    <p className="mb-2 text-white text-truncate">
                      Billing Contract
                    </p>
                    <h4 className="text-white">
                      {childOrder?.customerDetails?.currency?.mappingPayload?.symbol || '$'}
                      <span data-plugin="counterup">
                        {totalBillingContractValue}
                      </span>
                    </h4>
                  </div>
                </div>
                <div className="col-6 border p-2 bg-dark">
                  <div className="text-center">
                    <p className="mb-2 text-white text-truncate">
                      Total Invoice Amount
                    </p>
                    <h4 className="text-white">
                      {childOrder?.customerDetails?.currency?.mappingPayload?.symbol || '$'}<span data-plugin="counterup">{totalInvoiceValue}</span>
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card-box border mt-2" dir="ltr">
            <h4 className="header-title mb-2 font-weight-bold">
              Products Overview
            </h4>
            <div id="accordion" className="mb-3">
              {orderedProductDetails && orderedProductDetails.length > 0 ? (
                orderedProductDetails.map((val, idx) => (
                  <div key={idx} className="card mb-1">
                    <div className="card-header" id={`heading${idx}`}>
                      <h5 className="m-0">
                        <a
                          className="text-white"
                          data-toggle="collapse"
                          href={`#collapse${idx}`}
                          aria-expanded="true"
                          onClick={(e) => {
                            handleAfterChange(idx);
                          }}
                        >
                          {val?.productDetails?.productName || ""}
                        </a>
                      </h5>
                    </div>
                    <div id={`collapse${idx}`} className="collapse" aria-labelledby={`heading${idx}`} data-parent="#accordion"
                    >
                      <div className="card-body border">
                        <div className="col-12 bg-light d-flex" style={{ height: "auto" }}>
                          <div className="col-3 p-1 font-weight-bold">
                            <img src={val?.productDetails?.productImage} alt="ProductImage" srcSet="" style={{ height: "130px", width: "150px" }} />
                          </div>
                          <div className="col-9 p-1 font-weight-bold">
                            <div className="col-12">
                              <table className="border w-100 ml-2 mt-1">
                                <tr>
                                  <td className="text-bold p-1" width="40%"> Product Type</td>
                                  <td>:{" "}{val?.productDetails?.productType?.description || ""}</td>
                                </tr>
                                <tr>
                                  <td className="text-bold p-1" width="40%"> Product Category</td>
                                  <td>:{" "}{val?.productDetails?.productCategory?.description || ""}</td>
                                </tr>
                                <tr>
                                  <td className="text-bold p-1" width="40%"> Product sub Category</td>
                                  <td>:{" "}{val?.productDetails?.productSubCategory?.description || ""}</td>
                                </tr>
                                <tr>
                                  <td className="text-bold p-1" width="40%"> Service Type</td>
                                  <td>:{" "}{val?.productDetails?.serviceType?.description || ""}</td>
                                </tr>
                                <tr>
                                  <td className="text-bold p-1">Qty</td>
                                  <td>: {val?.productQuantity || 0}</td>
                                </tr>
                                <tr>
                                  <td className="text-bold p-1">Amount</td>
                                  <td>:{val?.customerDetails?.currency?.mappingPayload?.symbol || '$'} {val?.billAmount || 0}</td>
                                </tr>
                                <tr>
                                  <td className="text-bold p-1">Agreement</td>
                                  <td>:{" "}<span>
                                    {
                                      <PictureAsPdfIcon color="primary"
                                        style={{ cursor: "pointer" }} onClick={() => {
                                          handleAgreementDownload(
                                            val?.productDetails?.productId,
                                            idx
                                            // samplebase64,
                                            // val?.productDetails?.productName +
                                            // "_agreement"
                                          );
                                        }}
                                      />
                                    }
                                  </span>
                                  </td>
                                </tr>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <></>
              )}
            </div>
          </div>
          <div className="card-box border my-1 mt-2" dir="ltr">
            <div className="skel-dashboard-title-base">
              <span className="skel-header-title" onClick={() => setIsRefresh(!isRefresh)}><h4 className="header-title mb-2 font-weight-bold" >Order Workflow Details</h4></span>
              <div className="skel-dashboards-icons">
                <a className="p-2" onClick={() => { setIsOrderJournyOpen(true) }}><i className="material-icons">fullscreen</i></a>
              </div>
            </div>
            <div className="text-center p-4" style={{ height: "180px" }}>
              <OrderJourney data={orderWorkflow} provision={childOrder?.orderProductDetails?.[0]?.productDetails?.provisioningType?.description || ''} height="100%" width="100%" type="small" />
            </div>
          </div>

          <div className="card-box border my-1 mt-2" dir="ltr">
            <div className="skel-dashboard-title-base">
              <span className="skel-header-title"><h4 className="header-title mb-2 font-weight-bold" >Order task</h4></span>
            </div>
            <div className="text-center p-4">
              <div className="skel-emoj-data" style={{ height: 'auto' }}>
                {taskDetails && taskDetails.length > 0 ?
                  <div id="explanation-table">
                    <table style={{ width: '100%' }}>
                      {taskDetails?.map((taskDetail) => (
                        <tr key={taskDetail.taskName} className="mt-1">
                          <th>
                            {taskDetail.taskName}
                          </th>
                          <td>
                            <select
                              onChange={(event) => {
                                const selectedOption = taskStatuses.find(x => x.code == event.target.value);
                                handleTaskStatusChange(selectedOption, taskDetail.taskNo);
                                taskAvailableAndNotCompletedFunc(taskDetails);
                              }}
                              value={selectedTask.find(x => x.taskNo == taskDetail.taskNo)?.value}
                              disabled={permissions.readOnly}
                              id="taskCompletion"
                              className="form-control"
                            >
                              <option key="taskCompletion" value="">
                                Select Status
                              </option>
                              {taskStatuses?.map((option) => (
                                <option key={option.code} value={option.code}>
                                  {option.description}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <textarea
                              className="form-control"
                              value={selectedTask.find(x => x.taskNo == taskDetail.taskNo)?.comments}
                              onChange={e => {
                                selectedTaskComments[taskDetail.taskNo] = e.target.value;
                                setSelectedTaskComments({ ...selectedTaskComments });
                                const index = selectedTask.findIndex((ele) => ele.taskNo === taskDetail.taskNo);
                                if (index !== -1) {
                                  selectedTask[index]['comments'] = selectedTaskComments[taskDetail.taskNo];
                                  setSelectedTask([...selectedTask]);
                                }
                                taskAvailableAndNotCompletedFunc(taskDetails);
                              }}></textarea>
                          </td>
                        </tr>
                      ))}
                    </table>
                  </div>
                  : <span className='skel-widget-warning'>No Pending Task Found</span>
                }
              </div>
            </div>
          </div>

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
                  <td>{childOrder?.orderCategory?.description}</td>
                  <td>{childOrder?.orderType?.description}</td>
                </tr>
              </tbody>
            </table>
            <div className="border">
              <div className="card-body bg-primary">
                <div className="card border">
                  <div className="card-body">
                    <div className="media">
                      <div className="media-body overflow-hidden">
                        <h4 className="header-title mb-2 font-weight-bold text-center">
                          Total Sale
                        </h4>
                        <h4 className="text-primary text-center" onClick={() => { handleOrderModal('CAT-TOTAL') }}>
                          <span data-plugin="counterup">{categoryList.length}</span>
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card border">
                  <div className="card-body">
                    <div className="media">
                      <div className="media-body overflow-hidden">
                        <h4 className="header-title mb-2 font-weight-bold text-center">
                          Total Sale Value
                        </h4>
                        <h4 className="text-primary text-center" onClick={() => { handleOrderModal('CAT-TOTAL') }}>
                          $<span data-plugin="counterup">{categoryValue}</span>
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-box border mb-2">
              <div className="card-body">
                <div className="media">
                  <div className="media-body overflow-hidden">
                    <h4 className="header-title mb-2 font-weight-bold">
                      Sales Channel
                    </h4>
                  </div>
                </div>
                <DynamicTable
                  isScroll={true}
                  row={categoryChannelWise}
                  header={categoryChannelWiseColumns}
                  itemsPerPage={10}
                  handler={{
                    handleCellRender: handleCellRender,
                  }}
                />
              </div>
            </div>


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
                              <span data-plugin="counterup" onClick={(e) => {
                                handleOpenUpcomingAppointmentOrders(['AS_SCHED', 'AS_COMP_SUCCESS', 'AS_COMP_UNSUCCESS', 'AS_RESCH',
                                  'AS_CANCEL',
                                  'AS_TEMP'])
                                // setIsOrderListOpen(true);
                                // setPopupType("AS_SCHED");
                              }}>
                                {categoryAppointmentList?.length}
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
                              {/* {console.log('categoryAppointmentList---------->', categoryAppointmentList)} */}
                              <h4 className="text-white">
                                <span
                                  data-plugin="counterup"
                                  onClick={(e) => {
                                    handleOpenUpcomingAppointmentOrders(['AS_SCHED'])
                                    // setIsOrderListOpen(true);
                                    // setPopupType("AS_SCHED");
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
                                  onClick={(e) => {
                                    handleOpenUpcomingAppointmentOrders(['AS_COMP_SUCCESS', 'AS_COMP_UNSUCCESS'])
                                    // setIsOrderListOpen(true);
                                    // setPopupType("CAT-AP-COMP");
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
                                <span data-plugin="counterup" onClick={(e) => {
                                  handleOpenUpcomingAppointmentOrders(['AS_COMP_SUCCESS'])
                                  // setIsOrderListOpen(true);
                                  // setPopupType("CAT-AP-COMP");
                                }}>
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
            </div>
          </div>
        </div>
      </div>
      {
        displayPreview && <NewCustomerPreviewModal isOpen={displayPreview}>
          <CustomerPreviewPrint data={{ orderedProductDetails: orderedProductDetails[id] }}
            handler={{
              handlePreviewCancel: () => setDisplayPreview(false),
              handlePrint: handlePrint
            }}
            ref={componentRef}

          />
        </NewCustomerPreviewModal>
      }

      <Modal isOpen={isOrderByStatusListOpen} style={RegularModalCustomStyles}>
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
                  Order Details for Customer Number{" "}
                  {customerDetails?.customerNo}
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                  onClick={() => setIsOrderByStatusListOpen(!isOrderByStatusListOpen)}
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
                      listKey={"Orders"}
                      row={filteredByStatusOrders}
                      rowCount={filteredByStatusOrders?.length}
                      header={OrdercategoryListColumns}
                      itemsPerPage={perPageModal}
                      isScroll={true}
                      backendPaging={true}
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

      <Modal isOpen={isOrderListOpen} style={RegularModalCustomStyles}>
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
                  Order Details for Customer Number{" "}
                  {customerDetails?.customerNo}
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                  onClick={handleOnModelClose}
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
                    {/* {console.log('popupType------>', popupType)} */}
                    <DynamicTable
                      listKey={"Orders"}
                      row={
                        popupType === "CAT-TOTAL"
                          ? categoryList
                          : popupType === "CAT-OPEN"
                            ? categoryList.filter(
                              (f) =>
                                !["CLS", "CNCLED"].includes(
                                  f.orderStatus
                                )
                            )
                            : popupType === "CAT-CLOSED"
                              ? categoryList.filter((f) =>
                                ["CLS", "CNCLED"].includes(
                                  f.orderStatus
                                )
                              )
                              : ["TOTAL", "OPEN", "CLOSED"].includes(popupType)
                                ? orderCustomerHistoryDetails
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
                                      : appointmentHistory.filter(
                                        (f) => f.statusDesc === popupType
                                      ) || []
                      }
                      rowCount={
                        popupType === "CAT-TOTAL"
                          ? categoryList.length
                          : popupType === "CAT-OPEN"
                            ? categoryList.filter(
                              (f) =>
                                !["CLS", "CNCLED"].includes(
                                  f.orderStatus
                                )
                            ).length
                            : popupType === "CAT-CLOSED"
                              ? categoryList.filter((f) =>
                                ["CLS", "CNCLED"].includes(
                                  f.orderStatus
                                )
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
                                      ).length
                                      : appointmentHistory.filter(
                                        (f) => f.statusDesc === popupType
                                      ) || 0
                      }
                      header={
                        ["TOTAL", "OPEN", "CLOSED"].includes(popupType) ? orderListColumns
                          : categoryListColumns
                      }
                      itemsPerPage={perPageModal}
                      isScroll={true}
                      backendPaging={
                        ["TOTAL", "OPEN", "CLOSED"].includes(popupType)
                          ? true
                          : false
                      }
                      backendCurrentPage={currentPageModal}
                      handler={{
                        handleCellRender: handleCellRender,
                        handlePageSelect: handlePageSelect,
                        handleItemPerPage: setPerPageModal,
                        handleCurrentPage: setCurrentPageModal,
                      }}
                    />
                    {/* <DynamicTable
                      listKey={"Orders"}
                      row={
                        popupType === "CAT-TOTAL"
                          ? categoryList
                          : popupType === "CAT-OPEN"
                            ? categoryList.filter(
                              (f) =>
                                !["CLS", "CNCLED"].includes(
                                  f.orderStatus
                                )
                            )
                            : popupType === "CAT-CLOSED"
                              ? categoryList.filter((f) =>
                                ["CLS", "CNCLED"].includes(
                                  f.orderStatus
                                )
                              )
                              : ["TOTAL", "OPEN", "CLOSED"].includes(popupType)
                                ? orderCustomerHistoryDetails
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
                                      : appointmentHistory.filter(
                                        (f) => f.statusDesc === popupType
                                      ) || []
                      }
                      rowCount={
                        popupType === "CAT-TOTAL"
                          ? categoryList.length
                          : popupType === "CAT-OPEN"
                            ? categoryList.filter(
                              (f) =>
                                !["CLS", "CNCLED"].includes(
                                  f.orderStatus
                                )
                            ).length
                            : popupType === "CAT-CLOSED"
                              ? categoryList.filter((f) =>
                                ["CLS", "CNCLED"].includes(
                                  f.orderStatus
                                )
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
                                      ).length
                                      : appointmentHistory.filter(
                                        (f) => f.statusDesc === popupType
                                      ) || 0
                      }
                      header={
                        ["TOTAL", "OPEN", "CLOSED"].includes(popupType) ? orderListColumns
                          : categoryListColumns
                      }
                      itemsPerPage={perPageModal}
                      isScroll={true}
                      backendPaging={
                        ["TOTAL", "OPEN", "CLOSED"].includes(popupType)
                          ? true
                          : false
                      }
                      backendCurrentPage={currentPageModal}
                      handler={{
                        handleCellRender: handleCellRender,
                        handlePageSelect: handlePageSelect,
                        handleItemPerPage: setPerPageModal,
                        handleCurrentPage: setCurrentPageModal,
                      }}
                    /> */}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isOrderSummaryListOpen} style={RegularModalCustomStyles}>
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
                  Order Details for Customer Number{" "}
                  {customerDetails?.customerNo}
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                  onClick={handleOnModelClose}
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
                    {/* {console.log('orderCountHistory------>', orderCountHistory)} */}
                    {/* {console.log('orderSummaryPopupType------>', orderSummaryPopupType)} */}
                    <DynamicTable
                      listKey={"Orders"}
                      row={
                        orderSummaryPopupType === "TOTAL"
                          ? orderCountHistory.totalOrderData
                          : orderSummaryPopupType === "OPEN"
                            ? orderCountHistory.openOrderData
                            : orderSummaryPopupType === "CLOSED"
                              ? orderCountHistory.closedOrderData
                              : []
                      }
                      rowCount={
                        orderSummaryPopupType === "TOTAL"
                          ? orderCountHistory.totalOrderCount
                          : orderSummaryPopupType === "OPEN"
                            ? orderCountHistory.openOrderCount
                            : orderSummaryPopupType === "CLOSED"
                              ? orderCountHistory.closedOrderCount
                              : 0
                      }
                      header={
                        orderListColumns
                      }
                      itemsPerPage={perPageModal}
                      isScroll={true}
                      backendPaging={false}
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

      {/** Workflow History */}
      <Modal isOpen={isWorflowHistoryOpen} contentLabel="Followup Modal" style={RegularModalCustomStyles}><>
        <div
          className="modal fade order-search" id="skel-view-modal-workflow" tabindex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header px-4 border-bottom-0 d-block">
                <button type="button" className="close" data-dismiss="modal" aria-hidden="true" onClick={() => setIsWorkflowHistoryOpen(false)}>
                  &times;
                </button>
                <h5 className="modal-title">
                  {!isFollowUpHistoryOpen
                    ? "Workflow History"
                    : "Followup History"}{" "}
                  for Order No {childOrder?.orderNo}
                </h5>
              </div>
              <div className="modal-body px-4">
                <div className="row">
                  <div className="col-md-12 pull-right">
                    <button type="button" className="skel-btn-submit"
                      onClick={(e) => {
                        e.preventDefault();
                        if (followUpHistory?.count === 0 || !followUpHistory) {
                          toast.error(
                            "No follow-up is available for this order."
                          );
                          return;
                        }
                        setIsFollowUpHistoryOpen(!isFollowUpHistoryOpen);
                      }}
                    >
                      {!isFollowUpHistoryOpen
                        ? `Followup History - ${followUpHistory?.count || 0}`
                        : `WorkFlow History - ${workflowHistory?.count || 0}`}
                    </button>
                  </div>
                </div>
                {!isFollowUpHistoryOpen ? (
                  <div className="timeline-workflow">
                    <ul>
                      {workflowHistory?.rows && workflowHistory?.rows.length > 0 && workflowHistory?.rows.map((data, idx) => (
                        <li key={idx}>
                          <div className="content">
                            <div className="row">
                              <div className="col-md-4">
                                <div className="form-group">
                                  <label htmlFor="Interactiontype" className="control-label">From Department/Role</label>
                                  <span className="data-cnt">{data?.fromEntityId?.unitDesc || ""} -{" "}{data?.fromRoleId?.roleDesc || ""}</span>
                                </div>
                              </div>
                              <div className="col-md-4">
                                <div className="form-group">
                                  <label htmlFor="Servicetype" className="control-label">To Department/Role</label>
                                  <span className="data-cnt">
                                    {data?.fromEntityId?.unitDesc || ""} -{" "}
                                    {data?.toRoleId?.roleDesc || ""}
                                  </span>
                                </div>
                              </div>
                              <div className="col-md-4">
                                <div className="form-group">
                                  <label htmlFor="Channel" className="control-label">
                                    User
                                  </label>
                                  <span className="data-cnt">
                                    {data?.createdByDescription?.firstName || ''} {data?.createdByDescription?.lastName || ''}
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
                                    {data?.orderStatus?.description}
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
                              {data?.createdAt ? moment(
                                data?.createdAt
                              ).format("DD MMM YYYY hh:mm:ss A") : 'NA'}
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
                        followUpHistory?.rows?.length > 0 &&
                        followUpHistory?.rows?.map((data, idx) => (
                          <li key={idx}>
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
                                      {data?.fromEntityId?.unitDesc || ""} -{" "}{data?.fromRoleId?.roleDesc || ""}
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
                                      {data?.fromEntityId?.unitDesc || ""} -{" "}{data?.fromRoleId?.roleDesc || ""}
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
                                      {data?.createdByDescription?.firstName || ''} {data?.createdByDescription?.lastName || ''}
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
                                      {data?.orderStatus?.description}
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
                                {data?.createdAt ? moment(
                                  data?.createdAt
                                ).format("DD MMM YYYY hh:mm:ss A") : 'NA'}
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
      {/* FOllowup */}
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
                  Followup for Order No {childOrder?.orderNo}
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
                      <span style={{ textDecoration: "underline" }}>
                        Followup(s)
                      </span>
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
                        value={followupInputs?.remarks}
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
                          className="btn btn-primary waves-effect waves-light mr-2"
                          onClick={handleOnAddFollowup}
                        >
                          Submit
                        </button>
                        <button
                          type="button"
                          className="btn btn-light waves-effect waves-light"
                          onClick={() => setIsFollowupOpen(false)}
                        >
                          Cancel
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
      {/** Reassign */}
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
                  Re-assign for order No - {childOrder?.orderNo}
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
                            <option key={user?.userId} value={user.userId}>
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
                        className="btn btn-primary waves-effect waves-light mr-2"
                        onClick={handleOnReAssign}
                      >
                        Submit
                      </button>
                      <button
                        type="button"
                        className="btn btn-light waves-effect waves-light"
                        onClick={() => setIsReAssignOpen(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      {/** Cancel Order */}
      <Modal isOpen={isCancelOpen} contentLabel="Followup Modal" style={RegularModalCustomStyles}      >
        <div
          className="modal-center" id="followupModal" tabindex="-1" role="dialog" aria-labelledby="followupModal" aria-hidden="true"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="followupModal">
                  Cancellation for Order No - {childOrder?.orderNo}
                </h5>
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
                          className="btn btn-primary waves-effect waves-light mr-2"
                          onClick={handleOnCancel}
                        >
                          Submit
                        </button>
                        <button
                          type="button"
                          className="btn btn-light waves-effect waves-light"
                          onClick={() => setIsCancelOpen(false)}
                        >
                          Cancel
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
      {/** Order Journey */}
      <Modal isOpen={isOrderJournyOpen} style={ModalCustomStyle}>
        <div className="modal-center" id="followupModal" tabindex="-1" role="dialog" aria-labelledby="followupModal" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="followupModal">
                  Order Details for Customer Number{" "}
                  {customerDetails?.customerNo}
                </h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => { setIsOrderJournyOpen(false) }}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="" /*style={{ height: "400px" }}*/>
                <OrderJourney data={orderWorkflow} provision={childOrder?.orderProductDetails?.[0]?.productDetails?.provisioningType?.description || ''} type="Full" />
              </div>
            </div>
          </div>
        </div>
      </Modal>
      {
        isEditCustomerDetailsOpen && (
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
        )
      }
      {
        isCustomerDetailsHistoryOpen && (
          <CustomerHistory
            data={{
              isOpen: isCustomerDetailsHistoryOpen,
              customerData: customerDetails,
            }}
            handler={{
              setIsOpen: setIsCustomerDetailsHistoryOpen,
            }}
          />
        )
      }

      <CalendarComponent
        data={{
          show,
          events,
        }}
        handlers={{
          setShow,
        }}
      />
    </div >
  );
};

const orderListColumns = [
  {
    Header: "Order No",
    accessor: "orderNo",
    disableFilters: true,
  },
  {
    Header: "order Type",
    accessor: "orderTypeDesc.description",
    disableFilters: true,
  },
  {
    Header: "Category",
    accessor: "orderCategoryDesc.description",
    disableFilters: true,
  },
  {
    Header: "Source",
    accessor: "orderSourceDesc.description",
    disableFilters: true,
  },
  {
    Header: "Channel",
    accessor: "orderChannelDesc.description",
    disableFilters: true,
  },
  // {
  //   Header: "Order Cause",
  //   accessor: "orderCauseDesc.description",
  //   disableFilters: true,
  // },
  {
    Header: "Priority",
    accessor: "orderPriorityDesc.description",
    disableFilters: true,
  },
  {
    Header: "Order Family",
    accessor: "orderFamilyDesc.description",
    disableFilters: true,
  },
  {
    Header: "Status",
    accessor: "orderStatusDesc.description",
    disableFilters: true,
  },
  {
    Header: "Created At",
    accessor: "createdAt",
    disableFilters: true,
  }
];

const categoryListColumns = [
  {
    Header: "Order No",
    accessor: "orderNo",
    disableFilters: true,
  },
  {
    Header: "order Type",
    accessor: "orderType.description",
    disableFilters: true,
  },
  {
    Header: "Category",
    accessor: "orderCategory.description",
    disableFilters: true,
  },
  {
    Header: "Source",
    accessor: "orderSource.description",
    disableFilters: true,
  },
  {
    Header: "Channel",
    accessor: "orderChannel.description",
    disableFilters: true,
  },
  // {
  //   Header: "Order Cause",
  //   accessor: "orderCause.description",
  //   disableFilters: true,
  // },
  {
    Header: "Priority",
    accessor: "orderPriority.description",
    disableFilters: true,
  },
  {
    Header: "Order Family",
    accessor: "orderFamily.description",
    disableFilters: true,
  },
  {
    Header: "Status",
    accessor: "orderStatus.description",
    disableFilters: true,
  },
  {
    Header: "Created At",
    accessor: "createdAt",
    disableFilters: true,
  }
]

const OrdercategoryListColumns = [
  {
    Header: "Order No",
    accessor: "orderNo",
    disableFilters: true,
  },
  {
    Header: "order Type",
    accessor: "orderType.description",
    disableFilters: true,
  },
  {
    Header: "Category",
    accessor: "orderCategory.description",
    disableFilters: true,
  },
  {
    Header: "Source",
    accessor: "orderSource.description",
    disableFilters: true,
  },
  {
    Header: "Channel",
    accessor: "orderChannel.description",
    disableFilters: true,
  },
  // {
  //   Header: "Order Cause",
  //   accessor: "orderCause.description",
  //   disableFilters: true,
  // },
  {
    Header: "Priority",
    accessor: "orderPriority.description",
    disableFilters: true,
  },
  {
    Header: "Order Family",
    accessor: "orderFamily.description",
    disableFilters: true,
  },
  {
    Header: "Status",
    accessor: "orderStatus.description",
    disableFilters: true,
  },
  {
    Header: "Created At",
    accessor: "createdAt",
    disableFilters: true,
  }
]

const categoryChannelWiseColumns = [
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

export default Order360;
