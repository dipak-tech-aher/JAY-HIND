const ContactDetailsFormView = (props) => {
    const contactDetails  = props?.data?.contactDetails[0]
    return (
        <>            
            <div className="container-three-row">
                <div className="container-label">
                    <span className="label-container-style">Primary Contact Number</span>
                    <span>{(contactDetails?.contactNoPfx||contactDetails?.contactNo) || 'NA'}</span>
                </div>
                <div className="container-label">
                    <span className="label-container-style">Secondary Contact Number</span>
                    <span>{contactDetails?.altContactNo1 || 'NA'}</span>
                </div>
                <div className="container-label">
                    <span className="label-container-style">Primary Email</span>
                    <span>{contactDetails?.email || 'NA'}</span>
                </div>
                <div className="container-label">
                    <span className="label-container-style">Secondary Email</span>
                    <span>{contactDetails?.altEmail || 'NA'}</span>
                </div>
                <div className="container-label">
                    <span className="label-container-style">Contact Preference</span>
                    <span>{contactDetails?.contactPreference || 'NA'}</span>
                </div>                                        
            </div>  
        </>

    )

}
export default ContactDetailsFormView;