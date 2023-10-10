/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import { properties } from "../properties";
import { post } from "../common/util/restUtil";
import { unstable_batchedUpdates } from 'react-dom';


const Contracts = (props) => {

    return (
        <div>
        <span>
           <h4>Contracts</h4>
        </span>
        <div className="skel-role-base">
           <div className="skel-tabs-role-config p-2">
              <div className="col-12">
                 <div className="col-md-12 ">
                    <div className="row">
                       <div className="col-6"></div>
                       <div className="col-6 text-right mb-2"><button onclick="addNewRow()" className="btn btn-primary btn-sm">Add New Contract
                          </button>
                       </div>
                    </div>
                    <table id="employee-table" className="table table-bordered table-striped">
                       <tr>
                          <th>Contract ID
                          </th>
                          <th>Contract Name
                          </th>
                          <th>Contract Type
                          </th>
                          <th>Contract Months
                          </th>
                          <th>From Date
                          </th>
                          <th>To Date
                          </th>
                          <th>Action
                          </th>
                       </tr>
                       <tr>
                          <td><input className="form-control" id="Interactioncat" placeholder="" type="text" value="" />
                          </td>
                          <td><input className="form-control" id="Interactioncat" placeholder="" type="text" value="" />
                          </td>
                          <td>
                             <select className="form-control" id="Problemstatement" required="">
                                <option selected="">Select Type</option>
                                <option>AMC</option>
                                <option>Insurance</option>
                             </select>
                          </td>
                          <td><input className="form-control" id="Interactioncat" placeholder="" type="number" value="" />
                          </td>
                          <td><input className="form-control" id="Interactioncat" placeholder="" type="date" value="" />
                          </td>
                          <td><input className="form-control" id="Interactioncat" placeholder="" type="date" value="" />
                          </td>
                          <td><button onclick="deleteRow()" className="btn btn-danger btn-sm">Delete
                             </button>
                          </td>
                       </tr>
                    </table>
                 </div>
              </div>
           </div>
        </div>
     </div>
    )
}

export default Contracts;