export const AddEditMapWorkflowColumns = [
    {
        Header: "Select"
    },
    {
        Header: "Workflow Template ID",
        accessor: "workflowId",
        disableFilters: true,
        id: 'workflowId'
    },
    {
        Header: "Template Name",
        accessor: "workflowName",
        disableFilters: true,
        id: 'workflowName'
    },
    {
        Header: "Category",
        accessor: "productType",
        disableFilters: true,
        id: 'productType'
    },
    {
        Header: "Status",
        accessor: "statusDesc.description",
        disableFilters: true,
        id: 'currStatus'
    },
    {
        Header: "Created By",
        accessor: "createdByName.firstName",
        disableFilters: true,
        id: 'createdBy'
    },
    {
        Header: "View Workflow"
    },
    // {
    //     Header: "View Workflow Template"
    // }
]

export const SelectConfirmMappingTemplateColumns = [
    {
        Header: "Mapping ID",
        accessor: "mappingId",
        disableFilters: true,
        id: 'mappingId'
    },
    {
        Header: "Template Map Name",
        accessor: "mappingName",
        disableFilters: true,
        id: 'mappingName'
    },
    {
        Header: "Generate Date",
        accessor: "createdAt",
        disableFilters: true,
        id: 'createdAt'
    },
    {
        Header: "Generated by",
        accessor: "createdByName.firstName",
        disableFilters: true,
        id: 'createdBy'
    },
    {
        Header: "Module",
        accessor: "module",
        disableFilters: true,
        id: 'module'
    },
    {
        Header: "Service Type",
        accessor: "mapping.serviceType",
        disableFilters: true,
        id: 'serviceType'
    },
    {
        Header: "Interaction Types",
        accessor: "mapping.interactionType",
        disableFilters: true,
        id: 'interactionType'
    },
    {
        Header: "Priority",
        accessor: "mapping.priority",
        disableFilters: true,
        id: 'priority'
    },
    {
        Header: "Customer Type",
        accessor: "mapping.customerType",
        disableFilters: true,
        id: 'customerType'
    },
    {
        Header: "Template ID",
        accessor: "workflowId",
        disableFilters: true,
        id: 'workflowId'
    }
]

export const MappedWorkflowListColumns = [
    {
        Header: "Select"
    },
    {
        Header: "Mapping ID",
        accessor: "mappingId",
        disableFilters: true,
        id: 'mappingId'
    },
    {
        Header: "Template Name",
        accessor: "mappingName",
        disableFilters: true,
        id: 'mappingName'
    },
    {
        Header: "Created Date",
        accessor: "createdAt",
        disableFilters: true,
        id: 'createdAt'
    },
    {
        Header: "Created By",
        accessor: "createdBy",
        disableFilters: true,
        id: 'createdBy'
    },
    {
        Header: "Module",
        accessor: "moduleDescription.description",
        disableFilters: true,
        id: 'module'
    },
    {
        Header: "Service Type",
        accessor: "mapping.serviceTypeDescription",
        disableFilters: true,
        id: 'serviceType'
    },
    {
        Header: "Interaction Type",
        accessor: "mapping.interactionTypeDescription",
        disableFilters: true,
        id: 'interactionType'
    },
    {
        Header: "Customer Type",
        accessor: "mapping.customerTypeDescription",
        disableFilters: true,
        id: 'customerType'
    },
    {
        Header: "Template ID",
        accessor: "workflowId",
        disableFilters: true,
        id: 'workflowId'
    },
    {
        Header: "Action"
    }
]