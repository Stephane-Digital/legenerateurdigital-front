export function exportLeadHTML(data: any) {
  const ctaUrl = data?.ctaUrl || "#";

  return `
  <html>
    <body>
      <h1>${data.title || "Titre"}</h1>
      <p>${data.subtitle || "Sous titre"}</p>
      <a href="${ctaUrl}">CTA</a>
    </body>
  </html>
  `;
}
