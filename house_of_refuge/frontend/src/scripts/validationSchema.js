import * as yup from 'yup';

export const validationSchema = yup.object({
    name: yup.string().required('Pole wymagane'),
    about_info: yup.string().required('Pole wymagane'),
    resource: yup.string().required('Pole wymagane'),
    city: yup.string().required('Pole wymagane'),
    zip_code: yup.string().required('Pole wymagane'),
    address: yup.string().required('Pole wymagane'),
    people_to_accommodate: yup.string().required('Pole wymagane'),
    costs: yup.string().required('Pole wymagane'),
    availability: yup.string().required('Pole wymagane'),
    accommodation_length: yup.string().required('Pole wymagane'),
    details: yup.string().required('Pole wymagane'),
    transport: yup.string().required('Pole wymagane'),
    phone_number: yup
        .string()
        .matches(/[\s#0-9_\-+/().]/, 'Niepoprawny numer telefonu')
        .required('Pole wymagane'),
    backup_phone_number: yup
        .string()
        .matches(/[\s#0-9_\-+/().]/, 'Niepoprawny numer telefonu')
        .required('Pole wymagane'),
    email: yup
        .string()
        .email('Niepoprawny adres email')
        .required('Pole wymagane'),
    extra: yup.string().required('Pole wymagane'),
});



