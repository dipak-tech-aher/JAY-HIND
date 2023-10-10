import { useEffect, useState, useRef } from 'react';
import { string, object } from "yup";
import Modal from 'react-modal';
import { Element } from 'react-scroll';
import { properties } from "../../properties";
import { post, get } from "../../common/util/restUtil";

import FileUpload from '../../common/uploadAttachment/fileUpload';
import { toast } from 'react-toastify';
import { unstable_batchedUpdates } from 'react-dom';

const validationSchema = object().shape({
    ticketSource: string().required("Please select ticket source"),
    serviceType: string().required("Please select service type"),
    about: string().required("Please select about type"),
    interactionType: string().required("Please select service type"),
    remark: string().required("Please enter remark"),
    category: string().required("Please select category"),
});

Modal.setAppElement('body');

const CreateInteraction = (props) => {

    const { customerDetails, helpdeskId, isOpen, fromInteractions = false, detailedViewItem = {}, forChatInteractions = false } = props?.data
    const { setIsOpen, doSoftRefresh } = props?.handler
    const [category, setCategory] = useState([])
    const [serviceType, setServiceType] = useState([])
    const [serviceCategoryLookup, setServiceCategoryLookup] = useState([])
    const [ticketChannels, setTicketChannels] = useState([])
    const [ticketSources, setTicketSources] = useState([])
    const [interactionType, setInteractionType] = useState([])
    const [aboutValue, setAboutValues] = useState([])
    const [priority, setPriority] = useState([])
    const [sevearity, setSevearity] = useState([])
    const [currentFiles, setCurrentFiles] = useState([])
    const lookupData = useRef({})
    const [about, setAbout] = useState([])
    const [categories, setCategories] = useState([])


    const [interactionData, setInteractionData] = useState({
        ticketChannel: detailedViewItem?.source,
        ticketSource: "",
        serviceType: "",
        category: "",
        about: "",
        priority: "",
        sevearity: "",
        remark: "",
        intxnType: "",
        serviceTypeDesc: "",
        categoryDesc: ""
    })

    const [error, setError] = useState()
    useEffect(() => {

        
        get(properties.BUSINESS_ENTITY_API+'?searchParam=code_type&valueParam=CATEGORY,SERVICE_TYPE,TICKET_CHANNEL,TICKET_SOURCE,INTXN_TYPE,TICKET_ABOUT,TICKET_PRIORITY,TICKET_SEVERITY,INTXN_TYPE,PRODUCT_FAMILY,INTXN_CATEGORY,INTXN_CAUSE')
            .then((resp) => {
                if (resp.data) {
                    lookupData.current = resp.data;
                    setServiceType(lookupData.current["SERVICE_TYPE"]);
                    setTicketChannels(lookupData.current['TICKET_CHANNEL']);
                    setTicketSources(lookupData.current['TICKET_SOURCE']);
                    setInteractionType(lookupData.current['INTXN_TYPE']);
                    setCategories(lookupData.current['INTXN_CATEGORY'])
                    setPriority(lookupData.current['TICKET_PRIORITY']);
                    setSevearity(lookupData.current['TICKET_SEVERITY']);
                    setAboutValues(lookupData.current['INTXN_CAUSE']);
                    setServiceCategoryLookup(lookupData.current["PRODUCT_FAMILY"])
                }

            }).catch(error => console.log(error)).finally();
    }, [])

    const validate = () => {
        try {
            validationSchema.validateSync(interactionData, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                setError((prevState) => {
                    return { ...prevState, [err.params.path]: err.message };
                });
            });
            return e;
        }
    };


    const handleSubmit = () => {

        // console.log('handleSubmit', detailedViewItem, detailedViewItem?.chatId || detailedViewItem?.chatDetails?.chatId)

        const error = validate(validationSchema, interactionData);

        // console.log('validation error', error)

        if (error) return;
        
        let obj = {
            interactionType: interactionData?.interactionType,
            serviceType: interactionData?.serviceType,
            channel: interactionData.ticketChannel,
           // ticketSource: interactionData?.ticketSource,
            // about: interactionData?.about,
            interactionCategory: interactionData?.category,
            //profileNo: customerDetails?.profileNo,
           // customerNo: customerDetails?.customerNo,
            customerId: Number(customerDetails?.customer?.customerId) || Number(customerDetails?.customerId) || null,
            profileId: Number(customerDetails?.customer?.profileId) || Number(customerDetails?.profileId) || null,
            remarks: interactionData?.remark,
            chatId: (detailedViewItem?.chat && detailedViewItem?.chat[0]?.chatId) || detailedViewItem?.chatDetails?.chatId || null,
            helpdeskId: Number(helpdeskId) || null,
            attachment: [...currentFiles.map((current) => current.entityId)],
            priorityCode: interactionData?.priority,
            //sevearity: interactionData?.sevearity,
            contactPreference: [customerDetails?.customer?.contactPreferenceCode || customerDetails?.contactPreferenceCode || null ],
            problemCause: interactionData?.about,
            serviceCategory: interactionData?.serviceCategory,
        }

        // console.log('Posting', obj)

        post(properties.INTERACTION_API+'/create', obj).then((resp) => {
            if (resp.status === 200) {
                closeModal()
                forChatInteractions ? doSoftRefresh('UPDATE_DETAILED_VIEW', helpdeskId) : fromInteractions ? doSoftRefresh('UPDATE_INTERACTIONS', detailedViewItem?.intxnId) : doSoftRefresh()
                toast.success("Interaction created successfully, Id : " + resp.data.intxnId)
            } else {
                toast.error("Error while creating interaction")
            }
        }).catch(error => {
            console.error(error)
        }).finally()

    }
    const closeModal = () => {
        unstable_batchedUpdates(() => {
            setIsOpen(!isOpen)
            setInteractionData()
        })
    }
    //start 150-236 , jira Id 68 Pon Arasi
    const handleInteractionTypeChange = (x) => {
        let target = x.target

        if (target.id === 'interactionType') {
            const servicetypeData = lookupData.current["SERVICE_TYPE"].filter((e) => {
                if (e?.mapping?.requestType && e?.mapping?.requestType.includes(target.value)) {
                    return true
                }
                else {
                    return false
                }
            })
            console.log("servicetypeData", servicetypeData);
            unstable_batchedUpdates(() => {
                setInteractionData({
                    ...interactionData,
                    [target.id]: target.value,
                    ticketChannel: detailedViewItem?.source,
                    ticketSource: "",
                    serviceType: "",
                    category: "",
                    about: "",
                    priority: "",
                    sevearity: "",
                    remark: "",

                })
                //setServiceType(servicetypeData)
                //setCategories([])
                //setAbout([])
            })
        }

        else if (target.id === 'serviceType') {

            const categoryData = lookupData.current['INTXN_TYPE'].filter((e) => {
                if (e?.mapping?.serviceType && e?.mapping?.serviceType.includes(target.value)) {
                    return true
                }
                else {
                    return false
                }
            })
            unstable_batchedUpdates(() => {
                setInteractionData({
                    ...interactionData,
                    [target.id]: target.value,
                    ticketChannel: detailedViewItem?.source,
                    ticketSource: "",
                    //serviceType:"",
                    category: "",
                    about: "",
                    priority: "",
                    sevearity: "",
                    remark: "",

                })
               // setCategories(categoryData)
            })
        }

        else if (target.id === 'category') {
            const aboutData = lookupData.current['INTXN_CAUSE'].filter((e) => {
                if (e?.mapping?.problemType && Array.isArray(e?.mapping?.problemType) && e?.mapping?.problemType.includes(target.value)) {
                    return true
                }
                else {
                    return false
                }
            })
            unstable_batchedUpdates(() => {
                setInteractionData({
                    ...interactionData,
                    [target.id]: target.value,
                    ticketChannel: detailedViewItem?.source,
                    ticketSource: "",
                    //serviceType:"",
                    //category: "",
                    //about: "",
                    priority: "",
                    sevearity: "",
                    remark: "",

                })
               // setAboutValues(aboutData)
            })
        }
        else{
            setInteractionData({
                ...interactionData,
                [target.id]: target.value,
            })
        }
    } //End, jira Id 68 Pon Arasi

    return (
        <Modal isOpen={isOpen} onRequestClose={() => setIsOpen(false)} contentLabel="Example Modal">
            <div className="">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title">Create Interaction</h4>
                        <button onClick={closeModal} type="button" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    {
                        serviceType && ticketChannels && ticketSources && category && about &&
                        <div className="modal-body">
                            <fieldset className="scheduler-border">
                                <form className="d-flex justify-content-center">
                                    <div className="row">
                                        <div className="col-md-3">
                                            <div className="form-group" >
                                                <label className="control-label">Interaction Type</label>
                                                <select id="interactionType" className={`form-control pb-2 ${(error?.interactionType ? "input-error" : "")}`}
                                                    value={interactionData?.interactionType}
                                                    onChange={(e) => {
                                                        handleInteractionTypeChange(e)
                                                        // setInteractionData({ ...interactionData, interactionType: e.target.value })
                                                        setError({ ...error, interactionType: "" })
                                                    }}  >
                                                    <option key="interactionType" value="">Select interaction type</option>
                                                    {
                                                        interactionType.map((e) => (
                                                            <option key={e.code} value={e.code}>{e.description}</option>
                                                        ))
                                                    }
                                                </select>
                                                {error?.interactionType ? <span className="errormsg">{error?.interactionType}</span> : ""}
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="serviceCategory" className="control-label">Service Category <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                <select value={interactionData?.serviceCategory} id="serviceCategory" className={`form-control ${error?.serviceCategory && "error-border"}`} 
                                                onChange={handleInteractionTypeChange}>
                                                    <option key="serviceCategory" value="">Select Service Category</option>
                                                    {
                                                        serviceCategoryLookup && serviceCategoryLookup.map((e) => (
                                                            <option key={e.code} value={e.code}>{e.description}</option>
                                                        ))
                                                    }
                                                </select>
                                                <span className="errormsg">{error?.serviceCategory ? error?.serviceCategory : ""}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label className="control-label">Service Type</label>
                                                <select id="serviceType" className={`form-control pb-2 ${(error?.serviceType ? "input-error" : "")}`}
                                                    value={interactionData?.serviceType}
                                                    onChange={(e) => {
                                                        handleInteractionTypeChange(e)
                                                        //setInteractionData({ ...interactionData, serviceType: e.target.value })
                                                        setError({ ...error, serviceType: "" })

                                                    }}  >
                                                    <option key="serviceType" value="">Select service type</option>
                                                    {
                                                        serviceType && serviceType.map((e) => (
                                                            <option key={e.code} value={e.code}>{e.description}</option>
                                                        ))
                                                    }
                                                </select>
                                                {error?.serviceType ? <span className="errormsg">{error?.serviceType}</span> : ""}
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label className="control-label">Category</label>

                                                <select id="category" className={`form-control pb-2 ${(error?.category ? "input-error" : "")}`}
                                                    value={interactionData?.category}
                                                    onChange={(e) => {
                                                        handleInteractionTypeChange(e)
                                                        //setInteractionData({ ...interactionData, category: e.target.value })
                                                        setError({ ...error, category: "" })
                                                    }}  >
                                                    <option key="category" value="">Select category</option>
                                                    {
                                                        categories && categories.map((e) => (
                                                            <option key={e.code} value={e.code}>{e.description}</option>
                                                        ))
                                                    }
                                                </select>
                                                {error?.category ? <span className="errormsg">{error?.category}</span> : ""}
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label className="control-label">About</label>
                                                <select className={`form-control pb-2 ${(error?.about ? "input-error" : "")}`}
                                                    value={interactionData?.about}
                                                    onChange={(e) => {

                                                        setInteractionData({ ...interactionData, about: e.target.value })
                                                        setError({ ...error, about: "" })

                                                    }}  >
                                                    <option key="about" value="">Select about</option>
                                                    {
                                                        aboutValue && aboutValue.map((e) => (
                                                            <option key={e.code} value={e.code}>{e.description}</option>
                                                        ))
                                                    }
                                                </select>
                                                {error?.about ? <span className="errormsg">{error?.about}</span> : ""}
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group" >
                                                <label className="control-label">Ticket channel</label>
                                                <select className="form-control " disabled="true"
                                                    value={interactionData?.ticketChannel}
                                                    onChange={(e) => {

                                                        setInteractionData({ ...interactionData, ticketChannel: e.target.value })

                                                    }}  >
                                                    {
                                                        ticketChannels.map((e) => (
                                                            <option key={e.code} value={e.code}>{e.description}</option>
                                                        ))
                                                    }
                                                    {/* <option value="CHNL004">Email</option>
                                                    <option value="CHNL021">Chat2Us</option> */}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group" >
                                                <label className="control-label">Ticket Source</label>
                                                <select className={`form-control pb-2 ${(error?.ticketSource ? "input-error" : "")}`}
                                                    value={interactionData?.ticketSource}
                                                    onChange={(e) => {
                                                        setInteractionData({ ...interactionData, ticketSource: e.target.value })
                                                        setError({ ...error, ticketSource: "" })
                                                    }}  >
                                                    <option value="">Select ticket source</option>
                                                    {
                                                        ticketSources.map((e) => (
                                                            <option key={e.code} value={e.code}>{e.description}</option>
                                                        ))
                                                    }
                                                </select>
                                                {error?.ticketSource ? <span className="errormsg">{error?.ticketSource}</span> : ""}
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group" >
                                                <label className="control-label">Priority</label>
                                                <select className={`form-control pb-2 ${(error?.priority ? "input-error" : "")}`}
                                                    value={interactionData?.priority}
                                                    onChange={(e) => {
                                                        setInteractionData({ ...interactionData, priority: e.target.value })
                                                        setError({ ...error, priority: "" })
                                                    }}  >
                                                    <option value="">Select Priority</option>
                                                    {
                                                        priority.map((e) => (
                                                            <option key={e.code} value={e.code}>{e.description}</option>
                                                        ))
                                                    }
                                                </select>
                                                {error?.priority ? <span className="errormsg">{error?.priority}</span> : ""}
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group" >
                                                <label className="control-label">Severity</label>
                                                <select className={`form-control pb-2 ${(error?.sevearity ? "input-error" : "")}`}
                                                    value={interactionData?.sevearity}
                                                    onChange={(e) => {
                                                        setInteractionData({ ...interactionData, sevearity: e.target.value })
                                                        setError({ ...error, sevearity: "" })
                                                    }}  >
                                                    <option value="">Select Severity</option>
                                                    {
                                                        sevearity.map((e) => (
                                                            <option key={e.code} value={e.code}>{e.description}</option>
                                                        ))
                                                    }
                                                </select>
                                                {error?.sevearity ? <span className="errormsg">{error?.sevearity}</span> : ""}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label className="control-label">Remark</label>
                                                <div className="switchToggle">
                                                    <textarea className="form-control" id="details" name="remarks" rows="4" value={interactionData?.remark}
                                                        onChange={(e) => {

                                                            setInteractionData({ ...interactionData, remark: e.target.value })
                                                            setError({ ...error, remark: "" })
                                                        }}>
                                                    </textarea>
                                                </div>
                                                {error?.remark ? <span className="errormsg">{error?.remark}</span> : ""}
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </fieldset>
                            <Element name="attachmentsSection" className="element btm-space attach-sec">
                                <div className="row">
                                    <div className="col-12 p-0">
                                        <section className="triangle"><h4 id="list-item-0" className="pl-2" style={{ alignContent: 'left' }}>Attachments </h4></section>
                                    </div>
                                </div>
                                <FileUpload
                                    data={{
                                        currentFiles,
                                        entityType: 'INTERACTION',
                                        shouldGetExistingFiles: false,
                                        permission: false
                                    }}
                                    handlers={{
                                        setCurrentFiles
                                    }}
                                />
                            </Element>
                            <div style={{ marginTop: "30px" }} className="col-md-12 text-center">
                                <button className="btn waves-effect waves-light btn-primary" onClick={handleSubmit} >Submit</button>&nbsp;
                                <button className="btn waves-effect waves-light btn-secondary" onClick={closeModal}>Close</button>
                            </div>
                        </div>
                    }
                </div>
            </div>
        </Modal >
    );
};

export default CreateInteraction;
