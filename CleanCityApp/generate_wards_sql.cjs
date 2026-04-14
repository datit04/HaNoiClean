const https = require('https')
const fs = require('fs')

https.get('https://hnm.1cdn.vn/assets/hanoi-googlemap/mahoa_xa.json', (res) => {
  let raw = ''
  res.on('data', (c) => (raw += c))
  res.on('end', () => {
    const payload = JSON.parse(raw)
    const b64 = payload?.file?.data
    const decoded = Buffer.from(b64, 'base64').toString('utf-8')
    const parsed = JSON.parse(decoded)

    const seen = new Map()
    for (const fc of parsed) {
      const props = fc?.features?.[0]?.properties || {}
      const geom = fc?.features?.[0]?.geometry
      const code = String(props.maxa || props.matinhxa || '').trim()
      const fullName = (props.ten_chi_tiet || '').trim()
      if (!code || !fullName || seen.has(code)) continue

      let lat = 0, lng = 0, count = 0
      const walk = (coords) => {
        if (!Array.isArray(coords)) return
        if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
          lng += coords[0]
          lat += coords[1]
          count++
          return
        }
        coords.forEach(walk)
      }
      if (geom?.coordinates) walk(geom.coordinates)

      const centerLat = count > 0 ? (lat / count).toFixed(6) : 0
      const centerLng = count > 0 ? (lng / count).toFixed(6) : 0
      const type = fullName.startsWith('Phường')
        ? 'Phuong'
        : fullName.startsWith('Thị trấn')
        ? 'Thi tran'
        : 'Xa'
      const name = fullName.replace(/^(Phường|Xã|Thị trấn)\s+/, '').trim()

      seen.set(code, { fullName, name, type, code, lat: centerLat, lng: centerLng })
    }

    const wards = [...seen.values()].sort((a, b) =>
      a.fullName.localeCompare(b.fullName, 'vi')
    )

    const rows = wards
      .map((w, i) => {
        const safeName = w.name.replace(/'/g, "''")
        return `(${i + 1}, N'${safeName}', N'${w.type}', '${w.code}', ${w.lat}, ${w.lng}, 1)`
      })
      .join(',\n')

    const sql = `-- 126 Phường/Xã Hà Nội (sau sáp nhập)
-- Generated: ${new Date().toISOString()}

SET IDENTITY_INSERT [KnowledgeSpace].[dbo].[Wards] ON
GO

INSERT INTO [KnowledgeSpace].[dbo].[Wards] ([Id],[Name],[Type],[Code],[Latitude],[Longitude],[IsActive]) VALUES
${rows}
GO

SET IDENTITY_INSERT [KnowledgeSpace].[dbo].[Wards] OFF
GO
`

    fs.writeFileSync('wards_insert.sql', sql, 'utf8')
    console.log('Done! ' + wards.length + ' wards → wards_insert.sql')
  })
}).on('error', (e) => console.error(e.message))
