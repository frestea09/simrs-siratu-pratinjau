export type FormInputRadioProps = {
  id: string
  label: string
  items: { value: string; label: string }[]
  orientation?: 'horizontal' | 'vertical'
  containerClassName?: string
  value?: string
  onValueChange?: (value: string) => void
}

