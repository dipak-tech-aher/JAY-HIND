import React, { useEffect, useState } from 'react'
import ReactModal from 'react-modal'
import { properties } from '../properties'
import { get } from '../common/util/restUtil'

import moment from 'moment'
import { RegularModalCustomStyles, USNumberFormat } from '../common/util/util'
import ChargeListView from './chargeListView'

const PreviewModal = (props) => {
    
    const [modalData, setModalData] = useState({
        name: "",
        serviceType: "",
        activationDate: "",
        expiryDate: "",
        status: "",
        volumeAllowed: "",
        multipleSelection: "",
        mandatoryCheck: "",
        chargeList: []
    })
    const [chargeList, setChargeList] = useState([])

    const isOpen = props.data.isOpen
    const { setIsOpen, productBenefitLookup } = props.handler
    const { data } = props.data
    const module = props.data.module

    useEffect(() => {
        get(properties.CHARGE_API + "/search/all")
            .then((resp) => {
                if (resp.data.length > 0) {
                    setChargeList(resp.data)
                }
            }).catch(error => console.log(error))
    }, [])

    const getChargeDetails = (list) => {

        !!list.length && list.map((charge) => {
            chargeList.map((chargeNode) => {
                if (Number(charge.chargeId) === Number(chargeNode.chargeId)) {
                    charge["chargeName"] = chargeNode?.chargeName
                    charge["chargeType"] = chargeNode?.chargeCat
                    charge["chargeTypeDesc"] = chargeNode?.chargeCatDesc?.description
                    charge["currency"] = chargeNode?.currency
                    charge["currencyDesc"] = chargeNode?.currencyDesc?.description
                    charge["changesApplied"] = charge?.changesApplied !== '' ? charge?.changesApplied : 'N'
                    charge["prorated"] = charge?.prorated !== '' ? charge?.prorated : 'N'
                }
            })
        })
        return list
    }

    useEffect(() => {

        if (module === 'Product') {
            console.log('data is ', data)
            let fullChargeList = getChargeDetails(data?.productChargesList || [])

            setModalData({
                ...modalData,
                ...data,
                chargeList: fullChargeList
            })

        }
    }, [chargeList])

    return (
        <>
            <ReactModal isOpen={isOpen} style={RegularModalCustomStyles}>
                <>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title">View Product - {modalData?.productName}</h4>
                                <button type="button" className="close" onClick={() => setIsOpen(false)}>×</button>
                            </div>

                            <div className="modal-body p-0" >

                                <div className="col-12 p-0">
                                    <section className="triangle"><h5 id="list-item-1" className="pl-2">Product Details</h5></section>
                                </div>
                                <div className="form-row p-2">
                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label for="Surname" className="col-form-label">Product Category</label>
                                            <p>{modalData?.productCategoryDesc?.description}</p>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label for="Surname" className="col-form-label">Product Type</label>
                                            <p>{modalData?.productTypeDescription?.description}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-12 p-0">
                                    <section className="triangle"><h5 id="list-item-1" className="pl-2">Sub Type and Service Type Details</h5></section>
                                </div>
                                <div className="col-12 p-2">
                                    <div className="form-row p-2">
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label for="customerTitle" className="col-form-label">Product Sub Type</label>
                                                <p>{modalData?.productSubTypeDesc?.description}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label for="Surname" className="col-form-label">Service Type</label>
                                                <p>{modalData?.serviceTypeDescription?.description}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label for="Surname" className="col-form-label">Product Subcategory</label>
                                                <p>{modalData?.productSubCategoryDesc?.description}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label for="Surname" className="col-form-label">Provisioning Type</label>
                                                <p>{modalData?.provisioningTypeDesc?.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 p-0">
                                    <section className="triangle"><h5 id="list-item-1" className="pl-2">Product Class and Charge Details</h5></section>
                                </div>
                                <div className="col-12 row p-2">
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label for="Surname" className="col-form-label">Service Class</label>
                                            <p>{modalData?.serviceClassDesc?.description}</p>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label for="Surname" className="col-form-label">Product Class</label>
                                            <p>{modalData?.productClassDesc?.description}</p>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label for="Surname" className="col-form-label">UOM</label>
                                            <p>{modalData?.uomCategoryDesc?.description}</p>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label for="Surname" className="col-form-label">Activation Date</label>
                                            <p>{modalData?.activationDate}</p>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label for="Surname" className="col-form-label">Expirty Date</label>
                                            <p>{modalData?.expiryDate}</p>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label for="Surname" className="col-form-label">Is Appointment Required</label>
                                            <p>{modalData?.isAppointRequired === 'Y' ? 'Yes' : 'No'}</p>
                                        </div>
                                    </div>                                   
                                    {
                                        modalData.contractFlag == 'Y' &&
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <table width={"100%"} border={"1px solid"}>
                                                    <thead>
                                                        <tr>
                                                            <th>Contract Duration</th>
                                                            {modalData.contractList.map((duration, index) => (
                                                                <th key={index}>{duration} Months</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>Product Benefits</td>
                                                            {modalData.productBenefit.map((benefits, index) => {
                                                                return (
                                                                    <td key={index}>
                                                                        {benefits?.benefits?.map((value, key) => (
                                                                            <p key={key}>{productBenefitLookup.find(f => f.code === value.selectedValue).description} : {value.description}</p>
                                                                        ))}
                                                                    </td>
                                                                )
                                                            }
                                                            )}
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    }
                                    {
                                        modalData.contractFlag == 'N' &&
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <table width={"100%"} border={"1px solid"}>
                                                    <thead>
                                                        <tr>
                                                            <th>Product Benefits</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            {modalData?.productBenefit?.map((benefits, index) => {
                                                                return (
                                                                    <td key={index}>
                                                                        {Array.isArray(benefits) ? (
                                                                            benefits.map((value, key) => (
                                                                                <p key={key}>
                                                                                    {productBenefitLookup.find((f) => f.code === value.selectedValue)?.description} : {value?.description}
                                                                                </p>
                                                                            ))
                                                                        ) : (
                                                                            <p>
                                                                                {productBenefitLookup.find((f) => f.code === benefits.selectedValue)?.description} : {benefits?.description}
                                                                            </p>
                                                                        )}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    }

                                    <div className="col-md-12">
                                        <label for="Surname" className="col-form-label">Charge Details</label>

                                        {
                                            modalData.chargeList && !!modalData.chargeList.length &&
                                            <div className="data-scroll1" style={{ width: "100%", maxHeight: "350px", border: "1px solid #ccc", overflowX: "hidden", overflowY: "auto", whiteSpace: "nowrap" }}>
                                                {
                                                    modalData.chargeList && !!modalData.chargeList.length && modalData.chargeList.map((charge, index) => (
                                                        
                                                        <>
                                                        {console.log('chargecharge', charge)}
                                                            <div id="charges-done" key={index}>
                                                                <fieldset className="scheduler-border p-10">
                                                                    <div className="col-12 row ml-1">
                                                                        <div className="col-md-2 pl-0">
                                                                            <div className="form-group">
                                                                                <label htmlFor="Surname" className="col-form-label">Charge Name</label>
                                                                                <p>{charge?.chargeName}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-md-2">
                                                                            <div className="form-group">
                                                                                <label htmlFor="Surname" className="col-form-label">Charge Type</label>
                                                                                <p>{charge?.chargeTypeDesc}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-md-2">
                                                                            <div className="form-group">
                                                                                <label htmlFor="Surname" className="col-form-label">Currency</label>
                                                                                <p>{charge?.currencyDesc}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-md-2">
                                                                            <div className="form-group">
                                                                                <label htmlFor="Surname" className="col-form-label">Charge Amount</label>
                                                                                <p>{Number(charge?.chargeAmount).toFixed(2)}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-md-2">
                                                                            <div className="form-group">
                                                                                <label htmlFor="Surname" className="col-form-label">Frequency</label>
                                                                                <p>{charge?.frequencyDesc ? charge?.frequencyDesc?.description : charge.chargeType === 'CC_NRC' ? 'One Time' : '-'}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-md-2">
                                                                            <div className="form-group">
                                                                                <label htmlFor="Surname" className="col-form-label">Prorated</label>
                                                                                <p>{charge?.prorated === 'Y' ? 'Yes' : charge?.prorated === 'N' ? 'No' : ''}</p>
                                                                            </div>
                                                                        </div>											
                                                                    </div>
                                                                    <div className="col-12 row ml-0">
                                                                        <div className="col-md-2">
                                                                            <div className="form-group">
                                                                                <label htmlFor="Surname" className="col-form-label">Billing Start Cycle</label>
                                                                                <p>{charge?.billingEffective}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-md-2">
                                                                            <div className="form-group">
                                                                                <label htmlFor="Surname" className="col-form-label">Advance Charge</label>
                                                                                <p>{charge?.advanceCharge === 'Y' ? 'Yes' : 'No' }</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-md-2">
                                                                            <div className="form-group">
                                                                                <label htmlFor="Surname" className="col-form-label">Charge Upfront</label>
                                                                                <p>{charge?.chargeUpfront === 'Y' ? 'Yes' : 'No'}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-md-2">
                                                                            <div className="form-group">
                                                                                <label htmlFor="Surname" className="col-form-label">Start Date</label>
                                                                                <p>{moment(charge?.startDate).format('DD MMM YYYY')}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-md-2">
                                                                            <div className="form-group">
                                                                                <label htmlFor="Surname" className="col-form-label">End Date</label>
                                                                                <p>{charge?.endDate ? moment(charge?.endDate).format('DD MMM YYYY') : ''}</p>
                                                                            </div>
                                                                        </div>                                                                   
                                                                    </div>
                                                             
                                                                </fieldset>
                                                            </div>
                                                        </>
                                                    ))
                                                }
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </>
            </ReactModal>
        </>
    )
}

export default PreviewModal
