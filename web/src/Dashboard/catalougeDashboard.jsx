import React, { useCallback, useEffect, useState, useContext } from "react";
import Footer from "../common/footer";
import LeftTab from "./leftTab"
import Filter from "./filter";
import { properties } from "../properties";
import { post } from "../common/util/restUtil";

import { AppContext } from "../AppContext";
import { useHistory } from "react-router-dom";
import CountCards from './CountCards';
import { Bar, Doughnut } from "react-chartjs-2";
import GroupedBar from "./charts/groupedBar";

const CatalougeDashboard = () => {
    const history = useHistory();
    let { auth, setAuth } = useContext(AppContext);
    const [refresh, setRefresh] = useState(auth && auth.dashboardData && auth.dashboardData.refresh);
    const [autoRefresh, setAutoRefresh] = useState(auth && auth.dashboardData && auth.dashboardData.autoRefresh);
    const [timer, setTimer] = useState(auth && auth.dashboardData && auth.dashboardData.timer);
    const [dateRange, setDateRange] = useState(
        {
            startDate: auth && auth.dashboardData && auth.dashboardData.startDate,
            endDate: auth && auth.dashboardData && auth.dashboardData.endDate,
        });
    const [selfDept, setSelfDept] = useState(auth && auth.dashboardData && auth.dashboardData.selfDept);
    const [todoPageCount, setTodoPageCount] = useState(0);
    const [graphData, setGraphData] = useState({})
    const [data, setData] = useState({})
    const [residentialData, setResidentialData] = useState({})
    const [businessData, setBusinessData] = useState({})
    const [governmentData, setGovernmentData] = useState({})

    const [pieChartData, setPieChartData] = useState()

    const [pieChart2Data, setPieChart2Data] = useState()
    const getDashBoardData = useCallback(() => {
        

        let startDate = dateRange.startDate.split("-").reverse().join("-");
        let endDate = dateRange.endDate.split("-").reverse().join("-");
        post(properties.DASHBOARD_API + "/catalouge", { startDate: startDate, endDate: endDate }).then((resp) => {
            if (resp.data) {
                console.log(resp.data)
                getCatalogChartData(resp.data.catalog)
                setData(resp.data)
                getCounts(resp.data.allCounts)
               
                let labels1 = []
                let garphData1 = []
                let labels2 = []
                let garphData2 = []
                resp.data.details.map((e) => {
                    if (e.type === 'connections') {
                        labels1.push(e.description)
                        garphData1.push(e.count)
                    }
                    else if (e.type === 'addon') {
                        labels2.push(e.description)
                        garphData2.push(e.count)
                    }
                })
                setPieChartData({
                    labels: labels1,

                    datasets: [
                        {

                            data: garphData1,

                            backgroundColor: [
                                'rgba(165, 42, 42)',
                                'rgba(54, 162, 235)',
                                'rgba(75, 192, 192)',
                                'rgba(153, 102, 255',

                                'rgba(154, 205, 50)',
                                'rgba(153, 50, 204)',
                                'rgba(127, 255, 212)',

                            ],
                            borderColor: [
                                'rgba(165, 42, 42)',
                                'rgba(54, 162, 235)',
                                'rgba(75, 192, 192)',
                                'rgba(153, 102, 255',

                                'rgba(154, 205, 50)',
                                'rgba(153, 50, 204)',
                                'rgba(127, 255, 212)',


                            ],
                            borderWidth: 1,
                        },
                    ],
                })
                setPieChart2Data({
                    labels: labels2,

                    datasets: [
                        {

                            data: garphData2,

                            backgroundColor: [
                                'rgba(165, 42, 42)',
                                'rgba(54, 162, 235)',
                                'rgba(75, 192, 192)',
                                'rgba(153, 102, 255',

                                'rgba(154, 205, 50)',
                                'rgba(153, 50, 204)',
                                'rgba(127, 255, 212)',

                            ],
                            borderColor: [
                                'rgba(165, 42, 42)',
                                'rgba(54, 162, 235)',
                                'rgba(75, 192, 192)',
                                'rgba(153, 102, 255',

                                'rgba(154, 205, 50)',
                                'rgba(153, 50, 204)',
                                'rgba(127, 255, 212)',


                            ],
                            borderWidth: 1,
                        },
                    ],
                })
            }
        }).catch((error) => {
            console.log(error)
        }).finally()

    }, [dateRange])
    useEffect(() => {
        getDashBoardData();
    }, [getDashBoardData, refresh]);

    const handleAuthChange = (dashboardData) => {
        setAuth({ ...auth, dashboardData })
    }

    const getCatalogChartData = (array) => {
        console.log(array)
        const serviceTypes = [...new Set(array.map(obj => obj.type))];
        const color = ['orange', 'purple', 'red', 'grey', 'indigo', 'voilet', 'white', 'Pink', 'Cyan','RoyalBlue', 'green', 'yellow']

        const monthlyData = []
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        let i = 0
        serviceTypes.map((type) => {
            let data = []
            array.map((node) => {
                if (node.type === type) {
                    data.push(node)
                }
            })
            let monthly = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            data.map((service) => {
                months.map((month, index) => {

                    if (service.month === month) {
                        monthly[index] = Number(service.count)
                    }
                })
            })
            monthlyData.push({ label: type, data: monthly, backgroundColor: color[i] })
            i = i + 1
        })
        let graphData = {
            labels: months,
            datasets: monthlyData
        }

        setGraphData(graphData)

    }



    const getCounts = (array) => {
        let residentialCount = {
            catalog: 0,
            plans: 0,
            asset: 0,
            service: 0,
            addon: 0

        }
        let businessCount = {
            catalog: 0,
            plans: 0,
            asset: 0,
            service: 0,
            addon: 0

        }
        let governmentCount = {
            catalog: 0,
            plans: 0,
            asset: 0,
            service: 0,
            addon: 0

        }
        array.map((e) => {
            if (e.custType === 'RESIDENTIAL') {
                residentialCount.catalog = Number(residentialCount.catalog) + Number((e?.mappingPayload?.catalog) ? e?.mappingPayload?.catalog.length : 0)
                residentialCount.plans = Number(residentialCount.plans) + Number((e?.mappingPayload?.plans) ? e?.mappingPayload?.plans.length : 0)
                residentialCount.service = Number(residentialCount.service) + Number((e?.mappingPayload?.service) ? e?.mappingPayload?.service.length : 0)
                residentialCount.asset = Number(residentialCount.asset) + Number((e?.mappingPayload?.asset) ? e?.mappingPayload?.asset.length : 0)
                residentialCount.addon = Number(residentialCount.addon) + Number((e?.mappingPayload?.addon) ? e?.mappingPayload?.addon.length : 0)
            }
            else if (e.custType === 'BUSINESS') {
                businessCount.catalog = Number(businessCount.catalog) + Number((e?.mappingPayload?.catalog) ? e?.mappingPayload?.catalog.length : 0)
                businessCount.plans = Number(businessCount.plans) + Number((e?.mappingPayload?.plans) ? e?.mappingPayload?.plans.length : 0)
                businessCount.service = Number(businessCount.service) + Number((e?.mappingPayload?.service) ? e?.mappingPayload?.service.length : 0)
                businessCount.asset = Number(businessCount.asset) + Number((e?.mappingPayload?.asset) ? e?.mappingPayload?.asset.length : 0)
                businessCount.addon = Number(businessCount.addon) + Number((e?.mappingPayload?.addon) ? e?.mappingPayload?.addon.length : 0)
            }
            else if (e.custType === 'GOVERNMENT') {
                governmentCount.catalog = Number(governmentCount.catalog) + Number(e?.mappingPayload?.catalog.length)
                governmentCount.plans = Number(governmentCount.plans) + Number(e?.mappingPayload?.plans.length)
                governmentCount.service = Number(governmentCount.service) + Number(e?.mappingPayload?.service.length)
                governmentCount.asset = Number(governmentCount.asset) + Number(e?.mappingPayload?.asset.length)
                governmentCount.addon = Number(governmentCount.addon) + Number(e?.mappingPayload?.addon.length)

            }
        })
        setResidentialData(residentialCount)
        setBusinessData(businessCount)
        setGovernmentData(governmentCount)

    }

    return (
        <>
            <div className="row">
                <div className="col-lg-12  dashboard-right">
                    <div className="container-fluid">
                        <div className="row">

                            <LeftTab
                                refresh={refresh}

                                dateRange={dateRange}
                                todoPageCount={todoPageCount}
                                setTodoPageCount={setTodoPageCount}
                                selfDept={selfDept}
                            />

                            <div className="col-lg-9  dashboard-right">
                                <div className="container-fluid">
                                    <Filter
                                        refresh={refresh}
                                        setRefresh={setRefresh}
                                        data={{

                                            dateRange,
                                            autoRefresh,
                                            timer
                                        }}
                                        handlers={{
                                            setSelfDept: setSelfDept,
                                            setDateRange,
                                            setTodoPageCount,
                                            setAutoRefresh,
                                            setTimer,
                                            handleAuthChange
                                        }} />
                                </div>
                                <br />
                                {data && residentialData && governmentData && businessData &&
                                    <div>
                                        <div className="row">
                                            <div className="col-xl-12">
                                                <div className="row" style={{ display: "flex" }}>
                                                    <div className="col-4">
                                                        <CountCards
                                                            data={{
                                                                headSection: {
                                                                    "Catalogue Count": (Number(residentialData.catalog) + Number(businessData.catalog) + Number(governmentData.catalog)) ? (Number(residentialData.catalog) + Number(businessData.catalog) + Number(governmentData.catalog)) : 0,
                                                                },
                                                                bodySection: [{
                                                                    "Residential": Number(residentialData.catalog) ? Number(residentialData.catalog) : 0,
                                                                },
                                                                {
                                                                    "Business": Number(businessData.catalog) ? Number(businessData.catalog) : 0,
                                                                },
                                                                {
                                                                    "Government": Number(governmentData.catalog) ? Number(governmentData.catalog) : 0,
                                                                }]

                                                            }} />

                                                    </div>
                                                    <div className="col-4">
                                                        <CountCards
                                                            data={{
                                                                headSection: {
                                                                    "Plan Count": (Number(residentialData.plans) + Number(businessData.plans) + Number(governmentData.plans)) ? (Number(residentialData.plans) + Number(businessData.plans) + Number(governmentData.plans)) : 0,
                                                                },
                                                                bodySection: [{
                                                                    "Residential": Number(residentialData.plans) ? Number(residentialData.plans) : 0,
                                                                },
                                                                {
                                                                    "Business": Number(businessData.plans) ? Number(businessData.plans) : 0,
                                                                },
                                                                {
                                                                    "Government": Number(governmentData.plans) ? Number(governmentData.plans) : 0,
                                                                }]

                                                            }} />

                                                    </div>
                                                    <div className="col-4">
                                                        <CountCards
                                                            data={{
                                                                headSection: {
                                                                    "Services Count": (Number(residentialData.service) + Number(businessData.service) + Number(governmentData.service)) ? (Number(residentialData.service) + Number(businessData.service) + Number(governmentData.service)) : 0,
                                                                },
                                                                bodySection: [{
                                                                    "Residential": Number(residentialData.service) ? Number(residentialData.service) : 0,
                                                                },
                                                                {
                                                                    "Business": Number(businessData.service) ? Number(businessData.service) : 0,
                                                                },
                                                                {
                                                                    "Government": Number(governmentData.service) ? Number(governmentData.service) : 0,
                                                                }]

                                                            }} />

                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                        <br />
                                        <div className="row">
                                            <div className="col-xl-12">
                                                <div className="row" style={{ display: "flex" }}>
                                                    <div className="col-4">
                                                        <CountCards
                                                            data={{
                                                                headSection: {
                                                                    "Asset Count": (Number(residentialData.asset) + Number(businessData.asset) + Number(governmentData.asset)) ? (Number(residentialData.asset) + Number(businessData.asset) + Number(governmentData.asset)) : 0,
                                                                },
                                                                bodySection: [{
                                                                    "Residential": Number(residentialData.asset) ? Number(residentialData.asset) : 0,
                                                                },
                                                                {
                                                                    "Business": Number(businessData.asset) ? Number(businessData.asset) : 0,
                                                                },
                                                                {
                                                                    "Government": Number(governmentData.asset) ? Number(governmentData.asset) : 0,
                                                                }]

                                                            }} />
                                                    </div>
                                                    <div className="col-4">
                                                        <CountCards
                                                            data={{
                                                                headSection: {
                                                                    "Add-ons Count": (Number(residentialData.addon) + Number(businessData.addon) + Number(governmentData.addon)) ? (Number(residentialData.addon) + Number(businessData.addon) + Number(governmentData.addon)) : 0,
                                                                },
                                                                bodySection: [{
                                                                    "Residential": Number(residentialData.addon) ? Number(residentialData.addon) : 0,
                                                                },
                                                                {
                                                                    "Business": Number(businessData.addon) ? Number(businessData.addon) : 0,
                                                                },
                                                                {
                                                                    "Government": Number(governmentData.addon) ? Number(governmentData.addon) : 0,
                                                                }]

                                                            }} />
                                                    </div>
                                                    <div className="col-4">
                                                        {data.allCounts && <CountCards
                                                            data={{
                                                                headSection: {
                                                                    "Total Charge Type Count": (Number(data?.allCounts[0]?.rcCharge) + Number(data.allCounts[0]?.nrcCharge) + Number(data.allCounts[0]?.usageCharge)) ? (Number(data?.allCounts[0]?.rcCharge) + Number(data.allCounts[0]?.nrcCharge) + Number(data.allCounts[0]?.usageCharge)) : 0,
                                                                },
                                                                bodySection: [{
                                                                    "Recurring Charge": data?.allCounts[0]?.rcCharge ? Number(data.allCounts[0].rcCharge) : 0,
                                                                },
                                                                {
                                                                    "One Time Charge": data?.allCounts[0]?.nrcCharge ? Number(data.allCounts[0].nrcCharge) : 0,
                                                                },
                                                                {
                                                                    "Usage Charge": data?.allCounts[0]?.usageCharge ? Number(data.allCounts[0].usageCharge) : 0,
                                                                }]

                                                            }} />}
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-8 pl-1 pt-1 pb-1 pr-0 ">
                                                <div className="card">
                                                    <div className="card-body"><div className="media-body overflow-hidden">
                                                        <h5 className="header-title">Services by Service Type Count</h5>
                                                    </div>
                                                        {pieChartData && <Doughnut data={pieChartData} />}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-5 pl-1 pt-1 pb-1 pr-0">
                                                <div className="card">
                                                    <div className="card-body"><div className="media-body overflow-hidden">
                                                        <h5 className="header-title">Addon by Service Type count</h5>
                                                    </div>
                                                        {pieChart2Data && <Doughnut data={pieChart2Data} />}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6 p-1">
                                                <div className="card text-white">
                                                    <div className="card-body">
                                                        <div className="media">
                                                            <div className="media-body overflow-hidden">
                                                                <h5 className="header-title">Catalogue by Service Type count </h5>
                                                            </div>
                                                            <div className="text-primary">
                                                                <i className="fas fa-tasks noti-icon mr-1 font-size-24"></i>

                                                            </div>



                                                        </div>
                                                        {graphData && <Bar data={graphData} options={{
                                                            scales: {
                                                                yAxes: [
                                                                    {
                                                                        ticks: {
                                                                            beginAtZero: true,
                                                                        },
                                                                    },
                                                                ],
                                                            },
                                                        }} />}
                                                    </div>
                                                    <div className="card-body border-top">
                                                        <div>

                                                            <div className="row p-0">
                                                                <div className="col-md-12 p-2">
                                                                    <div>

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
                </div>
            </div>
            <Footer></Footer>
        </>);
}
export default CatalougeDashboard;