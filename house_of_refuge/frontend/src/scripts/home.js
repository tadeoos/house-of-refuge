import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import Header from '../components/Header.js';
import BigButton from '../components/BigButton.js';
import Form from '../components/Form.js';
import Privacy from '../components/Privacy.js';
import { fields1, fields2, validationSchema1, validationSchema2 } from './formSchema';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation
} from "react-router-dom";
import { colors } from '../theme';


const StyledApp = styled.div`
  font-family: 'proxima-nova', sans-serif;
  max-width: 1400px;
  color: #212121;
  margin: auto;
  display: flex;
  min-height: 100%;
  justify-content: center;
  align-items: center;

  .Footer {
    justify-content: flex-end;
  }
`;

const ButtonWrap = styled.div`
  display: flex;
  flex-direction: column;

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


const App = ({ userData }) => {
  const [user] = useState(userData);
  const [isHomePage, setIsHomePage] = useState(false);
  let location = useLocation();
  useEffect(() => {
    location.pathname === '/' ? setIsHomePage(true) : setIsHomePage(false);
  }, [location]);

  return (
    <StyledApp homapage={isHomePage}>
      <Header />
      <Routes>
        <Route index element={<>
          <ButtonWrap>
            <Link to="/share">
              <BigButton
                primaryText="Udostępniam nocleg"
                secondaryText="Можу надати житло"
                outlined
                color={colors.veryDarkGrey}
              />
            </Link>
            <Link to="/find">
              <BigButton
                primaryText="Потребує житло"
                secondaryText="Szukam noclegu"
                color={colors.veryDarkGrey}
                backgroundColor="#FFD200"
              />
            </Link>
          </ButtonWrap>
        </>} />
        <Route path="/share" element={<>
          <Form
            primaryText="Udostępniam nocleg"
            secondaryText="Можу надати житло"
            fields={fields1}
            validationSchema={validationSchema1}
            url='/api/stworz_zasob'
            successInfo='Dziękujemy za zgłoszenie.'
          />
        </>} />
        <Route path="/find" element={<>
          <Form
            primaryText="Потребує житло"
            secondaryText="Szukam noclegu"
            fields={fields2}
            validationSchema={validationSchema2}
            url='/api/zglos'
            successInfo='Дякуємо за подання.'
            user={user}
          />
        </>} />
        <Route path="/jazda/stolik" element={<>
          <Form
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
      </Routes>

    </StyledApp>
  );
};

ReactDOM.render(
  <BrowserRouter ><App {...props} /></BrowserRouter>,
  window.react_mount,
);
