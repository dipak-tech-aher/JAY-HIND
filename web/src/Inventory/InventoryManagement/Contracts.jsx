/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState, useContext } from 'react';
import { properties } from "../../properties";
import { post } from "../../common/util/restUtil";
import { unstable_batchedUpdates } from 'react-dom';
import { InventoryContext } from "../../AppContext";


const Contracts = () => {
   const { data, handlers } = useContext(InventoryContext);
   const { itemContractTypeLookup, itemData } = data
   const { setItemData, setItemContractTypeLookup } = handlers
 
   const [itemContractDataList, setItemContractDataList] = useState([{ 
     itemContractType: '',
     itemContractName: '',
     itemContractMonths: '',
     itemContractFromDate: '',
     itemContractToDate: ''
   }]); 
 
   const addContractRow = () => {
     setItemContractDataList([...itemContractDataList, { 
      itemContractType: '',
      itemContractName: '',
      itemContractMonths: '',
      itemContractFromDate: '',
      itemContractToDate: ''
     }]);
   };
 
   const removeContractRow = (index) => {
     const updatedList = itemContractDataList.filter((item, i) => i !== index);
     setItemContractDataList(updatedList);
   };
 
   const handleOnchangeContract = (e, index) => {
     const { name, value } = e.target;
     const updatedList = [...itemContractDataList];
     updatedList[index][name] = value;
     setItemContractDataList(updatedList);
     setItemData({
       ...itemData,
       itemContractDataList: updatedList
     })
   };
    return (
        <div>
        <span>
           <h4>Contracts</h4>
        </span>
        <div className="skel-role-base">
           <div className="skel-tabs-role-config p-2">
              <div className="col-12">
                 <div className="col-md-12 ">
                    {/* <div className="row">
                       <div className="col-6"></div>
                       <div className="col-6 text-right mb-2"><button onclick="addNewRow()" className="btn btn-primary btn-sm">Add New Contract
                          </button>
                       </div>
                    </div> */}
                    <table id="employee-table" className="table table-bordered table-striped">
                       <tr>
                          <th>Contract ID</th>
                          <th>Contract Name</th>
                          <th>Contract Type</th>
                          <th>Contract Months</th>
                          <th>From Date</th>
                          <th>To Date</th>
                          <th>Action</th>
                       </tr>
                       {itemContractDataList?.map((itemData, i) => (
                       <tr key={i}>
                          <td><input className="form-control" id="contractId" placeholder="" type="text" value={itemData.contractId} onChange={e=>handleOnchangeContract(e, i)} />
                          </td>
                          <td><input className="form-control" id="contractName" placeholder="" type="text" value={itemData.itemContractName} onChange={e=>handleOnchangeContract(e, i)} />
                          </td>
                          <td>
                             <select className="form-control" id="contractType" required="" value={itemData.itemContractType} onChange={e=>handleOnchangeContract(e, i)}>
                                <option selected="">Select Type</option>
                                <option>AMC</option>
                                <option>Insurance</option>
                             </select>
                          </td>
                          <td><input className="form-control" id="contractMonths" placeholder="" type="number" value={itemData.itemContractMonths} onChange={e=>handleOnchangeContract(e, i)} />
                          </td>
                          <td><input className="form-control" id="contractFromDate" placeholder="" type="date" value={itemData.itemContractFromDate} onChange={e=>handleOnchangeContract(e, i)} />
                          </td>
                          <td><input className="form-control" id="contractToDate" placeholder="" type="date" value={itemData.itemContractToDate} onChange={e=>handleOnchangeContract(e, i)} />
                          </td>
                          <td>{(i == 0) ? (
                              <a className="btn btn-primary btn-sm" onClick={addContractRow}>
                                    <i className="fa fa-plus"></i>
                              </a>
                           ) : (
                              <a className="btn btn-danger btn-sm" onClick={(e) => removeContractRow(i)}>
                                    <i className="fa fa-minus"></i>
                              </a>
                           )}
                          </td>
                       </tr>
                       ))}
                    </table>
                 </div>
              </div>
           </div>
        </div>
     </div>
    )
}

export default Contracts;