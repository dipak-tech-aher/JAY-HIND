/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState } from "react"
import CustomTripleSection from "../components/CustomTripleSection"

const AverageResponseTime = (props) => {

    const { headerName } = props.data
    const [tabMenu, setTabMenu] = useState(
        [{ title: "Email", id: "Email" },
        { title: "Live Chat", id: "Live Chat" },
        { title: "Social Media", id: "Social Media" }])

    const [isActive, setIsActive] = useState('Email')

    const showtab = (selectedMenuId) => {
        setIsActive(selectedMenuId)
    }

    return (
        <>
            <div className="col-lg-12">
                <div>
                    <div className="card-body">
                        <div className="modal-header">
                            <h5>{headerName}</h5>
                        </div>
                        <div className="card-box">
                            <ul className="nav nav-tabs">
                                {tabMenu.map((menu, i) => (
                                    <li key={i} className="nav-item">
                                        <a id="TabList" onClick={() => showtab(menu.id)} to="#" data-toggle="tab" aria-expanded="true" className={"nav-link" + (isActive === menu.id ? ' active' : '')}>{menu.title}</a>
                                    </li>
                                ))}
                            </ul>
                            <div className="col-12 admin-user">
                                {(() => {
                                    switch (isActive) {

                                        case tabMenu[0].id:
                                            return (<CustomTripleSection
                                                data={{
                                                    footerOne: "Average wait time",
                                                    footerTwo: "Average Holding time",
                                                    footerThree: "Average Speed of answer",
                                                    valueOne: "" || "0m 0s",
                                                    ValueTwo: ""|| "0m 0s",
                                                    ValueThree: "" || "0m 0s",
                                                }}
                                            />)
                                        case tabMenu[1].id:
                                            return (<CustomTripleSection
                                                data={{
                                                    footerOne: "Average wait time",
                                                    footerTwo: "Average Holding time",
                                                    footerThree: "Average Speed of answer",
                                                    valueOne: "" || "0m 0s",
                                                    ValueTwo: "" || "0m 0s",
                                                    ValueThree: "" || "0m 0s"
                                                }}
                                            />)
                                        case tabMenu[2].id:
                                            return (<CustomTripleSection
                                                data={{
                                                    footerOne: "Average wait time",
                                                    footerTwo: "Average Holding time",
                                                    footerThree: "Average Speed of answer",
                                                    valueOne: "" || "0m 0s",
                                                    ValueTwo: "" || "0m 0s",
                                                    ValueThree: "" || "0m 0s"
                                                }}
                                            />)
                                        default:
                                            return (<CustomTripleSection
                                                data={{
                                                    footerOne: "Average wait time",
                                                    footerTwo: "Average Holding time",
                                                    footerThree: "Average Speed of answer",
                                                    valueOne: "" || "0m 0s",
                                                    ValueTwo: "" || "0m 0s",
                                                    ValueThree: "" || "0m 0s"
                                                }}
                                            />)
                                    }
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default AverageResponseTime