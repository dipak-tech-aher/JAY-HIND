/* eslint-disable jsx-a11y/anchor-is-valid */
import moment from "moment";
import React, { useCallback, useContext, useEffect, useState } from "react";
import ReactSelect from "react-select";
import { OpsDashboardContext, AppContext } from "../../../AppContext";
import { post } from "../../../common/util/restUtil";
import { properties } from "../../../properties";
import TopPerformingCategory from "../CategoryPerformance/TopPerformingCategory";
import { removeEmptyKey } from "../../../common/util/util";

const OverAllPerformance = (props) => {
    const { auth } = useContext(AppContext);
    const [isRefresh, setIsRefresh] = useState(false);
    const [searchParams, setSearchParams] = useState({
        userId: auth?.user?.userId,
        // roleId: auth?.currRoleId,
        // fromDate: moment().startOf('month').format("YYYY-MM-DD"),
        // toDate: moment().endOf('month').format("YYYY-MM-DD")
    });
    const { data, handlers } = useContext(OpsDashboardContext);
    const { meOrMyTeam, lastDataRefreshTime, currentTime, searchParams: globalSearchParams, isPageRefresh } = data;
    const [performer, setPerformer] = useState([])
    const [entityType, setEntityType] = useState('source')

    const getinformativeDetails = useCallback(() => {
        const intxnHandlingAPI = `${properties.INTERACTION_API}/get-team-category-performance`
        let searchParamss = {
            ...searchParams,
        }
        post(intxnHandlingAPI, {
            searchParams: searchParamss,
        }).then((res) => {
            if (res?.data) {
                const rows = res?.data?.rows.length > 0 ? res?.data?.rows : []
                const uniqueRecords = [...new Map(rows.map(item => [item['referenceId'], item])).values()];
                const statusGroupedDetails = groupBy(uniqueRecords, entityType);

                const xAxisData = []
                const seriesData = []
                for (var key in statusGroupedDetails) {
                    if (statusGroupedDetails.hasOwnProperty(key)) {
                        xAxisData.push(key)
                        seriesData.push({
                            value: statusGroupedDetails[key].length,
                            // itemStyle: {
                            //     color: '#6D19DA' // chroma.random().darken().hex()
                            // }
                        })
                    }
                }
                setPerformer([{
                    seriesData: [{
                        data: seriesData, type: 'bar',
                    }], xAxisData
                }])
            }
        }).catch((error) => {
            console.error(error)
        }).finally(() => {
        })

    }, [meOrMyTeam, searchParams, entityType])

    useEffect(() => {
        // console.log(globalSearchParams, "from assign to me component")
        setSearchParams({
            ...searchParams,
            ...globalSearchParams
        });
    }, [globalSearchParams])

    useEffect(() => {
        getinformativeDetails()
    }, [isRefresh, meOrMyTeam, getinformativeDetails, entityType, isPageRefresh]);

    const entityTypes = [{
        label: "Source",
        value: "source"
    }, {
        label: "Service Type",
        value: "serviceType"
    }, {
        label: "Channel",
        value: "channel"
    }]

    /** The function is for grouping object based on "Key"
    * @param {object} items 
    * @param {string} key 
    * @returns {object}
    */
    const groupBy = (items, key) => items.reduce(
        (result, item) => ({
            ...result,
            [item[key]]: [
                ...(result[item[key]] || []),
                item,
            ],
        }),
        {},
    );

    return (
        <div className="cmmn-skeleton">
            <div className="skel-dashboard-title-base">
                <span className="skel-header-title">Team Category Performance</span>
                <ReactSelect
                    className="skel-cust-graph-select"
                    options={entityTypes}

                    menuPortalTarget={document.body}
                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}

                    value={entityType ? entityTypes.find(c => c.value === entityType) : null}
                    onChange={(val) => setEntityType(val.value)}
                />
                <div className="skel-dashboards-icons">
                    <a><i className="material-icons" onClick={() => setIsRefresh(!isRefresh)}>refresh</i></a>
                </div>
            </div>
            <hr className="cmmn-hline" />
            <div className="skel-perf-sect">
                <div className="skel-perf-data j-center">
                </div>
                <div className="skel-perf-graph">
                    <TopPerformingCategory
                        data={{
                            chartData: performer
                        }}
                    />
                </div>
            </div>
            <hr className="cmmn-hline" />
            <div className="skel-refresh-info">
                <span><i className="material-icons">refresh</i> Updated {moment.duration(moment(currentTime, 'DD-MM-YYYY HH:mm:ss').diff(moment(lastDataRefreshTime.performanceActivity, 'DD-MM-YYYY HH:mm:ss')), "minutes").humanize(true)}</span>
            </div>
        </div>
    )
}

export default OverAllPerformance;