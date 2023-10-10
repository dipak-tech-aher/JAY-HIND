import React, { useState } from 'react';
import Modal from 'react-modal';
import AdjustmentForm from './AdjustmentForm';
import moment from 'moment';
import { string, object } from "yup";
import { EditContractDetailsModalHiddenColumns, EditContractModalHiddenColumns, ViewContractColumnList, ViewContractDetailsModalHiddenColumns, ViewContractModalHiddenColumns, ViewEditContractDetailsHiddenColumns } from './BillingTabs/ViewContract/ViewContractColumnList';
import ViewEditContractTable from './ViewEditContractTable';
import { properties } from '../../properties';
import AddContractDetailsForm from './AddContractDetailsForm';
import { RegularModalCustomStyles } from '../../common/util/util';

const ViewEditContractModal = (props) => {

    const { isViewEditContractOpen, isEdit, contractList } = props.data;

    const { setIsViewEditContractOpen, pageRefresh } = props.handler;


    const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);
    const [showAddContractDetailsForm, setShowAddContractDetailsForm] = useState(false);
    const initialState = {
        billRefNo: contractList[0]?.billRefNo,
        adjustmentCat: "PREBILL",
        allocationLevel: "",
        adjustmentType: "",
        reason: "",
        maxAdjAmount: 50,
        adjAmount: "",
        remarks: "",
    }
    const AdjustmentValidationSchema = object().shape({
        adjustmentType: string().required("Adjustment Type is required"),
        allocationLevel: string().required("Service Allocation is required"),
        reason: string().required("Reason is required")
    });
    const [adjustmentInputs, setAdjustmentInputs] = useState(initialState);
    const [adjustmentInputsErrors, setAdjustmentInputsErrors] = useState({});
    const validate = (schema, data) => {
        try {
            setAdjustmentInputsErrors({});
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                setAdjustmentInputsErrors((prevState) => {
                    return { ...prevState, [err.params.path]: err.message };
                });
            });
            return e;
        }
    };
    const handleOnSubmit = () => {
        if (validate(AdjustmentValidationSchema, adjustmentInputs)) {
            return;
        }
        let body = {
            ...adjustmentInputs,
            contractId: [contractList[0]?.contractId],
            contractDetId: []
        }
        // 
        // post(properties.ADJUSTMENT_API,body)
        // .then((resp) => {
        //     if(resp.status === 200)
        //     {
        //         toast.success("Adjustment added successfully")
        //         //setIsOpen(false)
        //         //pageRefresh()
        //     }
        // })
        // .catch((error) => {
        //     console.log("error",error)
        // })
        // .finally()
    }

    const handleOnClear = () => {
        setAdjustmentInputs(initialState)
    }

    const handleContractCellRender = (cell, row) => {
        if (['Product Start Date', 'Product End Date'].includes(cell.column.Header)) {
            return (<span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : ''}</span>)
        }
        else if (['Action', 'Detail'].includes(cell.column.Header) && isEdit) {
            return (
                <button type="button" className="btn btn-labeled btn-primary btn-sm ml-1" onClick={() => handleOnEditContractORDetails(row.original)}>
                    <i className="mdi mdi-file-document-edit-outline font10 mr-1" />
                    <small>Edit</small>
                </button>
            )
        }
        else {
            return (<span>{cell.value}</span>)
        }
    }

    const handleOnEditContractORDetails = () => {

    }

    return (
        <Modal isOpen={isViewEditContractOpen} contentLabel="Worflow History Modal" style={RegularModalCustomStyles}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title">View Unbilled Contract</h4>
                        {
                            isEdit &&
                            <div className="adjus-button mr-5">
                                <button type="button" className="btn btn-primary btn-sm waves-effect waves-light ml-2" onClick={() => setShowAdjustmentForm(!showAdjustmentForm)} >
                                    {showAdjustmentForm ? 'Back' : 'Adjustment'}
                                </button>
                            </div>
                        }
                        <button type="button" className="close" onClick={() => setIsViewEditContractOpen(false)}>×</button>
                    </div>
                    <div className="modal-body">
                        {
                            isEdit && showAdjustmentForm &&
                            <div className="p-2">
                                <fieldset className="scheduler-border" id="prebill">
                                    <AdjustmentForm
                                        data={{
                                            adjustmentInputs: adjustmentInputs,
                                            adjustmentInputsErrors: adjustmentInputsErrors
                                        }}
                                        handler={{
                                            pageRefresh,
                                            setAdjustmentInputsErrors: setAdjustmentInputsErrors,
                                            setAdjustmentInputs: setAdjustmentInputs
                                        }}
                                    />
                                    <div className="flex-row pre-bill-sec">
                                        <div className="col-12 p-1">
                                            <div id="customer-buttons" className="d-flex justify-content-center">
                                                <button type="button" className="btn btn-primary btn-sm waves-effect waves-light ml-2" onClick={handleOnSubmit}>Submit</button>
                                                <button type="button" className="btn btn-primary btn-sm waves-effect waves-light ml-2" onClick={handleOnClear}>Clear</button>
                                            </div>
                                        </div>
                                    </div>
                                </fieldset>
                            </div>

                        }
                        <div className="row">
                            <section className="triangle col-12 pb-2 px-2">
                                <div className="row">
                                    <div className="col-12">
                                        <h4 id="list-item-0" className="pl-1 m-0">Contract</h4>
                                    </div>
                                </div>
                            </section>
                            <div className="card col-md-12 p-0">
                                <div className="card-box m-0">
                                    {/*
                                        !!contractList.length &&
                                        <DynamicTable
                                            row={contractList}
                                            header={ViewContractColumnList}
                                            hiddenColumns={isEdit ? EditContractModalHiddenColumns : ViewContractModalHiddenColumns}
                                            itemsPerPage={10}
                                            exportBtn={false}
                                            handler={{
                                                handleCellRender: handleContractCellRender
                                            }}
                                        />
                                        */}
                                    <ViewEditContractTable
                                        data={{
                                            tableList: contractList,
                                            headersToRemove: isEdit ? EditContractModalHiddenColumns : ViewContractModalHiddenColumns,
                                            editingFieldsIndexes: [4],
                                            isEdit,
                                            endPointURL: `${properties.CONTRACT_API}/monthly`,
                                            entityKey: 'monthlyContractId',
                                            scrollViewName: 'entity'
                                        }}
                                        handler={{
                                            pageRefresh
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="row mt-3">
                            <section className="triangle col-12 pb-2 px-2">
                                <div className="row align-items-center">
                                    <div className="col mx-auto">
                                        <h4 id="list-item-0" className="pl-1 m-0">Contract Details</h4>
                                    </div>
                                    {
                                        isEdit &&
                                        <div className="col-auto mx-auto">
                                            <button type="button" className="btn btn-primary btn-sm waves-effect waves-light ml-2" onClick={() => setShowAddContractDetailsForm(!showAddContractDetailsForm)} >
                                                {showAddContractDetailsForm ? 'Cancel' : 'Add'}
                                            </button>
                                        </div>
                                    }
                                </div>
                            </section>
                            <div className="card col-md-12 p-0">
                                <div className="card-box m-0">
                                    {
                                        showAddContractDetailsForm &&
                                        <AddContractDetailsForm />
                                    }
                                    {
                                        !!contractList.length && contractList[0].monthlyContractDtl?.length ?
                                            // <DynamicTable
                                            //     row={contractList[0].monthlyContractDtl}
                                            //     header={ViewContractColumnList}
                                            //     hiddenColumns={isEdit ? EditContractDetailsModalHiddenColumns : ViewContractDetailsModalHiddenColumns}
                                            //     itemsPerPage={10}
                                            //     exportBtn={false}
                                            //     handler={{
                                            //         handleCellRender: handleContractCellRender
                                            //     }}
                                            // />
                                            <ViewEditContractTable
                                                data={{
                                                    tableList: contractList[0].monthlyContractDtl,
                                                    headersToRemove: isEdit ? EditContractDetailsModalHiddenColumns : ViewContractDetailsModalHiddenColumns,
                                                    editingFieldsIndexes: [3],
                                                    isEdit,
                                                    endPointURL: `${properties.CONTRACT_API}/detail/monthly`,
                                                    entityKey: 'monthlyContractDtlId',
                                                    scrollViewName: 'detail'
                                                }}
                                                handler={{
                                                    pageRefresh
                                                }}
                                            />
                                            :
                                            <p class="skel-widget-warning">No records found!!!</p>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default ViewEditContractModal;