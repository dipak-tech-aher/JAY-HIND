import React, { useEffect, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { toast } from 'react-toastify';

import { properties } from '../../../../properties';
import { get, post, put } from '../../../../common/util/restUtil';
import { USNumberFormat } from '../../../../common/util/util';
import moment from 'moment'
import { isEmpty } from 'lodash'
import SignaturePad from "react-signature-canvas";
import { useRef } from 'react';
import DynamicTable from '../../../../common/table/DynamicTable';

const UpgradeDowngradeTabPane = (props) => {
    const { manageServiceRef, upgradeDowngradeType, selectedAccount, serviceBadge, productBenefitLookup = [] } = props?.data
    const { setIsManageServicesOpen, pageRefresh } = props.handlers;
    const type = manageServiceRef?.current?.source ? manageServiceRef?.current?.source : ''
    const [searchInput, setSearchInput] = useState("")
    const [upgradeDowngradeList, setUpgradeDowngradeList] = useState([])
    const [filteredData, setFilteredData] = useState([])
    const [selectedCard, setSelectedCard] = useState([])
    const [pendingList, setPendingList] = useState([])
    const [customerTerm, setCustomerTerm] = useState(false)
    const sigPad = useRef({});
    const clearSignature = () => {
        sigPad.current?.clear();
    };

    const ContractCols = [
        {
            Header: "Contract Start Date",
            accessor: "actualStartDate",
            disableFilters: true
        },
        {
            Header: "Contract End Date",
            accessor: "actualEndDate",
            disableFilters: true
        },
        {
            Header: "Total RC",
            accessor: row => {
                return `${Number(row?.rcAmount).toFixed(2)}`
            },
            disableFilters: true
        },
        {
            Header: "Total NRC",
            accessor: row => {
                return `${Number(row?.otcAmount).toFixed(2)}`
            },
            disableFilters: true
        }
    ]

    const [agreementDetail, setAgreementDetail] = useState({});

    useEffect(() => {
        setSelectedCard([]);
        setAgreementDetail({});
    }, [upgradeDowngradeType])

    const isDayNoExceeded = (agreeDtl) => {
        let selectedServiceActivatedOn = manageServiceRef?.current?.activationDate;
        var startDate = moment(selectedServiceActivatedOn, "YYYY-MM-DD");
        var endDate = moment();
        var dayDiff = endDate.diff(startDate, 'days');
        return (dayDiff < agreeDtl.noOfDays);
    }

    useEffect(() => {
        if (["UPGRADE", "DOWNGRADE"].includes(upgradeDowngradeType) && selectedCard?.length > 0) {
            let entityType = upgradeDowngradeType === 'UPGRADE' ? 'OT_UGD' : 'OT_DWNG';
            let serviceType = selectedCard[0].serviceType;
            setAgreementDetail({});
            get(properties.MASTER_API + `/template/get-terms-conditions?entityType=${entityType}&serviceType=${serviceType}`).then((response) => {
                if (response?.data?.length) {
                    let agreeDtl = response?.data[0];
                    setAgreementDetail(agreeDtl);
                    if (isDayNoExceeded(agreeDtl)) {
                        toast.error("You can Upgrade/Downgrade only after " + agreeDtl.noOfDays + " days from the date of activation"); return;
                    }
                }
            }).catch((error) => {
                console.error("error", error)
            }).finally()
        }
    }, [selectedCard])

    const hasExternalSearch = useRef(false);
    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const isTableFirstRender = useRef(true);

    const [existingContracts, setExistingContracts] = useState([]);
    const [futureContracts, setFutureContracts] = useState([]);
    useEffect(() => {
        if (customerTerm === true) {
            get(`${properties.CONTRACT_API}/get-contracts-by-service?serviceUuid=${manageServiceRef?.current?.serviceUuid}`).then((resp) => {
                if (Number(resp?.data?.count) > 0) {
                    const { rows, count } = resp.data;
                    setTotalCount(count);
                    setExistingContracts([...rows]);
                    setFutureContracts([{
                        actualStartDate: moment().format("YYYY-MM-DD"),
                        actualEndDate: moment().add(selectedCard[0]['contractInMonths'] ?? 0, 'months').format("YYYY-MM-DD"),
                        rcAmount: Number(selectedCard[0]['Rc'] ?? 0).toFixed(2),
                        otcAmount: (Number(selectedCard[0]['Nrc'] ?? 0) + Number(agreementDetail?.chargeDtl?.chargeAmount ?? 0)).toFixed(2),
                    }]);
                }
            }).catch((error) => {
                console.log("error", error)
            }).finally()
        }
    }, [customerTerm, currentPage, perPage])

    useEffect(() => {
        unstable_batchedUpdates(() => {
            setSearchInput("")
            setSelectedCard([]);
            setFilteredData([]);
            setCustomerTerm(false);
        })
        const serviceEndPointMapping = {
            Catalog: {
                endPoint: properties.CATALOGUE_API,
            },
            Plan: {
                endPoint: properties.PLANS_API,
            },
            Service: {
                endPoint: properties.SERVICE_API_2,
            },
            Asset: {
                endPoint: properties.ASSET_API_2,
            }
        }
        if (!['WONC', 'WONC-ACCSER', 'WONC-SER', 'BAR', 'UNBAR', 'UPGRADE', 'DOWNGRADE', 'TERMINATE'].includes(serviceBadge)) {

            get(`${properties.PRODUCT_API}/${upgradeDowngradeType === 'UPGRADE' ? 'upgrade' : 'downgrade'}/list/${manageServiceRef?.current?.serviceUuid}`)
                .then((response) => {
                    if (response?.data) {
                        unstable_batchedUpdates(() => {
                            let finalList = []
                            response?.data?.productList.filter((card) => {
                                response?.data?.currentProduct.forEach((ele) => {
                                    card?.productChargesList.forEach(e => {
                                        ele?.productChargesList?.forEach(l => {
                                            if (upgradeDowngradeType === "UPGRADE") {
                                                if (e?.chargeDetails?.chargeCat === 'CC_RC' && l?.chargeDetails?.chargeCat === 'CC_RC' && e?.chargeDetails?.chargeAmount > l?.chargeDetails?.chargeAmount) {
                                                    finalList.push(card)
                                                }
                                            } else {
                                                if (e?.chargeDetails?.chargeCat === 'CC_RC' && l?.chargeDetails?.chargeCat === 'CC_RC' && e?.chargeDetails?.chargeAmount < l?.chargeDetails?.chargeAmount) {
                                                    finalList.push(card)
                                                }
                                            }
                                        })
                                    })
                                })
                            })

                            finalList = [...new Map(finalList.map(item => [item['productId'], item])).values()];

                            finalList.map((x) => {
                                let Rc = 0
                                let Nrc = 0
                                let totalRc = 0
                                let totalNrc = 0
                                let currency = '$'
                                if (x?.productChargesList && x?.productChargesList.length > 0) {
                                    x?.productChargesList.forEach((y) => {
                                        if (y?.chargeDetails?.chargeCat === 'CC_RC' && (!y.objectReferenceId || y.objectReferenceId == null)) {
                                            Rc = Number(y?.chargeAmount || 0)
                                            totalRc = totalRc + Number(y?.chargeAmount || 0)
                                        } else if (y?.chargeDetails?.chargeCat === 'CC_NRC' && (!y.objectReferenceId || y.objectReferenceId == null)) {
                                            totalNrc = totalNrc + Number(y?.chargeAmount || 0)
                                            Nrc = Number(y?.chargeAmount || 0)
                                        }
                                        currency = y?.chargeDetails?.currencyDesc?.description || '$'
                                    })
                                }
                                x.Rc = Rc
                                x.Nrc = Nrc
                                x.totalRc = totalRc
                                x.totalNrc = totalNrc
                                x.quantity = 0
                                x.isSelected = 'N'
                                x.currency = currency
                            })

                            setUpgradeDowngradeList(finalList)
                            setFilteredData(finalList)
                        })
                    }
                })
                .catch(error => {
                    console.error(error);
                })
                .finally()
        }
        else if (serviceBadge === upgradeDowngradeType.toUpperCase()) {

            get(properties.PENDING_PLANS_API + '/' + selectedAccount?.customerId + "?accountId="
                + selectedAccount?.accountId + "&connectionId=" + manageServiceRef.current?.serviceObject?.connectionId
                + "&type=" + type.toUpperCase()
            )
                .then((response) => {
                    if (response.data) {
                        let pendingId = type === 'Catalog' ? response.data?.catalogId : type === 'Plan' ? response.data?.planId :
                            type === 'Asset' ? response.data?.assetId : type === 'Service' ? response.data?.serviceId : ""
                        get(`${serviceEndPointMapping[type].endPoint}/upgrade-downgrade/${manageServiceRef.current?.serviceType}?pending=true&pendingId=${pendingId}`)
                            .then((resp) => {
                                if (resp.data.length > 0) {
                                    unstable_batchedUpdates(() => {
                                        resp.data[0].cardId = type === 'Catalog' ? resp.data[0]?.catalogId : type === 'Plan' ? resp.data[0]?.planId : type === 'Service' ? resp.data[0]?.serviceId : type === 'Asset' ? resp.data[0]?.assetId : ''
                                        resp.data[0].cardName = type === 'Catalog' ? resp.data[0]?.catalogName : type === 'Plan' ? resp.data[0]?.planName : type === 'Service' ? resp.data[0]?.serviceName : type === 'Asset' ? resp.data[0]?.assetName : ''
                                        setPendingList([resp.data[0]])
                                    })
                                }
                            })
                            .catch(error => {
                                console.error(error);
                            })
                    }
                })
                .catch((error) => {
                    console.error(error)
                })
                .finally()
        }

    }, [upgradeDowngradeType])

    const handleInputChange = (e) => {
        if (e.target.value === '') {
            setSearchInput(e.target.value)
            setFilteredData(upgradeDowngradeList)
            return
        }
        unstable_batchedUpdates(() => {
            setSearchInput(e.target.value)
            const filteredList = upgradeDowngradeList.filter((value) => {
                return value?.productName?.toString()?.toLowerCase()?.indexOf(e?.target?.value?.toLowerCase()) >= 0
            })
            setFilteredData(filteredList)
        })
    }


    const handleSubmit = () => {
        if (selectedCard === "") {
            toast.error(`Please Select a Product for Upgrade / Downgrade`)
            return false
        }
        // const serviceObject = {}
        // selectedCard.forEach((x) => {
        //     serviceObject.details = [{
        //         action: 'UPGRADE',
        //         serviceName: x?.productName,
        //         serviceCategory: x?.productSubType,
        //         serviceType: x?.serviceType,
        //         planPayload: {
        //             productId: x?.productId,
        //             productUuid: x?.productUuid,
        //             contract: x?.selectedContract?.[0] || 0,
        //             actualContract: x?.oldSelectedContract ? x?.oldSelectedContract?.[0] : x?.selectedContract?.[0] || 0,
        //             // promoContract: x?.promoContract ? x?.promoContract : 0,
        //             // promoCode: x.promoCode || [],
        //             serviceLimit: x?.productBenefit && x?.productBenefit?.length > 0 ? x?.productBenefit?.find(f => x.selectedContract?.[0] === Number(f.contract))?.benefits?.find(f => f?.selectedValue === 'PB_DATA')?.description : null,
        //             actualServiceLimit: x?.oldProductBenefit && x?.oldProductBenefit.length > 0 ? x?.oldProductBenefit.find(f => x?.oldSelectedContract?.[0] === Number(f?.contract))?.benefits?.find(f => f?.selectedValue === 'PB_DATA')?.description : null,
        //             // promoServiceLimit: x.promoBenefit && x.promoBenefit.length > 0 ? x.promoBenefit.find(f => f.selectedValue === 'PB_DATA')?.description : null,
        //             productBenefit: x.productBenefit || null,
        //             // promoBenefit: x.promoBenefit || null,
        //             actualProductBenefit: x?.oldProductBenefit ? x?.oldProductBenefit : x?.productBenefit || null,
        //         },
        //         // serviceAgreement: serviceAgreement ? serviceAgreement : undefined,
        //         serviceClass: x?.productClass,
        //         quantity: String(x?.quantity),
        //         customerUuid: manageServiceRef?.current?.customerUuid,
        //         currency: manageServiceRef?.current?.currency,
        //         billLanguage: manageServiceRef?.current?.billLanguageDesc?.code,
        //         accountUuid: manageServiceRef?.current.accountUuid,
        //         serviceUuid: manageServiceRef?.current.serviceUuid,
        //     }]
        // })

        // For Create Order
        const list = []
        // const requestBody = {
        //     service: [serviceObject]
        // }
        // console.log('requestBody ----------->', requestBody)
        // put(properties.ACCOUNT_DETAILS_API + '/service/update', requestBody)
        //     .then((resp) => {
        //         if (resp.data) {
        //             if (resp.status === 200 && resp?.data?.[0]?.service?.serviceUuid) {
            //selectedCard?.[0]?.productBenefit?.length > 0
        let totalAmount = 0
        selectedCard.forEach((x) => {
            totalAmount = totalAmount + Number(x?.totalRc) + Number(x?.totalNrc)
            let ordeReqObj = {
                orderFamily: "OF_PHYCL",
                orderMode: "ONLINE",
                billAmount: Number(x?.totalRc) + Number(x?.totalNrc),
                orderDescription: x?.serviceTypeDescription?.description || "Upgrade / Downgrade Order",
                serviceType: x?.serviceType,
                accountUuid: manageServiceRef?.current?.accountUuid,
                serviceUuid: manageServiceRef?.current?.serviceUuid,
                productBenefit: x?.productBenefit?.length ? x.productBenefit : [],
                actualProductBenefit: x?.productBenefit?.length ? x.productBenefit : [],
                rcAmount: x?.totalRc,
                nrcAmount: x?.totalNrc,
                upfrontCharge: x?.upfrontPayment ? 'Y' : 'N',
                advanceCharge: x?.advancePayment ? 'Y' : 'N',
                contactPreference: [
                    "CHNL004"
                ],
                product: [{
                    productId: Number(x?.productId),
                    productQuantity: Number(x.quantity),
                    productAddedDate: moment().format('YYYY-MM-DD hh:mm:ss'),
                    billAmount: Number(x?.totalRc) + Number(x?.totalNrc),
                    edof: moment().format('YYYY-MM-DD'),
                    productSerialNo: x?.productNo,
                    bundleId: null,
                    isBundle: false
                    // rcAmount: x?.totalRc,
                    // nrcAmount: x?.totalNrc
                }]
            }

            if (x?.selectedContract && Array.isArray(x?.selectedContract)) {
                for (const contract of x?.selectedContract) {
                    ordeReqObj.product[0].contract = Number(contract)
                    list.push(ordeReqObj)
                }
            } else {
                list.push(ordeReqObj)
            }
        })
        const orderObj = {
            customerUuid: manageServiceRef?.current?.customerUuid,
            orderCategory: "OC_E",
            orderSource: "CC",
            orderType: upgradeDowngradeType === 'UPGRADE' ? "OT_UGD" : upgradeDowngradeType === 'DOWNGRADE' ? 'OT_DWNG' : 'SIGN_OUT',
            orderChannel: "WALKIN",
            agreementDetail: agreementDetail,
            //orderCause: "CHNL024",
            orderPriority: "PRTYHGH",
            billAmount: totalAmount,
            orderDescription: "Upgrade Order",
            order: list,
        }

        post(properties.ORDER_API + '/create', orderObj)
            .then((resp) => {
                if (resp.data) {
                    if (resp.status === 200) {
                        // toast.success(resp.message);
                        toast.success(`${type} ${upgradeDowngradeType === 'UPGRADE' ? 'Upgrade' : 'Downgrade'} Successfull`)
                        setIsManageServicesOpen(false)
                        pageRefresh()
                        // props.history.push(`${process.env.REACT_APP_BASE}/`);
                        // handleNeedQuote()
                    } else {
                        toast.error("Failed to create - " + resp.status);
                    }
                }
            })
            .catch((error) => {
                console.error(error)
            })
            .finally();
    }

    const handleProductOnChange = (value) => {
        // const checkExistingProduct = selectedCard?.length > 0 && selectedCard?.filter(e => e.productId === value.productId)
        // let finalProductList = []

        // if (checkExistingProduct) {
        //     finalProductList = selectedCard.filter(e => e.productId !== value.productId)
        //     setSelectedCard(finalProductList)
        // } else {
        //     // if (selectedCard) {
        //     //     setSelectedCard([...selectedCard, ...value])
        //     // } else {
        //     finalProductList.push(value)
        //     // console.log('finalProductList --------->', finalProductList)
        //     // }
        // }
        // console.log(value);
        setSelectedCard([value])

    }

    const handleManualProductChange = (product, e) => {
        const { checked, name } = e.target
        const updatedProductList = selectedCard.map((p) => {
            if (p.productId === product.productId) {
                let updatedProduct = { ...p, isSelected: 'Y' };

                if (name === 'upfrontPayment') {
                    updatedProduct.upfrontPayment = checked;
                }
                if (name === 'advancePayment') {
                    updatedProduct.advancePayment = checked;
                }
                return updatedProduct
            }
            return p;
        })
        setSelectedCard(updatedProductList);
    }

    const handleOnClickProceed = (e) => {
        if (isDayNoExceeded(agreementDetail)) {
            toast.error("You can Upgrade/Downgrade the selected service only after " + agreementDetail.noOfDays + " days from the date of activation"); return;
        }
        setCustomerTerm(true);
    }

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const handleCellRender = (cell, row) => {
        return (<span>{cell.value}</span>)
    }

    return (
        <div className="tab-pane fade show" id="v-pills-upgrade5" role="tabpanel" aria-labelledby="v-pills-upgrade-tab">
            {!customerTerm ? <div id="upgrade-form" className="card border p-0">
                <div>
                    <section className="triangle col-12 p-0">
                        <div className="row col-12">
                            <h5 id="list-item-2" className="pl-1">{type} {upgradeDowngradeType === "UPGRADE" ? "Upgrade" : "Downgrade"}</h5>
                        </div>
                    </section>
                    <div className="input-group input-group-merge p-2">
                        <input type="text" className="form-control height38" placeholder="Search" style={{ border: "1px solid #ccc" }}
                            value={searchInput} onChange={handleInputChange}
                        />
                        <div className="input-group-append">
                            <div className="input-group-text">
                                <i className="mdi mdi-filter-outline"></i>
                            </div>
                        </div>
                    </div>
                </div>
                {
                    (manageServiceRef.current?.serviceStatus?.code === "SS_AC" && !['WONC', 'WONC-ACCSER', 'WONC-SER', 'BAR', 'UNBAR', 'UPGRADE', 'DOWNGRADE', 'TERMINATE'].includes(serviceBadge)) ?
                        (!!filteredData.length && !!upgradeDowngradeList.length) ?
                            <>
                                <div className="row mt-1 m-0 border" style={{ height: "320px", overflowY: "scroll" }}>
                                    {
                                        filteredData.map((value, index) => (
                                            <div className="col-lg-4 pt-2" key={index}>
                                                <div className="border rounded pt-2">
                                                    <div className="custom-control custom-radio d-flex justify-content-center">
                                                        <input type="radio" className="custom-control-input" id={value?.productId + ""} name={`selectedCard_${value?.productId}`}
                                                            checked={(selectedCard.length > 0 ? selectedCard?.[0]?.productId === value?.productId ? true : false : false)}
                                                            onChange={() => { handleProductOnChange(value) }}
                                                        />
                                                        <label className="custom-control-label bold" htmlFor={value?.productId}>Select</label>
                                                    </div>
                                                    <div className="card-body p-0">
                                                        <div className="col-md-12 p-0">
                                                            <>
                                                                <div className="card border rounded mt-2">
                                                                    <div className="card-header bg-primary bold text-white">
                                                                        {value?.productName}
                                                                        <span className={`float-right p-1 badge ${type === 'Plan' ? 'badge-blue' : type === 'Service' ? 'badge-warning' : type === 'Asset' ? 'badge-danger' : 'badge-info'}`}>{type}</span>
                                                                    </div>
                                                                    <div className="card-body p-0">
                                                                        <div className="row ml-0">
                                                                            <div className="col-12">
                                                                                <div className="row col-12 pt-1">
                                                                                    <div className="col-6 p-0">
                                                                                        <label className="col-form-label">Service Type</label>
                                                                                        <p className="p-0">{value?.serviceTypeDescription?.description}</p>
                                                                                    </div>
                                                                                    <div className="col-6 p-0">
                                                                                        <label className="col-form-label">category</label>
                                                                                        <p className="p-0">{value?.productCategoryDesc?.description}</p>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="row col-12 pt-0 p-0">
                                                                                    {
                                                                                        value?.productChargesList.map((e) => {
                                                                                            return (
                                                                                                <>
                                                                                                    <div className="col-6 p-0">
                                                                                                        <label className="col-form-label">{e.chargeDetails?.chargeCatDesc?.description}</label>
                                                                                                        <p>{e.chargeDetails?.chargeAmount ? USNumberFormat(e.chargeDetails?.chargeAmount) : '-'}</p>
                                                                                                    </div>
                                                                                                </>
                                                                                            )
                                                                                        })
                                                                                    }
                                                                                    {/* <div className="col-6 p-0">
                                                                                        <label className="col-form-label">Total RC</label>
                                                                                        <p>{value?.totalRc ? USNumberFormat(value?.totalRc) : '-'}</p>
                                                                                    </div> */}
                                                                                </div>
                                                                                <div className="checkbox-container">
                                                                                    <div className="checkbox-item">
                                                                                        <input type="checkbox" disabled={(selectedCard.length > 0 ? selectedCard?.[0]?.productId === value?.productId ? false : true : true)} style={{ position: 'relative', opacity: '1' }} name="upfrontPayment" onClick={(e) => {
                                                                                            handleManualProductChange(value, e)
                                                                                        }} />
                                                                                        <label>Upfront Payment</label>
                                                                                        <input type="checkbox" disabled={(selectedCard.length > 0 ? selectedCard?.[0]?.productId === value?.productId ? false : true : true)} style={{ position: 'relative', opacity: '1' }} name="advancePayment" onClick={(e) => {
                                                                                            handleManualProductChange(value, e)
                                                                                        }} />
                                                                                        <label>Advance Payment</label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                                <div className="d-flex justify-content-center pt-2">
                                    <button type="button" className="skel-btn-cancel" onClick={() => setIsManageServicesOpen(false)}>Close</button>
                                    <button type="button" className="skel-btn-submit" onClick={handleOnClickProceed}>Proceed</button>
                                </div>
                            </>
                            :
                            <>
                                <h5 className="skel-widget-warning">No Product Available for {upgradeDowngradeType === "UPGRADE" ? "Upgrade" : "Downgrade"}</h5>
                            </>
                        :
                        ['UPGRADE', 'DOWNGRADE'].includes(serviceBadge) ?
                            <h5 className="skel-widget-warning">{`A Product upgrade / downgrade is in progress.No action is allowed until processing is complete`}</h5>
                            :
                            <h5 className="skel-widget-warning">{`A Product upgrade / downgrade not available, another Service Request is in process`}</h5>
                }
                {
                    (['UPGRADE', 'DOWNGRADE'].includes(serviceBadge) && serviceBadge === upgradeDowngradeType.toUpperCase()) &&
                    <div className="row mt-1 m-0 border" style={{ height: "320px", overflowY: "scroll" }}>
                        {
                            !!pendingList.length && pendingList.map((value, index) => (
                                <div className="col-lg-4 pt-2" key={index}>
                                    <div className="border rounded pt-2">
                                        <h5 className="errormsg ml-2">Pending {type} {upgradeDowngradeType === "UPGRADE" ? "Upgrade" : "Downgrade"}</h5>
                                        <div className="card-body p-0">
                                            <div className="col-md-12 p-0">
                                                <>
                                                    <div className="card border rounded mt-2">
                                                        <div className="card-header bg-primary bold text-white">
                                                            {value?.cardName}
                                                            <span className={`float-right p-1 badge ${type === 'Plan' ? 'badge-blue' : type === 'Service' ? 'badge-warning' : type === 'Asset' ? 'badge-danger' : 'badge-info'}`}>{type}</span>
                                                        </div>
                                                        <div className="card-body p-0">
                                                            <div className="row ml-0">
                                                                <div className="col-12">
                                                                    <div className="row col-12 pt-1">
                                                                        <div className="col-10 p-0">
                                                                            <label className="col-form-label">Service Type</label>
                                                                            <p className="p-0">{value?.serviceTypeDesc?.description}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="row col-12 pt-0 p-0">
                                                                        <div className="col-6 p-0">
                                                                            <label className="col-form-label">Total RC</label>
                                                                            <p>{value?.totalRc ? USNumberFormat(value?.totalRc) : '-'}</p>
                                                                        </div>
                                                                        <div className="col-6 p-0">
                                                                            <label className="col-form-label">Total NRC</label>
                                                                            <p>{value?.totalNrc ? USNumberFormat(value?.totalNrc) : '-'}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                }
            </div>
                :
                <div id="upgrade-form" className="card border p-0">
                    <div className="col-md-12 skel-cr-rht-sect-form">
                        <h5>Selected Products</h5>
                        <div className="form-row col-md-12">
                            <div className="col-lg-8 col-md-12 col-xs-12 skel-cr-rht-sect-form">
                                <div className="skel-sel-products">
                                    <div className="add-prod-rht" style={{ height: 'auto' }}>
                                        {/* <h4>Selected Products</h4> */}
                                        <div className="skel-prod-heading-title">
                                            <div className="sect-top-prod no-bg">
                                                <div className="sel-prod-top">
                                                    <h4>Product Name</h4>
                                                </div>
                                                {/* <span className="skel-plans-price mt-0">Product Benefits</span> */}
                                                {/* <span className="skel-plans-price mt-0">Contract</span> */}
                                                {/* <span className="skel-plans-price mt-0">Quantity</span> */}
                                                <span className="skel-plans-price mt-0">RC</span>
                                                <span className="skel-plans-price mt-0">NRC</span>
                                                <span>&nbsp;</span>
                                            </div>
                                        </div>
                                        <div className="sel-scroll-prod">
                                            {selectedCard && selectedCard.map((x) => {
                                                return (
                                                    <div className="selected-prod-header">
                                                        <div className="sect-top-prod">
                                                            {x.productCategory !== 'PC_BUNDLE' &&
                                                                <div className="sel-prod-top">
                                                                    <h4>{x?.productName}</h4>
                                                                    <span>Product Type: {x?.productTypeDescription?.description}</span>
                                                                    <span>Product Category: {x?.productCategoryDesc?.description}</span>
                                                                    <span>Service Type: {x?.serviceTypeDescription?.description}</span>
                                                                </div>
                                                            }
                                                            {/* <span className="skel-plans-price mt-0">{'-'}</span>
                                                            <span className="skel-plans-price mt-0">{Number(x?.quantity)}</span> */}
                                                            <span className="skel-plans-price mt-0">{x?.currency} {Number(x?.totalRc).toFixed(2)}</span>
                                                            <span className="skel-plans-price mt-0">{x?.currency} {Number(x?.totalNrc).toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-12 col-xs-12 skel-cr-rht-sect-form">
                                <div className="skel-sel-products">
                                    {/* <h4>Total</h4> */}
                                    <div className="">
                                        <div className="sect-bottom-prod">
                                            {agreementDetail?.paymentImpact && (
                                                <table>
                                                    <tbody>
                                                        <tr>
                                                            <td colSpan={2} className="text-center"><strong>Payment Information</strong></td>
                                                        </tr>
                                                        <tr>
                                                            <td className="txt-right">Total RC</td>
                                                            <td>{selectedCard?.[0]?.currency} {Number(selectedCard?.[0]?.totalRc).toFixed(2)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="txt-right">Total NRC</td>
                                                            <td>{selectedCard?.[0]?.currency} {Number(selectedCard?.[0]?.totalNrc).toFixed(2)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="txt-right">Penalty</td>
                                                            <td>{agreementDetail?.chargeDtl?.currency} {Number(agreementDetail?.chargeDtl?.chargeAmount || 0).toFixed(2)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="txt-right">Discount</td>
                                                            <td>{selectedCard?.[0]?.currency} {Number(selectedCard?.[0]?.totalDiscount || 0).toFixed(2)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="txt-right" style={{ fontSize: "18px", fontWeight: "600" }}>Total</td>
                                                            <td style={{ fontSize: "18px", fontWeight: "600" }}>{selectedCard?.[0]?.currency} {Number(selectedCard?.[0]?.totalRc + (Number(agreementDetail?.chargeDtl?.chargeAmount) || 0) + selectedCard?.[0]?.totalNrc).toFixed(2)}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {agreementDetail?.contractImpact && (
                            <React.Fragment>
                                <div className="col-md-12">
                                    <label htmlFor="remarks" className="control-label">Existing Contract</label>
                                    <div id="datatable_1">
                                        <DynamicTable
                                            listKey={"Contract History"}
                                            row={existingContracts}
                                            rowCount={totalCount}
                                            header={ContractCols}
                                            itemsPerPage={perPage}
                                            backendPaging={false}
                                            isScroll={false}
                                            hideFooter={true}
                                            backendCurrentPage={currentPage}
                                            isTableFirstRender={isTableFirstRender}
                                            hasExternalSearch={hasExternalSearch}
                                            handler={{
                                                handleCellRender: handleCellRender,
                                                handlePageSelect: handlePageSelect,
                                                handleItemPerPage: setPerPage,
                                                handleCurrentPage: setCurrentPage,
                                                handleFilters: () => { }
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <label htmlFor="remarks" className="control-label">Future Contract will be as follow:</label>
                                    <div id="datatable_2">
                                        <DynamicTable
                                            listKey={"Contract History"}
                                            row={futureContracts}
                                            rowCount={totalCount}
                                            header={ContractCols}
                                            itemsPerPage={perPage}
                                            backendPaging={false}
                                            isScroll={false}
                                            hideFooter={true}
                                            backendCurrentPage={currentPage}
                                            isTableFirstRender={isTableFirstRender}
                                            hasExternalSearch={hasExternalSearch}
                                            handler={{
                                                handleCellRender: handleCellRender,
                                                handlePageSelect: handlePageSelect,
                                                handleItemPerPage: setPerPage,
                                                handleCurrentPage: setCurrentPage,
                                                handleFilters: () => { }
                                            }}
                                        />
                                    </div>
                                </div>
                            </React.Fragment>
                        )}
                        {agreementDetail?.benefitsImpact && (
                            <React.Fragment>
                                <div className="col-md-12">
                                    <label htmlFor="remarks" className="control-label">Existing Benefits</label>
                                    <div id="datatable_3">
                                        {/* .filter(f => c === Number(f?.contract))? */}
                                        <table role="table" className="table table-responsive table-striped dt-responsive nowrap w-100 skel-cust-table-dyn" style={{ textAlign: 'center', marginLeft: '0px' }}>
                                            <thead>
                                                <tr role="row">
                                                    <th colSpan="1" role="columnheader">
                                                        <div className="skel-dyn-header-label">
                                                            <span>Benefit</span>
                                                            <span className="skel-table-filter-dynamic"></span>
                                                        </div>
                                                    </th>
                                                    <th colSpan="1" role="columnheader">
                                                        <div className="skel-dyn-header-label">
                                                            <span>Value</span>
                                                            <span className="skel-table-filter-dynamic"></span>
                                                        </div>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody role="rowgroup">
                                                {manageServiceRef?.current?.productBenefit?.length > 0 ? manageServiceRef?.current?.productBenefit?.map((m) => (
                                                    m.benefits?.map((v, k) => (
                                                        <tr role="row" key={k} className="">
                                                            <td><span>{productBenefitLookup.find(b => b.code === v.selectedValue)?.description}</span></td>
                                                            <td><span>{v.description}</span></td>
                                                        </tr>
                                                    ))
                                                )) : (
                                                    <tr role="row" className="">
                                                        <td colSpan={2} style={{ textAlign: 'center' }}>No benefits found</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <label htmlFor="remarks" className="control-label">Future Benefits will be as follow:</label>
                                    <div id="datatable_4">
                                        {/* .filter(f => c === Number(f?.contract))? */}
                                        <table role="table" className="table table-responsive table-striped dt-responsive nowrap w-100 skel-cust-table-dyn" style={{ textAlign: 'center', marginLeft: '0px' }}>
                                            <thead>
                                                <tr role="row">
                                                    <th colSpan="1" role="columnheader">
                                                        <div className="skel-dyn-header-label">
                                                            <span>Benefit</span>
                                                            <span className="skel-table-filter-dynamic"></span>
                                                        </div>
                                                    </th>
                                                    <th colSpan="1" role="columnheader">
                                                        <div className="skel-dyn-header-label">
                                                            <span>Value</span>
                                                            <span className="skel-table-filter-dynamic"></span>
                                                        </div>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody role="rowgroup">
                                                {selectedCard?.[0]?.productBenefit?.length > 0 ? selectedCard?.[0]?.productBenefit?.map((m) => (
                                                    m.benefits?.map((v, k) => (
                                                        <tr role="row" key={k} className="">
                                                            <td><span>{productBenefitLookup.find(b => b.code === v.selectedValue)?.description}</span></td>
                                                            <td><span>{v.description}</span></td>
                                                        </tr>
                                                    ))
                                                )) : (
                                                    <tr role="row" className="">
                                                        <td colSpan={2} style={{ textAlign: 'center' }}>No benefits found</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </React.Fragment>
                        )}
                        <div className="col-md-12">
                            <div className="form-group">
                                <label htmlFor="remarks" className="control-label">
                                    Terms and Conditions{" "}
                                    <span className="text-danger font-20 pl-1 fld-imp">*</span>
                                </label>
                                <span readOnly={true} className="form-control" style={{ height: "100%", maxHeight: "150px", overflowY: "scroll", display: "table" }} dangerouslySetInnerHTML={{ __html: agreementDetail?.termsContent }}></span>
                            </div>
                        </div>

                        <div className="custom-control custom-checkbox">
                            <input
                                type="checkbox"
                                className="custom-control-input"
                                id="isAgreed"
                                checked={selectedCard?.[0]?.isAgreed === "Y" ? true : false}
                                onChange={(e) =>
                                    setSelectedCard([
                                        {
                                            ...selectedCard?.[0],
                                            isAgreed: e.target.checked ? "Y" : "N",
                                        }
                                    ])
                                }
                            />
                            <label className="custom-control-label" htmlFor="isAgreed">I Agree with the below terms and conditions</label>
                        </div>
                        <br />
                        <p>
                            By checking the above checkbox you agree with the terms and
                            conditions
                        </p>
                        <hr className="cmmn-hline" />
                        {selectedCard?.[0]?.isAgreed === "Y" && <div className="form-group">
                            <label htmlFor="sign" className="control-label">
                                E-signature
                            </label>
                            <br />
                            <SignaturePad
                                ref={sigPad}
                                canvasProps={{
                                    width: 400,
                                    height: 100,
                                    className: "sign-canvas",
                                }}
                            />
                            <button
                                className="btn waves-effect waves-light btn-secondary"
                                onClick={clearSignature}
                                id="sign-clearBtn"
                            >
                                Clear Signature
                            </button>
                            <span className="errormsg"></span>
                        </div>}
                    </div>
                    <div className="d-flex justify-content-center pt-2">
                        <button type="button" className="skel-btn-cancel" onClick={() => setCustomerTerm(false)}>Back to Product</button>
                        <button type="button" disabled={selectedCard?.[0]?.isAgreed !== "Y"} className="skel-btn-submit" onClick={() => handleSubmit()}>Submit</button>
                    </div>
                </div>
            }
        </div >
    )
}

export default UpgradeDowngradeTabPane;