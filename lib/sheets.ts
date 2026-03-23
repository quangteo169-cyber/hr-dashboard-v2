// lib/sheets.ts
const SHEET_ID = '12OEW_fXE5NnGXdYEcbxnvoIOcDDwENP5B0T6Xx8Byec'
const GID = '1209894745'

function getCsvUrl() {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  const lines = text.split('\n')
  for (const line of lines) {
    if (!line.trim()) continue
    const cols: string[] = []
    let cur = ''
    let inQuote = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') { cur += '"'; i++ }
        else inQuote = !inQuote
      } else if (ch === ',' && !inQuote) { cols.push(cur.trim()); cur = '' }
      else cur += ch
    }
    cols.push(cur.trim())
    rows.push(cols)
  }
  return rows
}

export interface Candidate {
  stt: number
  ngay: string
  thang: number
  tuan: number
  nvTD: string
  nguon: string
  hinhThuc: string
  capBac: string
  viTri: string
  tenUV: string
  team: string
  hrLocCV: string        // Cột P (index 15): "Pass" / "Fail"
  leaderLocCV: string
  ketQuaGoiMoi: string   // Cột Q (index 16): "Đồng ý" / "Từ chối"
  thamGiaPV: string      // Cột U (index 20): "Có"
  ketQuaPV: string       // Cột V (index 21): "Pass" / "Fail"
  dongYDiLam: string     // Cột X (index 23): "Có"
  ngayHenLamViec: string
  uvNhanViec: string     // Cột Z (index 25): "Có"
  uvDiLam10Ngay: string  // Cột AA (index 26): "Có"
  dropOut: string        // Cột AB (index 27): "Không" = dropout
  level: string
}

export interface DashboardData {
  candidates: Candidate[]
  stats: Stats
  levelStats: LevelStat[]
  byMonth: MonthStat[]
  byWeek: WeekStat[]
  bySource: SourceStat[]
  byPosition: PositionStat[]
  byNV: NVStat[]
  updatedAt: string
}

export interface Stats {
  total: number
  hrPass: number
  hrFail: number
  dongYPV: number
  tuChoiPV: number
  thamGiaPV: number
  passPV: number
  failPV: number
  dongYLam: number
  nhanViec: number
  d10: number
  dropout: number
}

export interface LevelStat {
  level: string
  label: string
  count: number
  pctTotal: number   // % trên tổng CV thu thập
  pctPrev: number    // % chuyển đổi từ level trước
  color: string
  bg: string
}

export interface MonthStat {
  month: string
  label: string
  total: number; hrPass: number; dongYPV: number
  thamGiaPV: number; passPV: number; nhanViec: number; d10: number
}

export interface WeekStat {
  week: string; label: string; total: number
  hrPass: number; thamGiaPV: number; nhanViec: number
}

export interface SourceStat {
  nguon: string; total: number; hrPass: number
  thamGiaPV: number; nhanViec: number; passRate: number
}

export interface PositionStat {
  viTri: string; total: number; hrPass: number
  thamGiaPV: number; nhanViec: number
}

export interface NVStat {
  nvTD: string; total: number; hrPass: number; nhanViec: number
}

function getWeekNumber(dateStr: string): number {
  const parts = dateStr.split('/')
  if (parts.length < 3) return 0
  const d = new Date(+parts[2], +parts[1] - 1, +parts[0])
  const startOfYear = new Date(d.getFullYear(), 0, 1)
  return Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7)
}

function getMonth(dateStr: string): number {
  const parts = dateStr.split('/')
  return parts.length >= 2 ? +parts[1] : 0
}

function calcLevel(c: Omit<Candidate, 'level'>): string {
  if (c.uvDiLam10Ngay === 'Có') return 'L9'
  if (c.uvNhanViec === 'Có') {
    const cb = c.capBac.toLowerCase()
    return (cb.includes('part') || cb.includes('tts') || cb.includes('intern')) ? 'L8.2' : 'L8.1'
  }
  if (c.dongYDiLam === 'Có') return 'L7'
  if (c.ketQuaPV === 'Pass') return 'L4A'
  if (c.ketQuaPV === 'Fail') return 'L4B'
  if (c.thamGiaPV === 'Có') return 'L4'
  if (c.ketQuaGoiMoi === 'Đồng ý') return 'L2A'
  if (c.ketQuaGoiMoi === 'Từ chối') return 'L2B'
  if (c.hrLocCV === 'Pass') return 'L1'
  return 'L0'
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const url = getCsvUrl()
  const res = await fetch(url, { next: { revalidate: 300 } }) // cache 5 phút
  if (!res.ok) throw new Error(`Không thể tải dữ liệu: ${res.status}`)
  const text = await res.text()
  const rows = parseCsv(text)

  // Tìm hàng header (hàng có "STT")
  let dataStart = 0
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] === 'STT' || rows[i][0] === '1') { dataStart = i + 1; break }
  }
  // Fallback: dữ liệu bắt đầu từ hàng 5 (index 4, bỏ 4 hàng header)
  if (dataStart === 0) dataStart = 5

  const candidates: Candidate[] = []

  for (let i = dataStart; i < rows.length; i++) {
    const r = rows[i]
    if (!r[0] || isNaN(+r[0])) continue
    // Col map (0-indexed, theo chữ cái cột Google Sheet):
    // A=0=STT, B=1=Ngày, C=2=NVTD, D=3=Nguồn, E=4=HinhThuc,
    // F=5, G=6=CapBac, H=7=ViTri, I=8=TenUV,
    // J=9, K=10, L=11, M=12, N=13=DinhHuongTeam, O=14=Team,
    // P=15 = HRlocCV       → "Pass" / "Fail"
    // Q=16 = KetQuaGoiMoi  → "Đồng ý" / "Từ chối"
    // R=17, S=18, T=19,
    // U=20 = ThamGiaPV     → "Có"
    // V=21 = KetQuaPV      → "Pass" / "Fail"
    // W=22,
    // X=23 = DongYDiLam    → "Có"
    // Y=24 = NgayHen,
    // Z=25 = NhanViec      → "Có"
    // AA=26 = DiLam10Ngay  → "Có"
    // AB=27 = DropOut      → "Không"
    const base: Omit<Candidate, 'level'> = {
      stt:             +r[0],
      ngay:            r[1]  || '',
      thang:           getMonth(r[1] || ''),
      tuan:            getWeekNumber(r[1] || ''),
      nvTD:            r[2]  || '',
      nguon:           r[3]  || 'Khác',
      hinhThuc:        r[4]  || '',
      capBac:          r[6]  || '',
      viTri:           r[7]  || '',
      tenUV:           r[8]  || '',
      team:            r[14] || r[13] || '',
      hrLocCV:         r[15] || '',   // Cột P
      leaderLocCV:     r[15] || '',   // Cột P (dùng cùng HR filter)
      ketQuaGoiMoi:    r[16] || '',   // Cột Q
      thamGiaPV:       r[20] || '',   // Cột U
      ketQuaPV:        r[21] || '',   // Cột V
      dongYDiLam:      r[23] || '',   // Cột X
      ngayHenLamViec:  r[24] || '',   // Cột Y
      uvNhanViec:      r[25] || '',   // Cột Z
      uvDiLam10Ngay:   r[26] || '',   // Cột AA
      dropOut:         r[27] || '',   // Cột AB
    }
    candidates.push({ ...base, level: calcLevel(base) })
  }

  const total      = candidates.length
  const hrPass     = candidates.filter(c => c.hrLocCV === 'Pass').length
  const hrFail     = candidates.filter(c => c.hrLocCV === 'Fail').length
  const dongYPV    = candidates.filter(c => c.ketQuaGoiMoi === 'Đồng ý').length
  const tuChoiPV   = candidates.filter(c => c.ketQuaGoiMoi === 'Từ chối').length
  const thamGiaPV  = candidates.filter(c => c.thamGiaPV === 'Có').length
  const passPV     = candidates.filter(c => c.ketQuaPV === 'Pass').length
  const failPV     = candidates.filter(c => c.ketQuaPV === 'Fail').length
  const dongYLam   = candidates.filter(c => c.dongYDiLam === 'Có').length
  const nhanViec   = candidates.filter(c => c.uvNhanViec === 'Có').length
  const d10        = candidates.filter(c => c.uvDiLam10Ngay === 'Có').length
  // Drop out = UV nhận việc nhưng cột AB = "Không" (không đi làm đủ 10 ngày)
  const dropout    = candidates.filter(c => c.dropOut === 'Không').length

  const pct = (n: number, d: number) => d > 0 ? Math.round(n / d * 10) / 10 : 0

  // ── LEVEL STATS ─────────────────────────────────────────────
  const lvCnt = (l: string) => candidates.filter(c => c.level === l).length
  const levelDefs = [
    { level: 'L0',   label: 'CV thu thập được',             color: '#6B7280', bg: 'rgba(107,114,128,0.15)' },
    { level: 'L1',   label: 'CV pass lọc HR',                color: '#8B949E', bg: 'rgba(139,148,158,0.15)' },
    { level: 'L2A',  label: 'UV đồng ý phỏng vấn',          color: '#4F8EF7', bg: 'rgba(79,142,247,0.15)'  },
    { level: 'L2B',  label: 'UV từ chối phỏng vấn',         color: '#F75454', bg: 'rgba(247,84,84,0.15)'   },
    { level: 'L4',   label: 'UV tham gia PV V1',             color: '#F5A623', bg: 'rgba(245,166,35,0.15)'  },
    { level: 'L4A',  label: 'UV pass PV V1',                 color: '#1ACFCF', bg: 'rgba(26,207,207,0.15)'  },
    { level: 'L4B',  label: 'UV fail PV V1',                 color: '#F75454', bg: 'rgba(247,84,84,0.12)'   },
    { level: 'L7',   label: 'UV có lịch hẹn đi làm',        color: '#F5A623', bg: 'rgba(245,166,35,0.15)'  },
    { level: 'L8.1', label: 'UV đi làm ngày đầu (Full-time)',color: '#2ECC8A', bg: 'rgba(46,204,138,0.15)'  },
    { level: 'L8.2', label: 'UV đi làm ngày đầu (PT/TTS)',  color: '#2ECC8A', bg: 'rgba(46,204,138,0.12)'  },
    { level: 'L9',   label: 'UV đi làm đủ 10 ngày ✨',      color: '#FFD700', bg: 'rgba(255,215,0,0.15)'   },
  ]
  const prevStage = [total, total, hrPass, hrPass, dongYPV, thamGiaPV, thamGiaPV, passPV, dongYLam, dongYLam, nhanViec]
  const levelStats: LevelStat[] = levelDefs.map((def, i) => {
    const count = def.level === 'L0' ? total : lvCnt(def.level)
    return {
      ...def,
      count,
      pctTotal: pct(count, total),
      pctPrev:  pct(count, prevStage[i]),
    }
  })

  // ── BY MONTH ─────────────────────────────────────────────────
  const months = [...new Set(candidates.map(c => c.thang))].filter(Boolean).sort((a, b) => a - b)
  const byMonth: MonthStat[] = months.map(m => {
    const mc = candidates.filter(c => c.thang === m)
    return {
      month: String(m),
      label: `T${m}`,
      total:      mc.length,
      hrPass:     mc.filter(c => c.hrLocCV === 'Pass').length,
      dongYPV:    mc.filter(c => c.ketQuaGoiMoi === 'Đồng ý').length,
      thamGiaPV:  mc.filter(c => c.thamGiaPV === 'Có').length,
      passPV:     mc.filter(c => c.ketQuaPV === 'Pass').length,
      nhanViec:   mc.filter(c => c.uvNhanViec === 'Có').length,
      d10:        mc.filter(c => c.uvDiLam10Ngay === 'Có').length,
    }
  })

  // ── BY WEEK ───────────────────────────────────────────────────
  const weeks = [...new Set(candidates.filter(c=>c.tuan>0).map(c => c.tuan))].sort((a, b) => a - b)
  const byWeek: WeekStat[] = weeks.map(w => {
    const wc = candidates.filter(c => c.tuan === w)
    return {
      week: String(w), label: `T${w}`,
      total:     wc.length,
      hrPass:    wc.filter(c => c.hrLocCV === 'Pass').length,
      thamGiaPV: wc.filter(c => c.thamGiaPV === 'Có').length,
      nhanViec:  wc.filter(c => c.uvNhanViec === 'Có').length,
    }
  })

  // ── BY SOURCE ────────────────────────────────────────────────
  const nguonMap = new Map<string, SourceStat>()
  for (const c of candidates) {
    const key = c.nguon || 'Khác'
    if (!nguonMap.has(key)) nguonMap.set(key, { nguon: key, total:0, hrPass:0, thamGiaPV:0, nhanViec:0, passRate:0 })
    const s = nguonMap.get(key)!
    s.total++
    if (c.hrLocCV === 'Pass') s.hrPass++
    if (c.thamGiaPV === 'Có') s.thamGiaPV++
    if (c.uvNhanViec === 'Có') s.nhanViec++
  }
  const bySource: SourceStat[] = [...nguonMap.values()]
    .map(s => ({ ...s, passRate: pct(s.hrPass, s.total) }))
    .sort((a, b) => b.total - a.total)

  // ── BY POSITION ──────────────────────────────────────────────
  const posMap = new Map<string, PositionStat>()
  for (const c of candidates) {
    const key = c.viTri || 'Chưa xác định'
    if (!posMap.has(key)) posMap.set(key, { viTri: key, total:0, hrPass:0, thamGiaPV:0, nhanViec:0 })
    const p = posMap.get(key)!
    p.total++
    if (c.hrLocCV === 'Pass') p.hrPass++
    if (c.thamGiaPV === 'Có') p.thamGiaPV++
    if (c.uvNhanViec === 'Có') p.nhanViec++
  }
  const byPosition: PositionStat[] = [...posMap.values()].sort((a, b) => b.total - a.total)

  // ── BY NV ─────────────────────────────────────────────────────
  const nvMap = new Map<string, NVStat>()
  for (const c of candidates) {
    const key = c.nvTD || 'Khác'
    if (!nvMap.has(key)) nvMap.set(key, { nvTD: key, total:0, hrPass:0, nhanViec:0 })
    const n = nvMap.get(key)!
    n.total++
    if (c.hrLocCV === 'Pass') n.hrPass++
    if (c.uvNhanViec === 'Có') n.nhanViec++
  }

  return {
    candidates,
    stats: { total, hrPass, hrFail, dongYPV, tuChoiPV, thamGiaPV, passPV, failPV, dongYLam, nhanViec, d10, dropout },
    levelStats,
    byMonth,
    byWeek,
    bySource,
    byPosition,
    byNV: [...nvMap.values()].sort((a, b) => b.total - a.total),
    updatedAt: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
  }
}
