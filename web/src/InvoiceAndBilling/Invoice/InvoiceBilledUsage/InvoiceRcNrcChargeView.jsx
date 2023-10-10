import React, { useEffect, useState } from 'react'
import DynamicTable from '../../../common/table/DynamicTable'
import { InvoiceChargeColumns } from '../InvoiceSearchColumns'

const InvoiceRcNrcChargeView = (props) => {

    const { chargeType, hiddenColumns, billingUsageList, showChargeTable, invoiceData } = props?.data
    const { setBillingUsageList ,handleCellRender, setShowChargeTable} = props?.handler
    const [exportBtn, setExportBtn] = useState(false)

    useEffect(() => {
        setTimeout(() => {
        let dummyData = [
            {
                invoiceId: 441536,
                billRefNo: 100001,
                serviceNumber: 2238600,
                contractName: 'Broad band 200 GB',
                startDate: '2021-10-21',
                endDate: '2022-10-21',
                chargeDate: '2021-10-21',
                chargeAmount: 100
            },
            {
                invoiceId: 441536,
                billRefNo: 100001,
                serviceNumber: 2238600,
                contractName: 'Broad band 200 GB',
                startDate: '2021-10-21',
                endDate: '2022-10-21',
                chargeDate: '2021-10-21',
                chargeAmount: 100
            }
        ]
        setBillingUsageList(dummyData)
        setShowChargeTable(true)
        },1000) 
    },[chargeType])

    
    return (
        <>
            <div className="col-md-12 card-box m-0 ">
                {
                    !!billingUsageList.length && showChargeTable &&
                    <DynamicTable
                        listKey={"Invoice List"}
                        row={billingUsageList}
                        itemsPerPage={10}
                        hiddenColumns={hiddenColumns}
                        header={InvoiceChargeColumns}
                        exportBtn={exportBtn}
                        handler={{
                            handleCellRender: handleCellRender,
                            handleExportButton: setExportBtn
                        }}
                    />
                }
            </div>
        </>
    )
}

export default InvoiceRcNrcChargeView