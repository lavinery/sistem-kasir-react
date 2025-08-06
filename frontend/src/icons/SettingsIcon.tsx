// src/icons/SettingsIcon.tsx
import React from 'react';

const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 8a4 4 0 100 8 4 4 0 000-8z" />
    <path fillRule="evenodd" d="M2 12a10 10 0 1120 0 10 10 0 01-20 0zm10-8a8 8 0 100 16 8 8 0 000-16z" clipRule="evenodd" />
  </svg>
);

export default SettingsIcon;
