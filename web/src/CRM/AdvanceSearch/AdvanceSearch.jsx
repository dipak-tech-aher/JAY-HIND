import React,{ useEffect, useState, useCallback } from 'react'
import CustomerAdvanceSearch from './CustomerAdvanceSearch'
import AccountAdvanceSearch from './AccountAdvanceSearch'
import ServiceAdvanceSearch from './ServiceAdvanceSearch'
import OrderAdvanceSearch from './OrderAdvanceSearch'
import InteractionAdvanceSearch from './InteractionAdvanceSearch'
const AdvanceSearch = (props) => {

    const tabs = [
        {
            name: 'Customer',
            index: 0
        },
        // {
        //     name: 'Account',
        //     index: 1
        // },
        // {
        //     name: 'Service',
        //     index: 2
        // },
        {
            name: 'Interaction',
            index: 1
        },
        // {
        //     name: 'Helpdesk',
        //     index: 4
        // },
        {
            name: 'Order',
            index: 2
        },
        // {
        //     name: 'Sale Order',
        //     index: 6
        // },
        // {
        //     name: 'Contract',
        //     index: 7
        // },
        // {
        //     name: 'Invoice',
        //     index: 8
        // }
    ];

    const [activeTab, setActiveTab] = useState(tabs[0]);

    const handleOnTabChange = useCallback((selectedTab) => {
        setActiveTab(selectedTab);
    }, [])

    return(
        <div className="top-header-nav-sect">
            <div className="pt-2 top-info-sect">
                <div className="row pg-title col-12">
                    <div className="col-3">
                        <h5 className="page-title pt-2 pl-2">Advanced Search</h5>
                    </div>								
                </div>
                <div className="col-12 db-list">                   
                    <ul className="">
                        {
                            tabs.map((tab, index) => (
                                <li key={tab.name} className="nav-item">
                                    <button className={`list-dashboard ${activeTab.index === index ? 'db-list-active' : ''}`} onClick={() => handleOnTabChange(tab)}>
                                        <span className="db-title">{tab.name}</span>
                                    </button>                                    
                                </li>
                            ))
                        }
                    </ul>               
                </div>

                <div className="tab-content p-0">
                    <div className="tab-pane active" id={activeTab.name}>
                        {
                            activeTab?.index === 0 ?
                                <CustomerAdvanceSearch/>
                            : activeTab?.index === 1 ?
                                <InteractionAdvanceSearch/> 
                            : activeTab?.index === 2 ?
                                <OrderAdvanceSearch/>  
                            : activeTab?.index === 3 ?
                                <CustomerAdvanceSearch/>
                            : activeTab?.index === 4 ?
                                <CustomerAdvanceSearch/>
                            : activeTab?.index === 5 ?
                                <CustomerAdvanceSearch/>
                            : activeTab?.index === 6 ?
                                <CustomerAdvanceSearch/>
                            : activeTab?.index === 7 ?
                                <CustomerAdvanceSearch/>
                            : activeTab?.index === 8 ?
                                <CustomerAdvanceSearch/>
                            :<></>
                        }
                    </div>
                </div>
            </div> 
        </div>                        
    )
}

export default AdvanceSearch