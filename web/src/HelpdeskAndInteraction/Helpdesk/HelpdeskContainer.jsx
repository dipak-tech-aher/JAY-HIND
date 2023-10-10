import React, { useState } from 'react';
import Helpdesk from './Helpdesk';
import Interactions from './Interactions/Interactions';

const HelpdeskContainer = (props) => {

    const [activeTab, setActiveTab] = useState(0);

    const handleOnTabChange = (index) => {
        setActiveTab(index);
    }

    return (
        <div className='cutomer-skel cmmn-skeleton col-xl-12 p-0 mt-2'>
            <div className='card-box'>
                <ul className="nav nav-tabs">
                    <li className="nav-item">
                        <button data-target="#helpdesk" role="tab" data-toggle="tab" aria-expanded="true" className={`nav-link ${activeTab === 0 ? 'active' : ''} `} onClick={() => handleOnTabChange(0)}>
                            Help Desk
                        </button>
                    </li>
                    <li className="nav-item">
                        <button data-target="#interactions" role="tab" data-toggle="tab" aria-expanded="true" className={`nav-link ${activeTab === 1 ? 'active' : ''} `} onClick={() => handleOnTabChange(1)}>
                            Interactions
                        </button>
                    </li>
                </ul>
                <div className="tab-content pt-1">
                    <div className={`tab-pane ${activeTab === 0 ? 'active' : ''}  `} id="helpdesk">
                        {
                            activeTab === 0 &&
                            <Helpdesk data={{ props }} />
                        }
                    </div>
                    <div className={`tab-pane ${activeTab === 1 ? 'active' : ''}`} id="interactions">
                        {
                            activeTab === 1 &&
                            <Interactions />
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HelpdeskContainer;