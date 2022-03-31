import {useState} from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import Header from '../components/Header.js';
import BigButton from '../components/BigButton.js';
import Form from '../components/Form.js';
import Privacy from '../components/Privacy.js';
import Edit from '../components/Edit.js';
import {fields2, validationSchema2} from './formSchema';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";
import {colors} from '../theme';
import Share from '../pages/Share';
import Find from '../pages/Find';
import CMS from "../components/CMS";
import Map from "../components/Map";

const StyledApp = styled.div`
  font-family: 'proxima-nova', sans-serif;
  color: #212121;
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 75px;
  min-height: 100vh;
  .Footer {
    justify-content: flex-end;
  }
  `;

const ButtonWrap = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 30px;
  > a {
    color: inherit;
    text-decoration: none;
    display: flex;
  }
`;


const ByeDiv = styled.div`
  max-width: 48vw;
  padding: 10px;
`;

const App = (props) => {
  const [user] = useState(props.userData);

  return (
      <StyledApp>
        <Header/>
        <Routes>
          <Route index element={<>
            <ButtonWrap className={"flex-grow-1"}>
              <Link to="/map">
                <BigButton
                    primaryText="Хочу поїхати в іншу країну в Європі"
                    secondaryText="Chcę jechać do innego kraju w Europie"
                    outlined
                    color={colors.veryDarkGrey}
                />
              </Link>
            </ButtonWrap>
            <div className={"d-flex"}>
              <ByeDiv>
                <p>
                  31 marca skończyliśmy nasze działania. Łącznie udało nam się znaleźć schronienie dla 5500 osób z
                  Ukrainy. Dziękujemy wszystkim gospodyniom i gospodarzom, którzy otworzyli swoje domy i serca. To, co
                  razem zbudowaliśmy to wartość, która zostanie z nami już na zawsze.</p>
                <p>
                  <a href={'https://www.facebook.com/groups/zasobygrupa'}>Grupa facebookowa Zasobów</a> pozostaje otwarta. Jeśli będziemy wracać z działaniami, tam będziemy o tym
                  informować. Tam znajdziecie także raport z naszych działań i wszelkie aktualności wokół Zasobów.
                </p>
                <p>
                  Wciąż uzupełniamy mapę zagranicznych noclegów, z której możecie czerpać informacje o tym, gdzie na
                  Waszych gości i przyjaciół czeka kompleksowa pomoc (przycisk do mapy poniżej).
                </p>
                <p>
                  Jeśli nie udało nam się skontaktować z Wami, gospodarzami i gospodyniami, w ciągu ostatniego miesiąca,
                  a nadal chcielibyście użyczyć komuś schronienia, zgłoście się do miejskiego programu mieszkaniowego
                  lub do Ukraińskiego Domu. Ich działania dopiero się rozkręcają!
                </p>
                <p>
                  Dziękujemy ❤️<br/>️
                  Grupa Zasoby
                </p>
              </ByeDiv>
              <ByeDiv>
                <p>
                  31 березня ми закінчили свою діяльність. Нам вдалося знайти прихисток для 5500 осіб з України. Дякуємо
                  всім господиням та господарям, які відкрили свої будинки та серця. Те, що ми спільно побудували – це
                  цінність, яка залишиться з нами назавжди.</p>
                <p>Група у Фейсбуці Zasoby залишається відкритою. Якщо вирішимо повернутися до своєї діяльності, то
                  проінформуємо про це в ній. Також там зможете знайти звіти про нашу роботу та всю актуальну інформацію
                  щодо нас.</p>
                <p>Продовжуємо заповнювати мапу з місцями прихистку закордоном, з якої можна дізнатися, де на ваших
                  гостей та
                  друзів чекає комплексна допомога.</p>
                Якщо все ще потребуєш прихистку, можеш сконтактуватись з:
                <ul>
                  <li><a href={'https://ukrainskidom.pl/'}>Domu Ukraińskiego</a>, ul. Zamenhofa 1, infolinia: +48
                    727 805 764 (9:00-21:00)
                  </li>
                  <li><a href={'https://centrumwielokulturowe.waw.pl/ukraina/'}>Centrum Wielokulturowego</a>, ul. Jagiellońska 54 tel.
                    +48 22 648 11 11, czynne codziennie w godz. od 8:00 do 20:00
                  </li>
                  <li>
                    <a href={'https://www.pomocy.waw.pl/przykladowa-strona/osrodki-pomocy-spolecznej/'}>
                      Miejskich Ośrodków Pomocy Społecznej
                    </a>
                  </li>
                  <li>Całodobowych punktów Informacyjnych na Dworcu Zachodnim Autobusowym (al. Jerozolimskie 142 w
                    Punkcie
                    Obsługi Pasażera) i Dworcu Wschodnim (ul. Kijowska 20, hala główna - szklany kontener)
                  </li>
                  <li>
                    <a href={"https://uasos.org/"}>UA SOS</a>
                  </li>
                </ul>
                <p>Додатково, діє Варшавська Інфолінія для громадян України (з 08:00 до 20:00): 505 700 701
                  Якщо знаходишся в небезпечній ситуації або хтось порушує твою гідність, тоді сконтактуйся з <a href={'https://www.strada.org.pl/'}>Fundacją La Strada</a> (+48 605 687 750)<br/>
                  ❤️
                </p>
              </ByeDiv>
            </div>
          </>}/>
          <Route path="/jazda/stolik" element={<>
            <Form
                primaryText="Потребує житло"
                secondaryText="Szukam noclegu"
                fields={fields2}
                validationSchema={validationSchema2}
                url="/api/zglos"
                successInfo="Дякуємо за подання."
                user={user}
            />
          </>}/>
          <Route path="/edit" element={<Edit {...props} />}/>
          <Route path="/page/:id" element={<CMS {...props} />}/>
          <Route path="/map" element={<Map {...props} />}/>
        </Routes>
      </StyledApp>
  );
};

ReactDOM.render(
    <BrowserRouter><App {...props} /></BrowserRouter>,
    window.react_mount,
);
