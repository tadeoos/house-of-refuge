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

const MainMenu = styled.div`
  position: fixed;
  top: 6px;
  right: 6px;
  display: flex;
  justify-content: right;
`;

const Button = styled.button`
    border: none;
    padding: 0;
    margin: 0;
    background-color: transparent;
    margin-right: 16px;
    transition: all 0.3s;

    :hover {
        opacity: 0.7;
    }
`;

const ExtrernalLink = styled.a`
    border: none;
    padding: 0;
    margin: 0;
    background-color: transparent;
    margin-right: 10px;
    transition: all 0.3s;

    :hover {
        opacity: 0.7;
    }
`;


const MiniMenu = styled.div`
   position: fixed;
   min-width: 220px;
   background-color: white;
   top: 42px;
   margin-right: 14px;
   border-radius: 22px;
   padding: 8px;
   -webkit-box-shadow: 0px 5px 28px 0px rgba(0, 0, 0, 0.14);
    -moz-box-shadow: 0px 5px 28px 0px rgba(0, 0, 0, 0.14);
    box-shadow: 0px 5px 28px 0px rgba(0, 0, 0, 0.14);

`;


const Menu = () => {
    const { ref, miniMenuOpened, setMiniMenuOpened } = useComponentVisible(true);

    return (
        <MainMenu>
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
            </MiniMenu>}
            <ExtrernalLink
                target="_blank"
                rel="noopener noreferrer"
                href='https://www.facebook.com/groups/zasobygrupa'
            >
                <LogoFB />
            </ExtrernalLink>
        </MainMenu>
    );
};

export default Menu;
