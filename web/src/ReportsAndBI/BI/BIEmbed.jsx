import React, { useEffect, useState, useRef } from 'react';
import { properties } from '../../properties';
import { get } from '../../common/util/restUtil';
import HorizontalBarChart from '../../Dashboard/charts/horizontalBar';
import { useReactToPrint } from 'react-to-print';
import BIDashboardPdf from './BIDashboardPdf';
import Modal from 'react-modal';
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";
import img1 from '../../assets/images/prameya1.png';
import img2 from '../../assets/images/prameya2.png';
import imgLeft from '../../assets/images/prameya-left.png';
import imgRight from '../../assets/images/prameya-right.png';
import Select from "react-select";

const BIEmbed = () => {
  const [surveyData, setSurveyData] = useState([])
  const [pdfData, setPdfData] = useState({})
  const [surveyList, setSurveyList] = useState([])
  const [customerList, setCustomerList] = useState([])
  const [fensScore, setFensScore] = useState([])
  const [customerName, setCustomerName] = useState('')
  const [contactNo, setContactNo] = useState('')
  const [generatePdf, setGeneratePdf] = useState(false)
  const [surveyRefNo, setSurveyRefNo] = useState('')
  const [exportBtn, setExportBtn] = useState(true);

  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onAfterPrint: () => {
      setGeneratePdf(false)
    }
  });

  useEffect(() => {
    const qryString = new URLSearchParams(window.location.search);
    setSurveyRefNo(qryString.get("surveyRefNo"))
    get(`${properties.BI_API}/get-survey-stats/${qryString.get("surveyRefNo")}`).then((resp) => {
      // console.log(resp.data)
      setSurveyData(resp.data)
      const uniqueCustomers = new Set();

      // Iterate through resp.data and add unique combinations to the Set
      const orderedList = resp.data.sort((a, b) => (a.surveyId > b.surveyId) ? 1 : ((b.surveyId > a.surveyId) ? -1 : 0))
      orderedList.forEach((m) => {
        if (m.customerName && m.customerName !== '') {
          uniqueCustomers.add({ value: m.customerId, label: m.customerName });
        }
      });

      // Convert the Set back to an array
      const customer = Array.from(uniqueCustomers);
      setCustomerList(customer)
    })
  }, [])

  const handleOnchange = (e, id) => {
    console.log('e', e)
    if ((e?.target?.value && e?.target?.value !== '') || id === 'customerName') {
      let surveyDtl
      console.log('id', id)
      if (id === 'customerName') {
        console.log('Here ----------->')
        surveyDtl = surveyData.filter(f => f.customerName === e.label)
        setCustomerName(e.label)
        setContactNo('')
      } else {
        surveyDtl = surveyData.filter(f => f.contactNo === e.target.value)
        setCustomerName(surveyDtl?.[0]?.customerName)
        setContactNo(e.target.value)
      }
      setSurveyList(surveyDtl?.[0]?.surveySummary)

      const fensScoresByCategory = {};

      console.log('surveyDtl===', surveyDtl)
      // Iterate through resp.data to group fensScores by questionCategory
      surveyDtl.length > 0 && surveyDtl?.[0]?.surveySummary.forEach((item) => {
        const { questionCategory, fensScore } = item;

        // Append fensScore to the questionCategory entry
        if (questionCategory in fensScoresByCategory) {
          fensScoresByCategory[questionCategory].push(fensScore);
        } else {
          fensScoresByCategory[questionCategory] = [fensScore];
        }
      });

      // Define the order of question categories
      const questionCategories = ["Functional", "Emotional", "Nutritional", "Spiritual"];

      // Create the final array by appending fensScores in the specified order
      // console.log('fensScoresByCategory ', Object.keys(fensScoresByCategory))
      if (Object.keys(fensScoresByCategory).length > 0) {
        const finalArray = questionCategories.map((category) => {
          return fensScoresByCategory[category].join(", ")
        });
        // console.log('finalArray========', finalArray)

        setFensScore(finalArray)
        setPdfData({
          ...pdfData,
          fensScore: finalArray,
          customerName: e.value
        })
      }

    } else {
      setSurveyList([])
      setFensScore([])
      setCustomerName(null)
    }
  }

  const handleGeneratePdf = () => {
    setGeneratePdf(true)
    setTimeout(() => {

      handlePrint()
      // setGeneratePdf(false)
    }, 2000)
  }


  const exportExcel = (sheets) => {
    if (sheets.length === 0) {
      return;
    }

    const wb = {
      Sheets: {},
      SheetNames: [],
    };
    sheets.forEach((sheetData, index) => {
      const { data, sheetName } = sheetData;
      const tableData = [];

      for (const element of data) {
        let map = new Map();
        for (const h of headerSheet) {
          const head = h.accessor;
          if (element.hasOwnProperty(head)) {
            map.set(h.Header, element[head]);
          }
        }
        const obj = Object.fromEntries(map);
        tableData.push(obj);
      }
      console.log('tableData ---------------->', tableData)
      const ws = XLSX.utils.json_to_sheet(tableData, {
        origin: 'A2',
        skipHeader: true,
      });

      wb.Sheets[sheetName] = ws;
      wb.SheetNames.push(sheetName);
    });

    const excelBuffer = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
    });

    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    FileSaver.saveAs(data, 'PatientDetails.xlsx');
  };

  const handleGenerateExcel = () => {
    get(`${properties.BI_API}/survey-export?surveyRefNo=${surveyRefNo}&customerName=${customerName}&contactNo=${contactNo}`).then((resp) => {
      exportExcel(resp.data);
    });
  };


  return (
    <div id="pdf-content" className="content">
      <div className="container-fluid" style={{ margin: '100px 100px' }}>
        <div className="cnt-wrapper">
          {/* Filter */}
          <div className="row mt-2">
            <div className="col-md-6 px-0">
              <img src={imgLeft} width={'250px'} height={'100px'} />
            </div>
            <div className="col-md-6 px-0">
              <img src={imgRight} width={'150px'} height={'100px'} />
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-md-10">
              <div className="d-flex cmmn-skeleton col-12">
                {/* <div className="col">
                                    <h5>Sales Dashboard</h5>
                                </div> */}
                <div className="col-3 py-0">Patient Name
                  <Select
                    id="customerName"
                    menuPortalTarget={document.body}
                    styles={{
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                    }}
                    options={customerList}
                    value={
                      [{ label: customerName, value: customerName }]
                    }
                    onChange={(e) => { handleOnchange(e, 'customerName')}}
                  />
                  {/* <select className="form-control" id='customerName' onChange={handleOnchange} value={customerName}>
                    <option value="">All</option>
                    {
                      customerList && customerList.map((v, k) =>
                      (
                        <option key={k} value={v.customerName}>{v.customerName}</option>
                      )
                      )
                    }
                  </select> */}
                </div>
                <div className="col-3 py-0">Patient Contact Number
                  <input type="text" className="form-control" id='contactNo' onChange={handleOnchange} value={contactNo} />
                </div>
              </div>
            </div>
          </div>
          <div>
            {customerName && <div className="row mt-2">
              <div className="col-md-10 px-0">
                <p>
                  Dear {customerName},<br />
                  Your FENS score is based on the FENS questionnaire that you have taken.<br />
                  Optimal FENS quad score is {fensScore} out of 5555<br />
                </p>
              </div>
            </div>}
            <div className="row mt-2">
              <div className="col-md-10 px-0">
                <div className="card">
                  <div className="card-body">
                    <div className="row px-2">
                      <h4 className="header-title mb-3">Summary</h4>

                      {customerName &&
                        <div className="col-3 py-0" style={{ marginLeft: "40%", marginBottom: '5px' }}>
                          <button type="button" className="skel-btn-submit"
                            onClick={handleGenerateExcel}
                          >
                            Export as Excel
                          </button>
                          <button type="button" className="skel-btn-submit"
                            onClick={handleGeneratePdf}
                          >
                            Export as PDF
                          </button>
                          {/* <ExportExcelFile
                                        fileName={'FIle.xlsx'} 
                                        header={headerSheet1}
                                        handleExportButton={setExportBtn}
                                        url={`${properties.BI_API}/survey-export/${surveyRefNo}`} method={'GET'}
                                    /> */}
                        </div>
                      }
                    </div>
                    <div id="cardCollpase5xc">
                      <div className="row px-2">
                        <div className="col-md-8 bg-white border" width="100%" height="320">
                          <HorizontalBarChart
                            data={{
                              chartData: surveyList
                            }}
                            handler={{
                              setChartData: setSurveyData
                            }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row mt-2">
              <div className="col-md-12 px-0">
                <img src={img1} />
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-md-12 px-0">
                <img src={img2} />
              </div>
            </div>

          </div>
          {
            generatePdf &&
            <Modal isOpen={generatePdf}>
              <BIDashboardPdf
                pdfData={pdfData}
                chartData={surveyList}
                ref={componentRef}
                handler={{
                  handlePreviewCancel: false,
                  handlePrint: false
                }}
              />
            </Modal>
          }
        </div>
      </div>
    </div>
  );
};

const headerSheet = [
  {
    Header: "Property",
    accessor: "property1",
    disableFilters: true,
  },
  {
    Header: "Value",
    accessor: "property2",
    disableFilters: true,
  },
  {
    Header: "Score",
    accessor: "property3",
    disableFilters: true,
  }
]

export default BIEmbed;
