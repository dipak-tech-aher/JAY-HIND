import React, { useEffect, useState } from 'react';
//import { MasterTicketList } from './MasterTicketList';

import { properties } from '../../../properties';
import { post } from '../../../common/util/restUtil';
import CreateEditMasterTicket from './CreateEditMasterTicket';
import MasterTicketList from './MasterTicketList';

const MasterTicket = (props) => {
    const [quickLinks, setQuickLinks] = useState([{}])
    const [isQuickLinkEnabled, setIsQuickLinkEnabled] = useState(false)
    const [activeTab, setActiveTab] = useState('get-master-ticket-list')
    const [intialValue, setIntialValue] = useState({
        mstIntxnId: '',
        mode: 'ADD'
    })

    const handleTabChange = (name) => {
        setActiveTab(name)
    }

    useEffect(() => {
        const requestBody = {
            screenName: "Create Master Tickets",
            moduleName: "Helpdesk 360"
        }
        
        post(properties.MAINMENU_API + '/getQuickLinks', requestBody)
            .then((response) => {
                setQuickLinks(response.data[0]?.links?.QuickLinks)
            })
            .catch((error) => {
                console.error("error", error)
            })
            .finally()
        setActiveTab("get-master-ticket-list")

    }, [])



    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col">
                    <div className="page-title-box">
                        <h4 className="page-title text-capitalize">Master Tickets</h4>
                    </div>
                </div>
                <div className="form-inline pr-5">
                    <span className="ml-1" >Quick Link</span>
                    <div className="switchToggle ml-1">
                        <input type="checkbox" id="quickLink" checked={isQuickLinkEnabled} onChange={() => {
                            setIsQuickLinkEnabled(!isQuickLinkEnabled)
                        }} />
                        <label htmlFor="quickLink">Toggle</label>
                    </div>
                </div>
            </div>
            <div className="row mt-1">
                <div className="col-lg-12 row">
                    <div className={isQuickLinkEnabled ? "col-lg-10 pl-0 pr-0" : "col-lg-12 pl-0 pr-0"}>
                        <div className="search-result-box m-t-30 card-box">
                            {
                                (() => {
                                    switch (activeTab) {
                                        case 'create-master-ticket':
                                            return (
                                                <CreateEditMasterTicket
                                                    data={{
                                                        intialValue
                                                    }}
                                                />
                                            )
                                        case 'get-master-ticket-list':
                                            return (
                                                <MasterTicketList
                                                    data={{
                                                        intialValue
                                                    }}
                                                    handler={{
                                                        setActiveTab,
                                                        setIntialValue
                                                    }}
                                                />
                                            )
                                        default:
                                            return (
                                                <MasterTicketList
                                                    data={{
                                                        intialValue
                                                    }}
                                                    handler={{
                                                        setActiveTab,
                                                        setIntialValue
                                                    }}
                                                />
                                            )
                                    }
                                })()
                            }
                        </div>
                    </div>
                    {isQuickLinkEnabled && <div className="col-lg-2">
                        <div className="card p-2">
                            <div className="title-box show">
                                <ul className="nav flex-column">
                                    {
                                        quickLinks && quickLinks.map((e) => {

                                            // eslint-disable-next-line jsx-a11y/anchor-is-valid
                                            return (<li className="nav-item"><a className={`nav-link list-group-item list-group-item-action }`} onClick={() => { handleTabChange(e.id) }}>{e.name}</a>
                                            </li>)
                                        })
                                    }
                                </ul>
                            </div>
                        </div>
                    </div>}
                </div>
            </div>

        </div >
    );
}

export default MasterTicket;