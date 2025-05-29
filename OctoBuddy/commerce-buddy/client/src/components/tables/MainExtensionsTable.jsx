import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import PropTypes from "prop-types";

const columns = [
  {
    field: "id",
    headerName: "#",
    type: "number",
    width: 20,
  },
  { field: "repository", headerName: "Repository", width: 200 },
  { field: "branch", headerName: "Current Branch", width: 400 },
  { field: "vscode", headerName: "Open with IDE", width: 200 },
];

const TableExample = ({ setSelectedRows, reloadData }) => {
  const [localRepos, setLocalRepos] = useState([]);
  const [rows, setRows] = useState([]);

  // Function to check if repository exists
  const reloadDataTable = async () => {
    try {
      const response = await fetch(`/api/local-repos`);
      if (!response.ok) throw new Error("Failed to fetch repositories");

      const result = await response.json();
      setLocalRepos(result);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    reloadDataTable(); // Fetch repositories initially
  }, [reloadData]);

  useEffect(() => {
    if (localRepos.length > 0) {
      const newRows = localRepos.map((localRepo, index) => ({
        id: index,
        repository: localRepo.repo,
        branch: localRepo.currentBranch, // You can fill in branch information here
      }));
      setRows(newRows);
    }
  }, [localRepos]);

  const handleSelectionModelChange = (ids) => {
    const selectedRowData = rows.filter((row) => ids.includes(row.id));
    setSelectedRows(selectedRowData);
  };

  return (
    <div>
      <div style={{ height: "100%", width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10]}
          checkboxSelection
          onRowSelectionModelChange={handleSelectionModelChange} // Use onRowSelectionModelChange
        />
      </div>
    </div>
  );
};

// Define propTypes for the component
TableExample.propTypes = {
  setSelectedRows: PropTypes.func.isRequired,
  reloadData: PropTypes.func.isRequired, // New prop for reloading data
};

export default TableExample;
