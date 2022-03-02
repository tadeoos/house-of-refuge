import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import Header from '../components/Header.js';
import BigButton from '../components/BigButton.js';
import Form from '../components/Form.js';
import Footer from '../components/Footer.js';
import { fields1, validationSchema1 } from './formSchema';
import axios from 'axios';
import { getCookie } from "./utils";
import {
  BrowserRouter,
  Routes,
  Route,
  Link
} from "react-router-dom";

const StyledApp = styled.div`
  max-width: 1400px;
  margin: auto;
  display: flex;
  flex-direction: column;
  position: relative;
  justify-content: space-between;
  height: 100%;
  font-family: 'Roboto', sans-serif;

  .Footer {
    justify-content: flex-end;
  }
`;

const ButtonWrap = styled.div`
  display: flex;
  flex-direction: column;

  > a {
    color: initial;
    text-decoration: none;
    display: flex;
  }

  > * {
      &:first-child {
        margin-bottom: 20px;

        @media (max-width: 600px) {
          margin-bottom: 10px;
        }
      }
  }
`;



const App = ({ userData }) => {
  // const [user] = useState(userData)

  return (
    <BrowserRouter>
      <StyledApp>
        <Header />
        <Routes>
          <Route index element={<ButtonWrap>
            <Link to="/form1">
              <BigButton
                primaryText="Udostępniam nocleg"
                secondaryText="Можу надати житло"
                color="#fff"
                backgroundColor="#000"
              />
            </Link>
            <BigButton
              primaryText="Потребує житло"
              secondaryText="Szukam noclegu"
              color="#000"
              backgroundColor="#FFD200"
            />
          </ButtonWrap>} />
          <Route path="/form1" element={<Form fields={fields1} />} />
        </Routes>
        <Footer className="Footer" />
      </StyledApp >
    </BrowserRouter>
  );
};



ReactDOM.render(
  React.createElement(App, window.props), // gets the props that are passed in the template
  window.react_mount, // a reference to the #react div that we render to
);
