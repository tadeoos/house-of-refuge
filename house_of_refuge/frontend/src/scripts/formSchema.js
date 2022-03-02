import * as yup from 'yup';

export const fields1 = [
    {
        name: 'name',
        label: 'Imię i nazwisko',
        type: 'text'
    },
    {
        name: 'about_info',
        label: 'Powiedz coś o sobie - ile masz lat? Z kim mieszkasz (jeśli przyjmujesz kogoś u siebie)?',
        type: 'text'
    },
    {
        name: 'resource',
        label: 'Zasób',
        type: 'radio',
        choice: [
            {
                value: 'home',
                label: 'Dom',
            },
            {
                value: 'flat',
                label: 'Mieszkanie',
            },
            {
                value: 'room',
                label: 'Pokój',
            },
            {
                value: 'couch',
                label: 'Kanapa',
            }
        ]
    },
    {
        name: 'city',
        label: 'Miasto',
        type: 'text'
    },
    {
        name: 'zip_code',
        label: 'Kod poczotwy',
        type: 'text'
    },
    {
        name: 'address',
        label: 'Adres (ulica, numer budynku, numer mieszkania)',
        type: 'text'
    },
    {
        name: 'people_to_accommodate',
        label: 'Ile osób jesteś w stanie wesprzeć tak, by miały godne warunki pobytu?',
        type: 'text'
    },
    {
        name: 'costs',
        label: 'Koszty pobytu (czynsz, opłaty, koszty najmu lub darmowy pobyt)',
        type: 'text'
    },
    {
        name: 'availability',
        label: 'Od kiedy udostępniasz nocleg?',
        type: 'text'
    },
    {
        name: 'accommodation_length',
        label: 'Na jak długo udostępniasz nocleg?',
        type: 'text'
    },
    {
        name: 'details',
        label: 'Garść informacji o miejscu (obecność zwierząt, języki obce lokatorów i lokatorek, dostępna pościel i ręczniki, inne)',
        type: 'text'
    },
    {
        name: 'transport',
        label: 'Czy jesteś w stanie przyjechać po osoby, którym udzielisz schronienia na dworzec/w podane miejsce pobytu?',
        type: 'radio',
        choice: [
            {
                value: 'warsaw',
                label: 'Tak, na terenie Warszawy',
            },
            {
                value: 'poland',
                label: 'Tak, na terenie Warszawy i Polski',
            },
            {
                value: 'none',
                label: 'Nie',
            }
        ]
    },
    {
        name: 'phone_number',
        label: 'Twój numer telefonu',
        type: 'text'
    },
    {
        name: 'backup_phone_number',
        label: 'Awaryjny numer telefonu (dodatkowa osoba kontaktowa)',
        type: 'text'
    },
    {
        name: 'email',
        label: 'Twój mail',
        type: 'text'
    },
    {
        name: 'extra',
        label: 'Dodatkowe uwagi',
        type: 'text'
    },
];

export const validationSchema1 = yup.object({
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



