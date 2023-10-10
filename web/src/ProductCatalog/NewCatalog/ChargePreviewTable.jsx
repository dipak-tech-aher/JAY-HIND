import React from 'react';
import moment from 'moment';

const ChargePreviewTable = ({ tableData }) => {
    return (
        <table className="table table-striped text-center border">
            {
                !!tableData?.length && tableData.map((data, index) => (
                    <>
                        <thead key={index}>
                            <tr>
                                <th scope="col" className="text-white text-left" style={{ backgroundColor: "#60769c" }}>Charge Name</th>
                                <th scope="col" className="text-white text-left" style={{ backgroundColor: "#0f3780" }}>{data?.chargeName}</th>
                            </tr>
                        </thead>
                        <tbody key={++index}>
                            <tr>
                                <th scope="col" className="text-left">Charge Type</th>
                                <td className="text-left">{data?.chargeTypeDesc}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="text-left">Currency</th>
                                <td className="text-left">{data?.currencyDesc}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="text-left">Charge Amount</th>
                                <td className="text-left">{data?.chargeAmount}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="text-left">Frequency</th>
                                <td className="text-left">{data?.frequencyDesc?.description}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="text-left">Billing Start Cycle</th>
                                <td className="text-left">{data?.billingEffective}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="text-left">Start Date</th>
                                <td className="text-left">{data?.startDate ? moment(data.startDate).format('DD MMM YYYY') : ""}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="text-left">End Date</th>
                                <td className="text-left">{data?.endDate ? moment(data.endDate).format('DD MMM YYYY') : ""}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="text-left">Advance Charge</th>
                                <td className="text-left">{data?.advanceCharge === 'Y' ? 'Yes' : 'No'}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="text-left">Charge Upfront</th>
                                <td className="text-left">{data?.chargeUpfront === 'Y' ? 'Yes' : 'No'}</td>
                            </tr>
                        </tbody>
                    </>
                ))
            }
        </table>
    )
}

export default ChargePreviewTable;