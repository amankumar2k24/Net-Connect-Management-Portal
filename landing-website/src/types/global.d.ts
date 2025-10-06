import * as React from 'react'

declare global {
    namespace JSX {
        interface IntrinsicElements {
            [elemName: string]: any
        }
    }
}

declare module '@heroicons/react/24/outline' {
    import { ComponentType, SVGProps } from 'react'

    export const WifiIcon: ComponentType<SVGProps<SVGSVGElement> & { className?: string }>
    export const BoltIcon: ComponentType<SVGProps<SVGSVGElement> & { className?: string }>
    export const ShieldCheckIcon: ComponentType<SVGProps<SVGSVGElement> & { className?: string }>
    export const ClockIcon: ComponentType<SVGProps<SVGSVGElement> & { className?: string }>
    export const PhoneIcon: ComponentType<SVGProps<SVGSVGElement> & { className?: string }>
    export const CogIcon: ComponentType<SVGProps<SVGSVGElement> & { className?: string }>
    export const GlobeAltIcon: ComponentType<SVGProps<SVGSVGElement> & { className?: string }>
    export const ChartBarIcon: ComponentType<SVGProps<SVGSVGElement> & { className?: string }>
    export const UserGroupIcon: ComponentType<SVGProps<SVGSVGElement> & { className?: string }>
    export const TrophyIcon: ComponentType<SVGProps<SVGSVGElement> & { className?: string }>
    export const HeartIcon: ComponentType<SVGProps<SVGSVGElement> & { className?: string }>
    export const LightBulbIcon: ComponentType<SVGProps<SVGSVGElement> & { className?: string }>
    export const MapPinIcon: ComponentType<SVGProps<SVGSVGElement> & { className?: string }>
    export const EnvelopeIcon: ComponentType<SVGProps<SVGSVGElement> & { className?: string }>
    export const CheckIcon: ComponentType<SVGProps<SVGSVGElement> & { className?: string }>
    export const StarIcon: ComponentType<SVGProps<SVGSVGElement> & { className?: string }>
    export const Bars3Icon: ComponentType<SVGProps<SVGSVGElement> & { className?: string }>
    export const XMarkIcon: ComponentType<SVGProps<SVGSVGElement> & { className?: string }>
    export const SunIcon: ComponentType<SVGProps<SVGSVGElement> & { className?: string }>
    export const MoonIcon: ComponentType<SVGProps<SVGSVGElement> & { className?: string }>
}

export { }