import { useQuery } from '@tanstack/react-query'
import { fetchMenu } from '../api/menu'

const MenuPage = () => {

    const { data, isLoading, isError, error } = useQuery({ queryKey: ['menu'], queryFn: fetchMenu })

    return (
        <>
            {isLoading && <p>Loading...</p>}
            {isError && <p>{error.message}</p>}
            {
                data && (
                    <div>
                        <h1>{data.eventName}</h1>
                        <ul>
                            {data.menus.map(menu => (
                                <li key={menu.id}>
                                    <h2>{menu.name}</h2>
                                    <ul>
                                        {menu.items.map(item => (
                                            <li key={item.id} className={`py-2 ${item.available === 0 ? 'opacity-40 grayscale' : ''}`}>
                                                <span className="font-medium">{item.name}</span>
                                                {item.available === 0 && (
                                                    <span className="ml-2 rounded-full bg-red-100 px-2 text-xs text-red-800">Sold out</span>
                                                )}
                                                {item.available !== null && item.available > 0 && (
                                                    <span className="ml-2 text-xs text-gray-500">{item.available} left</span>
                                                )}
                                                <p className="text-sm text-gray-600">{item.ingredients.join(', ')}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    </div>
                )
            }
        </>
    )
}

export default MenuPage