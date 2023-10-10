import React, { useEffect, useState } from "react";
import agreementLogo from "../../assets/images/agreement.svg";
import SignaturePad from "react-signature-canvas";
import { properties } from "../../properties";
import { post } from '../../common/util/restUtil';
import HtmlToPlainText from "../../common/HtmlToPlainText";
const CustomerContractAgreement = (props) => {
  const { sigPad, serviceData, selectedProductList, appsConfig } = props?.data;
  const { setServiceData } = props?.handler;
  const agreementText =
    'This free Sample Terms of Use Template is available for download and includes these sections: Introduction Definitions Acknowledgment User Accounts Content Copyright Policy Intellectual Property User Feedback Links to Other Websites Termination Limitation of Liability "AS IS" and "AS AVAILABLE" Disclaimer Governing Law Disputes Resolution Severability and Waiver Changes Contact Information';
  const clearSignature = () => {
    sigPad.current?.clear();
  };
  const [agreement, setAgreement] = useState(agreementText)

  console.log("serviceData ", serviceData);
  const printSignature = () => {
    // setServiceData({
    //     ...serviceData,
    //     serviceAgreement: sigPad.current?.getTrimmedCanvas().toDataURL('image/png')
    // })
  };
  useEffect(() => {
    const termList = []
    selectedProductList.forEach((m) => {
      m.termsList && m.termsList.forEach((t) => {
        if (t) {
          termList.push(t);
        }
      });
    });
    const reqBody = {
      termsList: termList
    }
    post(properties.PRODUCT_API + '/get-terms', reqBody).then((resp) => {
      if (resp.status === 200) {
        let termText = ''
        for (const prod of selectedProductList) {
          if (prod.termsList) {
            for (const term of prod.termsList) {
              for (const termData of resp.data) {
                if (termData.termId == term && termData.entityType == 'OT_SU') {
                  termText += prod.productName + '\n' + termData.termsContent + '\n\n'
                }
              }
            }
          }
        }
        if (termText == '') {
          termText = agreementText
        }
        setAgreement(termText)

      }
    }).catch((error) => {
      console.log(error)
    })
  }, [])

  return (
    <div className="cmmn-skeleton skel-cr-cust-form">
      <div className="form-row">
        <div className="col-md-2 skel-cr-lft-sect-img">
          <div className="skel-step-process">
            <span>{appsConfig && appsConfig.clientFacingName && appsConfig.clientFacingName['Customer'.toLowerCase()] && appsConfig?.clientFacingName['Customer'.toLowerCase()] || 'Customer'} Agreement</span>
          </div>
          <img
            src={agreementLogo}
            alt=""
            className="img-fluid"
            width="250"
            height="250"
          />
        </div>
        <div className="col-md-10 skel-cr-rht-sect-form">
          <div className="col-md-8">
            <div className="form-group">
              <label htmlFor="remarks" className="control-label">
                Terms and Conditions{" "}
                <span className="text-danger font-20 pl-1 fld-imp">*</span>
              </label>
              <HtmlToPlainText htmlContent={agreement} />
            </div>
          </div>
          <div className="custom-control custom-checkbox">
            <input
              type="checkbox"
              className="custom-control-input"
              id="isAgreed"
              checked={serviceData?.isAgreed === "Y" ? true : false}
              onChange={(e) =>
                setServiceData({
                  ...serviceData,
                  isAgreed: e.target.checked ? "Y" : "N",
                })
              }
            />
            <label className="custom-control-label" htmlFor="isAgreed">
              I Agree with the below terms and conditions
            </label>
          </div>
          <br />
          <p>
            By checking the above checkbox you agree with the terms and
            conditions
          </p>
          <hr className="cmmn-hline" />
          <div className="form-group">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerContractAgreement;
