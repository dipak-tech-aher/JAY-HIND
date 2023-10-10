import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "../../../AppContext";
import moment from 'moment';
import { get, put, post } from "../../../common/util/restUtil";
import EditProfile from "./EditProfile";
import { properties } from "../../../properties";
import { toast } from "react-toastify";
import ChangePassword from "../../../Authentication/changePassword";

const MyProfile = () => {
    const [userData, setUserData] = useState([]);
    let { auth, setAuth } = useContext(AppContext);
    const hiddenFileInput = React.useRef(null);
    const [renderState, setRenderState] = useState({
        showtab: 'editProfile',
    })
    const [file, setFile] = useState({});
    const [state, setState] = useState(false);
    const [locations, setLocations] = useState([])
    const [country, setCountry] = useState([])
    const [userTypes, setUserTypes] = useState([])
    const [genderList,setGenderList] = useState([])
    const [selectedCountryCode, setSelectedCountryCode] = useState("00");
    const [phoneNumberLength, setPhoneNumberLength] = useState(20);

    useEffect(() => {
        
        get(properties.USER_API + "/search/" + auth.user.userId).then((resp) => {
            if (resp.data) {
                setUserData(resp.data)
                setFile(resp.data.profilePicture)
            }
        }).catch((error) => {
            console.log(error)
        }).finally()
    }, [state, renderState]);


    useEffect(() => {
        
        get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam=COUNTRY,USER_TYPE,LOCATION,GENDER').then((resp) => {
            if (resp.data) {
                console.log('resp.data', resp.data)
                if (auth?.user?.country) {
                    let result = resp.data.COUNTRY.find((e) =>
                        e.code === auth.user.country)
                    setSelectedCountryCode(result.mapping.countryCode)
                    setPhoneNumberLength(Number(result.mapping.phoneNolength))
                }
                setCountry(resp.data.COUNTRY)
                setLocations(resp.data.LOCATION)
                setUserTypes(resp.data.USER_TYPE)
                setGenderList(resp.data.GENDER)
            }
            else {
                toast.error("Error while fetching country details")
            }
        }).catch((error) => {
            console.log(error)
        }).finally()
    }, []);

    const convertBase64 = (e) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(e.target.files[0]);

            fileReader.onload = () => {
                resolve(fileReader.result);
                return fileReader.result
            };

            fileReader.onerror = (error) => {
                reject(error);
            };
        });
    };


    const handleChangeStatus = async (e, type = undefined) => {
        let image = null
        if(type === 'UPLOAD') {
            image = await convertBase64(e);
        }
        const reqBody = userData
        reqBody.profilePicture = image
        // delete reqBody.loginid
        delete reqBody.photo
        delete reqBody.mobileOTP
        delete reqBody.emailOTP
        delete reqBody.statusDesc
        delete reqBody.userGroupDesc
        delete reqBody.managerDetail
        delete reqBody.genderDesc
        
        put(properties.USER_API + "/update/" + auth.user.userId, {...reqBody, biAccess: reqBody.biAccess ? 'Y' : 'N' })
            .then((resp) => {
                if (resp.status === 200) {
                    setAuth(prevState => ({ ...prevState, user: { ...prevState.user, profilePicture: image } }))
                    sessionStorage.getItem("auth")
                    toast.success("Image updated successfully.");
                } else {
                    setState(!state)
                    toast.error("Error while updating user.");
                }
            }).catch((error) => {
                console.log(error)
            })
            .finally()
    }

    return (
        <>
            <div className="cnt-wrapper">   
                <div className="card adv-srh-sect">
                    <div className="adv-search">
                        <h4>My Profile</h4>
                    </div>
                    <div className="tabbable-responsive pl-2">
                        <div className="tabbable">
                            <ul className="nav nav-tabs" id="myTab" role="tablist">
                                <li className="nav-item">
                                    <a className={(renderState.showtab === 'editProfile') ? 'nav-link active' : 'nav-link'} id="lead-details" data-toggle="tab" href="#mprofile" role="tab" aria-controls="lead-details" aria-selected="true"
                                        onClick={() => {
                                            setRenderState((prevState) => {
                                                return ({
                                                    ...prevState,
                                                    showtab: 'editProfile',
    
                                                })
                                            })
                                        }}
                                    >Edit Profile</a>
                                </li>
                                <li className="nav-item">
                                    <a className={(renderState.showtab === 'changePassword') ? 'nav-link active' : 'nav-link'} id="work-flow-history" data-toggle="tab" href="#cpwd" role="tab" aria-controls="work-flow-history" aria-selected="false"
                                        onClick={() => {
                                            setRenderState((prevState) => {
                                                return ({
                                                    ...prevState,
                                                    showtab: 'changePassword'
                                                })
                                            })
                                        }}
                                    >Change Password</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="card-body">  
                        <div className="tab-content">
                            <div className={(renderState.showtab === 'editProfile') ? 'tab-pane fade show active' : 'tab-pane fade'} id="mprofile" role="tabpanel" aria-labelledby="lead-details">  
                                {
                                    renderState.showtab === 'editProfile' && 
                                    <div className="adv-search-fields">
                                        <div id="searchBlock" className="modal-body p-2" style={{display:"block"}}>
                                            <div> 
                                                <div className="form-row pb-3">   
                                                    <div className="col-md-4">
                                                        <div className="text-center">
                                                            <img className="mb-2" id="img" src={file} width="150px" height="150px" style={{ objectFit: "cover" }}>
                                                            </img>
                                                        </div>
                                                        <input type="file"
                                                            accept="image/*"
                                                            name="image-upload"
                                                            id="input"
                                                            style={{ display: "none" }}
                                                            onChange={(e) => handleChangeStatus(e, 'UPLOAD')}
                                                        />
                                                        <div style={{marginTop: "1rem", display: "flex", justifyContent: "center" }} className="button_outer">
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
                                                        {
                                                            file && 
                                                            <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center" }} className="button_outer" onClick={handleChangeStatus}>
                                                                <label style={{
                                                                    margin: "auto",
                                                                    padding: "10px",
                                                                    color: "white",
                                                                    textJustify: "auto",
                                                                    textAlign: "center",
                                                                    cursor: "pointer",

                                                                }} className="btn_upload">

                                                                    Remove Image
                                                            </label>
                                                            </div>
                                                        }
                                                        
                                                    </div>
                                                    <div className="col-md-8">
                                                        <table className="table table-striped dt-responsive nowrap w-100 border profile-table">
                                                            <tr>
                                                                <td>
                                                                    <label htmlFor="customerTitle" className="col-form-label ">User Id :</label>
                                                                </td>
                                                                <td className="pt-1">
                                                                    <div className="pt-1">{userData.loginid ? userData.loginid : "-"}</div> 
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td>
                                                                    <label htmlFor="fullname" className="col-form-label ">Full Name :</label>
                                                                </td>
                                                                <td className="pt-1">
                                                                    <div className="pt-1">{(userData.firstName || "") + " " + (userData.lastName || "")}</div> 
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td>
                                                                    <label htmlFor="email" className="col-form-label ">Email :</label>
                                                                </td>
                                                                <td className="pt-1">
                                                                    <div className="pt-1">{userData.email ? userData.email : "-"}</div> 
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td>
                                                                    <label htmlFor="customerTitle" className="col-form-label">Status :</label>
                                                                </td>
                                                                <td className="pt-1">
                                                                    <div className="pt-1">{userData?.statusDesc?.description ? userData?.statusDesc?.description : "-"}</div> 
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td>
                                                                    <label htmlFor="customerTitle" className="col-form-label">Activation date :</label>
                                                                </td>
                                                                <td className="pt-1">
                                                                    <div className="pt-1">{userData.activationDate ? moment(userData.activationDate).format('DD MMM YYYY') : "-"}</div> 
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td>
                                                                    <label htmlFor="customerTitle" className="col-form-label">Expiry date :</label>
                                                                </td>
                                                                <td className="pt-1">
                                                                    <div className="pt-1">{userData.expiryDate ? moment(userData.expiryDate).format('DD MMM YYYY') : "-"}</div>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </div>
                                                </div>
                                                <hr className="cmmn-hline"></hr>
                                                <EditProfile 
                                                    setState={setState} 
                                                    state={state}
                                                    data={userData} 
                                                    countries={country} 
                                                    locations={locations} 
                                                    userTypes={userTypes}
                                                    genderList={genderList}
                                                    phoneNumberLength={phoneNumberLength}
                                                    setPhoneNumberLength={setPhoneNumberLength}
                                                    selectedCountryCode={selectedCountryCode}
                                                    setSelectedCountryCode={setSelectedCountryCode}
                                                />
                                            </div>   
                                        </div>
                                    </div>
                                }                            
                            </div>
                            <div className={(renderState.showtab === 'changePassword') ? 'tab-pane fade show active' : 'tab-pane fade'} id="cpwd" role="tabpanel" aria-labelledby="work-flow-history"> 
                                {
                                    renderState.showtab === 'changePassword' &&
                                    <ChangePassword data={userData}/>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MyProfile;
