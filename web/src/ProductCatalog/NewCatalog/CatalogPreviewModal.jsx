import React from 'react';
import Modal from 'react-modal';
import { RegularModalCustomStyles } from '../../common/util/util';
import CatalogView from './CatalogView';
import PlanServiceAddonAssetView from './PlanServiceAddonAssetView'

const CatalogPreviewModal = (props) => {

    const catalogData = props.data.catalogData;
    const isOpen = props.data.isOpen;
    const setIsOpen = props.handler.setIsOpen;

    return (
        <>
            <Modal isOpen={isOpen} onRequestClose={() => setIsOpen(false)} contentLabel="Worflow History Modal" style={RegularModalCustomStyles}>
                <div className="modal-dialog modal-lg cate-popup">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Catalog</h4>
                            <button type="button" className="close" onClick={() => setIsOpen(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="col">
                                <div className="card-box">
                                    <ul className="nav nav-tabs nav-bordered nav-justified">
                                        <li className="nav-item">
                                            <a role='tab' href="#catalog-tab" data-toggle="tab" aria-expanded="true" className="nav-link active">
                                                Catalog Overview
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a role='tab' href="#plan-tab" data-toggle="tab" className="nav-link">
                                                Plan
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a role='tab' href="#service-tab" data-toggle="tab" aria-expanded="false" className="nav-link">
                                                Services
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a role='tab' href="#addon-tab" data-toggle="tab" aria-expanded="false" className="nav-link">
                                                Add-ons
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a role='tab' href="#asset-tab" data-toggle="tab" aria-expanded="false" className="nav-link">
                                                Assets
                                            </a>
                                        </li>
                                    </ul>
                                    <div className="tab-content">
                                        <div className="tab-pane active" id="catalog-tab">
                                            <CatalogView
                                                data={{
                                                    viewData: catalogData,
                                                    source: 'Catalog'
                                                }}
                                            />
                                        </div>
                                        <div className="tab-pane" id="plan-tab">
                                            <PlanServiceAddonAssetView
                                                data={{
                                                    viewData: catalogData.plan,
                                                    source: 'Plan'
                                                }}
                                            />
                                        </div>
                                        <div className="tab-pane" id="service-tab">
                                            <PlanServiceAddonAssetView
                                                data={{
                                                    viewData: catalogData.services,
                                                    source: 'Service'
                                                }}
                                            />
                                        </div>
                                        <div className="tab-pane" id="addon-tab">
                                            <PlanServiceAddonAssetView
                                                data={{
                                                    viewData: catalogData.addons,
                                                    source: 'Addon'
                                                }}
                                            />
                                        </div>
                                        <div className="tab-pane" id="asset-tab">
                                            <PlanServiceAddonAssetView
                                                data={{
                                                    viewData: catalogData.assets,
                                                    source: 'Asset'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    )
}

export default CatalogPreviewModal