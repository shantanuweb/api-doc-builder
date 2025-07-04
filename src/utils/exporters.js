export async function exportPDF({data, requestParams, responseParams, integrationNotes}) {
  const html2pdf = (await import('html2pdf.js')).default;
  const element = document.createElement('div');
  element.innerHTML = `
    <h1>${data.meta?.title || 'API Documentation'}</h1>
    <p><b>Description:</b> ${data.meta?.description || ''}</p>
    <p><b>Endpoint:</b> ${data.method || 'GET'} ${data.baseUrl || ''}${data.path || ''}</p>
    <h2>Request Parameters</h2>
    <table border="1" cellspacing="0" cellpadding="2">
      <tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr>
      ${requestParams.length ? requestParams.map(p => `<tr><td>${p.name}</td><td>${p.type}</td><td>${p.required ? 'Yes' : 'No'}</td><td>${p.description}</td></tr>`).join('') : '<tr><td colspan="4">None</td></tr>'}
    </table>
    <h2>Response Parameters</h2>
    <table border="1" cellspacing="0" cellpadding="2">
      <tr><th>Name</th><th>Type</th><th>Description</th></tr>
      ${responseParams.length ? responseParams.map(p => `<tr><td>${p.name}</td><td>${p.type}</td><td>${p.description}</td></tr>`).join('') : '<tr><td colspan="3">None</td></tr>'}
    </table>
    <h2>Integration Notes</h2>
    <pre>${integrationNotes || 'None'}</pre>
  `;
  html2pdf().from(element).save(`${(data.meta?.title || 'api-doc').replace(/\s+/g, '_')}.pdf`);
}

export function exportMarkdown({data, requestParams, responseParams, integrationNotes}) {
  let md = `# ${data.meta?.title || 'API Documentation'}\n\n`;
  md += `**Description:** ${data.meta?.description || ''}\n\n`;
  md += `**Endpoint:** \`${data.method || 'GET'} ${data.baseUrl || ''}${data.path || ''}\`\n\n`;
  md += `## Request Parameters\n`;
  if (requestParams.length) {
    md += '| Name | Type | Required | Description |\n|---|---|:---:|---|\n';
    requestParams.forEach(p => {
      md += `| ${p.name} | ${p.type} | ${p.required ? 'Yes' : 'No'} | ${p.description} |\n`;
    });
  } else {
    md += '_None_\n';
  }
  md += `\n## Response Parameters\n`;
  if (responseParams.length) {
    md += '| Name | Type | Description |\n|---|---|---|\n';
    responseParams.forEach(p => {
      md += `| ${p.name} | ${p.type} | ${p.description} |\n`;
    });
  } else {
    md += '_None_\n';
  }
  md += `\n## Integration Notes\n${integrationNotes || '_None_'}\n`;
  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(data.meta?.title || 'api-doc').replace(/\s+/g, '_')}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportHTML({html}) {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'api-doc.html';
  a.click();
  URL.revokeObjectURL(url);
}

export function exportOpenAPI(json) {
  const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'openapi.json';
  a.click();
  URL.revokeObjectURL(url);
}
