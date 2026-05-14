import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, AlignmentType, BorderStyle, WidthType } from 'docx'
import { saveAs } from 'file-saver'

import type { Habit, Log } from '@/types'

function getStreak(habitId: string, logs: Log[]) {
  const habitLogs = logs
    .filter(l => l.habitId === habitId)
    .map(l => new Date(l.date).toDateString())

  let streak = 0
  const now = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    if (habitLogs.includes(d.toDateString())) streak++
    else break
  }
  return streak
}

function getCompletionRate(habits: Habit[], logs: Log[]) {
  if (habits.length === 0) return 0
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 7)
  const recent = logs.filter(l => new Date(l.date) >= cutoff).length
  return Math.round((recent / (habits.length * 7)) * 100)
}

export async function exportPDF(habits: Habit[], logs: Log[]) {
  const doc = new jsPDF()
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  // Header
  doc.setFillColor(83, 74, 183)
  doc.rect(0, 0, 210, 40, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('🔥 Streakly', 14, 20)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Progress Report', 14, 30)
  doc.text(date, 150, 30)

  // Summary stats
  doc.setTextColor(30, 30, 30)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Summary', 14, 55)

  const bestStreak = habits.length > 0
    ? Math.max(...habits.map(h => getStreak(h.id, logs)))
    : 0
  const completionRate = getCompletionRate(habits, logs)

  autoTable(doc, {
    startY: 60,
    head: [['Metric', 'Value']],
    body: [
      ['Total Habits', habits.length.toString()],
      ['Total Check-ins', logs.length.toString()],
      ['Best Streak', `${bestStreak} days`],
      ['7-Day Completion Rate', `${completionRate}%`],
      ['Report Generated', date],
    ],
    headStyles: { fillColor: [83, 74, 183], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 255] },
    styles: { fontSize: 11 },
  })

  // Habit breakdown
  const finalY = (doc as any).lastAutoTable.finalY + 15
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Habit Breakdown', 14, finalY)

  autoTable(doc, {
    startY: finalY + 5,
    head: [['Habit', 'Frequency', 'Current Streak', 'Total Check-ins']],
    body: habits.map(h => [
      `${h.icon} ${h.name}`,
      h.frequency.charAt(0) + h.frequency.slice(1).toLowerCase(),
      `${getStreak(h.id, logs)} days`,
      logs.filter(l => l.habitId === h.id).length.toString(),
    ]),
    headStyles: { fillColor: [83, 74, 183], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 255] },
    styles: { fontSize: 11 },
  })

  // Weekly breakdown
  const finalY2 = (doc as any).lastAutoTable.finalY + 15
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Last 7 Days', 14, finalY2)

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const weeklyRows = DAYS.map((day, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (date.getDay() - i))
    const count = logs.filter(l =>
      new Date(l.date).toDateString() === date.toDateString()
    ).length
    return [day, date.toLocaleDateString(), `${count} / ${habits.length}`]
  })

  autoTable(doc, {
    startY: finalY2 + 5,
    head: [['Day', 'Date', 'Completed']],
    body: weeklyRows,
    headStyles: { fillColor: [83, 74, 183], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 255] },
    styles: { fontSize: 11 },
  })

  doc.save(`streakly-report-${Date.now()}.pdf`)
}

export async function exportWord(habits: Habit[], logs: Log[]) {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
  const bestStreak = habits.length > 0
    ? Math.max(...habits.map(h => getStreak(h.id, logs)))
    : 0
  const completionRate = getCompletionRate(habits, logs)

  const noBorder = {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
  }

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          text: '🔥 Streakly — Progress Report',
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [new TextRun({ text: `Generated on ${date}`, color: '888888', size: 20 })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),

        new Paragraph({ text: 'Summary', heading: HeadingLevel.HEADING_2, spacing: { after: 200 } }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            ['Metric', 'Value'],
            ['Total Habits', habits.length.toString()],
            ['Total Check-ins', logs.length.toString()],
            ['Best Streak', `${bestStreak} days`],
            ['7-Day Completion', `${completionRate}%`],
          ].map((row, i) => new TableRow({
            children: row.map(cell => new TableCell({
              children: [new Paragraph({
                children: [new TextRun({
                  text: cell,
                  bold: i === 0,
                  color: i === 0 ? 'ffffff' : '111111',
                })],
              })],
              shading: i === 0 ? { fill: '534AB7' } : i % 2 === 0 ? { fill: 'F5F5FF' } : { fill: 'FFFFFF' },
              borders: noBorder,
            })),
          })),
        }),

        new Paragraph({ text: '', spacing: { after: 300 } }),
        new Paragraph({ text: 'Habit Breakdown', heading: HeadingLevel.HEADING_2, spacing: { after: 200 } }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            ['Habit', 'Frequency', 'Streak', 'Check-ins'],
            ...habits.map(h => [
              `${h.icon} ${h.name}`,
              h.frequency.charAt(0) + h.frequency.slice(1).toLowerCase(),
              `${getStreak(h.id, logs)}d`,
              logs.filter(l => l.habitId === h.id).length.toString(),
            ]),
          ].map((row, i) => new TableRow({
            children: row.map(cell => new TableCell({
              children: [new Paragraph({
                children: [new TextRun({
                  text: cell,
                  bold: i === 0,
                  color: i === 0 ? 'ffffff' : '111111',
                })],
              })],
              shading: i === 0 ? { fill: '534AB7' } : i % 2 === 0 ? { fill: 'F5F5FF' } : { fill: 'FFFFFF' },
              borders: noBorder,
            })),
          })),
        }),
      ],
    }],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `streakly-report-${Date.now()}.docx`)
}
