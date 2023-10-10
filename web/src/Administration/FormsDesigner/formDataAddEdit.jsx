// import React, { useState, useEffect, useRef } from 'react';
// import ReactDOM from 'react-dom';
// import { Form } from '@formio/react';
// import { properties } from "../../properties";
// import { get, put, post } from "../../common/util/restUtil";

// import { toast } from "react-toastify";

// const xml2JS = require('xml2js')

// const FormDataAddEdit = (props) => {

//   // console.log('props', props)

//   const formRef = useRef()

//   const [formId, setFormId] = useState()

//   const [submissionId, setSubmissionId] = useState()

//   const [submitFormToggle, setSubmitFormToggle] = useState({ eventType: '', toggle: false })

//   const [formDefinition, setFormDefinition] = useState({})

//   const [formData, setFormData] = useState({})

//   useEffect(() => {

//     console.log('Use Effect 1')

//     if (props.location.state.data.formId) {
//       setFormId(props.location.state.data.formId)
//     }

//     if (props.location.state.data.submissionId) {
//       console.log('Setting submission Id')
//       setSubmissionId(props.location.state.data.submissionId)
//     }

//   }, [props]);


//   useEffect(() => {

//     console.log('Use Effect 2')

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

//   useEffect(() => {

//     console.log('Use Effect 3')

//     if (submissionId && submissionId !== null) {
      
//       get(properties.FORMS_DATA_API + '/' + formId + '/' + submissionId)
//         .then((resp) => {
//           if (resp && resp.status === 200 && resp.data) {

//             setFormData({ data: resp.data.formSubmission })

//           } else {
//             if (resp && resp.status) {
//               toast.error("Error fetching form data for edit - " + resp.status + ', ' + resp.message);
//             } else {
//               toast.error("Unexpected error fetching form data for edit");
//             }
//           }
//         }).finally(() => {
          
//         });
//     }
//   }, [submissionId]);


//   useEffect(() => {


//     console.log('Use Effect Submit', submissionId)

//     if (submitFormToggle && submitFormToggle.eventType === 'submit') {

//       const submission = submitFormToggle.data

//       if (submission) {

//         console.log('Submitting', formId, submissionId)

//         if (submissionId && submissionId !== null) {
//           console.log('Updating...')
          
//           put(properties.FORMS_DATA_API + '/' + formId + '/' + submissionId, {
//             formSubmission: submission
//           })
//             .then((resp) => {
//               if (resp) {
//                 if (resp.status === 200) {
//                   toast.success('Form data updated successfully');
//                 } else {
//                   toast.error("Failed to update - " + resp.status);
//                 }
//               } else {
//                 toast.error("Uexpected error ocurred " + resp.statusCode);
//               }
//             }).finally();
//           setFormData({ data: submission })
//         } else {
//           console.log('Creating...')
          
//           post(properties.FORMS_DATA_API + '/' + formId, {
//             formSubmission: submission
//           })
//             .then((resp) => {
//               if (resp.data) {
//                 if (resp.status === 200) {
//                   console.log('submissionId', resp.data.submissionId)
//                   setSubmissionId(resp.data.submissionId)
//                   setFormData({ data: resp.data.formSubmission })
//                   toast.success('Form data created successfully');
//                 } else {
//                   toast.error("Failed to create - " + resp.status);
//                 }
//               } else {
//                 toast.error("Uexpected error ocurred " + resp.statusCode);
//               }
//             }).finally();
//         }
//       }
//     }
//   }, [submitFormToggle.toggle]);

//   const handleCustomEvent = (event) => {

//     console.log('handleCustomEvent', submissionId, submissionId, event)

//     setSubmitFormToggle((prevState) => {
//       return {
//         eventType: event.type,
//         data: event.data,
//         toggle: !prevState.toggle
//       }
//     })
//   }

//   const handleSubmissionData = () => {

//     if(formRef && formRef.current) {
//       if(formRef.current._submission && formRef.current._submission.data) {
//         console.log('formRef.current', formRef.current._submission.data)
//       }
//     } else {
//       console.log('formRef is null')
//     }
//   }

//   return (

//     <div className="container-fluid pb-2">

//       <div className="row">
//         <div className=" col-12">
//           <div className="page-title-box">
//             <h4 className="page-title">Create/Edit Form Data</h4>
//           </div>
//         </div>
//       </div>

//       <div className="form-row col-12">
//         {console.log('formData', formData)}
//         {
//           (submissionId && submissionId !== null) ?
//             <div className="card" style={{ width: '100%' }}>
//               <div className="card-body" id="datatable">

//                 <div className="d-flex justify-content-center">
//                   <h4 >Edit Form Data - {formDefinition.formName} - {submissionId}</h4>
//                 </div>

//                 <Form form={formDefinition.formDesign}
//                   submission={formData}
//                   onCustomEvent={handleCustomEvent}
//                   formReady={(a) => {
//                     console.log('formReady', a)
//                     formRef.current = a
//                   }}
//                   onRender={() => {
//                     console.log('onRender')
//                   }}
//                   onError={(errors) => {
//                     console.log('onError', errors)
//                   }}
//                 />
//               </div>
//             </div >
//             :
//             <div className="card" style={{ width: '100%' }}>
//               <div className="card-body" id="datatable">

//                 <div className="d-flex justify-content-center">
//                   <h4 >Create Form Data - {formDefinition.formName}</h4>
//                 </div>

//                 <Form form={formDefinition.formDesign}
//                   onCustomEvent={handleCustomEvent}
//                   formReady={(a) => {
//                     console.log('formReady', a)
//                     formRef.current = a
//                   }}
//                   onRender={() => {
//                     console.log('onRender')
//                   }}
//                   onError={(errors) => {
//                     console.log('onError', errors)
//                   }}
//                 />
//               </div>
//             </div>
//         }
//         <div className="modal-footer d-flex mt-2 justify-content-center">
//           <button className="btn btn-secondary" onClick={handleSubmissionData} type="button">Close</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FormDataAddEdit;
