// src/components/MetroLogo.jsx
import React from 'react';
import { SvgIcon } from '@mui/material'; // Optional: Use SvgIcon for consistency if desired

const MetroLogo = (props) => {
  // Pass any additional props like sx to the underlying SVG or SvgIcon
  return (
    // You can wrap with SvgIcon for potential MUI integration benefits,
    // or just return the SVG directly. Let's use SvgIcon.
    <SvgIcon
      component="svg" // Tell SvgIcon to render an SVG tag
      viewBox="0 0 210.51 44.56" // Crucial for scaling
      titleAccess="Metro Markets Logo" // Accessibility
      {...props} // Spread any props like sx, fontSize, color etc.
    >
        {/* Paste the SVG content directly here */}
        <g>
          <path d="M9.33,1.48l5.65,10.06-7.12,32.28H0L9.33,1.48Z" style={{ fill: '#002575' }} />
          <path d="M37.34,23.45s3.3-5.01,7.06-7.35l6.44,27.59h-8.96l-4.54-20.25Z" style={{ fill: '#002575' }} />
          <path d="M14.71,24.11l2.34-9.79,7.92,13.4S30.51,10.87,43.34,1.3l2.68,10.23s-13.34,7.46-20.35,30.8l-10.97-18.21Z" style={{ fill: '#d60812' }} />
        </g>
        <path d="M83.64,6.9h-17.23v10.33h16.73v6.1h-16.73v14.36h17.23v6.1h-23.71V.81h23.71v6.09Z" style={{ fill: '#002575' }} />
        <path d="M110.47,6.9v36.88h-6.48V6.9h-9.88V.8h26.22v6.1h-9.85Z" style={{ fill: '#002575' }} />
        <path d="M146.22,25.47l13.3,18.32h-7.93l-12.27-17.59h-1.17v17.59h-6.48V.81h7.6c5.68,0,9.78,1.07,12.3,3.2,2.76,2.33,4.3,5.8,4.18,9.41.07,2.84-.86,5.62-2.62,7.85-1.73,2.18-4.17,3.67-6.9,4.2M138.15,20.54h2.06c6.14,0,9.21-2.35,9.21-7.04,0-4.4-2.99-6.6-8.96-6.6h-2.31v13.64Z" style={{ fill: '#002575' }} />
        <path d="M165.57,22.1c-.06-5.9,2.35-11.55,6.65-15.59C176.42,2.26,182.18-.09,188.15,0c5.93-.08,11.63,2.3,15.75,6.57,4.29,4.12,6.68,9.83,6.6,15.78.1,5.94-2.3,11.65-6.62,15.73-8.54,8.36-22.09,8.68-31.01.72-4.86-4.25-7.29-9.82-7.29-16.7M172.12,22.18c-.14,4.41,1.6,8.67,4.79,11.72,6.21,6.16,16.24,6.12,22.41-.08,3.06-3.05,4.73-7.21,4.65-11.52.11-4.31-1.55-8.47-4.59-11.53-6.26-6.23-16.37-6.23-22.63,0-3.05,3-4.72,7.13-4.62,11.41" style={{ fill: '#002575' }} />
    </SvgIcon>
  );
};

export default MetroLogo;