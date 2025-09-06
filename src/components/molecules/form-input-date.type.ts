export type FormInputDateProps = {
  id: string
  label: string
  containerClassName?: string
  selected?: Date
  onSelect?: (date: Date | undefined) => void
}

