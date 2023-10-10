import { useTranslation } from "react-i18next";
import { handlePaste } from "../../common/util/validateUtil";
import moment from 'moment'

const IndividualCustomerDetailsForm = (props) => {
const source = props.data.source

const gender = [
{ value: 'M', label: 'Male' },
{ value: 'F', label: 'Female' }
]

const { t } = useTranslation();
const detailsValidate = props.data.detailsValidate
const personalDetailsData = props.data.personalDetailsData

const idTypeLookup = props.lookups.idTypeLookup
const setPersonalDetailsData = props.stateHandler.setPersonalDetailsData
const error = props.error
const setError = props.setError
return (
<>
<div className="form-row">
   <div className="col-12 pl-2 bg-light border">
      <h5 className="text-primary">Customer Details</h5>
   </div>
</div>
<div className="row col-12">
   <div className="col-md-4">
      <div className="form-group">
         <label htmlFor="customerTitle" className="col-form-label">Title<span>*</span></label>
         <input type="text" className={`form-control ${(error.title ? "input-error" : "")}`} value={personalDetailsData.title} id="customerTitle" placeholder="Title"
         maxLength="20"
         disabled={source === "Edit" ? true : false}
         onChange={(e) => {
         setError({ ...error, title: '' })
         setPersonalDetailsData({ ...personalDetailsData, title: e.target.value })                         
         }
         }
         />
         <span className="errormsg">{error.title || !detailsValidate.title ? detailsValidate.title && !error.title ? "" : error.title ? error.title : "Please enter alphabets,special characters" : ""}</span>
      </div>
   </div>
   <div className="col-md-4">
      <div className="form-group">
         <label htmlFor="Surname" className="col-form-label">First Name<span>*</span></label>
         <input type="text" className={`form-control ${(error.lastName ? "input-error" : "")}`} value={personalDetailsData.lastName} id="Surname" placeholder="Surname"
         maxLength="80"
         disabled={source === "Edit" ? true : false}
         onChange={(e) => {
         setError({ ...error, lastName: '' })
         setPersonalDetailsData({ ...personalDetailsData, lastName: e.target.value })                       
         }
         }
         />
         <span className="errormsg">{error.lastName || !detailsValidate.lastName ? detailsValidate.lastName && !error.lastName ? "" : error.lastName ? error.lastName : "Please enter alphabets,special characters" : ""}</span>
      </div>
   </div>
   <div className="col-md-4">
      <div className="form-group">
         <label htmlFor="Forename" className="col-form-label">Last Name<span>*</span></label>
         <input type="text" className={`form-control ${(error.firstName ? "input-error" : "")}`} value={personalDetailsData.firstName} id="Forename" placeholder="Forename"
         maxLength="40"
         disabled={source === "Edit" ? true : false}
         onChange={(e) => {
         setError({ ...error, firstName: '' })
         setPersonalDetailsData({ ...personalDetailsData, firstName: e.target.value })                                
         }
         }
         />
         <span className="errormsg">{error.firstName || !detailsValidate.firstName ? detailsValidate.firstName && !error.firstName ? "" : error.firstName ? error.firstName : "Please enter alphabets,special characters" : ""}</span>
      </div>
   </div>
</div>
<div className="row col-12">
   <div className="col-md-4">
      <div className="form-group">
         <label className="col-form-label">Gender <span>*</span></label>
         <select
         disabled={source === "Edit" ? true : false}
         value={personalDetailsData.gender}
         className={`form-control ${(error.gender ? "input-error" : "")}`} onChange={(e) => {
         setError({ ...error, gender: "" })
         setPersonalDetailsData({ ...personalDetailsData, gender: e.target.value });
         }} >
         <option key='1' value="">Select gender...</option>
         {gender.map((e) => (
         <option key={e.value} value={e.value}>{e.label}</option>
         ))}
         </select>
         {error.gender ? <span className="errormsg">{error.gender}</span> : ""}
      </div>
   </div>
   <div className="col-md-4">
      <div className="form-group">
         <label htmlFor="email" className="col-form-label">Date of Birth<span>*</span></label>
         <input type="date" value={personalDetailsData.dob} className={`form-control ${(error.dob ? "input-error" : "")}`} id="dob" placeholder="dob"
         max={moment().format('YYYY-MM-DD')}
         onPaste={(e) => handlePaste(e)}
         onChange={(e) => {
         setError({ ...error, dob: '' }) // Added this to fix the BC-50 bug      ~ from Shirish 
         setPersonalDetailsData({ ...personalDetailsData, dob: e.target.value })
         }
         }
         />
         <span className="errormsg">{error.dob || !detailsValidate.dob ? detailsValidate.dob && !error.dob ? "" : error.dob ? error.dob : "Date of birth is not valid" : ""}</span>
      </div>
   </div>
   <div className="col-md-4">
      <div className="form-group">
         <label htmlFor="contactNbr" className="col-form-label">ID Type<span>*</span></label>
         <select className={`form-control ${(error.idType ? "input-error" : "")}`}
         value={personalDetailsData.idType}
         onChange={(e) => {
         setError({ ...error, idType: '' })
         setPersonalDetailsData({ ...personalDetailsData, idNumber: '', idType: e.target.value, idTypeDesc: e.target.options[e.target.selectedIndex].label })
         }}>
         <option key="idtype" value="">Choose ID Type</option>
         {
         idTypeLookup.map((e) => (
         <option key={e.code} value={e.code}>{e.description}</option>
         ))
         }
         </select>
         <span className="errormsg">{error.idType ? error.idType : ""}</span>
      </div>
   </div>
</div>
<div className="row col-12">
   <div className="col-md-4">
      <div className="form-group">
         <label htmlFor="contactNbr" className="col-form-label">ID Value<span>*</span></label>
         <input type="text" value={personalDetailsData.idNumber} className={`form-control ${(error.contactNbr ? "input-error" : "")}`} id="contactNbr" placeholder="ID Number"
         maxLength="20"
         onChange={(e) => {
         setError({ ...error, idNumber: '' })
         setPersonalDetailsData({ ...personalDetailsData, idNumber: e.target.value })                               
         }
         }
         />
         <span className="errormsg">{error.idNumber || !detailsValidate.idNumber ? detailsValidate.idNumber && !error.idNumber ? "" : error.idNumber ? error.idNumber : "ID number is required" : ""}</span>
      </div>
   </div>
</div>
<div className="col-md-4">
   <div className="form-group">
      <label htmlFor="contactNbr" className="col-form-label">Is Billable?</label>
      <input type="checkbox" checked={personalDetailsData.billable} className={`form-control`} id="billable"
         onChange={(e) => {
      setPersonalDetailsData({ ...personalDetailsData, billable: (!personalDetailsData.billable) })
      }
      }
      />
   </div>
</div>
</>
)
}
export default IndividualCustomerDetailsForm;