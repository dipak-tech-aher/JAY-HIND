import { useTranslation } from "react-i18next";

const AddressDetailsFormView = (props) => {

    const { t } = useTranslation();

    let addressData = props?.data?.addressData
    let title = props?.data?.title

    console.log('addressData ', addressData)
    return (
        <div className="cmmn-container-base">
            <div className="container-heading">
                <span className="container-title"><i className="fe-pocket"></i> {t(title)}</span>
            </div>
            <div className="container-four-row">
                <div className="container-label">
                    <span className="label-container-style">Address Line 1</span>
                    <p>{(addressData?.address1) ? addressData?.address1 : '-'}</p>
                </div>
                <div className="container-label">
                    <span className="label-container-style">Address Line 2</span>
                    <p>{(addressData?.address2) ? addressData?.address2 : '-'}</p>
                </div>
                <div className="container-label">
                    <span className="label-container-style">Address Line 3</span>
                    <p>{(addressData?.address3) ? addressData?.address3 : '-'}</p>
                </div>
                <div className="container-label">
                    <span className="label-container-style">City</span>
                    <p>{(addressData?.city) ? addressData?.city : '-'}</p>
                </div>
                <div className="container-label">
                    <span className="label-container-style">District</span>
                    <p>{(addressData?.districtDesc?.description) ? addressData?.districtDesc?.description : (addressData?.district || '-')}</p>
                </div>
                <div className="container-label">
                    <span className="label-container-style">State</span>
                    <p>{(addressData?.stateDesc?.description) ? addressData?.stateDesc?.description : (addressData?.state || '-')}</p>
                </div>
                <div className="container-label">
                    <span className="label-container-style">Postcode</span>
                    <p>{(addressData?.postCodeDesc?.description) ? addressData?.postCodeDesc?.description : (addressData?.postcode || '-')}</p>
                </div>
                <div className="container-label">
                    <span className="label-container-style">Country</span>
                    <p>{(addressData?.countryDesc?.description) ? addressData?.countryDesc?.description : (addressData?.country || '-')}</p>
                </div>
            </div>
        </div>
    )

}
export default AddressDetailsFormView;