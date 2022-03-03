import { useState } from 'react';
import styled from 'styled-components';
import { useFormik } from 'formik';
import axios from 'axios';
import { getCookie } from "../scripts/utils";

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  margin: auto;
  width: 100%;
  max-width: 400px;
  margin-top: 32px;
  margin-bottom: 32px;
`;

const Label = styled.label`
  text-align: left;
  margin-bottom: 8px;
  margin-top: 28px;
  margin-left: ${p => p.type === 'checkbox' ? '20px' : 'initial'};
  position: ${p => p.type === 'checkbox' ? 'absolute' : 'initial'};
  cursor: ${p => p.type === 'checkbox' ? 'pointer' : 'initial'};

`;

const Input = styled.input.attrs(({ type }) => ({
    as: type === 'textarea' ? type : 'input'
}))`
  height: ${p => p.type === 'checkbox' ? '22px' : '44px'};
  margin-top: ${p => p.type === 'checkbox' ? '28px' : 'initial'};
  cursor: ${p => p.type === 'checkbox' ? 'pointer' : 'initial'};
  padding: 0 8px;
  box-sizing: border-box;
  border-radius: 3px; 
  border: 1px solid #898F9C;
  min-height:  ${p => p.type === 'textarea' ? '70px' : 'initial'};
  max-height:  ${p => p.type === 'textarea' ? '140px' : 'initial'};
  padding-top:  ${p => p.type === 'textarea' ? '8px' : 'initial'};
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
  margin-top: 36px; 
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

const Primary = styled.span`
   font-size: 34px;
   font-weight: 700;
   margin-top: 80px;
   text-align: center;
`;

const Secondary = styled.div`
   font-size: 18px;
   text-align: center;
`;


const UserInfo = styled.div`
   font-size: 14px;
   position: fixed;
   bottom: 8px;
   left: 12px;
   color: #898F9C;
`;


const Form = ({ fields, validationSchema, url, successInfo, user, primaryText, secondaryText }) => {
    const [success, setSuccess] = useState(false);

    const formik = useFormik({
        initialValues: fields.reduce((acc, field) => (acc[field.name] =
            field.type === 'checkbox' ? false :
                field.type === 'select' ? field.options[0].value :
                    field.type === 'date' ? new Date().toISOString().split('T')[0] :
                        field.name === 'receiver' && user ? user.id :
                            '', acc), {}),
        validationSchema: validationSchema({ publicOnly: !user }),
        onSubmit: async (values) => {
            const { city, ...rest } = values;
            const cityZipCodeValues = {
                ...rest,
                city_and_zip_code: `${values.city}, ${values.zip_code}`,
            };
            return axios({
                method: 'post',
                url,
                data: values.city && values.zip_code ? cityZipCodeValues : values,
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
        success ? <Success> {successInfo} </Success> :
            <>
                <Primary> {primaryText} </Primary>
                <Secondary> {secondaryText} </Secondary>
                {user && <UserInfo> logged: {user.name} </UserInfo>}

                <StyledForm onSubmit={formik.handleSubmit} >
                    {fields
                        .filter(field => user ? field : !field.loggedUser)
                        .filter(field => !user ? field : !field.publicOnly)
                        .map(field => {
                            return <Field key={field.name} alert={formik.errors[field.name] && formik.touched[field.name]} >
                                {field.type === 'hidden' || field.type === 'checkbox' ? null : <Label htmlFor={field.name}>{field.label}</Label>}
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
                                    </> : field.type === 'select' ?
                                        <select
                                            style={{ height: 44, cursor: 'pointer', paddingLeft: 6 }}
                                            name={field.name}
                                            value={field.value}
                                            onChange={formik.handleChange}
                                        >
                                            {field.options.map(option => <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>)}
                                        </select>
                                        :
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
                                {field.type === 'checkbox' ? <Label type='checkbox' htmlFor={field.name}>{field.label}</Label> : null}
                                {formik.errors[field.name] && formik.touched[field.name] ? (
                                    <Alert role="alert"> {formik.errors[field.name]} </Alert>
                                ) : null}
                            </Field>;
                        })}

                    <Button type="submit">Wyślij</Button>

                </StyledForm>
            </>

    );
};

export default Form;
