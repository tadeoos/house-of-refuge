import * as yup from 'yup';

export const validationSchema = yup.object({
    name: yup.string().required('Required field'),
    email: yup
        .string()
        .email('Incorrect email address')
        .required('Required field'),
    phone: yup
        .string()
        .matches(/[\s#0-9_\-+/().]/, 'Incorrect phone number')
        .required('Required field'),
});



