/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState, useContext } from 'react';
import { properties } from "../../properties";
import { post } from "../../common/util/restUtil";
import { InventoryContext } from "../../AppContext";

const AssetDetail = () => {

   const { data, handlers } = useContext(InventoryContext);

    const {itemCategoryLookup, itemStatusLookup, itemTypeLookup, itemData, uomCategoryLookup, error} = data
    const { setItemData, handleOnchange } = handlers
    return (     
        <div>
        <span>
           <h4>Inventory Details</h4>
        </span>
        <div className="skel-role-base">
           <div className="skel-tabs-role-config p-2">
              <div className="col-12">
                 <div className="col-md-12 row">
                    <div className="col-md-3">
                       <div className="form-group">
                          <label for="Interactioncat" className="control-label">Item Name<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                          <input className="form-control" name="itemName" placeholder="" type="text" value={itemData.itemName} onChange={handleOnchange}/>
                       </div>
                       <span className="errormsg">{error.itemName ? error.itemName : ""}</span>
                    </div>
                    <div className="col-md-3">
                       <div className="form-group">
                          <label for="interationtype" className="control-label">Item Type<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                          <div className="custselect">
                             <select className="form-control" id="itemType" name="itemType" required="" value={itemData.itemType} onChange={handleOnchange}>
                                <option selected="">Select...</option>
                                {
                                 itemTypeLookup.map((v, k)=>(
                                    <option key={k} value={v.code}>{v.description}</option>
                                 ))
                                }
                             </select>
                          </div>
                          <span className="errormsg">{error.itemType ? error.itemType : ""}</span>
                       </div>
                    </div>
                    <div className="col-md-3">
                       <div className="form-group">
                          <label for="Servicecat" className="control-label">Item Category <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                          <div className="custselect">
                             <select className="form-control" name="itemCategory" required="" onChange={handleOnchange}>
                                <option selected="">Choose Item Category</option>
                                {
                                 itemCategoryLookup.map((v, k)=>(
                                    <option key={k} value={v.code}>{v.description}</option>
                                 ))
                                }
                             </select>
                          </div>
                          <span className="errormsg">{error.itemCategory ? error.itemCategory : ""}</span>
                       </div>
                    </div>
                    <div className="col-md-3">
                       <div className="form-group">
                          <label for="Interactioncat" className="control-label">Item-Inventory ID<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                          <input className="form-control" name="itemCode" placeholder="Itemcode" type="text" value={itemData.itemCode} onChange={handleOnchange}/>                                                     
                       </div>
                       <span className="errormsg">{error.itemCode ? error.itemCode : ""}</span>
                    </div>
                    <div className="col-md-3 mt-2">
                       <div className="form-group">
                          <label for="Interactioncat" className="control-label">Item Location<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                          <input className="form-control" name="itemLocation" placeholder="Location" type="text" value={itemData.itemLocation} onChange={handleOnchange}/>                                                     
                       </div>
                       <span className="errormsg">{error.itemLocation ? error.itemLocation : ""}</span>
                    </div>
                    <div className="col-md-3 mt-2">
                       <div className="form-group">
                          <label for="Interactioncat" className="control-label">Item Managed by<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                          <input className="form-control" name="itemManagedBy" placeholder="Itemcode" type="text" value={itemData.itemManagedBy} onChange={handleOnchange}/>                                                     
                       </div>
                       <span className="errormsg">{error.itemManagedBy ? error.itemManagedBy : ""}</span>
                    </div>
                    <div className="col-md-3 mt-2">
                       <div className="form-group">
                          <label for="Servicetype" className="control-label">Asset is Currently<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                          <div className="custselect">
                             <select className="form-control" name="invItemStatus" required="" onChange={handleOnchange}>
                                <option selected="">Choose State</option>
                                {
                                 itemStatusLookup.map((v, k)=>(
                                    <option key={k} value={v.code}>{v.description}</option>
                                 ))
                                }
                             </select>
                          </div>
                          <span className="errormsg">{error.invItemStatus ? error.invItemStatus : ""}</span>
                       </div>
                    </div>
                    <div className="col-md-3 mt-2">
                       <div className="form-group">
                          <label for="Priority" className="control-label">Business Impact</label>
                          <div className="custselect">
                             <select className="form-control" name="businessImpact" required="" onChange={handleOnchange}>
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
                          <label for="Priority" className="control-label">Item Description</label>
                          <input className="form-control" name="description" placeholder="" type="text" value={itemData.description} onChange={handleOnchange}/>
                       </div>
                    </div>
                    <div className="col-md-3 mt-2">
                       <div className="form-group">
                          <label for="Interactionsol" className="control-label">Unit of Measure (UOM)</label>
                          <div className="custselect">
                             <select className="form-control" name="uom" required="" onChange={handleOnchange}>
                                <option selected="">Select UOM</option>
                                {
                                 uomCategoryLookup.map((v, k)=>(
                                    <option key={k} value={v.code}>{v.description}</option>
                                 ))
                                }
                             </select>
                          </div>
                       </div>
                    </div>
                    <div className="col-md-3 mt-2">
                       <div className="form-group">
                          <label for="Interactionsol" className="control-label">Supplier/Vendor Name</label>
                          <input className="form-control" name="vendorName" placeholder="" type="text" value={itemData.vendorName} onChange={handleOnchange}/>                                                          
                       </div>
                    </div>
                    <div className="col-md-3 mt-2">
                       <div className="form-group">
                          <label for="Interactionsol" className="control-label">Purchase/Inventory Requisition No.</label>
                          <input className="form-control" name="requisitionNo" placeholder="" type="text" value={itemData.requisitionNo} onChange={handleOnchange}/>                                                          
                       </div>
                    </div>
                    <div className="col-md-3 mt-2">
                       <div className="form-group">
                          <label for="Interactionsol" className="control-label">Purchase Order No</label>
                          <input className="form-control" name="purchaseOrderNo" placeholder="" type="text" value={itemData.purchaseOrderNo} onChange={handleOnchange}/>                                                          
                       </div>
                    </div>
                    <div className="col-md-3 mt-2">
                       <div className="form-group">
                          <label for="Interactionsol" className="control-label">Purchase Order Date</label>
                          <input className="form-control" name="purchaseOrderDate" placeholder="" type="date" value={itemData.purchaseOrderDate} onChange={handleOnchange} />                                                          
                       </div>
                    </div>
                    <div className="col-md-3 mt-2">
                       <div className="form-group">
                          <label for="Interactionsol" className="control-label">Invoice Ref Number</label>
                          <input className="form-control" name="invoiceRefNo" placeholder="" type="text" value={itemData.invoiceRefNo} onChange={handleOnchange} />                                                          
                       </div>
                    </div>
                    <div className="col-md-3 mt-2">
                       <div className="form-group">
                          <label for="Interactionsol" className="control-label">DC Number</label>
                          <input className="form-control" name="dcNumber" placeholder="" type="text" value={itemData.dcNumber} onChange={handleOnchange} />                                                          
                       </div>
                    </div>
                    <div className="col-md-3 mt-2">
                       <div className="form-group">
                          <label for="Interactionsol" className="control-label">Warranty Duration (Months)</label>
                          <input className="form-control" name="warrantyDuration" placeholder="" type="number" value={itemData.warrentyDuration} onChange={handleOnchange} />                                                          
                       </div>
                    </div>
                    <div className="col-md-3 mt-2">
                       <div className="form-group">
                          <label for="Interactionsol" className="control-label">Warranty Code</label>
                          <input className="form-control" name="warrantyCode" placeholder="" type="text" value={itemData.warrentyCode} onChange={handleOnchange} />                                                          
                       </div>
                    </div>
                    <div className="col-md-3 mt-2">
                       <div className="form-group">
                          <label for="Interactionsol" className="control-label">Warranty Expiry Date</label>
                          <input className="form-control" name="warrantyExpiryDate" placeholder="" type="date" value={itemData.warrentyExpiryDate} onChange={handleOnchange} />                                                          
                       </div>
                    </div>
                    <div className="col-md-3 mt-2">
                       <div className="form-group">
                          <label for="Interactionsol" className="control-label">Bar Code/RFID/GPRS/QR ID</label>
                          <input className="form-control" name="barCode" placeholder="" type="text" value={itemData.barCode} onChange={handleOnchange} />                                                          
                       </div>
                    </div>
                    <div className="col-md-12 mt-4 row">
                       <div className="col-md-6">
                          <div className="form-group uploader">
                             <label for="Contactpreferenece" className="control-label">Upload Item Photo</label><br />
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