import {useFormik} from 'formik';
import {useState, useEffect} from 'react';
import axios from 'axios';
import {getCookie} from "../scripts/utils";
import Form from '../components/Form.js';
import {fields1, validationSchema1} from '../scripts/formSchema';
import * as yup from 'yup';
import {StyledForm, Label, Input, Button, Alert, Success} from '../components/FormComponents';
import {useSearchParams} from "react-router-dom";
import {useTranslation} from 'react-i18next';

const Edit = () => {
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState(null);
    const [searchParams] = useSearchParams();
    const {t, i18n} = useTranslation();
    const uat = i18n.getFixedT('ua');

    useEffect(() => {
        if (searchParams.has("t")) {
            const token = searchParams.get("t");
            if (token) {
                const data = {
                    method: 'post',
                    url: '/api/edit',
                    data: {
                        token
                    },
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken'),
                    },
                };

                return axios(data)
                    .then(res => setFormData(res.data.formData));
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
            const data = {
                method: 'post',
                url: '/api/send_email_token',
                data: values,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
            };

            return await axios(data)
                .then(res => {
                    if (res.status === 204) {
                        setSuccess(true);
                    }
                });
        }
    });


    const successInfo = <Success> Sprawdź swojego maila </Success>;

    const formWithFormData =
        <Form
            formData={formData}
            primaryText={t("i_provide_accomodation")}
            secondaryText={uat('i_provide_accomodation')}
            fields={fields1}
            localeNamespace="fields1"
            fixedLocale={false}
            validationSchema={validationSchema1}
            url="/api/stworz_zasob"
            successInfo="Zmodyfikowalismy Twoje zgłoszenie."/>;

    const formWithoutFormData =
        <StyledForm onSubmit={formik.handleSubmit}>
            <Label htmlFor="email"> W celu edycji podaj swój adres email </Label>
            <Input
                name="email"
                type="text"
                onChange={formik.handleChange}
                value={formik.values['email']}/>

            {formik.errors['email'] && formik.touched['email'] ? (
                <Alert role="alert"> {formik.errors['email']} </Alert>
            ) : null}

            <div style={{marginBottom: 14}}></div>

            <Button type="submit" disabled={formik.isSubmitting}>
                Wyślij
            </Button>
        </StyledForm>;

    return (
        <div className={"flex-grow-1"}>
            {success ? successInfo : (formData ? formWithFormData : formWithoutFormData)}
        </div>
    );
};

export default Edit;
