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

export const isValidEmail = (string) => {
  var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (string.match(mailformat)) {
    return true;
  }
  else {
    return false;
  }
}