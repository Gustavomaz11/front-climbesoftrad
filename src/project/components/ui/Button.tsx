import { LoaderCircle } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react'
import { Button as SurfaceButton } from '@/components/ui/button'
import { cn } from '@/lib/utils'
export type ButtonVariant='primary'|'secondary'|'success'|'danger'|'warning'|'outline'|'ghost'
export type ButtonSize='sm'|'md'|'lg'|'icon'
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?:ButtonVariant;size?:ButtonSize;fullWidth?:boolean;loading?:boolean;loadingText?:string;leftIcon?:ReactNode;rightIcon?:ReactNode;ref?:Ref<HTMLButtonElement> }
const variants:Record<ButtonVariant,string>={primary:'border-0 bg-linear-to-r from-pink-500 to-purple-600 text-white hover:opacity-90',secondary:'bg-secondary text-secondary-foreground hover:bg-secondary/80',success:'bg-emerald-600 text-white hover:bg-emerald-700',danger:'bg-red-600 text-white hover:bg-red-700',warning:'bg-amber-400 text-amber-950 hover:bg-amber-500',outline:'border-border bg-foreground/5 text-foreground hover:bg-muted',ghost:'bg-transparent text-foreground hover:bg-muted'}
const sizes:Record<ButtonSize,string>={sm:'h-7 px-2.5 text-xs',md:'h-9 px-3.5 text-sm',lg:'h-9 px-4 text-sm',icon:'size-8 p-0'}
export const Button=({variant='primary',size='md',fullWidth=false,loading=false,loadingText,leftIcon,rightIcon,className,disabled,children,type='button',ref,...props}:ButtonProps)=><SurfaceButton {...props} ref={ref} type={type} disabled={disabled||loading} aria-busy={loading||undefined} variant={variant==='outline'||variant==='ghost'?variant:'default'} className={cn('gap-2 font-medium',variants[variant],sizes[size],fullWidth&&'w-full',className)}>{loading?<LoaderCircle className="size-4 animate-spin" aria-hidden="true" />:leftIcon}{loading&&loadingText?loadingText:children}{!loading&&rightIcon}</SurfaceButton>
