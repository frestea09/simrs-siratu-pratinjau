
export type NavItem = {
  href?: string;
  icon?: React.ElementType;
  label: string;
  onClick?: () => void;
  subItems?: NavItem[];
}
