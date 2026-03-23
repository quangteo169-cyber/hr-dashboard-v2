'use client'
// components/Dashboard.tsx
import { useState } from 'react'
import type { DashboardData } from '@/lib/sheets'
import styles from './Dashboard.module.css'
import TabOverview   from './tabs/TabOverview'
import TabLevel      from './tabs/TabLevel'
import TabFunnel     from './tabs/TabFunnel'
import TabSource     from './tabs/TabSource'
import TabPosition   from './tabs/TabPosition'
import TabMonthly    from './tabs/TabMonthly'
import TabRaw        from './tabs/TabRaw'

const TABS = [
  { id: 'overview',  icon: '📊', label: 'Tổng Quan'       },
  { id: 'level',     icon: '🏆', label: 'Bộ Level'         },
  { id: 'funnel',    icon: '🎯', label: 'Phễu Tuyển Dụng' },
  { id: 'monthly',   icon: '🗓️', label: 'Theo Tháng'      },
  { id: 'source',    icon: '📡', label: 'Nguồn & Kênh'    },
  { id: 'position',  icon: '💼', label: 'Vị Trí'           },
  { id: 'raw',       icon: '📋', label: 'Raw Data'         },
]

export default function Dashboard({ data }: { data: DashboardData }) {
  const [tab, setTab] = useState('overview')

  return (
    <div className={styles.shell}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>👥</div>
          <div>
            <div className={styles.title}>DASHBOARD BÁO CÁO TUYỂN DỤNG</div>
            <div className={styles.subtitle}>HQ Group — Phòng Nhân Sự & Tuyển Dụng</div>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.period}>Tháng 1–3 / 2026</div>
          <div className={styles.updated}>
            <span className={styles.dot} />
            Cập nhật: {data.updatedAt}
          </div>
        </div>
      </header>

      {/* TABS */}
      <nav className={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </nav>

      {/* CONTENT */}
      <main className={styles.content}>
        {tab === 'overview'  && <TabOverview  data={data} />}
        {tab === 'level'     && <TabLevel     data={data} />}
        {tab === 'funnel'    && <TabFunnel    data={data} />}
        {tab === 'monthly'   && <TabMonthly   data={data} />}
        {tab === 'source'    && <TabSource    data={data} />}
        {tab === 'position'  && <TabPosition  data={data} />}
        {tab === 'raw'       && <TabRaw       data={data} />}
      </main>
    </div>
  )
}
