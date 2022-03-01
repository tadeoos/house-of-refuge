import { useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import Header from '../components/Header.js';
import BigButton from '../components/BigButton.js';
import Form from '../components/Form.js';
import Footer from '../components/Footer.js';
import { useFormik } from 'formik';
import { validationSchema } from './validationSchema';
import axios from 'axios';
import { getCookie } from "./utils";

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

  > * {
      &:first-child {
        margin-bottom: 20px;

        @media (max-width: 600px) {
          margin-bottom: 10px;
        }
      }
  }

`;

const App = ({userData}) => {
  const [page, setPage] = useState(0);
  // console.log(userData)
  const [user] = useState(userData);

  // const [name, setName] = useState('')
  const [formValues, setFormValues] = useState(null);

  console.log('getCookie()', getCookie('csrftoken'));


  const formik = useFormik({
    initialValues: {
      name: '',
      about_info: '',
      resource: '',
      city: '',
      zip_code: '',
      address: '',
      // people_to_accommodate_raw: '',
      people_to_accommodate: '',
      costs: '',
      availability: '',
      accommodation_length: '',
      details: '',
      transport: '',
      phone_number: '',
      backup_phone_number: '',
      email: '',
      extra: '',

    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      return axios({
        method: 'post',
        url: '/api/stworz_zasob',
        data: values,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
      })
        .catch(error => {
          // error && setError(true)
        })
        .then(response => {
          if (response) {
            console.log(response?.data);
          }
        });
    }
  });

  // console.log(formik.values);

  return (
    <StyledApp>
      <Header setPage={setPage} />

      {page === 0 && <ButtonWrap>
        <BigButton
          primaryText="Udostępniam nocleg"
          secondaryText="Можу надати житло"
          color="#fff"
          backgroundColor="#000"
          onClick={() => setPage(1)}
        />
        <BigButton
          primaryText="Потребує житло"
          secondaryText="Szukam noclegu"
          color="#000"
          backgroundColor="#FFD200"
        />
      </ButtonWrap>}

      {page === 1 && <Form
        formik={formik}
      />}


      <Footer className="Footer" />
    </StyledApp>
  );
};


ReactDOM.render(
  React.createElement(App, window.props),    // gets the props that are passed in the template
  window.react_mount,                                // a reference to the #react div that we render to
);
