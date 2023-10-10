import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-scroll'

import { properties } from '../../../properties';
import { get, post } from '../../../common/util/restUtil';
import HelpdeskInfoTab from './HelpdeskInfoTab';
import MoreDetailsTab from './MoreDetailsTab';
import { toast } from 'react-toastify';

const ViewHelpdeskTicket = (props) => {

    const { helpdeskId } = props?.location?.state?.data;
    const [detailedViewItem, setDetailedViewItem] = useState();

    const getHelpdeskData = useCallback(() => {

        if (!helpdeskId) {
            toast.warn('Helpdesk Id not found')
        }

        const requestBody = {
            helpdeskId: Number(helpdeskId),
            contain: ['CUSTOMER', 'INTERACTION']
        }
        post(`${properties.HELPDESK_API}/search?limit=10&page=0`, requestBody)
            .then((response) => {
                const { status, data } = response;
                if (status === 200) {
                    if (response && response?.data && response?.data?.rows && response?.data?.rows.length > 0) {
                        setDetailedViewItem(response?.data?.rows[0])
                    }
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }, [])

    useEffect(() => {
        getHelpdeskData();
    }, [getHelpdeskData])

    const doSoftRefresh = () => {
        getHelpdeskData();
    }

    return (
        <div className="container-fluid edit-complaint cust-skeleton cmmn-skeleton mt-2">
            {/* <div className={`row align-items-center`}>
                <div className="col">
                    <h1 className="title bold">Helpdesk ID {helpdeskId}</h1>
                </div>
                <div className="col-auto">
                    <button type="button" onClick={() => props.history.goBack()} className="btn btn-labeled btn-primary btn-sm">Back</button>
                </div>
            </div> */}
            <div className="">
                <div className="">
                    <div className="">
                        <div className="">
                            <MoreDetailsTab
                                data={{
                                    detailedViewItem
                                }}

                                handlers={{
                                    doSoftRefresh
                                }}
                            />
                            {/* <div className={`col-md-2 sticky `}>
                                <nav className="navbar navbar-default navbar-fixed-top">
                                    <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                                        <ul key="ecul1" className="nav navbar-nav">
                                            <li key="ecli11">
                                                <Link activeclassName="active" to="ticketDetailsSection" spy={true} offset={-250} smooth={true} duration={100}>
                                                    Helpdesk Details
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                </nav>
                            </div> */}

                            {/* <div className={`edit-inq new-customer col-md-12`}>
                                <div data-spy="scroll" data-target="#scroll-list" data-offset="0" className="new-customer">
                                    <div className="col-12">
                                        <ul key="ecul2" className="nav nav-tabs" role="tablist">
                                            <li key="ecli21" className="nav-item pl-0">
                                                <button data-target="#ticketDetails" role="tab" data-toggle="tab" aria-expanded="false" className="nav-link active font-17 bolder">
                                                    More Details
                                                </button>
                                            </li>
                                            <li key="ecli22" className="nav-item">
                                                <button data-target="#helpdeskInfo" role="tab" data-toggle="tab" aria-expanded="false" className="nav-link font-17 bolder">
                                                    Helpdesk Info
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="tab-content py-0 pl-3">
                                        <div className="tab-pane show active" id="ticketDetails">
                                            <MoreDetailsTab
                                                data={{
                                                    detailedViewItem,
                                                }}
                                            />
                                        </div>
                                        <div className="tab-pane" id="helpdeskInfo">
                                            <HelpdeskInfoTab
                                                data={{
                                                    detailedViewItem,
                                                }}
                                            />
                                        </div>

                                    </div>
                                </div>
                            </div> */}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default ViewHelpdeskTicket;