import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Logo from './Logo.js';
import Menu from './Menu.js';
import { Link } from "react-router-dom";

const LogoWrapper = styled.div`
  position: ${p => p.sticky ? 'fixed' : 'absolute'}; 
  background-color: ${p => p.sticky ? '#F7F7F7' : 'transparent'}; 
  top: 0;
  width: 100%;
  height: 38px;

  > a {
    display: block;
    margin: auto; 
    margin-top: ${p => p.sticky ? '5px' : '16px'}; 
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
    <>
      <LogoWrapper sticky={scrollPosition > 90}>
        <Link to="/">
          <Logo compact={scrollPosition > 90} />
        </Link>
      </LogoWrapper>
      <Menu />
    </>
  );
};

export default Header;
