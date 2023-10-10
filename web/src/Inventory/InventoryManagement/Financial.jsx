/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState, useContext } from 'react';
import { NumberFormatBase } from 'react-number-format';
import { InventoryContext } from "../../AppContext";


const Financial = () => {
   const { data, handlers } = useContext(InventoryContext);
   const { itemVariantLookup, itemVariantTypeLookup, itemData } = data
   const { setItemData, setItemVariantTypeLookup } = handlers

   const [itemCostDataList, setItemCostDataList] = useState([{ 
      itemCostDate: '',
      itemCostDetail: '',
      itemCostDescription: '',
      itemCostAmount: '',
    }]);

   const [itemDepreciationDataList, setItemDepreciationDataList] = useState([{ 
      itemPurchaseCost: '',
      itemAcquisitionDate: '',
      itemDepreciationMethod: '',
      itemLife: '',
      itemSalvageValue: '',
    }]); 
   
    const [itemLoanDataList, setItemLoanDataList] = useState([{ 
      itemLoanNo: '',
      itemLoanBank: '',
      itemLoanAmount: '',
      itemLoanDuration: '',
      itemLoanStartDate: '',
      itemLoanEndDate: '',
      itemLoanEMIValue: '',

    }]); 
  
    const addCostRow = () => {
      setItemCostDataList([...itemCostDataList, { 
       itemCostDate: '',
       itemCostDetail: '',
       itemCostDescription: '',
       itemCostAmount: '',
      }]);
    };
  
    const removeCostRow = (index) => {
      const updatedList = itemCostDataList.filter((item, i) => i !== index);
      setItemCostDataList(updatedList);
    };
  
    const handleOnchangeCost = (e, index) => {
      const { name, value } = e.target;
      const updatedList = [...itemCostDataList];
      updatedList[index][name] = value;
      setItemCostDataList(updatedList);
      setItemData({
        ...itemData,
        itemCostDataList: updatedList
      })
    };
    const handleOnchangeDepreciation = (e) => {
      const { name, value } = e.target;
      const updatedList = [...itemCostDataList];
      updatedList[name] = value;
      setItemCostDataList(updatedList);
      setItemData({
        ...itemData,
        itemCostDataList: updatedList
      })
    };
    const handleOnchangeLoan = (e) => {
      const { name, value } = e.target;
      const updatedList = [...itemCostDataList];
      updatedList[name] = value;
      setItemCostDataList(updatedList);
      setItemData({
        ...itemData,
        itemCostDataList: updatedList
      })
    };

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
            {itemCostDataList?.map((itemData, i) => (
            <tr>
               <td><input className="form-control" id="itemCostDate" placeholder="" type="date" value={itemData.itemCostDate} onChange={e=> handleOnchangeCost(e, i)} />
               </td>
               <td>
                  <select className="form-control" id="itemCostDetail" required="">
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
               <td><input className="form-control" id="itemCostDescription" placeholder="" type="text" value={itemData.itemCostDescription} onChange={e=> handleOnchangeCost(e, i)} />
               </td>
               <td><input className="form-control" id="itemCostAmount" placeholder="" type="number" value={itemData.itemCostAmount} onChange={e=> handleOnchangeCost(e, i)} />
               </td>
               <td>{(i == 0) ? (
                          <a className="btn btn-primary btn-sm" onClick={addCostRow}>
                              <i className="fa fa-plus"></i>
                          </a>
                      ) : (
                          <a className="btn btn-danger btn-sm" onClick={(e) => removeCostRow(i)}>
                              <i className="fa fa-minus"></i>
                          </a>
                      )}
               </td>
            </tr>
            ))}
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
            {itemDepreciationDataList?.map((itemData, i) => (
            <tr key={i}>
               <td><input className="form-control" id="purchaseCost" placeholder="" type="number" value={itemData.itemPurchaseCost} onChange={e=> handleOnchangeDepreciation(e)} />
               </td>
               <td><input className="form-control" id="acquisitionDate" placeholder="" type="date" value={itemData.itemAcquisitionDate} onChange={e=> handleOnchangeDepreciation(e)} />
               </td>
               <td>
                  <select className="form-control" id="depreciationMethod" required="" value={itemData.itemDepreciationMethod} onChange={e=> handleOnchangeDepreciation(e)}>
                     <option selected="">Select Method</option>
                     <option>Straight-Line Depreciation</option>
                     <option>Declining Balance Depreciation</option>
                     <option>Sum-of-the-Years' Digits Depreciation</option>
                     <option>Units of Production Depreciation</option>
                     <option>Others</option>
                  </select>
               </td>
               <td><input className="form-control" id="life" placeholder="" type="number" value={itemData.itemLife} onChange={e=> handleOnchangeDepreciation(e)} />
               </td>
               <td>
                  <input className="form-control" id="salvageValue" placeholder="" type="number" value={itemData.itemSalvageValue} onChange={e=> handleOnchangeDepreciation(e)} />
               </td>
            </tr>
            ))}
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
            {itemLoanDataList?.map((itemData, i) => (
            <tr key={i}>
               <td><input className="form-control" id="loanNo" placeholder="" type="text" value={itemData.itemLoanNo} onChange={e=> handleOnchangeLoan(e)} />
               </td>
               <td><input className="form-control" id="loanBank" placeholder="" type="text" value={itemData.itemLoanBank} onChange={e=> handleOnchangeLoan(e)} />
               </td>
               <td><input className="form-control" id="loanAmount" placeholder="" type="number" value={itemData.itemLoanAmount} onChange={e=> handleOnchangeLoan(e)} />
               </td>
               <td><input className="form-control" id="loanDuration" placeholder="" type="number" value={itemData.itemLoanDuration} onChange={e=> handleOnchangeLoan(e)} />
               </td>
               <td><input className="form-control" id="loanStartDate" placeholder="" type="date" value={itemData.itemLoanStartDate} onChange={e=> handleOnchangeLoan(e)} />
               </td>
               <td><input className="form-control" id="loadEndDate" placeholder="" type="date" value={itemData.itemLoanEndDate} onChange={e=> handleOnchangeLoan(e)} />
               </td>
               <td>
                  <input className="form-control" id="loadEmiValue" placeholder="" type="number" value={itemData.itemLoanEMIValue} onChange={e=> handleOnchangeLoan(e)} />
               </td>
            </tr>
            ))}
         </table>
      </div>
   </div>
  )
}

export default Financial;