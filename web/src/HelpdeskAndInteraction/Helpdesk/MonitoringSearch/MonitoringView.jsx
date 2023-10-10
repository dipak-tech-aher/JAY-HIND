import React from 'react';
import EvaluateTab from './shared/EvaluateTab';
import DetailsTab from './shared/DetailsTab';

const MonitoringView = (props) => {

    const { detailedViewItem, isAgent } = props?.location?.state?.data;

    return (
        <div>
            <div className="row">
                <div className="col-12">
                    <div className="page-title-box">
                        <h4 className="page-title">Quality Monitoring Helpdesk ID {detailedViewItem?.helpdeskId}</h4>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-12">
                    <div className="card-box">
                        <ul className="nav nav-tabs">
                            <li className="nav-item">
                                <a href="#details" data-toggle="tab" aria-expanded="false" className="nav-link active">
                                    Helpdesk Details </a>
                            </li>
                            <li className="nav-item">
                                <a href="#evaluation" data-toggle="tab" aria-expanded="true" className="nav-link">
                                    Evaluate </a>
                            </li>
                        </ul>
                        <div className="tab-content pt-1">
                            <div className="tab-pane show active" id="details">
                                <DetailsTab
                                    data={{
                                        detailedViewItem,
                                        isAgent
                                    }}
                                />
                            </div>
                            <div className="tab-pane" id="evaluation">
                                <EvaluateTab
                                    data={{
                                        detailedViewItem,
                                        isAgent
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MonitoringView;