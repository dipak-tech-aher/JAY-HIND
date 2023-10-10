import React, { useMemo, useState } from "react";
import { SketchPicker as Picker } from 'react-color';
import { unstable_batchedUpdates } from "react-dom";
import FileUpload from './fileUpload'

const Settings = (props) => {

    const { livechatSettings, setLiveChatSettings, logocurrentFiles,logoExistingFiles,setlogoCurrentFiles,setLogoExistingFiles } = props.data
    const { handleOnChange } = props.handle
    const [color, setColor] = useState('#25D366');
    const [enableTextColorPicker, setEnableTextColorPicker] = useState(false)

    const decimalToHex = (alpha) =>
        alpha === 0 ? '00' : Math.round(255 * alpha).toString(16);

    const handleClose = (e) => {
        const { target } = e;
        unstable_batchedUpdates(() => {
            setEnableTextColorPicker(false)
        })
    }

    const handleTextColorChange = (e) => {
        unstable_batchedUpdates(() => {
            const themeUpdate = {
                ...livechatSettings.theme,
                titleColor: e.hex,
            }
            setColor(e.hex)
            setLiveChatSettings({
                ...livechatSettings,
                theme: themeUpdate
            })
        })
    }

    const popover = {
        position: "absolute",
        zindex: "-2"
    };

    const cover = {
        position: "fixed",
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px"
    };

    const hexColor = useMemo(() => {
        if (typeof color === 'string') {
            return color;
        }
        return `${color?.hex}${decimalToHex(color?.rgb?.a)}`;
    }, [color]);


    return (
        <>
            <div className="tab-pane" id="finish-2">
                <div className="row mb-3">
                    <div className="col-md-5">
                        <div className="form-group">
                            <label htmlFor="field-1" className="control-label">
                                Button Label</label>
                            <input type="text" className="form-control col-md-6" name="buttonLabel" id="buttonLabel" value={livechatSettings.theme.buttonLabel} onChange={handleOnChange} />
                        </div>
                    </div>
                    <div className="col-md-5">
                        <div className="form-group">
                            <label htmlFor="welcomeMessage" className="control-label">
                                Welcome Message</label>
                            <input type="text" className="form-control" name="welcomeMessage" id="welcomeMessage" value={livechatSettings.theme.welcomeMessage} onChange={handleOnChange} />
                        </div>
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-md-5">
                        <div className="form-group">
                        <label htmlFor="welcomeMessage" className="control-label">
                                Chat Logo</label>
                            <FileUpload
                                data={{
                                    currentFiles: logocurrentFiles,
                                    entityType: 'LOGO',
                                    existingFiles: logoExistingFiles,
                                    interactionId: livechatSettings?.settingId,
                                  //  permission: !isEdit
                                }}
                                handlers={{
                                    setCurrentFiles: setlogoCurrentFiles,
                                    setExistingFiles: setLogoExistingFiles
                                }}
                            />
                        </div>
                    </div>
                    <div className="col-md-5">
                        <div className="form-group">
                            <label htmlFor="titleColor" className="control-label">Title Color :</label>
                            <input type="text" id="titleColor" name="titleColor" className="form-control colorpicker-element"
                                value={livechatSettings.theme.titleColor} onClick={() => { setEnableTextColorPicker(!enableTextColorPicker) }} onChange={handleOnChange} />
                            {
                                enableTextColorPicker ?
                                    <div style={popover}>
                                        <div style={cover} onClick={handleClose} />
                                        <Picker color={hexColor} onChange={handleTextColorChange} />
                                    </div>
                                    : <></>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Settings;