import { useCallback, useEffect, useState } from "react";
import { salesDashboardContext } from "../../AppContext";

import lost from '../../assets/images/lost.jpg';
import qualify from '../../assets/images/qualify.jpg';
import sale1 from '../../assets/images/sale1.jpg';
import sales from '../../assets/images/sales.jpg';
import won from '../../assets/images/won.jpg';

import Bar from './charts/Bar';
import LiveLineChart from './charts/LiveLineChart';
import MixLineBar from './charts/MixLineBar';
import PieHalfDonut from './charts/PieHalfDonut'
import Funnel from './charts/Funnel'
import Pie from './charts/Pie'
import MultiBar from './charts/MultiBar'
import Line from './charts/Line'
import CustomerChurnRateChart from './charts/CustomerChurnRateChart'
import PositiveNegativeReplyCountChart from './charts/PositiveNegativeReplyCountChart'
import LiveBar from './charts/LiveBar'
import Gauge from './charts/Gauge'
import StackedBar from './charts/StackedBar'
import Odometer from 'react-odometerjs'
import { groupBy, numberFormatter } from "../../common/util/util";
import { post } from "../../common/util/restUtil";
import { properties } from "../../properties";
import { DateRangePicker } from 'rsuite';
import moment from "moment";
import { SalesDashboardConstant } from "../../AppConstants";
import AverageLeadsResponseTimeChart from "./charts/AverageLeadsResponseTimeChart";

const Dashboard = () => {

    const [salesLiveData, setSalesLiveData] = useState([])
    const [totalSales, setTotalSales] = useState({ total: 0, list: [] })
    const [salesGrowthData, setSalesGrowthData] = useState([])
    const [salesMetrics, setSalesMetrics] = useState({ totalSalesUnit: 0, lastMonthDealsWon: 0, lastMonthDealsLast: 0, lastMonthDealsQualified: 0 })
    const [monthlySales, setMonthlySales] = useState({ avgDealsWon: 0, avgSalesCycleDays: 0, avgDealsAmount: 0, newOpportunities: 0, totalSalesForce: 0 })
    const [annualContractValue, setAnnualContractValue] = useState({ total: 0, list: [] })
    const [customerLifetimeValue, setCustomerLifeTimeValue] = useState({ total: 0, list: [] })
    const [channelSales, setChannelSales] = useState({ total: 0, list: [] })
    const [onlineChannelSales, setOnelineChannelSales] = useState({ total: 0, retail: 0 })
    const [locationBasedSales, setLocationBasedSales] = useState({})
    const [conversionRate, setConversionRate] = useState({ total: 0, list: [] })
    const [customerChurnRate, setCustomerChurnRate] = useState({ total: 0, list: [] })
    const [rententionRate, setRententionRate] = useState([])
    const [positiveNegativeReplyCount, setPositiveNegativeReplyCount] = useState([])
    const [dealsByAge, setDealsByAge] = useState([])
    const [avgLeadsRespTime, setAvgLeadsRespTime] = useState([])
    const [salesGrowth, setSalesGrowth] = useState([])
    const [leadsPipeline, setLeadsPipeline] = useState([])
    const [selectedDate, setSelectedDate] = useState([])

    // Total Sales
    const getTotalSalesData = useCallback(() => {
        let fromDate; let toDate
        // data.dateRange[1] = data.dateRange?.[1] ? data.dateRange?.[1] : data.dateRange?.[0]
        fromDate = selectedDate?.[0] ? moment(selectedDate?.[0]).format("YYYY-MM-DD") : moment('2023-01-01').format("YYYY-MM-DD");
        toDate = selectedDate?.[1] ? moment(selectedDate?.[1]).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD")

        const requestBody = { fromDate, toDate, userId: null, location: null }
        post(`${properties.ORDER_API}/sales/total`, requestBody)
            .then((resp) => {
                if (resp?.status === 200) {
                    setTotalSales(resp?.data)
                }
            }).catch((error) => {
                console.error(error)
            })
    }, [selectedDate])

    // Total Sales Via Channel
    const getChannelSales = useCallback(() => {
        let fromDate; let toDate
        // data.dateRange[1] = data.dateRange?.[1] ? data.dateRange?.[1] : data.dateRange?.[0]
        fromDate = selectedDate?.[0] ? moment(selectedDate?.[0]).format("YYYY-MM-DD") : moment('2023-01-01').format("YYYY-MM-DD");
        toDate = selectedDate?.[1] ? moment(selectedDate?.[1]).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD")

        const requestBody = { fromDate, toDate, userId: null, location: null }
        post(`${properties.ORDER_API}/sales/channel`, requestBody)
            .then((resp) => {
                if (resp?.status === 200) {
                    setChannelSales(resp?.data)
                }
            }).catch((error) => {
                console.error(error)
            })
    }, [selectedDate])

    //  Total Sales on online and offline Channel
    useEffect(() => {
        let total = 0
        let retail = 0
        const onlineStore = channelSales && channelSales?.list?.filter((e) => !!!SalesDashboardConstant?.offlineStore?.includes(e?.vChannel))
        const offLineStore = channelSales && channelSales?.list?.filter((e) => SalesDashboardConstant?.offlineStore?.includes(e?.vChannel))
        total = onlineStore?.length > 0 ? onlineStore?.reduce((acc, i) => acc + Number(i?.vTotalSalesCnt), 0) : 0
        retail = offLineStore?.length > 0 ? offLineStore?.reduce((acc, i) => acc + Number(i?.vTotalSalesCnt), 0) : 0

        setOnelineChannelSales({ total, retail })
    }, [channelSales])

    // !: Location based bar graph is not possible as there are many product is available for single city and same product will not be available for all other city
    const getLocationBasedSale = useCallback(() => {
        let fromDate; let toDate
        // data.dateRange[1] = data.dateRange?.[1] ? data.dateRange?.[1] : data.dateRange?.[0]
        fromDate = selectedDate?.[0] ? moment(selectedDate?.[0]).format("YYYY-MM-DD") : moment('2023-01-01').format("YYYY-MM-DD");
        toDate = selectedDate?.[1] ? moment(selectedDate?.[1]).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD")

        const requestBody = { fromDate, toDate, userId: null, location: null }
        post(`${properties.ORDER_API}/sales/location`, requestBody)
            .then((resp) => {
                if (resp?.status === 200) {
                    const sales = groupBy(resp?.data, 'vDistirct') || []
                    setLocationBasedSales(sales)
                }
            }).catch((error) => {
                console.error(error)
            })
    }, [selectedDate])

    // Conversion rate
    const getConversionRate = useCallback(() => {
        let fromDate; let toDate
        // data.dateRange[1] = data.dateRange?.[1] ? data.dateRange?.[1] : data.dateRange?.[0]
        fromDate = selectedDate?.[0] ? moment(selectedDate?.[0]).format("YYYY-MM-DD") : moment('2023-01-01').format("YYYY-MM-DD");
        toDate = selectedDate?.[1] ? moment(selectedDate?.[1]).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD")

        const requestBody = { fromDate, toDate, userId: null, location: null }
        post(`${properties.CUSTOMER_API}/sales/conversion-rate`, requestBody)
            .then((resp) => {
                if (resp?.status === 200) {
                    const { percent, list } = resp?.data
                    setConversionRate({ percent, list })
                }
            }).catch((error) => {
                console.error(error)
            })

    }, [selectedDate])

    // Monthly Sales
    const getMonthlySales = useCallback(() => {
        let fromDate; let toDate
        fromDate = selectedDate?.[0] ? moment(selectedDate?.[0]).format("YYYY-MM-DD") : moment('2023-01-01').format("YYYY-MM-DD");
        toDate = selectedDate?.[1] ? moment(selectedDate?.[1]).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD")

        const requestBody = { fromDate, toDate, location: null }

        post(`${properties.ORDER_API}/sales/monthly`, requestBody)
            .then((resp) => {
                if (resp?.status === 200) {
                    const data = resp?.data?.[0]
                    setMonthlySales({
                        totalSalesUnit: data?.vSalesUnits || 0,
                        lastMonthDealsWon: data?.vDealsWon || 0,
                        lastMonthDealsLast: data?.vDealsLost || 0,
                        lastMonthDealsQualified: 0
                    })
                }
            }).catch((error) => {
                console.error(error)
            })
    }, [selectedDate])

    // Sales Metric
    const getMonthlyMetrics = useCallback(() => {
        let fromDate; let toDate
        fromDate = selectedDate?.[0] ? moment(selectedDate?.[0]).format("YYYY-MM-DD") : moment('2023-01-01').format("YYYY-MM-DD");
        toDate = selectedDate?.[1] ? moment(selectedDate?.[1]).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD")
        const requestBody = { fromDate, toDate, location: null }
        post(`${properties.ORDER_API}/sales/metric`, requestBody)
            .then((resp) => {
                if (resp?.status === 200) {
                    const data = resp?.data?.[0]
                    setSalesMetrics({
                        avgDealsWon: data?.vAvgWonDeals || 0,
                        avgSalesCycleDays: data?.vAvgSalesCycle || 0,
                        avgDealsAmount: data?.vYtdDeals || 0,
                        newOpportunities: data?.vNewOpp || 0,
                        totalSalesForce: data?.vSalesForce || 0,
                    })
                }
            }).catch((error) => {
                console.error(error)
            })
    }, [selectedDate])

    // Customer rentention rate
    const getRententionRate = useCallback(() => {
        let fromDate; let toDate
        fromDate = selectedDate?.[0] ? moment(selectedDate?.[0]).format("YYYY-MM-DD") : moment('2023-01-01').format("YYYY-MM-DD");
        toDate = selectedDate?.[1] ? moment(selectedDate?.[1]).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD")
        const requestBody = { fromDate, toDate, location: null }
        post(`${properties.CUSTOMER_API}/sales/rentention-rate`, requestBody)
            .then((resp) => {
                if (resp?.status === 200) {
                    setRententionRate(resp?.data)
                }
            }).catch((error) => {
                console.error(error)
            })
    }, [selectedDate])

    // Annual contract value
    const getAnnualContractValue = useCallback(() => {
        let fromDate; let toDate
        fromDate = selectedDate?.[0] ? moment(selectedDate?.[0]).format("YYYY-MM-DD") : moment('2023-01-01').format("YYYY-MM-DD");
        toDate = selectedDate?.[1] ? moment(selectedDate?.[1]).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD")
        const requestBody = { fromDate, toDate, location: null }
        post(`${properties.ORDER_API}/sales/annual-contract-value`, requestBody)
            .then((resp) => {
                if (resp?.status === 200) {
                    setAnnualContractValue(resp?.data)
                }
            }).catch((error) => {
                console.error(error)
            })
    }, [selectedDate])

    // Customer lifetime value
    const getCustomerLifetimeValue = useCallback(() => {
        let fromDate; let toDate
        fromDate = selectedDate?.[0] ? moment(selectedDate?.[0]).format("YYYY-MM-DD") : moment('2023-01-01').format("YYYY-MM-DD");
        toDate = selectedDate?.[1] ? moment(selectedDate?.[1]).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD")
        const requestBody = { fromDate, toDate, location: null }
        post(`${properties.ORDER_API}/sales/customer-lifetime-value`, requestBody)
            .then((resp) => {
                if (resp?.status === 200) {
                    setCustomerLifeTimeValue(resp?.data)
                }
            }).catch((error) => {
                console.error(error)
            })
    }, [selectedDate])

    // Leads pipeline
    const getLeadsPipeline = useCallback(() => {
        let fromDate; let toDate
        fromDate = selectedDate?.[0] ? moment(selectedDate?.[0]).format("YYYY-MM-DD") : moment('2023-01-01').format("YYYY-MM-DD");
        toDate = selectedDate?.[1] ? moment(selectedDate?.[1]).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD")
        const requestBody = { fromDate, toDate, location: null }
        post(`${properties.ORDER_API}/sales/leads-pipeline`, requestBody)
            .then((resp) => {
                if (resp?.status === 200) {
                    console.log(resp?.data)
                    setLeadsPipeline(resp?.data)
                }
            }).catch((error) => {
                console.error(error)
            })
    }, [selectedDate])

    // Leads pipeline
    const getCustomerChurnRate = useCallback(() => {
        let fromDate; let toDate
        fromDate = selectedDate?.[0] ? moment(selectedDate?.[0]).format("YYYY-MM-DD") : moment('2023-01-01').format("YYYY-MM-DD");
        toDate = selectedDate?.[1] ? moment(selectedDate?.[1]).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD")
        const requestBody = { fromDate, toDate, location: null }
        post(`${properties.ORDER_API}/sales/churn-rate-percent`, requestBody)
            .then((resp) => {
                if (resp?.status === 200) {
                    console.log(resp?.data)
                    setCustomerChurnRate(resp?.data)
                }
            }).catch((error) => {
                console.error(error)
            })
    }, [selectedDate])

    // Leads pipeline
    const getLiveSalesTrack = useCallback(() => {
        post(`${properties.ORDER_API}/sales/live-track`)
            .then((resp) => {
                if (resp?.status === 200) {
                    console.log(resp?.data)
                }
            }).catch((error) => {
                console.error(error)
            })
    }, [selectedDate])

    // Leads pipeline
    const getPositiveNegativeReplyCount = useCallback(() => {
        let fromDate; let toDate
        fromDate = selectedDate?.[0] ? moment(selectedDate?.[0]).format("YYYY-MM-DD") : moment('2023-01-01').format("YYYY-MM-DD");
        toDate = selectedDate?.[1] ? moment(selectedDate?.[1]).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD")
        const requestBody = { fromDate, toDate, location: null }
        post(`${properties.ORDER_API}/sales/positive-negative-reply-count`, requestBody)
            .then((resp) => {
                if (resp?.status === 200) {
                    console.log(resp?.data)
                    setPositiveNegativeReplyCount(resp?.data)
                }
            }).catch((error) => {
                console.error(error)
            })
    }, [selectedDate])

    // Leads pipeline
    const getDealsByAge = useCallback(() => {
        let fromDate; let toDate
        fromDate = selectedDate?.[0] ? moment(selectedDate?.[0]).format("YYYY-MM-DD") : moment('2023-01-01').format("YYYY-MM-DD");
        toDate = selectedDate?.[1] ? moment(selectedDate?.[1]).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD")
        const requestBody = { fromDate, toDate, location: null }
        post(`${properties.ORDER_API}/sales/deals-by-age`, requestBody)
            .then((resp) => {
                if (resp?.status === 200) {
                    console.log(resp?.data)
                    setDealsByAge(resp?.data)
                }
            }).catch((error) => {
                console.error(error)
            })
    }, [selectedDate])

    // Leads pipeline
    const getAverageLeadsResponseTime = useCallback(() => {
        let fromDate; let toDate
        fromDate = selectedDate?.[0] ? moment(selectedDate?.[0]).format("YYYY-MM-DD") : moment('2023-01-01').format("YYYY-MM-DD");
        toDate = selectedDate?.[1] ? moment(selectedDate?.[1]).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD")
        const requestBody = { fromDate, toDate, location: null }
        post(`${properties.ORDER_API}/sales/avg-leads-response-time`, requestBody)
            .then((resp) => {
                if (resp?.status === 200) {
                    console.log(resp?.data)
                    setAvgLeadsRespTime(resp?.data)
                }
            }).catch((error) => {
                console.error(error)
            })
    }, [selectedDate])

    // Leads pipeline
    const getSalesGrowth = useCallback(() => {
        let fromDate; let toDate
        fromDate = selectedDate?.[0] ? moment(selectedDate?.[0]).format("YYYY-MM-DD") : moment('2023-01-01').format("YYYY-MM-DD");
        toDate = selectedDate?.[1] ? moment(selectedDate?.[1]).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD")
        const requestBody = { fromDate, toDate, location: null }
        post(`${properties.ORDER_API}/sales/growth`, requestBody)
            .then((resp) => {
                if (resp?.status === 200) {
                    console.log(resp?.data)
                    setSalesGrowth(resp?.data)
                }
            }).catch((error) => {
                console.error(error)
            })
    }, [selectedDate])

    // Call All API
    useEffect(() => {
        getTotalSalesData()
        getChannelSales()
        getLocationBasedSale()
        getConversionRate()
        getMonthlySales()
        getMonthlyMetrics()
        getRententionRate()
        getAnnualContractValue()
        getCustomerLifetimeValue()
        getLeadsPipeline()
        getCustomerChurnRate()
        getLiveSalesTrack()
        getPositiveNegativeReplyCount()
        getDealsByAge()
        getAverageLeadsResponseTime()
        getSalesGrowth()
    }, [])

    const fetchAndUpdateSalesData = (chartInstance) => {
        const newData = (Math.random() * 25).toFixed(0)
        let data = salesLiveData || []
        data.push(newData)
        chartInstance.setOption({
            dataZoom: [{
                start: data.length > 20 ? 75 : 30,
                type: "inside"
            }, {
                start: data.length > 20 ? 75 : 30
            }],
            xAxis: {
                data: data.map(function (item, index) {
                    return index; // assuming time increases as index
                }),
            },
            series: [{
                data: data,
                // smooth: true
            }],
        })
        setSalesLiveData([...salesLiveData, newData]);
    }

    const fetchAndUpdateSalesGrowth = (chartInstance) => {
        const data = [1, 2, 3, 4, 5]
        const newXData = () => Array.from({ length: data.length },
            () => '' + Math.floor(1000 * Math.random()));
        // let data = salesGrowthData || []
        // data.push(newData)
        setSalesGrowthData(newXData)
        chartInstance.setOption({
            series: [{
                data: newXData,
                smooth: true
            }],
        })
    }

    const handleDateFilter = (e) => {
        setSelectedDate(e)
    }

    const contextProvider = {
        getter: {
            salesLiveData,
            annualContractValue,
            customerLifetimeValue,
            channelSales,
            onlineChannelSales,
            locationBasedSales,
            conversionRate,
            rententionRate,
            leadsPipeline,
            customerChurnRate,
            positiveNegativeReplyCount,
            dealsByAge,
            avgLeadsRespTime
        },
        setter: {
            setSalesLiveData,
            setAnnualContractValue,
            setCustomerLifeTimeValue,
            setChannelSales,
            setOnelineChannelSales,
            setLocationBasedSales,
            setConversionRate,
            setRententionRate,
            setLeadsPipeline,
            setCustomerChurnRate,
            setPositiveNegativeReplyCount,
            getDealsByAge,
            getAverageLeadsResponseTime
        },
        handler: {
            fetchAndUpdateSalesData
        }
    }


    return (
        <salesDashboardContext.Provider value={contextProvider}>
            {/* <div className="content-page"> */}
            <div className="content">
                <div className="container-fluid gray-bg">
                    <div className="cnt-wrapper">
                        {/* Filter */}
                        <div className="row mt-2">
                            <div className="col-md-12 cust-pd">
                                <div className="d-flex cmmn-skeleton col-12">
                                    {/* <div className="col">
                                            <h5>Sales Dashboard</h5>
                                        </div> */}
                                    <div className="col py-0">Timeline Filter
                                        {/* <input type="date" id="range-datepicker" className="input-sm form-control  rangepicker" placeholder="Date Range" style={{ "font-size": "13px" }} /> */}
                                        <div>
                                            <DateRangePicker
                                                format="yyyy-MM-dd"
                                                character={' to '}
                                                value={selectedDate || []}
                                                onChange={handleDateFilter}
                                                placeholder="Select Date Range"
                                                className="z-idx w-100"
                                            />
                                        </div>
                                    </div>
                                    <div className="col py-0">Location
                                        <select className="form-control"><option value="">All Location</option><option value="ICGREEN">Location 1</option><option value="ICRED">Location 2</option><option value="ICYELLOW">Location 3</option><option value="PASSPORT">Location 4</option></select>
                                    </div>
                                    {/* <div className="col py-0">Pipeline
                                        <select className="form-control"><option value="">All </option><option value="ICGREEN">Leads</option><option value="ICRED">Opportunities</option></select>
                                    </div>
                                    <div className="col py-0">State
                                        <select className="form-control"><option value="">All </option><option value="ICGREEN">Lost</option><option value="ICRED">Won</option>
                                            <option value="ICRED">Open</option></select></div>
                                    <div className="col py-0">Company
                                        <select className="form-control"><option value="">All </option><option value="ICGREEN">Comp 1</option><option value="ICRED">Comp 2</option>
                                            <option value="ICRED">Comp 3</option></select>
                                    </div> */}
                                    <div className="col py-0">Person
                                        <select className="form-control"><option value="">All </option><option value="ICGREEN">Exe 1</option><option value="ICRED">Exe 2</option>
                                            <option value="ICRED">Exe 3</option></select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-0 pt-2">

                            {/* First Row Card */}
                            <div className="col-md-12 px-0">
                                <div className="card">
                                    <div className="card-body">
                                        {/* <div className="card-widgets">
                                            <span data-toggle="reload"><i className="mdi mdi-refresh"></i></span>
                                            <span data-toggle="collapse" role="button" aria-expanded="false" aria-controls="cardCollpase5c"><i className="mdi mdi-minus"></i></span>
                                            <span data-toggle="remove"><i className="mdi mdi-close"></i></span>
                                        </div> */}
                                        <h4 className="header-title mb-3">Live Sales Tracking</h4>
                                        <div id="cardCollpase5xc">
                                            <div className="row px-2">
                                                <div className="col-md-8 bg-white border" width="100%" height="320">
                                                    <LiveLineChart
                                                        data={{
                                                            chartData: salesLiveData
                                                        }}
                                                        chartStyle={{ width: '100%', height: '400px' }}
                                                        handler={{
                                                            setChartData: setSalesLiveData,
                                                            fetchAndUpdateSalesData
                                                        }} />
                                                </div>
                                                <div className="col-md-4">
                                                    <span className="col-md-12" >
                                                        <div className="card-body d-flex justify-content-center flex-column">
                                                            <div className="d-flex align-items-center justify-content-between">
                                                                <div>
                                                                    <h3>Total Sales</h3>
                                                                    <h3 className="text-center card-value">
                                                                        <Odometer
                                                                            format="d"
                                                                            duration={500}
                                                                            value={totalSales?.total || 0}
                                                                        />
                                                                    </h3>
                                                                </div>
                                                                <img src={sales} alt="sales" style={{ "width": "10rem" }} />
                                                            </div>
                                                        </div>
                                                    </span>
                                                    <div>
                                                        <div className="card-body border-top py-3 bg-light border">
                                                            <div className="row">
                                                                {
                                                                    totalSales && totalSales?.list?.length > 0 ? totalSales?.list?.map((e) => {
                                                                        return (
                                                                            <div className="col-4">
                                                                                <div className="text-center">
                                                                                    <p className="mb-1 text-truncate">{e?.vProductName || ''}</p>
                                                                                    <h4 className="text-primary">${e?.vTotalSalesCnt || ''}</h4>
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    }) : <p className="skel-widget-warning">No Product Found</p>
                                                                }
                                                            </div>
                                                            {/* <div className="row">
                                                                    <div className="col-4">
                                                                        <div className="text-center">
                                                                            <p className="mb-1 text-truncate">Product 1</p>
                                                                            <h4 className="text-primary">$10000</h4>
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-4">
                                                                        <div className="text-center">
                                                                            <p className="mb-1 text-truncate">Product 2</p>
                                                                            <h4 className="text-primary">$11000</h4>
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-4">
                                                                        <div className="text-center">
                                                                            <p className="mb-1 text-truncate">Product 3</p>
                                                                            <h4 className="text-primary">$4500</h4>
                                                                        </div>
                                                                    </div>
                                                                </div> */}
                                                            {/* <div className="row pt-2">
                                                                    <div className="col-4">
                                                                        <div className="text-center">
                                                                            <p className="mb-1 text-truncate">Product 4</p>
                                                                            <h4 className="text-primary">$4500</h4>
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-4">
                                                                        <div className="text-center">
                                                                            <p className="mb-1 text-truncate">Product 5</p>
                                                                            <h4 className="text-primary">$4500</h4>
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-4">
                                                                        <div className="text-center">
                                                                            <p className="mb-1 text-truncate">Product 6</p>
                                                                            <h4 className="text-primary">$4500</h4>
                                                                        </div>
                                                                    </div>
                                                                </div> */}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-12 mt-3">
                                <div className="pt-1">
                                    {/* Second row card */}
                                    <div className="row px-0">

                                        <div className="col-3 mb-2">
                                            <span className="card lift h-100">
                                                <div className="card-body d-flex justify-content-center flex-column">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <div className="me-3">
                                                            <h5>Total Sales Units</h5>
                                                            <h2 className="text-center">{numberFormatter(monthlySales?.totalSalesUnit || 0, 1) || 0}</h2>
                                                        </div>
                                                        <img src={sale1} alt="sale1" style={{ "width": "8rem" }} />
                                                    </div>
                                                </div>
                                            </span>
                                        </div>
                                        <div className="col-3 mb-2">
                                            <span className="card lift h-100" >
                                                <div className="card-body d-flex justify-content-center flex-column">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <div className="me-3">

                                                            <h5>Deals Won
                                                            </h5>
                                                            <h2 className="text-center">{numberFormatter(monthlySales?.lastMonthDealsWon || 0, 1) || 0}</h2>
                                                        </div>
                                                        <img src={won} alt="won" style={{ "width": "8rem" }} />
                                                    </div>
                                                </div>
                                            </span>
                                        </div>
                                        <div className="col-3 mb-2">
                                            <span className="card lift h-100" >
                                                <div className="card-body d-flex justify-content-center flex-column">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <div className="me-3">

                                                            <h5>Deals Lost
                                                            </h5>
                                                            <h2 className="text-center">{numberFormatter(monthlySales?.lastMonthDealsLast || 0, 1) || 0}</h2>
                                                        </div>
                                                        <img src={lost} alt='lost' style={{ "width": "8rem" }} />
                                                    </div>
                                                </div>
                                            </span>
                                        </div>
                                        <div className="col-3 mb-2">
                                            <span className="card lift h-100" >
                                                <div className="card-body d-flex justify-content-center flex-column">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <div className="me-3">

                                                            <h5>Deals Qualified
                                                            </h5>
                                                            <h2 className="text-center">{numberFormatter(monthlySales?.lastMonthDealsQualified || 0, 1) || 0}</h2>
                                                        </div>
                                                        <img src={qualify} alt="qualify" style={{ "width": "8rem" }} />
                                                    </div>
                                                </div>
                                            </span>
                                        </div>
                                    </div>
                                    {/* Third row card */}
                                    <h4>Key Metrics</h4>
                                    <div className="row mt-2">
                                        <div className="col">
                                            <div className="card autoheight" >
                                                <div className="card-body text-center">
                                                    <h5 className="header-title mb-0 text-center">Average Won Deals </h5>
                                                    <div className="col-12 text-center pt-2">
                                                        <h2 className="text-center card-value"><span data-plugin="counterup">${numberFormatter(salesMetrics?.avgDealsWon || 0, 2) || 0}</span></h2>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col">
                                            <div className="card autoheight">
                                                <div className="card-body text-center">

                                                    <h4 className="header-title mb-0">Average Sales Cycle Days</h4>
                                                    <div className="col-12 text-center pt-2">
                                                        <h2 className="text-center card-value">{numberFormatter(salesMetrics?.avgSalesCycleDays || 0, 1) || 0}</h2>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col">
                                            <div className="card autoheight">
                                                <div className="card-body text-center">
                                                    <h4 className="header-title mb-0">YTD Deals Amount</h4>
                                                    <div className="col-12 text-center pt-2">
                                                        <h2 className="text-center card-value">{numberFormatter(salesMetrics?.avgDealsAmount || 0, 2) || 0}</h2>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col">
                                            <div className="card autoheight">
                                                <div className="card-body text-center">
                                                    <h4 className="header-title mb-0">New Opportunities</h4>
                                                    <div className="col-12 text-center pt-2">
                                                        <h2 className="text-center card-value">{numberFormatter(salesMetrics?.newOpportunities || 0, 2) || 0}</h2>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col">
                                            <div className="card autoheight">
                                                <div className="card-body text-center">
                                                    <h4 className="header-title mb-0">Total Sales Force</h4>
                                                    <div className="col-12 text-center pt-2">
                                                        <h2 className="text-center card-value">{numberFormatter(salesMetrics?.totalSalesForce || 0, 2) || 0}</h2>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Fourth row */}
                                <div className="row mt-3">
                                    <div className="col-md-4">
                                        <div className="card">
                                            <div className="card-body">
                                                <div className="media">
                                                    <div className="media-body overflow-hidden">
                                                        <h4 className="text-truncate header-title mb-2">Annual contract value (ACV)</h4>
                                                        <h4 className="text-center">
                                                            ${numberFormatter(annualContractValue?.total || 0, 1) || 0} ACV
                                                        </h4>
                                                        <div className="pt-2">
                                                            <Bar chartStyle={{ width: '100%', height: '300px' }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="card">
                                            <div className="card-body">
                                                <div className="media">
                                                    <div className="media-body overflow-hidden">
                                                        <h4 className="text-truncate header-title mb-2">Customer lifetime value (CLV)</h4>
                                                        <h4 className="text-center">
                                                            ${numberFormatter(customerLifetimeValue?.total || 0, 1) || 0} CLV
                                                        </h4>
                                                        <div>
                                                            <MixLineBar chartStyle={{ width: '100%', height: '300px' }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="card">
                                            <div className="card-body">
                                                <div className="media">
                                                    <div className="media-body overflow-hidden">
                                                        <div className="media-body overflow-hidden">
                                                            <h4 className="text-truncate header-title mb-2">Sales in Channels</h4>
                                                            <h5 className="mb-0 text-center">${numberFormatter(channelSales?.total || 0, 1) || 0}</h5>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="card-body">
                                                    <hr className="cmmn-hline" />
                                                    <div className="row">
                                                        {channelSales?.list &&
                                                            channelSales?.list.length > 0 ? (() => {
                                                                const jsxElements = []
                                                                for (const [i, c] of channelSales.list.entries()) {
                                                                    if (i === 3) { break }
                                                                    jsxElements.push(
                                                                        <div className="col-4" key={i}>
                                                                            <div className="text-center">
                                                                                <p className="mb-2 text-truncate">{c?.vChannel || ''}</p>
                                                                                <h4 className="text-primary">${c?.vTotalSalesCnt || 0}</h4>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                }
                                                                return jsxElements;
                                                            })()
                                                            :
                                                            <p className="skel-widget-warning">No Channels Found</p>
                                                        }
                                                        {/* <div className="col-4">
                                                            <div className="text-center">
                                                                <p className="mb-2 text-truncate">Channel 2</p>
                                                                <h4 className="text-primary">$11000</h4>
                                                            </div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div className="text-center">
                                                                <p className="mb-2 text-truncate">Channel 3</p>
                                                                <h4 className="text-primary">$4500</h4>
                                                            </div>
                                                        </div> */}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-body">
                                                <div className="media">
                                                    <div className="media-body overflow-hidden">
                                                        <h4 className="text-truncate fs-4 mb-2">Online - Retail Store</h4>
                                                    </div>
                                                    <div className="text-primary">
                                                        <i className="fe-bar-chart-2 mr-1 noti-icon"></i>
                                                    </div>
                                                </div>
                                                <div className="card-body border-top py-3">
                                                    <div className="row">
                                                        <div className="col-6">
                                                            <div className="text-center">
                                                                <p className="mb-2 text-truncate">Online Channels Total</p>
                                                                <h4 className="text-primary">${numberFormatter(onlineChannelSales?.total || 0, 1) || 0}</h4>
                                                            </div>
                                                        </div>
                                                        <div className="col-6">
                                                            <div className="text-center">
                                                                <p className="mb-2 text-truncate">Retail Outlet Total</p>
                                                                <h4 className="text-primary">${numberFormatter(onlineChannelSales?.retail || 0, 1) || 0}</h4>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                                {/* Fifty Row */}
                                <div className="row mt-3">
                                    <div className="col-md-6">
                                        <div className="card">
                                            <div className="card-body">
                                                {/* <div className="card-widgets">
                                                    <span data-toggle="reload"><i className="mdi mdi-refresh"></i></span>
                                                    <span data-toggle="collapse" role="button" aria-expanded="false" aria-controls="cardCollpase5"><i className="mdi mdi-minus"></i></span>
                                                    <span data-toggle="remove"><i className="mdi mdi-close"></i></span>
                                                </div> */}
                                                <h4 className="header-title mb-0">Total Sales by Channel</h4>

                                                <div className="card-body">
                                                    <div className="media">
                                                        <div className="media-body overflow-hidden text-center">
                                                            <h4 className="text-truncate text-center mb-2">Total Channel Sales</h4>
                                                            <h4 className="mb-0">${numberFormatter(channelSales?.total || 0, 3) || 0}</h4>
                                                        </div>
                                                        {/* <div className="text-primary">
                                                            <i className="fe-bar-chart-2 mr-1 noti-icon"></i>
                                                        </div> */}
                                                    </div>
                                                </div>

                                                <div id="cardCollpase5" className="collapse pt-3 show" dir="ltr">
                                                    <PieHalfDonut chartStyle={{ width: '100%', height: '300px' }} />
                                                    {/* <embed type="text/html" src="pie-half-donut.html" width="100%" height="300" /> */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="card">
                                            <div className="card-body">
                                                {/* <div className="card-widgets">
                                                    <span data-toggle="reload"><i className="mdi mdi-refresh"></i></span>
                                                    <span data-toggle="collapse" role="button" aria-expanded="false" aria-controls="cardCollpase5c"><i className="mdi mdi-minus"></i></span>
                                                    <span data-toggle="remove"><i className="mdi mdi-close"></i></span>
                                                </div> */}
                                                <h4 className="header-title mb-3">Leads Pipeline</h4>
                                                <div id="cardCollpasexc">
                                                    <Funnel chartStyle={{ width: '100%', height: '380px' }} />
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                                {/* Sixth Row */}
                                <div className="row mt-3">
                                    <div className="col-md-6">
                                        <div className="card ">
                                            <div className="card-body">
                                                {/* <div className="card-widgets">
                                                    <span data-toggle="reload"><i className="mdi mdi-refresh"></i></span>
                                                    <span data-toggle="collapse" role="button" aria-expanded="false" aria-controls="cardCollpase5f"><i className="mdi mdi-minus"></i></span>
                                                    <span data-toggle="remove"><i className="mdi mdi-close"></i></span>
                                                </div> */}
                                                <div className="media">
                                                    <div className="media-body overflow-hidden">
                                                        <h4 className="header-title mb-3">Deals closed by age</h4>
                                                    </div>
                                                </div>
                                            </div>
                                            <div id="cardCollpase5f" className="collapse show" dir="ltr">
                                                <Pie chartStyle={{ width: '100%', height: '380px' }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="card ">
                                            <div className="card-body">
                                                {/* <div className="card-widgets">
                                                    <span data-toggle="reload"><i className="mdi mdi-refresh"></i></span>
                                                    <span data-toggle="collapse" role="button" aria-expanded="false" aria-controls="cardCollpase5f"><i className="mdi mdi-minus"></i></span>
                                                    <span data-toggle="remove"><i className="mdi mdi-close"></i></span>
                                                </div> */}
                                                <div className="media">
                                                    <div className="media-body overflow-hidden">
                                                        <h4 className="header-title mb-3">Conversion Rate</h4>
                                                    </div>
                                                </div>
                                            </div>
                                            <div id="cardCollpase5f" className="collapse show" dir="ltr">
                                                <div className="col-12 text-center">
                                                    <h3 className="mb-0">{conversionRate?.percent ?? 0}%</h3>
                                                </div>

                                                {/* <embed type="text/html" src="churn.html" width="100%" height="280" /> */}
                                                <StackedBar chartStyle={{ width: '100%', height: '300px' }} />
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Seventh Row */}
                            <div className="row mt-3">
                                {/* Moving Bubble */}
                                <div className="col-md-12">
                                    <div className="card px-2">
                                        <div className="card-body">
                                            {/* <div className="card-widgets">
                                                <span data-toggle="reload"><i className="mdi mdi-refresh"></i></span>
                                                <span data-toggle="collapse" role="button" aria-expanded="false" aria-controls="cardCollpase5f"><i className="mdi mdi-minus"></i></span>
                                                <span data-toggle="remove"><i className="mdi mdi-close"></i></span>
                                            </div> */}
                                            <div className="media">
                                                <div className="media-body overflow-hidden">
                                                    <h4 className="text-truncate font-size-14 mb-2">Live Tracking Sales Flow</h4>

                                                </div>
                                            </div>
                                        </div>

                                        <div className="card-body border-top py-3" id="cardCollpase7f">
                                            {/* <embed type="text/html" src="https://ayurismwellness.com/moving-bubbles-chart-master/" width="100%" height="700" /> */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Eigth Row */}
                            <div className="row mt-3">
                                <div className="col-md-12">
                                    <div className="card px-2">
                                        <div className="card-body">
                                            {/* <div className="card-widgets">
                                                <span data-toggle="reload"><i className="mdi mdi-refresh"></i></span>
                                                <span data-toggle="collapse" role="button" aria-expanded="false" aria-controls="cardCollpase5f"><i className="mdi mdi-minus"></i></span>
                                                <span data-toggle="remove"><i className="mdi mdi-close"></i></span>
                                            </div> */}
                                            <div className="media">
                                                <div className="media-body overflow-hidden">
                                                    <h4 className="text-truncate font-size-14 mb-2">Sales by Location</h4>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="card-body border-top py-3" id="cardCollpase7f">
                                            {/* <embed type="text/html" src="bar-label-rotation.html" width="1270" height="600" /> */}
                                            <MultiBar chartStyle={{ width: '100%', height: '380px' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Nigth Row */}
                            <div className="row mt-3">
                                <div className="col-md-6">
                                    <div className="card">

                                        <div className="card-body">
                                            {/* <div className="card-widgets">
                                                <span data-toggle="reload"><i className="mdi mdi-refresh"></i></span>
                                                <span data-toggle="collapse" role="button" aria-expanded="false" aria-controls="cardCollpase8f"><i className="mdi mdi-minus"></i></span>
                                                <span data-toggle="remove"><i className="mdi mdi-close"></i></span>
                                            </div> */}
                                            <div className="media">
                                                <div className="media-body overflow-hidden">
                                                    <h4 className="text-truncate font-size-14 mb-2">Customer Churn Rate</h4>
                                                </div>

                                            </div>
                                        </div>
                                        <div className="card-body border-top py-3" id="cardCollpase8f">
                                            <CustomerChurnRateChart chartStyle={{ width: '100%', height: '380px' }} />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="card">

                                        <div className="card-body">
                                            {/* <div className="card-widgets">
                                                <span data-toggle="reload"><i className="mdi mdi-refresh"></i></span>
                                                <span data-toggle="collapse" role="button" aria-expanded="false" aria-controls="cardCollpase8f"><i className="mdi mdi-minus"></i></span>
                                                <span data-toggle="remove"><i className="mdi mdi-close"></i></span>
                                            </div> */}
                                            <div className="media">
                                                <div className="media-body overflow-hidden">
                                                    <h4 className="text-truncate font-size-14 mb-2">Positive vs. Negative Reply Rates</h4>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card-body border-top py-3" id="cardCollpase8f">
                                            <PositiveNegativeReplyCountChart chartStyle={{ width: '100%', height: '380px' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Tenth Row */}
                            <div className="row mt-3">

                                <div className="col-md-6">
                                    <div className="card">

                                        <div className="card-body">
                                            {/* <div className="card-widgets">
                                                <span data-toggle="reload"><i className="mdi mdi-refresh"></i></span>
                                                <span data-toggle="collapse" role="button" aria-expanded="false" aria-controls="cardCollpase8f"><i className="mdi mdi-minus"></i></span>
                                                <span data-toggle="remove"><i className="mdi mdi-close"></i></span>
                                            </div> */}
                                            <div className="media">
                                                <div className="media-body overflow-hidden">
                                                    <h4 className="text-truncate font-size-14 mb-2">Average Leads Response Time</h4>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card-body border-top py-3" id="cardCollpase8f">
                                            <AverageLeadsResponseTimeChart chartStyle={{ width: '100%', height: '380px' }} />
                                        </div>

                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="card">

                                        <div className="card-body">
                                            {/* <div className="card-widgets">
                                                <span data-toggle="reload"><i className="mdi mdi-refresh"></i></span>
                                                <span data-toggle="collapse" role="button" aria-expanded="false" aria-controls="cardCollpase8f"><i className="mdi mdi-minus"></i></span>
                                                <span data-toggle="remove"><i className="mdi mdi-close"></i></span>
                                            </div> */}
                                            <div className="media">
                                                <div className="media-body overflow-hidden">
                                                    <h4 className="text-truncate font-size-14 mb-2">Sales Growth</h4>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card-body border-top py-3" id="cardCollpase8f">
                                            {/* <embed type="text/html" src="growth.html" width="100%" height="300" /> */}
                                            <LiveBar chartStyle={{ width: '100%', height: '380px' }}
                                                data={{
                                                    chartData: salesGrowthData
                                                }}
                                                handler={{
                                                    fetchAndUpdateSalesGrowth
                                                }}
                                            />
                                        </div>

                                    </div>
                                </div>
                            </div>
                            {/* Eleventh Row */}
                            <div className="row my-3">

                                <div className="col-md-6">
                                    <div className="card">

                                        <div className="card-body">
                                            {/* <div className="card-widgets">
                                                <span data-toggle="reload"><i className="mdi mdi-refresh"></i></span>
                                                <span data-toggle="collapse" role="button" aria-expanded="false" aria-controls="cardCollpase8f"><i className="mdi mdi-minus"></i></span>
                                                <span data-toggle="remove"><i className="mdi mdi-close"></i></span>
                                            </div> */}
                                            <div className="media">
                                                <div className="media-body overflow-hidden">
                                                    <h4 className="text-truncate font-size-14 mb-2">Customer Retention Rate</h4>
                                                </div>

                                            </div>
                                        </div>
                                        <div className="card-body border-top py-3" id="cardCollpase8f">
                                            {/* <embed type="text/html" src="cust-retention.html" width="100%" height="300" /> */}
                                            <Line chartStyle={{ width: '100%', height: '380px' }} />
                                        </div>

                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="card">

                                        <div className="card-body">
                                            {/* <div className="card-widgets">
                                                <span data-toggle="reload"><i className="mdi mdi-refresh"></i></span>
                                                <span data-toggle="collapse" role="button" aria-expanded="false" aria-controls="cardCollpase8f"><i className="mdi mdi-minus"></i></span>
                                                <span data-toggle="remove"><i className="mdi mdi-close"></i></span>
                                            </div> */}
                                            <div className="media">
                                                <div className="media-body overflow-hidden">
                                                    <h4 className="text-truncate font-size-14 mb-2">Net Promoter Score (NPS)</h4>

                                                </div>

                                            </div>
                                        </div>
                                        <div className="card-body border-top py-3" id="cardCollpase8f">
                                            {/* <embed type="text/html" src="nps.html" width="100%" height="300" /> */}
                                            <Gauge chartStyle={{ width: '100%', height: '380px' }}
                                                data={{
                                                    chartData: []
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>


                            </div>

                        </div>
                    </div>
                </div>
            </div>
            {/* </div> */}
        </salesDashboardContext.Provider>
    )

}

export default Dashboard