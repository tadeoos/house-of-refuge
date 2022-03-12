import styled from 'styled-components';
import LogoFB from './LogoFB.js';

const StyledMenu = styled.div`
    position: absolute;
    right: 24px;
    top: 24px;
    display: flex;

 
`;

const Menu = ({ className }) => {

    return (
        <StyledMenu className={className}>

            <a
                target="_blank"
                rel="noopener noreferrer"
                href='https://www.facebook.com/groups/zasobygrupa'
            >
                <LogoFB />
            </a>

        </StyledMenu>
    );
};

export default Menu;
