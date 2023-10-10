/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import { properties } from "../properties";
import { post } from "../common/util/restUtil";
import AddEditChargeModal from './addEditChargeModal';
import ChargeListView from './chargeListView';
import { unstable_batchedUpdates } from 'react-dom';
import { NumberFormatBase } from 'react-number-format';
import ReactSelect from "react-select";


const ProductPage5 = (props) => {
  const { setProductData, handleOnchange, setError, setChargeData, setIsChargeModalOpen,
    setMode, setChargeName, handleAddCharge, handleChargeNameSearch, setChargeList,
    validate
  } = props.handler
  const { productData, frequencyLookup, chargeData, chargeList, error,
    isPlanTerminated, showChargeDropdown, chargeNameLookup,
    chargeName, isChargeModalOpen, mode, termsAndConditionLookup, productBenefitLookup
  } = props.data

  const termsList = termsAndConditionLookup.map(m => {
    return {
      label: m.termName,
      value: m.termId
    }
  })

  const [terms, setTerms] = useState([])
  const [oldChargeName, setOldChargeName] = useState(0)
  const [parents, setParents] = useState([[{}]]);
  const [selectedBenefits, setSelectedBenefits] = useState([]);
  const [productBenefitData, setProductBenefitData] = useState({});
  const [productContractData, setProductContractData] = useState([]);

  const handleBenefitchange = (e, parentIndex, childIndex) => {
    const selectedValue = e.target.value;
    const updatedProductBenefitData = { ...productBenefitData };
    const parentKey = `productBenefit${parentIndex}`;

    if (!updatedProductBenefitData[parentKey]) {
      updatedProductBenefitData[parentKey] = [];
    }
    if (childIndex != null || childIndex != undefined) {
      if (!updatedProductBenefitData[parentKey][childIndex]) {
        updatedProductBenefitData[parentKey][childIndex] = {};
      }

      updatedProductBenefitData[parentKey][childIndex] = {
        ...updatedProductBenefitData[parentKey][childIndex],
        selectedValue,
      };
    } else {
      updatedProductBenefitData[parentKey] = {
        ...updatedProductBenefitData[parentKey],
        selectedValue,
      };
    }
    setProductBenefitData(updatedProductBenefitData);
    const productBenefitArray = Object.values(updatedProductBenefitData);
    setProductData((prevProductData) => ({
      ...prevProductData,
      productBenefit: productBenefitArray,
    }));
  };

  const handleDescriptionChange = (e, parentIndex, childIndex) => {
    const description = e.target.value;
    const updatedProductBenefitData = { ...productBenefitData };
    const parentKey = `productBenefit${parentIndex}`;

    if (!updatedProductBenefitData[parentKey]) {
      updatedProductBenefitData[parentKey] = [];
    }
    if (childIndex != null || childIndex != undefined) {
      if (!updatedProductBenefitData[parentKey][childIndex]) {
        updatedProductBenefitData[parentKey][childIndex] = {};
      }

      updatedProductBenefitData[parentKey][childIndex] = {
        ...updatedProductBenefitData[parentKey][childIndex],
        description,
      };
    }
    else {
      updatedProductBenefitData[parentKey] = {
        ...updatedProductBenefitData[parentKey],
        description,
      };
    }

    setProductBenefitData(updatedProductBenefitData);
    const productBenefitArray = Object.values(updatedProductBenefitData);

    setProductData((prevProductData) => ({
      ...prevProductData,
      productBenefit: productBenefitArray,
    }));
  };

  const handleContractChange = (e, index) => {
    const contractInMonths = e.target.value;
    const updatedProductContractData = [...productContractData];

    updatedProductContractData[index] = contractInMonths;
    setProductContractData(updatedProductContractData);

    setProductData((prevProductData) => ({
      ...prevProductData,
      contractList: updatedProductContractData.map((value) => Number(value)),
    }));
  };


  useEffect(() => {
    setParents([[{}]])
    setSelectedBenefits([]);
    setProductBenefitData({});
    setProductContractData([]);
  }, [productData.contractFlag]);

  useEffect(() => {
    if (productData.termsList && productData.termsList.length > 0) {
      const termList = []
      for(const prodTerm of productData.termsList) {
        // console.log('prod term ', prodTerm)
        for(const terms of termsList){
          // console.log('terms===================', terms)
          if (terms.value == prodTerm) {
            termList.push({
              label: terms.label,
              value: terms.value
            })
          }
        }
      }

    // console.log('termList========', termList)
      
      setTerms(termList)

    }
  }, [productData.termsList])

  useEffect(() => {
    if (productData.productBenefit && productData.productBenefit.length > 0) {
      const updatedProductBenefitData = {};
      const updatedSelectedBenefits = [];

      for (let i = 0; i < productData.productBenefit.length; i++) {
        const parentIndex = i;
        const parentKey = `productBenefit${parentIndex}`;
        if (productData.productBenefit[parentIndex]?.benefits) {
          updatedProductBenefitData[parentKey] = productData.productBenefit[parentIndex]?.benefits.map((b) => ({
            selectedValue: b.selectedValue || '',
            description: b.description || '',
          })) || [];
        } else {
          updatedProductBenefitData[parentKey] = productData.productBenefit[parentIndex] || [];
        }

        updatedSelectedBenefits.push(
          productData.productBenefit[parentIndex]?.benefits ? productData.productBenefit[parentIndex]?.benefits[0]?.selectedValue :
            productData.productBenefit[parentIndex]?.selectedValue || ''
        );
      }

      setProductBenefitData(updatedProductBenefitData);
      setSelectedBenefits(updatedSelectedBenefits);
    }

    if (productData.contractList && productData.contractList.length > 0) {
      setProductContractData(productData.contractList.map((value) => Number(value)));
    }
    // setParents(productData.contractList ? productData.contractList.map(() =>
    //   productData.productBenefit ? productData.productBenefit.map(() => {
    //     console.log('in productBenefit')
    //     return ({})
    //   }) : [{}]
    // ) : [{}]);

    const parents = productData.contractList
      ? productData.contractList.flatMap((contract) =>
        productData.productBenefit
          ? productData.productBenefit
            .filter((benefit) => benefit.contract == contract)
            .map(() => ([{}]))
          : [{}]
      )
      : [[{}]];

    setParents(parents);
  }, []);

  const handleAddParent = () => {
    setParents([...parents, [{}]]);
    setProductBenefitData((prevProductBenefitData) => {
      const updatedProductBenefitData = { ...prevProductBenefitData };
      const parentIndex = Object.keys(updatedProductBenefitData).length;
      const parentKey = `productBenefit${parentIndex}`;
      updatedProductBenefitData[parentKey] = [];
      return updatedProductBenefitData;
    });
  };

  const handleRemoveParent = (parentIndex) => {
    setParents((prevParents) => {
      const updatedParents = [...prevParents];
      updatedParents.splice(parentIndex, 1);
      return updatedParents;
    });

    setProductBenefitData((prevProductBenefitData) => {
      const updatedProductBenefitData = { ...prevProductBenefitData };
      const parentKey = `productBenefit${parentIndex}`;
      delete updatedProductBenefitData[parentKey];

      const productBenefitArray = Object.values(updatedProductBenefitData);

      setProductData((prevProductData) => ({
        ...prevProductData,
        productBenefit: productBenefitArray
      }));

      return updatedProductBenefitData;
    });

    setProductData((prevProductData) => ({
      ...prevProductData,
      contractList: prevProductData.contractList?.splice(parentIndex, 1),
    }));
  };

  const handleAddChild = (parentIndex) => {
    setParents((prevParents) => {
      const updatedParents = [...prevParents];
      updatedParents[parentIndex] = [...updatedParents[parentIndex], {}];
      return updatedParents;
    });
    setProductBenefitData((prevProductBenefitData) => {
      const updatedProductBenefitData = { ...prevProductBenefitData };
      const parentKey = `productBenefit${parentIndex}`;
      const childIndex = updatedProductBenefitData[parentKey]?.length || 0;
      if (!Array.isArray(updatedProductBenefitData[parentKey])) {
        updatedProductBenefitData[parentKey] = [];
      }
      updatedProductBenefitData[parentKey][childIndex] = {
        selectedValue: '',
        description: '',
      };
      // updatedProductBenefitData[parentKey].push({ selectedValue: '', description: '' });
      return updatedProductBenefitData;
    });
  };

  const handleRemoveChild = (parentIndex, childIndex) => {
    setParents((prevParents) => {
      const updatedParents = [...prevParents];
      updatedParents[parentIndex].splice(childIndex, 1);
      return updatedParents;
    });

    setProductBenefitData((prevProductBenefitData) => {
      const updatedProductBenefitData = { ...prevProductBenefitData };
      const parentKey = `productBenefit${parentIndex}`;
      updatedProductBenefitData[parentKey].splice(childIndex, 1);

      const productBenefitArray = Object.values(updatedProductBenefitData);

      setProductData((prevProductData) => ({
        ...prevProductData,
        productBenefit: productBenefitArray,
      }));

      return updatedProductBenefitData;
    });
  };

  const handleAddBenefit = () => {
    setParents([...parents, [{}]]);
    setProductBenefitData((prevProductBenefitData) => {
      const updatedProductBenefitData = { ...prevProductBenefitData };
      const parentIndex = Object.keys(updatedProductBenefitData).length;
      const parentKey = `productBenefit${parentIndex}`;
      updatedProductBenefitData[parentKey] = [];
      return updatedProductBenefitData;
    });
  };

  const handleRemoveBenefit = (parentIndex) => {
    setParents((prevParents) => {
      const updatedParents = [...prevParents];
      updatedParents.splice(parentIndex, 1);
      return updatedParents;
    });

    setProductBenefitData((prevProductBenefitData) => {
      const updatedProductBenefitData = { ...prevProductBenefitData };
      const parentKey = `productBenefit${parentIndex}`;
      delete updatedProductBenefitData[parentKey];

      const productBenefitArray = Object.values(updatedProductBenefitData);

      setProductData((prevProductData) => ({
        ...prevProductData,
        productBenefit: productBenefitArray
      }));

      return updatedProductBenefitData;
    });

    setProductData((prevProductData) => ({
      ...prevProductData,
      contractList: [],
    }));
  };

  console.log('chargeListchargeListchargeList', chargeList)

  return (
    <div className="col-md-10 skel-cr-rht-sect-form">
      <div className="skel-step-process">Step-5<span>Set Activation and Expirty</span></div>
      <div className="row">
        <div className="col-md-2">
          <div className="form-group">
            <label for="dob" className="control-label">Contract Availability<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
            <select className="form-control" id="contractFlag" onChange={handleOnchange} value={productData.contractFlag}>
              <option>Select...</option>
              <option value='Y'>Yes</option>
              <option value='N'>No</option>
            </select>
          </div>
        </div>
        <div className="col-md-12">
          {/* {console.log('parentsparents ', parents)} */}
          {
            productData.contractFlag === 'Y' &&
            parents.map((parent, parentIndex) => {
              const selectedContractData = productContractData[parentIndex];
              return (<div key={parentIndex} className="form-row">
                {parentIndex === 0 ? (
                  <a className="addmore" onClick={handleAddParent}>
                    <i className="fa fa-plus"></i>
                  </a>
                ) : (
                  <a className="inputRemoveslots" onClick={() => handleRemoveParent(parentIndex)}>
                    <i className="fa fa-minus"></i>
                  </a>
                )}
                <div className="col-md-2">
                  <div className="form-group">
                    <label htmlFor={"contractInMonths" + parentIndex} className="control-label">Contract Duration<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                    <NumberFormatBase
                      className="form-control"
                      id={"contractInMonths" + parentIndex}
                      onChange={e => { handleContractChange(e, parentIndex) }}
                      value={selectedContractData}
                      placeholder="12"
                    />
                  </div>
                </div>
                <div className="col-md-1 mt-4">Months</div>
                {/* {console.log('parent ', parent)} */}
                <div className="col-md-6">
                  {parent && parent?.map((child, childIndex) => {
                    const selectId = `productBenefitSelect-${parentIndex}`;
                    const descriptionId = `productBenefitDesc-${parentIndex}-${childIndex}`;
                    const selectedValue = productBenefitData[`productBenefit${parentIndex}`]?.[childIndex]?.selectedValue || '';
                    const descriptionValue = productBenefitData[`productBenefit${parentIndex}`]?.[childIndex]?.description || '';
                    const availableBenefits = productBenefitLookup.filter(
                      (val) => !selectedBenefits.includes(val.code) || val.code === selectedValue
                    );

                    return (<div key={childIndex} className="form-row">

                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor={selectId} className="control-label">Benefit</label>
                          <div className="input-group">
                            <select
                              className="form-control"
                              id={selectId}
                              value={selectedValue}
                              onChange={(e) => handleBenefitchange(e, parentIndex, childIndex)}
                            >
                              <option value="">Select..</option>
                              {availableBenefits.map((val, key) => (
                                <option key={key} value={val.code}>{val.description}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor={descriptionId} className="control-label">Description</label>
                          <input
                            type="text"
                            className="form-control"
                            id={descriptionId}
                            name={descriptionId}
                            value={descriptionValue}
                            onChange={(e) => handleDescriptionChange(e, parentIndex, childIndex)}
                          />
                        </div>
                      </div>
                      {
                        childIndex === 0 ? (
                          <a className="addmore" onClick={() => handleAddChild(parentIndex)}>
                            <i className="fa fa-plus"></i>
                          </a>
                        ) : (
                          <a className="inputRemoveslots" onClick={() => handleRemoveChild(parentIndex, childIndex)}>
                            <i className="fa fa-minus"></i>
                          </a>
                        )
                      }
                    </div>)
                  })}
                </div>
              </div>
              )
            }
            )}
        </div>
        <div className="col-md-12">
          {
            productData.contractFlag === 'N' &&
            <div className="col-md-6">
              {parents.map((parent, parentIndex) => {
                const selectId = `productBenefitSelect-${parentIndex}`;
                const descriptionId = `productBenefitDesc-${parentIndex}`;
                const selectedValue = productBenefitData[`productBenefit${parentIndex}`]?.selectedValue || '';
                const descriptionValue = productBenefitData[`productBenefit${parentIndex}`]?.description || '';

                const availableBenefits = productBenefitLookup.filter(
                  (val) => !selectedBenefits.includes(val.code) || val.code === selectedValue
                );

                return (<div key={parentIndex} className="form-row">
                  <div className="col-md-3">
                    <div className="form-group">
                      <label htmlFor={selectId} className="control-label">Benefit</label>
                      <div className="input-group">
                        <select
                          className="form-control"
                          id={selectId}
                          value={selectedValue}
                          onChange={(e) => handleBenefitchange(e, parentIndex)}
                        >
                          <option value="">Select..</option>
                          {availableBenefits.map((val, key) => (
                            <option key={key} value={val.code}>{val.description}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor={descriptionId} className="control-label">Description</label>
                      <input
                        type="text"
                        className="form-control"
                        id={descriptionId}
                        name={descriptionId}
                        value={descriptionValue}
                        onChange={(e) => handleDescriptionChange(e, parentIndex)}
                      />
                    </div>
                  </div>
                  {
                    parentIndex === 0 ? (
                      <a className="addmore" onClick={() => handleAddBenefit(parentIndex)}>
                        <i className="fa fa-plus"></i>
                      </a>
                    ) : (
                      <a className="inputRemoveslots" onClick={() => handleRemoveBenefit(parentIndex)}>
                        <i className="fa fa-minus"></i>
                      </a>
                    )
                  }
                </div>)
              })}
            </div>
          }
        </div>
        <div className="col-12 pt-2 pl-0 pb-2 row ml-1">
          <div className="col-md-4 pl-0">
            <div className="form-group">
              <label htmlFor="termsId" className="col-form-label">Add Terms and Conditions</label>
              <div className="input-group">
                <ReactSelect
                  className="w-100"
                  menuPortalTarget={document.body}
                  styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                  options={termsList}
                  value={terms}
                  isMulti={true}
                  onChange={(val) => {
                    setTerms(val);
                    const termsList = val.map(m => m?.value)
                    setProductData({
                      ...productData,
                      termsId: termsList
                    })
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* <div className="row p-1 mt-3"> */}
        <div className="col-12 p-0">
          <section className="triangle">
            <div className="row col-12">
              <div className="col-10">
                <h5 id="list-item-1" className="pl-1">Charge Details</h5>
              </div>
              <div className="col-2">
                <span style={{ float: "right" }}>
                  <button type="button" className="btn btn-labeled btn-primary btn-sm mt-1" disabled={false}
                    onClick={() => { handleAddCharge() }}
                  >
                    <span className="btn-label"><i className="fa fa-plus"></i></span>Add
                  </button>
                </span>
              </div>
            </div>
          </section>
        </div>
        {/* </div> */}
        {
          showChargeDropdown === true &&
          <div className="col-12 pt-2 pl-0 pb-2 row ml-1">
            <div className="col-md-4 pl-0">
              <div className="form-group">
                <label htmlFor="chargeName" className="col-form-label">Search Charge Name</label>
                <div className="input-group">
                  <select className="form-control" value={chargeName}
                    onChange={(e) => {
                      setChargeName(e.target.value);
                    }}
                  >
                    <option value="">Select..</option>
                    {
                      chargeNameLookup && chargeNameLookup.map((charge, key) => (
                        <option key={key} value={charge.chargeId}>{charge.chargeName}</option>
                      ))
                    }
                  </select>
                  <div className="col-md-2 pl-0 mt-1">
                    <button type="button" className="btn btn-primary btn-sm waves-effect waves-light ml-2" disabled={false}
                      onClick={() => { handleChargeNameSearch() }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }

        <ChargeListView
          data={{
            chargeList: chargeList,
            chargeData: chargeData,
            isTerminated: isPlanTerminated
          }}
          handler={{
            setChargeData: setChargeData,
            setIsOpen: setIsChargeModalOpen,
            setMode: setMode,
            setOldChargeName: setOldChargeName
          }}
        />
        {
          isChargeModalOpen &&
          <AddEditChargeModal
            data={{
              chargeList: chargeList,
              isOpen: isChargeModalOpen,
              chargeData: chargeData,
              error,
              mode,
              oldChargeName: oldChargeName,
              // location: location,
              // module: 'Plan'
            }}
            handler={{
              setIsOpen: setIsChargeModalOpen,
              setChargeData: setChargeData,
              setError: setError,
              setChargeList: setChargeList,
              validate: validate
            }}
          />
        }
      </div>
    </div>
  )
}

export default ProductPage5;