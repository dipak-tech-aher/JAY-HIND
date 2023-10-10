/* eslint-disable jsx-a11y/anchor-is-valid */
import moment from "moment";
import React, { useCallback, useContext, useEffect, useState } from "react";
import ReactSelect from "react-select";
import { OpsDashboardContext } from "../../../AppContext";
import { post } from "../../../common/util/restUtil";
import { properties } from "../../../properties";
import FilterComponent from "../../components/FilterComponent";
import TopPerformance from "./TopPerformance";
import { unstable_batchedUpdates } from "react-dom";
import { statusConstantCode } from "../../../AppConstants";

const TopFivePerformer = (props) => {
    const [isRefresh, setIsRefresh] = useState(false);
    const [filtering, setFiltering] = useState(false);
    const [showFilter, setShowFilter] = useState(false)
    const [entityType, setEntityType] = useState('Interaction')
    const { data, handlers } = useContext(OpsDashboardContext);
    const { meOrMyTeam, lastDataRefreshTime, currentTime, isPageRefresh } = data;
    const { setLastDataRefreshTime, setCurrentTime } = handlers;
    const [performer, setPerformer] = useState([])
    const [searchParams, setSearchParams] = useState({
        entityName: "Interaction",
        fromDate: moment().startOf('month').format("YYYY-MM-DD"),
        toDate: moment().endOf('month').format("YYYY-MM-DD"),
        limit: 5
    })
    const [lastUpdatedAt, setLastUpdatedAt] = useState(moment())
    const entityTypes = statusConstantCode?.topPerformanceActivity

    // const performanceActivitySettings = {
    //     dots: false,
    //     infinite: true,
    //     arrows: true,
    //     speed: 500,
    //     slidesToShow: 1,
    //     slidesToScroll: 1,
    //     initialSlide: 0,
    //     autoplay: true,
    //     autoplaySpeed: 5000,
    //     responsive: [
    //         {
    //             breakpoint: 1024,
    //             settings: {
    //                 slidesToShow: 1,
    //                 slidesToScroll: 1,
    //                 infinite: true,
    //                 dots: false
    //             }
    //         },
    //         {
    //             breakpoint: 600,
    //             settings: {
    //                 slidesToShow: 1,
    //                 slidesToScroll: 1,
    //                 initialSlide: 1
    //             }
    //         },
    //         {
    //             breakpoint: 480,
    //             settings: {
    //                 slidesToShow: 1,
    //                 slidesToScroll: 1
    //             }
    //         }
    //     ]
    // };

    const getinformativeDetails = () => {
        const intxnHandlingAPI = `${properties.INTERACTION_API}/get-topfive-performer`
        let searchParamss = {
            ...searchParams,
        }

        post(intxnHandlingAPI, {
            "searchParams": searchParamss,
        }).then((res) => {
            if (res?.data) {
                const rows = res?.data?.rows.length > 0 ? res?.data?.rows : []
                // const statusGroupedDetails = groupBy(rows, 'oUserDesc');

                const yAxisData = [], xAxisData = []
                rows.filter((r) => {
                    // console.log(r.oEntity , entityType)
                    if (r.oEntity === entityType) {
                        yAxisData.push(r.oTotalCnt)
                        xAxisData.push(r.oUserDesc)
                    }
                })
                
                setCurrentTime(moment().format('DD-MM-YYYY HH:mm:ss'))
                setLastDataRefreshTime({ ...lastDataRefreshTime, performanceActivity: moment().format('DD-MM-YYYY HH:mm:ss') })
                setPerformer([{ yAxisData, xAxisData }])

            }
            unstable_batchedUpdates(() => {
                if (meOrMyTeam === 'Me') {
                    setLastDataRefreshTime({ ...lastDataRefreshTime, TopFivePerformer: moment().format('DD-MM-YYYY HH:mm:ss') })
                } else {
                    setLastDataRefreshTime({ ...lastDataRefreshTime, TopFivePerformerTeam: moment().format('DD-MM-YYYY HH:mm:ss') })
                }
            })
        }).catch((error) => {
            console.log(error)

        }).finally(() => { })
    }


    useEffect(() => {
        // console.log('entityTypeentityType ', entityType)
        getinformativeDetails()
    }, [isRefresh, meOrMyTeam, entityType, isPageRefresh, searchParams]);

    useEffect(() => {
        if (filtering) {
            getinformativeDetails()
        }
    }, [filtering, getinformativeDetails])


//     const entityTypes = [{
//         label: "Interaction",
//         value: "Interaction"
//     }, {
//         label: "Order",
//         value: "Order"
//     }
// ]


    useEffect(() => {
        const interval = setInterval(() => setLastUpdatedAt(moment(meOrMyTeam === 'Me' ? lastDataRefreshTime?.TopFivePerformer : lastDataRefreshTime?.TopFivePerformerTeam, "DD-MM-YYYY HH:mm:ss")), 60 * 1000);
        return () => clearInterval(interval);
    }, [lastDataRefreshTime]);


    return (
        <div className="cmmn-skeleton">
            <div className="skel-dashboard-title-base">
                <span className="skel-header-title">Top Performance Activity</span>
                <ReactSelect
                    className="skel-cust-graph-select"
                    options={entityTypes}
                    menuPortalTarget={document.body} 
                     styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}                    
                    value={entityType ? entityTypes.find(c => c.value === entityType) : null}
                    onChange={(val) =>
                        {
                            // console.log('val is ',val.value)
                            setEntityType(val.value)
                        }     
                        
                    }
                />
                <div className="skel-dashboards-icons">
                    {/* <a><i className="material-icons" onClick={() => { setShowFilter(!showFilter) }}>filter</i></a> */}
                    {/* <a><i className="material-icons">fullscreen</i></a> */}
                    <a><i className="material-icons" onClick={() => setIsRefresh(!isRefresh)}>refresh</i></a>
                    {/* <FilterComponent
                        data={{
                            filtering
                            // ,componentName: 'SELF'
                        }}
                        handlers={{
                            setSearchParams,
                            setFiltering
                        }}
                    /> */}
                </div>
            </div>
            <hr className="cmmn-hline" />
            <div className="skel-perf-sect">
                <div className="skel-perf-data j-center">
                </div>
                <div className="skel-perf-graph">
                    <TopPerformance
                        data={{
                            chartData: performer,
                            entity: entityType
                        }}
                    />
                </div>
            </div>
            <hr className="cmmn-hline" />
            <div className="skel-refresh-info">
                <span><i className="material-icons">refresh</i> Updated {moment(lastUpdatedAt).fromNow()}</span>
            </div>
        </div>
    )
}

export default TopFivePerformer;