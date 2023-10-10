import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const AddEditMultipleOptionsWeightage = (props) => {
    const { options, viewScreen } = props.data;
    const { setGuidelinesInputs } = props.handlers;

    const [allOptionList, setAllOptionList] = useState([]);

    useEffect(() => {
        setAllOptionList(viewScreen === 'ADD' ? [] : options);
    }, [options, viewScreen])

    const handleOnAdd = () => {
        if (allOptionList?.length < 2) {
            setAllOptionList([...allOptionList, { value: "", weightage: "" }]);
        }
        else {
            toast.info('Only two options are allowed.')
        }
    }

    const handleOnRemove = (idx) => {
        const newList = allOptionList;
        newList?.splice(idx, 1)
        setAllOptionList([...newList]);
        setGuidelinesInputs((guidelinesInputs) => {
            return {
                ...guidelinesInputs,
                options: newList
            }
        })
    }

    const validateSelectedOption = (value) => {
        const isPresent = allOptionList?.some((opt) => opt.value === value)
        if (isPresent) {
            toast.error(`${value} is already assigned`);
            return false;
        }
        return true;
    }

    const handleOnInputChange = (e) => {
        const { target } = e;
        const splitedId = target?.id?.split('-') || [];
        if (target?.id?.includes('IN')) {
            let list = allOptionList;
            if (list.length === 2) {
                if (target.value === 'Yes') {
                    if (validateSelectedOption(target.value) === false) {
                        return;
                    }
                }
                else if (target.value === 'No') {
                    if (validateSelectedOption(target.value) === false) {
                        return;
                    }
                }
            }
            if (target.value === 'No') {
                list[splitedId[2]]['weightage'] = '0%';
            }
            list[splitedId[2]]['value'] = target.value;
            setAllOptionList([...list]);
        }
        else {
            let list = allOptionList;
            list[splitedId[2]]['weightage'] = target.value;
            setAllOptionList([...list]);
        }
        setGuidelinesInputs((guidelinesInputs) => {
            return {
                ...guidelinesInputs,
                options: allOptionList
            }
        })
    }

    return (
        <div className='my-3'>
            <label htmlFor="field-1" className="control-label">Add Options and Weightage</label>
            <div className='table-repsonsive overflow-auto' style={{ height: '195px' }}>
                <table className='table table-bordered'>
                    <thead>
                        <tr>
                            <th scope="col">Option</th>
                            <th scope="col">Option value</th>
                            <th scope="col">Option Weightage</th>
                            <th scope="col">
                                <button type="button" name="add" className="btn btn-success btn-sm add" onClick={handleOnAdd}>
                                    <span className="fas fa-plus-circle"></span>
                                </button>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            allOptionList?.map((item, idx) => (
                                <>
                                    {
                                        item?.value !== 'NA' &&
                                        <tr key={idx}>
                                            <td>
                                                <p>Radio Button</p>
                                            </td>
                                            <td>
                                                <select id={`OPW-IN-${idx}`} className="form-control number_only item_quantity" value={item?.value} onChange={handleOnInputChange}>
                                                    <option value="">Select Value</option>
                                                    <option value="Yes">Yes</option>
                                                    <option value="No">No</option>
                                                </select>
                                            </td>
                                            <td>
                                                <select id={`OPW-SEL-${idx}`} disabled={item?.value === 'No' ? true : false} className="form-control item_unit" value={item?.weightage} onChange={handleOnInputChange}>
                                                    <option value="">Select Weightage</option>
                                                    {
                                                        item?.value === 'No' ?
                                                            <option value="0%">0%</option>
                                                            :
                                                            <>
                                                                <option value="1%">1%</option>
                                                                <option value="1.5%">1.5%</option>
                                                                <option value="2%">2%</option>
                                                                <option value="2.5%">2.5%</option>
                                                                <option value="3%">3%</option>
                                                                <option value="3.5%">3.5%</option>
                                                                <option value="4%">4%</option>
                                                                <option value="4.5%">4.5%</option>
                                                                <option value="5%">5%</option>
                                                                <option value="5.5%">5.5%</option>
                                                                <option value="6%">6%</option>
                                                                <option value="6.5%">6.5%</option>
                                                                <option value="7%">7%</option>
                                                                <option value="7.5%">7.5%</option>
                                                                <option value="8%">8%</option>
                                                                <option value="8.5%">8.5%</option>
                                                                <option value="9%">9%</option>
                                                                <option value="9.5%">9.5%</option>
                                                                <option value="10%">10%</option>
                                                            </>
                                                    }
                                                </select>
                                            </td>
                                            <td>
                                                <button type="button" id={`OPW-REM-${idx}`} className="btn btn-danger btn-sm remove" onClick={() => handleOnRemove(idx)}>
                                                    <span className="fas fa-minus-circle"></span>
                                                </button>
                                            </td>
                                        </tr>
                                    }
                                </>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default AddEditMultipleOptionsWeightage;