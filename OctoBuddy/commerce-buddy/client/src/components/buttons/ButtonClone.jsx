import React from "react";
import { Button } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import PropTypes from "prop-types"; // Import PropTypes

const ButtonClone = ({ selectedRepo, reloadData }) => {
  const handleClone = () => {
    if (selectedRepo) {
      // Perform the clone action here.
      // For example, making a request to your server to start the cloning process.
      console.log(`Cloning repository: ${selectedRepo}`);

      // Here you can make an API call to your server to trigger the clone
      fetch(`/api/clone-repository?repo=${selectedRepo}`)
        .then((response) => response)
        .then((data) => {
          console.log("Clone response:", data);
          reloadData();
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

ButtonClone.propTypes = {
  selectedRepo: PropTypes.string, // or PropTypes.object if it's an object
};

export default ButtonClone;
