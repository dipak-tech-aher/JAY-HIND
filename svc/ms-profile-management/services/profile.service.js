import profileResource from "@resources";
import {
  addressFields,
  contactFields,
  defaultCode,
  defaultMessage,
  defaultStatus,
  entityCategory,
  logger,
  profileFields,
  statusCodeConstants,
} from "@utils";
import { isEmpty } from "lodash";
import { Op } from "sequelize";
const { v4: uuidv4 } = require("uuid");

let instance;

class ProfileService {
  constructor() {
    if (!instance) {
      instance = this;
    }
    return instance;
  }

  async createProfile(profileData, departmentId, roleId, userId, conn, t) {
    try {
      if (!profileData) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING,
        };
      }

      const tranId = uuidv4();
      const commonAttris = {
        status: defaultStatus.ACTIVE,
        createdDeptId: departmentId,
        createdRoleId: roleId,
        createdBy: userId,
        updatedBy: userId,
        tranId,
      };

      const historyAttrs = {
        historyInsertedDate: new Date(),
        tranId,
        historyTranId: tranId,
      };

      // #VALIDATION CONDITION
      if (profileData && profileData?.contact?.emailId) {
        const checkExistingdetails = await conn.Contact.findOne({
          where: {
            emailId: profileData.contact.emailId,
            status: defaultStatus.ACTIVE,
          },
        });

        if (checkExistingdetails) {
          return {
            status: statusCodeConstants.CONFLICT,
            message: "Email Id already exist in system",
          };
        }
      }

      if (profileData && profileData?.contact?.mobileNo) {
        const checkExistingdetails = await conn.Contact.findOne({
          where: {
            mobileNo: profileData.contact.mobileNo,
            status: defaultStatus.ACTIVE,
          },
        });

        if (checkExistingdetails) {
          return {
            status: statusCodeConstants.CONFLICT,
            message: "Mobile number already exist in system",
          };
        }
      }

      const profileDetails = await createOrUpdateProfile(
        profileData,
        null,
        commonAttris,
        historyAttrs,
        conn,
        t
      );
      if (profileDetails?.status !== 200) return { ...profileDetails };

      if (profileData && profileData?.address) {
        const addressCategoryDetails = {
          addressCategory: entityCategory.PROFILE,
          addressCategoryValue: profileDetails?.data?.profileNo,
        };
        const addressDetails = await createOrUpdateAddress(
          profileData.address,
          null,
          addressCategoryDetails,
          commonAttris,
          historyAttrs,
          conn,
          t
        );
        if (addressDetails?.status !== 200) return { ...addressDetails };
      }

      let contactDetails;
      if (profileData && profileData?.contact) {
        const contactCategoryDetails = {
          contactCategory: entityCategory.PROFILE,
          contactCategoryValue: profileDetails?.data?.profileNo,
        };
        contactDetails = await createorUpdateContact(
          profileData.contact,
          null,
          contactCategoryDetails,
          commonAttris,
          historyAttrs,
          conn,
          t
        );
        if (contactDetails?.status !== 200) return { ...contactDetails };
      }

      if (profileData && profileData?.helpdeskNo) {
        const checkExistingHelpdesk = await conn.Helpdesk.findOne({
          where: {
            helpdeskNo: profileData?.helpdeskNo,
            status: {
              [Op.notIn]: [defaultStatus?.HELPDESK_CLOSED],
            },
          },
        });

        if (checkExistingHelpdesk) {
          await conn.Helpdesk.update(
            {
              userCategory: entityCategory.PROFILE,
              userCategoryValue: profileDetails?.data?.profileNo,
              contactId: contactDetails?.data?.contactId,
            },
            {
              where: {
                helpdeskNo: profileData?.helpdeskNo,
              },
              logging: console.log,
              transaction: t,
            }
          );
        }
      }

      const data = {
        profileId: profileDetails?.data?.profileId,
        profileNo: profileDetails?.data?.profileNo,
        profileUuid: profileDetails?.data?.profileUuid,
        contactId: contactDetails?.data?.contactId,
        contactNo: contactDetails?.data?.contactNo,
      };
      return {
        status: statusCodeConstants.SUCCESS,
        message: "Profile created successfully",
        data: data || [],
      };
    } catch (error) {
      logger.error(error);
      return {
        status: statusCodeConstants.ERROR,
        message: "Internal server error",
      };
    }
  }

  async updateProfile(profileData, departmentId, roleId, userId, conn, t) {
    try {
      if (isEmpty(profileData)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING,
        };
      }

      if (profileData && !profileData?.profileNo) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: "Please Provide profile number",
        };
      }

      const checkExistingdetails = await conn.Profile.findOne({
        where: {
          profileNo: profileData.profileNo,
        },
      });

      if (!checkExistingdetails) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: `Profile details not found for provided profile Number ${profileData?.profileNo}`,
        };
      }

      const tranId = uuidv4();
      const commonAttris = {
        createdDeptId: departmentId,
        createdRoleId: roleId,
        createdBy: userId,
        updatedBy: userId,
        tranId,
      };

      const historyAttrs = {
        historyInsertedDate: new Date(),
        tranId,
        historyTranId: tranId,
      };

      const updateProfileDetails = await createOrUpdateProfile(
        profileData,
        checkExistingdetails,
        commonAttris,
        historyAttrs,
        conn,
        t
      );

      if (updateProfileDetails.status !== 200)
        return { ...updateProfileDetails };

      if (profileData && profileData?.address) {
        const checkExistingAddress = await conn.Address.findAll({
          where: {
            addressCategory: entityCategory.PROFILE,
            addressCategoryValue: profileData.profileNo,
          },
        });

        if (
          profileData &&
          !isEmpty(checkExistingAddress) &&
          profileData?.address &&
          profileData?.address?.isPrimary &&
          !profileData?.address?.addressNo
        ) {
          const checkExistingPrimaryAddress = checkExistingAddress.find(
            (e) => e.isPrimary === true
          );
          if (checkExistingPrimaryAddress) {
            return {
              status: statusCodeConstants.VALIDATION_ERROR,
              message: `Profile number ${profileData.profileNo} already have primary address`,
            };
          }
        }

        const categoryDetails = {
          addressCategory: entityCategory.PROFILE,
          addressCategoryValue: profileData?.profileNo,
        };

        const updateAddressDetails = await createOrUpdateAddress(
          profileData.address,
          checkExistingAddress,
          categoryDetails,
          commonAttris,
          historyAttrs,
          conn,
          t
        );
        if (updateAddressDetails.status !== 200)
          return { ...updateAddressDetails };
      }

      let checkExistingContact;

      if (profileData && profileData?.contact) {
        const categoryDetails = {
          contactCategory: entityCategory.PROFILE,
          contactCategoryValue: profileData.profileNo,
        };

        checkExistingContact = await conn.Contact.findAll({
          where: {
            contactCategory: entityCategory.PROFILE,
            contactCategoryValue: profileData.profileNo,
          },
        });

        if (
          checkExistingContact &&
          profileData &&
          profileData?.contact &&
          profileData?.contact?.isPrimary &&
          !profileData?.contact?.contactNo
        ) {
          return {
            status: statusCodeConstants.VALIDATION_ERROR,
            message: `Profile number ${profileData.profileNo} already have primary contact`,
          };
        }

        const updateContactDetails = await createorUpdateContact(
          profileData.contact,
          checkExistingContact,
          categoryDetails,
          commonAttris,
          historyAttrs,
          conn,
          t
        );
        if (updateContactDetails.status !== 200)
          return { ...updateContactDetails };
      }

      if (profileData && profileData?.helpdeskNo) {
        const checkExistingHelpdesk = await conn.Helpdesk.findOne({
          where: {
            helpdeskNo: profileData?.helpdeskNo,
            status: {
              [Op.notIn]: [defaultStatus?.HELPDESK_CLOSED],
            },
          },
        });

        if (checkExistingHelpdesk) {
          await conn.Helpdesk.update(
            {
              userCategory: entityCategory.PROFILE,
              userCategoryValue: profileData.profileNo,
              contactId: checkExistingContact?.contactId,
            },
            {
              where: {
                helpdeskNo: profileData?.helpdeskNo,
              },
              transaction: t,
            }
          );
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: `Profile details updated successfully - ${profileData.profileNo}`,
      };
    } catch (error) {
      return {
        status: statusCodeConstants.ERROR,
        message: "Internal server error",
      };
    }
  }

  async searchProfile(profileData, departmentId, roleId, userId, conn, t) {
    try {
      const { limit = defaultCode.lIMIT, page = defaultCode.PAGE } =
        profileData;
      const params = {
        offset: page * limit,
        limit: Number(limit),
      };

      const whereClauses = {};
      const contactClauses = {};

      if (profileData && profileData?.profileNo) {
        whereClauses.profileNo = profileData.profileNo;
      }

      if (profileData && profileData?.profileId) {
        whereClauses.profileId = profileData.profileId;
      }

      if (profileData && profileData?.mobileNo) {
        contactClauses.mobileNo = profileData.mobileNo;
      }

      if (profileData && profileData?.emailId) {
        contactClauses.emailId = profileData.emailId;
      }

      if (profileData && profileData?.status) {
        whereClauses.status = profileData.status;
      }

      const response = await conn.Profile.findAndCountAll({
        include: [
          {
            model: conn.Contact,
            as: "profileContact",
            where: { ...contactClauses },
          },
          {
            model: conn.Address,
            as: "profileAddress",
            required: false,
          },
        ],
        where: { ...whereClauses },
        order: [["profileId", "DESC"]],
        ...params,
      });

      if (response.count === 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: "Profile details not found",
        };
      }

      const businessEntityInfo = await conn.BusinessEntity.findAll({
        where: {
          codeType: [
            "CUSTOMER_ID_TYPE",
            "STATUS",
            "GENDER",
            "CUSTOMER_CATEGORY",
            "ADDRESS_TYPE",
            "CONTACT_TYPE",
            "ENTITY_CATEGORY",
          ],
          status: defaultStatus.ACTIVE,
        },
      });
      const rows = profileResource.transformProfileSearch(
        response?.rows,
        businessEntityInfo
      );
      const data = {
        cont: response.count,
        rows: rows || [],
      };
      return {
        status: statusCodeConstants.SUCCESS,
        message: "Profile details fetched successfully",
        data,
      };
    } catch (error) {
      logger.error(error);
      return {
        status: statusCodeConstants.ERROR,
        message: "Internal server error",
      };
    }
  }

  async temp_centralMasterProfile(inputData) {
    const data = {
      registrationDetails: {
        name: "John Doe",
        nric: "123456-12-3456",
        mobileNumber: "+60123456789",
        referenceNumber: "REF12345",
        attachedPhoto: "photo.jpg",
        residentialDetails: {
          address: "123 Main Street",
          registrationType: "Permanent",
          gender: "Male",
          email: "john.doe@example.com",
          birthDate: "1990-01-01",
          maritalStatus: "Married",
          expectedDeliveryDate: "2023-12-31",
          passportNumber: "AB1234567",
          age: 33,
          bloodGroup: "O+",
          phoneNumber: "+6034567890",
          houseNumber: "A-12",
          street: "Jalan Bukit Bintang",
          country: "Malaysia",
          state: "Kuala Lumpur",
          subDistrict: "Bukit Bintang",
          areaTown: "Golden Triangle",
          locality: "KLCC",
          landmark: "Petronas Towers",
          cityDistrict: "Kuala Lumpur",
          postcode: "55100",
        },
      },
      payerDetails: {
        payerType: "Individual",
        startDate: "2023-10-03",
        payer: "John Doe",
        expiryDate: "2024-10-02",
        associatePayer: "Jane Smith",
        tariff: "Standard",
        priority: "High",
      },
      payerList: [
        {
          payerType: "Individual",
          payer: "John Doe",
          associatePayer: "Jane Smith",
          tariff: "Standard",
          startDate: "2023-10-03",
          expiryDate: "2024-10-02",
          priority: "High",
          policyNumber: "POL12345",
          creditLimit: 10000,
          remark: "VIP Customer",
          designation: "Manager",
        },
      ],
      visitInformation: {
        opdNo: "12345",
        time: "10:30 AM",
        encounterType: "Follow-up",
        cashCounter: "Counter 3",
        location: "Hospital Wing A",
        subDept: "Cardiology",
        doctor: "Dr. John Smith",
        patientType: "Outpatient",
        consultationRoom: "Room 203",
        refEntityType: "Insurance",
        campName: "Health Fair 2023",
        refEntityName: "XYZ Insurance",
        department: "Cardiology",
        visitType: "Regular Checkup",
        tokenNo: "T123",
        remark: "Patient is feeling better",
      },
      visitBillDetails: [
        {
          serviceCode: "S001",
          serviceName: "Consultation",
          payer: "XYZ Insurance",
          tariff: "Standard",
          qty: 1,
          emergency: false,
          purchasePrice: 50.0,
          totalAmount: 50.0,
          concessionTemplate: "Senior Citizen",
          concessionPercentage: 10,
          concessionAmount: 5.0,
          concessionAuthorizeBy: "Dr. Jane Doe",
          taxAmount: 7.5,
          netAmount: 52.5,
          selfAmount: 20.0,
          sponsorAmount: 32.5,
          remark: "Follow-up Consultation",
          priority: "Medium",
        },
        {
          serviceCode: "S002",
          serviceName: "X-Ray",
          payer: "Self Pay",
          tariff: "High Resolution",
          qty: 2,
          emergency: false,
          purchasePrice: 80.0,
          totalAmount: 160.0,
          concessionTemplate: "",
          concessionPercentage: 0,
          concessionAmount: 0.0,
          concessionAuthorizeBy: "",
          taxAmount: 24.0,
          netAmount: 184.0,
          selfAmount: 184.0,
          sponsorAmount: 0.0,
          remark: "Chest X-Ray",
          priority: "High",
        },
      ],
      visitSummary: {
        totalAmount: 210.0,
        totalConcession: 5.0,
        totalTax: 31.5,
        netAmount: 235.5,
        healthSchemeBalance: 235.5,
      },
    };
    return {
      status: statusCodeConstants.SUCCESS,
      message: "Profile details fetched successfully",
      data,
    };
  }

  async temp_patientProfile(inputData) {
    const data = {
      patientInfo: {
        MRN: "PRN-DSH-1750575",
        name: "Nasir Shaikh",
        birthDate: "05/10/1988",
        age: "35Y OM OD",
        gender: "Male",
        NRIC: "801005325663",
        passportNo: "",
      },
      allergies: {
        nonDrugAllergies: "Smoke, Polan Grain",
        drugAllergies: "G",
      },
      medicalHistory: {
        previousHospitalizations: [
          {
            nameOfHospital: "KPJ Damansara",
            dateOfAdmission: "01/05/2023",
            dateOfDischarge: "05/05/2023",
            admittingDoctor: "Dr. Abdul Wahid",
          },
        ],
      },
      visits: [
        {
          type: "OPD",
          date: "02/15/2023",
          MRN: "PRN-DSH-1750575",
          OPD_IPD: "OPD",
          location: "Hospital A",
          doctor: "Dr. Smith",
        },
      ],
      cases: [
        {
          caseNo: "C001",
          date: "02/16/2023",
          department: "Cardiology",
          doctor: "Dr. Johnson",
          diagnosis: "Hypertension",
        },
      ],
      patientComplaints: [
        {
          complaint: "Chest Pain",
          date: "02/16/2023",
          time: "09:30 AM",
        },
      ],
      examinations: [
        {
          examination: "ECG",
          date: "02/16/2023",
          time: "10:00 AM",
        },
      ],
      vitals: [
        {
          date: "02/16/2023",
          time: "10:15 AM",
          temperature: "98.6°F",
          pulse: "75 bpm",
          systolicBP: "120 mmHg",
          diastolicBP: "80 mmHg",
        },
      ],
      diagnosis: {
        CPOEInvestigations: [
          {
            code: "1234",
            diagnosis: "Hypertension",
            chronic: true,
            complexityCategory: "Medium",
            otherDiagnosis: "None",
          },
        ],
      },
      advice: [
        {
          code: "5678",
          service: "Medication",
          priority: "High",
          doctor: "Dr. Smith",
          date: "02/16/2023",
          time: "11:00 AM",
        },
      ],
      otherServices: [
        {
          code: "5678",
          service: "X-Ray",
          priority: "Medium",
          doctor: "Dr. Johnson",
          date: "02/16/2023",
          time: "12:00 PM",
        },
      ],
      doctorCharges: [
        {
          code: "1234",
          service: "Consultation",
          doctor: "Dr. Smith",
        },
      ],
      doctorProgressNote: [
        {
          note: "Patient is responding well to the medication.",
          date: "02/16/2023",
          time: "01:00 PM",
          doctor: "Dr. Smith",
        },
      ],
      nursingProgress: [
        {
          nursingProgressNote: "Patient's vitals are stable.",
          designation: "Nurse",
          department: "Cardiology",
          staff: "Jane Doe",
          date: "02/16/2023",
          time: "02:00 PM",
        },
      ],
    };

    return {
      status: statusCodeConstants.SUCCESS,
      message: "Profile details fetched successfully",
      data,
    };
  }

  async temp_patientVisitHistory(inputData) {
    const data = {
      patientInfo: {
        MRN: "PRN-DSH-1750575",
        name: "Nasir Shaikh",
        birthDate: "05/10/1988",
        age: "35Y OM OD",
        gender: "Male",
        NRIC: "801005325663",
        passportNo: "",
      },
      visits: [
        {
          type: "OPD",
          date: "02/15/2023",
          MRN: "PRN-DSH-1750575",
          OPD_IPD: "OPD",
          location: "Hospital A",
          doctor: "Dr. Smith",
        },
      ],
    };

    return {
      status: statusCodeConstants.SUCCESS,
      message: "Profile details fetched successfully",
      data,
    };
  }

  async temp_patientBill(inputData) {
    const data = {
      billType: "OPD Patient Bill",
      prnNo: "PRN-DSH-1750575",
      patient: "Mr. Nasir Shaikh",
      doctor: "Dr. Abdulwahab Undok",
      billNo: "OPB-DSH-1000956",
      date: "4-Oct-2023 3:11 pm",
      opdNo: "OPD-DSH-01-041023-001",
      services: [
        {
          no: 1,
          serviceCode: "SVC001",
          serviceName: "Consultation",
          rate: 200,
          qty: 1,
          amount: 200,
        },
        {
          no: 2,
          serviceCode: "SVC002",
          serviceName: "X-Ray",
          rate: 150,
          qty: 2,
          amount: 300,
        },
      ],
      totalAmount: 500,
      concession: 50,
      netBillAmount: 450,
      balanceAmount: 0,
      concessionBy: "Dr. Abdulwahab Undok",
      amountInWords: "Rupees Four Hundred Fifty Only",
      paymentModeDetails: [
        {
          paymentMode: "Cash",
          date: "4-Oct-2023",
          no: "1001",
          bankName: "",
          amount: 450,
        },
      ],
      healthSchemeBalance: 0,
      remark: "",
      invoice: "IPB-DSH-1000366",
      debtor: "Company",
      name: "AIA",
      mrnEpisodePatientName: "PRN-DSH-1750526/1PD-DSH-23-0",
      pageNo: 1,
      billDate: "5-Oct-2023",
      episodeType: "IPD",
      finClass: "Class A",
      billType: "Final Bill",
      creditTerm: "30 days",
      admDateTime: "4-Oct-2023 10:30 am",
      dischargeDateTime: "8-Oct-2023 2:30 pm",
      wardBed: "Ward A, Bed 101",
      lengthOfStay: "4 days",
      admittedBy: "Dr. John Doe",
      userId: "user123",
      printDate: "8-Oct-2023",
      services: [
        {
          date: "5-Oct-2023",
          serviceName: "Room Charges",
          qty: 4,
          rate: 150,
          totalAmt: 600,
          discount: 50,
          netAmount: 550,
        },
        {
          date: "6-Oct-2023",
          serviceName: "Lab Test",
          qty: 2,
          rate: 100,
          totalAmt: 200,
          discount: 0,
          netAmount: 200,
        },
      ],
      billAmount: 750,
      advanceBalanceAmount: 200,
      discountAmount: 50,
      netAmount: 700,
      toBeRefund: 0,
    };

    return {
      status: statusCodeConstants.SUCCESS,
      message: "Bill details fetched successfully",
      data,
    };
  }

  async temp_drProfile(inputData) {
    const data = {
      regType: "New",
      code: 155,
      mrn: "MRN12345",
      payableType: "Doctor",
      name: "John",
      middleName: "Doe",
      lastName: "Smith",
      gender: "Male",
      birthDate: "24/02/1965",
      age: 57,
      slotDuration: 30,
      doctorType: "General Physician",
      personalInformation: {
        mmcNo: "MMC123",
        accLedgerName: "John Doe Clinic",
        emailID: "john.doe@example.com",
        maritalStatus: "Married",
        icNumber: "123456789",
        designation: "Doctor",
        telephoneNo: "123-456-7890",
        qualification: "MBBS, MD",
        mobileNo: "9876543210",
        nationality: "American",
        passportNo: "A1234567",
        dateOfJoining: "01/05/1990",
        dateOfAnniversary: "15/10",
        longitude: "-73.935242",
        latitude: "40.730610",
      },
    };
    return {
      status: statusCodeConstants.SUCCESS,
      message: "Doctor details fetched successfully",
      data,
    };
  }

  async temp_hospitalProfile(inputData) {
    const data = {
      code: "DSH",
      country: "Malaysia",
      district: "KPJ",
      postcode: "",
      contactNo: "60387692999",
      serverName: "",
      hospitalRegNo: "",
      locationType: "Hospital",
      name: "KPJ Damansara",
      state: "",
      taluka: "",
      address1:
        "PJ KAJANG SPECIALIST HOSPITAL (211797-1) (A Member Of KPJ Healthcare",
      faxNo: "60387692808",
      databaseName: "",
      shopNo: "",
      aboutUs: "Abc",
      description: "KPJ Damansara",
      cityDistrict: "SELANGOR",
      areaTown: "KPJ",
      address2: "JALAN CHERAS 43000 KAJANG SELANGOR DARUL EHSAN",
      email: "",
      pharmacyLicenseNo: "",
      tradeNo: "1234",
      clientDetails: [
        {
          department: [
            "Accounts",
            "Accounts",
            "Admin",
            "adult intensive care unit",
            "Anaesthesiology & Critical Care",
          ],
        },
      ],
    };

    return {
      status: statusCodeConstants.SUCCESS,
      message: "Hospital details fetched successfully",
      data,
    };
  }
  async temp_LabReport(inputData) {
    const data = {
      patientName: "John Doe",
      ageGender: "29 Year(s) 4 Month(s) 21 Day(s)/Male",
      prn: "PRN-DSH-1750526",
      mobileNo: "555-555-5555",
      opdIpdNo: "IPD-DSH-23-000134",
      consultDoctor: "Dr. Smith",
      patientType: "Self",
      orderNo: "ORD-DSH-1000861",
      orderDateTime: "24-09-2023 11:31:00AM",
      sampleCollectionDateTime: "24-09-2023 11:31:00AM",
      reportingDateTime: "24/09/23 11:33AM",
      sampleNo: "2309240004",
      wardBedNo: "Ward A/Bed 3",
      refDoctor: "Dr. Johnson",
      fbc: [
        {
          parameterName: "RBC",
          result: "4.5",
          unit: "million/uL",
          normalRange: "4.0-6.0",
          method: "Hydrodynamic Focusing (HDF) & Direct Current (DC) Detection",
        },
        {
          parameterName: "PLT",
          result: "150",
          unit: "thousand/uL",
          normalRange: "150-400",
          method: "Hydrodynamic Focusing (HDF) & Direct Current (DC) Detection",
        },
        {
          parameterName: "HGB",
          result: "13.2",
          unit: "g/dL",
          normalRange: "12.0-16.0",
          method: "SLS-Me",
        },
      ],
    };

    return {
      status: statusCodeConstants.SUCCESS,
      message: "Lab Report details fetched successfully",
      data,
    };
  }

  async temp_ImagingResultReport(inputData) {
    const data = {
      patientName: "Mr Nasir Shaikh",
      ageGender: "35 Year(s) 0 Month(s) 0 Day(s) / Male",
      wardBedNo: "",
      patientType: "Self",
      orderNo: "RAD-DSH-1000253",
      orderDate: "24/09/2023 8:05AM",
      testNo: "00068/23",
      reportDate: "05/10/23 2:49PM",
      refDoctor: "",
      imagingResult: {
        studyName: "X RAY CHEST",
        view: "RADIOGRAPH OF THE CHEST PA VIEW",
        findings: [
          "Soft tissues and bony thorax are normal.",
          "The trachea is central.",
          "Both the costophrenic and cardiophrenic angles are clear. Both domes of diaphragm are normal in position and contour.",
          "Both the hila are normal in size, shape, position and density. The visualized lung fields are normal.",
          "Cardiac shadow is enlarged (cardio-thoracic ratio = %).",
        ],
        impression: "Cardiomegaly.\nSuggest 2D echo.",
      },
    };

    return {
      status: statusCodeConstants.SUCCESS,
      message: "Diagnostic Report details fetched successfully",
      data,
    };
  }
}

module.exports = ProfileService;

const createOrUpdateProfile = async (
  profileData,
  existingProfile,
  commonAttris,
  historyAttrs,
  conn,
  t
) => {
  try {
    if (isEmpty(profileData) || isEmpty(commonAttris)) {
      return {
        status: statusCodeConstants.VALIDATION_ERROR,
        message: defaultMessage.MANDATORY_FIELDS_MISSING,
      };
    }
    if (profileData && profileData?.profileNo) {
      const notSameProfile = profileResource.compareRecords(
        existingProfile,
        profileData,
        profileFields
      );
      if (notSameProfile) {
        const profileInfo = {
          ...profileData,
          updatedBy: commonAttris.updatedBy,
        };
        const updatedProfile = await conn.Profile.update(profileInfo, {
          where: { profileNo: profileData?.profileNo },
          returning: true,
          plain: true,
          transaction: t,
        });
        updatedProfile._previousDataValues = {
          ...updatedProfile[1]._previousDataValues,
          ...historyAttrs,
        };
        await conn.ProfileHistory.create(updatedProfile._previousDataValues, {
          transaction: t,
        });
        return {
          status: statusCodeConstants.SUCCESS,
          message: "Profile UPdated Successfully",
          data: updatedProfile,
        };
      }
      return { status: statusCodeConstants.SUCCESS };
    } else {
      const profileInfo = {
        ...profileData,
        profileUuid: uuidv4(),
        ...commonAttris,
      };
      const profileDetails = await conn.Profile.create(profileInfo, {
        transaction: t,
      });
      return {
        status: statusCodeConstants.SUCCESS,
        message: "Profile Created Successfully",
        data: profileDetails,
      };
    }
  } catch (error) {
    logger.error(error);
    return {
      status: statusCodeConstants.ERROR,
      message: "Internal server error",
    };
  }
};

const createOrUpdateAddress = async (
  addressData,
  existingAddress,
  categoryDetails,
  commonAttris,
  historyAttrs,
  conn,
  t
) => {
  try {
    if (isEmpty(addressData) || isEmpty(commonAttris)) {
      return {
        status: statusCodeConstants.VALIDATION_ERROR,
        message: defaultMessage.MANDATORY_FIELDS_MISSING,
      };
    }
    if (addressData && addressData?.addressNo) {
      const checkExistingAddress = existingAddress.find(
        (x) => x.addressNo === addressData.addressNo
      );

      if (isEmpty(checkExistingAddress)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: "The address number provided does not exist in the system.",
        };
      }
      const notSameProfile = profileResource.compareRecords(
        checkExistingAddress,
        addressData,
        addressFields
      );
      if (notSameProfile) {
        const addressInfo = {
          ...addressData,
          ...categoryDetails,
          updatedBy: commonAttris.updatedBy,
        };
        const updatedAddress = await conn.Address.update(addressInfo, {
          where: { addressNo: addressData?.addressNo },
          returning: true,
          plain: true,
          transaction: t,
        });
        updatedAddress._previousDataValues = {
          ...updatedAddress[1]._previousDataValues,
          ...historyAttrs,
        };
        await conn.AddressHistory.create(updatedAddress._previousDataValues, {
          transaction: t,
        });
        return {
          status: statusCodeConstants.SUCCESS,
          message: "Address updated Successfully",
          data: updatedAddress,
        };
      }
      return { status: statusCodeConstants.SUCCESS };
    } else {
      const addressInfo = {
        ...addressData,
        ...categoryDetails,
        ...commonAttris,
      };
      const addressDetails = await conn.Address.create(addressInfo, {
        transaction: t,
      });
      return {
        status: statusCodeConstants.SUCCESS,
        message: "Address Created Successfully",
        data: addressDetails,
      };
    }
  } catch (error) {
    logger.error(error);
    return {
      status: statusCodeConstants.ERROR,
      message: "Internal server error",
    };
  }
};

const createorUpdateContact = async (
  contactData,
  existingContact,
  categoryDetails,
  commonAttris,
  historyAttrs,
  conn,
  t
) => {
  try {
    if (isEmpty(contactData) || isEmpty(commonAttris)) {
      return {
        status: statusCodeConstants.VALIDATION_ERROR,
        message: defaultMessage.MANDATORY_FIELDS_MISSING,
      };
    }
    if (contactData && contactData?.contactNo) {
      const checkExistingContact = existingContact.find(
        (x) => x.contactNo === contactData.contactNo
      );

      if (isEmpty(checkExistingContact)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: "The contact number provided does not exist in the system.",
        };
      }

      const notSameProfile = profileResource.compareRecords(
        existingContact,
        contactData,
        contactFields
      );
      if (notSameProfile) {
        const ContactInfo = {
          ...contactData,
          ...categoryDetails,
          updatedBy: commonAttris.updatedBy,
        };
        const updatedContact = await conn.Contact.update(ContactInfo, {
          where: { contactNo: contactData?.contactNo },
          returning: true,
          plain: true,
          transaction: t,
        });
        updatedContact._previousDataValues = {
          ...updatedContact[1]._previousDataValues,
          ...historyAttrs,
        };
        await conn.ContactHistory.create(updatedContact._previousDataValues, {
          transaction: t,
        });
        return {
          status: statusCodeConstants.SUCCESS,
          message: "Contact details updated Successfully",
          data: updatedContact,
        };
      }
      return { status: statusCodeConstants.SUCCESS };
    } else {
      const ContactInfo = {
        ...contactData,
        ...categoryDetails,
        ...commonAttris,
      };
      const contactDetails = await conn.Contact.create(ContactInfo, {
        transaction: t,
      });
      return {
        status: statusCodeConstants.SUCCESS,
        message: "Contact details created successfully",
        data: contactDetails,
      };
    }
  } catch (error) {
    logger.error(error);
    return {
      status: statusCodeConstants.ERROR,
      message: "Internal server error",
    };
  }
};
