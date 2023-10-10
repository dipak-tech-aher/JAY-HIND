const ContactDetailsFormViewMin = (props) => {
    const contactDetails  = props?.data?.contactDetails
    return (
        <>            
            <div className="container-three-row">              
                <div className="container-label">
                    <span className="label-container-style">Contact Person Name</span>
                    <span>{contactDetails?.firstName || ""} {contactDetails?.lastName || ""}</span>
                </div>              
                <div className="container-label">
                    <span className="label-container-style">Contact Number</span>
                    <span>{contactDetails?.mobilePrefix || ''}{contactDetails?.mobileNo || ''}</span>
                </div>
                <div className="container-label">
                    <span className="label-container-style">Contact Email</span>
                    <span>{contactDetails?.emailId || ''}</span>
                </div>                                        
            </div>  
        </>

    )

}
export default ContactDetailsFormViewMin;