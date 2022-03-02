import styled from 'styled-components';
import Logo from './Logo.js';
import Menu from './Menu.js';
import { Link } from "react-router-dom";

const StyledHeader = styled.div`
  padding-top: 16px;
  height: 100px;

  .Logo {
      margin: auto;
      width: 80px;
      cursor: pointer;
  }

`;


const Header = () => {

  return (
    <StyledHeader>
      <Link to="/">
        <Logo className="Logo" />
      </Link>
      <Menu className="Menu" />
    </StyledHeader>
  );
};

export default Header;
