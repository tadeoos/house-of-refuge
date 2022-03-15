import { useState, useEffect, useRef } from 'react';

export default function useComponentVisible() {
    const [miniMenuOpened, setMiniMenuOpened] = useState(false);
    const menu = useRef(null);
    const button = useRef(null);

    const handleHideDropdown = (event) => {
      if (event.key === "Escape") {
        setMiniMenuOpened(false);
      }
    };

    const handleClick = event => {
        if (menu.current && !menu.current.contains(event.target)) {
            setMiniMenuOpened(false);
        } else if (button.current && button.current.contains(event.target) ){
            setMiniMenuOpened(!miniMenuOpened);
        }
    };

    useEffect(() => {
        document.addEventListener("keydown", handleHideDropdown, true);
        document.addEventListener("click", handleClick, true);
        return () => {
            document.removeEventListener("keydown", handleHideDropdown, true);
            document.removeEventListener("click", handleClick, true);
        };
    });

    return { menu, button, miniMenuOpened, setMiniMenuOpened };
}