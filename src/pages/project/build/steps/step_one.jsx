import React, { useEffect, useRef, useState } from 'react';
import Dashboard from 'src/pages/dashboard';

const StepOne = ({ name, email, updateFields }) => {
	return <Dashboard updateFields={updateFields} />;
};

export default StepOne;
