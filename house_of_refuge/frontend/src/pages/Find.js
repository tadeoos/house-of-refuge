import { useState, useEffect } from 'react';
import Form from '../components/Form';
import Spinner from '../components/Spinner';
import { fields2, validationSchema2 } from '../scripts/formSchema';
import axios from 'axios';
import TextWrapper from '../typography/TextWrapper';
import H2 from '../typography/H2';
import H3 from '../typography/H3';
import H4 from '../typography/H4';
import H5 from '../typography/H5';


const Find = ({ user }) => {
    const [loading, setLoading] = useState(true);
    const [canAddMore, setCanAddMore] = useState(false);

    useEffect(async () => {
        return await axios({
            method: 'get',
            url: '/api/check_limit',
        })
            .catch(error => {
                console.log("ERROR: ", error);
            })
            .then(res => {
                setLoading(false);
                setCanAddMore(res.data.can_add);
            });
    }, []);


    return (
        <>
            {loading ?
                <Spinner full /> :
                canAddMore ?
                    <Form
                        primaryText="Потребує житло"
                        secondaryText="Szukam noclegu"
                        fields={fields2}
                        validationSchema={validationSchema2}
                        url='/api/zglos'
                        successInfo='Дякуємо за подання.'
                        user={user}
                        canAddMore={true}
                    /> :
                    <TextWrapper>
                        <H2 strong>Cześć</H2>
                        <H4>
                            <p>
                                Niestety ze względu na duże zapotrzebowanie na noclegi dziś już nie jesteśmy w stanie odpowiedzieć na większą liczbę zgłoszeń. Spróbuj napisać do nas jutro, a jeśli potrzebujesz schronienia natychmiast lub chcesz poszerzyć poszukiwania, tu możesz uzyskać pomoc:
                            </p>
                        </H4>
                        <H3 spaceTop strong>Hale noclegowe</H3>
                        <ul>
                            <li><H5>EXPO Nadarzyn</H5></li>
                            <li><H5>EXPO Modlińska</H5></li>
                        </ul>
                        <H3 spaceTop strong>Fundacje pomocowe</H3>
                        <ul>
                            <li><H5>Ukraiński Dom</H5></li>
                            <li><H5>Centrum Wielokulturowe</H5></li>
                            <li><H5>Stowarzyszenie Mudita</H5></li>
                        </ul>
                        <H3 spaceTop strong>Aplikacje online</H3>
                        <ul>
                            <li><H5>sosua.org</H5></li>
                            <li><a href="https://dopomoha.pl/" target="_blank" rel="noopener noreferrer"><H5>dopomoha.pl </H5></a></li>
                        </ul>
                    </TextWrapper>
            }
        </>
    );
};

export default Find;


