import { camelCaseConversion, pickProperties } from '@utils'
import { each, get } from 'lodash'

module.exports = {

  transfromBusinessParameter (businessParameter, userId, businessParameterInfo) {
    const data = {
      code: businessParameter?.code || businessParameterInfo?.code || null,
      description: businessParameter?.description || businessParameterInfo?.description || null,
      codeType: businessParameter?.codeType || businessParameterInfo?.codeType || null,
      mappingPayload: businessParameter?.mappingPayload || businessParameterInfo?.mappingPayload || null,
      status: businessParameter?.status || businessParameterInfo?.status,
      updatedBy: Number(userId)
    }
    if (!businessParameterInfo) data.createdBy = Number(userId)
    return data
  },

  transfromPortalSetting (portalSetting, userId) {
    const data = {
      settingType: portalSetting?.settingType || null,
      mappingPayload: portalSetting?.mappingPayload || null,
      createdBy: userId,
      updatedBy: userId
    }
    return data
  },

  transformTemplateDetails (tempData, businessEntityInfo) {
    const self = this
    // console.log(self)
    let response = []
    if (Array.isArray(tempData)) {
      response = []
      each(tempData, (tempData) => {
        // console.log(tempData.templateMap)
        response.push(self.transformTemplateDetails(tempData?.templateMap, businessEntityInfo))
      })
    } else {
      response = {
        serviceCategoryDesc: this.getbusinessEntity(businessEntityInfo, get(tempData, 'serviceCategory', '')) || null,
        serviceType: this.getbusinessEntity(businessEntityInfo, get(tempData, 'serviceType', '')) || null,
        customerClass: this.getbusinessEntity(businessEntityInfo, get(tempData, 'customerClass', '')) || null,
        customerCategory: this.getbusinessEntity(businessEntityInfo, get(tempData, 'customerCategory', '')) || null,
        tranType: this.getbusinessEntity(businessEntityInfo, get(tempData, 'tranType', '')) || null,
        tranCategory: this.getbusinessEntity(businessEntityInfo, get(tempData, 'tranCategory', '')) || null,
        tranPriority: this.getbusinessEntity(businessEntityInfo, get(tempData, 'tranPriority', '')) || null
      }
    }
    return response
  },

  getbusinessEntity (businessEntityInfo, code) {
    let response = null
    if (Array.isArray(code)) {
      response = []
      each(code, (code) => {
        response.push(this.getbusinessEntity(businessEntityInfo, code))
      })
    } else {
      response = businessEntityInfo.find(e => e.code === code)
      if (response) {
        response = {
          code: get(response, 'code', ''),
          description: get(response, 'description', '')
        }
      }
    }
    return response
  }
}
