import React, {useState, useEffect} from 'react';
import {marked} from 'marked';

const isChinese = (char) => {
    return /[\u3400-\u9FBF]/.test(char);
};

const replaceReferences = (text, referenceData) => {
    const parts = text.split(/\[citation:(\d+)\]/g);
    // console.log(parts);
    return parts.map((part, index) => {
        if ((index % 2) === 1) {
            const refNumber = parseInt(part, 10) - 1;
            const refLink = referenceData ? referenceData[refNumber]?.link : '';
            if (refLink) {
                // 转换为 Markdown 链接格式
                return ` [<span class="text-blue-600 hover:text-blue-800 visited:text-purple-600 text-xs">[${refNumber + 1}]</span>](${encodeURI(refLink)})`;
            }
            return ``;
        }
        return part;
    }).join('');
}

const Markdown = ({content, referenceData}) => {
    const [displayedContent, setDisplayedContent] = useState('');
    const [cursorVisible, setCursorVisible] = useState(true);

    useEffect(() => {
        if (content === '') {
            setDisplayedContent('<span class="cursor"></span>');
            return;
        }

        let displayIndex = displayedContent.replace('<span class="cursor"></span>', '').length;

        const addCharacter = () => {
            let updatedContent = displayedContent.replace('<span class="cursor"></span>', '');
            let charsAdded = 0;
            const maxCharsToAdd = 10; // 一次添加多个字符

            while (displayIndex < content.length && charsAdded < maxCharsToAdd) {
                const currentChar = content.charAt(displayIndex);
                if (isChinese(currentChar) || charsAdded === 0) { // 优先添加一个中文字符
                    updatedContent += currentChar;
                    displayIndex++;
                    charsAdded++;
                } else {
                    let nonChineseSegment = '';
                    while (displayIndex < content.length && !isChinese(content.charAt(displayIndex)) && charsAdded < maxCharsToAdd) {
                        nonChineseSegment += content.charAt(displayIndex++);
                    }
                    updatedContent += nonChineseSegment;
                }
            }

            if (cursorVisible) {
                updatedContent += '<span class="cursor"></span>';
            }
            setDisplayedContent(updatedContent);

            if (displayIndex < content.length) {
                requestAnimationFrame(addCharacter);
            } else if (charsAdded === 0) {
                setCursorVisible(false);
                setDisplayedContent(updatedContent.replace('<span class="cursor"></span>', ''));
            }
        };

        requestAnimationFrame(addCharacter);

        return () => {
        }; // 清理函数（如果需要）
    }, [content, displayedContent, cursorVisible]);

    console.log(`****** content ******
    ${content}
    `);
    console.log(`****** displayedContent ******
    ${displayedContent}
    `);

    return (
        <div
            dangerouslySetInnerHTML={{__html: marked(referenceData?.length > 0 ? replaceReferences(displayedContent, referenceData) : (displayedContent))}}/>
    );
};

export default Markdown;