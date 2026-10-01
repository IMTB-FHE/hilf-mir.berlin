import { MinimalRecordType } from '@lib/mapRecordToMinimum'
import { TextsMapType } from '@lib/TextsContext'
import { getPopupHTML } from './popupUtils'

const payload = '<img src=x onerror="alert(1)">'

const createFacility = (id: number, title: string): MinimalRecordType => ({
  id,
  title,
  latitude: 52.52,
  longitude: 13.4,
  prioriy: 0,
  labels: [],
  languages: [],
  open247: false,
  openingTimesText: '',
  phone: '',
  description: '',
  website: '',
  type: 'Beratung',
  start: null,
  end: null,
})

const texts = {
  opened: 'Geöffnet',
  multipleFacilitiesPopupTitle: '#number Angebote',
  clickToExpandPopupLabel: 'Klicken zum Aufklappen',
} as TextsMapType

describe('getPopupHTML', () => {
  test('escapes the title of a single facility', () => {
    const html = getPopupHTML([createFacility(1, payload)], texts)
    expect(html).not.toContain('<img')
    expect(html).toContain('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;')
  })

  test('escapes the titles of multiple facilities', () => {
    const html = getPopupHTML(
      [createFacility(1, payload), createFacility(2, 'Beratung & Hilfe')],
      texts
    )
    expect(html).not.toContain('<img')
    expect(html).toContain('Beratung &amp; Hilfe')
    expect(html).toContain('2 Angebote')
  })
})
