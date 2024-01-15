import React from 'react';
import {marked} from 'marked';

const Markdown = ({content}) => {
    const htmlContent = marked(content);

    return <div dangerouslySetInnerHTML={{__html: htmlContent}}/>;
};

export default Markdown;
