/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState, useContext } from "react";
import { properties } from "../../properties";
import { post } from "../../common/util/restUtil";
import { unstable_batchedUpdates } from "react-dom";
import { InventoryContext } from "../../AppContext";

const Variations = () => {
  const { data, handlers } = useContext(InventoryContext);
  const { itemVariantLookup, itemVariantTypeLookup, itemData } = data
  const { setItemData, setItemVariantTypeLookup } = handlers

  const [itemVariantDataList, setItemVariantDataList] = useState([{ 
    itemVariantType: '',
    itemSKU: '',
    itemUnitPrice: '',
    itemStockQty: ''
  }]);

  const [itemDimensionDataList, setItemDimensionDataList] = useState([{ 
    itemDimension: '',
    itemLength: '',
    itemWidth: '',
    itemHeight: ''
  }]);

  const addVariantRow = () => {
    setItemVariantDataList([...itemVariantDataList, { 
      itemVariantType: '',
      itemSKU: '',
      itemUnitPrice: '',
      itemStockQty: ''
    }]);
  };

  const removeVariantRow = (index) => {
    const updatedList = itemVariantDataList.filter((item, i) => i !== index);
    setItemVariantDataList(updatedList);
  };

  const handleOnchangeVariant = (e, index) => {
    const { name, value } = e.target;
    const updatedList = [...itemVariantDataList];
    updatedList[index][name] = value;
    setItemVariantDataList(updatedList);
    setItemData({
      ...itemData,
      itemVariantDataList: updatedList
    })
  };

  const addDimensionRow = () => {
    setItemDimensionDataList([...itemDimensionDataList, { 
      itemDimension: '',
      itemLength: '',
      itemWidth: '',
      itemHeight: ''
    }]);
  };

  const removeDimensionRow = (index) => {
    const updatedList = itemDimensionDataList.filter((item, i) => i !== index);
    setItemDimensionDataList(updatedList);
  };


  const handleOnchangeDimension = (e, index) => {
    const { name, value } = e.target;
    const updatedList = [...itemDimensionDataList];
    updatedList[index][name] = value;
    setItemDimensionDataList(updatedList);
    setItemData({
      ...itemData,
      itemDimensionDataList: updatedList
    })
  };
 

  return (
    <div className="skel-role-base">
      <div className="skel-tabs-role-config p-2">
        <div className="col-12">
          <div className="col-md-12">
            <div className="row col-12 mb-2 pl-3">
              <h5>Add Variations</h5>
            </div>

            <table
              id="employee-table"
              className="table table-bordered table-striped"
            >
              <tr>
                <th>Variant Type</th>
                <th>Variant Name</th>
                <th>SKU</th>
                <th>Unit Price $</th>
                <th>Stock Qty</th>
                <th>Action</th>
              </tr>
                         
                {itemVariantDataList?.map((itemData, i) => (
                     <tr key={i}>
                      <td>
                    <div className="form-group">
                      <select className="form-select" name="itemVariant" value={itemData.itemVariant} onChange={e=>{
                        handleOnchangeVariant(e, i)
                        const selectedCode = e.target.value;
                        const mappingValue = itemVariantLookup.find(v => v.code === selectedCode)?.mapping?.value || '';
                        setItemVariantTypeLookup(prevLookup => {
                          const updatedLookup = [...prevLookup];
                          updatedLookup[i] = mappingValue;
                          return updatedLookup;
                        });
                      }}>
                        <option selected="">Select Variant Type</option>
                        {
                          itemVariantLookup.map((v, k)=>(
                            <option key={k} value={v.code}>{v.description}</option>
                          ))
                        }
                      </select>
                    </div>
                      </td>
                      <td>
                        <select className="form-select" name="itemVariantType" value={itemData.itemVariantType} onChange={e=> handleOnchangeVariant(e, i)}>
                          <option selected="">Select Variant</option>
                          {
                            itemVariantTypeLookup[i] &&
                            itemVariantTypeLookup[i].map((v, k)=>(
                              <option key={k} value={v}>{v}</option>
                            ))
                          }
                        </select>
                      </td>
                      <td>
                        <input
                          className="form-control"
                          name="itemSKU"
                          placeholder=""
                          type="text"
                          value={itemData.itemSKU} 
                          onChange={e=>handleOnchangeVariant(e, i)}
                        />
                      </td>
                      <td>
                        <input
                          className="form-control"
                          name="itemUnitPrice"
                          placeholder=""
                          type="number"
                          min={0}
                          value={itemData.itemUnitPrice} onChange={e=>handleOnchangeVariant(e, i)}
                        />
                      </td>
                      <td>
                        <input
                          className="form-control"
                          name="itemStockQty"
                          placeholder=""
                          type="number"
                          min={0}
                          value={itemData.itemStockQty} onChange={e=>handleOnchangeVariant(e, i)}
                        />
                      </td>
                      <td>
                      {(i == 0) ? (
                          <a className="btn btn-primary btn-sm" onClick={addVariantRow}>
                              <i className="fa fa-plus"></i>
                          </a>
                      ) : (
                          <a className="btn btn-danger btn-sm" onClick={(e) => removeVariantRow(i)}>
                              <i className="fa fa-minus"></i>
                          </a>
                      )}
                      </td>
                    </tr>
                ))}                
              
            </table>
            <div className="row col-12 mb-2 pl-3">
              <h5>Add Dimensions</h5>
            </div>   

            <table
              id="employee-table"
              className="table table-bordered table-striped"
            >
              <tr>
                <th>Dimensions</th>
                <th>Length</th>
                <th>Width</th>
                <th>Height</th>

                <th></th>
              </tr>
              {itemDimensionDataList?.map((itemData, i) => (
              <tr key={i}>
                <td>
                  <select className="form-select" id="Servicecat" required="" value={itemData.itemName} onChange={e=>handleOnchangeDimension(e,i)}>
                    <option selected="">Select Variant</option>
                    <option>Centimeter</option>
                    <option>Feet</option>
                    <option>Inch</option>
                    <option>Meter</option>
                    <option>MM</option>
                  </select>
                </td>
                <td>
                  <input
                    className="form-control"
                    name="itemLength"
                    id="itemLength"
                    placeholder=""
                    type="number"
                    min={0}
                    value={itemData.itemLength} onChange={e=>handleOnchangeDimension(e,i)}
                  />
                </td>
                <td>
                  <input
                    className="form-control"
                    name="itemWidth"
                    id="itemWidth"
                    placeholder=""
                    type="number"
                    min={0}
                    value={itemData.itemWidth} onChange={e=>handleOnchangeDimension(e,i)}
                  />
                </td>
                <td>
                  <input
                    className="form-control"
                    name="itemHeight"
                    id="itemHeight"
                    placeholder=""
                    type="number"
                    min={0}
                    value={itemData.itemHeight} onChange={e=>handleOnchangeDimension(e,i)}
                  />
                </td>

                <td>
                {(i == 0) ? (
                    <a className="btn btn-primary btn-sm" onClick={addDimensionRow}>
                        <i className="fa fa-plus"></i>
                    </a>
                ) : (
                    <a className="btn btn-danger btn-sm" onClick={(e) => removeDimensionRow(i)}>
                        <i className="fa fa-minus"></i>
                    </a>
                )}
                </td>
              </tr>
              ))}
            </table>

            {/* <div className="col-md-12 text-center">
              <button type="button" className="skel-btn-cancel">
                Cancel
              </button>
              <button type="button" className="skel-btn-submit">
                Save
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};


export default Variations;