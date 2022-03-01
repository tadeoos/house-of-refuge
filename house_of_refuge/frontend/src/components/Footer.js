import styled from 'styled-components';

const StyledFooter = styled.div`
  color: #898F9C;
  font-size: 15px;
  height: 32px;
  display: flex;
  height: 80px;

  span {
      margin: auto;
      text-align: center;
  }


`;


const Footer = ({ className }) => {

    return (
        <StyledFooter className={className}>
            <span>
                Polityka prywatności / політика конфіденційності
            </span>
        </StyledFooter>
    );
};

export default Footer;
