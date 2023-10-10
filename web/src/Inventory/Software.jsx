/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';

import { properties } from "../properties";
import { post } from "../common/util/restUtil";
import { unstable_batchedUpdates } from 'react-dom';


const Software = (props) => {

    return (        
        <div>
        <span>
           <h4>Software</h4>
        </span>
        <div className="skel-role-base">
           <div className="skel-tabs-role-config p-2">
              <div className="col-12">
                 <div className="col-md-12 row p-0">
                    <div className="row col-12 mt-2 mb-2 p-0">
                       <div className="col-6 px-3"></div>
                       <div className="col-6 text-right p-0"><button onclick="addNewRow()" className="btn btn-primary btn-sm">Add New Software
                          </button>
                       </div>
                    </div>
                    <table id="employee-table" className="table table-bordered table-striped">
                       <tr>
                          <th>Software
                          </th>
                          <th>Version
                          </th>
                          <th>Licence/Serial No
                          </th>
                          <th>Licence Expiry
                          </th>
                          <th>Action
                          </th>
                       </tr>
                       <tr>
                          <td><input className="form-control" id="Interactioncat" placeholder="" type="text" value="MS Office" />
                          </td>
                          <td><input className="form-control" id="Interactioncat" placeholder="" type="text" value="2022" />
                          </td>
                          <td><input className="form-control" id="Interactioncat" placeholder="" type="text" value="11B2234VB1124" />
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

export default Software;