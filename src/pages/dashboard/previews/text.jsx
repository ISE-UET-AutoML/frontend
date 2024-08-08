import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

const TextPreview = ({ file, index, handleRemoveFile }) => {
  const [csvData, setCsvData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (file && file.name.endsWith('.csv')) {
      const reader = new FileReader();

      reader.onload = () => {
        Papa.parse(reader.result, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            setCsvData(result.data);
          },
          error: (err) => {
            setError(err.message);
          },
        });
      };

      reader.readAsText(file);
    }
  }, [file]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-800">{file.name}</h3>
        <button
          onClick={() => handleRemoveFile(index)}
          className="bg-red-500 text-white rounded px-2 py-1 text-sm hover:bg-red-600"
        >
          Remove
        </button>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {csvData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Object.keys(csvData[0]).map((key) => (
                  <th
                    key={key}
                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {csvData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Object.values(row).map((value, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-4 py-2 text-sm text-gray-500 whitespace-nowrap"
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600 text-sm">No data available</p>
      )}
    </div>
  );
};

export default TextPreview;
