import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { USNumberFormat } from '../../common/util/util';

const CatalogView = (props) => {

    const { viewData } = props.data;
    const [charges, setCharges] = useState({
        totalRC: 0,
        totalNRC: 0,
        totalUsage: 0,
        total: 0
    })
    useEffect(() => {
        let count = {
            totalRC: 0,
            totalNRC: 0,
            totalUsage: 0,
            total: 0
        }
        if (viewData?.plan?.planCharges[0]?.chargeType === 'CC_RC') {
            count.totalRC += Number(viewData?.plan?.planCharges[0]?.chargeAmount)
        }
        else if (viewData?.plan?.planCharges[0]?.chargeType === 'CC_NRC') {
            count.totalNRC += Number(viewData?.plan?.planCharges[0]?.chargeAmount)
        }
        else if (viewData?.plan?.planCharges[0]?.chargeType === 'Usage') {
            count.totalUsage += Number(viewData?.plan?.planCharges[0]?.chargeAmount)
        }
        viewData.services.length > 0 && viewData?.services?.forEach((service, idx) => {
            service?.serviceCharges.forEach((serviceCharge) => {
                if (serviceCharge?.chargeType === 'CC_RC') {
                    count.totalRC += Number(serviceCharge?.chargeAmount)
                }
                else if (serviceCharge?.chargeType === 'CC_NRC') {
                    count.totalNRC += Number(serviceCharge?.chargeAmount)
                }
                else if (serviceCharge?.chargeType === 'Usage') {
                    count.totalUsage += Number(serviceCharge?.chargeAmount)
                }
            })
        })
        viewData.addons.length > 0 && viewData?.addons?.forEach((addon) => {
            addon.addonCharges.forEach((addonCharge) => {
                if (addonCharge?.chargeType === 'CC_RC') {
                    count.totalRC += Number(addonCharge?.chargeAmount)
                }
                else if (addonCharge?.chargeType === 'CC_NRC') {
                    count.totalNRC += Number(addonCharge?.chargeAmount)
                }
                else if (addonCharge?.chargeType === 'Usage') {
                    count.totalUsage += Number(addonCharge?.chargeAmount)
                }
            })
        })
        viewData.assets.length > 0 && viewData?.assets?.forEach((asset) => {
            asset.assetCharges.forEach((assetCharge) => {
                if (assetCharge?.chargeType === 'CC_RC') {
                    count.totalRC += Number(assetCharge?.chargeAmount)
                }
                else if (assetCharge?.chargeType === 'NRC') {
                    count.totalNRC += Number(assetCharge?.chargeAmount)
                }
                else if (assetCharge?.chargeType === 'Usage') {
                    count.totalUsage += Number(assetCharge?.chargeAmount)
                }
            })
        })
        setCharges({
            totalRC: count.totalRC,
            totalNRC: count.totalNRC,
            totalUsage: count.totalUsage,
            total: count.totalRC + count.totalNRC + count.totalUsage
        })
    }, [props])

    return (
        <>
            <div className="tab-pane active" id="catalog-tab">
                <div className="table-responsive">
                    <section className="triangle"><h5 id="list-item-1" className="p-1">Overview</h5></section>
                    <table className="table table-striped text-left border">
                        <thead>
                            <tr>
                                <th scope="col" className="text-white" style={{ backgroundColor: "#60769c" }}>Catelogue Name</th>
                                <th scope="col" className="text-white" style={{ backgroundColor: "#0f3780" }}>{viewData?.catalogName}</th>
                            </tr>
                            <tr>
                                <th scope="col" >Service <br />
                                </th>
                                <th scope="col">{viewData?.serviceType}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th scope="row">Customer Type</th>
                                <td>{viewData?.customerType?.map((type) => type.description).toString()}</td>
                            </tr>
                            <tr>
                                <th scope="row">Start Date </th>
                                <td>{viewData?.startDate ? moment(viewData?.startDate).format('DD MMM YYYY') : ""}</td>
                            </tr>
                            <tr>
                                <th scope="row">End Date</th>
                                <td>{viewData?.endDate ? moment(viewData.endDate).format('DD MMM YYYY') : ""}</td>
                            </tr>
                            <tr>
                                <th scope="row">Status </th>
                                <td>{viewData?.status}</td>
                            </tr>
                        </tbody>
                    </table>

                    <table className="table text-left border tableshadow">
                        <thead>
                            <tr>
                                <th scope="col">Catalogs</th>
                                <th scope="col">RC</th>
                                <th scope="col">NRC</th>
                                <th scope="col">Usage</th>
                            </tr>
                            <tr>
                                <td colSpan="4" className="p-0" col>
                                    <section className="triangle"><h5 id="list-item-1" className="p-1">Plan</h5></section>
                                </td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th scope="row" className="align-middle">{viewData?.plan?.planName}</th>
                                <td>
                                    {
                                        viewData?.plan?.planCharges[0]?.chargeType === 'CC_RC' ? USNumberFormat(viewData?.plan?.planCharges[0]?.chargeAmount) : "-"
                                    }
                                </td>
                                <td>
                                    {
                                        viewData?.plan?.planCharges[0]?.chargeType === 'CC_NRC' ? USNumberFormat(viewData?.plan?.planCharges[0]?.chargeAmount) : "-"
                                    }
                                </td>
                                <td>
                                    {
                                        viewData?.plan?.planCharges[0]?.chargeType === 'Usage' ? USNumberFormat(viewData?.plan?.planCharges[0]?.chargeAmount) : "-"
                                    }
                                </td>
                            </tr>
                            <tr>
                                <td colSpan="4" className="p-0" col>
                                    <section className="triangle text-left"><h5 id="list-item-1" className="p-1">Services</h5></section>
                                </td>
                            </tr>
                            {
                                viewData.services.length > 0 && viewData?.services?.map((service, idx) => (
                                    service?.serviceCharges.map((serviceCharge, sindx) => (
                                        <tr key={sindx}>
                                            {
                                                sindx === 0 &&
                                                <th scope="row" className="align-middle" rowSpan={service?.serviceCharges.length > 1 ? service.serviceCharges.length : ''}>
                                                    {service.serviceName}
                                                </th>
                                            }
                                            <td>
                                                {
                                                    serviceCharge?.chargeType === 'CC_RC' ? USNumberFormat(serviceCharge?.chargeAmount) : "-"
                                                }
                                            </td>
                                            <td>
                                                {
                                                    serviceCharge?.chargeType === 'CC_NRC' ? USNumberFormat(serviceCharge?.chargeAmount) : "-"
                                                }
                                            </td>
                                            <td>
                                                {
                                                    serviceCharge?.chargeType === 'Usage' ? USNumberFormat(serviceCharge?.chargeAmount) : "-"
                                                }
                                            </td>
                                        </tr>
                                    ))
                                ))
                            }
                            <tr>
                                <td colSpan="4" className="p-0">
                                    <section className="triangle text-left"><h5 id="list-item-1" className="p-1">Add-ons</h5></section>
                                </td>
                            </tr>
                            {
                                viewData.addons.length > 0 && viewData?.addons?.map((addon, idx) => (
                                    addon?.addonCharges.map((addonCharge, sindx) => (
                                        <tr key={sindx}>
                                            {
                                                sindx === 0 &&
                                                <th scope="row" className="align-middle" rowSpan={addon?.addonCharges.length > 1 ? addon.addonCharges.length : ''}>
                                                    {addon.addonName}
                                                </th>
                                            }
                                            <td>
                                                {
                                                    addonCharge.chargeType === 'CC_RC' ? USNumberFormat(addonCharge.chargeAmount) : "-"
                                                }
                                            </td>
                                            <td>
                                                {
                                                    addonCharge.chargeType === 'CC_NRC' ? USNumberFormat(addonCharge.chargeAmount) : "-"
                                                }
                                            </td>
                                            <td>
                                                {
                                                    addonCharge.chargeType === 'Usage' ? USNumberFormat(addonCharge.chargeAmount) : "-"
                                                }
                                            </td>
                                        </tr>
                                    ))
                                ))
                            }
                            <tr>
                                <td colSpan="4" className="p-0">
                                    <section className="triangle text-left"><h5 id="list-item-1" className="p-1">Asset</h5></section>
                                </td>
                            </tr>
                            {
                                viewData.assets.length > 0 && viewData?.assets?.map((asset, idx) => (
                                    asset?.assetCharges.map((assetCharge, sindx) => (
                                        <tr key={sindx}>
                                            {
                                                sindx === 0 &&
                                                <th scope="row" className="align-middle" rowSpan={asset?.assetCharges.length > 1 ? asset.assetCharges.length : ''}>
                                                    {asset.assetName}
                                                </th>
                                            }
                                            <td>
                                                {
                                                    assetCharge?.chargeType === 'CC_RC' ? USNumberFormat(assetCharge?.chargeAmount) : "-"
                                                }
                                            </td>
                                            <td>
                                                {
                                                    assetCharge?.chargeType === 'CC_NRC' ? USNumberFormat(assetCharge?.chargeAmount) : "-"
                                                }
                                            </td>
                                            <td>
                                                {
                                                    assetCharge?.chargeType === 'Usage' ? USNumberFormat(assetCharge?.chargeAmount) : "-"
                                                }
                                            </td>
                                        </tr>
                                    ))
                                ))
                            }
                            <br />
                            <tr className="bg-light">
                                <th scope="row">Total</th>
                                <td>{USNumberFormat(charges.totalRC)}</td>
                                <td>{USNumberFormat(charges.totalNRC)}</td>
                                <td>{USNumberFormat(charges.totalUsage)}</td>
                            </tr>
                            <tr className="bg-light">
                                <th><h4>Grant Total</h4></th>
                                <td colSpan="3"><h4>{USNumberFormat(charges.total)}</h4></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}

export default CatalogView