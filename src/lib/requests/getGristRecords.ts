import { TableRowType } from '@common/types/gristData'
import { getGristTableData } from './getGristTableData'

type RecordFieldsType = TableRowType['fields']

/**
 * Only these columns are written to the public cache (data/records.json),
 * which is served via /api/search and the static page props. Any other Grist
 * column (e.g. contact persons or internal notes) stays in Grist.
 */
export const PUBLIC_RECORD_FIELDS: (keyof RecordFieldsType)[] = [
  'Anzeigen',
  'ID2',
  'Einrichtung',
  'Trager',
  'Schlagworte',
  'Zielgruppen',
  'Prio',
  'Wichtige_Hinweise',
  'Beratungsmoglichkeiten',
  'Sprachen',
  'Barrierefreiheit',
  'Uber_uns',
  'Strasse',
  'Hausnummer',
  'Zusatz',
  'PLZ',
  'Bezirk',
  'Stadtteil',
  'Telefonnummer',
  'EMail',
  'Website',
  'c24_h_7_Tage',
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
  'Sonntag',
  'Anmeldung_gewunscht',
  'Art_der_Anmeldung',
  'Weitere_Offnungszeiten',
  'lat',
  'long',
  'Kategorie',
  'Typ',
]

export const pickPublicFields = (
  fields: Record<string, unknown>
): RecordFieldsType =>
  Object.fromEntries(
    PUBLIC_RECORD_FIELDS.filter((key) => key in fields).map((key) => [
      key,
      fields[key],
    ])
  ) as RecordFieldsType

export const isPublicRecord = (record: TableRowType): boolean =>
  record.fields.Anzeigen === 1 && record.fields.Prio !== 'Versteckt'

export async function getGristRecords(): Promise<TableRowType[]> {
  const data = await getGristTableData<{ records: TableRowType[] }>(
    process.env.NEXT_SECRET_GRIST_DOC_ID || '',
    process.env.NEXT_SECRET_GRIST_RECORDS_TABLE || ''
  )
  return data.records
    .filter(isPublicRecord)
    .map(({ id, fields }) => ({ id, fields: pickPublicFields(fields) }))
}
