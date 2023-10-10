/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import { properties } from "../properties";
import { post } from "../common/util/restUtil";
import { unstable_batchedUpdates } from 'react-dom';


const Hardware = (props) => {

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
                              <label for="Interactioncat" className="control-label">System Name<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                              <input className="form-control" id="Interactioncat" placeholder="Latitude E6430" type="text" value="" />
                           </div>
                        </div>
                        <div className="col-md-3 mt-2">
                           <div className="form-group">
                              <label for="interationtype" className="control-label">Service Tag	
                              <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                              <input className="form-control" id="Interactioncat" placeholder="Latitude E6430" type="text" value="" />
                           </div>
                        </div>
                        <div className="col-md-3 mt-2">
                           <div className="form-group">
                              <label for="Problemstatement" className="control-label">Brand/Model<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                              <div className="custselect">
                                 <select className="form-control" id="Problemstatement" required="">
                                    <option selected="">Select Brand</option>
                                    <option>Dell</option>
                                    <option>Acer</option>
                                    <option>HP</option>
                                    <option>Apple</option>
                                    <option>Google</option>
                                 </select>
                              </div>
                           </div>
                        </div>
                        <div className="col-md-3 mt-2">
                           <div className="form-group">
                              <label for="Interactionsol" className="control-label">Modal<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                              <div className="custselect">
                                 <select aria-label="" title="" id="SystemInfo_MODEL" name="CI_SystemInfo_MODEL" className="form-control form-control-auto">
                                    <option value="null">-- Choose Model --</option>
                                    <option value="49">Cisco DW678</option>
                                    <option value="606">Date</option>
                                    <option value="2112">getconf MACHINE_MODEL</option>
                                    <option value="72">gsx</option>
                                    <option value="1804">HP COMPAQ</option>
                                    <option value="1803">HPD220MT</option>
                                    <option value="907">HVM domU</option>
                                    <option value="2402">IBM,8231-E2B</option>
                                    <option value="6">iMac</option>
                                    <option value="601">Intel</option>
                                    <option value="603">Kingston server</option>
                                    <option value="16">Latitude D620</option>
                                    <option value="14">Latitude E6420</option>
                                    <option value="15">Latitude E6430</option>
                                    <option value="2115">Latitude E7470</option>
                                    <option value="9">Mac Pro</option>
                                    <option value="8">MacBook Pro</option>
                                    <option value="3">OptiPlex 755</option>
                                    <option value="2103">OptiPlex 9010 AIO</option>
                                    <option value="4">OptiPlex GX260</option>
                                    <option value="2111">PowerEdge R730</option>
                                    <option value="2">VMware Virtual Platform</option>
                                    <option value="30">VMware7,1</option>
                                    <option value="5">Others</option>
                                 </select>
                              </div>
                           </div>
                        </div>
                        <div className="col-md-3 mt-2">
                           <div className="form-group">
                              <label for="Interactionsol" className="control-label">Enter Modal<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                              <input className="form-control" id="Interactioncat" placeholder="" type="text" value="" />                                                         
                           </div>
                        </div>
                        <div className="col-md-3 mt-2">
                           <div className="form-group">
                              <label for="Servicecat" className="control-label">Operating System<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                              <div className="custselect">
                                 <select className="form-control" id="Servicecat" required="">
                                    <option selected="">Select OS</option>
                                    <option>Windows 10</option>
                                    <option>Windows Server OS 12</option>
                                    <option>Ubundu 11</option>
                                    <option>Redhat Linux 12.2</option>
                                 </select>
                              </div>
                           </div>
                        </div>
                        <div className="col-md-3 mt-2">
                           <div className="form-group">
                              <label for="Servicetype" className="control-label">Processor <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                              <input className="form-control" id="Interactioncat" placeholder="" type="text" value="" />
                           </div>
                        </div>
                        <div className="col-md-3 mt-2">
                           <div className="form-group">
                              <label for="Servicetype" className="control-label">Manufacturer <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                              <input className="form-control" id="Interactioncat" placeholder="" type="text" value="" />
                           </div>
                        </div>
                        <div className="col-md-3 mt-2">
                           <div className="form-group">
                              <label for="Servicetype" className="control-label">Number of cores
                              <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                              <input className="form-control" id="Interactioncat" placeholder="" type="text" value="" />
                           </div>
                        </div>
                        <div className="col-md-3 mt-2">
                           <div className="form-group">
                              <label for="Servicetype" className="control-label">Speed
                              <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                              <input className="form-control" id="Interactioncat" placeholder="" type="text" value="" />
                           </div>
                        </div>
                        <div className="col-md-3 mt-2">
                           <div className="form-group">
                              <label for="Interactionsol" className="control-label">Hard Disk Make</label>
                              <input className="form-control" id="Interactioncat" placeholder="" type="text" value="" />                                                          
                           </div>
                        </div>
                        <div className="col-md-3 mt-2">
                           <div className="form-group">
                              <label for="Interactionsol" className="control-label">HDD Capacity </label>
                              <input className="form-control" id="Interactioncat" placeholder="" type="text" value="" />                                                          
                           </div>
                        </div>
                        <div className="col-md-3 mt-2">
                           <div className="form-group">
                              <label for="Interactionsol" className="control-label">HDD Serial No</label>
                              <input className="form-control" id="Interactioncat" placeholder="" type="date" value="" />                                                          
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
                              <label for="Interactionsol" className="control-label">IP Address</label>
                              <input className="form-control" id="Interactioncat" placeholder="" type="date" value="" />                                                          
                           </div>
                        </div>
                        <div className="col-md-3 mt-2">
                           <div className="form-group">
                              <label for="Interactionsol" className="control-label">MAC Address</label>
                              <input className="form-control" id="Interactioncat" placeholder="" type="date" value="" />                                                          
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