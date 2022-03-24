import React from 'react';
import {useState, useEffect} from 'react';
import styled from 'styled-components';
import Logo from './Logo.js';
import Menu from './Menu.js';
import {Link} from "react-router-dom";

const LogoWrapper = styled.div`
  width: 100%;
  visibility: ${p => p.sticky ? 'hidden' : 'visible'};

  > a {
    display: block;
    margin: auto;
    margin-top: ${p => p.sticky ? '5px' : '16px'};
    width: ${p => p.sticky ? '105px' : '90px'};
  }
`;

const CompactLogoWrapper = styled.div`
  position: fixed;
  background-color: #F7F7F7;
  top: 0;
  left: 0;
  width: 100%;

  display: flex;
  align-items: center;
  height: 40px;

  > a {
    display: block;
    margin: auto;
    width: 105px;
  }
`;

const Header = () => {
    const [scrollPosition, setScrollPosition] = useState(0);
    const handleScroll = () => {
        setScrollPosition(window.pageYOffset);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, {passive: true});
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const showCompactLogoWrapper = scrollPosition > 90;
    return (
        <>
            <LogoWrapper sticky={showCompactLogoWrapper}>
                <Link to="/">
                    <Logo compact={false}/>
                </Link>
            </LogoWrapper>
            {showCompactLogoWrapper &&
                <CompactLogoWrapper>
                    <Link to="/">
                        <Logo compact={true}/>
                    </Link>
                </CompactLogoWrapper>
            }
            <Menu/>
        </>
    );
};

export default Header;
