/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import CreateCatalog from './NewCatalog/createCatalog';
import CreatePlan from './Plan/createPlan';
import CreateService from './Service/createService';
import CreateAsset from './Asset/CreateAsset';
import CreateAddon from './Addon/CreateAddon';
import { properties } from "../properties";
import { post } from "../common/util/restUtil";

import { unstable_batchedUpdates } from 'react-dom';


const CreateNewCatalog = (props) => {

    const [isQuickLinkEnabled, setIsQuickLinkEnabled] = useState(false)
    const [quickLinks, setQuickLinks] = useState([{}])
    const [screenName, setScreenName] = useState()

    const [activeTab, setActiveTab] = useState('')
    useEffect(() => {
        if (props?.location?.data && props?.location?.data?.sourceName !== undefined && props?.location?.data?.sourceName !== null) {
            sessionStorage.setItem('tabName', props?.location?.data?.sourceName || null)
        }
        let type = sessionStorage.getItem('tabName')
        unstable_batchedUpdates(() => {
            setActiveTab(type)
            setScreenName(type)
        })
    }, [props])

    const handleTabChange = (name) => {
        unstable_batchedUpdates(() => {
            setActiveTab(name)
            setScreenName(name)
        })
        sessionStorage.setItem('tabName', name || null)
    }

    useEffect(() => {
        if (screenName !== null && screenName !== undefined) {
            const requestBody = {
                screenName: screenName.charAt(0).toUpperCase() + screenName.slice(1),
                moduleName: "Create Catalog"
            }
            
            post(properties.MAINMENU_API + '/getQuickLinks', requestBody)
                .then((response) => {
                    setQuickLinks(response.data[0].links.QuickLinks)
                })
                .catch((error) => {
                    console.log("error", error)
                })
                .finally()
        }
    }, [screenName])

    return (
        <>
            <div className="row">
                <div className="col-12 row">
                    <div className="col">
                        <div className="page-title-box">
                            <h4 className="page-title text-capitalize">{activeTab}</h4>
                        </div>
                    </div>
                    <div className="form-inline pr-3">
                        <span className="ml-1" >Quick Link</span>
                        <div className="switchToggle ml-1">
                            <input type="checkbox" id="quickLink" checked={isQuickLinkEnabled} onChange={() => {
                                setIsQuickLinkEnabled(!isQuickLinkEnabled)
                            }} />
                            <label htmlFor="quickLink">Toggle</label>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row mt-1">
                <div className="col-lg-12 row">
                    <div className={isQuickLinkEnabled ? "col-lg-10 pl-0 pr-0" : "col-lg-12 pl-0 pr-0"}>
                        <div className="search-result-box m-t-30 card-box">
                            {(() => {
                                switch (activeTab) {
                                    case 'catalog':
                                        return <CreateCatalog />
                                    case 'plan':
                                        return (<CreatePlan></CreatePlan>);
                                    case 'service':
                                        return (<CreateService></CreateService>);
                                    case 'asset':
                                        return <CreateAsset />
                                    case 'addon':
                                        return <CreateAddon />
                                    default:
                                        return (<></>);
                                }
                            })()}
                        </div>
                    </div>
                    {isQuickLinkEnabled && <div className="col-lg-2">
                        <div className="card p-2">
                            <div className="title-box show">
                                <h5 className="menu-title">Quick Links</h5>
                                <ul className="nav flex-column">
                                    {
                                        quickLinks && quickLinks.map((e) => {

                                            return (
                                                <li className="nav-item">
                                                    <a className={`nav-link list-group-item list-group-item-action ${activeTab === e.tabId ? 'active' : ''}`} onClick={() => { handleTabChange(e.tabId) }}>{e.name}</a>
                                                </li>
                                            )
                                        })
                                    }
                                    {/* <li className="nav-item">
                                        <a className={`nav-link list-group-item list-group-item-action ${activeTab === 'catalog' ? 'active' : ''}`} onClick={() => { handleTabChange('catalog') }}>Catalog</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className={`nav-link list-group-item list-group-item-action ${activeTab === 'plan' ? 'active' : ''}`} onClick={() => { handleTabChange('plan') }}>Plan</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className={`nav-link list-group-item list-group-item-action ${activeTab === 'service' ? 'active' : ''}`} onClick={() => { handleTabChange('service') }}>Service</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className={`nav-link list-group-item list-group-item-action ${activeTab === 'addon' ? 'active' : ''}`} onClick={() => { handleTabChange('addon') }}>Addons</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className={`nav-link list-group-item list-group-item-action ${activeTab === 'asset' ? 'active' : ''}`} onClick={() => { handleTabChange('asset') }}>Asset</a>
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

export default CreateNewCatalog;