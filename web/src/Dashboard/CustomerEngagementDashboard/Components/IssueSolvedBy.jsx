
import React, { useEffect, useState } from "react";
const IssueSolvedBy = (props) => {
    const { issueResolvedBy } = props?.data
    const { handleIssuePopUpOpenClose } = props?.handlers;
    const [botPerc, setBotPerc] = useState(0)
    const [humanPerc, setHumanPerc] = useState(0);

    useEffect(() => {
        console.log('issueResolvedBy----->', issueResolvedBy)

        const total = Number(issueResolvedBy?.bot) + Number(issueResolvedBy?.human);
        console.log('total----->', total)
        const bot = (Number(issueResolvedBy?.bot) / total) * 100
        const human = (Number(issueResolvedBy?.human) / total) * 100;
        console.log('bit------>', botPerc)
        console.log('human------>', humanPerc)
        setBotPerc(bot)
        setHumanPerc(human)
    }, [])

    return (
        <div className="mb-2">
            <div className="cmmn-skeleton">
                <span className="skel-header-title">Issues Solved By</span>
                <div className="skel-bots-h">
                    <span>BOTS</span>
                    <div className="progress-status progress-moved" >
                        <div className="progress-bar" style={{ width: `${Number(botPerc).toFixed(2)}%` }}>
                        </div>
                    </div>
                    <span onClick={() => handleIssuePopUpOpenClose('BOT')}>{Number(botPerc).toFixed(2)}%</span>
                </div>
                <div className="skel-bots-h">
                    <span>HUMAN</span>
                    <div className="progress-status progress-moved-blue" >
                        <div className="progress-bar" style={{ width: `${Number(humanPerc).toFixed(2)}%` }}>
                        </div>
                    </div>

                    <span onClick={() => handleIssuePopUpOpenClose('HUMAN')}>{Number(humanPerc).toFixed(2)}%</span>
                </div>
            </div>
        </div>
    )
}

export default IssueSolvedBy;