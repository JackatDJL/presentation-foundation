"use server";

import React from "react";

const EnvironmentVariables = async () => {
  return (
    <div>
      <h1>Environment Variables</h1>
      <ul>
        {Object.entries(process.env).map(([key, value]) => (
          <li key={key}>
            <strong>{key}:</strong> {value}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EnvironmentVariables;
