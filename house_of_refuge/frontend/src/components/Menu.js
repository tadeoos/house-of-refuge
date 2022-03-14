import styled from 'styled-components';
import LogoFB from './LogoFB.js';
import MenuIcon from './MenuIcon.js';
import { Link } from "react-router-dom";
import TextMultiLang from '../components/TextMultiLang';
import useComponentVisible from '../scripts/useComponentVisible';

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  min-height: 32px;
  display: block;
  padding: 12px;
  border-radius: 14px;
  transition: all 0.3s;

  :hover {
      background-color: #EDEDED;
      color: inherit;
   }
  
`;

const Button = styled.button`
    position: fixed;
    top: 4px;
    right: 36px;
    border: none;
    padding: 0;
    margin: 0;
    background-color: transparent;
    margin-right: 10px;
    transition: all 0.3s;

    :hover {
        opacity: 0.7;
    }

    @media (max-width: 600px) {
     left: 12px;
    }
`;

const ExtrernalLink = styled.a`
    position: fixed;
    top: 4px;
    right: 16px;
    border: none;
    padding: 0;
    margin: 0;
    background-color: transparent;
    transition: all 0.3s;

    :hover {
        opacity: 0.7;
    }

    @media (max-width: 600px) {
        right: 12px;
    }
`;


const MiniMenu = styled.div`
   position: fixed;
   min-width: 220px;
   background-color: white;
   top: 42px;
   right: 14px;
   border-radius: 22px;
   padding: 8px;
   -webkit-box-shadow: 0px 5px 28px 0px rgba(0, 0, 0, 0.14);
    -moz-box-shadow: 0px 5px 28px 0px rgba(0, 0, 0, 0.14);
    box-shadow: 0px 5px 28px 0px rgba(0, 0, 0, 0.14);

    @media (max-width: 600px) {
        left: 14px;
    }

`;


const Menu = () => {
    const { ref, miniMenuOpened, setMiniMenuOpened } = useComponentVisible(true);

    return (
        <>
            <Button onClick={() => setMiniMenuOpened(!miniMenuOpened)}>
                <MenuIcon />
            </Button>
            {miniMenuOpened && <MiniMenu ref={ref}>
                <StyledLink to="/privacy" onClick={() => setMiniMenuOpened(!miniMenuOpened)}>
                    <TextMultiLang
                        primaryText="Polityka prywatności"
                        secondaryText="політика конфіденційності"
                    />
                </StyledLink>
                <StyledLink to="/edit" onClick={() => setMiniMenuOpened(!miniMenuOpened)}>
                    <TextMultiLang
                        primaryText="Edycja danych"
                        secondaryText="редагувати дані"
                    />
                </StyledLink>
            </MiniMenu>}
            <ExtrernalLink
                target="_blank"
                rel="noopener noreferrer"
                href='https://www.facebook.com/groups/zasobygrupa'
            >
                <LogoFB />
            </ExtrernalLink>
        </>
    );
};

export default Menu;
