import React, {useEffect, useRef, useState} from "react";

export const EditableField = ({value, classes = '', noEditClasses = '', onRename}) => {

  const [editable, setEditable] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editable) {
      inputRef.current.focus();
    } else if (currentValue !== value) {
      onRename(currentValue);
    }
  }, [editable]);

  const keyUpHandler = (event) => {
    if (event.keyCode === 13) {  // enter
      event.preventDefault();
      inputRef.current.blur();
    }
  };

  return (editable ? <div className={classes} style={{display: editable ? "" : "none"}}
                          onBlur={() => setEditable(false)}>
            <textarea className="form-control" value={currentValue} ref={inputRef}
                      placeholder="add note..."
                      onChange={(e) => setCurrentValue(e.target.value)}
                      onKeyDown={keyUpHandler}/></div> : <div className="rename-input" onClick={() => setEditable(true)}>
    <span className={value ? "" : "text-muted"}>{value.trim() || "kliknij by dodać notatke..."}</span>
  </div>);

};

export function LoadingSpinner() {
  return <div style={{margin: "0 auto", width: "fit-content"}}>
    <div className="spinner-border text-center mt-5" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>;
}
