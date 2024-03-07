const dictionaries = {
    en: () => import('./dictionaries/en.json').then((module) => module.default),
    zh: () => import('./dictionaries/zh.json').then((module) => module.default),
    hi: () => import('./dictionaries/hi.json').then((module) => module.default),
}

export const getDictionary = async (locale) => dictionaries[locale]()