import styled from 'styled-components';


const Primary = styled.span`
   font-size: 18px;
   font-weight: 700;

`;

const Secondary = styled.div`
   font-size: 13.5px;
   margin-top: -4px;
   
`;


const TextMultiLang = ({ primaryText, secondaryText }) => {

    return (
        <>
            <Primary> {primaryText} </Primary>
            <Secondary> {secondaryText} </Secondary>
        </>
    );
};

export default TextMultiLang;
