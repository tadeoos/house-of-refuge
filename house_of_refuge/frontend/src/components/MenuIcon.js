import styled from 'styled-components';
import { colors } from '../theme';

const StyledMenuIcon = styled.div`
   width: 48px;
    .st0 {
        fill: ${colors.veryDarkGrey};
    }
`;

const MenuIcon = ({ className }) => {

    return (
        <StyledMenuIcon className={className}>
            <svg viewBox="0 0 48 22" >
                    <g id="XMLID_315_">
                        <path id="XMLID_330_" d="M36.7,22H11.3c-6.1,0-11-4.9-11-11s4.9-11,11-11h25.5c6.1,0,11,4.9,11,11S42.8,22,36.7,22z M11.3,1
			c-5.5,0-10,4.5-10,10s4.5,10,10,10h25.5c5.5,0,10-4.5,10-10s-4.5-10-10-10H11.3z"/>
                    </g>
                    <g id="XMLID_166_">
                        <g id="XMLID_316_">
                            <path id="XMLID_732_" d="M14.6,14.1V9.7l-1.9,4.4h-0.6l-1.9-4.4v4.4H9V7.8h1.7l1.8,4.1l1.8-4.1h1.7v6.3H14.6z" />
                        </g>
                        <g id="XMLID_318_">
                            <path id="XMLID_729_" d="M18.3,14.1V7.8h4.6v1.1h-3.3v1.5h3.3v1.1h-3.3V13h3.3v1.1H18.3z" />
                        </g>
                        <g id="XMLID_324_">
                            <path id="XMLID_726_" d="M29.6,14.1l-3.3-4.4v4.4h-1.3V7.8h1.3l3.2,4.2V7.8h1.2v6.3H29.6z" />
                        </g>
                        <g id="XMLID_326_">
                            <path id="XMLID_723_" d="M33.3,11.6V7.8h1.3v3.7c0,1,0.6,1.6,1.6,1.6c1,0,1.6-0.6,1.6-1.6V7.8H39v3.8c0,1.6-1,2.6-2.9,2.6
				C34.2,14.2,33.3,13.2,33.3,11.6z"/>
                        </g>
                    </g>

            </svg>


        </StyledMenuIcon>
    );
};

export default MenuIcon;
