import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Logo from './Logo.js';
import Menu from './Menu.js';
import { Link } from "react-router-dom";

const StyledHeader = styled.div`
  padding-top: ${p => p.sticky ? '2px' : '16px'};
  position: ${p => p.sticky ? 'fixed' : 'absolute'}; 
  background-color: ${p => p.sticky ? '#F7F7F7' : 'transparent'}; 
  padding-bottom: 7px;
  top: 0;
  width: 100%;

  > a {
    display: block;
    margin: auto; 
    width:  ${p => p.sticky ? '105px' : '90px'};
  }
 
`;

const Header = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const handleScroll = () => {
    setScrollPosition(window.pageYOffset);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <StyledHeader sticky={scrollPosition > 90}>
      <Link to="/">
        <Logo compact={scrollPosition > 90} />
      </Link>
      <Menu   />
    </StyledHeader>
  );
};

export default Header;
