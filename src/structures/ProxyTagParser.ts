import { SystemMemberRequest } from "../typings/interfaces/http/SystemMemberRequest"
import { Option } from "../typings/types/Option"

interface Found {
    match: string
    content: string
}

interface CachedData {
    regex: RegExp
    suffixes: Set<string>
    // The key is the suffix, the value is the prefix
    mappedSuffixes: Map<string, string>
}

export class ProxyTagParser {
    private static readonly cache = new Map<string, CachedData>()

    static parse(
        userID: string,
        full: SystemMemberRequest[] | SystemMemberRequest["proxy_tags"][],
        input: string
    ): Found[] {
        const has = this.has(userID)

        const arr = new Array<Found>()
        
        if (!has && !full.length) return arr 

        const tags = has ? [] : full.map(
            c => "proxy_tags" in c ? c.proxy_tags : c 
        ).filter(c => c.filter(c => c.prefix !== null || c.prefix !== null)).flat(1)

        if (!has && !tags.length) return arr 

        const {
            regex,
            suffixes,
            mappedSuffixes
        } = this.createRegex(userID, tags)

        const it = [...input.matchAll(regex)]

        for (let i = 0, len = it.length;i < len;i++) {
            const found = it[i]

            const current = found[0]
            const next = it[i + 1]
            const last = it[i - 1]

            const isSuffix = suffixes.has(current)
            const prefix = isSuffix ? mappedSuffixes.get(current) : null

            if (isSuffix && last) {
                if (last[0] !== prefix) {
                    break
                }
            }

            if (i === 0 && found.index !== 0) {
                if (isSuffix && found.index! + current.length !== input.length) {
                    break
                }
            }

            let match: Option<string> = null 
            if (isSuffix) {
                match = input.slice(last ? last.index! + last[0].length : 0, found.index!)
            } else {
                match = input.slice(found.index! + current.length, next ? next.index! : undefined)
            }

            if (match === null) continue

            arr.push({
                content: match,
                match: current
            })
        }

        return arr 
    }

    private static has(id: string) {
        return this.cache.has(id)
    }

    private static createRegex(id: string, tags: SystemMemberRequest["proxy_tags"][number][]) {
        const existing = this.cache.get(id)
        if (existing) return existing

        const regex = new RegExp(`(${
            tags.map(
                c => [
                    c.prefix === '[' ? `\\${c.prefix}` : c.prefix, 
                    c.suffix === ']' ? `\\${c.suffix}` : c.suffix
                ]
                .filter(Boolean).join('|')
            ).join('|')
        })`, 'gm')
        
        const data: CachedData = {
            regex,
            mappedSuffixes: new Map(
                tags.map(c => c.prefix ? [
                    c.prefix,
                    c.suffix
                ] : undefined).filter(Boolean) as [string, string][] 
            ),
            suffixes: new Set<string>(tags.map(c => c.suffix).filter(Boolean) as string[])     
        }

        this.cache.set(id, data)

        return data 
    }

    static findDataOfMatch(tags: SystemMemberRequest[], match: Found) {
        return tags.find(
            c => c.proxy_tags && c.proxy_tags.some(tag => tag.prefix === match.match || tag.suffix === match.match)
        )
    }
}