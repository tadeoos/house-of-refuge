import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import axios from "axios";
import LangSwitch, {DEFAULT_LANG, LANGS} from "./LangSwitch";

export class CmsResource {

    static instance;

    data = [];

    static getInstance() {
        if (!this.instance) {
            this.instance = new CmsResource();
        }

        return this.instance;
    }

    fetch() {
        return axios.get('/api/menu_pages')
            .then(response => {
                this.data = response.data;
                return this.data;
            });
    }

    isFetched() {
        return this.data.length > 0;
    }

    getData() {
        if (!this.isFetched()) {
            return this.fetch();
        }

        return new Promise(resolve => resolve(this.data));
    }

}


const CMS = () => {
    const params = useParams();
    const [page, setPage] = useState(null);
    const [lang, setLang] = useState(DEFAULT_LANG);


    useEffect(() => {
        CmsResource.getInstance().getData()
            .then(data => {
                const cmsPage = data.find(d => d.slug === params.id);
                if (cmsPage) {
                    setPage(cmsPage);
                }
            });
    });

    function toggleText(lang, primary, secondary) {
        return lang === DEFAULT_LANG ? primary : (secondary ?? primary);
    }

    const langs = page && page.content_secondary_language ? LANGS : [DEFAULT_LANG];

    return (
        page &&
        <div>
            { langs.length > 1 && <div className={"d-flex justify-content-end"}>
                <LangSwitch languages={langs} currentLang={lang} changeLang={(x) => setLang(x)}/>
            </div> }
            <div className={"d-flex gap-5 w-100"}>
                <div className={"flex-grow-1"}
                     dangerouslySetInnerHTML={{__html: toggleText(lang, page.content_primary_language, page.content_secondary_language)}}></div>
            </div>
        </div>
    );
};

export default CMS;
