import React, { useState, useEffect } from 'react';
import moment from 'moment';

import { put } from '../../common/util/restUtil';

const ViewEditContractTable = (props) => {
    const { tableList, editingFieldsIndexes, headersToRemove, isEdit, endPointURL, entityKey, isClickAble = false, columnHeader = "", scrollViewName = "" } = props.data;
    const { pageRefresh, setSelectedcontractId } = props.handler;

    const [selectedIndex, setSelectedIndex] = useState();
    //const [contractData, setContractData] = useState([]);
    const [formedTableList, setFormedTableList] = useState([]);

    useEffect(() => {
        getFormedTableList();
    }, [])

    const getFormedTableList = () => {

        setFormedTableList(removeUnwantedKeyValues(tableList, headersToRemove))

    }

    const removeUnwantedKeyValues = (obj, arr) =>
        obj.map((subObj, index) => {
            if (isEdit) {
                subObj.action = '';
            }
            return Object.keys(subObj)
                .filter(k => !arr.includes(k))
                .reduce((acc, key) => ((acc[key] = subObj[key]), acc), {});
        })

    const camelCaseToNormal = (inputString) => {
        return inputString.split('').map((character, index) => {
            if (character === character.toUpperCase()) {
                return ' ' + character;
            }
            else {
                return character;
            }
        })
            .join('');
    }

    const handleOnChange = (e, data, key, index) => {
        const { target } = e;
        setFormedTableList((prevState) => {
            prevState[index] = { ...data, [key]: target.value }
            return [...prevState];
        })
    }

    const handleOnEdit = (data, index) => {
        setSelectedIndex(index);
        const ele = document.querySelector(`[id^="${scrollViewName}"]`);
        ele.scrollIntoView();
    }

    const handleOnDone = (index) => {
        let id = tableList[index][entityKey];
        
        put(`${endPointURL}/${id}`, formedTableList[index])
            .then((response) => {
                if (response.status === 200) {
                    pageRefresh();
                }
            })
            .catch(error => {
                console.error(error)
            })
            .finally(() => {
                
                setSelectedIndex();
            })
    }

    return (
        <div className="" style={{ width: "100%", maxHeight: "300px", border: "1px solid #ccc", overflowX: "scroll", overflowY: "auto", whiteSpace: "nowrap" }}>
            <table className="table table-responsive table-striped dt-responsive nowrap w-100 align-center ml-0">
                <thead>
                    <tr>
                        {
                            !!formedTableList.length && Array(formedTableList[0]).map((headerObject, parentIndex) => (
                                Object.keys(headerObject).map((key, index) => (
                                    <th id={editingFieldsIndexes.includes(index) && `${scrollViewName}-${key}-${parentIndex}`} key={index} className="text-capitalize">{camelCaseToNormal(key)}</th>
                                ))
                            ))
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        !!formedTableList.length && formedTableList.map((bodyObject, index) => (
                            <tr>
                                {
                                    Object.keys(bodyObject).map((key, subIndex) => (
                                        editingFieldsIndexes.includes(Number(subIndex)) ?
                                            selectedIndex === index ?
                                                <td key={subIndex} >
                                                    <input type="date" className="form-control" id={key} value={bodyObject[key] ? moment(bodyObject[key]).format('yyyy-MM-DD') : ''}
                                                        onChange={(e) => handleOnChange(e, bodyObject, key, index)}
                                                    />
                                                </td>
                                                :
                                                <td>{key.toLowerCase().includes('date') ? bodyObject[key] ? moment(bodyObject[key]).format('DD MMM YYYY') : '' : bodyObject[key]}</td>
                                            : Object.values(bodyObject).length - 1 === subIndex && isEdit ?
                                                <td>
                                                    {
                                                        index !== selectedIndex ?
                                                            <button type="button" className="btn btn-primary btn-sm waves-effect waves-light ml-2" onClick={() => handleOnEdit(bodyObject, index)}>
                                                                Edit
                                                            </button>
                                                            :
                                                            <button type="button" className="btn btn-primary btn-sm waves-effect waves-light ml-2" onClick={() => handleOnDone(index)}>
                                                                Done
                                                            </button>
                                                    }
                                                </td>
                                                :
                                                isClickAble && columnHeader === key ?
                                                    <td className="cursor-pointer">
                                                        <div onClick={() => setSelectedcontractId(bodyObject[key])}>
                                                            {bodyObject[key]}
                                                        </div>
                                                    </td>
                                                    :
                                                    key.toLowerCase().includes('date') || key.toLowerCase().includes('period') ?
                                                        <td>{bodyObject[key] ? moment(bodyObject[key]).format('DD MMM YYYY') : bodyObject[key]}</td>
                                                        :
                                                        <td>{bodyObject[key]}</td>
                                    ))
                                }
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    )
}

export default ViewEditContractTable;