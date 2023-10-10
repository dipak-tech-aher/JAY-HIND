import React, { useState } from "react"
// import 'antd/dist/antd.css';
import { Tag } from 'antd';
import { unstable_batchedUpdates } from 'react-dom';
import _ from 'lodash'


const SupportAvailability = (props) => {

    const { whatsappSettings, whatsappSettingError, Mode } = props.data
    const { handleOnChange, setWhatsappSettings } = props.handle
    const [whatsappcustomTime, setWhatsappcustomTime] = useState({})
    const customAvailability = [{ ...whatsappSettings.customAvailability }]

    const time = [{ value: "00:00", key: "00:00", Description: "12:00 AM" },
    { value: "00:30", key: "00:30", Description: "12:30 AM" },
    { value: "01:00", key: "01:00", Description: "01:00 AM" },
    { value: "01:30", key: "01:30", Description: "01:30 AM" },
    { value: "02:00", key: "02:00", Description: "02:00 AM" },
    { value: "02:30", key: "02:30", Description: "02:30 AM" },
    { value: "03:00", key: "03:00", Description: "03:00 AM" },
    { value: "03:30", key: "03:30", Description: "03:30 AM" },
    { value: "04:00", key: "04:00", Description: "04:00 AM" },
    { value: "04:30", key: "04:30", Description: "04:30 AM" },
    { value: "05:00", key: "05:00", Description: "05:00 AM" },
    { value: "05:30", key: "05:30", Description: "05:30 AM" },
    { value: "06:00", key: "06:00", Description: "06:00 AM" },
    { value: "06:30", key: "06:30", Description: "06:30 AM" },
    { value: "07:00", key: "07:00", Description: "07:00 AM" },
    { value: "07:30", key: "07:30", Description: "07:30 AM" },
    { value: "08:00", key: "08:00", Description: "08:00 AM" },
    { value: "08:30", key: "08:30", Description: "08:30 AM" },
    { value: "09:00", key: "09:00", Description: "09:00 AM" },
    { value: "09:30", key: "09:30", Description: "09:30 AM" },
    { value: "10:00", key: "10:00", Description: "10:00 AM" },
    { value: "10:30", key: "10:30", Description: "10:30 AM" },
    { value: "11:00", key: "11:00", Description: "11:00 AM" },
    { value: "11:30", key: "11:30", Description: "11:30 AM" },
    { value: "12:00", key: "12:00", Description: "12:00 PM" },
    { value: "12:30", key: "12:30", Description: "12:30 PM" },
    { value: "13:00", key: "13:00", Description: "1:00 PM" },
    { value: "13:30", key: "13:30", Description: "1:30 PM" },
    { value: "14:00", key: "14:00", Description: "2:00 PM" },
    { value: "14:30", key: "14:30", Description: "2:30 PM" },
    { value: "15:00", key: "15:00", Description: "3:00 PM" },
    { value: "15:30", key: "15:30", Description: "3:30 PM" },
    { value: "16:00", key: "16:00", Description: "4:00 PM" },
    { value: "16:30", key: "16:30", Description: "4:30 PM" },
    { value: "17:00", key: "17:00", Description: "5:00 PM" },
    { value: "17:30", key: "17:30", Description: "5:30 PM" },
    { value: "18:00", key: "18:00", Description: "6:00 PM" },
    { value: "18:30", key: "18:30", Description: "6:30 PM" },
    { value: "19:00", key: "19:00", Description: "7:00 PM" },
    { value: "19:30", key: "19:30", Description: "7:30 PM" },
    { value: "20:00", key: "20:00", Description: "8:00 PM" },
    { value: "20:30", key: "20:30", Description: "8:30 PM" },
    { value: "21:00", key: "21:00", Description: "9:00 PM" },
    { value: "21:30", key: "21:30", Description: "9:30 PM" },
    { value: "22:00", key: "22:00", Description: "10:00 PM" },
    { value: "22:30", key: "22:30", Description: "10:30 PM" },
    { value: "23:00", key: "23:00", Description: "11:00 PM" },
    { value: "23:30", key: "23:30", Description: "11:30 PM" }]

    const days = [
        { key: "Monday", value: "Monday", description: "Monday" },
        { key: "Tuesday", value: "Tuesday", description: "Tuesday" },
        { key: "Wednesday", value: "Wednesday", description: "Wednesday" },
        { key: "Thursday", value: "Thursday", description: "Thursday" },
        { key: "Friday", value: "Friday", description: "Friday" },
        { key: "Saturday", value: "Saturday", description: "Saturday" },
        { key: "Sunday", value: "Sunday", description: "Sunday" },
    ]

    const handleOnchange = (e) => {
        const { target } = e;
        setWhatsappcustomTime({
            ...whatsappcustomTime,
            [target.id]: target.value
        })
    }

    const handleCustomerAvaliablility = (key) => {
        let whatsappCustomAvailability = [...whatsappSettings.customAvailability]
        whatsappCustomAvailability = whatsappCustomAvailability.filter((item) => item.day !== key);
        setWhatsappSettings({
            ...whatsappSettings,
            customAvailability: whatsappCustomAvailability
        })
    }

    const handleonClick = (e) => {
        const whatsappCustomAvailability = []
        if (whatsappSettings?.customAvailability.length > 0) {
            whatsappSettings?.customAvailability?.forEach((d) => {
                if (d.day === whatsappcustomTime.day) {
                    whatsappCustomAvailability.push(whatsappcustomTime)
                } else {
                    whatsappCustomAvailability.push(d)
                }
            })

        }
        else {
            whatsappCustomAvailability.push(whatsappcustomTime)
        }

        if (!(_.some(whatsappCustomAvailability, ['day', whatsappcustomTime.day]))) {
            whatsappCustomAvailability.push(whatsappcustomTime)
        }

        unstable_batchedUpdates(() => {
            setWhatsappSettings({
                ...whatsappSettings,
                customAvailability: whatsappCustomAvailability
            })
        })
    }

    return (
        <>
            <div className="tab-pane" id="account-2">
                <div className="row">
                    <div className="col-12">
                        <form action="" method="">
                            <div className="form-group row">
                                <label htmlFor="alwaysOnline" className="col-md-4 col-form-label text-md-left">Always available online</label>
                                <div className="col-md-4">
                                    <input type="checkbox" id="alwaysOnline" disabled={Mode === "VIEW" ? true : ""} className="form-control" checked={whatsappSettings.alwaysOnline === 'Y' ? true : false} onChange={handleOnChange} />
                                </div>
                            </div><br>
                            </br>
                        </form>

                        <form action="" method="">
                            <div className="form-group row" >
                                <label htmlFor="timeZone" className="col-md-4 col-form-label text-md-left">Select TimeZone{whatsappSettings.alwaysOnline === 'Y'?"":<span>*</span>}</label>
                                <div className="col-md-5">
                                    <select name="timeZone" className={`form-control ${whatsappSettingError.timeZone && "error-border"}`} id="timeZone" value={whatsappSettings.timeZone} disabled={whatsappSettings.alwaysOnline === 'Y' ? true : Mode === "VIEW" ? true : ""} onChange={handleOnChange} >
                                        <option value="">Select TimeZone</option>
                                        <option value="-12">(GMT-12:00) International Date Line West</option>
                                        <option value="-11">(GMT-11:00) Midway Island, Samoa</option>
                                        <option value="-10">(GMT-10:00) Hawaii</option>
                                        <option value="-9">(GMT-09:00) Alaska</option>
                                        <option value="-8">(GMT-08:00) Pacific Time (US & Canada)</option>
                                        <option value="-8">(GMT-08:00) Tijuana, Baja California</option>
                                        <option value="-7">(GMT-07:00) Arizona</option>
                                        <option value="-7">(GMT-07:00) Chihuahua, La Paz, Mazatlan</option>
                                        <option value="-7">(GMT-07:00) Mountain Time (US & Canada)</option>
                                        <option value="-6">(GMT-06:00) Central America</option>
                                        <option value="-6">(GMT-06:00) Central Time (US & Canada)</option>
                                        <option value="-6">(GMT-06:00) Guadalajara, Mexico City, Monterrey</option>
                                        <option value="-6">(GMT-06:00) Saskatchewan</option>
                                        <option value="-5">(GMT-05:00) Bogota, Lima, Quito, Rio Branco</option>
                                        <option value="-5">(GMT-05:00) Eastern Time (US & Canada)</option>
                                        <option value="-5">(GMT-05:00) Indiana (East)</option>
                                        <option value="-4">(GMT-04:00) Atlantic Time (Canada)</option>
                                        <option value="-4">(GMT-04:00) Caracas, La Paz</option>
                                        <option value="-4">(GMT-04:00) Manaus</option>
                                        <option value="-4">(GMT-04:00) Santiago</option>
                                        <option value="-3.5">(GMT-03:30) Newfoundland</option>
                                        <option value="-3">(GMT-03:00) Brasilia</option>
                                        <option value="-3">(GMT-03:00) Buenos Aires, Georgetown</option>
                                        <option value="-3">(GMT-03:00) Greenland</option>
                                        <option value="-3">(GMT-03:00) Montevideo</option>
                                        <option value="-2">(GMT-02:00) Mid-Atlantic</option>
                                        <option value="-1">(GMT-01:00) Cape Verde Is.</option>
                                        <option value="-1">(GMT-01:00) Azores</option>
                                        <option value="0">(GMT+00:00) Casablanca, Monrovia, Reykjavik</option>
                                        <option value="0">(GMT+00:00) Greenwich Mean Time : Dublin, Edinburgh, Lisbon, London</option>
                                        <option value="1">(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna</option>
                                        <option value="1">(GMT+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague</option>
                                        <option value="1">(GMT+01:00) Brussels, Copenhagen, Madrid, Paris</option>
                                        <option value="1">(GMT+01:00) Sarajevo, Skopje, Warsaw, Zagreb</option>
                                        <option value="1">(GMT+01:00) West Central Africa</option>
                                        <option value="2">(GMT+02:00) Amman</option>
                                        <option value="2">(GMT+02:00) Athens, Bucharest, Istanbul</option>
                                        <option value="2">(GMT+02:00) Beirut</option>
                                        <option value="2">(GMT+02:00) Cairo</option>
                                        <option value="2">(GMT+02:00) Harare, Pretoria</option>
                                        <option value="2">(GMT+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius</option>
                                        <option value="2">(GMT+02:00) Jerusalem</option>
                                        <option value="2">(GMT+02:00) Minsk</option>
                                        <option value="2">(GMT+02:00) Windhoek</option>
                                        <option value="3">(GMT+03:00) Kuwait, Riyadh, Baghdad</option>
                                        <option value="3">(GMT+03:00) Moscow, St. Petersburg, Volgograd</option>
                                        <option value="3">(GMT+03:00) Nairobi</option>
                                        <option value="3">(GMT+03:00) Tbilisi</option>
                                        <option value="3.5">(GMT+03:30) Tehran</option>
                                        <option value="4">(GMT+04:00) Abu Dhabi, Muscat</option>
                                        <option value="4">(GMT+04:00) Baku</option>
                                        <option value="4">(GMT+04:00) Yerevan</option>
                                        <option value="4.5">(GMT+04:30) Kabul</option>
                                        <option value="5">(GMT+05:00) Yekaterinburg</option>
                                        <option value="5">(GMT+05:00) Islamabad, Karachi, Tashkent</option>
                                        <option value="5.5">(GMT+05:30) Sri Jayawardenapura</option>
                                        <option value="5.5">(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi</option>
                                        <option value="5.75">(GMT+05:45) Kathmandu</option>
                                        <option value="6">(GMT+06:00) Almaty, Novosibirsk</option>
                                        <option value="6">(GMT+06:00) Astana, Dhaka</option>
                                        <option value="6.5">(GMT+06:30) Yangon (Rangoon)</option>
                                        <option value="7">(GMT+07:00) Bangkok, Hanoi, Jakarta</option>
                                        <option value="7">(GMT+07:00) Krasnoyarsk</option>
                                        <option value="8">(GMT+08:00) Beijing, Chongqing, Hong Kong, Urumqi</option>
                                        <option value="8">(GMT+08:00) Kuala Lumpur, Singapore</option>
                                        <option value="8">(GMT+08:00) Irkutsk, Ulaan Bataar</option>
                                        <option value="8">(GMT+08:00) Perth</option>
                                        <option value="8">(GMT+08:00) Taipei</option>
                                        <option value="9">(GMT+09:00) Osaka, Sapporo, Tokyo</option>
                                        <option value="9">(GMT+09:00) Seoul</option>
                                        <option value="9">(GMT+09:00) Yakutsk</option>
                                        <option value="9.5">(GMT+09:30) Adelaide</option>
                                        <option value="9.5">(GMT+09:30) Darwin</option>
                                        <option value="10">(GMT+10:00) Brisbane</option>
                                        <option value="10">(GMT+10:00) Canberra, Melbourne, Sydney</option>
                                        <option value="10">(GMT+10:00) Hobart</option>
                                        <option value="10">(GMT+10:00) Guam, Port Moresby</option>
                                        <option value="10">(GMT+10:00) Vladivostok</option>
                                        <option value="11">(GMT+11:00) Magadan, Solomon Is., New Caledonia</option>
                                        <option value="12">(GMT+12:00) Auckland, Wellington</option>
                                        <option value="12">(GMT+12:00) Fiji, Kamchatka, Marshall Is.</option>
                                        <option value="13">(GMT+13:00) Nuku'alofa</option>
                                    </select>
                                    <span className="errormsg">{whatsappSettingError.timeZone ? whatsappSettingError.timeZone : ""}</span>
                                </div>
                            </div><br>
                            </br>
                        </form>
                        <form action="" method="">
                            <div id="customAvailability" className="form-group row" >
                                <label htmlFor="customAvailability" className="col-md-4 col-form-label text-md-left">Custom Availability{whatsappSettings.alwaysOnline === 'Y'?"":<span>*</span>}</label>
                                <div className="col-md-2">
                                    <select id="day" className="form-control" disabled={whatsappSettings.alwaysOnline === 'Y' ? true : Mode === "VIEW" ? true : ""} onChange={handleOnchange} value={whatsappSettings.alwaysOnline === 'Y'?"":whatsappcustomTime?.day} >
                                    <option value="">Select Day</option>
                                        {days && days.map((e) => (
                                            <option key={e.key} value={e.value}>{e.description}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-2">
                                    <select className="form-control" id="fromTime" aria-invalid="false" disabled={whatsappSettings.alwaysOnline === 'Y' ? true : Mode === "VIEW" ? true : ""} value={whatsappSettings.alwaysOnline === 'Y'?"":whatsappcustomTime?.fromTime} onChange={handleOnchange}  >
                                    <option value="">Select From Time</option>
                                        {time && time.map((e) => (
                                            <option key={e.key} value={e.value}>{e.Description}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-2">
                                    <select className="form-control" id="toTime" aria-invalid="false" disabled={whatsappSettings.alwaysOnline === 'Y' ? true : Mode === "VIEW" ? true : ""} value={whatsappSettings.alwaysOnline === 'Y'?"":whatsappcustomTime?.toTime} onChange={handleOnchange}  >
                                    <option value="">Select To Time</option>
                                        {time && time.map((e) => (
                                            <option key={e.key} value={e.value}>{e.Description}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-2">
                                    <button type="button" id="addCustomAvailability" disabled={whatsappSettings.alwaysOnline === 'Y' ? true : Mode === "VIEW" ? true : ""} onClick={handleonClick} className="text-center btn btn-labeled btn-primary btn-sm">Add</button>
                                </div>
                            </div>
                        </form>
                        <br></br>
                        {customAvailability.length > 0 && <form action="" method="">
                            <div className="form-group row">
                                <div htmlFor="alwaysOnline" className="col-md-4 col-form-label text-md-left"></div>
                                <div className="col-md-4">
                                    {whatsappSettings.customAvailability && whatsappSettings.customAvailability.map((d) => (
                                        <Tag key={d.day} style={{ margin: "2px" }} closable onClose={() => handleCustomerAvaliablility(d.day)}>{d.day} {d.fromTime}-{d.toTime}</Tag>
                                    ))}
                                </div>
                            </div>
                        </form>}
                        <br></br>
                        <form>
                            <div className="form-group row" id="offline">
                                <label htmlFor="offlineDescription" className="col-md-3 col-form-label text-md-left">Description text when offline{whatsappSettings.alwaysOnline === 'Y'?"":<span>*</span>}</label>
                                <div className="col-md-8">
                                    <input type="text" id="offlineDescription" disabled={whatsappSettings.alwaysOnline === 'Y' ? true : Mode === "VIEW" ? true : ""} name="offlineDescription" value={whatsappSettings.offlineDescription} onChange={handleOnChange} className={`form-control ${whatsappSettingError.offlineDescription && "error-border"}`} autoComplete="off" aria-invalid="false" />
                                    <span className="errormsg">{whatsappSettingError.offlineDescription ? whatsappSettingError.offlineDescription : ""}</span>
                                </div>
                            </div>
                        </form>
                        <br></br>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SupportAvailability