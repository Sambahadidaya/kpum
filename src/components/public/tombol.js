import Link from 'next/link';

export default function TombolPublik({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  icon: Icon,
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-xs sm:text-sm px-4 py-2.5 gap-2',
    lg: 'text-sm sm:text-base px-6 py-3.5 gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-blue-700 hover:bg-blue-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white shadow-sm shadow-blue-900/15',
    secondary: 'bg-blue-50/80 hover:bg-blue-100 text-blue-950 border border-blue-200/80 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-800',
    outline: 'border border-blue-200 hover:border-blue-400 text-blue-950 hover:bg-blue-50/60 dark:border-zinc-700 dark:hover:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900',
    ghost: 'text-zinc-600 hover:text-blue-700 hover:bg-blue-50/70 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-900',
  };

  const combinedClasses = `${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        {Icon && <Icon className="w-4 h-4 shrink-0" />}
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClasses}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {children}
    </button>
  );
}
