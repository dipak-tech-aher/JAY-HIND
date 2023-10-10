import React from 'react';
import { USNumberFormat } from '../../../../common/util/util';

const DetailsCommonTable = ({ tableRow = [], type }) => {

    return (
        <div className="col-12 row p-2 table-responsive">
            <table className="table border m-0">
                <thead>
                    <tr>
                        <th className="text-left" style={{ width: "25%" }}>Charge Name</th>
                        <th className="text-center" style={{ width: "25%" }}>Charge Type</th>
                        <th className="text-center" style={{ width: "25%" }}>Currency</th>
                        <th className="text-center" style={{ width: "25%" }}>Charge Amount</th>
                        <th className="text-center" style={{ width: "25%" }}>Frequency</th>
                    </tr>
                </thead>
                <tbody>
                    {
                    
                        // ['Plan', 'Service', 'Asset','Catalog'].includes(type) ?
                        tableRow?.map((tr, idx) => (  
                            <tr key={idx}>                                
                                    <td className="text-left">{tr['productChargesList.chargeDetails.chargeName']}</td>
                                    <td className="text-center">{tr['productChargesList.chargeDetails.chargeCatDesc.description']}</td>
                                    <td className="text-center">{tr['productChargesList.chargeDetails.currencyDesc.description']}</td>
                                    <td className="text-center">{USNumberFormat(tr['productChargesList.chargeAmount'])}</td>
                                    <td className="text-center text-capitalize">{tr['productChargesList.frequencyDesc.description']}</td>
                                </tr>
                            ))
                            // :
                            // tableRow?.map((tr) => {
                            //     let type = tr.hasOwnProperty('serviceCharge') ? 'service' : tr.hasOwnProperty('planCharge') ? 'plan' : 'asset';
                            //     return tr[`${type}Charge`]?.map((sbTr, idx) => (
                            //         <tr key={idx}>
                            //             <td className="text-left">{sbTr?.chargeDetails?.chargeName}</td>
                            //             <td className="text-center">{sbTr?.productChargesList.chargeDetails.chargeCatDesc.description}</td>
                            //             <td className="text-center">{sbTr?.productChargesList.chargeDetails.currencyDesc.description}</td>
                            //             <td className="text-center">{USNumberFormat(sbTr?.productChargesList.chargeAmount)}</td>
                            //             <td className="text-center text-capitalize">{sbTr?.productChargesList.frequencyDesc.description}</td>
                            //         </tr>
                            //     ))
                            // })
                    }
                </tbody>
            </table>
        </div>
    )
}

export default DetailsCommonTable;