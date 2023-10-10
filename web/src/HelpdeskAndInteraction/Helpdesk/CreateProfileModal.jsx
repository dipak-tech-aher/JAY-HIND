import React, { useEffect, useState, useCallback, useContext } from 'react';
import Modal from 'react-modal';

import { post, get, put } from '../../common/util/restUtil';
import { properties } from '../../properties';
import { RegularModalCustomStyles } from '../../common/util/util';
import { unstable_batchedUpdates } from 'react-dom';
import { toast } from 'react-toastify';
import { object, string } from "yup";
import { NumberFormatBase } from 'react-number-format';
import Select from "react-select";
import { AppContext } from '../../AppContext';
import { isObjectEmpty } from '../../common/util/validateUtil';
import { statusConstantCode } from '../../AppConstants';
import { isEmpty } from 'lodash'

const CreateProfileValidationSchema = object().shape({
    contactNbr: string().nullable(false).required("Contact number is required"),
});

const CreateProfileModal = (props) => {
    const { auth, appConfig } = useContext(AppContext)
    const { isCreateProfileOpen, detailedViewItem } = props.data;
    const { setIsCreateProfileOpen, doSoftRefresh } = props.handlers;
    const [channel, setChannel] = useState()

    const [createProfileInputsErrors, setCreateProfileInputsErrors] = useState({});
    const isExisting = detailedViewItem?.customerDetails && !!Object.keys(detailedViewItem?.customerDetails).length ? true : false

    const initialValues = {
        foreName: "",
        category: "",
        contactNbr: "",
        email: "",
        contactPreference: "",
        idType: "",
        idValue: "",
        searchProfile: "",
        useExistingProfile: isExisting,
    }

    const [source, setSource] = useState('PARENT');
    const [readOnly, setReadOnly] = useState(true);
    const [createProfileInputs, setCreateProfileInputs] = useState(initialValues);
    const [categoryLookup, setCategoryLookup] = useState([]);
    const [contactPreferenceLookup, setContactPreferenceLookup] = useState([]);
    const [idTypeLookup, setIdTypeLookup] = useState([]);
    const [project, setProjects] = useState([])
    const [selectedProjects, setSelectedProjects] = useState([])
    const [selectedMappingProjects, setSelectedMappingProjects] = useState()

    const getLookupData = useCallback(() => {

        get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam=CUSTOMER_CATEGORY,CONTACT_PREFERENCE,CUSTOMER_ID_TYPE,PROJECT')
            .then((response) => {
                const { data } = response;
                const contactPreferenceOptions = data?.CONTACT_PREFERENCE.map((preference) => {
                    return {
                        value: preference.code,
                        label: preference.description
                    }
                })
                // data?.PROJECT.map((preference) => {
                //     return {
                //         value: preference.code,
                //         label: preference.description
                //     }
                // })

                let projectOptions = []
                let currProjects = []
                data?.PROJECT?.forEach((p) => {
                    projectOptions.push({ 'label': p.description, 'value': p.code })
                    console.log(detailedViewItem?.customerDetails)
                    if (detailedViewItem?.customerDetails?.projectMapping?.length > 0) {
                        let currentDeptProject = detailedViewItem?.customerDetails?.projectMapping?.filter((f) => f?.entity === auth?.currDeptId)
                        currentDeptProject && Array.isArray(currentDeptProject) && currentDeptProject?.length > 0 && currentDeptProject?.[0]?.project.length > 0 && currentDeptProject?.[0]?.project?.forEach((m) => {
                            if (m === p.code) {
                                currProjects.push({
                                    'label': p.description, 'value': p.code
                                })
                            }
                        })
                    }

                })
                unstable_batchedUpdates(() => {
                    setCategoryLookup(data['CUSTOMER_CATEGORY']);
                    setContactPreferenceLookup(contactPreferenceOptions || []);
                    setIdTypeLookup(data['CUSTOMER_ID_TYPE']);
                    setProjects(projectOptions || [])
                    // setCreateProfileInputs({
                    //     ...createProfileInputs,
                    //     projectMapping: currProjects
                    // })
                    setSelectedMappingProjects(currProjects)
                })
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }, [])


    useEffect(() => {
        getLookupData();
    }, [getLookupData])

    useEffect(() => {
        // console.log('CreateProfileModal.useEffect', detailedViewItem)
        unstable_batchedUpdates(() => {
            setChannel(detailedViewItem?.customerDetails?.source)
            const contactPreferences = detailedViewItem?.customerDetails?.contactPreferences?.map((e) => {
                return {
                    label: e.description,
                    value: e.code
                }
            })

            setCreateProfileInputs({
                // foreName: (detailedViewItem?.customerDetails?.customer?.fullName) ? detailedViewItem?.customerDetails?.customer?.fullName : (detailedViewItem?.name) ? detailedViewItem?.name : detailedViewItem?.customerName,
                foreName: (detailedViewItem?.customerDetails?.firstName || '') + ' ' + (detailedViewItem?.customerDetails?.lastName || ''),
                category: detailedViewItem?.customerDetails?.profileCategory?.code,
                contactNbr: (detailedViewItem?.customerDetails?.contactDetails?.mobileNo) ? detailedViewItem?.customerDetails?.contactDetails?.mobileNo : detailedViewItem?.contactNo,
                email: detailedViewItem?.email || detailedViewItem?.emailId || detailedViewItem?.mailId,
                contactPreference: contactPreferences,
                idType: detailedViewItem?.customerDetails?.idType?.code,
                idValue: detailedViewItem?.customerDetails?.idValue,
                customerId: detailedViewItem?.customerDetails?.profileId,
                contactId: detailedViewItem?.contactId,
                searchProfile: "",
                useExistingProfile: isExisting,
            })
            setReadOnly(isExisting);
        })
    }, [])

    useEffect(() => {
        if (selectedMappingProjects && Array.isArray(selectedMappingProjects)) {
            unstable_batchedUpdates(() => {
                setCreateProfileInputs({
                    ...createProfileInputs,
                    projectMapping: selectedMappingProjects
                })
            })
        }
    }, [selectedMappingProjects])

    const validate = (schema, data) => {
        try {
            setCreateProfileInputsErrors({});
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                setCreateProfileInputsErrors((prevState) => {
                    return { ...prevState, [err.params.path]: err.message };
                });
            });
            return e;
        }
    };

    const handleOnCreateProfileInputsChange = (e) => {
        const { target } = e;

        if (target.id === "contactPreference" || target.id === "projectMapping") {
            // Handle multi-select inputs
            const selectedOptions = target.value.map((option) => ({
                value: option.value,
                label: option.label,
            }));
            setCreateProfileInputs({ ...createProfileInputs, [target.id]: selectedOptions });
        } else {
            setCreateProfileInputs({
                ...createProfileInputs,
                [target.id]: target.id === 'useExistingProfile' ? !createProfileInputs.useExistingProfile : target.value
            })

            if (target.id === 'useExistingProfile' && createProfileInputs.useExistingProfile) {
                setCreateProfileInputs({
                    ...createProfileInputs,
                    searchProfile: ''
                })
            }
        }

    }

    const createCustomer = () => {
        const mappedProjects = []

        if (!isObjectEmpty(createProfileInputs?.projectMapping)) {
            let projectArray = []
            createProfileInputs?.projectMapping.forEach((f) => {
                projectArray.push(f.value)
            })
            mappedProjects.push({
                entity: auth?.currDeptId,
                "project": projectArray
            })
        }

        const requestBody = {
            firstName: detailedViewItem?.customerDetails?.firstName || createProfileInputs?.foreName,
            lastName: detailedViewItem?.customerDetails?.lastName || '',
            idType: createProfileInputs?.idType,
            idValue: createProfileInputs?.idValue,
            contactPreferences: createProfileInputs?.contactPreference?.flat().map(option => option.value),
            projectMapping: mappedProjects,
            helpdeskNo: detailedViewItem?.helpdeskNo || null,
            contact: {
                isPrimary: true,
                firstName: detailedViewItem?.customerDetails?.firstName || createProfileInputs?.foreName,
                lastName: detailedViewItem?.customerDetails?.lastName || '',
                contactType: 'CNTMOB',
                emailId: createProfileInputs?.email,
                mobilePrefix: auth?.user?.extn || '+673',
                mobileNo: createProfileInputs?.contactNbr
            }
        }
        post(properties.PROFILE_API + '/create', requestBody)
            .then((response) => {
                const { status, message } = response;
                if (status === 200) {

                    handleOnCancel();
                    detailedViewItem?.helpdeskId !== undefined ?
                        handleRefresh()
                        :
                        doSoftRefresh('UPDATE_CUSTOMER_DETAILS_CHAT', detailedViewItem?.chatId)
                    toast.success(message);
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }

    const handleRefresh = () => {
        doSoftRefresh('UPDATE_CUSTOMER_DETAILS', detailedViewItem?.helpdeskId, detailedViewItem?.currUser ? 'ASSIGNED' : 'QUEUE')
        doSoftRefresh('UPDATE_DETAILED_VIEW', detailedViewItem?.helpdeskId)

    }

    const updateCustomer = () => {

        if (createProfileInputs?.searchProfile) {
            // helpdesk map
            const reqBody = {
                profileNo: createProfileInputs?.profileNo,
                contactId: createProfileInputs?.contactId,
                profileType: channel
            }
            put(`${properties.HELPDESK_API}/map/${detailedViewItem?.helpdeskNo}`, reqBody)
                .then((resp) => {
                    if (resp.status === 200) {
                        handleOnCancel();
                        detailedViewItem?.helpdeskId !== undefined ? handleRefresh()
                            // doSoftRefresh('UPDATE_CUSTOMER_DETAILS', detailedViewItem?.helpdeskId, detailedViewItem?.currUser ? 'ASSIGNED' : 'QUEUE')
                            :
                            doSoftRefresh('UPDATE_CUSTOMER_DETAILS_CHAT', detailedViewItem?.chatId)
                        toast.message(resp.message)
                    }
                }).catch((error) => {
                    console.log(error)
                }).finally()

        } else {
            let mappedProjects = []
            if (!isObjectEmpty(createProfileInputs?.projectMapping)) {

                let projectArray = []
                createProfileInputs?.projectMapping.forEach((f) => {
                    projectArray.push(f.value)
                })

                if (detailedViewItem?.customerDetails?.projectMapping && Array.isArray(detailedViewItem?.customerDetails?.projectMapping)) {
                    mappedProjects = (detailedViewItem?.customerDetails?.projectMapping && detailedViewItem?.customerDetails?.projectMapping?.filter((f) => f.entity !== auth.currDeptId)) || []

                }
                mappedProjects.push({
                    entity: auth?.currDeptId,
                    "project": projectArray
                })
            }
            if (channel === statusConstantCode?.entityCategory?.CUSTOMER && (!detailedViewItem?.customerDetails?.profileUuid && !createProfileInputs?.profileUuid)) {
                toast.warn('Profile Uid is not found')
                return false
            }

            let requestBody = {}

            if (channel === statusConstantCode?.entityCategory?.PROFILE) {
                requestBody = {
                    profileNo: detailedViewItem?.customerDetails?.profileNo || createProfileInputs?.profileNo,
                    firstName: detailedViewItem?.customerDetails?.firstName || createProfileInputs?.foreName,
                    lastName: detailedViewItem?.customerDetails?.lastName || createProfileInputs?.lastName,
                    idType: createProfileInputs?.idType,
                    idValue: createProfileInputs?.idValue,
                    projectMapping: mappedProjects,
                    contactPreferences: createProfileInputs?.contactPreference?.map(option => option.value),
                    contact: {
                        isPrimary: false,
                        firstName: detailedViewItem?.customerDetails?.firstName || createProfileInputs?.foreName,
                        contactType: detailedViewItem?.customerDetails?.contactDetails?.contactType?.code || createProfileInputs?.contactType,
                        lastName: detailedViewItem?.customerDetails?.lastName || createProfileInputs?.lastName,
                        emailId: createProfileInputs?.email,
                        mobilePrefix: detailedViewItem?.customerDetails?.contactDetails?.mobilePrefix || createProfileInputs?.mobilePrefix,
                        mobileNo: createProfileInputs?.contactNbr,
                        contactNo: detailedViewItem?.customerDetails?.contactDetails?.contactNo || createProfileInputs?.contactNbr
                    }
                }
            } else {
                requestBody = {
                    details: {
                        customerNo: detailedViewItem?.customerDetails?.profileNo || createProfileInputs?.profileNo,
                        firstName: detailedViewItem?.customerDetails?.firstName || createProfileInputs?.firstName,
                        lastName: detailedViewItem?.customerDetails?.lastName || createProfileInputs?.lastName,
                        idType: createProfileInputs?.idType,
                        idValue: createProfileInputs?.idValue,
                        projectMapping: mappedProjects,
                        contactPreferences: createProfileInputs?.contactPreference?.map(option => option.value),
                        source: 'HELPDESK'
                    },
                    contact: {
                        isPrimary: false,
                        firstName: detailedViewItem?.customerDetails?.firstName || createProfileInputs?.foreName,
                        lastName: detailedViewItem?.customerDetails?.lastName || createProfileInputs?.lastName,
                        emailId: createProfileInputs?.email,
                        mobilePrefix: detailedViewItem?.customerDetails?.contactDetails?.mobilePrefix || createProfileInputs?.mobilePrefix,
                        mobileNo: createProfileInputs?.contactNbr,
                        contactNo: detailedViewItem?.customerDetails?.contactDetails?.contactNo || createProfileInputs?.contactNo
                    }
                }
            }

            put(channel === statusConstantCode?.entityCategory?.PROFILE ? `${properties.PROFILE_API}/update` : `${properties.CUSTOMER_API}/${detailedViewItem?.customerDetails?.profileUuid || createProfileInputs?.profileUuid}`, requestBody)
                .then((response) => {
                    const { status, message } = response;
                    if (status === 200) {
                        handleOnCancel();
                        handleRefresh()
                        // detailedViewItem?.helpdeskId !== undefined ?
                        //     doSoftRefresh('UPDATE_CUSTOMER_DETAILS', detailedViewItem?.helpdeskId, detailedViewItem?.currUser ? 'ASSIGNED' : 'QUEUE')
                        //     :
                        //     doSoftRefresh('UPDATE_CUSTOMER_DETAILS_CHAT', detailedViewItem?.chatId)
                        toast.success(message);
                    }
                })
                .catch(error => {
                    console.error(error);
                })
                .finally()
        }
    }

    const handleOnSubmit = () => {
        if (validate(CreateProfileValidationSchema, createProfileInputs)) {
            toast.error("Validation Errors Found")
            return;
        }
        readOnly ?
            updateCustomer()
            :
            createCustomer()
    }

    const handleOnSearchProfile = () => {

        const validateEmail = (email) => {
            return String(email)
                .toLowerCase()
                .match(
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                );
        };

        if (isNaN(createProfileInputs.searchProfile)) {
            const email = validateEmail(createProfileInputs.searchProfile)
            if (!email) {
                toast.warn('Please provide the vaild email')
                return false
            }
        }

        get(`${properties.HELPDESK_API}/profile?searchParam=${createProfileInputs.searchProfile}`)
            .then((response) => {
                const { status, data, message } = response;
                if (status === 200 && data && !isEmpty(data)) {
                    const contactPreferences = data?.customerDetails?.contactPreferences?.map((e) => {
                        return {
                            label: e.description,
                            value: e.code
                        }
                    })

                    let currProjects = []
                    project?.forEach((p) => {
                        console.log(data?.customerDetails)
                        if (data?.customerDetails?.projectMapping?.length > 0) {
                            let currentDeptProject = data?.customerDetails?.projectMapping?.filter((f) => f?.entity === auth?.currDeptId)
                            currentDeptProject && Array.isArray(currentDeptProject) && currentDeptProject?.length > 0 && currentDeptProject?.[0]?.project.length > 0 && currentDeptProject?.[0]?.project?.forEach((m) => {
                                if (m === p.value) {
                                    currProjects.push({
                                        'label': p.label, 'value': p.value
                                    })
                                }
                            })
                        }
                    })

                    unstable_batchedUpdates(() => {
                        setChannel(data?.customerDetails?.source)
                        setCreateProfileInputs({
                            ...createProfileInputs,
                            profileNo: data?.customerDetails?.profileNo,
                            profileUuid: data?.customerDetails?.profileUuid,
                            foreName: `${data?.customerDetails?.firstName ? data.customerDetails?.firstName : ''} ${data?.customerDetails?.lastName ? data.customerDetails?.lastName : ''}`,
                            category: data?.customerDetails?.profileCategory?.code,
                            contactNbr: data?.mobileNo,
                            contactPreference: contactPreferences,
                            projectMapping: currProjects,
                            email: data?.email || data?.emailId || data?.mailId,
                            idType: data?.customerDetails?.idType?.code,
                            idValue: data?.customerDetails?.idValue,
                            customerId: data?.customerDetails?.profileId,
                            contactId: data?.contactId,
                            useExistingProfile: false,
                            contactNo: data?.contactNo,
                            mobilePrefix: data?.mobilePrefix,
                            lastName: data?.customerDetails?.lastName || ''
                        })
                        setSource('API');
                        setReadOnly(true);
                        toast.success(message);
                    })
                }
                else {
                    toast.error('No Profile Details Found');
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }

    console.log('setCreateProfileInputs', createProfileInputs)

    const handleOnClear = () => {
        let newInitialValues = {
            ...initialValues,
            email: createProfileInputs.email
        }
        unstable_batchedUpdates(() => {
            setReadOnly(false);
            setCreateProfileInputs(newInitialValues);
        })
    }

    const handleOnCancel = () => {
        unstable_batchedUpdates(() => {
            setIsCreateProfileOpen(!isCreateProfileOpen);
            setCreateProfileInputs(initialValues);
        })
    }

    return (
        <Modal isOpen={isCreateProfileOpen} contentLabel="Worflow History Modal" style={RegularModalCustomStyles}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title">{readOnly ? 'Update' : 'Create'} Profile</h4>
                        <button type="button" className="close" onClick={() => setIsCreateProfileOpen(!isCreateProfileOpen)}>×</button>
                    </div>
                    <div className="modal-body">
                        <fieldset className={`scheduler-border ${readOnly ? 'd-none' : ''}`}>
                            <div className="row pt-1">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label htmlFor="inputState" className="col-form-label">Search Profile </label>
                                        <div className="form-group form-inline">
                                            <input disabled={!createProfileInputs.useExistingProfile} type="text" id="searchProfile" placeholder='Email / Mobile Number' className="form-control" value={createProfileInputs.searchProfile} onChange={handleOnCreateProfileInputsChange} />
                                            <div className="input-group-append">
                                                <button disabled={!createProfileInputs.useExistingProfile} className="skel-btn-submit" type="button" onClick={handleOnSearchProfile}>
                                                    <i className="fe-search"></i>
                                                </button>
                                                <div className="form-group">
                                                    <div className="form-group form-inline">
                                                        <div className="switchToggle ml-1">
                                                            <input type="checkbox" checked={createProfileInputs.useExistingProfile} onChange={handleOnCreateProfileInputsChange} />
                                                            <label className="cursor-pointer" htmlFor="switchx" id="useExistingProfile" onClick={readOnly ? () => { } : handleOnCreateProfileInputsChange}>Toggle</label>
                                                        </div>
                                                    </div>
                                                    &nbsp;
                                                    <label htmlFor="inputState" className="col-form-label">Use Existing Profile</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </fieldset>
                        <fieldset className="scheduler-border">
                            <div className="row pl-3">
                                <div className="row col-12">
                                    <div className="col-3">
                                        <div className="form-group">
                                            <label htmlFor="foreName" className="col-form-label">{appConfig?.clientFacingName?.customer??'Customer'} Name</label>
                                            <input readOnly={readOnly} type="text" className="form-control" id="foreName" value={createProfileInputs.foreName} onChange={handleOnCreateProfileInputsChange} />
                                        </div>
                                    </div>
                                    <div className="col-3">
                                        <div className="form-group">
                                            <label htmlFor="category" className="col-form-label">{appConfig?.clientFacingName?.customer??'Customer'} Category</label>
                                            <select disabled={readOnly} className="form-control" id="category" value={createProfileInputs.category} onChange={handleOnCreateProfileInputsChange}>
                                                <option value="" key='selectCat'>Select</option>
                                                {
                                                    categoryLookup.map((e) => (
                                                        <option value={e.code} key={e.code}>{e.description}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-3">
                                        <div className="form-group">
                                            <label htmlFor="contactNbr" className="col-form-label">{appConfig?.clientFacingName?.customer??'Customer'} Contact Number <span>*</span></label>
                                            <NumberFormatBase className={`form-control ${createProfileInputsErrors.reason ? "error-border" : ""}`} id="contactNbr" value={createProfileInputs.contactNbr} onChange={handleOnCreateProfileInputsChange}
                                            />
                                        </div>
                                        <span className="errormsg">{createProfileInputsErrors.contactNbr ? createProfileInputsErrors.contactNbr : ""}</span>
                                    </div>
                                    <div className="col-3">
                                        <div className="form-group">
                                            <label htmlFor="email" className="col-form-label">{appConfig?.clientFacingName?.customer??'Customer'} Email ID</label>
                                            <input readOnly type="text" className="form-control" id="email" value={createProfileInputs.email} onChange={handleOnCreateProfileInputsChange} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 row pt-1 pb-1">
                                    <div className="form-group col-md-3">
                                        <label htmlFor="contactPreference" className="col-form-label">Contact preference </label>
                                        {/* <select id="contactPreference" className="form-control" value={createProfileInputs.contactPreference} onChange={handleOnCreateProfileInputsChange}>
                                            <option value="" key='selectPref'>Select</option>
                                            {
                                                contactPreferenceLookup.map((e) => (
                                                    <option value={e.code} key={e.code}>{e.description}</option>
                                                ))
                                            }
                                        </select> */}
                                        <Select
                                            value={createProfileInputs.contactPreference}
                                            options={contactPreferenceLookup}

                                            menuPortalTarget={document.modal}
                                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}

                                            getOptionLabel={option => `${option.label}`}
                                            isMulti
                                            // className={`${error.contactPreference && "error-border"}`}
                                            onChange={(selectedOption) =>
                                                handleOnCreateProfileInputsChange({
                                                    target: {
                                                        id: "contactPreference",
                                                        value: selectedOption,
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="form-group col-md-3">
                                        <label htmlFor="idType" className="col-form-label">ID Type</label>
                                        <select id="idType" disabled={readOnly} className="form-control" value={createProfileInputs.idType} onChange={handleOnCreateProfileInputsChange} >
                                            <option value="" key='selectIdType'>Select</option>
                                            {
                                                idTypeLookup.map((e) => (
                                                    <option value={e.code} key={e.code}>{e.description}</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    <div className="col-3">
                                        <div className="form-group">
                                            <label htmlFor="idValue" className="col-form-label">ID Value</label>
                                            <input type="text" disabled={readOnly} id="idValue" className="form-control" value={createProfileInputs.idValue} onChange={handleOnCreateProfileInputsChange} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className=" pt-2" >
                                <div className="col-12 pl-2 bg-light border" > <h5 className="text-primary" >{appConfig?.clientFacingName?.customer??'Customer'} Project Mapping</h5 > </div >
                            </div >
                            <br></br>
                            {
                                project && <form className="d-flex justify-content-center" >
                                    <div style={{ width: "100%" }}>
                                        <Select
                                            // closeMenuOnSelect={false}
                                            //  defaultValue={selectedMappingProjects ? selectedMappingProjects : null}
                                            options={project}
                                            getOptionLabel={option => `${option.label}`}
                                            // formatOptionLabel={option => `${option.label} - ${option.value}`} 
                                            value={createProfileInputs.projectMapping}
                                            onChange={(selectedOption) =>
                                                handleOnCreateProfileInputsChange({
                                                    target: {
                                                        id: "projectMapping",
                                                        value: selectedOption,
                                                    },
                                                })
                                            }
                                            isMulti
                                            isClearable
                                            name="project"
                                            menuPortalTarget={document.Modal}

                                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}

                                        />
                                    </div>
                                </form>


                            }
                        </fieldset>
                        <div className="row justify-content-center">
                            <button className={`skel-btn-cancel ${source !== 'API' ? 'd-none' : ''}`} type="button" onClick={handleOnClear}>Clear</button>
                            <button className="skel-btn-submit" type="button" data-dismiss="modal" onClick={handleOnSubmit}>
                                {
                                    readOnly ? 'Update' : 'Submit'
                                }
                            </button>

                            {/* <button className="btn btn-secondary btn-sm" type="button" data-dismiss="modal" onClick={handleOnCancel}>Close</button> */}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default CreateProfileModal;
