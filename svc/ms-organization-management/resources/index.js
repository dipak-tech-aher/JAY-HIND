import { get } from 'lodash'

export const transformAddress = (address) => {
  const data = {
    addressType: get(address, 'addressType', 'Home'),
    address1: get(address, 'flatHouseUnitNo', ''),
    address2: get(address, 'building', ''),
    address3: get(address, 'street', ''),
    city: get(address, 'cityTown', ''),
    district: get(address, 'district', ''),
    state: get(address, 'state', ''),
    country: get(address, 'country', ''),
    postcode: get(address, 'postcode', ''),
    addressCategory: get(address, 'addressCategory', ''),
    addressCategoryValue: get(address, 'addressCategoryValue', '')

  }
  return data
}

export const transformResponseAddress = (address) => {
  const response = {
    addressId: get(address, 'addressId', ''),
    addressType: get(address, 'addressType', 'Home'),
    flatHouseUnitNo: get(address, 'address1', ''),
    building: get(address, 'address2', ''),
    street: get(address, 'address3', ''),
    cityTown: get(address, 'city', ''),
    district: get(address, 'district', ''),
    state: get(address, 'state', ''),
    country: get(address, 'country', ''),
    postcode: get(address, 'postcode', '')
  }
  return response
}
