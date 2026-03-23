'use client'
// components/tabs/TabOverview.tsx
import type { DashboardData } from '@/lib/sheets'
import { Card, CardTitle, KpiCard, Grid, SectionHeader, Space, FunnelBar } from '../ui'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const p = (n: number, d: number) => d > 0 ? `${(n/d*100).toFixed(1)}%` : '0%'

export default function TabOverview({ data }: { data: DashboardData }) {
  const { stats: s } = data

  const kpis1 = [
    { label:'Tổng CV Thu Thập', value:s.total,      sub:'L0 — Toàn bộ CV nhận được',          color:'#4F8EF7', icon:'📥', pct:100 },
    { label:'CV Pass Lọc HR',   value:s.hrPass,     sub:`${p(s.hrPass,s.total)} tổng CV`,     color:'#2ECC8A', icon:'✅', pct:s.hrPass/s.total*100 },
    { label:'Đồng Ý PV',        value:s.dongYPV,    sub:`${p(s.dongYPV,s.total)} tổng CV`,    color:'#F5A623', icon:'📞', pct:s.dongYPV/s.total*100 },
    { label:'Tham Gia PV V1',   value:s.thamGiaPV,  sub:`${p(s.thamGiaPV,s.total)} tổng CV`,  color:'#9B6FF7', icon:'🎤', pct:s.thamGiaPV/s.total*100 },
  ]
  const kpis2 = [
    { label:'Pass PV V1',          value:s.passPV,   sub:`${p(s.passPV,s.total)} tổng CV`,   color:'#1ACFCF', icon:'🏆', pct:s.passPV/s.total*100 },
    { label:'UV Nhận Việc',        value:s.nhanViec, sub:`${p(s.nhanViec,s.total)} tổng CV`, color:'#2ECC8A', icon:'🚀', pct:s.nhanViec/s.total*100 },
    { label:'UV Đi Làm 10 Ngày',  value:s.d10,      sub:`${p(s.d10,s.total)} tổng CV`,      color:'#FFD700', icon:'⭐', pct:s.d10/s.total*100 },
    { label:'Drop Out',            value:s.dropout,  sub:`${p(s.dropout,s.nhanViec)} nhận việc`, color:'#F75454', icon:'❌', pct:s.dropout/s.total*100 },
  ]

  const monthChart = data.byMonth.map(m => ({
    name: m.label,
    'Tổng CV': m.total,
    'HR Pass': m.hrPass,
    'Nhận việc': m.nhanViec,
  }))

  const COLORS = ['#4F8EF7', '#2ECC8A', '#FFD700']

  return (
    <div>
      {/* KPI ROW 1 */}
      <Grid cols={4}>
        {kpis1.map(k => <KpiCard key={k.label} {...k} />)}
      </Grid>
      <Space h={12} />
      <Grid cols={4}>
        {kpis2.map(k => <KpiCard key={k.label} {...k} />)}
      </Grid>

      <Space h={20} />

      {/* CHARTS ROW */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

        {/* Phễu tổng hợp */}
        <Card>
          <CardTitle sub="T1–T3/2026 — Tỷ lệ trên tổng CV thu thập">📈 Phễu Tuyển Dụng Tổng Hợp</CardTitle>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <FunnelBar label="L0 — CV thu thập"       count={s.total}     total={s.total}    color="#4F8EF7" sublabel="100%" />
            <FunnelBar label="L1 — HR Pass"            count={s.hrPass}    total={s.total}    color="#2ECC8A" />
            <FunnelBar label="L2A — Đồng ý PV"        count={s.dongYPV}   total={s.total}    color="#F5A623" />
            <FunnelBar label="L4 — Tham gia PV"        count={s.thamGiaPV} total={s.total}    color="#9B6FF7" />
            <FunnelBar label="L4A — Pass PV"           count={s.passPV}    total={s.total}    color="#1ACFCF" />
            <FunnelBar label="L7 — Đồng ý nhận việc"  count={s.dongYLam}  total={s.total}    color="#F5A623" />
            <FunnelBar label="L8 — Nhận việc"          count={s.nhanViec}  total={s.total}    color="#2ECC8A" />
            <FunnelBar label="L9 — Đủ 10 ngày"        count={s.d10}       total={s.total}    color="#FFD700" />
          </div>
        </Card>

        {/* Chart tháng */}
        <Card>
          <CardTitle sub="So sánh CV / Pass HR / Nhận việc theo tháng">📅 Xu Hướng Theo Tháng</CardTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthChart} barGap={4}>
              <XAxis dataKey="name" tick={{ fill:'#8B949E', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'#8B949E', fontSize:10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background:'#21262D', border:'1px solid #30363D', borderRadius:8, fontSize:11 }}
                labelStyle={{ color:'#E6EDF3', fontWeight:600 }}
                itemStyle={{ color:'#8B949E' }}
              />
              {['Tổng CV','HR Pass','Nhận việc'].map((key, i) => (
                <Bar key={key} dataKey={key} fill={COLORS[i]} radius={[4,4,0,0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
          <Space h={12} />

          {/* Tỷ lệ chuyển đổi */}
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {[
              { label:'CV → HR Pass',          pct: p(s.hrPass,s.total),     color:'#2ECC8A' },
              { label:'Liên hệ → Đồng ý PV',  pct: p(s.dongYPV,s.hrPass),   color:'#F5A623' },
              { label:'Đồng ý → Tham gia PV', pct: p(s.thamGiaPV,s.dongYPV),color:'#9B6FF7' },
              { label:'PV → Pass PV',          pct: p(s.passPV,s.thamGiaPV), color:'#1ACFCF' },
              { label:'Pass → Nhận việc',      pct: p(s.nhanViec,s.passPV),  color:'#2ECC8A' },
              { label:'Nhận việc → 10 ngày',  pct: p(s.d10,s.nhanViec),     color:'#FFD700' },
            ].map(r => (
              <div key={r.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'5px 8px', background:'#21262D', borderRadius:6 }}>
                <span style={{ fontSize:10, color:'#8B949E' }}>{r.label}</span>
                <span style={{ fontFamily:'Space Mono,monospace', fontSize:12,
                  fontWeight:700, color:r.color }}>{r.pct}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Space h={16} />

      {/* Source + NV */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <Card>
          <CardTitle sub="Top nguồn CV theo số lượng">📡 Nguồn CV</CardTitle>
          {data.bySource.slice(0,6).map((s, i) => (
            <div key={s.nguon} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
              <div style={{ fontSize:11, color:'#6E7681', width:18, textAlign:'right' }}>#{i+1}</div>
              <div style={{ flex:1, fontSize:11, color:'#E6EDF3', fontWeight:500 }}>{s.nguon}</div>
              <div style={{ width:80, height:4, background:'#21262D', borderRadius:2, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${data.bySource[0]?.total>0?s.total/data.bySource[0].total*100:0}%`, background:'#4F8EF7', borderRadius:2 }} />
              </div>
              <div style={{ fontFamily:'Space Mono,monospace', fontSize:11, color:'#4F8EF7', width:30, textAlign:'right' }}>{s.total}</div>
              <div style={{ fontSize:10, color:'#2ECC8A', width:36, textAlign:'right' }}>{p(s.hrPass,s.total)}</div>
            </div>
          ))}
        </Card>

        <Card>
          <CardTitle sub="Chuyên viên phụ trách tuyển dụng">👤 NV Phụ Trách</CardTitle>
          {data.byNV.map((n, i) => (
            <div key={n.nvTD} style={{
              background:'#21262D', borderRadius:10, padding:'12px 14px', marginBottom:8,
              border:'1px solid #30363D'
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:['#9B6FF7','#F5A623'][i]||'#4F8EF7' }}>{n.nvTD}</div>
                  <div style={{ fontSize:9, color:'#6E7681', marginTop:2 }}>Chuyên viên tuyển dụng</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontFamily:'Space Mono,monospace', fontSize:20, fontWeight:700, color:['#9B6FF7','#F5A623'][i]||'#4F8EF7' }}>{n.total}</div>
                  <div style={{ fontSize:9, color:'#6E7681' }}>CV phụ trách</div>
                </div>
              </div>
              <div style={{ height:3, background:'#30363D', borderRadius:2 }}>
                <div style={{ height:'100%', width:`${p(n.total,data.stats.total)}`, background:['#9B6FF7','#F5A623'][i]||'#4F8EF7', borderRadius:2 }} />
              </div>
              <div style={{ display:'flex', gap:12, marginTop:8, fontSize:10, color:'#6E7681' }}>
                <span>Pass HR: <b style={{ color:'#2ECC8A' }}>{n.hrPass}</b></span>
                <span>Nhận việc: <b style={{ color:'#FFD700' }}>{n.nhanViec}</b></span>
                <span>Tỷ lệ: <b style={{ color:'#1ACFCF' }}>{p(n.nhanViec,n.total)}</b></span>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
