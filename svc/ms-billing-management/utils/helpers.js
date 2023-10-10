import { camelCase, pick } from 'lodash'

export const camelCaseConversion = (obj) => {
  for (const key in obj) {
    const element = obj[key]
    delete obj[key]
    obj[camelCase(key)] = element
  }
  return obj
}

export const pickProperties = (obj, fields) => {
  return pick(obj, fields)
}
export const removeDuplicates = (array) => {
  const uniqueObjects = []
  const uniqueValues = new Set()

  for (const obj of array) {
    const value = Object.values(obj)[0]
    if (!uniqueValues.has(value)) {
      uniqueValues.add(value)
      uniqueObjects.push(obj)
    }
  }

  return uniqueObjects
}
