import { useState, useRef } from "react";
import moment from "moment";
import { OmniChannelDashboardContext } from "../../AppContext";
import { Form } from "react-bootstrap";
import { Controller, useForm } from "react-hook-form";
import { DateRangePicker } from "rsuite";
import { toast } from "react-toastify";
import InteractionChannel from "../../assets/images/interaction-chnl.svg";
import OrderChannel from "../../assets/images/order-chnl.svg";
import AppointmentChannel from "../../assets/images/appt-chnl.svg";
import SalesChannel from "../../assets/images/sales-chnll.svg";
import Averagechannel from "../../assets/images/avg-perf.svg";
import { get, post } from "../../common/util/restUtil";
import ReactSelect from "react-select";
import { properties } from "../../properties";
import React, { useEffect } from "react";
import VerticalBar from "../charts/barChart";
import Vertical from "../charts/bar-chart";
import Corner from "../charts/corner";
import Order from "../charts/orderBar";
import TotalChatBar from "../charts/totalChatBar";
import AbandonedBar from "../charts/abandonedBar";
import AveragePie from "../charts/averagePie";
import AverageHandlingPie from "../charts/averageHandlingPie";
import TurnArround from "../charts/turnArroundPie";
import Problemsolving from "../charts/problemsolvingbar";
import ChatHistory from "./ChatHistory";
import HeaderCount from "./HeaderCount";
import RevenueByChannel from "./RevenueByChannel";
import Modal from 'react-modal';
import PopupListModal from "./ModalPopups/PopupListModal";
import { RegularModalCustomStyles } from '../../common/util/util';
import TopPerformingChannels from "./Components/TopPerformingChannels";
import InteractionsByChannels from "./Components/InteractionsByChannels";
import OrdersByChannels from "./Components/OrdersByChannels";
import AppointmentsByChannels from "./Components/AppointmentsByChannels";
import { InteractionByChannelsColumns, AssignedOrdersColumns, AppointmentColumns, ProspectCustomerByChannelColumns, CommonColumns, LiveSupportColumns } from "./ModalPopups/PopupListModalColumns";
const OmniChannelDashboard = (props) => {
  function getChannelClassName(channel) {
    switch (channel) {
      case "IVR":
      case "Walk In":
        return "txt-clr-ivr";
      case "Live-chat":
        return "txt-clr-ivr";
      case "Email":
        return "txt-clr-email";
      case "Whatsapp Live Chat":
        return "txt-clr-whatsapp";
      case "Facebook Live Chat":
        return "txt-clr-facebook";
      case "Telegram":
        return "txt-clr-telegram";
      case "Instagram":
        return "txt-clr-instagram";
      case "WebSelfcare":
      case "Web Application":
      case "WEB":
        return "txt-clr-selfcare";
      default:
        return "txt-clr-selfcare"; // Default class name if no match is found
    }
  }


  function getChannelIcon(channel) {
    console.log('channel------>', channel)
    switch (channel) {
      case "Mobile APP":
      case "Mobile App":
        return <i className="fas fa-mobile-alt"></i>;
      case "IVR":
        return <i className="fas fa-microphone"></i>;
      case "Walk In":
        return <i className="fas fa-walking"></i>;
      case "Live-chat":
        return <i className="fas fa-comments"></i>;
      case "Email":
        return <i className="fas fa-envelope"></i>;
      case "Whatsapp Live Chat":
        return <i className="fab fa-whatsapp"></i>;
      case "Facebook Live Chat":
        return <i className="fab fa-facebook"></i>;
      case "Telegram":
        return <i className="fab fa-telegram"></i>;
      case "Instagram":
        return <i className="fab fa-instagram"></i>;
      case "WebSelfcare":
      case "Selfcare":
      case "SelfCare":
      case "Web Application":
      case "WEB":
        return (
          <>
            <i className="fas fa-globe"></i>
            {channel === null || channel === "HUMAN" ? <h1>!</h1> : null}
          </>
        );
      default:
        return <i className="fab fa-instagram"></i>;
    }
  }

  const [interactionsByDynamicChannel, setInteractionsByDynamicChannel] = useState();
  const [filteredInteractionsByDynamicChannel, setFilteredInteractionsByDynamicChannel] = useState();
  const [isInteractionByDynamicChannelPopupOpen, setIsInteractionByDynamicChannelPopupOpen] = useState(false);
  const [isOrderByDynamicChannelPopupOpen, setIsOrderByDynamicChannelPopupOpen] = useState(false);
  const [isAppointmentByDynamicChannelPopupOpen, setIsAppointmentByDynamicChannelPopupOpen] = useState(false);
  const [channelListCount, setChannelListCount] = useState(0)
  const [channelListPerPage, setChannelListPerPage] = useState(10)
  const [channelCurrentPage, setChannelCurrentPage] = useState(0)

  const [interactionsByChannel, setInteractionsByChannel] = useState();
  const [filteredInteractionsByChannel, setFilteredInteractionsByChannel] = useState();
  const [isInteractionByChannelPopupOpen, setIsInteractionByChannelPopupOpen] = useState(false);
  const [listCount, setListCount] = useState(0)
  const [listPerPage, setListPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(0)

  const [ordersByChannel, setOrdersByChannel] = useState();
  const [filteredOrdersByChannel, setFilteredOrdersByChannel] = useState();
  const [isOrderByChannelPopupOpen, setIsOrderByChannelPopupOpen] = useState(false);
  const [orderListCount, setOrderListCount] = useState(0)
  const [listOrderPerPage, setListOrderPerPage] = useState(10)
  const [orderCurrentPage, setOrderCurrentPage] = useState(0)

  const [appointmentByChannel, setAppointmentByChannel] = useState();
  const [filteredAppointmentByChannel, setFilteredAppointmentByChannel] = useState();
  const [isAppointmentByChannelPopupOpen, setIsAppointmentByChannelPopupOpen] = useState(false);
  const [appointmentListCount, setAppointmentListCount] = useState(0)
  const [listAppointmentPerPage, setListAppointmentPerPage] = useState(10)
  const [appointmentCurrentPage, setAppointmentCurrentPage] = useState(0)

  const [prospectByChannel, setProspectByChannel] = useState();
  const [filteredProspectByChannel, setFilteredProspectByChannel] = useState();
  const [isProspectByChannelPopupOpen, setIsProspectByChannelPopupOpen] = useState(false);
  const [prospectListCount, setProspectListCount] = useState(0)
  const [listProspectPerPage, setListProspectPerPage] = useState(10)
  const [prospectCurrentPage, setProspectCurrentPage] = useState(0)

  const [liveSupportByChannel, setLiveSupportByChannel] = useState();
  const [filteredLiveSupportByChannel, setFilteredLiveSupportByChannel] = useState();
  const [isLiveSupportByChannelPopupOpen, setIsLiveSupportByChannelPopupOpen] = useState(false);
  const [liveSupportListCount, setLiveSupportListCount] = useState(0)
  const [listLiveSupportPerPage, setListLiveSupportPerPage] = useState(10)
  const [liveSupportCurrentPage, setLiveSupportCurrentPage] = useState(0)

  const [topCustomerByChannel, setTopCustomerByChannel] = useState();
  const [filteredTopCustomerByChannel, setFilteredTopCustomerByChannel] = useState();
  const [isTopCustomerByChannelPopupOpen, setIsTopCustomerByChannelPopupOpen] = useState(false);
  const [topCustomerListCount, setTopCustomerListCount] = useState(0)
  const [listTopCustomerPerPage, setListTopCustomerPerPage] = useState(10)
  const [topCustomerCurrentPage, setTopCustomerCurrentPage] = useState(0)

  const { handleSubmit, control, reset } = useForm();
  const [topCustomersByChannel, setTopCustomersByChannel] = useState();
  const [averagePerformanceByChannel, setAveragePerformanceByChannel] = useState();
  const [totalRevenueByChannel, setTotalRevenueByChannel] = useState();
  const [viewType, setViewType] = useState("skel-channel-all");
  const [isPageRefresh, setIsPageRefresh] = useState(false);
  const [error, setError] = useState();
  const [isChecked, setIsChecked] = useState(false);
  const [pageRefreshTime, setPageRefreshTime] = useState(30);
  const formRef = useRef();
  const [searchParams, setSearchParams] = useState({});

  const [submitError, setSubmitError] = useState(null);
  const [count, setCount] = useState([]);
  const [orderCount, setOrderCount] = useState([]);
  const [topSales, setTopSales] = useState([]);
  const [totalAppointment, setTotalAppointment] = useState([]);
  const [topPerforming, setTopPerforming] = useState([]);
  const [totalChat, setTotalChat] = useState([]);
  const [abandonedChat, setAbandonedChat] = useState([]);
  let [issueResolved, setIssueResolved] = useState([]);
  let [iss, setIss] = useState([]);
  const [topProblem, setTopProblem] = useState([]);
  const [liveSupport, setLiveSupport] = useState([]);
  const [prospect, setProspect] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [category, setCategory] = useState([]);
  const [corner, setCorner] = useState([]);
  const [order, setOrder] = useState([]);
  const [issueResolvedWalkin, setIssueResolvedwalkin] = useState([]);
  const [overallRevenue, setOverallRevenue] = useState([]);
  const [average, setAverage] = useState([]);
  const [averageHandling, setAverageHandling] = useState([]);
  const [turnArround, setTurnAround] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [isRefresh, setIsRefresh] = useState(false);

  const groupBy = (items, key) =>
    items.reduce(
      (result, item) => ({
        ...result,
        [item[key]]: [...(result[item[key]] || []), item],
      }),
      {}
    );

  useEffect(() => {
    if (issueResolved?.length > 0) {
      const updatedIssueResolved = issueResolved.map((x) => {
        if (!x.channel) x.channel = "Unknown";
        return x;
      });
      const groupedIssueResolved = groupBy(updatedIssueResolved, "channel");
      let labels = [];
      let intxnData = [];
      let orderData = [];
      let result;
      for (const channel in groupedIssueResolved) {
        labels.push(channel);
        result = groupedIssueResolved[channel];
        // console.log('result------->', result);
        result && result.length > 0 && result.map((e) => {
          if (e.isResolvedBy === "HUMAN") {
            intxnData.push(e.count);
          } else if (e.isResolvedBy === "BOT") {
            orderData.push(e.count);
          }
          return e;
        });
      }
    }
  }, [issueResolved]);

  const handleAutoRefresh = (event) => {
    if (!pageRefreshTime) {
      toast.error("Refresh Time Is Require!");
      return;
    }
    setIsChecked(event.target.checked);
  };

  const handleSetRefreshTime = () => { };

  const contextProvider = {
    data: {},
    handlers: {},
  };

  useEffect(() => {
    TotalInterctionCount();
  }, [isRefresh]);

  const handleClear = (event) => {
    event.preventDefault();
    reset();
    setSearchParams({
      startDate: undefined, endDate: undefined, serviceType: undefined, serviceCategory: undefined
    });
  }

  const onSubmit = (data) => {
    console.log('data------>', data)
    setSubmitError(null);
    if (!data?.dateRange && !data?.serviceCat && !data?.serviceType) {
      setSubmitError("Please apply atleast one filter");
      return;
    }

    if (data?.dateRange?.length) {
      data.dateRange[1] = data?.dateRange?.[1]
        ? data.dateRange?.[1]
        : data.dateRange?.[0];
      data["startDate"] = moment(data.dateRange?.[0]).format("YYYY-MM-DD");
      data["endDate"] = moment(data.dateRange?.[1]).format("YYYY-MM-DD");
    }
    if (viewType === "skel-channel-all") {
      data["channel"] = "";
    }
    data["channel"] = viewType;
    if (data?.serviceType?.length > 0) {
      data["serviceType"] = data?.serviceType?.map((ele) => ele?.value);
    }
    if (data?.serviceCat?.length > 0) {
      data["serviceCategory"] = data?.serviceCat?.map((ele) => ele?.value);
    }

    setSearchParams({
      ...data,
    });
  };

  let requestBody = {
    searchParams: {
      startDate: searchParams.startDate,
      endDate: searchParams.endDate,
      channel: searchParams.channel,
      serviceCategory: searchParams.serviceCategory,
      serviceType: searchParams.serviceType,
    },
  };

  useEffect(() => {
    if (
      viewType === "WHATSAPP-LIVECHAT" ||
      viewType === "FB-LIVECHAT" ||
      viewType === "TELEGRAM" ||
      viewType === "INSTAGRAM" ||
      viewType === "EMAIL" ||
      viewType === "MOBILEAPP" ||
      viewType === "SELFCARE"
    ) {
      watapp();
    } else {
      allchannel();
    }
  }, [viewType, searchParams]);


  const TotalInterctionCount = (filterCleared = false) => {
    console.log('requestBody------->', requestBody)
    if (filterCleared) {
      requestBody["searchParams"]["startDate"] = "";
      requestBody["searchParams"]["endDate"] = "";
    }
    post(properties.INTERACTION_API + "/total-count-by-channel", requestBody)
      .then((response) => {
        setInteractionsByChannel(response?.data);
        const channelCounts = response?.data?.reduce((acc, obj) => {
          const channel = obj?.channel;
          if (acc[channel]) {
            acc[channel]++;
          } else {
            acc[channel] = 1;
          }
          return acc;
        }, {});

        const result = Object.entries(channelCounts).map(([channel, count]) => {
          return { "intxn_channel": channel, "count": count };
        });

        setCount(result);

      })
      .catch((error) => {
        console.error("error", error);
      })
      .finally();
  };

  const filterInteractionsByChannel = (channel) => {
    const data = interactionsByChannel?.filter((ele) => ele?.channel?.toUpperCase() === channel?.toUpperCase());
    setFilteredInteractionsByChannel(data);
  }

  const filterInteractionsByChannelAndBotOrHuman = (channel, botOrHuman) => {
    const data = issueResolved?.filter((ele) => ele?.channel?.toUpperCase() === channel?.toUpperCase() && ele?.is_resolved_by === botOrHuman);
    // console.log('data--------------->', data)
    setFilteredInteractionsByChannel(data);
  }

  const TotalOrder = (filterCleared = false) => {
    if (filterCleared) {
      requestBody["searchParams"]["startDate"] = "";
      requestBody["searchParams"]["endDate"] = "";
    }
    post(properties.ORDER_API + "/total-count-by-channel ", requestBody)
      .then((response) => {
        setOrdersByChannel(response?.data);
        const orderCounts = {};

        for (const order of response?.data) {
          const channel = order.channel;
          if (channel in orderCounts) {
            orderCounts[channel] += 1;
          } else {
            orderCounts[channel] = 1;
          }
        }

        const result = Object.entries(orderCounts).map(([order_channel, count]) => ({
          order_channel,
          count
        }));

        setOrderCount(result);
      })
      .catch((error) => {
        console.error("error", error);
      })
      .finally();
  };

  const filterOrdersByChannel = (channel) => {
    const data = ordersByChannel?.filter((ele) => ele?.channel === channel);
    setFilteredOrdersByChannel(data);
  }

  const TotalAppointment = (filterCleared = false) => {
    if (filterCleared) {
      requestBody["searchParams"]["startDate"] = "";
      requestBody["searchParams"]["endDate"] = "";
    }
    post(properties.APPOINTMENT_API + "/total-count-by-channel", requestBody)
      .then((response) => {
        setAppointmentByChannel(response?.data);
        const appointmentCounts = {};
        console.log('response?.data------>', response?.data)
        for (const appointment of response?.data) {
          const channel = appointment.channel;
          if (channel in appointmentCounts) {
            appointmentCounts[channel] += 1;
          } else {
            appointmentCounts[channel] = 1;
          }
        }

        const result = Object.entries(appointmentCounts).map(([appointment_channel, count]) => ({
          appointment_channel,
          count
        }));

        setTotalAppointment(result);
      })
      .catch((error) => {
        console.error("error", error);
      })
      .finally();
  };

  const filterAppointmentsByChannel = (channel) => {
    const data = appointmentByChannel?.filter((ele) => ele?.channel === channel);
    setFilteredAppointmentByChannel(data);
  }

  const TopSalesByChannel = (filterCleared = false) => {
    if (filterCleared) {
      requestBody["searchParams"]["startDate"] = "";
      requestBody["searchParams"]["endDate"] = "";
    }
    post(properties.INTERACTION_API + "/top-sales-by-channel", requestBody)
      .then((response) => {
        setTopSales(response.data);
      })
      .catch((error) => {
        console.error("error", error);
      })
      .finally();
  };

  const [topChannels, setTopChannels] = useState([])
  const [orderType, setOrderType] = useState()
  const TopChannelsByOrder = (filterCleared = false, orderType) => {
    if (filterCleared) {
      requestBody["searchParams"]["startDate"] = "";
      requestBody["searchParams"]["endDate"] = "";
    }
    if (orderType) {
      setOrderType(orderType)
      requestBody.orderType = orderType
    }
    post(properties.INTERACTION_API + "/top-channels-by-order", requestBody)
      .then((response) => {
        setTopChannels(response.data);
      })
      .catch((error) => {
        console.error("error", error);
      })
      .finally();
  };

  const ProspectChannel = (filterCleared = false) => {
    if (filterCleared) {
      requestBody["searchParams"]["startDate"] = "";
      requestBody["searchParams"]["endDate"] = "";
    }
    post(
      properties.INTERACTION_API + "/prospect-generated-by-channel",
      requestBody
    )
      .then((response) => {
        setProspectByChannel(response?.data);
        const prospectCounts = {};

        for (const prospect of response?.data) {
          const channel = prospect.channel;
          if (channel in prospectCounts) {
            prospectCounts[channel] += 1;
          } else {
            prospectCounts[channel] = 1;
          }
        }

        const result = Object.entries(prospectCounts).map(([prospect_channel, count]) => ({
          prospect_channel,
          count
        }));

        setProspect(result);
      })
      .catch((error) => {
        console.error("error", error);
      })
      .finally();
  };

  const filterProspectByChannel = (channel) => {
    console.log('channel------>', channel)
    const data = prospectByChannel?.filter((ele) => ele?.channel === channel);
    // console.log('data-------->', data)
    setFilteredProspectByChannel(data);
  }



  const [intxnType, setIntxnType] = useState()
  const ProblemSolvingChannel = (filterCleared = false, intxnType) => {
    if (filterCleared) {
      requestBody["searchParams"]["startDate"] = "";
      requestBody["searchParams"]["endDate"] = "";
    }
    if (intxnType && intxnType?.length > 0) {
      setIntxnType(intxnType)
      requestBody.intxnType = intxnType
    }
    post(
      properties.INTERACTION_API + "/top-problem-solving-by-channel",
      requestBody
    )
      .then((response) => {
        setTopProblem(response.data);
      })
      .catch((error) => {
        console.error("error", error);
      })
      .finally();
  };

  const [filteredLiveSupportDataByChannel, setFilteredLiveSupportDataByChannel] = useState([])
  const filterLiveSupportDataByChannel = (channel) => {
    const data = liveSupportData?.filter((ele) => ele?.channel_desc === channel);
    setFilteredLiveSupportDataByChannel(data);
  }


  const [liveSupportDataByChannel, setLiveSupportDataByChannel] = useState([]);
  const [liveSupportData, setLiveSupportData] = useState([]);
  const LiveSupport = (filterCleared = false) => {
    if (filterCleared) {
      requestBody["searchParams"]["startDate"] = "";
      requestBody["searchParams"]["endDate"] = "";
    }
    post(properties.INTERACTION_API + "/live-support-by-channel", requestBody)
      .then((response) => {
        setLiveSupportData(response?.data)
        const liveSupportCounts = {};

        for (const liveSupport of response?.data) {
          const channel = liveSupport.channel_desc;
          if (channel in liveSupportCounts) {
            liveSupportCounts[channel] += 1;
          } else {
            liveSupportCounts[channel] = 1;
          }
        }

        const result = Object.entries(liveSupportCounts).map(([liveSupport_channel, count]) => ({
          liveSupport_channel,
          count: count == 0 || count == '0' ? '' : count
        }));

        setLiveSupportDataByChannel(result);
      })
      .catch((error) => {
        console.error("error", error);
      })
      .finally();
  };

  const filterLiveSupportByChannel = (channel) => {
    const data = liveSupportByChannel?.filter((ele) => ele?.channel === channel);
    setFilteredLiveSupportByChannel(data);
  }


  const TotalChatChannel = (filterCleared = false) => {
    if (filterCleared) {
      requestBody["searchParams"]["startDate"] = "";
      requestBody["searchParams"]["endDate"] = "";
    }
    post(properties.CHAT_API + "/total-count-by-channel", requestBody)
      .then((response) => {
        setTotalChat(response.data);

        // console.log(count, "performing");
      })
      .catch((error) => {
        console.error("error", error);
      })
      .finally();
  };

  const AbandonedChannel = (filterCleared = false) => {
    if (filterCleared) {
      requestBody["searchParams"]["startDate"] = "";
      requestBody["searchParams"]["endDate"] = "";
    }
    post(properties.CHAT_API + "/count/abandoned", requestBody)
      .then((response) => {
        setAbandonedChat(response.data);
        // console.log(count, "performing");
      })
      .catch((error) => {
        console.error("error", error);
      })
      .finally();
  };

  const AverageResponse = (filterCleared = false) => {
    if (filterCleared) {
      requestBody["searchParams"]["startDate"] = "";
      requestBody["searchParams"]["endDate"] = "";
    }
    post(properties.CHAT_API + "/average-response-time", requestBody)
      .then((response) => {
        setAverage(response.data);
      })
      .catch((error) => {
        console.error("error", error);
      })
      .finally();
  };

  const AverageHandling = (filterCleared = false) => {
    if (filterCleared) {
      requestBody["searchParams"]["startDate"] = "";
      requestBody["searchParams"]["endDate"] = "";
    }
    post(properties.CHAT_API + "/average-handling-time", requestBody)
      .then((response) => {
        setAverageHandling(response.data);
      })
      .catch((error) => {
        console.error("error", error);
      })
      .finally();
  };

  const TurnArrounds = (filterCleared = false) => {
    if (filterCleared) {
      requestBody["searchParams"]["startDate"] = "";
      requestBody["searchParams"]["endDate"] = "";
    }
    post(properties.CHAT_API + "/turn-around-time", requestBody)
      .then((response) => {
        setTurnAround(response.data);

        // console.log(count, "count1");
      })
      .catch((error) => {
        console.error("error", error);
      });
  };

  const IssueSolvedChannel = (filterCleared = false) => {
    if (filterCleared) {
      requestBody["searchParams"]["startDate"] = "";
      requestBody["searchParams"]["endDate"] = "";
    }
    post(properties.INTERACTION_API + "/issues-solved-by-channel", requestBody)
      .then((response) => {
        setIssueResolved(response.data);
        // console.log('dat byBotOrHuman-1', response.data);
        // Initialize the result object
        const result = {};

        // Iterate through the data and count occurrences
        response.data.forEach(entry => {
          const { channel, is_resolved_by } = entry;

          // Skip entries with missing or invalid channel or resolution
          if (!channel || !is_resolved_by) {
            return;
          }

          // Create the channel object if it doesn't exist
          if (!result[channel]) {
            result[channel] = {
              bot: 0,
              human: 0
            };
          }

          // Increment the respective resolution count
          result[channel][is_resolved_by.toLowerCase()]++;
        });

        // console.log('result---------------->', result)
        setIss(result);
      })
      .catch((error) => {
        console.error("error", error);
      });
  };

  const TopPerformingChannel = () => {
    post(properties.INTERACTION_API + "/top-performing-channel", requestBody)
      .then((response) => {
        if (response.data === "") {
          setError("no data found");
        }
        setTopPerforming(response.data);
      })
      .catch((error) => {
        console.error("error", error);
      });
  };

  const RevenueChannel = () => {
    post(properties.ORDER_API + "/revenue-by-channel", requestBody)
      .then((response) => {
        setRevenue(response.data);
      })
      .catch((error) => {
        console.error("error", error);
      })
      .finally();
  };

  const TopCustomersByChannel = () => {
    post(properties.CUSTOMER_API + "/top-customer-by-channel", requestBody)
      .then((response) => {
        setTopCustomerByChannel(response?.data);
        const topCustomerCounts = {};

        for (const topCustomer of response?.data) {
          const channel = topCustomer.channel;
          if (channel in topCustomerCounts) {
            topCustomerCounts[channel] += 1;
          } else {
            topCustomerCounts[channel] = 1;
          }
        }

        const result = Object.entries(topCustomerCounts).map(([topCustomer_channel, count]) => ({
          topCustomer_channel,
          count
        }));
        setTopCustomersByChannel(result);
      })
      .catch((error) => {
        console.error("error", error);
      })
      .finally();
  };

  const AveragePerformanceByChannel = () => {
    post(properties.INTERACTION_API + "/average-performance-by-channel", requestBody)
      .then((response) => {
        setAveragePerformanceByChannel(response?.data);
      })
      .catch((error) => {
        console.error("error", error);
      })
      .finally();
  };


  const filterTopCustomerByChannel = (channel) => {
    const data = topCustomerByChannel?.filter((ele) => ele?.channel === channel);
    setFilteredTopCustomerByChannel(data);
  }

  const TotalRevenueByChannel = () => {
    post(properties.ORDER_API + "/overall-revenue-count", requestBody)
      .then((response) => {
        setTotalRevenueByChannel(response.data);
      })
      .catch((error) => {
        console.error("error", error);
      })
      .finally();
  };

  ///////watapp

  const TopPerformingChannelwat = (filterCleared = false) => {
    if (filterCleared) {
      requestBody["searchParams"]["startDate"] = "";
      requestBody["searchParams"]["endDate"] = "";
    }
    requestBody.searchParams["channel"] = viewType;
    // console.log(viewType, "viewTypeeeeeee");
    post(properties.INTERACTION_API + "/top-performing-channel", requestBody)
      .then((response) => {
        // setTopPerforming(response.data);
        if (response.data && response.data.length === 0) {
          setTopPerforming("0");
        } else {
          setTopPerforming(response.data);
        }

        // console.log(count, "performing");
      })
      .catch((error) => {
        console.error("error", error);
      })
      .finally();
  };

  const Revenuechannelwat = (filterCleared = false) => {
    if (filterCleared) {
      requestBody["searchParams"]["startDate"] = "";
      requestBody["searchParams"]["endDate"] = "";
    }
    requestBody.searchParams["channel"] = viewType;
    post(properties.ORDER_API + "/revenue-by-channel", requestBody)
      .then((response) => {
        setRevenue(response.data);
      })
      .catch((error) => {
        console.error("error", error);
      })
      .finally();
  };

  const ChatHistorywat = (filterCleared = false) => {
    if (filterCleared) {
      requestBody["searchParams"]["startDate"] = "";
      requestBody["searchParams"]["endDate"] = "";
    }
    requestBody.searchParams["channel"] = viewType;
    post(properties.CHAT_API + "/history", requestBody)
      .then((response) => {
        let repdata = response.data;
        if (response.data && response.data.length === 0) {
          setChatHistory("0");
        } else {
          setChatHistory(response.data);
        }
      })
      .catch((error) => {
        console.error("errorIN CHATHISTORY", error);
      })
      .finally();
    // console.log(setChatHistory, "SetHistortchat");
  };

  const [intxnCategory, setIntxnCategory] = useState();
  const Categorywat = (filterCleared = false, intxnCategory) => {
    if (filterCleared) {
      requestBody["searchParams"]["startDate"] = "";
      requestBody["searchParams"]["endDate"] = "";
    }
    requestBody.searchParams["channel"] = viewType;
    if (intxnCategory && intxnCategory?.length > 0) {
      setIntxnCategory(intxnCategory)
      requestBody.intxnCategory = intxnCategory
    }
    post(properties.INTERACTION_API + "/category", requestBody)
      .then((response) => {
        setCategory(response.data);
      })
      .catch((error) => {
        console.error("error", error);
      })
      .finally();
  };


  const InteractionCornerWat = (filterCleared = false, intxnType) => {
    if (filterCleared) {
      requestBody["searchParams"]["startDate"] = "";
      requestBody["searchParams"]["endDate"] = "";
    }
    requestBody.searchParams["channel"] = viewType;
    if (intxnType && intxnType?.length > 0) {
      setIntxnType(intxnType)
      requestBody.intxnType = intxnType
    }
    post(properties.INTERACTION_API + "/corner", requestBody)
      .then((response) => {
        setCorner(response.data);
      })
      .catch((error) => {
        console.error("error", error);
      })
      .finally();
  };

  const OrderCornerWat = (filterCleared = false, orderType) => {
    if (filterCleared) {
      requestBody["searchParams"]["startDate"] = "";
      requestBody["searchParams"]["endDate"] = "";
    }
    requestBody.searchParams["channel"] = viewType;
    if (orderType && orderType?.length > 0) {
      setOrderType(orderType);
      requestBody.orderType = orderType
    }
    post(properties.ORDER_API + "/corner", requestBody)
      .then((response) => {
        setOrder(response.data);
      })
      .catch((error) => {
        console.error("error", error);
      })
      .finally();
  };

  const IssueSovedWat = (filterCleared = false) => {
    if (filterCleared) {
      requestBody["searchParams"]["startDate"] = "";
      requestBody["searchParams"]["endDate"] = "";
    }
    requestBody.searchParams["channel"] = viewType;
    post(properties.INTERACTION_API + "/issues-solved-by-channel", requestBody)
      .then((response) => {

        const result = {};

        // Iterate through the data and count occurrences
        response.data && response.data?.length > 0 && response.data.forEach(entry => {
          const { channel, is_resolved_by } = entry;

          // Skip entries with missing or invalid channel or resolution
          if (!channel || !is_resolved_by) {
            return;
          }

          // Create the channel object if it doesn't exist
          if (!result[channel]) {
            result[channel] = {
              bot: 0,
              human: 0
            };
          }

          // Increment the respective resolution count
          result[channel][is_resolved_by.toLowerCase()]++;
        });

        // console.log('result---------sss------->', result)
        setIssueResolvedwalkin(result);

      })
      .catch((error) => {
        console.error("error", error);
      });
  };

  ///////////////////////////////////////

  const totalinteraction = () => {
    setSearchParams({});
  };

  //////ALLL CHANNEL
  const allchannel = () => {
    TotalInterctionCount();
    TotalOrder();
    TotalAppointment();
    TopSalesByChannel();
    TopChannelsByOrder();
    ProspectChannel();
    ProblemSolvingChannel();
    LiveSupport();
    TotalChatChannel();
    AbandonedChannel();
    AverageResponse();
    AverageHandling();
    TurnArrounds();
    IssueSolvedChannel();
    TopPerformingChannel();
    RevenueChannel();
    TopCustomersByChannel();
    TotalRevenueByChannel();
  };

  //////////////
  const watapp = (e) => {
    // console.log(e, "ee");
    TopPerformingChannelwat();
    Revenuechannelwat();
    ChatHistorywat();
    Categorywat();
    InteractionCornerWat();
    OrderCornerWat();
    IssueSovedWat();
    TotalAppointment();
    ProspectChannel();
    TotalRevenueByChannel();
    AveragePerformanceByChannel();
    TopSalesByChannel();
    TopChannelsByOrder();
  };
  /////WATAPP


  const handlePageSelect = (pageNo) => {
    setCurrentPage(pageNo)
  }

  const [masterLookupData, setMasterLookupData] = useState({});
  useEffect(() => {
    get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam=SERVICE_TYPE,PRODUCT_FAMILY,ORDER_TYPE,INTXN_TYPE,INTXN_CATEGORY')
      .then((response) => {
        const { data } = response;
        setMasterLookupData({ ...data });
      })
      .catch(error => {
        console.error(error);
      });
  }, [])

  const orderTypeList = masterLookupData?.ORDER_TYPE?.map(elm => ({ label: elm?.description, value: elm?.code }));

  const intxnTypeList = masterLookupData?.INTXN_TYPE?.map(elm => ({ label: elm?.description, value: elm?.code }));

  const intxnCatList = masterLookupData?.INTXN_CATEGORY?.map(elm => ({ label: elm?.description, value: elm?.code }));

  const serviceCategories = masterLookupData?.PRODUCT_FAMILY?.map(elm => ({ label: elm?.description, value: elm?.code }));
  const serviceTypeList = masterLookupData?.SERVICE_TYPE?.map(elm => ({ label: elm?.description, value: elm?.code }));

  const [serviceTypes, setServiceTypes] = useState([])
  const handleOnChangeServiceCat = (e) => {
    const arr = []
    if (e.length > 0) {
      for (const d of e) {
        masterLookupData?.SERVICE_TYPE
          .filter(col => {
            if (col?.mapping?.mapEntity && col?.mapping?.mapEntity.includes(d.value)) {
              arr.push(col)
            }
          })
        setServiceTypes(arr.map(val => (
          {
            label: val.description,
            value: val.code
          }
        )))
      }
    } else {
      setServiceTypes([])
    }
  }

  return (
    <OmniChannelDashboardContext.Provider value={contextProvider}>
      <div className="content-page" style={{ margin: 0 }}>
        <div className="content">
          <div className="">
            <div className="cnt-wrapper">
              <div className="card-skeleton">
                <div className="customer-skel">
                  <div className="row">
                    <div className="col-md-2">
                      <div className="skel-op-dashboard-lft-base cmmn-skeleton">
                        <span className="skel-header-title">Filters</span>
                        <hr className="cmmn-hline" />
                        <Form
                          className="mt-1 filter-form"
                          ref={formRef}
                          onSubmit={handleSubmit(onSubmit)}
                        >
                          <div className="form-group">
                            <label
                              htmlFor="apptname"
                              className="filter-form-label control-label"
                            >
                              Date Range
                            </label>
                            <Controller
                              control={control}
                              name="dateRange"
                              render={({
                                field: { onChange, onBlur, value, ref },
                              }) => (
                                <DateRangePicker
                                  format="dd-MM-yyyy"
                                  character={" to "}
                                  value={value ? value : []}
                                  onChange={onChange}
                                  placeholder="Select Date Range"
                                  className="z-idx w-100"
                                />
                              )}
                            />

                            <div className="form-group skel-z-index">
                              <label htmlFor="apptname" className="filter-form-label control-label">Service Category</label>
                              <Controller
                                control={control}
                                name="serviceCat"
                                render={({ field: { onChange, onBlur, value, ref } }) => (
                                  <ReactSelect
                                    inputRef={ref}
                                    className="w-100"
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                    options={serviceCategories}
                                    isMulti={true}
                                    value={value ? serviceCategories.find(c => c.value === value) : null}
                                    onChange={val => {
                                      onChange(val)
                                      handleOnChangeServiceCat(val);
                                    }}
                                  />
                                )}
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor="apptname" className="filter-form-label control-label">Service Type</label>
                              <Controller
                                control={control}
                                name="serviceType"
                                render={({ field: { onChange, onBlur, value, ref } }) => (
                                  <ReactSelect
                                    inputRef={ref}
                                    className="w-100"

                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}

                                    options={serviceTypes && serviceTypes.length > 0 ? serviceTypes : serviceTypeList}
                                    isMulti={true}
                                    value={value ? serviceTypes.find(c => c.value === value) : null}
                                    onChange={val => onChange(val)}
                                  />
                                )}
                              />
                            </div>
                            {submitError && <span className="errormsg">{submitError}</span>}
                            <div className="form-group skel-filter-frm-btn">
                              <button className="skel-btn-cancel" onClick={handleClear}>Clear</button>
                              <button className="skel-btn-submit">
                                Filter
                              </button>
                            </div>
                          </div>
                        </Form>
                      </div>
                    </div>
                    <div className="col-md-10">
                      <div className="tab-content">
                        <div
                          className="tab-pane fade show active"
                          id="me"
                          role="tabpanel"
                          aria-labelledby="me-tab"
                        >
                          <div className="skle-swtab-sect">
                            <div></div>
                            <form className="form-inline">
                              <span className="ml-1">Auto Refresh</span>
                              <div className="switchToggle ml-1">
                                <input
                                  id="switch1"
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={handleAutoRefresh}
                                  onClick={totalinteraction}
                                />
                                <label htmlFor="switch1">Toggle</label>
                              </div>
                              <button
                                type="button"
                                className="ladda-button  btn btn-secondary btn-xs ml-1"
                                dir="ltr"
                                data-style="slide-left"
                              >
                                <span
                                  className="ladda-label"
                                  onClick={() =>
                                    setIsPageRefresh(!isPageRefresh)
                                  }
                                >
                                  <i
                                    className="material-icons"
                                    onClick={totalinteraction}
                                  >
                                    refresh
                                  </i>
                                </span>
                                <span className="ladda-spinner"></span>
                              </button>
                              <select
                                className="custom-select custom-select-sm ml-1"
                                defaultValue={"Set"}
                                value={pageRefreshTime}
                                onChange={handleSetRefreshTime}
                              >
                                <option value="Set">Set</option>
                                <option value={Number(1)}>1 Min</option>
                                <option value={Number(5)}>5 Min</option>
                                <option value={Number(15)}>15 Min</option>
                                <option value={Number(30)}>30 Min</option>
                              </select>
                            </form>
                          </div>
                          <hr className="cmmn-hline" />
                          <div>
                            <div className="db-list mb-0 pl-0">
                              <a className="skel-fr-sel-cust">
                                <div
                                  value={viewType}
                                  className={`list-dashboard skel-self ${viewType === "skel-channel-all"
                                    ? "db-list-active"
                                    : ""
                                    }`}
                                  onClick={() => {
                                    setViewType("");
                                    setViewType("skel-channel-all");
                                    allchannel();
                                  }}
                                >
                                  <span className="db-title">All</span>
                                </div>
                              </a>
                              <a className="skel-fr-sel-serv">
                                <div
                                  value={viewType}
                                  className={`list-dashboard skel-informative ${viewType === "WHATSAPP-LIVECHAT"
                                    ? "db-list-active"
                                    : ""
                                    }`}
                                  onClick={() => {
                                    setViewType(" ");
                                    setViewType("WHATSAPP-LIVECHAT");
                                  }}
                                >
                                  <span className="db-title">WhatsApp</span>
                                </div>
                              </a>
                              {/* <a className="skel-fr-sel-serv">
                                <div
                                  className={`list-dashboard skel-informative  ${viewType === "FB-LIVECHAT"
                                    ? "db-list-active"
                                    : ""
                                    }`}
                                  onClick={() => {
                                    setViewType("");
                                    setViewType("FB-LIVECHAT");
                                  }}
                                >
                                  <span className="db-title">Facebook</span>
                                </div>
                              </a>
                              <a className="skel-fr-sel-serv">
                                <div
                                  className={`list-dashboard skel-informative  ${viewType === "TELEGRAM"
                                    ? "db-list-active"
                                    : ""
                                    }`}
                                  onClick={() => {
                                    setViewType("");
                                    setViewType("TELEGRAM");
                                  }}
                                >
                                  <span className="db-title">Telegram</span>
                                </div>
                              </a>
                              <a className="skel-fr-sel-serv">
                                <div
                                  className={`list-dashboard skel-informative  ${viewType === "INSTAGRAM"
                                    ? "db-list-active"
                                    : ""
                                    }`}
                                  onClick={() => {
                                    setViewType("");
                                    setViewType("INSTAGRAM");
                                  }}
                                >
                                  <span className="db-title">Instagram</span>
                                </div>
                              </a>
                              <a className="skel-fr-sel-serv">
                                <div
                                  className={`list-dashboard skel-informative  ${viewType === "EMAIL" ? "db-list-active" : ""
                                    }`}
                                  onClick={() => {
                                    setViewType("");
                                    setViewType("EMAIL");
                                  }}
                                >
                                  <span className="db-title">Email</span>
                                </div>
                              </a> */}
                              <a className="skel-fr-sel-serv">
                                <div
                                  className={`list-dashboard skel-informative  ${viewType === "MOBILEAPP"
                                    ? "db-list-active"
                                    : ""
                                    }`}
                                  onClick={() => {
                                    setViewType("");
                                    setViewType("MOBILEAPP");
                                  }}
                                >
                                  <span className="db-title">Mobile App</span>
                                </div>
                              </a>
                              <a className="skel-fr-sel-serv">
                                <div
                                  className={`list-dashboard skel-informative  ${viewType === "SELFCARE"
                                    ? "db-list-active"
                                    : ""
                                    }`}
                                  onClick={() => {
                                    setViewType("");
                                    setViewType("SELFCARE");
                                  }}
                                >
                                  <span className="db-title">SelfCare</span>
                                </div>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* OmniChannel */}

                      {viewType === "skel-channel-all" && (
                        <div className="skel-omni-channel-base-all">
                          <div className="skel-omni-channel-lst">
                            {overallRevenue.map((x) => (
                              <div className="skel-omni-rev-chnl-base-all skel-omni-chnl-whtapp">
                                {(x.channel === "Whatsapp Live Chat" ||
                                  x.channel === "Walk In") && (
                                    <span>
                                      <i className="fab fa-whatsapp"></i>
                                    </span>
                                  )}
                                {(x.channel === "Mobile APP" ||
                                  x.channel === "SelfCare") && (
                                    <span>
                                      <i className="fas fa-mobile-alt"></i>
                                    </span>
                                  )}
                                <span className="skel-omni-tot-revenue-all">
                                  {x.count}
                                </span>
                              </div>
                            ))}
                          </div>

                          <TopPerformingChannels data={{ topPerforming }} handlers={{ getChannelClassName, getChannelIcon }} />

                          <div className="skel-omni-tot-by-chnl mt-0">

                            <InteractionsByChannels data={{ count }} handlers={{ TotalInterctionCount, filterInteractionsByChannel, setIsInteractionByChannelPopupOpen }} />

                            <OrdersByChannels data={{ orderCount }} handlers={{ TotalOrder, filterOrdersByChannel, setIsOrderByChannelPopupOpen }} />

                            <AppointmentsByChannels data={{ totalAppointment }} handlers={{ filterAppointmentsByChannel, setIsAppointmentByChannelPopupOpen, TotalAppointment }} />

                          </div>

                          <div className="skel-reve-by-chnl-wise mt-0">
                            <span className="skel-header-title">
                              Revenue By Channels
                            </span>

                            <div className="skel-rev-chnl-list">
                              {revenue?.length > 0 && revenue?.map((ele) => {
                                return <div className="skel-rev-chnl-by-list fb-rev-brd">
                                  <div className="skel-rev-chnl-top-sect">
                                    <span className={getChannelClassName(ele?.oOrderChannel) + " text-center font-38"}>
                                      {/* {getChannelIcon(ele?.oOrderChannel)} */}
                                      <i className={
                                        ele?.oOrderChannel === 'Email' ? "fas fa-envelope"

                                          : ele?.oOrderChannel === 'Walk In' ? "fas fa-walking"

                                            : ele?.oOrderChannel === 'Whatsapp Live Chat' ? "fab fa-whatsapp"

                                              : ele?.oOrderChannel === 'SelfCare' ? "fas fa-globe"

                                                : ele?.oOrderChannel === 'Mobile APP' ? "fas fa-mobile-alt"

                                                  : ele?.oOrderChannel === 'Facebook Live Chat' ? "fab fa-facebook"

                                                    : ele?.oOrderChannel === 'Telegram' ? "fab fa-telegram"

                                                      : ele?.oOrderChannel === 'Instagram' ? "fab fa-instagram"
                                                        : ""}></i>
                                    </span>
                                    <p className="ml-2">
                                      <span>Monthly Avg.</span>
                                      <span className="font-lg-size">${ele?.oMonthlyAvg || 0}</span>
                                    </p>
                                  </div>
                                  <hr className="cmmn-hline" />
                                  <div className="skel-rev-prev-td-info">
                                    <div className="skel-rev-pre-month">
                                      <span className="skel-rev-lbl">
                                        Prev. Month
                                      </span>
                                      <span className="font-lg-size">${ele?.oPrevMonthAvg || 0}</span>
                                    </div>
                                    <div className="skel-rev-pre-month">
                                      <span className="skel-rev-lbl">Today</span>
                                      <span className="font-lg-size">${ele?.oDailySales || 0}</span>
                                    </div>
                                  </div>
                                </div>
                              })}
                            </div>
                          </div>

                          <div className="row mt-3">
                            <div className="col-md-6">
                              <div className="cmmn-skeleton">
                                <div className="row">
                                  <div className="col-md-5">
                                    <span className="skel-header-title">
                                      Top 5 Channels By Order
                                    </span>
                                  </div>
                                  <div className="col-md-1"></div>
                                  <div className="form-group col-md-5">
                                    <ReactSelect
                                      placeholder='Order Type'
                                      className="w-80"
                                      isMulti={true}
                                      options={orderTypeList}
                                      menuPortalTarget={document.body}
                                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                      value={orderType ? orderTypeList.find(c => c.value === orderType.value) : null}
                                      onChange={(val) => TopChannelsByOrder(false, val)}
                                    />
                                  </div>
                                  <a>
                                    <i
                                      className="material-icons"
                                      onClick={() => TopChannelsByOrder(true, orderType)}
                                    >
                                      refresh
                                    </i>
                                  </a>
                                </div>

                                <hr className="cmmn-hline" />
                                <div className="skel-perf-sect">
                                  <div className="skel-perf-graph">
                                    {topChannels.length === 0 ? (
                                      <div className="noRecord">
                                        <p>NO RECORDS FOUND</p>
                                      </div>
                                    ) : (
                                      <VerticalBar
                                        data={{
                                          topChannels: topChannels
                                        }}
                                      />)}
                                  </div>
                                </div>

                                <hr className="cmmn-hline" />

                                <div className="skel-refresh-info">
                                  <span>
                                    <i className="material-icons">refresh</i>{" "}
                                    Updated a few seconds ago
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="col-md-6">
                              <div className="cmmn-skeleton">
                                <div className="row">
                                  <div className="col-md-5">
                                    <span className="skel-header-title">
                                      Top 5 Problem Solving Channel
                                    </span>
                                  </div>
                                  <div className="col-md-1"></div>
                                  <div className="form-group col-md-5">
                                    <ReactSelect
                                      placeholder='Interaction Type'
                                      className="w-80"
                                      isMulti={true}
                                      options={intxnTypeList}
                                      menuPortalTarget={document.body}
                                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                      value={intxnType ? intxnTypeList.find(c => c.value === intxnType.value) : null}
                                      onChange={(val) => ProblemSolvingChannel(false, val)}
                                    />
                                  </div>
                                  <a>
                                    <i className="material-icons" onClick={() => ProblemSolvingChannel(true)}>refresh</i>
                                  </a>
                                </div>
                                <hr className="cmmn-hline" />
                                <div className="skel-perf-sect">
                                  <div className="skel-perf-graph">
                                    {topProblem.length === 0 ? (
                                      <div className="noRecord">
                                        <p>NO RECORDS FOUND</p>
                                      </div>
                                    ) : (
                                      <Problemsolving
                                        data={{
                                          topProblem: topProblem,
                                        }}
                                      />)}

                                  </div>
                                </div>

                                <hr className="cmmn-hline" />

                                <div className="skel-refresh-info">
                                  <span>
                                    <i className="material-icons">refresh</i>{" "}
                                    Updated a few seconds ago
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="skel-omni-tot-by-chnl mt-0">
                            <div className="skel-omni-tot-info-by-chnl skel-top-5-perf-base-sect">
                              <div className="skel-top-title-icons">
                                <span className="skel-heading mb-1">
                                  Prospect Generated By Channel
                                </span>
                                <div className="skel-omni-chnl-icons">
                                  <a>
                                    <i
                                      className="material-icons"
                                      onClick={() => ProspectChannel(true)}
                                    >
                                      refresh
                                    </i>
                                  </a>

                                </div>
                              </div>

                              <hr className="cmmn-hline" />
                              <ul>
                                {prospect?.map((x) => (
                                  <li>
                                    <span>{x?.prospect_channel}</span>{" "}
                                    <span className={
                                      x?.prospect_channel === 'Email' ? "skel-count-chnl  skel-omni-chnl-email"
                                        : x?.prospect_channel === 'Whatsapp Live Chat' ? "skel-count-chnl skel-omni-chnl-whtapp"
                                          : x?.prospect_channel === 'Instagram' ? "skel-count-chnl skel-omni-chnl-ig"
                                            : x?.prospect_channel === 'Telegram' ? "skel-count-chnl skel-omni-chnl-telg"
                                              : x?.prospect_channel === 'Facebook Live Chat' ? "skel-count-chnl skel-omni-chnl-fb"
                                                : (x?.prospect_channel === 'SelfCare' || x?.prospect_channel === 'Web Selfcare' || x?.prospect_channel === 'Web Application') ? "skel-count-chnl skel-omni-chnl-sc" :
                                                  "skel-count-chnl skel-omni-chnl-whtapp"}
                                      onClick={e => {
                                        filterProspectByChannel(x?.prospect_channel);
                                        setIsProspectByChannelPopupOpen(true);
                                      }}
                                    >
                                      <>{x?.count}</>
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="skel-omni-tot-info-by-chnl skel-top-5-perf-base-sect">
                              <div className="skel-top-title-icons">
                                <span className="skel-heading mb-1">
                                  Live Support By Channel
                                </span>
                                <div className="skel-omni-chnl-icons">
                                  <a>
                                    <i
                                      className="material-icons"
                                      onClick={() => LiveSupport(true)}
                                    >
                                      refresh
                                    </i>
                                  </a>

                                </div>
                              </div>

                              <hr className="cmmn-hline" />
                              <ul>
                                {liveSupportDataByChannel.map((x) => (
                                  <li>
                                    <span>{x?.liveSupport_channel}</span>{" "}
                                    <span className={
                                      x?.liveSupport_channel === 'Email' ? "skel-count-chnl  skel-omni-chnl-email"
                                        : x?.liveSupport_channel === 'Whatsapp Live Chat' ? "skel-count-chnl skel-omni-chnl-whtapp"
                                          : x?.liveSupport_channel === 'Instagram' ? "skel-count-chnl skel-omni-chnl-ig"
                                            : x?.liveSupport_channel === 'Telegram' ? "skel-count-chnl skel-omni-chnl-telg"
                                              : x?.liveSupport_channel === 'Facebook Live Chat' ? "skel-count-chnl skel-omni-chnl-fb"
                                                : (x?.liveSupport_channel === 'SelfCare' || x?.liveSupport_channel === 'Web Selfcare' || x?.liveSupport_channel === 'Web Application') ? "skel-count-chnl skel-omni-chnl-sc" :
                                                  "skel-count-chnl skel-omni-chnl-whtapp"}
                                      onClick={e => {
                                        filterLiveSupportDataByChannel(x?.liveSupport_channel);
                                        setIsLiveSupportByChannelPopupOpen(true);
                                      }}>
                                      <>{x?.count}</>
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="skel-omni-tot-info-by-chnl skel-top-5-perf-base-sect">
                              <div className="skel-top-title-icons">
                                <span className="skel-heading mb-1">
                                  Total Customers By Channel
                                </span>
                                <div className="skel-omni-chnl-icons">
                                  <a>
                                    <i className="material-icons" onClick={() => TopCustomersByChannel(true)}>refresh</i>
                                  </a>
                                </div>
                              </div>
                              <hr className="cmmn-hline" />
                              {console.log('topCustomersByChannel--------->', topCustomersByChannel)}
                              <ul>
                                {topCustomersByChannel && topCustomersByChannel?.length > 0 && topCustomersByChannel?.map((ele) => {
                                  return <li>
                                    <span>{ele?.topCustomer_channel}</span>{" "}
                                    <span className={
                                      ele?.topCustomer_channel === 'Email' ? "skel-count-chnl  skel-omni-chnl-email"
                                        : ele?.topCustomer_channel === 'Whatsapp Live Chat' ? "skel-count-chnl skel-omni-chnl-whtapp"
                                          : ele?.topCustomer_channel === 'Instagram' ? "skel-count-chnl skel-omni-chnl-ig"
                                            : ele?.topCustomer_channel === 'Telegram' ? "skel-count-chnl skel-omni-chnl-telg"
                                              : ele?.topCustomer_channel === 'Facebook Live Chat' ? "skel-count-chnl skel-omni-chnl-fb"
                                                : (ele?.topCustomer_channel === 'SelfCare' || ele?.topCustomer_channel === 'Web Selfcare' || ele?.topCustomer_channel === 'Web Application') ? "skel-count-chnl skel-omni-chnl-sc" :
                                                  "skel-count-chnl skel-omni-chnl-whtapp"} onClick={e => {
                                                    filterTopCustomerByChannel(ele?.topCustomer_channel);
                                                    setIsTopCustomerByChannelPopupOpen(true);
                                                  }}>
                                      {ele?.count}
                                    </span>
                                  </li>
                                })}
                              </ul>
                            </div>
                          </div>

                          <div className="row mt-2">
                            <div className="col-md-6">
                              <div className="cmmn-skeleton">
                                <div className="skel-dashboard-title-base">
                                  <span className="skel-header-title">
                                    Total Chats By Channel
                                  </span>
                                  <div className="skel-dashboards-icons">
                                    <a>
                                      <i
                                        className="material-icons"
                                        onClick={() => TotalChatChannel(true)}
                                      >
                                        refresh
                                      </i>
                                    </a>
                                  </div>
                                </div>
                                <hr className="cmmn-hline" />
                                <div className="skel-perf-sect">
                                  <div className="skel-perf-graph">
                                    {totalChat.length === 0 ? (
                                      <div className="noRecord">
                                        <p>NO RECORDS FOUND</p>
                                      </div>
                                    ) : (
                                      <TotalChatBar
                                        data={{
                                          totalChat: totalChat,
                                        }}
                                      />
                                    )}
                                  </div>
                                </div>

                                <hr className="cmmn-hline" />

                                <div className="skel-refresh-info">
                                  <span>
                                    <i className="material-icons">refresh</i>{" "}
                                    Updated a few seconds ago
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="col-md-6">
                              <div className="cmmn-skeleton">
                                <div className="skel-dashboard-title-base">
                                  <span className="skel-header-title">
                                    Abandoned Chats
                                  </span>
                                  <div className="skel-dashboards-icons">
                                    <a>
                                      <i
                                        className="material-icons"
                                        onClick={() => AbandonedChannel(true)}
                                      >
                                        refresh
                                      </i>
                                    </a>

                                  </div>
                                </div>
                                <hr className="cmmn-hline" />
                                <div className="skel-perf-sect">
                                  <div className="skel-perf-graph">
                                    {abandonedChat.length === 0 ? (<span className="records">No record found</span>) : (<AbandonedBar
                                      data={{
                                        abandonedChat: abandonedChat,
                                      }}
                                    />)}
                                  </div>
                                </div>

                                <hr className="cmmn-hline" />

                                <div className="skel-refresh-info">
                                  <span>
                                    <i className="material-icons">refresh</i>{" "}
                                    Updated a few seconds ago
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="row mt-2">
                            <div className="col-md-6">
                              <div className="cmmn-skeleton">
                                <div className="skel-dashboard-title-base">
                                  <span className="skel-header-title">
                                    Avg. Response Time
                                  </span>
                                  <div className="skel-dashboards-icons">
                                    <a>
                                      <i
                                        className="material-icons"
                                        onClick={() => AverageResponse(true)}
                                      >
                                        refresh
                                      </i>
                                    </a>

                                  </div>
                                </div>
                                <hr className="cmmn-hline" />
                                <div className="skel-perf-sect">
                                  <div className="skel-perf-graphs">
                                    {average.length === 0 ? (
                                      <div className="noRecord">
                                        <p>NO RECORDS FOUND</p>
                                      </div>
                                    ) : (
                                      <AveragePie
                                        data={{
                                          average: average,
                                        }}
                                      />)}
                                  </div>
                                </div>

                                <hr className="cmmn-hline" />

                                <div className="skel-refresh-info">
                                  <span>
                                    <i className="material-icons">refresh</i>{" "}
                                    Updated a few seconds ago
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="col-md-6">
                              <div className="cmmn-skeleton">
                                <div className="skel-dashboard-title-base">
                                  <span className="skel-header-title">
                                    Avg. Handling Time
                                  </span>
                                  <div className="skel-dashboards-icons">
                                    <a>
                                      <i
                                        className="material-icons"
                                        onClick={() => AverageHandling(true)}
                                      >
                                        refresh
                                      </i>
                                    </a>

                                  </div>
                                </div>
                                <hr className="cmmn-hline" />
                                <div className="skel-perf-sect">
                                  <div className="skel-perf-graphs">
                                    {averageHandling.length === 0 ? (
                                      <div className="noRecord">
                                        <p>NO RECORDS FOUND</p>
                                      </div>
                                    ) : (
                                      <AverageHandlingPie
                                        data={{
                                          averageHandling: averageHandling,
                                        }}
                                      />)
                                    }
                                  </div>
                                </div>

                                <hr className="cmmn-hline" />

                                <div className="skel-refresh-info">
                                  <span>
                                    <i className="material-icons">refresh</i>{" "}
                                    Updated a few seconds ago
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="row mt-2">
                            <div className="col-md-6">
                              <div className="cmmn-skeleton">
                                <div className="skel-dashboard-title-base">
                                  <span className="skel-header-title">
                                    TAT (Turn Around Time)
                                  </span>
                                  <div className="skel-dashboards-icons">
                                    <a>
                                      <i
                                        className="material-icons"
                                        onClick={() => TurnArrounds(true)}
                                      >
                                        refresh
                                      </i>
                                    </a>

                                  </div>
                                </div>
                                <hr className="cmmn-hline" />
                                <div className="skel-perf-sect">
                                  <div className="skel-perf-graphs">
                                    {turnArround.length === 0 ? (
                                      <div className="noRecord">
                                        <p>NO RECORDS FOUND</p>
                                      </div>
                                    ) : (
                                      <TurnArround
                                        data={{
                                          turnArround: turnArround,
                                        }}
                                      />)}
                                  </div>
                                </div>

                                <hr className="cmmn-hline" />

                                <div className="skel-refresh-info">
                                  <span>
                                    <i className="material-icons">refresh</i>{" "}
                                    Updated a few seconds ago
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="col-md-6">
                              <div className="cmmn-skeleton">
                                <div className="skel-dashboard-title-base">
                                  <span className="skel-header-title">
                                    Issues Solved By Channels
                                  </span>
                                  <div className="skel-dashboards-icons">
                                    <a>
                                      <i
                                        className="material-icons"
                                        onClick={() => IssueSolvedChannel(true)}
                                      >
                                        refresh
                                      </i>
                                    </a>
                                  </div>
                                </div>
                                <hr className="cmmn-hline" />
                                <div className="skel-perf-sect">
                                  <div className="skel-perf-graph">
                                    <div className="skel-solv-by-chnl">
                                      <table>
                                        <tr>
                                          <td>
                                            <b>By Channels</b>
                                          </td>
                                          <td className="text-center">
                                            <b>By Bots</b>
                                          </td>
                                          <td className="text-center">
                                            <b>By Humans</b>
                                          </td>
                                        </tr>

                                        {Object.keys(iss).map((x) => (
                                          <tr>
                                            <td>
                                              <span>{x}</span>
                                            </td>
                                            <td className={getChannelClassName(x) + " text-center txt-bold"}>
                                              <span onClick={e => {
                                                filterInteractionsByChannelAndBotOrHuman(x, 'BOT');
                                                setIsInteractionByChannelPopupOpen(true);
                                              }}>{iss[x].bot || 0}</span>
                                            </td>
                                            <td className={getChannelClassName(x) + " text-center txt-bold"}>
                                              <span onClick={e => {
                                                filterInteractionsByChannelAndBotOrHuman(x, 'HUMAN');
                                                setIsInteractionByChannelPopupOpen(true);
                                              }}>{iss[x].human || 0}</span>
                                            </td>
                                          </tr>
                                        ))}
                                      </table>
                                    </div>
                                  </div>
                                </div>

                                <hr className="cmmn-hline" />

                                <div className="skel-refresh-info">
                                  <span>
                                    <i className="material-icons">refresh</i>{" "}
                                    Updated a few seconds ago
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {viewType === "WHATSAPP-LIVECHAT" && (
                        <div className="skel-omni-channel-individual mt-2">
                          <HeaderCount data={{
                            iss,
                            issueResolvedWalkin,
                            InteractionChannel,
                            corner,
                            OrderChannel,
                            order,
                            AppointmentChannel,
                            totalAppointment,
                            SalesChannel,
                            Averagechannel,
                            viewType,
                            totalRevenueByChannel,
                            liveSupport,
                            liveSupportData,
                            topCustomersByChannel,
                            prospect,
                            averagePerformanceByChannel
                          }}
                            handlers={{
                              setIsInteractionByDynamicChannelPopupOpen, setIsOrderByDynamicChannelPopupOpen, setIsAppointmentByChannelPopupOpen, filterTopCustomerByChannel,
                              setIsTopCustomerByChannelPopupOpen,
                              filterLiveSupportByChannel,
                              setIsLiveSupportByChannelPopupOpen, filterAppointmentsByChannel, filterProspectByChannel,
                              setIsProspectByChannelPopupOpen,

                              filterInteractionsByChannelAndBotOrHuman,
                              setIsInteractionByChannelPopupOpen,
                              filterLiveSupportDataByChannel
                            }} />

                          <div className="row mt-2">
                            <div className="col-md-7">
                              <div className="cmmn-skeleton">
                                <div className="skel-dashboard-title-base">
                                  <span className="skel-header-title">
                                    Performance By Type
                                  </span>
                                  <div className="skel-dashboards-icons">
                                    <a>
                                      <i
                                        className="material-icons"
                                        onClick={() => TopPerformingChannelwat(true)}
                                      >
                                        refresh
                                      </i>
                                    </a>
                                  </div>
                                </div>
                                <hr className="cmmn-hline" />
                                <>
                                  {topPerforming == "0" ? (
                                    <div className="noRecord">
                                      <p>NO RECORDS FOUND</p>
                                    </div>
                                  ) : (
                                    <div className="skel-perf-sect-indiv">
                                      {topPerforming?.map((x) => (
                                        <>
                                          {x.channel === "Whatsapp Live Chat" && (
                                            <div className="skel-indiv-track-record">
                                              <p>
                                                <span className="skel-omni-chnl-per txt-clr-whatsapp font-21">
                                                  {x.count}
                                                </span>{" "}
                                                of
                                                <br /><b>{x?.type}</b>{" "}
                                                created
                                              </p>
                                            </div>
                                          )}
                                        </>
                                      ))}
                                    </div>
                                  )}
                                </>
                                <hr className="cmmn-hline" />
                                <div className="skel-refresh-info">
                                  <span>
                                    <i className="material-icons">refresh</i>{" "}
                                    Updated a few seconds ago
                                  </span>
                                </div>
                              </div>
                            </div>

                            <RevenueByChannel data={{ revenue, viewType, prospect }} handlers={{ Revenuechannelwat }} />
                          </div>

                          <ChatHistory data={{ chatHistory }} handlers={{ ChatHistorywat }} />

                          <div className="row mt-2">
                            <div className="col-md-12">
                              <div className="cmmn-skeleton">
                                <div className="row">
                                  <div className="col-md-6">
                                    <span className="skel-header-title">
                                      Interaction Category
                                    </span>
                                  </div>
                                  <div className="col-md-1"></div>
                                  <div className="form-group col-md-4">
                                    <ReactSelect
                                      placeholder='Interaction Category'
                                      className="w-80"
                                      isMulti={true}
                                      options={intxnCatList}
                                      menuPortalTarget={document.body}
                                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                      value={intxnCategory ? intxnCatList.find(c => c.value === intxnCategory.value) : null}
                                      onChange={(val) => Categorywat(false, val)}
                                    />
                                  </div>
                                  <a>
                                    <i className="material-icons" onClick={() => Categorywat(true)}>refresh</i>
                                  </a>
                                </div>
                                {/* <div className="skel-dashboard-title-base">
                                  <span className="skel-header-title">
                                    Interaction Category
                                  </span>
                                  <div className="skel-dashboards-icons">
                                    <a>
                                      <i
                                        className="material-icons"
                                        onClick={() => Categorywat(true)}
                                      >
                                        refresh
                                      </i>
                                    </a>
                                  </div>
                                </div> */}
                                <hr className="cmmn-hline" />
                                <div className="skel-perf-sect">
                                  <div className="skel-perf-graph">
                                    {category.length === 0 ? (
                                      <div className="noRecord">
                                        <p>NO RECORDS FOUND</p>
                                      </div>
                                    ) : (
                                      <Vertical
                                        data={{
                                          category: category,
                                        }}
                                      />
                                    )}
                                  </div>
                                </div>

                                <hr className="cmmn-hline" />

                                <div className="skel-refresh-info">
                                  <span>
                                    <i className="material-icons">refresh</i>{" "}
                                    Updated a few seconds ago
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="row mt-2">
                            <div className="col-md-6">
                              <div className="cmmn-skeleton">
                                <div className="row">
                                  <div className="col-md-5">
                                    <span className="skel-header-title">
                                      Interaction Corner
                                    </span>
                                  </div>
                                  <div className="col-md-1"></div>
                                  <div className="form-group col-md-5">
                                    <ReactSelect
                                      placeholder='Interaction Type'
                                      className="w-80"
                                      isMulti={true}
                                      options={intxnTypeList}
                                      menuPortalTarget={document.body}
                                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                      value={intxnType ? intxnTypeList.find(c => c.value === intxnType.value) : null}
                                      onChange={(val) => InteractionCornerWat(false, val)}
                                    />
                                  </div>
                                  <a>
                                    <i className="material-icons" onClick={() => InteractionCornerWat(true)}>refresh</i>
                                  </a>
                                </div>
                                {/* <div className="skel-dashboard-title-base">
                                  <span className="skel-header-title">
                                    Interaction Corner
                                  </span>
                                  <div className="skel-dashboards-icons">
                                    <a>
                                      <i
                                        className="material-icons"
                                        onClick={() => InteractionCornerWat(true)}
                                      >
                                        refresh
                                      </i>
                                    </a>
                                  </div>
                                </div> */}
                                <hr className="cmmn-hline" />
                                <div className="skel-perf-sect">
                                  <div className="skel-perf-graph">
                                    {corner.length === 0 ? (
                                      <div className="noRecord">
                                        <p>NO RECORDS FOUND</p>
                                      </div>
                                    ) : (
                                      <Corner
                                        data={{
                                          corner: corner,
                                        }}
                                      />)}
                                  </div>
                                </div>

                                <hr className="cmmn-hline" />

                                <div className="skel-refresh-info">
                                  <span>
                                    <i className="material-icons">refresh</i>{" "}
                                    Updated a few seconds ago
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="col-md-6">
                              <div className="cmmn-skeleton">
                                <div className="row">
                                  <div className="col-md-5">
                                    <span className="skel-header-title">
                                      Order Corner
                                    </span>
                                  </div>
                                  <div className="col-md-1"></div>
                                  <div className="form-group col-md-5">
                                    <ReactSelect
                                      placeholder='Order Type'
                                      className="w-80"
                                      isMulti={true}
                                      options={orderTypeList}
                                      menuPortalTarget={document.body}
                                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                      value={orderType ? orderTypeList.find(c => c.value === orderType.value) : null}
                                      onChange={(val) => OrderCornerWat(false, val)}
                                    />
                                  </div>
                                  <a>
                                    <i
                                      className="material-icons"
                                      onClick={() => OrderCornerWat(true, orderType)}
                                    >
                                      refresh
                                    </i>
                                  </a>
                                </div>
                                {/* <div className="skel-dashboard-title-base">
                                  <span className="skel-header-title">
                                    Order Corner
                                  </span>
                                  <div className="skel-dashboards-icons">
                                    <a>
                                      <i
                                        className="material-icons"
                                        onClick={() => OrderCornerWat(true)}
                                      >
                                        refresh
                                      </i>
                                    </a>
                                  </div>
                                </div> */}
                                <hr className="cmmn-hline" />
                                <div className="skel-perf-sect">
                                  <div className="skel-perf-graph">
                                    {order.length === 0 ? (
                                      <div className="noRecord">
                                        <p>NO RECORDS FOUND</p>
                                      </div>
                                    ) : (
                                      <Order
                                        data={{
                                          order: order,
                                        }}
                                      />
                                    )}
                                  </div>
                                </div>

                                <hr className="cmmn-hline" />

                                <div className="skel-refresh-info">
                                  <span>
                                    <i className="material-icons">refresh</i>{" "}
                                    Updated a few seconds ago
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {(viewType === "FB-LIVECHAT" || viewType === "Facebook Live Chat") && (
                        <div className="skel-omni-channel-individual mt-2">
                          <HeaderCount data={{
                            iss,
                            issueResolvedWalkin,
                            InteractionChannel,
                            corner,
                            OrderChannel,
                            order,
                            AppointmentChannel,
                            totalAppointment,
                            SalesChannel,
                            Averagechannel,
                            viewType,
                            totalRevenueByChannel,
                            liveSupport,
                            liveSupportData,
                            topCustomersByChannel,
                            prospect,
                            averagePerformanceByChannel
                          }} handlers={{
                            setIsInteractionByDynamicChannelPopupOpen, setIsOrderByDynamicChannelPopupOpen, setIsAppointmentByChannelPopupOpen, filterTopCustomerByChannel,
                            setIsTopCustomerByChannelPopupOpen,
                            filterLiveSupportByChannel,
                            setIsLiveSupportByChannelPopupOpen, filterAppointmentsByChannel, filterProspectByChannel,
                            setIsProspectByChannelPopupOpen,

                            filterInteractionsByChannelAndBotOrHuman,
                            setIsInteractionByChannelPopupOpen,
                            filterLiveSupportDataByChannel
                          }} />


                          <div className="row mt-2">
                            <div className="col-md-7">
                              <div className="cmmn-skeleton">
                                <div className="skel-dashboard-title-base">
                                  <span className="skel-header-title">
                                    Performance By Type
                                  </span>
                                  <div className="skel-dashboards-icons">
                                    <a>
                                      <i
                                        className="material-icons"
                                        onClick={() => TopPerformingChannelwat(true)}
                                      >
                                        refresh
                                      </i>
                                    </a>

                                  </div>
                                </div>
                                <hr className="cmmn-hline" />

                                <div className="skel-perf-sect-indiv">

                                  {topPerforming == "0" ? (
                                    <div className="noRecord">
                                      <p>NO RECORDS FOUND</p>
                                    </div>
                                  ) : (
                                    <>
                                      {topPerforming?.map((x) => (
                                        <>
                                          {(x.channel === "FACEBOOK" || x.channel === "Facebook Live Chat") && (
                                            <div className="skel-indiv-track-record">
                                              <p>
                                                <span className="skel-omni-chnl-per txt-clr-whatsapp font-21">
                                                  {x.count}{" "}
                                                </span>
                                                of
                                                <br /> <b>{x?.type}</b> created
                                              </p>
                                            </div>
                                          )}
                                        </>
                                      ))}
                                    </>
                                  )}
                                </div>
                                <hr className="cmmn-hline" />

                                <div className="skel-refresh-info">
                                  <span>
                                    <i className="material-icons">refresh</i>{" "}
                                    Updated a few seconds ago
                                  </span>
                                </div>
                              </div>
                            </div>

                            <RevenueByChannel data={{ revenue, viewType, prospect }} handlers={{ Revenuechannelwat }} />

                          </div>

                          <ChatHistory data={{ chatHistory }} handlers={{ ChatHistorywat }} />


                          <div className="row mt-3">
                            <div className="col-md-12">
                              <div className="cmmn-skeleton">
                                {/* <div className="skel-dashboard-title-base">
                                  <span className="skel-header-title">
                                    Interaction Category
                                  </span>
                                  <div className="skel-dashboards-icons">
                                    <a>
                                      <i
                                        className="material-icons"
                                        onClick={() => Categorywat(true)}
                                      >
                                        refresh
                                      </i>
                                    </a>
                                  </div>
                                </div> */}
                                <div className="row">
                                  <div className="col-md-6">
                                    <span className="skel-header-title">
                                      Interaction Category
                                    </span>
                                  </div>
                                  <div className="col-md-1"></div>
                                  <div className="form-group col-md-4">
                                    <ReactSelect
                                      placeholder='Interaction Category'
                                      className="w-80"
                                      isMulti={true}
                                      options={intxnCatList}
                                      menuPortalTarget={document.body}
                                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                      value={intxnCategory ? intxnCatList.find(c => c.value === intxnCategory.value) : null}
                                      onChange={(val) => Categorywat(false, val)}
                                    />
                                  </div>
                                  <a>
                                    <i className="material-icons" onClick={() => Categorywat(true)}>refresh</i>
                                  </a>
                                </div>
                                <hr className="cmmn-hline" />
                                <div className="skel-perf-sect">
                                  <div className="skel-perf-graph">

                                    {category.length === 0 ? (
                                      <div className="noRecord">
                                        <p>NO RECORDS FOUND</p>
                                      </div>
                                    ) : (
                                      <Vertical
                                        data={{
                                          category: category,
                                        }}
                                      />
                                    )}


                                  </div>
                                </div>

                                <hr className="cmmn-hline" />

                                <div className="skel-refresh-info">
                                  <span>
                                    <i className="material-icons">refresh</i>{" "}
                                    Updated a few seconds ago
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="row mt-2">
                            <div className="col-md-6">
                              <div className="cmmn-skeleton">
                                {/* <div className="skel-dashboard-title-base">
                                  <span className="skel-header-title">
                                    Interaction Corner
                                  </span>
                                  <div className="skel-dashboards-icons">
                                    <a>
                                      <i
                                        className="material-icons"
                                        onClick={() => InteractionCornerWat(true)}
                                      >
                                        refresh
                                      </i>
                                    </a>
                                  </div>
                                </div> */}
                                <div className="row">
                                  <div className="col-md-5">
                                    <span className="skel-header-title">
                                      Interaction Corner
                                    </span>
                                  </div>
                                  <div className="col-md-1"></div>
                                  <div className="form-group col-md-5">
                                    <ReactSelect
                                      placeholder='Interaction Type'
                                      className="w-80"
                                      isMulti={true}
                                      options={intxnTypeList}
                                      menuPortalTarget={document.body}
                                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                      value={intxnType ? intxnTypeList.find(c => c.value === intxnType.value) : null}
                                      onChange={(val) => InteractionCornerWat(false, val)}
                                    />
                                  </div>
                                  <a>
                                    <i className="material-icons" onClick={() => InteractionCornerWat(true)}>refresh</i>
                                  </a>
                                </div>
                                <hr className="cmmn-hline" />
                                <div className="skel-perf-sect">
                                  <div className="skel-perf-graph">
                                    {corner.length === 0 ? (
                                      <div className="noRecord">
                                        <p>NO RECORDS FOUND</p>
                                      </div>
                                    ) : (
                                      <Corner
                                        data={{
                                          corner: corner,
                                        }}
                                      />
                                    )}

                                  </div>
                                </div>

                                <hr className="cmmn-hline" />

                                <div className="skel-refresh-info">
                                  <span>
                                    <i className="material-icons">refresh</i>{" "}
                                    Updated a few seconds ago
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="col-md-6">
                              <div className="cmmn-skeleton">
                                {/* <div className="skel-dashboard-title-base">
                                  <span className="skel-header-title">
                                    Order Corner
                                  </span>
                                  <div className="skel-dashboards-icons">
                                    <a>
                                      <i
                                        className="material-icons"
                                        onClick={() => OrderCornerWat(true)}
                                      >
                                        refresh
                                      </i>
                                    </a>
                                  </div>
                                </div> */}
                                 <div className="row">
                                  <div className="col-md-5">
                                    <span className="skel-header-title">
                                      Order Corner
                                    </span>
                                  </div>
                                  <div className="col-md-1"></div>
                                  <div className="form-group col-md-5">
                                    <ReactSelect
                                      placeholder='Order Type'
                                      className="w-80"
                                      isMulti={true}
                                      options={orderTypeList}
                                      menuPortalTarget={document.body}
                                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                      value={orderType ? orderTypeList.find(c => c.value === orderType.value) : null}
                                      onChange={(val) => OrderCornerWat(false, val)}
                                    />
                                  </div>
                                  <a>
                                    <i
                                      className="material-icons"
                                      onClick={() => OrderCornerWat(true, orderType)}
                                    >
                                      refresh
                                    </i>
                                  </a>
                                </div>
                                <hr className="cmmn-hline" />
                                <div className="skel-perf-sect">
                                  <div className="skel-perf-graph">
                                    {order.length === 0 ? (
                                      <div className="noRecord">
                                        <p>NO RECORDS FOUND</p>
                                      </div>
                                    ) : (
                                      <Order
                                        data={{
                                          order: order,
                                        }}
                                      />
                                    )}

                                  </div>
                                </div>

                                <hr className="cmmn-hline" />

                                <div className="skel-refresh-info">
                                  <span>
                                    <i className="material-icons">refresh</i>{" "}
                                    Updated a few seconds ago
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {viewType === "TELEGRAM" && (
                        <div className="skel-omni-channel-individual mt-2">
                          <HeaderCount data={{
                            iss,
                            issueResolvedWalkin,
                            InteractionChannel,
                            corner,
                            OrderChannel,
                            order,
                            AppointmentChannel,
                            totalAppointment,
                            SalesChannel,
                            Averagechannel,
                            viewType,
                            totalRevenueByChannel,
                            liveSupport,
                            liveSupportData,
                            topCustomersByChannel,
                            prospect,
                            averagePerformanceByChannel
                          }} handlers={{
                            setIsInteractionByDynamicChannelPopupOpen, setIsOrderByDynamicChannelPopupOpen, setIsAppointmentByChannelPopupOpen, filterTopCustomerByChannel,
                            setIsTopCustomerByChannelPopupOpen,
                            filterLiveSupportByChannel,
                            setIsLiveSupportByChannelPopupOpen, filterAppointmentsByChannel, filterProspectByChannel,
                            setIsProspectByChannelPopupOpen,

                            filterInteractionsByChannelAndBotOrHuman,
                            setIsInteractionByChannelPopupOpen,
                            filterLiveSupportDataByChannel
                          }} />


                          <div className="row mt-2">
                            <div className="col-md-7">
                              <div className="cmmn-skeleton">
                                <div className="skel-dashboard-title-base">
                                  <span className="skel-header-title">
                                    Performance By Type
                                  </span>
                                  <div className="skel-dashboards-icons">
                                    <a>
                                      <i
                                        className="material-icons"
                                        onClick={() => TopPerformingChannelwat(true)}
                                      >
                                        refresh
                                      </i>
                                    </a>
                                  </div>
                                </div>
                                <hr className="cmmn-hline" />
                                <div className="skel-perf-sect-indiv">

                                  {topPerforming == "0" ? (
                                    <div className="noRecord">
                                      <p>NO RECORDS FOUND</p>
                                    </div>
                                  ) : (
                                    <>
                                      {topPerforming?.map((x) => (
                                        <>
                                          {(x.channel === "TELEGRAM" || x.channel === 'Telegram') && (
                                            <div className="skel-indiv-track-record">
                                              <p>
                                                <span className="skel-omni-chnl-per txt-clr-whatsapp font-21">
                                                  {x.count}{" "}
                                                </span>
                                                of
                                                <br /> <b>Interaction</b> created
                                              </p>
                                            </div>
                                          )}
                                        </>
                                      ))}
                                    </>
                                  )}
                                </div>

                                <hr className="cmmn-hline" />

                                <div className="skel-refresh-info">
                                  <span>
                                    <i className="material-icons">refresh</i>{" "}
                                    Updated a few seconds ago
                                  </span>
                                </div>
                              </div>
                            </div>

                            <RevenueByChannel data={{ revenue, viewType, prospect }} handlers={{ Revenuechannelwat }} />

                          </div>

                          <ChatHistory data={{ chatHistory }} handlers={{ ChatHistorywat }} />

                          <div className="row mt-2">
                            <div className="col-md-12">
                              <div className="cmmn-skeleton">
                                {/* <div className="skel-dashboard-title-base">
                                  <span className="skel-header-title">
                                    Interaction Category
                                  </span>
                                  <div className="skel-dashboards-icons">
                                    <a>
                                      <i
                                        className="material-icons"
                                        onClick={() => Categorywat(true)}
                                      >
                                        refresh
                                      </i>
                                    </a>
                                  </div>
                                </div> */}
                                <div className="row">
                                  <div className="col-md-6">
                                    <span className="skel-header-title">
                                      Interaction Category
                                    </span>
                                  </div>
                                  <div className="col-md-1"></div>
                                  <div className="form-group col-md-4">
                                    <ReactSelect
                                      placeholder='Interaction Category'
                                      className="w-80"
                                      isMulti={true}
                                      options={intxnCatList}
                                      menuPortalTarget={document.body}
                                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                      value={intxnCategory ? intxnCatList.find(c => c.value === intxnCategory.value) : null}
                                      onChange={(val) => Categorywat(false, val)}
                                    />
                                  </div>
                                  <a>
                                    <i className="material-icons" onClick={() => Categorywat(true)}>refresh</i>
                                  </a>
                                </div>
                                <hr className="cmmn-hline" />
                                <div className="skel-perf-sect">
                                  <div className="skel-perf-graph">
                                    {category.length === 0 ? (
                                      <div className="noRecord">
                                        <p>NO RECORDS FOUND</p>
                                      </div>
                                    ) : (
                                      <Vertical
                                        data={{
                                          category: category,
                                        }}
                                      />
                                    )}

                                  </div>
                                </div>

                                <hr className="cmmn-hline" />

                                <div className="skel-refresh-info">
                                  <span>
                                    <i className="material-icons">refresh</i>{" "}
                                    Updated a few seconds ago
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="row mt-2">
                            <div className="col-md-6">
                              <div className="cmmn-skeleton">
                                {/* <div className="skel-dashboard-title-base">
                                  <span className="skel-header-title">
                                    Interaction Corner
                                  </span>
                                  <div className="skel-dashboards-icons">
                                    <a>
                                      <i
                                        className="material-icons"
                                        onClick={() => InteractionCornerWat(true)}
                                      >
                                        refresh
                                      </i>
                                    </a>
                                  </div>
                                </div> */}
                                <div className="row">
                                  <div className="col-md-5">
                                    <span className="skel-header-title">
                                      Interaction Corner
                                    </span>
                                  </div>
                                  <div className="col-md-1"></div>
                                  <div className="form-group col-md-5">
                                    <ReactSelect
                                      placeholder='Interaction Type'
                                      className="w-80"
                                      isMulti={true}
                                      options={intxnTypeList}
                                      menuPortalTarget={document.body}
                                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                      value={intxnType ? intxnTypeList.find(c => c.value === intxnType.value) : null}
                                      onChange={(val) => InteractionCornerWat(false, val)}
                                    />
                                  </div>
                                  <a>
                                    <i className="material-icons" onClick={() => InteractionCornerWat(true)}>refresh</i>
                                  </a>
                                </div>
                                <hr className="cmmn-hline" />
                                <div className="skel-perf-sect">
                                  <div className="skel-perf-graph">
                                    {corner.length === 0 ? (
                                      <div className="noRecord">
                                        <p>NO RECORDS FOUND</p>
                                      </div>
                                    ) : (
                                      <Corner
                                        data={{
                                          corner: corner,
                                        }}
                                      />
                                    )}

                                  </div>
                                </div>

                                <hr className="cmmn-hline" />

                                <div className="skel-refresh-info">
                                  <span>
                                    <i className="material-icons">refresh</i>{" "}
                                    Updated a few seconds ago
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="col-md-6">
                              <div className="cmmn-skeleton">
                                {/* <div className="skel-dashboard-title-base">
                                  <span className="skel-header-title">
                                    Order Corner
                                  </span>
                                  <div className="skel-dashboards-icons">
                                    <a>
                                      <i
                                        className="material-icons"
                                        onClick={() => OrderCornerWat(true)}
                                      >
                                        refresh
                                      </i>
                                    </a>
                                  </div>
                                </div> */}
                                 <div className="row">
                                  <div className="col-md-5">
                                    <span className="skel-header-title">
                                      Order Corner
                                    </span>
                                  </div>
                                  <div className="col-md-1"></div>
                                  <div className="form-group col-md-5">
                                    <ReactSelect
                                      placeholder='Order Type'
                                      className="w-80"
                                      isMulti={true}
                                      options={orderTypeList}
                                      menuPortalTarget={document.body}
                                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                      value={orderType ? orderTypeList.find(c => c.value === orderType.value) : null}
                                      onChange={(val) => OrderCornerWat(false, val)}
                                    />
                                  </div>
                                  <a>
                                    <i
                                      className="material-icons"
                                      onClick={() => OrderCornerWat(true, orderType)}
                                    >
                                      refresh
                                    </i>
                                  </a>
                                </div>
                                <hr className="cmmn-hline" />
                                <div className="skel-perf-sect">
                                  <div className="skel-perf-graph">
                                    {order.length === 0 ? (
                                      <div className="noRecord">
                                        <p>NO RECORDS FOUND</p>
                                      </div>
                                    ) : (
                                      <Order
                                        data={{
                                          order: order,
                                        }}
                                      />
                                    )}

                                  </div>
                                </div>

                                <hr className="cmmn-hline" />

                                <div className="skel-refresh-info">
                                  <span>
                                    <i className="material-icons">refresh</i>{" "}
                                    Updated a few seconds ago
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {viewType === "INSTAGRAM" && (
                        <div className="skel-omni-channel-individual mt-2">
                          <HeaderCount data={{
                            iss,
                            issueResolvedWalkin,
                            InteractionChannel,
                            corner,
                            OrderChannel,
                            order,
                            AppointmentChannel,
                            totalAppointment,
                            SalesChannel,
                            Averagechannel,
                            viewType,
                            totalRevenueByChannel,
                            liveSupport,
                            liveSupportData,
                            topCustomersByChannel,
                            prospect,
                            averagePerformanceByChannel
                          }} handlers={{
                            setIsInteractionByDynamicChannelPopupOpen, setIsOrderByDynamicChannelPopupOpen, setIsAppointmentByChannelPopupOpen, filterTopCustomerByChannel,
                            setIsTopCustomerByChannelPopupOpen,
                            filterLiveSupportByChannel,
                            setIsLiveSupportByChannelPopupOpen, filterAppointmentsByChannel, filterProspectByChannel,
                            setIsProspectByChannelPopupOpen,

                            filterInteractionsByChannelAndBotOrHuman,
                            setIsInteractionByChannelPopupOpen,
                            filterLiveSupportDataByChannel
                          }} />


                          <div className="row mt-2">
                            <div className="col-md-7">
                              <div className="cmmn-skeleton">
                                <div className="skel-dashboard-title-base">
                                  <span className="skel-header-title">
                                    Performance By Type
                                  </span>
                                  <div className="skel-dashboards-icons">
                                    <a>
                                      <i
                                        className="material-icons"
                                        onClick={() => TopPerformingChannelwat(true)}
                                      >
                                        refresh
                                      </i>
                                    </a>
                                  </div>
                                </div>
                                <hr className="cmmn-hline" />
                                <div className="skel-perf-sect-indiv">
                                  {topPerforming == "0" ? (
                                    <div className="noRecord">
                                      <p>NO RECORDS FOUND</p>
                                    </div>
                                  ) : (
                                    <>
                                      {topPerforming?.length > 0 && topPerforming?.map((x) => (
                                        <>
                                          {(x.channel === "INSTAGRAM" || x.channel === 'Instagram') && (
                                            <div className="skel-indiv-track-record">
                                              <p>
                                                <span className="skel-omni-chnl-per txt-clr-whatsapp font-21">
                                                  {x.count}{" "}
                                                </span>
                                                of
                                                <br /> <b>Interaction</b> created
                                              </p>
                                            </div>
                                          )}
                                        </>
                                      ))}
                                    </>
                                  )}

                                  {/* <div className="skel-indiv-track-record">
                                 <p>
                                   <span className="skel-omni-chnl-per txt-clr-whatsapp font-21">
                                     90%
                                   </span>{" "}
                                   of
                                   <br /> <b>Problem Solving</b>
                                 </p>
                               </div>
                               <div className="skel-indiv-track-record">
                                 <p>
                                   <span className="skel-omni-chnl-per txt-clr-whatsapp font-21">
                                     90%
                                   </span>{" "}
                                   of
                                   <br /> <b>Interest</b> shown
                                 </p>
                               </div>
                               <div className="skel-indiv-track-record no-brd-bttm">
                                 <p>
                                   <span className="skel-omni-chnl-per txt-clr-whatsapp font-21">
                                     80%
                                   </span>{" "}
                                   of
                                   <br /> <b>Sales</b> done
                                 </p>
                               </div>
                               <div className="skel-indiv-track-record no-brd-bttm">
                                 <p>
                                   <span className="skel-omni-chnl-per txt-clr-whatsapp font-21">
                                     90%
                                   </span>{" "}
                                   of
                                   <br /> <b>Prospect</b> generated
                                 </p>
                               </div>
                               <div className="skel-indiv-track-record no-brd-bttm">
                                 <p>
                                   <span className="skel-omni-chnl-per txt-clr-whatsapp font-21">
                                     90%
                                   </span>{" "}
                                   of
                                   <br /> <b>Appeals</b> created
                                 </p>
                               </div> */}
                                </div>

                                <hr className="cmmn-hline" />

                                <div className="skel-refresh-info">
                                  <span>
                                    <i className="material-icons">refresh</i>{" "}
                                    Updated a few seconds ago
                                  </span>
                                </div>
                              </div>
                            </div>

                            <RevenueByChannel data={{ revenue, viewType, prospect }} handlers={{ Revenuechannelwat }} />

                          </div>

                          <ChatHistory data={{ chatHistory }} handlers={{ ChatHistorywat }} />


                          <div className="row mt-2">
                            <div className="col-md-12">
                              <div className="cmmn-skeleton">
                                {/* <div className="skel-dashboard-title-base">
                                  <span className="skel-header-title">
                                    Interaction Category
                                  </span>
                                  <div className="skel-dashboards-icons">
                                    <a>
                                      <i
                                        className="material-icons"
                                        onClick={() => Categorywat(true)}
                                      >
                                        refresh
                                      </i>
                                    </a>
                                  </div>
                                </div> */}
                                <div className="row">
                                  <div className="col-md-6">
                                    <span className="skel-header-title">
                                      Interaction Category
                                    </span>
                                  </div>
                                  <div className="col-md-1"></div>
                                  <div className="form-group col-md-4">
                                    <ReactSelect
                                      placeholder='Interaction Category'
                                      className="w-80"
                                      isMulti={true}
                                      options={intxnCatList}
                                      menuPortalTarget={document.body}
                                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                      value={intxnCategory ? intxnCatList.find(c => c.value === intxnCategory.value) : null}
                                      onChange={(val) => Categorywat(false, val)}
                                    />
                                  </div>
                                  <a>
                                    <i className="material-icons" onClick={() => Categorywat(true)}>refresh</i>
                                  </a>
                                </div>
                                <hr className="cmmn-hline" />
                                <div className="skel-perf-sect">
                                  <div className="skel-perf-graph">
                                    {console.log('category-------->', category)}
                                    {category.length === 0 ? (
                                      <div className="noRecord">
                                        <p>NO RECORDS FOUND</p>
                                      </div>
                                    ) : (
                                      <Vertical
                                        data={{
                                          category: category,
                                        }}
                                      />
                                    )}


                                  </div>
                                </div>

                                <hr className="cmmn-hline" />

                                <div className="skel-refresh-info">
                                  <span>
                                    <i className="material-icons">refresh</i>{" "}
                                    Updated a few seconds ago
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="row mt-2">
                            <div className="col-md-6">
                              <div className="cmmn-skeleton">
                                {/* <div className="skel-dashboard-title-base">
                                  <span className="skel-header-title">
                                    Interaction Corner
                                  </span>
                                  <div className="skel-dashboards-icons">
                                    <a>
                                      <i
                                        className="material-icons"
                                        onClick={() => InteractionCornerWat(true)}
                                      >
                                        refresh
                                      </i>
                                    </a>
                                  </div>
                                </div> */}
                                <div className="row">
                                  <div className="col-md-5">
                                    <span className="skel-header-title">
                                      Interaction Corner
                                    </span>
                                  </div>
                                  <div className="col-md-1"></div>
                                  <div className="form-group col-md-5">
                                    <ReactSelect
                                      placeholder='Interaction Type'
                                      className="w-80"
                                      isMulti={true}
                                      options={intxnTypeList}
                                      menuPortalTarget={document.body}
                                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                      value={intxnType ? intxnTypeList.find(c => c.value === intxnType.value) : null}
                                      onChange={(val) => InteractionCornerWat(false, val)}
                                    />
                                  </div>
                                  <a>
                                    <i className="material-icons" onClick={() => InteractionCornerWat(true)}>refresh</i>
                                  </a>
                                </div>
                                <hr className="cmmn-hline" />
                                <div className="skel-perf-sect">
                                  <div className="skel-perf-graph">
                                    {corner.length === 0 ? (
                                      <div className="noRecord">
                                        <p>NO RECORDS FOUND</p>
                                      </div>
                                    ) : (
                                      <Corner
                                        data={{
                                          corner: corner,
                                        }}
                                      />
                                    )}


                                  </div>
                                </div>

                                <hr className="cmmn-hline" />

                                <div className="skel-refresh-info">
                                  <span>
                                    <i className="material-icons">refresh</i>{" "}
                                    Updated a few seconds ago
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="col-md-6">
                              <div className="cmmn-skeleton">
                                {/* <div className="skel-dashboard-title-base">
                                  <span className="skel-header-title">
                                    Order Corner
                                  </span>
                                  <div className="skel-dashboards-icons">
                                    <a>
                                      <i
                                        className="material-icons"
                                        onClick={() => OrderCornerWat(true)}
                                      >
                                        refresh
                                      </i>
                                    </a>
                                  </div>
                                </div> */}
                                 <div className="row">
                                  <div className="col-md-5">
                                    <span className="skel-header-title">
                                      Order Corner
                                    </span>
                                  </div>
                                  <div className="col-md-1"></div>
                                  <div className="form-group col-md-5">
                                    <ReactSelect
                                      placeholder='Order Type'
                                      className="w-80"
                                      isMulti={true}
                                      options={orderTypeList}
                                      menuPortalTarget={document.body}
                                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                      value={orderType ? orderTypeList.find(c => c.value === orderType.value) : null}
                                      onChange={(val) => OrderCornerWat(false, val)}
                                    />
                                  </div>
                                  <a>
                                    <i
                                      className="material-icons"
                                      onClick={() => OrderCornerWat(true, orderType)}
                                    >
                                      refresh
                                    </i>
                                  </a>
                                </div>
                                <hr className="cmmn-hline" />
                                <div className="skel-perf-sect">
                                  <div className="skel-perf-graph">
                                    {order.length === 0 ? (
                                      <div className="noRecord">
                                        <p>NO RECORDS FOUND</p>
                                      </div>
                                    ) : (
                                      <Order
                                        data={{
                                          order: order,
                                        }}
                                      />
                                    )}

                                  </div>
                                </div>

                                <hr className="cmmn-hline" />

                                <div className="skel-refresh-info">
                                  <span>
                                    <i className="material-icons">refresh</i>{" "}
                                    Updated a few seconds ago
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {viewType === "EMAIL" && (
                        <div className="skel-omni-channel-individual mt-2">
                          <HeaderCount data={{
                            iss,
                            issueResolvedWalkin,
                            InteractionChannel,
                            corner,
                            OrderChannel,
                            order,
                            AppointmentChannel,
                            totalAppointment,
                            SalesChannel,
                            Averagechannel,
                            viewType,
                            totalRevenueByChannel,
                            liveSupport,
                            liveSupportData,
                            topCustomersByChannel,
                            prospect,
                            averagePerformanceByChannel
                          }} handlers={{
                            setIsInteractionByDynamicChannelPopupOpen, setIsOrderByDynamicChannelPopupOpen, setIsAppointmentByChannelPopupOpen, filterTopCustomerByChannel,
                            setIsTopCustomerByChannelPopupOpen,
                            filterLiveSupportByChannel,
                            setIsLiveSupportByChannelPopupOpen, filterAppointmentsByChannel, filterProspectByChannel,
                            setIsProspectByChannelPopupOpen,

                            filterInteractionsByChannelAndBotOrHuman,
                            setIsInteractionByChannelPopupOpen,
                            filterLiveSupportDataByChannel
                          }} />


                          <div className="row mt-2">
                            <div className="col-md-7">
                              <div className="cmmn-skeleton">
                                <div className="skel-dashboard-title-base">
                                  <span className="skel-header-title">
                                    Performance By Type
                                  </span>
                                  <div className="skel-dashboards-icons">
                                    <a>
                                      <i
                                        className="material-icons"
                                        onClick={() => TopPerformingChannelwat(true)}
                                      >
                                        refresh
                                      </i>
                                    </a>
                                  </div>
                                </div>
                                <hr className="cmmn-hline" />
                                <>
                                  {topPerforming == "0" ? (
                                    <div className="noRecord">
                                      <p>NO RECORDS FOUND</p>
                                    </div>
                                  ) : (
                                    <div className="skel-perf-sect-indiv">
                                      {topPerforming?.map((x) => (
                                        <>
                                          {x.channel === "Email" && (
                                            <div className="skel-indiv-track-record">
                                              <p>
                                                <span className="skel-omni-chnl-per txt-clr-whatsapp font-21">
                                                  {x.count}
                                                </span>{" "}
                                                of
                                                <br /><b>{x?.type}</b>{" "}
                                                created
                                              </p>
                                            </div>
                                          )}
                                        </>
                                      ))}
                                    </div>
                                  )}
                                </>
                                <hr className="cmmn-hline" />
                                <div className="skel-refresh-info">
                                  <span>
                                    <i className="material-icons">refresh</i>{" "}
                                    Updated a few seconds ago
                                  </span>
                                </div>
                              </div>
                            </div>

                            <RevenueByChannel data={{ revenue, viewType, prospect }} handlers={{ Revenuechannelwat }} />

                          </div>

                          <ChatHistory data={{ chatHistory }} handlers={{ ChatHistorywat }} />


                          <div className="row mt-2">
                            <div className="col-md-12">
                              <div className="cmmn-skeleton">
                                {/* <div className="skel-dashboard-title-base">
                                  <span className="skel-header-title">
                                    Interaction Category
                                  </span>
                                  <div className="skel-dashboards-icons">
                                    <a>
                                      <i
                                        className="material-icons"
                                        onClick={() => Categorywat(true)}
                                      >
                                        refresh
                                      </i>
                                    </a>
                                  </div>
                                </div> */}
                                <div className="row">
                                  <div className="col-md-6">
                                    <span className="skel-header-title">
                                      Interaction Category
                                    </span>
                                  </div>
                                  <div className="col-md-1"></div>
                                  <div className="form-group col-md-4">
                                    <ReactSelect
                                      placeholder='Interaction Category'
                                      className="w-80"
                                      isMulti={true}
                                      options={intxnCatList}
                                      menuPortalTarget={document.body}
                                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                      value={intxnCategory ? intxnCatList.find(c => c.value === intxnCategory.value) : null}
                                      onChange={(val) => Categorywat(false, val)}
                                    />
                                  </div>
                                  <a>
                                    <i className="material-icons" onClick={() => Categorywat(true)}>refresh</i>
                                  </a>
                                </div>
                                <hr className="cmmn-hline" />
                                <div className="skel-perf-sect">
                                  <div className="skel-perf-graph">
                                    {category.length === 0 ? (
                                      <div className="noRecord">
                                        <p>NO RECORDS FOUND</p>
                                      </div>
                                    ) : (
                                      <Vertical
                                        data={{
                                          category: category,
                                        }}
                                      />
                                    )}
                                  </div>
                                </div>

                                <hr className="cmmn-hline" />

                                <div className="skel-refresh-info">
                                  <span>
                                    <i className="material-icons">refresh</i>{" "}
                                    Updated a few seconds ago
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="row mt-2">
                            <div className="col-md-6">
                              <div className="cmmn-skeleton">
                                {/* <div className="skel-dashboard-title-base">
                                  <span className="skel-header-title">
                                    Interaction Corner
                                  </span>
                                  <div className="skel-dashboards-icons">
                                    <a>
                                      <i
                                        className="material-icons"
                                        onClick={() => InteractionCornerWat(true)}
                                      >
                                        refresh
                                      </i>
                                    </a>
                                  </div>
                                </div> */}
                                <div className="row">
                                  <div className="col-md-5">
                                    <span className="skel-header-title">
                                      Interaction Corner
                                    </span>
                                  </div>
                                  <div className="col-md-1"></div>
                                  <div className="form-group col-md-5">
                                    <ReactSelect
                                      placeholder='Interaction Type'
                                      className="w-80"
                                      isMulti={true}
                                      options={intxnTypeList}
                                      menuPortalTarget={document.body}
                                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                      value={intxnType ? intxnTypeList.find(c => c.value === intxnType.value) : null}
                                      onChange={(val) => InteractionCornerWat(false, val)}
                                    />
                                  </div>
                                  <a>
                                    <i className="material-icons" onClick={() => InteractionCornerWat(true)}>refresh</i>
                                  </a>
                                </div>
                                <hr className="cmmn-hline" />
                                <div className="skel-perf-sect">
                                  <div className="skel-perf-graph">
                                    {corner.length === 0 ? (
                                      <div className="noRecord">
                                        <p>NO RECORDS FOUND</p>
                                      </div>
                                    ) : (
                                      <Corner
                                        data={{
                                          corner: corner,
                                        }}
                                      />
                                    )}
                                  </div>
                                </div>

                                <hr className="cmmn-hline" />

                                <div className="skel-refresh-info">
                                  <span>
                                    <i className="material-icons">refresh</i>{" "}
                                    Updated a few seconds ago
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="col-md-6">
                              <div className="cmmn-skeleton">
                                {/* <div className="skel-dashboard-title-base">
                                  <span className="skel-header-title">
                                    Order Corner
                                  </span>
                                  <div className="skel-dashboards-icons">
                                    <a>
                                      <i
                                        className="material-icons"
                                        onClick={() => OrderCornerWat(true)}
                                      >
                                        refresh
                                      </i>
                                    </a>
                                  </div>
                                </div> */}
                                 <div className="row">
                                  <div className="col-md-5">
                                    <span className="skel-header-title">
                                      Order Corner
                                    </span>
                                  </div>
                                  <div className="col-md-1"></div>
                                  <div className="form-group col-md-5">
                                    <ReactSelect
                                      placeholder='Order Type'
                                      className="w-80"
                                      isMulti={true}
                                      options={orderTypeList}
                                      menuPortalTarget={document.body}
                                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                      value={orderType ? orderTypeList.find(c => c.value === orderType.value) : null}
                                      onChange={(val) => OrderCornerWat(false, val)}
                                    />
                                  </div>
                                  <a>
                                    <i
                                      className="material-icons"
                                      onClick={() => OrderCornerWat(true, orderType)}
                                    >
                                      refresh
                                    </i>
                                  </a>
                                </div>
                                <hr className="cmmn-hline" />
                                <div className="skel-perf-sect">
                                  <div className="skel-perf-graph">
                                    {order.length === 0 ? (
                                      <div className="noRecord">
                                        <p>NO RECORDS FOUND</p>
                                      </div>
                                    ) : (
                                      <Order
                                        data={{
                                          order: order,
                                        }}
                                      />
                                    )}

                                  </div>
                                </div>

                                <hr className="cmmn-hline" />

                                <div className="skel-refresh-info">
                                  <span>
                                    <i className="material-icons">refresh</i>{" "}
                                    Updated a few seconds ago
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {viewType === "MOBILEAPP" && (
                        <div className="skel-omni-channel-individual mt-2">
                          <HeaderCount data={{
                            iss,
                            issueResolvedWalkin,
                            InteractionChannel,
                            corner,
                            OrderChannel,
                            order,
                            AppointmentChannel,
                            totalAppointment,
                            SalesChannel,
                            Averagechannel,
                            viewType,
                            totalRevenueByChannel,
                            liveSupport,
                            liveSupportData,
                            topCustomersByChannel,
                            prospect,
                            averagePerformanceByChannel
                          }} handlers={{
                            setIsInteractionByDynamicChannelPopupOpen, setIsOrderByDynamicChannelPopupOpen, setIsAppointmentByChannelPopupOpen, filterTopCustomerByChannel,
                            setIsTopCustomerByChannelPopupOpen,
                            filterLiveSupportByChannel,
                            setIsLiveSupportByChannelPopupOpen, filterAppointmentsByChannel, filterProspectByChannel,
                            setIsProspectByChannelPopupOpen,

                            filterInteractionsByChannelAndBotOrHuman,
                            setIsInteractionByChannelPopupOpen,
                            filterLiveSupportDataByChannel
                          }} />


                          <div className="row mt-2">
                            <div className="col-md-7">
                              <div className="cmmn-skeleton">
                                <div className="skel-dashboard-title-base">
                                  <span className="skel-header-title">
                                    Performance By Type
                                  </span>
                                  <div className="skel-dashboards-icons">
                                    <a>
                                      <i
                                        className="material-icons"
                                        onClick={() => TopPerformingChannelwat(true)}
                                      >
                                        refresh
                                      </i>
                                    </a>
                                  </div>
                                </div>
                                <hr className="cmmn-hline" />
                                <div className="skel-perf-sect-indiv">
                                  {topPerforming == "0" ? (
                                    <div className="noRecord">
                                      <p>NO RECORDS FOUND</p>
                                    </div>
                                  ) : (
                                    <>
                                      {Array.isArray(topPerforming) && topPerforming?.map((x) => (
                                        <>
                                          {(x.channel === "MOBILEAPP" || x.channel === "Mobile APP") && (
                                            <div className="skel-indiv-track-record">
                                              <p>
                                                <span className="skel-omni-chnl-per txt-clr-whatsapp font-21">
                                                  {x.count} {" "}
                                                </span>
                                                of
                                                <br /> <b>{x?.type}</b> created
                                              </p>
                                            </div>
                                          )}
                                        </>
                                      ))}
                                    </>
                                  )}
                                </div>
                                <hr className="cmmn-hline" />
                                <div className="skel-refresh-info">
                                  <span>
                                    <i className="material-icons">refresh</i>{" "}
                                    Updated a few seconds ago
                                  </span>
                                </div>
                              </div>
                            </div>

                            <RevenueByChannel data={{ revenue, viewType, prospect }} handlers={{ Revenuechannelwat }} />

                          </div>

                          <ChatHistory data={{ chatHistory }} handlers={{ ChatHistorywat }} />


                          <div className="row mt-2">
                            <div className="col-md-12">
                              <div className="cmmn-skeleton">
                                <div className="row">
                                  <div className="col-md-6">
                                    <span className="skel-header-title">
                                      Interaction Category
                                    </span>
                                  </div>
                                  <div className="col-md-1"></div>
                                  <div className="form-group col-md-4">
                                    <ReactSelect
                                      placeholder='Interaction Category'
                                      className="w-80"
                                      isMulti={true}
                                      options={intxnCatList}
                                      menuPortalTarget={document.body}
                                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                      value={intxnCategory ? intxnCatList.find(c => c.value === intxnCategory.value) : null}
                                      onChange={(val) => Categorywat(false, val)}
                                    />
                                  </div>
                                  <a>
                                    <i className="material-icons" onClick={() => Categorywat(true)}>refresh</i>
                                  </a>
                                </div>
                                {/* <div className="skel-dashboard-title-base">
                                  <span className="skel-header-title">
                                    Interaction Category
                                  </span>
                                  <div className="skel-dashboards-icons">
                                    <a>
                                      <i
                                        className="material-icons"
                                        onClick={() => Categorywat(true)}
                                      >
                                        refresh
                                      </i>
                                    </a>
                                  </div>
                                </div> */}
                                <hr className="cmmn-hline" />
                                <div className="skel-perf-sect">
                                  <div className="skel-perf-graph">
                                    {category.length === 0 ? (
                                      <div className="noRecord">
                                        <p>NO RECORDS FOUND</p>
                                      </div>
                                    ) : (
                                      <Vertical
                                        data={{
                                          category: category,
                                        }}
                                      />
                                    )}
                                  </div>
                                </div>

                                <hr className="cmmn-hline" />

                                <div className="skel-refresh-info">
                                  <span>
                                    <i className="material-icons">refresh</i>{" "}
                                    Updated a few seconds ago
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="row mt-2">
                            <div className="col-md-6">
                              <div className="cmmn-skeleton">
                                {/* <div className="skel-dashboard-title-base">
                                  <span className="skel-header-title">
                                    Interaction Corner
                                  </span>
                                  <div className="skel-dashboards-icons">
                                    <a>
                                      <i
                                        className="material-icons"
                                        onClick={() => InteractionCornerWat(true)}
                                      >
                                        refresh
                                      </i>
                                    </a>
                                  </div>
                                </div> */}
                                <div className="row">
                                  <div className="col-md-5">
                                    <span className="skel-header-title">
                                      Interaction Corner
                                    </span>
                                  </div>
                                  <div className="col-md-1"></div>
                                  <div className="form-group col-md-5">
                                    <ReactSelect
                                      placeholder='Interaction Type'
                                      className="w-80"
                                      isMulti={true}
                                      options={intxnTypeList}
                                      menuPortalTarget={document.body}
                                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                      value={intxnType ? intxnTypeList.find(c => c.value === intxnType.value) : null}
                                      onChange={(val) => InteractionCornerWat(false, val)}
                                    />
                                  </div>
                                  <a>
                                    <i className="material-icons" onClick={() => InteractionCornerWat(true)}>refresh</i>
                                  </a>
                                </div>
                                <hr className="cmmn-hline" />
                                <div className="skel-perf-sect">
                                  <div className="skel-perf-graph">
                                    {corner.length === 0 ? (
                                      <div className="noRecord">
                                        <p>NO RECORDS FOUND</p>
                                      </div>
                                    ) : (
                                      <Corner
                                        data={{
                                          corner: corner,
                                        }}
                                      />
                                    )}
                                  </div>
                                </div>

                                <hr className="cmmn-hline" />

                                <div className="skel-refresh-info">
                                  <span>
                                    <i className="material-icons">refresh</i>{" "}
                                    Updated a few seconds ago
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="col-md-6">
                              <div className="cmmn-skeleton">
                                {/* <div className="skel-dashboard-title-base">
                                  <span className="skel-header-title">
                                    Order Corner
                                  </span>
                                  <div className="skel-dashboards-icons">
                                    <a>
                                      <i
                                        className="material-icons"
                                        onClick={() => OrderCornerWat(true)}
                                      >
                                        refresh
                                      </i>
                                    </a>
                                  </div>
                                </div> */}
                                 <div className="row">
                                  <div className="col-md-5">
                                    <span className="skel-header-title">
                                      Order Corner
                                    </span>
                                  </div>
                                  <div className="col-md-1"></div>
                                  <div className="form-group col-md-5">
                                    <ReactSelect
                                      placeholder='Order Type'
                                      className="w-80"
                                      isMulti={true}
                                      options={orderTypeList}
                                      menuPortalTarget={document.body}
                                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                      value={orderType ? orderTypeList.find(c => c.value === orderType.value) : null}
                                      onChange={(val) => OrderCornerWat(false, val)}
                                    />
                                  </div>
                                  <a>
                                    <i
                                      className="material-icons"
                                      onClick={() => OrderCornerWat(true, orderType)}
                                    >
                                      refresh
                                    </i>
                                  </a>
                                </div>
                                <hr className="cmmn-hline" />
                                <div className="skel-perf-sect">
                                  <div className="skel-perf-graph">
                                    {order.length === 0 ? (
                                      <div className="noRecord">
                                        <p>NO RECORDS FOUND</p>
                                      </div>
                                    ) : (
                                      <Order
                                        data={{
                                          order: order,
                                        }}
                                      />
                                    )}
                                  </div>
                                </div>

                                <hr className="cmmn-hline" />

                                <div className="skel-refresh-info">
                                  <span>
                                    <i className="material-icons">refresh</i>{" "}
                                    Updated a few seconds ago
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {viewType === "SELFCARE" && (
                        <div className="skel-omni-channel-individual mt-2">
                          <HeaderCount data={{
                            iss,
                            issueResolvedWalkin,
                            InteractionChannel,
                            corner,
                            OrderChannel,
                            order,
                            AppointmentChannel,
                            totalAppointment,
                            SalesChannel,
                            Averagechannel,
                            viewType,
                            totalRevenueByChannel,
                            liveSupport,
                            liveSupportData,
                            topCustomersByChannel,
                            prospect,
                            averagePerformanceByChannel
                          }} handlers={{
                            setIsInteractionByDynamicChannelPopupOpen, setIsOrderByDynamicChannelPopupOpen, setIsAppointmentByChannelPopupOpen, filterTopCustomerByChannel,
                            setIsTopCustomerByChannelPopupOpen,
                            filterLiveSupportByChannel,
                            setIsLiveSupportByChannelPopupOpen, filterAppointmentsByChannel, filterProspectByChannel,
                            setIsProspectByChannelPopupOpen,

                            filterInteractionsByChannelAndBotOrHuman,
                            setIsInteractionByChannelPopupOpen,
                            filterLiveSupportDataByChannel
                          }} />


                          <div className="row mt-2">
                            <div className="col-md-7">
                              <div className="cmmn-skeleton">
                                <div className="skel-dashboard-title-base">
                                  <span className="skel-header-title">
                                    Performance By Type
                                  </span>
                                  <div className="skel-dashboards-icons">
                                    <a>
                                      <i
                                        className="material-icons"
                                        onClick={() => TopPerformingChannelwat(true)}
                                      >
                                        refresh
                                      </i>
                                    </a>
                                  </div>
                                </div>
                                <hr className="cmmn-hline" />
                                <div className="skel-perf-sect-indiv">
                                  {topPerforming == "0" ? (
                                    <div className="noRecord">
                                      <p>NO RECORDS FOUND</p>
                                    </div>
                                  ) : (
                                    <>
                                      {topPerforming?.map((x) => (
                                        <>
                                          {(x.channel === "SELFCARE" || x.channel === 'SelfCare') && (
                                            <div className="skel-indiv-track-record">
                                              <p>
                                                <span className="skel-omni-chnl-per txt-clr-whatsapp font-21">
                                                  {x?.count}{" "}
                                                </span>
                                                of
                                                <br /> <b>{x?.type}</b> created
                                              </p>
                                            </div>
                                          )}
                                        </>
                                      ))}
                                    </>
                                  )}
                                </div>

                                <hr className="cmmn-hline" />

                                <div className="skel-refresh-info">
                                  <span>
                                    <i className="material-icons">refresh</i>{" "}
                                    Updated a few seconds ago
                                  </span>
                                </div>
                              </div>
                            </div>

                            <RevenueByChannel data={{ revenue, viewType, prospect }} handlers={{ Revenuechannelwat }} />
                          </div>

                          <ChatHistory data={{ chatHistory }} handlers={{ ChatHistorywat }} />


                          <div className="row mt-2">
                            <div className="col-md-12">
                              <div className="cmmn-skeleton">
                                {/* <div className="skel-dashboard-title-base">
                                  <span className="skel-header-title">
                                    Interaction Category
                                  </span>
                                  <div className="skel-dashboards-icons">
                                    <a>
                                      <i
                                        className="material-icons"
                                        onClick={() => Categorywat(true)}
                                      >
                                        refresh
                                      </i>
                                    </a>
                                  </div>
                                </div> */}
                                <div className="row">
                                  <div className="col-md-6">
                                    <span className="skel-header-title">
                                      Interaction Category
                                    </span>
                                  </div>
                                  <div className="col-md-1"></div>
                                  <div className="form-group col-md-4">
                                    <ReactSelect
                                      placeholder='Interaction Category'
                                      className="w-80"
                                      isMulti={true}
                                      options={intxnCatList}
                                      menuPortalTarget={document.body}
                                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                      value={intxnCategory ? intxnCatList.find(c => c.value === intxnCategory.value) : null}
                                      onChange={(val) => Categorywat(false, val)}
                                    />
                                  </div>
                                  <a>
                                    <i className="material-icons" onClick={() => Categorywat(true)}>refresh</i>
                                  </a>
                                </div>
                                <hr className="cmmn-hline" />
                                <div className="skel-perf-sect">
                                  <div className="skel-perf-graph">
                                    {category.length === 0 ? (
                                      <div className="noRecord">
                                        <p>NO RECORDS FOUND</p>
                                      </div>
                                    ) : (
                                      <Vertical
                                        data={{
                                          category: category,
                                        }}
                                      />
                                    )}

                                  </div>
                                </div>

                                <hr className="cmmn-hline" />

                                <div className="skel-refresh-info">
                                  <span>
                                    <i className="material-icons">refresh</i>{" "}
                                    Updated a few seconds ago
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="row mt-2">
                            <div className="col-md-6">
                              <div className="cmmn-skeleton">
                                {/* <div className="skel-dashboard-title-base">
                                  <span className="skel-header-title">
                                    Interaction Corner
                                  </span>
                                  <div className="skel-dashboards-icons">
                                    <a>
                                      <i
                                        className="material-icons"
                                        onClick={() => InteractionCornerWat(true)}
                                      >
                                        refresh
                                      </i>
                                    </a>
                                  </div>
                                </div> */}
                                <div className="row">
                                  <div className="col-md-5">
                                    <span className="skel-header-title">
                                      Interaction Corner
                                    </span>
                                  </div>
                                  <div className="col-md-1"></div>
                                  <div className="form-group col-md-5">
                                    <ReactSelect
                                      placeholder='Interaction Type'
                                      className="w-80"
                                      isMulti={true}
                                      options={intxnTypeList}
                                      menuPortalTarget={document.body}
                                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                      value={intxnType ? intxnTypeList.find(c => c.value === intxnType.value) : null}
                                      onChange={(val) => InteractionCornerWat(false, val)}
                                    />
                                  </div>
                                  <a>
                                    <i className="material-icons" onClick={() => InteractionCornerWat(true)}>refresh</i>
                                  </a>
                                </div>
                                <hr className="cmmn-hline" />
                                <div className="skel-perf-sect">
                                  <div className="skel-perf-graph">
                                    {corner.length === 0 ? (
                                      <div className="noRecord">
                                        <p>NO RECORDS FOUND</p>
                                      </div>
                                    ) : (
                                      <Corner
                                        data={{
                                          corner: corner,
                                        }}
                                      />
                                    )}
                                  </div>
                                </div>

                                <hr className="cmmn-hline" />

                                <div className="skel-refresh-info">
                                  <span>
                                    <i className="material-icons">refresh</i>{" "}
                                    Updated a few seconds ago
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="col-md-6">
                              <div className="cmmn-skeleton">
                                {/* <div className="skel-dashboard-title-base">
                                  <span className="skel-header-title">
                                    Order Corner
                                  </span>
                                  <div className="skel-dashboards-icons">
                                    <a>
                                      <i
                                        className="material-icons"
                                        onClick={() => OrderCornerWat(true)}
                                      >
                                        refresh
                                      </i>
                                    </a>
                                  </div>
                                </div> */}
                                 <div className="row">
                                  <div className="col-md-5">
                                    <span className="skel-header-title">
                                      Order Corner
                                    </span>
                                  </div>
                                  <div className="col-md-1"></div>
                                  <div className="form-group col-md-5">
                                    <ReactSelect
                                      placeholder='Order Type'
                                      className="w-80"
                                      isMulti={true}
                                      options={orderTypeList}
                                      menuPortalTarget={document.body}
                                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                      value={orderType ? orderTypeList.find(c => c.value === orderType.value) : null}
                                      onChange={(val) => OrderCornerWat(false, val)}
                                    />
                                  </div>
                                  <a>
                                    <i
                                      className="material-icons"
                                      onClick={() => OrderCornerWat(true, orderType)}
                                    >
                                      refresh
                                    </i>
                                  </a>
                                </div>
                                <hr className="cmmn-hline" />
                                <div className="skel-perf-sect">
                                  <div className="skel-perf-graph">
                                    {order.length === 0 ? (
                                      <div className="noRecord">
                                        <p>NO RECORDS FOUND</p>
                                      </div>
                                    ) : (
                                      <Order
                                        data={{
                                          order: order,
                                        }}
                                      />
                                    )}
                                  </div>
                                </div>

                                <hr className="cmmn-hline" />

                                <div className="skel-refresh-info">
                                  <span>
                                    <i className="material-icons">refresh</i>{" "}
                                    Updated a few seconds ago
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {
        isInteractionByDynamicChannelPopupOpen &&
        <Modal isOpen={isInteractionByDynamicChannelPopupOpen} style={RegularModalCustomStyles}>
          <div className="modal-content">
            <div className="">
              <PopupListModal
                data={{
                  isTableFirstRender: false,
                  hasExternalSearch: false,
                  list: corner,
                  entityType: `Interaction By Channel`,
                  headerColumn: CommonColumns,
                  count: channelListCount,
                  fixedHeader: true,
                  itemsPerPage: channelListPerPage,
                  isScroll: true,
                  backendCurrentPage: channelCurrentPage,
                  backendPaging: false,
                  isPopupOpen: isInteractionByDynamicChannelPopupOpen
                }}
                handlers={{
                  handlePageSelect: handlePageSelect,
                  setPerPage: setChannelListPerPage,
                  setCurrentPage: setChannelCurrentPage,
                  setIsPopupOpen: setIsInteractionByDynamicChannelPopupOpen
                }} />
            </div>
          </div>
        </Modal>
      }
      {
        isInteractionByChannelPopupOpen &&
        <Modal isOpen={isInteractionByChannelPopupOpen} style={RegularModalCustomStyles}>
          <div className="modal-content">
            <div className="">
              <PopupListModal
                data={{
                  isTableFirstRender: false,
                  hasExternalSearch: false,
                  list: filteredInteractionsByChannel,
                  headerColumn: CommonColumns,
                  entityType: 'Interactions By Channel',
                  headerColumn:InteractionByChannelsColumns,
                  count: listCount,
                  fixedHeader: true,
                  itemsPerPage: listPerPage,
                  isScroll: true,
                  backendCurrentPage: currentPage,
                  backendPaging: false,
                  isPopupOpen: isInteractionByChannelPopupOpen
                }}
                handlers={{
                  handlePageSelect: handlePageSelect,
                  setPerPage: setListPerPage,
                  setCurrentPage: setCurrentPage,
                  setIsPopupOpen: setIsInteractionByChannelPopupOpen
                }} />
            </div>
          </div>
        </Modal>
      }
      {
        isOrderByDynamicChannelPopupOpen &&
        <Modal isOpen={isOrderByDynamicChannelPopupOpen} style={RegularModalCustomStyles}>
          <div className="modal-content">
            <div className="">
              <PopupListModal
                data={{
                  isTableFirstRender: false,
                  hasExternalSearch: false,
                  list: order,
                  headerColumn: CommonColumns,
                  entityType: `Orders By Channel`,
                  count: channelListCount,
                  fixedHeader: true,
                  itemsPerPage: channelListPerPage,
                  isScroll: true,
                  backendCurrentPage: channelCurrentPage,
                  backendPaging: false,
                  isPopupOpen: isOrderByDynamicChannelPopupOpen
                }}
                handlers={{
                  handlePageSelect: handlePageSelect,
                  setPerPage: setChannelListPerPage,
                  setCurrentPage: setChannelCurrentPage,
                  setIsPopupOpen: setIsOrderByDynamicChannelPopupOpen
                }} />
            </div>
          </div>
        </Modal>
      }
      {
        isOrderByChannelPopupOpen &&
        <Modal isOpen={isOrderByChannelPopupOpen} style={RegularModalCustomStyles}>
          <div className="modal-content">
            <div className="">
              <PopupListModal
                data={{
                  isTableFirstRender: false,
                  hasExternalSearch: false,
                  list: filteredOrdersByChannel,
                  headerColumn: AssignedOrdersColumns,
                  entityType: 'Orders By Channel',
                  count: orderListCount,
                  fixedHeader: true,
                  itemsPerPage: listOrderPerPage,
                  isScroll: true,
                  backendCurrentPage: orderCurrentPage,
                  backendPaging: false,
                  isPopupOpen: isOrderByChannelPopupOpen
                }}
                handlers={{
                  handlePageSelect: handlePageSelect,
                  setPerPage: setListOrderPerPage,
                  setCurrentPage: setOrderCurrentPage,
                  setIsPopupOpen: setIsOrderByChannelPopupOpen
                }} />
            </div>
          </div>
        </Modal>
      }
      {
        isAppointmentByChannelPopupOpen &&
        <Modal isOpen={isAppointmentByChannelPopupOpen} style={RegularModalCustomStyles}>
          <div className="modal-content">
            <div className="">
              <PopupListModal
                data={{
                  isTableFirstRender: false,
                  hasExternalSearch: false,
                  list: filteredAppointmentByChannel,
                  headerColumn:AppointmentColumns,
                  entityType: `Appointments By Channel`,
                  count: appointmentListCount,
                  fixedHeader: true,
                  itemsPerPage: listAppointmentPerPage,
                  isScroll: true,
                  backendCurrentPage: appointmentCurrentPage,
                  backendPaging: false,
                  isPopupOpen: isAppointmentByChannelPopupOpen
                }}
                handlers={{
                  handlePageSelect: handlePageSelect,
                  setPerPage: setListAppointmentPerPage,
                  setCurrentPage: setAppointmentCurrentPage,
                  setIsPopupOpen: setIsAppointmentByChannelPopupOpen
                }} />
            </div>
          </div>
        </Modal>
      }
      {
        isProspectByChannelPopupOpen &&
        <Modal isOpen={isProspectByChannelPopupOpen} style={RegularModalCustomStyles}>
          <div className="modal-content">
            <div className="">
              <PopupListModal
                data={{
                  isTableFirstRender: false,
                  hasExternalSearch: false,
                  list: filteredProspectByChannel,
                  entityType: 'Prospects By Channel',
                  headerColumn:ProspectCustomerByChannelColumns,
                  count: prospectListCount,
                  fixedHeader: true,
                  itemsPerPage: listProspectPerPage,
                  isScroll: true,
                  backendCurrentPage: prospectCurrentPage,
                  backendPaging: false,
                  isPopupOpen: isProspectByChannelPopupOpen
                }}
                handlers={{
                  handlePageSelect: handlePageSelect,
                  setPerPage: setListProspectPerPage,
                  setCurrentPage: setProspectCurrentPage,
                  setIsPopupOpen: setIsProspectByChannelPopupOpen
                }} />
            </div>
          </div>
        </Modal>
      }
      {
        isLiveSupportByChannelPopupOpen &&
        <Modal isOpen={isLiveSupportByChannelPopupOpen} style={RegularModalCustomStyles}>
          <div className="modal-content">
            <div className="">
              <PopupListModal
                data={{
                  isTableFirstRender: false,
                  hasExternalSearch: false,
                  list: filteredLiveSupportDataByChannel,
                  headerColumn:LiveSupportColumns,
                  entityType: 'Live Support By Channel',
                  count: 0,
                  fixedHeader: true,
                  itemsPerPage: listLiveSupportPerPage,
                  isScroll: true,
                  backendCurrentPage: liveSupportCurrentPage,
                  backendPaging: false,
                  isPopupOpen: isLiveSupportByChannelPopupOpen
                }}
                handlers={{
                  handlePageSelect: handlePageSelect,
                  setPerPage: setListLiveSupportPerPage,
                  setCurrentPage: setLiveSupportCurrentPage,
                  setIsPopupOpen: setIsLiveSupportByChannelPopupOpen
                }} />
            </div>
          </div>
        </Modal>
      }
      {
        isTopCustomerByChannelPopupOpen &&
        <Modal isOpen={isTopCustomerByChannelPopupOpen} style={RegularModalCustomStyles}>
          <div className="modal-content">
            <div className="">
              <PopupListModal
                data={{
                  isTableFirstRender: false,
                  hasExternalSearch: false,
                  list: filteredTopCustomerByChannel,
                  entityType: 'Top Customers By Channel',
                  headerColumn:ProspectCustomerByChannelColumns,
                  count: topCustomerListCount,
                  fixedHeader: true,
                  itemsPerPage: listTopCustomerPerPage,
                  isScroll: true,
                  backendCurrentPage: topCustomerCurrentPage,
                  backendPaging: false,
                  isPopupOpen: isTopCustomerByChannelPopupOpen
                }}
                handlers={{
                  handlePageSelect: handlePageSelect,
                  setPerPage: setListTopCustomerPerPage,
                  setCurrentPage: setTopCustomerCurrentPage,
                  setIsPopupOpen: setIsTopCustomerByChannelPopupOpen
                }} />
            </div>
          </div>
        </Modal>
      }
    </OmniChannelDashboardContext.Provider>
  );
};

export default OmniChannelDashboard;
