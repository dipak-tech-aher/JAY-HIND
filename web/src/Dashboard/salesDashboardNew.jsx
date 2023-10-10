import moment from 'moment';
import React, { useCallback, useContext, useEffect, useState } from "react";
import DateRangePicker from 'react-bootstrap-daterangepicker';
import { AppContext } from "../AppContext";

import { properties } from "../properties";
import { get, post } from "../common/util/restUtil";
import CustomTable from "./components/CustomTable";
import CustomTableIcons from "./components/CustomTableIcons";
import HorizontalBarChart from "./components/HorizontalBarChart";
import PieChart from "./components/PieChart";
import Snippet from "./components/snippet";
import VerticalBarChart from './components/VerticalBarChart';

const SalesDashboardNew = () => {
    const [totalProspect, setTotalProspect] = useState(0);
    const [totalNewCustomer, setTotalNewCustomer] = useState(0);
    const [openOpportunities, setOpenOpportunities] = useState(0);
    const [churnedRate, setChurnedRate] = useState(0);
    const [arpu, setArpu] = useState(0);
    let { auth, setAuth } = useContext(AppContext);
    const [refresh, setRefresh] = useState(auth && auth.dashboardData && auth.dashboardData.refresh);
    const [dateRange, setDateRange] = useState({
        startDate: moment().subtract(90, 'day').format('DD-MM-YYYY'),
        endDate: moment().format('DD-MM-YYYY')
    });
    const [salesZeroGrossOutlet, setSalesZeroGrossOutlet] = useState()
    const [wonvsLostDetails, setWonvsLostDetails] = useState()
    const [hideChart, setHideChart] = useState({
        totalProspect: "show",
        totalnewCustomer: "show",
        openOpportunities: "show",
        chrunRate: "show",
        netPromoterShow: "show",
        arpu: "show",
        targetVsArchievement: "show",
        wonvsLost: "show",
        ZeroCross: "show",
        revenue: "show",
        monthGrowth: "show",
        uniqueSale: "show",
        customerChrun: "show",
        netPromoterScrore: "hide"
    })
    const [revenueData, setRevenueData] = useState()
    const [uniqueSalesData, setuniqueSalesData] = useState()
    const [customerChurn, setCustomerChurn] = useState()
    const [archiveTarget, setArchiveTarget] = useState()
    const [monthSales, setMonthSales] = useState()

    const handleDateRangeChange = (event, picker) => {
        let startDate = moment(picker.startDate).format('DD-MM-YYYY');
        let endDate = moment(picker.endDate).format('DD-MM-YYYY');
        const dateDifference = moment(endDate, 'DD-MM-YYYY').diff(moment(startDate, 'DD-MM-YYYY'), 'days')
        if (dateDifference > 90) {
            setHideChart({
                ...hideChart, openOpportunities: "hide", chrunRate: "hide", targetVsArchievement: "hide",
                wonvsLost: "hide", ZeroCross: "hide", uniqueSale: "hide", customerChrun: "hide", netPromoterScrore: "hide"
            })
        }
        else {
            //   toast.error('Minimum Date Range is More then 3 Months')
            //   setDateRange({ startDate: moment().subtract(90, 'day'), endDate: moment() });
            setHideChart({
                ...hideChart, totalProspect: "show",
                totalnewCustomer: "show",
                openOpportunities: "show",
                chrunRate: "show",
                netPromoterShow: "show",
                arpu: "show",
                targetVsArchievement: "show",
                wonvsLost: "show",
                ZeroCross: "show",
                revenue: "show",
                monthGrowth: "show",
                uniqueSale: "show",
                customerChrun: "show",
                netPromoterScrore: "hide"
            })

        }
        setDateRange({ startDate: startDate, endDate: endDate });
    };


    // Fetch dashboard data
    const getDashBoardData = useCallback(() => {
        

        let startDate = dateRange.startDate.split("-").reverse().join("-");
        let endDate = dateRange.endDate.split("-").reverse().join("-");

        //post(properties.DASHBOARD_API + "/sales", { startDate: startDate, endDate: endDate }).then((resp) => {
        post(properties.DASHBOARD_API + "/salesDashboard", { startDate: startDate, endDate: endDate }).then((resp) => {
            if (resp.data) {

                //console.log('dashboardResp', resp.data, resp.data[0].arpu)
                setTotalProspect(resp.data[0].prospectcustomers)
                setTotalNewCustomer(resp.data[0].newcustomers)
                setOpenOpportunities(resp.data[0].openopportunities)
                setChurnedRate(parseFloat(resp.data[0]?.churnedrate).toFixed(2))
                const arpuDecimal = resp.data[0].arpu
                //console.log('arpuDecimal', parseFloat(arpuDecimal).toFixed(2))
                setArpu(parseFloat(arpuDecimal).toFixed(2))//Upto 2 decimal
            }
        }).catch((error) => {
            console.log(error)
        }).finally()

        
        post(properties.DASHBOARD_API + "/salesPercentageOfRevenue").then((resp) => {
            if (resp.data) {
                setRevenueData([
                    { newRevenuePercentage: ((resp.data.response2[0]?.newcustomerrevenue / resp.data.response1[0]?.existingcustomerrevenue) * 100).toFixed(2) || 0 },
                    {
                        revenueChartData: [{
                            value: parseFloat(resp.data?.response1[0]?.existingcustomerrevenue).toFixed(0) || 0,
                            name: "Existing"
                        }, {
                            value: parseFloat(resp.data?.response2[0]?.newcustomerrevenue).toFixed(0) || 0,
                            name: "New"
                        }]
                    }
                ])
            }
        }).catch((error) => {
            console.log(error)
        }).finally()


        
        post(properties.DASHBOARD_API + "/salesTargetVsAchievementChart", { startDate: startDate, endDate: endDate }).then((resp) => {
            if (resp.data) {
                let achievement = []
                let target = []
                let agent = []
                for (let d of resp.data.target) {
                    target.push(d.target_count)
                    agent.push(d.agents)
                }
                for (let e of resp.data.target) {
                    const checksales = (obj) => {
                        if (obj.first_name === e.agents) {
                            return true
                        } else { return false }
                    };
                    if (resp.data.achievement.some(checksales)) {
                        let data = resp.data.achievement.filter(d => d.first_name === e.agents)
                        achievement.push(data[0].count)
                    }
                    else {
                        achievement.push(0)
                    }
                }
                setArchiveTarget({ achievement, target, agent })
            }
        }).catch((error) => {
            console.log(error)
        }).finally()

        
        post(properties.DASHBOARD_API + "/salesMonthOnMonth", { startDate: startDate, endDate: endDate }).then((resp) => {
            if (resp.data) {
                if (resp.data) {
                    let count = []
                    let month = []
                    for (let n of resp.data) {
                        month.push(n.month)
                        count.push(n.count)
                    }
                    setMonthSales({
                        month, count
                    })
                }
            }
        }).catch((error) => {
            console.log(error)
        }).finally()

        //Sales won vs Lost
        
        post(properties.DASHBOARD_API + "/saleswonVsLost", { startDate: startDate, endDate: endDate }).then((resp) => {
            if (resp.data) {
                let wonDataList = []
                let lostDataList = []
                let SourceDataList = []
                if (resp.data.Won.length > 0 && resp.data.Lost.length > 0) {
                    for (let w of resp?.data?.Won) {
                        wonDataList.push(w.count)
                        SourceDataList.push(w.source)
                    }
                    for (let l of resp?.data?.Lost) {
                        lostDataList.push(l.count)
                    }
                }
                setWonvsLostDetails({ source: SourceDataList, won: wonDataList, lost: lostDataList })
            }
        }).catch((error) => {
            console.log(error)
        }).finally()

        //customer churn
        
        post(properties.DASHBOARD_API + "/salesChurnCustomersChart").then((resp) => {
            if (resp.data) {
                const customerChurnPercentage = isNaN(resp.data.churnedRate[0]?.churnedrate) ? 0 : Number(resp?.data?.churnedRate[0]?.churnedrate).toFixed(2)
                let customerData = []
                let churnData = []
                let customerChurnMonth = []
                if (resp.data?.activeCustomers.length > 0) {
                    for (let f of resp.data?.activeCustomers) {
                        customerData.push(f.activecustomers)
                        customerChurnMonth.push(moment(f.mon).format('MMM'))
                    }
                }
                if (resp.data?.churnedCustomers.length > 0) {
                    for (let f of resp.data?.activeCustomers) {
                        churnData.push(f.churnedCustomers)
                    }
                }
                setCustomerChurn(
                    {
                        customerChurnPercentage,
                        customerData,
                        customerChurnMonth,
                        churnData
                    }
                )
            }
        }).catch((error) => {
            console.log(error)
        }).finally()

    }, [dateRange])


    useEffect(() => {

        //salesZeroGrossOutlet
        
        get(properties.DASHBOARD_API + "/salesZeroGrossOutlet").then((resp) => {
            try {
                if (resp.data) {
                    //  const salesZeroGrossArray = resp.data?.filter(e => Number(e.count) === 0)
                    let salesZeroGrossArray = []
                    for (let e of resp.data) {
                        if (Number(e.count) === 0) {
                            salesZeroGrossArray.push({
                                key: e.description, id: e.code, outlet: e.description
                            })
                        }
                    }
                    setSalesZeroGrossOutlet(salesZeroGrossArray)
                }
            } catch (error) {
                console.log(error)
            }
        }).catch((error) => {
            console.log(error)
        }).finally()

        //unique Sales
        
        post(properties.BUSINESS_ENTITY_API, ['LOCATION',]).then((resp) => {
            get(properties.DASHBOARD_API + "/salesUniqueSalesOutlet").then((response) => {
                const fromDate = moment().startOf('week');
                const toDate = moment().endOf('week');
                let Datearray = []

                let loop = new Date(fromDate);
                while (loop <= toDate) {
                    Datearray.push({ "code": moment(loop).format('DD-MM-YYYY'), "desc": moment(loop).format('ddd') })
                    let newDate = loop.setDate(loop.getDate() + 1);
                    loop = new Date(newDate);
                }
                let locationarray = []
                for (let e of resp.data['LOCATION']) {
                    let Daterange = {}
                    for (let c of Datearray) {
                        const checksales = (obj) => {
                            if (obj.description === e.description && Date.parse(obj.SalesDate) === Date.parse(c.code)) {
                                return true
                            } else { return false }
                        };
                        if (response.data.some(checksales)) {
                            Daterange = { ...Daterange, [c.desc]: true }
                        }
                        else {
                            Daterange = { ...Daterange, [c.desc]: false }
                        }
                    }
                    locationarray.push({ ...Daterange, outlet: e.description, id: e.code, key: e.code })
                }
                setuniqueSalesData(locationarray)
            })
        }).catch((error) => {
            console.log(error)
        }).finally()

    }, [])

    useEffect(() => {
        getDashBoardData();
    }, [getDashBoardData, refresh]);


    return (
        <div>
            <div className="content-page pr-0">
                <div className="content">

                    <div className="row">
                        <div className="row col-12">
                            <div className="col">
                                <h5 className="page-title pt-0 pl-2">Sales Dashboard</h5>
                            </div>
                            <div className="col-3 pt-2">
                                <div className="form-group">
                                    Last updated :<span className="text-dark"> 01 Jun 2022:14.30</span></div>
                            </div>
                            <div className="col-4 pt-1">
                                <div className="form-group form-inline">
                                    Date Range
                                    <DateRangePicker
                                        initialSettings={{
                                            startDate: moment().subtract(90, 'day').toDate(), endDate: moment(),
                                            linkedCalendars: true, showCustomRangeLabel: true,
                                            showDropdowns: true, alwaysShowCalendars: true,
                                            locale: { format: "DD/MM/YYYY" },
                                            maxDate: moment(),
                                            opens: 'left'
                                        }}
                                        onApply={handleDateRangeChange}
                                    >
                                        <input className='form-control border-0 ml-1 pl-3 cursor-pointer' />
                                    </DateRangePicker>
                                </div>
                            </div>

                            <div className="col pt-2">
                                MIS <i className="mdi mdi-chevron-right"></i> Sales dashboard
                            </div>

                        </div>
                    </div>

                    <div className="row p-0">
                        <div className="tab-content p-0 col-12">
                            <div className="tab-pane show active" id="home1">
                                <header className="page-header page-header-dark bg-gradient-primary-to-secondary pb-10 mheight">
                                    <div className="container-xl px-4">
                                        <div className="page-header-content pt-4">
                                            <div className="row align-items-center justify-content-between">
                                                <div className="col-auto mt-1">
                                                    <h2 className="page-header-title text-white">
                                                        Sales Dashboard
                                                    </h2>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </header>
                                <div className="pt-2">
                                    <div className="row my-n10 px-3">
                                        {hideChart.totalProspect === "show" && <Snippet data={{
                                            count: totalProspect,
                                            title: "Total Prospect",
                                            viewDetails: true,
                                            classDetails: "col-2 mb-4 wow slideInLeft",
                                            viewDetailsData: {
                                                headerName: "Total Prospect - " + totalProspect,
                                            },
                                            type: "TRIPLE",
                                            url: properties.DASHBOARD_API + "/salesDashboardDetails",
                                            method: "POST",
                                            requestBody: { type: "PROSPECT", startDate: dateRange.startDate.split("-").reverse().join("-"), endDate: dateRange.endDate.split("-").reverse().join("-") },

                                        }}
                                        />}
                                        {hideChart.totalnewCustomer === "show" && <Snippet data={{
                                            count: totalNewCustomer,
                                            title: "Total New Customers",
                                            viewDetails: true,
                                            classDetails: "col-2 mb-4 wow slideInLeft",
                                            viewDetailsData: {
                                                headerName: "Total New Customers - " + totalNewCustomer,
                                            },
                                            type: "TRIPLE",
                                            url: properties.DASHBOARD_API + "/salesDashboardDetails",
                                            method: "POST",
                                            requestBody: { type: "NEWCUSTOMERS", startDate: dateRange.startDate.split("-").reverse().join("-"), endDate: dateRange.endDate.split("-").reverse().join("-") },
                                        }}
                                        />}
                                        {hideChart.openOpportunities === "show" && <Snippet data={{
                                            count: openOpportunities,
                                            title: "Open Opportunities",
                                            viewDetails: true,
                                            classDetails: "col-2 mb-4 wow slideInLeft",
                                            viewDetailsData: {
                                                headerName: "Open Opportunities - " + openOpportunities,
                                            },
                                            url: properties.DASHBOARD_API + "/salesDashboardDetails",
                                            method: "POST",
                                            requestBody: { type: "OPENOPPORTUNITIES", startDate: dateRange.startDate.split("-").reverse().join("-"), endDate: dateRange.endDate.split("-").reverse().join("-") },
                                            type: "TRIPLE",
                                        }}
                                        />}
                                        {hideChart.chrunRate === "show" && <Snippet data={{
                                            count: churnedRate + "%",
                                            classDetails: "col-2 mb-4 wow slideInLeft",
                                            title: "Churn Rate"
                                        }}
                                        />}
                                        {hideChart.netPromoterShow === "show" && <Snippet data={{
                                            count: "0%",
                                            title: "Net Promoter Score",
                                            viewDetails: false,
                                            classDetails: "col-2 mb-4 wow slideInLeft",
                                            viewDetailsData: {
                                                headerName: "Net Promoter Score - 56.05%",
                                            },
                                            url: properties.DASHBOARD_API + "/salesDashboardDetails",
                                            method: "POST",
                                            requestBody: { type: "NETPROMOTERSCores", startDate: dateRange.startDate.split("-").reverse().join("-"), endDate: dateRange.endDate.split("-").reverse().join("-") },
                                            type: "SINGLE",
                                        }}
                                        />}
                                        {hideChart.arpu === "show" && <Snippet data={{
                                            count: arpu,
                                            title: "ARPU",
                                            classDetails: "col-2 mb-4 wow slideInLeft"
                                        }}
                                        />}
                                    </div>
                                </div>
                                <div className="row pt-5">

                                </div>
                            </div>
                            <div className="mt-1">
                                <div className="col-12">
                                    <div className="search-result-box  p-0">
                                        <div className="autoheight p-1">
                                            <h4>Key Metrics</h4>
                                            <div className="row pl-0">
                                                {hideChart.targetVsArchievement === "show" && <div className="col-6 pb-2" >
                                                    <div className="card autoheight wow fadeInUp" style={{"minHeight":"340px"}}>
                                                        <div className="card-body text-center">

                                                            <h5 className="header-title mb-2 text-center">Target VS
                                                                achievements</h5>
                                                            <div className="col-12 text-center pt-2">
                                                                {archiveTarget && <VerticalBarChart
                                                                    data={
                                                                        {
                                                                            height: "300%",
                                                                            xAxisData: [
                                                                                {
                                                                                    type: 'category',
                                                                                    data: archiveTarget.agent || []
                                                                                }
                                                                            ],
                                                                            yAxisData: [
                                                                                {
                                                                                    type: 'value'
                                                                                }],
                                                                            seriesData: [{
                                                                                name: 'Achievement',
                                                                                type: 'bar',
                                                                                label: {
                                                                                    show: true
                                                                                },
                                                                                data: archiveTarget.achievement || [],
                                                                            },
                                                                            {
                                                                                name: 'Target',
                                                                                type: 'bar',
                                                                                label: {
                                                                                    show: true
                                                                                },
                                                                                data: archiveTarget.target || [],
                                                                            }
                                                                            ],
                                                                            toolbox: {
                                                                                feature: {
                                                                                    magicType: { show: true, type: ['line', 'bar'] },
                                                                                    saveAsImage: { show: true },
                                                                                    dataView: { show: true, readOnly: false },
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>}
                                                {hideChart.wonvsLost === "show" && <div className="col-6 pb-2" >
                                                    <div className="card autoheight" style={{"minHeight":"340px"}}>
                                                        <div className="card-body text-center">

                                                            <h5 className="header-title mb-2 text-center">Won VS Lost
                                                                Customers</h5>
                                                            <div className="col-12 text-center pt-2">
                                                                {console.log('wonvsLostDetails', wonvsLostDetails?.source)}
                                                                {wonvsLostDetails && <HorizontalBarChart
                                                                    data={{
                                                                        xAxisData: {
                                                                            type: 'value',
                                                                            boundaryGap: [0, 0.01]
                                                                        },
                                                                        tooltip: {
                                                                            trigger: 'axis',
                                                                            axisPointer: {
                                                                                type: 'shadow'
                                                                            }
                                                                        },
                                                                        legend: {},
                                                                        yAxisData: {
                                                                            type: 'category',
                                                                            data: wonvsLostDetails?.source || []
                                                                          },
                                                                        seriesData: [
                                                                            {
                                                                                name: 'Won',
                                                                                type: 'bar',
                                                                                data: wonvsLostDetails?.won || []
                                                                            },
                                                                            {
                                                                                name: 'Lost',
                                                                                type: 'bar', 
                                                                                data: wonvsLostDetails?.lost || []
                                                                            }
                                                                        ]
                                                                    }}
                                                                />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>}
                                                {hideChart.ZeroCross === "show" && <div className="col-4 pb-2" >
                                                    <div className="card autoheight" style={{"minHeight":"340px"}}>
                                                        <div className="card-body">
                                                            <h5 className="header-title mb-2 text-center">Zero
                                                                Gross<br />Outlets</h5>
                                                            <div className="col-12 text-center pt-2 data-scroll1">
                                                                <h2 className="text-center card-value">{salesZeroGrossOutlet?.length || 0}</h2>
                                                                <CustomTable
                                                                    data={{
                                                                        rows: salesZeroGrossOutlet
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>}
                                                {hideChart.revenue === "show" && <div className="col-4 pb-2" >
                                                    <div className="card autoheight" style={{"minHeight":"340px"}}>
                                                        <div className="card-body text-center">
                                                            <h5 className="header-title mb-2 text-center">Percentage of
                                                                revenue from new VS existing customers</h5>
                                                            <div className="col-12 text-center pt-2">
                                                                {revenueData && <> <h2 className="text-center card-value">{isNaN(revenueData[0].newRevenuePercentage) ? 0 : revenueData[0].newRevenuePercentage}%</h2>
                                                                    <PieChart
                                                                        data={{
                                                                            seriesData: [{
                                                                                name: 'Revenue',
                                                                                type: 'pie',

                                                                                radius: ['40%', '70%'],
                                                                                avoidLabelOverlap: false,
                                                                                label: {
                                                                                    show: false,
                                                                                    position: 'center'
                                                                                },
                                                                                emphasis: {
                                                                                    label: {
                                                                                        show: true,
                                                                                        fontSize: '15',
                                                                                        fontWeight: 'bold'
                                                                                    }
                                                                                },
                                                                                labelLine: {
                                                                                    show: false
                                                                                },

                                                                                label: {
                                                                                    position: 'left',
                                                                                    alignTo: 'none',
                                                                                    bleedMargin: 0
                                                                                },

                                                                                data: revenueData[1]?.revenueChartData
                                                                            }],
                                                                            legend: {
                                                                                top: '5%',
                                                                                left: 'center'
                                                                            }
                                                                        }
                                                                        }

                                                                    /></>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>}
                                                {hideChart.monthGrowth === "show" && <div className="col-4 pb-2" >
                                                    <div className="card autoheight" style={{"minHeight":"340px"}}>
                                                        <div className="card-body text-center">
                                                            <h5 className="header-title mb-2 text-center">Month on Month
                                                                Growth</h5>
                                                            <div className="col-12 text-center pt-2">
                                                                {monthSales && <VerticalBarChart
                                                                    data={{
                                                                        height: "400%",
                                                                        xAxisData: [
                                                                            {
                                                                                type: 'category',
                                                                                data: monthSales.month
                                                                            }
                                                                        ],
                                                                        yAxisData: [
                                                                            {
                                                                                type: 'value'
                                                                            }],
                                                                        seriesData: [
                                                                            {
                                                                                name: 'Product',
                                                                                type: 'bar',
                                                                                barWidth: 10,
                                                                                emphasis: {
                                                                                    focus: 'series'
                                                                                },
                                                                                data: monthSales.count
                                                                            },
                                                                        ],
                                                                        toolbox: {}
                                                                    }}
                                                                />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>}
                                            </div>
                                            <div className="row pl-2 pb-3">
                                                {hideChart.uniqueSale === "show" && <div className="col-6 px-2">
                                                    <div className="card autoheight" style={{"minHeight":"340px"}}>
                                                        <div className="card-body" dir="ltr">

                                                            <h5 className="header-title mb-2 text-center">Unique Sales
                                                                Units</h5>
                                                            <h2 className="text-center card-value">{isNaN(uniqueSalesData?.length) ? 0 : uniqueSalesData?.length}</h2>

                                                            <div id="cardCollpase1" className="collapse pt-1 show">
                                                                <div className="float-right row pr-2 pb-2">
                                                                    <div
                                                                        className="avatar-xs bg-danger rounded-circle pr-1">
                                                                    </div>
                                                                    <div> Nill Sales</div>
                                                                </div>
                                                                <div className="text-left data-scroll1">
                                                                    {uniqueSalesData && <CustomTableIcons
                                                                        data={{
                                                                            rows: uniqueSalesData
                                                                        }}
                                                                    />}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>}
                                                {hideChart.customerChrun === "show" && <div className="col-6 px-2">
                                                    <div className="card autoheight">
                                                        <div className="card-body" dir="ltr">
                                                            <div className="row col-12">
                                                                <div className="col-12 text-center pb-1">
                                                                    <h5 className="header-title mb-2 text-center">
                                                                        Customer Churn</h5>
                                                                </div>
                                                                <div className="col-12 text-center px-2">
                                                                    {customerChurn && <> <h2 className="text-center card-value">{customerChurn.customerChurnPercentage || 0}%</h2>
                                                                        <VerticalBarChart
                                                                            data={{
                                                                                height: "420px",
                                                                                xAxisData: [
                                                                                    {
                                                                                        type: 'category',
                                                                                        data: customerChurn.customerChurnMonth || [],
                                                                                    }
                                                                                ],
                                                                                yAxisData: [
                                                                                    {
                                                                                        type: 'value'
                                                                                    }],
                                                                                seriesData: [
                                                                                    {
                                                                                        name: 'Customer',
                                                                                        type: 'bar',
                                                                                        barWidth: 25,
                                                                                        stack: 'Ad',
                                                                                        emphasis: {
                                                                                            focus: 'series'
                                                                                        },
                                                                                        data: customerChurn?.customerData || []
                                                                                    },

                                                                                    {
                                                                                        name: 'Churn',
                                                                                        type: 'bar',
                                                                                        barWidth: 25,
                                                                                        stack: 'Ad',
                                                                                        emphasis: {
                                                                                            focus: 'series'
                                                                                        },
                                                                                        data: customerChurn?.customerChrun || []
                                                                                    }
                                                                                ],
                                                                                toolbox: {}
                                                                            }}
                                                                        /></>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>}
                                            </div>
                                            <div className="row pb-4">
                                                {hideChart.netPromoterScrore === "show" && <div className="col-12">
                                                    <div className="card-box" style={{"minHeight":"340px"}} dir="ltr">
                                                        <h5 className="header-title mb-2 text-center">
                                                            Net promoter score</h5>
                                                        <HorizontalBarChart
                                                            data={{
                                                                tooltip: {
                                                                    trigger: 'axis',
                                                                    axisPointer: {
                                                                        type: 'shadow'
                                                                    }
                                                                },
                                                                legend: {},
                                                                xAxisData: {
                                                                    type: 'value'
                                                                },
                                                                yAxisData: ['Product 1', 'Product 2', 'Product 3'],
                                                                seriesData: [
                                                                    {
                                                                        name: 'Satisfied',
                                                                        type: 'bar',
                                                                        stack: 'total',
                                                                        label: {
                                                                            show: true
                                                                        },
                                                                        emphasis: {
                                                                            focus: 'series'
                                                                        },
                                                                        data: [100, 130, 50]
                                                                    },
                                                                    {
                                                                        name: 'Extremely Satisfied',
                                                                        type: 'bar',
                                                                        stack: 'total',
                                                                        label: {
                                                                            show: true
                                                                        },
                                                                        emphasis: {
                                                                            focus: 'series'
                                                                        },
                                                                        data: [560, 710, 80]
                                                                    },
                                                                    {
                                                                        name: 'Neutral',
                                                                        type: 'bar',
                                                                        stack: 'total',
                                                                        label: {
                                                                            show: true
                                                                        },
                                                                        emphasis: {
                                                                            focus: 'series'
                                                                        },
                                                                        data: [100, 40, 70]
                                                                    },
                                                                    {
                                                                        name: 'Unsatisfied',
                                                                        type: 'bar',
                                                                        stack: 'total',
                                                                        label: {
                                                                            show: true
                                                                        },
                                                                        emphasis: {
                                                                            focus: 'series'
                                                                        },
                                                                        data: [200, 20, 100]
                                                                    },
                                                                    {
                                                                        name: 'Extremely Unsatisfied',
                                                                        type: 'bar',
                                                                        barWidth: '30',
                                                                        stack: 'total',
                                                                        label: {
                                                                            show: true
                                                                        },
                                                                        emphasis: {
                                                                            focus: 'series'
                                                                        },
                                                                        data: [40, 100, 700]
                                                                    }
                                                                ]
                                                            }}
                                                        />
                                                    </div>
                                                </div>}
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
    )
}

export default SalesDashboardNew;