import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import Header from '../components/Header.js';
import {BigButton, FooterButton} from '../components/BigButton.js';
import Form from '../components/Form.js';
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
import {ToastContainer} from "react-toastify";
import '../i18n/config';
import {DEFAULT_LANG} from "../components/LangSwitch";
import {useTranslation} from "react-i18next";

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

const defaultValue = {
    selectedLang: DEFAULT_LANG,
    setSelectedLang: () => {
    }
};

export const HomeContext = React.createContext(defaultValue);


const App = (props) => {

    const [user] = useState(props.userData);
    const [lang, setLang] = useState(DEFAULT_LANG);
    const { t, i18n } = useTranslation('common');

    const contextValue = {
        selectedLang: lang,
        setSelectedLang: (lang) => {
            setLang(lang);
            i18n.changeLanguage(lang);
        }
    };

    return (
        <HomeContext.Provider value={contextValue}>
            <StyledApp>
                <ToastContainer autoClose={5000}/>
                <Header/>
                <Routes>
                    <Route index element={
                        <>
                            <ButtonWrap className={"mb-5 flex-grow-1"}>
                                <Link to="/share">
                                    <BigButton
                                        primaryText={t('i_provide_accomodation')}
                                        secondaryText="Можу надати житло"
                                        outlined={true}
                                        color={'black'}
                                    />
                                </Link>
                                <Link to="/find">
                                    <BigButton
                                        primaryText="Потребує житло"
                                        secondaryText={t('im_looking_for_accomodation')}
                                        color={colors.veryDarkGrey}
                                        backgroundColor={colors.optimisticYellow}
                                    />
                                </Link>
                                <div className={"w-100 my-3"}/>
                            </ButtonWrap>
                        </>
                    }/>
                    <Route path="/share" element={<Share/>}/>
                    <Route path="/find" element={<Find user={user}/>}/>
                    <Route path="/jazda/stolik" element={<>
                        <Form
                            primaryText="Потребує житло"
                            secondaryText="Szukam noclegu"
                            fields={fields2}
                            validationSchema={validationSchema2}
                            url="/api/zglos"
                            successInfo="Дякуємо за подання."
                            user={user}/>
                    </>}/>
                    <Route path="/edit" element={<Edit {...props} />}/>
                    <Route path="/page/:id" element={<CMS {...props} />}/>
                    <Route path="/map" element={<Map {...props} />}/>
                </Routes>
                <ButtonWrap className={"bg-light w-100 d-flex align-items-center justify-content-center"}>
                    <Link to="/map">
                        <FooterButton
                            primaryText="Хочу поїхати в іншу країну в Європі"
                            secondaryText={t('im_looking_for_accomodation_in_eu')}
                            color={colors.veryDarkGrey}/>
                    </Link>
                </ButtonWrap>
            </StyledApp>
        </HomeContext.Provider>
    );
};

ReactDOM.render(
    <BrowserRouter><App {...props} /></BrowserRouter>,
    window.react_mount,
);
