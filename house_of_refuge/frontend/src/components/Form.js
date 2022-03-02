import React from 'react';
import styled from 'styled-components';

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




const Form = ({ fields, formik }) => {

    return (
        <StyledForm onSubmit={formik.handleSubmit} >
            {fields.map(field => {
                return <React.Fragment key={field.name}>
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
                        />
                    }
                    {formik.errors[field.name] && formik.touched[field.name] ? (
                        <Alert role="alert"> {formik.errors[field.name]} </Alert>
                    ) : null}
                </React.Fragment>;
            })}

            <Button type="submit">Wyślij</Button>

        </StyledForm>
    );
};

export default Form;
