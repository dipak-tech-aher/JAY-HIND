/* eslint-disable eqeqeq */
/* eslint-disable camelcase */
import { config } from '@config/env.config'
import { CryptoHelper, constantCode, defaultMessage, logger, statusCodeConstants } from '@utils'
import { isEmpty } from 'lodash'
// const tesseract = require('node-tesseract-ocr')
// const cv = require('opencv.js')
// const jpeg = require('jpeg-js')

const msRest = require('@azure/ms-rest-js')
const Face = require('@azure/cognitiveservices-face')

const { v4: uuidv4 } = require('uuid')
const fs = require('fs')
const fsp = require('fs').promises
const path = require('path')
const axios = require('axios')
const async = require('async')
// const IDAnalyzer = require('idanalyzer')
// const cv = require('@techstark/opencv-js')
const { google } = require('googleapis')
const { systemUserId, systemRoleId, azureFaceAPIKey, azureFaceAPIEndpoint } = config
// const generatePassword = require('generate-password')
const qs = require('qs')
let refreshInProgress = false
const queuedRequests = []

// const { ID_ANALYZER_API_KEY, ID_ANALYZER_API_SERVER, ONEDRIVE_BUCKET } = process.env

// const CoreAPI = new IDAnalyzer.CoreAPI(ID_ANALYZER_API_KEY, ID_ANALYZER_API_SERVER)
// Enable authentication module v2 to check if ID is authentic
// CoreAPI.enableAuthentication(true, 2)

const credentials = new msRest.ApiKeyCredentials({
  inHeader: {
    'Ocp-Apim-Subscription-Key': azureFaceAPIKey
  }
})

const client = new Face.FaceClient(credentials, azureFaceAPIEndpoint)

let instance
let file

// console.log('ID_ANALYZER_API_KEY ', ID_ANALYZER_API_KEY)
class CommonService {
  constructor () {
    if (!instance) {
      instance = this
    }
    instance.cryptoHelper = new CryptoHelper()
    return instance
  }

  // async externalNotification (payload, conn) {
  //   try {
  //     const {
  //       mapCategory, tranCategory, tranType, serviceCategory, serviceType, tranEntity
  //     } = payload
  //     constantCode.template.ACTIVE
  //   } catch (e) {
  //     console.log(e)
  //   }
  // }

  sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async DetectFaceRecognize (file) {
    const imageBuffer = fs.readFileSync(file)

    const detected_faces = await client.face.detectWithStream(imageBuffer, {
      returnFaceId: true,
      detectionModel: 'detection_03',
      recognitionModel: 'recognition_04',
      returnFaceAttributes: ['QualityForRecognition']
    })
    return detected_faces.filter(face => face.faceAttributes.qualityForRecognition === 'high' || face.faceAttributes.qualityForRecognition == 'medium')
  }

  async faceCompare (fileSource, fileTarget) {
    try {
      console.log('======== IDENTIFY FACES ========')
      const _self = this

      const { file_path: file_source_path, file_moved: file_source_moved } = await _self.moveFile(fileSource, 'base64')
      const { file_path: file_target_path, file_moved: file_target_moved } = await _self.moveFile(fileTarget)

      const files = [
        { from: 'source', path: file_source_path },
        { from: 'target', path: file_target_path }
      ]

      const target_face_ids = []
      await Promise.all(files.map(async function (file) {
        await _self.sleep(2000)
        const faces = await _self.DetectFaceRecognize(file.path)
        // console.log(faces.length + ` face(s) detected from image: ${file.from} :` + file.path)
        faces.map(face => target_face_ids.push({ from: file.from, faceId: face.faceId }))
      }))

      // console.log(target_face_ids)

      if (file_source_moved) fs.unlinkSync(file_source_path)
      if (file_target_moved) fs.unlinkSync(file_target_path)

      if (target_face_ids?.length == 2) {
        const result = await client.face.verifyFaceToFace(target_face_ids[0].faceId, target_face_ids[1].faceId)
        // console.log(result)
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Face verified',
          data: result
        }
      } else if (target_face_ids?.length == 1) {
        return {
          status: statusCodeConstants.ERROR,
          message: `${target_face_ids[0].from == 'source' ? 'Target' : 'Source'} face could not verified`
        }
      } else {
        return {
          status: statusCodeConstants.ERROR,
          message: 'Face IDs could not be scanned'
        }
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Please try again later'
      }
    }
  }

  async scanDocument (idType, files) {
    if (!idType) {
      idType = 'CIT_IC'
    }
    let isSuccess = false; let message
    const obj = {
      firstName: '',
      lastName: '',
      gender: '',
      dob: '',
      idValue: '',
      address: ''
    }

    if (idType) {
      try {
        // const vision = require('@google-cloud/vision');
        // const client = new vision.ImageAnnotatorClient({
        //   keyFilename: 'D:/Workspace-2/BCAE-2.0/bcae-387905-b93d721f2ee7.json'
        // });

        const client = google.vision({
          version: process.env.GCLOUD_API_VERSION,
          auth: process.env.GCLOUD_API_KEY
        })

        // files = ['D:/Testing/IC-Brunei-Test.png']

        // Read the image file and convert it to base64
        for (let i = 0; i < files.length; i++) {
          // console.log('files[i] ', files[i])
          const imageFile = fs.readFileSync(files[i])
          const encodedImage = Buffer.from(imageFile).toString('base64')
          // console.log(dsdf)
          // Construct the request
          const request = {
            resource: {
              requests: [
                {
                  image: { content: encodedImage },
                  features: [{ type: 'DOCUMENT_TEXT_DETECTION' }]
                }]
            }
          }

          // client.images.annotate(request, (err, response) => {
          //   if (err) {
          //     console.error('Error:', err.message);
          //     return;
          //   }

          //   // Process the response
          //   console.log('Response:', response.data.responses[0].textAnnotations);
          // });

          // Call the API and handle the response
          await client.images.annotate(request)
            .then((response) => {
              const textAnnotations = response.data.responses[0].textAnnotations
              const extractedText = textAnnotations[0].description
              const englishLetters = extractedText.match(/[A-Za-z0-9!@#$%^&*()_+=\-[\]{}|\\:;"'<>,.?/]+/g).join(' ')
              // console.log('Extracted text:', englishLetters)
              let cleanText = englishLetters.toUpperCase()
              let nameRegex; let surnameRegex = null

              // if(cleanText.search('PASSPORT') === -1 && idType === 'CIT_PASSPORT'){
              //   isSuccess = false
              //   message = 'Wrong document selection. Kindly upload "Passport" file to scan'
              // } else {
              if (idType === 'CIT_IC') {
                cleanText = cleanText.replace('NEGARA BRUNEI DARUSSALAM', '')
                // console.log('cleanText ', cleanText)

                if (i === 0) {
                  if (cleanText.match(/NAMA\s(.+?)\sTARIKH/)) {
                    const nameParts = cleanText.match(/NAMA\s(.+?)\sTARIKH/)[1].trim().split(' ')
                    obj.firstName = nameParts[0] || ''
                    obj.lastName = nameParts.slice(1).join(' ') || ''
                  } if (cleanText.match(/NAMA\s(.+?)/)) {
                    const nameParts = cleanText.match(/NAMA\s(.+?)\s/)[1].trim().split(' ')
                    obj.firstName = nameParts[0] || ''
                    obj.lastName = nameParts.slice(1).join(' ') || ''
                  } else {
                    let nameParts = cleanText.match(/GOVERNMENT OF INDIA\s([A-Za-z\s]+)/)
                    // console.log(nameParts)
                    nameParts = nameParts ? nameParts[1].trim().split(' ') : []
                    obj.firstName = nameParts[0] || ''
                    obj.lastName = nameParts.slice(1).join(' ') || ''
                  }

                  if (cleanText.match(/(PEREMPUAN|LELAKI)/)) {
                    obj.gender = cleanText.match(/(PEREMPUAN|LELAKI)/)?.[1] || ''
                  } else {
                    obj.gender = cleanText.match(/\b(\w+)\s\d{4}\b/)?.[1] || ''
                  }

                  if (cleanText.match(/TARIKH LAHIR\s(.+?)\s/)) {
                    obj.dob = cleanText.match(/TARIKH LAHIR\s(.+?)\s/)?.[1] || ''
                  } else {
                    obj.dob = cleanText.match(/\d{2}[-/]\d{2}[-/]\d{4}/)?.[0] || ''
                  }

                  if (cleanText.match(/(\d{2}-\d{6})/)) {
                    obj.idValue = cleanText.match(/(\d{2}-\d{6})/)?.[1] || ''
                  } else {
                    obj.idValue = cleanText.match(/\d{4}\s\d{4}\s\d{4}/)?.[0] || ''
                  }
                  // /ALAMAT\s(.+?)\s\d+/
                  if (cleanText.match(/ALAMAT\s(.+)\s\d/)) {
                    obj.address = cleanText.match(/ALAMAT\s(.+)\s\d/)?.[1] || ''
                  } else {
                    obj.address = cleanText.match(/ADDRESS:?\s(.+?)\s/)?.[1] || ''
                  }
                } else {
                  obj.address = cleanText.match(/ADDRESS:?\s.*?([A-Z\s,]+)\s*\d{4,6}/i)?.[0] || ''
                }
              }

              if (idType === 'CIT_PASSPORT') {
                cleanText = cleanText.replace('NEGARA BRUNEI DARUSSALAM', '').replace('GOVERNMENT OF INDIA', '').replace('INDIA', '')
                // console.log('cleanText ', cleanText)

                if (i === 0) {
                  surnameRegex = /SURNAME\s(.+?)\s/
                  nameRegex = /GIVEN NAME\(S\)\s(.+?)\s/
                  if (!cleanText.match(nameRegex)) {
                    const nameParts = cleanText.match(/NAME \/ (.+?)\s/)?.[1].trim() || ''
                    // console.log('name parts ', nameParts)
                    obj.firstName = nameParts[0] || ''
                    obj.lastName = nameParts[1] || ''
                  }

                  if (cleanText.match(surnameRegex)) {
                    obj.firstName = cleanText.match(nameRegex)?.[1].trim() || ''
                    obj.lastName = cleanText.match(surnameRegex)?.[1].trim() || ''
                  }
                  if (cleanText.match(/SEX\s(.+?)\s/)) {
                    obj.gender = cleanText.match(/SEX\s(.+?)\s/)?.[1] || ''
                  } else {
                    obj.gender = cleanText.match(/SEX\/\s(.+?)\s/)?.[1] || ''
                  }
                  obj.dob = cleanText.match(/DATE OF BIRTH[\/\s]+(\d{2}[-/]\d{2}[-/]\d{4})/i)?.[1] || ''
                  obj.idValue = cleanText.match(/PASSPORT\s(?:NO\.?|NUMBER)\s(.+?)\s/)?.[1] || ''
                } else {
                  obj.address = cleanText.match(/ADDRESS:?\s.*?([A-Z\s,]+)\s*\d{4,6}/i)?.[0] || ''
                }
              }
              isSuccess = true
              message = 'Success'
              // }
            })
            .catch((error) => {
              isSuccess = false
              message = 'Failed up scan the document'
              console.error('Error:', error)
            })
        }
      } catch (error) {
        isSuccess = false
        console.error('Error:', error)

        message = 'Failed up scan the document'
      }
    }

    // console.log('Object==>', obj)

    return {
      status: isSuccess ? statusCodeConstants.SUCCESS : statusCodeConstants.ERROR,
      data: obj,
      message
    }
  }

  async scanCustomerDocument (filesObj, idType) {
    // console.log('filesObj ', filesObj)
    // let idType = 'IDCARD'

    try {
      const file_front = filesObj.file; const file_back = filesObj.file_back
      let file_front_moved = false; let file_back_moved = false
      // const files = {} //this is for ID Analyzer
      const files = []
      if (file_front) {
        const { file_path, file_moved } = await this.moveFile(file_front)
        // eslint-disable-next-line no-unused-vars
        file_front_moved = file_moved
        if (!file_moved) {
          return {
            status: statusCodeConstants.ERROR,
            message: 'Error in uploading file'
          }
        } else {
          // if (fs.existsSync(file_path)) {
          //   console.log('front availe available')
          // }
          // files.document_primary = await fs.readFile(file_path, { encoding: 'base64' }) //this is for ID Analyzer
          files.push(file_path)// this is for google vision
          // fs.unlinkSync(file_path)
        }
      }

      if (file_back) {
        const { file_path, file_moved } = await this.moveFile(file_back)
        // eslint-disable-next-line no-unused-vars
        file_back_moved = file_moved
        if (!file_moved) {
          return {
            status: statusCodeConstants.ERROR,
            message: 'Error in uploading file'
          }
        } else {
          // if (fs.existsSync(file_path)) {
          //   console.log('back availe available')
          // }
          // files.document_secondary = await fs.readFile(file_path, { encoding: 'base64' })//this is for ID Analyzer
          files.push(file_path)// this is for google vision
          // fs.unlinkSync(file_path)
        }
      }

      let dataResult = {}
      // const imageScanned = false
      if (files.length > 0) {
        dataResult = await this.scanDocument(idType, files)
      }
      // await CoreAPI.scan(files)
      //   .then(function (response) {
      //     if (!response.error) {
      //       // All the information about this ID will be returned in an associative array
      //       // console.log(response)
      //       dataResult = response.result
      //       imageScanned = true
      //       const authenticationResult = response.authentication
      //       const faceResult = response.face
      //       // Print result
      //       // console.log(`Hello your name is ${dataResult.firstName} ${dataResult.lastName}`)

      //       // Parse document authentication results
      //       if (authenticationResult) {
      //         if (authenticationResult.score > 0.5) {
      //           // console.log('The document uploaded is authentic')
      //           dataResult.message = 'The document uploaded is authentic'
      //         } else if (authenticationResult.score > 0.3) {
      //           // console.log('The document uploaded looks little bit suspicious')
      //           dataResult.message = 'The document uploaded looks little bit suspicious'
      //         } else {
      //           // console.log('The document uploaded is fake')
      //           dataResult.message = 'The document uploaded is fake'
      //         }
      //       }
      //       // Parse biometric verification results
      //       if (faceResult) {
      //         if (faceResult.isIdentical) {
      //           // console.log('Biometric verification PASSED!')
      //         } else {
      //           // console.log('Biometric verification FAILED!')
      //         }
      //         // console.log('Confidence Score: ' + faceResult.confidence)
      //       }
      //     } else {
      //       // API returned an error
      //       console.log(response.error)
      //       dataResult.message = response.error.message
      //     }
      //   }).catch(function (err) {
      //     console.log(err.message)
      //     dataResult.message = err.message.message
      // })
      // console.log('dataResult ', dataResult)
      return {
        status: dataResult.status,
        message: dataResult.message,
        data: dataResult.data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in object scanning'
      }
    }
  }

  async moveFile (file, type = 'fileObj') {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const files_dir_path = path.join(__dirname, '../files/')
      // NEED TO CHECK AGAIN
      // if (!fs.existsSync(files_dir_path)) {
      //   fs.mkdirSync(files_dir_path)
      // }

      if (type === 'base64') {
        const file_path = `${files_dir_path}${uuidv4()}_customer_photo.png`
        // console.log('this is base64 image', file)
        //    const base64Data = file.replace(/^data:image\/png;base64,/, '')
        const base64Data = file.replace(/^data:image\/\w+;base64,/, '')
        const buff = Buffer.from(base64Data, 'base64')
        fs.writeFileSync(file_path, buff)
        resolve({
          file_path,
          file_moved: true
        })
      } else {
        const file_path = `${files_dir_path}${uuidv4()}_${file.name}`
        file.mv(`${file_path}`, async (err) => {
          if (err) {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject({
              file_path,
              file_moved: false
            })
          } else {
            resolve({
              file_path,
              file_moved: true
            })
          }
        })
      }
    })
  }

  base64Encode (file) {
    const body = fs.readFileSync(file)
    return body.toString('base64')
  }

  async uploadFiles (files, query, userId, roleId, departmentId, conn) {
    try {
      const { file_path, file_moved } = await this.moveFile(files.file_to_upload)

      if (!file_moved) {
        return {
          status: statusCodeConstants.ERROR,
          message: 'Error in file uploading'
        }
      }

      const file_name = files.file_to_upload.name
      const file_type = files.file_to_upload.mimetype

      const fileUrl = this.base64Encode(file_path)

      fs.unlinkSync(file_path)

      const attachmentObj = {
        fileName: file_name,
        fileType: file_type,
        attachedContent: fileUrl,
        entityId: uuidv4(),
        tranId: uuidv4(),
        entityType: query?.entityType ? query?.entityType : 'HELPDESK',
        status: constantCode.status.TEMPORARY,
        createdBy: userId || systemUserId,
        updatedBy: userId || systemUserId,
        createdDeptId: departmentId || 'COMQUEST.BCT',
        createdRoleId: roleId || systemRoleId
      }

      await conn.Attachments.create(attachmentObj)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'File uploaded',
        data: {
          fileUrl,
          entityId: attachmentObj.entityId
        }
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in file uploading'
      }
    }
  }

  async uploadFilesCloud (files, query, userId, roleId, departmentId, conn) {
    try {
      // Validate if File are multiple
      const filesContent = files.file_to_upload

      if (!filesContent || isEmpty(filesContent)) {
        return {
          status: statusCodeConstants.ERROR,
          message: 'Error in file uploading'
        }
      }

      if (filesContent && Array.isArray(filesContent) && filesContent?.length > 0) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Provide only one file at a time.'
        }
      }

      // file greater then 5 MB( 5*1024*1024 )
      if (filesContent && filesContent?.size > 5242880) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Provided file size is greater then 5 MB'
        }
      }
      const allowedFileTypes = ['image/jpeg', 'image/png', 'application/pdf']
      if (!allowedFileTypes.includes(filesContent?.mimetype)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Invalid file type. Only JPEG, PNG, and PDF files are allowed.'
        }
      }
      let configDetails = await getconfigDetails(conn)
      configDetails = configDetails?.status === 200 ? configDetails?.data : {}
      if (isEmpty(configDetails) || !configDetails?.provider) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Storage details is not Configured'
        }
      }
      let response
      if (configDetails?.provider === 'ONEDRIVE') {
        response = await this.uploadFilesOneDrive(filesContent, query, configDetails, userId, roleId, departmentId, conn)
      } else {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Storage provider is not supported'
        }
      }
      return { ...response }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in file uploading'
      }
    }
  }

  async downloadFilesCloud (payload, conn) {
    try {
      logger.debug('Request Payload: ', payload)
      if (!payload || isEmpty(payload) || !payload?.uid) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const whereClauses = {}
      if (payload && payload?.uid) {
        whereClauses.attachmentUuid = payload?.uid
      }
      logger.debug('where clauses for attachment: ', whereClauses)

      const getAttachmentDetails = await conn.Attachments.findOne({
        attibutes: ['metaData'],
        where: { ...whereClauses }
      })
      // logger.debug('response for attachment', getAttachmentDetails)

      if (!getAttachmentDetails || !getAttachmentDetails?.metaData?.id) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Attachment details not found'
        }
      }
      const requestPayload = {
        id: getAttachmentDetails?.metaData?.id
      }
      logger.debug('Reqesting for configuration')
      let configDetails = await getconfigDetails(conn)
      configDetails = configDetails?.status === 200 ? configDetails?.data : {}
      if (isEmpty(configDetails) || !configDetails?.provider) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Storage details is not Configured'
        }
      }
      let response

      if (configDetails?.provider === 'ONEDRIVE') {
        response = await this.downloadFilesOneDrive({ ...requestPayload, fileName: 'oneDriveToken' }, configDetails)
      } else {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Storage provider is not supported'
        }
      }
      return { ...response }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in file uploading'
      }
    }
  }

  async uploadFilesOneDrive (files, query, azureDetails, userId, roleId, departmentId, conn) {
    try {
      if (isEmpty(azureDetails)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Storage details is not Configured'
        }
      }
      const { file_path, file_moved } = await this.moveFile(files)

      if (!file_moved) {
        return {
          status: statusCodeConstants.ERROR,
          message: 'Error in file uploading'
        }
      }
      file = file_path

      const file_name = files.name
      const file_type = files.mimetype

      const { url, grantType, clientId, secret, scope, fileName } = azureDetails

      const { error, result } = await this.authentication(url, grantType, clientId, secret, scope)
      if (error) {
        logger.error(error)
        return {
          status: statusCodeConstants.ERROR,
          message: 'Error in file uploading'
        }
      }
      await saveCredentials(result, fileName)

      const data = JSON.stringify({
        item: {
          '@microsoft.graph.conflictBehavior': 'rename',
          name: file_name
        }
      })

      const config = {
        method: 'put',
        maxBodyLength: Infinity,
        url: `https://graph.microsoft.com/v1.0/drive/root:/${query?.entityType?.toLowerCase()}/${file_name}:/createUploadSession`,
        headers: {
          Authorization: `Bearer ${result.access_token}`,
          'Content-Type': 'application/json'
        },
        data
      }

      const response = await axios(config)
      const uploadedFile = await this.uploadFileChunks(response.data.uploadUrl)
      fs.unlinkSync(file)

      if (uploadedFile.success) {
        const fileUrl = uploadedFile.data['@content.downloadUrl']
        const attachmentObj = {
          fileName: file_name,
          fileType: file_type,
          attachedContent: fileUrl,
          entityId: uuidv4(),
          tranId: uuidv4(),
          entityType: query?.entityType ? query?.entityType : 'HELPDESK',
          status: constantCode.status.TEMPORARY,
          createdBy: userId || systemUserId,
          updatedBy: userId || systemUserId,
          createdDeptId: departmentId || 'COMQUEST.BCT',
          createdRoleId: roleId || systemRoleId,
          metaData: {
            url: uploadedFile?.data?.webUrl || '',
            downloadUrl: uploadedFile.data['@content.downloadUrl'],
            id: uploadedFile?.data?.id || '',
            parentReference: uploadedFile?.data?.parentReference || ''
          }
        }

        await conn.Attachments.create(attachmentObj)

        return {
          status: statusCodeConstants.SUCCESS,
          message: 'File uploaded',
          data: {
            // fileUrl: uploadedFile.data['@content.downloadUrl'],
            entityId: attachmentObj.entityId
          }
        }
      }

      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in file uploading'
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in file uploading'
      }
    }
  }

  async downloadFilesOneDrive (payload, configDetails) {
    try {
      let credentials = await getSaveCredentials(payload?.fileName)
      if (!credentials) {
        if (isEmpty(configDetails) || !configDetails?.provider) {
          return {
            status: statusCodeConstants.VALIDATION_ERROR,
            message: 'Storage details is not Configured'
          }
        }
        const { url, grantType, clientId, secret, scope, fileName } = configDetails
        const { error, result } = await this.authentication(url, grantType, clientId, secret, scope)

        if (error) {
          logger.error(error)
          return {
            status: statusCodeConstants.ERROR,
            message: 'Error in file downloading'
          }
        }
        await saveCredentials(result, fileName)
        credentials = result
      }
      if (!credentials || isEmpty(credentials) || !credentials.access_token) {
        logger.info('No Access token found')
        return {
          status: statusCodeConstants.ERROR,
          message: 'Error while file link generation'
        }
      }
      const { access_token } = credentials

      try {
        const url = `https://graph.microsoft.com/v1.0/drive/items/${payload?.id}?select=id,@microsoft.graph.downloadUrl`
        const response = await axios.get(url, {
          headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${access_token}`
          },
          retry: 0
          // httpsAgent: new https.Agent({
          //   rejectUnauthorized: false
          // })
        })
        if (response?.status === 200) {
          return {
            status: statusCodeConstants.SUCCESS,
            message: 'File link generated Successfully',
            data: { url: response?.data['@microsoft.graph.downloadUrl'] } || {}
          }
        }
      } catch (error) {
        console.log(error)
      }
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error while file link generation'
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error while file link generation'
      }
    }
  }

  async authentication (url, grantType, clientId, secret, scope) {
    return new Promise((resolve) => {
      const data = qs.stringify({
        grant_type: grantType,
        client_id: clientId,
        client_secret: secret,
        scope
      })

      axios.post(url, data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(async response => {
        resolve({ result: response.data })
      }).catch(error => {
        resolve({ error: error.response })
      })
    })
  }

  async uploadFileChunks (uploadUrl) {
    return new Promise((resolve) => {
      async.eachSeries(this.getparams(), function (st, callback) {
        setTimeout(function () {
          fs.readFile(file, function read (e, f) {
            axios({
              method: 'PUT',
              url: uploadUrl,
              headers: {
                'Content-Length': st.clen,
                'Content-Range': st.cr
              },
              data: f.slice(st.bstart, st.bend + 1)
            }).then(({ data }) => {
              if (data && typeof data === 'object' && data.hasOwnProperty('id')) {
                resolve({
                  success: true,
                  data
                })
              }
            }).catch(error => {
              logger.error(error)
              resolve({
                success: false
              })
            })
          })
          callback()
        }, st.stime)
      })
    })
  }

  getparams () {
    const allsize = fs.statSync(file).size
    const sep = allsize < (60 * 1024 * 1024) ? allsize : (60 * 1024 * 1024) - 1
    const ar = []
    for (let i = 0; i < allsize; i += sep) {
      const bstart = i
      const bend = i + sep - 1 < allsize ? i + sep - 1 : allsize - 1
      const cr = 'bytes ' + bstart + '-' + bend + '/' + allsize
      const clen = bend !== allsize - 1 ? sep : allsize - i
      const stime = allsize < (60 * 1024 * 1024) ? 5000 : 10000
      ar.push({
        bstart,
        bend,
        cr,
        clen,
        stime
      })
    }
    return ar
  }

  async getNotification (payload, conn) {
    try {
      const { limit = constantCode.common.lIMIT, page = constantCode.common.PAGE } = payload

      const params = {
        offset: (page * limit),
        limit: Number(limit)
      }

      const response = await conn.Notification.findAll({
        ...params
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Notification Fetched Successfully',
        data: response
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in file uploading'
      }
    }
  }

  async renewToken (configDetails) {
    try {
      const url = 'https://login.microsoftonline.com/574583b1-0d9a-4c24-b97c-0d979d935e9c/oauth2/v2.0/token'
      const grantType = 'client_credentials'
      const clientId = 'a81e1a28-3601-4e70-b70b-db5ba215b4a4'
      const secret = 'ZDX7Q~.OSVJBotDJvZS5nInRybwGRBKL87BuB'
      const scope = 'https://graph.microsoft.com/.default'
      const fileName = 'oneDriveToken'
      // const { url, grantType, clientId, secret, scope } = configDetails
      const { result } = await this.authentication(url, grantType, clientId, secret, scope, fileName)
      if (result && !isEmpty(result)) {
        await saveCredentials(result, fileName)
      }
      return result
    } catch (error) {
      logger.error(error)
      return error
    }
  }

  async getAttachmentList (payload, conn) {
    try {
      if (!payload || !payload?.uid) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage?.MANDATORY_FIELDS_MISSING
        }
      }
      const response = await conn.Attachments.findAll({
        attributes: ['entityId', 'attachmentUuid', 'fileName', 'fileType'],
        where: {
          entityId: payload?.uid,
          status: 'FINAL'
        }
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Attachment fetched Successfully',
        data: response
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in file uploading'
      }
    }
  }
}

const getSaveCredentials = async (fileName) => {
  try {
    const tokenPath = path.join(__dirname, '../') + fileName + '.json'
    // const content = await fsp.readFile(tokenPath)
    const fileContent = await fsp.readFile(tokenPath, 'utf8')
    const credentials = JSON.parse(fileContent)
    return credentials
  } catch (error) {
    logger.error(error)
    return null
  }
}

const saveCredentials = async (tokens, fileName) => {
  try {
    const tokenPath = path.join(__dirname, '../') + fileName + '.json'
    await fsp.writeFile(tokenPath, JSON.stringify(tokens))
    console.log(`Access token and refresh token stored to ${fileName}.json in ${tokenPath}`)
  } catch (error) {
    logger.error(error)
    return false
  }
}

const getconfigDetails = async (conn) => {
  try {
    let configDetails = await conn.BcaeAppConfig.findOne({
      where: {
        status: constantCode.status.ACTIVE
      }
    })
    // configDetails = {
    //   url: 'https://login.microsoftonline.com/574583b1-0d9a-4c24-b97c-0d979d935e9c/oauth2/v2.0/token',
    //   grantType: 'client_credentials',
    //   clientId: 'a81e1a28-3601-4e70-b70b-db5ba215b4a4',
    //   secret: 'ZDX7Q~.OSVJBotDJvZS5nInRybwGRBKL87BuB',
    //   scope: 'https://graph.microsoft.com/.default',
    //   fileName: 'oneDriveToken'
    // }
    configDetails = configDetails.dataValues?.storageSetupPayload ?? configDetails?.storageSetupPayload
    return { status: statusCodeConstants.SUCCESS, data: configDetails }
  } catch (error) {
    logger.error(error)
    return {
      status: statusCodeConstants.ERROR
    }
  }
}

const commonServiceInstance = new CommonService()

axios.interceptors.response.use(
  (res) => res,
  async (error) => {
    try {
      const originalConfig = error.config
      if (!isUnauthorizedError(error)) {
        return Promise.reject(error)
      }
      if (error.response.status === 401 && !originalConfig._retry) {
        originalConfig._retry = true
        const retryPromise = new Promise((resolve, reject) => {
          queuedRequests.push({
            config: originalConfig, resolve, reject
          })
        })
        if (!refreshInProgress) {
          refreshInProgress = true
          const { access_token } = await commonServiceInstance.renewToken()
          retryQueuedRequests(access_token)
        }
        return retryPromise
      }
      return Promise.reject(error)
    } catch (error) {
      return Promise.reject(error)
    }
  }
)
const retryQueuedRequests = (accessToken) => {
  queuedRequests.forEach(({ config, resolve, reject }) => {
    if (accessToken) {
      config.headers.authorization = `${accessToken}`
      axios(config)
        .then(resolve)
        .catch(reject)
    } else {
      reject({ message: 'No access token found', status: 401 })
    }
  })
  return Promise.all(queuedRequests)
}

const isUnauthorizedError = (error) => {
  const { status } = error?.response
  return status === 401
}

// const googleVisionOCR = async (idType, files) => {
//   idType = 'PASSPORT'
//     let obj = {
//       firstName: '',
//       lastName: '',
//       gender: '',
//       dob: '',
//       idValue: '',
//       address: ''
//     }
//   if (idType) {
//     const vision = require('@google-cloud/vision');
//     const client = new vision.ImageAnnotatorClient();
//     const fs = require('fs');

//     // files = ['D:/Testing/passporttest2.jpg', 'D:/Testing/passportback.jpg']

//     // Read the image file and convert it to base64
//     for (let i = 0; i < files.length; i++) {
//       console.log('files[i] ', files[i])
//       const imageFile = fs.readFileSync(files[i]);
//       const encodedImage = Buffer.from(imageFile).toString('base64');
//       // console.log(dsdf)
//       // Construct the request
//       const request = {
//         image: { content: encodedImage },
//         features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
//       };

//       // Call the API and handle the response
//       await client
//         .annotateImage(request)
//         .then((response) => {
//           const textAnnotations = response[0].textAnnotations;
//           const extractedText = textAnnotations[0].description;
//           const englishLetters = extractedText.match(/[A-Za-z0-9!@#$%^&*()_+=\-[\]{}|\\:;"'<>,.?/]+/g).join(' ');
//           console.log('Extracted text:', englishLetters);
//           let cleanText = englishLetters.toUpperCase()
//           let nameRegex, sexRegex, dobRegex, idValueRegex, addressRegex, surnameRegex = null

//           if (idType === 'IDCARD') {
//             cleanText = cleanText.replace('NEGARA BRUNEI DARUSSALAM', '').replace('GOVERNMENT OF INDIA', '').replace('INDIA', '')
//             console.log('cleanText ', cleanText)

//             if (i === 0) {
//               if (cleanText.match(/NAMA\s(.+?)\sTARIKH/)) {
//                 const nameParts = cleanText.match(/NAMA\s(.+?)\sTARIKH/)[1].trim().split(' ');
//                 obj.firstName = nameParts[0] || '';
//                 obj.lastName = nameParts.slice(1).join(' ') || '';
//               } else {
//                 const nameParts = cleanText.match(/^(.*?)\s\//)[1].trim().split(' ');
//                 obj.firstName = nameParts[0] || '';
//                 obj.lastName = nameParts.slice(1).join(' ') || '';
//               }

//               if (cleanText.match(/JANTINA\s(.+?)\s/)) {
//                 obj.gender = cleanText.match(/JANTINA\s(.+?)\s/)?.[1] || '';
//               } else {
//                 obj.gender = cleanText.match(/\b(\w+)\s\d{4}\b/)?.[1] || '';
//               }

//               if (cleanText.match(/TARIKH LAHIR\s(.+?)\s/)) {
//                 obj.dob = cleanText.match(/TARIKH LAHIR\s(.+?)\s/)?.[1] || '';
//               } else {
//                 obj.dob = cleanText.match(/\d{2}\/\d{2}\/\d{4}/)?.[0] || '';
//               }

//               if (cleanText.match(/(\d{2}-\d{6}-\d{2}-\d{4})/)) {
//                 obj.idValue = cleanText.match(/(\d{2}-\d{6}-\d{2}-\d{4})/)?.[1] || '';
//               } else {
//                 obj.idValue = cleanText.match(/\d{4}\s\d{4}\s/)?.[0] || '';
//               }

//               if (cleanText.match(/ALAMAT\s(.+?)\s\d+/)) {
//                 obj.address = cleanText.match(/ALAMAT\s(.+?)\s\d+/)?.[1] || '';
//               } else {
//                 obj.address = cleanText.match(/ADDRESS:?\s(.+?)\s/)?.[1] || '';
//               }

//             } else {
//               obj.address = cleanText.match(/ADDRESS:?\s.*?([A-Z\s,]+)\s*\d{4,6}/i)?.[0] || '';
//             }

//           }

//           if (idType === 'PASSPORT') {
//             cleanText = cleanText.replace('NEGARA BRUNEI DARUSSALAM', '').replace('GOVERNMENT OF INDIA', '').replace('INDIA', '')
//             console.log('cleanText ', cleanText)

//             if (i === 0) {
//               surnameRegex = /SURNAME\s(.+?)\s/;
//               nameRegex = /GIVEN NAME\(S\)\s(.+?)\s/;
//               if (!cleanText.match(nameRegex)) {
//                 const nameParts = cleanText.match(/NAME \/ (.+?)\s/)?.[1].trim() || ''
//                 obj.firstName = nameParts[0] || '';
//                 obj.lastName = nameParts.slice(1).join(' ') || '';
//               }

//               if (cleanText.match(surnameRegex)) {
//                 obj.firstName = cleanText.match(nameRegex)?.[1].trim() || ''
//                 obj.lastName = cleanText.match(surnameRegex)?.[1].trim() || ''
//               }
//               if(cleanText.match(/SEX\s(.+?)\s/)){
//                 obj.gender = cleanText.match(/SEX\s(.+?)\s/)?.[1] || ''
//               } else {
//                 obj.gender = cleanText.match(/SEX\/\s(.+?)\s/)?.[1] || ''
//               }
//               obj.dob = cleanText.match(/DATE OF BIRTH[\/\s]+(\d{2}[-/]\d{2}[-/]\d{4})/i)?.[1] || ''
//               obj.idValue = cleanText.match(/PASSPORT\s(?:NO\.?|NUMBER)\s(.+?)\s/)?.[1] || ''

//             } else {
//               obj.address = cleanText.match(/ADDRESS:?\s.*?([A-Z\s,]+)\s*\d{4,6}/i)?.[0] || '';

//             }
//           }

//         })
//         .catch((error) => {
//           console.error('Error:', error);
//         });
//     }
//   }
// }

module.exports = CommonService
