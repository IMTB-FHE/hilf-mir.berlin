import { TextsMapType } from '@lib/TextsContext'
import sanitize from 'sanitize-html'
import { getGristTableData } from './getGristTableData'
import { getSafeHref } from '../sanitizeUtils'

export interface GristTextRecordType {
  id: string
  fields: {
    key: string
    de: string
    en: string
  }
}

const keysOfAllowedHtml = ['homeWelcomeText', 'welcomeFiltersText']
// Texts with these key suffixes are used as link targets (href)
const linkKeyPattern = /(Url|Link)$/

export async function getGristTexts(): Promise<TextsMapType> {
  const data = await getGristTableData<{ records: GristTextRecordType[] }>(
    process.env.NEXT_SECRET_GRIST_DOC_ID || '',
    process.env.NEXT_SECRET_GRIST_TEXTS_TABLE || ''
  )
  return data.records.reduce((acc, { fields: { key, de } }) => {
    const htmlIsAllowed = !!keysOfAllowedHtml.find((k) => k === key)
    const text = sanitize(de, {
      allowedTags: htmlIsAllowed
        ? ['a', 'b', 'i', 'em', 'strong', 'u', 'sup', 'sub', 'br']
        : [],
      allowedAttributes: {
        a: htmlIsAllowed ? ['href', 'title'] : [],
      },
      allowedSchemes: ['http', 'https', 'mailto', 'tel'],
      disallowedTagsMode: 'discard',
    })
    return {
      ...acc,
      [key]: linkKeyPattern.test(key) ? getSafeHref(text) || '#' : text,
    }
  }, {}) as TextsMapType
}
