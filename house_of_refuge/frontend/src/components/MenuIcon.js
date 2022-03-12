import styled from 'styled-components';
import { colors } from '../theme';

const StyledMenuIcon = styled.div`
   width: 22px;
    .st0 {
        fill: ${colors.veryDarkGrey};
    }
`;

const MenuIcon = ({ className }) => {

    return (
        <StyledMenuIcon className={className}>
            <svg  viewBox="0 0 22 22"  >
                <g id="XMLID_314_">
                    <path id="XMLID_320_" d="M11,1.2c5.4,0,9.8,4.4,9.8,9.8s-4.4,9.8-9.8,9.8S1.2,16.4,1.2,11S5.6,1.2,11,1.2 M11,0C4.9,0,0,4.9,0,11
		s4.9,11,11,11S22,17,22,11S17.1,0,11,0L11,0z"/>
                    <g id="XMLID_713_">
                        <path id="XMLID_714_" d="M10.3,14.9V9.4H9V7.9h3v7h1.3v1.5H9v-1.5H10.3z M10,5c0-0.3,0.1-0.5,0.3-0.7S10.8,4,11.1,4
			c0.3,0,0.5,0.1,0.7,0.3s0.3,0.4,0.3,0.7S12,5.5,11.8,5.7S11.3,6,11.1,6c-0.3,0-0.5-0.1-0.7-0.3C10.1,5.5,10,5.3,10,5z"/>
                    </g>
                </g>
            </svg>


        </StyledMenuIcon>
    );
};

export default MenuIcon;
