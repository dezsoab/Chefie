import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchMenu, type MenuItemDto } from '../api/menu'
import OrderSheet from '../components/OrderSheet'

const MenuPage = () => {
    const { data, isLoading, isError, error } = useQuery({ queryKey: ['menu'], queryFn: fetchMenu })
    const [selectedItem, setSelectedItem] = useState<MenuItemDto | null>(null)

    return (
        <div className="mx-auto max-w-md p-4">
            {isLoading && <p>Loading...</p>}
            {isError && <p className="text-red-600">{error.message}</p>}
            {data && (
                <>
                    <h1 className="mb-4 text-2xl font-bold">{data.eventName}</h1>
                    {data.menus.map(menu => (
                        <section key={menu.id} className="mb-6">
                            <h2 className="mb-2 text-lg font-semibold">{menu.name}</h2>
                            <ul className="space-y-2">
                                {menu.items.map(item => (
                                    <li key={item.id}>
                                        <button
                                            onClick={() => setSelectedItem(item)}
                                            disabled={item.available === 0}
                                            className={`w-full rounded-lg border p-3 text-left ${item.available === 0 ? 'opacity-40 grayscale' : 'active:bg-gray-100'}`}
                                        >
                                            <span className="font-medium">{item.name}</span>
                                            {item.available === 0 && (
                                                <span className="ml-2 rounded-full bg-red-100 px-2 text-xs text-red-800">Sold out</span>
                                            )}
                                            {item.available !== null && item.available > 0 && (
                                                <span className="ml-2 text-xs text-gray-500">{item.available} left</span>
                                            )}
                                            <p className="text-sm text-gray-600">{item.ingredients.join(', ')}</p>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </>
            )}

            <OrderSheet item={selectedItem} onClose={() => setSelectedItem(null)} />
        </div>
    )
}

export default MenuPage