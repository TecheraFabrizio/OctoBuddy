import RepoBranchPanel from '../components/panels/RepoBranchPanel';
import DeployPanel from '../components/panels/DeployPanel';
import TableExample from '../components/tables/MainExtensionsTable';
import { useState } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes

function App() {
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState('');
  const [reloadTrigger, setReloadTrigger] = useState(false);

  // Function to reload the data table
  const reloadData = () => {
    console.log('Reloading data table...');
    setReloadTrigger((prev) => !prev); // Toggle the reloadTrigger state
  };

  return (
    <>
      <RepoBranchPanel reloadData={reloadData} />
      <DeployPanel reloadData={reloadData} selectedRows={selectedRows} selectedWebsite={selectedWebsite} />

      <br />
      <TableExample
        setSelectedRows={setSelectedRows}
        reloadData={reloadTrigger}
      />
    </>
  );
}

// PropTypes validation for App component sub-components
RepoBranchPanel.propTypes = {
  reloadData: PropTypes.func.isRequired, // Expecting a function for reloadData
};

DeployPanel.propTypes = {
  reloadData: PropTypes.func.isRequired, // Expecting a function for reloadData
  selectedRows: PropTypes.array.isRequired, // Expecting an array for selectedRows
  selectedWebsite: PropTypes.string.isRequired,
};

TableExample.propTypes = {
  setSelectedRows: PropTypes.func.isRequired, // Expecting a function for setSelectedRows
  reloadData: PropTypes.bool.isRequired, // Expecting a boolean for reloadData
};

export default App;
