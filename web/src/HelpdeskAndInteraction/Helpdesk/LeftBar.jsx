import React, { useState, useEffect } from 'react';

const LeftBar = (props) => {

    const { allList } = props.data;
    const { setStatusFilter } = props.handlers;
    const { setBothPageCountToZero } = props.handlers;

    const [selectedLeftMenuItem, setSelectedLeftMenuItem] = useState('ALL');

    const iconMapping = {
        ALL: {
            class: 'mail-icon',
            icon: 'far fa-list-alt'
        },
        "E-MAIL": {
            class: 'mail-icon',
            icon: 'fas fa-envelope'
        },
        WHATSAPP: {
            class: 'wp-icon',
            icon: 'fab fa-whatsapp'
        },
        TELEGRAM: {
            class: 'wp-icon',
            icon: 'fab fa-telegram'
        },
        SELFCARE: {
            class: 'globe-icon',
            icon: 'fab fa-whatsapp'
        },
        IVR: {
            class: 'ivr-icon',
            icon: 'fas fa-microphone'
        },
        PORTAL: {
            class: 'online-icon',
            icon: 'fas fa-desktop'
        },
        MOBILEAPP: {
            class: 'mob-icon',
            icon: 'fas fa-mobile-alt'
        },
        LIVECHAT: {
            class: 'chat-icon',
            icon: 'mdi mdi-chat-outline'
        },
        SOCIAL: {
            class: 'social-icon',
            icon: 'mdi mdi-share-variant'
        }
    }

    const handleOnSelection = (e) => {
        const { target } = e;
        setStatusFilter(target.closest('.st').id);
        setSelectedLeftMenuItem(target.closest('.st').id)
        setBothPageCountToZero();

    }

    return (
        <div className="blue-bar">
            <div className="p-0">
                <ul>
                    {
                        allList.map((list, idx) => (
                            <li id={list?.source?.code} className={`${iconMapping[list?.source?.description?.replace('-', '')] ? iconMapping[list?.source?.description?.replace('-', '')]['class'] : iconMapping['ALL']['class']} st cursor-pointer ` + ((selectedLeftMenuItem === list?.source?.code) ? 'active' : '')} onClick={handleOnSelection} key={idx}>
                                <div>
                                    <i className={`${iconMapping[list?.source?.description?.replace('-', '')]? iconMapping[list?.source?.description?.replace('-', '')]['icon'] : iconMapping['ALL']['icon']} text-white font-22 pt-2`}></i>
                                    {
                                        idx !== 0 &&
                                        <span className="badge badge-danger rounded-circle noti-icon-badge">{list.count}</span>
                                    }
                                    <br />
                                    <span className="text-white text-capitalize">{list?.source?.description?.replace('-', '')?.toLowerCase()}</span>
                                </div>
                            </li>
                        ))
                    }
                </ul>
            </div>
        </div>
    )
}

export default LeftBar;