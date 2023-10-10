import React from "react";

const CustomTableIcons = (props) => {

    const { rows } = props.data
    return (
        <table className="table table-striped table-sm table-nowrap table-centered mb-0 mt-3">

            <thead>
                <th>Code</th>
                <th>Outlet</th>
                <th style={{ "align": "right" }}>Mon</th>
                <th style={{ "align": "right" }}>Tue</th>
                <th style={{ "align": "right" }}>Wed</th>
                <th style={{ "align": "right" }}>Thu</th>
                <th style={{ "align": "right" }}>Fri</th>
                <th style={{ "align": "right" }}>Sat</th>
            </thead>
            <tbody>
                {rows && rows.map((r) => (
                    <tr key={r.key}>
                        <td>{r.id}</td>
                        <td className="tx-medium">{r.outlet}</td>
                        <td className="text-right"><div className={r.Mon ? "avatar-xs bg-success rounded-circle" : "avatar-xs bg-danger rounded-circle"}></div></td>
                        <td className="text-right"><div className={r.Tue ? "avatar-xs bg-success rounded-circle" : "avatar-xs bg-danger rounded-circle"}></div></td>
                        <td className="text-right"><div className={r.Wed ? "avatar-xs bg-success rounded-circle" : "avatar-xs bg-danger rounded-circle"}></div></td>
                        <td className="text-right"><div className={r.Thu ? "avatar-xs bg-success rounded-circle" : "avatar-xs bg-danger rounded-circle"}></div></td>
                        <td className="text-right"><div className={r.Fri ? "avatar-xs bg-success rounded-circle" : "avatar-xs bg-danger rounded-circle"}></div></td>
                        <td className="text-right"><div className={r.sat ? "avatar-xs bg-success rounded-circle" : "avatar-xs bg-danger rounded-circle"}></div></td>
                    </tr>
                ))
                }
            </tbody>
        </table>
    )
}

export default CustomTableIcons;