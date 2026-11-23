"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppBusinessByAutomationsBuilder = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const GenericFunctions_1 = require("./GenericFunctions");
const SessionMessageDescription_1 = require("./descriptions/SessionMessageDescription");
const TemplateMessageDescription_1 = require("./descriptions/TemplateMessageDescription");
function normalizePhone(input) {
    return input.replace(/[\s\-()]/g, '').replace(/^\+/, '');
}
function withContext(payload, replyTo) {
    if (replyTo) {
        payload.context = { message_id: replyTo };
    }
    return payload;
}
class WhatsAppBusinessByAutomationsBuilder {
    constructor() {
        this.description = {
            displayName: 'WhatsApp Business API by Automations Builder',
            name: 'whatsAppBusinessByAutomationsBuilder',
            icon: 'file:whatsapp.svg',
            group: ['transform'],
            version: 1,
            subtitle: '={{$parameter["operation"]}}',
            description: 'Send WhatsApp Business API session and template messages',
            defaults: { name: 'WhatsApp Business API by Automations Builder' },
            inputs: ['main'],
            outputs: ['main'],
            credentials: [
                {
                    name: 'whatsAppBusinessApi',
                    required: true,
                },
            ],
            properties: [
                {
                    displayName: 'Resource',
                    name: 'resource',
                    type: 'hidden',
                    noDataExpression: true,
                    default: 'message',
                },
                ...SessionMessageDescription_1.sessionMessageOperations,
                ...SessionMessageDescription_1.sessionMessageFields,
                ...TemplateMessageDescription_1.templateMessageFields,
            ],
        };
        this.methods = {
            loadOptions: {
                async getTemplates() {
                    const templates = await GenericFunctions_1.fetchMessageTemplates.call(this);
                    return templates
                        .map((t) => {
                        var _a, _b, _c, _d;
                        const name = String((_a = t.name) !== null && _a !== void 0 ? _a : '');
                        const language = String((_b = t.language) !== null && _b !== void 0 ? _b : '');
                        const status = String((_c = t.status) !== null && _c !== void 0 ? _c : '');
                        const id = String((_d = t.id) !== null && _d !== void 0 ? _d : name);
                        return {
                            name: `${name} (${language}, ${status})`,
                            value: id,
                            description: t.category || undefined,
                        };
                    })
                        .sort((a, b) => a.name.localeCompare(b.name));
                },
            },
            resourceMapping: {
                async getTemplateVariables() {
                    var _a;
                    const templateId = this.getNodeParameter('templateName', '');
                    if (!templateId)
                        return { fields: [] };
                    const templates = await GenericFunctions_1.fetchMessageTemplates.call(this);
                    const template = templates.find((t) => String(t.id) === templateId || String(t.name) === templateId);
                    if (!template)
                        return { fields: [] };
                    const variables = (_a = template.variables) !== null && _a !== void 0 ? _a : [];
                    const examples = (0, GenericFunctions_1.buildTemplateExampleMap)(template);
                    return {
                        fields: variables.map((variable) => {
                            var _a;
                            return ({
                                id: variable,
                                displayName: variable,
                                defaultMatch: false,
                                canBeUsedToMatch: false,
                                required: true,
                                display: true,
                                type: 'string',
                                defaultValue: (_a = examples[variable]) !== null && _a !== void 0 ? _a : null,
                            });
                        }),
                    };
                },
            },
        };
    }
    async execute() {
        var _a, _b, _c, _d, _e;
        const items = this.getInputData();
        const returnData = [];
        const templateCache = new Map();
        for (let i = 0; i < items.length; i++) {
            try {
                const operation = this.getNodeParameter('operation', i);
                const rawTo = this.getNodeParameter('to', i, '');
                const to = normalizePhone(rawTo);
                if (!to) {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Recipient phone number is required.', {
                        itemIndex: i,
                    });
                }
                const replyTo = this.getNodeParameter('replyTo', i, '') || undefined;
                let payload = { recipient_type: 'individual', to };
                switch (operation) {
                    case 'sendText': {
                        const text = this.getNodeParameter('text', i);
                        const previewUrl = this.getNodeParameter('previewUrl', i, true);
                        payload = withContext({
                            ...payload,
                            type: 'text',
                            text: { body: text, preview_url: previewUrl },
                        }, replyTo);
                        break;
                    }
                    case 'sendMedia': {
                        const mediaType = this.getNodeParameter('mediaType', i);
                        const source = this.getNodeParameter('mediaSource', i);
                        const caption = mediaType === 'image' || mediaType === 'video' || mediaType === 'document'
                            ? this.getNodeParameter('caption', i, '') || undefined
                            : undefined;
                        const filename = mediaType === 'document' ? this.getNodeParameter('filename', i, '') || undefined : undefined;
                        const media = {};
                        if (source === 'url') {
                            media.link = this.getNodeParameter('mediaUrl', i);
                        }
                        else {
                            media.id = this.getNodeParameter('mediaId', i);
                        }
                        if (caption)
                            media.caption = caption;
                        if (filename)
                            media.filename = filename;
                        payload = withContext({
                            ...payload,
                            type: mediaType,
                            [mediaType]: media,
                        }, replyTo);
                        break;
                    }
                    case 'sendLocation': {
                        const location = (0, GenericFunctions_1.cleanUndefined)({
                            latitude: this.getNodeParameter('latitude', i),
                            longitude: this.getNodeParameter('longitude', i),
                            name: this.getNodeParameter('locationName', i, '') || undefined,
                            address: this.getNodeParameter('address', i, '') || undefined,
                        });
                        payload = withContext({ ...payload, type: 'location', location }, replyTo);
                        break;
                    }
                    case 'sendContacts': {
                        const contactsCol = this.getNodeParameter('contacts', i, {});
                        const contacts = ((_a = contactsCol.contact) !== null && _a !== void 0 ? _a : []).map(buildContactPayload);
                        if (contacts.length === 0) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Add at least one contact.', {
                                itemIndex: i,
                            });
                        }
                        payload = withContext({ ...payload, type: 'contacts', contacts }, replyTo);
                        break;
                    }
                    case 'sendInteractive': {
                        const interactiveType = this.getNodeParameter('interactiveType', i);
                        const body = this.getNodeParameter('interactiveBody', i);
                        const headerType = this.getNodeParameter('headerType', i, 'none');
                        const footerText = this.getNodeParameter('interactiveFooter', i, '');
                        const interactive = {
                            type: interactiveType,
                            body: { text: body },
                        };
                        if (headerType === 'text') {
                            const headerText = this.getNodeParameter('interactiveHeaderText', i, '');
                            if (headerText)
                                interactive.header = { type: 'text', text: headerText };
                        }
                        else if (headerType === 'image' || headerType === 'video' || headerType === 'document') {
                            const link = this.getNodeParameter('interactiveHeaderMediaUrl', i, '');
                            if (!link) {
                                throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Header media URL is required for ${headerType} headers.`, { itemIndex: i });
                            }
                            const media = { link };
                            if (headerType === 'document') {
                                const filename = this.getNodeParameter('interactiveHeaderFilename', i, '');
                                if (filename)
                                    media.filename = filename;
                            }
                            interactive.header = { type: headerType, [headerType]: media };
                        }
                        if (footerText)
                            interactive.footer = { text: footerText };
                        if (interactiveType === 'button') {
                            const buttonsCol = this.getNodeParameter('buttons', i, {});
                            const buttons = ((_b = buttonsCol.button) !== null && _b !== void 0 ? _b : []).map((b) => ({
                                type: 'reply',
                                reply: { id: b.id, title: b.title },
                            }));
                            interactive.action = { buttons };
                        }
                        else {
                            const sectionsCol = this.getNodeParameter('sections', i, {});
                            const sections = ((_c = sectionsCol.section) !== null && _c !== void 0 ? _c : []).map((s) => {
                                var _a, _b;
                                return ({
                                    title: s.title || undefined,
                                    rows: ((_b = (_a = s.rows) === null || _a === void 0 ? void 0 : _a.row) !== null && _b !== void 0 ? _b : []).map((r) => (0, GenericFunctions_1.cleanUndefined)({
                                        id: r.id,
                                        title: r.title,
                                        description: r.description || undefined,
                                    })),
                                });
                            });
                            interactive.action = {
                                button: this.getNodeParameter('listButton', i, 'Open'),
                                sections,
                            };
                        }
                        payload = withContext({ ...payload, type: 'interactive', interactive }, replyTo);
                        break;
                    }
                    case 'sendReaction': {
                        const messageId = this.getNodeParameter('reactionMessageId', i);
                        const emoji = this.getNodeParameter('emoji', i, '');
                        payload = {
                            ...payload,
                            type: 'reaction',
                            reaction: { message_id: messageId, emoji },
                        };
                        break;
                    }
                    case 'sendTemplate': {
                        const templateId = this.getNodeParameter('templateName', i);
                        if (!templateId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Select a template to send.', {
                                itemIndex: i,
                            });
                        }
                        let template = templateCache.get(templateId);
                        if (!template) {
                            const templates = await GenericFunctions_1.fetchMessageTemplates.call(this);
                            for (const t of templates) {
                                templateCache.set(String((_d = t.id) !== null && _d !== void 0 ? _d : t.name), t);
                            }
                            template = templateCache.get(templateId);
                        }
                        if (!template) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Template "${templateId}" was not found on the WABA. It may have been deleted or renamed.`, { itemIndex: i });
                        }
                        const basePayload = template.json;
                        if (!basePayload) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Template "${template.name}" does not expose a json payload.`, { itemIndex: i });
                        }
                        const mapperValue = this.getNodeParameter('templateVariables', i, {});
                        const userValues = (_e = mapperValue.value) !== null && _e !== void 0 ? _e : {};
                        const vars = { waba: to };
                        for (const [key, raw] of Object.entries(userValues)) {
                            vars[key] = raw == null ? '' : String(raw);
                        }
                        payload = (0, GenericFunctions_1.substitutePlaceholders)(basePayload, vars);
                        payload.to = to;
                        if (replyTo) {
                            payload.context = { message_id: replyTo };
                        }
                        break;
                    }
                    default:
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Unsupported operation: ${operation}`, {
                            itemIndex: i,
                        });
                }
                const response = await GenericFunctions_1.sendMessage.call(this, payload);
                returnData.push({
                    json: response,
                    pairedItem: { item: i },
                });
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({
                        json: { error: error.message },
                        pairedItem: { item: i },
                    });
                    continue;
                }
                throw error;
            }
        }
        return [returnData];
    }
}
exports.WhatsAppBusinessByAutomationsBuilder = WhatsAppBusinessByAutomationsBuilder;
function buildContactPayload(input) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const contact = {};
    const formattedFallback = [input.first_name, input.middle_name, input.last_name]
        .filter((part) => part && part.trim().length > 0)
        .join(' ')
        .trim();
    const name = (0, GenericFunctions_1.cleanUndefined)({
        formatted_name: ((_a = input.formatted_name) === null || _a === void 0 ? void 0 : _a.trim()) || formattedFallback || undefined,
        first_name: input.first_name || undefined,
        last_name: input.last_name || undefined,
        middle_name: input.middle_name || undefined,
        prefix: input.prefix || undefined,
        suffix: input.suffix || undefined,
    });
    if (Object.keys(name).length > 0) {
        contact.name = name;
    }
    if (input.birthday) {
        contact.birthday = input.birthday;
    }
    const orgValues = (_b = input.org) === null || _b === void 0 ? void 0 : _b.value;
    if (orgValues) {
        const org = (0, GenericFunctions_1.cleanUndefined)({
            company: orgValues.company || undefined,
            department: orgValues.department || undefined,
            title: orgValues.title || undefined,
        });
        if (Object.keys(org).length > 0)
            contact.org = org;
    }
    const phones = ((_d = (_c = input.phones) === null || _c === void 0 ? void 0 : _c.phone) !== null && _d !== void 0 ? _d : [])
        .map((p) => (0, GenericFunctions_1.cleanUndefined)({
        phone: p.phone || undefined,
        type: p.type || undefined,
        wa_id: p.wa_id || undefined,
    }))
        .filter((p) => p.phone);
    if (phones.length)
        contact.phones = phones;
    const emails = ((_f = (_e = input.emails) === null || _e === void 0 ? void 0 : _e.email) !== null && _f !== void 0 ? _f : [])
        .map((e) => (0, GenericFunctions_1.cleanUndefined)({
        email: e.email || undefined,
        type: e.type || undefined,
    }))
        .filter((e) => e.email);
    if (emails.length)
        contact.emails = emails;
    const urls = ((_h = (_g = input.urls) === null || _g === void 0 ? void 0 : _g.url) !== null && _h !== void 0 ? _h : [])
        .map((u) => (0, GenericFunctions_1.cleanUndefined)({
        url: u.url || undefined,
        type: u.type || undefined,
    }))
        .filter((u) => u.url);
    if (urls.length)
        contact.urls = urls;
    const addresses = ((_k = (_j = input.addresses) === null || _j === void 0 ? void 0 : _j.address) !== null && _k !== void 0 ? _k : [])
        .map((a) => (0, GenericFunctions_1.cleanUndefined)({
        street: a.street || undefined,
        city: a.city || undefined,
        state: a.state || undefined,
        zip: a.zip || undefined,
        country: a.country || undefined,
        country_code: a.country_code || undefined,
        type: a.type || undefined,
    }))
        .filter((a) => Object.keys(a).length > 0);
    if (addresses.length)
        contact.addresses = addresses;
    return contact;
}
//# sourceMappingURL=WhatsAppBusinessByAutomationsBuilder.node.js.map