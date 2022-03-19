import {useState, useEffect} from 'react';
import styled from 'styled-components';
import {useFormik} from 'formik';
import axios from 'axios';
import {getCookie} from "../scripts/utils";
import {useSearchParams} from "react-router-dom";
import {
  StyledForm,
  Label,
  Input,
  SubHeading,
  CustomIntRange,
  RadioField,
  RadioChoice,
  SelectField,
  Button,
  Alert,
  Field,
  Success
} from '../components/FormComponents';
import {Link} from "react-router-dom";


const Primary = styled.div`
   font-size: 34px;
   font-weight: 700;
   text-align: center;

   @media (max-width: 600px) {
      font-size: 24px;
   }
`;

const Secondary = styled.div`
   font-size: 18px;
   text-align: center;

   @media (max-width: 600px) {
       font-size: 16px;
    }
`;

const Info = styled.div`
   font-size: 14px;
   text-align: center;
   margin-top: ${p => p.marginTop + 'px'};

   span {
    color: #fff;
    padding: 0 6px;
    background-color: #212121;
   }
`;


const ConfirmationPopUp = styled.div`
position: fixed;
top: 0;
right: 0;
left: 0;
bottom: 0;
background-color: rgba(0,0,0,.65);
`;

const InnerPopUp = styled.div`
  background-color: white;
  border-radius: 22px;
  padding: 8px;
  position: fixed;
  width: 400px;
  height: 156px;
  top: 50%;
  left: 50%;
  margin-left: -200px;
  margin-top: -90px;
  text-align: center ;

  > span {
    display: block;
    padding: 10px 0 14px;
  }

  > button {
    margin-bottom: 10px;
  }
`;


const Form = ({
                formData,
                fields,
                validationSchema,
                url,
                successInfo,
                user,
                primaryText,
                secondaryText,
                canAddMore = false
              }) => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [whenToCall, setWhenToCall] = useState(formData?.when_to_call || '9—22');
  const [toDelete, setToDelete] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const removeParams = () => {
    if (searchParams.has("t")) {
      const token = searchParams.get("t");
      if (token) {
        searchParams.delete("t");
        setSearchParams(searchParams);
      }
    }
  };

  useEffect(() => {
    formik.setFieldValue('when_to_call', whenToCall);
  }, [whenToCall, success]);

  useEffect(() => {
    !user && formik.setFieldValue('source', 'webform');
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [error]);


  const shouldRenderField = (field) => {
    if (field.publicOnly) {
      return !user;
    } else if (field.loggedUser) {
      return user;
    }
    return true;
  };


  const formik = useFormik({
    initialValues: formData || fields.filter(field => shouldRenderField(field)).reduce((acc, field) => (acc[field.name] =
        field.type === 'checkbox' ? true :
            field.type === 'select' ? field.options[0].value :
                field.type === 'date' ? new Date().toISOString().split('T')[0] :
                    field.name === 'receiver' && user ? user.id :
                        '', acc), {}),
    validationSchema: validationSchema({publicOnly: !user}),
    onSubmit: async (values, {resetForm}) => {
      const {city, ...rest} = values;
      const cityZipCodeValues = {
        ...rest,
        city_and_zip_code: `${values.city}, ${values.zip_code}`,
      };

      return axios({
        method: formData ? 'put' : 'post',
        url,
        data: values.city && values.zip_code ? cityZipCodeValues : values,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
      })
          .catch(error => {
            error && setError(true);
          })
          .then(res => {
            if (res.status === 201 || res.status === 202) {
              setSuccess(true);
              resetForm();
            } else {
              setError(true);
            }
          });
    }
  });

  const handleDelete = async () => {
    return await axios({
      method: 'delete',
      url,
      data: {
        token: formik.values.token
      },
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'),
      },
    })
        .catch(error => {
          error && setError(true);
        })
        .then(res => {
          if (res.status === 204) {
            formik.resetForm();
            setSuccess(true);
            removeParams();
            setToDelete(false);
          } else {
            setError(true);
          }
        });
  };

  return (
      success ? <div><Success> {successInfo} </Success>
            {canAddMore &&
                <div style={{maxWidth: "300px", margin: "12px auto"}}>
                  <Link to={url === '/api/zglos' ? '/find' : '/share'}>
                    <Button onClick={() => setSuccess(false)}>Dodaj kolejne</Button>
                  </Link>
                </div>}
          </div> :
          <div>
            <Primary> {primaryText} </Primary>
            <Secondary> {secondaryText} </Secondary>
            {user && <Info marginTop={48}> <span> Zalogowany: {user.name} </span> </Info>}
            {/*{error && <Info marginTop={3} > Błąd serwera. Spróbuj jeszcze raz. </Info>}*/}
            <StyledForm onSubmit={formik.handleSubmit}>
              {fields
                  .filter(field => user ? field : !field.loggedUser)
                  .filter(field => !user ? field : !field.publicOnly)
                  .map(field => {
                    return <Field key={field.name} alert={formik.errors[field.name] && formik.touched[field.name]}>
                      {field.type === 'hidden' || field.type === 'checkbox' ? null :
                          <>
                            <Label htmlFor={field.name}>{field.label}</Label>
                            {field.subHeading && <SubHeading> {field.subHeading}</SubHeading>}
                          </>}
                      {field.type === 'radio' ?
                          <RadioField>
                            {field.choice.map(choice => {
                              return <RadioChoice key={choice.value}>
                                <input
                                    checked={formik.values[field.name] === choice.value}
                                    type={field.type}
                                    name={field.name}
                                    value={choice.value}
                                    onChange={formik.handleChange}
                                />
                                <span>{choice.label}</span>
                              </RadioChoice>;
                            })}
                          </RadioField>
                          : field.type === 'select' ?
                              <SelectField
                                  name={field.name}
                                  value={field.value}
                                  onChange={formik.handleChange}
                              >
                                {field.options.map(option => <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>)}
                              </SelectField>
                              : field.type === 'custom_int_range' && field.name === 'when_to_call' ?
                                  <CustomIntRange>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        type="number"
                                        onChange={(e) => setWhenToCall(e.currentTarget.value + '—' + whenToCall.split('—')[1])}
                                        value={whenToCall.split('—')[0]}
                                        min={0}
                                        max={24}
                                    />
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        type="number"
                                        onChange={(e) => setWhenToCall(whenToCall.split('—')[0] + '—' + e.currentTarget.value)}
                                        value={whenToCall.split('—')[1]}
                                        min={0}
                                        max={24}
                                    />
                                  </CustomIntRange>
                                  : <Input
                                      id={field.name}
                                      name={field.name}
                                      type={field.type}
                                      onChange={formik.handleChange}
                                      value={formik.values[field.name]}
                                      min={field.type === 'number' ? 1 : null}
                                      max={field.type === 'number' ? 1000 : null}
                                  />
                      }
                      {field.type === 'checkbox' ? <>
                        <Label type="checkbox" htmlFor={field.name}>{field.label}</Label>
                        {field.subHeading && <SubHeading indent> {field.subHeading}</SubHeading>}
                      </> : null}
                      {formik.errors[field.name] && formik.touched[field.name] ? (
                          <Alert role="alert"> {formik.errors[field.name]} </Alert>
                      ) : null}
                    </Field>;
                  })}

              <div style={{marginBottom: 40}}></div>

              <Button
                  type="submit"
                  disabled={formik.isSubmitting}
                  onClick={() => !formik.isValid && window.scrollTo(0, 0)}
              >
                {formData ? 'Zapisz' : 'Wyślij'}
              </Button>

              <div style={{marginBottom: 14}}></div>

              {formData && <Button outlined type="button" onClick={() => setToDelete(true)}>
                Usuń to zgłoszenie
              </Button>}

              <div style={{marginBottom: 14}}></div>

              {toDelete && <ConfirmationPopUp>
                <InnerPopUp>
                  <span>  Czy na pewno chcesz usunąć to zgłoszenie? </span>
                  <Button type="button" onClick={() => handleDelete()}>
                    Usuń
                  </Button>
                  <Button outlined type="button" onClick={() => setToDelete(false)}>
                    Anuluj
                  </Button>
                </InnerPopUp>
              </ConfirmationPopUp>}

            </StyledForm>

          </div>

  );
};

export default Form;
