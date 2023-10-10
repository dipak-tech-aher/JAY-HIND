import { SpatialTracking } from "@mui/icons-material";
import React, { useEffect, useRef, useState } from "react";
// import Select from 'react-select';
import makeAnimated from "react-select/animated";
import AsyncSelect from "react-select/async";
import SignaturePad from "react-signature-canvas";
import ReactSelect from 'react-select';

/**
 * Renders a dynamic form based on the provided data.
 *
 * @param {Object} props - The props object containing the form attributes, form reference, form disabled state, signature pad reference, button hide state, and form details.
 * @param {Array} props.data.formAttributes - An array of objects representing the form attributes.
 * @param {Object} props.data.formRef - A reference to the form element.
 * @param {boolean} props.data.isFormDisabled - A flag indicating whether the form is disabled.
 * @param {Object} props.data.sigPad - A reference to the signature pad element.
 * @param {boolean} props.data.isButtonHide - A flag indicating whether the button is hidden.
 * @param {Object} props.data.formDetails - An object containing the form details.
 * @param {Object} props.handlers - The handlers for form submission and form field changes.
 * @param {Function} props.handlers.handleFormSubmit - The handler function for form submission.
 * @param {Function} props.handlers.handleFormOnChange - The handler function for form field changes.
 * @returns {JSX.Element} - The rendered dynamic form.
 */
const DynamicForm = (props) => {

    let { formAttributes, formRef, isFormDisabled, sigPad, isButtonHide, formDetails, values, tagDefaultValues, idx, lookupData } = props?.data;
    // console.log('formDetails-------->', formDetails)
    const { handleFormSubmit, handleFormOnChange, setValues, setIsFormDisabled } = props?.handlers
    const [formAttributesWithData, setFormAttributesWithData] = useState([])

    const customElementsRenderer = (count, rowsIndex, formDetails, rest) => {
        const elements = []
        for (let i = 1; i <= count; i++) {
            elements.push(
                <td key={i}>
                    <input type="text" id={'d' + rowsIndex + i} /*data-id={header.id}*/ data-index={i} value={formDetails?.['d' + rowsIndex + i]} required={rest?.required || false} disabled={isFormDisabled}
                        onChange={handleFormOnChange} ></input>
                </td>
            )
        }
        return elements
    }

    const customerRowsRenderer = (header, rowsIndex, formDetails, rest) => {
        let elements = []
        elements = header?.map((h, index) => {
            return (
                <td key={index}>
                    {h?.fieldType === 'select' ?
                        <>
                            <ReactSelect
                                id={h?.id + rowsIndex + index}
                                placeholder={h?.title}
                                menuPortalTarget={document.body}
                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                options={lookupData?.current?.[h?.options?.code]?.map((item) => ({ label: item.description, value: item.code }))}
                                isMulti={h?.option?.isMulti}
                                onChange={(e) => { handleRowsOnChange(e, 'select', { id: h.id, index: rowsIndex }) }}
                            // value={channels?.filter(x => faqData?.channel?.includes(x.value))}
                            />
                        </>
                        : <input style={isFormDisabled ? { cursor: 'auto' } : { cursor: 'pointer' }} type="text" id={h?.id + rowsIndex + index} data-id={h.id} data-index={rowsIndex} value={typeof (formDetails?.[h?.id]) === 'object' ? formDetails?.[h?.id]?.label : formDetails?.[h?.id]} required={rest?.required || false} disabled={isFormDisabled}
                            onChange={handleRowsOnChange} >
                        </input>}
                </td>
            )
        })
        return elements
    }

    // values = [{ip:'' ,repo:''}]
    const handleRowsOnChange = (e, type, rest) => {
        if (type === 'select') {
            values[rest?.index][rest.id] = e
        } else {
            const { dataset, value } = e?.target
            values[dataset.index][dataset.id] = value
        }
        setValues([...values])
    }

    const handleAddRows = (header) => {
        const headerAttributes = header?.map((r) => r?.id)
        const rowAttributes = headerAttributes?.reduce((obj, key) => {
            obj[key] = "";
            return obj;
        }, {});
        setValues([...values, { ...rowAttributes }])
    }

    const clearSignature = () => {
        sigPad?.current?.clear();
    }


    const getFormWithData = (item, index) => {
        return (
            item ? (
                <div key={index} id={'hide' + idx} >
                    <form ref={formRef} onSubmit={(e) => { handleFormSubmit(e, idx) }} id="myForm">
                        {item?.fieldSet?.map((field, fieldIndex) => (
                            <div key={fieldIndex}>
                                {field?.fieldType === 'selectbox' && (
                                    <>
                                        <span className="header-title mb-2 font-weight-bold mt-4 d-block">{field?.title}</span>
                                        {Array.isArray(formDetails?.[field?.id]) ? formDetails?.[field?.id]?.map((ele, i) => <><input type={field?.inputType} id={field?.id + '_' + i} defaultValue={ele?.code} data-raw-data={JSON.stringify(ele)} name={ele?.serviceNo} multiple={item?.mode === 'single' ? false : true} onChange={(e) => handleFormOnChange(e, field?.id, formAttributes)} disabled={true} />{ele?.value}<br /> </>)

                                            : <input className="form-control" type={field?.inputType} defaultValue={formDetails?.[field?.id]} disabled={true} />
                                        }
                                    </>
                                )}
                                {field?.fieldType === 'checkbox' && (
                                    <>
                                        <span className="header-title mb-2 font-weight-bold mt-4 d-block">{field?.title}</span>
                                        {formDetails?.[field?.id]?.map((ele, i) => <><input type={field?.inputType} id={field?.id + '_' + i} defaultValue={ele?.code} data-raw-data={JSON.stringify(ele)} name={ele?.serviceNo} placeholder={field.placeHolder} onChange={(e) => handleFormOnChange(e, field?.id, formAttributes)} disabled={true} />{ele?.value}<br /></>)}
                                    </>
                                )}
                                {field?.fieldType === 'textarea' && (
                                    <>
                                        <span className="header-title mb-2 font-weight-bold mt-4 d-block">{field?.title}</span>
                                        <textarea id={field.id} defaultValue={formDetails?.[field?.id] || ''} name={field.id} placeholder={field.placeHolder} rows={4} cols={50} disabled={true} onChange={handleFormOnChange} required={field?.required} />
                                    </>
                                )}
                                {field?.fieldType === 'grid' && (
                                    <table className="skel-req-details mt-2">
                                        <thead>
                                            <tr>
                                                {field?.headers.map((header, headerIndex) => (
                                                    <th key={headerIndex}>{header?.title}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {field.columns?.[0]?.column_headers?.map((rows, rowsIndex) => (
                                                <tr key={rowsIndex} id={'r' + rowsIndex}>
                                                    <td key={rowsIndex}>
                                                        <input id={'d' + rowsIndex + '1'} type="text" value={rows?.title + (rows?.required && '*')} disabled={true} />
                                                    </td>
                                                    {
                                                        customElementsRenderer(field?.headers?.length - 1 || 0, rowsIndex, formDetails, { required: rows?.required })
                                                    }
                                                </tr>
                                            ))}
                                            {values?.length > 0 && values?.map((rows, rowsIndex) => (
                                                <tr key={rowsIndex} id={'r' + rowsIndex}>
                                                    {
                                                        customerRowsRenderer(field?.headers || [], rowsIndex, rows, { required: true })
                                                    }
                                                </tr>
                                            ))}
                                            {
                                                field.rows?.length > 0 &&
                                                <tr>
                                                    <button type="button" className="skel-btn-submit mt-2" hidden={isButtonHide} onClick={() => { handleAddRows(field?.headers) }}>Add Row</button>
                                                </tr>
                                            }
                                        </tbody>
                                    </table>
                                )}
                                {field?.fieldType === 'sigature' && (
                                    <div className="form-group text-center">
                                        <label htmlFor="sign" className="control-label">{field?.title}*</label>
                                        <div className='form-inline imessage'>
                                            {!isButtonHide && <SignaturePad
                                                ref={sigPad}
                                                disabled={isFormDisabled}
                                                canvasProps={{
                                                    width: 500,
                                                    height: 100,
                                                    className: "sign-canvas",
                                                }}
                                            />}
                                            {isButtonHide && <img src={formDetails?.signature} alt='signature' />}
                                            <span
                                                // className="btn waves-effect waves-light btn-secondary"
                                                className='cursor-pointer'
                                                onClick={clearSignature}
                                                id="sign-clearBtn"
                                                style={{ float: 'right' }}
                                                type="button"
                                                disabled={isFormDisabled}
                                                hidden={isButtonHide}>
                                                Clear Signature
                                            </span>
                                            {/* <span className="errormsg"></span> */}
                                        </div>
                                    </div>
                                )}

                                {field?.fieldType === 'radio' && (
                                    <>
                                        <label className="header-title mb-2 d-block">{field?.title}</label>
                                        <input className="form-control input-sm border" id={field.id} defaultValue={formDetails?.[field?.id]?.[0]?.value || ''} name={field.id} data-raw-data={JSON.stringify(field)} placeholder={field.placeHolder} onChange={(e) => handleFormOnChange(e, field?.id, formAttributes, null, 'radio')} disabled={true} required={field?.required} />
                                    </>
                                )}
                                {field?.fieldType === 'textField' && (
                                    <>
                                        <label className="header-title mb-2 d-block">{field?.title}</label>
                                        <input className="form-control input-sm border" id={field.id} defaultValue={formDetails?.[field?.id] || ''} name={field.id} data-raw-data={JSON.stringify(field)} placeholder={field.placeHolder} onChange={(e) => handleFormOnChange(e, null, formAttributes)} disabled={true} required={field?.required} />
                                    </>
                                )}
                                {/* {field?.fieldType === 'button' && (
                                <div className='text-center mt-2'>
                                    <button disabled={true} className="skel-btn-submit" type="submit" >{field?.title}</button>
                                </div>
                            )} */}
                            </div>
                        ))}
                    </form>
                </div >
            ) : null
        )
    }

    useEffect(() => {
        let arrData = []
        if (formDetails && isFormDisabled) {
            let keysWithFormAttributes = Object.keys(formDetails).filter(key => key.includes('_formAttributes'));
            let valuesWithFormAttributes = keysWithFormAttributes.map(key => formDetails[key]);
            // let arrData = []
            valuesWithFormAttributes?.map((ele) => {
                arrData.push(ele[0])
            });
            setFormAttributesWithData(arrData);
        }

        if (formDetails?.grid && isFormDisabled && formDetails?.grid.length > 0) {
            const outputArray = [];
            for (const key in formDetails?.grid[0]) {
                if (formDetails?.grid[0].hasOwnProperty(key)) {
                    const newObj = {};
                    newObj['id'] = key;
                    const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
                    newObj['title'] = capitalizedKey
                    outputArray.push(newObj);
                }
            }
            setValues([...formDetails?.grid])
            arrData.push([{
                fieldSet: [
                    {
                        'fieldType': 'grid',
                        headers: outputArray
                    }
                ]
            }])
        }
        setFormAttributesWithData(arrData)

    }, [formDetails, isFormDisabled])

    // console.log('formAttributesWithData', formAttributesWithData)


    return (
        <React.Fragment>
            {formAttributesWithData && formAttributesWithData?.length > 0 && formAttributesWithData?.map((item, index) => {
                return getFormWithData(item?.[0], index);
            })}
            <div className="mt-2" id={'hide' + idx}>
                {
                    formAttributes && formAttributes?.map((item, index) => {
                        return (
                            <div key={index}>
                                <form ref={formRef} onSubmit={(e) => { handleFormSubmit(e, idx) }} id="myForm">
                                    {item?.fieldSet?.map((field, fieldIndex) => (
                                        <div key={fieldIndex}>
                                            {field?.fieldType === 'selectbox' && (
                                                <>
                                                    <span className="header-title mb-2 font-weight-bold mt-4 d-block">{field?.title}</span>
                                                    <select className="form-control" id={field?.id} multiple={item?.mode === 'single' ? false : true} onChange={(e) => handleFormOnChange(e, field?.id, formAttributes)} >
                                                        <option value={field?.placeHolder}>{field?.placeHolder}</option>
                                                        {tagDefaultValues?.map((ele) => <option defaultValue={ele?.code} data-raw-data={JSON.stringify(ele)}>{ele?.description ?? ele?.value}</option>)}
                                                    </select>
                                                </>
                                            )}
                                            {field?.fieldType === 'checkbox' && (
                                                <>
                                                    <span className="header-title mb-2 font-weight-bold mt-4 d-block">{field?.title}</span>
                                                    {tagDefaultValues?.map((ele, i) => <>
                                                        {/* {console.log('formDetails?.[field?.id]?.[i]?.code-------->', formDetails?.[field?.id]?.[i]?.code, '----ele.code------>', ele?.code)}
                                                        {console.log('formDetails?.[field?.id]?.[i]?.code == ele?.code----->', formDetails?.[field?.id]?.[i]?.code == ele?.code)} */}
                                                        <input key={i}
                                                            defaultChecked={formDetails?.[field?.id]?.[i]?.code === ele?.code}
                                                            type={field?.inputType} id={field?.id + '_' + i}
                                                            data-raw-data={JSON.stringify(ele)}
                                                            name={ele?.serviceNo || ele?.value}
                                                            placeholder={field.placeHolder}
                                                            onChange={(e) => handleFormOnChange(e, field?.id, formAttributes, i)}
                                                        />{ele?.value}<br />
                                                    </>)}
                                                </>
                                            )}
                                            {field?.fieldType === 'textarea' && (
                                                <>
                                                    <span className="header-title mb-2 font-weight-bold mt-4 d-block">{field?.title}</span>
                                                    <textarea id={field.id} defaultValue={formDetails?.[field?.id] || ''} name={field.id} placeholder={field.placeHolder} rows={4} cols={50} onChange={(e) => handleFormOnChange(e, field?.id, formAttributes)} required={field?.required} />
                                                </>
                                                // <>
                                                //     <span className="header-title mb-2 font-weight-bold mt-4 d-block">{field?.title}</span>
                                                //     <textarea id={field.id} defaultValue={formDetails?.[field?.id] || ''} disabled={isFormDisabled} name={field.id} placeholder={field.placeHolder} rows={4} cols={50} onChange={handleFormOnChange} required={field?.required} />
                                                // </>
                                            )}
                                            {field?.fieldType === 'grid' && (
                                                <table className="skel-req-details">
                                                    <thead>
                                                        <tr>
                                                            {field?.headers.map((header, headerIndex) => (
                                                                <th key={headerIndex}>{header?.title}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {field.columns?.[0]?.column_headers?.map((rows, rowsIndex) => (
                                                            <tr key={rowsIndex} id={'r' + rowsIndex}>
                                                                <td key={rowsIndex}>
                                                                    <input id={'d' + rowsIndex + '1'} type="text" value={rows?.title + (rows?.required && '*')} disabled={true} />
                                                                </td>
                                                                {
                                                                    customElementsRenderer(field?.headers?.length - 1 || 0, rowsIndex, formDetails, { required: rows?.required })
                                                                }
                                                            </tr>
                                                        ))}
                                                        {values?.length > 0 && values?.map((rows, rowsIndex) => (
                                                            <tr key={rowsIndex} id={'r' + rowsIndex}>
                                                                {
                                                                    customerRowsRenderer(field?.headers || [], rowsIndex, rows, { required: true })
                                                                }
                                                            </tr>
                                                        ))}
                                                        {
                                                            field.rows?.length > 0 &&
                                                            <tr>
                                                                <button type="button" className="skel-btn-submit mt-2" hidden={isButtonHide} onClick={() => { handleAddRows(field?.headers) }}>Add Row</button>
                                                            </tr>
                                                        }
                                                    </tbody>
                                                </table>
                                            )}
                                            {field?.fieldType === 'sigature' && (
                                                <div className="form-group text-center">
                                                    <label htmlFor="sign" className="control-label">{field?.title}*</label>
                                                    <div className='form-inline imessage'>
                                                        {!isButtonHide && <SignaturePad
                                                            ref={sigPad}
                                                            disabled={isFormDisabled}
                                                            canvasProps={{
                                                                width: 500,
                                                                height: 100,
                                                                className: "sign-canvas",
                                                            }}
                                                        />}
                                                        {isButtonHide && <img src={formDetails?.signature} alt='signature' />}
                                                        <span
                                                            // className="btn waves-effect waves-light btn-secondary"
                                                            className='cursor-pointer'
                                                            onClick={clearSignature}
                                                            id="sign-clearBtn"
                                                            style={{ float: 'right' }}
                                                            type="button"
                                                            disabled={isFormDisabled}
                                                            hidden={isButtonHide}>
                                                            Clear Signature
                                                        </span>
                                                        {/* <span className="errormsg"></span> */}
                                                    </div>
                                                </div>
                                            )}
                                            {field?.fieldType === 'radio' && (
                                                <>
                                                    <span>{field.title}</span>
                                                    {field?.taskContextPrefix ?
                                                        tagDefaultValues?.map((t, index) => (
                                                            <div className='radio radio-primary m-2'>
                                                                <input type="radio" id={field?.id + '_' + index} name={field?.id} defaultValue={t?.value} data-raw-data={JSON.stringify(t)} onChange={(e) => handleFormOnChange(e, field?.id, formAttributes, null, 'radio')}></input>
                                                                <label htmlFor={field?.id + '_' + index}>{t.value}</label>
                                                                <br></br>
                                                            </div>
                                                        ))
                                                        :
                                                        <>
                                                            < div className='radio radio-primary'>
                                                                <input type="radio" id={field?.id} name={field?.id} defaultValue={field.title} data-raw-data={JSON.stringify(field)} onChange={(e) => handleFormOnChange(e, field?.id, formAttributes, null, 'radio')}></input>
                                                                <label htmlFor={field?.id}>{field.title}</label>
                                                                <br></br>
                                                            </div>
                                                        </>
                                                    }
                                                </>
                                            )}
                                            {field?.fieldType === 'textField' && (
                                                <div className="form">
                                                    <label className="header-title mb-2 d-block">{field?.title}</label>
                                                    <input className="form-control input-sm border" id={field.id} defaultValue={formDetails?.[field?.id] || ''} name={field.id} data-raw-data={JSON.stringify(field)} placeholder={field.placeHolder} onChange={(e) => handleFormOnChange(e, null, [{ fieldSet: [field] }])} required={field?.required} />
                                                </div>
                                            )}
                                            {field?.fieldType === 'button' && (
                                                <div className='text-center mt-2'>
                                                    <button className="skel-btn-submit" id={field.id} type="submit" >{field?.title}</button>
                                                </div>
                                            )}
                                            {field?.fieldType === 'custom_button' && (
                                                <div className='text-center mt-2'>
                                                    <button className="skel-btn-submit" id={field.id} type="submit" >{field?.title}</button>
                                                </div>
                                            )}
                                            {/* {field?.fieldType === 'button' && (
                                            <div className='text-center mt-2'>
                                                <button className="skel-btn-submit" disabled={isFormDisabled} type="submit" hidden={isFormDisabled}>{isFormDisabled ? 'Submitted' : field?.title}</button>
                                            </div>
                                        )} */}
                                        </div>
                                    ))}
                                </form>
                            </div >
                        )
                    })
                }
            </div >
        </React.Fragment>
    )

}

export default DynamicForm;