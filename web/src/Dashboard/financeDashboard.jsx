import React, { useCallback, useEffect, useState, useContext } from "react";
import Footer from "../common/footer";
import LeftTab from "./leftTab"
import Filter from "./filter";
import { properties } from "../properties";
import { post, get } from "../common/util/restUtil";

import { AppContext } from "../AppContext";
import { useHistory } from "react-router-dom";
import CountCards from './CountCards';
import { Bar, Line } from 'react-chartjs-2';



const FinanceDashboard = () => {
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

    const [revenueData, setRevenueData] = useState(0)
    const [finanaceData, setFinanceData] = useState({})
    const [counts, setCounts] = useState({})
    const [paymentData, setPaymentData] = useState({})
    const [paymentRegionData, setPaymentRegionData] = useState({})
    const [invoiceData, setInvoiceData] = useState({})

    const getDashBoardData = useCallback(() => {
        

        let startDate = dateRange.startDate.split("-").reverse().join("-");
        let endDate = dateRange.endDate.split("-").reverse().join("-");

        post(properties.DASHBOARD_API + "/finance", { startDate: startDate, endDate: endDate }).then((resp) => {
            if (resp.data) {
                let adjustment = Number(resp?.data?.counts[0]?.totalCredit) - Number(resp?.data?.counts[0]?.totalDebit)
                let revenue = Number(resp?.data?.counts[0]?.totalRc) + Number(resp?.data?.counts[0]?.totalNrc) + Number(resp?.data?.counts[0]?.totalUsage)
                revenue = revenue - adjustment
                setRevenueData(revenue)
                setFinanceData(resp?.data)
                setCounts(resp?.data?.counts[0])
                getInvoiceChartData(resp?.data?.invoice, 'InvoiceChart')
                let paymentModeChart = []
                let paymentRegionChart = []
                resp.data.payment.map((e) => {
                    if (e.graphName === 'RegionwisePayment') {
                        paymentRegionChart.push(e)
                    }
                    else if (e.graphName === 'ModewisePayment') {
                        paymentModeChart.push(e)
                    }
                })
                getChartData(paymentRegionChart, 'PaymentRegionChart')
                getChartData(paymentModeChart, 'PaymentChart')
            }
        }).catch((error) => {
            console.log(error)
        }).finally()

    }, [dateRange])


    const options = {
        scales: {
            yAxes: [
                {
                    stacked: true,
                    ticks: {
                        beginAtZero: true,
                    },
                },

            ],
            xAxes: [
                {
                    stacked: true,
                },
            ],

        },
    };


    useEffect(() => {
        getDashBoardData();
    }, [getDashBoardData, refresh]);
    const handleAuthChange = (dashboardData) => {
        setAuth({ ...auth, dashboardData })
    }

    const getInvoiceChartData = (array, graphType) => {
        const serviceTypes = [...new Set(array.map(obj => obj.type))];
        const color = ['RoyalBlue', 'green', 'yellow', 'orange', 'purple', 'red', 'grey', 'indigo', 'voilet', 'white', 'Pink', 'Cyan']

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
        if (graphType === 'InvoiceChart') { setInvoiceData(graphData) }

    }


    const getChartData = (array, graphType) => {
        let serviceTypes = []

        serviceTypes = [...new Set(array.map(obj => obj.type))];


        const color = ['RoyalBlue', 'green', 'yellow', 'orange', 'purple', 'red', 'grey', 'indigo', 'voilet', 'white', 'Pink', 'Cyan']

        const dailyData = []
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thrusday', 'Friday', 'Saturday', 'Sunday']
        let i = 0
        serviceTypes.map((type) => {
            let data = []
            array.map((node) => {
                if (node.type === type) {
                    data.push(node)
                }
            })
            let daily = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            data.map((service) => {
                days.map((day, index) => {

                    if (service.day === day) {
                        daily[index] = Number(service.count)
                    }
                })
            })
            dailyData.push({ label: type, data: daily, backgroundColor: color[i] })
            i = i + 1
        })
        let graphData = {
            labels: days,
            datasets: dailyData
        }
        if (graphType === 'PaymentChart') { setPaymentData(graphData) }
        else if (graphType === 'PaymentRegionChart') { setPaymentRegionData(graphData) }

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

                                            setDateRange,
                                            setTodoPageCount,
                                            setAutoRefresh,
                                            setTimer,
                                            handleAuthChange
                                        }} />
                                </div>
                                <br />
                                <div className="row">
                                    <div className="col-xl-12">
                                        <div className="row" style={{ display: "flex" }}>
                                            <div className="col-4">
                                                {finanaceData !== null && finanaceData !== undefined && revenueData !== null && revenueData !== undefined && <CountCards
                                                    data={{
                                                        headSection: {
                                                            "Revenue": '$' + revenueData,
                                                        },
                                                        bodySection: [{
                                                            "RC Amount": '$' + (Number(counts?.totalRc) ? Number(counts?.totalRc) : 0),
                                                        },

                                                        {
                                                            "NRC Amount": '$' + (Number(counts?.totalNrc) ? Number(counts?.totalNrc) : 0),
                                                        },
                                                        {
                                                            "Usage Amount": '$' + (Number(counts?.totalUsage) ? Number(counts?.totalUsage) : 0),
                                                        }]

                                                    }} />}
                                            </div>
                                            <div className="col-4">
                                                {finanaceData && <CountCards
                                                    data={{
                                                        headSection: {
                                                            "Contract": Number(counts?.totalContract) ? Number(counts?.totalContract) : 0
                                                        },
                                                        bodySection: []

                                                    }} />}
                                            </div>
                                            <div className="col-4">
                                                {

                                                    finanaceData && < CountCards

                                                        data={{
                                                            headSection: {
                                                                "Billed Amount": Number(counts?.totalBilling) ? Number(counts?.totalBilling) : 0,
                                                            },
                                                            bodySection: [{
                                                                "RC": Number(finanaceData.RCBill) ? Number(finanaceData.RCBill) : 0,
                                                            },
                                                            {
                                                                "NRC": Number(finanaceData.NRCBill) ? Number(finanaceData.NRCBill) : 0,
                                                            },
                                                            {
                                                                "Usage": Number(finanaceData.UsageBill) ? Number(finanaceData.UsageBill) : 0,
                                                            }]

                                                        }} />}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                                <br />
                                <div className="row">
                                    <div className="col-md-6 p-1">
                                        <div className="card text-white">
                                            <div className="card-body">
                                                <div className="media">
                                                    <div className="media-body overflow-hidden">
                                                        <h5 className="header-title">Plan Performance </h5>
                                                    </div>
                                                    <div className="text-primary">
                                                        <i className="fas fa-tasks noti-icon mr-1 font-size-24"></i>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-body border-top">
                                                <div>

                                                    <div className="row p-0">
                                                        <div className="col-md-12 p-2">

                                                            <div className="col-md-12">





                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
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
                                                        <h5 className="header-title">Revenue by Services (Amount in Millions)</h5>
                                                    </div>
                                                    <div className="text-primary">
                                                        <i className="fas fa-tasks noti-icon mr-1 font-size-24"></i>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-body border-top">
                                                <div>

                                                    <div className="row p-0">
                                                        <div className="col-md-12 p-2">

                                                            <div className="col-md-12">





                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-8 pl-1 pt-1 pb-1 pr-0 ">
                                        <div className="card">
                                            <div className="card-body"><div className="media-body overflow-hidden">
                                                <h5 className="header-title">
                                                    Regionwise Collection
                                                </h5>
                                            </div>
                                                {paymentRegionData && <Line data={paymentRegionData} options={options}></Line>}

                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-5 pl-1 pt-1 pb-1 pr-0">
                                        <div className="card">
                                            <div className="card-body"><div className="media-body overflow-hidden">
                                                <h5 className="header-title">
                                                    Payment Mode
                                                </h5>
                                            </div>
                                                {paymentData && <Bar data={paymentData} options={options} />}
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
                                                        <h5 className="header-title">Invoices Open / Closed</h5>
                                                    </div>
                                                    <div className="text-primary">
                                                        <i className="fas fa-tasks noti-icon mr-1 font-size-24"></i>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-body border-top">
                                                <div>

                                                    <div className="row p-0">
                                                        <div className="col-md-12">
                                                            {invoiceData && <Bar data={invoiceData} options={{
                                                                scales: {
                                                                    yAxes: [
                                                                        {
                                                                            ticks: {
                                                                                beginAtZero: true,
                                                                            },
                                                                        },
                                                                    ],
                                                                },
                                                            }}></Bar>}

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
            <Footer></Footer>
        </>);
}
export default FinanceDashboard;