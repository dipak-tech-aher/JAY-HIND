import React, { useEffect, useState, useRef, useContext } from 'react';
import { properties } from "../../properties";
import { get, post } from "../../common/util/restUtil";
import { Controller, useForm } from "react-hook-form";
import { DateRangePicker } from 'rsuite';
import { Form } from 'react-bootstrap';
import moment from "moment";
import ReactSelect from "react-select";
import { toast } from "react-toastify";
import { unstable_batchedUpdates } from 'react-dom';

const Filter = (props) => {
    const { data, handler } = props;
    const { showFilter, searchParams } = data;
    const { setShowFilter, setSearchParams } = handler;
    const { handleSubmit, control, reset } = useForm();
    const formRef = useRef();
    const [submitError, setSubmitError] = useState(null);
    const [projects, setProjects] = useState([])
    const [interactionStatus, setInteractionStatus] = useState([])
    const [interactionPriorities, setInteractionPriorities] = useState([])
    const [interactionCategories, setInteractionCategories] = useState([])
    const [interactionTypes, setInteractionTypes] = useState([])
    const [serviceTypes, setServiceTypes] = useState([])
    const [serviceCat, setServiceCat] = useState([])
    const [channel, setChannel] = useState([])
    const [user, setUser] = useState([])

    const handleClear = (event) => {
        event.preventDefault();
        reset();
        setSearchParams({
            dateRange: undefined,
            project: undefined,
            intxnCat: undefined,
            intxnType: undefined,
            serviceCat: undefined,
            serviceType: undefined,
            status: undefined,
            priority: undefined,
            userId: undefined,
            channel: undefined
        });
        setTimeout(() => {
            setShowFilter(false);
        });
    }

    useEffect(() => {
        get(properties.USER_API + '/get-managerlist')
            .then((response) => {
                const { data } = response;
                setUser(data?.map((ele) => {
                    return {
                        label: `${ele?.firstName} ${ele?.lastName}`,
                        value: ele?.userId
                    }
                }));
            })
            .catch(error => {
                console.error(error);
            });

        get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam=PROJECT,INTERACTION_STATUS,PRIORITY,SEVERITY,INTXN_CATEGORY,INTXN_TYPE,PROD_SUB_TYPE,SERVICE_TYPE,TICKET_CHANNEL')
            .then((response) => {
                const { data } = response;
                setProjects(data?.PROJECT?.map((ele) => {
                    return {
                        label: ele?.description,
                        value: ele?.code
                    }
                }));
                setInteractionStatus(data?.INTERACTION_STATUS?.map((ele) => {
                    return {
                        label: ele?.description,
                        value: ele?.code
                    }
                }));
                setInteractionPriorities(data?.PRIORITY?.map((ele) => {
                    return {
                        label: ele?.description,
                        value: ele?.code
                    }
                }));
                setInteractionCategories(data?.INTXN_CATEGORY?.map((ele) => {
                    return {
                        label: ele?.description,
                        value: ele?.code
                    }
                }));
                setInteractionTypes(data?.INTXN_TYPE?.map((ele) => {
                    return {
                        label: ele?.description,
                        value: ele?.code
                    }
                }));
                setServiceTypes(data?.SERVICE_TYPE?.map((ele) => {
                    return {
                        label: ele?.description,
                        value: ele?.code
                    }
                }));
                setServiceCat(data?.PROD_SUB_TYPE?.map((ele) => {
                    return {
                        label: ele?.description,
                        value: ele?.code
                    }
                }));
                setChannel(data?.TICKET_CHANNEL?.map((ele) => {
                    return {
                        label: ele?.description,
                        value: ele?.code
                    }
                }));

            })
            .catch(error => {
                console.error(error);
            });
    }, []);

    const onSubmit = (data) => {
        console.log('data--------->', data);
        setSubmitError(null);
        const noFilterSelected = !data?.dateRange?.length && !data.project &&
            !data.intxnCat &&
            !data.intxnType &&
            !data.serviceCat &&
            !data.serviceType &&
            !data.status &&
            !data.priority &&
            !data.userId &&
            !data.channel

        if (noFilterSelected) {
            setSubmitError("Please apply atleast one filter"); return;
        }

        if (data?.dateRange?.length) {
            data.dateRange[1] = data.dateRange?.[1] ? data.dateRange?.[1] : data.dateRange?.[0]
            data['fromDate'] = moment(data.dateRange?.[0]).format("YYYY-MM-DD");
            data['toDate'] = moment(data.dateRange?.[1]).format("YYYY-MM-DD")
        }

        if (data?.userId) {
            data.userId = data?.userId?.value
        }

        setSearchParams({
            ...data
        });
    }

    return (
        <div className="skel-filter-int" id="searchBlock1" style={{ display: showFilter ? 'block' : 'none' }}>
            <Form className="mt-1 filter-form" ref={formRef} onSubmit={handleSubmit(onSubmit)}>
                <div className="row mt-3 skel-filter-static">
                    <div className="col-md-12">
                        <div className="form-group">
                            <label htmlFor="apptname" className="filter-form-label control-label">Date Range</label>
                            <Controller
                                control={control}
                                name="dateRange"
                                render={({ field: { onChange, onBlur, value, ref } }) => (
                                    <DateRangePicker
                                        format="dd-MM-yyyy"
                                        character={' to '}
                                        value={value ? value : []}
                                        onChange={onChange}
                                        placeholder="Select Date Range"
                                        className="z-idx w-100"
                                        placement='bottomEnd'
                                        preventOverflow
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <div className="col-md-12">
                        <div className="form-group">
                            <label htmlFor="idType" className="control-label"> By Projects </label>
                            <Controller
                                control={control}
                                name="project"
                                render={({ field: { onChange, onBlur, value, ref } }) => (
                                    <ReactSelect
                                        inputRef={ref}

                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}

                                        className="w-100"
                                        options={projects}
                                        isMulti={true}
                                        value={value ? projects.find(c => c.value === value) : null}
                                        onChange={val => onChange(val)}
                                    />
                                )}
                            />
                            <span className="errormsg" />
                        </div>
                    </div>

                    <div className="col-md-12">
                        <div className="form-group">
                            <label htmlFor="idType" className="control-label"> By Status </label>
                            <Controller
                                control={control}
                                name="status"
                                render={({ field: { onChange, onBlur, value, ref } }) => (
                                    <ReactSelect
                                        inputRef={ref}

                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}

                                        className="w-100"
                                        options={interactionStatus}
                                        isMulti={true}
                                        value={value ? interactionStatus.find(c => c.value === value) : null}
                                        onChange={val => onChange(val)}
                                    />
                                )}
                            />
                            <span className="errormsg" />
                        </div>
                    </div>

                    <div className="col-md-12">
                        <div className="form-group">
                            <label htmlFor="idType" className="control-label"> By Channel </label>
                            <Controller
                                control={control}
                                name="channel"
                                render={({ field: { onChange, onBlur, value, ref } }) => (
                                    <ReactSelect
                                        inputRef={ref}

                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}

                                        className="w-100"
                                        options={channel}
                                        isMulti={true}
                                        value={value ? channel.find(c => c.value === value) : null}
                                        onChange={val => onChange(val)}
                                    />
                                )}
                            />
                            <span className="errormsg" />
                        </div>
                    </div>

                    <div className="col-md-12">
                        <div className="form-group">
                            <label htmlFor="idType" className="control-label"> By Priority </label>
                            <Controller
                                control={control}
                                name="priority"
                                render={({ field: { onChange, onBlur, value, ref } }) => (
                                    <ReactSelect
                                        inputRef={ref}

                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}

                                        className="w-100"
                                        options={interactionPriorities}
                                        isMulti={true}
                                        value={value ? interactionPriorities.find(c => c.value === value) : null}
                                        onChange={val => onChange(val)}
                                    />
                                )}
                            />
                            <span className="errormsg" />
                        </div>
                    </div>

                    <div className="col-md-12">
                        <div className="form-group">
                            <label htmlFor="idType" className="control-label"> By User </label>
                            <Controller
                                control={control}
                                name="userId"
                                render={({ field: { onChange, onBlur, value, ref } }) => (
                                    <ReactSelect
                                        inputRef={ref}

                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}

                                        className="w-100"
                                        options={user}
                                        isMulti={false}
                                        value={value ? user.find(c => c.value === value) : null}
                                        onChange={val => onChange(val)}
                                    />
                                )}
                            />
                            <span className="errormsg" />
                        </div>
                    </div>

                    <div className="col-md-12">
                        <div className="form-group">
                            <label htmlFor="idType" className="control-label"> By Interaction Category </label>
                            <Controller
                                control={control}
                                name="intxnCat"
                                render={({ field: { onChange, onBlur, value, ref } }) => (
                                    <ReactSelect
                                        inputRef={ref}

                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}

                                        className="w-100"
                                        options={interactionCategories}
                                        isMulti={true}
                                        value={value ? interactionCategories.find(c => c.value === value) : null}
                                        onChange={val => onChange(val)}
                                    />
                                )}
                            />
                            <span className="errormsg" />
                        </div>
                    </div>
                    <div className="col-md-12">
                        <div className="form-group">
                            <label htmlFor="idType" className="control-label"> By Interaction Type </label>
                            <Controller
                                control={control}
                                name="intxnType"
                                render={({ field: { onChange, onBlur, value, ref } }) => (
                                    <ReactSelect
                                        inputRef={ref}

                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}

                                        className="w-100"
                                        options={interactionTypes}
                                        isMulti={true}
                                        value={value ? interactionTypes.find(c => c.value === value) : null}
                                        onChange={val => onChange(val)}
                                    />
                                )}
                            />
                            <span className="errormsg" />
                        </div>
                    </div>

                    <div className="col-md-12">
                        <div className="form-group">
                            <label htmlFor="idType" className="control-label"> By Service Category </label>
                            <Controller
                                control={control}
                                name="serviceCat"
                                render={({ field: { onChange, onBlur, value, ref } }) => (
                                    <ReactSelect
                                        inputRef={ref}

                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}

                                        className="w-100"
                                        options={serviceCat}
                                        isMulti={true}
                                        value={value ? serviceCat.find(c => c.value === value) : null}
                                        onChange={val => onChange(val)}
                                    />
                                )}
                            />
                            <span className="errormsg" />
                        </div>
                    </div>
                    <div className="col-md-12">
                        <div className="form-group">
                            <label htmlFor="idType" className="control-label"> By Service Type </label>
                            <Controller
                                control={control}
                                name="serviceType"
                                render={({ field: { onChange, onBlur, value, ref } }) => (
                                    <ReactSelect
                                        inputRef={ref}

                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}

                                        className="w-100"
                                        options={serviceTypes}
                                        isMulti={true}
                                        value={value ? serviceTypes.find(c => c.value === value) : null}
                                        onChange={val => onChange(val)}
                                    />
                                )}
                            />
                            <span className="errormsg" />
                        </div>
                    </div>

                </div>
                <hr className="cmmn-hline" />
                {submitError && <span className="errormsg">{submitError}</span>}
                <div className="form-group skel-filter-frm-btn">
                    <button className="skel-btn-cancel" onClick={(e) => handleClear(e)}>
                        Clear
                    </button>
                    <button className="skel-btn-submit" onClick={() => {
                        formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                        setTimeout(() => {
                            setShowFilter(false);
                        });
                    }}>
                        Filter
                    </button>
                </div>
            </Form>
        </div>
    );
};

export default Filter;