import { TableRowType } from '@common/types/gristData'
import { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'
import fs from 'fs/promises'
import { existsSync } from 'fs'
import { truncateSearchTerm } from '@lib/facilityFilterUtil'

const FACILITY_TYPES = ['Beratung', 'Klinik', 'Amt', 'Online', 'Selbsthilfe']

const searchData = ({
  data,
  query,
  filters,
}: {
  data: TableRowType[]
  query: string
  filters: string[]
}): TableRowType[] => {
  if (filters.length === 0) return []
  if (!query && filters.length === FACILITY_TYPES.length) return data
  return data.filter((item) => {
    // check if item.fields.Typ is in the filters array
    if (
      filters.length > 0 &&
      (!item.fields.Typ || !filters.includes(item.fields.Typ))
    ) {
      return false
    }

    // Return true if there is no query
    if (!query) return true

    // Convert each field value into a string and join them together.
    // const str = Object.values(item.fields)
    //   .map((value) => String(value))
    //   .join(' ')
    // only filter specific fields
    const str = [
      item.fields.Einrichtung,
      item.fields.Schlagworte.join(' '),
      item.fields.Zielgruppen,
      item.fields.Trager,
      item.fields.Kategorie,
      item.fields.Sprachen,
      item.fields.Uber_uns,
      item.fields.Strasse,
      item.fields.Hausnummer,
      item.fields.Zusatz,
      item.fields.PLZ,
      item.fields.Bezirk,
      item.fields.Stadtteil,
      item.fields.Telefonnummer,
      item.fields.EMail,
      item.fields.Typ,
    ].join(' ')

    // Return true if the keyword exists in str.
    return str.toLowerCase().includes(query.toLowerCase())
  })
}
const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ result: null, error: 'Method not allowed' })
  }

  const url = new URL(req.url ?? '', 'http://localhost')

  // Get all query parameters as an object
  const params = Object.fromEntries(url.searchParams.entries())
  // check if the q parameter exists

  if (typeof params.query !== 'string') {
    return res
      .status(400)
      .json({ result: null, error: 'Missing query parameter "query"' })
  }

  const query = truncateSearchTerm(params.query)
  // the paramters filters is a comma sparated list. Create an an array from it
  // Unknown or duplicate facility types are ignored, a missing or empty parameter results in an empty array
  const filters = Array.from(
    new Set(
      (params.filters || '')
        .split(',')
        .filter((filter) => FACILITY_TYPES.includes(filter))
    )
  )

  const filePath = path.resolve(process.cwd(), './data/records.json')
  // check if the file ath te path exists
  if (!existsSync(filePath)) {
    console.error(`/api/search: ${filePath} not found`)
    return res
      .status(500)
      .json({ result: null, error: 'Internal server error' })
  }

  try {
    const content = await fs.readFile(filePath, 'utf8')
    const data = JSON.parse(content) as TableRowType[]
    const result = searchData({ data, query, filters })
    // Only the ids are needed by the client, the full records are part of the static page props
    return res.status(200).json({
      params: { query, filters: filters.join(',') },
      result: result.map(({ id }) => ({ id })),
      total: data.length,
    })
  } catch (error: unknown) {
    console.error('/api/search:', error)
    return res
      .status(500)
      .json({ result: null, error: 'Internal server error' })
  }
}

export default handler
