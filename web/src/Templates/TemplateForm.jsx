import React, { useState, useContext, useEffect, useRef } from "react";
import { TemplateContext } from "../AppContext";
import { Form, Badge, Modal, CloseButton } from 'react-bootstrap';
import ReactSelect from "react-select";
// import { Editor } from 'draft-js';
// import { EditorState, ContentState, convertFromHTML, convertToRaw } from 'draft-js';
// import draftToHtml from 'draftjs-to-html';
import { Editor } from 'react-draft-wysiwyg';
import { useForm, Controller } from "react-hook-form";
import { DateRangePicker } from 'rsuite';
import { post, get, put } from "../common/util/restUtil";
import { properties } from "../properties";
import isBefore from 'date-fns/isBefore';
import { toast } from "react-toastify";
import DynamicTable from "../common/table/DynamicTable";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { NumberFormatBase } from "react-number-format";
import ChargeListView from "../ProductCatalog/chargeListView";
import AddEditChargeModal from "../ProductCatalog/addEditChargeModal";
import EmailEditor from 'react-email-editor';
import TextInput from 'react-autocomplete-input';

const Moment = require('moment');
const MomentRange = require('moment-range');

const moment = MomentRange.extendMoment(Moment);

const TemplateForm = () => {
    const { data, handlers } = useContext(TemplateContext);
    const { templateObj, selectedTemplateData, mode } = data;
    const { selectedTCat, calendarList, businessEntities: {
        templateCategories, templateMapCategories, templateStatuses, userGroups, appointmentTypes, eventTypes,
        locations, orderTypes, serviceTypes, promoTypes, yesNos, benefits,
        termsAndConditionLookup, frequencyLookup, chargeTypes, currencies
    } } = templateObj
    const { setShow, setTemplateObj, setTemplateData: setParentTemplateData, setMode, setSelectedTemplateData } = handlers;
    const [days, setDays] = useState([])
    const [customWorkDiv, setCustomWorkDiv] = useState(['workDiv0'])
    const [customBreakDiv, setCustomBreakDiv] = useState(['breakDiv0'])
    const defaultDate = '1997-01-01';
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const editorRef = useRef(null);
    const emailEditorRef = useRef(null);

    const onReady = () => {
        if (["TC_EMAIL"].includes(templateData.templateCategory) && selectedTemplateData.notificationTemplate?.rawContent?.schemaVersion) {
            console.log("mergeTags before load design ===> ", mergeTags)
            emailEditorRef?.current?.editor?.loadDesign(selectedTemplateData.notificationTemplate?.rawContent);
        }
    };

    const weekDays = [
        { code: "SUN", description: "Sun" },
        { code: "MON", description: "Mon" },
        { code: "TUE", description: "Tue" },
        { code: "WED", description: "Wed" },
        { code: "THU", description: "Thu" },
        { code: "FRI", description: "Fri" },
        { code: "SAT", description: "Sat" },
    ];

    const slotDurations = [
        { code: "10", description: "10 minutes" },
        { code: "15", description: "15 minutes" },
        { code: "20", description: "20 minutes" },
        { code: "30", description: "30 minutes" },
        { code: "60", description: "1 hour" },
        { code: "120", description: "2 hours" },
        { code: "180", description: "3 hours" },
        { code: "240", description: "4 hours" },
    ];

    const [templateData, setTemplateData] = useState({
        templateCategory: selectedTCat?.code
    });

    const [dataSources, setDataSources] = useState([]);
    const [tablesAndColumns, setTablesAndColumns] = useState([]);
    const [mergeTags, setMergeTags] = useState({});
    useEffect(() => {
        get(properties.WORKFLOW_DEFN_API + '/db-schema-info?schemaType=view').then((resp) => {
            if (resp && resp.status === 200 && resp.data) {
                setDataSources([...resp.data]);
            }
        }).catch(() => { });
    }, [])

    useEffect(() => {
        if (templateData?.dataSource) {
            const tablesAndColumnss = [], mergeTagss = {};
            dataSources.filter(x => x.tableName == templateData?.dataSource).forEach(({ tableName, columns }) => {
                mergeTagss[tableName] = {
                    name: tableName,
                    mergeTags: {}
                }
                columns.forEach(({ columnName }) => {
                    mergeTagss[tableName]['mergeTags'][columnName] = {
                        name: columnName,
                        value: `{{${columnName}}}`
                    }
                    tablesAndColumnss.push({ tableName, columnName });
                })
            })
            setTablesAndColumns([...tablesAndColumnss]);
            setMergeTags({ ...mergeTagss });
        } else {
            setTablesAndColumns([]);
            setMergeTags({});
        }
    }, [templateData?.dataSource, dataSources])

    useEffect(() => {
        emailEditorRef?.current?.editor?.setMergeTags(mergeTags);
    }, [mergeTags])

    // const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const [modifier, setModifier] = useState({})
    const [Tmode, setTMode] = useState(mode || 'create')
    const [chargeName, setChargeName] = useState('')
    const [showChargeDropdown, setShowChargeDropdown] = useState(false)
    const [chargeList, setChargeList] = useState([])
    const [chargeData, setChargeData] = useState({
        chargeId: 0,
        chargeName: '',
        chargeType: '',
        chargeTypeDesc: '',
        currencyDesc: '',
        currency: '',
        chargeAmount: '',
        frequency: '',
        prorated: '',
        billingEffective: 1,
        advanceCharge: '',
        chargeUpfront: '',
        startDate: '',
        endDate: '',
        changesApplied: ''
    })
    const [chargeError, setChargeError] = useState([])
    const [isPlanTerminated, setIsPlanTerminated] = useState(false)
    const [productContractData, setProductContractData] = useState([]);
    const [isChargeModalOpen, setIsChargeModalOpen] = useState(false)
    const [selectedBenefits, setSelectedBenefits] = useState([]);
    const [productBenefitData, setProductBenefitData] = useState({});
    const [parents, setParents] = useState([[{}]]);
    const [dateRangeValue, setDateRangeValue] = useState([]);
    const [templateHasRoster, setTemplateHasRoster] = useState();
    const [showCalendar, setShowCalendar] = useState(false);
    const [slotCalculated, setSlotCalculated] = useState(false);
    const [isStaticContent, setIsStaticContent] = useState(false);
    const [isDynamicContent, setIsDynamicContent] = useState(false);
    const [formError, setFormError] = useState(null);
    const [notifyTypes, setNotifyTypes] = useState([]);
    const [selectedShift, setSelectedShift] = useState({});
    const [chargeNameLookup, setChargeNameLookup] = useState([])
    const [termsContent, setTermsContent] = useState("");
    const [shifts, setShifts] = useState([]);
    const [showNewCharge, setShowNewCharge] = useState(false);

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }
    const handleCellRender = (cell, row) => {
        if (cell.column.id === "duration") {
            return (<span>{`${moment(row.original.rosterEndTime, 'HH:mm').diff(moment(row.original.rosterStartTime, 'HH:mm')) / (60 * 1000)} mins `}</span>)
        }
        else {
            return (<span>{cell.value}</span>)
        }
    }
    const OnChangeCalendar = (calendarId) => {
        if (calendarId) {
            let calendarUuid = calendarList.find(e => e.calendarId == calendarId)?.calendarUuid;
            get(`${properties.MASTER_API}/holiday/search?calendarUuid=${calendarUuid}`).then(function (response) {
                const calendar = response?.data?.holidayDet;

                var disabled_days = [];
                for (var i = 0; i < calendar.length; i++) {
                    var item = calendar[i];
                    disabled_days.push(new Date(item.holidayDate));
                };

                const modifiers = {
                    disabled: disabled_days
                }
                setModifier({ ...modifiers })
            }).catch(error => { });
        }
    }
    const groupBy = (items, key) => items.reduce(
        (result, item) => ({
            ...result,
            [item[key]]: [
                ...(result[item[key]] || []),
                item,
            ],
        }),
        {},
    );

    let dateRange = []
    let divIds = [];
    let groupedDivs = {};

    let defaultValues = {
        userGroup: selectedTemplateData?.userGroup,
        templateStatus: selectedTemplateData?.status,
        eventType: selectedTemplateData?.eventType,
        entity: selectedTemplateData?.entity,
        templateCategory: selectedTemplateData?.templateCategory
    }

    if (selectedTemplateData?.templateCategory == "TC_APPOINT") {
        let appointmentDets = selectedTemplateData?.appointmentHdr?.[0]?.appointmentDet;
        groupedDivs = groupBy(appointmentDets, 'divId');
        divIds = Object.keys(groupedDivs);
        if (divIds.length) {
            // dateRange = [
            //     new Date(groupedDivs[divIds[0]]?.[0]?.['appointDate']),
            //     new Date(groupedDivs[divIds[0]]?.[groupedDivs[divIds[0]]?.length - 1]?.['appointDate'])
            // ]
            dateRange = [
                new Date(selectedTemplateData?.startDate),
                new Date(selectedTemplateData?.endDate)
            ]

            for (let index = 0; index < divIds.length; index++) {
                const divId = divIds[index];
                let appointStartTime = groupedDivs[divId][0]['appointStartTime'];
                let appointEndTime = groupedDivs[divId][groupedDivs[divId]?.length - 1]['appointEndTime'];

                defaultValues[`fromRange${divId}`] = appointStartTime ? appointStartTime : undefined;
                defaultValues[`toRange${divId}`] = appointEndTime ? appointEndTime : undefined;
                defaultValues[`duration${divId}`] = groupedDivs[divId][0]['appointInterval'];
                defaultValues[`personCount${divId}`] = groupedDivs[divId][0]['appointAgentsAvailability'];
            }

            defaultValues = {
                ...defaultValues,
                shiftId: selectedTemplateData?.appointmentHdr?.[0]?.appointmentDet?.[0].shiftId
            }
        }

        defaultValues = {
            ...defaultValues,
            fromDate: dateRange[0],
            toDate: dateRange[1],
            appointmentType: selectedTemplateData?.appointmentHdr?.[0]?.appointType,
            location: selectedTemplateData?.appointmentHdr?.[0]?.location,
            calendarId: selectedTemplateData?.calendarId,
            notifyId: selectedTemplateData?.appointmentHdr?.[0]?.notifyId
        }

    }

    const handleContentChange = (newContent) => {
        setTermsContent(newContent);
    };

    useEffect(() => {
        let list = []
        get(properties.CHARGE_API + "/search/all").then((resp) => {
            list = resp.data
            setChargeNameLookup(resp.data.filter((charge) => !['IN', 'TEMP'].includes(charge.status)))
        }).catch(err => console.log(err)).finally()
    }, [templateData.serviceType])

    useEffect(() => {
        let divIdss = divIds.map(x => `workDiv${x}`);
        OnChangeCalendar(selectedTemplateData?.calendarId);
        setCustomWorkDiv([...divIdss]);
        setDateRangeValue([dateRange[0], dateRange[1]]);
        setTemplateData({ ...defaultValues });
    }, []);

    const {
        register, handleSubmit, control, formState: { errors },
        setError, clearErrors, reset, watch, setValue
    } = useForm({
        defaultValues
    });

    useEffect(() => {
        setValue("templateName", ["EDIT", "VIEW"].includes(mode) ? selectedTemplateData?.templateName : "");
    }, [mode])

    useEffect(() => {
        const subscription = watch((value, { name, type }) => {
            setTemplateData({
                ...templateData,
                [name]: value
            })
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    useEffect(() => {
        if (selectedTCat.code == "TC_APPOINT") {
            get(properties.MASTER_API + '/notify-headers').then((resp) => {
                setNotifyTypes([...resp.data.map(elm => ({ label: elm.notifyName, value: elm.notifyId }))]);
            }).catch(error => console.log(error))
            get(properties.MASTER_API + '/shifts').then((resp) => {
                setShifts([...resp.data.map(elm => ({ label: elm.shiftShortName, value: elm.shiftId, ...elm }))]);
            }).catch(error => console.log(error))
        }
    }, [selectedTCat])

    useEffect(() => {
        if (mode === "NEW") {
            reset(); clearErrors();
            setTemplateData({
                templateCategory: selectedTCat?.code
            })
        } else if (["EDIT", "VIEW"].includes(mode)) {
            if (templateData.templateCategory === 'TC_PROMOCODE') {
                setTemplateData({
                    ...selectedTemplateData,
                    allowWithOtherPromo: selectedTemplateData.promoHdr?.allowWithOtherPromo,
                    allowedTimes: selectedTemplateData.promoHdr?.allowedTimes,
                    chargeId: selectedTemplateData.promoHdr?.chargeId,
                    contractList: selectedTemplateData.promoHdr?.contractList,
                    promoEndDate: selectedTemplateData.promoHdr?.endDate,
                    productBenefit: selectedTemplateData.promoHdr?.productBenefit,
                    promoCode: selectedTemplateData.promoHdr?.promoCode,
                    promoDuration: selectedTemplateData.promoHdr?.promoValidityDuration,
                    promoStartDate: selectedTemplateData.promoHdr?.startDate
                })
            } else if (templateData.templateCategory === 'TC_TERMSCONDITION') {
                setTemplateData({
                    ...selectedTemplateData,
                    benefitsImpact: selectedTemplateData.termsHdr?.benefitsImpact,
                    billingImpact: selectedTemplateData.termsHdr?.billingImpact,
                    chargeId: selectedTemplateData.termsHdr?.chargeId,
                    contractImpact: selectedTemplateData.termsHdr?.contractImpact,
                    orderType: selectedTemplateData.termsHdr?.entityType,
                    noOfDays: selectedTemplateData.termsHdr?.noOfDays,
                    paymentImpact: selectedTemplateData.termsHdr?.paymentImpact,
                    serviceType: selectedTemplateData.termsHdr?.serviceType,
                    termId: selectedTemplateData.termsHdr?.termId,
                    termName: selectedTemplateData.termsHdr?.termName,
                    termsContent: selectedTemplateData.termsHdr?.termsContent,
                })

                if (selectedTemplateData.termsHdr?.termsContent != '') {
                    setIsStaticContent(true)
                }
                if (selectedTemplateData.termsHdr?.noOfDays) {
                    setIsDynamicContent(true)
                }
            } else if (templateData.templateCategory === 'TC_PRODUCTBUNDLE') {
                setTemplateData({
                    ...selectedTemplateData,
                    contractFlag: selectedTemplateData.productBundleHdr?.contractFlag,
                    contractList: selectedTemplateData.productBundleHdr?.contractList
                })
                const xx = selectedTemplateData.productBundleHdr?.contractList?.map((value) => Number(value))

                setProductContractData(selectedTemplateData.productBundleHdr?.contractList?.map((value) => Number(value)));
                if (selectedTemplateData.productBundleHdr?.contractList?.length > 0) {
                    const contractLength = selectedTemplateData.productBundleHdr.contractList.map(() => [[{}]]);
                    setParents(contractLength);
                }
                setFile(selectedTemplateData.productBundleHdr?.bundleImage)
            } else if (["TC_EMAIL", "TC_SMS", "TC_WHATSAPP"].includes(templateData.templateCategory)) {
                setTemplateData({
                    ...selectedTemplateData,
                    subject: selectedTemplateData.notificationTemplate?.subject,
                    content: selectedTemplateData.notificationTemplate?.body,
                    rawContent: selectedTemplateData.notificationTemplate?.rawContent,
                    dataSource: selectedTemplateData.notificationTemplate?.dataSource
                })

                if (["TC_EMAIL"].includes(templateData.templateCategory)) {
                    // emailEditorRef?.current?.editor?.loadDesign(selectedTemplateData.notificationTemplate?.rawContent ?? {});
                } else {
                    // const blocksFromHTML = convertFromHTML(selectedTemplateData.notificationTemplate?.body ?? "");
                    // const content = ContentState.createFromBlockArray(
                    //     blocksFromHTML.contentBlocks,
                    //     blocksFromHTML.entityMap
                    // );
                    // setEditorState(EditorState.createWithContent(content));
                }
            }
            selectedTCat.code = selectedTemplateData.templateCategory
        }
    }, [mode])

    const updateParentData = () => {
        post(properties.MASTER_API + '/template/search', {}).then((resp) => {
            if (resp.status === 200) {
                setParentTemplateData([...resp.data])
            }
        }).catch(error => console.log(error))
    }

    const onSubmitCallback = (resp) => {
        if (resp.status == 200) {
            reset(); clearErrors();
            setShow(false);
            updateParentData();
            toast.success(resp.message);
        } else {
            toast.error(resp.message);
        }
    }

    const getEmailContent = () => {
        return new Promise((resolve, reject) => {
            emailEditorRef.current?.editor?.exportHtml((data) => {
                const { design, html } = data;
                resolve({
                    htmlContent: html,
                    rawContent: design
                })
            });
        });
    }

    const [submitError, setSubmitError] = useState();

    const onSubmit = async () => {
        setFormError(null);

        let dataMissing = false;
        if (["TC_EMAIL", "TC_SMS", "TC_WHATSAPP"].includes(selectedTCat?.code)) {
            clearErrors();

            if (["TC_EMAIL"].includes(selectedTCat?.code)) {
                const { htmlContent, rawContent } = await getEmailContent();
                templateData['content'] = htmlContent;
                templateData['rawContent'] = rawContent;
                setTemplateData({
                    ...templateData,
                    content: htmlContent,
                    rawContent: rawContent
                })
            }

            if (!templateData?.dataSource || templateData?.dataSource == "") {
                setError('dataSource', { type: 'custom', message: 'Oops!, notification requires data source.' });
                dataMissing = true;
            }

            if (["TC_EMAIL"].includes(selectedTCat?.code) && !templateData?.subject || templateData?.subject == "") {
                setError('subject', { type: 'custom', message: 'Oops!, notification requires subject.' });
                dataMissing = true;
            }

            if (!templateMapCategories?.map(x => x.code)?.includes(templateData?.entity)) {
                setError('entity', { type: 'custom', message: 'Oops!, notification requires entity.' });
                dataMissing = true;
            }

            if (!templateData?.content || templateData?.content == "") {
                setError('content', { type: 'custom', message: 'Oops!, you missed to fill some content here.' });
                dataMissing = true;
            }

            if (dataMissing) return false;
        }

        const requestObj = {
            ...templateData,
            chargeData,
            termsContent: isStaticContent ? termsContent : null,
            staticTerm: isStaticContent,
            dynamicTerm: isDynamicContent,
            fromDate: moment(dateRangeValue[0]).format('YYYY-MM-DD'),
            toDate: moment(dateRangeValue[1]).format('YYYY-MM-DD')
        }

        if (mode === "EDIT") {
            requestObj['templateId'] = selectedTemplateData.templateId;
            put(`${properties.MASTER_API}/template/update`, requestObj).then(onSubmitCallback).catch(error => console.log(error));
        } else {
            post(`${properties.MASTER_API}/template/create`, requestObj).then(onSubmitCallback).catch(error => console.log(error));
        }
    }

    const onChangeEditorState = (content) => {
        // setEditorState(editorState);
        // let previousEditorState = templateData?.content;
        // let currentEditorState = draftToHtml(convertToRaw(editorState?.getCurrentContent()));
        // console.log("currentEditorState", currentEditorState);
        // if (previousEditorState !== currentEditorState) {
        //     setTemplateData({
        //         ...templateData,
        //         content: currentEditorState?.trim()
        //     })
        // }
    }

    const getRange = (startDate, endDate, type) => {
        let fromDate = moment(startDate)
        let toDate = moment(endDate)
        let diff = toDate.diff(fromDate, type)
        let range = []
        for (let i = 0; i <= diff; i++) {
            range.push(moment(startDate).add(i, type).format("DD-MM-YYYY"))
        }
        return range
    }

    const serialize = (obj) => {
        var str = [];
        for (var p in obj) {
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        }
        return str.join("&");
    }

    const checkRoster = (fromData, toDate) => {
        // console.log("checking roster");
        const data = {
            calendarId: templateData?.calendarId,
            shiftId: templateData?.shiftId,
            appointmentType: templateData?.appointmentType,
            location: templateData?.location,
            fromDate: fromData || templateData?.fromDate,
            toDate: toDate || templateData?.toDate,
            limit: perPage,
            page: currentPage
        }
        let condition = data.appointmentType === 'CUST_VISIT' ? (data.calendarId && data.shiftId && data.appointmentType && data.location && data.fromDate && data.toDate) :
            (data.calendarId && data.shiftId && data.appointmentType && data.fromDate && data.toDate)
        if (condition) {
            data.fromDate = moment(data.fromDate).format("YYYY-MM-DD")
            data.toDate = moment(data.toDate).format("YYYY-MM-DD")
            get(properties.MASTER_API + `/check-roster?${serialize(data)}`).then((resp) => {
                if (resp.status === 200) {
                    setTemplateHasRoster(true);
                    //setDateRangeValue([...resp.data.dates]);
                    setTemplateData({
                        ...templateData,
                        slots: resp.data.slots,
                        rosterDetails: resp.data.rosterDetails,
                        totalCount: resp.data.totalCount
                    })
                    setSlotCalculated(true)
                } else {
                    setTemplateHasRoster(false);
                    setTemplateData({
                        ...templateData,
                        slots: []
                    })
                }
            }).catch(err => {
                setTemplateHasRoster(false);
                setTemplateData({
                    ...templateData,
                    slots: []
                })
            });
        }
    }

    useEffect(() => {
        checkRoster(dateRangeValue[0], dateRangeValue[1]);
    }, [currentPage, perPage]);

    useEffect(() => {
        if (templateData?.calendarId && templateData?.shiftId && templateData?.appointmentType) {
            checkRoster(dateRangeValue[0], dateRangeValue[1]);
        }
    }, [templateData?.calendarId, templateData?.shiftId, templateData?.appointmentType, templateData?.location]);

    const handleOnChange = (e) => {
        const { name, value } = e.target;
        if (name == "templateCategory") {
            reset(); clearErrors(); setMode("NEW"); setShow(true); setSelectedTemplateData({});
            setTemplateObj({
                ...templateObj,
                selectedTCat: templateCategories.find(x => x.code == value)
            })
        }

        if (["TC_EMAIL", "TC_SMS", "TC_WHATSAPP"].includes(selectedTCat?.code) && ["subject", "entity", "content", "dataSource"].includes(name)) {
            clearErrors(name);
        }

        setTemplateData({
            ...templateData,
            [name]: value
        })

        setParents([[{}]])
    }

    const popupRef = useRef(null);
    useEffect(() => {
        /**
         * Alert if clicked on outside of element
         */
        function handleClickOutside(event) {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setShowCalendar(false)
            }
        }
        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };

    }, [popupRef]);

    const handleSlotConfig = (templateData1) => {
        templateData1 = templateData1 ? templateData1 : templateData
        if (!templateData1.shiftId) {
            setError('shiftId', { type: 'custom', message: 'Please select a shift' });
            return;
        } else {
            clearErrors('shiftId');
        }
        if (!moment(templateData1.fromDate, 'YYYY-MM-DD').isValid() || !moment(templateData1.toDate, 'YYYY-MM-DD').isValid()) {
            setError('appointmentDateRange', { type: 'custom', message: 'Please select valid date range' });
            return;
        } else {
            clearErrors('appointmentDateRange');
        }
        setSubmitError(null);
        let slots = [], obj = { slots: [], breaks: [] }

        const fromRangeSlots = [];
        const toRangeSlots = [];
        const duration = [];
        const personCount = [];
        const breakFromSlots = [];
        const breakToSlots = [];

        let slotsHasError = false;
        const timeFormat = 'HH:mm:ss';
        for (let index = 0; index < customWorkDiv.length; index++) {
            var fromRange = moment(templateData1[`fromRange${index}`], timeFormat);
            var toRange = moment(templateData1[`toRange${index}`], timeFormat);

            if (!fromRange.isValid() || !toRange.isValid() || fromRange.isSame(toRange) || fromRange.isAfter(toRange)) {
                slotsHasError = true;
                setError(`fromRange${index}`, { type: 'custom', message: 'Please select valid time range' });
            } else {
                clearErrors(`fromRange${index}`);
            }

            if (!templateData1[`duration${index}`]) {
                slotsHasError = true;
                setError(`duration${index}`, { type: 'custom', message: 'This is required' });
            } else {
                clearErrors(`duration${index}`);
            }

            if (!templateData1[`personCount${index}`]) {
                slotsHasError = true;
                setError(`personCount${index}`, { type: 'custom', message: 'This is required' });
            } else {
                clearErrors(`personCount${index}`);
            }

            fromRangeSlots.push(templateData1[`fromRange${index}`])
            toRangeSlots.push(templateData1[`toRange${index}`])
            duration.push(templateData1[`duration${index}`])
            personCount.push(templateData1[`personCount${index}`])
        }

        if (slotsHasError) return;

        for (let index = 0; index < customBreakDiv.length; index++) {
            fromRangeSlots.push(templateData1['breakFrom' + index])
            toRangeSlots.push(templateData1['breakTo' + index])
        }

        const arr = []
        const breakarr = []

        for (let index = 0; index < fromRangeSlots.length; index++) {
            if (fromRangeSlots[index] && toRangeSlots[index] && duration[index] && personCount[index]) {
                arr.push({
                    range: fromRangeSlots[index] + '-' + toRangeSlots[index],
                    duration: duration[index],
                    personCount: personCount[index],
                    divId: index
                })
            }
        }

        obj.slots = arr

        breakFromSlots.map((val, idx) => {
            breakarr.push(
                { range: val + '-' + breakToSlots[idx] }
            )
        })

        obj.breaks = breakarr

        for (let idx = 0; idx < obj.slots.length; idx++) {
            const slot = obj.slots[idx];
            let splitTimeRange1 = slot.range.split("-");
            for (let idx2 = 0; idx2 < obj.slots.length; idx2++) {
                const slot2 = obj.slots[idx2];
                if (idx !== idx2) {
                    let splitTimeRange2 = slot2.range.split("-");
                    let date1 = [moment(`${defaultDate} ${splitTimeRange1[0]}`), moment(`${defaultDate} ${splitTimeRange1[1]}`)];
                    let date2 = [moment(`${defaultDate} ${splitTimeRange2[0]}`), moment(`${defaultDate} ${splitTimeRange2[1]}`)];
                    let range = moment.range(date1);
                    let range2 = moment.range(date2);
                    if (range.overlaps(range2)) {
                        setSubmitError("Work timings are colliding with each other");
                        return;
                    }
                }
            }
        }

        if (!slotsHasError) {
            post(properties.MASTER_API + '/template/calculate-slots', { obj }).then((resp) => {
                slots = resp.data
                let slotsCalculated = true;
                slots.map(slot => {
                    if (!slot?.timings?.length) {
                        slotsCalculated = false;
                        toast.error("Error in calculating slot timings");
                    }
                })
                if (slotsCalculated) setTemplateData({ ...templateData1, days, slots });
                setSlotCalculated(slotsCalculated);
            }).catch(error => console.log(error))
        }
    }
    const addWorkTimeRow = () => {
        let cDivs = [...customWorkDiv];
        cDivs.push('workDiv' + customWorkDiv.length)
        setSlotCalculated(false);
        setCustomWorkDiv(cDivs)
    }
    const removeWorkTimeRow = (id) => {
        const newDivs = customWorkDiv.filter(e => (e) !== id)
        setSlotCalculated(false);
        setCustomWorkDiv(newDivs)
    }
    const addBreakTimeRow = () => {
        let cDivs = [...customBreakDiv];
        cDivs.push('breakDiv' + customBreakDiv.length)
        setCustomBreakDiv(cDivs)
    }
    const removeBreakTimeRow = (id) => {
        const newDivs = customBreakDiv.filter(e => (e) !== id)
        setCustomBreakDiv(newDivs)
    }

    const showLocation = () => {
        let result = appointmentTypes.find(x => x.code == templateData?.appointmentType);
        if (result) {
            return result.mapping?.userGroups?.includes(templateData?.userGroup) && result.mapping?.showLocation;
        }
        return false;
    }

    const termsList = termsAndConditionLookup && termsAndConditionLookup.map(m => {
        return {
            label: m.termName,
            value: m.termId
        }
    })

    const handleAddCharge = () => {
        if (templateData.serviceType === '') {
            toast.error("Please Select Service Type")
            return false
        }
        // setChargeNameLookup(chargeNameLookup.filter((charge) => charge.serviceType === templateData.serviceType))
        setShowChargeDropdown(true)
    }

    const validate = (section, schema, data) => {
        try {
            if (section === 'CHARGE') {
                setChargeError({})
            }
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                if (section === 'CHARGE') {
                    setChargeError((prevState) => {
                        return { ...prevState, [err.params.path]: err.message };
                    });
                }
            });
            return e;
        }
    };

    useEffect(() => {
        let list = []

        get(properties.CHARGE_API + "/search/all")
            .then((resp) => {
                list = resp.data
                // console.log(' resp.data resp.data resp.data ', resp.data.filter((charge) => charge.status === 'TEMP'))
                setChargeNameLookup(resp.data.filter((charge) => charge.status === 'TEMP'))

            }).catch(error => console.log(error))
            .finally()
        setShowChargeDropdown(false)
    }, [])

    const handleChargeNameSearch = (e) => {
        if (chargeList.length > 0) {
            for (let charge in chargeList) {
                if (Number(chargeList[charge].chargeId) === Number(chargeName)) {
                    toast.error("Charge Name Already Added")
                    setChargeName('')
                    return
                }
            }
        }
        let chargeId = null
        if (selectedTCat?.code === 'TC_TERMSCONDITION') {
            chargeId = e.target.value !== '' ? e.target.value : null
        }
        else {
            chargeId = chargeName
        }
        if (!chargeId || chargeId === '') {
            toast.error("Please Select Charge Name")
            return
        }
        let charge = chargeNameLookup.filter((charge) => Number(charge.chargeId) === Number(chargeId))
        setChargeData({
            chargeId: charge[0]?.chargeId,
            planChargeId: '',
            chargeName: charge[0]?.chargeName,
            chargeType: charge[0]?.chargeCat,
            chargeTypeDesc: charge[0]?.chargeCatDesc?.description,
            currencyDesc: charge[0]?.currencyDesc?.description,
            currency: charge[0]?.currency,
            chargeAmount: Number(charge[0]?.chargeAmount).toFixed(2),
            frequency: '',
            prorated: '',
            billingEffective: 1,
            advanceCharge: '',
            chargeUpfront: '',
            startDate: '',
            endDate: '',
            changesApplied: ''
        })
        setTMode('create')
        setIsChargeModalOpen(true)
        setShowNewCharge(true)
        // setChargeName('')
        // setShowChargeDropdown(false)
    }

    const [terms, setTerms] = useState([])
    const handleBenefitchange = (e, parentIndex, childIndex) => {
        const selectedValue = e.target.value;
        const updatedProductBenefitData = { ...productBenefitData };
        const parentKey = `productBenefit${parentIndex}`;

        if (!updatedProductBenefitData[parentKey]) {
            updatedProductBenefitData[parentKey] = [];
        }
        if (childIndex != null || childIndex != undefined) {
            if (!updatedProductBenefitData[parentKey][childIndex]) {
                updatedProductBenefitData[parentKey][childIndex] = {};
            }

            updatedProductBenefitData[parentKey][childIndex] = {
                ...updatedProductBenefitData[parentKey][childIndex],
                selectedValue,
            };
        } else {
            updatedProductBenefitData[parentKey] = {
                ...updatedProductBenefitData[parentKey],
                selectedValue,
            };
        }
        setProductBenefitData(updatedProductBenefitData);
        const productBenefitArray = Object.values(updatedProductBenefitData);
        setTemplateData((prevtemplateData) => ({
            ...prevtemplateData,
            productBenefit: productBenefitArray[0],
        }));
    };

    const handleDescriptionChange = (e, parentIndex, childIndex) => {
        const description = e.target.value;
        const updatedProductBenefitData = { ...productBenefitData };
        const parentKey = `productBenefit${parentIndex}`;

        if (!updatedProductBenefitData[parentKey]) {
            updatedProductBenefitData[parentKey] = [];
        }
        if (childIndex != null || childIndex != undefined) {
            if (!updatedProductBenefitData[parentKey][childIndex]) {
                updatedProductBenefitData[parentKey][childIndex] = {};
            }

            updatedProductBenefitData[parentKey][childIndex] = {
                ...updatedProductBenefitData[parentKey][childIndex],
                description,
            };
        }
        else {
            updatedProductBenefitData[parentKey] = {
                ...updatedProductBenefitData[parentKey],
                description,
            };
        }

        setProductBenefitData(updatedProductBenefitData);
        const productBenefitArray = Object.values(updatedProductBenefitData);
        setTemplateData((prevtemplateData) => ({
            ...prevtemplateData,
            productBenefit: productBenefitArray[0],
        }));
    };

    const handleContractChange = (e, index) => {
        const contractInMonths = e.target.value;
        const updatedProductContractData = [...productContractData];

        updatedProductContractData[index] = contractInMonths;
        setProductContractData(updatedProductContractData);

        setTemplateData((prevtemplateData) => ({
            ...prevtemplateData,
            contractList: updatedProductContractData.map((value) => Number(value)),
        }));
    };

    useEffect(() => {
        // console.log('---------calling contractflag--------')
        if (templateData.contractFlag === 'N') {
            setParents([[{}]])
            setSelectedBenefits([]);
            setProductBenefitData({});
            setProductContractData([]);
        }
    }, [templateData.contractFlag]);

    // useEffect(() => {
    //     if (templateData.contractList && templateData.contractList.length > 0) {
    //       setProductContractData(templateData.contractList.map((value) => Number(value)));
    //     }      
    // }, [templateData.contractList]);


    // const handleAddParent = () => {
    //   setParents([...parents, [{}]]);
    // };

    useEffect(() => {

        // console.log('templateData.contractList', templateData.contractList)
        // console.log('templateData.productBenefit', templateData.productBenefit)

        if (templateData.productBenefit && templateData.productBenefit.length > 0) {
            const updatedProductBenefitData = {};
            const updatedSelectedBenefits = [];

            for (let i = 0; i < templateData.productBenefit.length; i++) {
                const parentIndex = i;
                const parentKey = `productBenefit${parentIndex}`;
                if (templateData.productBenefit[parentIndex]?.benefits) {
                    updatedProductBenefitData[parentKey] = templateData.productBenefit[parentIndex]?.benefits.map((b) => ({
                        selectedValue: b.selectedValue || '',
                        description: b.description || '',
                    })) || [];
                } else {
                    updatedProductBenefitData[parentKey] = templateData.productBenefit[parentIndex] || [];
                }

                updatedSelectedBenefits.push(
                    templateData.productBenefit[parentIndex]?.benefits ? templateData.productBenefit[parentIndex]?.benefits[0]?.selectedValue :
                        templateData.productBenefit[parentIndex]?.selectedValue || ''
                );
            }

            setProductBenefitData(updatedProductBenefitData);
            setSelectedBenefits(updatedSelectedBenefits);
        }

        if (templateData.contractList && templateData.contractList.length > 0) {
            setProductContractData(templateData.contractList.map((value) => Number(value)));
        }


        // setParents(templateData.contractList ? templateData.contractList.map(() =>
        //     templateData.productBenefit && templateData.productBenefit.map(() => ({}))
        // ) : [[{}]]);

        if (selectedTemplateData.productBundleHdr?.contractList?.length > 0) {
            const contractLength = selectedTemplateData.productBundleHdr.contractList.map(() => [[{}]]);
            // console.log('contractLength------->', contractLength);
            setParents(contractLength);
        }

        // console.log('parents----xx---------->', parents)

    }, []);


    const handleAddParent = () => {
        setParents([...parents, [{}]]);
        setProductBenefitData((prevProductBenefitData) => {
            const updatedProductBenefitData = { ...prevProductBenefitData };
            const parentIndex = Object.keys(updatedProductBenefitData).length;
            const parentKey = `productBenefit${parentIndex}`;
            updatedProductBenefitData[parentKey] = [];
            return updatedProductBenefitData;
        });
    };

    const handleRemoveParent = (parentIndex) => {
        setParents((prevParents) => {
            const updatedParents = [...prevParents];
            updatedParents.splice(parentIndex, 1);
            return updatedParents;
        });

        setProductBenefitData((prevProductBenefitData) => {
            const updatedProductBenefitData = { ...prevProductBenefitData };
            const parentKey = `productBenefit${parentIndex}`;
            delete updatedProductBenefitData[parentKey];

            const productBenefitArray = Object.values(updatedProductBenefitData);

            setTemplateData((prevtemplateData) => ({
                ...prevtemplateData,
                productBenefit: productBenefitArray
            }));

            return updatedProductBenefitData;
        });

        setTemplateData((prevtemplateData) => ({
            ...prevtemplateData,
            contractList: prevtemplateData.contractList.splice(parentIndex, 1),
        }));
    };

    // const handleRemoveParent = (parentIndex) => {
    //   setParents((prevParents) => {
    //     const updatedParents = [...prevParents];
    //     updatedParents.splice(parentIndex, 1);
    //     return updatedParents;
    //   });

    //   setTemplateData((prevtemplateData) => ({
    //     ...prevtemplateData,
    //     contractList: prevtemplateData.contractList.splice(parentIndex, 1),
    //   }));
    // };

    const handleAddChild = (parentIndex) => {
        setParents((prevParents) => {
            const updatedParents = [...prevParents];
            updatedParents[parentIndex] = [...updatedParents[parentIndex], {}];
            return updatedParents;
        });
        setProductBenefitData((prevProductBenefitData) => {
            const updatedProductBenefitData = { ...prevProductBenefitData };
            const parentKey = `productBenefit${parentIndex}`;
            const childIndex = updatedProductBenefitData[parentKey]?.length || 0;
            if (!Array.isArray(updatedProductBenefitData[parentKey])) {
                updatedProductBenefitData[parentKey] = [];
            }
            updatedProductBenefitData[parentKey][childIndex] = {
                selectedValue: '',
                description: '',
            };
            // updatedProductBenefitData[parentKey].push({ selectedValue: '', description: '' });
            return updatedProductBenefitData;
        });
    };

    const handleRemoveChild = (parentIndex, childIndex) => {
        setParents((prevParents) => {
            const updatedParents = [...prevParents];
            updatedParents[parentIndex].splice(childIndex, 1);
            return updatedParents;
        });

        setProductBenefitData((prevProductBenefitData) => {
            const updatedProductBenefitData = { ...prevProductBenefitData };
            const parentKey = `productBenefit${parentIndex}`;
            updatedProductBenefitData[parentKey].splice(childIndex, 1);

            const productBenefitArray = Object.values(updatedProductBenefitData);

            setTemplateData((prevtemplateData) => ({
                ...prevtemplateData,
                productBenefit: productBenefitArray,
            }));

            return updatedProductBenefitData;
        });
    };

    const handleAddBenefit = () => {
        setParents([...parents, [{}]]);
        setProductBenefitData((prevProductBenefitData) => {
            const updatedProductBenefitData = { ...prevProductBenefitData };
            const parentIndex = Object.keys(updatedProductBenefitData).length;
            const parentKey = `productBenefit${parentIndex}`;
            updatedProductBenefitData[parentKey] = [];
            return updatedProductBenefitData;
        });
    };

    const handleRemoveBenefit = (parentIndex) => {
        setParents((prevParents) => {
            const updatedParents = [...prevParents];
            updatedParents.splice(parentIndex, 1);
            return updatedParents;
        });

        setProductBenefitData((prevProductBenefitData) => {
            const updatedProductBenefitData = { ...prevProductBenefitData };
            const parentKey = `productBenefit${parentIndex}`;
            delete updatedProductBenefitData[parentKey];

            const productBenefitArray = Object.values(updatedProductBenefitData);

            setTemplateData((prevtemplateData) => ({
                ...prevtemplateData,
                productBenefit: productBenefitArray
            }));

            return updatedProductBenefitData;
        });

        productContractData.splice(parentIndex, 1);

        setTemplateData((prevtemplateData) => ({
            ...prevtemplateData,
            contractList: productContractData?.map((value) => Number(value)),
        }));
    };

    const [file, setFile] = useState({});

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
        if (type === 'UPLOAD') {
            image = await convertBase64(e);
        }
        setFile(image)
        setTemplateData({
            ...templateData,
            bundleImage: image
        })

    }

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            {["EDIT", "VIEW"].includes(mode) && (
                <div>
                    <span>
                        Template No:
                        <Badge bg="primary skel-btn-submit">
                            {selectedTemplateData.templateNo}
                        </Badge>
                    </span>
                    <span className="ml-3">
                        Mode:
                        <Badge bg="warning skel-btn-submit">
                            {mode}
                        </Badge>
                    </span>
                </div>
            )}
            <div style={{ pointerEvents: `${mode === 'VIEW' ? 'none' : 'auto'}` }}>
                <div className="row mt-3">
                    <div className="col-md-4">
                        <div className="form-group">
                            <label htmlFor="templateCategory" className="control-label">Template type <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                            {(templateCategories && templateCategories?.length > 0) &&
                                <div className="custselect">
                                    <select value={Object.keys(selectedTemplateData).length === 0 ? selectedTCat?.code : selectedTemplateData?.templateCategory} className="form-control"
                                        {...register("templateCategory", { required: 'This is required' })} onChange={handleOnChange}
                                    >
                                        {templateCategories?.map((e, index) => (
                                            <option key={index} value={e.code}>{e.description}</option>
                                        ))}
                                    </select>
                                    {errors.templateCategory && <span className="errormsg">{errors.templateCategory.message}</span>}
                                </div>
                            }
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="form-group">
                            <label htmlFor="apptname" className="control-label">Template Name <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                            <input className="form-control" {...register("templateName", { required: 'This is required' })} placeholder="Template Name" type="text"
                                onChange={(e) => {
                                    setTemplateData({ ...templateData, templateName: e.target.value })
                                }}
                            />
                            {errors.templateName && <span className="errormsg">{errors.templateName.message}</span>}
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="form-group">
                            <label htmlFor="userGroup" className="control-label">User Group <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                            <div className="custselect">
                                <select value={templateData?.userGroup} className="form-control" {...register("userGroup", { required: 'This is required' })} onChange={handleOnChange}>
                                    <option value={''}>Choose Group</option>
                                    {userGroups?.length > 0 && userGroups.map((e, index) => (
                                        <option key={index} value={e.code}>{e.description}</option>
                                    ))}
                                </select>
                                {errors.userGroup && <span className="errormsg">{errors.userGroup.message}</span>}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="form-group">
                            <label htmlFor="templateStatus" className="control-label">Status <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                            <div className="custselect">
                                <select value={templateData?.templateStatus} className="form-control" {...register("templateStatus", { required: 'This is required' })} onChange={handleOnChange}>
                                    <option value={''}>Choose Status</option>
                                    {templateStatuses?.length > 0 && templateStatuses.map((e, index) => (
                                        <option key={index} value={e.code}>{e.description}</option>
                                    ))}
                                </select>
                                {errors.templateStatus && <span className="errormsg">{errors.templateStatus.message}</span>}
                            </div>
                        </div>
                    </div>
                    {/* {!["TC_EMAIL", "TC_SMS", "TC_WHATSAPP"].includes(selectedTCat?.code) && ( */}
                    <div className="col-md-4">
                        <div className="form-group">
                            <label htmlFor="eventType" className="control-label">Event type <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                            <div className="custselect">
                                <select value={templateData?.eventType} className="form-control" {...register("eventType", { required: 'This is required' })} onChange={handleOnChange}>
                                    <option value={''}>Choose Event Type</option>
                                    {eventTypes && eventTypes.map((e, k) => (
                                        <option key={k} value={e.code}>{e.description}</option>
                                    ))}
                                </select>
                                {errors.eventType && <span className="errormsg">{errors.eventType.message}</span>}
                            </div>
                        </div>
                    </div>
                    {/* )} */}
                </div>
                <div className="row mt-2">
                    <div className="col-md-12">
                        <span className="skel-profile-heading">Template Rules</span>
                        <hr className="cmmn-hline mt-2" />
                    </div>
                </div>
                {selectedTCat?.code == "TC_APPOINT" && (
                    <React.Fragment>
                        <div className="row mt-2">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label className="control-label">Calendar<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                    <div className="custselect">
                                        <select name="calendarId"
                                            value={templateData?.calendarId}
                                            className="form-control"
                                            onChange={(e) => {
                                                handleOnChange(e)
                                                OnChangeCalendar(e.target.value)
                                            }}>
                                            <option value={''}>Select...</option>
                                            {calendarList && calendarList.map((e, k) => (
                                                <option key={k} value={e.calendarId}>{e.calendarDescription}</option>
                                            ))}
                                        </select>
                                        {errors.calendarId && <span className="errormsg">{errors.calendarId.message}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label className="control-label">Shift<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                    <div className="custselect">
                                        <Controller
                                            control={control}
                                            name="shiftId"
                                            render={({ field: { onChange, onBlur, value, ref } }) => (
                                                <ReactSelect
                                                    inputRef={ref}
                                                    className="w-100"
                                                    menuPortalTarget={document.body}
                                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                    options={shifts}
                                                    // isMulti={true}
                                                    value={value ? shifts.find(c => c.value == value) : null}
                                                    onChange={val => {
                                                        onChange(val.value)
                                                        setTemplateData({
                                                            ...templateData,
                                                            shiftId: val.value,
                                                            days: undefined,
                                                            slots: undefined
                                                        })
                                                        handleOnChange({ target: { name: 'shiftId', value: val.value } });
                                                        setSelectedShift({ ...val });
                                                        setCustomWorkDiv([...['workDiv0']]);
                                                    }}
                                                />
                                            )}
                                        />
                                        {errors.shiftId && <span className="errormsg">{errors.shiftId.message}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="skill_dropdown" className="control-label">Appointment Type<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                    <div className="custselect">
                                        <select className="form-control skill_dropdown"
                                            value={templateData?.appointmentType}
                                            name="appointmentType"
                                            onChange={handleOnChange}>
                                            <option value={''}>Choose Appointment Type</option>
                                            {appointmentTypes.map((e, k) => (
                                                templateData?.userGroup && e?.mapping?.userGroups?.includes(templateData?.userGroup) && (
                                                    <option key={k} value={e.code}>{e.description}</option>
                                                )
                                            ))}
                                        </select>
                                        {errors.appointmentType && <span className="errormsg">{errors.appointmentType.message}</span>}
                                    </div>
                                </div>
                            </div>
                            {showLocation() && (
                                <div className="col-md-4">
                                    <div className="form-group">
                                        <label htmlFor="skill_dropdown" className="control-label">Location<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                        <div className="custselect">
                                            <select className="form-control skill_dropdown"
                                                name="location"
                                                value={templateData?.location}
                                                onChange={handleOnChange}>
                                                <option value={''}>Choose Location</option>
                                                {locations.map((e, k) => (
                                                    <option key={k} value={e.code}>{e.description}</option>
                                                ))}
                                            </select>
                                            {errors.location && <span className="errormsg">{errors.location.message}</span>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="row">
                            <div className="col-md-4">
                                <label className="control-label" htmlFor="email">Days of the appointment</label>
                            </div>
                            <div className="col-md-4">
                                <DateRangePicker
                                    format="dd-MM-yyyy"
                                    character={' to '}
                                    defaultCalendarValue={dateRange}
                                    defaultValue={dateRange}
                                    onChange={(dates) => {
                                        if (dates?.length > 0) {
                                            dates = [dates[0], dates[1] ? dates[1] : dates[0]]
                                            setTemplateData({ ...templateData, fromDate: moment(dates[0]).format('YYYY-MM-DD'), toDate: moment(dates[1]).format('YYYY-MM-DD') })
                                            setDateRangeValue([...dates])
                                            checkRoster(moment(dates[0]).format('YYYY-MM-DD'), moment(dates[1]).format('YYYY-MM-DD'))
                                        } else {
                                            setTemplateData({ ...templateData, fromDate: undefined, toDate: undefined })
                                            setDateRangeValue([])
                                        }

                                    }}
                                    shouldDisableDate={(date) => {
                                        return modifier.disabled && modifier.disabled.some(disabledDate =>
                                            date.getFullYear() == disabledDate.getFullYear() &&
                                            date.getMonth() == disabledDate.getMonth() &&
                                            date.getDate() == disabledDate.getDate()
                                        ) || (isBefore(date, new Date()))

                                    }}
                                    placeholder="Select Date Range"
                                />
                                {errors?.appointmentDateRange && (
                                    <span className="errormsg">{errors?.appointmentDateRange?.message}</span>
                                )}
                            </div>
                        </div>
                        {
                            /* 
                            {templateHasRoster===false && (
                            <React.Fragment>
                                <div className="customer_records mt-2">
                                    {customWorkDiv?.map((cdiv, i) => (
                                        <div className="form-row" key={i} id={`${cdiv}`} data-block={i}>
                                            <div className="col-md-2">
                                                <div className="form-group">
                                                    <label htmlFor="timing">Start Time</label>
                                                    <DatePicker
                                                        format="HH:mm"
                                                        hideHours={hour => hour < (selectedShift?.shiftStartTime?.split(':')[0]) || hour > (selectedShift?.shiftEndTime?.split(':')[0])}
                                                        hideMinutes={minute => minute % 15 !== 0}
                                                        defaultValue={groupedDivs[i]?.[0]?.['appointStartTime'] ? new Date(`${defaultDate} ${groupedDivs[i]?.[0]?.['appointStartTime']}`) : undefined}
                                                        onChange={(e) => {
                                                            let time = e ? moment(e).format('HH:mm') : undefined;
                                                            setTemplateData({ ...templateData, ['fromRange' + i]: time })
                                                        }}
                                                        placeholder="Select Time Range"
                                                    />
                                                    {errors['fromRange' + i] &&
                                                        <span className="errormsg">{errors['fromRange' + i]?.message}</span>
                                                    }
                                                </div>
                                            </div>
                                            <div className="col-md-2">
                                                <div className="form-group">
                                                    <label htmlFor="timing">End Time</label>
                                                    <DatePicker
                                                        format="HH:mm"
                                                        hideHours={hour => hour < (selectedShift?.shiftStartTime?.split(':')[0]) || hour > (selectedShift?.shiftEndTime?.split(':')[0])}
                                                        hideMinutes={minute => minute % 15 !== 0}
                                                        defaultValue={groupedDivs[i]?.[groupedDivs[i]?.length - 1]['appointEndTime'] ? new Date(`${defaultDate} ${groupedDivs[i]?.[groupedDivs[i]?.length - 1]['appointEndTime']}`) : undefined}
                                                        onChange={(e) => {
                                                            let time = e ? moment(e).format('HH:mm') : undefined;
                                                            setTemplateData({ ...templateData, ['toRange' + i]: time })
                                                        }}
                                                        placeholder="Select Time Range"
                                                    />
                                                    {errors['toRange' + i] &&
                                                        <span className="errormsg">{errors['toRange' + i]?.message}</span>
                                                    }
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label htmlFor="timing">Interval</label>
                                                    <select name="templateCategory" ref={register("durat{ required: 'This is required' })} className="form-control ml-1" onChange={handleOnChange}>
                                                        <option value={null}>Select duration</option>
                                                        {slotDurations.map((e, k) => (
                                                            <option key={k} selected={e.code == templateData?.['duration' + i]} value={e.code}>{e.description}</option>
                                                        ))}
                                                    </select>
                                                    {errors['duration' + i] &&
                                                        <span className="errormsg">{errors['duration' + i]?.message}</span>
                                                    }
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="timing">Persons availability</label>
                                                    <input type="number" id="personCount" className="form-control" defaultValue={templateData['personCount' + i]}
                                                        name="templateCategory" ref={register("personCo{ required: 'This is required' })}
                                                        onChange={(e) => {
                                                            setTemplateData({ ...templateData, ['personCount' + i]: e.target.value })
                                                        }}
                                                    />
                                                    {errors['personCount' + i] &&
                                                        <span className="errormsg">{errors['personCount' + i]?.message}</span>
                                                    }
                                                </div>
                                            </div>
                                            {(i == 0) ? (
                                                <a className="styl-edti-btn addmore p-1" onClick={addWorkTimeRow}>
                                                    <i className="fa fa-plus"></i>
                                                </a>
                                            ) : (
                                                <a className="inputRemoveslots" onClick={(e) => removeWorkTimeRow(`${cdiv}`)}>
                                                    <i className="fa fa-minus"></i>
                                                </a>
                                            )}
    
                                        </div>
                                    ))}
                                    {
                                        customBreakDiv && customBreakDiv.map((cdiv, i) => (
                                            <div className="form-row" key={i} id={`${cdiv}`} data-block={i}>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label htmlFor="timing">Break Timings</label>
                                                        <div className="">
                                                            <DateRangePicker
                                                                format="HH:mm"
                                                                character={' to '}
                                                                ranges={[]}
                                                                defaultCalendarValue={[new Date(new Date().setHours(0, 0, 0, 0)), new Date(new Date().setHours(0, 0, 0, 0))]}
                                                                onChange={(e) => {
                                                                    if (e && e.length > 0) {
                                                                        if (moment(e[0]).format('HH:mm') > moment(e[1]).format('HH:mm')) {
                                                                            setCustomError({ ...customError, ['breakTimeRange' + i]: 'To range is lesser than from Range' })
                                                                        } else {
                                                                            setCustomError({ ...customError, ['breakTimeRange' + i]: '' })
                                                                            setTemplateData({ ...templateData, ['breakFrom' + i]: moment(e[0]).format('HH:mm'), ['breakTo' + i]: moment(e[1]).format('HH:mm') })
                                                                        }
                                                                    } else {
                                                                        setCustomError({ ...customError, ['breakTimeRange' + i]: '' })
                                                                    }
                                                                }}
                                                                placeholder="Select Time Range"
                                                            />
                                                            {(errors['breakTimeRange' + i] || error['breakFrom' + i] || customError['breakTimeRange' + i]) &&
                                                                <span className="errormsg">{errors['breakTimeRange' + i]?.message || error['breakFrom' + i] || customError['breakTimeRange' + i]}</span>
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                                {
                                                    i == 0 ?
                                                        <a id="addmore1" className="styl-edti-btn addmore p-1" onClick={addBreakTimeRow}><i className="fa fa-plus"></i></a>
                                                        :
                                                        <a id="addmore1" className="inputRemoveslots"><i className="fa fa-minus" onClick={(e) => { removeBreakTimeRow(`${cdiv}`) }}></i></a>
                                                }
                                            </div>
                                        ))
                                    }
                                    <div className="text-center">
                                        {submitError && (<span className="errormsg mb-1" style={{ textAlign: 'center' }}>{submitError}</span>)}
                                        <button type="button" className="skel-btn-submit" onClick={() => handleSlotConfig()}>Calculate Slots</button>
                                    </div>
                                </div>
                            </React.Fragment>
                        )} */
                        }
                        <hr className="cmmn-hline mt-2" />
                        {templateHasRoster === true && (
                            <div className="slots text-center" style={{ pointerEvents: 'auto' }}>
                                {templateData?.rosterDetails?.length > 0 &&
                                    <DynamicTable
                                        listKey={"Assigned Operations"}
                                        row={templateData?.rosterDetails}
                                        rowCount={templateData?.totalCount}
                                        header={columns}
                                        fixedHeader={false}
                                        customClassName={'table-sticky-header'}
                                        itemsPerPage={perPage}
                                        isScroll={false}
                                        backendPaging={true}
                                        backendCurrentPage={currentPage}
                                        handler={{
                                            handleCellRender: handleCellRender,
                                            handlePageSelect: handlePageSelect,
                                            handleItemPerPage: setPerPage,
                                            handleCurrentPage: setCurrentPage
                                        }}
                                    />
                                }

                                {/* (
                                        <table className='table table-bordered'>
                                            <thead>
                                                <tr>
                                                    <th scope="col">Date</th>
                                                    <th scope="col">Appointment time</th>
                                                    <th scope="col">Duration</th>
                                                    <th scope="col">Person availability</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {getRange(dateRangeValue[0], dateRangeValue[1], 'days').map((date, index) => (
                                                    templateData?.slots?.map((e1, k1) => (
                                                        <tr key={k1}>
                                                            <td>{date}</td>
                                                            <td>{e1?.timings?.[0]?.split("-")?.[0]} to {e1?.timings?.[e1?.timings?.length - 1]?.split("-")?.[1]}</td>
                                                            <td>Slots: {e1?.timings?.length}, Duration: {moment(e1?.timings?.[0]?.split("-")?.[1], "HH:mm").diff(moment(e1?.timings?.[0]?.split("-")?.[0], "HH:mm"), 'minutes')} mins</td>
                                                            <td>{e1.personCount}</td>
                                                        </tr>
                                                    ))
                                                ))}
                                            </tbody>
                                        </table>
                                    )
                                */}

                                {/* <ul>
                            {getRange(dateRangeValue[0], dateRangeValue[1], 'days').map((date, index) => (
                                <React.Fragment key={index}>
                                    {templateData?.slots?.length && (
                                        <React.Fragment>
                                            <Badge bg="primary skel-btn-submit">
                                                {date}
                                            </Badge>
                                            <span> - </span>
                                            {templateData?.slots?.map((e1, k1) => (
                                                e1?.timings?.map((e2, k2) => (
                                                    <li key={k2}>{e2}</li>
                                                ))
                                            ))}
                                            <br />
                                        </React.Fragment>
                                    )}
                                </React.Fragment>
                            ))}
                        </ul> */}
                            </div>
                        )}
                        <div className="form-row mt-3">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="status" className="control-label">Notification Name</label>
                                    <div className="">
                                        <Controller
                                            control={control}
                                            name="notifyId"
                                            render={({ field: { onChange, onBlur, value, ref } }) => (
                                                <ReactSelect
                                                    inputRef={ref}
                                                    className="w-100"

                                                    menuPortalTarget={document.body}
                                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}

                                                    options={notifyTypes}
                                                    // isMulti={true}
                                                    value={value ? notifyTypes.find(c => c.value == value) : null}
                                                    onChange={val => {
                                                        onChange(val)
                                                        setTemplateData({
                                                            ...templateData,
                                                            notifyId: val.value
                                                        })
                                                    }}
                                                />
                                            )}
                                        />
                                        {errors.notifyId && <span className="errormsg">{errors.notifyId.message}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </React.Fragment>
                )}
                {["TC_EMAIL", "TC_SMS", "TC_WHATSAPP"].includes(selectedTCat?.code) && (
                    <React.Fragment>
                        <div className="row mt-2">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="entity" className="control-label">Entity<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                    <div className="custselect">
                                        <select value={templateData?.entity} className="form-control" name="entity" id="entity" onChange={handleOnChange}>
                                            <option value={''}>Choose Entity</option>
                                            {templateMapCategories?.length > 0 && templateMapCategories.map((e, k) => (
                                                <option key={k} value={e.code}>{e.description}</option>
                                            ))}
                                        </select>
                                        {errors.entity && <span className="errormsg">{errors.entity.message}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="dataSource" className="control-label">Data Source <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                    <div className="custselect">
                                        <select value={templateData?.dataSource} className="form-control" name="dataSource" id="dataSource" onChange={handleOnChange}>
                                            <option value={''}>Choose Action</option>
                                            {dataSources?.length > 0 && [...new Set(dataSources.map(x => x.tableName))]?.map((dataSource) => (
                                                <option key={dataSource} value={dataSource}>{dataSource}</option>
                                            ))}
                                        </select>
                                        {errors.dataSource && <span className="errormsg">{errors.dataSource.message}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {["TC_EMAIL"].includes(selectedTCat?.code) && (
                            <div className="row mt-2">
                                <div className="col-md-12">
                                    <label htmlFor="subject" className="control-label">
                                        Subject<span className="text-danger font-20 pl-1 fld-imp">*</span>
                                        <span style={{ fontSize: '12px', fontWeight: 100 }}>&nbsp;(type <strong>{'"{{"'}</strong> to trigger fields)</span>
                                    </label>
                                    <TextInput
                                        Component="input"
                                        type="text"
                                        matchAny={true}
                                        className="form-control"
                                        trigger={["{{"]}
                                        options={{ "{{": [...new Set(tablesAndColumns.map(x => `${x.columnName}`))] }}
                                        spacer={"}}"}
                                        rows={10}
                                        offsetY={20}
                                        onChange={(value) => handleOnChange({ target: { name: "subject", value: value } })}
                                        value={templateData.subject}
                                        placeholder="Subject"
                                    />
                                    {errors.subject && <span className="errormsg">{errors.subject.message}</span>}
                                </div>
                            </div>
                        )}
                        <div className="row mt-2">
                            <div className="col-md-12">
                                <label htmlFor="sms" className="control-label">
                                    Content <span className="text-danger font-20 pl-1 fld-imp">*</span>
                                    <span style={{ fontSize: '12px', fontWeight: 100 }}>&nbsp;(type <strong>{selectedTCat?.code == "TC_EMAIL" ? '"{"' : '"{{"'}</strong> to trigger fields)</span>
                                </label>
                                {["TC_EMAIL"].includes(selectedTCat?.code) ? (
                                    <EmailEditor
                                        ref={emailEditorRef}
                                        onReady={onReady}
                                        options={{
                                            mergeTagsConfig: {
                                                autocompleteTriggerChar: "{"
                                            }
                                        }}
                                    />
                                ) : (
                                    <TextInput
                                        className="form-control"
                                        style={{ height: "auto" }}
                                        trigger={["{{"]}
                                        matchAny={true}
                                        options={{ "{{": [...new Set(tablesAndColumns.map(x => `${x.columnName}`))] }}
                                        spacer={"}}"}
                                        rows={10}
                                        offsetY={20}
                                        value={templateData.content}
                                        onChange={(value) => handleOnChange({ target: { name: "content", value: value } })}
                                    />
                                )}
                                {errors.content && <span className="errormsg">{errors.content.message}</span>}
                            </div>
                        </div>
                    </React.Fragment>
                )}
                {(selectedTCat?.code == "TC_TERMSCONDITION") && (
                    <React.Fragment>
                        <div className="row mt-2">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="control-label">Order Type<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                    <div className="custselect">
                                        <select name="orderType" className="form-control"
                                            value={templateData?.orderType}
                                            onChange={(e) => {
                                                handleOnChange(e)
                                            }}>
                                            <option value={''}>Select...</option>
                                            {orderTypes && orderTypes.map((e, k) => (
                                                <option key={k} value={e.code}>{e.description}</option>
                                            ))}
                                        </select>
                                        {errors.orderType && <span className="errormsg">{errors.orderType}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="control-label">Service Type<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                    <div className="custselect">
                                        <select name="serviceType" className="form-control"
                                            value={templateData?.serviceType}
                                            onChange={(e) => {
                                                handleOnChange(e)
                                            }}>
                                            <option value={''}>Select...</option>
                                            {serviceTypes && serviceTypes.map((e, k) => (
                                                <option key={k} value={e.code}>{e.description}</option>
                                            ))}
                                        </select>
                                        {errors.serviceType && <span className="errormsg">{errors.serviceType}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row mt-2">
                            <div className="col-1 p-1 font-weight-bold">Static Content
                                <div className="switchToggle">
                                    <input type="checkbox" name="staticContent" id="staticContent" checked={isStaticContent}
                                        onChange={() => {
                                            setIsStaticContent(!isStaticContent)
                                            setTemplateData({
                                                ...templateData,
                                                staticTerm: !isStaticContent
                                            })
                                        }}
                                    />
                                    <label htmlFor="staticContent">Toggle</label>
                                </div>
                            </div>
                            <div className="col-1 p-1 font-weight-bold">Dynamic Content
                                <div className="switchToggle">
                                    <input type="checkbox" name="dynamicContent" id="dynamicContent" checked={isDynamicContent}
                                        onChange={() => {
                                            setIsDynamicContent(!isDynamicContent)
                                            setTemplateData({
                                                ...templateData,
                                                dynamicTerm: !isDynamicContent
                                            })
                                        }}
                                    />
                                    <label htmlFor="dynamicContent">Toggle</label>
                                </div>
                            </div>
                        </div>
                        <div className="row mt-2">
                            {
                                isStaticContent && <div className="card mb-1">
                                    <div className="card-header" id="headingOne">
                                        <h5 className="m-0">
                                            <a className="text-white" aria-expanded="true">
                                                Terms
                                            </a>
                                        </h5>
                                    </div>
                                    <div id="collapseOne" className="collapse show" aria-labelledby="headingOne" data-parent="#accordion">
                                        <div className="card-body border">
                                            <div className="row col-10">
                                                <div className="">
                                                    <div className="card">
                                                        <div className="card-body">
                                                            <ReactQuill ref={editorRef} value={termsContent} onChange={handleContentChange} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }
                            {
                                isDynamicContent && <>
                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label className="control-label">No. of Days (from activation date)<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <div className="">
                                                <input className="form-control" defaultValue={templateData?.noOfDays ?? ''} name="noOfDays" placeholder="No. of Days" type="text"
                                                    onChange={(e) => {
                                                        setTemplateData({ ...templateData, noOfDays: e.target.value })
                                                    }}
                                                />
                                                {errors.noOfDays && <span className="errormsg">{errors.noOfDays}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label className="control-label">Charge<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <div className="custselect">
                                                <select name="chargeId" className="form-control"
                                                    id="chargeId"
                                                    value={templateData?.chargeId}
                                                    onChange={(e) => {
                                                        handleOnChange(e)
                                                        setIsChargeModalOpen(true)
                                                        handleChargeNameSearch(e)
                                                    }}>
                                                    <option value={''}>Select...</option>
                                                    {chargeNameLookup && chargeNameLookup.map((charge, key) => (
                                                        <option key={key} value={charge.chargeId}>{charge.chargeName}</option>
                                                    ))}
                                                </select>
                                                {errors.chargeId && <span className="errormsg">{errors.chargeId}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label className="control-label">Contract Impact<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <div className="">
                                                <input type="checkbox" name="contractImpact" id="contractImpact"
                                                    checked={templateData.contractImpact}
                                                    onChange={(e) => {
                                                        setTemplateData({
                                                            ...templateData,
                                                            contractImpact: !templateData.contractImpact
                                                        })
                                                    }}
                                                />
                                                {errors.contractImpact && <span className="errormsg">{errors.contractImpact}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label className="control-label">Payment Impact<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <div className="">
                                                <input type="checkbox" name="paymentImpact" id="paymentImpact"
                                                    checked={templateData.paymentImpact}
                                                    onChange={(e) => {
                                                        setTemplateData({
                                                            ...templateData,
                                                            paymentImpact: !templateData.paymentImpact
                                                        })
                                                    }}
                                                />
                                                {errors.paymentImpact && <span className="errormsg">{errors.paymentImpact}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label className="control-label">Billing Impact<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <div className="">
                                                <input type="checkbox" name="billingImpact" id="billingImpact"
                                                    checked={templateData.billingImpact}
                                                    onChange={(e) => {
                                                        setTemplateData({
                                                            ...templateData,
                                                            billingImpact: !templateData.billingImpact
                                                        })
                                                    }}
                                                />
                                                {errors.billingImpact && <span className="errormsg">{errors.billingImpact}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label className="control-label">Benefits Impact<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <div className="">
                                                <input type="checkbox" name="benefitsImpact" id="benefitsImpact"
                                                    checked={templateData.benefitsImpact}
                                                    onChange={(e) => {
                                                        setTemplateData({
                                                            ...templateData,
                                                            benefitsImpact: !templateData.benefitsImpact
                                                        })
                                                    }}
                                                />
                                                {errors.benefitsImpact && <span className="errormsg">{errors.benefitsImpact}</span>}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            }
                            {/* <ChargeListView
                                data={{
                                    chargeList: chargeList,
                                    chargeData: chargeData,
                                    isTerminated: isPlanTerminated
                                }}
                                handler={{
                                    setChargeData: setChargeData,
                                    setIsOpen: setIsChargeModalOpen,
                                    setMode: setTMode,
                                }}
                                />  */}
                            {


                                isChargeModalOpen &&
                                <AddEditChargeModal
                                    data={{
                                        chargeList: chargeList,
                                        isOpen: isChargeModalOpen,
                                        chargeData: chargeData,
                                        error: chargeError,
                                        mode: 'create',
                                        // oldChargeName: oldChargeName,
                                        // location: location,
                                        // module: 'Plan'
                                    }}
                                    handler={{
                                        setIsOpen: setIsChargeModalOpen,
                                        setChargeData: setChargeData,
                                        setError: setChargeError,
                                        setChargeList: setChargeList,
                                        validate: validate
                                    }}
                                />
                            }
                        </div>
                    </React.Fragment>
                )}
                {(selectedTCat?.code == "TC_PROMOCODE" || selectedTCat?.code == "TC_PRODUCTBUNDLE") && (
                    <React.Fragment>
                        {selectedTCat?.code == "TC_PROMOCODE" && <div className="form-row">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="promoCode" className="control-label">Promo code<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                    <input className="form-control" name="promoCode"
                                        placeholder="Alpha Numeric" type="text"
                                        value={templateData.promoCode}
                                        onChange={handleOnChange}
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="allowedTimes" className="control-label">Allowed Times<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                    <NumberFormatBase
                                        className="form-control"
                                        name="allowedTimes"
                                        id="allowedTimes"
                                        onChange={handleOnChange}
                                        value={templateData.allowedTimes}
                                        placeholder="Value in number"
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="promoDuration" className="control-label">Promo Valid Duration (Months)<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                    <NumberFormatBase
                                        className="form-control"
                                        name="promoDuration"
                                        id="promoDuration"
                                        onChange={handleOnChange}
                                        value={templateData.promoDuration}
                                        placeholder="Value in number"
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="allowWithOtherPromo" className="control-label">Allow work with other promo<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                    <select className="form-control"
                                        name="allowWithOtherPromo"
                                        id="allowWithOtherPromo"
                                        value={templateData?.allowWithOtherPromo}
                                        onChange={handleOnChange}>
                                        <option value={''}>Select...</option>
                                        {yesNos && yesNos.map((e, k) => (
                                            <option key={k} value={e.code}>{e.description}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="promoStartDate" className="control-label">Start Date<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                    <input type="date" className="form-control"
                                        name="promoStartDate"
                                        id="promoStartDate"
                                        value={templateData.promoStartDate}
                                        min={moment(new Date()).format('YYYY-MM-DD')}
                                        onChange={handleOnChange} />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="promoEndDate" className="control-label">End Date <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                    <input type="date" className="form-control"
                                        name="promoEndDate"
                                        id="promoEndDate"
                                        value={templateData.promoEndDate}
                                        min={moment(new Date()).format('YYYY-MM-DD')}
                                        onChange={handleOnChange} />
                                </div>
                            </div>
                        </div>
                        }
                        <div className="row">
                            {
                                selectedTCat?.code == "TC_PRODUCTBUNDLE" &&
                                <>
                                    <label>Bundle Image<span className="text-danger font-20 pl-1 fld-imp">*</span></label><br />
                                    <div className="col-md-12">
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
                                    <div className="col-md-2">
                                        <div className="form-group">
                                            <label htmlFor="dob" className="control-label">Add Contract ?<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <select className="form-control" id="contractFlag" name="contractFlag" onChange={handleOnChange} value={templateData.contractFlag}>
                                                <option>Select...</option>
                                                <option value='Y'>Yes</option>
                                                <option value='N'>No</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        {/* {console.log('productContractData------->', productContractData)} */}
                                        {/* {console.log('parents------->', parents)} */}
                                        {
                                            templateData.contractFlag === 'Y' ?
                                                <div className="col-md-6">
                                                    {parents.map((parent, parentIndex) => {

                                                        const selectedContractData = productContractData[parentIndex];

                                                        return (
                                                            <div key={parentIndex} className="form-row">
                                                                {
                                                                    parentIndex === 0 ? (
                                                                        <a className="addmore" onClick={() => handleAddBenefit(parentIndex)}>
                                                                            <i className="fa fa-plus"></i>
                                                                        </a>
                                                                    ) : (
                                                                        <a className="inputRemoveslots" onClick={() => handleRemoveBenefit(parentIndex)}>
                                                                            <i className="fa fa-minus"></i>
                                                                        </a>
                                                                    )
                                                                }
                                                                <div className="form-group">
                                                                    <label htmlFor={"contractInMonths" + parentIndex} className="control-label">Contract Duration<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                                    <NumberFormatBase
                                                                        className="form-control"
                                                                        id={"contractInMonths" + parentIndex}
                                                                        onChange={e => { handleContractChange(e, parentIndex) }}
                                                                        value={selectedContractData}
                                                                        placeholder="0"
                                                                    />
                                                                </div>
                                                                <div className="col-md-1 mt-4">Months</div>

                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                                : <></>
                                        }
                                    </div>
                                </>
                            }
                            {
                                selectedTCat?.code == "TC_PROMOCODE" &&
                                <>
                                    <div className="col-md-12">

                                        {parents.map((parent, parentIndex) => {
                                            const selectedContractData = productContractData[parentIndex];
                                            return (<div key={parentIndex} className="form-row">
                                                {/* {
                                            parentIndex === 0 ? (
                                            <a className="addmore" onClick={handleAddParent}>
                                                <i className="fa fa-plus"></i>
                                            </a>
                                            ) : (
                                            <a className="inputRemoveslots" onClick={() => handleRemoveParent(parentIndex)}>
                                                <i className="fa fa-minus"></i>
                                            </a>
                                            )
                                        } */}
                                                <div className="col-md-2">
                                                    <div className="form-group">
                                                        <label htmlFor={"contractInMonths" + parentIndex} className="control-label">Apply for Contract<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                        <NumberFormatBase
                                                            className="form-control"
                                                            id={"contractInMonths" + parentIndex}
                                                            onChange={e => { handleContractChange(e, parentIndex) }}
                                                            value={selectedContractData}
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-1 mt-4">Months</div>
                                                <div className="col-md-6">
                                                    {parent.map((child, childIndex) => {
                                                        const selectId = `productBenefitSelect-${parentIndex}`;
                                                        const descriptionId = `productBenefitDesc-${parentIndex}-${childIndex}`;
                                                        const selectedValue = productBenefitData[`productBenefit${parentIndex}`]?.[childIndex]?.selectedValue || '';
                                                        const descriptionValue = productBenefitData[`productBenefit${parentIndex}`]?.[childIndex]?.description || '';
                                                        const availableBenefits = benefits.filter(
                                                            (val) => !selectedBenefits.includes(val.code) || val.code === selectedValue
                                                        );

                                                        return (<div key={childIndex} className="form-row">
                                                            <div className="col-md-3">
                                                                <div className="form-group">
                                                                    <label htmlFor={selectId} className="control-label">Apply for Benefits</label>
                                                                    <div className="input-group">
                                                                        <select
                                                                            className="form-control"
                                                                            id={selectId}
                                                                            value={selectedValue}
                                                                            onChange={(e) => handleBenefitchange(e, parentIndex, childIndex)}
                                                                        >
                                                                            <option value="">Select..</option>
                                                                            {availableBenefits.map((val, key) => (
                                                                                <option key={key} value={val.code}>{val.description}</option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group">
                                                                    <label htmlFor={descriptionId} className="control-label">Benefit value</label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        id={descriptionId}
                                                                        name={descriptionId}
                                                                        value={descriptionValue}
                                                                        onChange={(e) => handleDescriptionChange(e, parentIndex, childIndex)}
                                                                    />
                                                                </div>
                                                            </div>
                                                            {
                                                                childIndex === 0 ? (
                                                                    <a className="addmore" onClick={() => handleAddChild(parentIndex)}>
                                                                        <i className="fa fa-plus"></i>
                                                                    </a>
                                                                ) : (
                                                                    <a className="inputRemoveslots" onClick={() => handleRemoveChild(parentIndex, childIndex)}>
                                                                        <i className="fa fa-minus"></i>
                                                                    </a>
                                                                )
                                                            }
                                                        </div>)
                                                    })}
                                                </div>

                                                {/* {parentIndex === 0 ? (
                                        <a className="addmore" onClick={handleAddParent}>
                                            <i className="fa fa-plus"></i>
                                        </a>
                                        ) : (
                                        <a className="inputRemoveslots" onClick={() => handleRemoveParent(parentIndex)}>
                                            <i className="fa fa-minus"></i>
                                        </a>
                                        )} */}
                                            </div>
                                            )
                                        }
                                        )}

                                    </div>

                                    <div className="col-12 pt-2 pl-0 pb-2 row ml-1">
                                        <div className="col-md-4 pl-0">
                                            <div className="form-group">
                                                <label htmlFor="termsId" className="col-form-label">Add Terms and Conditions</label>
                                                <div className="input-group">
                                                    <ReactSelect
                                                        className="w-100"
                                                        menuPortalTarget={document.body}
                                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                        options={termsList}
                                                        value={terms}
                                                        isMulti={true}
                                                        onChange={(val) => {
                                                            setTerms(val);
                                                            const termsList = val.map(m => m?.value)
                                                            setTemplateData({
                                                                ...templateData,
                                                                termsId: termsList
                                                            })
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-12 p-0">
                                        <section className="triangle">
                                            <div className="row col-12">
                                                <div className="col-10">
                                                    <h5 id="list-item-1" className="pl-1 mt-2">Charge Details</h5>
                                                </div>
                                                {/* <div className="col-2">
                                                        <span style={{ float: "right" }}>
                                                            <button type="button" className="btn btn-labeled btn-primary btn-sm mt-1" disabled={false}
                                                                onClick={() => { handleAddCharge() }}
                                                            >
                                                                <span className="btn-label"><i className="fa fa-plus"></i></span>Add
                                                            </button>
                                                        </span>
                                                    </div> */}
                                            </div>
                                        </section>
                                    </div>
                                    {
                                        //showChargeDropdown === true &&
                                        <>
                                            <div className="col-12 pt-2 pl-0 pb-2 row ml-1">
                                                <div className="col-md-5 pl-0 mt-1">
                                                    <div className="form-group">
                                                        <label htmlFor="chargeName" className="control-label">Search Charge Name</label>
                                                        <div className="input-group">
                                                            <select className="form-control" value={chargeName}
                                                                onChange={(e) => {
                                                                    setChargeName(e.target.value);
                                                                }}
                                                            >
                                                                <option value="">Select..</option>
                                                                {
                                                                    chargeNameLookup && chargeNameLookup.map((charge, key) => (
                                                                        <option key={key} value={charge.chargeId}>{charge.chargeName}</option>
                                                                    ))
                                                                }
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-5 pl-0">
                                                    <div className="form-group">
                                                        <label className="control-label">&nbsp;</label>
                                                        <button type="button" className="skel-btn-cancel mt-1" disabled={false}
                                                            onClick={() => {
                                                                setChargeData({
                                                                    ...chargeData,
                                                                    chargeName: '',
                                                                    chargeType: '',
                                                                    currency: '',
                                                                    chargeAmount: 0
                                                                })
                                                                setChargeName('')
                                                            }}
                                                        >
                                                            Clear
                                                        </button>
                                                        <button type="button" className="skel-btn-submit mt-1" disabled={false}
                                                            onClick={() => { handleChargeNameSearch() }}
                                                        >
                                                            Select
                                                        </button>

                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-12 pt-2 pl-0 pb-2 row ml-1">
                                                <div className="">
                                                    <div className="form-row col-12">
                                                        <div className="col-3">
                                                            <label htmlFor="chargeName">Charge Name<span className="required">*</span></label>
                                                            <input id="chargeName" value={chargeData.chargeName} className="form-control" type="text"
                                                                onChange={(e) => {
                                                                    // setError({ ...error, chargeName: '' })
                                                                    setChargeData({ ...chargeData, chargeName: e.target.value })
                                                                }}
                                                            />
                                                            <span className="errormsg">{chargeError.chargeName ? chargeError.chargeName : ""}</span>
                                                        </div>
                                                        <div className="col-3">
                                                            <label htmlFor="chargeType">Charge Type</label>
                                                            <select
                                                                className="form-control"
                                                                id="chargeType"
                                                                value={chargeData.chargeType}
                                                                onChange={(e) => setChargeData({ ...chargeData, chargeType: e.target.value })}
                                                            >
                                                                <option value="">Select..</option>
                                                                {chargeTypes.map((val, key) => (
                                                                    <option key={key} value={val.code}>{val.description}</option>
                                                                ))}
                                                            </select>
                                                            <span className="errormsg">{chargeError.chargeType ? chargeError.chargeType : ""}</span>
                                                        </div>
                                                        <div className="col-3">
                                                            <label htmlFor="currency">Currency</label>

                                                            <select
                                                                className="form-control"
                                                                id="currency"
                                                                value={chargeData.currency}
                                                                onChange={(e) => setChargeData({ ...chargeData, currency: e.target.value })}
                                                            >
                                                                <option value="">Select..</option>
                                                                {currencies.map((val, key) => (
                                                                    <option key={key} value={val.code}>{val.description}</option>
                                                                ))}
                                                            </select>
                                                            <span className="errormsg">{chargeError.currency ? chargeError.currency : ""}</span>
                                                        </div>
                                                        <div className="col-3">
                                                            <label htmlFor="chargeAmount">Charge Amount<span className="required">*</span></label>
                                                            <input type="number" id="chargeAmount" placeholder="Charge Amount" value={chargeData.chargeAmount}
                                                                className={`form-control ${chargeError.chargeAmount ? "error-border" : ""}`}
                                                                onChange={(e) => {
                                                                    // setError({ ...error, chargeAmount: '' })
                                                                    setChargeData({ ...chargeData, chargeAmount: e.target.value })
                                                                }}
                                                            />
                                                            <span className="errormsg">{chargeError.chargeAmount ? chargeError.chargeAmount : ""}</span>
                                                        </div>
                                                    </div>
                                                    <div className="form-row col-12 mt-3">

                                                        {/* <div className="col-4">
                                            <label htmlFor="frequency">Frequency<span className={`required ${templateData.isNRC ? "d-none" : ""}`}>*</span></label>
                                            <select id="frequency" value={chargeData.frequency} className={`form-control ${chargeError.frequency ? "error-border" : ""}`}
                                                onChange={(e) => {
                                                    // setError({ ...error, frequency: '' })
                                                    setChargeData({ ...chargeData, frequency: e.target.value, frequencyDesc: { description: e.target.options[e.target.selectedIndex].label } })
                                                }}
                                            >
                                                <option value="">Select Frequency</option>
                                                {
                                                    frequencyLookup && frequencyLookup.map((frequency) => (
                                                        <option value={frequency.code}>{frequency.description}</option>
                                                    ))
                                                }
                                            </select>
                                            <span className="errormsg">{chargeError.frequency ? chargeError.frequency : ""}</span>
                                        </div>
                                        <div className="col-4">
                                            <label htmlFor="prorated">Prorated<span className={`required ${templateData.isNRC ? "d-none" : ""}`}>*</span></label>
                                            <select id="prorated" className={`form-control ${chargeError.prorated ? "error-border" : ""}`}
                                                onChange={(e) => {
                                                    // setError({ ...error, prorated: '' })
                                                    setChargeData({ ...chargeData, prorated: e.target.value })
                                                }}
                                            >
                                                <option value="">Select Prorate</option>
                                                <option value='Y'>Yes</option>
                                                <option value='N'>No</option>
                                            </select>
                                            <span className="errormsg">{chargeError.prorated ? chargeError.prorated : ""}</span>
                                        </div> */}
                                                    </div>

                                                </div>
                                            </div>
                                        </>
                                    }
                                </>
                            }
                        </div>
                    </React.Fragment>
                )}
            </div>
            <div className="skel-pg-bot-sect-btn">
                <div className="col-md-12">
                    <div className="pt-1 pb-1">
                        <div className="text-center skel-btn-center-cmmn">
                            {formError && <span className="errormsg">{formError}</span>}
                            <button type="button" className="skel-btn-cancel" onClick={() => setShow(false)}>Back</button>
                            {mode !== "VIEW" && <button type="submit" className="skel-btn-submit">Submit</button>}
                        </div>
                    </div>
                </div>
            </div>
        </Form>
    )
}

export default TemplateForm


const columns = [
    {
        Header: "Date",
        accessor: "rosterDate",
        disableFilters: true,
        id: "Date"
    },
    {
        Header: "Start time",
        accessor: "rosterStartTime",
        disableFilters: true,
        id: "rosterStartTime"
    },
    {
        Header: "End time",
        accessor: "rosterEndTime",
        disableFilters: true,
        id: "rosterEndTime"
    },
    {
        Header: "Duration",
        accessor: "duration",
        disableFilters: true,
        id: "duration"
    },
    {
        Header: "Person",
        accessor: "userDetails.firstName",
        disableFilters: true,
        id: "availability"
    }
]