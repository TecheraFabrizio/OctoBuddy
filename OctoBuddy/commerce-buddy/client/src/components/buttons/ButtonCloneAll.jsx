import React from "react";
import { Button } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import PropTypes from "prop-types"; // Import PropTypes

const ButtonClone = ({ selectedRepo, reloadData }) => {
  const handleClone = () => {
    if (selectedRepo) {
      // Perform the clone action here.
      console.log(`Cloning repository: ${selectedRepo}`);

      fetch("/api/clone", {
        method: "POST",
        body: JSON.stringify({ repo: selectedRepo }),
        headers: { "Content-Type": "application/json" },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Clone response:", data);
          reloadData(); // Call reloadData after clone success
        })
        .catch((error) => {
          console.error("Error cloning repository:", error);
        });
    } else {
      console.log("No repository selected.");
    }
  };

  return (
    <div>
      <Button
        startIcon={<GitHubIcon />}
        size="large"
        color="primary"
        variant="contained"
        onClick={handleClone}
      >
        Clone
      </Button>
    </div>
  );
};

// Add propTypes for both props
ButtonClone.propTypes = {
  selectedRepo: PropTypes.string, // Declare the expected prop type for selectedRepo
  reloadData: PropTypes.func.isRequired, // Declare the expected prop type for reloadData
};

export default ButtonClone;