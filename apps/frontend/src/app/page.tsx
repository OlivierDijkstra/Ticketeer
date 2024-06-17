import dns from 'node:dns';

import { API_URL } from "@/lib/constants"

dns.setDefaultResultOrder('ipv4first');

export default async function Page() {
    const res = await fetch(API_URL + '/api/events', {
        cache: 'no-cache'
    })
    const data = await res.json()

    return (
        <div>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    )
}