import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useFormik } from 'formik';
import { fields1, validationSchema1 } from '../scripts/formSchema';
import axios from 'axios';
import { getCookie } from "../scripts/utils";

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  margin: auto;
  width: 400px;
  margin-top: 32px;
  margin-bottom: 32px;
`;

const Label = styled.label`
  text-align: left;
  margin-top: 28px;
  margin-bottom: 8px;
`;

const Input = styled.input`
  height: 40px; 
  padding: 0 8px;
  box-sizing: border-box;
  border-radius: 3px; 
  border: 1px solid #898F9C;
`;

const Radiolabel = styled.label`
  cursor: pointer;
  span {
      margin-left: 6px;
  }
`;

const Radio = styled.input`
  margin-top: 10px;
  margin-bottom: 10px;
`;

const Button = styled.button`
  margin-top: 32px; 
  padding: 0;
  cursor: pointer;
  width: 100%;
  height: 40px;
  border: none;
  background-color: black;
  border-radius: 150px;
  color: #fff;
  background-color: #000;

`;

const Alert = styled.div`
  font-size: 13px;
  margin-top: 6px;
  color: #d93025;
`;


const Field = styled.div`
  display: flex;
  flex-direction: column;
  
  * {
  color:  ${p => p.alert ? '#d93025' : 'initial'};
  }

`;

const Success = styled.div`
  font-size: 21px;
  margin: auto;
  text-align: center;
`;
const Form = ({ fields }) => {
    const [success, setSuccess] = useState(false);

    const formik = useFormik({
        initialValues: fields1.reduce((acc, curr) => (acc[curr.name] = '', acc), {}),
        validationSchema: validationSchema1,
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
                        setSuccess(true);
                    }
                });
        }
    });




    return (
        success ? <Success > Dziękujemy za zgłoszenie.  </Success> :
            <StyledForm onSubmit={formik.handleSubmit} >
                {fields.map(field => {
                    return <Field key={field.name} alert={formik.errors[field.name] && formik.touched[field.name]} >
                        <Label htmlFor={field.name}>{field.label}</Label>
                        {field.type === 'radio' ?
                            <>
                                {field.choice.map(choice => {
                                    return <Radiolabel key={choice.value} >
                                        <Radio
                                            type={field.type}
                                            name={field.name}
                                            value={choice.value}
                                            onChange={formik.handleChange}
                                        />
                                        <span>{choice.label}</span>
                                    </Radiolabel>;
                                })}
                            </> :
                            <Input
                                id={field.name}
                                name={field.name}
                                type={field.type}
                                onChange={formik.handleChange}
                                value={formik.values[field.name]}
                                min={field.type === 'number' ? 1 : null}
                                max={field.type === 'number' ? 100 : null}
                            />
                        }
                        {formik.errors[field.name] && formik.touched[field.name] ? (
                            <Alert role="alert"> {formik.errors[field.name]} </Alert>
                        ) : null}
                    </Field>;
                })}

                <Button type="submit">Wyślij</Button>

            </StyledForm>

    );
};

export default Form;
