import styled from 'styled-components';

const StyledBigButton = styled.div`
   cursor: pointer;
   color:  ${p => p.color};
   background-color:  ${p => p.backgroundColor};
   margin: auto;
   padding: 14px 44px;
   border-radius: 150px;



`;

const Primary = styled.span`
   font-size: 54px;
   font-weight: 700;

   @media (max-width: 600px) {
    font-size: 24px;
    white-space: nowrap;
   }
`;

const Secondary = styled.div`
   font-size: 21px;
   text-align: center;
   @media (max-width: 600px) {
    font-size: 18px;
   }
`;


const BigButton = ({ primaryText, secondaryText, backgroundColor, color, onClick }) => {

    return (
        <StyledBigButton
            color={color}
            backgroundColor={backgroundColor}
            onClick={onClick}
        >
            <Primary> {primaryText} </Primary>
            <Secondary> {secondaryText} </Secondary>
        </StyledBigButton>
    );
};

export default BigButton;
