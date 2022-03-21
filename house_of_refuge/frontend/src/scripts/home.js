import { useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import Header from '../components/Header.js';
import BigButton from '../components/BigButton.js';
import Form from '../components/Form.js';
import Edit from '../components/Edit.js';
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
import CMS from "../components/CMS";
import Map from "../components/Map";
import '../i18n/config';

const StyledApp = styled.div`
  font-family: 'proxima-nova', sans-serif;
  color: #212121;
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 75px;
  min-height: 100vh;
  .Footer {
    justify-content: flex-end;
  }
  `;

const ButtonWrap = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 30px;
  > a {
    color: inherit;
    text-decoration: none;
    display: flex;
  }
`;



const App = (props) => {
  const [user] = useState(props.userData);

  return (
    <StyledApp>
      <Header/>
      <Routes>
        <Route index element={<>
          <ButtonWrap className={"mb-5 flex-grow-1"}>
            <Link to="/share">
              <BigButton
                  primaryText="Udostępniam nocleg"
                  secondaryText="Можу надати житло"
                  backgroundColor="#0066cc"
                  color={colors.white}
              />
            </Link>
            <Link to="/find">
              <BigButton
                  primaryText="Потребує житло"
                  secondaryText="Szukam noclegu"
                  color={colors.veryDarkGrey}
                  backgroundColor={colors.optimisticYellow}
              />
            </Link>
            <div className={"w-100 my-3"}/>
            <Link to="/map">
              <BigButton
                  primaryText="Хочу поїхати в іншу країну в Європі"
                  secondaryText="Chcę jechać do innego kraju w Europie"
                  outlined
                  color={colors.veryDarkGrey}
              />
            </Link>
          </ButtonWrap>
        </>} />
        <Route path="/share" element={<Share />} />
        <Route path="/find" element={<Find  user={user} />} />
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
        <Route path="/edit" element={<Edit {...props} />} />
        <Route path="/page/:id" element={<CMS {...props} />} />
        <Route path="/map" element={<Map {...props} />} />
      </Routes>
    </StyledApp>
  );
};

ReactDOM.render(
  <BrowserRouter ><App {...props} /></BrowserRouter>,
  window.react_mount,
);
