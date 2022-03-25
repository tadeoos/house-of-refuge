import styled from 'styled-components';
import LogoFB from './LogoFB.js';
import MenuIcon from './MenuIcon.js';
import {Link} from "react-router-dom";
import TextMultiLang from '../components/TextMultiLang';
import useComponentVisible from '../scripts/useComponentVisible';
import {useContext, useEffect, useState} from "react";
import {CmsResource} from "./CMS";
import LangSwitch, {LANGS} from "./LangSwitch";
import {HomeContext} from "../scripts/home";

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
  border: none;
  padding: 0;
  margin: 0;
  background-color: transparent;
  transition: all 0.3s;

  :hover {
    opacity: 0.7;
  }

  @media (max-width: 600px) {
    left: 10px;
    right: initial;
  }
`;

const MenuWrapper = styled.div`
  position: fixed;
  display: flex;
  gap: 10px;
  top: 5px;
  right: 52px;
`;

const ExtrernalLink = styled.a`
  position: fixed;
  top: 5px;
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
  max-width: 220px;
  background-color: white;
  top: 42px;
  right: 14px;
  border-radius: 22px;
  padding: 8px;
  z-index: 1000;
  -webkit-box-shadow: 0px 5px 28px 0px rgba(0, 0, 0, 0.14);
  -moz-box-shadow: 0px 5px 28px 0px rgba(0, 0, 0, 0.14);
  box-shadow: 0px 5px 28px 0px rgba(0, 0, 0, 0.14);

  @media (max-width: 600px) {
    left: 14px;
  }
`;


const Menu = () => {
    const {menu, button, miniMenuOpened, setMiniMenuOpened} = useComponentVisible(true);
    const context = useContext(HomeContext);
    const [cmsPages, setCmsPages] = useState([]);

    useEffect(() => {
        if (miniMenuOpened) {
            CmsResource.getInstance().getData()
                .then(data => setCmsPages(data));
        }
    }, [miniMenuOpened]);

    return (
        <MenuWrapper>
            <LangSwitch languages={['pl', 'en']}
                        currentLang={context.selectedLang}
                        changeLang={(lang) => context.setSelectedLang(lang)}/>
            <Button ref={button}> <MenuIcon/> </Button>
            {miniMenuOpened && <MiniMenu ref={menu}>
                {cmsPages.map((page) => {
                    return <StyledLink key={page.slug} to={"/page/" + page.slug}
                                       onClick={() => setMiniMenuOpened(!miniMenuOpened)}>
                        <TextMultiLang
                            primaryText={page.menu_title_primary_language}
                            secondaryText={page.menu_title_secondary_language}/>
                    </StyledLink>;
                })}
                <StyledLink to="/edit" onClick={() => setMiniMenuOpened(!miniMenuOpened)}>
                    <TextMultiLang
                        primaryText="Edycja danych"
                        secondaryText="редагувати дані"/>
                </StyledLink>
            </MiniMenu>}
            <ExtrernalLink
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.facebook.com/groups/zasobygrupa">
                <LogoFB/>
            </ExtrernalLink>
        </MenuWrapper>
    );
};

export default Menu;
