/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import { properties } from "../properties";
import { post } from "../common/util/restUtil";
import { unstable_batchedUpdates } from 'react-dom';
import { NumberFormatBase } from 'react-number-format';

const Financial = (props) => {
  

  return (
    <div>
      <span>
         <h4>Financial</h4>
      </span>
      <div className="skel-role-base">
         <div className="row col-12 mt-2">
            <div className="col-6 px-3">
               <h4>Cost</h4>
            </div>
            <div className="col-6 text-right"><button onclick="addNewRow()" className="btn btn-primary btn-sm mb-2">Add New Cost
               </button>
            </div>
         </div>
         <table id="employee-table" className="table table-bordered table-striped">
            <tr>
               <th>Date
               </th>
               <th>Cost Detail
               </th>
               <th>Description
               </th>
               <th>Cost ($)
               </th>
               <th>Action
               </th>
            </tr>
            <tr>
               <td><input className="form-control" id="Interactioncat" placeholder="" type="date" value="" />
               </td>
               <td>
                  <select className="form-control" id="Problemstatement" required="">
                     <option selected="">Select Cost</option>
                     <option>Disposal Cost</option>
                     <option>Move/Change Cost</option>
                     <option>Purchase Cost</option>
                     <option>Service Cost</option>
                     <option>Insurance Cost</option>
                     <option>AMC Cost</option>
                     <option>Taxes</option>
                     <option>Licence Cost</option>
                     <option>Others</option>
                  </select>
               </td>
               <td><input className="form-control" id="Interactioncat" placeholder="" type="text" value="" />
               </td>
               <td><input className="form-control" id="Interactioncat" placeholder="" type="number" value="" />
               </td>
               <td><button onclick="deleteRow()" className="btn btn-danger btn-sm">Delete
                  </button>
               </td>
            </tr>
         </table>
      </div>
      <div className="skel-role-base mt-2">
         <div className="row col-12 mt-2">
            <div className="col-6 px-3">
               <h4>Depreciation</h4>
            </div>
            <div className="col-6 text-right">                                                         
            </div>
         </div>
         <table id="employee-table" className="table table-bordered table-striped">
            <tr>
               <th>Purchase Cost($)
               </th>
               <th>Acquisition Date
               </th>
               <th>Depreciation Method
               </th>
               <th>Life (in years)
               </th>
               <th>Salvage Value($)
               </th>
            </tr>
            <tr>
               <td><input className="form-control" id="Interactioncat" placeholder="" type="number" value="" />
               </td>
               <td><input className="form-control" id="Interactioncat" placeholder="" type="date" value="" />
               </td>
               <td>
                  <select className="form-control" id="Problemstatement" required="">
                     <option selected="">Select Method</option>
                     <option>Straight-Line Depreciation</option>
                     <option>Declining Balance Depreciation</option>
                     <option>Sum-of-the-Years' Digits Depreciation</option>
                     <option>Units of Production Depreciation</option>
                     <option>Others</option>
                  </select>
               </td>
               <td><input className="form-control" id="Interactioncat" placeholder="" type="number" value="" />
               </td>
               <td>
                  <input className="form-control" id="Interactioncat" placeholder="" type="number" value="" />
               </td>
            </tr>
         </table>
      </div>
      <div className="skel-role-base mt-2">
         <div className="row col-12 mt-2">
            <div className="col-6 px-3">
               <h4>Loans</h4>
            </div>
            <div className="col-6 text-right">
            </div>
         </div>
         <table id="employee-table" className="table table-bordered table-striped">
            <tr>
               <th>Loan No.
               </th>
               <th>Bank/Vendor
               </th>
               <th>Loan Amount($)
               </th>
               <th>Duration
               </th>
               <th>Start Date
               </th>
               <th>End Date
               </th>
               <th>EMI Value($)
               </th>
            </tr>
            <tr>
               <td><input className="form-control" id="Interactioncat" placeholder="" type="text" value="" />
               </td>
               <td><input className="form-control" id="Interactioncat" placeholder="" type="text" value="" />
               </td>
               <td><input className="form-control" id="Interactioncat" placeholder="" type="number" value="" />
               </td>
               <td><input className="form-control" id="Interactioncat" placeholder="" type="number" value="" />
               </td>
               <td><input className="form-control" id="Interactioncat" placeholder="" type="date" value="" />
               </td>
               <td><input className="form-control" id="Interactioncat" placeholder="" type="date" value="" />
               </td>
               <td>
                  <input className="form-control" id="Interactioncat" placeholder="" type="number" value="" />
               </td>
            </tr>
         </table>
      </div>
   </div>
  )
}

export default Financial;