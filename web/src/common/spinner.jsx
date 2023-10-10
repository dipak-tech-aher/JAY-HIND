import React, { useState } from "react";

let showSpinner;
let hideSpinner;
const Spinner = () => {
  const [spinnerCount, setSpinnerCount] = useState(0);
  showSpinner = () => {
    setSpinnerCount((prevState) => {
     return prevState + 1;
    });
  };
  hideSpinner = () => {
    setSpinnerCount((prevState) => {
      if (prevState > 0) return prevState - 1;
      else return 0;
    });
  };
  return (
    <div
      id="loading"
      style={{
        backgroundColor: '#fff', display: spinnerCount <= 0 ? "none" : "block", opacity: 0.8, zIndex: 999999,
        position: "fixed", top: 0, left: 0, bottom: 0, right: 0
      }}
    >
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        <div style={{ left: "50%", top: "50%", position: "absolute", transform: "translate(-50%, -50%)" }}>
          <div className="mainloader">
            <svg viewBox="0 0 80 80">
              <circle id="test" cx="40" cy="40" r="32"></circle>
            </svg>
          </div>
          <div className="mainloader maintriangle">
            <svg viewBox="0 0 86 80">
              <polygon points="43 8 79 72 7 72"></polygon>
            </svg>
          </div>

          <div className="mainloader">
            <svg viewBox="0 0 80 80">
              <rect x="8" y="8" width="64" height="64"></rect>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Spinner;
export { showSpinner, hideSpinner };
