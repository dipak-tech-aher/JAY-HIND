import React, { useMemo, useState } from "react";
import { SketchPicker as Picker } from 'react-color';
import { unstable_batchedUpdates } from "react-dom";

const WhatsappSettings = (props) => {

    const { whatsappSettings, whatsappSettingError, Mode } = props.data
    const { handleOnChange, setWhatsappSettings } = props.handle

    const [color, setColor] = useState('#25D366');
    const [enableButtonColorPicker, setEnableButtonColorPicker] = useState(false)
    const [enableTextColorPicker, setEnableTextColorPicket] = useState(false)


    const decimalToHex = (alpha) =>
        alpha === 0 ? '00' : Math.round(255 * alpha).toString(16);

    const handleClose = (e) => {
        const { target } = e;
        unstable_batchedUpdates(() => {
            setEnableButtonColorPicker(false)
            setEnableTextColorPicket(false)
        })
    }

    const handleTextColorChange = (e) => {
        unstable_batchedUpdates(() => {
            const themeUpdate = {
                ...whatsappSettings.theme,
                buttonTextColor: e.hex,
            }
            setColor(e.hex)
            setWhatsappSettings({
                ...whatsappSettings,
                theme: themeUpdate
            })
        })
    }

    const handleButtonColorChange = (e) => {
        unstable_batchedUpdates(() => {
            const themeUpdate = {
                ...whatsappSettings.theme,
                buttonBackground: e.hex,
            }
            setColor(e.hex)
            setWhatsappSettings({
                ...whatsappSettings,
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
            <div className="tab-pane" id="account-2">
                <div className="row mb-3">
                    <div className="col-md-3">
                        <div className="form-group">
                            <label htmlFor="buttonLabel"
                                className="control-label">
                                Button Label<span>*</span></label>
                            <input type="text" className={`form-control ${whatsappSettingError.buttonLabel && "error-border"}`} max="30" id="buttonLabel" disabled={Mode === "VIEW" ? true : ""} value={whatsappSettings.theme.buttonLabel} onChange={handleOnChange} />
                            <span className="errormsg">{whatsappSettingError.buttonLabel ? whatsappSettingError.buttonLabel : ""}</span>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="form-group">
                            <label htmlFor="buttonLabel"
                                className="control-label">
                                Status</label>
                            <div className="switchToggle" >
                                <input type="checkbox" name="status" id="status" disabled={Mode === "VIEW" ? true : ""} checked={whatsappSettings.status === 'Y' ? true : false} onChange={handleOnChange} />
                                <label htmlFor="status">Toggle</label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className=" bg-light border m-2 pr-2 mb-3">
                    <h5 className="text-primary pl-2">Theme Settings</h5>
                </div>

                <div className="row">
                    <div className="col-md-5">
                        <div className="row">
                            <div className="col">
                                <label className="radio-btn">Rounded
                                    <input type="radio"
                                        name="rounded" id="rounded" className="form-check-input" disabled={Mode === "VIEW" ? true : ""} checked={whatsappSettings.theme.rounded === 'Y' ? true : false} onChange={handleOnChange} />
                                </label>
                            </div>

                            <div className="col">
                                <label className="radio-btn">Square
                                    <input type="radio" name="square" id="square" disabled={Mode === "VIEW" ? true : ""} className="form-check-input" checked={whatsappSettings.theme.square === 'Y' ? true : false} onChange={handleOnChange} />
                                </label>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col">
                                <label htmlFor="field-1" className="control-label">Button Background<span className="text-danger">*</span></label>
                                <input type="text" id="buttonBackground" className={`form-control colorpicker-element ${whatsappSettingError.buttonBackground && "error-border"}`}
                                    value={whatsappSettings.theme.buttonBackground} disabled={Mode === "VIEW" ? true : ""} onClick={() => { setEnableButtonColorPicker(!enableButtonColorPicker) }} onChange={handleOnChange} />
                                {
                                    enableButtonColorPicker ?
                                        <div style={popover}>
                                            <div style={cover} onClick={handleClose} />
                                            <Picker color={hexColor} onChange={handleButtonColorChange} />
                                        </div>
                                        : <></>
                                }
                                 <span className="errormsg">{whatsappSettingError.buttonBackground ? whatsappSettingError.buttonBackground : ""}</span>
                            </div>
                            <div className="col">
                                <label htmlFor="field-1" className="control-label"> Button Text Color<span className="text-danger">*</span></label>
                                <input type="text" id="buttonTextColor" className={`form-control ${whatsappSettingError.buttonTextColor && "error-border"}`}
                                    value={whatsappSettings.theme.buttonTextColor} disabled={Mode === "VIEW" ? true : ""} onClick={() => { setEnableTextColorPicket(!enableTextColorPicker) }} onChange={handleOnChange} />
                                {
                                    enableTextColorPicker ?
                                        <div style={popover}>
                                            <div style={cover} onClick={handleClose} />
                                            <Picker color={hexColor} onChange={handleTextColorChange} />
                                        </div>
                                        : <></>
                                }
                                 <span className="errormsg">{whatsappSettingError.buttonTextColor ? whatsappSettingError.buttonTextColor : ""}</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-5">Preview
                        <br></br><br></br>
                        <button type="button" className="btn btn-success waves-effect waves-light btn-xl font-18" style={{ backgroundColor: whatsappSettings.theme.buttonBackground ? whatsappSettings.theme.buttonBackground : "#25D366", borderColor: whatsappSettings.theme.buttonBackground ? whatsappSettings.theme.buttonBackground : "#25D366", color: whatsappSettings.theme.buttonTextColor ? whatsappSettings.theme.buttonTextColor : "#FFFFFF", borderRadius: whatsappSettings.theme.rounded === "Y" ? "20px" : "0px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "inline" }}>
                            <i className="fab fa-whatsapp mr-1"></i>{whatsappSettings.theme.buttonLabel}</button>
                    </div>
                </div>


            </div>
        </>
    )
}
export default WhatsappSettings;