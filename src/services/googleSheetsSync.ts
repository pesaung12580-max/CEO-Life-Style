import {
  getAllTrackedDates,
  getAllCeoReviews,
  getDailyNonNegotiables,
  getDailySubtasksProgress,
  getTimeBlocks,
  calculateStreakStats,
  getMonthlyHabitTracker,
} from './storage';
import { HabitCategoryType } from '../types';

export interface SyncProgressCallback {
  (stage: string, progressPercent: number): void;
}

export interface SyncResult {
  success: boolean;
  spreadsheetId: string;
  spreadsheetUrl: string;
  syncedAt: string;
  summary: {
    datesCount: number;
    reviewsCount: number;
    nonNegLogsCount: number;
    subtaskLogsCount: number;
  };
}

export interface MonthlyHabitsSyncResult {
  success: boolean;
  spreadsheetId: string;
  spreadsheetUrl: string;
  sheetTabName: string;
  syncedAt: string;
  summary: {
    yearMonth: string;
    habitsCount: number;
    daysCount: number;
    completedSlots: number;
    totalSlots: number;
    scorePercent: number;
    medal: string;
  };
}

const SPREADSHEET_TITLE = 'CEO Aung Min Maw - Daily Execution & Review Tracker';

const BURMESE_MONTHS = [
  'ဇန်နဝါရီ',
  'ဖေဖော်ဝါရီ',
  'မတ်',
  'ဧပြီ',
  'မေ',
  'ဇွန်',
  'ဇူလိုင်',
  'သြဂုတ်',
  'စက်တင်ဘာ',
  'အောက်တိုဘာ',
  'နိုဝင်ဘာ',
  'ဒီဇင်ဘာ',
];

/**
 * Searches Google Drive for an existing spreadsheet with the designated title.
 */
export async function findExistingSpreadsheet(accessToken: string): Promise<{ id: string; url: string } | null> {
  try {
    const query = encodeURIComponent(`name = '${SPREADSHEET_TITLE}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`);
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return {
        id: data.files[0].id,
        url: data.files[0].webViewLink || `https://docs.google.com/spreadsheets/d/${data.files[0].id}`,
      };
    }
  } catch (err) {
    console.error('Error finding existing spreadsheet:', err);
  }
  return null;
}

/**
 * Creates a brand new Google Spreadsheet in Google Drive.
 */
export async function createSpreadsheet(accessToken: string): Promise<{ id: string; url: string }> {
  const payload = {
    properties: {
      title: SPREADSHEET_TITLE,
    },
    sheets: [
      { properties: { title: '📊 Overview & Stats', gridProperties: { frozenRowCount: 1 } } },
      { properties: { title: '🎯 Daily Reviews', gridProperties: { frozenRowCount: 1 } } },
      { properties: { title: '⚡ Non-Negotiables Log', gridProperties: { frozenRowCount: 1 } } },
      { properties: { title: '📝 Routine Subtasks Log', gridProperties: { frozenRowCount: 1 } } },
    ],
  };

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Failed to create spreadsheet in Google Drive: ${res.status} ${errorBody}`);
  }

  const data = await res.json();
  const id = data.spreadsheetId;
  const url = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${id}`;

  return { id, url };
}

/**
 * Ensures a specific sheet tab exists in the spreadsheet, adding it if needed
 */
async function ensureSheetTabExists(
  accessToken: string,
  spreadsheetId: string,
  sheetTitle: string,
  columnCount: number = 42,
  rowCount: number = 60
): Promise<{ sheetId: number }> {
  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets(properties(sheetId,title))`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (res.ok) {
      const data = await res.json();
      const sheets: Array<{ properties: { sheetId: number; title: string } }> = data.sheets || [];
      const existing = sheets.find((s) => s.properties.title === sheetTitle);

      if (existing) {
        return { sheetId: existing.properties.sheetId };
      }
    }

    // Add sheet tab if not found
    const addRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetTitle,
                  gridProperties: {
                    rowCount,
                    columnCount,
                    frozenRowCount: 5,
                    frozenColumnCount: 2,
                  },
                },
              },
            },
          ],
        }),
      }
    );

    if (addRes.ok) {
      const addData = await addRes.json();
      const newSheetId = addData.replies?.[0]?.addSheet?.properties?.sheetId || 0;
      return { sheetId: newSheetId };
    }
  } catch (err) {
    console.warn('ensureSheetTabExists note:', err);
  }
  return { sheetId: 0 };
}

/**
 * Syncs and updates all CEO tracking data to Google Sheets
 */
export async function syncAllDataToGoogleSheets(
  accessToken: string,
  onProgress?: SyncProgressCallback
): Promise<SyncResult> {
  onProgress?.('Google Drive နှင့် ချိတ်ဆက်နေပါသည်...', 10);

  // 1. Locate or create Spreadsheet
  let sheetInfo = await findExistingSpreadsheet(accessToken);
  if (!sheetInfo) {
    onProgress?.('Google Sheet အသစ် ဖန်တီးနေပါသည်...', 25);
    sheetInfo = await createSpreadsheet(accessToken);
  } else {
    onProgress?.('ရှိပြီးသား Google Sheet ကို ရှာဖွေတွေ့ရှိပါသည်...', 25);
  }

  const { id: spreadsheetId, url: spreadsheetUrl } = sheetInfo;

  // 2. Prepare Overview Data
  onProgress?.('📊 Overview & Executive Stats များကို ပြင်ဆင်နေပါသည်...', 40);
  const streakStats = calculateStreakStats();
  const allDates = getAllTrackedDates();
  const allReviews = getAllCeoReviews();
  const timeBlocks = getTimeBlocks();
  const nowStr = new Date().toLocaleString();

  const overviewRows = [
    ['CEO Aung Min Maw - Executive Performance & Daily Execution Tracker', ''],
    ['Updated At', nowStr],
    ['Target CEO', 'CEO Aung Min Maw'],
    ['Total Days Tracked', allDates.length.toString()],
    ['Current Streak (3/5+ Non-Negotiables)', `${streakStats.currentStreak} Days`],
    ['Best Streak', `${streakStats.bestStreak} Days`],
    ['30-Day Consistency Rate', `${streakStats.thirtyDayRate}%`],
    ['Total Nightly Reviews Saved', allReviews.length.toString()],
    ['', ''],
    ['Core Non-Negotiables (Daily Rules)', 'Standard Target'],
    ['1. Wake up 5:00 AM (Sharp)', 'Daily 5:00 AM'],
    ['2. 60 Mins Deep Focus Strategy', 'Daily Morning/Afternoon'],
    ['3. Workout / Physical Training', 'Daily Health & Vitality'],
    ['4. No Alcohol / Clean Mindset', 'Daily High Performance'],
    ['5. Daily Review & Tomorrow Plan', 'Daily Nightly Reflection'],
    ['', ''],
    ['Executive Routine Schedule', 'Time Window'],
    ...timeBlocks.map((b) => [`${b.title} (${b.englishTitle})`, `${b.startTime} - ${b.endTime}`]),
  ];

  // 3. Prepare Daily Reviews Data
  onProgress?.('🎯 CEO သုံးသပ်ချက်များ (Reviews) များကို ပြင်ဆင်နေပါသည်...', 55);
  const reviewsHeaders = [
    'Date (ရက်စွဲ)',
    'Status (အခြေအနေ)',
    'What Worked Well (အောင်မြင်မှုများ)',
    'What Needs Improvement (တိုးတက်ရန် အချက်များ)',
    'Today Accomplished (ပြီးစီးခဲ့သည့်အရာများ)',
    'Business & Revenue Notes (စီးပွားရေး မှတ်စုများ)',
    'Tomorrow Priority #1 (နောက်နေ့ ဦးစားပေး ၁)',
    'Tomorrow Priority #2 (နောက်နေ့ ဦးစားပေး ၂)',
    'Tomorrow Priority #3 (နောက်နေ့ ဦးစားပေး ၃)',
    'Review Saved At',
  ];

  const reviewsRows = [
    reviewsHeaders,
    ...allReviews.map((r) => [
      r.date,
      r.whatWorked ? 'SAVED ✅' : 'DRAFT ⭕',
      r.whatWorked || '-',
      r.whatToFix || '-',
      r.completedToday || '-',
      r.businessNotes || '-',
      r.topPrioritiesTomorrow?.[0] || '-',
      r.topPrioritiesTomorrow?.[1] || '-',
      r.topPrioritiesTomorrow?.[2] || '-',
      r.updatedAt ? new Date(r.updatedAt).toLocaleString() : '-',
    ]),
  ];

  // 4. Prepare Non-Negotiables Log Data
  onProgress?.('⚡ Non-Negotiables နေ့စဉ် စာရင်းများကို ပြင်ဆင်နေပါသည်...', 70);
  const nonNegHeaders = [
    'Date (ရက်စွဲ)',
    'Burmese Task (မြန်မာ)',
    'English Target',
    'Status (အခြေအနေ)',
    'Daily Score / Completion',
  ];

  const nonNegRows: string[][] = [nonNegHeaders];
  let totalNonNegCount = 0;

  for (const date of allDates) {
    const items = getDailyNonNegotiables(date);
    const completedCount = items.filter((i) => i.done).length;
    for (const item of items) {
      nonNegRows.push([
        date,
        item.burmeseTitle,
        item.title,
        item.done ? 'DONE ✅' : 'PENDING ⭕',
        `${completedCount}/${items.length}`,
      ]);
      totalNonNegCount++;
    }
  }

  // 5. Prepare Routine Subtasks Log Data
  onProgress?.('📝 Routine Subtasks မှတ်တမ်းများကို ပြင်ဆင်နေပါသည်...', 85);
  const subtasksHeaders = [
    'Date (ရက်စွဲ)',
    'Routine Block',
    'Subtask Title',
    'Status',
  ];

  const subtasksRows: string[][] = [subtasksHeaders];
  let totalSubtaskLogs = 0;

  for (const date of allDates) {
    const progress = getDailySubtasksProgress(date);
    for (const block of timeBlocks) {
      for (const sub of block.subtasks) {
        const isDone = !!progress[sub.id];
        subtasksRows.push([
          date,
          block.title,
          sub.text,
          isDone ? 'COMPLETED ✅' : 'PENDING ⭕',
        ]);
        totalSubtaskLogs++;
      }
    }
  }

  // 6. Push values to Google Sheets via ValueUpdate
  onProgress?.('Google Sheet ထဲသို့ ဒေတာများ ရေးသွင်းနေပါသည်...', 90);

  const valueUpdates = [
    {
      range: '📊 Overview & Stats!A1:B30',
      values: overviewRows,
    },
    {
      range: '🎯 Daily Reviews!A1:I200',
      values: reviewsRows,
    },
    {
      range: '⚡ Non-Negotiables Log!A1:F500',
      values: nonNegRows,
    },
    {
      range: '📝 Routine Subtasks Log!A1:D1000',
      values: subtasksRows,
    },
  ];

  // Clear and update ranges
  for (const update of valueUpdates) {
    try {
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(update.range)}:clear`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(update.range)}?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            range: update.range,
            values: update.values,
          }),
        }
      );
    } catch (err) {
      console.error(`Failed to update range ${update.range}:`, err);
    }
  }

  // Store spreadsheet references in localStorage
  localStorage.setItem('ceo_google_spreadsheet_id', spreadsheetId);
  localStorage.setItem('ceo_google_spreadsheet_url', spreadsheetUrl);
  localStorage.setItem('ceo_google_last_sync', new Date().toISOString());

  onProgress?.('Google Sheet ထဲသို့ အကုန်သိမ်းဆည်းပြီးပါပြီ! ✅', 100);

  return {
    success: true,
    spreadsheetId,
    spreadsheetUrl,
    syncedAt: nowStr,
    summary: {
      datesCount: allDates.length,
      reviewsCount: allReviews.length,
      nonNegLogsCount: totalNonNegCount,
      subtaskLogsCount: totalSubtaskLogs,
    },
  };
}

/**
 * Exports current monthly habit tracker data into a formatted, readable monthly grid in Google Sheets
 */
export async function syncMonthlyHabitsToGoogleSheets(
  accessToken: string,
  yearMonth: string,
  onProgress?: SyncProgressCallback
): Promise<MonthlyHabitsSyncResult> {
  onProgress?.('Google Drive နှင့် ချိတ်ဆက်နေပါသည်...', 10);

  // 1. Locate or create Spreadsheet
  let sheetInfo = await findExistingSpreadsheet(accessToken);
  if (!sheetInfo) {
    onProgress?.('Google Sheet အသစ် ဖန်တီးနေပါသည်...', 25);
    sheetInfo = await createSpreadsheet(accessToken);
  } else {
    onProgress?.('ရှိပြီးသား Google Sheet ကို ရှာဖွေတွေ့ရှိပါသည်...', 25);
  }

  const { id: spreadsheetId, url: spreadsheetUrl } = sheetInfo;

  // 2. Tab name for this specific month
  const sheetTabName = `📅 Habits - ${yearMonth}`;
  onProgress?.(`Sheet Tab (${sheetTabName}) ကို စစ်ဆေးပြင်ဆင်နေပါသည်...`, 40);

  const [yearStr, monthStr] = yearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const daysInMonth = new Date(year, month, 0).getDate();
  const burmeseMonth = BURMESE_MONTHS[month - 1] || `${month}လ`;

  // Ensure tab exists
  const { sheetId } = await ensureSheetTabExists(accessToken, spreadsheetId, sheetTabName, daysInMonth + 8, 45);

  // 3. Prepare monthly grid data
  onProgress?.('လစဉ် အလေ့အကျင့် Grid ဇယားကို တွက်ချက်ပြင်ဆင်နေပါသည်...', 60);

  const trackerData = getMonthlyHabitTracker(yearMonth);
  const habits = trackerData.habits;
  const totalSlots = habits.length * daysInMonth;
  const completedSlots = Object.values(trackerData.checks).filter(Boolean).length;
  const scorePercent = totalSlots > 0 ? Math.round((completedSlots / totalSlots) * 100) : 0;

  const medalTier =
    scorePercent >= 80 ? '🥇 Gold Medal (>80%)' : scorePercent >= 50 ? '🥈 Silver Medal (50-79%)' : '🎯 Target <50%';

  const nowStr = new Date().toLocaleString();

  // Helper for day-of-week abbreviations
  const weekdayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const dayColHeaders: string[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(year, month - 1, d);
    const dayW = weekdayNames[dt.getDay()];
    dayColHeaders.push(`Day ${d} (${dayW})`);
  }

  // Row 1: Executive Banner
  const row1 = [
    'CEO Aung Min Maw - Monthly Habits Execution Grid Tracker',
    '',
    '',
    '',
    '',
    'Month (လ):',
    `${year} ခုနှစ်၊ ${burmeseMonth} (${yearMonth})`,
    '',
    'Exported At:',
    nowStr,
  ];

  // Row 2: Performance KPI Stats
  const row2 = [
    'Monthly Score:',
    `${scorePercent}%`,
    'Medal Status:',
    medalTier,
    'Completed Checks:',
    `${completedSlots} / ${totalSlots} Slots`,
    'Total Habits:',
    habits.length.toString(),
    'Days In Month:',
    daysInMonth.toString(),
  ];

  // Row 3: Monthly Notes
  const row3 = [
    'Monthly Notes / Reflection (လစဉ် မှတ်စု):',
    trackerData.notes || 'No monthly notes recorded.',
  ];

  // Row 4: Empty separator
  const row4: string[] = [];

  // Row 5: Column Headers
  const row5 = [
    'Category (ကဏ္ဍ)',
    'Habit Name (အလေ့အကျင့်အမည်)',
    ...dayColHeaders,
    'Total Done (ရက်)',
    'Total Days (ရက်)',
    'Completion %',
    'Performance Status',
  ];

  const gridRows: string[][] = [row1, row2, row3, row4, row5];

  // Category labels mapping
  const categoryLabels: Record<HabitCategoryType, { titleMm: string; titleEn: string }> = {
    exercise: { titleMm: 'ကိုယ်လက်လှုပ်ရှားမှု', titleEn: 'Exercise & Fitness' },
    food: { titleMm: 'အစားအသောက်နှင့် အာဟာရ', titleEn: 'Food & Nutrition' },
    rest: { titleMm: 'အနားယူခြင်းနှင့် အခြား', titleEn: 'Rest & Mental Habits' },
  };

  const categoriesOrder: HabitCategoryType[] = ['exercise', 'food', 'rest'];

  // Map habits into grid rows grouped by category
  for (const catKey of categoriesOrder) {
    const catHabits = habits.filter((h) => h.category === catKey);
    const catInfo = categoryLabels[catKey];

    for (const habit of catHabits) {
      let habitDoneDays = 0;
      const dayValues: string[] = [];

      for (let d = 1; d <= daysInMonth; d++) {
        const isChecked = !!trackerData.checks[`${habit.id}_${d}`];
        if (isChecked) {
          habitDoneDays++;
          dayValues.push('✓');
        } else {
          dayValues.push('-');
        }
      }

      const habitRate = daysInMonth > 0 ? Math.round((habitDoneDays / daysInMonth) * 100) : 0;
      const habitStatus =
        habitRate >= 80 ? '🔥 Outstanding' : habitRate >= 50 ? '👍 Consistent' : '⚠️ Focus Needed';

      gridRows.push([
        `${catInfo.titleMm} (${catInfo.titleEn})`,
        habit.nameMm || habit.name,
        ...dayValues,
        habitDoneDays.toString(),
        daysInMonth.toString(),
        `${habitRate}%`,
        habitStatus,
      ]);
    }
  }

  // Row: Empty separator
  gridRows.push([]);

  // Daily Summary Row: Total completed habits on each day
  const dailyDoneCounts: number[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    let dayDone = 0;
    for (const habit of habits) {
      if (trackerData.checks[`${habit.id}_${d}`]) {
        dayDone++;
      }
    }
    dailyDoneCounts.push(dayDone);
  }

  gridRows.push([
    '📊 SUMMARY (အနှစ်ချုပ်)',
    'Daily Habits Completed (တစ်နေ့တာ ပြီးမြောက်မှု အရေအတွက်)',
    ...dailyDoneCounts.map((c) => c.toString()),
    completedSlots.toString(),
    totalSlots.toString(),
    `${scorePercent}%`,
    medalTier,
  ]);

  // Daily Rate % Row
  gridRows.push([
    '📈 SUMMARY (ရာခိုင်နှုန်း)',
    'Daily Completion Rate % (တစ်နေ့တာ ပြည့်မြောက်မှု %)',
    ...dailyDoneCounts.map((c) => {
      const rate = habits.length > 0 ? Math.round((c / habits.length) * 100) : 0;
      return `${rate}%`;
    }),
    '-',
    '-',
    `${scorePercent}%`,
    scorePercent >= 80 ? 'EXCELLENT' : scorePercent >= 50 ? 'GOOD' : 'NEEDS WORK',
  ]);

  // 4. Write data to Google Sheet
  onProgress?.('Google Sheet သို့ လစဉ် Grid ဇယား အချက်အလက်များ တင်သွင်းနေပါသည်...', 85);

  const range = `'${sheetTabName}'!A1:AN${gridRows.length + 5}`;

  // Clear existing content in tab
  try {
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:clear`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (clearErr) {
    console.warn('Clear range note:', clearErr);
  }

  // Write new values
  const writeRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range,
        values: gridRows,
      }),
    }
  );

  if (!writeRes.ok) {
    const errorBody = await writeRes.text();
    throw new Error(`Failed to write values to Google Sheet: ${writeRes.status} ${errorBody}`);
  }

  // Optional: Set column widths & freeze panes via batchUpdate
  if (sheetId) {
    try {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            // Freeze 5 rows and 2 columns
            {
              updateSheetProperties: {
                properties: {
                  sheetId,
                  gridProperties: {
                    frozenRowCount: 5,
                    frozenColumnCount: 2,
                  },
                },
                fields: 'gridProperties(frozenRowCount,frozenColumnCount)',
              },
            },
            // Set category column width
            {
              updateDimensionProperties: {
                range: {
                  sheetId,
                  dimension: 'COLUMNS',
                  startIndex: 0,
                  endIndex: 1,
                },
                properties: { pixelSize: 190 },
                fields: 'pixelSize',
              },
            },
            // Set habit name column width
            {
              updateDimensionProperties: {
                range: {
                  sheetId,
                  dimension: 'COLUMNS',
                  startIndex: 1,
                  endIndex: 2,
                },
                properties: { pixelSize: 240 },
                fields: 'pixelSize',
              },
            },
            // Set day columns width (46px each)
            {
              updateDimensionProperties: {
                range: {
                  sheetId,
                  dimension: 'COLUMNS',
                  startIndex: 2,
                  endIndex: 2 + daysInMonth,
                },
                properties: { pixelSize: 48 },
                fields: 'pixelSize',
              },
            },
          ],
        }),
      });
    } catch (fmtErr) {
      console.warn('Formatting batch update optional note:', fmtErr);
    }
  }

  // Save references
  localStorage.setItem('ceo_google_spreadsheet_id', spreadsheetId);
  localStorage.setItem('ceo_google_spreadsheet_url', spreadsheetUrl);
  localStorage.setItem('ceo_google_last_sync', new Date().toISOString());

  onProgress?.(`Google Sheet ထဲသို့ လစဉ် Habit Grid သိမ်းဆည်းပြီးပါပြီ! ✅`, 100);

  return {
    success: true,
    spreadsheetId,
    spreadsheetUrl,
    sheetTabName,
    syncedAt: nowStr,
    summary: {
      yearMonth,
      habitsCount: habits.length,
      daysCount: daysInMonth,
      completedSlots,
      totalSlots,
      scorePercent,
      medal: medalTier,
    },
  };
}

export function getSavedSpreadsheetUrl(): string | null {
  return localStorage.getItem('ceo_google_spreadsheet_url');
}

export function getLastSyncTime(): string | null {
  const raw = localStorage.getItem('ceo_google_last_sync');
  return raw ? new Date(raw).toLocaleString() : null;
}
