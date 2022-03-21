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
import {useTranslation} from 'react-i18next';
import '../i18n/config';
import {toast} from "react-toastify";


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
  background-color: rgba(0, 0, 0, .65);
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
  text-align: center;

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
                  localeNamespace,
                  fixedLocale,
                  canAddMore = false
              }) => {
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const [whenToCall, setWhenToCall] = useState(formData?.when_to_call || '9—22');
    const [toDelete, setToDelete] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const {t, i18n} = useTranslation(localeNamespace);
    const tr = fixedLocale ? i18n.getFixedT(fixedLocale, localeNamespace) : t;

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


    const reducedFields = fields.filter(field => shouldRenderField(field)).reduce((acc, field) => (acc[field.name] =
        field.type === 'checkbox' ? true :
            field.type === 'select' ? field.options[0].value :
                field.type === 'date' ? new Date().toISOString().split('T')[0] :
                    field.name === 'receiver' && user ? user.id :
                        '', acc), {});

    const formik = useFormik({
        initialValues: formData || reducedFields,
        validationSchema: validationSchema({publicOnly: !user}),
        onSubmit: async (values, {resetForm}) => {
            const cityZipCodeValues = {
                ...values,
                city: undefined,
                city_and_zip_code: `${values.city}, ${values.zip_code}`,
            };

            const request = {
                method: formData ? 'put' : 'post',
                url,
                data: values.city && values.zip_code ? cityZipCodeValues : values,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                validateStatus: () => true
            };

            return axios(request)
                .then(res => {
                    if (res.status === 201 || res.status === 202) {
                        setSuccess(true);
                        resetForm();
                    } else if (res.status === 400) {
                        const msg = Object.keys(res.data)
                            .map(key => `${key}: ${res.data[key]}`)
                            .join('\n');
                        toast(msg);
                    } else {
                        setError(true);
                    }
                });
        }
    });

    const handleDelete = async () => {
        const request = {
            method: 'delete',
            url,
            data: {
                token: formik.values.token
            },
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
        };

        return await axios(request)
            .then(res => {
                if (res.status === 204) {
                    formik.resetForm();
                    setSuccess(true);
                    removeParams();
                    setToDelete(false);
                } else {
                    setError(true);
                }
            })
            .catch(error => {
                error && setError(true);
            });
    };

    const successView = (
        <div>
            <Success> {successInfo} </Success>
            {canAddMore &&
                <div style={{maxWidth: "300px", margin: "12px auto"}}>
                    <Link to={url === '/api/zglos' ? '/find' : '/share'}>
                        <Button onClick={() => setSuccess(false)}>Dodaj kolejne</Button>
                    </Link>
                </div>}
        </div>
    );

    const userInfo = user && (<Info marginTop={48}> <span> {t('common:logged_in_user')}: {user.name} </span> </Info>);

    const deleteButton = (
        <Button outlined type="button" onClick={() => setToDelete(true)}>
            {tr("delete_this_entry")}
        </Button>
    );

    const confirmationPopUp = (
        <ConfirmationPopUp>
            <InnerPopUp>
                <span>  {tr("delete_this_entry_confirm")} </span>
                <Button type="button" onClick={() => handleDelete()}>
                    {tr("common:delete")}
                </Button>
                <Button outlined type="button" onClick={() => setToDelete(false)}>
                    {tr("common:cancel")}
                </Button>
            </InnerPopUp>
        </ConfirmationPopUp>
    );

    const form = (
        <div>
            <Primary> {primaryText} </Primary>
            <Secondary> {secondaryText} </Secondary>
            {user && userInfo}
            <StyledForm onSubmit={formik.handleSubmit}>
                {fields
                    .filter(field => user ? field : !field.loggedUser)
                    .filter(field => !user ? field : !field.publicOnly)
                    .map(field => {
                        return <Field key={field.name}
                                      alert={formik.errors[field.name] && formik.touched[field.name]}>
                            {(field.type !== 'hidden' && field.type !== 'checkbox') &&
                                <>
                                    <Label htmlFor={field.name}>{tr(field.name)}</Label>
                                    {(i18n.exists('forms:' + field.name + '_subHeading') || field.subHeading) &&
                                        <SubHeading> {tr(field.name + '_subHeading', field.subHeading)}</SubHeading>}
                                </>
                            }
                            {field.type === 'radio' &&
                                <RadioField>
                                    {field.choice.map(choice => {
                                        return <RadioChoice key={choice.value}>
                                            <input
                                                checked={formik.values[field.name] === choice.value}
                                                type={field.type}
                                                name={field.name}
                                                value={choice.value}
                                                onChange={formik.handleChange}/>
                                            <span>{tr(field.name + '_choice_' + choice.value)}</span>
                                        </RadioChoice>;
                                    })}
                                </RadioField>

                            }
                            {field.type === 'select' &&
                                <SelectField
                                    name={field.name}
                                    value={field.value}
                                    onChange={formik.handleChange}>
                                    {field.options.map(option => <option key={option.value}
                                                                         value={option.value}>
                                        {tr(field.name + '_option_' + option.value)}
                                    </option>)}
                                </SelectField>
                            }
                            {field.type === 'custom_int_range' && field.name === 'when_to_call' &&
                                <CustomIntRange>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        type="number"
                                        onChange={(e) => setWhenToCall(e.currentTarget.value + '—' + whenToCall.split('—')[1])}
                                        value={whenToCall.split('—')[0]}
                                        min={0}
                                        max={24}/>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        type="number"
                                        onChange={(e) => setWhenToCall(whenToCall.split('—')[0] + '—' + e.currentTarget.value)}
                                        value={whenToCall.split('—')[1]}
                                        min={0}
                                        max={24}/>
                                </CustomIntRange>
                            }
                            {['number', 'text', 'textarea', 'date'].includes(field.type) &&
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    type={field.type}
                                    onChange={formik.handleChange}
                                    value={formik.values[field.name]}
                                    min={field.type === 'number' ? 1 : null}
                                    max={field.type === 'number' ? 1000 : null}
                                />
                            }
                            {field.type === 'checkbox' &&
                                <>
                                    <Label type="checkbox" htmlFor={field.name}>{tr(field.name)}</Label>
                                    {i18n.exists('forms:' + field.name + '_subHeading') &&
                                        <SubHeading indent> {tr(field.name + '_subHeading', field.subHeading)}</SubHeading>}
                                </>
                            }
                            {formik.errors[field.name] && formik.touched[field.name] &&
                                <Alert role="alert"> {formik.errors[field.name]} </Alert>
                            }
                        </Field>;
                    })}

                <div style={{marginBottom: 40}}></div>

                <Button
                    type="submit"
                    disabled={formik.isSubmitting}
                    onClick={() => !formik.isValid && window.scrollTo(0, 0)}>
                    {formData ? tr("common:save") : tr("common:submit")}
                </Button>

                <div style={{marginBottom: 14}}></div>

                {formData && deleteButton}

                <div style={{marginBottom: 14}}></div>

                {toDelete && confirmationPopUp}

            </StyledForm>
        </div>
    );

    return success ? successView : form;
};

export default Form;
