import { TableRowType } from '@common/types/gristData'
import { isPublicRecord, pickPublicFields } from './getGristRecords'

const createRecord = (fields: Record<string, unknown>): TableRowType =>
  ({ id: 1, fields } as unknown as TableRowType)

describe('pickPublicFields', () => {
  test('drops columns that are not part of the public record type', () => {
    const fields = pickPublicFields({
      Einrichtung: 'Beratungsstelle',
      Website: 'https://example.org',
      Ansprechperson_1_Vorname: 'Erika',
      Ansprechperson_1_Nachname: 'Mustermann',
      manualSort: 4,
    })

    expect(fields).toEqual({
      Einrichtung: 'Beratungsstelle',
      Website: 'https://example.org',
    })
  })
})

describe('isPublicRecord', () => {
  test('keeps visible records', () => {
    expect(isPublicRecord(createRecord({ Anzeigen: 1, Prio: 'Hoch' }))).toBe(
      true
    )
    expect(isPublicRecord(createRecord({ Anzeigen: 1, Prio: '' }))).toBe(true)
  })

  test('removes records that are switched off or hidden', () => {
    expect(isPublicRecord(createRecord({ Anzeigen: 0, Prio: 'Hoch' }))).toBe(
      false
    )
    expect(
      isPublicRecord(createRecord({ Anzeigen: 1, Prio: 'Versteckt' }))
    ).toBe(false)
  })
})
