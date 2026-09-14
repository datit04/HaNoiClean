import { Link } from 'react-router-dom'
import { ROUTES } from '../../utils/constants'

export default function AuthShell({
  title,
  subtitle,
  children,
  footerText,
  footerActionLabel,
  footerActionTo,
}) {
  return (
    <div className="min-h-screen bg-surface text-on-surface font-body flex flex-col items-center justify-center px-4 py-10">
      {/* Logo */}
      <Link to={ROUTES.MAP} className="text-2xl font-black text-primary tracking-tighter font-headline mb-8">
        Hanoi CleanCity
      </Link>

      {/* Form card */}
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-3xl shadow-xl shadow-black/5 p-8 md:p-10">
        <div className="mb-7">
          <h2 className="font-headline text-3xl font-black text-primary tracking-tight mb-1.5">{title}</h2>
          <p className="text-on-surface-variant text-sm">{subtitle}</p>
        </div>

        {children}

        <div className="mt-8 pt-5 border-t border-surface-container-high">
          <p className="text-sm text-on-surface-variant text-center font-medium">
            {footerText}
            <Link to={footerActionTo} className="ml-1 text-primary font-bold hover:underline underline-offset-4">
              {footerActionLabel}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
