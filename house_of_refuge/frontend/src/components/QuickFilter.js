import React from "react";

export const QuickFilter = ({label=null, children}) => {

  return <div className="quick-filter">
    {label && <label>{label}:</label>}
    <div className="quick-filter__children">
      {children}
    </div>
  </div>;
};
