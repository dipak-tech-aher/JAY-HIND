import React from "react";
import agreement from "../../assets/images/agreement.svg";
import promotionLogo from '../../assets/images/promo_logo.png'
const CustomerProductFinalPreview = (props) => {
  const { serviceData, selectedProductList, productBenefitLookup = [] } = props?.data;


  console.log("serviceData ", serviceData);


  return (
    <div className="cmmn-skeleton skel-cr-cust-form">
      <div className="form-row">
        <div className="col-md-2 skel-cr-lft-sect-img">
          <div className="skel-step-process">
            <span>Product Summary Review</span>
          </div>
          <img
            src={agreement}
            alt=""
            className="img-fluid"
            width="250"
            height="250"
          />
        </div>
        <div className="col-md-10 skel-cr-rht-sect-form">
          <h5>Selected Products</h5>
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
                            {x.promoApplied && x.promoApplied.applied && <img src={promotionLogo} width={100} height={70} />}
                            <div className="sect-top-prod">
                              {x.productCategory !== 'PC_BUNDLE' ?
                                <div className="sel-prod-top">
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
                            </div>
                          </div>
                        );
                      }) : null;

                      return modifiedProduct || (
                        <div className="selected-prod-header">
                          {x.promoApplied && x.promoApplied.applied && <img src={promotionLogo} width={100} height={70} />}
                          <div className="sect-top-prod">
                            {x.productCategory !== 'PC_BUNDLE' ?
                              <div className="sel-prod-top">
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
                        <td>{selectedProductList?.[0]?.currency} {Number(serviceData?.totalDiscount || 0).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="txt-right" style={{ fontSize: "18px", fontWeight: "600" }}>Total</td>
                        <td style={{ fontSize: "18px", fontWeight: "600" }}>{selectedProductList?.[0]?.currency} {Number(serviceData?.total).toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProductFinalPreview;
