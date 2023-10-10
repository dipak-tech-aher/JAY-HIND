import React, { useState } from "react";
import EmailMonitoring from './EmailMonitoring';
import LiveChatMonitoring from './LiveChatMonitoring';

const HelpDeskMonitoring = (props) => {

    const [isActive, setIsActive] = useState();

    const selectedChannel = props?.handler?.selectedChannel[0].id;
    const selectedUser = props?.handler?.selectedUser
    const selectedStartDate = props?.handler?.selectedDateRange?.startDate
    const selectedEndDate = props?.handler?.selectedDateRange?.endDate
    const refresh = props?.handler?.Refresh

    if (isActive !== selectedChannel && selectedChannel !== undefined) {
        setIsActive(selectedChannel);
    };

    const MonitoringInfo = {
        channel: selectedChannel,
        userId: selectedUser,
        startDate: selectedStartDate,
        endDate: selectedEndDate,
        refresh: refresh
    };

    return (
            <div className="tab-pane show active">
                {(() => {
                    switch (isActive) {
                        case "E-MAIL":
                            return <EmailMonitoring data={MonitoringInfo} />
                        case "LIVECHAT":
                            return <LiveChatMonitoring data={MonitoringInfo}></LiveChatMonitoring>;
                        default:
                            return (
                                <div>
                                    <EmailMonitoring data={MonitoringInfo} ></EmailMonitoring>
                                    <LiveChatMonitoring data={MonitoringInfo} ></LiveChatMonitoring>
                                </div>
                            )
                    }
                })()}
            </div>
    )
}

export default HelpDeskMonitoring;