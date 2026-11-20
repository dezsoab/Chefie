import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router'
import { Check, Eye, EyeOff, InfinityIcon, Minus, Pencil, Plus, Sparkle, Trash2, X } from 'lucide-react'
import {
    adjustStock,
    createIngredient,
    createMenu,
    createMenuItem,
    deleteIngredient,
    deleteMenu,
    deleteMenuItem,
    fetchSetup,
    updateIngredient,
    updateMenuItem,
    type IngredientAdminDto,
    type IngredientRequest,
    type MenuAdminDto,
    type MenuItemAdminDto,
    type MenuItemRequest,
    type SetupDto,
} from '../api/setup'
import ChefNav from '../components/ChefNav'
import Logo from '../components/Logo'
import LogoutButton from '../components/LogoutButton'
import { useT } from '../i18n'
import type { MessageKey } from '../i18n/en'

const fieldBase = 'rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-base text-white outline-none transition placeholder:text-grape-300/60 focus:border-sun-400 focus:ring-4 focus:ring-sun-400/20'
const inputClass = `w-full min-w-0 ${fieldBase}`
const labelClass = 'text-[11px] font-extrabold uppercase tracking-[0.14em] text-grape-300'
const panelClass = 'rounded-[28px] border border-white/10 bg-white/[0.05] p-5'
const iconButton = 'flex size-9 shrink-0 items-center justify-center rounded-xl text-grape-200 transition hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30'

function useSetupAction<TInput>(eventId: number, action: (input: TInput) => Promise<void>) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: action,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['setup', eventId] })
            queryClient.invalidateQueries({ queryKey: ['menu'] })
        },
    })
}

const ErrorText = ({ message }: { message?: string | null }) =>
    message ? (
        <p className="mt-3 animate-pop rounded-xl bg-red-500/15 px-3 py-2 text-sm font-bold text-red-200 ring-1 ring-red-400/30">{message}</p>
    ) : null

const PanelHeader = ({ title, count, hint }: { title: string; count: number; hint: string }) => (
    <div className="mb-4">
        <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-white">
            {title}
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 font-sans text-sm font-extrabold text-grape-100">{count}</span>
        </h2>
        <p className="mt-1 text-sm text-grape-300">{hint}</p>
    </div>
)

type IngredientValues = { name: string; unit: string; stock: string; extraAmount: string }

const emptyIngredient: IngredientValues = { name: '', unit: '', stock: '', extraAmount: '' }

const toOptionalInt = (value: string): number | null => {
    const trimmed = value.trim()
    if (trimmed === '') return null
    const parsed = Number(trimmed)
    return Number.isInteger(parsed) && parsed >= 0 ? parsed : Number.NaN
}

const parseIngredient = (values: IngredientValues): { request?: IngredientRequest; error?: MessageKey } => {
    if (!values.name.trim() || !values.unit.trim()) return { error: 'setup.errorNameUnit' }
    const stock = toOptionalInt(values.stock)
    const extraAmount = toOptionalInt(values.extraAmount)
    if (stock !== null && Number.isNaN(stock)) return { error: 'setup.errorStock' }
    if (extraAmount !== null && (Number.isNaN(extraAmount) || extraAmount === 0)) {
        return { error: 'setup.errorExtra' }
    }
    return { request: { name: values.name.trim(), unit: values.unit.trim(), stock, extraAmount } }
}

const stepFor = (unit: string) => (['g', 'ml'].includes(unit.trim().toLowerCase()) ? 100 : 1)

const IngredientFields = ({ values, onChange }: { values: IngredientValues; onChange: (values: IngredientValues) => void }) => {
    const t = useT()
    return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <label className="col-span-2 sm:col-span-1">
            <span className={labelClass}>{t('setup.fieldName')}</span>
            <input
                className={`mt-1.5 ${inputClass}`}
                value={values.name}
                onChange={(e) => onChange({ ...values, name: e.target.value })}
                placeholder={t('setup.fieldNamePlaceholder')}
            />
        </label>
        <label>
            <span className={labelClass}>{t('setup.fieldUnit')}</span>
            <input
                className={`mt-1.5 ${inputClass}`}
                value={values.unit}
                onChange={(e) => onChange({ ...values, unit: e.target.value })}
                placeholder={t('setup.fieldUnitPlaceholder')}
            />
        </label>
        <label>
            <span className={labelClass}>{t('setup.fieldStock')}</span>
            <input
                className={`mt-1.5 ${inputClass}`}
                inputMode="numeric"
                value={values.stock}
                onChange={(e) => onChange({ ...values, stock: e.target.value })}
                placeholder="∞"
            />
        </label>
        <label className="col-span-2 sm:col-span-1">
            <span className={labelClass}>{t('setup.fieldExtra')}</span>
            <input
                className={`mt-1.5 ${inputClass}`}
                inputMode="numeric"
                value={values.extraAmount}
                onChange={(e) => onChange({ ...values, extraAmount: e.target.value })}
                placeholder={t('setup.fieldExtraPlaceholder')}
            />
        </label>
    </div>
    )
}

const AddIngredient = ({ eventId }: { eventId: number }) => {
    const [values, setValues] = useState<IngredientValues>(emptyIngredient)
    const [formError, setFormError] = useState<string | null>(null)
    const create = useSetupAction(eventId, (request: IngredientRequest) => createIngredient(eventId, request))
    const t = useT()

    const submit = (e: FormEvent) => {
        e.preventDefault()
        const parsed = parseIngredient(values)
        if (!parsed.request) {
            setFormError(parsed.error ? t(parsed.error) : null)
            return
        }
        setFormError(null)
        create.mutate(parsed.request, { onSuccess: () => setValues(emptyIngredient) })
    }

    return (
        <form onSubmit={submit} className="rounded-3xl bg-white/[0.04] p-4 ring-1 ring-white/10">
            <IngredientFields values={values} onChange={setValues} />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold text-grape-300">{t('setup.fieldsHint')}</p>
                <button
                    type="submit"
                    disabled={create.isPending}
                    className="btn-sun flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-extrabold disabled:opacity-50"
                >
                    <Plus size={16} strokeWidth={3} />
                    {t('setup.addIngredient')}
                </button>
            </div>
            <ErrorText message={formError ?? create.error?.message} />
        </form>
    )
}

const IngredientRow = ({ ingredient, eventId }: { ingredient: IngredientAdminDto; eventId: number }) => {
    const [editing, setEditing] = useState<{ values: IngredientValues; version: number } | null>(null)
    const [confirming, setConfirming] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)

    const update = useSetupAction(eventId, (request: IngredientRequest) => updateIngredient(ingredient.id, request))
    const adjust = useSetupAction(eventId, (delta: number) => adjustStock(ingredient.id, delta))
    const remove = useSetupAction<void>(eventId, () => deleteIngredient(ingredient.id))
    const t = useT()

    const step = stepFor(ingredient.unit)

    const startEdit = () => {
        setFormError(null)
        update.reset()
        setEditing({
            values: {
                name: ingredient.name,
                unit: ingredient.unit,
                stock: ingredient.stock?.toString() ?? '',
                extraAmount: ingredient.extraAmount?.toString() ?? '',
            },
            version: ingredient.version,
        })
    }

    const save = (e: FormEvent) => {
        e.preventDefault()
        if (!editing) return
        const parsed = parseIngredient(editing.values)
        if (!parsed.request) {
            setFormError(parsed.error ? t(parsed.error) : null)
            return
        }
        setFormError(null)
        update.mutate({ ...parsed.request, version: editing.version }, { onSuccess: () => setEditing(null) })
    }

    if (editing) {
        return (
            <li className="animate-pop rounded-3xl bg-grape-900 p-4 ring-2 ring-sun-400/40">
                <form onSubmit={save}>
                    <IngredientFields values={editing.values} onChange={(values) => setEditing({ ...editing, values })} />
                    <ErrorText message={formError ?? update.error?.message} />
                    <div className="mt-3 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setEditing(null)}
                            className="rounded-xl px-4 py-2.5 text-sm font-bold text-grape-200 transition hover:bg-white/10"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={update.isPending}
                            className="btn-sun flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-extrabold disabled:opacity-50"
                        >
                            <Check size={16} strokeWidth={3} />
                            {t('common.save')}
                        </button>
                    </div>
                </form>
            </li>
        )
    }

    return (
        <li className="rounded-3xl bg-white/[0.04] p-3 pl-4 ring-1 ring-white/10">
            <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-white">{ingredient.name}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-extrabold text-grape-100">{ingredient.unit}</span>
                        {ingredient.extraAmount !== null && (
                            <span className="flex items-center gap-1 rounded-full bg-sun-400/15 px-2 py-0.5 text-[11px] font-extrabold text-sun-300">
                                <Sparkle size={11} strokeWidth={2.6} />
                                {t('setup.extraChip', { amount: ingredient.extraAmount, unit: ingredient.unit })}
                            </span>
                        )}
                    </div>
                </div>

                {ingredient.stock === null ? (
                    <span className="flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 text-sm font-bold text-grape-200">
                        <InfinityIcon size={16} strokeWidth={2.4} />
                        {t('setup.unlimited')}
                    </span>
                ) : (
                    <div className="flex items-center gap-1 rounded-2xl bg-grape-950/60 p-1 ring-1 ring-white/10">
                        <button
                            type="button"
                            aria-label={t('setup.removeStock', { step, unit: ingredient.unit, name: ingredient.name })}
                            onClick={() => adjust.mutate(-Math.min(step, ingredient.stock ?? 0))}
                            disabled={adjust.isPending || ingredient.stock === 0}
                            className={iconButton}
                        >
                            <Minus size={16} strokeWidth={3} />
                        </button>
                        <span
                            className={`min-w-16 text-center font-display text-lg font-semibold ${ingredient.stock === 0 ? 'text-red-300' : 'text-white'}`}
                        >
                            {ingredient.stock}
                        </span>
                        <button
                            type="button"
                            aria-label={t('setup.addStock', { step, unit: ingredient.unit, name: ingredient.name })}
                            onClick={() => adjust.mutate(step)}
                            disabled={adjust.isPending}
                            className={iconButton}
                        >
                            <Plus size={16} strokeWidth={3} />
                        </button>
                    </div>
                )}

                <div className="flex items-center">
                    <button type="button" aria-label={t('common.editNamed', { name: ingredient.name })} onClick={startEdit} className={iconButton}>
                        <Pencil size={16} strokeWidth={2.4} />
                    </button>
                    <button
                        type="button"
                        aria-label={t('common.deleteNamed', { name: ingredient.name })}
                        onClick={() => setConfirming(true)}
                        className={iconButton}
                    >
                        <Trash2 size={16} strokeWidth={2.4} />
                    </button>
                </div>
            </div>

            {confirming && (
                <div className="mt-3 flex animate-pop items-center justify-end gap-2">
                    <span className="text-sm font-bold text-grape-200">{t('common.deleteConfirm', { name: ingredient.name })}</span>
                    <button
                        type="button"
                        onClick={() => setConfirming(false)}
                        className="rounded-xl px-3 py-1.5 text-sm font-bold text-grape-200 transition hover:bg-white/10"
                    >
                        {t('common.keep')}
                    </button>
                    <button
                        type="button"
                        onClick={() => remove.mutate(undefined, { onSettled: () => setConfirming(false) })}
                        className="rounded-xl bg-red-500 px-3 py-1.5 text-sm font-extrabold text-white transition hover:bg-red-400"
                    >
                        {t('common.delete')}
                    </button>
                </div>
            )}

            <ErrorText message={adjust.error?.message ?? remove.error?.message} />
        </li>
    )
}

const IngredientsPanel = ({ setup }: { setup: SetupDto }) => {
    const t = useT()
    return (
    <section className={panelClass}>
        <PanelHeader
            title={t('setup.ingredients')}
            count={setup.ingredients.length}
            hint={t('setup.ingredientsHint')}
        />
        <AddIngredient eventId={setup.eventId} />
        <ul className="mt-4 space-y-2">
            {setup.ingredients.map((ingredient) => (
                <IngredientRow key={ingredient.id} ingredient={ingredient} eventId={setup.eventId} />
            ))}
        </ul>
        {setup.ingredients.length === 0 && (
            <p className="mt-4 rounded-3xl border-2 border-dashed border-white/10 px-4 py-8 text-center text-sm font-bold text-grape-300">
                {t('setup.noIngredients')}
            </p>
        )}
    </section>
    )
}

type LineDraft = { key: number; ingredientId: string; amount: string }

let lineKey = 0
const nextLineKey = () => {
    lineKey += 1
    return lineKey
}

type ItemFormProps = {
    setup: SetupDto
    menuId: number
    initial?: MenuItemAdminDto
    onDone: () => void
}

const ItemForm = ({ setup, menuId, initial, onDone }: ItemFormProps) => {
    const [name, setName] = useState(initial?.name ?? '')
    const [enabled, setEnabled] = useState(initial?.enabled ?? true)
    const [lines, setLines] = useState<LineDraft[]>(() =>
        initial && initial.lines.length > 0
            ? initial.lines.map((line) => ({ key: nextLineKey(), ingredientId: String(line.ingredientId), amount: String(line.amount) }))
            : [{ key: nextLineKey(), ingredientId: '', amount: '' }]
    )
    const [formError, setFormError] = useState<string | null>(null)

    const t = useT()
    const save = useSetupAction(setup.eventId, (request: MenuItemRequest) =>
        initial ? updateMenuItem(initial.id, request) : createMenuItem(menuId, request)
    )

    const updateLine = (key: number, patch: Partial<LineDraft>) =>
        setLines((current) => current.map((line) => (line.key === key ? { ...line, ...patch } : line)))
    const removeLine = (key: number) => setLines((current) => current.filter((line) => line.key !== key))
    const addLine = () => setLines((current) => [...current, { key: nextLineKey(), ingredientId: '', amount: '' }])

    const submit = (e: FormEvent) => {
        e.preventDefault()
        if (!name.trim()) {
            setFormError(t('setup.errorItemName'))
            return
        }
        const filled = lines.filter((line) => line.ingredientId !== '' || line.amount.trim() !== '')
        const parsed = filled.map((line) => ({ ingredientId: Number(line.ingredientId), amount: Number(line.amount) }))
        if (parsed.some((line) => !line.ingredientId || !Number.isInteger(line.amount) || line.amount <= 0)) {
            setFormError(t('setup.errorAmount'))
            return
        }
        setFormError(null)
        save.mutate({ name: name.trim(), enabled, lines: parsed }, { onSuccess: onDone })
    }

    return (
        <form onSubmit={submit} className="mt-3 animate-pop rounded-2xl bg-grape-900 p-4 ring-2 ring-sun-400/40">
            <div className="flex items-end gap-3">
                <label className="min-w-0 flex-1">
                    <span className={labelClass}>{t('setup.itemName')}</span>
                    <input
                        className={`mt-1.5 ${inputClass}`}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t('setup.itemPlaceholder')}
                        autoFocus
                    />
                </label>
                <button
                    type="button"
                    onClick={() => setEnabled((value) => !value)}
                    aria-pressed={enabled}
                    className={`flex h-[46px] shrink-0 items-center gap-1.5 rounded-xl px-3 text-sm font-extrabold transition ${enabled ? 'bg-sun-400/15 text-sun-300 ring-1 ring-sun-400/40' : 'bg-white/5 text-grape-300 ring-1 ring-white/10'}`}
                >
                    {enabled ? <Eye size={16} strokeWidth={2.4} /> : <EyeOff size={16} strokeWidth={2.4} />}
                    {enabled ? t('setup.onMenu') : t('setup.hidden')}
                </button>
            </div>

            <p className={`mt-4 ${labelClass}`}>{t('setup.perPortion')}</p>
            <div className="mt-2 space-y-2">
                {lines.map((line) => {
                    const ingredient = setup.ingredients.find((candidate) => String(candidate.id) === line.ingredientId)
                    const used = new Set(lines.filter((other) => other.key !== line.key).map((other) => other.ingredientId))
                    return (
                        <div key={line.key} className="flex items-center gap-2">
                            <select
                                aria-label={t('setup.ingredientAria')}
                                value={line.ingredientId}
                                onChange={(e) => updateLine(line.key, { ingredientId: e.target.value })}
                                className={`${fieldBase} min-w-0 flex-1`}
                            >
                                <option value="">{t('setup.chooseIngredient')}</option>
                                {setup.ingredients.map((candidate) => (
                                    <option key={candidate.id} value={candidate.id} disabled={used.has(String(candidate.id))}>
                                        {candidate.name}
                                    </option>
                                ))}
                            </select>
                            <input
                                aria-label={t('setup.amountAria')}
                                inputMode="numeric"
                                value={line.amount}
                                onChange={(e) => updateLine(line.key, { amount: e.target.value })}
                                placeholder="0"
                                className={`${fieldBase} w-20 shrink-0 text-right`}
                            />
                            <span className="w-12 shrink-0 truncate text-sm font-bold text-grape-300">{ingredient?.unit ?? ''}</span>
                            <button type="button" aria-label={t('setup.removeIngredient')} onClick={() => removeLine(line.key)} className={iconButton}>
                                <X size={16} strokeWidth={2.6} />
                            </button>
                        </div>
                    )
                })}
            </div>
            <button
                type="button"
                onClick={addLine}
                className="mt-2 flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-sm font-extrabold text-sun-300 transition hover:bg-white/5"
            >
                <Plus size={16} strokeWidth={3} />
                {t('setup.addLine')}
            </button>

            <ErrorText message={formError ?? save.error?.message} />

            <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={onDone} className="rounded-xl px-4 py-2.5 text-sm font-bold text-grape-200 transition hover:bg-white/10">
                    {t('common.cancel')}
                </button>
                <button
                    type="submit"
                    disabled={save.isPending}
                    className="btn-sun flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-extrabold disabled:opacity-50"
                >
                    <Check size={16} strokeWidth={3} />
                    {initial ? t('setup.saveItem') : t('setup.addItem')}
                </button>
            </div>
        </form>
    )
}

const ItemRow = ({ item, eventId, onEdit }: { item: MenuItemAdminDto; eventId: number; onEdit: () => void }) => {
    const [confirming, setConfirming] = useState(false)

    const toggle = useSetupAction<void>(eventId, () =>
        updateMenuItem(item.id, {
            name: item.name,
            enabled: !item.enabled,
            lines: item.lines.map((line) => ({ ingredientId: line.ingredientId, amount: line.amount })),
        })
    )
    const remove = useSetupAction<void>(eventId, () => deleteMenuItem(item.id))
    const t = useT()

    return (
        <li className={`rounded-2xl bg-grape-900/70 p-3 ring-1 ring-white/10 transition ${item.enabled ? '' : 'opacity-60'}`}>
            <div className="flex items-start gap-1">
                <div className="min-w-0 flex-1 pl-1">
                    <p className="flex flex-wrap items-center gap-2 font-display text-lg font-semibold text-white">
                        {item.name}
                        {!item.enabled && (
                            <span className="rounded-full bg-white/10 px-2 py-0.5 font-sans text-[11px] font-extrabold text-grape-200">{t('setup.hidden')}</span>
                        )}
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                        {item.lines.map((line) => (
                            <li key={line.ingredientId} className="rounded-full bg-grape-500/20 px-2.5 py-1 text-xs font-bold text-grape-100">
                                {line.ingredientName} · {line.amount} {line.unit}
                            </li>
                        ))}
                        {item.lines.length === 0 && <li className="text-xs font-bold text-grape-300">{t('setup.noLines')}</li>}
                    </ul>
                </div>
                <button
                    type="button"
                    aria-label={item.enabled ? t('setup.hide', { name: item.name }) : t('setup.show', { name: item.name })}
                    onClick={() => toggle.mutate()}
                    disabled={toggle.isPending}
                    className={iconButton}
                >
                    {item.enabled ? <Eye size={16} strokeWidth={2.4} /> : <EyeOff size={16} strokeWidth={2.4} />}
                </button>
                <button type="button" aria-label={t('common.editNamed', { name: item.name })} onClick={onEdit} className={iconButton}>
                    <Pencil size={16} strokeWidth={2.4} />
                </button>
                <button type="button" aria-label={t('common.deleteNamed', { name: item.name })} onClick={() => setConfirming(true)} className={iconButton}>
                    <Trash2 size={16} strokeWidth={2.4} />
                </button>
            </div>

            {confirming && (
                <div className="mt-3 flex animate-pop items-center justify-end gap-2">
                    <span className="text-sm font-bold text-grape-200">{t('common.deleteConfirm', { name: item.name })}</span>
                    <button
                        type="button"
                        onClick={() => setConfirming(false)}
                        className="rounded-xl px-3 py-1.5 text-sm font-bold text-grape-200 transition hover:bg-white/10"
                    >
                        {t('common.keep')}
                    </button>
                    <button
                        type="button"
                        onClick={() => remove.mutate(undefined, { onSettled: () => setConfirming(false) })}
                        className="rounded-xl bg-red-500 px-3 py-1.5 text-sm font-extrabold text-white transition hover:bg-red-400"
                    >
                        {t('common.delete')}
                    </button>
                </div>
            )}

            <ErrorText message={toggle.error?.message ?? remove.error?.message} />
        </li>
    )
}

const CategoryCard = ({ menu, setup }: { menu: MenuAdminDto; setup: SetupDto }) => {
    const [adding, setAdding] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const remove = useSetupAction<void>(setup.eventId, () => deleteMenu(menu.id))
    const t = useT()

    return (
        <div className="rounded-3xl bg-white/[0.04] p-4 ring-1 ring-white/10">
            <div className="flex items-center gap-2">
                <h3 className="font-display text-xl font-semibold text-white">{menu.name}</h3>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-extrabold text-grape-100">{menu.items.length}</span>
                <button
                    type="button"
                    aria-label={t('setup.deleteCategory', { name: menu.name })}
                    title={menu.items.length > 0 ? t('setup.removeItemsFirst') : t('setup.deleteCategory', { name: menu.name })}
                    onClick={() => remove.mutate()}
                    disabled={menu.items.length > 0 || remove.isPending}
                    className={`ml-auto ${iconButton}`}
                >
                    <Trash2 size={16} strokeWidth={2.4} />
                </button>
            </div>

            <ul className="mt-3 space-y-2">
                {menu.items.map((item) =>
                    editingId === item.id ? (
                        <li key={item.id}>
                            <ItemForm setup={setup} menuId={menu.id} initial={item} onDone={() => setEditingId(null)} />
                        </li>
                    ) : (
                        <ItemRow key={item.id} item={item} eventId={setup.eventId} onEdit={() => setEditingId(item.id)} />
                    )
                )}
            </ul>

            {adding ? (
                <ItemForm setup={setup} menuId={menu.id} onDone={() => setAdding(false)} />
            ) : (
                <button
                    type="button"
                    onClick={() => setAdding(true)}
                    disabled={setup.ingredients.length === 0}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15 py-3 text-sm font-extrabold text-grape-200 transition hover:border-sun-400/60 hover:text-sun-300 disabled:opacity-40"
                >
                    <Plus size={16} strokeWidth={3} />
                    {t('setup.addItem')}
                </button>
            )}

            <ErrorText message={remove.error?.message} />
        </div>
    )
}

const MenuPanel = ({ setup }: { setup: SetupDto }) => {
    const [name, setName] = useState('')
    const create = useSetupAction(setup.eventId, (categoryName: string) => createMenu(setup.eventId, categoryName))
    const t = useT()
    const itemCount = setup.menus.reduce((sum, menu) => sum + menu.items.length, 0)

    const submit = (e: FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return
        create.mutate(name.trim(), { onSuccess: () => setName('') })
    }

    return (
        <section className={panelClass}>
            <PanelHeader
                title={t('setup.menu')}
                count={itemCount}
                hint={t('setup.menuHint')}
            />

            {setup.ingredients.length === 0 && (
                <p className="mb-4 rounded-2xl bg-sun-400/10 px-4 py-3 text-sm font-bold text-sun-200 ring-1 ring-sun-400/30">
                    {t('setup.needIngredients')}
                </p>
            )}

            <form onSubmit={submit} className="flex gap-2">
                <input
                    className={inputClass}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('setup.newCategory')}
                    aria-label={t('setup.newCategoryAria')}
                />
                <button
                    type="submit"
                    disabled={create.isPending || !name.trim()}
                    className="btn-sun flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-extrabold disabled:opacity-50"
                >
                    <Plus size={16} strokeWidth={3} />
                    {t('setup.category')}
                </button>
            </form>
            <ErrorText message={create.error?.message} />

            <div className="mt-5 space-y-4">
                {setup.menus.map((menu) => (
                    <CategoryCard key={menu.id} menu={menu} setup={setup} />
                ))}
                {setup.menus.length === 0 && (
                    <p className="rounded-3xl border-2 border-dashed border-white/10 px-4 py-8 text-center text-sm font-bold text-grape-300">
                        {t('setup.noCategories')}
                    </p>
                )}
            </div>
        </section>
    )
}

const SetupPage = () => {
    const { eventId: eventIdParam } = useParams()
    const eventId = Number(eventIdParam)
    const t = useT()

    const { data, isPending, error } = useQuery({
        queryKey: ['setup', eventId],
        queryFn: () => fetchSetup(eventId),
        refetchInterval: 5000,
        enabled: Number.isFinite(eventId),
    })

    return (
        <div className="min-h-dvh bg-stage">
            <div className="mx-auto max-w-6xl space-y-6 px-5 pb-16 pt-[calc(env(safe-area-inset-top)+1.25rem)]">
                <header className="flex flex-wrap items-center justify-between gap-3">
                    <Logo />
                    <div className="flex flex-wrap items-center gap-2">
                        <ChefNav />
                        <LogoutButton />
                    </div>
                </header>

                <div className="animate-rise">
                    <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-grape-300">{t('setup.kicker')}</p>
                    <h1 className="mt-1 font-display text-4xl font-bold text-puffy">{data?.eventName ?? t('common.loading')}</h1>
                </div>

                {isPending && !error && (
                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="h-96 animate-pulse rounded-[28px] bg-white/[0.06]" />
                        <div className="h-96 animate-pulse rounded-[28px] bg-white/[0.06]" />
                    </div>
                )}

                <ErrorText message={error?.message} />

                {data && (
                    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
                        <IngredientsPanel setup={data} />
                        <MenuPanel setup={data} />
                    </div>
                )}

            </div>
        </div>
    )
}

export default SetupPage
