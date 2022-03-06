import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import Header from '../components/Header.js';
import BigButton from '../components/BigButton.js';
import Form from '../components/Form.js';
import Footer from '../components/Footer.js';
import Privacy from '../components/Privacy.js';
import { fields1, fields2, validationSchema1, validationSchema2 } from './formSchema';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation
} from "react-router-dom";

const StyledApp = styled.div`
  font-family: 'proxima-nova', sans-serif;
  max-width: 1400px;
  color: #212121;
  margin: auto;
  display: ${p => p.homapage ? 'flex' : 'initial'};
  flex-direction: ${p => p.homapage ? 'column' : 'initial'};
  position: ${p => p.homapage ? 'relative' : 'initial'};
  justify-content: ${p => p.homapage ? 'space-between' : 'initial'};
  min-height: ${p => p.homapage ? '100%' : 'initial'};

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
                color="#fff"
                backgroundColor="#000"
              />
            </Link>
            <Link to="/find">
              <BigButton
                primaryText="Потребує житло"
                secondaryText="Szukam noclegu"
                color="#000"
                backgroundColor="#FFD200"
              />
            </Link>
          </ButtonWrap>
          <Footer className="Footer" />
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
          <Footer className="Footer" />
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
          <Footer className="Footer" />
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
