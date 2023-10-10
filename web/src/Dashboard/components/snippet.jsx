/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from "react";
import Modal from 'react-modal';
import { RegularModalCustomStyles } from '../../common/util/util';
import SingleGridView from './SingleGridView';
import TripleGridView from "./TripleGridView";
import { post } from "../../common/util/restUtil";

import TicketCount from "../CustomerDashboard/TicketCount";
import AbandendCount from "../CustomerDashboard/AbondendCount";
import CurrentlyServed from "../CustomerDashboard/CurrentlyServed";
import AveragewaitTime from "../CustomerDashboard/AveragewaitTime";
import AverageResponseTime from "../CustomerDashboard/AverageResponseTime";
import RatedCount from "../CustomerDashboard/RatedCount";

const Snippet = (props) => {
    const { count, title, type, viewDetails, viewDetailsData, url, requestBody, method, classDetails } = props.data
    const [tripleGridViewDetails, setIsTripleGridViewDetails] = useState()
    const [isTripleGridViewOpen, setIsTripleGridViewOpen] = useState(false)
    const [isSingleGridViewOpen, setIsSingleGridViewOpen] = useState(false)
    const [singleGridViewDetails, setSingleGridViewDetails] = useState()
    const [isticketCountOpen, setIsTicketCountOpen] = useState(false)
    const [isAbondendOpen, setIsAbondendOpen] = useState(false)
    const [isCurrentlyServedOpen, setIsCurrentlyServedOpen] = useState()
    const [isAverageWaitTimeOpen, setIsAverageWaitTimeOpen] = useState(false)
    const [isAverageResponseTimeOpen, setIsAverageResposeTImeOpen] = useState()
    const [isRatedCountOpen, setIsRatedCountOpen] = useState()

    const handleTripleGridView = () => {
        
        post(url, requestBody).then((response) => {
            if (response.data) {
                let demographicData = []
                let channelData = []
                let agentData = []

                for (let d of response.data?.demographic) {
                    demographicData.push({ id: d?.district, demographic: d?.districtname, w1: d?.customercount, w2: "0" })
                }
                for (let c of response.data?.channel) {
                    channelData.push({ id: c?.source, channel: c?.source, w1: c?.count, w2: "0" })
                }
                for (let a of response.data?.agent) {
                    agentData.push({ id: a?.userid, agent: a?.firstname, w1: a?.count, w2: "0" })
                }
                setIsTripleGridViewDetails({
                    demographic: { length: demographicData.length, data: demographicData },
                    channel: { length: channelData.length, data: channelData },
                    agent: { length: agentData.length, data: agentData }
                })
                setIsTripleGridViewOpen(!isTripleGridViewOpen)
            }
        }).catch((error) => {
            console.log(error)
        }).finally()

    }

    const handleSingleGridView = () => {
        // 
        // post(url, requestBody).then((response) => {
        //     if (response.data) {
        //         let singleGridViewData = []
        //         for (let d of response.data.rows) {
        //             singleGridViewData.push({
        //                 product: d.product, exSatisfied: d.exSatisfied, satisfied: d.satisfied, neutral: d.neutral,
        //                 unSatisfied: d.unSatisfied, exUnSatisfied: d.exUnSatisfied
        //             })
        //         }

        //         setSingleGridViewDetails({ singleGridView: { length: singleGridViewData.length, data: singleGridViewData } })
        //         setIsSingleGridViewOpen(!isSingleGridViewOpen)
        //     }
        // }).finally()

        setIsSingleGridViewOpen(!isSingleGridViewOpen)

    }

    const handleonClick = () => {
        if (type === "TRIPLE") {
            handleTripleGridView()
        }
        else if (type === "SINGLE") {
            handleSingleGridView()
        }
        else if (type === "TICKETCOUNT") {
            setIsTicketCountOpen(true)
        }
        else if (type === "CLOSEDTICKETCOUNT") {
            setIsTicketCountOpen(true)
        }
        else if (type === "ADANDONEDTICKET") {
            setIsAbondendOpen(true)
        }
        else if (type === "CURRENTLYSERVED") {
            setIsCurrentlyServedOpen(true)
        }
        else if (type === "AVERAGEWAITTIME") {
            setIsAverageWaitTimeOpen(true)
        }
        else if (type === "AVERAGERESPONSETIME") {
            setIsAverageResposeTImeOpen(true)
        }
        else if (type === "RATEDCOUNT"){
            setIsRatedCountOpen(true)
        }
        else if (type === "UNRATEDCOUNT"){
            setIsRatedCountOpen(true)
        }
    }
    // type === "TRIPLE"?handleTripleGridView:handleTicketCount
    return (
        <>
            {isTripleGridViewOpen ?
                <Modal style={RegularModalCustomStyles} isOpen={isTripleGridViewOpen}>
                    <TripleGridView
                        data={{
                            headerName: viewDetailsData.headerName,
                            rowData: tripleGridViewDetails,
                            url: url,
                            requestBody: requestBody,
                            method: method
                        }}
                    ></TripleGridView>
                    <button className="close-btn" onClick={() => setIsTripleGridViewOpen(!isTripleGridViewOpen)}>&times;</button>
                </Modal>
                : <></>
            }
            {isSingleGridViewOpen ? <Modal style={RegularModalCustomStyles} isOpen={isSingleGridViewOpen}>
                <SingleGridView
                    data={{
                        headerName: viewDetailsData.headerName,
                        rowData: singleGridViewDetails,
                        url: url,
                        requestBody: requestBody,
                        method: method
                    }}
                ></SingleGridView>  <button className="close-btn" onClick={() => setIsSingleGridViewOpen(false)}>&times;</button></Modal>
                : <></>
            }
            {isticketCountOpen ? <Modal style={RegularModalCustomStyles} isOpen={isticketCountOpen}>
                <TicketCount
                    data={{
                        headerName: title
                    }}
                ></TicketCount>  <button className="close-btn" onClick={() => setIsTicketCountOpen(false)}>&times;</button></Modal>
                : <></>
            }{
                isAbondendOpen ? <Modal style={RegularModalCustomStyles} isOpen={isAbondendOpen}>
                    <AbandendCount
                        data={{
                            headerName: title
                        }}
                    ></AbandendCount>  <button className="close-btn" onClick={() => setIsAbondendOpen(false)}>&times;</button></Modal>
                    : <></>
            }
            {
                isCurrentlyServedOpen ? <Modal style={RegularModalCustomStyles} isOpen={isCurrentlyServedOpen}>
                    <CurrentlyServed
                     data={{
                        headerName: title
                    }}>
                    </CurrentlyServed>
                    <button className="close-btn" onClick={() => setIsCurrentlyServedOpen(false)}>&times;</button></Modal>
                    : <></>
            }
            {
                isAverageWaitTimeOpen ? <Modal style={RegularModalCustomStyles} isOpen={isAverageWaitTimeOpen}>
                    <AveragewaitTime
                    data={{
                        headerName: title
                    }}
                    ></AveragewaitTime>
                    <button className="close-btn" onClick={() => setIsAverageWaitTimeOpen(false)}>&times;</button></Modal>
                    : <></>
            }{
                isAverageResponseTimeOpen ? <Modal style={RegularModalCustomStyles} isOpen={isAverageResponseTimeOpen}>
                <AverageResponseTime
                data={{
                    headerName: title
                }}
                ></AverageResponseTime>
                <button className="close-btn" onClick={() => setIsAverageResposeTImeOpen(false)}>&times;</button></Modal>
                : <></>
            }{
                isRatedCountOpen ? <Modal style={RegularModalCustomStyles} isOpen={isRatedCountOpen}>
                <RatedCount
                data={{
                    headerName: title
                }}
                ></RatedCount>
                <button className="close-btn" onClick={() => setIsRatedCountOpen(false)}>&times;</button></Modal>
                : <></>
            }

            <div className={classDetails} data-wow-duration="2s" data-wow-delay="5s">
                <a className="card lift h-100">
                    <div className="text-center">
                        <div className="text-center">
                            <div className="me-3">
                                <h5>{title}</h5>
                                <h2 className="text-center card-value animate__fadeInDown">{count}</h2>
                            </div>
                            {viewDetails && <button type="button" style={{ cursor: "pointer" }} className="mt-2 btn-xs btn btn-white waves-effect"
                                onClick={handleonClick}>View Details</button>}
                        </div>
                    </div>
                </a>
            </div>
        </>
    )
}

export default Snippet;