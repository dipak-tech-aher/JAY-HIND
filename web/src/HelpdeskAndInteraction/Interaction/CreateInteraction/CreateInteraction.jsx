import React, { useCallback, useEffect, useRef, useState, useContext } from "react";
import profileLogo from "../../../assets/images/profile.png";
// import { string, object } from "yup";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import InteractionWidget from "./InteractionWidgets";
import CreateInteractionForm from "./CreateInteractionForm";
import * as Yup from "yup";
import { get, post, slowPost } from "../../../common/util/restUtil";
import { properties } from "../../../properties";
import moment from "moment";
import Modal from "react-modal";
import { RegularModalCustomStyles, removeDuplicatesFromArrayObject, removeEmptyKey } from "../../../common/util/util";
import Swal from "sweetalert2";
import ReactSwitch from "react-switch";
import AddProductModal from "../../../CRM/ServiceManagement/AddProductModal";
import { DatalistInput, useComboboxControls } from "react-datalist-input";
import PopupModal from "../../../common/popUpModal";
import { statusConstantCode } from "../../../AppConstants";
import { unstable_batchedUpdates } from "react-dom";
import { confirmAlert } from 'react-confirm-alert';
import { isEmpty } from 'lodash'
import { AppContext } from "../../../AppContext";
import DynamicTable from "../../../common/table/DynamicTable";

// import { hideSpeenner, showSpeenner } from '../../../common/speenner';

let clone = require("clone");

const CreateInteraction = (props) => {
  const { appsConfig } = props
  // console.log('props------------------------>', props)
  const history = useHistory();
  const anonymous = props?.location?.state?.complaintSearchInput?.anonymous;
  const customerName =
    props?.location?.state?.complaintSearchInput?.customerName;
  const mobileNo = props?.location?.state?.complaintSearchInput?.mobileNo;
  const emailId = props?.location?.state?.complaintSearchInput?.emailId;
  const customerDetails = props?.location?.state?.data;
  // console.log('customerDetails====>', customerDetails)
  const customerUuid = customerDetails?.customerUuid;
  const customerContactNo = customerDetails?.customerContact[0].contactNo;
  const screenSource = props?.location?.state?.data?.source;

  let [resolutionData, setResolutionData] = useState([]);
  let [selectedContactPreference, setSelectedContactPreference] = useState([]);

  let newArray = clone(resolutionData);

  const [resolutionPayloadData, setResolutionPayloadData] = useState();
  const [isFollowupOpen, setIsFollowupOpen] = useState(false);
  const [sourceLookup, setSourceLookup] = useState([]);

  const [customerData, setCustomerData] = useState(customerDetails);
  const [popup, setPopup] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const [accountData, setAccountData] = useState({});
  const [autoCreateInteraction, setAutoCreateInteraction] = useState(false);
  const [serviceData, setServiceData] = useState({});
  const [switchStatus, setSwitchStatus] = useState(true);
  const [actionCount, setActionCount] = useState(1);
  let [workflowResponse, setWorkflowResponse] = useState([]);
  let [multipleServiceData, setMultipleServiceData] = useState([]);
  let [serviceMsg, setServiceMsg] = useState();
  let [selectedInteraction, setSelectedInteraction] = useState([]);
  const [workflowPaylod, setWorkflowPaylod] = useState({
    flowId: "",
    conversationUid: "",
    data: {
      source: "knowledgeBase",
    },
  });
  const [firstTimeResolved, setFirstTimeResolved] = useState(false);
  const [productArr, setProductArr] = useState([]);
  const [orderId, setOrderId] = useState([]);
  const initIntxnData = {
    interactionResolution: "",
    statement: "",
    statementId: "",
    statementSolution: "",
    interactionType: "",
    interactionCategory: "",
    serviceType: "",
    serviceCategory: "",
    channel: "WALKIN",
    problemCause: "",
    priorityCode: "",
    // contactPreference: "",
    contactPreference: [],
    remarks: "",
    switchStatus,
    useCustomerAddress: true,
  };
  const [buttonDisable, setButtonDisable] = useState(false);
  const [interactionData, setInteractionData] = useState(initIntxnData);
  const [createdIntxnData, setCreatedIntxnData] = useState({});
  const [knowledgeBaseInteractionList, setKnowledgeBaseInteractionList] =
    useState([]);
  const [currentFiles, setCurrentFiles] = useState([]);
  const [error, setError] = useState({});
  const [intxnTypeLookup, setIntxnTypeLookup] = useState([]);
  const [intxnCategoryLookup, setIntxnCategoryLookup] = useState([]);
  const [channelLookup, setChannelLookup] = useState([]);
  const [serviceTypeLookup, setServiceTypeLookup] = useState([]);
  const [priorityLookup, setPriorityLookup] = useState([]);
  const [preferenceLookup, setPreferenceLookup] = useState([]);
  const [problemCaseLookup, setProblemCauseLookup] = useState([]);
  const [serviceCategoryLookup, setServiceCategoryLookup] = useState([]);
  const [timer, setTimer] = useState(null);
  const lookupData = useRef({});
  const [frequentInteraction, setFrequentInteraction] = useState([]);
  const [frequentCustomerInteraction, setFrequentCustomerInteraction] =
    useState([]);
  const [frequentDayInteraction, setFrequentDayInteraction] = useState([]);
  const [frequentTenInteraction, setFrequentTenInteraction] = useState([]);
  const [kbRequestId, setKbRequestId] = useState();
  const [openServiceModal, setOpenServiceModal] = useState(false);
  const [serviceList, setServiceList] = useState([]);
  let [selectedService, setSelectedService] = useState({});
  let openInteractionCount = useRef(0),
    closedInteractionCount = useRef(0);
  const [interactionList, setInteractionList] = useState([]);
  const [openProductModal, setOpenProductModal] = useState(false);
  const [productList, setProductList] = useState([]);
  const [selectedProductList, setSelectedProductList] = useState([]);
  const [openCreateInteraction, setOpenCreateInteraction] = useState(false);
  const [interactionStatement, setInteractionStatement] = useState();
  const { isExpanded, setIsExpanded, setValue, value } = useComboboxControls({
    isExpanded: true,
  });
  const [items, setItems] = useState([]);
  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [countries, setCountries] = useState([]);
  const [addressData, setAddressData] = useState({
    address1: "",
    address2: "",
    address3: "",
    district: "",
    state: "",
    city: "",
    country: "",
    postcode: "",
    countryCode: "",
  });
  const [addressLookUpRef, setAddressLookUpRef] = useState(null);
  const [addressError, setAddressError] = useState(null);
  const [helpdeskDetails, setHelpdeskDetails] = useState();
  const [isFormDisabled, setIsFormDisabled] = useState(false)
  const [formDetails, setFormDetails] = useState({})

  const [interactionStatusType, setInteractionStatusType] = useState();
  const [popupType, setPopupType] = useState("");
  const [isInteractionListOpen, setIsInteractionListOpen] = useState(false);
  const [currentPageModal, setCurrentPageModal] = useState(0);
  const [perPageModal, setPerPageModal] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [interactionCustomerHistoryDetails, setInteractionCustomerHistoryDetails] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState()
  // const interactionDetailsValidationSchema = object().shape({
  //     statement: string().required("Interaction is required"),
  //     // statementId: string().required("Interaction is required"),
  //     // statementSolution: string().required("Interaction is required"),
  //     interactionType: string().required("Interaction Type is required"),
  //     interactionCategory: string().required("Interaction Category is required"),
  //     serviceType: string().required("Service Type is required"),
  //     serviceCategory: string().required("Service Category is required"),
  //     channel: string().required("Ticket Channel is required"),
  //     problemCause: string().required("Problem Cause is required"),
  //     priorityCode: string().required("Priority is required"),
  //     contactPreference: array().required("Contact Preference is required"),
  //     remarks: string().required("Remarks is required")
  // });

  const interactionDetailsValidationSchema = Yup.object().shape({
    // statement: Yup.string().required("Interaction is required"),
    // statementId: Yup.string().required('Interaction is required'),
    // statementSolution: Yup.string().required('Interaction is required'),
    interactionType: Yup.string().required("Interaction Type is required"),
    interactionCategory: Yup.string().required(
      "Interaction Category is required"
    ),
    serviceType: Yup.string().required("Service Type is required"),
    serviceCategory: Yup.string().required("Service Category is required"),
    channel: Yup.string().required("Ticket Channel is required"),
    // problemCause: Yup.string().required("Problem Cause is required"),
    priorityCode: Yup.string().required("Priority is required"),
    contactPreference: Yup.array().required("Contact Preference is required"),
    remarks: Yup.string().required("Remarks is required"),
  });

  const [followupInputs, setFollowupInputs] = useState({
    priority: "",
    source: "",
    remarks: "",
  });

  const [isHelpdeskOpen, setIsHelpdeskOpen] = useState(false);
  const [values, setValues] = useState([])

  useEffect(() => {
    if (
      props?.location?.state?.data?.source ===
      statusConstantCode.entityCategory.HELPDESK
    ) {
      setHelpdeskDetails(props?.location?.state?.data?.helpdeskDetails);
    }
  }, [props]);

  const handleOnAddFollowup = (e) => {
    e.preventDefault();
    const { priority, source, remarks } = followupInputs;
    if (!priority || !source || !remarks) {
      toast.error("Please provide mandatory fields");
      return;
    }
    let payload = {
      priorityCode: priority,
      source,
      remarks,
      orderNo: orderId,
    };

    post(`${properties.ORDER_API}/followUp`, { ...payload })
      .then((response) => {
        if (response?.status === 200) {
          toast.success("Follow Up Created Successfully");
          setIsFollowupOpen(false);
          setFollowupInputs({
            priority: "",
            source: "",
            remarks: "",
          });
          // console.log('resolutionPayloadData------>', resolutionPayloadData)
          workflowApiCall(resolutionPayloadData);
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally();
  };

  const handleOnFollowupInputsChange = (e) => {
    const { target } = e;
    setFollowupInputs({
      ...followupInputs,
      [target.id]: target.value,
    });
  };

  useEffect(() => {
    // setWorkflowResponse([])
    setValue("");
    unstable_batchedUpdates(() => {
      if (anonymous) {
        setCustomerData({
          firstName: customerName,
          lastName: "",
          customerContact: [
            {
              mobileNo,
              emailId,
            },
          ],
        });
      } else {
        if (customerUuid) {
          const searchParams = {
            customerUuid,
          };
          post(properties.INTERACTION_API + "/search?limit=10&page=0", {
            searchParams,
          })
            .then((resp) => {
              setInteractionList(resp.data);
              //setInteractionData(resp.data?.rows[0])
              // closedInteractionCount.current = resp.data?.rows.filter((e) =>
              //   ["CLOSED", "CANCELLED"].includes(e.intxnStatus)
              // ).length;
              // openInteractionCount.current = resp.data?.rows.filter(
              //   (e) => !["CLOSED", "CANCELLED"].includes(e.intxnStatus)
              // ).length;

            }).catch(error => {
              console.error(error);
            })
            .finally();

          get(
            properties.INTERACTION_API +
            "/frequent?customerUuid=" +
            customerUuid
          )
            .then((resp) => {
              if (resp.data) {
                // console.log('data for frequest customer interaction ', resp.data)
                setFrequentCustomerInteraction(resp?.data || []);
              } else {
                toast.error("Error while fetching address details");
              }
            })
            .catch((error) => {
              console.error(error);
            })
            .finally();

          post(
            properties.ACCOUNT_DETAILS_API +
            "/get-service-list?limit=10&page=0",
            { customerUuid }
          )
            .then((response) => {
              if (response.status === 200) {
                const services = response?.data?.filter(
                  (e) => e.status !== statusConstantCode.status.SERVICE_TEMP
                );
                setServiceList(services);
                // console.log("services------->", services);
                if (services.length > 1) {
                  // setOpenServiceModal(true)
                  setSelectedService(services[0]);
                } else if (services.length === 1) {
                  setOpenServiceModal(false);
                  setSelectedService(services[0]);
                } else {
                  setOpenServiceModal(false);
                }
              }
            })
            .catch((error) => {
              console.error(error);
            })
            .finally();
          get(properties.INTERACTION_API + "/get-customer-history-count/" + customerUuid)
            .then((resp) => {
              if (resp.data) {
                closedInteractionCount.current = resp.data?.closedInteraction || 0;
                openInteractionCount.current = resp.data?.openInteraction || 0;
              } else {
                toast.error("Error while fetching address details");
              }
            })
            .catch((error) => {
              console.error(error);
            })
            .finally();
        }
      }

      get(
        properties.MASTER_API +
        "/lookup?searchParam=code_type&valueParam=TICKET_SOURCE,INTXN_TYPE,INTXN_CATEGORY,SERVICE_TYPE,SERVICE_CATEGORY,TICKET_CHANNEL,PRIORITY,CONTACT_PREFERENCE,INTXN_CAUSE,APPOINT_TYPE,PRODUCT_FAMILY,LOCATION,COUNTRY,PROD_SUB_TYPE"
      )
        .then((resp) => {
          if (resp.data) {
            lookupData.current = resp.data;
            setSourceLookup(resp.data["TICKET_SOURCE"]);
            setIntxnTypeLookup(resp.data.INTXN_TYPE || []);
            setIntxnCategoryLookup(resp.data.INTXN_CATEGORY || []);
            setChannelLookup(resp.data.TICKET_CHANNEL || []);
            setPriorityLookup(resp.data.PRIORITY || []);
            setPreferenceLookup(resp.data.CONTACT_PREFERENCE || []);
            setServiceTypeLookup(resp.data.SERVICE_TYPE || []);
            setServiceCategoryLookup(resp.data.PROD_SUB_TYPE || []);
            setProblemCauseLookup(resp.data.INTXN_CAUSE || []);
            setAppointmentTypes(resp.data.APPOINT_TYPE || []);
            const customerCountry =
              props?.location?.state?.data?.customerAddress[0]?.country || null;
            setLocations(
              customerCountry
                ? resp.data.LOCATION.filter(
                  (x) => x?.mapping?.country === customerCountry
                )
                : resp.data.LOCATION
            );
            setCountries(resp.data.COUNTRY);
            if (
              customerDetails?.contactPreferences &&
              customerDetails?.contactPreferences.length > 0
            ) {
              const selectedOptions = resp.data.CONTACT_PREFERENCE.filter((x) =>
                customerDetails?.contactPreferences.includes(x.code)
              ).map((option) => ({
                value: option.code,
                label: option.description,
              }));
              // console.log("selectedOptions ", selectedOptions);
              setSelectedContactPreference(selectedOptions);
            }
          } else {
            toast.error("Error while fetching lookup details");
          }
        }).catch(error => console.log(error))
        .finally();

      //

      // if(selectedService && selectedService?.srvcTypeDesc?.code){
      //     get(properties.INTERACTION_API + '/frequent?st='+selectedService?.srvcTypeDesc?.code).then((resp) => {
      //         if (resp.data) {
      //             let newArray = removeDuplicatesFromArrayObject(resp.data, 'requestStatement')
      //             setFrequentInteraction(newArray || [])
      //         }
      //         else {
      //             toast.error("Error while fetching details")
      //         }
      //     })
      //     .finally()
      //
      //         get(properties.INTERACTION_API + '/frequent?today=' + moment().format('YYYY-MM-DD')+'&st='+selectedService?.srvcTypeDesc?.code).then((resp) => {
      //             if (resp.data) {
      //                 let newArray = removeDuplicatesFromArrayObject(resp.data, 'requestStatement')
      //                 setFrequentDayInteraction(newArray || [])
      //             }
      //             else {
      //                 toast.error("Error while fetching details")
      //             }
      //         })
      //         .finally()

      //         get(properties.INTERACTION_API + '/top-catagory?st='+selectedService?.srvcTypeDesc?.code).then((resp) => {
      //             if (resp.data) {
      //                 const newArray = []
      //                 const uniqueObject = {};
      //                 for (const i in resp.data) {
      //                     const item = resp.data[i]['intxnCategory']?.code;
      //                     if(item){
      //                         uniqueObject[item] = resp.data[i];
      //                     }

      //                 }

      //                 // Loop to push unique object into array
      //                 for (const i in uniqueObject) {
      //                     newArray.push(uniqueObject[i]);
      //                 }

      //                 setFrequentTenInteraction(newArray || [])
      //             }
      //             else {
      //                 toast.error("Error while fetching top 10 category")
      //             }
      //         })
      //         .finally()
      // }
    });
  }, []);

  useEffect(() => {
    unstable_batchedUpdates(() => {
      if (selectedService && Object.keys(selectedService).length > 0) {
        if (kbRequestId) {
          handleFrequentInteractionChange(kbRequestId, "frequent");
        }

        if (selectedService && selectedService?.srvcTypeDesc?.code) {
          get(
            properties.INTERACTION_API +
            "/frequent"
            // properties.INTERACTION_API +
            // "/frequent?st=" +
            // selectedService?.srvcTypeDesc?.code
          )
            .then((resp) => {
              if (resp.data) {
                let newArray = removeDuplicatesFromArrayObject(
                  resp.data,
                  "requestStatement"
                );
                setFrequentInteraction(newArray || []);
              } else {
                toast.error("Error while fetching details");
              }
            }).catch(error => console.log(error))
            .finally();

          get(
            properties.INTERACTION_API +
            "/frequent?today=" +
            moment().format("YYYY-MM-DD")
            //  +
            // "&st=" +
            // selectedService?.srvcTypeDesc?.code
          )
            .then((resp) => {
              if (resp.data) {
                let newArray = removeDuplicatesFromArrayObject(
                  resp.data,
                  "requestStatement"
                );
                setFrequentDayInteraction(newArray || []);
              } else {
                toast.error("Error while fetching details");
              }
            })
            .catch(error => console.log(error)).finally();

          get(
            properties.INTERACTION_API +
            "/top-catagory?st=" +
            selectedService?.srvcTypeDesc?.code
          )
            .then((resp) => {
              if (resp.data) {
                const newArray = [];
                const uniqueObject = {};
                for (const i in resp.data) {
                  const item = resp.data[i]["intxnCategory"]?.code;
                  if (item) {
                    uniqueObject[item] = resp.data[i];
                  }
                }

                // Loop to push unique object into array
                for (const i in uniqueObject) {
                  newArray.push(uniqueObject[i]);
                }

                setFrequentTenInteraction(newArray || []);
              } else {
                toast.error("Error while fetching top 10 category");
              }
            })
            .catch(error => console.log(error)).finally();
        }
      }
    });
  }, [selectedService]);

  const validate = (schema, data) => {
    try {
      setError({});
      schema.validateSync(data, { abortEarly: false });
    } catch (e) {
      e.inner.forEach((err) => {
        setError((prevState) => {
          return { ...prevState, [err.params.path]: err.message };
        });
      });
      return e;
    }
  };

  // const handleInputChange = (e) => {
  //     unstable_batchedUpdates(() => {

  //         const { target } = e
  //         setInteractionData({
  //             ...interactionData,
  //             [target.id]: target.value
  //         })
  //         setError({
  //             ...error,
  //             [target.id]: ""
  //         })
  //     })
  // }

  //     const [interactionData, setInteractionData] = useState({ contactPreference: [] });
  // const [error, setError] = useState({});

  const handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const id = target.id;
    if (id === "interactionCategory") {
      const intxnType =
        lookupData.current["INTXN_TYPE"] &&
        lookupData.current["INTXN_TYPE"].filter((e) => {
          let isTrue = false;
          if (
            e &&
            e.mapping &&
            e?.mapping?.mapEntity &&
            Array.isArray(e?.mapping?.mapEntity) &&
            e.mapping?.mapEntity.includes(value)
          ) {
            isTrue = true;
          }
          return isTrue;
        });
      unstable_batchedUpdates(() => {
        setIntxnTypeLookup(intxnType);
        // console.log("setInteractionData called 1");
        setInteractionData({ ...interactionData, [id]: value });
      });
    }
    // else if (id === "serviceCategory") {
    //   const serviceType =
    //     lookupData.current["SERVICE_TYPE"] &&
    //     lookupData.current["SERVICE_TYPE"].filter((e) => {
    //       let isTrue = false;
    //       if (
    //         e &&
    //         e.mapping &&
    //         e?.mapping?.mapEntity &&
    //         Array.isArray(e?.mapping?.mapEntity) &&
    //         e.mapping?.mapEntity.includes(value)
    //       ) {
    //         isTrue = true;
    //       }
    //       return isTrue;
    //     });
    //   // console.log('serviceType', serviceType)
    //   unstable_batchedUpdates(() => {
    //     setServiceTypeLookup(serviceType);
    //     setInteractionData({ ...interactionData, [id]: value });
    //   });
    // } 
    else if (id === "serviceType") {
      const serviceCategory = lookupData.current["SERVICE_TYPE"] && lookupData.current["SERVICE_TYPE"].filter((e) => {
        let isTrue = false;

        if (e && e.code === value) {
          isTrue = true;
        }
        return isTrue;
      });
      // console.log('serviceType', serviceCategory)
      unstable_batchedUpdates(() => {
        // console.log("setInteractionData called 2");
        // setServiceCategoryLookup(serviceCategory?.[0].mapping?.mapEntity?.[0] || '');
        setInteractionData({ ...interactionData, [id]: value, serviceCategory: serviceCategory?.[0].mapping?.mapEntity?.[0] });
      });
    }
    else if (id === "contactPreference") {
      // Handle multi-select inputs
      const selectedOptions = value.map((option) => ({
        value: option.value,
        label: option.label,
      }));
      // console.log("setInteractionData called 3");
      setInteractionData({ ...interactionData, [id]: selectedOptions });
    } else {
      // console.log("setInteractionData called 4");
      setInteractionData({ ...interactionData, [id]: value });
    }
  };


  const handleKnowledgeBaseInteraction = (value, type, callingFrom) => {
    console.log('value---->', value)
    console.log('type---->', type)
    unstable_batchedUpdates(() => {
      if (type !== "frequent10") {
        if (value) {
          get(
            `${properties.KNOWLEDGE_API}/search?q=${value}&st=${selectedService.srvcTypeDesc?.code}`
          )
            .then((resp) => {
              if (resp?.data) {
                setKnowledgeBaseInteractionList(resp?.data || []);
                const arr = [];
                for (const i of resp?.data) {
                  const obj = {
                    id: i.requestId,
                    value: i.requestStatement,
                    ...i,
                  };
                  arr.push(obj);
                }
                // console.log('arr --------> 653', arr)
                setIsExpanded(true);//to show the list in search bar
                setItems(arr);
                // if (resp?.data?.length === 1) {
                //     handleFrequentInteractionChange(resp?.data[0], '')
                // }
              }
            })
            .catch((error) => {
              console.error(error);
            })
            .finally();
        } else {
          setKnowledgeBaseInteractionList([]);
        }
      } else {
        let api_url = `${properties.KNOWLEDGE_API}/search?c=${value?.intxnCategory?.code}&st=${selectedService.srvcTypeDesc?.code}`
        if (callingFrom === "InteractionWidget") {
          api_url = `${properties.KNOWLEDGE_API}/search?c=${value?.intxnCategory?.code}`
        }
        get(api_url)
          .then((resp) => {
            if (resp?.data) {
              const arr = [];
              for (const i of resp?.data) {
                const obj = {
                  id: i.requestId,
                  value: i.requestStatement,
                  ...i,
                };
                arr.push(obj);
              }
              unstable_batchedUpdates(() => {
                setValue("");
                setIsExpanded(true);
                setKnowledgeBaseInteractionList(resp?.data || []);
                setItems(arr);
              })
              // if (resp?.data?.length === 1) {
              //     handleFrequentInteractionChange(resp?.data[0], '')
              // }
            }
          })
          .catch((error) => {
            console.error(error);
          })
          .finally();
      }
    });
  };

  useEffect(() => {
    if (knowledgeBaseInteractionList?.length && value?.trim() !== "") {
      const knowledgeBase = knowledgeBaseInteractionList.find(
        (x) => x.requestStatement?.toLowerCase()?.includes(value?.toLowerCase())
      );
      if (knowledgeBase) {
        setInteractionDataFunc(knowledgeBase);
      }
    }
  }, [knowledgeBaseInteractionList])

  const setInteractionDataFunc = (knowledgeBase) => {
    setInteractionData({
      ...interactionData,
      interactionResolution: knowledgeBase?.intxnResolutionDesc?.description || "",
      statementId: knowledgeBase?.requestId || "",
      statement: knowledgeBase?.requestStatement || "",
      statementSolution: knowledgeBase?.intxnResolution || "",
      problemCause: knowledgeBase?.intxnCause || "",
      serviceType: knowledgeBase.serviceType || "",
      switchStatus,
      interactionType: knowledgeBase?.intxnType || "",
      interactionCategory: knowledgeBase?.intxnCategory || "",
      serviceCategory: knowledgeBase?.serviceCategory || "",
      priorityCode: knowledgeBase?.priorityCode || ""
    });
  }

  const handleKnowledgeInteractionChange = (e, type) => {
    console.log('here--------->', type)
    unstable_batchedUpdates(() => {
      newArray = [];
      setResolutionData([]);
      setIsFormDisabled(false)
      setFormDetails([])
      setValues([])
      // workflowResponse = []
      // setWorkflowResponse([]);
      const { target } = e;

      const knowledgeBase = knowledgeBaseInteractionList.find(
        (x) => x.requestStatement?.toLowerCase()?.includes(target?.value?.toLowerCase())
      );

      if (knowledgeBase) {
        setInteractionDataFunc(knowledgeBase);
        setError({
          ...error,
          statementId: "",
          statement: "",
          statementSolution: "",
          problemCause: "",
          serviceType: "",
          interactionType: "",
          interactionCategory: "",
          serviceCategory: "",
        });

        setOpenCreateInteraction(true);
      } else {
        setInteractionData({
          ...interactionData,
          statementId: "",
          statement: "",
        });
        setError({
          ...error,
          statementId: "",
          statement: "",
        });
      }
      clearTimeout(timer);
      const newTimer = setTimeout(() => {
        handleKnowledgeBaseInteraction(target.value, type);
      }, 500);
      setTimer(newTimer);
    });
  };

  const handleKnowledgeSelect = (knowledgeBase) => {
    unstable_batchedUpdates(() => {
      // workflowResponse = []
      // setWorkflowResponse([]);
      // console.log('customerData==', customerData)
      if (knowledgeBase) {
        handleFrequentInteractionChange(knowledgeBase, "");
        setInteractionData({
          ...interactionData,
          statementId: knowledgeBase?.requestId || "",
          statement: knowledgeBase?.requestStatement || "",
          statementSolution: knowledgeBase?.intxnResolution || "",
          problemCause: knowledgeBase?.intxnCause || "",
          serviceType: knowledgeBase.serviceType || "",
          switchStatus,
          interactionType: knowledgeBase?.intxnType || "",
          interactionCategory: knowledgeBase?.intxnCategory || "",
          serviceCategory: knowledgeBase?.serviceCategory || "",
          contactPreference: customerData?.contactPreferences,
          appointmentRequired: knowledgeBase?.isAppointment === 'Y' ? true : false,
          priorityCode: knowledgeBase?.priorityCode || ""

        });
        setError({
          ...error,
          statementId: "",
          statement: "",
          statementSolution: "",
          problemCause: "",
          serviceType: "",
          interactionType: "",
          interactionCategory: "",
          serviceCategory: "",
        });

        setOpenCreateInteraction(true);
      } else {
        setInteractionData({
          ...interactionData,
          statementId: "",
          statement: "",
        });
        setError({
          ...error,
          statementId: "",
          statement: "",
        });
      }
    });
  };

  const workflowApiCall = (reqBody, data, paylodData) => {

    unstable_batchedUpdates(() => {
      if (data && data?.length > 0) {
        reqBody.data.resolutionData = JSON.stringify(data);
      }
      // console.log("reqBody ==> ", reqBody)
      slowPost(`${properties.WORKFLOW_API}/resolution`, reqBody)
        .then((resp) => {
          let messageObject = {
            from: "bot",
            msg: resp.data,
          };
          setWorkflowResponse([...workflowResponse, messageObject]);
          newArray.push(messageObject);
          setResolutionData(newArray);
        })
        .catch(error => console.log(error)).finally();
    });
  };

  const flushOlderResponse = () => {
    workflowResponse = [];
    setWorkflowResponse(workflowResponse);
  };

  const handleFrequentInteractionChange = (interaction, type) => {
    resolutionData = [];
    selectedService = {};
    setResolutionData([]);
    newArray = []
    unstable_batchedUpdates(() => {
      setServiceMsg();
      setIsFormDisabled(false)
      setFormDetails([])
      setValues([])

      setSelectedService(selectedService);
      if (interaction?.serviceUuid) {
        setSelectedService(interaction);
      }
      setMultipleServiceData([]);
      setSelectedInteraction(interaction);
      setKbRequestId(interaction?.requestId);
      if (type !== "frequent10") {
        const reqBody = {
          requestId: interaction?.requestId || selectedInteraction?.requestId,
          customerUuid: customerUuid ? customerUuid : "",
          customerId: customerDetails?.customerId || "",
          accountUuid: selectedService?.accountUuid || interaction?.accountUuid,
          serviceUuid: selectedService?.serviceUuid || interaction?.serviceUuid,
          actionCount: actionCount,
        };
        post(`${properties.KNOWLEDGE_API}/get-knowledge-base`, { ...reqBody })
          .then((resp) => {
            if (resp?.data?.requestId) {
              const intelligenceResponse = resp?.data?.intelligenceResponse;
              if (
                /*resp?.data?.intxnType === 'APPEALS' && ['SERVICE_RELATED'].includes(resp?.data?.intxnCategory) && */ resp
                  ?.data?.resolutionAction?.data?.length > 1
              ) {
                setMultipleServiceData(resp);
              } else {
                if (switchStatus) {
                  if (!resp?.data?.conversationUid && !resp?.data?.flwId) {
                    setServiceMsg(resp?.message);
                  } else {
                    if (
                      resp?.data?.resolutionAction?.data &&
                      resp?.data?.resolutionAction?.data?.length === 1
                    ) {
                      // setSelectedService(resp?.data?.resolutionAction?.data[0]);
                    }
                    setWorkflowPaylod({
                      flowId: resp?.data?.flwId,
                      conversationUid: resp?.data?.conversationUid,
                      data: {
                        source: "knowledgeBase",
                      },
                    });
                    workflowApiCall({
                      flowId: resp?.data?.flwId,
                      conversationUid: resp?.data?.conversationUid,
                      data: {
                        source: "knowledgeBase",
                        reqBody
                      },
                    });
                  }
                }
                setValue(resp.data.requestStatement);
                setInteractionData({
                  ...interactionData,
                  interactionResolution: resp.data.intxnResolutionDesc?.description || "",
                  statementId: resp.data.requestId || "",
                  statement: resp.data.requestStatement || "",
                  statementSolution: resp.data.intxnResolution || "",
                  problemCause: resp.data.intxnCause || "",
                  serviceType: resp.data.serviceType || "",
                  switchStatus,
                  interactionType: resp.data.intxnType || "",
                  interactionCategory: resp.data.intxnCategory || "",
                  serviceCategory: resp.data.serviceCategory || "",
                  contactPreference: customerData?.contactPreferences,
                  intelligenceResponse: intelligenceResponse,
                  appointmentRequired: resp?.data?.isAppointment === 'Y' ? true : false,
                  priorityCode: resp?.data?.priorityCode
                });
                setError({
                  ...error,
                  statementId: "",
                  statement: "",
                  statementSolution: "",
                  problemCause: "",
                  serviceType: "",
                  interactionType: "",
                  interactionCategory: "",
                  serviceCategory: "",
                });
              }
            }
          })
          .catch((error) => {
            console.error(error);
          })
          .finally();
      }
    });
  };

  const handleValidate = useCallback((interactionDetails, value) => {
    return new Promise((resolve, reject) => {
      if (!isEmpty(interactionDetails)) {
        let error = validate(interactionDetailsValidationSchema, interactionDetails);
        if (!interactionDetails?.statement && !value) {
          toast.error("Please Provide the statement");
          resolve();
        } else if (error) {
          toast.error("Validation errors found. Please check highlighted fields");
          resolve();
        } else if (!interactionDetails?.statement && value) {
          confirmAlert({
            //   title: 'Confirm',
            message: 'Do you want to add this as New statement',
            buttons: [
              {
                label: 'Yes',
                onClick: () => {
                  const statementBody = {
                    intxnCategory: interactionDetails.interactionCategory,
                    serviceCategory: interactionDetails.serviceCategory,
                    intxnType: interactionDetails.interactionType,
                    serviceType: interactionDetails?.serviceType,
                    requestStatement: value,
                    priorityCode: interactionDetails?.priorityCode || ''
                  }

                  post(properties.KNOWLEDGE_API + "/add-statement", statementBody)
                    .then((response) => {
                      if (response.status === 200) {
                        //setInteractionData({ ...interactionData, statementId: response?.data?.requestId, statement: value })
                        resolve({
                          statementId: response?.data?.requestId,
                          statement: value
                        })
                      }
                    })
                    .catch((error) => {
                      console.error(error);
                      resolve();
                      return false
                    })
                    .finally();
                }
              },
              {
                label: 'Cancel',
                onClick: () => { resolve(); }
              }
            ],
            closeOnEscape: true,
            closeOnClickOutside: true,
            keyCodeForClose: [8, 32],
            willUnmount: () => { },
            afterClose: () => { },
            onClickOutside: () => { },
            onKeypress: () => { },
            onKeypressEscape: () => { },
            overlayClassName: "overlay-custom-class-name"
          })
        } else {
          resolve();
        }
      }
    })
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault();
    handleValidate(interactionData, value).then(resolved => {
      // statement is null, value is null and resolve not empty
      if ((!interactionData?.statement && value && !isEmpty(resolved)) || (interactionData?.statement && value && isEmpty(resolved))) {
        let requestBody;
        unstable_batchedUpdates(() => {
          if (!customerUuid) {
            const custPayload = {
              details: {
                source: "CREATE_INTERACTION",
                firstName: customerName,
                contactPayload: {
                  mobileNo: mobileNo,
                  emailId: emailId,
                },
              },
            };

            post(properties.CUSTOMER_API + "/create", custPayload)
              .then((resp) => {
                if (resp.data) {
                  if (resp.status === 200) {
                    setCustomerData({
                      ...customerData,
                      customerUuid: resp?.data?.customerUuid,
                      customerNo: resp?.data?.customerNo,
                      customerId: resp?.data?.customerId,
                    });
                    let cPref;
                    if (interactionData.contactPreference) {
                      cPref = interactionData?.contactPreference
                        ?.flat()
                        .map((option) => option.value);
                    } else {
                      cPref = ["CNT_PREF_SMS"];
                    }

                    requestBody = {
                      // customerUuid: resp?.data?.customerUuid,
                      //  customerNo: resp?.data?.customerNo,
                      customerId: Number(resp?.data?.customerId),
                      statement: interactionData.statement,
                      statementId: interactionData.statementId || resolved?.statementId,
                      statementSolution: interactionData.statementSolution || resolved?.statement,
                      interactionType: interactionData.interactionType,
                      serviceType: interactionData.serviceType,
                      channel: interactionData.channel,
                      problemCause: interactionData.problemCause,
                      priorityCode: interactionData.priorityCode
                        ? interactionData.priorityCode
                        : "PRTYMED",
                      contactPreference: cPref,
                      remarks: interactionData.remarks
                        ? interactionData.remarks
                        : interactionData.statement,
                      interactionCategory: interactionData.interactionCategory,
                      serviceCategory: interactionData.serviceCategory,
                      attachments: [
                        ...currentFiles.map((current) => current.entityId),
                      ],
                      appointDtlId: interactionData.appointDtlId,
                      appointUserId: interactionData.appointUserId,
                      appointAddress: interactionData?.useCustomerAddress
                        ? customerDetails?.customerAddress[0]
                        : addressData,
                      helpdeskId: helpdeskDetails?.helpdeskId || "",
                      isResolvedBy: 'IRB_MANUAL',
                      edoc: interactionData.edoc,
                    };
                    requestBody = removeEmptyKey(requestBody);
                    post(properties.INTERACTION_API + "/create", requestBody)
                      .then((response) => {
                        if (response.status === 200) {
                          toast.success(response.message);
                          // props.history.push(`${process.env.REACT_APP_BASE}/`);
                          // console.log("setInteractionData called 10");
                          setInteractionData(initIntxnData);
                          // const productList= interactionData?.data
                          // const data={
                          //     productList,
                          //     customerDetails: customerData,
                          //     serviceType: interactionData?.serviceType,
                          //     serviceCategory: interactionData?.serviceCategory,
                          //     accountDetails: accountData,
                          //     pageIndex: 0,
                          //     edit: true,
                          //     intxnUUid: response?.data?.intxnUUid,
                          //     intxnNo: response?.data?.intxnNo
                          // }
                          // props.history.push(`${process.env.REACT_APP_BASE}/new-customer`,{data})
                        }
                      })
                      .catch((error) => {
                        console.error(error);
                      })
                      .finally();
                  } else {
                    toast.error("Failed to create - " + resp.status);
                  }
                }
              })
              .catch((error) => {
                console.error(error);
              })
              .finally();
            setConfirmation(false);
            setAutoCreateInteraction(false);
          } else {
            const flattenedArray = interactionData.contactPreference
              .flat()
              .map((option) => option.value);

            // console.log('interactionData ------------->', interactionData)
            let requestBody = {
              customerId: Number(customerData.customerId),
              statement: interactionData.statement,
              statementId: interactionData.statementId || resolved?.statementId,
              statementSolution: interactionData.statementSolution || resolved?.statement,
              interactionType: interactionData.interactionType,
              serviceType: interactionData.serviceType,
              channel: interactionData.channel,
              problemCause: interactionData.problemCause,
              priorityCode: interactionData.priorityCode,
              contactPreference: flattenedArray,
              remarks: interactionData.remarks,
              interactionCategory: interactionData.interactionCategory,
              serviceCategory: interactionData.serviceCategory,
              attachments:
                [...currentFiles.map((current) => current.entityId)].length > 0
                  ? [...currentFiles.map((current) => current.entityId)]
                  : "",
              appointDtlId: interactionData.appointDtlId,
              appointUserId: interactionData.appointUserId,
              appointAddress: interactionData?.useCustomerAddress
                ? customerDetails?.customerAddress[0]
                : addressData,
              helpdeskId: helpdeskDetails?.helpdeskId || "",
              edoc: interactionData.edoc,
              customerContactNo
            };
            requestBody = removeEmptyKey(requestBody);

            console.log("requestBody", requestBody);
            post(properties.INTERACTION_API + "/create", requestBody)
              .then((response) => {
                if (response.status === 200) {
                  toast.success(response.message);
                  props.history.push(`${process.env.REACT_APP_BASE}/`);
                }
              })
              .catch((error) => {
                console.error(error);
              })
              .finally();
          }
        });
      }
    }).catch(rejected => {
      console.log(rejected);
    });
  };

  const handleClear = () => {
    unstable_batchedUpdates(() => {
      // console.log("setInteractionData called 11");
      setInteractionData(initIntxnData);
    });
  };

  const handleYes = () => {
    unstable_batchedUpdates(() => {
      if (interactionData?.intelligenceResponse?.outcome?.orderCreation) {
        setConfirmation(true);
      } else {
        setAutoCreateInteraction(true);
        setFirstTimeResolved(true);
        setConfirmation(false);
      }
    });
  };

  const handleNo = (count) => {
    unstable_batchedUpdates(() => {
      setActionCount(count);
      const reqBody = {
        requestId: kbRequestId,
        customerUuid,
        accountUuid: selectedService?.accountUuid,
        serviceUuid: selectedService?.serviceUuid,
        actionCount: count,
      };

      post(`${properties.KNOWLEDGE_API}/get-knowledge-base`, { ...reqBody })
        .then((resp) => {
          if (resp?.data) {
            if (resp?.data?.requestId) {
              const intelligenceResponse = resp?.data?.intelligenceResponse;

              // console.log(resp?.data, "from get know api");
              // console.log("setInteractionData called 12");
              setInteractionData({
                ...interactionData,
                interactionResolution:
                  resp?.data?.intxnResolutionDesc?.description || "",
                statementId: resp?.data?.requestId || "",
                statement: resp?.data?.requestStatement || "",
                statementSolution: resp?.data?.intxnResolution || "",
                problemCause: resp?.data?.intxnCause || "",
                serviceType: resp?.data.serviceType || "",
                switchStatus,
                interactionType: resp?.data?.intxnType || "",
                interactionCategory: resp?.data?.intxnCategory || "",
                serviceCategory: resp?.data?.serviceCategory || "",
                contactPreference: customerData?.contactPreferences,
                intelligenceResponse: intelligenceResponse,
                priorityCode: resp?.data?.priorityCode
              });
              setError({
                ...error,
                statementId: "",
                statement: "",
                statementSolution: "",
                problemCause: "",
                serviceType: "",
                interactionType: "",
                interactionCategory: "",
                serviceCategory: "",
              });
            }
          }
        })
        .catch((error) => {
          console.error(error);
        })
        .finally();
    });
  };

  const handleOnModelClose = () => {
    unstable_batchedUpdates(() => {
      setOpenServiceModal(false);
      setOpenProductModal(false);
    });
  };

  const handleAddProduct = (product) => {
    unstable_batchedUpdates(() => {
      setSelectedProductList([...selectedProductList, product]);
      let totalRc = 0;
      let totalNrc = 0;
      const list = [...selectedProductList, product];
      list.forEach((y) => {
        totalRc = totalRc + Number(y?.totalRc || 0);
        totalNrc = totalNrc + Number(y?.totalNrc || 0);
      });
      setServiceData({
        ...serviceData,
        totalRc,
        totalNrc,
      });
    });
  };

  const handleAddProducts = (flag, value) => {
    if (flag) {
      let x = productArr.map((c, i) => {
        if (Number(c?.productId) === Number(value?.productId)) {
          c = { ...c, quantity: 1, isSelected: "Y" };
        }
        return c;
      });
      setProductArr(x);
    } else {
      let x = productArr.map((c, i) => {
        if (Number(c?.productId) === Number(value?.productId)) {
          c = { ...c, quantity: 0, isSelected: "N" };
        }
        return c;
      });
      setProductArr(x);
    }
  };

  const handleSetOrderId = (flag, value) => {
    if (flag) {
      let x = orderId.map((c, i) => {
        if (Number(c?.orderId) === Number(value?.orderId)) {
          c = { ...c, isSelected: "Y" };
        }
        return c;
      });
      setOrderId(x);
    } else {
      let x = orderId.map((c, i) => {
        if (Number(c?.orderId) === Number(value?.orderId)) {
          c = { ...c, isSelected: "N" };
        }
        return c;
      });
      setOrderId(x);
    }
  };

  const handleOrderId = (flag, value) => {
    if (flag) {
      let x = orderId.map((c, i) => {
        if (Number(c?.orderId) === Number(value?.orderId)) {
          c = { ...c, isSelected: "Y" };
        }
        return c;
      });
      setOrderId(x);
    } else {
      let x = orderId.map((c, i) => {
        if (Number(c?.orderId) === Number(value?.orderId)) {
          c = { ...c, isSelected: "N" };
        }
        return c;
      });
      setOrderId(x);
    }
  };

  const clickToProceed = (
    ele,
    selectedService,
    resolutionPayload,
    idx,
    description
  ) => {
    // console.log('ele------>', ele)
    // console.log('selectedService------>', selectedService)
    // console.log('resolutionPayload------>', resolutionPayload)
    // console.log('idx------>', idx)
    // console.log('description------>', description)
    if (ele === "SELECTED_INTXN") {
      resolutionPayload.data.inputType = "MESSAGE";
      resolutionPayload.data.inputValue = description;
      // console.log('description---------->', description)
      if (description?.includes("_")) {
        description = description.split("_")[0];
      }
      const messageObject = {
        from: "user",
        msg: { callAgain: false, description },
      };
      let data = [...resolutionData, messageObject];
      newArray.push(messageObject);
      setResolutionData(newArray);
      workflowApiCall(resolutionPayload, data);
      document.getElementById("hide" + idx).innerHTML = "";
    } else if (ele === "SUBMIT_REMARKS") {
      if (!description || description === null || description === "") {
        toast.error("Please type remarks");
      } else {
        resolutionPayload.data.inputType = "MESSAGE";
        resolutionPayload.data.inputValue = description;
        const messageObject = {
          from: "user",
          msg: { callAgain: false, description },
        };
        let data = [...resolutionData, messageObject];
        newArray.push(messageObject);
        setResolutionData(newArray);
        workflowApiCall(resolutionPayload, data);
        document.getElementById("hide" + idx).innerHTML = "";
      }
    } else if (ele === "FORM_SUBMIT") {
      Swal.fire({
        title: 'Confirm',
        text: `Are you sure ?`,
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: `Yes!`,
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          if (!description || description === null || description === "") {
            toast.error("Please Fill the Form");
          } else {
            resolutionPayload.data.inputType = "FORMDATA";
            resolutionPayload.data.inputValue = description;
            // console.log('description-------->', description)
            // console.log('self_submit ------------->',)
            let descriptionValue;

            if (selectedService === 'self_submit') {
              descriptionValue = description['Department'] + ',' + description['role']
            } else if (selectedService === ' Others_submit') {
              descriptionValue = 'Form Details Submitted.'
            } else {
              if (typeof (description) === "object") {
                let keyArray = Object.keys(description)[Object.keys(description).length - 1];
                // console.log('Object.keys(description).length - 2 ---------->', Object.keys(description).length - 2)
                // console.log('keyArray ---------->', keyArray)
                // console.log('typeof (description[keyArray])------->', typeof (description[keyArray]))
                // console.log('description[keyArray]------->', description[keyArray])
                if (typeof (description[keyArray]) === 'array' || typeof (description[keyArray]) === 'object') {
                  const valuesArray = description[keyArray]?.map((ele) => ele?.value || ele?.calendarShortName)
                  descriptionValue = valuesArray.join(', ')
                } else {
                  descriptionValue = description[keyArray]
                }
              } else {
                descriptionValue = description
              }
            }
            // console.log('descriptionValue------------>', descriptionValue)
            const messageObject = {
              from: "user",
              msg: { callAgain: false, description: descriptionValue },
            };
            let data = [...resolutionData, messageObject];
            newArray.push(messageObject);
            // setIsFormDisabled(true)
            setResolutionData(newArray);
            workflowApiCall(resolutionPayload, data);
            document.getElementById("hide" + idx).innerHTML = "";
          }
        } else {
          // document.getElementById("hide" + idx).innerHTML = "";
          setIsFormDisabled(false)
        }
      })
    } else {
      if (ele?.name === "NO") {
        Swal.fire({
          title: ele?.popup,
          text: ``,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: `Yes!`,
          allowOutsideClick: false,
        }).then((result) => {
          if (result.isConfirmed) {
            const messageObject = {
              from: "user",
              msg: { callAgain: false, description: ele?.name },
            };
            let data = [...resolutionData, messageObject];
            newArray.push(messageObject);
            setResolutionData(newArray);
            resolutionPayload.data.inputType = "MESSAGE";
            resolutionPayload.data.inputValue = ele?.name;
            workflowApiCall(resolutionPayload, data);
            document.getElementById("hide" + idx).innerHTML = "";
          }
        });
      } else {
        Swal.fire({
          title: ele?.popup,
          type: "info",
          //html: '<h1 height="42" width="42">🙂</h1>',
          showCloseButton: true,
          showCancelButton: true,
          focusConfirm: false,
          cancelButtonText: "Cancel",
          confirmButtonText: "Ok",
          confirmButtonAriaLabel: "Thumbs up, great!",
          customClass: {
            cancelButton: 'skel-btn-cancel',
            confirmButton: 'skel-btn-submit mr-2'
          },
          buttonsStyling: false,
          cancelButtonAriaLabel: "Thumbs down",
          allowOutsideClick: false,
        }).then((result) => {
          if (result.isConfirmed) {
            const messageObject = {
              from: "user",
              msg: { callAgain: false, description: ele?.name },
            };
            let data = [...resolutionData, messageObject];
            newArray.push(messageObject);
            setResolutionData(newArray);
            resolutionPayload.data.inputType = "MESSAGE";
            resolutionPayload.data.inputValue = { ...formDetails, description: ele?.name };
            const sType =
              selectedService?.srvcTypeDesc?.description === "Prepaid"
                ? "PT_PREPAID"
                : selectedService?.srvcTypeDesc?.description === "Postpaid"
                  ? "PT_POSTPAID"
                  : "PT_HYBRID";
            if (
              ele?.name === "YES" &&
              (description == "Yes, Process to purchase" ||
                description == "Customer consent")
            ) {
              const list = productArr.filter((x) => x.isSelected === "Y");
              if (list && list?.length === 0) {
                toast.error("Please select Product");
                return;
              }
              const finalList = [];
              for (const prod of list) {
                finalList.push({
                  ...prod,
                  quantity: prod?.quantity,
                  totalNrc: Number(prod?.totalNrc) * Number(prod?.quantity),
                  totalRc: Number(prod?.totalRc) * Number(prod?.quantity),
                });
              }
              let totalRc = 0;
              let totalNrc = 0;
              let servicesData = [];
              finalList.forEach((x) => {
                totalRc = totalRc + Number(x?.totalRc);
                totalNrc = totalNrc + Number(x?.totalNrc);
              });
              servicesData.push({
                totalRc,
                totalNrc,
                total: Number(totalRc) + Number(totalNrc),
                serviceType: [sType],
                serviveUuid: selectedService?.serviceUuid,
              });
              post(`${properties.CUSTOMER_API}/get-customer?limit=1&page=0`, {
                customerUuid: customerData?.customerUuid,
              }).then((resp) => {
                if (resp.data) {
                  if (resp.status === 200) {
                    // workflowApiCall(resolutionPayload, prodData);
                    const { rows } = resp.data;
                    // console.log('rows[0]-------------->', rows[0])
                    // console.log('productArr-------------->', productArr)
                    // console.log('servicesData-------------->', servicesData)
                    history.push(`${process.env.REACT_APP_BASE}/new-customer`, {
                      data: {
                        customerDetails: rows[0],
                        pageIndex: 3,
                        edit: true,
                        servicePopupOpen: true,
                        selectedProductsList: productArr,
                        servicesData,
                      },
                    });
                  }
                }
              }).catch((error) => {
                console.error(error);
              });
            } else if (
              ele?.name === "YES" &&
              description === "Cancel order buttons"
            ) {
              const list = orderId.filter((x) => x.isSelected === "Y");
              if (list && list?.length === 0) {
                toast.error("Please select Order");
                return;
              }

              const messageObject = {
                from: "user",
                msg: { callAgain: false, description: list, type: "Order" },
              };
              let orderData = [...data, messageObject];

              newArray.push(messageObject);

              setResolutionData(newArray);
              const reqBody = {
                inputValue: list,
                conversationUid: workflowPaylod.conversationUid,
              };
              post(`${properties.WORKFLOW_API}/add-conversation`, reqBody)
                .then((resp) => {
                  if (resp.status === 200) {
                    workflowApiCall(resolutionPayload, orderData);
                    document.getElementById("hide" + idx).innerHTML = "";
                  }
                }).catch(error => console.log(error))
                .finally();
            } else if (ele?.name === "YES" && description === "BILL_REDIRECT") {
              workflowApiCall(resolutionPayload, data);
              document.getElementById("hide" + idx).innerHTML = "";
            } else if (ele?.name === "YES" && description === "Collect Order") {
              const list = orderId.filter((x) => x.isSelected === "Y");
              if (list && list?.length === 0) {
                toast.error("Please select Order");
                return;
              }
              const messageObject = {
                from: "user",
                msg: { callAgain: false, description: list, type: "Order" },
              };
              let orderData = [...data, messageObject];

              newArray.push(messageObject);

              setResolutionData(newArray);

              resolutionPayload.data.inputType = "MESSAGE";
              resolutionPayload.data.inputValue = "";
              workflowApiCall(resolutionPayload, orderData);
            } else if (ele?.name === "YES" && description === "TAKE_FOLLOWUP") {
              setResolutionPayloadData(resolutionPayload);
              setIsFollowupOpen(true);
            } else {
              workflowApiCall(resolutionPayload, data);
              document.getElementById("hide" + idx).innerHTML = "";
            }
          }
        });
      }
    }
  };

  useEffect(() => {
    unstable_batchedUpdates(() => {
      // console.log('confirmation==== ', confirmation)
      if (confirmation) {
        let requestBody;
        if (customerUuid) {
          requestBody = {
            customerId: Number(customerData.customerId),
            statement: interactionData.statement,
            statementId: interactionData.statementId,
            statementSolution: interactionData.statementSolution,
            interactionType: interactionData.interactionType,
            serviceType: interactionData.serviceType,
            channel: interactionData.channel,
            problemCause: interactionData.problemCause,
            priorityCode: interactionData.priorityCode
              ? interactionData.priorityCode
              : "PRTYMED",
            contactPreference: [
              interactionData.contactPreference
                ? interactionData.contactPreference
                : "CNT_PREF_SMS",
            ],
            remarks: interactionData.remarks
              ? interactionData.remarks
              : interactionData.statement,
            interactionCategory: interactionData.interactionCategory,
            serviceCategory: interactionData.serviceCategory,
            helpdeskId: helpdeskDetails?.helpdeskId || "",
          };
          requestBody = removeEmptyKey(requestBody);

          post(properties.INTERACTION_API + "/create", requestBody)
            .then((response) => {
              if (response.status === 200) {
                const productList = interactionData?.data;
                const data = {
                  productList,
                  customerDetails: customerData,
                  serviceType: interactionData?.serviceType,
                  serviceCategory: interactionData?.serviceCategory,
                  accountDetails: accountData,
                  pageIndex: 2,
                  edit: true,
                  intxnUUid: response?.data?.intxnUUid,
                  intxnNo: response?.data?.intxnNo,
                };
                props.history.push(
                  `${process.env.REACT_APP_BASE}/new-customer`,
                  { data }
                );
              }
            })
            .catch((error) => {
              console.error(error);
            })
            .finally();
        } else {
          const custPayload = {
            details: {
              source: "CREATE_INTERACTION",
              firstName: customerName,
              contactPayload: {
                mobileNo: mobileNo,
                emailId: emailId,
              },
            },
          };

          post(properties.CUSTOMER_API + "/create", custPayload)
            .then((resp) => {
              if (resp.data) {
                if (resp.status === 200) {
                  setCustomerData({
                    ...customerData,
                    customerUuid: resp?.data?.customerUuid,
                    customerNo: resp?.data?.customerNo,
                    customerId: resp?.data?.customerId,
                  });
                  requestBody = {
                    // customerUuid: resp?.data?.customerUuid,
                    //  customerNo: resp?.data?.customerNo,
                    customerId: Number(resp?.data?.customerId),
                    statement: interactionData.statement,
                    statementId: interactionData.statementId,
                    statementSolution: interactionData.statementSolution,
                    interactionType: interactionData.interactionType,
                    serviceType: interactionData.serviceType,
                    channel: interactionData.channel,
                    problemCause: interactionData.problemCause,
                    priorityCode: interactionData.priorityCode
                      ? interactionData.priorityCode
                      : "PRTYMED",
                    contactPreference: [
                      interactionData.contactPreference
                        ? interactionData.contactPreference
                        : "CNT_PREF_SMS",
                    ],
                    remarks: interactionData.remarks
                      ? interactionData.remarks
                      : interactionData.statement,
                    interactionCategory: interactionData.interactionCategory,
                    serviceCategory: interactionData.serviceCategory,
                    helpdeskId: helpdeskDetails?.helpdeskId || "",
                  };
                  requestBody = removeEmptyKey(requestBody);

                  post(properties.INTERACTION_API + "/create", requestBody)
                    .then((response) => {
                      if (response.status === 200) {
                        const productList = interactionData?.data;
                        const data = {
                          productList,
                          customerDetails: customerData,
                          serviceType: interactionData?.serviceType,
                          serviceCategory: interactionData?.serviceCategory,
                          accountDetails: accountData,
                          pageIndex: 0,
                          edit: true,
                          intxnUUid: response?.data?.intxnUUid,
                          intxnNo: response?.data?.intxnNo,
                        };
                        props.history.push(
                          `${process.env.REACT_APP_BASE}/new-customer`,
                          { data }
                        );
                      }
                    })
                    .catch((error) => {
                      console.error(error);
                    })
                    .finally();
                } else {
                  toast.error("Failed to create - " + resp.status);
                }
              }
            })
            .catch((error) => {
              console.error(error);
            })
            .finally();
          setConfirmation(false);
          setAutoCreateInteraction(false);
        }
      }
    });
  }, [confirmation]);

  useEffect(() => {
    if (autoCreateInteraction) {
      let requestBody;
      if (!customerUuid) {
        const custPayload = {
          details: {
            source: "CREATE_INTERACTION",
            firstName: customerName,
            contactPayload: {
              mobileNo: mobileNo,
              emailId: emailId,
            },
          },
        };

        post(properties.CUSTOMER_API + "/create", custPayload)
          .then((resp) => {
            if (resp.data) {
              if (resp.status === 200) {
                // console.log('resp.data==>', resp.data)
                setCustomerData({
                  ...customerData,
                  customerUuid: resp?.data?.customerUuid,
                  customerNo: resp?.data?.customerNo,
                  customerId: resp?.data?.customerId,
                });

                requestBody = {
                  // customerUuid: resp?.data?.customerUuid,
                  //  customerNo: resp?.data?.customerNo,
                  customerId: Number(resp?.data?.customerId),
                  statement: interactionData.statement,
                  statementId: interactionData.statementId,
                  statementSolution: interactionData.statementSolution,
                  interactionType: interactionData.interactionType,
                  serviceType: interactionData.serviceType,
                  channel: interactionData.channel,
                  problemCause: interactionData.problemCause,
                  priorityCode: interactionData.priorityCode
                    ? interactionData.priorityCode
                    : "PRTYMED",
                  contactPreference: [
                    interactionData.contactPreference
                      ? interactionData.contactPreference
                      : "CNT_PREF_SMS",
                  ],
                  remarks: interactionData.remarks
                    ? interactionData.remarks
                    : interactionData.statement,
                  interactionCategory: interactionData.interactionCategory,
                  serviceCategory: interactionData.serviceCategory,
                  helpdeskId: helpdeskDetails?.helpdeskId || "",
                };
                requestBody = removeEmptyKey(requestBody);

                post(properties.INTERACTION_API + "/create", requestBody)
                  .then((response) => {
                    if (response.status === 200) {
                      toast.success(response.message);
                      // props.history.push(`${process.env.REACT_APP_BASE}/`);
                      // console.log("setInteractionData called 13");
                      setInteractionData(initIntxnData);
                      // const productList= interactionData?.data
                      // const data={
                      //     productList,
                      //     customerDetails: customerData,
                      //     serviceType: interactionData?.serviceType,
                      //     serviceCategory: interactionData?.serviceCategory,
                      //     accountDetails: accountData,
                      //     pageIndex: 0,
                      //     edit: true,
                      //     intxnUUid: response?.data?.intxnUUid,
                      //     intxnNo: response?.data?.intxnNo
                      // }
                      // props.history.push(`${process.env.REACT_APP_BASE}/new-customer`,{data})
                    }
                  })
                  .catch((error) => {
                    console.error(error);
                  })
                  .finally();
              } else {
                toast.error("Failed to create - " + resp.status);
              }
            }
          })
          .catch((error) => {
            console.error(error);
          })
          .finally();
        setConfirmation(false);
        setAutoCreateInteraction(false);
      } else {
        let requestBody = {
          customerId: Number(customerData.customerId),
          statement: interactionData.statement,
          statementId: interactionData.statementId,
          statementSolution: interactionData.statementSolution,
          interactionType: interactionData.interactionType,
          serviceType: interactionData.serviceType,
          channel: interactionData.channel,
          problemCause: interactionData.problemCause,
          interactionCategory: interactionData.interactionCategory,
          serviceCategory: interactionData.serviceCategory,
          priorityCode: interactionData.priorityCode
            ? interactionData.priorityCode
            : "PRTYMED",
          contactPreference: [
            interactionData.contactPreference
              ? interactionData.contactPreference
              : "CNT_PREF_SMS",
          ],
          remarks: interactionData.remarks
            ? interactionData.remarks
            : interactionData.statement,
          helpdeskId: helpdeskDetails?.helpdeskId || "",
        };
        requestBody = removeEmptyKey(requestBody);

        post(properties.INTERACTION_API + "/create", requestBody)
          .then((response) => {
            if (response.status === 200) {
              setCreatedIntxnData(response.data);
              // toast.success("Glad your query is resolved. Thank you!");
              // props.history.push(`${process.env.REACT_APP_BASE}/`);
            }
          })
          .catch((error) => {
            console.error(error);
          })
          .finally();
      }
    }
  }, [autoCreateInteraction]);

  const handleHelpdeskModal = () => {
    unstable_batchedUpdates(() => {
      setIsHelpdeskOpen(true);
    });
  };

  const handleClearResolution = useCallback(() => {
    unstable_batchedUpdates(() => {
      newArray = []
      setResolutionData([])
      setIsFormDisabled(false)
      setSelectedCategory()
      setInteractionData({
        interactionResolution: "",
        statement: "",
        statementId: "",
        statementSolution: "",
        interactionType: "",
        interactionCategory: "",
        serviceType: "",
        serviceCategory: "",
        channel: "WALKIN",
        problemCause: "",
        priorityCode: "",
        contactPreference: "",
        remarks: "",
        switchStatus,
        useCustomerAddress: true,
      })
    })
  }, [])

  useEffect(() => {
    if (!value) {
      unstable_batchedUpdates(() => {
        newArray = []
        setResolutionData([])
        setIsFormDisabled(false)
        setInteractionData({
          interactionResolution: "",
          statement: "",
          statementId: "",
          statementSolution: "",
          interactionType: "",
          interactionCategory: "",
          serviceType: "",
          serviceCategory: "",
          channel: "WALKIN",
          problemCause: "",
          priorityCode: "",
          contactPreference: "",
          remarks: "",
          switchStatus,
          useCustomerAddress: true,
        })
      })
    }
  }, [switchStatus, value])


  const handleInteractionModal = (status) => {
    unstable_batchedUpdates(() => {
      setInteractionStatusType(status);
      setPopupType(status)
      setIsInteractionListOpen(!isInteractionListOpen);
      setCurrentPageModal(0);
      setPerPageModal(10);
      setTotalCount(0);
    });
  };

  const getCustomerInteractionDetails = useCallback(
    (status) => {
      try {
        if (customerUuid && status) {
          get(
            `${properties.INTERACTION_API
            }/get-customer-history/${customerUuid}?limit=${perPageModal}&page=${currentPageModal}${status ? `&status=${status}` : ""
            }`
          )
            .then((response) => {
              if (response?.data) {
                setInteractionCustomerHistoryDetails(response?.data?.rows);
                setTotalCount(response?.data?.count);
              }
            })
            .catch((error) => {
              console.error(error);
            })
            .finally();
        }
      } catch (error) {
        console.error(error);
      }
    },
    [currentPageModal, perPageModal]
  );

  useEffect(() => {
    getCustomerInteractionDetails(interactionStatusType);
  }, [
    currentPageModal,
    getCustomerInteractionDetails,
    interactionStatusType,
    perPageModal,
  ]);

  const handleOnCloseChannelModal = () => {
    unstable_batchedUpdates(() => {
      setInteractionStatusType('');
      setPopupType('')
      setIsInteractionListOpen(!isInteractionListOpen);
      setCurrentPageModal(0);
      setPerPageModal(10);
      setTotalCount(0);
    });
  };

  const handlePageSelect = (pageNo) => {
    setCurrentPageModal(pageNo);
  };

  const fetchInteractionDetail = (intxnNo) => {
    get(`${properties.INTERACTION_API}/search?q=${intxnNo}`).then((resp) => {
      if (resp.status === 200) {
        const response = resp.data?.[0];
        const data = {
          ...response,
          sourceName: 'customer360'
        }
        if (response.customerUuid) {
          sessionStorage.setItem("customerUuid", response.customerUuid)
          sessionStorage.setItem("customerIds", response.customerId)
        }
        history.push(`${process.env.REACT_APP_BASE}/interaction360`, { data })
      } else {
        //
      }
    }).catch(error => {
      console.log(error);
    });
  }

  const handleCellRender = (cell, row) => {
    if (cell.column.Header === "Interaction No") {
      return (
        <span classNameName="text-secondary cursor-pointer" onClick={(e) => fetchInteractionDetail(cell.value)}>
          {cell.value}
        </span>
      );
    } else if (cell.column.id === "createdAt") {
      return (
        <span>
          {moment(row.original?.oCreatedAt).format("DD-MM-YYYY HH:mm:ss a")}
        </span>
      );
    } else {
      return <span>{cell.value}</span>;
    }
  };

  return (
    <div className="cnt-wrapper">
      <div className="card-skeleton">
        {/* <div className="top-breadcrumb cmmn-skeleton">
                    <div className="lft-skel">
                        <h4>Create Interaction for Customer Number: {(customerData?.customerNo || "")}</h4>
                    </div>
                </div> */}
        {/*Interaction */}
        <div className="skel-cr-interaction">
          <div className="form-row">
            <div className="col-lg-3 col-md-12 col-xs-12">
              {appsConfig?.clientConfig?.appointments?.enabled && !!!statusConstantCode?.bussinessSetup.includes(appsConfig?.businessSetup?.[0]) && <div className="cmmn-skeleton mt-2">
                <span className="skel-profile-heading">
                  Upcoming Appointments
                </span>
                <div className="skel-cr-inter-upcom-appt">
                  <div className="skel-appt-date no-appt">No Appointment</div>
                </div>
              </div>}
              <InteractionWidget
                data={{
                  frequentInteraction,
                  frequentCustomerInteraction,
                  frequentDayInteraction,
                  frequentTenInteraction,
                  appsConfig,
                  email: customerData?.customerContact[0]?.emailId,
                  setSelectedCategory
                }}
                handler={{
                  handleFrequentInteractionChange,
                  handleKnowledgeBaseInteraction,
                  handleClearResolution
                }}
              />
            </div>
            <div className="col-lg-6 col-md-12 col-xs-12">
              <div className="skel-form-heading-bar mt-2">
                <span className="messages-page__title">
                  Smart Assistance
                  {/* <button type="button" className={`btn btn-sm btn-toggle inter-toggle skel-inter-toggle`} data-toggle="button" aria-pressed="false" autoComplete="off" onClick={(e)=>{setSwitchStatus(!switchStatus)}}>
                                            <div className="handle"></div>
                                        </button> */}
                  <ReactSwitch
                    onColor="#4C5A81"
                    offColor="#6c757d"
                    activeBoxShadow="0px 0px 1px 5px rgba(245, 133, 33, 0.7)"
                    height={20}
                    width={48}
                    className="inter-toggle skel-inter-toggle ml-2"
                    id="smartSwitch"
                    checked={switchStatus}
                    onChange={(e) => {
                      setValue(null);
                      flushOlderResponse();
                      setSwitchStatus(!switchStatus);
                      setServiceMsg();
                    }}
                  />
                </span>
                {/* <div className="swiper-container wsc-dt-tabs-buttons">
                  <div className="swiper-wrapper">
                    <Swiper spaceBetween={30} slidesPerView={3}
                      navigation={true}
                      modules={[Pagination, Navigation]}
                      className="mySwiper">
                      {
                        frequentTenInteraction && frequentTenInteraction.map((x, idx) => (
                          <SwiperSlide key={idx} virtualIndex={idx}>
                            <div><span onClick={() => handleKnowledgeBaseInteraction(x, 'frequent10', 'InteractionWidget')}>{x?.intxnCategory?.description || ""}</span></div>
                          </SwiperSlide>
                        ))
                      }
                    </Swiper>
                  </div>
                </div> */}
              </div>
              <div className="cmmn-skeleton mt-2">



                {selectedCategory && <ul className="skel-top-inter">
                  <li><a href="javascript:void(null)">{selectedCategory}</a><a href="javascript:void(null)"><i class="fas fa-times" onClick={() => { handleClearResolution() }}></i></a></li>
                </ul>}
                <div className="skel-inter-search-st">
                  <i className="fa fa-search"></i>
                  <DatalistInput
                    className=""
                    isExpanded={isExpanded}
                    setIsExpanded={setIsExpanded}
                    value={value}
                    setValue={setValue}
                    inputProps={{
                      autoComplete: false,
                      id: 'knowledgeBase',
                      name: 'knowledgeBase'
                    }}
                    onSelect={(item) => {
                      setValue(item.value);
                      handleKnowledgeSelect(item);
                      flushOlderResponse();
                    }}
                    label={false}
                    items={items}
                    onChange={(e) => handleKnowledgeInteractionChange(e)}
                    placeholder="Type to search..."
                  />
                </div>
              </div>
              <CreateInteractionForm
                data={{
                  resolutionData,
                  openCreateInteraction,
                  customerData,
                  interactionData,
                  createdIntxnData,
                  firstTimeResolved,
                  intxnTypeLookup,
                  channelLookup,
                  priorityLookup,
                  preferenceLookup,
                  serviceTypeLookup,
                  problemCaseLookup,
                  serviceCategoryLookup,
                  intxnCategoryLookup,
                  currentFiles,
                  error,
                  selectedService,
                  switchStatus,
                  actionCount,
                  resolutionResponse: workflowResponse,
                  resolutionPayload: workflowPaylod,
                  buttonDisable,
                  multipleServiceData,
                  serviceMsg,
                  appointmentTypes,
                  locations,
                  countries,
                  addressData,
                  addressLookUpRef,
                  addressError,
                  selectedContactPreference,
                  value,
                  isFormDisabled,
                  formDetails,
                  values,
                  lookupData
                }}
                handler={{
                  setResolutionData,
                  handleInputChange,
                  setInteractionData,
                  setCurrentFiles,
                  handleSubmit,
                  handleClear,
                  handleYes,
                  handleNo,
                  setActionCount,
                  setAutoCreateInteraction,
                  workflowApiCall,
                  handleAddProducts,
                  setProductArr,
                  clickToProceed,
                  handleSetOrderId,
                  setOrderId,
                  setWorkflowResponse,
                  handleFrequentInteractionChange,
                  setSelectedService,
                  setAddressData,
                  setAddressLookUpRef,
                  setAddressError,
                  setSelectedContactPreference,
                  setFormDetails,
                  setIsFormDisabled,
                  setValues
                }}
              />
            </div>
            <div className="col-lg-3 col-md-12 col-xs-12">
              {/* Helpdesk details here */}
              {screenSource === statusConstantCode.entityCategory.HELPDESK &&
                helpdeskDetails && (
                  <div className="cmmn-skeleton mt-2 mt-1 mb-1">
                    <span className="skel-profile-heading mb-3">
                      Helpdesk Details
                    </span>
                    <div className="skel-int-helpdesk-detail">
                      <span className="label-container-style">Subject:</span>
                      <span> {helpdeskDetails?.helpdeskSubject}</span>
                    </div>
                    {/* <div className="skel-int-helpdesk-detail">
                                        <span className="label-container-style">From Email:</span>
                                        <span>{helpdeskDetails?.mailId}</span>
                                    </div> */}
                    {/* <div>
                                        <span className="label-container-style">Domain:</span><br></br>
                                        <span>{helpdeskDetails?.mailId ? helpdeskDetails?.mailId.split('@')[1] : ''}</span>
                                    </div> */}
                    <div className="skel-int-helpdesk-detail">
                      <span className="label-container-style">Project:</span>
                      <span>{helpdeskDetails?.project?.description || ""}</span>
                    </div>
                    <div className="skel-int-helpdesk-detail">
                      <span className="label-container-style">Content:</span>
                      <span>
                        {helpdeskDetails?.helpdeskContent}
                        <span onClick={handleHelpdeskModal}>View More</span>
                      </span>
                    </div>
                    <span></span>
                  </div>
                )}
              <div className="cmmn-skeleton mt-2 skel-br-bt-r0">
                <div className="card-styl-profile">
                  <div className="user-profile__wrapper pt-1">
                    <div className="user-profile__avatar">
                      <img
                        src={customerData?.customerPhoto || profileLogo}
                        alt=""
                      // loading="lazy"
                      />
                    </div>
                    <div className="user-profile__details mt-1 mb-1">
                      <span className="user-profile__name">
                        {`${customerData?.firstName} ${customerData?.lastName}` ||
                          customerData?.customerName}
                      </span>
                      {customerUuid && <span className="user-profile__location">
                        {appsConfig?.clientFacingName?.customer ?? 'Customer'} Number: {customerData?.customerNo}
                      </span>}
                      <span className="user-profile__location">
                        <a
                          href={`mailto:${customerData?.customerContact[0]?.emailId ||
                            customerData?.emailId
                            }`}
                        >
                          {customerData?.customerContact[0]?.emailId ||
                            customerData?.emailId ||
                            "NA"}
                        </a>
                      </span>
                      <span className="user-profile__location">
                        {customerData?.customerContact[0]?.mobileNo ||
                          customerData?.mobileNo ||
                          "NA"}
                      </span>
                      {/* <a href="view-customer.html">View Full Profile</a>                                                    */}
                    </div>
                    <hr className="cmmn-hline" />
                    {appsConfig?.clientConfig?.accounts?.enabled && appsConfig?.clientConfig?.services?.enabled && (
                      <div className="user-profile__description mt-0">
                        <div className="container-label">
                          <span className="label-container-style">
                            {appsConfig?.clientFacingName?.customer ?? 'Customer'} Category
                          </span>
                          <span>
                            {customerData?.customerCatDesc?.description || "-"}
                          </span>
                        </div>
                        <div className="container-label">
                          <span className="label-container-style">ID Type</span>
                          <span>
                            {customerData?.idTypeDesc?.description || "-"}
                          </span>
                        </div>
                        <div className="container-label">
                          <span className="label-container-style">ID Value</span>
                          <span>{customerData?.idValue || "-"}</span>
                        </div>
                        {/* {console.log("serviceList ", serviceList[0]?.serviceNo)}
                        {console.log(
                          "selectedService ",
                          selectedService?.serviceNo
                        )} */}
                        <div className="container-label">
                          <span className="label-container-style">
                            Service Number
                          </span>
                          {
                            <span>
                              {(selectedService?.serviceNo
                                ? selectedService?.serviceNo
                                : serviceList[0]?.serviceNo) || "-"}
                              &nbsp;
                              {serviceList.length > 1 && (
                                <a
                                  href="javascript:void(0)"
                                  onClick={() => {
                                    setOpenServiceModal(true);
                                  }}
                                >
                                  more
                                </a>
                              )}
                            </span>
                          }
                        </div>
                        <div className="container-label">
                          <span className="label-container-style">
                            Service Type
                          </span>
                          <span>
                            {(selectedService?.srvcTypeDesc?.description
                              ? selectedService?.srvcTypeDesc?.description
                              : selectedService?.serviceTypeDesc?.description
                                ? selectedService?.serviceTypeDesc?.description
                                : serviceList[0]?.srvcTypeDesc?.description) ||
                              "-"}
                          </span>
                        </div>
                        <div className="container-label">
                          <span className="label-container-style">Plan</span>
                          <span>
                            {(selectedService?.productDetails
                              ? selectedService?.productDetails[0]?.productName
                              : serviceList[0]?.productDetails[0]?.productName) ||
                              "-"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="inter-section skel-inter-pro-sect2 clearfix">
                <h4>Interaction History</h4>
                <div className="total-inter clearfix">
                  <div className="total-his">
                    <span style={{ color: '#fff' }}>Total</span>
                    <span
                      data-toggle="modal"
                      data-target="#skel-view-modal-interactions"
                      style={{ color: '#fff' }} onClick={() => {
                        handleInteractionModal("TOTAL");
                      }}
                    >
                      {interactionList?.count || 0}
                    </span>
                  </div>
                  <div className="total-his">
                    <span style={{ color: '#fff' }}>Open</span>
                    <span
                      data-toggle="modal"
                      data-target="#skel-view-modal-interactions"
                      style={{ color: '#fff' }} onClick={() => {
                        handleInteractionModal("OPEN");
                      }}
                    >
                      {openInteractionCount.current || 0}
                    </span>
                  </div>
                  <div className="total-his">
                    <span style={{ color: '#fff' }}>Closed</span>
                    <span
                      data-toggle="modal"
                      data-target="#skel-view-modal-interactions"
                      style={{ color: '#fff' }} onClick={() => {
                        handleInteractionModal("CLOSED");
                      }}
                    >
                      {closedInteractionCount.current || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/*Interaction */}
      </div>
      <Modal
        isOpen={openServiceModal}
        contentLabel="Search Modal"
        style={RegularModalCustomStyles}
      >
        <div className="modal-header border-bottom-0">
          <h4 className="modal-title">Welcome! Please choose your service to continue... or skip to
            proceed for general queries</h4>
          <button type="button" className="close" onClick={handleOnModelClose}><span aria-hidden="true">×</span></button>
        </div>

        <div className="row mt-2">
          {serviceList &&
            serviceList.map((val, idx) => (
              <div key={idx} className="col-md-6">
                <button
                  type="button"
                  className="skel-interaction-service-more service-base"
                  onClick={(e) => {
                    setSelectedService(val);
                    setOpenServiceModal(false);
                  }}
                >
                  <div className="" style={{ padding: "10px" }}>
                    <span className="skel-react-modal-service">
                      {val?.serviceNo}
                    </span>
                    <div className="service-top-sect skel-create-top-sect-panel">
                      <div className="container-label">
                        <span className="label-container-style">
                          Service Name
                        </span>
                        <span className="text-primary">{val?.serviceName}</span>
                      </div>
                      <div className="container-label">
                        <span className="label-container-style">
                          Service status
                        </span>
                        <span
                          className={`${val?.status ===
                            statusConstantCode.status.SERVICE_ACTIVE
                            ? "text-success"
                            : "text-warning"
                            }`}
                        >
                          {val?.serviceStatus?.description}
                        </span>

                      </div>
                    </div>
                  </div>
                  <hr className="cmmn-hline" />
                  <div className="service-info-sect">
                    <div className="three-grid">
                      <div className="container-label">
                        <span className="label-container-style">
                          Service Type
                        </span>
                        <span>{val?.srvcTypeDesc?.description || "NA"}</span>
                      </div>
                      <div className="container-label">
                        <span className="label-container-style">
                          Start Date
                        </span>
                        <span>{val?.activationDate || "-"}</span>
                      </div>
                      <div className="container-label">
                        <span className="label-container-style">
                          Expiry Date
                        </span>
                        <span>{val?.expiryDate || "-"}</span>
                      </div>
                      <div className="container-label">
                        <span className="label-container-style">
                          Service Limit
                        </span>
                        <span>
                          {`${val?.serviceLimit || '-'} ${val?.serviceUnit || ''}` || "-"}
                        </span>
                      </div>
                      <div className="container-label">
                        <span className="label-container-style">
                          Service Balance
                        </span>
                        <span>
                          {`${val?.serviceBalance || '-'} ${val?.serviceUnit || ''}` || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            ))}
        </div>
        <div className="mt-4 text-center">
          <button
            type="button"
            className="skel-btn-cancel"
            onClick={(e) => {
              setOpenServiceModal(false);
            }}
          >
            Skip
          </button>
        </div>
      </Modal>
      {openProductModal ? (
        <Modal
          isOpen={openProductModal}
          contentLabel="Add Product Modal"
          style={RegularModalCustomStyles}
        >
          <div className="row">
            <AddProductModal
              data={{
                isOpen: openProductModal,
                productList,
                serviceData,
                selectedProductList,
              }}
              handler={{
                setIsOpen: setOpenProductModal,
                handleAddProduct,
                setSelectedProductList,
              }}
            />
            <button
              type="button"
              className="close"
              onClick={handleOnModelClose}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        </Modal>
      ) : (
        <></>
      )}
      <PopupModal
        data={{
          popup,
          setPopup,
          setConfirmation,
          title: "New Product",
          body: "You are about to redirect to new screen. Would you like to proceed!",
          btnCancel: "Cancel",
          btnSubmit: "Yes, proceed",
        }}
      />
      <Modal
        isOpen={isFollowupOpen}
        contentLabel="Followup Modal"
        style={RegularModalCustomStyles}
      >
        <div
          className="modal-center"
          id="cancelModal"
          tabindex="-1"
          role="dialog"
          aria-labelledby="cancelModal"
          aria-hidden="true"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="cancelModal">
                  Followup for Order No {interactionData?.orderNo}
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                  onClick={() => setIsFollowupOpen(false)}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <hr className="cmmn-hline" />
                <div className="clearfix"></div>
                <div className="row pt-3">
                  <div className="col-6">
                    <div className="form-group">
                      <label htmlFor="priority" className="col-form-label">
                        Priority{" "}
                        <span className="text-danger font-20 pl-1 fld-imp">
                          *
                        </span>
                      </label>
                      <select
                        required
                        value={followupInputs.priority}
                        id="priority"
                        className="form-control"
                        onChange={handleOnFollowupInputsChange}
                      >
                        <option key="priority" value="">
                          Select Priority
                        </option>
                        {priorityLookup &&
                          priorityLookup.map((e) => (
                            <option key={e.code} value={e.code}>
                              {e.description}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group">
                      <label htmlFor="source" className="col-form-label">
                        Source{" "}
                        <span className="text-danger font-20 pl-1 fld-imp">
                          *
                        </span>
                      </label>
                      <select
                        required
                        id="source"
                        className="form-control"
                        value={followupInputs.source}
                        onChange={handleOnFollowupInputsChange}
                      >
                        <option key="source" value="">
                          Select Source
                        </option>
                        {sourceLookup &&
                          sourceLookup.map((e) => (
                            <option key={e.code} value={e.code}>
                              {e.description}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-12 ">
                    <div className="form-group ">
                      <label
                        htmlFor="inputState"
                        className="col-form-label pt-0"
                      >
                        Remarks{" "}
                        <span className="text-danger font-20 pl-1 fld-imp">
                          *
                        </span>
                      </label>
                      <textarea
                        required
                        className="form-control"
                        maxLength="2500"
                        id="remarks"
                        value={followupInputs.remarks}
                        onChange={handleOnFollowupInputsChange}
                        name="remarks"
                        rows="4"
                      ></textarea>
                      <span>Maximum 2500 characters</span>
                    </div>
                  </div>
                  <div className="col-md-12 pl-2">
                    <div className="form-group pb-1">
                      <div className="d-flex justify-content-center">
                        <button
                          type="button"
                          className="skel-btn-cancel"
                          onClick={() => setIsFollowupOpen(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="skel-btn-submit"
                          onClick={handleOnAddFollowup}
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isHelpdeskOpen}
        contentLabel="Followup Modal"
        style={RegularModalCustomStyles}
      >
        <>
          <div
            className="modal-center"
            id="cancelModal"
            tabindex="-1"
            role="dialog"
            aria-labelledby="cancelModal"
            aria-hidden="true"
          >
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="cancelModal">
                    Helpdesk Details {helpdeskDetails?.helpdeskId}
                  </h5>
                  <button
                    type="button"
                    className="close"
                    data-dismiss="modal"
                    aria-label="Close"
                    onClick={() => setIsHelpdeskOpen(false)}
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>

                <div className="card-body p-0">
                  <div className="col-12 row pt-2 helpdesk-padding-left-0">
                    <div className="col-3 form-label pl-1">Subject</div>
                    <div className="col-9 form-vtext pl-1">
                      {helpdeskDetails?.helpdeskSubject}
                    </div>
                  </div>
                  <div className="col-12 row pt-2 helpdesk-padding-left-0">
                    <div className="col-3 form-label pl-1">From Email</div>
                    <div className="col-9 form-vtext pl-1">
                      {helpdeskDetails?.mailId}
                    </div>
                  </div>
                  <div className="col-12 row pt-2 helpdesk-padding-left-0">
                    <div className="col-3 form-label pl-1">Domain</div>
                    <div className="col-9 form-vtext pl-1">
                      {helpdeskDetails?.mailId
                        ? helpdeskDetails?.mailId.split("@")[1]
                        : ""}
                    </div>
                  </div>
                  <div className="col-12 row pt-2 helpdesk-padding-left-0">
                    <div className="col-3 form-label pl-1">Project</div>
                    <div className="col-9 form-vtext pl-1">
                      {helpdeskDetails?.project
                        ? helpdeskDetails?.project?.description
                        : ""}
                    </div>
                  </div>
                  <div className="col-12 row pt-2 helpdesk-padding-left-0">
                    <div className="col-3 form-label pl-1">Content</div>
                    <div className="col-9 form-vtext pl-1">
                      {helpdeskDetails?.helpdeskContent}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      </Modal>
      <Modal isOpen={isInteractionListOpen} style={RegularModalCustomStyles}>
        <div
          className="modal-center"
          id="followupModal"
          tabindex="-1"
          role="dialog"
          aria-labelledby="followupModal"
          aria-hidden="true"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="followupModal">
                  Interaction Details for {appsConfig?.clientFacingName?.customer ?? 'Customer'} Number{" "}
                  {customerDetails?.customerNo}
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                  onClick={handleOnCloseChannelModal}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body px-4">
                <form
                  className="needs-validation p-2"
                  name="event-form"
                  id="form-event"
                  novalidate
                >
                  <div className="">
                    <DynamicTable
                      listKey={"Interactions"}
                      row={interactionCustomerHistoryDetails}
                      rowCount={totalCount}
                      header={interactionListColumns}
                      itemsPerPage={perPageModal}
                      isScroll={true}
                      backendPaging={["TOTAL", "OPEN", "CLOSED"].includes(popupType)
                        ? true : false}
                      backendCurrentPage={currentPageModal}
                      handler={{
                        handleCellRender: handleCellRender,
                        handlePageSelect: handlePageSelect,
                        handleItemPerPage: setPerPageModal,
                        handleCurrentPage: setCurrentPageModal,
                      }}
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CreateInteraction;

const interactionListColumns = [
  {
    Header: "Interaction No",
    accessor: "intxnNo",
    disableFilters: true,
  },
  // {
  //   Header: "Remarks",
  //   accessor: "remarks",
  //   disableFilters: true,
  // },
  {
    Header: "Interaction Category",
    accessor: "intxnCategoryDesc.description",
    disableFilters: true
  },
  {
    Header: "Interaction Type",
    accessor: "srType.description",
    disableFilters: true
  },
  {
    Header: "Service Category",
    accessor: "categoryDescription.description",
    disableFilters: true
  },
  {
    Header: "Service Type",
    accessor: "serviceTypeDesc.description",
    disableFilters: true
  },
  {
    Header: "Status",
    accessor: "currStatusDesc.description",
    disableFilters: true
  },
  {
    Header: "Created At",
    accessor: "createdAt",
    disableFilters: true,
  },
];