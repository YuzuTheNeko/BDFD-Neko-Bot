import { Option } from "../../types/Option";

export interface SystemMemberRequest {
    id: string
    uuid: string
    name: string
    display_name: Option<string>
    color: string
    birthday: Option<string>
    pronouns: string
    avatar_url: string
    banner: Option<string>
    description: Option<string>
    created: string
    keep_proxy: boolean
    proxy_tags: {
        prefix: Option<string>
        suffix: Option<string>
    }[]
    privacy: null
}