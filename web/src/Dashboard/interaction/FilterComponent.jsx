import React, { useEffect, useContext, useState, useRef } from "react";
import { Form, Dropdown } from 'react-bootstrap';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { useForm, Controller } from "react-hook-form";
import ReactSelect from "react-select";
import moment from 'moment';
import { AppContext, InteractionDashboardContext } from "../../AppContext";

const FilterComponent = (props) => {
    const { data, handlers } = useContext(InteractionDashboardContext);
    const { setSearchParams } = handlers
    const { auth } = useContext(AppContext)
    const [showFilter, setShowFilter] = useState(false);
    const { masterLookupData } = data
    const formRef = useRef();

    const { handleSubmit, control, setValue, formState: { errors }, reset } = useForm();
    const [entityType, setEntityType] = useState()

    const serviceCategories = masterLookupData?.PRODUCT_FAMILY?.map(elm => ({ label: elm.description, value: elm.code }));
    const serviceTypes = masterLookupData?.SERVICE_TYPE?.map(elm => ({ label: elm.description, value: elm.code }));
    const interactionCategories = masterLookupData?.INTXN_CATEGORY?.map(elm => ({ label: elm.description, value: elm.code }));
    const interactionTypes = masterLookupData?.INTXN_TYPE?.map(elm => ({ label: elm.description, value: elm.code }));
    const orderCategories = masterLookupData?.ORDER_CATEGORY?.map(elm => ({ label: elm.description, value: elm.code }));
    const orderTypes = masterLookupData?.ORDER_TYPE?.map(elm => ({ label: elm.description, value: elm.code }));


    const entityTypes = [{
        label: "All",
        value: "all"
    }, {
        label: "Interaction",
        value: "Interaction"
    }, {
        label: "order",
        value: "order"
    }]

    teamMembers = teamMembers?.map(elm => ({ label: elm.email, value: elm.userId }));

    let statusList = []
    if (componentName === "INTERACTIONS") {
        statusList = masterLookupData?.INTERACTION_STATUS;
    } else if (componentName === "ORDERS") {
        statusList = masterLookupData?.ORDER_STATUS;
    }
    const statuses = statusList?.map(elm => ({ label: elm.description, value: elm.code }));

    useEffect(() => {
        if (!filtering) setShowFilter(false);
    }, [filtering])

    const onSubmit = (data) => {
        let payload = {
            ...searchParams,
            userId: auth?.user?.userId,
            roleId: auth?.currRoleId,
            status: data.status,
            serviceCat: data.serviceCat,
            serviceType: data.serviceType,
            intxnCat: data.intxnCat,
            intxnType: data.intxnType,
            orderCat: data?.orderCat,
            orderType: data?.orderType,
            entityType: data?.entityType || 'all',
            teamMemberId: (meOrMyTeam === "MyTeam" && data.teamMemberId) ? data.teamMemberId : undefined
        }
        if (data.dateRange && data.dateRange?.length) {
            data.dateRange[1] = data.dateRange?.[1] ? data.dateRange?.[1] : data.dateRange?.[0]
            payload = {
                ...payload,
                fromDate: moment(data.dateRange?.[0]).format("YYYY-MM-DD"),
                toDate: moment(data.dateRange?.[1]).format("YYYY-MM-DD")
            }
        }
        setSearchParams({
            ...searchParams,
            ...payload
        });
        setTimeout(() => {
            console.log({ payload });
            setFiltering(true);
        }, 100);
    }

    const handleClear = (event) => {
        event.preventDefault();
        reset()
        setSearchParams({
            userId: auth?.user?.userId,
            roleId: auth?.currRoleId
        })
        setTimeout(() => {
            setFiltering(true);
        }, 100);
        setShowFilter(!showFilter)
    }

    const showFilterVisible = () => setShowFilter(!showFilter)

    return (
        <Dropdown className="skel-filter-dropdown" autoClose={false} show={showFilter} onToggle={showFilterVisible}>
            <Dropdown.Toggle variant="success" onClick={showFilterVisible}>
                <FilterAltIcon className="mat-filter" />
            </Dropdown.Toggle>
            <Dropdown.Menu className="skel-ul-data-filter">
                <Dropdown.Item>
                    <Form className="mt-1 filter-form" ref={formRef} onSubmit={handleSubmit(onSubmit)}>
                        {["SELF", "APPOINTMENTS"].includes(componentName) && (
                            <React.Fragment>
                                <div className="form-group">
                                    <label htmlFor="apptname" className="filter-form-label control-label">Entity Type</label>
                                    <Controller
                                        control={control}
                                        name="entityType"
                                        render={({ field: { onChange, onBlur, value, ref } }) => (
                                            <ReactSelect
                                                inputRef={ref}
                                                className="w-100"
                                                options={entityTypes}

                                                menuPortalTarget={document.body}
                                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}

                                                // isMulti={true}
                                                value={value ? entityTypes.find(c => c.value === value) : null}
                                                onChange={(val) => {
                                                    if (val.value === "order") {
                                                        setValue('intxnCat', null)
                                                        setValue('intxnType', null)
                                                    } else if (val.value === "Interaction") {
                                                        setValue('orderCat', null)
                                                        setValue('orderType', null)
                                                    }
                                                    setEntityType(val.value)
                                                    onChange(val.value)
                                                }}
                                            />
                                        )}
                                    />
                                </div>
                            </React.Fragment>
                        )}
                        {(["INTERACTIONS"].includes(componentName) || (componentName === 'SELF' && entityType === 'Interaction')) && (
                            <React.Fragment>
                                <div className="form-group">
                                    <label htmlFor="apptname" className="filter-form-label control-label">Interaction Category</label>
                                    <Controller
                                        control={control}
                                        name="intxnCat"
                                        render={({ field: { onChange, onBlur, value, ref } }) => (
                                            <ReactSelect
                                                inputRef={ref}
                                                className="w-100"

                                                menuPortalTarget={document.body}
                                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}

                                                options={interactionCategories}
                                                isMulti={true}
                                                value={value ? interactionCategories.find(c => c.value === value) : null}
                                                onChange={val => onChange(val)}
                                            />
                                        )}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="apptname" className="filter-form-label control-label">Interaction Type</label>
                                    <Controller
                                        control={control}
                                        name="intxnType"
                                        render={({ field: { onChange, onBlur, value, ref } }) => (
                                            <ReactSelect
                                                inputRef={ref}
                                                className="w-100"

                                                menuPortalTarget={document.body}
                                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}

                                                options={interactionTypes}
                                                isMulti={true}
                                                value={value ? interactionTypes.find(c => c.value === value) : null}
                                                onChange={val => onChange(val)}
                                            />
                                        )}
                                    />
                                </div>
                            </React.Fragment>
                        )}
                        {(["ORDERS"].includes(componentName) || (componentName === 'SELF' && entityType === 'order')) && (
                            <React.Fragment>
                                <div className="form-group">
                                    <label htmlFor="apptname" className="filter-form-label control-label">Order Category</label>
                                    <Controller
                                        control={control}
                                        name="orderCat"
                                        render={({ field: { onChange, onBlur, value, ref } }) => (
                                            <ReactSelect
                                                inputRef={ref}
                                                className="w-100"

                                                menuPortalTarget={document.body}
                                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}

                                                options={orderCategories}
                                                isMulti={true}
                                                value={value ? orderCategories.find(c => c.value === value) : null}
                                                onChange={val => onChange(val)}
                                            />
                                        )}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="apptname" className="filter-form-label control-label">Order Type</label>
                                    <Controller
                                        control={control}
                                        name="orderType"
                                        render={({ field: { onChange, onBlur, value, ref } }) => (
                                            <ReactSelect
                                                inputRef={ref}
                                                className="w-100"

                                                menuPortalTarget={document.body}
                                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}

                                                options={orderTypes}
                                                isMulti={true}
                                                value={value ? orderTypes.find(c => c.value === value) : null}
                                                onChange={val => onChange(val)}
                                            />
                                        )}
                                    />
                                </div>
                            </React.Fragment>
                        )}
                        {["INTERACTIONS", "ORDERS"].includes(componentName) && (<div className="form-group">
                            <label htmlFor="apptname" className="filter-form-label control-label">Status</label>
                            <Controller
                                control={control}
                                name="status"
                                render={({ field: { onChange, onBlur, value, ref } }) => (
                                    <ReactSelect
                                        inputRef={ref}
                                        className="w-100"

                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}

                                        options={statuses}
                                        isMulti={true}
                                        value={value ? statuses.find(c => c.value === value) : null}
                                        onChange={val => onChange(val)}
                                    />
                                )}
                            />
                        </div>
                        )}
                        <div className="form-group skel-filter-frm-btn">
                            <button className="skel-btn-cancel" /* onClick={() => setShowFilter(!showFilter)}*/ onClick={handleClear}>
                                Clear
                            </button>
                            <button className="skel-btn-submit" onClick={() => { formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })) }}>
                                {filtering ? 'Filtering...' : 'Filter'}
                            </button>
                        </div>
                    </Form>
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    )
}

export default FilterComponent;