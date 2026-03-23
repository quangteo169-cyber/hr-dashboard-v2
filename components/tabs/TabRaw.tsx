'use client'
// components/tabs/TabRaw.tsx
import { useState, useMemo } from 'react'
import type { DashboardData } from '@/lib/sheets'
import { Card, Badge } from '../ui'

const LEVEL_COLORS: Record<string, string> = {
  L0:'#6B7280', L1:'#8B949E', 'L2A':'#4F8EF7', 'L2B':'#F75454',
  L4:'#F5A623', 'L4A':'#1ACFCF', 'L4B':'#F75454',
  L7:'#F5A623', 'L8.1':'#2ECC8A', 'L8.2':'#2ECC8A', L9:'#FFD700',
}

export default function TabRaw({ data }: { data: DashboardData }) {
  const [search, setSearch] = useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const [filterNguon, setFilterNguon] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [page, setPage] = useState(1)
  const PER_PAGE = 50

const levels = Array.from(new Set(data.candidates.map(c => c.level))).sort();
const nguons = Array.from(new Set(data.candidates.map(c => c.nguon))).sort();

  const filtered = useMemo(() => {
    return data.candidates.filter(c => {
      if (filterLevel && c.level !== filterLevel) return false
      if (filterNguon && c.nguon !== filterNguon) return false
      if (filterMonth && String(c.thang) !== filterMonth) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          c.tenUV.toLowerCase().includes(q) ||
          c.viTri.toLowerCase().includes(q) ||
          c.nvTD.toLowerCase().includes(q) ||
          c.nguon.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [data.candidates, search, filterLevel, filterNguon, filterMonth])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE)

  const inputStyle: React.CSSProperties = {
    background:'#21262D', border:'1px solid #30363D', borderRadius:6,
    color:'#E6EDF3', padding:'6px 10px', fontSize:11, fontFamily:'inherit',
    outline:'none',
  }

  return (
    <div>
      {/* FILTERS */}
      <div style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
        <input
          placeholder="🔍 Tìm tên UV, vị trí, NV tuyển..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          style={{ ...inputStyle, flex:1, minWidth:200 }}
        />
        <select value={filterLevel} onChange={e => { setFilterLevel(e.target.value); setPage(1) }} style={inputStyle}>
          <option value="">Tất cả Level</option>
          {levels.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={filterNguon} onChange={e => { setFilterNguon(e.target.value); setPage(1) }} style={inputStyle}>
          <option value="">Tất cả Nguồn</option>
          {nguons.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <select value={filterMonth} onChange={e => { setFilterMonth(e.target.value); setPage(1) }} style={inputStyle}>
          <option value="">Tất cả Tháng</option>
          {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => <option key={m} value={m}>Tháng {m}</option>)}
        </select>
        <div style={{ fontSize:11, color:'#8B949E', whiteSpace:'nowrap' }}>
          {filtered.length} / {data.candidates.length} UV
        </div>
        {(search||filterLevel||filterNguon||filterMonth) && (
          <button onClick={() => { setSearch(''); setFilterLevel(''); setFilterNguon(''); setFilterMonth(''); setPage(1) }}
            style={{ ...inputStyle, cursor:'pointer', color:'#F75454', borderColor:'#F7545444' }}>
            ✕ Xóa lọc
          </button>
        )}
      </div>

      <Card style={{ padding:0 }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
            <thead>
              <tr style={{ background:'#21262D', borderBottom:'1px solid #30363D' }}>
                {['STT','Ngày','NV TD','Nguồn','Cấp bậc','Vị trí','Tên UV','Team',
                  'HR lọc','Leader lọc','Gọi mời','Tham gia PV','KQ PV','Đồng ý','Nhận việc','10 ngày','Drop Out','Level'].map((h,i) => (
                  <th key={h} style={{
                    padding:'9px 10px', textAlign:i===0?'center':'left',
                    color:'#6E7681', fontSize:9, fontWeight:700,
                    textTransform:'uppercase', letterSpacing:'0.5px', whiteSpace:'nowrap'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((c, i) => (
                <tr key={c.stt} style={{
                  background: i%2===0?'#1C2128':'#21262D',
                  borderBottom:'1px solid #21262D'
                }}>
                  <td style={{ padding:'7px 10px', textAlign:'center', color:'#6E7681', fontSize:10 }}>{c.stt}</td>
                  <td style={{ padding:'7px 10px', color:'#8B949E', whiteSpace:'nowrap' }}>{c.ngay}</td>
                  <td style={{ padding:'7px 10px', color:'#9B6FF7', fontWeight:500 }}>{c.nvTD}</td>
                  <td style={{ padding:'7px 10px', color:'#8B949E' }}>{c.nguon}</td>
                  <td style={{ padding:'7px 10px', color:'#8B949E' }}>{c.capBac}</td>
                  <td style={{ padding:'7px 10px', color:'#E6EDF3', maxWidth:200, overflow:'hidden',
                    textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={c.viTri}>{c.viTri}</td>
                  <td style={{ padding:'7px 10px', color:'#E6EDF3', fontWeight:500, whiteSpace:'nowrap' }}>{c.tenUV}</td>
                  <td style={{ padding:'7px 10px', color:'#8B949E' }}>{c.team}</td>
                  <td style={{ padding:'7px 10px', textAlign:'center' }}>
                    {c.hrLocCV && <span style={{
                      fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:3,
                      background:c.hrLocCV==='Pass'?'rgba(46,204,138,.2)':'rgba(247,84,84,.2)',
                      color:c.hrLocCV==='Pass'?'#2ECC8A':'#F75454'
                    }}>{c.hrLocCV}</span>}
                  </td>
                  <td style={{ padding:'7px 10px', textAlign:'center' }}>
                    {c.leaderLocCV && <span style={{
                      fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:3,
                      background:c.leaderLocCV==='Pass'?'rgba(46,204,138,.2)':'rgba(247,84,84,.2)',
                      color:c.leaderLocCV==='Pass'?'#2ECC8A':'#F75454'
                    }}>{c.leaderLocCV}</span>}
                  </td>
                  <td style={{ padding:'7px 10px', color:c.ketQuaGoiMoi==='Đồng ý'?'#F5A623':c.ketQuaGoiMoi==='Từ chối'?'#F75454':'#8B949E',
                    fontSize:10 }}>{c.ketQuaGoiMoi}</td>
                  <td style={{ padding:'7px 10px', textAlign:'center', color:c.thamGiaPV==='Có'?'#9B6FF7':'#30363D' }}>
                    {c.thamGiaPV==='Có'?'✓':''}
                  </td>
                  <td style={{ padding:'7px 10px', textAlign:'center' }}>
                    {c.ketQuaPV && <span style={{
                      fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:3,
                      background:c.ketQuaPV==='Pass'?'rgba(26,207,207,.2)':'rgba(247,84,84,.2)',
                      color:c.ketQuaPV==='Pass'?'#1ACFCF':'#F75454'
                    }}>{c.ketQuaPV}</span>}
                  </td>
                  <td style={{ padding:'7px 10px', textAlign:'center', color:c.dongYDiLam==='Có'?'#F5A623':'#30363D' }}>
                    {c.dongYDiLam==='Có'?'✓':''}
                  </td>
                  <td style={{ padding:'7px 10px', textAlign:'center', color:c.uvNhanViec==='Có'?'#2ECC8A':'#30363D' }}>
                    {c.uvNhanViec==='Có'?'✓':''}
                  </td>
                  <td style={{ padding:'7px 10px', textAlign:'center', color:c.uvDiLam10Ngay==='Có'?'#FFD700':'#30363D' }}>
                    {c.uvDiLam10Ngay==='Có'?'⭐':''}
                  </td>
                  <td style={{ padding:'7px 10px', textAlign:'center' }}>
                    {c.dropOut === 'Không' && (
                      <span style={{
                        fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:3,
                        background:'rgba(247,84,84,.2)', color:'#F75454'
                      }}>Drop Out</span>
                    )}
                  </td>
                  <td style={{ padding:'7px 10px', textAlign:'center' }}>
                    <span style={{
                      fontFamily:'Space Mono,monospace', fontSize:9, fontWeight:700,
                      padding:'2px 7px', borderRadius:4,
                      color:LEVEL_COLORS[c.level]||'#8B949E',
                      background:`${LEVEL_COLORS[c.level]||'#8B949E'}22`,
                      border:`1px solid ${LEVEL_COLORS[c.level]||'#8B949E'}44`
                    }}>{c.level}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div style={{ display:'flex', justifyContent:'center', alignItems:'center',
            gap:8, padding:'12px 16px', borderTop:'1px solid #30363D' }}>
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
              style={{ background:'#21262D', border:'1px solid #30363D', borderRadius:5,
                color:page===1?'#30363D':'#8B949E', padding:'4px 10px', cursor:page===1?'default':'pointer',
                fontSize:11, fontFamily:'inherit' }}>
              ← Trước
            </button>
            <span style={{ fontSize:11, color:'#8B949E' }}>
              Trang {page} / {totalPages}
            </span>
            <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
              style={{ background:'#21262D', border:'1px solid #30363D', borderRadius:5,
                color:page===totalPages?'#30363D':'#8B949E', padding:'4px 10px',
                cursor:page===totalPages?'default':'pointer', fontSize:11, fontFamily:'inherit' }}>
              Sau →
            </button>
          </div>
        )}
      </Card>
    </div>
  )
}
