import React, { useState, useRef, useContext, useEffect } from "react";
import { Dropdown, Form } from 'react-bootstrap';
import { OpsDashboardContext } from "../../AppContext";

const ColumnFilterComponent = (props) => {
    const { data: parentData } = useContext(OpsDashboardContext);
    const { data, handlers } = props;
    const { sourceColumns, type } = data;
    const { setColumns } = handlers;
    const { meOrMyTeam } = parentData;

    const formRef = useRef();
    const [showFilter, setShowFilter] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState([...sourceColumns]);
    const showFilterVisible = () => setShowFilter(!showFilter)

    const handleClear = (event) => {
        event.preventDefault();
        setSelectedColumns([]);
        setColumns([...sourceColumns]);
        setShowFilter(false);
    }

    useEffect(() => {
        setColumns([...sourceColumns]);
    }, [meOrMyTeam])

    const onSubmit = (e) => {
        e.preventDefault();
        if (selectedColumns.length) {
            setColumns([...sourceColumns.filter(x => selectedColumns.map(y => y.uid).includes(x.uid))])
        }
        else {
            setColumns([...sourceColumns]);
        }
        setShowFilter(false);
    }

    return (
        <Dropdown className="skel-filter-dropdown" show={showFilter} onToggle={showFilterVisible}>
            <Dropdown.Toggle variant="success" onClick={showFilterVisible}>
                <a><span className="material-icons">view_column</span></a>
            </Dropdown.Toggle>
            <Dropdown.Menu className="skel-ul-data-filter">
                <Form className="mt-1 filter-form" ref={formRef} onSubmit={onSubmit}>
                    <div className="form-group">
                        <label htmlFor="apptname" className="filter-form-label control-label">Columns</label>
                        {sourceColumns?.map((column) => (
                                    /**  Bug ID - IS_ID_166, IS_ID_167  - Added type in condition */
                            <div key={column.uid} className={`custom-control col-filter custom-checkbox ${meOrMyTeam !== "MyTeam" && type!=='ASSIGNED' && column.id === 'oCurrUserDesc' ? 'd-none' : ''}`}>
                                <input type="checkbox" id={column.uid} name={column.Header}
                                    className="custom-control-input"
                                    style={{ cursor: "pointer" }}
                                    checked={selectedColumns.find(x => x.uid === column.uid) ? true : false}
                                    onChange={(e) => {
                                        console.log('selected ', e.target.checked)

                                        let columnIndex = sourceColumns.findIndex(x => x.uid === e.target.id);
                                        if (e.target.checked) {
                                            selectedColumns.push(sourceColumns[columnIndex]);
                                            setSelectedColumns([...selectedColumns])
                                        } else {
                                            setSelectedColumns([...selectedColumns.filter(x => x.uid !== e.target.id)])
                                        }
                                    }}
                                />
                                <label className="custom-control-label" htmlFor={column.uid}>{column.Header}</label>
                            </div>
                        ))}
                    </div>
                    <div className="form-group skel-filter-frm-btn">
                        <button className="skel-btn-cancel" onClick={handleClear}>
                            Clear
                        </button>
                        <button className="skel-btn-submit" onClick={() => { formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })) }}>
                            Apply
                        </button>
                    </div>
                </Form>
            </Dropdown.Menu>
        </Dropdown>
    )
}

export default ColumnFilterComponent;