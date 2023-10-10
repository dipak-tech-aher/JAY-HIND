/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useCallback, useEffect, useState } from 'react';

import { properties } from '../../../properties';
import { get } from '../../../common/util/restUtil';
import ViewChildTickets from './ViewChildTickets';
import ViewTicketDetails from './ViewTicketDetails';

const ViewMasterTickets = (props) => {
    const { headerName, masterTicketData } = props.data
    const [tabMenu, setTabMenu] = useState(
        [{ title: "Ticket Details", id: "ticketDetails" },
        { title: "Child Tickets", id: "childTickets" }])
    const [isActive, setIsActive] = useState("ticketDetails")
    const [ticketDetails, setTicketDetails] = useState()


    const showtab = (selectedMenuId) => {
        setIsActive(selectedMenuId)
    }

    const getTicketDetails = useCallback(() => {
        if (masterTicketData?.mstIntxnId !== '' && masterTicketData?.mstIntxnId !== undefined) {
            
            get(`${properties.INTERACTION_API}/master-tickets/${masterTicketData?.mstIntxnId}`)
                .then((response) => {
                    if (response.data) {
                        const { data } = response
                        setTicketDetails(data)
                    }
                })
                .catch(error => {
                    console.error(error)
                })
                .finally()
        }
    }, [masterTicketData?.mstIntxnId])

    useEffect(() => {
        getTicketDetails()
    }, [getTicketDetails])

    return (
        <div className="col-lg-12">
            <div>
                <div className="card-body">
                    <div className="modal-header">
                        <h5>{headerName}</h5>
                    </div>
                    <div className="card-box">
                        <ul className="nav nav-tabs">
                            {tabMenu.map((menu, i) => (
                                <li key={i} className="nav-item">
                                    <a id="TabList" onClick={() => showtab(menu.id)} to="#" data-toggle="tab" aria-expanded="true" className={"nav-link" + (isActive === menu.id ? ' active' : '')}>{menu.title}</a>
                                </li>
                            ))}
                        </ul>
                        <div className="col-12 admin-user">
                            {(() => {
                                switch (isActive) {
                                    case tabMenu[0].id:
                                        return (<>
                                            <ViewTicketDetails
                                                data={{
                                                    ticketDetails
                                                }} />
                                        </>)
                                    case tabMenu[1].id:
                                        return (<>
                                            <div className="card-body" id="datatable">
                                                <ViewChildTickets
                                                    data={{
                                                        masterTicketData
                                                    }} />
                                            </div>
                                        </>)
                                    default:
                                        return (<>
                                            <div className="card-body" id="datatable">

                                                <ViewTicketDetails
                                                    data={{
                                                        masterTicketData
                                                    }}
                                                />
                                            </div>

                                        </>)
                                            ;
                                }
                            })()}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
export default ViewMasterTickets