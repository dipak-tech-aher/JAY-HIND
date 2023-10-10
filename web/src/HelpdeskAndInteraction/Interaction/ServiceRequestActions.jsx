import React, { useContext } from 'react';
import { AppContext } from "../../AppContext";

const ServiceRequestActions = (props) => {
    const { row , wait, permissions} = props.data;
    const { setIsResolveOpen, setIsPreviewOpen, setResolveData, setServiceRequestData,handleOnAssignToSelf, setIsReAssignOpen, setIsFollowupOpen } = props.handlers;
    const { auth } = useContext(AppContext);
    const handleOnViewClick = () => {
        setServiceRequestData({
            interactionId: row?.intxnId,
            customerId: row?.customerId,
            serviceId: row?.serviceId,
            accountId: row?.accountId,
            interactionType: row?.intxnType,
            status: row?.currStatus,
            externalRefSys1: row?.externalRefSys1,
            externalRefNo1: row?.externalRefNo1,
            woTypeDesc: row?.woTypeDescription,
            intxnTypeDesc: row?.intxnTypeDesc,
            accessNumber: row?.accessNbr,
            serviceType: row?.serviceTypeDesc,
            createdOn: row?.createdAt,
            createdBy: row?.createdBy
        })
        setIsPreviewOpen(true);
    }
    return (
        <div className="d-flex justify-content-center">
            {
                ((row.currStatus === "FAILED" || row.currStatus === "MANUAL" || row.currStatus === "Failed") && (row.intxnType === 'REQSR' || (row.intxnType === 'REQCOMP' && row.woType === "FAULT"))) ?
                    <div className="btn-group">
                        {
                            (row.intxnType === 'REQSR' || (row.intxnType === 'REQCOMP' && row.woType === "FAULT" && row.currUser === auth.user.userId && row.currRole === auth.currRoleId && row.currEntity === auth.currDeptId)) &&
                            <button type="button" className="btn btn-sm btn-primary p-1" onClick={() => { setIsResolveOpen(true); setResolveData(row); }}>Resolve</button>
                        }
                        {
                            row.intxnType === 'REQSR' &&
                            <>
                                <button type="button" className="btn btn-sm btn-primary p-1 dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <i className="mdi mdi-chevron-down"></i>
                                </button>
                                <div className="dropdown-menu dropdown-menu-right">
                                    <button
                                        className="dropdown-item text-primary"
                                        onClick={handleOnViewClick}>
                                        <i className="mdi mdi-eye  ml-0 mr-2 font-10 vertical-middle" />
                                        View
                                    </button>
                                </div>
                            </>
                        }

                    </div>
                    :
                    row.intxnType === 'REQSR' ? (
                        <>
                            <button type="button" className={`btn btn-labeled btn-primary btn-sm mr-1 ml-1 ${!permissions?.assignToSlef && 'd-none'}`} onClick={handleOnAssignToSelf} >
                                Assign to Self
                            </button>
                            {/* <button type="button" className={`btn btn-outline-primary waves-effect waves-light btn-sm mr-1 ${(!(permissions?.reAssign) || wait) && 'd-none'}`} onClick={() => setIsReAssignOpen(true)}>
                                Re-Assign
                            </button>
                            <button type="button" className={`btn btn-labeled btn-primary btn-sm  ${(!permissions?.followup) && 'd-none'}`} onClick={() => setIsFollowupOpen(true)}>
                                <small>Add Followup</small>
                            </button> */}
                            <button
                                type="button"
                                className="btn btn-outline-primary waves-effect waves-light btn-sm"
                                onClick={handleOnViewClick}>
                                <small>View</small>
                            </button>
                        </>
                    )
                        :
                        <></>
            }
        </div >
    )
}

export default ServiceRequestActions;