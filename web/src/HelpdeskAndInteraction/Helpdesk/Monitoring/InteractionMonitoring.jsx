import React, { useState } from "react"
import EmailMonitoring from './EmailMonitoring';
import LiveChatMonitoring from './LiveChatMonitoring';

const InteractionMonitoring = (props) => {

    const [isActive, setIsActive] = useState();

    const selectedChannel = props?.handler?.selectedChannel[0].id;

    if (isActive !== selectedChannel && selectedChannel !== undefined) {
        setIsActive(selectedChannel);
    };

    const MonitoringInfo = {
        channel: selectedChannel,
        userId: props?.handler?.selectedUser,
        startDate: props?.handler?.selectedDateRange?.startDate,
        endDate: props?.handler?.selectedDateRange?.endDate,
        refresh: props?.handler?.Refresh
    };

    return (
        <>
            {(() => {
                switch (isActive) {
                    case "EMAIL":
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

        </>
    )
}

export default InteractionMonitoring