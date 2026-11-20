import { isMessageKey, translate } from '../i18n/translate'

export const loadFailed = (response: Response) => translate('error.loadFailed', { status: response.status })

export const saveFailed = (response: Response) => translate('error.saveFailed', { status: response.status })

export async function errorMessage(response: Response, fallback: string): Promise<string> {
    try {
        const body = await response.json()
        const code = typeof body?.code === 'string' ? body.code : null
        if (code) {
            const key = `error.${code}`
            if (isMessageKey(key)) {
                const params = body?.params && typeof body.params === 'object'
                    ? (body.params as Record<string, string>)
                    : undefined
                return translate(key, params)
            }
        }
        return fallback
    } catch {
        return fallback
    }
}
