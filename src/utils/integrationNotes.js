export default function generateIntegrationNotes({ data, requestParams, responseParams }) {
  const parts = [];
  const { method = 'GET', baseUrl = '', path = '' } = data;
  const title = data.meta?.title || '';
  parts.push(`# ${title || 'Endpoint Integration'}`);
  parts.push(`Use the \`${method}\` request to \`${baseUrl}${path}\`.`);

  if (requestParams && requestParams.length) {
    const required = requestParams.filter(p => p.required);
    if (required.length) {
      parts.push('\n## Required Parameters');
      required.forEach(p => {
        parts.push(`- \`${p.name}\` (${p.type}) - ${p.description || 'no description'}`);
      });
    }

    const optional = requestParams.filter(p => !p.required);
    if (optional.length) {
      parts.push('\n## Optional Parameters');
      optional.forEach(p => {
        parts.push(`- \`${p.name}\` (${p.type})${p.description ? ` - ${p.description}` : ''}`);
      });
    }
  }

  if (responseParams && responseParams.length) {
    parts.push('\n## Response Fields');
    responseParams.forEach(p => {
      parts.push(`- \`${p.name}\` (${p.type})`);
    });
  }

  parts.push('\nRemember to set the `Content-Type` header to `' + (data.headers?.['Content-Type'] || 'application/json') + '`.');

  return parts.join('\n');
}
