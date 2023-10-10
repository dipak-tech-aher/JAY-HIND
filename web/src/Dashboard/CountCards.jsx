import React, { useEffect, useState } from 'react';
import { get } from 'react-scroll/modules/mixins/scroller';

import { properties } from '../properties';
import { post } from '../common/util/restUtil';

const CountCards = (props) => {

    const { headSection, bodySection=[] } = props.data
    useEffect(() => {
    }, [])


    return (<>

        <div className="card">
            <div className="card-body">
                <div className="media">
                    <div className="media-body overflow-hidden ">
                        {headSection && <h5 className="header-title">{Object.keys(headSection)[0]} </h5>}

                        <h3 className="mb-0">
                            {headSection && <p>{headSection[Object.keys(headSection)[0]]}</p>}
                            {/* {
                                    total > 0 ? (
                                        <Link to={`${baseURL}?requestType=${interactionTypeText === "REQCOMP" || interactionTypeText === "REQINQ" ? "ticket" : interactionTypeText}&status=${ALL}&selfDept=${selfDept}&fromDate=${dateRange.startDate}&toDate=${dateRange.endDate}`}><p className="cursor-pointer">{total}</p></Link>
                                    ) : (
                                        <p className="cursor-pointer">{total}</p>
                                    )
                                } */}
                        </h3>
                    </div>
                    <div className="text-primary">
                        <i className="fe-layers mr-1 noti-icon"></i>
                    </div>
                </div>
            </div>
            <div className="card-body border-top py-3">
                < div className="row">
                    {bodySection && bodySection.map((e) => {
                        return (
                            < div className="col-4">
                                <div className="text-center">
                                    <p className="mb-2 ">{Object.keys(e)[0]}</p>
                                    <h4 className="text-danger">
                                        {e[Object.keys(e)[0]]}
                                    </h4>
                                </div>
                            </div>)

                    })}
                </div>
            </div>

        </div>

    </>)
}
export default CountCards;
