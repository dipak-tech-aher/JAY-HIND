// import React, { useState } from 'react';
// import ReactDOM from 'react-dom';
// import { FormBuilder } from '@formio/react';
// import { properties } from "../../properties";
// import { get, put, post } from "../../common/util/restUtil";

// import { toast } from "react-toastify";
// import FormsListModal from 'react-modal'
// import PreviewFormModal from 'react-modal'
// import FormsList from './formsList'
// import PreviewForm from './renderForm'
// import '../../../node_modules/formiojs/dist/formio.builder.min.css'

// const AddEditForm = (props) => {

//   const customStyles = {
//     content: {
//       position: 'absolute',
//       top: '50%',
//       left: '50%',
//       right: 'auto',
//       bottom: 'auto',
//       transform: 'translate(-50%, -50%)',
//       width: '70%',
//       maxHeight: '100%'
//     }
//   };

//   const [formData, setFormData] = useState({ display: 'form', components: [] })

//   const [formFields, setFormFields] = useState({ formName: '', formId: null })

//   const [isFormsListOpen, setIsFormsListOpen] = useState(false)

//   const [isFormPreviewOpen, setIsFormPreviewOpen] = useState(false)

//   const handleFormChange = (schema) => {
//     console.log('handleFormChange', schema)
//     setFormData(schema)
//   }

//   const handleFormSave = () => {

//     if (!formFields.formName || formFields.formName === null || formFields.formName.trim() === '') {
//       toast.error('Form Name is required. Please provide a value');
//       return false;
//     }

//     if (formFields.formId && formFields.formId !== null) {
//       put(properties.FORMS_DEFN_API + '/' + formFields.formId, {
//         formName: formFields.formName,
//         formDefinition: formData
//       })
//         .then((resp) => {
//           if (resp) {
//             if (resp.status === 200) {
//               toast.success('Form definition updated successfully');
//             } else {
//               toast.error("Failed to save - " + resp.status);
//             }
//           } else {
//             toast.error("Unexpected error occurred " + resp.statusCode);
//           }
//         }).finally();
//     } else {
//       post(properties.FORMS_DEFN_API, {
//         formName: formFields.formName,
//         formDefinition: formData
//       })
//         .then((resp) => {
//           if (resp.data) {
//             if (resp.status === 200) {
//               setFormFields({ formName: resp.data.formName, formId: resp.data.formId })
//               toast.success('Form definition saved successfully');
//             } else {
//               toast.error("Failed to save - " + resp.status);
//             }
//           } else {
//             toast.error("Unexpected error occurred " + resp.statusCode);
//           }
//         }).finally();
//     }
//   }

//   const handleFormLoad = () => {
//     setIsFormsListOpen(true)
//   }

//   const handleFormPreview = () => {
//     setIsFormPreviewOpen(true)
//   }

//   const handleFormNew = () => {
//     console.log('New Form', formData)
//     setFormData({
//       display: 'form',
//       components: []
//     })
//     setFormFields({ formName: '', formId: null })
//   }

//   const openForm = (event, formId) => {

//     // console.log('openWorkflow', wfId)
//     get(properties.FORMS_DEFN_API + '/' + formId)
//       .then((resp) => {
//         if (resp && resp.status === 200 && resp.data) {

//           setFormFields({ formName: resp.data.formName, formId: resp.data.formId })
//           setFormData(resp.data.formDefinition)

//         } else {
//           if (resp && resp.status) {
//             toast.error("Error fetching form for edit - " + resp.status + ', ' + resp.message);
//           } else {
//             toast.error("Unexpected error fetching form for edit");
//           }
//         }
//       }).finally();
//   }
//   return (

//     <div className="container-fluid pb-2">

//       <div className="row">
//         <div className=" col-12">
//           <div className="page-title-box">
//             <h4 className="page-title">Design Form</h4>
//           </div>
//         </div>
//       </div>
//       {
//         // console.log('formData', formFields.formName, formData)
//       }
//       {
//         (formFields) ?
//           <div className="form-row" style={{ backgroundColor: "#fff", margin: "0px", marginTop: "5px" }}>
//             <div className="col-12">
//               <div className="form-row" style={{ marginLeft: "0px" }}>
//                 <div className="col-md-4">
//                   <div className="form-group">
//                     <label htmlFor="formName" className="col-form-label">Form Name<span>*</span></label>
//                     <input type="text" className={`form-control`} id="formName" placeholder="Form Name" value={formFields.formName}
//                       onChange={(e) => {
//                         setFormFields({ ...formFields, formName: e.target.value })
//                       }}
//                     />
//                   </div>
//                 </div>
//                 <div className="col-md-8">
//                   <div className="d-flex justify-content-end mr-0" style={{ marginTop: "32px" }}>
//                     <button type="button" className="btn btn-outline-primary waves-effect waves-light mr-2" onClick={handleFormNew}>New Form</button>
//                     <button type="button" className="btn btn-outline-primary waves-effect waves-light mr-2" onClick={handleFormLoad}>Load Form</button>
//                     <button type="button" className="btn btn-outline-primary waves-effect waves-light mr-2" onClick={handleFormPreview}>Preview Form</button>
//                     <button type="button" className="btn btn-outline-primary waves-effect waves-light mr-0" onClick={handleFormSave}>Save Form</button>
//                   </div>
//                 </div>
//               </div>

//               <div className="form-row" style={{ marginLeft: "0px", marginTop: "10px" }}>
//                 <div className="col-12">
//                   <FormBuilder form={formData} 
//                     onChange={(schema) => handleFormChange(schema)}
//                     onEditComponent={(object) => console.log('object', object)}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//           :
//           <></>
//       }
//       <FormsListModal isOpen={isFormsListOpen} onRequestClose={() => setIsFormsListOpen(false)} contentLabel="Workflow List Modal" style={customStyles}>
//         <FormsList
//           handler={{
//             setIsOpen: setIsFormsListOpen,
//             openForm: openForm
//           }}
//         />
//       </FormsListModal>
//       <PreviewFormModal isOpen={isFormPreviewOpen} onRequestClose={() => setIsFormPreviewOpen(false)} contentLabel="Preview Form Modal" style={customStyles}>
//         <PreviewForm
//           handler={{
//             setIsOpen: setIsFormPreviewOpen
//           }}
//           data={{
//             formData: formData,
//             formFields: formFields
//           }}
//         />
//       </PreviewFormModal>
//     </div>
//   );
// };

// export default AddEditForm;
