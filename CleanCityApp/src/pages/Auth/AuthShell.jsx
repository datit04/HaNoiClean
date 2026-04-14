import { Link } from 'react-router-dom'
import { ROUTES } from '../../utils/constants'

export default function AuthShell({
  title,
  subtitle,
  heroTitle,
  heroDescription,
  children,
  footerText,
  footerActionLabel,
  footerActionTo,
}) {
  return (
    <div className="min-h-screen bg-surface text-on-surface font-body flex flex-col">
      <header className="w-full py-5 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to={ROUTES.HOME} className="text-2xl font-black text-primary tracking-tighter font-headline">
            Hanoi CleanCity
          </Link>
          <div className="text-xs text-on-surface-variant font-semibold uppercase tracking-widest">
            Urban Conservator
          </div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 px-4 md:px-8 pb-8 gap-6">
        <section className="hidden lg:flex lg:col-span-5 rounded-[2.5rem] overflow-hidden relative bg-primary text-on-primary p-10">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmA3v1Mwf4fFKWPK6psZkP5IaopeFmIfRFJu4ND1DlIJdQisvOo-_oJ0wsQazDN_Rb6-kqsow2StQtArUo8tQoqnlYaFlSkIX7Y5W0hgfV9gsO6bAcROG3GwluXvvc1Z1pWVOQfdm0C2dp4W1O1uoBMSlflUjctdkdSxp1IS70t2YZ65jtWlXw26XpsiXBxwfwvQbHxqraSwmQ6vfB9e-CcHwuIC_V4FqoEVrxMfFcjnrPm3qGwn7BHLvmIxn6rZzewGwyFn9_CW4W"
            alt="Hanoi"
            className="absolute inset-0 w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-primary/40" />
          <div className="relative z-10 mt-auto space-y-6">
            <h1 className="font-headline font-black text-5xl leading-tight tracking-tight">{heroTitle}</h1>
            <p className="text-on-primary-container text-lg max-w-md">{heroDescription}</p>
            <div className="inline-flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-4 py-3">
              <span className="material-symbols-outlined fill-icon text-primary-fixed">verified_user</span>
              <span className="text-sm font-semibold">Bao mat xac thuc theo chuan Identity</span>
            </div>
          </div>
        </section>

        <section className="col-span-1 lg:col-span-7 rounded-[2.5rem] bg-surface-container-lowest shadow-2xl shadow-black/5 p-6 md:p-12 lg:p-16 flex items-center">
          <div className="w-full max-w-xl mx-auto">
            <div className="mb-8 md:mb-10">
              <h2 className="font-headline text-4xl font-black text-primary tracking-tight mb-3">{title}</h2>
              <p className="text-on-surface-variant text-base md:text-lg">{subtitle}</p>
            </div>

            {children}

            <div className="mt-9 pt-6 border-t border-surface-container-high">
              <p className="text-sm text-on-surface-variant text-center font-medium">
                {footerText}
                <Link to={footerActionTo} className="ml-1 text-primary font-bold hover:underline underline-offset-4">
                  {footerActionLabel}
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
