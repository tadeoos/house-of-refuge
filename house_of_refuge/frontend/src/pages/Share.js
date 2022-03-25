
import Form from '../components/Form';
import { fields1, validationSchema1 } from '../scripts/formSchema';
import { useTranslation } from 'react-i18next';
import {useContext} from "react";
import {HomeContext} from "../scripts/home";

const Share = () => {
    const { t, i18n } = useTranslation();
    const uat = i18n.getFixedT('ua','common');
    const context = useContext(HomeContext);
    return (
        <Form
            primaryText={t("i_provide_accomodation")}
            secondaryText={uat('i_provide_accomodation')}
            fields={fields1}
            localeNamespace='fields1'
            validationSchema={validationSchema1(t)}
            url='/api/stworz_zasob'
            successInfo='Dziękujemy za zgłoszenie.'
            fixedLocale={context.selectedLang}/>
    );
};

export default Share;
