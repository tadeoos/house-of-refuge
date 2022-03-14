import styled from 'styled-components';

const StyledPrivacy = styled.div`
  color: #898F9C;
  font-size: 15px;
  max-width: 650px;
  margin: auto;
  margin-top: 172px;

  h3 {
      margin-bottom: 36px;
  }

  p {
      text-align: initial;
      max-width: initial;
      margin: 1em 0;
  }
`;


const Privacy = ({ className }) => {

    return (
        <StyledPrivacy className={className}>
            <h3>
                Polityka prywatności / Політика конфіденційності
            </h3>
            <span>
                <p>
                    Hej. Jesteś tu, bo chcesz pomóc Ukraińcom i Ukrainkom, którzy znaleźli się w trudnej sytuacji materialnej w Polsce. Jedną z podstawowych potrzeb każdego z nas jest miejsce schronienia - dom, choćby tymczasowy, choćby prowizoryczny. Tworzymy oddolną, prywatną bazę danych dotyczącą takich miejsc, udostępnianych przez bliskich i znajomych na terenie Warszawy, mającą w pierwszej kolejności wspierać osoby zgłaszające się do Fundacji Ocalenie, w drugiej indywidualnie.
                </p>
                <p>
                    Do bazy ma dostęp jedynie Zofia Jaworowska i Katarzyna Kunda.
                </p>
                <p>
                    W przypadku zgłoszenia zapotrzebowania przez Fundację, będziemy łączyć osoby potrzebujące z Wami – osobami zgłaszającymi chęć pomocy (czyli jeśli do Fundacji zgłosi się trzyosobowa rodzina, spróbujemy spośród zgromadzonych ofert wsparcia znaleźć taką przestrzeń, która tę rodzinę pomieści na jak najdłużej). Zakładamy też, że zapotrzebowanie może pojawić się z innych źródeł – od osób prywatnych działających w sprawie.
                </p>
                <p>
                    Jeśli wyjeżdżacie, zwalniacie mieszkanie na miesiąc - taki zasób na pewno też się przyda. Działamy razem.
                </p>
                <p>
                    Dziękujemy, że tu jesteście.
                </p>
            </span>
        </StyledPrivacy>
    );
};

export default Privacy;
