const { v4: uuidv4 } = require('uuid')

export const RecentCustomersColumns = [
    {
        Header: "Profile Photo",
        accessor: "customer_photo",
        disableFilters: true,
        id: "customer_photo",
        uid: uuidv4()
    },
    {
        Header: "Name",
        accessor: "customer_name",
        disableFilters: true,
        id: "customer_name",
        uid: uuidv4()
    },
    {
        Header: "Customer Category",
        accessor: "customer_category",
        disableFilters: true,
        id: "customer_category",
        uid: uuidv4()
    },
    {
        Header: "Email",
        accessor: "email",
        disableFilters: true,
        id: "email",
        uid: uuidv4()
    }
];
