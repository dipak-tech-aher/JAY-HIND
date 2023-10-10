import React from 'react';
import moment from 'moment';
import { USNumberFormat } from '../common/util/util';

const ChargeListView = (props) => {

	const chargeList = props.data.chargeList
	const setIsOpen = props.handler.setIsOpen
	const setChargeData = props.handler.setChargeData
	const setMode = props.handler.setMode
	const setOldChargeName = props.handler.setOldChargeName
	const isTerminated = props.data.isTerminated
	return (
		<>
			{
				chargeList && !!chargeList.length &&
				<div className="data-scroll1" style={{ width: "100%", maxHeight: "350px", border: "1px solid #ccc", overflowX: "hidden", overflowY: "auto", whiteSpace: "nowrap" }}>
					{
						chargeList && !!chargeList.length && chargeList.map((charge, index) => (
							
							<>
							{console.log('chargecharge', charge)}
								<div id="charges-done" key={index}>
									<fieldset className="scheduler-border p-10">
										<div className="col-12 row ml-1">
											<div className="col-md-2 pl-0">
												<div className="form-group">
													<label htmlFor="Surname" className="col-form-label">Charge Name</label>
													<p>{charge?.chargeName}</p>
												</div>
											</div>
											<div className="col-md-2">
												<div className="form-group">
													<label htmlFor="Surname" className="col-form-label">Charge Type</label>
													<p>{charge?.chargeTypeDesc}</p>
												</div>
											</div>
											<div className="col-md-2">
												<div className="form-group">
													<label htmlFor="Surname" className="col-form-label">Currency</label>
													<p>{charge?.currencyDesc}</p>
												</div>
											</div>
											<div className="col-md-2">
												<div className="form-group">
													<label htmlFor="Surname" className="col-form-label">Charge Amount</label>
													<p>{Number(charge?.chargeAmount).toFixed(2)}</p>
												</div>
											</div>
											<div className="col-md-2">
												<div className="form-group">
													<label htmlFor="Surname" className="col-form-label">Frequency</label>
													<p>{charge?.frequencyDesc ? charge?.frequencyDesc?.description : charge.chargeType === 'CC_NRC' ? 'One Time' : '-'}</p>
												</div>
											</div>
											<div className="col-md-2">
												<div className="form-group">
													<label htmlFor="Surname" className="col-form-label">Prorated</label>
													<p>{charge?.prorated === 'Y' ? 'Yes' : charge?.prorated === 'N' ? 'No' : ''}</p>
												</div>
											</div>											
										</div>
										<div className="col-12 row ml-0">
											<div className="col-md-2">
												<div className="form-group">
													<label htmlFor="Surname" className="col-form-label">Billing Start Cycle</label>
													<p>{charge?.billingEffective}</p>
												</div>
											</div>
											<div className="col-md-2">
												<div className="form-group">
													<label htmlFor="Surname" className="col-form-label">Advance Charge</label>
													<p>{charge?.advanceCharge === 'Y' ? 'Yes' : charge?.advanceCharge === 'N' ? 'No' : ''}</p>
												</div>
											</div>
											<div className="col-md-2">
												<div className="form-group">
													<label htmlFor="Surname" className="col-form-label">Charge Upfront</label>
													<p>{charge?.chargeUpfront === 'Y' ? 'Yes' : charge?.chargeUpfront === 'N' ? 'No' : ''}</p>
												</div>
											</div>
											<div className="col-md-2">
												<div className="form-group">
													<label htmlFor="Surname" className="col-form-label">Start Date</label>
													<p>{moment(charge?.startDate).format('DD MMM YYYY')}</p>
												</div>
											</div>
											<div className="col-md-2">
												<div className="form-group">
													<label htmlFor="Surname" className="col-form-label">End Date</label>
													<p>{charge?.endDate ? moment(charge?.endDate).format('DD MMM YYYY') : ''}</p>
												</div>
											</div>
											{/* <div className="col-md-2">
												<div className="form-group">
													<label htmlFor="Surname" className="col-form-label">Changes Applied</label>
													<p>{charge?.changesApplied === 'Y' ? 'Yes' : 'No'}</p>
												</div>
											</div> */}
										</div>
										<div className="col-12 p-1">
											<div className="d-flex justify-content-end">
												<button type="button" className="btn btn-primary btn-sm waves-effect waves-light ml-2"
													disabled={isTerminated}
													onClick={() => {
														setChargeData(charge)
														setIsOpen(true)
														setMode('edit')
														setOldChargeName(index)
													}}
												>Edit</button>
											</div>
										</div>
									</fieldset>
								</div>
							</>
						))
					}
				</div>
			}
		</>
	)
}

export default ChargeListView;