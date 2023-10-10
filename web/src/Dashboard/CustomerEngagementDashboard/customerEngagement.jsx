import React, { useCallback, useEffect, useState, useContext, useRef } from "react";
import { Form } from 'react-bootstrap';
import { Controller, useForm } from "react-hook-form";
import { DateRangePicker } from 'rsuite';
import moment from "moment";
import { AppContext } from "../../AppContext";
import { post, get } from "../../common/util/restUtil";
import { properties } from "../../properties";
import TopPerformingChannels from "./Components/TopPerformingChannels";
import RecentChats from "./Components/RecentChats";
import IssueSolvedBy from "./Components/IssueSolvedBy";
import UpcomingAppointments from "./Components/UpcomingAppointments";
import RecentCustomer from "./Components/RecentCustomer";
import TopCustomerIssues from "./Components/TopCustomerIssues";
import TopSales from "./Components/PieCharts/TopSales";
import TopGrevience from "./Components/PieCharts/TopGrevience";
import TopProducts from "./Components/PieCharts/TopProducts";
import NewOrders from "./Components/Counts/NewOrders";
import NewInteractions from "./Components/Counts/NewInteractions";
import Sales from "./Components/Counts/Sales";
import { RegularModalCustomStyles } from '../../common/util/util';
import Modal from 'react-modal';
import PopupListModal from "./ModalPopups/PopupListModal";
import ChannelsByLead from "./Components/ChannelsByLead";
import InteractionsByChannel from "./Components/InteractionsByChannel";

const CustomerEngagement = () => {
    const { auth } = useContext(AppContext)

    const [submitError, setSubmitError] = useState(null);
    const [searchParams, setSearchParams] = useState({});
    const [topSales, setTopSales] = useState([]);
    const [topPerforming, setTopPerforming] = useState([]);
    const formRef = useRef();
    const { handleSubmit, control, reset } = useForm();

    const onSubmit = (data) => {
        setSubmitError(null);
        const noFilterSelected = !data?.dateRange?.length && !data.serviceCat && !data.serviceType;
        if (noFilterSelected && !data.teamMemberId) {
            setSubmitError("Please apply at least one filter");
            return;
        }

        const startDate = data?.dateRange?.[0] ? moment(data.dateRange[0]).format("YYYY-MM-DD") : null;
        const endDate = data?.dateRange?.[1] ? moment(data.dateRange[1]).format("YYYY-MM-DD") : startDate;

        setSearchParams({
            ...data,
            startDate,
            endDate
        });
    }

    const handleClear = (event) => {
        event.preventDefault();
        reset();
        setSearchParams({
            startDate: undefined,
            endDate: undefined
        });
    }

    useEffect(() => {
        getDashBoardData();
    }, [searchParams]);

    const getDashBoardData = useCallback(() => {
        getCounts('Order');
        getCounts('Interaction');
        getCounts('Sales');
        GetRecentCustomers();
        TopPerformingProducts();
        TopChannelsByGrevience();
        GetTopCustomerIssues();
        GetUpcomingAppointments();
        IssueSolvedChannel();
        TopChannelsByInteractions();
    }, [searchParams]);

    const [countsData, setCountsData] = useState({
        orderCounts: 0,
        interactionCounts: 0,
        salesCounts: 0,
    });

    const getCounts = (type) => {
        let requestBody = { type };
        if (Object.keys(searchParams).length !== 0) {
            delete searchParams.dateRange;
            requestBody = { ...requestBody, ...searchParams };
        }
        post(properties.CUSTOMER_API + '/order-interaction-count', requestBody)
            .then((resp) => {
                if (resp.data) {
                    if (type === 'Sales') {
                        setCountsData(prevCounts => ({ ...prevCounts, salesCounts: resp.data }));
                    }
                    if (type === 'Order') {
                        setCountsData(prevCounts => ({ ...prevCounts, orderCounts: resp.data }));
                    }
                    if (type === 'Interaction') {
                        setCountsData(prevCounts => ({ ...prevCounts, interactionCounts: resp.data }));
                    }
                }
            })
            .catch((error) => {
                console.error("error", error);
            });
    }

    const [interactionsByChannels, setInteractionsByChannels] = useState([]);
    const TopChannelsByInteractions = () => {
        let requestBody = {};
        if (Object.keys(searchParams).length !== 0) {
            requestBody = searchParams;
        }
        post(properties.CUSTOMER_API + "/interactions-by-channels", requestBody)
            .then((response) => {
                setInteractionsByChannels(response.data);
            })
            .catch((error) => {
                console.error("error", error);
            });
    };

    const [channelsByLead, setChannelsByLead] = useState([]);
    const TopChannelsByLead = () => {
        let requestBody = {};
        if (Object.keys(searchParams).length !== 0) {
            requestBody = searchParams;
        }
        post(properties.CUSTOMER_API + "/top-channel-by-leads", requestBody)
            .then((response) => {
                setChannelsByLead(response.data);
            })
            .catch((error) => {
                console.error("error", error);
            });
    };

    const [topPerformingProducts, setTopPerformingProducts] = useState()
    const TopPerformingProducts = () => {
        let requestBody = {};
        if (Object.keys(searchParams).length !== 0) {
            requestBody = searchParams;
        }
        post(properties.CUSTOMER_API + "/top-performing-products", requestBody)
            .then((response) => {
                setTopPerformingProducts(response.data);
            })
            .catch((error) => {
                console.error("error", error);
            });
    };

    const [topChannelsByGrevience, setTopChannelsByGrevience] = useState()
    const TopChannelsByGrevience = () => {
        let requestBody = {};
        if (Object.keys(searchParams).length !== 0) {
            requestBody = searchParams;
        }
        post(properties.CUSTOMER_API + "/top-channels-grevience", requestBody)
            .then((response) => {
                setTopChannelsByGrevience(response.data);
            })
            .catch((error) => {
                console.error("error", error);
            });
    };

    const [issueResolvedBy, setIssueResolvedBy] = useState();
    const IssueSolvedChannel = (filterCleared = false) => {
        let requestBody = {
            searchParams: { channel: 'skel-channel-all' }
        };

        if (Object.keys(searchParams).length !== 0) {
            requestBody.searchParams.startDate = searchParams?.startDate
            requestBody.searchParams.endDate = searchParams?.endDate
        }
        post(properties.INTERACTION_API + "/issues-solved-by-channel", requestBody)
            .then((response) => {
                if (response?.data?.length > 0) {
                    let result = {
                        data: response?.data,
                        bot: response?.data?.filter((x) => x.is_resolved_by === 'BOT')?.length,
                        human: response?.data?.filter((x) => x.is_resolved_by === 'HUMAN')?.length
                    }
                    console.log('result--------->', result)
                    setIssueResolvedBy(result);
                }
            })
            .catch((error) => {
                console.error("error", error);
            });
    };

    const [topChannelsBySales, setTopChannelsBySales] = useState([]);
    const TopChannelBySales = (filterCleared = false) => {
        let requestBody = {};
        if (Object.keys(searchParams).length !== 0) {
            requestBody = searchParams;
        }
        post(properties.INTERACTION_API + "/top-channel-by-sales", requestBody)
            .then((response) => {
                setTopChannelsBySales(response.data);
            })
            .catch((error) => {
                console.error("error", error);
            });
    };

    const [recentCustomers, setRecentCustomers] = useState();
    const GetRecentCustomers = (filterCleared = false) => {
        let requestBody = {};
        if (Object.keys(searchParams).length !== 0) {
            requestBody = searchParams;
        }
        post(properties.CUSTOMER_API + "/recent-customers", requestBody)
            .then((response) => {
                setRecentCustomers(response.data);
            })
            .catch((error) => {
                console.error("error", error);
            });
    };

    const [topCustomerIssues, setTopCustomerIssues] = useState();
    const GetTopCustomerIssues = (filterCleared = false) => {
        let requestBody = {};
        if (Object.keys(searchParams).length !== 0) {
            requestBody = searchParams;
        }
        post(properties.CUSTOMER_API + "/top-customer-issues", requestBody)
            .then((response) => {
                setTopCustomerIssues(response.data);
            })
            .catch((error) => {
                console.error("error", error);
            });
    };

    const [upcomingAppointments, setUpcomingAppointments] = useState();
    const GetUpcomingAppointments = (filterCleared = false) => {
        let searchParamss = {
            ...searchParams,
            type: 'Me',
            fromDate: new Date(),
            userId: auth?.user?.userId,
            roleId: auth?.currRoleId
        }

        post(`${properties.INTERACTION_API}/get-appointment-overview`, { "searchParams": searchParamss })
            .then((response) => {
                const upcoming = response?.data?.filter(x => moment(x.appointDate).isAfter(moment(), 'day'));
                setUpcomingAppointments(upcoming);
            })
            .catch((error) => {
                console.error("error", error);
            });
    };

    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [issueResolvedByFilteredData, setIssueResolvedByFilteredData] = useState([]);
    const handleIssuePopUpOpenClose = (type) => {
        console.log('type------>', type)
        const filteredData = issueResolvedBy?.data?.filter((ele) => ele?.is_resolved_by === type);
        setIssueResolvedByFilteredData(filteredData);
        setIsPopupOpen(true);
    }

    const [isCountDataPopupOpen, setIsCountDataPopupOpen] = useState(false);
    const [countData, setCountData] = useState({
        orderData: [],
        interactionData: [],
        salesData: [],
    });
    const [heading, setHeading] = useState('');
    const getCountsData = (type) => {
        let requestBody = { type };
        if (Object.keys(searchParams).length !== 0) {
            delete searchParams.dateRange;
            requestBody = { ...requestBody, ...searchParams };
        }
        post(properties.CUSTOMER_API + '/order-interaction-count-data', requestBody)
            .then((resp) => {
                if (resp.data) {
                    if (type === 'Sales') {
                        setCountData(prevCounts => ({ ...prevCounts, salesData: resp.data }));
                    }
                    if (type === 'Order') {
                        setCountData(prevCounts => ({ ...prevCounts, orderData: resp.data }));
                    }
                    if (type === 'Interaction') {
                        setCountData(prevCounts => ({ ...prevCounts, interactionData: resp.data }));
                    }
                    setHeading(type)
                    setIsCountDataPopupOpen(true)
                }
            })
            .catch((error) => {
                console.error("error", error);
            });
    }

    return (
        <div className="card-skeleton">
            <div className="customer-skel form-row">
                <div className="col-xl-2 col-lg-2 col-md-12 col-xs-12 skel-resp-w-100">
                    <div className="skel-op-dashboard-lft-base cmmn-skeleton">
                        <span className="skel-header-title">Filters</span>
                        <hr className="cmmn-hline" />
                        <Form className="mt-1 filter-form" ref={formRef} onSubmit={handleSubmit(onSubmit)}>
                            <div className="form-group">
                                <label htmlFor="apptname" className="filter-form-label control-label">Date Range</label>
                                <Controller
                                    control={control}
                                    name="dateRange"
                                    render={({ field: { onChange, onBlur, value, ref } }) => (
                                        <DateRangePicker
                                            format="dd-MM-yyyy"
                                            character={' to '}
                                            value={value ? value : []}
                                            onChange={onChange}
                                            placeholder="Select Date Range"
                                            className="z-idx w-100"
                                        />
                                    )}
                                />
                            </div>
                            {submitError && <span className="errormsg">{submitError}</span>}
                            <div className="form-group skel-filter-frm-btn">
                                <button className="skel-btn-cancel" onClick={handleClear}>
                                    Clear
                                </button>
                                <button className="skel-btn-submit" onClick={() => { formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })) }}>
                                    Filter
                                </button>
                            </div>
                        </Form>
                    </div>
                </div>
                <div className="lft-skel-dash col-md-7 pl-0">
                    <div className="skel-base-top cmmn-skeleton">
                        <div className="skel-dash-four">
                            <NewOrders data={{ orderCounts: countsData?.orderCounts, isCountDataPopupOpen }} handlers={{ getCountsData, setIsCountDataPopupOpen }} />
                            <NewInteractions data={{ interactionCounts: countsData?.interactionCounts, isCountDataPopupOpen }} handlers={{ getCountsData, setIsCountDataPopupOpen }} />
                            <Sales data={{ salesCounts: countsData?.salesCounts, isCountDataPopupOpen }} handlers={{ getCountsData, setIsCountDataPopupOpen }} />
                        </div>
                        <TopPerformingChannels data={{ topPerforming }} />
                    </div>
                    <div className="skel-grap-sect">
                        <div className="form-row">
                            <InteractionsByChannel data={{ interactionsByChannels }} />
                            <ChannelsByLead data={{ channelsByLead }} />
                        </div>
                    </div>
                </div>
                <div className="rht-skel-dash col-md-3">
                    <RecentChats />
                    {issueResolvedBy && <IssueSolvedBy data={{ issueResolvedBy }} handlers={{ handleIssuePopUpOpenClose }} />}
                    {upcomingAppointments && <UpcomingAppointments data={{ upcomingAppointments }} />}
                </div>
            </div>
            <div className="customer-skel">
                <RecentCustomer data={{ recentCustomers }} />
                <TopCustomerIssues data={{ topCustomerIssues }} />
            </div>
            <div className="customer-skel row">
                <div className="form-row m-0 col-md-12 p-0">
                    <TopProducts data={{ topPerformingProducts }} />
                    <TopSales data={{ topChannelsBySales }} />
                    <TopGrevience data={{ topChannelsByGrevience }} />
                </div>
            </div>
            {
                isPopupOpen &&
                <Modal isOpen={isPopupOpen} style={RegularModalCustomStyles}>
                    <div className="modal-content">
                        <div className="">
                            <PopupListModal
                                data={{
                                    list: issueResolvedByFilteredData,
                                    entityType: 'Issues Resolved By',
                                    count: issueResolvedByFilteredData?.length,
                                    isPopupOpen: isPopupOpen
                                }}
                                handlers={{
                                    setIsPopupOpen: setIsPopupOpen
                                }} />
                        </div>
                    </div>
                </Modal>
            }

            {
                isCountDataPopupOpen &&
                <Modal isOpen={isCountDataPopupOpen} style={RegularModalCustomStyles}>
                    <div className="modal-content">
                        <div className="">
                            <PopupListModal
                                data={{
                                    list: heading === 'Order' ? countData?.orderData : heading === 'Interaction' ? countData?.interactionData : countData?.salesData,
                                    entityType: heading,
                                    count: countData?.length,
                                    isPopupOpen: isCountDataPopupOpen
                                }}
                                handlers={{
                                    setIsPopupOpen: setIsCountDataPopupOpen
                                }} />
                        </div>
                    </div>
                </Modal>
            }
        </div>
    );
};

export default CustomerEngagement;
