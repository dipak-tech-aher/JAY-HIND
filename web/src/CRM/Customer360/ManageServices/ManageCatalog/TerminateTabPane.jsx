import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { string, object } from "yup";
import { toast } from 'react-toastify';
import { get, put, post } from '../../../../common/util/restUtil';
import { properties } from "../../../../properties";
import moment from "moment";

const TerminateTabPane = (props) => {
    const { manageServiceRef, selectedAccount, serviceBadge, interactionTerminationData } = props?.data
    const { setIsManageServicesOpen, pageRefresh } = props.handlers;
    const type = manageServiceRef.current?.source ? manageServiceRef.current?.source : ''

    const { t } = useTranslation();
    const initialState = {
        terminationReason: "",
        refundDeposit: "N",
        contractFeesWaiver: "N"
    };
    const [terminationReason, setTerminationReason] = useState([]);
    const [terminationData, setTerminationData] = useState(initialState);

    useEffect(() => {
        get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam=SERVICE_TERMINATION_REASON')
            .then((response) => {
                if (response.data) {
                    setTerminationReason(response.data.SERVICE_TERMINATION_REASON);
                }
            })
            .catch(error => {
                console.error(error);
            }).finally()
    }, [])

    const handleSubmit = () => {
        if (!terminationReason?.map(x => x.description)?.includes(terminationData.terminationReason)) {
            toast.error("Please select a termination reason"); return;
        }

        console.log(manageServiceRef?.current);

        // For Create Order
        const list = []
        console.log(4);
        let totalAmount = 0
        
        let ordeReqObj = {
            orderFamily: "OF_PHYCL",
            orderMode: "ONLINE",
            billAmount: 0,
            orderDescription: "Sign out Order",
            serviceType: manageServiceRef?.current?.srvcTypeDesc?.code,
            accountUuid: manageServiceRef?.current?.accountUuid,
            serviceUuid: manageServiceRef?.current?.serviceUuid,
            rcAmount: 0,
            nrcAmount: 0,
            upfrontCharge: 'N',
            advanceCharge: 'N',
            contactPreference: [
                "CHNL004"
            ],
            product: [{
                productId: parseInt(manageServiceRef?.current?.planPayload),
                productQuantity: 1,
                productAddedDate: moment().format('YYYY-MM-DD hh:mm:ss'),
                billAmount: 0,
                edof: moment().format('YYYY-MM-DD'),
                productSerialNo: manageServiceRef?.current?.productDetails?.[0]?.productNo,
                bundleId: null,
                isBundle: false
                // rcAmount: x?.totalRc,
                // nrcAmount: x?.totalNrc
            }]
        }

        list.push(ordeReqObj)

        console.log(5);
        const orderObj = {
            customerUuid: manageServiceRef?.current?.customerUuid,
            orderCategory: "OC_E",
            orderSource: "CC",
            orderType: 'OT_SO',
            orderChannel: "WALKIN",
            //orderCause: "CHNL024",
            orderPriority: "PRTYHGH",
            billAmount: totalAmount,
            orderDescription: terminationData.terminationReason,
            order: list,
        }

        console.log('orderObj ------------->', orderObj)

        post(properties.ORDER_API + '/create', orderObj)
            .then((resp) => {
                if (resp.data) {
                    if (resp.status === 200) {
                        // toast.success(resp.message);
                        toast.success(`Service termination order raised successfully - #${resp?.data?.orderId}`)
                        // props.history.push(`${process.env.REACT_APP_BASE}/view-customer`);
                        setIsManageServicesOpen(false)
                        pageRefresh()
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

    return (
        <div className="tab-pane">
            <div className="card p-0 border" >
                <section className="triangle">
                    <div className="row col-12">
                        <h5 id="list-item-2" className="pl-1">Termination</h5>
                    </div>
                </section>
                <div className="row">
                    <div className="col-12">
                        <div className="p-2">
                            <div className="">
                                {
                                    !['TERMINATE'].includes(serviceBadge) ?
                                        <fieldset className="scheduler-border1">
                                            <form id="address-form">
                                                <div className="row">
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="flatHouseUnitNo" className="col-form-label">Terminate Reason<span>*</span></label>
                                                            <select id="serviceNumberGroup" className="form-control"
                                                                value={terminationData.terminationReason}
                                                                onChange={(e) => {
                                                                    setTerminationData({ ...terminationData, terminationReason: e.target.value });
                                                                }}
                                                            >
                                                                <option value="">Select Reason</option>
                                                                {terminationReason && terminationReason.map((e) => (
                                                                    <option key={e.code} value={e.description}>{e.description}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    {/* <div className="col-md-4">
                                                    <div className="form-group">
                                                        <br></br> <br></br>
                                                        <div className="custom-control custom-checkbox">
                                                            <input type="checkbox"
                                                                    value={terminationData.refundDeposit}
                                                                    checked={terminationData.refundDeposit === 'Y' ? true : false}
                                                                    onChange={(e) => setTerminationData({ ...terminationData, refundDeposit: e.target.checked ? 'Y' : 'N' })}
                                                                    className="custom-control-input" id="checkbox-signin" />
                                                                <label className="custom-control-label" htmlFor="checkbox-signin">{t("refund_deposite")}</label>
                                                            </div>
                                                    </div>
                                                    <span className="errormsg">{terminationDataError.refundDeposit ? terminationDataError.refundDeposit : ""}</span>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <br></br> <br></br>
                                                        <div className="custom-control custom-checkbox">
                                                            <input type="checkbox"
                                                                value={terminationData.contractFeesWaiver}
                                                                checked={terminationData.contractFeesWaiver === 'Y' ? true : false}
                                                                onChange={(e) => setTerminationData({ ...terminationData, contractFeesWaiver: e.target.checked ? 'Y' : 'N' })}
                                                                className="custom-control-input" id="checkbox-signin2" />
                                                            <label className="custom-control-label" htmlFor="checkbox-signin2">{t("contract_fees_waiver")}</label>
                                                        </div>
                                                    </div>
                                                    <span className="errormsg">{terminationDataError.contractFeesWaiver ? terminationDataError.contractFeesWaiver : ""}</span>
                                                </div> */}
                                                </div>
                                            </form>
                                            <div className="row justify-content-center mt-3">
                                                <button type="button" className="btn btn-primary mr-2" onClick={handleSubmit}>Submit</button>
                                                <button type="button" className=" btn btn-secondary waves-effect waves-light" onClick={() => setIsManageServicesOpen(false)}>Close</button>
                                            </div>
                                        </fieldset>
                                        :
                                        <fieldset className="scheduler-border1">
                                            <h5 className="errormsg ml-2">Termination not available, another Service Request is in process</h5>
                                            <legend className="scheduler-border scheduler-box"> {t("termination_reason")}</legend>
                                            <form id="address-form">
                                                <div className="row">
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="flatHouseUnitNo" className="col-form-label">Terminate Reason<span>*</span></label>
                                                            <select id="serviceNumberGroup" className="form-control" disabled="true"
                                                                value={interactionTerminationData[0]?.terminateReason}
                                                            >
                                                                <option value="">Select Reason</option>
                                                                {
                                                                    terminationReason && terminationReason.map((e) => (
                                                                        <option key={e.code} value={e.description}>{e.description}</option>
                                                                    ))
                                                                }
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <br></br> <br></br>
                                                            <div className="custom-control custom-checkbox">
                                                                <input type="checkbox"
                                                                    value={interactionTerminationData && interactionTerminationData[0]?.refundDeposit}
                                                                    checked={interactionTerminationData && interactionTerminationData[0]?.refundDeposit === 'Y' ? true : false}
                                                                    disabled="true"
                                                                    className="custom-control-input" id="checkbox-signin" />
                                                                <label className="custom-control-label" htmlFor="checkbox-signin">{t("refund_deposite")}</label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <br></br> <br></br>
                                                            <div className="custom-control custom-checkbox">
                                                                <input type="checkbox"
                                                                    value={interactionTerminationData && interactionTerminationData[0]?.contractFeesWaiver}
                                                                    checked={interactionTerminationData && interactionTerminationData[0]?.contractFeesWaiver === 'Y' ? true : false}
                                                                    disabled="true"
                                                                    className="custom-control-input" id="checkbox-signin2" />
                                                                <label className="custom-control-label" htmlFor="checkbox-signin2">{t("contract_fees_waiver")}</label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </form>
                                        </fieldset>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default TerminateTabPane