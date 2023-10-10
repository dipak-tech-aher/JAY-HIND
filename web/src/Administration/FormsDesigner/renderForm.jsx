// import React from 'react';
// import ReactDOM from 'react-dom';
// import { Form } from '@formio/react';

// const xml2JS = require('xml2js')

// const PreviewForm = (props) => {

//   const formData = props.data.formData
//   const formFields = props.data.formFields
//   const setIsOpen = props.handler.setIsOpen

//   const handleSubmit = () => {
//     return false;
//   }

//   return (

//     <div className="modal-dialog" style={{ margin: "1rem", height: "100%" }}>
//       <div className="modal-content" style={{ height: "100%" }}>
//         <div className="modal-header">
//           <h4 className="modal-title" id="myCenterModalLabel">Preview Form</h4>
//           <button type="button" className="close" onClick={() => setIsOpen(false)}>
//             <span aria-hidden="true">&times;</span>
//           </button>
//         </div>
        
//         <div className="modal-body">
//           <div className="form-row col-12 justify-content-center">
//             <div className="d-flex justify-content-center">
//               <h4 >{formFields.formName}</h4>
//             </div>
//             {
//               (formData) ?
//                 <div className="card" style={{ width: '100%' }}>
//                   <div className="card-body" id="datatable">
//                     <Form form={formData} onSubmit={handleSubmit} />
//                   </div>
//                 </div >
//                 :
//                 <p><strong>Form not defined yet</strong></p>
//             }
//           </div>
//         </div>
//         <div className="modal-footer d-flex mt-2 justify-content-center">
//           <button className="btn btn-secondary" onClick={() => setIsOpen(false)} type="button">Close</button>
//         </div>
//       </div>
//     </div>


//   );
// };

// export default PreviewForm;
