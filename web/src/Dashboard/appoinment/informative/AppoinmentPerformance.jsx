import React, { useState, useRef, useMemo, useEffect } from "react";
import { properties } from "../../../properties";
import { post } from "../../../common/util/restUtil";

import Filter from "./Filter";
import * as echarts from "echarts";
import Modal from "react-modal";
import DynamicTable from "../../../common/table/DynamicTable";
import { RegularModalCustomStyles } from "../../../common/util/util";

const AppoinmentPerformance = (props) => {
  const { searchParams } = props?.data;
  const [isRefresh, setIsRefresh] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [scheduled, setScheduled] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [success, setSuccess] = useState([]);
  const [unsuccess, setUnsuccess] = useState([]);
  const [cancelled, setCancelled] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [schvscomp, setSchvscomp] = useState();
  const [compvssuccess, setCompvssuccess] = useState();
  const [compvsunsuccess, setCompvsunsuccess] = useState();
  const [schvscan, setSchvscan] = useState();
  const [schvsupcom, setSchvsupcom] = useState();
  const [filterParams, setFilterParams] = useState();
  const [type, setType] = useState();

  useEffect(() => {
    fetchEvents();
  }, [isRefresh, filterParams, searchParams]);

  const fetchEvents = async () => {
    try {
      post(properties.APPOINTMENT_API + "/get-performance", {
        filterParams,
        searchParams,
      }).then((response) => {
        if (response.data) {
          // setAppoinmentPerformance(response.data);
          console.log("response.data ", response.data);
          setScheduled(response?.data?.scheduled)
          setCompleted(response?.data?.completed)
          setSuccess(response?.data?.success)
          setUnsuccess(response?.data?.unsuccess)
          setCancelled(response?.data?.cancelled)
          setUpcoming(response?.data?.upcoming)

          setSchvscomp(Math.round((response?.data?.completed.length / response?.data?.scheduled.length) * 100));
          setCompvssuccess(Math.round((response?.data?.success.length / response?.data?.completed.length) * 100));
          setCompvsunsuccess(
            Math.round((response?.data?.unsuccess.length / response?.data?.completed.length) * 100)
          );
          setSchvscan(Math.round((response?.data?.cancelled.length / response?.data?.scheduled.length) * 100));
          setSchvsupcom(Math.round((response?.data?.upcoming.length / response?.data?.scheduled.length) * 100));

          // const totalCompleted = response?.data?.reduce((acc, ele) => acc + (Number(ele?.o_completed_cnt) || 0), 0);
          // setCompleted(totalCompleted);
          // const totalSuccessfullyCompletedAvg = response?.data?.reduce((acc, ele) => acc + (Number(ele?.o_success_per) || 0), 0) / response?.data?.length;
          // setAvgSuccessFullyCompleted(totalSuccessfullyCompletedAvg);
          // const totalUnSuccessfullyCompletedAvg = response?.data?.reduce((acc, ele) => acc + (Number(ele?.o_unsuccess_per) || 0), 0) / response?.data?.length;
          // setAvgUnSuccessFullyCompleted(totalUnSuccessfullyCompletedAvg);
        }
      }).catch((error) => {
        console.log(error)
    });
    } catch (error) {
      console.log(error);
    }
  };
  
  const handlePageSelect = (pageNo) => {
    setCurrentPage(pageNo)
  }
  
  const handleCellRender = (cell, row) => {
    return (<span>{cell.value}</span>)
  }
  return (
    <div className="row mt-2">
      <div className="col-md-12 col-xs-12">
        <div className="row">
          <div className="col-md-3">
            <div className="skel-appt-hist info-h6">
              <span>Scheduled vs Completed</span>
              <div className="skel-appt-graph mt-3">
                <span onClick={e => {
                    setIsOpen(true)
                    setType('COMPLETED')
                  }
                }>{schvscomp || 0}%</span>
                <h2>👍</h2>
                {/* <img src={l4} alt="" className="img-fluid" width="100px" height="100px" /> */}
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="skel-appt-hist info-h1">
              <span>Completed vs Successful</span>
              <div className="skel-appt-graph mt-3">
                <span onClick={e => {
                    setIsOpen(true)
                    setType('SUCCESS')
                  }
                }>{compvssuccess || 0}%</span>
                <h2>✌️</h2>
                {/* <img src={l1} alt="" className="img-fluid" width="100px" height="100px" /> */}
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="skel-appt-hist info-h2">
              <span>Completed vs Unsuccessful</span>
              <div className="skel-appt-graph mt-3">
                <span onClick={e => {
                    setIsOpen(true)
                    setType('UNSUCCESS')
                  }
                }>{compvsunsuccess || 0}%</span>
                <h2>👎</h2>
                {/* <img src={l2} alt="" className="img-fluid" width="100px" height="100px" /> */}
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="skel-appt-hist info-h3">
              <span>Scheduled vs Cancelled</span>
              <div className="skel-appt-graph mt-3">
                <span onClick={e => {
                    setIsOpen(true)
                    setType('CANCELLED')
                  }
                }>{schvscan || 0}%</span>
                <h2>👈</h2>
                {/* <img src={l3} alt="" className="img-fluid" width="100px" height="100px" /> */}
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="skel-appt-hist info-h4">
              <span>Scheduled vs Upcoming</span>
              <div className="skel-appt-graph mt-3">
                <span onClick={e => {
                    setIsOpen(true)
                    setType('UPCOMING')
                  }
                }>{schvsupcom || 0}%</span>
                <h2>🤞</h2>
                {/* <img src={l3} alt="" className="img-fluid" width="100px" height="100px" /> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal isOpen={isOpen} contentLabel="Modal" style={RegularModalCustomStyles}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <button
                type="button"
                className="close"
                onClick={() => setIsOpen(!isOpen)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="skel-dashboard-data">
                  <DynamicTable
                      listSearch={[]}
                      listKey={""}
                      row={type === 'COMPLETED' ? completed : type === 'SUCCESS' ? success :type === 'UNSUCCESS' ? unsuccess : type === 'CANCELLED' ? cancelled : type === 'UPCOMING' ? upcoming : []}
                      rowCount={type === 'COMPLETED' ? completed.length : type === 'SUCCESS' ? success.length :type === 'UNSUCCESS' ? unsuccess.length : type === 'CANCELLED' ? cancelled.length : type === 'UPCOMING' ? upcoming.length : 0}
                      header={columns}
                      fixedHeader={false}
                      itemsPerPage={perPage}
                      isScroll={true}
                      backendPaging={true}
                      backendCurrentPage={currentPage}
                      url={properties.APPOINTMENT_API + `/upcoming-appoinments?page=${currentPage}&limit=${perPage}`}
                      method='POST'
                      handler={{
                          handleCellRender: handleCellRender,
                          handlePageSelect: handlePageSelect,
                          handleItemPerPage: setPerPage,
                          handleCurrentPage: setCurrentPage
                      }}
                  />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
  // <>
  //     <div className="cmmn-skeleton mt-3">

  //         <div className="skel-dashboard-title-base">
  //             <span className="skel-header-title">Appointment performance</span>
  //             <div className="skel-dashboards-icons1">
  //                 <a onClick={() => setIsRefresh(!isRefresh)}><i className="material-icons">refresh</i></a>&nbsp;&nbsp;
  //                 <Filter
  //                     handlers={{
  //                         filtration
  //                     }}
  //                 />
  //             </div>

  //         </div>
  //         <hr className="cmmn-hline" />
  //         <div className="skel-perf-sect">
  //             <div className="skel-perf-graph appt-table-perf">
  //                 <table className='table'>
  //                     <thead>
  //                         <tr style={{ backgroundColor: '#f4f4f4', color: 'white' }}>
  //                             <th>Month</th>
  //                             <th>Schedule Vs completed</th>
  //                             <th>Success Vs Completed</th>
  //                             <th>UnSuccess Vs Completed</th>
  //                         </tr>
  //                     </thead>
  //                     <tbody>
  //                         {appoinmentPerformance && appoinmentPerformance?.length > 0 && appoinmentPerformance?.map((ele, index) => {
  //                             return (
  //                                 <tr>
  //                                     <td style={{ backgroundColor: '#f4f4f4', color: '#000' }}>{ele?.o_appoint_month}</td>
  //                                     <td style={{ backgroundColor: '#823333', color: 'white' }} >{Number(ele?.o_completed_cnt).toFixed(2) || 0}</td>
  //                                     <td style={{ backgroundColor: '#1b8938', color: 'white' }} >{Number(ele?.o_success_per).toFixed(2) || 0}%</td>
  //                                     <td style={{ backgroundColor: '#b32e2e', color: 'white' }}>{Number(ele?.o_unsuccess_per).toFixed(2) || 0}%</td>
  //                                 </tr>
  //                             );
  //                         })}
  //                     </tbody>
  //                     <tfoot>
  //                         <tr style={{ backgroundColor: '#f4f4f4', color: 'white' }}>
  //                             <td>Total</td>
  //                             <td colSpan="3">
  //                                 <span id="totalQuantity">{Number(completed).toFixed(2) || 0}</span>
  //                             </td>
  //                         </tr>
  //                     </tfoot>
  //                 </table>
  //             </div>
  //         </div>
  //     </div>
  // </>
  //)
};

export default AppoinmentPerformance;


export const columns = [
  {
      Header: "Customer Name",
      accessor: "appointmentCustomer.firstName",
      disableFilters: true,
      id: "CustomerName",
  },
  {
      Header: "Date",
      accessor: "appointDate",
      disableFilters: true,
      id: "appointmentDate",
  },
  {
      Header: "Time",
      accessor: "appointStartTime",
      disableFilters: true,
      id: "appointTime",
  },
  {
      Header: "Appointment Type",
      accessor: "appoinmentModeDesc.description",
      disableFilters: true,
      id: "appoinmentModeDesc",
  }, 
  {
      Header: "Entity Type",
      accessor: "tranCategoryTypeDesc.description",
      disableFilters: true,
      id: "tranCategoryTypeDesc",
  },
  {
    Header: "Category",
    accessor: "category",
    disableFilters: true,
    id: "categoryTypeDesc",
  },
  {
    Header: "Type",
    accessor: "type",
    disableFilters: true,
    id: "typeDesc",
  },
  {
      Header: "Entity No",
      accessor: "tranCategoryNo",
      disableFilters: true,
      id: "tranCategoryNo",
  }
];