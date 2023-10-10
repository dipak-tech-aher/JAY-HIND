import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';

const ChatQueue = (props) => {
    return (
        <div id="main">
            <div className="container">
                <div className="accordion" id="faq">
                    <div classNameName="card">
                        <div classNameName="card-header" id="faqhead1">
                            <a  classNameName="btn btn-header-link" data-toggle="collapse" data-target="#faq1"
                                aria-expanded="true" aria-controls="faq1">Chat Queue by Minutes</a> <div classNameName="filter2">
                                <select classNameName="form-select" aria-label="Default select example">
                                    <option defaultValue={'Filter'}>Filter</option>
                                    <option value="1">Whatsapp</option>
                                    <option value="2">Facebook</option>
                                    <option value="3">IVR</option>
                                </select>
                            </div>
                        </div>

                        <div id="faq1" classNameName="collapse show" aria-labelledby="faqhead1" data-parent="#faq">
                            <div classNameName="card-body">
                                <div classNameName="faq-chat card border mb-1" style={{ zIndex: "21" }}>
                                    <div classNameName="p-1">
                                        <div classNameName="media">
                                            <div classNameName="media-body overflow-hidden">
                                                <h3 classNameName="mb-0 font-weight-bold" style={{ float: "left" }}><a  >16</a></h3>
                                                <p classNameName="text-truncate font-size-14 mb-1 pl-2 pt-1">Total Chat Queue</p>

                                            </div>

                                        </div>
                                    </div>

                                    <div classNameName="p-1 border-top">
                                        <div classNameName="row p-0">
                                            <div classNameName="col-3">
                                                <div classNameName="text-center">
                                                    <p classNameName="mb-2 text-truncate font-weight-bold"> {'>'} 10 Min</p>
                                                    <h4 classNameName="text-dark font-weight-bold"><a  >2</a></h4>
                                                </div>
                                            </div>
                                            <div classNameName="col-3">
                                                <div classNameName="text-center">
                                                    <p classNameName="mb-2 text-truncate font-weight-bold">5 - 10 Min</p>
                                                    <h4 classNameName="text-dark font-weight-bold"><a >2</a></h4>
                                                </div>
                                            </div>
                                            <div classNameName="col-3">
                                                <div classNameName="text-center">
                                                    <p classNameName="mb-2 text-truncate font-weight-bold">2 -5 Min</p>
                                                    <h4 classNameName="text-dark font-weight-bold"><a >4</a></h4>
                                                </div>
                                            </div>
                                            <div classNameName="col-3">
                                                <div classNameName="text-center">
                                                    <p classNameName="mb-2 text-truncate font-weight-bold">1 -2 Min</p>
                                                    <h4 classNameName="text-dark font-weight-bold"><a >6</a></h4>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default ChatQueue;