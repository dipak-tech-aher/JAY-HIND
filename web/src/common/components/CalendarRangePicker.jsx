import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

function CalendarRangePicker(props){
    // disabled some days until I fetched the data...
    const disabledDates = props?.data?.modifiers?.disabled
    const value = props?.data?.value
    const onChange = props?.handler?.onChange
    return (
        <div>
        <Calendar
            // Make calendar not viewable for previous months
            minDate={new Date()}
            // Whether to show two months 
            showDoubleView = {true}
            ActiveStartDate = {new Date()}
            returnValue={"range"}
            // settings for the calendar
            onChange={onChange} 
            value={value} 
            selectRange={true} 
            locale="en-US"
            autofocus={false}
            // disabled dates. Got data from channel manager
            tileDisabled={({ date, view }) => {
                if (view === 'month') {
                    return disabledDates && disabledDates.some(disabledDate =>
            date.getFullYear() === disabledDate.getFullYear() &&
            date.getMonth() === disabledDate.getMonth() &&
            date.getDate() === disabledDate.getDate()
            )
                } // Block day tiles only
                
            }
           }
        />
        </div>
    );
}

export default CalendarRangePicker;