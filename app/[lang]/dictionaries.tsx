// Define the structure of your dictionary files
export interface Dictionary {
    header: {
        slogan: string;
    };
    search: {
        placeholder: string;
        refInfo: string;
        moreQs: string;
    };
    footer: {
        blog: string;
        forum: string;
        feedback: string;
    };
}

// Adjust the dictionaries object to use the Dictionary type
const dictionaries: { [locale: string]: () => Promise<Dictionary> } = {
    en: () => import('./dictionaries/en.json').then((module) => module.default as Dictionary),
zh: () => import('./dictionaries/zh.json').then((module) => module.default as Dictionary),
hi: () => import('./dictionaries/hi.json').then((module) => module.default as Dictionary),
};

// Adjust the getDictionary function to return a Promise of Dictionary
export const getDictionary = async (locale: string): Promise<Dictionary> => {
    return dictionaries[locale]();
};