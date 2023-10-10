import React, { useEffect, useState } from 'react';

import { post } from '../../../common/util/restUtil';
import { properties } from '../../../properties';

const LeftDropdownMenu = (props) => {
    const { setStatusFilter } = props.handlers;
    const [quickLinks, setQuickLinks] = useState([{}])

    useEffect(()=>{
        const requestBody = {
            screenName: "Helpdesk Board",
            moduleName: "Helpdesk"
        }
        
        post(properties.MAINMENU_API + '/getQuickLinks', requestBody)
            .then((response) => {
                setQuickLinks(response.data[0].links.QuickLinks)
            })
            .catch((error) => {
                console.log("error", error)
            })
            .finally()
    },[])

    const handleOnSelection = (e) => {
        setStatusFilter(e.target.closest('.st').name);
    }

    return (
        <ul id="side-menu">
            {
                  quickLinks && quickLinks.map((e)=>{
                    if (e.hasOwnProperty('sublink') && e.sublink.length > 0) { 
                        return (
                            <li className={e.status ==="inActive"?"nav-item menuitem-active disabled d-none":"nav-item menuitem-active"}>
                            <a href="#sidebarDashboards" data-toggle="collapse" className="nav-link list-group-item list-group-item-action">
                                <span className="menu-arrow"></span>
                                <span> {e.name} </span>
                            </a>
                            <div className="collapse show" id="sidebarDashboards">
                                <ul className="nav-second-level">
                               { e.sublink.map((s) => (  
                                    <li className="menuitem-active border">
                                        <a className="active">{s.name} <span className="badge badge-danger rounded-circle noti-icon-badge">{s.tabId}</span></a>
                                    </li>))}
                                </ul>
                            </div>
                        </li>
                        )
                    }
                    else {
                       return( <li className={e.status === "Active" ?"nav-item" :"nav-item disabled d-none"} onClick={handleOnSelection}>
                        <button className={e.status === "Active" ?"nav-link list-group-item list-group-item-action st":"nav-link list-group-item list-group-item-action"} name={e.tabId}>{e.name}</button>
                    </li>)
                    }
                })
            }
            {/* <li className="nav-item menuitem-active disabled d-none">
                <a href="#sidebarDashboards" data-toggle="collapse" className="nav-link list-group-item list-group-item-action">
                    <span className="menu-arrow"></span>
                    <span> Tickets SLA </span>
                </a>
                <div className="collapse show" id="sidebarDashboards">
                    <ul className="nav-second-level">
                        <li className="menuitem-active border">
                            <a className="active">Due Today  <span className="badge badge-danger rounded-circle noti-icon-badge">9</span></a>
                        </li>
                        <li className="menuitem-active">
                            <a className="active">Due in 3 Days <span className="badge badge-danger rounded-circle noti-icon-badge">2</span></a>
                        </li>
                        <li>
                            <a className="active">Due 5 Days <span className="badge badge-danger rounded-circle noti-icon-badge">6</span></a>
                        </li>
                    </ul>
                </div>
            </li>
            <li className="nav-item" onClick={handleOnSelection}>
                <button className="nav-link list-group-item list-group-item-action st" name='CLOSED'>Closed Interactions</button>
            </li>
            <li className="nav-item" onClick={handleOnSelection}>
                <button className="nav-link list-group-item list-group-item-action st" name='HOLD'>Interactions on Hold</button>
            </li>
            <li className="nav-item d-none">
                <button className="nav-link list-group-item list-group-item-action">Overdue Interactions</button>
            </li>
            <li className="nav-item disabled d-none">
                <button className="nav-link list-group-item list-group-item-action"> Interaction by Problem Type</button>
            </li> */}
        </ul>
    )
}

export default LeftDropdownMenu;