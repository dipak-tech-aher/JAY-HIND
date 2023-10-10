/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState, useContext } from 'react';
import { properties } from "../../properties";
import { post } from "../../common/util/restUtil";
import { InventoryContext } from "../../AppContext";


const Hardware = () => {

   const { data, handlers } = useContext(InventoryContext);

    const {itemBrandLookup, itemModelLookup, itemOSLookup, itemData} = data
    const { setItemData, handleOnchange } = handlers
    return (
        <div>
            <span>
               <h4>Hardware</h4>
            </span>
            <div className="skel-role-base">
               <div className="skel-tabs-role-config p-2">
                  <div className="col-12">
                     <div className="col-md-12 row">
                        <div className="col-md-3 mt-2">
                           <div className="form-group">
                              <label for="systemName" className="control-label">System Name<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                              <input className="form-control" name="systemName" placeholder="" type="text" value={itemData.systemName} onChange={handleOnchange} />
                           </div>
                        </div>
                        <div className="col-md-3 mt-2">
                           <div className="form-group">
                              <label for="serviceTag" className="control-label">Service Tag	
                              <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                              <input className="form-control" name="serviceTag" placeholder="" type="text" value={itemData.serviceTag} onChange={handleOnchange} />
                           </div>
                        </div>
                        <div className="col-md-3 mt-2">
                           <div className="form-group">
                              <label for="brand" className="control-label">Brand<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                              <div className="custselect">
                                 <select className="form-control" name="brand" required="" value={itemData.brand} onChange={handleOnchange} >
                                    <option selected="">Select Brand</option>
                                    {
                                 itemBrandLookup.map((v, k)=>(
                                    <option key={k} value={v.code}>{v.description}</option>
                                 ))
                                }
                                 </select>
                              </div>
                           </div>
                        </div>
                        <div className="col-md-3 mt-2">
                           <div className="form-group">
                              <label for="modal" className="control-label">Modal<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                              <div className="custselect">
                                 <select aria-label="" title="" name="modal" className="form-control form-control-auto" value={itemData.modal} onChange={handleOnchange}>
                                    <option value="null">-- Choose Model --</option>
                                    {
                                 itemModelLookup.map((v, k)=>(
                                    <option key={k} value={v.code}>{v.description}</option>
                                 ))
                                }
                                 </select>
                              </div>
                           </div>
                        </div>
                        <div className="col-md-3 mt-2">
                           <div className="form-group">
                              <label for="modelOther" className="control-label">Enter Modal<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                              <input className="form-control" name="modelOther" placeholder="" type="model" value={itemData.modelOther} onChange={handleOnchange} />                                                         
                           </div>
                        </div>
                        <div className="col-md-3 mt-2">
                           <div className="form-group">
                              <label for="os" className="control-label">Operating System<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                              <div className="custselect">
                                 <select className="form-control" name="os" required="" value={itemData.os} onChange={handleOnchange}>
                                    <option selected="">Select OS</option>
                                    {
                                 itemOSLookup.map((v, k)=>(
                                    <option key={k} value={v.code}>{v.description}</option>
                                 ))
                                }
                                 </select>
                              </div>
                           </div>
                        </div>
                        <div className="col-md-3 mt-2">
                           <div className="form-group">
                              <label for="processor" className="control-label">Processor <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                              <input className="form-control" name="processor" placeholder="" type="text" value={itemData.processor} onChange={handleOnchange} />
                           </div>
                        </div>
                        <div className="col-md-3 mt-2">
                           <div className="form-group">
                              <label for="manufacturer" className="control-label">Manufacturer <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                              <input className="form-control" name="manufacturer" placeholder="" type="text" value={itemData.manufacturer} onChange={handleOnchange} />
                           </div>
                        </div>
                        <div className="col-md-3 mt-2">
                           <div className="form-group">
                              <label for="noOfCores" className="control-label">Number of cores
                              <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                              <input className="form-control" name="noOfCores" placeholder="" type="text" value={itemData.noOfCores} onChange={handleOnchange} />
                           </div>
                        </div>
                        <div className="col-md-3 mt-2">
                           <div className="form-group">
                              <label for="speed" className="control-label">Speed
                              <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                              <input className="form-control" name="speed" placeholder="" type="text" value={itemData.speed} onChange={handleOnchange} />
                           </div>
                        </div>
                        <div className="col-md-3 mt-2">
                           <div className="form-group">
                              <label for="hardDiskMake" className="control-label">Hard Disk Make</label>
                              <input className="form-control" name="hardDiskMake" placeholder="" type="text" value={itemData.hardDiskMake} onChange={handleOnchange} />                                                          
                           </div>
                        </div>
                        <div className="col-md-3 mt-2">
                           <div className="form-group">
                              <label for="hddCapacity" className="control-label">HDD Capacity </label>
                              <input className="form-control" name="hddCapacity" placeholder="" type="text" value={itemData.hddCapacity} onChange={handleOnchange} />                                                          
                           </div>
                        </div>
                        <div className="col-md-3 mt-2">
                           <div className="form-group">
                              <label for="hddSerialNo" className="control-label">HDD Serial No</label>
                              <input className="form-control" name="hddSerialNo" placeholder="" type="date" value={itemData.hddSerialNo} onChange={handleOnchange} />                                                          
                           </div>
                        </div>
                        <div className="col-md-3 mt-2">
                           <div className="form-group">
                              <label for="warrantyCode" className="control-label">Warranty Code</label>
                              <input className="form-control" name="warrantyCode" placeholder="" type="text" value={itemData.warrantyCode} onChange={handleOnchange} />                                                          
                           </div>
                        </div>
                        <div className="col-md-3 mt-2">
                           <div className="form-group">
                              <label for="ipAddress" className="control-label">IP Address</label>
                              <input className="form-control" name="ipAddress" placeholder="" type="date" value={itemData.ipAddress} onChange={handleOnchange} />                                                          
                           </div>
                        </div>
                        <div className="col-md-3 mt-2">
                           <div className="form-group">
                              <label for="macAddress" className="control-label">MAC Address</label>
                              <input className="form-control" name="macAddress" placeholder="" type="date" value={itemData.macAddress} onChange={handleOnchange} />                                                          
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>                          
    )
}

export default Hardware;