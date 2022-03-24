import React from "react";

export const QuickFilter = ({label = null, children, className = ''}) => {
    return <div className={"quick-filter " + className}>
        {label && <label>{label}:</label>}
        <div className="quick-filter__children">
            {children}
        </div>
    </div>;
};
