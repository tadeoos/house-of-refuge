import {useState, useEffect} from 'react';
import Form from '../components/Form';
import Spinner from '../components/Spinner';
import {fields2, validationSchema2} from '../scripts/formSchema';
import axios from 'axios';
import TextWrapper from '../typography/TextWrapper';
import H2 from '../typography/H2';
import H4 from '../typography/H4';
import UseFulLinks from '../components/UsefulLinks';

const Find = ({user}) => {
    const [loading, setLoading] = useState(true);
    const [canAddMore, setCanAddMore] = useState(false);

    useEffect(async () => {
        return await axios({
            method: 'get',
            url: '/api/check_limit',
        })
            .catch(error => {

            })
            .then(res => {
                setLoading(false);
                setCanAddMore(res.data.can_add);
            });
    }, []);


    return (
        <>
            {loading ?
                <Spinner full/> :
                canAddMore ?
                    <Form
                        primaryText="Потребує житло"
                        secondaryText="Szukam noclegu"
                        fields={fields2}
                        validationSchema={validationSchema2}
                        url="/api/zglos"
                        successInfo="Дякуємо за подання."
                        localeNamespace='fields2'
                        fixedLocale="ua"
                        user={user}
                        canAddMore={true}
                    /> :
                    <TextWrapper maxWidth={620}>
                        <H2 strong>Доброго дня.</H2>
                        <H4>
                            <p>
                                На жаль, через великий попит на житло, наразі ми не можемо відповісти на більшу
                                кількість заявок. Будь ласка, спробуйте написати нам пізніше, а якщо притулок потрібен
                                Вам негайно або якщо хочете розширити пошук, Ви можете отримати безкоштовну допомогу
                                українською тут:
                            </p>
                        </H4>
                        < br/>
                        <UseFulLinks/>
                    </TextWrapper>
            }
        </>
    );
};

export default Find;


