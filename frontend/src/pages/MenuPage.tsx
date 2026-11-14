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
                                            <li key={item.id}>{item.name} made of: {item.ingredients.join(', ')
                                            }</li>
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