/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
import CreateEmailList from './Email/CreateEmailList';
import EmailList from './Email/EmailList';
import CreateWhatsappGroup from './Whatsapp/CreateNewWhatsappGroup';
import WhatsappGroupList from './Whatsapp/WhatsappGroupList';
import CreateFacebookSettings from './Facebook/CreateFacebookSettings'
import LiveChatSettings from './LiveChat/LivechatSettings'
import CreateInstagramSettings from './Instagram/CreateInstagramSettings'
import { unstable_batchedUpdates } from "react-dom";

import { post } from '../../../common/util/restUtil';
import { properties } from '../../../properties';

const ChannelSettings = (props) => {

    const [activeTab, setActiveTab] = useState()
    // const getActiveTab = props?.location?.state?.data?.ActiveTab
    // const tableRowData = props?.location?.state?.data?.tableRowData
    // const Mode = props?.location?.state?.data?.Mode
    //const whatsappSettingData = props?.location?.state?.data?.whatsappSettingData
    // const emailSettingsData = props?.location?.state?.data?.emailSettingsData

    const [getActiveTab, setGetActiveTab] = useState(props?.location?.state?.data?.ActiveTab || "")
    const [tableRowData, setTableRowData] = useState(props?.location?.state?.data?.tableRowData || "")
    const [whatsappSettingData, setWhatsappSettingData] = useState(props?.location?.state?.data?.whatsappSettingData || "")
    const [emailSettingsData, setEmailSettingsData] = useState(props?.location?.state?.data?.emailSettingsData || "")
    const [Mode, setMode] = useState(props?.location?.state?.data?.Mode)
    const [quickLinks, setQuickLinks] = useState([{}])
    const [isQuickLinkEnabled, setIsQuickLinkEnabled] = useState(true)

    useEffect(() => {
        const requestBody = {
            screenName: "Portal Settings",
            moduleName: "Admin"
        }
        
        post(properties.MAINMENU_API + '/getQuickLinks', requestBody)
            .then((response) => {
                setQuickLinks(response.data[0].links.channelSettings)
            })
            .catch((error) => {
                console.log("error", error)
            })
            .finally()
        setActiveTab("create-email-list")
    }, [])

    const handleTabChange = (name) => {
        unstable_batchedUpdates(() => {
            setGetActiveTab("")
            setTableRowData("")
            setWhatsappSettingData("")
            setEmailSettingsData("")
            setMode("ADD")
            setActiveTab(name)
        })
    }

    useEffect(() => {

        if (getActiveTab !== undefined && getActiveTab !== null && Mode !== undefined && getActiveTab.length > 0) {
            setActiveTab(getActiveTab)
        }
    }, [getActiveTab]);

    return (
        <>
            <div className="row">
                <div className="col">
                    <div className="page-title-box">
                        <h4 className="page-title text-capitalize">Channel Settings</h4>
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
                    <div className={isQuickLinkEnabled ? "col-lg-10 pl-0 pr-0":"col-lg-12 pl-0 pr-0"}>
                        <div className="search-result-box m-t-30 card-box">
                            {
                                (() => {
                                    switch (activeTab) {
                                        case 'create-email-list':
                                            return (
                                                <CreateEmailList
                                                    data={{
                                                        tableRowData,
                                                        Mode,
                                                        emailSettingsData
                                                    }}
                                                />
                                            )
                                        case 'get-email-list':
                                            return (
                                                <EmailList />
                                            )
                                        case 'create-whatsapp-group':
                                            return (
                                                <CreateWhatsappGroup
                                                    data={{
                                                        tableRowData,
                                                        Mode,
                                                        whatsappSettingData
                                                    }}
                                                />
                                            )
                                        case 'get-whatsapp-group-list':
                                            return (
                                                <WhatsappGroupList
                                                />
                                            )
                                        case 'create-facebook-settings':
                                            return (
                                                <CreateFacebookSettings
                                                />
                                            )
                                        case 'create-LiveChat-settings':
                                            return (
                                                <LiveChatSettings />
                                            )
                                        case 'create-instagram-settings':
                                            return (
                                                <CreateInstagramSettings />
                                            )
                                        default:
                                            return (
                                                <CreateEmailList />
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
                                            if (e.hasOwnProperty('sublink') && e.sublink.length > 0) {
                                              return(  <li className="nav-item">
                                                    <a href={'#'+e.id} data-toggle="collapse" className="nav-link list-group-item list-group-item-action"><span className="menu-arrow"></span> <span> {e.name} </span></a>
                                                    <div className="collapse" id={e.id}>
                                                        <ul className="nav-second-level">
                                                            {
                                                                e.sublink.map((s) => (
                                                                    <li className="nav-item">
                                                                        <a className={`nav-link  ${activeTab === s.tabId ? 'active' : ''}`} onClick={() => { handleTabChange(s.tabId) }}>{s.name}</a>
                                                                    </li>
                                                                ))
                                                            }
                                                        </ul>
                                                    </div>
                                                </li>)
                                            }
                                            else {
                                             return( <li className="nav-item"><a className={`nav-link list-group-item list-group-item-action ${activeTab === e.tabId ? 'active' : ''}`} onClick={() => { handleTabChange(e.tabId) }}>{e.name}</a>
                                                </li>)

                                            }
                                        })
                                    }
                                    {/* <li className="nav-item">
                                        <a href="#sidebarDashboards1" data-toggle="collapse" className="nav-link list-group-item list-group-item-action"><span className="menu-arrow"></span> <span> Email Settings </span></a>
                                        <div className="collapse" id="sidebarDashboards1">
                                            <ul className="nav-second-level">
                                                <li className="nav-item">
                                                    <a className={`nav-link  ${activeTab === 'get-email-list' ? 'active' : ''}`} onClick={() => { handleTabChange('get-email-list') }}>Email List</a>
                                                </li>
                                                <li className="nav-item">
                                                    <a className={`nav-link ${activeTab === 'create-email-list' ? 'active' : ''}`} onClick={() => { handleTabChange('create-email-list') }}>Create New</a>
                                                </li>
                                            </ul>
                                        </div>
                                    </li>
                                    <li className="nav-item">
                                        <a href="#sidebarDashboards2" data-toggle="collapse" className="nav-link list-group-item list-group-item-action whatsapp"><span className="menu-arrow"></span> <span> Whatsapp Settings </span></a>
                                        <div className="collapse" id="sidebarDashboards2">
                                            <ul className="nav-second-level">
                                                <li className="nav-item">
                                                    <a className={`nav-link  ${activeTab === 'get-whatsapp-group-list' ? 'active' : ''}`} onClick={() => { handleTabChange('get-whatsapp-group-list') }}>Whatsapp Group List</a>
                                                </li>
                                                <li className="nav-item">
                                                    <a className={`nav-link ${activeTab === 'create-whatsapp-group' ? 'active' : ''}`} onClick={() => { handleTabChange('create-whatsapp-group') }}>Create New</a>
                                                </li>
                                            </ul>
                                        </div>
                                    </li>
                                    <li className="nav-item"><a className={`nav-link list-group-item list-group-item-action ${activeTab === 'create-facebook-settings' ? 'active' : ''}`} onClick={() => { handleTabChange('create-facebook-settings') }}>Facebook Settings</a>
                                    </li>
                                    <li className="nav-item"><a className={`nav-link list-group-item list-group-item-action ${activeTab === 'create-LiveChat-settings' ? 'active' : ''}`} onClick={() => { handleTabChange('create-LiveChat-settings') }}>Live Chat</a>
                                    </li>
                                    <li className="nav-item"><a className={`nav-link list-group-item list-group-item-action ${activeTab === 'create-instagram-settings' ? 'active' : ''}`} onClick={() => { handleTabChange('create-instagram-settings') }}>Instagram Settings</a>
                                    </li> */}
                                </ul>
                            </div>
                        </div>
                    </div>}
                </div>
            </div>
        </>
    )

}

export default ChannelSettings