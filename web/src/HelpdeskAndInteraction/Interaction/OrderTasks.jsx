import React, { useState, useEffect } from 'react';
import _ from 'lodash'


const OrderTasks = ((props) => {
    const { taskDetails } = props.data;
console.log('taskDetails------->',taskDetails)
    return (
        <div id="explanation-table">
            {
                taskDetails && taskDetails.length > 0 && taskDetails?.map((e) => {
                    return <div className='row'>
                             <div className='col-md-6'>
                                <span>{e.taskName}</span>
                                <span>
                                    <select id="reAssignUser" className="form-control">
                                        <option key="reAssignUser" value="">Select Status</option>
                                        {e.taskOptions?.Options.map((x) => { return <option key={x.Type} value={x.value}>{x.value}</option> })}
                                    </select>
                                </span>
                            </div>
                    </div>
                })
            }
        </div>
    )
})
export default OrderTasks;




