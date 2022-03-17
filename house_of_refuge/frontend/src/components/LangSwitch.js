import styled from 'styled-components';
import ISO6391 from 'iso-639-1';
import GlobeIcon, { StyledGlobeIcon } from '../components/GlobeIcon';

const StyledLangSwitch = styled.div`
    display: flex;
    justify-content: right;

    ${StyledGlobeIcon} {
        width: 16px;
        margin-right: 8px;
    }

`;

const LangButton = styled.button`
    padding: 0 8px;
    margin-top: 1px;
    cursor: pointer;
    border: none;
    background-color: transparent;
    opacity: ${p => p.active ? 1 : 0.42 };
`;

const LangSwitch = ({ currentLang, languages, changeLang }) => {

    return (
        <StyledLangSwitch>
            <GlobeIcon />
            {languages.map(lang => {
                return <LangButton
                    key={lang}
                    active={currentLang === lang ? 1 : 0}
                    onClick={() => changeLang(lang)}>
                    {ISO6391.getNativeName(lang).slice(0,3)}
                </LangButton>;
            })}
        </StyledLangSwitch>
    );
};

export default LangSwitch;
