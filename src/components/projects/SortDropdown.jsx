import React from 'react'
import { Dropdown, Menu, Button } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import { pad } from 'crypto-js'

const SORT_OPTIONS = [
  { key: 'created_at', label: 'Sort by created date' },
  { key: 'name', label: 'Sort by name' },
]

export default function SortDropdown({ selectedSort, onSortChange }) {
  const menu = (
    <Menu
      selectedKeys={[selectedSort]}
      onClick={({ key }) => onSortChange(key)}
      items={SORT_OPTIONS.map(opt => ({ key: opt.key, label: opt.label }))}
    />
  )

  const currentLabel = SORT_OPTIONS.find(opt => opt.key === selectedSort)?.label || 'Sort'

  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <Button type="default" style={{ background: 'rgba(15, 32, 39, 0.8)', color: '#fff', border: 'none', minWidth: 120, border: '1px solid rgba(255, 255, 255, 0.2)',radius: '8px', padding: '12px 12px', height: 'auto' }}>
        {currentLabel} <DownOutlined />
      </Button>
    </Dropdown>
  )
}
