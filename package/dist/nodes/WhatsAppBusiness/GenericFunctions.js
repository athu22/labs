"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsAppApiRequest = whatsAppApiRequest;
exports.sendMessage = sendMessage;
exports.verifyMetaSignature = verifyMetaSignature;
exports.cleanUndefined = cleanUndefined;
exports.fetchMessageTemplates = fetchMessageTemplates;
exports.buildTemplateExampleMap = buildTemplateExampleMap;
exports.substitutePlaceholders = substitutePlaceholders;
const crypto_1 = require("crypto");
const n8n_workflow_1 = require("n8n-workflow");
async function whatsAppApiRequest(method, endpoint, body = {}, qs = {}) {
    var _a;
    const credentials = (await this.getCredentials('whatsAppBusinessApi'));
    const apiVersion = ((_a = credentials === null || credentials === void 0 ? void 0 : credentials.apiVersion) === null || _a === void 0 ? void 0 : _a.trim()) || 'v21.0';
    const baseUrl = `https://crmapi.1automations.com/api/meta/${apiVersion}`;
    const options = {
        method,
        url: `${baseUrl}${endpoint}`,
        qs,
        body,
        json: true,
    };
    if (method === 'GET' || Object.keys(body).length === 0) {
        delete options.body;
    }
    if (Object.keys(qs).length === 0) {
        delete options.qs;
    }
    try {
        return (await this.helpers.httpRequestWithAuthentication.call(this, 'whatsAppBusinessApi', options));
    }
    catch (error) {
        throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
    }
}
async function sendMessage(payload) {
    const credentials = (await this.getCredentials('whatsAppBusinessApi'));
    if (!(credentials === null || credentials === void 0 ? void 0 : credentials.phoneNumberId)) {
        throw new n8n_workflow_1.NodeApiError(this.getNode(), {
            message: 'Phone Number ID is missing from credentials.',
        });
    }
    return whatsAppApiRequest.call(this, 'POST', `/${credentials.phoneNumberId}/messages`, {
        messaging_product: 'whatsapp',
        ...payload,
    });
}
function verifyMetaSignature(appSecret, rawBody, signatureHeader) {
    if (!signatureHeader)
        return false;
    const provided = signatureHeader.startsWith('sha256=') ? signatureHeader.slice('sha256='.length) : signatureHeader;
    const expected = (0, crypto_1.createHmac)('sha256', appSecret)
        .update(typeof rawBody === 'string' ? Buffer.from(rawBody) : rawBody)
        .digest('hex');
    const a = Buffer.from(provided, 'hex');
    const b = Buffer.from(expected, 'hex');
    if (a.length !== b.length)
        return false;
    return (0, crypto_1.timingSafeEqual)(a, b);
}
function cleanUndefined(input) {
    for (const key of Object.keys(input)) {
        const value = input[key];
        if (value === undefined || value === null || value === '') {
            delete input[key];
        }
        else if (typeof value === 'object' && !Array.isArray(value)) {
            cleanUndefined(value);
            if (Object.keys(value).length === 0) {
                delete input[key];
            }
        }
    }
    return input;
}
async function fetchMessageTemplates() {
    var _a, _b;
    const credentials = (await this.getCredentials('whatsAppBusinessApi'));
    const wabaId = (_a = credentials === null || credentials === void 0 ? void 0 : credentials.businessAccountId) === null || _a === void 0 ? void 0 : _a.trim();
    if (!wabaId) {
        throw new n8n_workflow_1.NodeApiError(this.getNode(), {
            message: 'WABA ID is missing from credentials. Set it on the WhatsApp Business credential.',
        });
    }
    const response = await whatsAppApiRequest.call(this, 'GET', `/${wabaId}/message_templates`, {}, { json: 'true' });
    const list = (_b = response.data) !== null && _b !== void 0 ? _b : response;
    return Array.isArray(list) ? list : [];
}
function buildTemplateExampleMap(template) {
    var _a, _b, _c, _d;
    const examples = {};
    const components = (_a = template.components) !== null && _a !== void 0 ? _a : [];
    for (const component of components) {
        const type = String((_b = component.type) !== null && _b !== void 0 ? _b : '').toLowerCase();
        const example = component.example;
        if (!example)
            continue;
        if (type === 'header') {
            const format = String((_c = component.format) !== null && _c !== void 0 ? _c : '').toLowerCase();
            const handle = example.header_handle;
            if (format && (handle === null || handle === void 0 ? void 0 : handle.length)) {
                examples[`header#${format}`] = handle[0];
            }
            const headerText = example.header_text;
            if (headerText === null || headerText === void 0 ? void 0 : headerText.length) {
                examples['header#text'] = headerText[0];
            }
        }
        if (type === 'body') {
            const bodyText = example.body_text;
            const row = (_d = bodyText === null || bodyText === void 0 ? void 0 : bodyText[0]) !== null && _d !== void 0 ? _d : [];
            row.forEach((value, idx) => {
                examples[`body#${idx + 1}`] = String(value);
            });
        }
    }
    return examples;
}
const PLACEHOLDER_PATTERN = /\{\{\s*([^}]+?)\s*\}\}/g;
function substitutePlaceholders(value, vars) {
    if (typeof value === 'string') {
        return value.replace(PLACEHOLDER_PATTERN, (match, key) => {
            const trimmed = key.trim();
            return Object.prototype.hasOwnProperty.call(vars, trimmed) ? vars[trimmed] : match;
        });
    }
    if (Array.isArray(value)) {
        return value.map((entry) => substitutePlaceholders(entry, vars));
    }
    if (value && typeof value === 'object') {
        const out = {};
        for (const [k, v] of Object.entries(value)) {
            out[k] = substitutePlaceholders(v, vars);
        }
        return out;
    }
    return value;
}
//# sourceMappingURL=GenericFunctions.js.map