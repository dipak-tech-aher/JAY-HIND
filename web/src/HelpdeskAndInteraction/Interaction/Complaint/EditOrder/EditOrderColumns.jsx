export const TaskDetailsColumns = [
    {
        Header: "Client",
        accessor: "client",
        disableFilters: true
    },
    {
        Header: "Project Name",
        accessor: "projectName",
        disableFilters: true
    },
    {
        Header: "Actual Start Date",
        accessor: "actualStartDate",
        disableFilters: true
    },
    {
        Header: "Baseline Finish Date",
        accessor: "baselineFinishDate",
        disableFilters: true
    },
    {
        Header: "Delay Variance",
        accessor: "delayVariance",
        disableFilters: true
    },
    {
        Header: "Project Manager",
        accessor: "projectManager",
        disableFilters: true
    },
    {
        Header: "Project Status",
        accessor: "projectStatus",
        disableFilters: true
    },
    {
        Header: "Signed-Off",
        accessor: "signedOff",
        disableFilters: true
    }
]

export const ProductDetailsColumns = [
	{
        Header: "Action",
        accessor: "action",
        disableFilters: true
    },
	{
        Header: "Status",
        accessor: "productStatus",
        disableFilters: true
    },
    {
        Header: "S.No",
        accessor: "productId",
        disableFilters: true
    },
    {
        Header: "Product Line",
        accessor: "productLine",
        disableFilters: true
    },
    {
        Header: "Service Type",
        accessor: "serviceType",
        disableFilters: true
    },
    {
        Header: "Product Name",
        accessor: "productName",
        disableFilters: true
    },
    {
        Header: "Product Description",
        accessor: "productDescription",
        disableFilters: true
    },
    {
        Header: "Quantity",
        accessor: "quantity",
        disableFilters: true
    },
    {
        Header: "Status",
        accessor: "status",
        disableFilters: true
    }
]

export const NetworkValues = [
	{
		id: "MNGCON",
		value: "Managed Connectivity",
		selected: "N",
		children: [
			{
				id: "MNGWAN",
				value: "Managed WAN",
				selected: "N",
				children: []
			},
			{
				id: "MNGINTSH",
				value: "Managed Internet - Shared",
				selected: "N",
				children: []
			},
			{
				id: "MNGINTDT",
				value: "Managed Internet - Deticated",
				selected: "N",
				children: []
			},
			{   id: "MNGWLNET",
				value: "Managed Wireless Network",
				selected: "N",
				children: []
			},
			{
				id: "MNGLAN",
                selected: "LABEL",
				value: "Managed Lan",
				children: [
					{
						id: "MNGVLAN",
						value: "Managed  VLAN",
						selected: "N",
						children: []
					},
					{
						id: "PHYCON",
						value: "Physical Connectivity",
						selected: "N",
						children: []
					},
					{   id: "MNGDTNET",
						value: "Managed Deticated Network",
						selected: "N",
						children: []
					},
				]
			},
			{   id: "MNGDCCON",
				value: "Managed DC Connectivity",
				selected: "N",
				children: []
			},
			{   id: "MNGL3VPN",
				value: "Managed L3 Vpn",
				selected: "N",
				children: []
			}			
		]
	}
]

export const ApplicationValues = [
	{
		id: "MNGACDIR",
		value: "Managed Active Directory",
		selected: "N",
		children: []
	},
	{
		id: "MNGEXHG",
		value: "Managed Exchange",
		selected: "N",
		children: [
			{
				id: "MLSRSMG",
				value: "Mail Security - Symantec Messaging Gateway / Brightmail ",
				selected: "N",
				children: []
			},
			{
				id: "MLSRSMS",
				value: "Mail Security - Symantec Mail Security for MS Exchange",
				selected: "N",
				children: []
			}			
		]
	},
	{
		id: "MNGSHRP",
		value: "Managed  Sharepoint",
		selected: "N",
		children: []
	},
	{
		id: "MNGTMGSER",
		value: "Managed TMGVISA Server",
		selected: "N",
		children: []
	},
	{
		id: "MNGBED",
		value: "Managed BES",
		selected: "N",
		children: []
	},
	{
		id: "MNGFPS",
		value: "Managed File and Print Service",
		selected: "N",
		children: []
	},
	{
		id: "MNGIPTINFRA",
		value: "Managed IPT Instructure",
		selected: "N",
		children: []
	},
	{
		id: "MNGRSA",
		value: "Managed RSA",
		selected: "N",
		children: []
	},
]

export const SaasValues = [
	{
		id: "EMWAVAS",
		value: "Email With Anti-virus/Anti-spam",
		selected: "N",
		children: []
	},
	{
		id: "SHRP",
		value: "Sharepoint",
		selected: "N",
		children: []
	},
	{
		id: "BES",
		value: "BES",
		selected: "N",
		children: []
	},
]

export const OtherServices = [
{
		id: "MNGDTSTR",
		value: "Managed Deticated Storage",
		selected: "N",
		children: []
	},
	{
		id: "BKPSRDTSTR",
		value: "Backup a Service Deticated Storage",
		selected: "N",
		children: []
	},
	{
		id: "MNTREQ",
		value: "Monitoring Requirment ",
		selected: "N",
		children: []
	},
	{
		id: "COL",
		value: "Colocation",
		selected: "N",
		children: []
	},
	{
		id: "RMMNT",
		value: "Remote Monitoring",
		selected: "N",
		children: []
	},
]

export const ContractDetailColumns = [
	{
        Header: "Status",
        accessor: "status",
        disableFilters: true
    },
    {
        Header: "Service ID",
        accessor: "soNumber",
        disableFilters: true
    },
    {
        Header: "Product Name",
        accessor: "prodDetails.planName",
        disableFilters: true
    },
    {
        Header: "Product Description",
        accessor: "itemName",
        disableFilters: true
    },
    {
        Header: "Contract Start Date",
        accessor: "actualStartDate",
        disableFilters: true
    },
    {
        Header: "Contract End Date",
        accessor: "actualEndDate",
        disableFilters: true
    },
    {
        Header: "Total Amount",
        accessor: "chargeAmt",
        disableFilters: true
    },
    {
        Header: "Balance Amount",
        accessor: "balanceAmount",
        disableFilters: true
    },
    {
        Header: "Charge Type",
        accessor: "charge.chargeCatDesc.description",
        disableFilters: true
    },
    {
        Header: "Fee Type",
        accessor: "frequency",
        disableFilters: true
    },
    {
        Header: "Prorated",
        accessor: "prorated",
        disableFilters: true
    },
    {
        Header: "Quantity",
        accessor: "quantity",
        disableFilters: true
    },
    {
        Header: "Duration",
        accessor: "durationMonth",
        disableFilters: true
    },
    {
        Header: "Advance Flag",
        accessor: "upfrontPaymentDesc.description",
        disableFilters: true
    },
    {
        Header: "Next Bill Period",
        accessor: "nextBillPeriod",
        disableFilters: true
    }
]