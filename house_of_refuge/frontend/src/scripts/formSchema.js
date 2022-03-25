import * as yup from 'yup';


export const fields1 = [
    {
        name: 'name',
        label: 'Imię i nazwisko',
        type: 'text'
    },
    {
        name: 'about_info',
        label: 'Powiedz coś o sobie?',
        subHeading: 'Z kim mieszkasz (jeśli przyjmujesz kogoś u siebie)?',
        type: 'textarea'
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
            },
            {
                value: 'mattress',
                label: 'Materac',
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
        label: 'Kod pocztowy',
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
        subHeading: 'Z kim mieszkasz (jeśli przyjmujesz kogoś u siebie)?',
        type: 'number'
    },
    {
        name: 'age',
        label: 'Ile masz lat?',
        type: 'number'
    },
    {
        name: 'languages',
        label: 'Języki jakie znasz',
        subHeading: 'Języki obce lokatorów i lokatorek',
        type: 'text'
    },
    {
        name: 'when_to_call',
        label: 'W jakich godzinach możemy do Ciebie dzwonić?',
        subHeading: 'Sporo ludzi przybywa po północy. Czy możemy do Ciebie zadzownic pózno w nocy? (Wybierz 0—24 jeżeli możemy dzwonić cały czas)',
        type: 'custom_int_range'
    },
    {
        name: 'costs',
        label: 'Koszty pobytu (czynsz, opłaty, koszty najmu lub darmowy pobyt)',
        type: 'text'
    },
    {
        name: 'availability',
        label: 'Od kiedy udostępniasz nocleg?',
        type: 'date'
    },
    {
        name: 'accommodation_length',
        label: 'Na jak długo udostępniasz nocleg? (liczba dni)',
        subHeading: 'Maksymalnie 1000 dni',
        type: 'number'
    },
    {
        name: 'details',
        label: 'Garść informacji o miejscu',
        subHeading: 'Np. dostępna pościel i ręczniki, inne',
        type: 'text'
    },
    {
        name: 'living_with_pets',
        label: 'Czy mieszkasz ze zwierzętami?',
        subHeading: 'Jeśli tak, wpisz z jakimi',
        type: 'text'
    },
    {
        name: 'can_take_person_with_pets',
        label: 'Czy możesz przyjąć osobę ze zwierzętami?',
        type: 'text'
    },
    {
        name: 'transport',
        label: 'Czy jesteś w stanie przyjechać po osoby, którym udzielisz schronienia?',
        subHeading: 'Np. na dworzec czy w podane miejsce pobytu',
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
        label: 'Awaryjny numer telefonu',
        subHeading: 'Dodatkowa osoba kontaktowa',
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

export const validationSchema1 = (t) => {
    return () => yup.object({
        name: yup.string().required(t('required')).max(512),
        about_info: yup.string().required(t('required')).max(2048),
        resource: yup.string().required(t('required')),
        city: yup.string().required(t('required')).max(512),
        zip_code: yup.string().required(t('required')).max(8),
        address: yup.string().required(t('required')).max(512),
        people_to_accommodate: yup.number().required(t('required')),
        age: yup.number().required(t('required')),
        languages: yup.string().required(t('required')).max(512),
        when_to_call: yup.string().required(t('required')),
        costs: yup.string().required(t('required')).max(1024),
        availability: yup.date().required(t('required')),
        accommodation_length: yup.number().required(t('required')).min(1).max(1000),
        details: yup.string().required(t('required')).max(2048),
        living_with_pets: yup.string().required(t('required')).max(1024),
        can_take_person_with_pets: yup.string().required(t('required')).max(512),
        transport: yup.string().required(t('required')),
        phone_number: yup.string().required(t('required'))
            .matches(/[\s#0-9_\-+/().]/, 'Niepoprawny numer telefonu'),
        backup_phone_number: yup.string().required(t('required'))
            .matches(/[\s#0-9_\-+/().]/, 'Niepoprawny numer telefonu'),
        email: yup.string().email('Niepoprawny adres email').required(t('required')),
    });
};

export const fields2 = [
    {
        name: 'name',
        label: 'Ім’я та прізвище',
        subHeading: 'name',
        type: 'text'
    },
    {
        name: 'phone_number',
        label: 'Ваш номер телефону',
        subHeading: 'phone_number',
        type: 'text'
    },
    {
        name: 'people',
        label: 'Кількість людей',
        subHeading: 'people',
        type: 'number'
    },
    {
        name: 'how_long',
        label: 'На який час необхідне житло? (кількість днів)',
        subHeading: 'how_long',
        type: 'number'
    },
    {
        name: 'description',
        label: 'Опишіть групу, вкажіть вік всіх прибулих і відносини між ними (наприклад: сім’я, друзі, одногрупники)',
        subHeading: 'description',
        type: 'text'
    },
    {
        name: 'origin',
        label: 'Національність ',
        subHeading: 'origin',
        type: 'text'
    },
    {
        name: 'traveling_with_pets',
        label: 'Ви приїхали з домашніми тваринами?',
        subHeading: 'traveling_with_pets',
        type: 'text'
    },
    {
        name: 'can_stay_with_pets',
        label: 'Можете Ви спати в домі де є домашні тварини? (вкажіть алергії)',
        subHeading: 'can_stay_with_pets',
        type: 'text'
    },
    {
        publicOnly: true,
        name: 'contact_person',
        label: 'Контактна особа',
        subHeading: 'contact_person',
        type: 'text'
    },
    {
        name: 'languages',
        label: 'Мови, якими Ви володієте ',
        subHeading: 'languages',
        type: 'text'
    },
    {
        name: 'when',
        label: 'З якого дня Вам необхідне житло?',
        subHeading: 'when',
        type: 'date'
    },
    {
        publicOnly: true,
        name: 'transport_needed',
        label: 'Мені потрібен транспорт',
        subHeading: 'transport',
        type: 'checkbox',
    },
    // below for logged in
    {
        loggedUser: true,
        name: 'note',
        label: 'Додаткові уваги',
        subHeading: 'note',
        type: 'text'
    },
    {
        loggedUser: true,
        name: 'receiver',
        type: 'hidden'
    },
    {
        loggedUser: true,
        name: 'source',
        label: 'Джерело',
        subHeading: 'source',
        type: 'select',
        options: [
            {
                value: 'terrain',
                label: 'source_option_terrain',
            },
            {
                value: 'webform',
                label: 'source_option_webform',
            },
            {
                value: 'mail',
                label: 'source_option_mail',
            },
            {
                value: 'other',
                label: 'source_option_other',
            },
        ]
    }
];

export const validationSchema2 = ({ publicOnly }) => yup.object({
    name: yup.string().required('Pole wymagane').max(512),
    phone_number: yup
        .string()
        .matches(/[\s#0-9_\-+/().]/, 'Niepoprawny numer telefonu')
        .required('Pole wymagane'),
    people: yup.number().required('Pole wymagane'),
    how_long: yup.number().required('Pole wymagane'),
    description: yup.string().required('Pole wymagane'),
    origin: yup.string().required('Pole wymagane'),
    traveling_with_pets: yup.string().required('Pole wymagane'),
    can_stay_with_pets: yup.string().required('Pole wymagane'),
    contact_person: publicOnly ? yup.string().required('Pole wymagane') : null,
    languages: yup.string().required('Pole wymagane'),
    when: yup.date().required('Pole wymagane'),
});



