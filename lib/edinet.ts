import AdmZip from "adm-zip"
import { XMLParser } from "fast-xml-parser"
import { WIKIPEDIA_USER_AGENT } from "@/app/api/insights/route"

export interface EdinetCompanyInfo {
  representativeName: string | null
  representativeTitle: string | null
  headOfficeAddress: string | null
  capitalStock: string | null
}

const EDINET_BASE = "https://api.edinet-fsa.go.jp/api/v2"
const EDINET_SUBSCRIPTION_KEY =
  process.env.EDINET_SUBSCRIPTION_KEY ?? process.env.EDINET_API_KEY ?? ""
const TARGET_DOC_TYPE_CODES = new Set(["120", "130", "140", "150", "160"])
const SEARCH_WINDOW_DAYS = 180

const EDINET_CACHE_TTL_MS = 1000 * 60 * 60 * 24 // 24 hours
const companyInfoCache = new Map<string, { timestamp: number; data: EdinetCompanyInfo | null }>()
const documentsCache = new Map<string, EdinetDocumentMeta[]>()

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  ignoreDeclaration: true,
  removeNSPrefix: false,
  trimValues: true,
})

const REPRESENTATIVE_KEYWORDS = [
  "TitleAndNameOfRepresentative",
  "RepresentativeTitleAndName",
  "PersonInCharge",
]
const REPRESENTATIVE_NAME_KEYWORDS = ["NameOfRepresentative", "RepresentativeName"]
const REPRESENTATIVE_TITLE_KEYWORDS = ["TitleOfRepresentative", "RepresentativeTitle"]
const ADDRESS_KEYWORDS = [
  "AddressOfRegisteredHead",
  "AddressOfMainOffice",
  "AddressOfHeadOffice",
  "LocationOfMainOffice",
]
const CAPITAL_KEYWORDS = ["CapitalStock", "CapitalAmount", "Capital"]
interface EdinetDocumentMeta {
  docID: string
  docTypeCode: string
  submissionDateTime: string
  secCode?: string | null
  edinetCode?: string | null
}

interface FetchEdinetOptions {
  forceRefresh?: boolean
}

function buildEdinetHeaders(extra?: HeadersInit): HeadersInit {
  const headers: Record<string, string> = {
    "User-Agent": WIKIPEDIA_USER_AGENT,
  }
  if (EDINET_SUBSCRIPTION_KEY) {
    headers["Ocp-Apim-Subscription-Key"] = EDINET_SUBSCRIPTION_KEY
  }
  return {
    ...headers,
    ...(extra ?? {}),
  }
}

function secCodeMatchesTicker(secCode: string | null | undefined, tickerDigits: string | null): boolean {
  if (!secCode || !tickerDigits) return false
  const normalizedSec = secCode.replace(/\D/g, "")
  if (!normalizedSec) return false
  if (tickerDigits.length === 4) {
    return normalizedSec.startsWith(tickerDigits)
  }
  return normalizedSec === tickerDigits
}

async function fetchDocumentsForDate(date: string, forceRefresh = false): Promise<EdinetDocumentMeta[]> {
  if (!forceRefresh && documentsCache.has(date)) {
    return documentsCache.get(date) ?? []
  }
  if (forceRefresh) {
    documentsCache.delete(date)
  }
  const params = new URLSearchParams({
    type: "2",
    date,
  })
  const response = await fetch(`${EDINET_BASE}/documents.json?${params.toString()}`, {
    headers: buildEdinetHeaders({ Accept: "application/json" }),
    cache: "no-store",
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch EDINET documents for ${date}: ${response.status}`)
  }
  const data = (await response.json()) as { results?: Array<Record<string, unknown>> }
  const docs = Array.isArray(data.results)
    ? data.results
        .filter((item) => typeof item === "object" && item !== null)
        .map((item) => ({
          docID: String(item.docID ?? ""),
          docTypeCode: String(item.docTypeCode ?? ""),
          submissionDateTime: String(item.submitDateTime ?? item.submissionDateTime ?? ""),
          secCode: item.secCode ? String(item.secCode) : undefined,
          edinetCode: item.edinetCode ? String(item.edinetCode) : undefined,
        }))
        .filter((item) => item.docID)
    : []
  documentsCache.set(date, docs)
  return docs
}

async function findLatestDocumentForTicker(tickerDigits: string, forceRefresh = false): Promise<EdinetDocumentMeta | null> {
  const today = new Date()
  for (let offset = 0; offset < SEARCH_WINDOW_DAYS; offset += 1) {
    const date = new Date(today)
    date.setDate(date.getDate() - offset)
    const dateKey = date.toISOString().slice(0, 10)
    let docs: EdinetDocumentMeta[] = []
    try {
      docs = await fetchDocumentsForDate(dateKey, forceRefresh)
    } catch (error) {
      console.error("Failed to query EDINET documents:", error)
      continue
    }
    const matched = docs
      .filter(
        (doc) =>
          TARGET_DOC_TYPE_CODES.has(doc.docTypeCode) &&
          secCodeMatchesTicker(doc.secCode, tickerDigits) &&
          doc.submissionDateTime
      )
      .sort((a, b) => (a.submissionDateTime > b.submissionDateTime ? -1 : 1))[0]
    if (matched) return matched
  }
  return null
}

async function downloadDocument(docId: string): Promise<AdmZip | null> {
  const params = new URLSearchParams({ type: "1" })
  const response = await fetch(`${EDINET_BASE}/documents/${docId}?${params.toString()}`, {
    headers: buildEdinetHeaders({ Accept: "application/zip" }),
  })
  if (!response.ok) return null
  const arrayBuffer = await response.arrayBuffer()
  return new AdmZip(Buffer.from(arrayBuffer))
}

function normalizeEdinetText(value: string): string {
  return value.replace(/[\n\r]+/g, " ").replace(/\s+/g, " ").trim()
}

function extractTextValue(value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value.toString() : null
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const text = extractTextValue(item)
      if (text) return text
    }
    return null
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>
    if (record["#text"] !== undefined) {
      const text = extractTextValue(record["#text"])
      if (text) return text
    }
    if (record.text !== undefined) {
      const text = extractTextValue(record.text)
      if (text) return text
    }
    for (const child of Object.values(record)) {
      const text = extractTextValue(child)
      if (text) return text
    }
  }
  return null
}

function findFirstValue(root: unknown, keys: string[]): string | null {
  if (!root || typeof root !== "object") return null
  const targetKeys = new Set(keys)
  const queue: unknown[] = [root]
  while (queue.length > 0) {
    const current = queue.shift()
    if (!current || typeof current !== "object") continue
    const record = current as Record<string, unknown>
    for (const [key, value] of Object.entries(record)) {
      if (targetKeys.has(key)) {
        const text = extractTextValue(value)
        if (text) return text
      }
      if (value && typeof value === "object") {
        queue.push(value)
      }
    }
  }
  return null
}

function findFirstValueByKeyword(root: unknown, keywords: string[]): string | null {
  if (!root || typeof root !== "object") return null
  const queue: unknown[] = [root]
  while (queue.length > 0) {
    const current = queue.shift()
    if (!current || typeof current !== "object") continue
    const record = current as Record<string, unknown>
    for (const [key, value] of Object.entries(record)) {
      if (keywords.some((kw) => key.includes(kw))) {
        const text = extractTextValue(value)
        if (text) return text
      }
      if (value && typeof value === "object") queue.push(value)
    }
  }
  return null
}

const TITLE_KEYWORDS = [
  "代表取締役",
  "取締役",
  "社長",
  "CEO",
  "ＣＥＯ",
  "COO",
  "ＣＯＯ",
  "CFO",
  "ＣＦＯ",
  "会長",
  "Chairman",
  "President",
  "Chief",
  "Executive",
  "Officer",
  "代表者",
  "役職",
]

function looksLikeTitleToken(token: string): boolean {
  const lower = token.toLowerCase()
  return TITLE_KEYWORDS.some((keyword) => token.includes(keyword) || lower.includes(keyword.toLowerCase()))
}

function splitTitleAndName(raw: string): { name: string | null; title: string | null } {
  const normalized = raw.replace(/[：:]/g, " ").replace(/　+/g, " ").replace(/\s+/g, " ").trim()
  if (!normalized) return { name: null, title: null }

  const parentheses = normalized.match(/^(.+?)（(.+?)）$/)
  if (parentheses) {
    return {
      title: parentheses[1].trim() || null,
      name: parentheses[2].trim() || null,
    }
  }

  const tokens = normalized.split(" ").filter(Boolean)
  if (tokens.length === 0) return { name: null, title: null }
  if (tokens.length === 1) {
    return { name: tokens[0], title: null }
  }

  let lastTitleIndex = -1
  for (let i = 0; i < tokens.length; i += 1) {
    if (looksLikeTitleToken(tokens[i])) {
      lastTitleIndex = i
    }
  }

  if (lastTitleIndex >= 0 && lastTitleIndex < tokens.length - 1) {
    const titleTokens = tokens.slice(0, lastTitleIndex + 1)
    const nameTokens = tokens.slice(lastTitleIndex + 1)
    return {
      title: titleTokens.join(" ") || null,
      name: nameTokens.join(" ") || null,
    }
  }

  const potentialNameTokens = tokens.slice(-2)
  const titleTokens = tokens.slice(0, -potentialNameTokens.length)
  if (potentialNameTokens.every((token) => looksLikeTitleToken(token))) {
    return {
      title: null,
      name: normalized,
    }
  }
  return {
    title: titleTokens.length > 0 ? titleTokens.join(" ") : null,
    name: potentialNameTokens.join(" ") || null,
  }
}

function extractCompanyInfoFromXbrl(xbrl: unknown): EdinetCompanyInfo | null {
  if (!xbrl || typeof xbrl !== "object") return null

  let representativeName: string | null = null
  let representativeTitle: string | null = null

  const combined =
    findFirstValue(xbrl, REPRESENTATIVE_KEYWORDS.map((kw) => `jpdei_cor:${kw}`)) ??
    findFirstValueByKeyword(xbrl, REPRESENTATIVE_KEYWORDS)
  if (combined) {
    const { name, title } = splitTitleAndName(combined)
    representativeName = name ?? representativeName
    representativeTitle = title ?? representativeTitle
  }

  const nameOnly =
    findFirstValue(xbrl, REPRESENTATIVE_NAME_KEYWORDS.map((kw) => `jpdei_cor:${kw}`)) ??
    findFirstValueByKeyword(xbrl, REPRESENTATIVE_NAME_KEYWORDS)
  if (nameOnly && !representativeName) {
    representativeName = nameOnly
  }

  const titleOnly =
    findFirstValue(xbrl, REPRESENTATIVE_TITLE_KEYWORDS.map((kw) => `jpdei_cor:${kw}`)) ??
    findFirstValueByKeyword(xbrl, REPRESENTATIVE_TITLE_KEYWORDS)
  if (titleOnly && !representativeTitle) {
    representativeTitle = titleOnly
  }

  const address =
    findFirstValue(xbrl, ADDRESS_KEYWORDS.map((kw) => `jpdei_cor:${kw}`)) ??
    findFirstValueByKeyword(xbrl, ADDRESS_KEYWORDS)
  const capital =
    findFirstValue(xbrl, CAPITAL_KEYWORDS.map((kw) => `jpdei_cor:${kw}`)) ??
    findFirstValueByKeyword(xbrl, CAPITAL_KEYWORDS)
  if (!representativeName && !representativeTitle && !address && !capital) {
    return null
  }

  return {
    representativeName: representativeName ? normalizeEdinetText(representativeName) : null,
    representativeTitle: representativeTitle ? normalizeEdinetText(representativeTitle) : null,
    headOfficeAddress: address ? normalizeEdinetText(address) : null,
    capitalStock: capital ? normalizeEdinetText(capital) : null,
  }
}

export async function fetchEdinetCompanyInfoByTicker(
  ticker: string,
  options?: FetchEdinetOptions,
): Promise<EdinetCompanyInfo | null> {
  if (!ticker) return null
  const forceRefresh = options?.forceRefresh ?? false
  const normalizedTicker = ticker.trim().toUpperCase()
  const cached = companyInfoCache.get(normalizedTicker)
  if (!forceRefresh && cached && Date.now() - cached.timestamp < EDINET_CACHE_TTL_MS) {
    return cached.data
  }
  if (forceRefresh) {
    companyInfoCache.delete(normalizedTicker)
  }

  const digitsMatch = normalizedTicker.match(/^(\d{4})/)
  if (!digitsMatch) {
    companyInfoCache.set(normalizedTicker, { timestamp: Date.now(), data: null })
    return null
  }

  let docMeta: EdinetDocumentMeta | null = null
  try {
    docMeta = await findLatestDocumentForTicker(digitsMatch[1], forceRefresh)
  } catch (error) {
    console.error("Failed to locate EDINET document:", error)
  }
  if (!docMeta) {
    console.info(`[EDINET] No filing found for ticker ${normalizedTicker}`)
    companyInfoCache.set(normalizedTicker, { timestamp: Date.now(), data: null })
    return null
  }
  console.info(
    `[EDINET] Using document ${docMeta.docID} (type ${docMeta.docTypeCode}) submitted ${docMeta.submissionDateTime} for ticker ${normalizedTicker}`
  )

  let zip: AdmZip | null = null
  try {
    zip = await downloadDocument(docMeta.docID)
  } catch (error) {
    console.error("Failed to download EDINET document:", error)
  }
  if (!zip) {
    console.warn(`[EDINET] Unable to download archive for document ${docMeta.docID}`)
    companyInfoCache.set(normalizedTicker, { timestamp: Date.now(), data: null })
    return null
  }

  const entries = zip.getEntries() as Array<{ entryName: string; isDirectory: boolean; getData(): Buffer }>
  const scoreEntry = (name: string): number => {
    const lower = name.toLowerCase()
    if (lower.includes("manifest")) return 100
    if (lower.includes("/publicdoc/")) return 0
    if (lower.includes("/auditdoc/")) return 1
    return 2
  }
  const xbrlEntry = entries
    .filter((entry) => !entry.isDirectory && /\.(xbrl|xml)$/i.test(entry.entryName))
    .sort((a, b) => {
      const scoreDiff = scoreEntry(a.entryName) - scoreEntry(b.entryName)
      if (scoreDiff !== 0) return scoreDiff
      return a.entryName.length - b.entryName.length
    })[0]
  if (!xbrlEntry) {
    companyInfoCache.set(normalizedTicker, { timestamp: Date.now(), data: null })
    return null
  }
  console.info(`[EDINET] Parsing XBRL entry ${xbrlEntry.entryName}`)

  try {
    const parsed = xmlParser.parse(xbrlEntry.getData().toString("utf-8"))
    const info = extractCompanyInfoFromXbrl(parsed)
    if (info) {
      console.info(
        `[EDINET] Extracted info for ${normalizedTicker}: representative=${info.representativeName ?? "N/A"}, address=${
          info.headOfficeAddress ?? "N/A"
        }`
      )
    } else {
      console.warn(`[EDINET] No structured info found inside document ${docMeta.docID} for ${normalizedTicker}`)
    }
    const result = info ?? null
    companyInfoCache.set(normalizedTicker, { timestamp: Date.now(), data: result })
    return result
  } catch (error) {
    console.error("Failed to parse EDINET XBRL:", error)
    companyInfoCache.set(normalizedTicker, { timestamp: Date.now(), data: null })
    return null
  }
}
