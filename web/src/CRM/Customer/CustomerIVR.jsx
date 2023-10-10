import React, { useRef, useState } from 'react'
import stepUp from "../../assets/images/up-img.svg";
import stepScan from "../../assets/images/scan.svg";
import stepIVR from "../../assets/images/IVR.svg";
import Webcam from 'react-webcam'
import axios from 'axios'
import moment from 'moment'
import { toast } from "react-toastify";

import { properties } from '../../properties';
import { unstable_batchedUpdates } from 'react-dom';
import { hideSpinner, showSpinner } from '../../common/spinner';


const CustomerIVR = (props) => {

    const { customerData, customerAddress, idTypeLookup, countries } = props?.data
    const { setCustomerData, setIdScanSuccess, setCustomerAddress, fetchCountryList } = props?.handler
    const [frontPageFile, setFrontPageFile] = useState()
    const [backPageFile, setBackPageFile] = useState()
    const [imageCapturedFront, setImageCapturedFront] = useState()
    const [imageCapturedBack, setImageCapturedBack] = useState()
    const [frontTaken, setFrontTaken] = useState(false)
    const [backTaken, setBackTaken] = useState(false)
    const [scanDocType, setScanDocType] = useState('')
    const [scanIdType, setScanIdType] = useState('')

    const frontPageRef = useRef()
    const backPageRef = useRef()


    const changeHandlerFront = (e) => {
        setFrontPageFile(e?.target?.files[0])
    }
    const changeHandlerBack = (e) => {
        setBackPageFile(e?.target?.files[0])
    }

    const handleDocumentScan = async () => {
        if (!frontPageFile) {
            toast.error('Please Upload or Catpure a File')
            return
        }
        // console.log('frontPageFile==>', frontPageFile)
        if (frontPageFile && !['image/jpg', 'image/png', 'image/jpeg', 'image/pdf'].includes(frontPageFile.type.toLowerCase())) {
            toast.error('Invalid File format')
            return
        }
        if (backPageFile && !['image/jpg', 'image/png', 'image/jpeg', 'image/pdf'].includes(backPageFile?.type.toLowerCase())) {
            toast.error('Invalid File format')
            return
        }
        if (scanIdType === '') {
            toast.error('Please choose ID Type')
        }

        const data = new FormData();
        data.append("file", frontPageFile)
        data.append("file_back", backPageFile)
        data.append("scanIdType", scanIdType)

        // console.log('obj ', obj)
        // return false
        try {
            // showSpinner()
            await axios.post(properties.API_ENDPOINT + properties.COMMON_API + '/scan-document', data, {
                headers: {
                    "x-tenant-id": properties.REACT_APP_TENANT_ID
                }
            }).then((resp) => {
                // console.log(resp.data);
                if (resp.data) {
                    if (resp.data.status === 200) {
                        const response = resp?.data?.data
                        if (response && Object.keys(response).length > 1) {
                            console.log('response ', response)

                            const parts = response?.dob.split(/-|\//)
                            const day = parseInt(parts[0], 10);
                            const month = parseInt(parts[1], 10) - 1; // Months are zero-based in JavaScript Date object
                            const year = parseInt(parts[2], 10);
                            const dob = new Date(year, month, day)

                            setCustomerData({
                                ...customerData,
                                firstName: response?.firstName,
                                lastName: response?.lastName,
                                email: '',
                                contactType: '',
                                contactTypeDesc: '',
                                contactNbr: '',
                                dob: moment(dob).format('YYYY-MM-DD'),
                                gender: ['MALE', 'LELAKI'].includes(response.gender) ? 'M' : ['FEMALE', 'PEREMPUAN'].includes(response.gender) ? 'F' : '',
                                idType: scanIdType, //idTypeLookup.find((x) => scanIdType === x?.description[0])?.code,
                                idValue: response?.idValue || response?.documentNumber,
                                registrationNbr: "",
                                registrationDate: "",
                            })
                            const countryDetails = countries.find((x) => response?.nationality_full === x?.description)
                            if (countryDetails && !response?.postcode) {
                                setCustomerAddress({
                                    ...customerAddress,
                                    address1: response?.address1 || "",
                                    address2: response?.address2 || "",
                                    address3: response?.address3 || "",
                                    country: countryDetails && countryDetails?.code || "",
                                    // postcode: response?.postcode || "",
                                    state: response?.issuerOrg_region_full || "",
                                    countryCode: countryDetails && countryDetails?.mapping?.countryCode || ""
                                })
                                fetchCountryList(countryDetails?.code)
                            } else if (countryDetails && response?.postcode) {
                                const data = {
                                    address1: response?.address1 || "",
                                    address2: response?.address2 || "",
                                    address3: response?.address3 || "",
                                    country: countryDetails && countryDetails?.code || "",
                                    postcode: response?.postcode || "",
                                    state: response?.issuerOrg_region_full || "",
                                    countryCode: countryDetails && countryDetails?.mapping?.countryCode || ""
                                }
                                fetchCountryList(countryDetails?.code, data)
                            }
                            setIdScanSuccess(true);
                            toast.success(resp?.data?.message)
                        } else {
                            toast.success(response?.message)
                        }
                    } else {
                        toast.error(resp.data.message);
                    }
                } else {
                    toast.error("Uexpected error ocurred " + resp.statusCode);
                }
            }).catch((error) => {
                console.log(error)
            })
            // .finally(hideSpinner);
        } catch (error) {
            if (error.response) {
                if (error.response?.data?.message) {
                    toast.error(error.response?.data?.message);
                }
            } else {
                toast.error("Uexpected error ocurred");
            }

        }

    }
    const dataURLtoBlob = (dataurl) => {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }

    const saveCapturedImage = (image, side) => {
        const blob = dataURLtoBlob(image);
        if (side === 'front') {
            setFrontPageFile(blob)
        }
        else {
            setBackPageFile(blob)
        }
    }

    function handleOnChange(event) {
        setScanDocType(event)
        handleClearScan()

    }

    const handleClearScan = () => {
        unstable_batchedUpdates(() => {
            setImageCapturedFront()
            setFrontPageFile()
            setBackPageFile()
            setFrontTaken(false)
            setImageCapturedBack()
            setBackTaken(false)
            setCustomerData({
                firstName: '',
                lastName: '',
                gender: '',
                dob: '',
                idType: '',
                idValue: '',
                registrationNbr: "",
                registrationDate: ""
            })
            setCustomerAddress({
                email: '',
                contactNbr: '',
                address1: '',
                address2: '',
                address3: '',
                district: '',
                state: '',
                city: '',
                country: '',
                postcode: '',
                countryCode: ''
            })
            setIdScanSuccess(false);
            if (frontPageRef.current) frontPageRef.current.value = ""
            if (backPageRef.current) backPageRef.current.value = ""
        })
    }

    return (
        <div className="cmmn-skeleton skel-cr-cust-form">
            <div className="form-row">
                <div className="col-md-2 skel-cr-lft-sect-img">
                    <div className="skel-step-process"><span>Upload Your Document</span></div>
                    <img src={stepUp} alt="" className="img-fluid" width="250" height="250" />
                </div>
                <div className="col-md-10 skel-cr-rht-sect-form">
                    <div className="pl-1 pt-0">
                        <label>Please Click on Below Option</label>
                        <div className="col-md-6 mt-1 pl-0">
                            <div className="form-check-inline radio radio-primary">
                                <input type="radio" id="radio2" className="form-check-input" name="optCustomerType" value="CIT_IC"
                                    checked={scanIdType === 'CIT_IC'}
                                    onChange={e => {
                                        setScanIdType(e.target.value)
                                        handleClearScan()
                                    }
                                    }
                                />
                                <label htmlFor="radio2">Nation ID Card</label>
                            </div>
                            <div className="form-check-inline radio radio-primary">
                                <input type="radio" id="radio1" className="form-check-input" name="optCustomerType" value="CIT_PASSPORT"
                                    checked={scanIdType === 'CIT_PASSPORT'}
                                    onChange={e => {
                                        setScanIdType(e.target.value)
                                        handleClearScan()
                                    }}
                                />
                                <label htmlFor="radio1">Passport</label>
                            </div>

                        </div>
                        <div className="col-md-12">
                            <div className="skel-upl-sect cursor-pointer">
                                <div className="form-group uploader cursor-pointer" onClick={() => handleOnChange('fileUpload')}>
                                    {/* <input id="file-upload" type="file" name="fileUpload" accept="image/*" disabled/> */}
                                    <label className="file-upload-base" htmlFor="file-upload" id="file-drag">
                                        <img id="file-image" src="#" alt="Preview" className="hidden" />
                                        <div id="start">
                                            <i className="fas fa-upload"></i>
                                            <div className='ml-2'>Upload File</div>
                                            <div id="notimage" className="hidden">Please select an image</div>
                                        </div>
                                    </label>
                                </div>
                                <span>Or</span>
                                <img src={stepScan} alt="" className="img-fluid" onClick={() => handleOnChange('camera')} />
                            </div>
                        </div>
                        <hr className="cmmn-hline" />
                        {/* <p className="mt-2">Please Upload a Identification Document such as Passport, License, or National ID Card </p> */}
                        <p className="mt-2">Accepted file types are .PNG, .JPG, .JPEG </p>
                        <p className="mt-2">Please note that the scan may not be 100% accurate. Please feel free to edit accordingly </p>
                        <p className="skel-IVR d-none"><img src={stepIVR} alt="" classs="img-fluid" /> Start With Voice</p>
                    </div>
                </div>
            </div>
            {
                scanDocType &&
                <fieldset className="scheduler-border">
                    <div className="form-row">
                        <div className="col-12 pl-2 bg-light border">
                            <h5 className="text-primary">Scan an Identity Document</h5>
                        </div>
                    </div>
                    {scanDocType === 'camera' && <div className="d-flex flex-row pt-2">
                        {!frontTaken && <div className="col-md-4 pl-0">
                            <Webcam
                                audio={false}
                                height={400}
                                screenshotFormat="image/png"
                                width={500}
                            >
                                {({ getScreenshot }) => (
                                    <button
                                        onClick={() => {
                                            const imageSrc = getScreenshot()
                                            saveCapturedImage(imageSrc, 'front')
                                            setImageCapturedFront(imageSrc)
                                            setFrontTaken(true)
                                        }}
                                        className="skel-btn-submit ml-0 mb-4"
                                    >
                                        Capture Front Page
                                    </button>
                                )}
                            </Webcam>

                        </div>
                        }
                        {frontTaken && <img alt="" width="100" height="100" src={imageCapturedFront} />}
                        {frontTaken && !backTaken && <div className="col-md-4 pl-0">
                            <Webcam
                                audio={false}
                                height={400}
                                screenshotFormat="image/png"
                                width={500}
                            >
                                {({ getScreenshot }) => (
                                    <button
                                        onClick={() => {
                                            const imageSrc = getScreenshot()
                                            saveCapturedImage(imageSrc, 'back')
                                            setImageCapturedBack(imageSrc)
                                            setBackTaken(true)
                                        }}
                                        className="skel-btn-submit ml-0 mb-4"
                                    >
                                        Capture Back Page
                                    </button>
                                )}
                            </Webcam>
                        </div>
                        }
                        {backTaken && <img alt="" width="100" height="100" src={imageCapturedBack} />}

                    </div>
                    }
                    {scanDocType === 'fileUpload' && <div className="d-flex flex-row pt-2">
                        <div className="col-md-4 pl-0">
                            <label htmlFor="customerTitle" className="col-form-label">Front Page<span>*</span></label>

                            <div className="form-group">
                                <input type="file" ref={frontPageRef} id="frontPage" onChange={changeHandlerFront}></input>
                            </div>
                        </div>
                        <div className="col-md-4 pl-0">
                            <label htmlFor="customerTitle" className="col-form-label">Back Page</label>

                            <div className="form-group">
                                <input type="file" ref={backPageRef} id="backPage" onChange={changeHandlerBack}></input>
                            </div>
                        </div>
                    </div>
                    }
                    {
                        scanDocType &&
                        <div className="col-md-4 pl-0">
                            <div className="form-group">
                                <button type="button" className="skel-btn-cancel" onClick={handleClearScan}>Clear</button>
                                <button type="button" className="skel-btn-submit" onClick={handleDocumentScan}>Scan</button>

                            </div>
                        </div>
                    }

                </fieldset>
            }
        </div>
    )
}

export default CustomerIVR;