// import React, { useEffect, useState } from 'react'
// import { toast } from "react-toastify";
// import { post, get } from "../../common/util/restUtil";
// import { properties } from "../../properties";
// 
// import DynamicTable from '../../common/table/DynamicTable';
// import { SLAListCols } from './SlaColums';

// const SlaSettings = () => {
//     const [totalCount, setTotalCount] = useState(0);
//     const [perPage, setPerPage] = useState(10);
//     const [currentPage, setCurrentPage] = useState(0);
//     const [filters, setFilters] = useState([]);
//     const [exportBtn, setExportBtn] = useState(true)
//     const [data, setData] = useState([])


//     useEffect(() => {
//         
//         post(`${properties.SLA_SETTINGS_API}/list?limit=${perPage}&page=${currentPage}`)
//             .then((resp) => {
//                 if (resp.data) {
//                     if (resp.status === 200) {
//                         const { count, rows } = resp.data;
//                         if (resp.data.count === "0") {
//                             toast.error("Records Not found");
//                             setFilters([]);
//                         }
//                         unstable_batchedUpdates(() => {
//                             setTotalCount(count)
//                             setData(rows);
//                         })
//                     } else {
//                         setData([]);
//                         toast.error("Records Not Found");
//                     }
//                 } else {
//                     setData([]);
//                     toast.error("Records Not Found");
//                 }
//             }).finally(() => {
//                 
//                 isTableFirstRender.current = false;
//             });

//     }, [])

//     const handleCellRender = (cell, row) => {
//         return (<span>{cell.value}</span>);
//     }
//     const handlePageSelect = (pageNo) => {
//         setCurrentPage(pageNo)
//     }

//     return (
//         <>
//             <div className="content-page">
//                 <div className="content">
//                     <div className="container-fluid">
//                         <div className="row">
//                             <div className="col-12">
//                                 <div className="page-title-box">
//                                     <h4 className="page-title">SLA Settings</h4>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="row mt-1">
//                             <div className="col-lg-12 row">
//                                 <div className="col-lg-2">
//                                     <div className="card p-2">
//                                         <div className="title-box show">
//                                             <h5 className="menu-title">Quick Links</h5>
//                                             <ul className="nav flex-column">

//                                                 <li className="nav-item">
//                                                     <a className="nav-link list-group-item list-group-item-action active" href="admin-qa-sections.html">SLA List</a>
//                                                 </li>
//                                                 <li className="nav-item">
//                                                     <a className="nav-link list-group-item list-group-item-action" href="admin-questions.html">SLA Builder</a>
//                                                 </li>


//                                             </ul>
//                                         </div>
//                                     </div>
//                                 </div>
//                                 <div className="col-lg-10 p-0">
//                                     <div className="search-result-box m-t-30 card-box p-0">
//                                         <div className="row mt-1">
//                                             <div className="col-lg-12 p-0">
//                                                 <div>
//                                                     <div>
//                                                         <div className="col-12 pr-0">
//                                                             <section className="triangle">
//                                                                 <div className="col-12 row">
//                                                                     <div className="col-10"><h4 id="list-item-1" className="pl-1">SLA List</h4></div>
//                                                                     <div className="col-2">
//                                                                         <button type="button" className="btn  btn-primary btn-sm mt-1 float right" data-toggle="modal" data-target="#addsections"><small>Add New SLA</small></button>
//                                                                     </div>
//                                                                 </div>
//                                                             </section>
//                                                         </div>
//                                                         <div className="p-2">

//                                                             {
//                                                                 !!customerSearchData.length &&
//                                                                 <div className="row mt-2">
//                                                                     <div className="col-lg-12">
//                                                                         {
//                                                                             !!customerSearchData.length &&
//                                                                             < div className="card">
//                                                                                 <div className="card-body" id="datatable">
//                                                                                     <div style={{}}>
//                                                                                         <DynamicTable
//                                                                                             listSearch={listSearch}
//                                                                                             listKey={"SLA List"}
//                                                                                             row={data}
//                                                                                             rowCount={totalCount}
//                                                                                             header={SLAColumns}
//                                                                                             itemsPerPage={perPage}
//                                                                                             hiddenColumns={CustomerAdvanceSearchHiddenColumns}
//                                                                                             backendPaging={true}
//                                                                                             backendCurrentPage={currentPage}
//                                                                                             isTableFirstRender={isTableFirstRender}
//                                                                                             hasExternalSearch={hasExternalSearch}
//                                                                                             exportBtn={exportBtn}
//                                                                                             handler={{
//                                                                                                 handleCellRender: handleCellRender,
//                                                                                                 handlePageSelect: handlePageSelect,
//                                                                                                 handleItemPerPage: setPerPage,
//                                                                                                 handleCurrentPage: setCurrentPage,
//                                                                                                 handleFilters: setFilters,
//                                                                                                 handleExportButton: setExportBtn
//                                                                                             }}
//                                                                                         />
//                                                                                     </div>
//                                                                                 </div>
//                                                                             </div>
//                                                                         }
//                                                                     </div>
//                                                                 </div>
//                                                             }
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </>
//     )
// }
// export default SlaSettings
