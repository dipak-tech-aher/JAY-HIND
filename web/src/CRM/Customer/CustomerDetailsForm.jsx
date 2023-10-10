import React, { useContext, useState } from 'react'
import Webcam from 'react-webcam'
import Modal from 'react-modal';
import stepUp from "../../assets/images/up-img.svg";
import { RegularModalCustomStyles } from '../../common/util/util';
import { toast } from 'react-toastify';
import axios from 'axios'

import { properties } from '../../properties';
import { AppContext } from "../../AppContext";
import { post } from '../../common/util/restUtil';
import moment from 'moment'
import avatarPlaceholder from '../../assets/images/profile-placeholder.png'
import { NumberFormatBase } from "react-number-format";
{/* <a target="_blank" href="https://icons8.com/icon/BPc8vlw14Jj8/male-female-user-group">Male Female User Group</a> 
icon by <a target="_blank" href="https://icons8.com">Icons8</a> */}


const CustomerDetailsForm = (props) => {
   const { genderLookup, idTypeLookup, customerData, error, selectedCustomerType, customerTypeLookup,appsConfig } = props?.data;
   console.log('appsConfig-x-x->',appsConfig)

   const { handleInputChange, setCustomerData, setSelectedCustomerType } = props?.handler
   const { auth } = useContext(AppContext);
   const [file, setFile] = useState(customerData?.customerPhoto ? customerData?.customerPhoto : avatarPlaceholder)
   const [fileObject, setFileObject] = useState({})
   const [fileUploadType, setFileUploadType] = useState('FILEUPLOAD')
   const [imageCapturedFront, setImageCapturedFront] = useState()
   const [frontTaken, setFrontTaken] = useState(false)
   const [isOpen, setIsOpen] = useState(false)

   // console.log('customerData ', customerData)
   // const convertBase64 = (e) => {
   //    return new Promise((resolve, reject) => {
   //       console.log('e.target.files------>',e.target.files)
   //       const fileReader = new FileReader();
   //       fileReader.readAsDataURL(e.target.files[0]);

   //       fileReader.onload = () => {
   //          resolve(fileReader.result);
   //          return fileReader.result
   //       };

   //       fileReader.onerror = (error) => {
   //          reject(error);
   //       };
   //    });
   // };

   const convertBase64 = (e) => {
      if (!e || !e.target || !e.target.files || e.target.files.length === 0) {
         return Promise.reject(new Error('Invalid input'));
      }

      return new Promise((resolve, reject) => {
         const fileReader = new FileReader();
         fileReader.readAsDataURL(e.target.files[0]);

         fileReader.onload = () => {
            const result = fileReader.result;
            resolve(result);
         };

         fileReader.onerror = (error) => {
            reject(error);
         };
      })
         .catch((error) => {
            console.error('Error loading file:', error);
            return null;
         });
   };

   const handleChangeStatus = async (e) => {
      setFileUploadType('FILEUPLOAD')
      let image = await convertBase64(e);
      // console.log('image-------------xxx-------->',image)
      setFile(image)
      setFileObject(e?.target?.files[0])
      setCustomerData({
         ...customerData,
         // entityId: response?.entityId,
         customerPhoto: image
      })
      // handleUploadImage(e?.target?.files[0], image)
   }

   // const dataURLtoBlob = (dataurl) => {
   //    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
   //       bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
   //    while (n--) {
   //       u8arr[n] = bstr.charCodeAt(n);
   //    }
   //    return new Blob([u8arr], { type: mime });
   // }

   const dataURLtoBlob = (dataurl) => {
      if (!dataurl) {
         toast.error("Invalid input: dataurl must be a string");
         return
      }
      let arr = dataurl.split(',');
      if (arr.length !== 2) {
         toast.error('Invalid data URL: must have format "data:[<mediatype>][;base64],<data>"');
         return
      }
      let mime = arr[0].match(/:(.*?);/)[1];
      if (!mime) {
         toast.error('Invalid data URL: mime type not found');
         return
      }
      let bstr = atob(arr[1]);
      let n = bstr.length;
      let u8arr = new Uint8Array(n);
      while (n--) {
         u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
   }

   const handleUploadImage = async (fileData, base64String) => {


      const data = new FormData();
      data.append("file_to_upload", fileData)
      try {
         await axios.post(properties.API_ENDPOINT + properties.COMMON_API + '/upload-files/self', data, {
            headers: {
               "x-tenant-id": properties.REACT_APP_TENANT_ID,
               Authorization: auth?.accessToken
            },
         }).then((resp) => {
            if (resp.data) {
               if (resp.status === 200) {
                  const response = resp?.data?.data
                  setCustomerData({
                     ...customerData,
                     entityId: response?.entityId,
                     customerPhoto: response?.fileUrl
                  })
                  setFile(response?.fileUrl)
                  setFileUploadType('')
                  setIsOpen(false)
               }
            }
         }).catch((error) => {
            console.log(error)
        }).finally();
      } catch (ex) {
         console.log(ex);

      }
   }

   const saveCapturedImage = async () => {
      if (!imageCapturedFront) {
         toast.error("Please Capture a Photo")
         return
      }
      const blob = dataURLtoBlob(imageCapturedFront);
      setFileObject(blob)
      setFile(imageCapturedFront)
      // let image = await convertBase64(imageCapturedFront);
      // console.log('image----',{
      //    ...customerData,
      //    customerPhoto: imageCapturedFront
      // })
      setCustomerData({
         ...customerData,
         // entityId: response?.entityId,
         customerPhoto: imageCapturedFront
         // customerPhoto: image
      })
      setIsOpen(false)
      // handleUploadImage(blob, imageCapturedFront)
   }

   const handleOpenPopup = () => {
      setImageCapturedFront()
      setFrontTaken(false)
      setIsOpen(true);
      setFileUploadType('CAMERA')
   }
   console.log('selectedCustomerType ', selectedCustomerType)
   return (
      <div className="cmmn-skeleton skel-cr-cust-form">
         <div className="form-row">
            <div className="col-md-2 skel-cr-lft-sect-img">
               <div className="skel-step-process"><span>{appsConfig && appsConfig.clientFacingName && appsConfig.clientFacingName['Customer'.toLowerCase()] && appsConfig?.clientFacingName['Customer'.toLowerCase()] || 'Customer'} Information</span></div>
               <div className="col-md-12">
                  <div className="text-center">
                     <img className="mb-2" id="img" src={file} width="150px" height="150px" style={{ objectFit: "cover" }} />
                  </div>
                  <input type="file"
                     accept="image/*"
                     name="image-upload"
                     id="input"
                     style={{ display: "none" }}
                     onChange={(e) => handleChangeStatus(e)}
                  />
                  <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center" }} className="button_outer">
                     <label style={{
                        margin: "auto",
                        padding: "10px",
                        color: "white",
                        textJustify: "auto",
                        textAlign: "center",
                        cursor: "pointer",

                     }} htmlFor="input" className="btn_upload">

                        Upload Image
                     </label>
                  </div>
                  <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center" }} >

                     OR
                  </div>
                  <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center" }} className="button_outer">
                     <label style={{
                        margin: "auto",
                        padding: "10px",
                        color: "white",
                        textJustify: "auto",
                        textAlign: "center",
                        cursor: "pointer",

                     }} className="btn_upload" onClick={handleOpenPopup}>
                        Capture Image
                     </label>
                  </div>
               </div>
               {/* <img src={stepUp} alt="" className="img-fluid" width="250" height="250" /> */}
            </div>
            <div className="col-md-10 skel-cr-rht-sect-form">
               {/* <label>Select Customer Type<span className="text-danger font-20 pl-2 fld-imp">*</span></label><br />
               <div className="col-md-12 mt-1 pl-0">
                  {
                     customerTypeLookup && customerTypeLookup.map((x, index) => (
                        <div className="form-check-inline radio radio-primary" key={index}>
                           <input type="radio" id="radio1" className="form-check-input" name="optCustomerType" value={x?.code}
                              checked={selectedCustomerType === x?.code}
                              onChange={e => setSelectedCustomerType(e.target.value)}
                           />
                           <label htmlFor="radio1">{x?.description}</label>
                        </div>
                     ))
                  }
               </div> */}
               <div className="row">
                  <div className="col-md-12">
                     <div className="form-group">
                        <label>What is the purpose for {appsConfig && appsConfig.clientFacingName && appsConfig.clientFacingName['Customer'.toLowerCase()] && appsConfig?.clientFacingName['Customer'.toLowerCase()] || 'Customer'} Creation?</label>
                        {
                           customerTypeLookup && customerTypeLookup.map((x, k) => (
                              <div key={k} className="form-check-inline radio radio-primary mt-1">
                                 <input type="radio" id="business" className="form-check-input" name="customerCategory" value={selectedCustomerType}
                                    checked={selectedCustomerType === x.code ? true : false}
                                    onChange={() => { setSelectedCustomerType(x.code) }}
                                 />
                                 <label forhtml={x.description}>{x.description}</label>

                              </div>
                           ))
                        }
                        {/* <div className="form-check-inline radio radio-primary mt-1">
                           <input type="radio" id="business" className="form-check-input" name="customerCategory" value="Business"
                              onClick={() => { setSelectedCustomerType(x.code) }}
                           />
                                 <label forhtml="business">Business</label>

                           </div>
                           <div className="form-check-inline radio radio-primary">
                              <input type="radio" id="goverment" className="form-check-input" name="business" value="Government" />
                                 <label forhtml="goverment">Government</label>

                           </div>
                           <div className="form-check-inline radio radio-primary">
                              <input type="radio" id="regular" className="form-check-input" name="business" value="Regular" />
                                 <label forhtml="regular">Regular</label>
                           </div> */}
                     </div>
                  </div>
               </div>
               <hr className="cmmn-hline"></hr>
               <div className="row col-md-12 mt-3 pl-0">
                  {selectedCustomerType !== 'REG' && <div className="col-lg-12">
                     <div className="form-group">
                        <label htmlFor="businessName" className="control-label">Business Name<span className="text-danger font-20 pl-1 fld-imp">**</span></label>
                        <input type="text" id="businessName" className={`form-control ${(error.businessName ? "input-error" : "")}`} value={customerData.businessName} placeholder="Business Name"
                           maxLength="200"
                           onChange={handleInputChange}
                        />
                        <span className="errormsg">{error.businessName ? error.businessName : ""}</span>
                     </div>
                  </div>}
                  <div className="col-6">
                     <div className="form-group">
                        <label htmlFor="firstName" className="control-label">First Name<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                        <input type="text" id="firstName" pattern="[a-zA-Z\s]*" className={`form-control ${(error.firstName ? "input-error" : "")}`} value={customerData.firstName} placeholder="Firstname"
                           maxLength="80"
                           onChange={handleInputChange}
                        />
                        <span className="errormsg">{error.firstName ? error.firstName : ""}</span>
                     </div>
                  </div>
                  <div className="col-6">
                     <div className="form-group">
                        <label htmlFor="lastName" className="control-label">Last Name<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                        <input type="text" id="lastName" pattern="[a-zA-Z\s]*" className={`form-control ${(error.lastName ? "input-error" : "")}`} value={customerData.lastName} placeholder="Lastname"
                           maxLength="40"
                           onChange={handleInputChange}
                        />
                        <span className="errormsg">{error.lastName ? error.lastName : ""}</span>
                     </div>
                  </div>
                  {selectedCustomerType === 'REG' &&
                     <>
                        <div className="col-6">
                           <div className="form-group">
                              <label htmlFor="dob" className="control-label">Date of Birth<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                              <input type="date" id="dob" max={moment(new Date()).subtract(18, "years").format('YYYY-MM-DD')}
                                 className={`form-control ${(error.dob ? "input-error" : "")}`} value={customerData.dob} placeholder="DOB"
                                 // onKeyPress={}
                                 onChange={handleInputChange}
                              />
                              <span className="errormsg">{error.dob ? error.dob : ""}</span>
                           </div>
                        </div>
                        <div className="col-6">
                           <div className="form-group">
                              <label htmlFor="gender" className="control-label">Gender<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                              <select id="gender" className={`form-control ${(error.gender ? "input-error" : "")}`}
                                 value={customerData.gender}
                                 onChange={handleInputChange}
                              >
                                 <option value="">Select Gender</option>
                                 {
                                    genderLookup && genderLookup.map((e) => (
                                       <option key={e.code} value={e.code}>{e.description}</option>
                                    ))
                                 }
                              </select>
                              <span className="errormsg">{error.gender ? error.gender : ""}</span>
                           </div>
                        </div>
                     </>
                  }
                  {
                     selectedCustomerType !== 'REG' ?
                        <>
                           <div className="col-6">
                              <div className="form-group">
                                 <label htmlFor="registrationNbr" className="control-label">Registration Number<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                 <NumberFormatBase id="registrationNbr" className={`form-control ${(error.registrationNbr ? "input-error" : "")}`} value={customerData.registrationNbr} placeholder="Registration Number"
                                    maxLength="80"
                                    onChange={handleInputChange}
                                 />
                                 <span className="errormsg">{error.registrationNbr ? error.registrationNbr : ""}</span>
                              </div>
                           </div>
                           <div className="col-6">
                              <div className="form-group">
                                 <label htmlFor="registrationDate" className="control-label">Registration Date<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                 <input type="date" id="registrationDate"
                                    className={`form-control ${(error.registrationDate ? "input-error" : "")}`} value={customerData.registrationDate} placeholder="Registration Date"
                                    onChange={handleInputChange}
                                    max={moment(new Date()).format('YYYY-MM-DD')}
                                 />
                                 <span className="errormsg">{error.registrationDate ? error.registrationDate : ""}</span>
                              </div>
                           </div>
                        </>
                        : <></>
                  }

                  <div className="col-6">
                     <div className="form-group">
                        <label htmlFor="idType" className="control-label">ID Type<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                        <select id="idType" className={`form-control ${(error.idType ? "input-error" : "")}`}
                           value={customerData.idType}
                           onChange={handleInputChange}
                        >
                           <option value="">Select ID Type</option>
                           {
                              idTypeLookup && idTypeLookup.map((e) => (
                                 <option key={e.code} value={e.code}>{e.description}</option>
                              ))
                           }
                        </select>
                        <span className="errormsg">{error.idType ? error.idType : ""}</span>
                     </div>
                  </div>
                  <div className="col-6">
                     <div className="form-group">
                        <label htmlFor="idValue" className="control-label">ID Number<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                        <input type="text" id="idValue" className={`form-control ${(error.idValue ? "input-error" : "")}`} value={customerData.idValue} placeholder="ID Number"
                           maxLength="40"
                           onChange={handleInputChange}
                        />
                        <span className="errormsg">{error.idValue ? error.idValue : ""}</span>
                     </div>
                  </div>
               </div>
            </div>
            <Modal isOpen={isOpen} onRequestClose={() => setIsOpen(false)} style={RegularModalCustomStyles}>
               <div className="modal-center" tabIndex="-1" role="dialog" aria-hidden="true">
                  <div className="modal-dialog " role="document">
                     <div className="modal-content">
                        <div className="modal-header">
                           <h5 className="modal-title" id="followupModal">Capture Image</h5>
                           <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => setIsOpen(false)}>
                              <span aria-hidden="true">&times;</span>
                           </button>
                        </div>
                        <div className="modal-body">
                           <div className="row">
                              <div className="col-md-12">
                                 <div className="skel-capture-video d-flex pt-2">
                                    {
                                       !frontTaken && fileUploadType === 'CAMERA' &&
                                       <div className="skel-capt-screen pl-0">
                                          <Webcam
                                             audio={false}
                                             height={400}
                                             screenshotFormat="image/png"
                                             width={500}
                                          >
                                             {({ getScreenshot }) => (
                                                <button
                                                   className="btn btn-primary waves-effect waves-light mr-2"
                                                   onClick={() => {
                                                      const imageSrc = getScreenshot()
                                                      setImageCapturedFront(imageSrc)
                                                      setFrontTaken(true)
                                                   }}>
                                                   Capture Image
                                                </button>
                                             )}
                                          </Webcam>
                                       </div>
                                    }
                                    {frontTaken ? (
                                       <img width="150px" height="150px" style={{ objectFit: "cover" }} src={imageCapturedFront} />
                                    ) : (
                                       <img width="150px" height="150px" style={{ objectFit: "cover" }} src={avatarPlaceholder} />
                                    )}
                                 </div>
                              </div>
                           </div>
                           <div className="col-md-12 pl-2">
                              <div className="form-group pb-1">
                                 <div className="d-flex justify-content-center">

                                    <button type="button" className="skel-btn-cancel" onClick={() => setIsOpen(false)}>Cancel</button>
                                    <button type="button" className="skel-btn-submit" onClick={saveCapturedImage}>Submit</button>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </Modal>
         </div>
      </div>
   )
}

export default CustomerDetailsForm;