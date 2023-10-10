import React from "react";

const CustomTable = (props) => {

    const { rows } = props.data
    return (
        <table className="table table-striped table-sm table-nowrap table-centered mb-0 mt-3">

            <thead>
                <th>Code</th>
                <th>Outlet</th>
            </thead>
            <tbody>
                {rows && rows.map((r) => (
                    <tr key={r.key}>
                        <td>{r.id}</td>
                        <td className="tx-medium">{r?.outlet}</td>
                    </tr>
                ))
                }
            </tbody>
        </table>
    )
}
export default CustomTable;