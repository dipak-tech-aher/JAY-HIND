import { useState } from "react";
import { object, string } from 'yup';
import { toast } from 'react-toastify';
import { unstable_batchedUpdates } from 'react-dom';

import { properties } from '../../../../properties';
import { get, post, put } from '../../../../common/util/restUtil';


const CreatenewliveChatId = (props) => {

    const { livechatSettingsError, livechatSettings, setLiveChatSettings,setIsCreate,setLiveChatSettingsError } = props.data;
    const [livechatData, setLiveChatData,] = useState()

    const handleChange = (e) => {
        const { target } = e;
        setLiveChatData({
            ...livechatData,
            [target.id]: target.value
        })
    }

    const validationSchema = object().shape({
        newliveChatId: string().required("Live Chat Id is required"),
        LiveChatDesc: string().required("Description is required"),
    });

    const validate = (schema, data) => {
        try {
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                setLiveChatSettingsError((prevState) => {
                    return { ...prevState, [err.params.path]: err.message };
                });
            });
            return e;
        }
    };

    const handleOnSave = (e) => {
        e.preventDefault()
        let error = validate(validationSchema, livechatData);
        if (error) {
            toast.error("Validation errors found. Please check highlighted fields");
            return false;
        }
        else {
            const requestBody = {
                mappingPayload: { ...livechatSettings },
                settingType: 'LIVECHAT',
            }
            requestBody?.mappingPayload?.livechat.push(livechatData)
            if (livechatSettings?.settingId) {
                
                requestBody.settingId = livechatSettings?.settingId
                put(properties.PORTAL_SETTING_API, requestBody)
                    .then((response) => {
                        const { status, data } = response;
                        if (status === 200 && !!Object.keys(data).length) {
                            setIsCreate(false)
                            setLiveChatSettings({
                                ...livechatSettings,
                                settingId: data?.settingId,
                                livechat: data?.mappingPayload?.livechat,
                                LiveChatId: data?.mappingPayload?.LiveChatId,
                                userDepartment: data?.mappingPayload?.userDepartment,
                                title: data?.mappingPayload?.title,
                                predefineText: data?.mappingPayload?.predefineText,
                                onlineAvailability: data?.mappingPayload?.onlineAvailability,
                                timeZone: data?.mappingPayload?.timeZone,
                                customAvailability: data?.mappingPayload?.customAvailability,
                                offlineText: data?.mappingPayload?.offlineText,
                                logo: data?.mappingPayload?.logo && [...data?.mappingPayload?.logo?.map((current) => ({ attachmentId: current.attachmentId, entityId: current.entityId, entityType: current.entityType, fileName: current?.fileName }))],
                                theme: {
                                    buttonLabel: data?.mappingPayload?.theme?.buttonLabel,
                                    welcomeMessage: data?.mappingPayload?.theme?.welcomeMessage,
                                    titleColor: data?.mappingPayload?.theme?.titleColor
                                }
                            })
                            toast.success('LiveChat ID has been Created');
                        }
                    })
                    .catch(error => {
                        console.error(error);
                    })
                    .finally()
            }
            else {
                
                post(properties.PORTAL_SETTING_API, requestBody)
                    .then((response) => {
                        const { status, data } = response;
                        if (status === 200 && !!Object.keys(data).length) {
                            setIsCreate(false)
                            setLiveChatSettings({
                                ...livechatSettings,
                                settingId: data?.settingId,
                                livechat: data?.mappingPayload?.livechat,
                                LiveChatId: data?.mappingPayload?.LiveChatId,
                                userDepartment: data?.mappingPayload?.userDepartment,
                                title: data?.mappingPayload?.title,
                                predefineText: data?.mappingPayload?.predefineText,
                                onlineAvailability: data?.mappingPayload?.onlineAvailability,
                                timeZone: data?.mappingPayload?.timeZone,
                                customAvailability: data?.mappingPayload?.customAvailability,
                                offlineText: data?.mappingPayload?.offlineText,
                                logo: data?.mappingPayload?.logo && [...data?.mappingPayload?.logo?.map((current) => ({ attachmentId: current.attachmentId, entityId: current.entityId, entityType: current.entityType, fileName: current?.fileName }))],
                                theme: {
                                    buttonLabel: data?.mappingPayload?.theme?.buttonLabel,
                                    welcomeMessage: data?.mappingPayload?.theme?.welcomeMessage,
                                    titleColor: data?.mappingPayload?.theme?.titleColor
                                }
                            })
                            toast.success('LiveChat ID has been Created');
                        }
                    })
                    .catch(error => {
                        console.error(error);
                    })
                    .finally()
            }

        }
    }
  
  return (<>
        <div className="tab-pane" id="account-2">
            <div className="row">
                <div className="col-12">
                    <form>
                        <div className="form-group row">
                            <label htmlFor="newliveChatId" className="col-md-5 col-form-label text-md-left">Live Chat ID</label>
                            <div className="col-md-5">
                                <input type="text" id="newliveChatId" className={`form-control ${livechatSettingsError.newliveChatId && "error-border"}`} name="newliveChatId" onChange={handleChange} value={livechatData?.newliveChatId} />
                                <span className="errormsg">{livechatSettingsError.newliveChatId ? livechatSettingsError.newliveChatId : ""}</span>
                            </div>
                        </div><br>
                        </br>
                    </form>
                    <form>
                        <div className="form-group row">
                            <label htmlFor="LiveChatDesc" className="col-md-5 col-form-label text-md-left">Description</label>
                            <div className="col-md-5">
                                <textarea id="LiveChatDesc" className={`form-control ${livechatSettingsError.LiveChatDesc && "error-border"}`} name="LiveChatDesc" onChange={handleChange} value={livechatData?.LiveChatDesc} />
                                <span className="errormsg">{livechatSettingsError.LiveChatDesc ? livechatSettingsError.LiveChatDesc : ""}</span>
                            </div>
                        </div><br>
                        </br>
                    </form>
                    <form>
                        <div className="form-group row">
                            <label htmlFor="SubmitApi" className="col-md-5 col-form-label text-md-left"></label>
                            <div className="col-md-5">
                                <button className="btn btn-primary" id="SubmitApi" onClick={handleOnSave}>Save</button>
                            </div>
                        </div><br>
                        </br>
                    </form>
                </div>
            </div>
        </div>
    </>)
}

export default CreatenewliveChatId;