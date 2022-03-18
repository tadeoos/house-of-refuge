import React from 'react';
import Form from '../components/Form';
import { fields1, validationSchema1 } from '../scripts/formSchema';

const Share = () => {
    return (
        <Form
            formData={undefined}
            canAddMore={undefined}
            user={undefined}
            primaryText="Udostępniam nocleg"
            secondaryText="Можу надати житло"
            fields={fields1}
            validationSchema={validationSchema1}
            url='/api/stworz_zasob'
            successInfo='Dziękujemy za zgłoszenie.'
        />
    );
};

export default Share;
