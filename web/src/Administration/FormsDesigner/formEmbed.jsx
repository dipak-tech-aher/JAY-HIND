// import React, { useState, useEffect, useRef } from 'react';
// import ReactDOM from 'react-dom';
// import { Form } from '@formio/react';
// import { properties } from "../../properties";
// import { get, put, post } from "../../common/util/restUtil";

// import { toast } from "react-toastify";

// const xml2JS = require('xml2js')

// const FormEmbed = (props) => {

//   // console.log('props', props)

//   const setCustomFormRef = props.handler.setCustomFormRef

//   const [formId, setFormId] = useState(props.data.formId)

//   const [formData, setFormData] = useState(props.data.formData)

//   const [submitFormToggle, setSubmitFormToggle] = useState({ eventType: '', toggle: false })

//   const [formDefinition, setFormDefinition] = useState({})

//   useEffect(() => {

//     console.log('Use Effect 2', formId)

//     if (formId && formId !== null) {
      
//       get(properties.FORMS_DEFN_API + '/' + formId)
//         .then((resp) => {
//           if (resp && resp.status === 200 && resp.data) {

//             setFormDefinition({ ...formDefinition, formName: resp.data.formName, formDesign: resp.data.formDefinition })
//           } else {
//             if (resp && resp.status) {
//               toast.error("Error fetching form definition for rendering - " + resp.status + ', ' + resp.message);
//             } else {
//               toast.error("Unexpected error fetching form definition for rendering");
//             }
//           }
//         }).finally(() => {
          
//         });
//     }
//   }, [formId]);

//   return (

//     <div className="container-fluid pb-2">

//       <div className="row">
//         <div className=" col-12">
//           <div className="page-title-box">
//             <h4 className="page-title">Custom Data Section</h4>
//           </div>
//         </div>
//       </div>

//       <div className="form-row col-12">
//         {console.log('formData', formData)}
//         {
//           (formData && formDefinition) ?
//             <div className="card" style={{ width: '100%' }}>
//               <div className="card-body" id="datatable">

//                 <div className="d-flex justify-content-center">
//                   <h4 >{formDefinition.formName}</h4>
//                 </div>

//                 <Form form={formDefinition.formDesign}
//                   submission={formData}
//                   formReady={(formInstance) => {
//                     console.log('formReady', formInstance)
//                     setCustomFormRef(formInstance)
//                   }}
//                 />
//               </div>
//             </div >
//             :
//             <></>
//         }
          
//         {
//             (formDefinition) ?
//               <div className="card" style={{ width: '100%' }}>
//                 <div className="card-body" id="datatable">

//                   <div className="d-flex justify-content-center">
//                     <h4 >Create Form Data - {formDefinition.formName}</h4>
//                   </div>

//                   <Form form={formDefinition.formDesign}
//                     formReady={(formInstance) => {
//                       console.log('formReady', formInstance)
//                       setCustomFormRef(formInstance)
//                     }}
//                   />
//                 </div>
//               </div>
//               :
//               <></>
//         }
//       </div>
//     </div>
//   );
// };

// export default FormEmbed;
