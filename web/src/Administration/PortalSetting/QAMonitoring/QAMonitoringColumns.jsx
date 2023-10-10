export const EvaluationColumns = [
    {
        Header: "Evaluation Section Id",
        accessor: "sectionId",
        disableFilters: true,
        id: 'sectionId'
    },
    {
        Header: "Section Nick Name",
        accessor: "sectionName",
        disableFilters: true,
        id: 'sectionName'
    },
    {
        Header: "Evaluation Section Display Name",
        accessor: "displayName",
        disableFilters: true,
        id: 'displayName'
    },
    {
        Header: "Section Weightage",
        accessor: "weightage",
        disableFilters: true,
        id: 'weightage'
    },
    {
        Header: "Channels",
        accessor: "channelDesc.description",
        disableFilters: true,
        id: 'channels'
    },
    {
        Header: "Status",
        accessor: "statusDesc.description",
        disableFilters: true,
        id: 'currStatus'
    },
    {
        Header: "Action"
    }
]

export const QualityGuidelinesColumns = [
    {
        Header: "Guidelines Id",
        accessor: "guidelineId",
        disableFilters: true,
        id: 'guidelineId'
    },
    {
        Header: "Quality Guidelines",
        accessor: "qualityGuidelines",
        disableFilters: true,
        id: 'qualityGuidelines'
    },
    {
        Header: "Evaluation Section",
        accessor: "evaluationSection.sectionName",
        disableFilters: true,
        id: 'evaluationSection'
    },
    {
        Header: "Weightage",
        accessor: "evaluationSection.weightage",
        disableFilters: true,
        id: 'weightage'
    },
    {
        Header: "Evaluation Type",
        accessor: "evaluationTypeDescription.description",
        disableFilters: true,
        id: 'evaluationType'
    },
    {
        Header: "Status",
        accessor: "statusDesc.description",
        disableFilters: true,
        id: 'currStatus'
    },
    {
        Header: "Action"
    }
]