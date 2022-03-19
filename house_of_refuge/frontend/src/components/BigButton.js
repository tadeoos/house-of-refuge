import styled from 'styled-components';

const StyledBigButton = styled.div`
   cursor: pointer;
   color: ${p => p.color};
   background-color: ${p => p.backgroundColor};
   margin: auto;
   padding: 14px 60px 15px;
   border: ${p => p.outlined ? `4px solid ${p.color}` : 'initial'};
   border-radius: 70px;
   transition:  border-radius 0.3s;

   :hover {
       border-radius: 30px;
   }

`;

const Primary = styled.span`
   font-size: 32px;
   font-weight: 700;

   @media (max-width: 600px) {
    font-size: 24px;
    white-space: nowrap;
   }
`;

const Secondary = styled.div`
   font-size: 18px;
   text-align: center;
   margin-top: -10px;

   @media (max-width: 600px) {
    margin-top: -2px;
    font-size: 16px;
   }
`;


const BigButton = ({ primaryText, secondaryText, backgroundColor, color, outlined, onClick }) => {

    return (
        <StyledBigButton
            color={color}
            backgroundColor={backgroundColor}
            outlined={outlined}
            onClick={onClick}
        >
            <Primary> {primaryText} </Primary>
            <Secondary> {secondaryText} </Secondary>
        </StyledBigButton>
    );
};

export default BigButton;
