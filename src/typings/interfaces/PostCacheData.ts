import { Search } from "yande.re-api/dist/structures/Search"

export interface PostCacheData {
    timeout: NodeJS.Timeout
    posts: Search
}