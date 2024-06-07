// /lib/ga_log.js

/**
 * 发送事件到 Google Analytics
 * @param {string} action - 表示交互类型的字符串（例如 'click'）
 * @param {string} category - 事件类别（例如 'Video'）
 * @param {string} label - 事件标签（例如 'play'）
 * @param {string} value - 事件的数值（例如持续时间）
 */
export const logEvent = (action, category, label, value) => {
    window.gtag && window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
    });
}
