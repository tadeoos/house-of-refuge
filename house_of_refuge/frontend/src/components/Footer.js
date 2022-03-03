import styled from 'styled-components';
import { Link } from "react-router-dom";

const StyledFooter = styled.div`
  font-size: 15px;
  height: 32px;
  display: flex;
  margin-top: 30px;
  padding-bottom: 50px;

  > a {
    color: #898F9C;
    text-decoration: none;
    display: flex;
    margin: auto;
    text-align: center;
  }

`;


const Footer = ({ className }) => {

    return (
        <StyledFooter className={className}>
            <Link to="/privacy">
                    Polityka prywatności / політика конфіденційності
            </Link>
        </StyledFooter >
    );
};

export default Footer;
