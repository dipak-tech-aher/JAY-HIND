import { format, startOfMonth, endOfMonth } from 'date-fns'
import moment from 'moment'

export function noOfDaysBetween2Dates (startDate, endDate) {
  const DifferenceInTime =
    new Date(endDate).getTime() - new Date(startDate).getTime()
  const DifferenceInDays = Math.round(DifferenceInTime / (1000 * 3600 * 24))
  return DifferenceInDays + 1
}

export function getDaysInMonth (month, year) {
  return new Date(year, month, 0).getDate()
}

export function returnInvoiceAmountProrate (chargeAmt, frequency, durationMonth, startDate, endDate, nextBillPeriod, contract) {
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

export const getLastDateOfMonth = (date) => {
  const mnthArray = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
  // const retDate = new Date(new Date(date).getFullYear(), new Date(date).getMonth() + 1, 1)
  return (
    date.getFullYear() + '-' + mnthArray[date.getMonth()] + '-' + date.getDate().toString().padStart(2, 0)
  )
}

export const formatDateDDMMMYY = (dateStr) => {
  const mnthArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const date = new Date(dateStr.toString().slice(0, 9))

  return (
    date.getDate().toString().padStart(2, 0) +
      ' ' +
      mnthArray[date.getMonth()] +
      ' ' +
      date.getFullYear()
  )
}

export const getUTCforLocalDateInddMMMyyyy = (date) => {
  // const mnthArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  date.setHours(0)
  date.setMinutes(0)
  date.setSeconds(0)
  date.setMilliseconds(0)

  return (
    date.getUTCFullYear() +
      '-' +
      (date.getUTCMonth() + 1).toString().padStart(2, 0) +
      '-' +
      date.getUTCDate().toString().padStart(2, 0) +
      ' ' +
      date.getUTCHours().toString().padStart(2, 0) +
      ':' +
      date.getUTCMinutes().toString().padStart(2, 0) +
      ':' +
      date.getUTCSeconds().toString().padStart(2, 0) +
      'Z'
  )
}

export const getLocalDateInMMDDYYYY = (date) => {
  // const mnthArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  date.setHours(0)
  date.setMinutes(0)
  date.setSeconds(0)
  date.setMilliseconds(0)

  return (
    (date.getUTCMonth() + 1).toString().padStart(2, 0) +
      '-' +
      date.getUTCDate().toString().padStart(2, 0) +
      '-' +
      date.getUTCFullYear()
  )
}

export const noOfMonthsBetween2Dates = (startDate, endDate) => {
  startDate = new Date(startDate)
  endDate = new Date(endDate)
  return Math.max(
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      endDate.getMonth() -
      startDate.getMonth(),
    0

  )
}

export const getFutureDates = (period, noOfMonth) => {
  const date = new Date(period)
  const nextMonth = date.setMonth(date.getMonth() + noOfMonth)
  return nextMonth
}

export const getOlderDates = (period, noOfMonth) => {
  const date = new Date(period)
  const nextMonth = date.setMonth(date.getMonth() - noOfMonth)
  return nextMonth
}

export const getQuarter = (startDate, toDate) => {
  const beginDate = moment(startDate)
  const endDate = moment(toDate)
  const quarters = endDate.diff(beginDate, 'months') / 3
  let noOfQuarters = Math.floor(quarters)
  const decimal = quarters.toString()
  if (decimal) {
    const pression = decimal.split('.')[1]
    if (pression) {
      if (pression.charAt(0) > 0) {
        noOfQuarters = noOfQuarters + 1
      }
    }
  }
  return noOfQuarters
}

export const getCurrentQuarter = (contStartDate) => {
  const contractDate = new Date(contStartDate)
  let lastBillDate, nextBillDate
  const beginDate = moment(contractDate)
  const endDate = moment(new Date())

  const quarters = endDate.diff(beginDate, 'months') / 3
  const noOfMonths = Math.floor(quarters)
  for (let i = 1; i <= noOfMonths; i++) {
    nextBillDate = new Date(contractDate.setMonth(contractDate.getMonth() + 3))
  }
  if (noOfMonths === 0) {
    const decimal = quarters.toString()
    const pression = decimal.split('.')[1]
    if (pression) {
      if (pression.charAt(0) > 0) {
        const today = new Date()
        const nextMonth = new Date(today.setMonth(today.getMonth() + 1))
        nextBillDate = startOfMonth(nextMonth)
      }
    }
  }
  return {
    lastBillDate,
    nextBillDate
  }
}

export const getWholeQuarter = (contStartDate) => {
  const contractDate = new Date(contStartDate)
  let lastBillDate, nextBillDate
  const noOfMonths = getQuarter(contractDate, new Date())
  for (let i = 1; i <= noOfMonths; i++) {
    nextBillDate = new Date(contractDate.setMonth(contractDate.getMonth() + 3))
  }
  return {
    lastBillDate,
    nextBillDate
  }
}

export const getUniversalQuarter = (data) => {
  const past = new Date(data)
  // const pastDate = past.getDate()
  const pastYear = past.getFullYear()
  // const pastMonth = past.getMonth()

  const today = new Date()
  // const d = today.getDate()
  const y = today.getFullYear()
  const m = today.getMonth()
  let latestQuarter = ''
  let latestYear = ''
  // let quarters = ['Jan-Feb-Mar', 'Apr-May-Jun', 'Jul-Aug-Sep', 'Oct-Nov-Dec']
  const quarters = ['01-02-03', '04-05-06', '07-08-09', '10-11-12']
  const options = []

  for (let i = pastYear; i < y; i++) {
    quarters.forEach(q => options.push({
      quarter: q,
      year: i
    }))
  }
  quarters.slice(0, parseInt(m / 3 + 1)).forEach(q => options.push({
    quarter: q,
    year: y
  }))
  for (const i of options) {
    if (i.quarter.includes(m) && i.year === y) {
      latestQuarter = i.quarter.split('-')[2]
      latestYear = i.year
      console.log('found', latestQuarter, latestYear)
    }
  }
  console.log('found', latestYear + '-' + latestQuarter + '-' + '01')
  return latestYear + '-' + latestQuarter + '-' + '01'
}

export const getMonthName = (month) => {
  let monthName
  if (month === 1) {
    monthName = 'January '
  } else if (month === 2) {
    monthName = 'February'
  } else if (month === 3) {
    monthName = 'March'
  } else if (month === 4) {
    monthName = 'April'
  } else if (month === 5) {
    monthName = 'May'
  } else if (month === 6) {
    monthName = 'June'
  } else if (month === 7) {
    monthName = 'July'
  } else if (month === 8) {
    monthName = 'August'
  } else if (month === 9) {
    monthName = 'September'
  } else if (month === 10) {
    monthName = 'October'
  } else if (month === 11) {
    monthName = 'November '
  } else if (month === 12) {
    monthName = 'December '
  }
  return monthName
}
