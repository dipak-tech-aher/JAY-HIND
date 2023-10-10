import React from "react";

const TopCustomerIssues = (props) => {
    const { topCustomerIssues } = props?.data;

    return (
        <div className="customer-skel-rht ml-1">
            <div className="form-row m-0">
                <div className="col-md-12 cmmn-skeleton">
                    <span className="skel-header-title">Top 10 Customer Issues</span>
                    <div className="row">
                        {topCustomerIssues?.length > 0 && topCustomerIssues.map((issue, index) => (
                            <div className="col-md-6 skel-circle-prgbar" key={index}>
                                <div className="progress-bar-circle">
                                    <span className="progress-title"></span>
                                    <span
                                        className="titles timer"
                                        data-from="0"
                                        data-to="85"
                                        data-speed="1800"
                                    >
                                        {issue?.total_cnt}
                                    </span>
                                </div>
                                {issue?.request_statement}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopCustomerIssues;
