import React, { useEffect, useRef } from 'react';
import { embedDashboard } from "@superset-ui/embedded-sdk";
import { properties } from '../../properties';
import { get } from '../../common/util/restUtil';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import html2pdf from 'html2pdf.js';

const DashboardEmbed = ({ dashboardObj }) => {

  const dashboardRef = useRef();
  const iframeContentRef = useRef();

  const getToken = async () => {
    let token = null;
    try {
      const response = await get(properties.BI_API+'/guest-token/'+dashboardObj);
      if (response.status === 200) {
        token = response.data;
      } else {
        console.error('Failed to authenticate');
      }
    } catch (error) {
      console.error('Error fetching token:', error);
    }
    return token;
  }

  const generatePdf = async (iframeContent) => {
    const pdf = new jsPDF();
    try {
      console.log('iframeContent', iframeContent)
      // const canvas = await html2canvas(iframeContent);
      // const imgData = canvas.toDataURL('image/png');
      // pdf.addImage(imgData, 'PNG', 15, 15);

      const pdfOptions = {
        margin: 10,
        filename: 'dashboard.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      // pdf.save('dashboard.pdf');
         // Generate the PDF
    html2pdf().from(iframeContent).set(pdfOptions).outputPdf(pdf => {
      // You can save or display the PDF here
      // For example, you can open it in a new tab
      setTimeout(() => {
        console.log('inside time out', pdf)
        const blobUrl = URL.createObjectURL(pdf);
        console.log('blobUrl================>', blobUrl)

        window.open(blobUrl, '_blank');
      }, 3000)
    });
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  useEffect(() => {
    const embed = async () => {
      await embedDashboard({
        id: dashboardObj,
        supersetDomain: "https://dtworks-ext.comquest-brunei.com:15443",
        mountPoint: dashboardRef.current, // Use the dashboardRef for the mount point
        fetchGuestToken: getToken,
        dashboardUiConfig: {
          hideTitle: true,
          hideChartControls: false,
          hideTab: true,
        },
      });
    }

    if (dashboardRef.current) {
      embed();
    }

    if (iframeContentRef.current) {
      const iframeBody = iframeContentRef.current.contentWindow.document.body;
      const embedDiv = document.getElementById("embedDiv");
  
      // Ensure the embedDiv exists before proceeding
      if (embedDiv) {
        // Clear the existing content of embedDiv
        embedDiv.innerHTML = "";
  
        // Clone the contents of the iframe body and append them to embedDiv
        const clone = iframeBody.cloneNode(true);
        embedDiv.appendChild(clone);
  
        // Hide the dashboard div and display the embedDiv
        dashboardRef.current.style.display = "none";
        embedDiv.style.display = "block";
  
        // Generate the PDF from the embedDiv content
        generatePdf(iframeBody);
      }
    }
  }, [dashboardObj]);

  const handlePrint = () => {
    // console.log(iframeContentRef.current)
    if (iframeContentRef.current) {
      generatePdf(iframeContentRef.current.contentWindow.document.body);
    }
  }

  return (
    <>
      {/* <button onClick={handlePrint}>Print</button> */}
      <div ref={dashboardRef} id="dashboard" className="embedded-superset" style={{display: 'none'}}/>
      {dashboardRef.current && dashboardRef.current.querySelector('iframe') && (
        <>
        <iframe
          id= "iframe-framed"
          ref={iframeContentRef}
          src={dashboardRef.current.querySelector('iframe').src}
          style={{ display: 'none' }}
          title="HiddenIframe"
        />
        <div id="embedDiv"></div>
        </>
      )}
    </>
  );
};

export default DashboardEmbed;
