import React from 'react';
import { useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import Header from '../components/Header';
import BigButton from '../components/BigButton';
import Form from '../components/Form';
import Privacy from '../components/Privacy';
import Edit from '../components/Edit';
import { fields2, validationSchema2 } from './formSchema';
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
  padding-top: 240px;

  .Footer {
    justify-content: flex-end;
  }
  `;

const ButtonWrap = styled.div`
  margin-top: -240px;
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

  return (
    <StyledApp>
      <Header />
      <Routes>
        <Route index element={<>
          <ButtonWrap>
            <Link to="/share">
              <BigButton
                  backgroundColor={undefined}
                  onClick={undefined}
                primaryText="Udostępniam nocleg"
                secondaryText="Можу надати житло"
                outlined
                color={colors.veryDarkGrey}
              />
            </Link>
            <Link to="/find">
              <BigButton
                  onClick={undefined}
                  outlined={undefined}
                primaryText="Потребує житло"
                secondaryText="Szukam noclegu"
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
              formData={undefined}
            primaryText="Потребує житло"
            secondaryText="Szukam noclegu"
            fields={fields2}
            validationSchema={validationSchema2}
            url='/api/zglos'
            successInfo='Дякуємо за подання.'
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
  <BrowserRouter ><App {...props} /></BrowserRouter>,

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
  window.react_mount,
);
