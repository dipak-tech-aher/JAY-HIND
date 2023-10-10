import React, { useCallback, useEffect, useState, useContext } from "react";
import Footer from "../common/footer";
import LeftTab from "./leftTab"
import Filter from "./filter";
import { properties } from "../properties";
import { post, get } from "../common/util/restUtil";

import { AppContext } from "../AppContext";
import { useHistory } from "react-router-dom";
import CountCards from './CountCards';
import { Bar } from "react-chartjs-2";


const SalesDashboard = () => {
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
   
    const [todoPageCount, setTodoPageCount] = useState(0);
    const [leadData, setLeadData] = useState({})
    const [barChartData, setBarChartData] = useState({})
    const [upgradeDowngrade, setUpgradeDowngrade] = useState({});
    const [barUnbarChartData, setBarUnbarChartData] = useState({});
    const [salesData, setSalesData] = useState({})

    const options = {
        scales: {
            yAxes: [
                {
                    ticks: {
                        beginAtZero: true,
                    },
                },
            ],
        },
    };
    const getDashBoardData = useCallback(() => {
        
      
        let startDate = dateRange.startDate.split("-").reverse().join("-");
        let endDate = dateRange.endDate.split("-").reverse().join("-");
        
        post(properties.DASHBOARD_API + "/sales", { startDate: startDate, endDate: endDate }).then((resp) => {
            if (resp.data) {
                setSalesData(resp.data)
                getChartData(resp.data.connection, 'connetionByServiceType')
                let barUnbar = []
                let upgradeDowngradeArray = []
                let leads = []

                resp.data.graph.map((e) => {
                    if (e.type === 'BAR' || e.type === 'UNBAR') {
                        barUnbar.push(e)
                    }
                    else if (e.type === 'UPGRADE' || e.type === 'DOWNGRADE') {
                        upgradeDowngradeArray.push(e)
                    }
                    else if (e.type === 'Lead') {
                        leads.push(e)
                    }
                })
                getChartData(barUnbar, 'barUnbar')
                getChartData(upgradeDowngradeArray, 'UpgradeDowngrade')
                getChartData(leads, 'Lead')


            }
        }).catch((error) => {
            console.log(error)
        }).finally()


      }, [ dateRange])
    
      useEffect(() => {
        getDashBoardData();
      }, [getDashBoardData, refresh]);
    
      const handleAuthChange = (dashboardData) => {
        setAuth({ ...auth, dashboardData })
      }


    const getChartData = (array, graphType) => {
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
        if (graphType === 'connetionByServiceType') { setBarChartData(graphData) }
        else if (graphType === 'barUnbar') { setBarUnbarChartData(graphData) }
        else if (graphType === 'UpgradeDowngrade') { setUpgradeDowngrade(graphData) }
        else if (graphType === 'Lead') {

            setLeadData(graphData)
        }
    }
    return (
        <>
            <div className="row">
                <div className="col-lg-12 dashboard-right">
                    <div className="container-fluid">
                        <div className="row">
                            <LeftTab
                                refresh={refresh}
                                dateRange={dateRange}
                                todoPageCount={todoPageCount}
                                setTodoPageCount={setTodoPageCount}

                            />
                            <div className="col-lg-9 pl-0 dashboard-right">
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
                                {salesData &&
                                    <div className="row">
                                        <div className="col-xl-12">
                                            <div className="row" style={{ display: "flex" }}>
                                                <div className="col-5">
                                                    <CountCards
                                                        data={{
                                                            headSection: {
                                                                "Total Customers": Number(salesData.totalCustomer),
                                                            },
                                                            bodySection: [{
                                                                "Residential": Number(salesData.residentialCustomer),
                                                            },
                                                            {
                                                                "Business": Number(salesData.businessCustomer),
                                                            },
                                                            {
                                                                "Government": Number(salesData.governmentCustomer),
                                                            }]

                                                        }} />


                                                </div>
                                                <div className="col-5">
                                                    <CountCards
                                                        data={{
                                                            headSection: {
                                                                "Total Services": Number(salesData.totalConnections),
                                                            },
                                                            bodySection: [{
                                                                "Active": Number(salesData.activeConnections)
                                                            },
                                                            {
                                                                "Pending": Number(salesData.pendingConnections)
                                                            },
                                                            {
                                                                "Permanently Disclosed": Number(salesData.pdConnections)
                                                            }]

                                                        }} />
                                                </div>
                                                <div className="col-4">

                                                </div>
                                            </div>

                                        </div>
                                    </div>}
                                <br />
                                <div className="row">
                                    <div className="col-md-6 p-1">
                                        <div className="card text-white">
                                            <div className="card-body">
                                                <div className="media">
                                                    <div className="media-body overflow-hidden">
                                                        <h5 className="header-title">Services by Service type </h5>
                                                    </div>
                                                    <div className="text-primary">
                                                        <i className="fas fa-tasks noti-icon mr-1 font-size-24"></i>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-body border-top">
                                                <div>

                                                    <div className="row p-0">
                                                        <div className="col-md-10 p-2" style={{ alignContent: "center" }}>
                                                            <div>
                                                                {/* <GroupedBar /> */}
                                                                {barChartData &&
                                                                    <Bar data={barChartData} options={options} />}

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
                                                <h5 className="header-title">Bar/Unbar Status</h5>
                                            </div>{barUnbarChartData &&
                                                <Bar data={barUnbarChartData} options={options} />}

                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-5 pl-1 pt-1 pb-1 pr-0">
                                        <div className="card">
                                            <div className="card-body"><div className="media-body overflow-hidden">
                                                <h5 className="header-title">Upgrade/Downgrade Trends</h5>
                                            </div>{upgradeDowngrade &&
                                                <Bar data={upgradeDowngrade} options={options}></Bar>}

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
                                                        <h5 className="header-title">Leads </h5>
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
                                                            <div>
                                                                {leadData && <Bar data={leadData} options={options}></Bar>}


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

            </div>

            <Footer></Footer>
        </>);
}
export default SalesDashboard;