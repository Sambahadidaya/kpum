import Link from 'next/link';

export default function TombolPanitia({
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
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-xs sm:text-sm px-4 py-2 gap-2',
    lg: 'text-sm px-5 py-2.5 gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-blue-700 hover:bg-blue-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white shadow-sm shadow-blue-900/15',
    secondary: 'bg-blue-50/80 hover:bg-blue-100 text-blue-950 border border-blue-200/80 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-xs',
    outline: 'border border-blue-200 dark:border-zinc-800 text-blue-950 dark:text-zinc-300 hover:bg-blue-50/60 dark:hover:bg-zinc-900',
    ghost: 'text-zinc-500 dark:text-zinc-400 hover:text-blue-700 dark:hover:text-white hover:bg-blue-50/60 dark:hover:bg-zinc-900',
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
