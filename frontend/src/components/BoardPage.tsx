import { useQuery } from '@tanstack/react-query'
import { QRCodeSVG } from 'qrcode.react'
import { fetchBoard, fetchWifiCredentials } from '../api/board'

const escapeWifi = (value: string) => value.replace(/([\\;,:"])/g, '\\$1')

const BoardPage = () => {
    const { data: wifi } = useQuery({ queryKey: ['wifi'], queryFn: fetchWifiCredentials })
    const { data, error } = useQuery({ queryFn: fetchBoard, queryKey: ['board'], refetchInterval: 3000 })

    const queuedOrders = data?.filter(o => o.status === 'QUEUED' || o.status === 'COOKING') ?? []
    const readyOrders = data?.filter(o => o.status === 'READY') ?? []
    const menuUrl = `${window.location.origin}/`

    const wifiText = wifi
        ? `WIFI:T:WPA;S:${escapeWifi(wifi.wifiSsid)};P:${escapeWifi(wifi.wifiPassword)};;`
        : null

    return (
        <div className="grid min-h-screen grid-cols-2 gap-8 bg-gray-950 p-10 text-white">
            <section>
                <h2 className="mb-6 text-4xl font-bold text-gray-300">In the queue</h2>
                <ul className="space-y-4">
                    {queuedOrders.map(o => (
                        <li key={o.number} className="flex items-center gap-6 rounded-2xl bg-gray-800 px-6 py-4">
                            <span className="w-28 text-5xl font-black">#{o.number}</span>
                            <span className="flex-1">
                                <span className="block text-3xl font-semibold">{o.guestName}</span>
                                <span className="text-xl text-gray-400">{o.itemName}</span>
                            </span>
                            <span className={`rounded-full px-4 py-1 text-xl font-semibold ${o.status === 'COOKING' ? 'bg-orange-500 text-white' : 'bg-gray-600 text-gray-200'}`}>
                                {o.status === 'COOKING' ? 'In the oven' : 'Waiting'}
                            </span>
                        </li>
                    ))}
                </ul>
            </section>

            <section className="relative">
                <h2 className="mb-6 text-4xl font-bold text-green-400">Ready to pick up</h2>
                <ul className="space-y-4">
                    {readyOrders.map(o => (
                        <li key={o.number} className="animate-pulse rounded-2xl bg-green-600 px-6 py-5">
                            <span className="text-6xl font-black">#{o.number}</span>
                            <span className="ml-6 text-4xl font-semibold">{o.guestName}</span>
                        </li>
                    ))}
                </ul>

                <div className="absolute bottom-0 right-0 flex gap-4">
                    <div className="rounded-2xl bg-white p-4 text-center text-gray-900">
                        <p className="mb-2 text-lg font-bold">① Join the Wi-Fi</p>
                        {wifiText && <QRCodeSVG value={wifiText} size={160} />}
                        <p className="mt-2 text-sm text-gray-600">{wifi?.wifiSsid}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 text-center text-gray-900">
                        <p className="mb-2 text-lg font-bold">② Scan to order</p>
                        <QRCodeSVG value={menuUrl} size={160} />
                    </div>
                </div>
            </section>

            {error && <p className="col-span-2 text-red-400">{error.message}</p>}
        </div>
    )
}

export default BoardPage