import React, { useEffect, useRef, useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import { get, put } from "../../common/util/restUtil";
import { properties } from '../../properties';
import moment from "moment";
import { ToastContainer, toast } from "react-toastify";
import DynamicForm from './CreateInteraction/DynamicForm';

const UpdateInteraction = (props) => {
    const [interactionDetails, setInteractionDetails] = useState();
    const [currStatusLookup, setCurrStatusLookup] = useState([]);
    const [roleLookup, setRoleLookup] = useState([]);
    const [formData, setFormData] = useState({});
    const [ticketSubmitted, setTicketSubmitted] = useState();
    const [values, setValues] = useState([])
    const formRef = useRef();
    const sigPad = useRef();
    useEffect(() => {
        get(`${properties.INTERACTION_API}/get-interaction-details/${props?.match?.params?.token}`).then((resp) => {
            if (resp?.data) {
                setInteractionDetails(resp.data);
                let statusArray = [];
                resp.data?.workflowDetails?.entities?.map((node) => {
                    node?.status?.map((st) => {
                        statusArray.push(st);
                    });
                });
                let statusLookup = [
                    ...new Map(
                        statusArray.map((item) => [item["code"], item])
                    ).values(),
                ];
                setCurrStatusLookup(statusLookup);
            }
        }).catch((error) => console.error(error))
    }, [])

    const capitalizeFirstLetter = (string) => {
        return string?.charAt(0)?.toUpperCase() + string?.slice(1);
    };

    const handleChange = (e) => {
        const { id, value, options, selectedIndex } = e.target;
        if (id === "currStatus") {
            setRoleLookup([]);
            let entity = [];
            interactionDetails?.workflowDetails?.entities.map((unit) => {
                for (const property in unit.status) {
                    if (unit.status[property].code === value) {
                        entity.push(unit);
                        break;
                    }
                }
            });
            formData["assignRole"] = undefined;
            formData["assignDept"] = undefined;
            setTimeout(() => {
                setRoleLookup(entity);
            }, 500);
        } else if (id === "assignRole") {
            const { unitId = "" } = value !== "" && JSON.parse(options[selectedIndex].dataset.entity);
            formData["assignDept"] = unitId;
        }
        formData[id] = value;
        setFormData({ ...formData });
    }

    const checkTicketDetails = () => {
        if (!formData?.currStatus) {
            toast.error("Please select interaction status");
            return false;
        }

        if (!formData?.assignRole) {
            toast.error("Please select target role");
            return false;
        }

        if (formData?.currStatus == "REJECT" && !formData?.remarks?.trim()) {
            toast.error("Comment required on rejection");
            return false;
        }

        return true;
    };

    const submitTicket = () => {
        if (checkTicketDetails()) {
            let reqBody = {
                roleId: Number(formData?.assignRole),
                departmentId: formData?.assignDept,
                status: formData?.currStatus,
            };
            if (formData?.user) {
                reqBody.userId = Number(formData?.user);
            }
            if (formData?.remarks) {
                reqBody.remarks = formData?.remarks;
            }

            console.log(reqBody);

            put(properties.INTERACTION_API + "/update-via-notify-medium/" + interactionDetails.intxnNo, reqBody).then((response) => {
                setTicketSubmitted(response);
            }).catch((error) => {
                toast.error(error);
            });
        }
    }

    return (
        <div className="d-flex justify-content-center">
            <ToastContainer />
            <Card className="text-center">
                {!interactionDetails ? (
                    <React.Fragment>
                        <Card.Header><span style={{ color: 'white', fontSize: '26px' }}>Oops!</span></Card.Header>
                        <Card.Body>
                            <Card.Text>Ticket details not found.</Card.Text>
                        </Card.Body>
                    </React.Fragment>
                ) : ticketSubmitted ? (
                    <React.Fragment>
                        <Card.Header><span style={{ color: 'white', fontSize: '26px' }}>{ticketSubmitted?.status == 200 ? 'Ticket Submitted!' : 'Error in ticket Submission!'}</span></Card.Header>
                        <Card.Body>
                            <Card.Text>{ticketSubmitted?.message}</Card.Text>
                        </Card.Body>
                    </React.Fragment>
                ) : (
                    <React.Fragment>
                        <Card.Header><span style={{ color: 'white', fontSize: '26px' }}>Interaction Details</span></Card.Header>
                        <Card.Body>
                            <Card.Title><strong>{interactionDetails?.requestStatement}</strong></Card.Title>
                            <Card.Text>
                                <div className='mb-2'>
                                    <span><strong>Requested by:&nbsp;</strong>{capitalizeFirstLetter(interactionDetails?.customerDetails?.firstName)} {capitalizeFirstLetter(interactionDetails?.customerDetails?.lastName ?? '')}</span><br />
                                    <span><strong>Requested on:&nbsp;</strong>{moment(interactionDetails?.createdAt).format("DD-MMM-YYYY")}</span><br />
                                </div>
                                <div className='mb-2'>
                                    <DynamicForm
                                        data={{
                                            formAttributes: interactionDetails?.statementDetails?.metaAttributes || [],
                                            formRef,
                                            isFormDisabled: true,
                                            sigPad,
                                            isButtonHide: true,
                                            formDetails: interactionDetails?.formDetails || {},
                                            values
                                        }}
                                        handlers={{
                                            handleFormSubmit: () => { },
                                            handleFormOnChange: () => { },
                                            setValues
                                        }}
                                    />
                                </div>
                                <div>
                                    <div className="form-group">
                                        <label for="currStatus" className="control-label">Status&nbsp;<span>*</span></label>
                                        <select id="currStatus" value={formData?.currStatus} onChange={handleChange} className={`form-control`}>
                                            <option key="status" value="">Select...</option>
                                            {currStatusLookup?.map((currStatus, index) => (
                                                <option key={index} value={currStatus?.code}>
                                                    {currStatus?.description}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label for="assignRole" className="control-label">Deparment/Role&nbsp;<span>*</span></label>
                                        <select id="assignRole" value={formData?.assignRole} onChange={handleChange} className={`form-control`}>
                                            <option key="role" value="" data-entity="">
                                                Select Role
                                            </option>
                                            {roleLookup.map((dept, key) => (
                                                <optgroup key={key} label={dept?.entity[0]?.unitDesc}>
                                                    {!!dept.roles.length && dept.roles.map((data, childKey) => (
                                                        <option key={childKey} value={data.roleId} data-entity={JSON.stringify(dept.entity[0])}>
                                                            {data.roleDesc}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="remarks" className="col-form-label">Comments</label>
                                        <textarea className='form-control' id="remarks" value={formData?.remarks} onChange={handleChange}></textarea>
                                    </div>
                                </div>
                            </Card.Text>
                            <Button variant="primary skel-n-status" onClick={submitTicket}>Submit</Button>
                        </Card.Body>
                        <Card.Footer className="text-muted">Requested on - {moment(interactionDetails?.createdAt).fromNow()}</Card.Footer>
                    </React.Fragment>
                )}
            </Card>
        </div>
    )
}

export default UpdateInteraction;