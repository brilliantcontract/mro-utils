function buildResponsesBody(query) {
    return {
        model: 'gpt-4o',
        tools: [{ type: 'web_search' }],
        input: query
    };
}

if (typeof window !== 'undefined') {
    window.buildResponsesBody = buildResponsesBody;
}
