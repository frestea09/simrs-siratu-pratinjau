export type FormInputSelectProps = {
  id: string
  label: string
  placeholder: string
  items: { value: string; label: string }[]
  containerClassName?: string
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  emptyMessage?: string
}

