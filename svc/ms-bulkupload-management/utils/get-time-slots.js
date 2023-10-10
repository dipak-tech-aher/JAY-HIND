const getTime = (num) => {
  const tempHour = String(Math.trunc(num / 60))
  const hour = tempHour + ''.length === 1 ? '0' + tempHour : tempHour
  const min = num % 60 === 0 ? '00' : num % 60
  return { num, time: hour + ':' + min }
}

const getTimeSlots = (blockTimes, showTimeAsString, interval, includeStartBlockedTime, includeEndBlockedTime) => {
  let times = 1
  let sums = 60
  includeStartBlockedTime = includeStartBlockedTime === true
  includeEndBlockedTime = includeEndBlockedTime === true
  switch (interval) {
    case '10':
      times = 6
      sums = 10
      break
    case '15':
      times = 4
      sums = 15
      break
    case '20':
      times = 3
      sums = 20
      break
    case '30':
      times = 2
      sums = 30
      break
    case '60':
      times = 1
      sums = 60
      break
    case '120':
      times = 1 / 2
      sums = 120
      break
    case '180':
      times = 1 / 3
      sums = 180
      break
    case '240':
      times = 1 / 4
      sums = 240
      break
    default:
      times = 1
      sums = 60
      break
  }
  let start = 0
  let dateTimes = Array(Math.round(24 * times))
    .fill(0)
    .map(function (_) {
      start = start + sums
      return start
    })
  blockTimes = Array.isArray(blockTimes) === true && blockTimes.length > 0 ? blockTimes : []
  if (blockTimes.length > 0) {
    dateTimes = blockTimes.reduce(function (acc, x) {
      return acc
        .filter(function (y) {
          return includeStartBlockedTime ? y <= x[0] : y < x[0]
        })
        .concat(
          acc.filter(function (y) {
            return includeEndBlockedTime ? y >= x[1] : y > x[1]
          })
        )
    }, dateTimes)
  }
  if (showTimeAsString === true) {
    return dateTimes
      .map(function (x) {
        return getTime(x)
      })
      .reduce(function (accc, element) {
        accc['' + element.num] = element.time
        return accc
      }, {})
  }
  return dateTimes
}

module.exports = getTimeSlots
