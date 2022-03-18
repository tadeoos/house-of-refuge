import ExternalLink from '../components/ExternalLink';
import styled from 'styled-components';
import React from 'react';

const StyledUseFulLinks = styled.div`
   h4 {
    font-size: 18px;
    margin: 0;
   }
   h5 {
    font-size: 18px;
    line-height: 1.2;
    margin: 0;
   }

   > ul > li {
       margin-bottom: 24px;

       li {
           margin-top: 6px;
           margin-bottom: 6px;
       }
   }

`;

const UseFulLinks = () => {

    return (
        <StyledUseFulLinks >
            <ul>
                <li>
                    <h4>Сайт Уряду <ExternalLink text='Pomagam Ukrainie' link='https://pomagamukrainie.gov.pl' /> </h4>
                </li>
                <li>
                    <h5>
                        <ExternalLink text='Український дім' link='https://ukrainskidom.pl/dom-pl' /> (цілодобова інфолінія: +48 727 805 764)
                    </h5>
                </li>
                <li>
                    <h5>
                        <ExternalLink
                            link='https://centrumwielokulturowe.waw.pl'
                            text='Centrum Wielokulturowe'
                        /> <br /> (щодня від 8:00 до 20:00: +48 22 648 11 11, +48 604 932 969)

                    </h5>
                </li>
                <li>
                    <h5>Варто зареєструватися в офіційних варшавських пунктах:</h5>
                    <h5>
                        <ul>
                            <li>Dworzec Zachodni i Dworzec Wschodni: цілодобово</li>
                            <li>Варшавська інфолінія для громадян України: 505 700 701, codziennie od 8:00 do 20:00</li>
                            <li>Miejskie Centrum Kontaktu Warszawa 19115 tel. 19115, цілодобово</li>
                            <li>
                                <ExternalLink
                                    link='https://um.warszawa.pl/-/uchodzco-tu-znajdziesz-pomoc-pobyt-w-warszawie'
                                    text='І до локальних пунктів інформаційних'
                                />
                            </li>
                            <li>Урядова інфолінія: 987l</li>
                        </ul>
                    </h5>
                </li>
                <li>
                    <h5>Зали для ночівлі:</h5>
                    <h5>
                        <ul>
                            <li>Punkt recepcyjny dla uchodźców  <ExternalLink
                                link='https://um.warszawa.pl/-/uchodzco-tu-znajdziesz-pomoc-pobyt-w-warszawie'
                                text='COS Torwar'
                            />
                            </li>
                            <li>PTAK EXPO Nadarzyn, ul. Katowicka 63, Hala E, wejście E7</li>
                            <li>Global EXPO Modlińska 6D</li>
                        </ul>
                    </h5>
                </li>
                <li>
                    <h5>Ночівлі в інших воєвудствах: <ExternalLink text='Grupa Granica' link='https://ukraina.grupagranica.pl/noclegi' /> </h5>
                </li>
                <li>
                    <h5>Додатки online: <ExternalLink text='uasos.org' link='https://uasos.org' />, <ExternalLink text='dopomoha.pl' link='https://dopomoha.pl' /> </h5>
                </li>
                <li>
                    <h5>Допомога особам з неповносправностями: <ExternalLink text='Mudita dla Ukrainy' link='https://stowarzyszeniemudita.pl/2022/03/08/mudita-dla-ukrainy/' /> </h5>
                </li>
            </ul>
        </StyledUseFulLinks>

    );
};

export default UseFulLinks;


