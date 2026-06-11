import { getTranslationKey } from './locale-loader.js';

/**
 * Formats translation templates replacing variables: {customerName} -> variables.customerName
 * 
 * @param {string} templateStr
 * @param {Object} variables
 * @returns {string} Formatted string
 */
export function formatMessage(templateStr, variables = {}) {
  let message = templateStr;

  Object.entries(variables).forEach(([key, val]) => {
    const placeholder = `{${key}}`;
    message = message.replaceAll(placeholder, val !== undefined && val !== null ? String(val) : '');
  });

  return message;
}

/**
 * Translate an interface label (UI).
 * 
 * @param {string} key - Translation key
 * @param {string} language - Target language
 * @param {Object} [variables] - Formatting values
 * @returns {string} Localized text
 */
export function t(key, language, variables = {}) {
  const template = getTranslationKey(key, 'ui', language);
  return formatMessage(template, variables);
}

/**
 * Translate a notification, email, or WhatsApp message template.
 * 
 * @param {string} key - Template message key
 * @param {string} language - Target language
 * @param {Object} [variables] - Intersect variables
 * @returns {string} Localized template message
 */
export function tMessage(key, language, variables = {}) {
  const template = getTranslationKey(key, 'messages', language);
  return formatMessage(template, variables);
}
