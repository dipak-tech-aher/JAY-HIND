import { useTranslation } from "react-i18next";

const CustomerAddressPreview = (props) => {

    const { t } = useTranslation();

    let addressData = props.data.addressData
    let title = props.data.title


    return (
        <div className="col-16">
            <div className="col-12 bg-light border pr-2">
                <h5 className="text-primary pl-2">{t(title)}</h5>
            </div>

            <div className="col-13 pt-2">
                <fieldset className="scheduler-border scheduler-box mt-2 bg-white border pb-2 ml-2 mr-2 pl-2 pr-2">
                    
                        {
                            (addressData?.postCode !== '' || addressData?.district !== '') ?
                                <>
                                    <div className="row">
                                        {
                                            <div className="col-3">
                                                <div className="form-group">
                                                    <label htmlFor="FlatNo" className="col-form-label">Flat/House/Unit No</label>
                                                    <p>{(addressData?.flatHouseUnitNo) ? addressData?.flatHouseUnitNo : '-'}</p>
                                                </div>
                                            </div>

                                        }
                                        {
                                            <div className="col-3">
                                                <div className="form-group">
                                                    <label htmlFor="Building" className="col-form-label">Building Name/Others</label>
                                                    <p>{(addressData?.building) ? addressData?.building : '-'}</p>
                                                </div>
                                            </div>

                                        }
                                        {
                                            <div className="col-3">
                                                <div className="form-group">
                                                    <label htmlFor="Simpang" className="col-form-label">Street/ Area</label>
                                                    <p>{(addressData?.street) ? addressData?.street : '-'}</p>
                                                </div>
                                            </div>

                                        }
                                        {
                                            <div className="col-3">
                                                <div className="form-group">
                                                    <label htmlFor="Bandar" className="col-form-label">City/Town</label>
                                                    <p>{(addressData?.cityTown) ? addressData?.cityTown : '-'}</p>
                                                </div>
                                            </div>

                                        }
                                        {

                                            <div className="col-3">
                                                <div className="form-group">
                                                    <label htmlFor="District" className="col-form-label">District/Province</label>
                                                    <p>{(addressData?.districtDesc?.description) ? addressData?.districtDesc?.description : (addressData?.districtDesc || '-')}</p>
                                                </div>
                                            </div>

                                        }
                                        {

                                            <div className="col-3">
                                                <div className="form-group">
                                                    <label htmlFor="Mukim" className="col-form-label">State/Region</label>
                                                    {/* <p>{(addressData?.state)? addressData?.stateDesc : '-'}</p> */}
                                                    <p>{(addressData?.stateDesc?.description) ? addressData?.stateDesc?.description : (addressData?.stateDesc || '-')}</p>
                                                </div>
                                            </div>

                                        }
                                        {
                                            <div className="col-3">
                                                <div className="form-group">
                                                    <label htmlFor="Postcode" className="col-form-label">Postcode</label>
                                                    {/* <p>{(addressData?.postCode)? addressData?.postCodeDesc : '-'}</p> */}
                                                    <p>{(addressData?.postCodeDesc?.description) ? addressData?.postCodeDesc?.description : (addressData?.postCodeDesc || '-')}</p>
                                                </div>
                                            </div>

                                        }
                                        {
                                            <div className="col-3">
                                                <div className="form-group">
                                                    <label htmlFor="Country" className="col-form-label">Country</label>
                                                    {/* <p>{(addressData?.country)? addressData?.countryDesc : '-'}</p> */}
                                                    <p>{(addressData?.countryDesc?.description) ? addressData?.countryDesc?.description : (addressData?.countryDesc || '-')}</p>
                                                </div>
                                            </div>

                                        }
                                    </div>
                                    <div className="row pt-2 pl-2">
                                        <i className="fas fa-map-marker-alt text-primary font-18 pr-1" />
                                        <p className="address-line">
                                            {(addressData?.flatHouseUnitNo && addressData?.flatHouseUnitNo !== '') ? `${addressData?.flatHouseUnitNo}, ` : ''}
                                            {/* {(addressData.block && addressData.block !== '')? `${addressData.block}, ` : ''} */}
                                            {(addressData?.building && addressData?.building !== '') ? `${addressData?.building}, ` : ''}
                                            {(addressData?.street && addressData?.street !== '') ? `${addressData?.street}, ` : ''}
                                            {/* {(addressData.road && addressData.road !== '')? `${addressData.road}, ` : ''} */}
                                            {(addressData?.state && addressData?.state !== '') ? `${(addressData?.stateDesc?.description) ? addressData?.stateDesc?.description : (addressData?.stateDesc || '-')}, ` : ''}
                                            {/* {(addressData.village && addressData.village !== '')? `${addressData.village}, ` : ''} */}
                                            {(addressData?.cityTown && addressData?.cityTown !== '') ? `${addressData?.cityTown}, ` : ''}
                                            {(addressData?.district && addressData?.district !== '') ? `${(addressData?.districtDesc?.description) ? addressData?.districtDesc?.description : (addressData?.districtDesc || '-')}, ` : ''}
                                            {(addressData?.country && addressData?.country !== '') ? `${(addressData?.countryDesc?.description) ? addressData?.countryDesc?.description : (addressData?.countryDesc || '-')}, ` : ''}
                                            {(addressData?.postCode && addressData?.postCode !== '') ? `${(addressData?.postCodeDesc?.description) ? addressData?.postCodeDesc?.description : (addressData?.postCodeDesc || '-')}` : ''}
                                        </p>
                                    </div>
                                </>
                                :
                                <div>Address not available</div>
                        }
                    
                </fieldset>
            </div>
        </div>
    )

}
export default CustomerAddressPreview;