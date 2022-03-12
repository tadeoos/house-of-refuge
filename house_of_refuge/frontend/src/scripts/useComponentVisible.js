import { useState, useEffect, useRef } from 'react';

export default function useComponentVisible() {
    const [miniMenuOpened, setMiniMenuOpened] = useState(false);
    const ref = useRef(null);

    const handleHideDropdown = (event) => {
      if (event.key === "Escape") {
        setMiniMenuOpened(false);
      }
    };

    const handleClickOutside = event => {
        if (ref.current && !ref.current.contains(event.target)) {
            setMiniMenuOpened(false);
        }
    };

    useEffect(() => {
        document.addEventListener("keydown", handleHideDropdown, true);
        document.addEventListener("click", handleClickOutside, true);
        return () => {
            document.removeEventListener("keydown", handleHideDropdown, true);
            document.removeEventListener("click", handleClickOutside, true);
        };
    });

    return { ref, miniMenuOpened, setMiniMenuOpened };
}