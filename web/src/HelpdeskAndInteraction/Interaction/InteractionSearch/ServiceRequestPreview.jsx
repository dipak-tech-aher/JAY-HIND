import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';

import NewCustomerPreview from '../../../CRM/Customer/newCustomerPreview';
import { properties } from '../../../properties';
import { get } from '../../../common/util/restUtil';
import Modal from 'react-modal'
import { useReactToPrint } from 'react-to-print';
const ServiceRequestPreview = (props) => {

    const { serviceRequestData } = props.data;
    const { handleParentModalState } = props.stateHandlers;

    const [newCustomerData, setNewCustomerData] = useState({
        current: {
            customer: {}
        }
    })
    const [isOpen, setIsOpen] = useState(false);
    const plansList = useRef({});

    const renderMode = {
        customerTypeSelection: 'hide',
        customerDetails: 'hide',
        customerDetailsPreview: 'hide',
        accountDetails: 'hide',
        accountDetailsPreview: 'hide',
        serviceDetails: 'hide',
        previewAndSubmitButton: 'hide',
        previewButton: 'hide',
        previewCancelButton: 'hide',
        customerDetailsEditButton: 'hide',
        accountDetailsEditButton: 'hide',
        serviceDetailsEditButton: 'hide',
        submitted: 'no',
        submitButton: 'hide',
        printButton: 'show',
        previewCloseButton: 'show',
        serviceWorkOrderSection: 'show'
    }

    useEffect(() => {
        
        let customerData;
        get(properties.CUSTOMER360_API + '/' + serviceRequestData.customerId)
            .then((resp) => {
                if (resp && resp.data) {
                    customerData = {}
                    //customerData = resp.data;
                    //const customerData = {}
                        customerData.customerId = resp?.data?.customerId
                        customerData.crmCustomerNo = (resp?.data?.crmCustomerNo) ? resp?.data?.crmCustomerNo : ''
                        if (resp?.data?.custType === 'RESIDENTIAL') {
                            customerData.title = resp?.data?.title || ""
                            customerData.foreName = resp?.data?.firstName || ""
                            customerData.surName = resp?.data?.lastName || ""
                        }
                        if (resp?.data?.custType === 'BUSINESS' || resp?.data?.custType === 'GOVERNMENT') {
                            customerData.companyName = resp?.data?.firstName || ""
                        }
                        customerData.customerType = resp?.data?.custType || ""
                        customerData.customerTypeDesc = resp?.data?.customerTypeDesc?.description || ""
                        customerData.email = resp?.data?.contact?.email || ""
                        customerData.contactType = resp?.data?.contact?.contactType || ""
                        customerData.contactTypeDesc = resp?.data?.contact?.contactTypeDesc?.description || ""
                        customerData.contactNbr = resp?.data?.contact?.contactNo || ""
                        customerData.gender = resp?.data?.gender || ""
                        customerData.dob = resp?.data?.birthDate || ""
                        customerData.idNbr = resp?.data?.idValue || ""
                        customerData.idType = resp?.data?.idType || ""
                        customerData.idTypeDesc = resp?.data?.idTypeDesc?.description || ""
                        customerData.property1 = resp?.data?.property_1 || ""
                        customerData.property2 = resp?.data?.property_2 || ""
                        customerData.property3 = resp?.data?.property_3 || ""
                        customerData.registrationDate = resp?.data?.regDate || ""
                        customerData.registrationNbr = resp?.data?.registeredNo || ""
                        customerData.isBillable = resp?.data?.isBillable || ""
                        customerData.status = resp?.data?.status || ""
                        customerData.statusDesc = resp?.data?.statusDesc?.description || ""
                        customerData.billableDetails = resp?.data?.billableDetails || {}
                        customerData.billableDetails.groupDesc = resp?.data?.billableDetails.billGroupDesc?.description || ""
                        customerData.billableDetails.currencyDesc = resp?.data?.billableDetails.currencyDesc?.description || ""
                        customerData.billableDetails.notificationDesc = resp?.data?.billableDetails.billNotificationDesc?.description || ""
                        customerData.billableDetails.languageDesc = resp?.data?.billableDetails.billLanguageDesc?.description || ""
                        customerData.billableDetails.sourceOfRegDesc = resp?.data?.billableDetails.sourceOfRegDesc?.description || ""
                        customerData.address = []
                        customerData.address.push({})
                        customerData.address[0].flatHouseUnitNo = resp?.data?.address?.hno || ""
                        customerData.address[0].building = resp?.data?.address?.buildingName || ""
                        customerData.address[0].street = resp?.data?.address?.street || ""
                        customerData.address[0].district = resp?.data?.address?.district || ""
                        customerData.address[0].cityTown = resp?.data?.address?.city || ""
                        customerData.address[0].country = resp?.data?.address?.country || ""
                        customerData.address[0].postCode = resp?.data?.address?.postCode || ""
                        customerData.address[0].state = resp?.data?.address?.state || ""
                } else {
                    toast.error("Failed to fetch Customer Details - " + resp.status);
                }
                get(`${properties.ACCOUNT_DETAILS_API}/${serviceRequestData.customerId}?account-id=${serviceRequestData.accountId}`)
                    .then((resp) => {
                        if (resp && resp.data) {
                            //customerData.address[0] = customerData?.address
                            resp.data.property1 = resp.data.property_1
                            resp.data.property2 = resp.data.property_2
                            resp.data.property3 = resp.data.property_3
                            customerData.account = [resp.data];
                        } else {
                            toast.error("Failed to fetch account ids data - " + resp.status);
                        }
                        get(`${properties.SERVICES_LIST_API}/${serviceRequestData.customerId}?account-id=${serviceRequestData.accountId}&service-id=${serviceRequestData.serviceId}&realtime=false`)
                            .then((resp) => {
                                if (resp && resp.data) {
                                    customerData.account[0].service = resp.data;
                                    console.log('Customer',customerData)
                                    setNewCustomerData({ current: { customer: customerData } })
                                    //plansList.current = resp.data[0].plans
                                    setIsOpen(true);
                                } else {
                                    toast.error("Failed to fetch account ids data - " + resp.status);
                                }
                            }).catch(error => console.log(error)).finally()
                    })
            }).catch(error => console.log(error)).finally();
    }, [])

    const handleOnCloseModal = () => {
        setIsOpen(false);
        handleParentModalState();
    }

    const componentRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    return (
        isOpen &&
        <Modal isOpen={isOpen} >
            <NewCustomerPreview
                previewData={{
                    renderMode: renderMode
                }}
                data={{
                    newCustomerData: newCustomerData,
                    plansList: plansList,
                    serviceRequestData: serviceRequestData
                }}
                modalStateHandlers={{
                    handleNewCustomerPreviewModalClose: handleOnCloseModal,
                    handlePrint: handlePrint
                }}
                ref={componentRef}
            />
        </Modal>
    )
}

export default ServiceRequestPreview;