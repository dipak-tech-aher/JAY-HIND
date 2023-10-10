import { camelCase, pick } from 'lodash'
// import moment from 'moment'
// import { endOfMonth, format } from 'date-fns'

export const camelCaseConversion = (data) => {
  for (let index = 0; index < data.length; index++) {
    const obj = data[index]
    for (const key in obj) {
      const element = obj[key]
      delete obj[key]
      obj[camelCase(key)] = element
    }
  }
  return data
}

export const pickProperties = (obj, fields) => {
  return pick(obj, fields)
}

// export const getFutureDates = (period, noOfMonth) => {
//   const date = new Date(period)
//   const nextMonth = date.setMonth(date.getMonth() + noOfMonth)
//   return nextMonth
// }

// export const getOlderDates = (period, noOfMonth) => {
//   const date = new Date(period)
//   const nextMonth = date.setMonth(date.getMonth() - noOfMonth)
//   return nextMonth
// }

// export const getQuarter = (startDate, toDate) => {
//   const beginDate = moment(startDate)
//   const endDate = moment(toDate)
//   const quarters = endDate.diff(beginDate, 'months') / 3
//   let noOfQuarters = Math.floor(quarters)
//   const decimal = quarters.toString()
//   if (decimal) {
//     const pression = decimal.split('.')[1]
//     if (pression) {
//       if (pression.charAt(0) > 0) {
//         noOfQuarters = noOfQuarters + 1
//       }
//     }
//   }
//   return noOfQuarters
// }

const noOfDaysBetween2Dates = (startDate, endDate) => {
  const DifferenceInTime =
    new Date(endDate).getTime() - new Date(startDate).getTime()
  const DifferenceInDays = Math.round(DifferenceInTime / (1000 * 3600 * 24))
  return DifferenceInDays + 1
}

const returnInvoiceAmountProrate = (chargeAmt, frequency, durationMonth, startDate, endDate, nextBillPeriod, contract) => {
  const actualStartDate = startDate || contract.actualStartDate
  const actualEndDate = endDate || contract.actualEndDate
  const noOfMonth = frequency === 'FREQ_QUARTER' ? 2 : frequency === 'FREQ_HALF_YEAR' ? 5 : frequency === 'FREQ_YEAR' ? 11 : null
  const contStartDate = new Date(actualStartDate)
  const firstDate = format(
    new Date(contStartDate.getFullYear(), contStartDate.getMonth()),
    'yyyy-MM-dd'
  )
  const nextCycle = new Date().setMonth(
    new Date(firstDate).getMonth() + Number(noOfMonth)
  )
  const cycleEndDate = format(endOfMonth(new Date(nextCycle)), 'yyyy-MM-dd')
  const totalDays = noOfDaysBetween2Dates(
    new Date(firstDate),
    new Date(cycleEndDate)
  )
  const amountTobeCal = (chargeAmt / Number(durationMonth)) / totalDays// contract.chargeAmt / totalDays;
  let contEndDate = new Date(actualEndDate)
  if (contEndDate > cycleEndDate) {
    contEndDate = new Date(nextBillPeriod)
  }
  const invAmt =
    amountTobeCal * noOfDaysBetween2Dates(contStartDate, contEndDate)

  return invAmt
}

export const calculateInvoice = async (chargeAmt, balanceAmt, contract, contStartDate, contractEndDate, noOfQuarter) => {
  let invoiceAmt; let balanceAmount; const ret = {}
  const actualEndDate = contractEndDate || contract.actualEndDate
  const diffBetDays = noOfDaysBetween2Dates(new Date(contStartDate), new Date(actualEndDate))

  let noOfQuarters = 0
  // console.log('Duration Months: ', contract.durationMonth)
  if (contract.durationMonth) {
    let duration = Number(contract.durationMonth) / 3
    if (duration) {
      const pression = duration.toString().split('.')[1]
      if (pression) {
        if (pression.charAt(0) > 0) {
          duration = Math.floor(duration)
          noOfQuarters = Number(duration) + 1
        }
      } else {
        noOfQuarters = duration
      }
    }
  }

  if (contract?.frequency === 'FREQ_MONTH' || contract?.frequency === 'FREQ_HALF_YEAR' || contract?.frequency === 'FREQ_YEAR') {
    noOfQuarters = noOfQuarter
  }

  if (balanceAmt !== 0 && balanceAmt) {
    // Need to check this for prorated yes
    // console.log('no Of quarters',noOfQuarters)
    const charge = Number(chargeAmt) / noOfQuarters// Number(contract.durationMonth)
    if (contract.prorated === 'Y') {
      if (contract.frequency === 'FREQ_DAILY') {
        const diffBetDays = noOfDaysBetween2Dates(contStartDate, actualEndDate)
        invoiceAmt = charge / diffBetDays
      } else if (contract.frequency === 'FREQ_MONTH') {
        const noOfDaysInCurrentMonth = getDaysInMonth(
          new Date(contStartDate).getMonth() + 1,
          new Date(contStartDate).getFullYear()
        )
        const amountTobeCal = charge / Number(noOfDaysInCurrentMonth)
        invoiceAmt = diffBetDays * amountTobeCal
      } else if (contract.frequency === 'FREQ_WEEK') {
        const weekcal = diffBetDays / 7
        invoiceAmt = weekcal * charge
      } else if (contract.frequency === 'FREQ_BI_MONTH') {
        const noOfDaysInCurrentMonth = getDaysInMonth(
          new Date(contStartDate).getMonth() + 1,
          new Date(contStartDate).getFullYear()
        )
        const noOfBiMonthDays = noOfDaysInCurrentMonth / 2
        const dayCal = diffBetDays / noOfBiMonthDays
        invoiceAmt = dayCal * charge
      } else {
        invoiceAmt = returnInvoiceAmountProrate(chargeAmt, contract.frequency, contract.durationMonth, contStartDate, actualEndDate, contract.nextBillPeriod, contract)
      }
    } else {
      if (contract.frequency === 'FREQ_DAILY') {
        invoiceAmt = charge / diffBetDays
      } else if (contract.frequency === 'FREQ_MONTH') {
        invoiceAmt = charge
      } else if (contract.frequency === 'FREQ_WEEK') {
        const weekcal = diffBetDays / 7
        let week
        if (weekcal > 1 && weekcal <= 2) {
          week = 2
        } else if (weekcal > 2 && weekcal <= 3) {
          week = 3
        } else if (weekcal > 3 && weekcal <= 4) {
          week = 4
        } else if (weekcal > 4 && weekcal <= 5) {
          week = 5
        } else {
          week = 1
        }
        invoiceAmt = week * charge
      } else if (contract.frequency === 'FREQ_BI_MONTH') {
        let dayCal
        if (diffBetDays <= 15) {
          dayCal = 1
        } else {
          dayCal = 2
        }
        invoiceAmt = dayCal * charge
      } else {
        invoiceAmt = (chargeAmt / noOfQuarters).toFixed(2)// per quarter amount
        if (contract.frequency === 'FREQ_HALF_YEAR') {
          // invoiceAmt = invoiceAmt * 2
        } else if (contract.frequency === 'FREQ_YEAR') {
          // invoiceAmt = invoiceAmt * 4
        }
      }
    }
    balanceAmount = balanceAmt - invoiceAmt
    if (balanceAmount < 0) {
      balanceAmount = 0
    }
    ret.balanceAmount = balanceAmount
    ret.invoiceAmt = invoiceAmt
  } else {
    ret.balanceAmount = 0
    ret.invoiceAmt = 0
  }
  return ret
}

const getDaysInMonth = (month, year) => {
  return new Date(year, month, 0).getDate()
}
