import React, { useEffect, useState } from 'react';
import { get } from "../../common/util/restUtil";
import { properties } from "../../properties";

import { formatISODateDDMMMYY } from '../../common/util/dateUtil';

const BestOffer = (props) => {

    const [campaignData, setCampaignData] = useState()                        
  //  let activeService = props.data.activeService;
    
    // useEffect(() => {
    //     if (activeService && activeService !==undefined && activeService!==null) {
    //              
    //         get(properties.CAMPAIGN_API + '/accessnumber/' + activeService)
    //             .then((resp) => {
    //                 if (resp && resp.status === 200 && resp.data) {
    //                         //charge
    //                         setCampaignData(resp);                           
    //                 } 
    //             }).catch((error) => {
    //                 console.log("No Campaings found",error)
    //             })
    //             .finally()
    //     }
        
    // },[activeService]);

    return (
        <>
            <div className="cmmn-container-base">
                <div className="container-heading">
                    <span className="container-title"><i className="fe-pocket"></i> Current Offer</span>
                    <span><a ><img src="../bcae-ux-v6/assets/images/maximize-icon.png" alt="" data-toggle="modal" data-target="#myModal" className="cust-img-mx-icon"/></a></span>
                </div>
                <div className="container-three-row">
                    <div className="container-label curr-offer-info">
                        <p><b>"New Year"</b> offer applied!</p>
                        <span className="exp-info">Activated on 02-01-2023</span>
                        <a >Cancel Offer</a>
                    </div>
                </div>
            </div>
        </>
    )
}


export default BestOffer;