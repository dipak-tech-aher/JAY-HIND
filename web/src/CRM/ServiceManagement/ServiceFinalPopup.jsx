import React, { useEffect, useState } from 'react'
import Modal from 'react-modal';
import { RegularModalCustomStyles } from '../../common/util/util';
import { get } from '../../common/util/restUtil';
import { properties } from '../../properties';
import { toast } from 'react-toastify';
import { isEmpty } from 'lodash'
import promotionLogo from '../../assets/images/promo_logo.png'

const ServiceDetailsPopup = (props) => {

    const { isOpen, selectedProductList, serviceData, productBenefitLookup } = props?.data;
    const { setIsOpen, setSelectedProductList, handleDeleteProduct, handleServicePopupSubmit, setServiceData } = props?.handler

    const [promoList, setPromoList] = useState([])
    const [oldSelectedProductList, setOldSelectedProductList] = useState(selectedProductList)
    const [promoAppliedList, setPromoAppliedList] = useState([])
    const [promoAmount, setPromoAmount] = useState(0)
    const [appliedPromoData, setAppliedPromoData] = useState([])

    useEffect(() => {
        get(properties.PRODUCT_API + '/promo-details').then((resp) => {
            if (resp.status === 200) {
                console.log('prmo list ', resp.data)
                setPromoList(resp.data)
            }
        }).catch((error) => {
            console.log(error)
        })
    }, [])

    // console.log('serviceData=========', serviceData)

    const applyPromo = () => {

        const promo = promoList.filter(m => m.promoCode === serviceData.promoCode)

        if (isEmpty(promo)) {
            toast.error('Promo code not valid')
            return false
        }

        // console.log('promo=========', promo)
        if (promo.some(f => promoAppliedList.includes(f.promoCode))) {
            toast.error('Promo code already applied')
            return false
        }

        if (!promo.some(f => promoAppliedList.includes(f.promoCode)) && promoAppliedList.length > 0 && (promo.filter(f => f.allowWithOtherPromo == 'N').length > 0)) {
            toast.error('This Promo code cannot be applied with other promo codes')
            return false
        }

        // if(selectedProductList.find(f=> f).productCategory === 'PC_BUNDLE'){
        //     toast.error('Promo code cannot be applied to Bundle products')
        //     return false
        // }
        const selectedProductIds = selectedProductList.map(m => m.productId)
        const promoProductIds = promo.flatMap(p => p.promoDtl.map(d => d.productId))

        if (!selectedProductIds.some(id => promoProductIds.includes(Number(id)))) {
            toast.error('There is no matching product to apply this promo code');
            return false;
        }

        setAppliedPromoData([...appliedPromoData, ...promo])

        const benefits = promo.map(m => {
            return {
                promoDtl: m.promoDtl,
                productBenefit: m.productBenefit
            }
        })
        const charge = promo.map(m => m.promoCharge)
        const contractPromo = promo.map(m => {
            return {
                promoDtl: m.promoDtl,
                contractList: m.contractList
            }
        })

        let promoAmt = 0

        setPromoAppliedList([...promoAppliedList, serviceData.promoCode])

        const applyChargePromo = selectedProductList.map((prod) => {
            if (charge && charge.length > 0) {
                // const promoCharge = charge[0].find((prom) => prod.productId == prom.productId && prod.chargeType == prom.chargeType)?.chargeAmount;
                const promoCharge = charge[0].find((prom) => prod.productId == prom.productId);
                if (promoCharge && !promoAppliedList.some(f => f === serviceData?.promoCode)) {
                    let rcAmount = prod.totalRc, nrcAmount = prod.totalNrc, oldRcAmount = 0, oldNrcAmount = 0, rcPromoAmount = 0, nrcPromoAmount = 0
                    for (const item of prod.productChargesList) {
                        const { chargeCat } = item.chargeDetails;

                        console.log(chargeCat, prod.totalNrc, promoCharge.chargeAmount)

                        if (chargeCat && (!item.objectReferenceId || item.objectReferenceId === null)) {
                            if (chargeCat === 'CC_RC' && promoCharge.chargeType === 'CC_RC') {
                                rcAmount = Number(prod.totalRc) - Number(promoCharge.chargeAmount)
                                oldRcAmount = Number(prod.totalRc)
                                rcPromoAmount = Number(promoCharge.chargeAmount)

                                promoAmt += Number(promoCharge.chargeAmount)

                            } else if (chargeCat === 'CC_NRC' && promoCharge.chargeType === 'CC_NRC') {

                                nrcAmount = Number(prod.totalNrc) - Number(promoCharge.chargeAmount);
                                oldNrcAmount = Number(prod.totalNrc)
                                nrcPromoAmount = Number(promoCharge.chargeAmount)

                                promoAmt += Number(promoCharge.chargeAmount)

                            }

                        }
                    }

                    return {
                        productId: prod.productId,
                        totalRc: rcAmount,
                        totalNrc: nrcAmount,
                        oldRcAmount,
                        oldNrcAmount,
                        rcPromoAmount,
                        nrcPromoAmount,
                        promoCode: [...promoAppliedList, serviceData.promoCode],
                        promoApplied: { productId: prod.productId, applied: true }
                    };
                }
            }
            return prod;
        });
        const applyContractBenefitsPromo = selectedProductList.map((prod) => {

            const prodBen = prod.productBenefit && prod.productBenefit.filter((f) => prod.selectedContract.includes(Number(f.contract)));
            let benefitArray = [], contractArray = [], updateSelectedContract = prod.selectedContract
            let promoApplied = false;
            if (benefits.filter(s => s.promoDtl.some(p => p.productId == prod.productId)).length > 0) {
                benefitArray = benefits.find(s => s.promoDtl.some(p => p.productId == prod.productId))?.productBenefit
            }
            if (contractPromo.filter(s => s.promoDtl.some(p => p.productId == prod.productId)).length > 0) {
                contractArray = contractPromo.find(s => s.promoDtl.some(p => p.productId == prod.productId))?.contractList
            }

            const oldProductBenefit = benefitArray?.length > 0 ? oldSelectedProductList.find(f => f.productId == prod.productId)?.productBenefit : prod.oldProductBenefit

            const updatedProdBen = prodBen && prodBen.map((item) => {
                if (Array.isArray(item.benefits) && benefitArray && benefitArray.length > 0) {
                    promoApplied = true;
                    const updatedBenefits = item.benefits.map((obj) => {
                        const { selectedValue, description } = obj;
                        //   console.log(`Selected Value: ${selectedValue}`);
                        //   console.log(`Description: ${description}`);
                        //   console.log('---');

                        const matchingBenefit = benefitArray.find((promoBen) => promoBen.selectedValue === selectedValue);
                        //   console.log('matchingBenefit ', matchingBenefit)
                        if (matchingBenefit) {
                            const existingDescription = Number(description);
                            const additionalDescription = Number(matchingBenefit.description);
                            return {
                                ...obj,
                                description: existingDescription + additionalDescription
                            };
                        } else {
                            return obj;
                        }

                    });

                    return {
                        ...item,
                        benefits: updatedBenefits
                    };

                } else {
                    return item;
                }
            });

            const oldSelectedContract = contractArray?.length > 0 ?
                oldSelectedProductList.find(f => f.productId === prod.productId)?.selectedContract :
                prod.oldSelectedContract;

            const updatedProdContract = updatedProdBen && updatedProdBen.map((item) => {
                if (contractArray && contractArray.length > 0 && item && item.contract) {
                    promoApplied = true;
                    updateSelectedContract = [Number(item.contract) - contractArray[0]]
                    return {
                        ...item,
                        contract: updateSelectedContract,
                    };
                } else {
                    return item;
                }
            });

            return {
                productId: prod.productId,
                oldProductBenefit: oldProductBenefit,
                promoContract: contractArray ? contractArray[0] : 0,
                promoBenefit: benefitArray,
                productBenefit: updatedProdContract,
                oldSelectedContract: oldSelectedContract,
                selectedContract: updateSelectedContract,
                promoCode: [...promoAppliedList, serviceData.promoCode],
                promoApplied: { productId: prod.productId, applied: promoApplied }
            };
        });

        // console.log('applyContractBenefitsPromoapplyContractBenefitsPromo ', applyContractBenefitsPromo)
        const combinedOutput = selectedProductList.map((prod) => {
            const promoAppliedChargeProduct = applyChargePromo.find((item) => item.productId == prod.productId);
            const promoAppliedBenefitProduct = applyContractBenefitsPromo.find((item) => item.productId == prod.productId);

            const promoApplied = promoAppliedChargeProduct && promoAppliedChargeProduct.promoApplied;
            const updatedPromoAppliedBenefitProduct = promoAppliedBenefitProduct && {
                ...promoAppliedBenefitProduct,
                // totalRc: promoAppliedChargeProduct.totalRc,
                // totalNrc: promoAppliedChargeProduct.totalNrc,
                // oldRcAmount: promoAppliedChargeProduct.oldRcAmount,
                // oldNrcAmount: promoAppliedChargeProduct.oldNrcAmount,
                // oldSelectedContract: promoAppliedBenefitProduct.oldSelectedContract,
                // oldProductBenefit: promoAppliedBenefitProduct.oldProductBenefit,
                promoApplied: promoAppliedBenefitProduct.promoApplied.applied ? promoAppliedBenefitProduct.promoApplied : promoApplied,
            };
            return {
                ...prod,
                ...(promoAppliedChargeProduct && { ...promoAppliedChargeProduct }),
                ...(updatedPromoAppliedBenefitProduct && { ...updatedPromoAppliedBenefitProduct }),
            };
        });

        console.log('combinedOutputcombinedOutputcombinedOutputcombinedOutput', combinedOutput)

        setPromoAmount(Number(promoAmount) + Number(promoAmt))
        setSelectedProductList(combinedOutput);
        setServiceData(({
            ...serviceData,
            totalDiscount: Number(promoAmount) + Number(promoAmt),
            total: (Number(serviceData.total) - Number(promoAmt)),
            promoCode: ''
        }))

    }

    const removePromo = (promoCode) => {
        // console.log('promoCode=====>', promoCode)
        // console.log('appliedPromoData=====>', appliedPromoData)
        const updateAppliedPromoList = promoAppliedList.filter(f => f != promoCode)
        setPromoAppliedList(updateAppliedPromoList)

        let promoAmt = 0
        const removeChargePromo = selectedProductList.map((prod) => {
            if (appliedPromoData && appliedPromoData.length > 0) {
                let promoCharge = 0
                appliedPromoData
                    .filter((prom) => {
                        const matchingCharge = prom.promoCharge.find(
                            (s) =>
                                Number(s.productId) === Number(prod.productId) &&
                                //prod.chargeType === s.chargeType &&
                                prom.promoCode === promoCode
                        );
                        return matchingCharge;
                    })
                    .map((prom) => prom.promoCharge.find(p => {
                        promoCharge = p?.chargeAmount
                    }))

                // console.log('promoChargepromoChargepromoChargepromoCharge', promoCharge)
                if (promoCharge) {
                    let rcAmount = prod.totalRc, nrcAmount = prod.totalNrc
                    for (const charge of prod.productChargesList) {
                        if (charge.chargeCat === 'CC_RC') {
                            rcAmount = Number(prod.totalRc) + Number(promoCharge);
                        } else {
                            nrcAmount = Number(prod.totalNrc) + Number(promoCharge);
                        }
                        setPromoAmount(Number(promoAmount) - Number(promoCharge))
                        promoAmt += promoCharge
                        return {
                            ...prod,
                            totalRc: rcAmount,
                            totalNrc: nrcAmount,
                            promoCode: updateAppliedPromoList,
                            promoApplied: { productId: prod.productId, applied: false }
                        };
                    }
                }
            }
            return prod;
        });

        // console.log('appliedPromoData=======', appliedPromoData)
        const removeContractBenefitPromo = selectedProductList.map((prod) => {
            const prodBen = prod.productBenefit && prod.productBenefit.filter((f) => prod.selectedContract.includes(Number(f.contract)));
            let benefitArray = [], contractArray = [], updateSelectedContract = prod.selectedContract
            if (appliedPromoData.filter(s => s.promoDtl.some(p => p.productId == prod.productId)).length > 0) {
                benefitArray = appliedPromoData.find(s => s.promoDtl.some(p => p.productId == prod.productId) && s.promoCode === promoCode)?.productBenefit
            }
            if (appliedPromoData.filter(s => s.promoDtl.some(p => p.productId == prod.productId)).length > 0) {
                contractArray = appliedPromoData.find(s => s.promoDtl.some(p => p.productId == prod.productId) && s.promoCode === promoCode)?.contractList
            }
            let promoApplied = true;
            // console.log('benefitArray ', benefitArray)
            // console.log('contractArray ', contractArray)
            if (appliedPromoData && appliedPromoData.length > 0) {
                const updatedProdBen = prodBen && prodBen.map((item) => {
                    if (benefitArray && benefitArray.length > 0 && Array.isArray(item.benefits)) {
                        promoApplied = false
                        const updatedBenefits = item.benefits.map((obj) => {
                            const { selectedValue, description } = obj;
                            let benefitVal = null
                            //  appliedPromoData.find((promo) => {
                            benefitArray.find((benefit) => {
                                // console.log('benefit ', benefit)
                                if (benefit.selectedValue === selectedValue) {
                                    benefitVal = benefit
                                }

                            })
                            // });

                            // console.log('benefitVal========', benefitVal)
                            if (benefitVal) {
                                const existingDescription = Number(description);
                                const additionalDescription = Number(benefitVal.description);

                                // Subtract the additionalDescription from the existingDescription
                                const newDescription = existingDescription - additionalDescription;
                                return {
                                    ...obj,
                                    description: newDescription
                                };
                            } else {
                                return obj;
                            }

                        });

                        return {
                            ...item,
                            benefits: updatedBenefits
                        };
                    } else {
                        return item;
                    }
                });

                // const contractPromo = appliedPromoData.find((promo) => promo).contractList

                const updatedProdContract = updatedProdBen && updatedProdBen.map((item) => {
                    if (item && item.contract && contractArray && contractArray.length > 0) {
                        promoApplied = false
                        updateSelectedContract = [Number(item.contract) + contractArray[0]]
                        return {
                            ...item,
                            contract: Number(item.contract) + contractArray[0],
                        };
                    }
                    return item;
                });

                return {
                    productId: prod.productId,
                    oldProductBenefit: prod.productBenefit,
                    productBenefit: updatedProdContract,
                    oldSelectedContract: prod.selectedContract,
                    selectedContract: updateSelectedContract,
                    promoCode: updateAppliedPromoList,
                    promoApplied: { productId: prod.productId, applied: promoApplied }
                };
            }

            return prod;
        });


        const combinedOutput = selectedProductList.map((prod) => {
            const removeChargePromoProduct = removeChargePromo.find((item) => item.productId == prod.productId);
            const removeContractBenefitPromoProduct = removeContractBenefitPromo.find((item) => item.productId == prod.productId);

            const promoApplied = removeChargePromoProduct && removeChargePromoProduct.promoApplied;
            const updatedPromoAppliedBenefitProduct = removeContractBenefitPromoProduct && {
                ...removeContractBenefitPromoProduct,
                promoApplied: !removeContractBenefitPromoProduct.promoApplied.applied ? removeContractBenefitPromoProduct.promoApplied : promoApplied,
            };

            return {
                ...prod,
                ...(removeChargePromoProduct && { ...removeChargePromoProduct }),
                ...(updatedPromoAppliedBenefitProduct && { ...updatedPromoAppliedBenefitProduct }),
            };
        });

        console.log('combinedOutputcombinedOutputcombinedOutputcombinedOutput', combinedOutput)

        setServiceData(({
            ...serviceData,
            totalDiscount: promoAmount,
            total: (Number(serviceData.total) + Number(promoAmt)),
            promoCode: ''
        }))

        setSelectedProductList(combinedOutput);
    }

    console.log('selectedProductList========', selectedProductList)
    return (
        <Modal isOpen={isOpen} onRequestClose={() => setIsOpen(false)} contentLabel="Followup Modal" style={RegularModalCustomStyles} shouldCloseOnOverlayClick={false}>
            <div className="modal-center" id="followhistoryModal" tabIndex="-1" role="dialog" aria-labelledby="followupModal" aria-hidden="true">
                <div className="modal-dialog " role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="followupModal">Please Find the summary of all products selected</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => setIsOpen(false)}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row col-md-12">
                                <div className="col-lg-9 col-md-12">
                                    <div className="skel-sel-products">
                                        <div className="add-prod-rht">
                                            <div className="skel-prod-heading-title">
                                                <div className="sect-top-prod no-bg">
                                                    <div className="sel-prod-top">
                                                        <h4>Product Name</h4>
                                                    </div>
                                                    <span className="skel-plans-price mt-0">Product Benefits</span>
                                                    <span className="skel-plans-price mt-0">Contract</span>
                                                    <span className="skel-plans-price mt-0">Quantity</span>
                                                    <span className="skel-plans-price mt-0">RC</span>
                                                    <span className="skel-plans-price mt-0">NRC</span>
                                                    <span>&nbsp;</span>
                                                </div>
                                            </div>
                                            <div className="sel-scroll-prod">
                                                {console.log('selectedProductList--------->', selectedProductList)}
                                                {selectedProductList && selectedProductList.map((x) => {
                                                    const modifiedProduct = x.selectedContract ? x.selectedContract.map((c, key) => {
                                                        const modifiedData = x.productCategory !== 'PC_BUNDLE' ? (
                                                            <>
                                                                {x.promoApplied && x.promoApplied.applied ?
                                                                    x.oldProductBenefit?.length > 0 && x.oldProductBenefit?.filter(f => x.oldSelectedContract.includes(Number(f.contract)) || c === Number(f?.contract)).map((m) => (
                                                                        m.benefits?.map((v, k) => (
                                                                            <React.Fragment key={k}>
                                                                                <span style={{ textDecoration: "line-through" }}>{productBenefitLookup.find(b => b.code === v.selectedValue)?.description} : {v.description}</span>
                                                                                <br />
                                                                            </React.Fragment>
                                                                        ))
                                                                    ))
                                                                    : null
                                                                }

                                                                {x.productBenefit?.filter(f => c === Number(f?.contract))?.map((m) => (
                                                                    m.benefits?.map((v, k) => (
                                                                        <React.Fragment key={k}>
                                                                            <span>{productBenefitLookup.find(b => b.code === v.selectedValue)?.description} : {v.description}</span>
                                                                            <br />
                                                                        </React.Fragment>
                                                                    ))
                                                                ))}
                                                            </>
                                                        ) : (
                                                            <>
                                                                {x.productBundleDtl.map(m => (
                                                                    m.productDtl?.productBenefit?.length > 0 && (
                                                                        <div className="product-benefits">
                                                                            {m.productDtl?.productBenefit.map((productBenefit, idx) => (
                                                                                productBenefit.benefits && productBenefit.benefits.length > 0 ? (
                                                                                    <span key={idx} className="tooltiptext">
                                                                                        {productBenefit.contract == c && productBenefit.benefits?.map((val, key) => (
                                                                                            <React.Fragment key={key}>
                                                                                                <span>{productBenefitLookup.find(b => b.code === val.selectedValue)?.description} : {val.description}</span>
                                                                                                <br />
                                                                                            </React.Fragment>
                                                                                        ))}
                                                                                    </span>
                                                                                ) : null
                                                                            ))}
                                                                        </div>
                                                                    )
                                                                ))}
                                                            </>
                                                        );

                                                        return (
                                                            <div className="selected-prod-header" key={key}>
                                                                {/* {x.promoApplied && x.promoApplied.applied && <img src={promotionLogo} width={100} height={70} />} */}
                                                                <div className="sect-top-prod">
                                                                    {x.productCategory !== 'PC_BUNDLE' ?
                                                                        <div className="sel-prod-top">
                                                                            {x.promoApplied && x.promoApplied.applied && <span class="skel-promo-applied"><i class="fas fa-percent"></i> Promo Applied</span>}
                                                                            <h4>{x?.productName}</h4>
                                                                            <span>Product Type: {x?.productTypeDescription?.description}</span>
                                                                            <span>Product Category: {x?.productCategoryDesc?.description}</span>
                                                                            <span>Service Type: {x?.serviceTypeDescription?.description}</span>
                                                                        </div>
                                                                        :
                                                                        <div className="sel-prod-top">
                                                                            <h4>{x.bundleName}</h4>
                                                                            {x?.productBundleDtl?.map((bundleDtl, idx) => {
                                                                                if (bundleDtl.productDtl) {
                                                                                    return (
                                                                                        <React.Fragment key={idx}>
                                                                                            <h4>{bundleDtl?.productDtl?.productName}</h4>
                                                                                            <span>Product Type: {bundleDtl?.productDtl?.productTypeDescription?.description}</span>
                                                                                            <span>Product Category: {bundleDtl?.productDtl?.productCategoryDesc?.description}</span>
                                                                                            <span>Service Type: {bundleDtl?.productDtl?.serviceTypeDescription?.description}</span>
                                                                                        </React.Fragment>
                                                                                    );
                                                                                }
                                                                            })}
                                                                        </div>
                                                                    }
                                                                    <div className="skel-plans-price mt-0" style={{ width: "50%" }}>
                                                                        {modifiedData}
                                                                    </div>
                                                                    <span className="skel-plans-price mt-0">
                                                                        {x.promoApplied && x.promoApplied.applied && x.oldSelectedContract && x.oldSelectedContract.length > 0 &&
                                                                            Number(x.oldSelectedContract[0]) != Number(c) &&
                                                                            <><span style={{ textDecoration: "line-through" }}>
                                                                                {Number(x.oldSelectedContract[0]) + ' Months' || '-'}
                                                                            </span><br />
                                                                            </>}
                                                                        {Number(c) + ' Months' || '-'}
                                                                    </span>
                                                                    <span className="skel-plans-price mt-0">{Number(x?.quantity)}</span>
                                                                    <span className="skel-plans-price mt-0">
                                                                        {x.oldRcAmount ? (x.oldRcAmount !== x?.totalRc) ? <><span style={{ textDecoration: "line-through" }}>{x?.currency} {x.oldRcAmount}</span><br /></> : <></> : <></>}
                                                                        {x?.currency} {Number(x?.totalRc).toFixed(2)}
                                                                    </span>
                                                                    <span className="skel-plans-price mt-0">
                                                                        {x.oldNrcAmount ? (x.oldNrcAmount !== x?.totalNrc) ? <><span style={{ textDecoration: "line-through" }}>{x?.currency} {x.oldNrcAmount}</span><br /></> : <></> : <></>}

                                                                        {x?.currency} {Number(x?.totalNrc).toFixed(2)}
                                                                    </span>
                                                                    <span>
                                                                        <a><i className="fa fa-times" onClick={() => handleDeleteProduct(x)}></i></a>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        );
                                                    }) : null;

                                                    return modifiedProduct || (
                                                        <div className="selected-prod-header">
                                                            {/* {x.promoApplied && x.promoApplied.applied && <img src={promotionLogo} width={100} height={70} />} */}
                                                            <div className="sect-top-prod">
                                                                {x.productCategory !== 'PC_BUNDLE' ?
                                                                    <div className="sel-prod-top">
                                                                        {x.promoApplied && x.promoApplied.applied && <span class="skel-promo-applied"><i class="fas fa-percent"></i> Promo Applied</span>}
                                                                        <h4>{x?.productName}</h4>
                                                                        <span>Product Type: {x?.productTypeDescription?.description}</span>
                                                                        <span>Product Category: {x?.productCategoryDesc?.description}</span>
                                                                        <span>Service Type: {x?.serviceTypeDescription?.description}</span>
                                                                    </div>
                                                                    :
                                                                    <div className="sel-prod-top">
                                                                        <h4>{x.bundleName}</h4>
                                                                        {x?.productBundleDtl?.map((bundleDtl, idx) => {
                                                                            if (bundleDtl.productDtl) {
                                                                                return (
                                                                                    <React.Fragment key={idx}>
                                                                                        <h4>{bundleDtl?.productDtl?.productName}</h4>
                                                                                        <span>Product Type: {bundleDtl?.productDtl?.productTypeDescription?.description}</span>
                                                                                        <span>Product Category: {bundleDtl?.productDtl?.productCategoryDesc?.description}</span>
                                                                                        <span>Service Type: {bundleDtl?.productDtl?.serviceTypeDescription?.description}</span>
                                                                                    </React.Fragment>
                                                                                );
                                                                            }
                                                                        })}
                                                                    </div>
                                                                }
                                                                <div className="skel-plans-price mt-0" style={{ width: "50%" }}>
                                                                    {(!x.promoApplied || !x.promoApplied.applied ?
                                                                        x.productBenefit?.length && x.productBenefit?.map((m) => (
                                                                            m.benefits?.map((v, k) => (
                                                                                <React.Fragment key={k}>
                                                                                    <span>{productBenefitLookup.find(b => b.code === v.selectedValue)?.description} : {v.description}</span>
                                                                                    <br />
                                                                                </React.Fragment>
                                                                            ))
                                                                        ))
                                                                        :
                                                                        x.oldProductBenefit?.map((m) => (
                                                                            m.benefits?.map((v, k) => (
                                                                                <React.Fragment key={k}>
                                                                                    <span>{productBenefitLookup.find(b => b.code === v.selectedValue)?.description} : {v.description}</span>
                                                                                    <br />
                                                                                </React.Fragment>
                                                                            ))
                                                                        )))

                                                                        || <>-</>
                                                                    }
                                                                </div>
                                                                {/* <div className="skel-plans-price mt-0" style={{ width: "50%" }}>
                                                                    {x.promoCode && x.promoCode.length > 0 ?
                                                                        x.productBenefit?.length && x.productBenefit?.map((m) => (
                                                                            m.benefits?.map((v, k) => (
                                                                                <React.Fragment key={k}>
                                                                                    <span>{productBenefitLookup.find(b => b.code === v.selectedValue)?.description} : {v.description}</span>
                                                                                    <br />
                                                                                </React.Fragment>
                                                                            ))
                                                                        ))
                                                                        :
                                                                        <>-</>
                                                                    }
                                                                </div> */}
                                                                <span className="skel-plans-price mt-0">{'-'}</span>
                                                                <span className="skel-plans-price mt-0">{Number(x?.quantity)}</span>
                                                                <span className="skel-plans-price mt-0">
                                                                    {x.oldRcAmount ? (x.oldRcAmount !== x?.totalRc) ? <><span style={{ textDecoration: "line-through" }}>{x?.currency} {x.oldRcAmount}</span><br /></> : <></> : <></>}
                                                                    {x?.currency} {Number(x?.totalRc).toFixed(2)}
                                                                </span>
                                                                <span className="skel-plans-price mt-0">
                                                                    {x.oldNrcAmount ? (x.oldNrcAmount !== x?.totalNrc) ? <><span style={{ textDecoration: "line-through" }}>{x?.currency} {x.oldNrcAmount}</span><br /></> : <></> : <></>}

                                                                    {x?.currency} {Number(x?.totalNrc).toFixed(2)}
                                                                </span>
                                                                <span><a><i className="fa fa-times" onClick={() => handleDeleteProduct(x)}></i></a></span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}

                                            </div>
                                        </div>
                                    </div>

                                </div>
                                <div className="col-lg-3 col-md-12">
                                    <div className="skel-sel-products">
                                        <div className="sect-bottom-prod">
                                            <table>
                                                <tbody>
                                                    <tr>
                                                        <td className="txt-right">Total RC</td>
                                                        <td>{selectedProductList?.[0]?.currency} {Number(serviceData?.totalRc).toFixed(2)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="txt-right">Total NRC</td>
                                                        <td>{selectedProductList?.[0]?.currency} {Number(serviceData?.totalNrc).toFixed(2)}</td>
                                                    </tr>

                                                    <tr>
                                                        <td className="txt-right">Discount</td>
                                                        <td>{selectedProductList?.[0]?.currency} {Number(promoAmount || 0).toFixed(2)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="txt-right" style={{ fontSize: "18px", fontWeight: "600" }}>Total</td>
                                                        <td style={{ fontSize: "18px", fontWeight: "600" }}>{selectedProductList?.[0]?.currency} {Number(serviceData?.total).toFixed(2)}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <h5>Promo</h5>
                                        <input type="text" name="promoCode" id="promoCode" value={serviceData.promoCode} onChange={(e) => {
                                            setServiceData({
                                                ...serviceData,
                                                [e.target.id]: e.target.value
                                            })
                                        }} />
                                        <button type="button" className='skel-btn-submit' onClick={applyPromo}>Apply</button>
                                    </div>
                                    <div className="col-md-12">
                                        {
                                            promoAppliedList.map(a => (
                                                <div className="col-md-12">
                                                    <input type="text" name="promoCode" id="promoCode" value={a} disabled={true} />
                                                    <button type="button" className='' onClick={() => { removePromo(a) }}>x</button>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-12 pl-2">
                                <div className="form-group pb-1">
                                    <div className="d-flex justify-content-center">
                                        <button type="button" className="skel-btn-cancel" onClick={() => setIsOpen(false)}>Cancel</button>
                                        <button type="button" className="skel-btn-submit" onClick={handleServicePopupSubmit}>Submit</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default ServiceDetailsPopup