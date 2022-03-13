import styled from 'styled-components';
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
    return (
        <StyledFooter className={className}>
            <Link to="/privacy">
            {t('privacy_policy_title')}
            </Link>
        </StyledFooter >
    );
};

export default Footer;
