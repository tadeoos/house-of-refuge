import React, {useEffect, useState} from "react";
import TextWrapper from '../typography/TextWrapper';
import H5 from '../typography/H5';
import {useParams} from "react-router-dom";


const CMS = () => {
    const params = useParams();

    const [titlePrimary, setTitlePrimary] = useState('');
    const [contentPrimary, setContentPrimary] = useState('');

    const [titleSecondary, setTitleSecondary] = useState('');
    const [contentSecondary, setContentSecondary] = useState('');

    useEffect(() => {
        setTitlePrimary('Title');
        setTitleSecondary('Title');

        setContentPrimary('Content');
        setContentSecondary('Content');
    });

    return (
        <TextWrapper>
            <H5> { titlePrimary } / {titleSecondary}<br /></H5>
            <div className={"d-flex gap-5"}>
                <div className={"flex-grow-1"} dangerouslySetInnerHTML={{ __html: contentPrimary }}></div>
                <div className={"flex-grow-1"} dangerouslySetInnerHTML={{ __html: contentSecondary }}></div>
            </div>
        </TextWrapper>
    );
};

export default CMS;
