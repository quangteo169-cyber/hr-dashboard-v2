'use client'
// components/tabs/TabMonthly.tsx
import type { DashboardData } from '@/lib/sheets'
import { Card, CardTitle, Space, KpiCard, Grid } from '../ui'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const p = (n: number, d: number) => d > 0 ? `${(n/d*100).toFixed(1)}%` : '—'

export default function TabMonthly({ data }: { data: DashboardData }) {
  const chartData = data.byMonth.map(m => ({
    name: m.label,
    'Tổng CV': m.total,
    'HR Pass': m.hrPass,
    'Tham gia PV': m.thamGiaPV,
    'Nhận việc': m.nhanViec,
    '10 ngày': m.d10,
  }))

  return (
    <div>
      <Card style={{ marginBottom:16 }}>
        <CardTitle sub="Xu hướng các chỉ số qua các tháng">📈 Biểu Đồ Theo Tháng</CardTitle>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262D" />
            <XAxis dataKey="name" tick={{ fill:'#8B949E', fontSize:11 }} axisLine={false} />
            <YAxis tick={{ fill:'#8B949E', fontSize:10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background:'#21262D', border:'1px solid #30363D', borderRadius:8, fontSize:11 }} />
            <Legend wrapperStyle={{ fontSize:11, color:'#8B949E', paddingTop:12 }} />
            <Line type="monotone" dataKey="Tổng CV"    stroke="#4F8EF7" strokeWidth={2} dot={{ r:4 }} />
            <Line type="monotone" dataKey="HR Pass"    stroke="#2ECC8A" strokeWidth={2} dot={{ r:4 }} />
            <Line type="monotone" dataKey="Tham gia PV" stroke="#9B6FF7" strokeWidth={2} dot={{ r:4 }} />
            <Line type="monotone" dataKey="Nhận việc"  stroke="#FFD700" strokeWidth={2} dot={{ r:4 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16 }}>
        {data.byMonth.map(m => (
          <Card key={m.month}>
            <CardTitle sub={`Tháng ${m.month} / 2026`}>{m.label} — Chi Tiết</CardTitle>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[
                { label:'Tổng CV thu thập', val:m.total,     color:'#4F8EF7', pct:p(m.total,data.stats.total) },
                { label:'HR Pass lọc',      val:m.hrPass,    color:'#2ECC8A', pct:p(m.hrPass,m.total)         },
                { label:'Đồng ý PV',        val:m.dongYPV,   color:'#F5A623', pct:p(m.dongYPV,m.total)        },
                { label:'Tham gia PV',      val:m.thamGiaPV, color:'#9B6FF7', pct:p(m.thamGiaPV,m.total)      },
                { label:'Pass PV',          val:m.passPV,    color:'#1ACFCF', pct:p(m.passPV,m.thamGiaPV)     },
                { label:'Nhận việc',        val:m.nhanViec,  color:'#2ECC8A', pct:p(m.nhanViec,m.total)        },
                { label:'Đủ 10 ngày',       val:m.d10,       color:'#FFD700', pct:p(m.d10,m.nhanViec)          },
              ].map(row => (
                <div key={row.label} style={{ display:'flex', justifyContent:'space-between',
                  alignItems:'center', padding:'6px 10px', background:'#21262D', borderRadius:6 }}>
                  <span style={{ fontSize:10, color:'#8B949E' }}>{row.label}</span>
                  <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                    <span style={{ fontSize:10, color:'#6E7681' }}>{row.pct}</span>
                    <span style={{ fontFamily:'Space Mono,monospace', fontSize:14,
                      fontWeight:700, color:row.color }}>{row.val}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
