const CustomTripleSection = (props) => {

    const { footerOne,footerTwo, footerThree,valueOne, ValueTwo,ValueThree} = props.data

    return (
        <>
            <div className="card-body chat-mon">
                <div className="row">
                    <div className="col-md-4">
                        <div className="time-left text-center">
                            <h3>{valueOne}</h3>
                            <p>{footerOne}</p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="time-left text-center">
                            <h3>{ValueTwo}</h3>
                            <p>{footerTwo}</p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="time-left text-center">
                            <h3>{ValueThree}</h3>
                            <p>{footerThree}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CustomTripleSection