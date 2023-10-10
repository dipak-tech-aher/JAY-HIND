import React from 'react';
import HorizontalBarChart from '../../Dashboard/charts/horizontalBar';
import img1 from '../../assets/images/prameya1.png';
import img2 from '../../assets/images/prameya2.png';
import imgLeft from '../../assets/images/prameya-left.png';
import imgRight from '../../assets/images/prameya-right.png';


const BIDashboardPdf = React.forwardRef((props, ref) => {
    const {pdfData, chartData} = props;

  return (
    <div>
        <div ref={ref}>
            <div className="page-container container p-5" style={{margin: '100px 100px'}}>
                <div className="row mt-2">
                    <div className="col-md-8 px-0">
                        <img src={imgLeft} width= {'250px'} height= {'100px'}/>                        
                    </div>
                    <div className="col-md-4 px-0">
                        <img src={imgRight} width= {'150px'} height= {'100px'}/>                        
                    </div>
                </div>
                         
                {pdfData.customerName && 
                <div className="row mt-2" >
                    <div className="col-md-12 px-0">
                        <p>
                          Dear {pdfData.customerName},<br/>
                          Your FENS score is based on the FENS questionnaire that you have taken.<br/>
                          Optimal FENS quad score is {pdfData.fensScore} out of 5555<br/>
                        </p>                       
                    </div>
                </div>}
                <div className="row mt-2">
                    <div className="col-md-12 px-0">
                        <div className="card">
                            <div className="card-body">                                 
                                <h4 className="header-title mb-3">Summary</h4>
                                <div id="cardCollpase5xc">
                                    <div className="row px-2">
                                        <div className="col-md-8 bg-white border" width="100%" height="520">
                                            <HorizontalBarChart
                                                data={{
                                                    chartData: chartData
                                                }}
                                                chartStyle={{ width: '100%', height: '100%' }}
                                            />
                                        </div>                                              
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row mt-2">
                    <div className="col-md-12 px-0">
                        <img src={img1} style={{margin: '150px 50px'}} width= {'80%'} height= {'90%'}/>                        
                    </div>
                </div>
                <div className="row mt-2">
                    <div className="col-md-12 px-0">
                        <img src={img2} style={{margin: '150px 50px'}} width= {'80%'} height= {'90%'}/>                        
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
});

export default BIDashboardPdf;
