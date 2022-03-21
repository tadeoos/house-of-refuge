
import Form from '../components/Form';
import { fields1, validationSchema1 } from '../scripts/formSchema';
import { useTranslation } from 'react-i18next';

const Share = () => {
    const { t, i18n } = useTranslation();
    const uat = i18n.getFixedT('ua','common');
    return (
        <Form
            primaryText={t("i_provide_accomodation")}
            secondaryText={uat('i_provide_accomodation')}
            fields={fields1}
            localeNamespace='fields1'
            validationSchema={validationSchema1}
            url='/api/stworz_zasob'
            successInfo='Dziękujemy za zgłoszenie.'
        />
    );
};

export default Share;
