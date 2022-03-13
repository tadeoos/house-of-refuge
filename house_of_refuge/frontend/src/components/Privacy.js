import styled from 'styled-components';
import TextWrapper from '../typography/TextWrapper';
import H2 from '../typography/H2';
import H3 from '../typography/H3';
import H4 from '../typography/H4';
import H5 from '../typography/H5';
import { useTranslation } from 'react-i18next';


const StyledPrivacy = styled.div`
  color: #898F9C;
  font-size: 15px;
  max-width: 650px;
  margin: auto;

  h3 {
      margin-bottom: 36px;
  }

  p {
      text-align: initial;
      max-width: initial;
      margin: 1em 0;
  }
`;


const Privacy = () => {
    const { t } = useTranslation();

    return (
    <TextWrapper>
        <H5>{t('privacy_policy_title')}<br /></H5>
        <H4>
            <p>
                {t('ppolicy_purpose')}
            </p>
        </H4>
        <H5>
            <br />
            <p>
                {t('ppolicy_access_is_restricted')}
            </p>
            <p>
                {t('ppolicy_ngo_access')}
            </p>
            <p>
                {t('ppolicy_if_you_leave')}
            </p>
            <p>
                {t('ppolicy_thank_you')}
            </p>
        </H5>
    </TextWrapper>
    );
};

export default Privacy;
