// ProgressBar.jsx
import React from "react";
import PropTypes from "prop-types";

function ProgressBar({ progress }) {
  return (
    <div style={{ width: "100%", backgroundColor: "#e0e0e0", borderRadius: "5px" }}>
      <div
        style={{
          width: `${progress}%`,
          height: "20px",
          backgroundColor: "#3b5998",
          borderRadius: "5px",
          transition: "width 0.5s ease-in-out",
        }}
      />
    </div>
  );
}

ProgressBar.propTypes = {
  progress: PropTypes.number.isRequired, // Expecting a number for progress
};

export default ProgressBar;