import { jsPDF } from "jspdf";
import type { Note, SOAPNote, DAPNote } from "../api";

function formatDate(dateStr: string, timeZone = "UTC") {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric", timeZone,
  });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportNotesAsTxt(notes: Note[], patientName: string) {
  const lines: string[] = [
    `Session Notes — ${patientName}`,
    `Exported ${new Date().toLocaleDateString("en-US")}`,
    "",
  ];
  for (const note of notes) {
    lines.push(`--- ${formatDate(note.session_date)} ---`);
    lines.push(note.content);
    lines.push("");
  }
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  triggerDownload(blob, `session-notes-${patientName.replace(/\s+/g, "-").toLowerCase()}.txt`);
}

export function exportNotesAsPdf(notes: Note[], patientName: string) {
  const doc = new jsPDF();
  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  function maybeNewPage(needed: number) {
    if (y + needed > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  }

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Session Notes — ${patientName}`, margin, y);
  y += 7;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(130);
  doc.text(`Exported ${new Date().toLocaleDateString("en-US")}`, margin, y);
  doc.setTextColor(0);
  y += 10;

  for (const note of notes) {
    maybeNewPage(14);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(formatDate(note.session_date), margin, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(note.content, maxWidth) as string[];
    for (const line of lines) {
      maybeNewPage(6);
      doc.text(line, margin, y);
      y += 5;
    }
    y += 5;
  }

  doc.save(`session-notes-${patientName.replace(/\s+/g, "-").toLowerCase()}.pdf`);
}

export function exportSOAPAsTxt(note: SOAPNote, patientName: string) {
  const lines = [
    `SOAP Note — ${patientName}`,
    `Session date: ${formatDate(note.session_date)}`,
    "",
    "SUBJECTIVE",
    note.subjective,
    "",
    "OBJECTIVE",
    note.objective,
    "",
    "ASSESSMENT",
    note.assessment,
    "",
    "PLAN",
    note.plan,
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const slug = `${patientName.replace(/\s+/g, "-").toLowerCase()}-${note.session_date}`;
  triggerDownload(blob, `soap-note-${slug}.txt`);
}

export function exportSOAPAsPdf(note: SOAPNote, patientName: string) {
  const doc = new jsPDF();
  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  function maybeNewPage(needed: number) {
    if (y + needed > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  }

  function writeSectionBody(text: string) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(text, maxWidth) as string[];
    for (const line of lines) {
      maybeNewPage(6);
      doc.text(line, margin, y);
      y += 5;
    }
    y += 4;
  }

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`SOAP Note — ${patientName}`, margin, y);
  y += 7;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(130);
  doc.text(`Session date: ${formatDate(note.session_date)}`, margin, y);
  doc.setTextColor(0);
  y += 10;

  const sections: [string, string][] = [
    ["SUBJECTIVE", note.subjective],
    ["OBJECTIVE", note.objective],
    ["ASSESSMENT", note.assessment],
    ["PLAN", note.plan],
  ];

  for (const [label, content] of sections) {
    maybeNewPage(14);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(label, margin, y);
    y += 6;
    writeSectionBody(content);
  }

  const slug = `${patientName.replace(/\s+/g, "-").toLowerCase()}-${note.session_date}`;
  doc.save(`soap-note-${slug}.pdf`);
}

export function exportDAPAsTxt(note: DAPNote, patientName: string) {
  const lines = [
    `DAP Note — ${patientName}`,
    `Session date: ${formatDate(note.session_date)}`,
    "",
    "DATA",
    note.data,
    "",
    "ASSESSMENT",
    note.assessment,
    "",
    "PLAN",
    note.plan,
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const slug = `${patientName.replace(/\s+/g, "-").toLowerCase()}-${note.session_date}`;
  triggerDownload(blob, `dap-note-${slug}.txt`);
}

export function exportDAPAsPdf(note: DAPNote, patientName: string) {
  const doc = new jsPDF();
  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  function maybeNewPage(needed: number) {
    if (y + needed > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  }

  function writeSectionBody(text: string) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(text, maxWidth) as string[];
    for (const line of lines) {
      maybeNewPage(6);
      doc.text(line, margin, y);
      y += 5;
    }
    y += 4;
  }

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`DAP Note — ${patientName}`, margin, y);
  y += 7;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(130);
  doc.text(`Session date: ${formatDate(note.session_date)}`, margin, y);
  doc.setTextColor(0);
  y += 10;

  const sections: [string, string][] = [
    ["DATA", note.data],
    ["ASSESSMENT", note.assessment],
    ["PLAN", note.plan],
  ];

  for (const [label, content] of sections) {
    maybeNewPage(14);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(label, margin, y);
    y += 6;
    writeSectionBody(content);
  }

  const slug = `${patientName.replace(/\s+/g, "-").toLowerCase()}-${note.session_date}`;
  doc.save(`dap-note-${slug}.pdf`);
}
