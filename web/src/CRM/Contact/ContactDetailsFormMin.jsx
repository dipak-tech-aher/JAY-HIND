import { useTranslation } from "react-i18next";
import { validateNumber, handlePaste } from "../../common/util/validateUtil";

const ContactDetailsFormMin = (props) => {

    const validateEmail = (object) => {
        const pattern = new RegExp("^[a-zA-Z0-9@._-]{1,100}$");
        let key = String.fromCharCode(!object.charCode ? object.which : object.charCode);
        let temp = pattern.test(key)
        if (temp === false) {
            object.preventDefault();
            return false;
        }
    }

    const { t } = useTranslation();
    const detailsValidate = props.data.detailsValidate
    const personalDetailsData = props.data.personalDetailsData
    const setPersonalDetailsData = props.stateHandler.setPersonalDetailsData
    const error = props.error
    const setError = props.setError

    return (
        <>
            <div className="form-row">
                <div className="col-12 pl-2 bg-light border">
                    <h5 className="text-primary">Contact Details</h5>
                </div>
            </div>
            <div className="row col-12">                   
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="email" className="col-form-label">Email<span>*</span></label>
                        <input type="text" value={personalDetailsData.email} className={`form-control ${(error.email ? "input-error" : "")}`} id="email" placeholder="Email"
                            onKeyPress={(e) => { validateEmail(e) }}
                            onPaste={(e) => handlePaste(e)}
                            onChange={(e) => {
                                setError({ ...error, email: '' })
                                setPersonalDetailsData({ ...personalDetailsData, email: e.target.value })                            
                            }
                            }
                        />
                        <span className="errormsg">{error.email || !detailsValidate.email ? detailsValidate.email && !error.email ? "" : error.email ? error.email : "Email is not in correct format" : ""}</span>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="contactNbr" className="col-form-label">Contact Number<span>*</span></label>
                        <input type="text" value={personalDetailsData.contactNbr} className={`form-control ${(error.contactNbr ? "input-error" : "")}`} id="contactNbr" placeholder="Contact Number"
                            maxLength="15"
                            onPaste={(e) => handlePaste(e)}
                            onKeyPress={(e) => { validateNumber(e) }}
                            onChange={(e) => {
                                setError({ ...error, contactNbr: '' })
                                setPersonalDetailsData({ ...personalDetailsData, contactNbr: e.target.value })
                            }
                            }
                        />
                        <span className="errormsg">{error.contactNbr || !detailsValidate.contactNbr ? detailsValidate.contactNbr && !error.contactNbr ? "" : error.contactNbr ? error.contactNbr : "Please enter 7 digits only" : ""}</span>
                    </div>
                </div>                       
            </div>  
        </>

    )

}
export default ContactDetailsFormMin;