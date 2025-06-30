function buildResponsesBody(systemPrompt, userPrompt) {
    return {
        model: 'gpt-4o',
        tools: [{ type: 'web_search' }],
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ]
    };
}

function composeQuery(systemPrompt, userPrompt) {
    var sys = (systemPrompt || '').trim();
    var usr = (userPrompt || '').trim();
    if (sys && usr) return sys + '\n' + usr;
    return sys + usr;
}

if (typeof window !== 'undefined') {
    window.buildResponsesBody = buildResponsesBody;
    window.composeQuery = composeQuery;
}
