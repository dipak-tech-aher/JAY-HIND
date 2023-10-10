const AddressDetailsFormViewMin = (props) => {

    let addressData = props?.data?.addressDetails

    return (       
            <div className="row pt-2 pl-2">
                <i className="fas fa-map-marker-alt text-primary font-18 pr-1" />
                <p className="address-line">
                  
                    {(addressData?.address1 && addressData?.address1 !== '') ? `${addressData?.address1}, ` : ''}
                    {(addressData?.address2 && addressData?.address2 !== '') ? `${addressData?.address2}, ` : ''}
                    {(addressData?.address3 && addressData?.address3 !== '') ? `${addressData?.address3}, ` : ''}
                    {(addressData?.state && addressData?.state !== '') ? `${(addressData?.stateDesc?.description) ? addressData?.stateDesc?.description : (addressData?.state || '-')}, ` : ''}
                    {(addressData?.city && addressData?.city !== '') ? `${addressData?.city}, ` : ''}
                    {(addressData?.district && addressData?.district !== '') ? `${(addressData?.districtDesc?.description) ? addressData?.districtDesc?.description : (addressData?.district || '-')}, ` : ''}
                    {(addressData?.country && addressData?.country !== '') ? `${(addressData?.countryDesc?.description) ? addressData?.countryDesc?.description : (addressData?.country || '-')}, ` : ''}
                    {(addressData?.postcode && addressData?.postcode !== '') ? `${(addressData?.postCodeDesc?.description) ? addressData?.postCodeDesc?.description : (addressData?.postcode || '-')}` : ''}
                   
                    
                </p>
            </div>   
    )

}
export default AddressDetailsFormViewMin;