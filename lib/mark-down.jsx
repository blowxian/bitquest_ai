import React, {useState, useEffect} from 'react';
import {marked} from 'marked';

const isChinese = (char) => {
    return /[\u3400-\u9FBF]/.test(char);
};

const Markdown = ({content}) => {
    const [displayedContent, setDisplayedContent] = useState('');
    const [cursorVisible, setCursorVisible] = useState(true);

    useEffect(() => {
        console.log('Markdown content: ', content);

        // Clear the displayed content only if the content prop is empty
        if (content === '') {
            setDisplayedContent('<span class="cursor"></span>');
            return;
        }

        let displayIndex = displayedContent.replace('<span class="cursor"></span>', '').length;
        let timer;

        const addCharacter = () => {
            console.log('dispalyIndex,content.length: ', displayIndex, content.length);
            if (displayIndex < content.length) {
                // 移除现有的光标
                let updatedContent = displayedContent.replace('<span class="cursor"></span>', '');

                const currentChar = content.charAt(displayIndex);
                if (isChinese(currentChar)) {
                    updatedContent += currentChar;
                    displayIndex++;
                } else {
                    let nonChineseSegment = '';
                    while (displayIndex < content.length && !isChinese(content.charAt(displayIndex))) {
                        nonChineseSegment += content.charAt(displayIndex++);
                    }
                    updatedContent += nonChineseSegment;
                }

                // 如果光标可见，再添加光标
                if (cursorVisible) {
                    updatedContent += '<span class="cursor"></span>';
                }
                setDisplayedContent(updatedContent);
            } else if(/<\/s>$/.test(content)) {
                setCursorVisible(false);
                setDisplayedContent(displayedContent.replace('<span class="cursor"></span>', ''));
                clearInterval(timer);
            }
        };

        timer = setInterval(addCharacter, 60);

        return () => clearInterval(timer);
    }, [content, displayedContent, cursorVisible]);

    return (
        <div dangerouslySetInnerHTML={{__html: marked(displayedContent)}}/>
    );
};

export default Markdown;
