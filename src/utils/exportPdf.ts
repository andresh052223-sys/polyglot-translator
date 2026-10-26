import { LanguageResult, GRAMMAR_CATEGORIES, GrammarCategory } from '../types/translator';

export interface ExportData {
  sourceText?: string;
  spanish?: string; // backwards compatibility
  sourceLangName?: string;
  sourceLangFlag?: string;
  results: LanguageResult[];
}

export function exportCleanText(data: ExportData): void {
  const text = data.sourceText || data.spanish || '';
  const langName = data.sourceLangName || 'Español';
  const langFlag = data.sourceLangFlag || '🇪🇸';
  const results = data.results;

  let content = `POLYGLOT COLOR TRANSLATOR\n`;
  content += `Traducciones en 7 Idiomas\n`;
  content += `==============================================\n\n`;
  content += `Frase original (${langName} ${langFlag}):\n"${text}"\n\n`;
  content += `----------------------------------------------\n\n`;

  results.forEach((res, index) => {
    content += `${index + 1}. ${res.flag} ${res.languageName.toUpperCase()} (${res.bcp47})\n`;
    content += `Traducción: ${res.fullTranslation}\n`;
    if (res.phoneticTranscription) {
      content += `Transcripción fonética (${res.phoneticLabel || 'Pronunciación'}): ${res.phoneticTranscription}\n`;
    }
    if (res.grammarNotes) {
      content += `Nota gramatical: ${res.grammarNotes}\n`;
    }
    content += `\n`;
  });

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `traducciones_${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportMarkdownReport(data: ExportData): void {
  const text = data.sourceText || data.spanish || '';
  const langName = data.sourceLangName || 'Español';
  const langFlag = data.sourceLangFlag || '🇪🇸';
  const results = data.results;

  let md = `# Polyglot Color Translator - Reporte Lingüístico Multilingüe\n\n`;
  md += `**Frase Original (${langName} ${langFlag}):** > "${text}"\n\n`;
  md += `---\n\n`;

  results.forEach((res) => {
    md += `## ${res.flag} ${res.languageName} (\`${res.bcp47}\`)\n\n`;
    md += `**Traducción:** ${res.fullTranslation}\n\n`;
    if (res.phoneticTranscription) {
      md += `**${res.phoneticLabel || 'Fonética'}:** *${res.phoneticTranscription}*\n\n`;
    }
    if (res.grammarNotes) {
      md += `> **Nota Gramatical:** ${res.grammarNotes}\n\n`;
    }

    md += `| Palabra / Unidad | Categoría | Significado en Español | Función Sintáctica | Correspondencia |\n`;
    md += `|---|---|---|---|---|\n`;
    res.tokens.forEach((t) => {
      md += `| ${t.text} | ${t.categoryLabelEs || t.category} | ${t.meaningEs} | ${t.syntacticRole} | ${t.spanishCorrespondence || '-'} |\n`;
    });
    md += `\n\n`;
  });

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `analisis_gramatical_${Date.now()}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export function printOrSavePdf(data: ExportData): void {
  const text = data.sourceText || data.spanish || '';
  const langName = data.sourceLangName || 'Español';
  const langFlag = data.sourceLangFlag || '🇪🇸';
  const results = data.results;
  const categoryColorStyles: Record<GrammarCategory, { bg: string; text: string; border: string }> = {
    noun: { bg: '#FACC15', text: '#1C1917', border: '#CA8A04' }, // Amarillo (#FACC15)
    pronoun: { bg: '#F97316', text: '#FFFFFF', border: '#EA580C' }, // Naranja (#F97316)
    main_verb: { bg: '#3B82F6', text: '#FFFFFF', border: '#2563EB' }, // Azul (#3B82F6)
    auxiliary_verb: { bg: '#22C55E', text: '#FFFFFF', border: '#16A34A' }, // Verde (#22C55E)
    negation: { bg: '#EF4444', text: '#FFFFFF', border: '#DC2626' }, // Rojo (#EF4444)
    preposition: { bg: '#A855F7', text: '#FFFFFF', border: '#9333EA' }, // Morado (#A855F7)
    adjective: { bg: '#D1D5DB', text: '#111827', border: '#9CA3AF' }, // Gris (#D1D5DB)
    adverb: { bg: '#111827', text: '#FFFFFF', border: '#030712' }, // Negro (#111827)
    article: { bg: '#EC4899', text: '#FFFFFF', border: '#DB2777' }, // Rosado (#EC4899)
    other: { bg: '#FFFFFF', text: '#111827', border: '#374151' }, // Blanco (#FFFFFF) con borde gris oscuro (#374151)
  };

  const legendHtml = Object.values(GRAMMAR_CATEGORIES)
    .map((cat) => {
      const colors = categoryColorStyles[cat.key];
      return `
        <span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; background: ${colors.bg}; color: ${colors.text}; border: 1px solid ${colors.border}; margin: 2px;">
          <span>${cat.emoji}</span>
          <span>${cat.nameEs.toUpperCase()} (${cat.nameEn.toUpperCase()})</span>
        </span>
      `;
    })
    .join('');

  const cardsHtml = results
    .map((res, idx) => {
      const tokensHtml = res.tokens
        .map((tok) => {
          const colors = categoryColorStyles[tok.category] || categoryColorStyles.other;
          return `
            <span style="display: inline-block; padding: 3px 7px; margin: 2px 3px; border-radius: 5px; font-size: 14px; font-weight: 600; background: ${colors.bg}; color: ${colors.text}; border: 1px solid ${colors.border};" title="${tok.categoryLabelEs}: ${tok.meaningEs}">
              ${tok.text}
            </span>
          `;
        })
        .join('');

      const tableRows = res.tokens
        .map((tok) => {
          const colors = categoryColorStyles[tok.category] || categoryColorStyles.other;
          return `
            <tr>
              <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">
                <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; background: ${colors.bg}; color: ${colors.text}; border: 1px solid ${colors.border};">
                  ${tok.text}
                </span>
                ${tok.pinyin ? `<div style="font-size: 10px; color: #64748b;">${tok.pinyin}</div>` : ''}
                ${tok.romaji ? `<div style="font-size: 10px; color: #64748b;">${tok.romaji}</div>` : ''}
              </td>
              <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #334155;">
                <strong>${tok.categoryLabelEs || tok.category}</strong>
              </td>
              <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #0f172a;">
                ${tok.meaningEs}
              </td>
              <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #475569;">
                ${tok.syntacticRole}
              </td>
              <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #475569;">
                ${tok.spanishCorrespondence || '-'}
              </td>
            </tr>
          `;
        })
        .join('');

      return `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 20px; page-break-inside: avoid;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
            <div style="font-size: 16px; font-weight: 700; color: #0f172a;">
              <span style="font-size: 20px; margin-right: 6px;">${res.flag}</span>
              ${idx + 1}. ${res.languageName} <span style="font-size: 12px; font-weight: 500; color: #64748b;">(${res.bcp47})</span>
            </div>
          </div>

          <div style="margin-bottom: 12px; line-height: 1.8;">
            ${tokensHtml}
          </div>

          ${
            res.phoneticTranscription
              ? `<div style="background: #f8fafc; border-left: 3px solid #3b82f6; padding: 6px 12px; font-size: 13px; font-family: monospace; color: #1e293b; margin-bottom: 12px;">
                  <strong>${res.phoneticLabel || 'Fonética'}:</strong> ${res.phoneticTranscription}
                </div>`
              : ''
          }

          ${
            res.grammarNotes
              ? `<div style="font-size: 11px; color: #475569; background: #f1f5f9; padding: 6px 10px; border-radius: 6px; margin-bottom: 12px;">
                  💡 <strong>Nota:</strong> ${res.grammarNotes}
                </div>`
              : ''
          }

          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 12px; margin-top: 10px;">
            <thead>
              <tr style="background: #f8fafc;">
                <th style="padding: 6px 10px; border-bottom: 2px solid #cbd5e1; font-weight: 600;">Palabra</th>
                <th style="padding: 6px 10px; border-bottom: 2px solid #cbd5e1; font-weight: 600;">Categoría</th>
                <th style="padding: 6px 10px; border-bottom: 2px solid #cbd5e1; font-weight: 600;">Significado ES</th>
                <th style="padding: 6px 10px; border-bottom: 2px solid #cbd5e1; font-weight: 600;">Función Sintáctica</th>
                <th style="padding: 6px 10px; border-bottom: 2px solid #cbd5e1; font-weight: 600;">Correspondencia</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
      `;
    })
    .join('');

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor permite ventanas emergentes para generar el documento imprimible o PDF.');
    return;
  }

  const htmlDoc = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Polyglot Color Translator - Reporte Educativo</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Sans+JP:wght@400;500;700&display=swap');
    body {
      font-family: 'Plus Jakarta Sans', 'Noto Sans SC', 'Noto Sans JP', sans-serif;
      margin: 20px;
      padding: 0;
      color: #0f172a;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    @page {
      margin: 15mm;
      size: A4;
    }
    @media print {
      body { margin: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px; padding: 12px; background: #e0f2fe; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
    <span style="font-size: 13px; font-weight: 600; color: #0369a1;">📄 Documento preparado para imprimir o guardar como PDF.</span>
    <button onclick="window.print()" style="padding: 8px 16px; background: #0284c7; color: white; border: none; border-radius: 6px; font-weight: 700; cursor: pointer;">
      🖨️ Imprimir / Guardar como PDF
    </button>
  </div>

  <div style="border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px;">
    <h1 style="margin: 0 0 6px 0; font-size: 24px; font-weight: 800; color: #0f172a;">Polyglot Color Translator</h1>
    <p style="margin: 0; font-size: 13px; color: #475569;">Traducción multilingüe a 7 idiomas desde ${langName} con análisis gramatical por colores y fonética</p>
  </div>

  <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">
      Frase Original en ${langName} ${langFlag}:
    </div>
    <div style="font-size: 18px; font-weight: 700; color: #0f172a;">"${text}"</div>
  </div>

  <div style="margin-bottom: 20px; padding: 10px; background: #fdfefe; border: 1px solid #e2e8f0; border-radius: 8px;">
    <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 6px;">Código de Colores Gramatical:</div>
    <div style="display: flex; flex-wrap: wrap; gap: 4px;">
      ${legendHtml}
    </div>
  </div>

  <div>
    ${cardsHtml}
  </div>

  <div style="margin-top: 30px; border-top: 1px solid #cbd5e1; padding-top: 10px; font-size: 11px; color: #94a3b8; text-align: center;">
    Generado por Polyglot Color Translator • ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
  </div>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(htmlDoc);
  printWindow.document.close();
}
