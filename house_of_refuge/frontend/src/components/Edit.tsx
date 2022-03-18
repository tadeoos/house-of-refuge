import { useFormik } from 'formik';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { getCookie } from "../scripts/utils";
import Form from '../components/Form';
import { fields1, validationSchema1 } from '../scripts/formSchema';
import * as yup from 'yup';
import { StyledForm, Label, Input, Button, Alert, Success } from '../components/FormComponents';
import { useSearchParams } from "react-router-dom";
import React from 'react';

const Edit = () => {
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.has("t")) {
      const token = searchParams.get("t");
      if (token) {
        axios({
          method: 'post',
          url: '/api/edit',
          data: {
            token
          },
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
          },
        })

          .then(res => {
            setFormData(res.data.formData);
          })
            .catch(error => {
              console.log("ERROR: ", error);
            });
      }
    }
  }, []);


  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: yup.object({
      email: yup
        .string()
        .email('Niepoprawny adres email')
        .required('Pole wymagane'),
    }),
    onSubmit: async (values) => {
      return await axios({
        method: 'post',
        url: '/api/send_email_token',
        data: values,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
      })
        .then(res => {
          if (res.status === 204) {
            setSuccess(true);
          }
          // else { // Not defined
          //   setError(true);
          // }
        })
          .catch(error => {
            console.log("ERROR: ", error);
          });
    }
  });



  return (

    <>
      {success ? <Success> Sprawdź swojego maila </Success> : formData ?
        <Form
          formData={formData}
          primaryText="Udostępniam nocleg"
          secondaryText="Можу надати житло"
          fields={fields1}
          validationSchema={validationSchema1}
          url='/api/stworz_zasob'
          successInfo='Zmodyfikowalismy Twoje zgłoszenie.'
          user={undefined}
          canAddMore={undefined}
        />
        :
        <StyledForm onSubmit={formik.handleSubmit}>
          <Label htmlFor='email'> W celu edycji podaj swój adres email </Label>
          <Input
            name='email'
            type='text'
            onChange={formik.handleChange}
            value={formik.values['email']}
          />

          {formik.errors['email'] && formik.touched['email'] ? (
            <Alert role="alert"> {formik.errors['email']} </Alert>
          ) : null}

          <div style={{ marginBottom: 14 }} > </div>

          <Button type="submit" disabled={formik.isSubmitting} >
            Wyślij
          </Button>

        </StyledForm>}
    </>
  );
};

export default Edit;
