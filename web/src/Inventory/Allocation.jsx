/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import { properties } from "../properties";
import { post } from "../common/util/restUtil";

const Allocation = (props) => {
    return (
        <div class="tab-pane fade skel-tabs-role" id="Helpdesktab" role="tabpanel" aria-labelledby="Helpdesk-tab">
        <span>Allocation</span>
        <div class="skel-role-base">
           <div class="skel-tabs-role-config px-2">
              <div class="p-2 col-12">
                 <div class="p-4 bg-light text-center ">
                    <h4> You are just creating the product, hence you don't have any allocation history.</h4>
                 </div>
              </div>
           </div>
        </div>
     </div>
    )
}

export default Allocation;