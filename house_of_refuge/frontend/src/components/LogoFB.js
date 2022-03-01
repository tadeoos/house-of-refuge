import styled from 'styled-components';

const StyledLogoFB = styled.div`
   width: 22px;
    .st0 {
        fill: #898F9C
    }
`;

const LogoFB = ({ className }) => {

    return (
        <StyledLogoFB className={className}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 22 22"
            >
                    <g id="XMLID_31_">
                        <defs>
                            <rect id="XMLID_32_" x="0.1" y="0" width="22" height="22" />
                        </defs>
                        <path id="XMLID_33_" className="st0" 
                        d="M22.1,11c0-6.1-4.9-11-11-11S0,4.9,0,11c0,5.5,4,10,9.3,10.9v-7.7H6.5V11h2.8V8.5
		c0-2.8,1.6-4.3,4.2-4.3c1.2,0,2.5,0.2,2.5,0.2v2.7h-1.4c-1.4,0-1.8,0.8-1.8,1.7V11h3.1l-0.5,3.2h-2.6v7.7C18,21,22.1,16.5,22.1,11
		L22.1,11z"/>
                    </g>
                    <g id="XMLID_1_">
                    </g>
                    <g id="XMLID_2_">
                    </g>
                    <g id="XMLID_3_">
                    </g>
                    <g id="XMLID_4_">
                    </g>
                    <g id="XMLID_5_">
                    </g>


            </svg>

        </StyledLogoFB>
    );
};

export default LogoFB; 
