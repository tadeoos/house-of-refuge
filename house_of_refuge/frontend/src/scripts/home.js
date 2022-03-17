import { useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import Header from '../components/Header.js';
import BigButton from '../components/BigButton.js';
import Form from '../components/Form.js';
import Privacy from '../components/Privacy.js';
import Edit from '../components/Edit.js';
import { fields2, validationSchema2 } from './formSchema';
import { useTranslation } from 'react-i18next';
import '../i18n/config';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";
import { colors } from '../theme';
import Share from '../pages/Share';
import Find from '../pages/Find';

const StyledApp = styled.div`
  font-family: 'proxima-nova', sans-serif;
  max-width: 1400px;
  color: #212121;
  margin: auto;
  display: flex;
  min-height: 100%;
  justify-content: center;
  padding-top: 180px;
  
  .Footer {
    justify-content: flex-end;
  }
  `;

const ButtonWrap = styled.div`
  margin-top: -180px;
  display: flex;
  flex-direction: column;
  display: flex;
  justify-content: center;
  align-items: center;
  
  > a {
    color: inherit;
    text-decoration: none;
    display: flex;
  }

  > * {
      &:first-child {
        margin-bottom: 30px;

        @media (max-width: 600px) {
          margin-bottom: 20px;
        }
      }
  }
`;



const App = (props) => {
  const [user] = useState(props.userData);
  const { t, i18n } = useTranslation(); // translation controlled through current state of lang selector
  const uat = i18n.getFixedT('ua','common'); // translation fixed for UA lang (non-modifiable through selector)
 
  return (
    <StyledApp>
      <Header />
      <Routes>
        <Route index element={<>
          <ButtonWrap>
            <Link to="/share">
              <BigButton
                primaryText={t("i_provide_accomodation")}
                secondaryText={uat('i_provide_accomodation')}
                outlined
                color={colors.veryDarkGrey}
              />
            </Link>
            <Link to="/find">
              <BigButton
                primaryText={uat('im_looking_for_accomodation')}
                secondaryText={t("im_looking_for_accomodation")}
                color={colors.veryDarkGrey}
                backgroundColor="#FFD200"
              />
            </Link>
          </ButtonWrap>
        </>} />
        <Route path="/share" element={<Share />} />
        <Route path="/find" element={<Find  user={user} />} />
        <Route path="/jazda/stolik" element={<>
          <Form
            primaryText={uat('im_looking_for_accomodation')}
            secondaryText={t("im_looking_for_accomodation")}
            fields={fields2}
            localeNamespace='fields2'
            fixedLocale='ua'
            validationSchema={validationSchema2}
            url='/api/zglos'
            successInfo={uat('thank_you_for_submission')}
            user={user}
          />
        </>} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/edit" element={<Edit {...props} />} />
      </Routes>

    </StyledApp>
  );
};

ReactDOM.render(
  <BrowserRouter ><App {...props} /></BrowserRouter>,
  window.react_mount,
);
