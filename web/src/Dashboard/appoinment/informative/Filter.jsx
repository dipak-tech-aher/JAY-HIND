import React, { useState, useRef, useMemo, useEffect } from 'react';
import { properties } from "../../../properties";
import { post, get } from "../../../common/util/restUtil";
import ReactSelect from "react-select";

const Filter = (props) => {
    const { entityType } = props.data
    const { filtration, setEntityType } = props.handlers
    const entityTypes = [
        {
            label: "All",
            value: "All"
        }, {
            label: 'Interaction',
            value: "INTERACTION"
        },
        {
            label: "Order",
            value: "ORDER"
        }]
    return (
        <div className=''>
            {/* <ReactSelect
                className="skel-cust-graph-select"
                placeholder="Search..."
                options={entityTypes}

                menuPortalTarget={document.body}
                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}

                value={entityType ? entityTypes.find(c => c.value === entityType) : null}
                onChange={(val) => filtration(val?.value)}
            /> */}
            <select className='form-control' name="appoinmentType"  onChange={filtration}>
                <option value="All">All</option>
                <option value="INTERACTION">Interaction</option>
                <option value="ORDER">Order</option>
            </select>
        </div>
    )
}

export default Filter;


