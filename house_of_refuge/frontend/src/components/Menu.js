import styled from 'styled-components';
import LogoFB from './LogoFB.js';
import MenuIcon from './MenuIcon.js';
import { Link } from "react-router-dom";
import TextMultiLang from '../components/TextMultiLang';
import useComponentVisible from '../scripts/useComponentVisible';
import { useTranslation } from 'react-i18next';

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
    top: 5px;
    right: 52px;
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
   -webkit-box-shadow: 0px 5px 28px 0px rgba(0, 0, 0, 0.14);
    -moz-box-shadow: 0px 5px 28px 0px rgba(0, 0, 0, 0.14);
    box-shadow: 0px 5px 28px 0px rgba(0, 0, 0, 0.14);

    @media (max-width: 600px) {
        left: 14px;
    }

`;


const Menu = () => {
    const { menu, button, miniMenuOpened, setMiniMenuOpened } = useComponentVisible(true);
    const { t, i18n } = useTranslation();
    const uat = i18n.getFixedT('ua','common');
    const lngs = {
        en: { nativeName: 'English' },
        pl: { nativeName: 'Polski' }
    };

    return (
        <>
            <Button ref={button} > <MenuIcon /> </Button>
            {miniMenuOpened && <MiniMenu ref={menu}>
            {Object.keys(lngs).map((lng) => (
                        <Button key={lng}
                                style={{ fontWeight: i18n.resolvedLanguage === lng ? 'bold' : 'normal' }} 
                                type="submit" 
                                onClick={() => i18n.changeLanguage(lng)}>
                        {lngs[lng].nativeName}
                        </Button>
                    ))}
                <StyledLink to="/privacy" onClick={() => setMiniMenuOpened(!miniMenuOpened)}>
                    <TextMultiLang
                        primaryText={t('privacy_policy_title')}
                        secondaryText={uat('privacy_policy_title')}
                    />
                </StyledLink>
                <StyledLink to="/edit" onClick={() => setMiniMenuOpened(!miniMenuOpened)}>
                    <TextMultiLang
                        primaryText={t('edit_data')}
                        secondaryText={uat('edit_data')}
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
