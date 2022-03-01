import styled from 'styled-components';
import Logo from './Logo.js';
import Menu from './Menu.js';

const StyledHeader = styled.div`
  padding-top: 16px;
  height: 100px;

  .Logo {
      margin: auto;
      width: 80px;
      cursor: pointer;
  }

`;


const Header = ({ setPage }) => {

    return (
        <StyledHeader>
            <Logo className="Logo" onClick={() => setPage(0)} />
            <Menu className="Menu" />
        </StyledHeader>
    );
};

export default Header;
