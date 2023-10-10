import { camelCaseConversion, pickProperties } from '@utils'

module.exports = {
  // single transformation
  Transform (user) {
    const requiredProperties = []

    return pickProperties(camelCaseConversion(user), requiredProperties)
  },

  // array transformation
  transformCollection (users) {
    const self = this
    const data = []
    for (let i = 0; i <= users.length; i++) {
      data.push(self.transform(users[i]))
    }
    return data
  },

  invoicePDFdata (data) {
    const account = data.invoiceData.accountDetail
    const invoice = data.invoiceData
    const allServices = data.allServices
    const summery = data.summery
    const response = {
      address: {
        firstName: account?.firstName || null,
        lastName: account?.lastName || null,
        hno: account?.accountAddress?.address1 || null,
        block: account?.accountAddress?.address2 || null,
        buildingName: account?.accountAddress?.address3 || null,
        street: account?.accountAddress?.street || null,
        road: account?.accountAddress?.road || null,
        city: account?.accountAddress?.city || null,
        town: account?.accountAddress?.town || null,
        state: account?.accountAddress?.state || null,
        district: account?.accountAddress?.district || null,
        country: account?.accountAddress?.country || null,
        postCode: account?.accountAddress?.postcode || null
      },
      invoice: {
        invoiceId: invoice?.invoiceId || null,
        invoiceNo: invoice?.invNo || null,
        billRefNo: invoice?.billRefNo || null,
        invStartDate: invoice?.invStartDate || null,
        invEndDate: invoice?.invEndDate || null,
        invDate: invoice?.invDate || null,
        dueDate: invoice?.dueDate || null,
        soNumber: invoice?.soNumber || '-'
      },
      dueAmount: {
        previousOutstanding: data?.invoiceData?.prevBalance || 0,
        advancePayment: data?.invoiceData?.advAmount || 0,
        invoiceAmount: data?.invoiceData?.invAmt || 0,
        totalOutstnading: data?.totalOutstanding || 0,
        dueOutStanding: 0
      },
      summary: {
        monthlyRentals: summery?.monthlyRental || 0,
        oneTimeCharge: summery?.oneTimeCharge || 0,
        usageCharge: summery?.usageCharge || 0,
        debitAdjustment: summery?.debitAdjustment || 0,
        creditAdjustment: summery?.creditAdjustment || 0,
        total: summery?.total || 0,
        finalTotalAmount: data?.totalOutstanding || 0
      },
      services: allServices || []
    }
    return response
  }

}
