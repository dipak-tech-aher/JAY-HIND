import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { AppContext } from "../../AppContext";
import store from "../../assets/images/store.svg";
import { get } from "../../common/util/restUtil";
import { properties } from "../../properties";

const ApplicationDataConfiguration = (props) => {
  const { appConfig } = useContext(AppContext);
  const [getTotalCount, setGetTotalCount] = useState();
  const [getPercentage, setPercentage] = useState(0);
  const history = useHistory();
  const screenInfo = props?.children?.props?.props?.screenInfo;
  let type;
  if (screenInfo === "Business Unit Data Configuration") {
    type = "department";
  } else if (screenInfo === "Role Data Configuration") {
    type = "role";
  } else if (screenInfo === "User Data Configuration") {
    type = "user";
  }

  const childGroup = () => {
    return React.Children.map(props.children, (child) => {
      return React.cloneElement(child, {
        totalCount: getTotalCount,
      });
    });
  };

  useEffect(() => {
    get(properties.MASTER_API + "/get-total-count")
      .then((res) => {
        if (res.status === 200) {
          let l = 0;
          for (let t in res.data) {
            if (res.data[t] > 0) {
              l = l + 1;
            }
          }
          const pt = ((l / 5) * 100).toFixed(2);
          setGetTotalCount(res.data);
          setPercentage(pt);
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally();
  }, []);

  return (
    <div className="cnt-wrapper">
      <div className="card-skeleton">
        <div className="customer-skel">
          <div className="cmmn-skeleton">
            <div className="row">
              <div className="skel-configuration-settings">
                <div className="col-md-8">
                  <div className="skel-config-top-sect">
                    <h2>{screenInfo}</h2>
                    <p>
                      {
                        "Follow the setup wizard that will guide you through the remaining steps to complete the configuration setup."
                      }
                    </p>
                    {screenInfo &&
                      screenInfo !== "Application Data Configuration" &&
                      ["department", "role", "user"].includes(type) && (
                        <>
                          <span className="skel-step-styl mb-3">
                            est. 5 minutes for 1{" "}
                            <span className="material-icons skel-config-active-tick">
                              check_circle
                            </span>
                          </span>
                          <p>
                            You can create{" "}
                            <strong>
                              max{" "}
                              {type === "department"
                                ? appConfig?.maxEntityLimit
                                : type === "role"
                                ? appConfig?.maxRolesLimit
                                : appConfig?.maxUserLimit}{" "}
                              {type}
                            </strong>
                            . If you need to increase more {type} go to{" "}
                            <span
                              onClick={() => {
                                history.push(
                                  `${process.env.REACT_APP_BASE}/configuration-settings`
                                );
                              }}
                              className="skel-txt-underline"
                            >
                              <strong>settings</strong>
                            </span>{" "}
                            and increase the role.
                          </p>
                        </>
                      )}
                    <div className="skel-config-progress">
                      <div className="progress-status progress-moved">
                        <div
                          className="progress-bar"
                          style={{ width: getPercentage + "%" }}
                        ></div>
                      </div>
                      <span>{getPercentage}% Completed</span>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <img src={store} alt="" className="img-fluid" />
                </div>
              </div>
            </div>
            {childGroup()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDataConfiguration;
