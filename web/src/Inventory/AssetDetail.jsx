/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import { properties } from "../properties";
import { post } from "../common/util/restUtil";

const AssetDetail = (props) => {

    
    return (     
        <div>
        <span>
           <h4>Asset Details</h4>
        </span>
        <div className="skel-role-base">
           <div className="skel-tabs-role-config p-2">
              <div className="col-12">
                 <div className="col-md-12 row">
                    <div className="col-md-3">
                       <div className="form-group">
                          <label for="Interactioncat" className="control-label">Product Name<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                          <input className="form-control" id="Interactioncat" placeholder="" type="text" value="" />
                       </div>
                    </div>
                    <div className="col-md-3">
                       <div className="form-group">
                          <label for="interationtype" className="control-label">Product Type<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                          <div className="custselect">
                             <select className="form-control" id="interationtype" required="">
                                <option selected="">Choose Product Type</option>
                                <option>Hardware</option>
                                <option>Software</option>
                                <option>Accessories</option>
                                <option>Utility</option>
                                <option>Consumables</option>
                                <option>Equipments</option>
                             </select>
                          </div>
                       </div>
                    </div>
                    <div className="col-md-3">
                       <div className="form-group">
                          <label for="Servicecat" className="control-label">Product Category <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                          <div className="custselect">
                             <select className="form-control" id="Servicecat" required="">
                                <option selected="">Choose Product Category</option>
                                <option>Desktop</option>
                                <option>Laptop</option>
                                <option>Server</option>
                                <option>Tablet</option>
                                <option>Mobile</option>
                                <option>Keyboard</option>
                                <option>Mouse</option>
                             </select>
                          </div>
                       </div>
                    </div>
                    <div className="col-md-3">
                       <div className="form-group">
                          <label for="Interactioncat" className="control-label">Product-Inventory ID<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                          <input className="form-control" id="itemcode" placeholder="Itemcode" type="text" value="" />                                                     
                       </div>
                    </div>
                    <div className="col-md-3 mt-2">
                       <div className="form-group">
                          <label for="Interactioncat" className="control-label">Product Location<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                          <input className="form-control" id="itemcode" placeholder="Location" type="text" value="" />                                                     
                       </div>
                    </div>
                    <div className="col-md-3 mt-2">
                       <div className="form-group">
                          <label for="Interactioncat" className="control-label">Product Managed by<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                          <input className="form-control" id="itemcode" placeholder="Itemcode" type="text" value="IT Team" />                                                     
                       </div>
                    </div>
                    <div className="col-md-3 mt-2">
                       <div className="form-group">
                          <label for="Servicetype" className="control-label">Asset is Currently<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                          <div className="custselect">
                             <select className="form-control" id="Servicetype" required="">
                                <option selected="">Choose State</option>
                                <option>Instore</option>
                                <option>In Use</option>
                                <option>In Repair</option>
                                <option>Expired</option>
                                <option>Disposed</option>
                                <option>Damaged</option>
                                <option>Stolen</option>
                             </select>
                          </div>
                       </div>
                    </div>
                    <div className="col-md-3 mt-2">
                       <div className="form-group">
                          <label for="Priority" className="control-label">Business Impact</label>
                          <div className="custselect">
                             <select className="form-control" id="Priority" required="">
                                <option selected="">Choose</option>
                                <option>HIGH</option>
                                <option>LOW</option>
                                <option>MEDIUM</option>
                             </select>
                          </div>
                       </div>
                    </div>
                    <div className="col-md-3 mt-2">
                       <div className="form-group">
                          <label for="Priority" className="control-label">Product Description</label>
                          <input className="form-control" id="Interactioncat" placeholder="" type="text" value="" />
                       </div>
                    </div>
                    <div className="col-md-3 mt-2">
                       <div className="form-group">
                          <label for="Interactionsol" className="control-label">Unit of Measure (UOM)</label>
                          <div className="custselect">
                             <select className="form-control" id="Problemstatement" required="">
                                <option selected="">Select UOM</option>
                                <option>UOM 1</option>
                                <option>UOM 2</option>
                             </select>
                          </div>
                       </div>
                    </div>
                    <div className="col-md-3 mt-2">
                       <div className="form-group">
                          <label for="Interactionsol" className="control-label">Supplier/Vendor Name</label>
                          <input className="form-control" id="Interactioncat" placeholder="" type="text" value="" />                                                          
                       </div>
                    </div>
                    <div className="col-md-3 mt-2">
                       <div className="form-group">
                          <label for="Interactionsol" className="control-label">Purchase/Inventory Requisition No.</label>
                          <input className="form-control" id="Interactioncat" placeholder="" type="text" value="" />                                                          
                       </div>
                    </div>
                    <div className="col-md-3 mt-2">
                       <div className="form-group">
                          <label for="Interactionsol" className="control-label">Purchase Order No</label>
                          <input className="form-control" id="Interactioncat" placeholder="" type="text" value="" />                                                          
                       </div>
                    </div>
                    <div className="col-md-3 mt-2">
                       <div className="form-group">
                          <label for="Interactionsol" className="control-label">Purchase Order Date</label>
                          <input className="form-control" id="Interactioncat" placeholder="" type="date" value="" />                                                          
                       </div>
                    </div>
                    <div className="col-md-3 mt-2">
                       <div className="form-group">
                          <label for="Interactionsol" className="control-label">Invoice Ref Number</label>
                          <input className="form-control" id="Interactioncat" placeholder="" type="text" value="" />                                                          
                       </div>
                    </div>
                    <div className="col-md-3 mt-2">
                       <div className="form-group">
                          <label for="Interactionsol" className="control-label">DC Number</label>
                          <input className="form-control" id="Interactioncat" placeholder="" type="text" value="" />                                                          
                       </div>
                    </div>
                    <div className="col-md-3 mt-2">
                       <div className="form-group">
                          <label for="Interactionsol" className="control-label">Warrenty Duration (Months)</label>
                          <input className="form-control" id="Interactioncat" placeholder="" type="number" value="" />                                                          
                       </div>
                    </div>
                    <div className="col-md-3 mt-2">
                       <div className="form-group">
                          <label for="Interactionsol" className="control-label">Warrenty Code</label>
                          <input className="form-control" id="Interactioncat" placeholder="" type="text" value="" />                                                          
                       </div>
                    </div>
                    <div className="col-md-3 mt-2">
                       <div className="form-group">
                          <label for="Interactionsol" className="control-label">Warrenty Expiry Date</label>
                          <input className="form-control" id="Interactioncat" placeholder="" type="date" value="" />                                                          
                       </div>
                    </div>
                    <div className="col-md-3 mt-2">
                       <div className="form-group">
                          <label for="Interactionsol" className="control-label">Bar Code/RFID/GPRS/QR ID</label>
                          <input className="form-control" id="Interactioncat" placeholder="" type="text" value="" />                                                          
                       </div>
                    </div>
                    <div className="col-md-12 mt-4 row">
                       <div className="col-md-6">
                          <div className="form-group uploader">
                             <label for="Contactpreferenece" className="control-label">Upload Product Photo</label><br />
                             <input id="file-upload" type="file" name="fileUpload" accept="image/*"/>
                             <label className="file-upload-base" for="file-upload" id="file-drag">
                                <img id="file-image" src="#" alt="Preview" className="hidden"/>
                                <div id="start">
                                   <i className="material-icons" aria-hidden="true">upload</i>
                                   <div>Upload File</div>
                                   <div id="notimage" className="hidden">Please select an image</div>
                                </div>
                             </label>
                          </div>
                       </div>
                       <div className="col-md-6">
                          <div className="form-group uploader">
                             <label for="Contactpreferenece" className="control-label">Upload Supporting Documents</label><br />
                             <input id="file-upload" type="file" name="fileUpload" accept="image/*"/>
                             <label className="file-upload-base" for="file-upload" id="file-drag">
                                <img id="file-image" src="#" alt="Preview" className="hidden"/>
                                <div id="start">
                                   <i className="material-icons" aria-hidden="true">upload</i>
                                   <div>Upload File</div>
                                   <div id="notimage" className="hidden">Please select an image</div>
                                </div>
                             </label>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
     </div>    
    )
}

export default AssetDetail;